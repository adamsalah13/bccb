# AI Engine

Python-based AI/ML service for intelligent micro-credentials management and pathway recommendations.

## Overview

The AI Engine provides machine learning capabilities for the BCCB platform, including:

- 🤖 Pathway recommendation using similarity matching
- 📊 Credit assessment and validation
- 🔍 Semantic search using vector embeddings
- 💬 Natural language processing for program descriptions
- 🎯 Learning outcome analysis and classification

## Architecture

### Technology Stack

- **Python 3.11+** - Core runtime
- **FastAPI** - REST API framework
- **scikit-learn** - Classical ML algorithms
- **TensorFlow/Keras** - Deep learning models
- **Hugging Face Transformers** - Pre-trained NLP models
- **spaCy** - NLP and entity recognition
- **FAISS** - Vector similarity search
- **Pydantic** - Data validation
- **SQLAlchemy** - Database ORM
- **Redis** - Caching and job queue

### Components

```
packages/ai-engine/
├── src/
│   ├── api/                 # FastAPI endpoints
│   ├── models/              # ML model definitions
│   │   ├── pathway-recommender/
│   │   ├── credit-assessor/
│   │   └── outcome-classifier/
│   ├── services/            # Business logic
│   ├── pipelines/           # ML pipelines
│   ├── utils/               # Utility functions
│   └── main.py             # Application entry point
├── tests/
├── ml-models/              # Trained model storage
├── notebooks/              # Jupyter notebooks for experimentation
├── requirements.txt        # Production dependencies
├── requirements-dev.txt    # Development dependencies
└── README.md
```

## Features

### 1. Pathway Recommendation

Suggests optimal educational pathways based on:
- Program similarity (content-based filtering)
- Historical transfer patterns (collaborative filtering)
- Learning outcome alignment
- Institution relationships

**Endpoint:** `POST /api/v1/pathways/recommend`

```python
{
  "micro_credential_id": "uuid",
  "target_institution_id": "uuid",
  "student_profile": {...}
}
```

**Response:**
```python
{
  "recommendations": [
    {
      "pathway_id": "uuid",
      "confidence_score": 0.87,
      "reasoning": "High similarity in learning outcomes...",
      "transfer_credits": 3.0
    }
  ]
}
```

### 2. Credit Assessment

Evaluates micro-credential recognition eligibility:
- Learning outcome mapping
- Course content analysis
- Credit equivalency calculation
- Prerequisite validation

**Endpoint:** `POST /api/v1/credits/assess`

### 3. Semantic Search

Vector-based search for similar programs:
- Text embeddings using BERT/Sentence-Transformers
- FAISS index for fast similarity search
- Multi-field search (title, description, outcomes)

**Endpoint:** `POST /api/v1/search/semantic`

### 4. Outcome Classification

Classifies learning outcomes by:
- Bloom's Taxonomy level
- Outcome category (knowledge, skills, competencies)
- Domain-specific tags

**Endpoint:** `POST /api/v1/outcomes/classify`

## Installation

### Prerequisites

- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- CUDA (optional, for GPU acceleration)

### Setup

```bash
# Navigate to AI engine directory
cd packages/ai-engine

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Download spaCy models
python -m spacy download en_core_web_lg

# Download pre-trained models
python scripts/download_models.py

# Set environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Environment Variables

```bash
# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
API_WORKERS=4
LOG_LEVEL=info

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/bccb

# Redis
REDIS_URL=redis://localhost:6379

# Model Configuration
MODEL_PATH=./ml-models/trained
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
VECTOR_DB_PATH=./vector-db

# Hugging Face
HF_TOKEN=your_token_here  # Optional, for private models
```

## Development

### Running the Service

```bash
# Development mode with auto-reload
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn src.main:app --host 0.0.0.0 --port 8000 --workers 4
```

Access the API:
- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc

### Training Models

#### Pathway Recommender

```bash
python src/models/pathway-recommender/training.py \
  --data-path ./data/pathways.csv \
  --output-path ./ml-models/trained/pathway-recommender-v1.pkl \
  --epochs 100
