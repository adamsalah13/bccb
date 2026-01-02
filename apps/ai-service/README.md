# AI/ML Service

Python FastAPI-based AI/ML service for intelligent micro-credentials management and pathway recommendations.

## Features

- **Pathway Recommendations**: ML-powered pathway suggestions using content-based filtering
- **Credit Assessment**: Automated evaluation of micro-credential recognition eligibility
- **Semantic Search**: Vector-based similarity search for programs and credentials
- **Text Embeddings**: Generate embeddings using Sentence Transformers

## Quick Start

### Prerequisites

- Python 3.11+
- pip or poetry

### Installation

```bash
# Navigate to the service directory
cd apps/ai-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment configuration
cp .env.example .env
# Edit .env with your configuration
```

### Running the Service

```bash
# Development mode with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Or use the Python script
python main.py
```

The service will be available at:
- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc

## API Endpoints

### Health Check
- `GET /health` - Service health status
- `GET /` - API information

### Recommendations
- `POST /api/v1/recommendations/recommend` - Get pathway recommendations
- `GET /api/v1/recommendations/similar/{credential_id}` - Find similar programs
- `POST /api/v1/recommendations/train` - Train/update model
- `GET /api/v1/recommendations/model/info` - Model information

### Assessment
- `POST /api/v1/assessment/assess` - Assess credit eligibility
- `POST /api/v1/assessment/assess/batch` - Batch assessment
- `POST /api/v1/assessment/validate` - Validate recognition criteria
- `GET /api/v1/assessment/model/info` - Model information

### Similarity
- `POST /api/v1/similarity/embeddings` - Generate text embeddings
- `POST /api/v1/similarity/search` - Semantic similarity search
- `POST /api/v1/similarity/index` - Index documents for search
- `POST /api/v1/similarity/similarity` - Compare two texts
- `GET /api/v1/similarity/store/info` - Vector store information
- `DELETE /api/v1/similarity/store/clear` - Clear vector store

## Usage Examples

### Pathway Recommendations

```python
import requests

response = requests.post(
    "http://localhost:8000/api/v1/recommendations/recommend",
    json={
        "micro_credential": {
            "id": "mc-001",
            "title": "Animal Cell Culture Techniques",
            "description": "Comprehensive training in cell culture methods...",
            "learning_outcomes": [
                "Demonstrate sterile technique",
                "Maintain cell lines",
                "Perform viability assays"
            ],
            "level": "certificate",
            "subject": "biotechnology"
        },
        "top_k": 5,
        "min_similarity": 0.5
    }
)

recommendations = response.json()
print(recommendations)
```

### Credit Assessment

```python
response = requests.post(
    "http://localhost:8000/api/v1/assessment/assess",
    json={
        "micro_credential": {
            "id": "mc-001",
            "title": "Cell Culture",
            "description": "...",
            "learning_outcomes": ["..."],
            "duration_hours": 40,
            "assessment_methods": ["exam", "project"]
        },
        "target_program": {
            "id": "prog-001",
            "title": "Biotechnology Diploma",
            "description": "...",
            "learning_outcomes": ["..."],
            "credits": 60
        }
    }
)

assessment = response.json()
print(assessment)
```

### Semantic Search

```python
# Index documents
requests.post(
    "http://localhost:8000/api/v1/similarity/index",
    json={
        "documents": [
            {
                "text": "Cell culture techniques and methods",
                "metadata": {"id": "doc-1", "type": "program"}
            },
            {
                "text": "Biotechnology fundamentals",
                "metadata": {"id": "doc-2", "type": "program"}
            }
        ]
    }
)

# Search
response = requests.post(
    "http://localhost:8000/api/v1/similarity/search",
    json={
        "query": "cell culture training",
        "top_k": 5,
        "threshold": 0.5
    }
)

results = response.json()
print(results)
```

## Docker

### Build Image

```bash
docker build -t bccb-ai-service .
```

### Run Container

```bash
docker run -p 8000:8000 \
  -e DATABASE_URL=postgresql://... \
  -e REDIS_URL=redis://... \
  bccb-ai-service
```

### Using Docker Compose

From the root directory:

```bash
docker-compose up ai-service
```

## Development

### Running Tests

```bash
pytest

# With coverage
pytest --cov=. --cov-report=html
```

### Code Quality

```bash
# Format code
black .
isort .

# Lint
flake8 .

# Type check
mypy .
```

## Architecture

```
apps/ai-service/
├── api/                    # API endpoints
│   ├── recommendations.py  # Pathway recommendations
│   ├── assessment.py       # Credit assessment
│   └── similarity.py       # Semantic search
├── models/                 # ML models
│   ├── pathway_recommender.py
│   └── credit_assessor.py
├── services/              # Business logic
│   ├── embeddings.py      # Text embedding service
│   └── vector_store.py    # Vector storage
├── utils/                 # Utilities
│   └── preprocessing.py   # Data preprocessing
├── main.py               # Application entry point
├── config.py             # Configuration management
├── requirements.txt      # Python dependencies
├── Dockerfile           # Container configuration
└── README.md            # This file
```

## Models

### Pathway Recommender
- **Algorithm**: Content-based filtering with semantic similarity
- **Features**: Text embeddings, learning outcome analysis
- **Output**: Ranked pathway recommendations with confidence scores

### Credit Assessor
- **Algorithm**: Rule-based system with confidence scoring
- **Features**: Duration, outcome overlap, content similarity, assessment methods
- **Output**: Approval/denial decision with reasoning

### Embedding Service
- **Model**: Sentence Transformers (all-MiniLM-L6-v2)
- **Dimension**: 384
- **Use Case**: Semantic similarity and search

## Performance

- Pathway recommendation: ~50ms per request
- Credit assessment: ~30ms per request
- Semantic search: ~20ms per query
- Embedding generation: ~10ms per text (batch of 32)

## Configuration

See `.env.example` for all available configuration options.

Key settings:
- `EMBEDDING_MODEL`: Sentence transformer model to use
- `SIMILARITY_THRESHOLD`: Minimum similarity for recommendations
- `BATCH_SIZE`: Batch size for embedding generation
- `CACHE_ENABLED`: Enable/disable result caching

## License

MIT License - See root LICENSE file
