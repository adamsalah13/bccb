# Deployment Guide

Comprehensive guide for deploying the BCCB platform to production environments.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Deployment Methods](#deployment-methods)
- [Production Deployment](#production-deployment)
- [Database Migration](#database-migration)
- [Security Checklist](#security-checklist)
- [Post-Deployment Verification](#post-deployment-verification)
- [Rollback Procedures](#rollback-procedures)
- [Troubleshooting](#troubleshooting)

## Overview

This guide covers production deployment of the BCCB platform. The recommended deployment approach uses Docker containers with infrastructure-as-code practices.

### Deployment Architecture

```
┌────────────────────────────────────────────┐
│         Production Environment             │
├────────────────────────────────────────────┤
│                                            │
│  ┌──────────────┐    ┌──────────────────┐ │
│  │ Load Balancer│    │   CDN (Optional) │ │
│  │  (NGINX/ALB) │    │                  │ │
│  └──────┬───────┘    └──────────────────┘ │
│         │                                  │
│    ┌────┴────┐                            │
│    │         │                            │
│  ┌─▼──┐   ┌─▼──┐                         │
│  │API │   │API │  (Multiple instances)   │
│  │ 1  │   │ 2  │                         │
│  └─┬──┘   └─┬──┘                         │
│    │        │                             │
│    └────┬───┘                             │
│         │                                 │
│  ┌──────▼─────────┐  ┌────────────────┐  │
│  │   PostgreSQL   │  │     Redis      │  │
│  │   (Primary)    │  │   (Cache)      │  │
│  └────────────────┘  └────────────────┘  │
│                                           │
│  ┌────────────────┐  ┌────────────────┐  │
│  │  AI Service    │  │   Monitoring   │  │
│  │                │  │                │  │
│  └────────────────┘  └────────────────┘  │
└───────────────────────────────────────────┘
```

### Supported Platforms

- **Docker Compose** - Simple deployments, staging
- **Kubernetes** - Large-scale production (planned)
- **AWS ECS/Fargate** - Managed containers
- **Google Cloud Run** - Serverless containers
- **Azure Container Instances** - Managed containers

## Prerequisites

### System Requirements

**Minimum**:
- CPU: 4 cores
- RAM: 8GB
- Disk: 50GB SSD
- Network: 100 Mbps

**Recommended**:
- CPU: 8+ cores
- RAM: 16GB+
- Disk: 100GB+ SSD
- Network: 1 Gbps

### Required Services

- **Database**: PostgreSQL 15+
- **Cache**: Redis 7+
- **Container Runtime**: Docker 24+
- **Reverse Proxy**: NGINX or cloud load balancer
- **SSL Certificate**: Let's Encrypt or commercial

### Required Tools

```bash
# Docker and Docker Compose
docker --version  # 24.0+
docker-compose --version  # 2.20+

# SSL certificates
certbot --version  # For Let's Encrypt

# Process manager (optional)
pm2 --version
```

## Environment Configuration

### Production Environment Variables

Create `.env.production`:

```bash
# Application
NODE_ENV=production
PORT=3000
API_URL=https://api.bccb.example.com

# Database
DATABASE_URL=postgresql://bccb_user:STRONG_PASSWORD@db.internal:5432/microcredentials
DATABASE_POOL_MIN=5
DATABASE_POOL_MAX=20
DATABASE_TIMEOUT=30000

# Redis
REDIS_URL=redis://redis.internal:6379
REDIS_TTL=3600

# AI/ML Services
AI_SERVICE_URL=http://ai-service.internal:8000
OPENAI_API_KEY=sk-PRODUCTION_KEY
HUGGINGFACE_TOKEN=hf_PRODUCTION_TOKEN

# Authentication
JWT_SECRET=GENERATE_STRONG_SECRET_MIN_32_CHARS
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# AWS Services (Production)
AWS_REGION=us-west-2
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
S3_BUCKET=bccb-prod-uploads

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# CORS
CORS_ORIGIN=https://app.bccb.example.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# Monitoring
SENTRY_DSN=https://...@sentry.io/...
NEW_RELIC_LICENSE_KEY=...

# Feature Flags
ENABLE_AI_RECOMMENDATIONS=true
ENABLE_NLP_ANALYSIS=true
ENABLE_AUTO_PATHWAYS=true
```

### Secrets Management

#### Using Environment Variables

```bash
# Never commit .env.production!
# Add to .gitignore
echo '.env.production' >> .gitignore
```

#### Using Docker Secrets

```yaml
# docker-compose.prod.yml
secrets:
  db_password:
    external: true
  jwt_secret:
    external: true

services:
  api:
    secrets:
      - db_password
      - jwt_secret
```

```bash
# Create secrets
echo "strong_password" | docker secret create db_password -
echo "jwt_secret_value" | docker secret create jwt_secret -
```

#### Using AWS Secrets Manager

```typescript
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

async function getSecret(secretName: string) {
  const client = new SecretsManagerClient({ region: 'us-west-2' });
  const response = await client.send(
    new GetSecretValueCommand({ SecretId: secretName })
  );
  return JSON.parse(response.SecretString);
}

// Load secrets on startup
const secrets = await getSecret('bccb/production');
```

## Deployment Methods

### Method 1: Docker Compose (Recommended for Small-Medium Scale)

#### 1. Prepare Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin
```

#### 2. Clone Repository

```bash
# Clone repository
git clone https://github.com/adamsalah13/bccb.git
cd bccb

# Checkout release tag
git checkout v1.0.0
```

#### 3. Configure Environment

```bash
# Copy environment template
cp .env.example .env.production

# Edit with production values
nano .env.production

# Generate strong secrets
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 24  # For database password
```

#### 4. Build Images

```bash
# Build all images
docker-compose -f docker-compose.prod.yml build

# Or pull pre-built images
docker-compose -f docker-compose.prod.yml pull
```

#### 5. Initialize Database

```bash
# Start database only
docker-compose -f docker-compose.prod.yml up -d postgres redis

# Wait for database to be ready
docker-compose -f docker-compose.prod.yml exec postgres pg_isready

# Run migrations
docker-compose -f docker-compose.prod.yml run --rm api npm run db:migrate:deploy

# Seed initial data (optional)
docker-compose -f docker-compose.prod.yml run --rm api npm run db:seed
```

#### 6. Start Services

```bash
# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

#### 7. Setup SSL with NGINX

```bash
# Install NGINX
sudo apt install nginx certbot python3-certbot-nginx

# Create NGINX config
sudo nano /etc/nginx/sites-available/bccb

# Add configuration (see NGINX section below)

# Enable site
sudo ln -s /etc/nginx/sites-available/bccb /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload NGINX
sudo systemctl reload nginx

# Get SSL certificate
sudo certbot --nginx -d api.bccb.example.com -d app.bccb.example.com
```

**NGINX Configuration** (`/etc/nginx/sites-available/bccb`):

```nginx
# API Backend
upstream api_backend {
    least_conn;
    server localhost:3000;
    server localhost:3001;  # If multiple instances
}

# Web Frontend
upstream web_frontend {
    server localhost:5173;
}

# API Server Block
server {
    listen 80;
    server_name api.bccb.example.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.bccb.example.com;
    
    # SSL configuration (managed by certbot)
    ssl_certificate /etc/letsencrypt/live/api.bccb.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.bccb.example.com/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000" always;
    
    # API proxy
    location / {
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Health check
    location /health {
        proxy_pass http://api_backend/health;
        access_log off;
    }
}

# Web App Server Block
server {
    listen 80;
    server_name app.bccb.example.com;
    
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.bccb.example.com;
    
    ssl_certificate /etc/letsencrypt/live/app.bccb.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.bccb.example.com/privkey.pem;
    
    root /var/www/bccb/dist;
    index index.html;
    
    # Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
    
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
```

### Method 2: Cloud Platform Deployment

#### AWS ECS/Fargate

```bash
# Install AWS CLI
aws configure

# Create ECR repositories
aws ecr create-repository --repository-name bccb/api
aws ecr create-repository --repository-name bccb/web
aws ecr create-repository --repository-name bccb/ai-service

# Build and push images
docker build -t bccb/api -f infrastructure/docker/Dockerfile.api .
docker tag bccb/api:latest 123456789.dkr.ecr.us-west-2.amazonaws.com/bccb/api:latest
docker push 123456789.dkr.ecr.us-west-2.amazonaws.com/bccb/api:latest

# Deploy with ECS CLI or CloudFormation
ecs-cli compose --file docker-compose.prod.yml service up
```

#### Google Cloud Run

```bash
# Install gcloud CLI
gcloud auth login

# Enable services
gcloud services enable run.googleapis.com

# Deploy services
gcloud run deploy bccb-api \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

gcloud run deploy bccb-web \
  --source ./apps/web \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## Production Deployment

### Zero-Downtime Deployment

#### Using Docker Compose

```bash
# Pull new images
docker-compose -f docker-compose.prod.yml pull

# Restart services one at a time
docker-compose -f docker-compose.prod.yml up -d --no-deps --scale api=2 api

# Wait for health check
sleep 10

# Scale down old instance
docker-compose -f docker-compose.prod.yml up -d --no-deps --scale api=1 api
```

#### Blue-Green Deployment

```bash
# Deploy to "green" environment
docker-compose -f docker-compose.green.yml up -d

# Run smoke tests
curl https://green.bccb.example.com/health

# Switch traffic (update load balancer)
# Rollback if issues detected
```

## Database Migration

### Pre-Deployment Checks

```bash
# Backup database
pg_dump -U bccb_user microcredentials > backup_$(date +%Y%m%d_%H%M%S).sql

# Test migrations locally
npm run db:migrate -- --preview

# Check migration status
npx prisma migrate status
```

### Running Migrations

```bash
# Production migrations (no prompts)
npm run db:migrate:deploy

# Or in Docker
docker-compose -f docker-compose.prod.yml run --rm api npm run db:migrate:deploy
```

### Rollback Migration

```bash
# Restore from backup
psql -U bccb_user microcredentials < backup_20240102_120000.sql

# Or use Prisma migration history
npx prisma migrate resolve --rolled-back "20240102120000_migration_name"
```

## Security Checklist

Before deploying to production:

- [ ] All secrets stored securely (not in code)
- [ ] Strong passwords generated (min 32 characters)
- [ ] JWT secret is unique and strong
- [ ] Database accessible only from app servers
- [ ] Redis password protected
- [ ] HTTPS enabled with valid certificate
- [ ] CORS configured for production domain only
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Firewall rules configured
- [ ] SSH key-based authentication only
- [ ] Automatic security updates enabled
- [ ] Backup strategy implemented
- [ ] Monitoring and alerting configured
- [ ] Log retention policy defined

## Post-Deployment Verification

### Health Checks

```bash
# Check API health
curl https://api.bccb.example.com/health

# Expected response:
# {
#   "status": "healthy",
#   "version": "1.0.0",
#   "services": {
#     "database": "healthy",
#     "cache": "healthy",
#     "ai_service": "healthy"
#   }
# }

# Check web app
curl -I https://app.bccb.example.com
# Should return 200 OK
```

### Smoke Tests

```bash
# Login
curl -X POST https://api.bccb.example.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Fetch credentials
curl https://api.bccb.example.com/api/v1/credentials \
  -H "Authorization: Bearer $TOKEN"

# Check AI service
curl https://api.bccb.example.com/api/v1/ai/health
```

### Performance Tests

```bash
# Load testing with Apache Bench
ab -n 1000 -c 10 https://api.bccb.example.com/health

# Or use k6
k6 run load-test.js
```

## Rollback Procedures

### Application Rollback

```bash
# Rollback to previous Docker image
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml pull --ignore-pull-failures api:v1.0.0
docker-compose -f docker-compose.prod.yml up -d

# Or rollback git tag
git checkout v1.0.0
docker-compose -f docker-compose.prod.yml up -d --build
```

### Database Rollback

```bash
# Restore from backup
docker-compose -f docker-compose.prod.yml exec postgres \
  psql -U bccb_user microcredentials < backup.sql

# Or use point-in-time recovery (if configured)
```

## Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs api

# Check container status
docker-compose -f docker-compose.prod.yml ps

# Restart service
docker-compose -f docker-compose.prod.yml restart api
```

### Database Connection Issues

```bash
# Check database is running
docker-compose -f docker-compose.prod.yml exec postgres pg_isready

# Test connection
docker-compose -f docker-compose.prod.yml exec api \
  psql $DATABASE_URL -c "SELECT 1"

# Check connection pool
docker-compose -f docker-compose.prod.yml exec postgres \
  psql -U bccb_user -d microcredentials -c \
  "SELECT count(*) FROM pg_stat_activity;"
```

### High Memory Usage

```bash
# Check resource usage
docker stats

# Restart service
docker-compose -f docker-compose.prod.yml restart api

# Scale horizontally
docker-compose -f docker-compose.prod.yml up -d --scale api=3
```

## Next Steps

- [Docker Setup Guide](docker-setup.md) - Detailed Docker configuration
- [Monitoring Guide](monitoring.md) - Set up monitoring and alerts
- [Infrastructure Documentation](infrastructure.md) - Complete infrastructure details

---

**Need Help?** Check [Troubleshooting](../getting-started/troubleshooting.md) or open an issue on [GitHub](https://github.com/adamsalah13/bccb/issues).
