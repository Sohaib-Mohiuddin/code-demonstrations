# Docker Configuration Comparison

This document provides a side-by-side comparison of the Docker configurations for portfolio-app and my-strapi-project.

## Summary

Both applications now have complete Docker configurations following the same patterns and best practices:

| Feature | portfolio-app | my-strapi-project |
|---------|---------------|-------------------|
| **Base Image** | node:24-alpine | node:20-alpine |
| **Port** | 3000 | 1337 |
| **Development Command** | npm run dev | npm run develop |
| **Volume Mounts** | ✅ Source code + node_modules | ✅ Source code + node_modules + uploads |
| **Network** | portfolio_network | strapi_network |
| **External Dependencies** | None | PostgreSQL database |
| **Build Process** | Install dependencies only | Install dependencies + build admin panel |

## Detailed Comparison

### Dockerfile

#### portfolio-app
```dockerfile
FROM node:24-alpine
WORKDIR /app
RUN apk add --no-cache git
COPY package.json package-lock.json* ./
RUN npm install --force
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

#### my-strapi-project
```dockerfile
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev nasm bash vips-dev git
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 1337
CMD ["npm", "run", "develop"]
```

**Key Differences:**
- **Node Version**: Portfolio uses v24, Strapi uses v20 (within Strapi's supported range)
- **Build Tools**: Strapi needs more native build tools for PostgreSQL driver and image processing
- **Build Step**: Strapi builds the admin panel during image creation
- **NPM Install**: Portfolio uses `--force` flag, Strapi uses standard install

### docker-compose.yml

#### portfolio-app
```yaml
services:
  portfolio-app:
    build: .
    container_name: portfolio-app
    working_dir: /app
    command: npm run dev
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - NEXT_TELEMETRY_DISABLED=1
    volumes:
      - .:/app
      - node_modules:/app/node_modules
    networks:
      - portfolio_network
    tty: true

networks:
  portfolio_network:
    driver: bridge

volumes:
  node_modules:
```

#### my-strapi-project
```yaml
services:
  my-strapi-project:
    build: .
    container_name: my-strapi-project
    working_dir: /app
    command: npm run develop
    ports:
      - "1337:1337"
    environment:
      - NODE_ENV=development
      - DATABASE_CLIENT=postgres
      - DATABASE_HOST=postgres
      - DATABASE_PORT=5432
      - DATABASE_NAME=strapi
      - DATABASE_USERNAME=strapi
      - DATABASE_PASSWORD=strapi
      - HOST=0.0.0.0
      - PORT=1337
      - APP_KEYS=toBeModified1,toBeModified2
      - API_TOKEN_SALT=tobemodified
      - ADMIN_JWT_SECRET=tobemodified
      - TRANSFER_TOKEN_SALT=tobemodified
      - JWT_SECRET=tobemodified
    volumes:
      - .:/app
      - node_modules:/app/node_modules
      - strapi_uploads:/app/public/uploads
    networks:
      - strapi_network
    depends_on:
      - postgres
    tty: true

  postgres:
    image: postgres:16-alpine
    container_name: strapi-postgres
    restart: unless-stopped
    environment:
      - POSTGRES_DB=strapi
      - POSTGRES_USER=strapi
      - POSTGRES_PASSWORD=strapi
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - strapi_network

networks:
  strapi_network:
    driver: bridge

volumes:
  node_modules:
  postgres_data:
  strapi_uploads:
