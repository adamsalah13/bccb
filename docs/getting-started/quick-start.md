# Quick Start Guide

Get up and running with BCCB in minutes! This guide provides a fast-track introduction to the platform with practical examples.

## Prerequisites

Before starting, ensure you have completed the [Installation Guide](installation.md).

## Table of Contents

- [Starting the Platform](#starting-the-platform)
- [First Login](#first-login)
- [Core Concepts](#core-concepts)
- [Common Use Cases](#common-use-cases)
- [API Quick Start](#api-quick-start)
- [Next Steps](#next-steps)

## Starting the Platform

### Using Local Development

```bash
# Navigate to project directory
cd bccb

# Start all services
npm run dev

# Or start services individually
npm run dev:api    # API on http://localhost:3000
npm run dev:web    # Web on http://localhost:5173

# Start AI service (in separate terminal)
cd apps/ai-service
source venv/bin/activate
python -m uvicorn main:app --reload --port 8000
```

### Using Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### Verify Services

✅ Check that all services are running:
- **Web**: http://localhost:5173
- **API**: http://localhost:3000/health
- **AI**: http://localhost:8000/health

## First Login

### Default Credentials

After seeding the database, you can login with:

```
Email: admin@bcit.ca
Password: admin123
```

⚠️ **Security Note**: Change these credentials immediately in production!

### Login via Web Interface

1. Navigate to http://localhost:5173
2. Click "Login" in the top-right corner
3. Enter credentials
4. You'll be redirected to the dashboard

### Login via API

```bash
# Obtain access token
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@bcit.ca",
    "password": "admin123"
  }'

# Response:
# {
#   "success": true,
#   "data": {
#     "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#     "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#     "token_type": "Bearer",
#     "expires_in": 900
#   }
# }
```

💡 **Tip**: Save the access token for subsequent API requests.

## Core Concepts

### Institutions

Institutions are educational organizations that offer micro-credentials.

**Example Institutions** (created by seed data):
- BCIT (British Columbia Institute of Technology)
- UBC (University of British Columbia)
- SFU (Simon Fraser University)

### Micro-Credentials

Short, focused learning programs that demonstrate specific skills or knowledge.

**Key Attributes:**
- Title and description
- Program code (unique identifier)
- Credits and duration
- Delivery mode (online, in-person, hybrid)
- Status (draft, published, archived)
- Learning outcomes

### Learning Outcomes

Specific skills or knowledge students will gain.

**Bloom's Taxonomy Levels:**
- REMEMBER, UNDERSTAND, APPLY, ANALYZE, EVALUATE, CREATE

### Pathways

Transfer agreements between institutions for credit recognition.

**Types:**
- Internal: Within same institution
- External: Between different institutions

### Recognition

How one institution recognizes another's micro-credential for credit.

**Recognition Types:**
- FULL_CREDIT: Full credit transfer
- PARTIAL_CREDIT: Partial credit
- EQUIVALENCY: Course equivalent
- NO_CREDIT: Recognition without credit

## Common Use Cases

### Use Case 1: View All Micro-Credentials

#### Web Interface
1. Navigate to http://localhost:5173/credentials
2. Browse the credential catalog
3. Use filters to narrow results
4. Click on a credential to view details

#### API
```bash
# Get published credentials
curl http://localhost:3000/api/v1/credentials?status=PUBLISHED \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response:
# {
#   "success": true,
#   "data": [
#     {
#       "id": "uuid",
#       "title": "Animal Cell Culture",
#       "programCode": "26.0406",
#       "institution": { "name": "BCIT" },
#       "credits": 3.0,
#       "duration": 120,
#       "status": "PUBLISHED"
#     }
#   ]
# }
```

### Use Case 2: Create a New Micro-Credential

#### API Example
```bash
curl -X POST http://localhost:3000/api/v1/credentials \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Data Science Fundamentals",
    "shortTitle": "DSF",
    "description": "Introduction to data science, including statistics, Python, and machine learning basics.",
    "programCode": "11.0701",
    "institutionId": "YOUR_INSTITUTION_ID",
    "credentialType": "MICRO_CREDENTIAL",
    "deliveryMode": "ONLINE",
    "duration": 80,
    "credits": 2.5,
    "level": "INTERMEDIATE",
    "assessmentMethod": "Projects and quizzes",
    "cost": 999.00,
    "campus": "Online",
    "department": "Computer Science",
    "learningOutcomes": [
      {
        "outcomeText": "Apply statistical methods to analyze datasets",
        "bloomLevel": "APPLY",
        "category": "COMPETENCIES",
        "isCore": true,
        "orderIndex": 1
      },
      {
        "outcomeText": "Create data visualizations using Python",
        "bloomLevel": "CREATE",
        "category": "SKILLS",
        "isCore": true,
        "orderIndex": 2
      }
    ]
  }'
```

### Use Case 3: Search for Similar Programs

Use AI to find similar micro-credentials:

```bash
curl -X POST http://localhost:3000/api/v1/ai/pathways/similar \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "microCredentialId": "YOUR_CREDENTIAL_ID",
    "limit": 5,
    "minSimilarity": 0.7
  }'

# Response:
# {
#   "success": true,
#   "data": {
#     "similar": [
#       {
#         "microCredentialId": "uuid",
#         "title": "Cell Biology Fundamentals",
#         "institution": "UBC",
#         "similarityScore": 0.89,
#         "matchedAreas": ["learning outcomes", "content", "level"]
#       }
#     ]
#   }
# }
```

### Use Case 4: Get AI-Powered Pathway Recommendations

```bash
curl -X POST http://localhost:3000/api/v1/ai/pathways/recommend \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "microCredentialId": "YOUR_CREDENTIAL_ID",
    "targetInstitutionId": "TARGET_INSTITUTION_ID",
    "limit": 5,
    "minConfidence": 0.6
  }'

# Response includes AI-recommended transfer pathways
# with confidence scores and reasoning
```

### Use Case 5: Create a Pathway

```bash
curl -X POST http://localhost:3000/api/v1/pathways \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "BCIT Data Science to UBC Computer Science",
    "description": "Transfer pathway for data science students",
    "sourceInstitutionId": "SOURCE_ID",
    "targetInstitutionId": "TARGET_ID",
    "microCredentialId": "CREDENTIAL_ID",
    "pathwayType": "EXTERNAL",
    "transferCredits": 2.5,
    "equivalencyNotes": "Counts as CPSC 110 equivalent",
    "additionalRequirements": "Minimum grade of B required",
    "status": "DRAFT"
  }'
```

### Use Case 6: Add Recognition

```bash
curl -X POST http://localhost:3000/api/v1/recognitions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "microCredentialId": "CREDENTIAL_ID",
    "recognizingInstitutionId": "INSTITUTION_ID",
    "recognitionType": "FULL_CREDIT",
    "creditValue": 3.0,
    "creditType": "ELECTIVE",
    "transcriptMethod": "LISTED_ON_TRANSCRIPT",
    "conditions": "Minimum grade of B required",
    "effectiveDate": "2024-01-01T00:00:00Z",
    "approvalReference": "REF-2024-001"
  }'
```

## API Quick Start

### Authentication

All API requests (except health checks) require authentication:

```bash
# Step 1: Login
TOKEN=$(curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bcit.ca","password":"admin123"}' \
  | jq -r '.data.access_token')

# Step 2: Use token in requests
curl http://localhost:3000/api/v1/credentials \
  -H "Authorization: Bearer $TOKEN"
```

### Common API Patterns

#### List Resources with Pagination

```bash
curl "http://localhost:3000/api/v1/credentials?page=1&limit=20&sort=-createdAt" \
  -H "Authorization: Bearer $TOKEN"
```

#### Filter Results

```bash
# Filter by status
curl "http://localhost:3000/api/v1/credentials?status=PUBLISHED" \
  -H "Authorization: Bearer $TOKEN"

# Filter by institution
curl "http://localhost:3000/api/v1/credentials?institutionId=INST_ID" \
  -H "Authorization: Bearer $TOKEN"

# Search by text
curl "http://localhost:3000/api/v1/credentials?search=biology" \
  -H "Authorization: Bearer $TOKEN"
```

#### Get Single Resource

```bash
curl http://localhost:3000/api/v1/credentials/CREDENTIAL_ID \
  -H "Authorization: Bearer $TOKEN"
```

#### Update Resource

```bash
curl -X PUT http://localhost:3000/api/v1/credentials/CREDENTIAL_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "description": "Updated description"
  }'
```

#### Delete Resource

```bash
curl -X DELETE http://localhost:3000/api/v1/credentials/CREDENTIAL_ID \
  -H "Authorization: Bearer $TOKEN"
```

### Error Handling

API errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

**Common Error Codes:**
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

## TypeScript/JavaScript SDK Example

```typescript
import axios from 'axios';

// Create API client
const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Login and set token
async function login(email: string, password: string) {
  const response = await api.post('/auth/login', { email, password });
  const token = response.data.data.access_token;
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  return token;
}

// Get credentials
async function getCredentials() {
  const response = await api.get('/credentials', {
    params: { status: 'PUBLISHED', limit: 20 }
  });
  return response.data.data;
}

// Create credential
async function createCredential(data: any) {
  const response = await api.post('/credentials', data);
  return response.data.data;
}

// Usage
async function main() {
  await login('admin@bcit.ca', 'admin123');
  const credentials = await getCredentials();
  console.log(`Found ${credentials.length} credentials`);
}
```

## Python SDK Example

```python
import requests

class BCCBClient:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})
    
    def login(self, email: str, password: str) -> str:
        """Login and return access token"""
        response = self.session.post(
            f'{self.base_url}/api/v1/auth/login',
            json={'email': email, 'password': password}
        )
        data = response.json()
        token = data['data']['access_token']
        self.session.headers.update({'Authorization': f'Bearer {token}'})
        return token
    
    def get_credentials(self, status: str = None) -> list:
        """Get list of credentials"""
        params = {}
        if status:
            params['status'] = status
        
        response = self.session.get(
            f'{self.base_url}/api/v1/credentials',
            params=params
        )
        return response.json()['data']
    
    def create_credential(self, data: dict) -> dict:
        """Create a new credential"""
        response = self.session.post(
            f'{self.base_url}/api/v1/credentials',
            json=data
        )
        return response.json()['data']

# Usage
client = BCCBClient('http://localhost:3000')
client.login('admin@bcit.ca', 'admin123')
credentials = client.get_credentials(status='PUBLISHED')
print(f"Found {len(credentials)} credentials")
```

## Database Quick Start

### View Data in Prisma Studio

```bash
# Open Prisma Studio (GUI for database)
npm run db:studio

# Navigate to http://localhost:5555
```

### Direct Database Access

```bash
# Connect to PostgreSQL
psql -U bccb_user -d microcredentials

# List all tables
\dt

# Query credentials
SELECT id, title, status FROM micro_credentials;

# Count credentials by status
SELECT status, COUNT(*) FROM micro_credentials GROUP BY status;

# Exit
\q
```

## Next Steps

Now that you're familiar with the basics:

1. **Explore the API**: Read the full [API Reference](../api/endpoints.md)
2. **Set Up Development**: Follow the [Development Setup Guide](../development/development-setup.md)
3. **Learn Best Practices**: Review [Coding Standards](../development/coding-standards.md)
4. **Write Tests**: Check out the [Testing Guide](../development/testing-guide.md)
5. **Deploy**: Learn about [Deployment Options](../deployment/deployment-guide.md)

## Useful Commands Reference

```bash
# Development
npm run dev              # Start all services
npm run dev:api          # Start API only
npm run dev:web          # Start web only

# Database
npm run db:migrate       # Run migrations
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio
npm run db:reset         # Reset database

# Testing
npm test                 # Run all tests
npm run test:unit        # Unit tests
npm run test:integration # Integration tests
npm run test:e2e         # E2E tests

# Code Quality
npm run lint             # Lint code
npm run format           # Format code
npm run typecheck        # Type check

# Docker
docker-compose up -d     # Start services
docker-compose down      # Stop services
docker-compose logs -f   # View logs
docker-compose ps        # Check status
```

## Troubleshooting

### Services Won't Start

```bash
# Check port availability
lsof -ti:3000  # API port
lsof -ti:5173  # Web port
lsof -ti:8000  # AI service port

# Kill processes if needed
lsof -ti:3000 | xargs kill -9
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -U bccb_user -d microcredentials -h localhost

# Check .env DATABASE_URL
cat .env | grep DATABASE_URL
```

### Token Expired

```bash
# Refresh token
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"YOUR_REFRESH_TOKEN"}'
```

For more solutions, see the [Troubleshooting Guide](troubleshooting.md).

## Resources

- [API Documentation](../api/endpoints.md)
- [Development Guide](../development/development-setup.md)
- [Troubleshooting](troubleshooting.md)
- [Contributing](../../CONTRIBUTING.md)

---

**Questions?** Check our [Troubleshooting Guide](troubleshooting.md) or open an issue on [GitHub](https://github.com/adamsalah13/bccb/issues).
