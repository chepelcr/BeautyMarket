.PHONY: help build-ApiFunction deploy-lambda deploy-api deploy-client deploy-all clean

# Variables
AWS_REGION ?= us-east-1
AWS_PROFILE ?= J-CAMPOS
STACK_NAME = jmarkets-lambda
ARTIFACTS_DIR ?= .aws-sam/build/ApiFunction

# Load .env file if exists
-include .env
export

help:
	@echo "Available commands:"
	@echo "  make build-ApiFunction  - Build Lambda (called by SAM)"
	@echo "  make deploy-lambda      - SAM deploy Lambda"
	@echo "  make deploy-api         - Deploy API Gateway"
	@echo "  make deploy-client      - Deploy client to S3"
	@echo "  make deploy-all         - Deploy everything"
	@echo "  make clean              - Clean build artifacts"

# SAM calls this target during sam build
build-ApiFunction:
	@echo "Building Lambda function..."
	npm ci --production
	npm run build:lambda
	cp -r dist $(ARTIFACTS_DIR)/
	cp -r node_modules $(ARTIFACTS_DIR)/
	cp package.json $(ARTIFACTS_DIR)/

build:
	@echo "Building with SAM (calls make build-ApiFunction)..."
	sam build --template cloudformation/template.yaml

deploy:
	@echo "Deploying Lambda with SAM..."
	sam deploy \
		--stack-name $(STACK_NAME) \
		--capabilities CAPABILITY_IAM \
		--region $(AWS_REGION) \
		--profile $(AWS_PROFILE) \
		--no-confirm-changeset \
		--parameter-overrides \
			SessionSecretParam=$(SESSION_SECRET) \
			DatabaseURLParam=$(NEW_DATABASE_URL) \
			CloudfrontURLParam=$(AWS_CLOUDFRONT_URL) \
			CognitoUserPoolIdParam=$(AWS_COGNITO_USER_POOL_ID) \
			CognitoClientIdParam=$(AWS_COGNITO_CLIENT_ID) \
			SesSmtpUsernameParam=$(SES_SMTP_USERNAME) \
			SesSmtpPasswordParam=$(SES_SMTP_PASSWORD)

deploy-lambda: build deploy

deploy-api:
	@echo "Deploying API Gateway..."
	./deploys/deploy-api-gateway.sh

deploy-client:
	@echo "Deploying client..."
	./deploys/deploy-client.sh

deploy-all: deploy-lambda deploy-api deploy-client
	@echo "✅ All deployments complete!"

clean:
	@echo "Cleaning..."
	rm -rf .aws-sam dist lambda-package.zip
