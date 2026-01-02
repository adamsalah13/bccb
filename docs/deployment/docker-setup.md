# Docker Setup Guide

Comprehensive guide for Docker and Docker Compose configuration in the BCCB platform.

## Table of Contents

- [Overview](#overview)
- [Docker Architecture](#docker-architecture)
- [Dockerfiles](#dockerfiles)
- [Docker Compose](#docker-compose)
- [Development vs Production](#development-vs-production)
- [Common Commands](#common-commands)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

BCCB uses Docker for containerization, providing consistent environments across development, staging, and production.

### Why Docker?

- **Consistency**: Same environment everywhere
- **Isolation**: Services don't interfere with each other
- **Portability**: Easy to move between environments
- **Scalability**: Simple horizontal scaling
- **Efficiency**: Resource-efficient containers

### Container Structure

```
bccb/
├── apps/
│   ├── web/              → Web container
│   ├── api/              → API container
│   └── ai-service/       → AI container
├── infrastructure/
│   └── docker/
│       ├── Dockerfile.api
│       ├── Dockerfile.web
│       └── Dockerfile.ai
├── docker-compose.yml         # Development
└── docker-compose.prod.yml    # Production
```

## Docker Architecture

### Service Dependencies

```mermaid
graph TD
    A[Web Frontend] -->|API Calls| B[API Backend]
    B -->|Queries| C[PostgreSQL]
    B -->|Cache| D[Redis]
    B -->|AI Requests| E[AI Service]
    E -->|ML Models| F[Model Storage]
```

### Container Network

```
┌─────────────────────────────────────┐
│        bccb-network (bridge)        │
├─────────────────────────────────────┤
│                                     │
│  web:5173  ←→  api:3000            │
│                  ↓                  │
│            postgres:5432            │
│            redis:6379               │
│            ai-service:8000          │
│                                     │
└─────────────────────────────────────┘
```

## Dockerfiles

### API Dockerfile

**Location**: `infrastructure/docker/Dockerfile.api`

```dockerfile
# Multi-stage build for API service

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/shared/package*.json ./packages/shared/

# Install dependencies
RUN npm ci --only=production

# Generate Prisma client
COPY database/schema/schema.prisma ./database/schema/
RUN npx prisma generate --schema=database/schema/schema.prisma

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build --workspace=apps/api

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 apiuser

# Copy built application
COPY --from=builder --chown=apiuser:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=apiuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=apiuser:nodejs /app/database ./database

# Switch to non-root user
USER apiuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
```

### Web Dockerfile

**Location**: `infrastructure/docker/Dockerfile.web`

```dockerfile
# Multi-stage build for Web frontend

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json ./
COPY apps/web/package*.json ./apps/web/

RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules

COPY . .

# Build with Vite
ENV NODE_ENV=production
RUN npm run build --workspace=apps/web

# Stage 3: Runner (NGINX)
FROM nginx:alpine AS runner

# Copy built assets
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Copy NGINX configuration
COPY infrastructure/docker/nginx.conf /etc/nginx/nginx.conf

# Create non-root user
RUN adduser -D -H -u 1001 -s /bin/sh www-data
RUN chown -R www-data:www-data /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

**NGINX Configuration** (`infrastructure/docker/nginx.conf`):

```nginx
user www-data;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    server {
        listen 80;
        server_name _;
        root /usr/share/nginx/html;
        index index.html;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # SPA routing
        location / {
            try_files $uri $uri/ /index.html;
        }
    }
}
```

### AI Service Dockerfile

**Location**: `apps/ai-service/Dockerfile`

```dockerfile
# Multi-stage build for AI service

# Stage 1: Dependencies
FROM python:3.11-slim AS deps
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install Python packages
COPY apps/ai-service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Stage 2: Runner
FROM python:3.11-slim AS runner
WORKDIR /app

# Copy installed packages
COPY --from=deps /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=deps /usr/local/bin /usr/local/bin

# Create non-root user
RUN useradd -m -u 1001 aiuser

# Copy application code
COPY --chown=aiuser:aiuser apps/ai-service/ .

# Create directories
RUN mkdir -p ml-models/trained logs && \
    chown -R aiuser:aiuser ml-models logs

USER aiuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8000/health').raise_for_status()"

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Docker Compose

### Development Configuration

**File**: `docker-compose.yml`

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: bccb-postgres
    environment:
      POSTGRES_DB: microcredentials
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: bccb-redis
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  api:
    build:
      context: .
      dockerfile: infrastructure/docker/Dockerfile.api
      target: runner
    container_name: bccb-api
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://user:password@postgres:5432/microcredentials
      REDIS_URL: redis://redis:6379
      AI_SERVICE_URL: http://ai-service:8000
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./apps/api:/app/apps/api
      - /app/node_modules
    command: npm run dev --workspace=apps/api

  web:
    build:
      context: .
      dockerfile: infrastructure/docker/Dockerfile.web
      target: builder
    container_name: bccb-web
    ports:
      - "5173:5173"
    environment:
      VITE_API_URL: http://localhost:3000
    depends_on:
      - api
    volumes:
      - ./apps/web:/app/apps/web
      - /app/node_modules
    command: npm run dev --workspace=apps/web

  ai-service:
    build:
      context: ./apps/ai-service
      dockerfile: Dockerfile
    container_name: bccb-ai-service
    ports:
      - "8000:8000"
    environment:
      PYTHON_ENV: development
      DATABASE_URL: postgresql://user:password@postgres:5432/microcredentials
      API_HOST: 0.0.0.0
      API_PORT: 8000
      LOG_LEVEL: info
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./apps/ai-service:/app
      - ai_models:/app/ml-models/trained

volumes:
  postgres_data:
  ai_models:

networks:
  default:
    name: bccb-network
```

### Production Configuration

**File**: `docker-compose.prod.yml`

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  api:
    image: ghcr.io/adamsalah13/bccb/api:${VERSION:-latest}
    restart: always
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      JWT_SECRET_FILE: /run/secrets/jwt_secret
    secrets:
      - jwt_secret
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M

  web:
    image: ghcr.io/adamsalah13/bccb/web:${VERSION:-latest}
    restart: always
    depends_on:
      - api
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

  ai-service:
    image: ghcr.io/adamsalah13/bccb/ai-service:${VERSION:-latest}
    restart: always
    environment:
      PYTHON_ENV: production
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ai_models:/app/ml-models/trained
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G

secrets:
  db_password:
    external: true
  jwt_secret:
    external: true

volumes:
  postgres_data:
  redis_data:
  ai_models:

networks:
  default:
    name: bccb-prod-network
```

## Development vs Production

### Key Differences

| Aspect | Development | Production |
|--------|-------------|------------|
| Image target | builder | runner |
| Volumes | Source mounted | Baked into image |
| Restart policy | no | always |
| Secrets | .env file | Docker secrets |
| Replicas | 1 | 2+ |
| Resource limits | none | defined |
| Logging | stdout | centralized |
| Health checks | basic | comprehensive |

### Development Features

```yaml
# Hot reloading
volumes:
  - ./apps/api:/app/apps/api
  - /app/node_modules

# Debug ports exposed
ports:
  - "9229:9229"  # Node.js debugger

# Verbose logging
environment:
  LOG_LEVEL: debug
```

### Production Features

```yaml
# Resource limits
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 1G

# Auto-restart
restart: always

# Health checks
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

## Common Commands

### Build and Start

```bash
# Development
docker-compose up -d
docker-compose logs -f api

# Production
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml ps
```

### Individual Services

```bash
# Start specific service
docker-compose up -d postgres

# Restart service
docker-compose restart api

# Stop service
docker-compose stop web

# Remove service
docker-compose rm -f ai-service
```

### Logs and Monitoring

```bash
# View logs
docker-compose logs api
docker-compose logs -f --tail=100 api

# Check resource usage
docker stats

# Inspect container
docker inspect bccb-api
```

### Executing Commands

```bash
# Run command in container
docker-compose exec api npm run db:migrate

# Run shell in container
docker-compose exec api sh

# Run command in new container
docker-compose run --rm api npm test
```

### Database Operations

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U user -d microcredentials

# Backup database
docker-compose exec postgres pg_dump -U user microcredentials > backup.sql

# Restore database
docker-compose exec -T postgres psql -U user microcredentials < backup.sql
```

### Cleanup

```bash
# Stop and remove containers
docker-compose down

# Remove containers and volumes
docker-compose down -v

# Remove all unused data
docker system prune -a --volumes
```

## Best Practices

### 1. Multi-Stage Builds

Use multi-stage builds to minimize image size:

```dockerfile
FROM node:20-alpine AS builder
# Build steps...

FROM node:20-alpine AS runner
COPY --from=builder /app/dist ./dist
# Only copy what's needed
```

### 2. Layer Caching

Optimize Dockerfile order for better caching:

```dockerfile
# Good: Dependencies change less frequently
COPY package*.json ./
RUN npm install

# Then copy source code
COPY . .
RUN npm run build
```

### 3. Non-Root User

Always run as non-root user:

```dockerfile
RUN adduser -D -u 1001 appuser
USER appuser
```

### 4. Health Checks

Include health checks in Dockerfiles:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:3000/health || exit 1
```

### 5. Resource Limits

Set resource limits in production:

```yaml
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 1G
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs api

# Check exit code
docker-compose ps

# Inspect container
docker inspect bccb-api
```

### Port Already in Use

```bash
# Find process using port
lsof -ti:3000

# Change port in docker-compose.yml
ports:
  - "3001:3000"
```

### Volume Permission Issues

```bash
# Check ownership
docker-compose exec api ls -la /app

# Fix permissions
docker-compose exec api chown -R node:node /app
```

### Network Issues

```bash
# List networks
docker network ls

# Inspect network
docker network inspect bccb-network

# Recreate network
docker-compose down
docker network prune
docker-compose up -d
```

## Next Steps

- [Deployment Guide](deployment-guide.md) - Deploy to production
- [Monitoring Guide](monitoring.md) - Set up monitoring
- [Development Setup](../development/development-setup.md) - Local development

---

**Docker Documentation**: https://docs.docker.com/
**Docker Compose**: https://docs.docker.com/compose/
