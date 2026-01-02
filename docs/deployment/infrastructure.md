# Infrastructure and Deployment

## Overview

This guide covers the infrastructure setup, deployment processes, and operational best practices for the BCCB platform. The system is designed for containerized deployment using Docker and orchestration with Kubernetes (future).

## Table of Contents

1. [Docker Setup](#docker-setup)
2. [Local Development](#local-development)
3. [Production Deployment](#production-deployment)
4. [Kubernetes Deployment (Future)](#kubernetes-deployment-future)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Monitoring & Logging](#monitoring--logging)
7. [Backup & Recovery](#backup--recovery)
8. [Security Best Practices](#security-best-practices)
9. [Scaling Strategies](#scaling-strategies)
10. [Troubleshooting](#troubleshooting)

---

## Docker Setup

### Container Architecture

The platform uses multi-container Docker setup with the following services:

```
┌─────────────────────────────────────────────────┐
│              Docker Compose Stack               │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │   Web    │  │   API    │  │  AI Service  │ │
│  │  (React) │  │ (Node.js)│  │   (Python)   │ │
│  │ Port:5173│  │ Port:3000│  │  Port:8000   │ │
│  └──────────┘  └──────────┘  └──────────────┘ │
│                                                 │
│  ┌──────────┐  ┌──────────┐                   │
│  │PostgreSQL│  │  Redis   │                   │
│  │ Port:5432│  │ Port:6379│                   │
│  └──────────┘  └──────────┘                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Dockerfile Configurations

#### Web Application (React)

**Location**: `infrastructure/docker/Dockerfile.web`

**Multi-stage build**:
1. **deps**: Install Node.js dependencies
2. **builder**: Build React application with Vite
3. **runner**: Serve static files with NGINX

**Key Features**:
- Multi-stage build for smaller image size
- NGINX for efficient static file serving
- Non-root user for security
- Health checks included
- Optimized for production

**Image Size**: ~50MB (NGINX Alpine)

#### API Service (Node.js)

**Location**: `infrastructure/docker/Dockerfile.api`

**Multi-stage build**:
1. **deps**: Install dependencies and generate Prisma client
2. **builder**: Compile TypeScript to JavaScript
3. **runner**: Run compiled application

**Key Features**:
- TypeScript compilation
- Prisma client generation
- dumb-init for proper signal handling
- Health check endpoint
- Production optimizations

**Image Size**: ~150MB (Node.js Alpine)

#### AI Service (Python)

**Location**: `infrastructure/docker/Dockerfile.ai`

**Multi-stage build**:
1. **deps**: Install Python packages
2. **runner**: Copy packages and run service

**Key Features**:
- Minimal system dependencies
- FastAPI with Uvicorn
- Non-root user
- Pre-loaded ML models
- Health check endpoint

**Image Size**: ~800MB (includes ML libraries)

### Docker Compose Configuration

**Location**: `docker-compose.yml`

```yaml
version: '3.8'

services:
  # PostgreSQL Database
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

  # Redis Cache
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

  # API Service
  api:
    build:
      context: .
      dockerfile: infrastructure/docker/Dockerfile.api
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
      - ./apps/api:/app
      - /app/node_modules

  # Web Application
  web:
    build:
      context: .
      dockerfile: infrastructure/docker/Dockerfile.web
    container_name: bccb-web
    ports:
      - "5173:5173"
    environment:
      VITE_API_URL: http://localhost:3000
    depends_on:
      - api
    volumes:
      - ./apps/web:/app
      - /app/node_modules

  # AI Service
  ai-service:
    build:
      context: .
      dockerfile: infrastructure/docker/Dockerfile.ai
    container_name: bccb-ai-service
    ports:
      - "8000:8000"
    environment:
      PYTHON_ENV: development
      DATABASE_URL: postgresql://user:password@postgres:5432/microcredentials
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./packages/ai-engine:/app
      - ai_models:/app/models

volumes:
  postgres_data:
  ai_models:

networks:
  default:
    name: bccb-network
```

### Building and Running

```bash
# Build all containers
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild specific service
docker-compose build api

# Restart specific service
docker-compose restart api
```

---

## Local Development

### Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose v2.0+
- Git
- Node.js 20+ (for local development without Docker)
- Python 3.11+ (for AI service development)

### Quick Start

1. **Clone Repository**:
   ```bash
   git clone https://github.com/adamsalah13/bccb.git
   cd bccb
   ```

2. **Setup Environment Variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start Services**:
   ```bash
   docker-compose up -d
   ```

4. **Run Database Migrations**:
   ```bash
   docker-compose exec api npm run db:migrate
   ```

5. **Seed Database** (optional):
   ```bash
   docker-compose exec api npm run db:seed
   ```

6. **Access Applications**:
   - Frontend: http://localhost:5173
   - API: http://localhost:3000
   - AI Service: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Development Workflow

#### Without Docker (Native Development)

**Install Dependencies**:
```bash
npm install
```

**Setup Database**:
```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed
```

**Start Development Servers**:
```bash
# Terminal 1: API
npm run dev:api

# Terminal 2: Web
npm run dev:web

# Terminal 3: AI Service (optional)
cd packages/ai-engine
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn src.main:app --reload
```

#### Hot Reload

- **Web**: Vite hot module replacement (HMR)
- **API**: Nodemon watches TypeScript files
- **AI Service**: Uvicorn auto-reload

### Database Management

**Prisma Studio** (Visual DB Browser):
```bash
npm run db:studio
# Opens at http://localhost:5555
```

**Create Migration**:
```bash
npm run db:migrate:create add_new_field
```

**Apply Migrations**:
```bash
npm run db:migrate
```

**Reset Database** (dev only):
```bash
npm run db:reset
```

### Running Tests

```bash
# All tests
npm test

# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# With coverage
npm run test:coverage
```

---

## Production Deployment

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Firewall rules configured
- [ ] Monitoring setup
- [ ] Backup strategy implemented
- [ ] Load balancer configured
- [ ] CDN setup for static assets
- [ ] Rate limiting enabled
- [ ] Security headers configured

### Environment Variables

**Production `.env` file**:

```bash
# Application
NODE_ENV=production
API_PORT=3000
WEB_PORT=80

# Database
DATABASE_URL=postgresql://user:password@db-host:5432/microcredentials
DATABASE_POOL_SIZE=100

# Redis
REDIS_URL=redis://redis-host:6379
REDIS_MAX_RETRIES=3

# AI Service
AI_SERVICE_URL=https://ai.bccb.example.com

# Authentication
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRES_IN=900  # 15 minutes
REFRESH_TOKEN_EXPIRES_IN=604800  # 7 days

# CORS
ALLOWED_ORIGINS=https://bccb.example.com,https://www.bccb.example.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=3600000  # 1 hour
RATE_LIMIT_MAX_REQUESTS=1000

# Monitoring
SENTRY_DSN=https://...@sentry.io/...
LOG_LEVEL=info

# Email (for notifications)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@bccb.example.com
SMTP_PASSWORD=password

# Cloud Storage (for ML models, uploads)
AWS_REGION=us-west-2
AWS_BUCKET=bccb-production
AWS_ACCESS_KEY_ID=your-key-id
AWS_SECRET_ACCESS_KEY=your-secret-key
```

### Docker Production Build

**Build Production Images**:

```bash
# Build with production optimizations
docker-compose -f docker-compose.prod.yml build

# Tag images
docker tag bccb-web:latest your-registry.com/bccb-web:v1.0.0
docker tag bccb-api:latest your-registry.com/bccb-api:v1.0.0
docker tag bccb-ai:latest your-registry.com/bccb-ai:v1.0.0

# Push to registry
docker push your-registry.com/bccb-web:v1.0.0
docker push your-registry.com/bccb-api:v1.0.0
docker push your-registry.com/bccb-ai:v1.0.0
```

### Cloud Platform Deployment

#### AWS Deployment

**Services Used**:
- **ECS/Fargate**: Container orchestration
- **RDS PostgreSQL**: Managed database
- **ElastiCache Redis**: Managed cache
- **ALB**: Application load balancer
- **S3**: Static assets and ML models
- **CloudWatch**: Monitoring and logs
- **Route53**: DNS management
- **ACM**: SSL certificates

**Deployment Steps**:

1. **Setup VPC and Networking**
2. **Create RDS Instance**
3. **Create ElastiCache Cluster**
4. **Create ECS Cluster**
5. **Define ECS Task Definitions**
6. **Create ECS Services**
7. **Configure ALB**
8. **Setup Auto Scaling**

#### Google Cloud Platform

**Services Used**:
- **Cloud Run**: Serverless containers
- **Cloud SQL**: Managed PostgreSQL
- **Memorystore**: Managed Redis
- **Cloud Load Balancing**: Load balancer
- **Cloud Storage**: Object storage
- **Cloud Monitoring**: Monitoring

#### Azure Deployment

**Services Used**:
- **Azure Container Instances**: Container hosting
- **Azure Database for PostgreSQL**: Managed database
- **Azure Cache for Redis**: Managed Redis
- **Azure Application Gateway**: Load balancer
- **Azure Blob Storage**: Object storage
- **Azure Monitor**: Monitoring

### Manual Deployment (VPS/Bare Metal)

**Requirements**:
- Ubuntu 22.04 LTS or equivalent
- 4GB RAM minimum (8GB recommended)
- 50GB disk space
- Docker and Docker Compose installed

**Deployment Steps**:

```bash
# 1. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 2. Clone repository
git clone https://github.com/adamsalah13/bccb.git
cd bccb

# 3. Configure environment
cp .env.example .env
nano .env  # Edit configuration

# 4. Build and start
docker-compose -f docker-compose.prod.yml up -d

# 5. Run migrations
docker-compose exec api npm run db:migrate

# 6. Setup NGINX reverse proxy
apt install nginx
# Configure NGINX (see below)

# 7. Setup SSL with Let's Encrypt
apt install certbot python3-certbot-nginx
certbot --nginx -d bccb.example.com
```

**NGINX Configuration**:

```nginx
# /etc/nginx/sites-available/bccb

upstream api {
    server localhost:3000;
}

upstream web {
    server localhost:5173;
}

upstream ai {
    server localhost:8000;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name bccb.example.com;
    return 301 https://$server_name$request_uri;
}

# Main application
server {
    listen 443 ssl http2;
    server_name bccb.example.com;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/bccb.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/bccb.example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend
    location / {
        proxy_pass http://web;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API
    location /api/ {
        proxy_pass http://api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support (if needed)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # AI Service
    location /ai/ {
        proxy_pass http://ai;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Kubernetes Deployment (Future)

### Cluster Architecture

```
┌─────────────────────────────────────────────────┐
│           Kubernetes Cluster                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │        Ingress Controller                │  │
│  │         (NGINX/Traefik)                  │  │
│  └──────────────────────────────────────────┘  │
│                     │                           │
│       ┌─────────────┼─────────────┐            │
│       │             │             │            │
│  ┌────▼────┐  ┌────▼────┐  ┌────▼────┐       │
│  │ Web Svc │  │ API Svc │  │ AI Svc  │       │
│  └────┬────┘  └────┬────┘  └────┬────┘       │
│       │            │             │            │
│  ┌────▼────┐  ┌───▼─────┐  ┌───▼─────┐      │
│  │Web Pods │  │API Pods │  │AI Pods  │      │
│  │ x2      │  │ x3      │  │ x2      │      │
│  └─────────┘  └────┬────┘  └─────────┘      │
│                     │                         │
│       ┌─────────────┼─────────────┐          │
│       │                           │          │
│  ┌────▼──────┐            ┌──────▼──────┐   │
│  │PostgreSQL │            │   Redis     │   │
│  │StatefulSet│            │StatefulSet  │   │
│  └───────────┘            └─────────────┘   │
│                                              │
└──────────────────────────────────────────────┘
```

### Kubernetes Manifests

**Namespace**:
```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: bccb-production
```

**ConfigMap**:
```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: bccb-config
  namespace: bccb-production
data:
  NODE_ENV: "production"
  API_PORT: "3000"
  LOG_LEVEL: "info"
```

**Secrets**:
```yaml
# secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: bccb-secrets
  namespace: bccb-production
type: Opaque
stringData:
  DATABASE_URL: "postgresql://user:password@postgres:5432/db"
  JWT_SECRET: "your-secret-key"
  REDIS_URL: "redis://redis:6379"
```

**API Deployment**:
```yaml
# api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  namespace: bccb-production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: api
        image: your-registry.com/bccb-api:v1.0.0
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: bccb-config
              key: NODE_ENV
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: bccb-secrets
              key: DATABASE_URL
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: api
  namespace: bccb-production
spec:
  selector:
    app: api
  ports:
  - port: 3000
    targetPort: 3000
  type: ClusterIP
```

**Horizontal Pod Autoscaler**:
```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
  namespace: bccb-production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

**Ingress**:
```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: bccb-ingress
  namespace: bccb-production
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/rate-limit: "100"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - bccb.example.com
    secretName: bccb-tls
  rules:
  - host: bccb.example.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api
            port:
              number: 3000
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web
            port:
              number: 80
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

**Location**: `.github/workflows/deploy.yml`

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type check
        run: npm run typecheck
      
      - name: Run tests
        run: npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    strategy:
      matrix:
        service: [web, api, ai]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-${{ matrix.service }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha
      
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./infrastructure/docker/Dockerfile.${{ matrix.service }}
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to production
        run: |
          # Deploy to your production environment
          # This could be kubectl apply, AWS ECS update, etc.
          echo "Deploying to production..."
```

### Deployment Strategies

#### Rolling Update (Kubernetes)

- Zero downtime deployment
- Gradual pod replacement
- Automatic rollback on failure

**Configuration**:
```yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
```

#### Blue-Green Deployment

- Deploy new version alongside old
- Switch traffic when ready
- Quick rollback capability

#### Canary Deployment

- Deploy to small subset of users
- Monitor metrics
- Gradually increase traffic

---

## Monitoring & Logging

### Application Monitoring

**Prometheus Metrics**:

```typescript
// Metrics exported by API service
- http_requests_total
- http_request_duration_seconds
- database_query_duration_seconds
- cache_hit_rate
- active_connections
```

**Grafana Dashboards**:
- System overview
- API performance
- Database metrics
- Cache performance
- Error rates

### Logging Strategy

**Log Levels**:
- `ERROR`: Critical issues
- `WARN`: Warning conditions
- `INFO`: General info
- `DEBUG`: Debug details

**Structured Logging**:
```json
{
  "timestamp": "2024-01-02T19:00:00Z",
  "level": "INFO",
  "service": "api",
  "message": "Request processed",
  "requestId": "uuid",
  "userId": "uuid",
  "endpoint": "/api/credentials",
  "method": "GET",
  "statusCode": 200,
  "duration": 45
}
```

**Log Aggregation**:
- **Development**: Console logs
- **Production**: ELK Stack or cloud service (CloudWatch, Stackdriver)

### Health Checks

**API Health Endpoint**:
```typescript
GET /health

Response:
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime": 3600,
  "services": {
    "database": "healthy",
    "cache": "healthy",
    "ai_service": "healthy"
  }
}
```

### Alerting

**Alert Rules**:
- Service down for > 5 minutes
- Error rate > 5% for 5 minutes
- Response time P95 > 2 seconds
- Database connections > 90% of pool
- Disk space < 10%
- Memory usage > 90%

**Alert Channels**:
- Email notifications
- Slack/Teams webhooks
- PagerDuty for critical alerts
- SMS for emergencies

---

## Backup & Recovery

### Database Backups

**Automated Backups**:
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="microcredentials"

# Create backup
pg_dump -U user -h localhost $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Retain last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

# Upload to S3
aws s3 cp $BACKUP_DIR/backup_$DATE.sql.gz s3://bccb-backups/db/
```

**Backup Schedule**:
- Full backup: Daily at 2 AM UTC
- Transaction logs: Continuous
- Retention: 30 days local, 1 year cloud

### Disaster Recovery

**RTO (Recovery Time Objective)**: 4 hours  
**RPO (Recovery Point Objective)**: 24 hours

**Recovery Procedure**:
1. Provision new infrastructure
2. Restore database from latest backup
3. Deploy application containers
4. Apply any pending migrations
5. Verify system functionality
6. Update DNS records

### Testing Recovery

```bash
# Test restore procedure monthly
./scripts/test-recovery.sh
```

---

## Security Best Practices

### Container Security

1. **Use Official Base Images**
2. **Regular Updates**: Update base images monthly
3. **Non-Root User**: Run as non-root user
4. **Scan Images**: Use vulnerability scanners
5. **Minimal Images**: Use Alpine variants

### Secrets Management

1. **Never commit secrets** to version control
2. **Use environment variables** for configuration
3. **Kubernetes Secrets** for K8s deployments
4. **AWS Secrets Manager** / **Azure Key Vault** for cloud
5. **Rotate secrets** regularly

### Network Security

1. **HTTPS only** in production
2. **TLS 1.3** minimum
3. **Rate limiting** enabled
4. **CORS** properly configured
5. **Firewall rules** restrictive
6. **DDoS protection** enabled

### Application Security

1. **Input validation** on all endpoints
2. **Parameterized queries** (Prisma provides this)
3. **JWT tokens** with short expiry
4. **CSRF protection** for state-changing operations
5. **Security headers** (CSP, X-Frame-Options, etc.)
6. **Regular dependency updates**

---

## Scaling Strategies

### Horizontal Scaling

**API Service**:
- Stateless design allows easy scaling
- Add more container instances
- Load balancer distributes traffic

**AI Service**:
- Model loaded per instance
- Batch processing for efficiency
- GPU instances for heavy workloads

### Vertical Scaling

- Increase CPU/memory per container
- Upgrade database instance
- Larger Redis instance

### Database Scaling

1. **Read Replicas**: For read-heavy workloads
2. **Connection Pooling**: Efficient connection use
3. **Query Optimization**: Proper indexing
4. **Caching**: Reduce database load

### Caching Strategy

- Cache frequently accessed data
- Appropriate TTL values
- Cache invalidation on updates
- Multi-level caching (browser, CDN, application, database)

---

## Troubleshooting

### Common Issues

#### Container Won't Start

```bash
# Check logs
docker-compose logs service-name

# Check if port is already in use
lsof -i :3000

# Rebuild container
docker-compose build --no-cache service-name
```

#### Database Connection Failed

```bash
# Check if database is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Test connection
docker-compose exec postgres psql -U user -d microcredentials
```

#### High Memory Usage

```bash
# Check container stats
docker stats

# Check for memory leaks
docker-compose exec api npm run memory-profile
```

#### Slow API Response

```bash
# Check API logs
docker-compose logs api

# Check database query performance
docker-compose exec api npm run db:studio

# Enable query logging
DATABASE_LOGGING=true docker-compose up
```

### Debug Mode

```bash
# Start with debug logging
LOG_LEVEL=debug docker-compose up

# Attach to running container
docker-compose exec api sh

# Run specific command
docker-compose exec api npm run debug-script
```

---

## Maintenance Tasks

### Regular Maintenance

**Daily**:
- Monitor error logs
- Check disk space
- Verify backups completed

**Weekly**:
- Review performance metrics
- Check for dependency updates
- Analyze slow queries

**Monthly**:
- Update base images
- Review and rotate secrets
- Test disaster recovery
- Performance optimization

**Quarterly**:
- Security audit
- Dependency major version updates
- Infrastructure review
- Cost optimization

---

## Performance Tuning

### API Optimization

```typescript
// Enable compression
app.use(compression());

// Optimize database queries
// Use select to limit fields
prisma.credential.findMany({
  select: { id: true, title: true }
});

// Use pagination
const page = 1;
const limit = 20;
const skip = (page - 1) * limit;
const credentials = await prisma.credential.findMany({
  skip,
  take: limit
});
```

### Database Optimization

```sql
-- Add index for frequently queried fields
CREATE INDEX idx_credentials_status ON micro_credentials(status);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM micro_credentials WHERE status = 'PUBLISHED';

-- Vacuum database
VACUUM ANALYZE;
```

### Caching Implementation

```typescript
// Cache frequently accessed data
const cacheKey = `credential:${id}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const credential = await prisma.credential.findUnique({ where: { id } });
await redis.setex(cacheKey, 3600, JSON.stringify(credential));

return credential;
```

---

## References

- [System Architecture](../architecture/system-design.md)
- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [NGINX Documentation](https://nginx.org/en/docs/)

---

## Support

For deployment issues:
- GitHub Issues: https://github.com/adamsalah13/bccb/issues
- Documentation: https://docs.bccb.example.com
- Email: devops@bccb.example.com

---

**Last Updated**: January 2024  
**Version**: 1.0  
**Maintainers**: BCCB DevOps Team
