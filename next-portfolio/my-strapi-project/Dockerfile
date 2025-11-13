# Use lightweight Node.js
FROM node:20-alpine

# Create workspace
WORKDIR /app

# Install dependencies required for building native modules (for PostgreSQL driver)
RUN apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev nasm bash vips-dev git

# Copy package manifests first (for caching)
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy the rest of the project (mounted in compose anyway)
COPY . .

# Build the Strapi admin panel
RUN npm run build

# Strapi runs on 1337
EXPOSE 1337

# Default command: run development server
CMD ["npm", "run", "develop"]
