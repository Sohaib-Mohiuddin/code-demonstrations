# Portfolio Project - Complete Setup Guide

This is a full-stack portfolio application consisting of:
- **portfolio-app**: Next.js frontend (Port 3000)
- **my-strapi-project**: Strapi CMS backend (Port 1337)
- **PostgreSQL**: Database for Strapi (Port 5432)

## Project Structure

```
next-portfolio/
├── docker-compose.yml          # Unified Docker setup (all services)
├── PROJECT_ARCHITECTURE.md     # Detailed system architecture
├── DOCKER_COMPARISON.md        # Docker configuration comparison
├── portfolio-app/              # Next.js frontend
│   ├── Dockerfile
│   ├── docker-compose.yml     # Standalone frontend setup
│   └── src/
└── my-strapi-project/         # Strapi CMS backend
    ├── Dockerfile
    ├── docker-compose.yml     # Standalone backend setup
    ├── DOCKER.md              # Strapi Docker documentation
    └── config/
```

## Quick Start

### Option 1: Run Everything Together (Recommended)

Run all services with a single command from the `next-portfolio` directory:

```bash
# Start all services
docker compose up

# Or run in detached mode
docker compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Strapi CMS on http://localhost:1337
- Portfolio frontend on http://localhost:3000

**First Time Setup:**
1. Wait for all services to start (this may take a few minutes on first run)
2. Open http://localhost:1337/admin and create an admin account
3. Configure your content types in Strapi
4. Open http://localhost:3000 to view the portfolio

### Option 2: Run Services Individually

If you prefer to run services separately:

**Terminal 1 - Strapi + Database:**
```bash
cd my-strapi-project
docker compose up
```

**Terminal 2 - Portfolio App:**
```bash
cd portfolio-app
docker compose up
```

Note: When running separately, update the `STRAPI_API_URL` in portfolio-app to point to `http://localhost:1337/api/`

## Prerequisites

- Docker (v20.10 or higher)
- Docker Compose (v2.0 or higher)

Check your versions:
```bash
docker --version
docker compose version
```

## Management Commands

### Start Services
```bash
docker compose up              # Start with logs
docker compose up -d           # Start in background
```

### Stop Services
```bash
docker compose down            # Stop and remove containers
docker compose down -v         # Stop and remove containers + volumes (deletes data!)
```

### View Logs
```bash
docker compose logs -f                    # All services
docker compose logs -f portfolio-app      # Frontend only
docker compose logs -f strapi             # Backend only
docker compose logs -f postgres           # Database only
```

### Rebuild Services
```bash
docker compose up --build                 # Rebuild all
docker compose up --build portfolio-app   # Rebuild frontend
docker compose up --build strapi          # Rebuild backend
```

### Access Containers
```bash
docker exec -it portfolio-app sh          # Frontend shell
docker exec -it my-strapi-project sh      # Backend shell
docker exec -it strapi-postgres psql -U strapi -d strapi  # Database shell
```

## Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| Portfolio Frontend | http://localhost:3000 | Main website |
| Strapi Admin Panel | http://localhost:1337/admin | Content management |
| Strapi API | http://localhost:1337/api | REST API endpoints |
| PostgreSQL | localhost:5432 | Database (via psql or client) |

## Environment Configuration

### Default Settings (Development)

The unified docker-compose.yml uses these default settings:
- Database: PostgreSQL
- Database credentials: strapi/strapi
- All security tokens: Default values (CHANGE IN PRODUCTION!)

### Customizing Settings

For custom configuration, you can:

1. **Use environment files**:
   - Create `.env` in each project directory
   - Variables will override docker-compose.yml defaults

2. **Edit docker-compose.yml**:
   - Modify environment variables directly
   - Change port mappings
   - Adjust resource limits

## Development Workflow

1. **Make code changes**: Edit files in `portfolio-app/` or `my-strapi-project/`
2. **See changes instantly**: Both apps support hot-reload
3. **Check logs**: Monitor with `docker compose logs -f`
4. **Commit changes**: Use git as normal (containers mount your source code)

## Data Persistence

Data is persisted in Docker volumes:

- `postgres_data`: Database files
- `strapi_uploads`: Uploaded media files
- `strapi_node_modules`: Strapi dependencies
- `portfolio_node_modules`: Portfolio dependencies

View volumes:
```bash
docker volume ls | grep next-portfolio
```

Remove all data (fresh start):
```bash
docker compose down -v
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :3000    # Frontend
lsof -i :1337    # Backend
lsof -i :5432    # Database

# Change ports in docker-compose.yml or kill the process
```

### Services Won't Start
```bash
# Check status
docker compose ps

# View logs for errors
docker compose logs

# Rebuild images
docker compose up --build

# Nuclear option (reset everything)
docker compose down -v
docker system prune -a
docker compose up --build
```

### Database Connection Issues
```bash
# Verify postgres is running
docker compose ps postgres

# Check postgres logs
docker compose logs postgres

# Verify from strapi container
docker exec -it my-strapi-project sh
nc -zv postgres 5432
```

### Slow Performance
```bash
# Allocate more resources in Docker Desktop settings
# - Increase CPUs (4+)
# - Increase Memory (4GB+)
# - Increase Swap (1GB+)
```

### Permission Issues
```bash
# On Linux/Mac, fix file ownership
sudo chown -R $USER:$USER .

# On Windows, ensure Docker Desktop has file access
```

## Production Deployment

⚠️ **Important**: The current configuration is for DEVELOPMENT only.

For production:

1. **Change all secrets** in environment variables
2. **Use strong database passwords**
3. **Set NODE_ENV=production**
4. **Use `npm run start`** instead of `npm run develop`
5. **Enable SSL/TLS**
6. **Set up proper backup strategy**
7. **Use environment variable management** (AWS Secrets Manager, etc.)
8. **Configure reverse proxy** (nginx, Traefik)
9. **Set resource limits** in docker-compose.yml
10. **Enable health checks**

See individual DOCKER.md files in each project for production guidance.

## Network Architecture

Services communicate over the `portfolio_stack` bridge network:

```
portfolio-app (3000) ─┐
                      ├─── portfolio_stack ─── Internet
strapi (1337) ────────┤
                      │
postgres (5432) ──────┘
```

- Frontend calls backend using `http://strapi:1337/api/`
- Backend calls database using `postgres:5432`
- All services can be accessed from host using `localhost`

## Additional Documentation

- **[PROJECT_ARCHITECTURE.md](./PROJECT_ARCHITECTURE.md)**: Detailed explanation of how everything works together
- **[DOCKER_COMPARISON.md](./DOCKER_COMPARISON.md)**: Side-by-side comparison of Docker configurations
- **[my-strapi-project/DOCKER.md](./my-strapi-project/DOCKER.md)**: Strapi-specific Docker documentation
- **[portfolio-app/README.md](./portfolio-app/README.md)**: Next.js application documentation

## Getting Help

### Common Issues
Check the troubleshooting section above and the individual README files.

### Docker Commands Reference
```bash
# Service management
docker compose up              # Start services
docker compose down            # Stop services
docker compose restart         # Restart services
docker compose ps              # List services

# Logs
docker compose logs            # View logs
docker compose logs -f         # Follow logs
docker compose logs --tail=100 # Last 100 lines

# Cleanup
docker compose down -v         # Remove volumes
docker system prune            # Clean unused resources
docker volume prune            # Remove unused volumes

# Build
docker compose build           # Build images
docker compose up --build      # Build and start
docker compose build --no-cache # Build without cache
```

## License

This project is for demonstration purposes.

## Contributing

This is a demonstration repository. Feel free to fork and modify for your own use.
