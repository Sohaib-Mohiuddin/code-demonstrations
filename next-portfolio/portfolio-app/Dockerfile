# Use lightweight Node.js
FROM node:24-alpine

# Create workspace
WORKDIR /app

# Install Git (some npm packages use it)
RUN apk add --no-cache git

# Copy package manifests first (for caching)
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install --force

# Copy the rest of the project (mounted in compose anyway)
COPY . .

# Next.js dev server runs on 3000
EXPOSE 3000

# Default command: run development server
CMD ["npm", "run", "dev"]
