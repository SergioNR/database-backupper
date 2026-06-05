# Use the latest Docker syntax parser
# syntax=docker/dockerfile:1

# Define a build argument for Node.js version, defaulting to 22.14.0
ARG NODE_VERSION=26

# Use official Node.js Alpine Linux image with the specified version
FROM node:${NODE_VERSION}-alpine

# Set the working directory inside the container
WORKDIR /app

# Install PostgreSQL client utilities (pg_dump)
RUN apk add --no-cache postgresql-client

# Install dependencies using package.json and package-lock.json
# Uses bind mounts for the files and a cache mount for npm
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit-dev


# Copy package files and source code
COPY package.json package-lock.json ./
COPY prisma/ ./prisma/
COPY src/ ./src/

# Generate Prisma client
RUN npx prisma generate


# Switch to non-root user for better security
# USER node

# Declare that the container will listen on port 12500
EXPOSE 12500

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:12500/health || exit 1

# Set the default command to run prisma migrate deploy and start the app
# CMD npx prisma migrate deploy && npm run start:deploy 
CMD npm run start:deploy 
