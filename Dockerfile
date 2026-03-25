FROM node:22-alpine

# Install bash for script compatibility
RUN apk add --no-cache bash

WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./
COPY landing-client/package*.json ./landing-client/
COPY dashboard/package*.json ./dashboard/

# Install all dependencies
RUN npm install
RUN cd landing-client && npm install
RUN cd dashboard && npm install

# Copy only required source folders
COPY server/ ./server/
COPY landing-client/ ./landing-client/
COPY dashboard/ ./dashboard/
COPY scripts/ ./scripts/
COPY migrations/ ./migrations/

# Create logs directory
RUN mkdir -p logs

# Expose all required ports
EXPOSE 5000 3001 3002 9000

# Start all services like reboot-server.sh does
CMD ["npm", "run", "dev:all"]