# Multi-stage build for AWS Lambda deployment
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including devDependencies for building)
RUN npm ci

# Copy source code
COPY server/ ./server/
COPY shared/ ./shared/
COPY lambda.ts ./

# Build the application
RUN npm run build:lambda

# Production stage
FROM public.ecr.aws/lambda/nodejs:20

# Set environment variables
ENV NODE_ENV=production
ENV AWS_LAMBDA_RUNTIME_API=127.0.0.1:9001

# Copy built application
COPY --from=builder /app/dist/ ${LAMBDA_TASK_ROOT}/
COPY --from=builder /app/node_modules/ ${LAMBDA_TASK_ROOT}/node_modules/
COPY --from=builder /app/package.json ${LAMBDA_TASK_ROOT}/

# Install only production dependencies
WORKDIR ${LAMBDA_TASK_ROOT}
RUN npm ci --only=production && npm cache clean --force

# Set the CMD to your handler
CMD [ "lambda.handler" ]

# Health check (optional)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/2015-03-31/functions/function/invocations -d '{}' || exit 1