```

**Key Differences:**
- **Services**: Strapi has two services (app + database), portfolio has one
- **Environment Variables**: Strapi requires many more configuration variables
- **Volumes**: Strapi has an additional volume for uploaded files and database data
- **Dependencies**: Strapi depends on PostgreSQL service

## Design Decisions

### Why Node 20 for Strapi?
Strapi v5.2.0 officially supports Node.js >=18.0.0 <=22.x.x. We chose Node 20 (LTS) for stability and long-term support.

### Why PostgreSQL for Strapi?
- Production-ready database
- Better performance than SQLite
- Support for concurrent connections
- Data integrity and ACID compliance
- Included in Strapi's package.json dependencies

### Why Additional Build Tools?
Strapi requires:
- **build-base, gcc**: For compiling native Node.js modules
- **vips-dev**: For image processing (sharp library)
- **libpng-dev, zlib-dev**: For image compression
- **bash**: For running shell scripts in Strapi

### Why Build Admin Panel in Dockerfile?
Building during image creation:
- ✅ Faster container startup
- ✅ Consistent build environment
- ✅ Catches build errors early
- ❌ Larger image size (acceptable trade-off)

### Why Separate Networks?
Each application has its own network to:
- Isolate services
- Allow independent scaling
- Prevent port conflicts
- Enable flexible deployment options

## Running Both Applications Together

To run the complete portfolio system, you can:

### Option 1: Run Separately (Current Setup)

**Terminal 1:**
```bash
cd next-portfolio/my-strapi-project
docker compose up
```

**Terminal 2:**
```bash
cd next-portfolio/portfolio-app
docker compose up
```

### Option 2: Unified docker-compose.yml (Recommended)

Create a new `docker-compose.yml` in the `next-portfolio` directory:

```yaml
services:
  # Strapi CMS Backend
  strapi:
    build: ./my-strapi-project
    container_name: my-strapi-project
    ports:
      - "1337:1337"
    environment:
      - NODE_ENV=development
      - DATABASE_CLIENT=postgres
      - DATABASE_HOST=postgres
      - DATABASE_PORT=5432
      - DATABASE_NAME=strapi
      - DATABASE_USERNAME=strapi
      - DATABASE_PASSWORD=strapi
      - HOST=0.0.0.0
      - PORT=1337
      - APP_KEYS=toBeModified1,toBeModified2
      - API_TOKEN_SALT=tobemodified
      - ADMIN_JWT_SECRET=tobemodified
      - TRANSFER_TOKEN_SALT=tobemodified
      - JWT_SECRET=tobemodified
    volumes:
      - ./my-strapi-project:/app
      - strapi_node_modules:/app/node_modules
      - strapi_uploads:/app/public/uploads
    networks:
      - portfolio_stack
    depends_on:
      - postgres

  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: strapi-postgres
    restart: unless-stopped
    environment:
      - POSTGRES_DB=strapi
      - POSTGRES_USER=strapi
      - POSTGRES_PASSWORD=strapi
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - portfolio_stack

  # Next.js Frontend
  portfolio-app:
    build: ./portfolio-app
    container_name: portfolio-app
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - NEXT_TELEMETRY_DISABLED=1
      - STRAPI_API_URL=http://strapi:1337/api/
    volumes:
      - ./portfolio-app:/app
      - portfolio_node_modules:/app/node_modules
    networks:
      - portfolio_stack
    depends_on:
      - strapi

networks:
  portfolio_stack:
    driver: bridge

volumes:
  strapi_node_modules:
  portfolio_node_modules:
  postgres_data:
  strapi_uploads:
```

Then run:
```bash
cd next-portfolio
docker compose up
```

**Benefits:**
- Single command to start everything
- Services can communicate using service names
- Shared network for inter-service communication
- Easier to manage

## Best Practices Applied

Both configurations follow these Docker best practices:

1. **Layer Caching**: Copy package files before source code
2. **Minimal Base Image**: Use Alpine Linux for smaller images
3. **Named Volumes**: Persist data across container restarts
4. **Port Mapping**: Expose only necessary ports
5. **Environment Variables**: Configure applications externally
6. **Development Volumes**: Mount source code for hot-reload
7. **Dedicated Networks**: Isolate service communication
8. **Health Dependencies**: Use `depends_on` for startup order

## Troubleshooting

### Common Issues

**Port Conflicts**
```bash
# Check what's using the port
lsof -i :1337
lsof -i :3000
lsof -i :5432

# Change port mapping in docker-compose.yml
ports:
  - "YOUR_PORT:1337"
```

**Permission Issues**
```bash
# Fix ownership (Unix/Linux/Mac)
sudo chown -R $USER:$USER .
```

**Slow Builds**
```bash
# Clean Docker cache
docker system prune -a

# Use BuildKit for faster builds
DOCKER_BUILDKIT=1 docker compose build
```

**Volume Issues**
```bash
# Remove volumes and start fresh
docker compose down -v
docker compose up
```

## Performance Optimization

### Development
- Volume mounts enable hot-reload
- Node modules are cached in named volumes
- Faster subsequent builds with layer caching

### Production Recommendations
1. Use multi-stage builds to reduce image size
2. Run `npm run build && npm run start` instead of develop
3. Use environment-specific .env files
4. Enable health checks
5. Configure resource limits
6. Use Docker secrets for sensitive data
7. Implement logging drivers
8. Set up monitoring

## Conclusion

Both applications now have consistent, production-ready Docker configurations that:
- Follow industry best practices
- Support development workflows with hot-reload
- Can be deployed individually or together
- Are well-documented and maintainable
- Provide a foundation for production deployment

The configurations are intentionally similar to make it easy to understand, maintain, and extend both applications.
