# Development Setup Guide

Complete guide for setting up your local development environment for the BCCB platform.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [IDE Configuration](#ide-configuration)
- [Development Tools](#development-tools)
- [Running in Development Mode](#running-in-development-mode)
- [Hot Reloading](#hot-reloading)
- [Debugging](#debugging)
- [Development Workflow](#development-workflow)
- [Common Tasks](#common-tasks)

## Prerequisites

Before starting development, complete the [Installation Guide](../getting-started/installation.md).

**Required Software:**
- Node.js 20+
- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Git
- Docker (optional but recommended)

## Initial Setup

### 1. Fork and Clone Repository

```bash
# Fork repository on GitHub first
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/bccb.git
cd bccb

# Add upstream remote
git remote add upstream https://github.com/adamsalah13/bccb.git

# Verify remotes
git remote -v
```

### 2. Install Dependencies

```bash
# Install Node.js dependencies (root and all workspaces)
npm install

# Install Python dependencies for AI service
cd apps/ai-service
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ../..
```

### 3. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings
nano .env  # or use your preferred editor
```

**Key Development Settings:**
```bash
NODE_ENV=development
LOG_LEVEL=debug
ENABLE_AI_RECOMMENDATIONS=true
ENABLE_NLP_ANALYSIS=true
```

### 4. Setup Database

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed with development data
npm run db:seed
```

### 5. Verify Setup

```bash
# Run tests
npm test

# Run type checking
npm run typecheck

# Run linter
npm run lint
```

## IDE Configuration

### Visual Studio Code (Recommended)

#### Install Extensions

Essential extensions for development:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "prisma.prisma",
    "ms-python.python",
    "bradlc.vscode-tailwindcss",
    "github.copilot",
    "eamodio.gitlens",
    "orta.vscode-jest",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

#### Settings Configuration

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "eslint.workingDirectories": [
    "apps/api",
    "apps/web",
    "packages/shared"
  ],
  "files.exclude": {
    "**/.git": true,
    "**/.DS_Store": true,
    "**/node_modules": true,
    "**/__pycache__": true,
    "**/*.pyc": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.next": true,
    "**/build": true
  },
  "python.defaultInterpreterPath": "apps/ai-service/venv/bin/python",
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": true,
  "python.formatting.provider": "black",
  "[prisma]": {
    "editor.defaultFormatter": "Prisma.prisma"
  }
}
```

#### Debug Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug API Server",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev:api"],
      "skipFiles": ["<node_internals>/**"],
      "outputCapture": "std",
      "cwd": "${workspaceFolder}"
    },
    {
      "type": "chrome",
      "request": "launch",
      "name": "Debug Web App",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/apps/web/src"
    },
    {
      "type": "python",
      "request": "launch",
      "name": "Debug AI Service",
      "program": "${workspaceFolder}/apps/ai-service/main.py",
      "console": "integratedTerminal",
      "cwd": "${workspaceFolder}/apps/ai-service",
      "env": {
        "PYTHONPATH": "${workspaceFolder}/apps/ai-service"
      }
    }
  ]
}
```

#### Tasks Configuration

Create `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start API",
      "type": "npm",
      "script": "dev:api",
      "problemMatcher": ["$tsc"],
      "isBackground": true
    },
    {
      "label": "Start Web",
      "type": "npm",
      "script": "dev:web",
      "problemMatcher": ["$tsc"],
      "isBackground": true
    },
    {
      "label": "Run Tests",
      "type": "npm",
      "script": "test",
      "problemMatcher": ["$tsc"]
    },
    {
      "label": "Type Check",
      "type": "npm",
      "script": "typecheck",
      "problemMatcher": ["$tsc"]
    }
  ]
}
```

### JetBrains WebStorm/IntelliJ

#### Configuration

1. **Enable TypeScript service**
   - Preferences → Languages & Frameworks → TypeScript
   - Select TypeScript version: `node_modules/typescript/lib`
   - Enable TypeScript Language Service

2. **Configure Prettier**
   - Preferences → Languages & Frameworks → JavaScript → Prettier
   - Prettier package: `node_modules/prettier`
   - Run on save: ✓

3. **Configure ESLint**
   - Preferences → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint
   - Automatic ESLint configuration
   - Run eslint --fix on save: ✓

4. **Configure Prisma**
   - Install Prisma plugin from JetBrains Marketplace

### Other IDEs

For other editors (Vim, Emacs, Sublime, etc.):
- Install TypeScript language server
- Configure Prettier for formatting
- Configure ESLint for linting
- Set up Prisma syntax highlighting

## Development Tools

### Code Quality Tools

#### ESLint
```bash
# Run linter
npm run lint

# Auto-fix issues
npm run lint -- --fix

# Lint specific files
npx eslint apps/api/src/**/*.ts
```

#### Prettier
```bash
# Format all files
npm run format

# Check formatting
npm run format -- --check

# Format specific files
npx prettier --write "apps/api/src/**/*.ts"
```

#### TypeScript
```bash
# Type check all workspaces
npm run typecheck

# Type check specific workspace
npm run typecheck --workspace=apps/api

# Watch mode
npx tsc --noEmit --watch
```

### Database Tools

#### Prisma Studio
```bash
# Open database GUI
npm run db:studio

# Access at http://localhost:5555
```

#### Database CLI
```bash
# Connect to database
psql -U bccb_user -d microcredentials

# Common commands:
\dt              # List tables
\d table_name    # Describe table
\x               # Toggle expanded display
```

### Redis Tools

```bash
# Connect to Redis CLI
redis-cli

# Common commands:
KEYS *           # List all keys
GET key          # Get value
FLUSHDB          # Clear database (use with caution!)
```

### Git Tools

```bash
# View status with details
git status -sb

# Interactive staging
git add -p

# Commit with GPG signature
git commit -S -m "feat: add feature"

# View formatted log
git log --oneline --graph --decorate --all
```

## Running in Development Mode

### Start All Services

```bash
# Start API and Web concurrently
npm run dev

# Or start individually (separate terminals):
npm run dev:api     # Terminal 1
npm run dev:web     # Terminal 2

# AI service (separate terminal)
cd apps/ai-service
source venv/bin/activate
python -m uvicorn main:app --reload --port 8000
```

### Service URLs

- **Web Frontend**: http://localhost:5173
- **API Backend**: http://localhost:3000
- **API Health**: http://localhost:3000/health
- **AI Service**: http://localhost:8000
- **AI Docs**: http://localhost:8000/docs
- **Prisma Studio**: http://localhost:5555 (when running)

### Using Docker Compose

```bash
# Start with auto-reload
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f api

# Rebuild and start
docker-compose up --build
```

## Hot Reloading

### Frontend (Vite)

Hot Module Replacement (HMR) is enabled by default:
- Changes to React components update instantly
- State is preserved when possible
- Fast refresh for optimal DX

**Configuration**: `apps/web/vite.config.ts`

### Backend API (Nodemon)

API server automatically restarts on file changes:
- TypeScript files are watched
- Server restarts on save
- Database connections are re-established

**Configuration**: `apps/api/nodemon.json` (if exists) or package.json

### AI Service (Uvicorn)

Python service reloads automatically:
```bash
# --reload flag enables hot reloading
python -m uvicorn main:app --reload --port 8000
```

### Database Migrations

Migrations require manual re-run:
```bash
# After changing schema.prisma
npm run db:generate  # Regenerate Prisma client
npm run db:migrate   # Run migrations
```

## Debugging

### API Debugging

#### Using VS Code Debugger
1. Set breakpoints in code
2. Press F5 or click "Debug API Server"
3. Attach debugger to running process

#### Using Chrome DevTools
```bash
# Start API with inspector
node --inspect apps/api/src/server.ts

# Open chrome://inspect in Chrome
# Click "inspect" on your process
```

#### Console Debugging
```typescript
// Use debug logging
import { logger } from './utils/logger';

logger.debug('Debug message', { data });
logger.info('Info message');
logger.error('Error message', error);

// Temporary console.log (remove before commit)
console.log('Debug:', variable);
```

### Frontend Debugging

#### React DevTools
```bash
# Install React DevTools browser extension
# https://react-devtools.com/

# Then inspect components in browser DevTools
```

#### Redux DevTools
```bash
# Install Redux DevTools extension
# https://github.com/reduxjs/redux-devtools

# View state, actions, and time-travel debug
```

#### Browser DevTools
- **Console**: View logs and errors
- **Network**: Inspect API calls
- **Sources**: Set breakpoints in source maps
- **Performance**: Profile render performance

### Python Debugging

#### Using pdb
```python
# Add breakpoint in code
import pdb; pdb.set_trace()

# Or use breakpoint() (Python 3.7+)
breakpoint()

# Debug commands:
# n - next line
# s - step into
# c - continue
# p variable - print variable
# q - quit
```

#### Using VS Code Debugger
1. Set breakpoints in Python files
2. Press F5 or click "Debug AI Service"
3. Step through code

### Database Query Debugging

```bash
# Enable query logging in Prisma
# Add to schema.prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["tracing"]
}

# Set in .env
DEBUG=prisma:query

# Run application
npm run dev:api
```

## Development Workflow

### Daily Workflow

```bash
# 1. Update your local repository
git checkout main
git pull upstream main

# 2. Create feature branch
git checkout -b feature/my-feature

# 3. Make changes
# Edit files...

# 4. Run tests frequently
npm test

# 5. Commit changes
git add .
git commit -m "feat: add my feature"

# 6. Push to your fork
git push origin feature/my-feature

# 7. Create Pull Request on GitHub
```

### Before Committing

```bash
# 1. Run all checks
npm run lint
npm run typecheck
npm test

# 2. Format code
npm run format

# 3. Check build
npm run build

# 4. Review changes
git diff

# 5. Stage and commit
git add .
git commit -m "feat: descriptive message"
```

### Keeping Branch Updated

```bash
# Fetch upstream changes
git fetch upstream

# Rebase your branch
git rebase upstream/main

# If conflicts, resolve and continue
git rebase --continue

# Force push to your fork (if already pushed)
git push origin feature/my-feature --force-with-lease
```

## Common Tasks

### Add a New API Endpoint

1. **Define route** in `apps/api/src/routes/`
2. **Create controller** in `apps/api/src/controllers/`
3. **Add validation** in `apps/api/src/middleware/`
4. **Write tests** in `apps/api/tests/`
5. **Update API docs**

### Add a New Database Model

1. **Edit schema** in `database/schema/schema.prisma`
2. **Create migration**: `npm run db:migrate:create model_name`
3. **Run migration**: `npm run db:migrate`
4. **Update seed** data if needed
5. **Write tests**

### Add a New Frontend Page

1. **Create component** in `apps/web/src/pages/`
2. **Add route** in `apps/web/src/App.tsx`
3. **Create styles** using TailwindCSS
4. **Add tests** in `__tests__/`
5. **Update navigation**

### Add a New AI Feature

1. **Define model** in `apps/ai-service/models/`
2. **Create endpoint** in `apps/ai-service/routes/`
3. **Add training script** if needed
4. **Write tests**
5. **Update documentation**

### Update Dependencies

```bash
# Check outdated packages
npm outdated

# Update specific package
npm update package-name

# Update all packages (caution!)
npm update

# Update Python dependencies
cd apps/ai-service
pip list --outdated
pip install --upgrade package-name
pip freeze > requirements.txt
```

### Generate API Client Types

```bash
# If using OpenAPI/Swagger
npm run generate:api-types

# Prisma types are auto-generated
npm run db:generate
```

## Next Steps

- [Coding Standards](coding-standards.md) - Learn our code style
- [Testing Guide](testing-guide.md) - Write comprehensive tests
- [Git Workflow](git-workflow.md) - Follow our Git conventions
- [Contributing Guide](../../CONTRIBUTING.md) - Submit changes

---

**Happy Coding!** 🚀 If you encounter issues, check the [Troubleshooting Guide](../getting-started/troubleshooting.md).
