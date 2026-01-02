# AI-Native Micro-Credentials Platform (BCCB)

An intelligent system for managing micro-credentials, pathways, and recognition using AI-first design principles based on BC Council on Admissions and Transfer requirements.

## 🎯 Project Overview

This platform reimagines the micro-credentials management system with AI-native design patterns, replacing traditional form-based interfaces with intelligent, conversational experiences and visual diagram-based workflows.

## ✨ Key Features

- 🤖 **AI-Powered Pathway Recommendations** - Machine learning suggests optimal educational pathways
- 🎓 **Intelligent Credential Assessment** - Automated evaluation of micro-credential eligibility
- 🔄 **Recognition Validation Engine** - Real-time validation of institutional approval and credit status
- 📊 **Mermaid Diagram Visualization** - Complex relationships rendered as interactive diagrams
- 💬 **Conversational Interfaces** - Natural language data collection instead of traditional forms
- 🌐 **Multi-Institution Support** - Internal and external pathway management

## 🏗️ Architecture

This is a monorepo using modern web technologies:

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: Redux Toolkit
- **Data Fetching**: React Query
- **Visualization**: Mermaid.js

### Backend
- **Runtime**: Node.js + Express
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Cache**: Redis
- **Jobs**: Bull Queue

### AI/ML Layer
- **Language**: Python 3.11+
- **ML Framework**: scikit-learn, TensorFlow
- **NLP**: Hugging Face Transformers, spaCy
- **Vector DB**: For semantic search

## 📁 Repository Structure

```
bccb/
├── apps/
│   ├── web/          # React frontend application
│   └── api/          # Node.js backend API
├── packages/
│   ├── shared/       # Shared types and utilities
│   └── ai-engine/    # Python AI/ML services
├── database/
│   ├── migrations/   # Database migrations
│   ├── seeds/        # Seed data
│   └── schema/       # Prisma schema
├── docs/
│   ├── architecture/ # Architecture documentation
│   ├── api/          # API documentation
│   └── diagrams/     # Mermaid diagrams
├── infrastructure/
│   ├── docker/       # Docker configurations
│   ├── kubernetes/   # K8s manifests
│   └── terraform/    # Infrastructure as code
└── tests/
    ├── e2e/          # End-to-end tests
    ├── integration/  # Integration tests
    └── unit/         # Unit tests
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Docker (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/adamsalah13/bccb.git
cd bccb

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npm run db:migrate

# Seed the database
npm run db:seed

# Start development servers
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- API: http://localhost:3000
- AI Service: http://localhost:8000

## 📖 Documentation

- [System Architecture](docs/architecture/system-design.md)
- [AI/ML Architecture](docs/architecture/ai-architecture.md)
- [API Reference](docs/api/endpoints.md)
- [Data Models](docs/architecture/data-models.md)
- [Deployment Guide](docs/deployment/infrastructure.md)

## 🧩 Core Components

### Micro-Credential Management
- Program details and metadata
- Learning outcomes tracking
- Multi-campus support
- Status workflow (Draft → Published)

### Recognition Framework
- Institutional approval tracking
- Transcript recording methods
- Credit type classification
- Digital badge integration

### Pathways System
- Internal pathway mapping
- External institution partnerships
- AI-suggested pathway creation
- Transfer credit assessment

### AI/ML Features
- Pattern recognition for similar programs
- Semantic matching for pathway recommendations
- NLP analysis of program descriptions
- Continuous learning from user feedback

## 🛠️ Development

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Run with coverage
npm run test:coverage
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run typecheck
```

### Database Operations

```bash
# Create migration
npm run db:migrate:create <name>

# Run migrations
npm run db:migrate

# Reset database
npm run db:reset

# Open Prisma Studio
npm run db:studio
```

## 🤖 AI Model Training

```bash
# Train pathway recommendation model
npm run ai:train:pathways

# Train credit assessment model
npm run ai:train:credits

# Evaluate models
npm run ai:evaluate
```

## 🌍 Deployment

### Using Docker

```bash
# Build containers
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### Using Kubernetes

```bash
# Apply configurations
kubectl apply -f infrastructure/kubernetes/

# Check status
kubectl get pods
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- BC Council on Admissions and Transfer (BCCAT) for requirements
- BCIT for the Animal Cell Culture micro-credential case study
- Open source community for amazing tools and libraries

## 📧 Contact

For questions or support, please open an issue or contact the maintainers.

---

**Built with ❤️ using AI-native design principles**
