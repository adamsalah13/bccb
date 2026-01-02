# Installation Guide

This comprehensive guide walks you through installing and setting up the BCCB Micro-Credentials Platform on your local machine or server.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation Methods](#installation-methods)
- [Local Installation](#local-installation)
- [Docker Installation](#docker-installation)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Verification](#verification)
- [Next Steps](#next-steps)

## Prerequisites

### System Requirements

**Minimum Requirements:**
- CPU: 2 cores
- RAM: 4GB
- Disk: 10GB free space
- OS: Linux, macOS, or Windows 10+

**Recommended Requirements:**
- CPU: 4+ cores
- RAM: 8GB+
- Disk: 20GB+ SSD
- OS: Ubuntu 22.04 LTS, macOS 13+, or Windows 11

### Required Software

#### Node.js (v20.x or higher)
```bash
# Check if Node.js is installed
node --version  # Should be v20.0.0 or higher
npm --version   # Should be v10.0.0 or higher

# Install Node.js using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

#### Python (v3.11 or higher)
```bash
# Check if Python is installed
python3 --version  # Should be 3.11.0 or higher

# Install Python 3.11 on Ubuntu
sudo apt update
sudo apt install python3.11 python3.11-venv python3-pip

# Install Python 3.11 on macOS
brew install python@3.11

# Verify pip
pip3 --version
```

#### PostgreSQL (v15 or higher)
```bash
# Check if PostgreSQL is installed
psql --version  # Should be 15.0 or higher

# Install PostgreSQL on Ubuntu
sudo apt install postgresql-15 postgresql-contrib-15

# Install PostgreSQL on macOS
brew install postgresql@15

# Start PostgreSQL service
# Ubuntu
sudo systemctl start postgresql
sudo systemctl enable postgresql

# macOS
brew services start postgresql@15
```

#### Redis (v7 or higher)
```bash
# Check if Redis is installed
redis-cli --version  # Should be 7.0.0 or higher

# Install Redis on Ubuntu
sudo apt install redis-server

# Install Redis on macOS
brew install redis

# Start Redis service
# Ubuntu
sudo systemctl start redis-server
sudo systemctl enable redis-server

# macOS
brew services start redis
```

#### Git
```bash
# Check if Git is installed
git --version

# Install Git on Ubuntu
sudo apt install git

# Install Git on macOS
brew install git
```

#### Docker (Optional but Recommended)
```bash
# Check if Docker is installed
docker --version
docker-compose --version

# Install Docker Desktop
# Visit: https://docs.docker.com/get-docker/

# Or install Docker Engine on Ubuntu
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin
```

## Installation Methods

You can install BCCB using one of two methods:

1. **Local Installation** - Install all dependencies directly on your machine (recommended for development)
2. **Docker Installation** - Use Docker containers (recommended for production and quick setup)

## Local Installation

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/adamsalah13/bccb.git
cd bccb

# Or clone via SSH
git clone git@github.com:adamsalah13/bccb.git
cd bccb
```

### Step 2: Install Dependencies

```bash
# Install Node.js dependencies
npm install

# This will install dependencies for all workspaces:
# - apps/api
# - apps/web
# - packages/shared
```

💡 **Tip**: If you encounter permission errors, never use `sudo npm install`. Instead, configure npm to use a different directory:
```bash
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### Step 3: Setup Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your configuration
nano .env  # or use your preferred editor
```

See [Environment Configuration](#environment-configuration) for detailed configuration options.

### Step 4: Setup PostgreSQL Database

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE microcredentials;
CREATE USER bccb_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE microcredentials TO bccb_user;
ALTER DATABASE microcredentials OWNER TO bccb_user;
\q

# Update DATABASE_URL in .env
# DATABASE_URL=postgresql://bccb_user:your_secure_password@localhost:5432/microcredentials
```

### Step 5: Run Database Migrations

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed the database with initial data
npm run db:seed
```

### Step 6: Install Python Dependencies (AI Service)

```bash
# Navigate to AI service directory
cd apps/ai-service

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On Linux/macOS:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Return to project root
cd ../..
```

### Step 7: Start Development Servers

```bash
# Start all services concurrently
npm run dev

# Or start services individually:
# Terminal 1 - API Server
npm run dev:api

# Terminal 2 - Web Frontend
npm run dev:web

# Terminal 3 - AI Service
cd apps/ai-service
source venv/bin/activate
python -m uvicorn main:app --reload --port 8000
```

### Step 8: Verify Installation

Visit these URLs to verify everything is running:
- **Web Frontend**: http://localhost:5173
- **API Backend**: http://localhost:3000/health
- **AI Service**: http://localhost:8000/health

## Docker Installation

Docker provides the fastest way to get started with BCCB.

### Step 1: Clone the Repository

```bash
git clone https://github.com/adamsalah13/bccb.git
cd bccb
```

### Step 2: Configure Environment

```bash
# Copy environment file
cp .env.example .env

# The default Docker configuration should work out of the box
# Optionally edit .env for custom configuration
```

### Step 3: Build and Start Services

```bash
# Build Docker images
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### Step 4: Run Database Migrations

```bash
# Run migrations inside the API container
docker-compose exec api npm run db:migrate

# Seed the database
docker-compose exec api npm run db:seed
```

### Step 5: Verify Installation

```bash
# Check service status
docker-compose ps

# All services should be "Up" and healthy
```

Visit:
- **Web Frontend**: http://localhost:5173
- **API Backend**: http://localhost:3000/health
- **AI Service**: http://localhost:8000/health

### Docker Management Commands

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (deletes data)
docker-compose down -v

# View logs for a specific service
docker-compose logs -f api

# Restart a service
docker-compose restart api

# Execute command in container
docker-compose exec api npm run typecheck

# View resource usage
docker stats
```

## Environment Configuration

### Required Environment Variables

Edit your `.env` file with these essential configurations:

```bash
# Application
NODE_ENV=development           # development | production | test
PORT=3000                      # API server port
API_URL=http://localhost:3000  # API URL for web app

# Database
DATABASE_URL=postgresql://bccb_user:password@localhost:5432/microcredentials
REDIS_URL=redis://localhost:6379

# AI/ML Services
AI_SERVICE_URL=http://localhost:8000
OPENAI_API_KEY=your_openai_key_here       # Optional: for advanced AI features
HUGGINGFACE_TOKEN=your_hf_token_here      # Optional: for model downloads

# Authentication
JWT_SECRET=your_jwt_secret_min_32_chars   # IMPORTANT: Change this!
JWT_EXPIRES_IN=7d                         # Token expiration

# AWS Services (Optional - for production)
AWS_REGION=us-west-2
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
S3_BUCKET=bccb-uploads

# Feature Flags
ENABLE_AI_RECOMMENDATIONS=true
ENABLE_NLP_ANALYSIS=true
ENABLE_AUTO_PATHWAYS=true

# Logging
LOG_LEVEL=info                # debug | info | warn | error

# CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000   # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

### Security Best Practices

⚠️ **Important Security Notes:**

1. **JWT_SECRET**: Generate a strong random secret:
   ```bash
   # Generate a secure JWT secret
   openssl rand -base64 32
   ```

2. **Database Credentials**: Use strong passwords:
   ```bash
   # Generate a secure password
   openssl rand -base64 24
   ```

3. **Production Settings**: Never commit `.env` files or secrets to version control.

4. **Environment-Specific Files**:
   - `.env.development` - Development settings
   - `.env.production` - Production settings (never commit!)
   - `.env.test` - Test settings

## Database Setup

### Initial Setup

```bash
# Generate Prisma client
npm run db:generate

# Create migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

### Database Management Commands

```bash
# View database in Prisma Studio (GUI)
npm run db:studio

# Create a new migration
npm run db:migrate:create add_new_field

# Reset database (WARNING: deletes all data)
npm run db:reset

# Deploy migrations to production
npm run db:migrate:deploy
```

### Database Connection Issues

If you encounter connection issues:

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list                 # macOS

# Test connection
psql -U bccb_user -d microcredentials -h localhost

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log  # Linux
tail -f /usr/local/var/log/postgres.log                  # macOS
```

### Sample Data

The seed script creates:
- 3 institutions (BCIT, UBC, SFU)
- 5 micro-credentials
- 10 learning outcomes
- 3 pathways
- 2 recognitions
- 2 test users

**Default Test User:**
```
Email: admin@bcit.ca
Password: admin123
Role: ADMIN
```

## Verification

### Health Checks

```bash
# Check API health
curl http://localhost:3000/health

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

# Check AI service health
curl http://localhost:8000/health
```

### Run Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run with coverage
npm run test:coverage
```

### Check Code Quality

```bash
# Run linter
npm run lint

# Run type checker
npm run typecheck

# Format code
npm run format
```

## Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in .env
PORT=3001
```

**Database Connection Failed:**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Verify DATABASE_URL in .env is correct
```

**Redis Connection Failed:**
```bash
# Check Redis is running
redis-cli ping  # Should return "PONG"

# Start Redis
sudo systemctl start redis-server

# Or use Docker
docker run -d -p 6379:6379 redis:7-alpine
```

**Permission Denied Errors:**
```bash
# Fix Node.js permissions
sudo chown -R $USER:$USER ~/.npm
sudo chown -R $USER:$USER node_modules

# Fix PostgreSQL permissions
sudo chown -R postgres:postgres /var/lib/postgresql
```

See the [Troubleshooting Guide](troubleshooting.md) for more solutions.

## Next Steps

✅ Installation Complete! Now you can:

1. **Start Developing**: Check out the [Development Setup Guide](../development/development-setup.md)
2. **Quick Start**: Follow the [Quick Start Guide](quick-start.md) for a tutorial
3. **Explore the API**: Read the [API Documentation](../api/api-overview.md)
4. **Deploy**: Learn about [Deployment Options](../deployment/deployment-guide.md)

## Additional Resources

- [Quick Start Guide](quick-start.md)
- [Troubleshooting](troubleshooting.md)
- [Development Setup](../development/development-setup.md)
- [Docker Setup](../deployment/docker-setup.md)

---

**Need Help?** Open an issue on [GitHub](https://github.com/adamsalah13/bccb/issues) or check our [Troubleshooting Guide](troubleshooting.md).
