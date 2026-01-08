# IAM CloudFormation Deployment Guide

## Overview

This CloudFormation template creates:
1. **Managed Policy** (`JMarketsBackendPolicy`) - Shared by Lambda and local dev user
2. **IAM User** (`strawberry-be-{env}`) - For local development
3. **Access Keys** - For the development user

## Permissions Included

### Current Permissions (matching existing strawberry-be user)
- ✅ **S3 Full Access** - All S3 operations
- ✅ **CloudFront Full Access** - All CloudFront operations
- ✅ **SES Full Access** - All SES operations

### New Permissions Added
- ✅ **Cognito User Management** - Including `ListUsers` (fixes 404 error)
- ✅ **Route53** - DNS management for custom domains
- ✅ **Secrets Manager** - Store/retrieve secrets
- ✅ **SNS/SQS** - Message queue operations

## Deployment Steps

### 1. Deploy IAM Stack

```bash
aws cloudformation create-stack \
  --stack-name jmarkets-iam-dev \
  --template-body file://cloudformation/iam.yml \
  --parameters ParameterKey=Environment,ParameterValue=dev \
  --capabilities CAPABILITY_NAMED_IAM \
  --profile J-CAMPOS
```

### 2. Get the Access Keys

After deployment, retrieve the Access Key credentials:

```bash
# Get Access Key ID
aws cloudformation describe-stacks \
  --stack-name jmarkets-iam-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`BackendDevUserAccessKeyId`].OutputValue' \
  --output text \
  --profile J-CAMPOS

# Get Secret Access Key (SENSITIVE - only shown once!)
aws cloudformation describe-stacks \
  --stack-name jmarkets-iam-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`BackendDevUserSecretAccessKey`].OutputValue' \
  --output text \
  --profile J-CAMPOS
```

### 3. Update .env Files

Update both client `.env` files with the new credentials:

```bash
# server/.env
AWS_ACCESS_KEY_ID=<from step 2>
AWS_SECRET_ACCESS_KEY=<from step 2>
AWS_REGION=us-east-1
```

### 4. Update Lambda Template (if using)

When deploying the Lambda function, pass the IAM stack name:

```bash
aws cloudformation deploy \
  --template-file cloudformation/template.yaml \
  --stack-name jmarkets-lambda-dev \
  --parameter-overrides \
    IAMStackName=jmarkets-iam-dev \
    ... \
  --capabilities CAPABILITY_IAM \
  --profile J-CAMPOS
```

The Lambda will automatically import the managed policy ARN from the IAM stack.

## Migration from Current strawberry-be User

### Option 1: Replace Existing User (Recommended)

1. Deploy the IAM stack with environment `dev`
2. Update `.env` with new access keys
3. Test that everything works
4. Delete the old `strawberry-be` user:
   ```bash
   aws iam delete-access-key --user-name strawberry-be --access-key-id <old-key-id> --profile J-CAMPOS
   aws iam detach-user-policy --user-name strawberry-be --policy-arn arn:aws:iam::aws:policy/CloudFrontFullAccess --profile J-CAMPOS
   aws iam detach-user-policy --user-name strawberry-be --policy-arn arn:aws:iam::aws:policy/AmazonSESFullAccess --profile J-CAMPOS
   aws iam detach-user-policy --user-name strawberry-be --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess --profile J-CAMPOS
   aws iam delete-user --user-name strawberry-be --profile J-CAMPOS
   ```

### Option 2: Keep Both (Testing)

1. Deploy IAM stack with environment `staging`
2. Creates user `strawberry-be-staging`
3. Test with new user
4. Migrate when ready

## Exported Values

The stack exports these values for use by other stacks:

- `{StackName}-BackendPolicyArn` - Managed policy ARN
- `{StackName}-DevUserName` - IAM user name
- `{StackName}-DevUserAccessKeyId` - Access Key ID
- `{StackName}-DevUserSecretKey` - Secret Access Key

## Security Notes

⚠️ **IMPORTANT**:
- The Secret Access Key is only displayed ONCE during stack creation
- Store it securely in your `.env` file immediately
- Never commit access keys to git
- Rotate keys regularly
- Consider using AWS Secrets Manager for production

## Troubleshooting

### Stack Creation Fails with "User already exists"

The user `strawberry-be-{env}` already exists. Either:
1. Change the Environment parameter to a different value
2. Delete the existing user first
3. Update the UserName in the template

### Cannot import BackendPolicyArn in Lambda stack

Make sure:
1. IAM stack deployed successfully
2. Stack name matches the `IAMStackName` parameter in Lambda template
3. Export names are correct (check CloudFormation console)

### Access Denied errors after deployment

1. Wait 1-2 minutes for IAM changes to propagate
2. Verify credentials in `.env` are correct
3. Check that the managed policy is attached to the user:
   ```bash
   aws iam list-attached-user-policies --user-name strawberry-be-dev --profile J-CAMPOS
   ```
