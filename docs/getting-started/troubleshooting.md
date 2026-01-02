# Troubleshooting Guide

This guide helps you diagnose and resolve common issues with the BCCB platform.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Database Issues](#database-issues)
- [Service Connection Issues](#service-connection-issues)
- [Authentication Issues](#authentication-issues)
- [API Issues](#api-issues)
- [Docker Issues](#docker-issues)
- [Build and Compilation Issues](#build-and-compilation-issues)
- [Performance Issues](#performance-issues)
- [AI Service Issues](#ai-service-issues)
- [Getting Help](#getting-help)

## Installation Issues

### Node.js Version Mismatch

**Problem**: Error about Node.js version when running `npm install`

```
error: The engine "node" is incompatible with this module
```

**Solution**:
```bash
# Check your Node.js version
node --version

# Should be v20.0.0 or higher
# Install correct version using nvm
nvm install 20
nvm use 20

# Verify version
node --version

# Clean and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Python Version Issues

**Problem**: Python 3.11+ not found

**Solution**:
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install python3.11 python3.11-venv python3-pip

# macOS
brew install python@3.11

# Verify
python3.11 --version

# Create alias (optional)
echo 'alias python3="python3.11"' >> ~/.bashrc
source ~/.bashrc
```

### npm Permission Errors

**Problem**: EACCES permission errors during npm install

**Solution**:
```bash
# NEVER use sudo with npm!
# Instead, configure npm to use a different directory

# Create a directory for global packages
mkdir ~/.npm-global

# Configure npm
npm config set prefix '~/.npm-global'

# Add to PATH
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Fix existing permissions
sudo chown -R $USER:$USER ~/.npm
sudo chown -R $USER:$USER node_modules
```

### Package Installation Failures

**Problem**: npm install fails with package errors

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and lock file
rm -rf node_modules package-lock.json

# Reinstall
npm install

# If still failing, try with legacy peer deps
npm install --legacy-peer-deps
```

## Database Issues

### PostgreSQL Connection Failed

**Problem**: Cannot connect to database

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution**:
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list                 # macOS

# Start PostgreSQL
sudo systemctl start postgresql  # Linux
brew services start postgresql@15 # macOS

# Test connection
psql -U postgres -h localhost

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log  # Linux
tail -f /usr/local/var/log/postgres.log                  # macOS
```

### Database Does Not Exist

**Problem**: Database "microcredentials" does not exist

**Solution**:
```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database
CREATE DATABASE microcredentials;
CREATE USER bccb_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE microcredentials TO bccb_user;
ALTER DATABASE microcredentials OWNER TO bccb_user;
\q

# Update DATABASE_URL in .env
# DATABASE_URL=postgresql://bccb_user:your_password@localhost:5432/microcredentials
```

### Migration Errors

**Problem**: Migration fails or database schema out of sync

**Solution**:
```bash
# Option 1: Reset database (WARNING: deletes all data)
npm run db:reset

# Option 2: Fix migrations manually
npm run db:generate
npm run db:migrate

# Option 3: Deploy specific migration
npx prisma migrate deploy --schema=database/schema/schema.prisma

# Check migration status
npx prisma migrate status --schema=database/schema/schema.prisma
```

### Prisma Client Out of Sync

**Problem**: "Prisma Client is out of sync" error

**Solution**:
```bash
# Regenerate Prisma Client
npm run db:generate

# If that doesn't work, clean and regenerate
rm -rf node_modules/.prisma
npm run db:generate
```

### Database Connection Pool Exhausted

**Problem**: Too many database connections

**Solution**:
```bash
# Check active connections
psql -U bccb_user -d microcredentials -c "SELECT count(*) FROM pg_stat_activity;"

# Kill idle connections
psql -U bccb_user -d microcredentials -c "
  SELECT pg_terminate_backend(pid) 
  FROM pg_stat_activity 
  WHERE datname = 'microcredentials' 
  AND pid <> pg_backend_pid() 
  AND state = 'idle';
"

# Increase connection limit in PostgreSQL
# Edit /etc/postgresql/15/main/postgresql.conf
# max_connections = 200

# Restart PostgreSQL
sudo systemctl restart postgresql
```

## Service Connection Issues

### Redis Connection Failed

**Problem**: Cannot connect to Redis

```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solution**:
```bash
# Check if Redis is running
redis-cli ping  # Should return "PONG"

# Start Redis
sudo systemctl start redis-server  # Linux
brew services start redis           # macOS

# Or use Docker
docker run -d -p 6379:6379 redis:7-alpine

# Test connection
redis-cli
> ping
PONG
> exit
```

### Port Already in Use

**Problem**: Port 3000, 5173, or 8000 already in use

**Solution**:
```bash
# Find process using the port
lsof -ti:3000  # Replace 3000 with your port

# Kill the process
lsof -ti:3000 | xargs kill -9

# Or change port in .env
PORT=3001

# For web (Vite), edit apps/web/vite.config.ts
server: {
  port: 5174
}
```

### AI Service Not Responding

**Problem**: AI service at http://localhost:8000 not accessible

**Solution**:
```bash
# Check if AI service is running
curl http://localhost:8000/health

# Check Python virtual environment
cd apps/ai-service
source venv/bin/activate
python -m uvicorn main:app --reload --port 8000

# Check dependencies
pip list

# Reinstall dependencies if needed
pip install -r requirements.txt

# Check logs
tail -f logs/ai-service.log
```

## Authentication Issues

### JWT Token Expired

**Problem**: 401 Unauthorized - Token expired

**Solution**:
```bash
# Refresh token
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"YOUR_REFRESH_TOKEN"}'

# Or login again
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@bcit.ca",
    "password": "admin123"
  }'
```

### Invalid JWT Secret

**Problem**: JWT signature verification failed

**Solution**:
```bash
# Generate a new JWT secret
openssl rand -base64 32

# Update .env file
JWT_SECRET=your_new_secret_here_min_32_characters

# Restart API server
npm run dev:api
```

### Login Fails with Correct Credentials

**Problem**: Login returns 401 even with correct password

**Solution**:
```bash
# Reset user password in database
psql -U bccb_user -d microcredentials

# Check if user exists
SELECT id, email, role FROM users WHERE email = 'admin@bcit.ca';

# If user doesn't exist, reseed database
npm run db:seed

# Or create user manually via API
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newadmin@bcit.ca",
    "password": "newpassword123",
    "firstName": "Admin",
    "lastName": "User",
    "institutionId": "YOUR_INSTITUTION_ID"
  }'
```

## API Issues

### CORS Errors

**Problem**: CORS policy blocking requests from web app

**Solution**:
```bash
# Update .env to allow your origin
CORS_ORIGIN=http://localhost:5173

# For multiple origins (use in development only)
CORS_ORIGIN=http://localhost:5173,http://localhost:3001

# Check apps/api/src/server.ts for CORS configuration
# Restart API server
npm run dev:api
```

### Rate Limit Exceeded

**Problem**: 429 Too Many Requests error

**Solution**:
```bash
# Increase rate limit in .env
RATE_LIMIT_WINDOW_MS=900000    # 15 minutes
RATE_LIMIT_MAX_REQUESTS=1000   # Increase from 100

# Or temporarily disable rate limiting (development only)
# Comment out rate limiting middleware in apps/api/src/server.ts

# Clear Redis cache
redis-cli FLUSHDB

# Restart API
npm run dev:api
```

### 404 Not Found

**Problem**: API endpoint returns 404

**Solution**:
```bash
# Check API is running
curl http://localhost:3000/health

# Check endpoint path (should include /api/v1)
# Correct: http://localhost:3000/api/v1/credentials
# Wrong: http://localhost:3000/credentials

# Check API logs for routing issues
npm run dev:api

# View all routes
curl http://localhost:3000/api/v1/
```

### Request Timeout

**Problem**: API request takes too long and times out

**Solution**:
```bash
# Check database connection pool
# Increase timeout in .env (milliseconds)
DATABASE_TIMEOUT=30000

# Check slow queries
psql -U bccb_user -d microcredentials

# Enable query logging
\set VERBOSITY verbose
\timing on

# Identify slow queries
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

# Add database indexes if needed
# Check database/schema/schema.prisma for index definitions
```

## Docker Issues

### Docker Compose Build Fails

**Problem**: docker-compose build command fails

**Solution**:
```bash
# Check Docker is running
docker info

# Remove old images
docker-compose down
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache

# Check Dockerfile syntax
docker-compose config
```

### Container Keeps Restarting

**Problem**: Container exits immediately after starting

**Solution**:
```bash
# Check container logs
docker-compose logs api

# Check specific container
docker logs bccb-api

# Run container interactively
docker-compose run api sh

# Check environment variables
docker-compose exec api env

# Verify .env file is present
docker-compose exec api cat .env
```

### Cannot Connect to Services in Docker

**Problem**: Services can't communicate within Docker network

**Solution**:
```bash
# Check network
docker network ls
docker network inspect bccb-network

# Use service names, not localhost
# Correct: DATABASE_URL=postgresql://user:password@postgres:5432/microcredentials
# Wrong: DATABASE_URL=postgresql://user:password@localhost:5432/microcredentials

# Restart services
docker-compose down
docker-compose up -d

# Check service health
docker-compose ps
```

### Volume Permission Issues

**Problem**: Permission denied errors with Docker volumes

**Solution**:
```bash
# Fix volume permissions
docker-compose down
sudo chown -R $USER:$USER .

# Remove volumes and recreate
docker-compose down -v
docker-compose up -d

# Check volume mounts
docker-compose exec api ls -la /app
```

## Build and Compilation Issues

### TypeScript Compilation Errors

**Problem**: TypeScript errors preventing build

**Solution**:
```bash
# Check TypeScript configuration
cat tsconfig.json

# Run type check
npm run typecheck

# Fix common issues
# 1. Missing type declarations
npm install --save-dev @types/node @types/express

# 2. Strict mode errors
# Temporarily disable in tsconfig.json (not recommended)
{
  "compilerOptions": {
    "strict": false
  }
}

# 3. Module resolution issues
# Ensure proper path aliases in tsconfig.json
```

### ESLint Errors

**Problem**: ESLint throwing errors

**Solution**:
```bash
# Run ESLint
npm run lint

# Auto-fix issues
npm run lint -- --fix

# Check ESLint config
cat .eslintrc.json

# Disable specific rules (if needed)
# Add to .eslintrc.json
{
  "rules": {
    "no-console": "off"
  }
}
```

### Build Fails with Out of Memory

**Problem**: JavaScript heap out of memory during build

**Solution**:
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Or add to package.json scripts
{
  "scripts": {
    "build": "NODE_OPTIONS=--max-old-space-size=4096 vite build"
  }
}

# Clear cache and rebuild
rm -rf node_modules/.cache
npm run build
```

## Performance Issues

### Slow API Response Times

**Problem**: API endpoints responding slowly

**Solution**:
```bash
# Enable query logging to identify slow queries
# In .env
LOG_LEVEL=debug

# Check database indexes
npm run db:studio
# Navigate to database and check indexes

# Add Redis caching for frequently accessed data
# Check apps/api/src/utils/cache.ts

# Monitor database performance
psql -U bccb_user -d microcredentials

# Check slow queries
SELECT * FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

### High Memory Usage

**Problem**: Application consuming too much memory

**Solution**:
```bash
# Monitor memory usage
# Node.js
node --trace-gc apps/api/src/server.ts

# Docker
docker stats

# Check for memory leaks
npm install -g clinic
clinic doctor -- node apps/api/src/server.ts

# Adjust memory limits
# In docker-compose.yml
services:
  api:
    deploy:
      resources:
        limits:
          memory: 2G
```

### Database Growing Too Large

**Problem**: Database size increasing rapidly

**Solution**:
```bash
# Check database size
psql -U bccb_user -d microcredentials

SELECT 
  pg_size_pretty(pg_database_size('microcredentials')) as size;

# Check table sizes
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

# Vacuum database
VACUUM ANALYZE;

# Set up automatic cleanup for old audit logs
# Add to database cleanup job
DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '90 days';
```

## AI Service Issues

### Model Loading Failures

**Problem**: AI models fail to load

**Solution**:
```bash
# Check if models exist
cd apps/ai-service
ls -la ml-models/trained/

# Download pre-trained models
python scripts/download_models.py

# Check Hugging Face token
echo $HUGGINGFACE_TOKEN

# Set token in .env
HUGGINGFACE_TOKEN=your_token_here

# Reinstall transformers
pip install --upgrade transformers torch
```

### Out of Memory in AI Service

**Problem**: AI service crashes with OOM

**Solution**:
```bash
# Reduce batch size in AI service config
# Edit apps/ai-service/config.py
BATCH_SIZE = 8  # Reduce from 32

# Use smaller models
# Edit apps/ai-service/main.py
model_name = "sentence-transformers/all-MiniLM-L6-v2"  # Smaller model

# Increase container memory (Docker)
# In docker-compose.yml
ai-service:
  deploy:
    resources:
      limits:
        memory: 4G
```

### Slow AI Predictions

**Problem**: AI recommendations taking too long

**Solution**:
```bash
# Enable GPU acceleration (if available)
# Install CUDA and GPU-enabled PyTorch
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# Cache embeddings in Redis
# Check apps/ai-service/utils/cache.py

# Use quantized models
# Edit model loading code to use quantization
model = AutoModel.from_pretrained(
    model_name,
    load_in_8bit=True
)
```

## Getting Help

### Diagnostic Information

When reporting issues, include:

```bash
# System information
uname -a  # OS
node --version
npm --version
python3 --version
psql --version
redis-cli --version
docker --version

# Application logs
npm run dev:api 2>&1 | tee api.log
docker-compose logs > docker.log

# Environment (sanitized)
cat .env | grep -v SECRET | grep -v PASSWORD
```

### Enable Debug Mode

```bash
# Set in .env
NODE_ENV=development
LOG_LEVEL=debug
DEBUG=*

# Run with debug output
DEBUG=* npm run dev:api
```

### Check Service Health

```bash
# API health
curl http://localhost:3000/health | jq

# AI service health
curl http://localhost:8000/health | jq

# Database connection
psql -U bccb_user -d microcredentials -c "SELECT 1"

# Redis connection
redis-cli ping
```

### Common Log Locations

```
Local Development:
- API logs: Console output (npm run dev:api)
- AI service: apps/ai-service/logs/
- PostgreSQL: /var/log/postgresql/
- Redis: /var/log/redis/

Docker:
- View logs: docker-compose logs -f
- API: docker logs bccb-api
- Database: docker logs bccb-postgres
```

### Reset Everything

If all else fails, complete reset:

```bash
# Local installation
npm run db:reset
rm -rf node_modules package-lock.json
npm install
npm run dev

# Docker installation
docker-compose down -v
docker system prune -a
docker-compose up -d --build
docker-compose exec api npm run db:migrate
docker-compose exec api npm run db:seed
```

## Resources

- [Installation Guide](installation.md)
- [Quick Start Guide](quick-start.md)
- [GitHub Issues](https://github.com/adamsalah13/bccb/issues)
- [Contributing Guide](../../CONTRIBUTING.md)

## Still Need Help?

If your issue isn't covered here:

1. **Search existing issues**: https://github.com/adamsalah13/bccb/issues
2. **Open a new issue**: Include diagnostic information above
3. **Check discussions**: Community help and Q&A
4. **Contact maintainers**: For urgent issues

---

**Remember**: Include logs, error messages, and steps to reproduce when asking for help!
