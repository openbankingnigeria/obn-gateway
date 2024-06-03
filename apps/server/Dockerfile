# Stage 1: Build
FROM node:18-alpine AS build

# Install build dependencies
RUN apk update && apk add --no-cache curl && corepack enable

# Set working directory
WORKDIR /usr/src/server

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./
RUN pnpm install

# Copy the rest of the source code and build the application
COPY . .
RUN pnpm build

# Stage 2: Production
FROM node:18-alpine

# Install runtime dependencies
RUN apk update && apk add --no-cache curl && corepack enable

# Set working directory
WORKDIR /usr/src/server

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./
RUN pnpm install --production

# Copy only the necessary files from the build stage
COPY --from=build /usr/src/server/dist ./dist

CMD ["sh", "-c", "pnpm start:prod"]
