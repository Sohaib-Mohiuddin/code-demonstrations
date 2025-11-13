# Portfolio Project Architecture

This document explains how the portfolio project works, including the Next.js frontend (portfolio-app) and the Strapi CMS backend (my-strapi-project).

## Overview

The portfolio project consists of two main applications:

1. **portfolio-app** - A Next.js frontend application
2. **my-strapi-project** - A Strapi headless CMS backend

These applications work together to create a dynamic portfolio website where content is managed through Strapi and displayed via Next.js.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        User Browser                          │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ HTTP Request
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    portfolio-app (Next.js)                   │
│                       Port: 3000                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Pages & Components                                     │ │
│  │  - Home Page (index.js)                                │ │
│  │  - Material-UI Components                              │ │
│  │                                                         │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  API Routes (/api/*)                                   │ │
│  │  - /api/experience.js (Fetches from Strapi)           │ │
│  │  - /api/hello.js                                       │ │
│  │                                                         │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Strapi Client Library                                │ │
│  │  - src/lib/strapi.js (API helper)                     │ │
│  │                                                         │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ REST API Calls
                            │ (STRAPI_API_URL)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│               my-strapi-project (Strapi CMS)                 │
│                       Port: 1337                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Admin Panel (/admin)                                  │ │
│  │  - Content Management Interface                        │ │
│  │  - User Authentication                                 │ │
│  │                                                         │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  REST API (/api/*)                                     │ │
│  │  - /api/experiences (Experience records)              │ │
│  │  - Auto-generated endpoints for content types         │ │
│  │                                                         │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Content Types & Schema                               │ │
│  │  - Experiences (with company logo)                    │ │
│  │  - Other custom content types                         │ │
│  │                                                         │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ SQL Queries
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                         │
│                       Port: 5432                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  - Content Data                                        │ │
│  │  - Media Files Metadata                               │ │
│  │  - User Accounts                                       │ │
│  │  - Permissions                                         │ │
│  │                                                         │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Application Details

### 1. Portfolio-App (Next.js Frontend)

**Location:** `next-portfolio/portfolio-app/`

**Technology Stack:**
- Next.js 15.0.1 (React framework)
- React 19.0.0-rc
- Material-UI (MUI) 6.1.6 for UI components
- Emotion for CSS-in-JS styling
- Axios for HTTP requests

**Key Features:**
- Server-Side Rendering (SSR) and Static Site Generation (SSG)
- API routes for backend integration
- Material-UI components for modern design
- Dynamic content fetching from Strapi CMS

**Important Files:**
- `src/pages/index.js` - Home page
- `src/pages/api/experience.js` - API route that fetches experience data from Strapi
- `src/lib/strapi.js` - Helper library for Strapi API calls
- `next.config.mjs` - Next.js configuration
- `package.json` - Dependencies and scripts

**API Integration:**
The portfolio-app communicates with Strapi through:
1. Environment variable `STRAPI_API_URL` pointing to Strapi server
2. API routes in `/api/*` that proxy requests to Strapi
3. Axios HTTP client for making requests

**Example Flow:**
```javascript
// User visits homepage
// -> Next.js renders page
// -> Page calls /api/experience
// -> /api/experience fetches from Strapi at http://localhost:1337/api/experiences
// -> Data returned and displayed on page
```

**Docker Configuration:**
- **Dockerfile:** Uses Node.js 24-alpine, installs dependencies, exposes port 3000
- **docker-compose.yml:** Configures development environment with volume mounts for hot reload

**Development Server:**
```bash
cd next-portfolio/portfolio-app
npm install
npm run dev
# Runs on http://localhost:3000
```

### 2. My-Strapi-Project (CMS Backend)

**Location:** `next-portfolio/my-strapi-project/`

**Technology Stack:**
- Strapi 5.2.0 (Headless CMS)
- PostgreSQL 8.8.0 (Database driver)
- React 18 (Admin panel)
- Node.js (Runtime)

**Key Features:**
- Headless CMS with RESTful API
- Admin panel for content management
- User authentication and permissions
- Media library for file uploads
- Content type builder
- API token management

**Important Files:**
- `config/database.js` - Database configuration (supports SQLite, PostgreSQL, MySQL)
- `config/server.js` - Server configuration (host, port, app keys)
- `src/` - API logic, content types, and custom code
- `package.json` - Dependencies and scripts

**Database Options:**
Strapi supports multiple databases:
- **SQLite** (default) - File-based, good for development
- **PostgreSQL** - Recommended for production
- **MySQL** - Alternative production database

Configuration is controlled via environment variables:
- `DATABASE_CLIENT` - Type of database (sqlite, postgres, mysql)
- `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME` - Connection details
- `DATABASE_USERNAME`, `DATABASE_PASSWORD` - Credentials

**Content Types:**
Strapi uses a content-type builder to define data structures. For this project:
- **Experiences** - Contains work experience information with company logos

**API Endpoints:**
Strapi automatically generates REST API endpoints for each content type:
- `GET /api/experiences` - List all experiences
- `GET /api/experiences/:id` - Get single experience
- `POST /api/experiences` - Create new experience (authenticated)
- `PUT /api/experiences/:id` - Update experience (authenticated)
- `DELETE /api/experiences/:id` - Delete experience (authenticated)

**Populate Relations:**
Strapi uses `populate` parameter to include related data:
```
/api/experiences?populate=companyLogo
```
This includes the company logo file details in the response.

**Docker Configuration (NEW):**
- **Dockerfile:** Uses Node.js 20-alpine, installs dependencies including build tools for PostgreSQL, exposes port 1337
- **docker-compose.yml:** Orchestrates Strapi app with PostgreSQL database
- **.dockerignore:** Excludes unnecessary files from Docker build

**Development Server:**
```bash
cd next-portfolio/my-strapi-project
npm install
npm run develop
# Runs on http://localhost:1337
# Admin panel at http://localhost:1337/admin
```

## Data Flow Example

Let's trace how experience data flows through the system:

### 1. Content Creation (Admin)
```
Admin User
  → Opens http://localhost:1337/admin
  → Logs into Strapi admin panel
  → Creates/edits "Experience" content
  → Uploads company logo
  → Saves data
  → Data stored in PostgreSQL database
```

### 2. Content Retrieval (Frontend)
```
Website Visitor
  → Opens http://localhost:3000
  → Next.js renders homepage
  → Homepage component needs experience data
  → Calls fetchExperienceList() from strapi.js
  → Makes request to /api/experience
  → /api/experience calls Strapi API
  → GET http://localhost:1337/api/experiences?populate=companyLogo
  → Strapi queries PostgreSQL
  → Returns JSON response with experience data
  → Next.js renders data on page
  → User sees experience list with logos
```

## Environment Variables

### Portfolio-App
```env
STRAPI_API_URL=http://localhost:1337/api/
NEXT_TELEMETRY_DISABLED=1
NODE_ENV=development
```

### My-Strapi-Project
```env
# Server
HOST=0.0.0.0
PORT=1337
NODE_ENV=development

# Security (CHANGE IN PRODUCTION!)
APP_KEYS="toBeModified1,toBeModified2"
API_TOKEN_SALT=tobemodified
ADMIN_JWT_SECRET=tobemodified
TRANSFER_TOKEN_SALT=tobemodified
JWT_SECRET=tobemodified

# Database
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=strapi
```

## Running the Full Stack

### Option 1: Traditional (No Docker)

**Terminal 1 - Strapi:**
```bash
cd next-portfolio/my-strapi-project
npm install
npm run develop
```

**Terminal 2 - Portfolio App:**
```bash
cd next-portfolio/portfolio-app
npm install
npm run dev
```

Access:
- Portfolio: http://localhost:3000
- Strapi Admin: http://localhost:1337/admin

### Option 2: Docker (Individual Services)

**Strapi:**
```bash
cd next-portfolio/my-strapi-project
docker-compose up
```

**Portfolio-App:**
```bash
cd next-portfolio/portfolio-app
docker-compose up
```

### Option 3: Docker (Combined - Recommended)

You can create a unified docker-compose.yml in the `next-portfolio` directory:

```yaml
services:
  # Strapi CMS
  strapi:
    build: ./my-strapi-project
    ports:
      - "1337:1337"
    environment:
      - DATABASE_CLIENT=postgres
      - DATABASE_HOST=postgres
      # ... other env vars
    depends_on:
      - postgres
    volumes:
      - ./my-strapi-project:/app
    networks:
      - portfolio_stack

  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
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
    ports:
      - "3000:3000"
    environment:
      - STRAPI_API_URL=http://strapi:1337/api/
    depends_on:
      - strapi
    volumes:
      - ./portfolio-app:/app
    networks:
      - portfolio_stack

networks:
  portfolio_stack:
    driver: bridge

volumes:
  postgres_data:
```

Then run:
```bash
cd next-portfolio
docker-compose up
```

## Development Workflow

1. **Start Strapi** and set up your content types in the admin panel
2. **Add content** through the Strapi admin interface
3. **Configure API permissions** in Strapi for public access
4. **Start Next.js** portfolio app
5. **Develop frontend** components that consume Strapi API
6. **Hot reload** automatically updates as you code

## Security Considerations

### Development
- Default credentials are acceptable
- SQLite can be used for quick testing
- Admin panel is open for local access

### Production
- **CHANGE ALL SECRETS** in environment variables
- Use strong, randomly generated keys
- Use PostgreSQL instead of SQLite
- Configure proper CORS settings in Strapi
- Set up SSL/TLS for both applications
- Implement rate limiting
- Use API tokens for authentication
- Set proper file upload limits
- Enable database backups

## Deployment

### Strapi
- Can be deployed to any Node.js hosting platform
- Popular options: Heroku, DigitalOcean, AWS, Railway
- Ensure PostgreSQL is available
- Set environment variables
- Run `npm run build` before starting in production

### Portfolio-App
- Can be deployed to Vercel, Netlify, or any Node.js platform
- Vercel is recommended for Next.js
- Set `STRAPI_API_URL` to production Strapi URL
- Consider using ISR (Incremental Static Regeneration) for better performance

## Troubleshooting

### Common Issues

**CORS Errors:**
- Configure CORS in Strapi middleware settings
- Ensure portfolio-app domain is allowed

**Connection Refused:**
- Check if services are running
- Verify port numbers
- Check firewall settings

**Database Connection Failed:**
- Verify PostgreSQL is running
- Check database credentials
- Ensure database exists

**API Returns Empty:**
- Check content exists in Strapi
- Verify API permissions are set to public
- Check populate parameters in requests

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Strapi Documentation](https://docs.strapi.io)
- [Docker Documentation](https://docs.docker.com)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
