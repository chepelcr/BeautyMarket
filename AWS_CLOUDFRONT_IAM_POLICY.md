# AWS IAM Policy for CloudFront Cache Invalidation

## Overview
This document outlines the IAM policy requirements for the CloudFront cache invalidation feature implemented in the deployment system.

## Required IAM Permission
The deployment system uses `cloudfront:CreateInvalidation` to invalidate cached content after deployments.

## Basic IAM Policy
Add the following permission to your AWS IAM role or user policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "cloudfront:CreateInvalidation",
            "Resource": "*"
        }
    ]
}
```

## Recommended IAM Policy (More Secure)
For better security, restrict access to your specific CloudFront distribution:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "cloudfront:CreateInvalidation",
            "Resource": "arn:aws:cloudfront::YOUR_ACCOUNT_ID:distribution/YOUR_DISTRIBUTION_ID"
        }
    ]
}
```

## Complete Deployment IAM Policy
For a complete deployment setup with S3 and CloudFront access:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:PutObjectAcl",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket",
                "s3:PutBucketWebsite"
            ],
            "Resource": [
                "arn:aws:s3:::YOUR_BUCKET_NAME",
                "arn:aws:s3:::YOUR_BUCKET_NAME/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "cloudfront:CreateInvalidation",
                "cloudfront:GetInvalidation",
                "cloudfront:ListInvalidations"
            ],
            "Resource": "arn:aws:cloudfront::YOUR_ACCOUNT_ID:distribution/YOUR_DISTRIBUTION_ID"
        }
    ]
}
```

## Environment Variables Required
Make sure these environment variables are set in your deployment environment:

- `AWS_ACCESS_KEY_ID` - Your AWS access key
- `AWS_SECRET_ACCESS_KEY` - Your AWS secret key  
- `AWS_REGION` - AWS region (default: us-east-1)
- `AWS_S3_BUCKET_NAME` - Your S3 bucket name
- `AWS_CLOUDFRONT_DISTRIBUTION_ID` - Your CloudFront distribution ID

## Notes
- If `AWS_CLOUDFRONT_DISTRIBUTION_ID` is not set, the system will skip cache invalidation with a warning
- Cache invalidation is performed twice during deployment:
  1. After deleting existing assets
  2. After uploading new assets
- InvalidationBatch uses a unique CallerReference based on timestamp to avoid conflicts
- The system automatically handles error logging and continues deployment even if invalidation fails

## Cost Considerations
- AWS charges for CloudFront invalidation requests
- The first 1,000 invalidation paths per month are free
- Additional paths cost $0.005 each
- Each deployment creates one invalidation request with path `/*` (wildcard)