# Stage 1: Build
FROM node:24 AS build

RUN corepack enable

# Set working directory
WORKDIR /usr/src/server

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./
RUN pnpm install

# Copy the rest of the source code and build the application
COPY . .
RUN pnpm build

# Stage 2: Production
FROM node:24-alpine

RUN corepack enable

# Set working directory
WORKDIR /usr/src/server

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./
RUN pnpm install --production

# Copy only the necessary files from the build stage
COPY --from=build /usr/src/server/dist ./dist

CMD ["sh", "-c", "pnpm start:prod"]
