# Docker Setup for My Strapi Project

This directory contains the Docker configuration for running the Strapi CMS application with PostgreSQL database.

## Prerequisites

- Docker installed on your system
- Docker Compose installed on your system

## Quick Start

1. **Navigate to the my-strapi-project directory:**
   ```bash
   cd next-portfolio/my-strapi-project
   ```

2. **Start the application:**
   ```bash
   docker-compose up
   ```

   This will:
   - Build the Strapi Docker image
   - Start a PostgreSQL database container
   - Start the Strapi application container
   - Create necessary volumes for data persistence

3. **Access the application:**
   - Strapi Admin Panel: http://localhost:1337/admin
   - Strapi API: http://localhost:1337/api

4. **First time setup:**
   - On first run, you'll need to create an admin user at http://localhost:1337/admin
   - Follow the on-screen instructions to complete the setup

## Docker Configuration

### Services

#### my-strapi-project
- **Port:** 1337 (mapped to host port 1337)
- **Environment:** Development mode with hot-reload enabled
- **Database:** PostgreSQL
- **Volumes:**
  - Source code mounted for live development
  - Node modules volume for faster rebuilds
  - Uploads volume for persistent file storage

#### postgres
- **Port:** 5432 (mapped to host port 5432)
- **Database:** strapi
- **User:** strapi
- **Password:** strapi
- **Persistent Storage:** postgres_data volume

### Environment Variables

The following environment variables are configured in `docker-compose.yml`:

- `DATABASE_CLIENT=postgres` - Database type
- `DATABASE_HOST=postgres` - Database host (service name)
- `DATABASE_PORT=5432` - Database port
- `DATABASE_NAME=strapi` - Database name
- `DATABASE_USERNAME=strapi` - Database username
- `DATABASE_PASSWORD=strapi` - Database password
- `APP_KEYS` - Application keys for encryption
- `API_TOKEN_SALT` - Salt for API tokens
- `ADMIN_JWT_SECRET` - JWT secret for admin authentication
- `TRANSFER_TOKEN_SALT` - Salt for transfer tokens
- `JWT_SECRET` - General JWT secret

**Important:** For production use, replace all default secrets with strong, randomly generated values!

## Common Commands

### Start services in detached mode
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs -f
```

### View logs for specific service
```bash
docker-compose logs -f my-strapi-project
docker-compose logs -f postgres
```

### Rebuild images
```bash
docker-compose up --build
```

### Reset everything (WARNING: This will delete all data)
```bash
docker-compose down -v
```

### Access Strapi container shell
```bash
docker exec -it my-strapi-project sh
```

### Access PostgreSQL container
```bash
docker exec -it strapi-postgres psql -U strapi -d strapi
```

## Development Workflow

1. Make changes to your code in the `my-strapi-project` directory
2. The changes will be automatically reflected in the container (hot-reload)
3. The Strapi dev server will restart when configuration changes are detected

## Data Persistence

The following data is persisted across container restarts:

- **postgres_data:** PostgreSQL database files
- **strapi_uploads:** Uploaded media files
- **node_modules:** NPM dependencies (for faster rebuilds)

## Troubleshooting

### Port already in use
If port 1337 or 5432 is already in use, you can change the port mapping in `docker-compose.yml`:
```yaml
ports:
  - "YOUR_PORT:1337"  # For Strapi
  - "YOUR_PORT:5432"  # For PostgreSQL
```

### Container won't start
1. Check logs: `docker-compose logs`
2. Ensure all required ports are available
3. Try rebuilding: `docker-compose up --build`

### Database connection issues
1. Ensure the postgres container is running: `docker-compose ps`
2. Check postgres logs: `docker-compose logs postgres`
3. Verify environment variables in `docker-compose.yml`

### Reset database
To start with a fresh database:
```bash
docker-compose down
docker volume rm my-strapi-project_postgres_data
docker-compose up
```

## Production Considerations

For production deployment:

1. **Update all secrets** in the environment variables
2. **Change database credentials** from default values
3. **Use production command:** Change CMD in Dockerfile to `npm run start`
4. **Set NODE_ENV:** Change to `production`
5. **Consider using** `.env` file for environment variables instead of hardcoding in docker-compose.yml
6. **Enable SSL** for database connections if required
7. **Set up backups** for the postgres_data volume
8. **Use Docker secrets** or environment variable management tools for sensitive data

## Network Architecture

The `strapi_network` bridge network connects:
- Strapi application container
- PostgreSQL database container

This allows the Strapi app to communicate with PostgreSQL using the service name `postgres` as the hostname.

## Integration with Portfolio App

To connect the portfolio-app (Next.js) with this Strapi instance:

1. Ensure both applications are running
2. In portfolio-app, set the `STRAPI_API_URL` environment variable to:
   - If running locally: `http://localhost:1337/api/`
   - If both in Docker: Use Docker network and service name

For running both applications together with Docker Compose, consider creating a unified docker-compose.yml in the `next-portfolio` directory that includes both services.