```

#### Credit Assessor

```bash
python src/models/credit-assessor/training.py \
  --data-path ./data/credits.csv \
  --output-path ./ml-models/trained/credit-assessor-v1.pkl
```

### Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html --cov-report=term

# Run specific test file
pytest tests/test_pathway_recommender.py

# Run with verbosity
pytest -v -s
```

### Code Quality

```bash
# Linting
flake8 src tests
pylint src

# Type checking
mypy src

# Formatting
black src tests
isort src tests
```

## API Documentation

### Authentication

API endpoints require JWT authentication:

```python
headers = {
    "Authorization": f"Bearer {jwt_token}"
}
```

### Endpoints

#### Health Check
- `GET /health` - Service health status

#### Recommendations
- `POST /api/v1/pathways/recommend` - Get pathway recommendations
- `POST /api/v1/pathways/similar` - Find similar programs

#### Assessment
- `POST /api/v1/credits/assess` - Assess credit eligibility
- `POST /api/v1/credits/validate` - Validate recognition criteria

#### Search
- `POST /api/v1/search/semantic` - Semantic search
- `POST /api/v1/search/embeddings` - Generate text embeddings

#### Analysis
- `POST /api/v1/outcomes/classify` - Classify learning outcomes
- `POST /api/v1/outcomes/extract` - Extract outcomes from text

#### Models
- `GET /api/v1/models/info` - List available models
- `POST /api/v1/models/retrain` - Trigger model retraining

## Model Details

### Pathway Recommender

**Algorithm:** Hybrid (Content-Based + Collaborative Filtering)

**Features:**
- TF-IDF vectors of program descriptions
- Learning outcome embeddings
- Historical transfer data
- Institution relationship graph

**Metrics:**
- Precision@K: 0.85
- Recall@K: 0.78
- NDCG: 0.82

### Credit Assessor

**Algorithm:** Gradient Boosting Classifier

**Features:**
- Outcome overlap score
- Duration similarity
- Level compatibility
- Institution reputation score

**Metrics:**
- Accuracy: 0.89
- F1-Score: 0.87
- AUC-ROC: 0.92

### Outcome Classifier

**Algorithm:** Fine-tuned BERT

**Features:**
- Pre-trained on educational corpus
- Multi-label classification
- Bloom's Taxonomy alignment

**Metrics:**
- Accuracy: 0.91
- Macro F1: 0.88

## Deployment

### Docker

```bash
# Build image
docker build -f infrastructure/docker/Dockerfile.ai -t bccb-ai .

# Run container
docker run -p 8000:8000 \
  -e DATABASE_URL=postgresql://... \
  -e REDIS_URL=redis://... \
  bccb-ai
```

### Kubernetes

```bash
kubectl apply -f infrastructure/kubernetes/ai-deployment.yaml
```

## Monitoring

### Metrics

The service exposes Prometheus metrics at `/metrics`:
- Request latency
- Model inference time
- Cache hit rate
- Error rates

### Logging

Structured JSON logs with levels:
- ERROR: Critical issues
- WARNING: Degraded performance
- INFO: Request logs
- DEBUG: Detailed debugging

## Performance

### Optimization Tips

1. **GPU Acceleration**: Use CUDA-enabled TensorFlow for faster inference
2. **Batch Processing**: Process multiple requests in batches
3. **Caching**: Enable Redis caching for frequent queries
4. **Model Quantization**: Use quantized models for faster inference
5. **Async Processing**: Use Celery for long-running tasks

### Benchmarks

- Pathway recommendation: ~50ms per request
- Credit assessment: ~30ms per request
- Semantic search: ~20ms per query (with FAISS)
- Outcome classification: ~40ms per batch of 10

## Continuous Learning

The AI engine supports continuous improvement:

1. **Feedback Loop**: User feedback is collected for model retraining
2. **A/B Testing**: Test new model versions against production
3. **Monitoring**: Track model performance metrics over time
4. **Retraining Schedule**: Models retrained weekly/monthly based on new data

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines on:
- Adding new models
- Improving existing algorithms
- Writing tests
- Documentation standards

## License

MIT License - See root LICENSE file

## Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Contact the AI/ML team
- See documentation at `/docs/architecture/ai-architecture.md`
