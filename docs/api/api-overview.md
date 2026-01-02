# API Overview

Comprehensive overview of the BCCB platform API architecture, design principles, and patterns.

## Table of Contents

- [Introduction](#introduction)
- [Architecture](#architecture)
- [Design Principles](#design-principles)
- [RESTful Design](#restful-design)
- [API Versioning](#api-versioning)
- [Request/Response Format](#requestresponse-format)
- [Data Models](#data-models)
- [Pagination](#pagination)
- [Filtering and Sorting](#filtering-and-sorting)
- [Rate Limiting](#rate-limiting)
- [CORS Policy](#cors-policy)
- [SDK and Client Libraries](#sdk-and-client-libraries)

## Introduction

The BCCB API provides a comprehensive REST interface for managing micro-credentials, pathways, recognition, and AI-powered recommendations. Built with modern web technologies, it offers a robust, scalable, and developer-friendly experience.

### Key Features

- 🔒 **Secure**: JWT-based authentication with role-based access control
- ⚡ **Fast**: Optimized queries with caching and indexing
- 📊 **Scalable**: Horizontally scalable architecture
- 🤖 **AI-Powered**: Integrated machine learning recommendations
- 📝 **Well-Documented**: Comprehensive API reference and examples
- 🔍 **Type-Safe**: TypeScript throughout the stack

### Technology Stack

- **Runtime**: Node.js 20+ with Express.js
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL 15+ with Prisma ORM
- **Cache**: Redis 7+
- **AI/ML**: Python with FastAPI, scikit-learn, TensorFlow
- **Documentation**: OpenAPI/Swagger (planned)

## Architecture

### High-Level Architecture

```
┌─────────────┐
│   Clients   │
│  (Web/Mobile)│
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────────────────────────────┐
│       Load Balancer / CDN           │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┐
       │                │
       ▼                ▼
┌─────────────┐  ┌─────────────┐
│  API Server │  │  API Server │
│  (Node.js)  │  │  (Node.js)  │
└──────┬──────┘  └──────┬───────┘
       │                │
       └────────┬───────┘
                │
    ┌───────────┼───────────┐
    │           │           │
    ▼           ▼           ▼
┌────────┐ ┌────────┐ ┌──────────┐
│PostgreSQL│ │ Redis │ │AI Service│
│          │ │       │ │ (Python) │
└──────────┘ └───────┘ └──────────┘
```

### Layered Architecture

```
┌────────────────────────────────────┐
│         Routes Layer               │
│  (Endpoint definitions & routing)  │
└────────────┬───────────────────────┘
             │
┌────────────▼───────────────────────┐
│      Middleware Layer              │
│  (Auth, validation, error handling)│
└────────────┬───────────────────────┘
             │
┌────────────▼───────────────────────┐
│      Controller Layer              │
│  (Request handling & response)     │
└────────────┬───────────────────────┘
             │
┌────────────▼───────────────────────┐
│       Service Layer                │
│  (Business logic & orchestration)  │
└────────────┬───────────────────────┘
             │
┌────────────▼───────────────────────┐
│     Data Access Layer              │
│  (Prisma ORM, database queries)    │
└────────────────────────────────────┘
```

### Request Flow

1. **Client Request** → HTTP request with JWT token
2. **Authentication Middleware** → Validates JWT and extracts user
3. **Validation Middleware** → Validates request parameters
4. **Controller** → Handles request, calls service
5. **Service Layer** → Business logic, data validation
6. **Data Access** → Database operations via Prisma
7. **Response** → Formatted JSON response
8. **Error Handling** → Catches and formats errors

## Design Principles

### REST API Principles

1. **Resource-Based**: URLs represent resources (nouns, not verbs)
2. **HTTP Methods**: Standard methods for operations (GET, POST, PUT, DELETE)
3. **Stateless**: Each request contains all necessary information
4. **HATEOAS**: Hypermedia links for related resources (planned)
5. **JSON**: Standard data format for requests and responses

### API Design Guidelines

#### 1. Consistency

- Consistent naming conventions
- Predictable URL patterns
- Standard response formats
- Uniform error handling

#### 2. Simplicity

- Clear and intuitive endpoints
- Minimal required parameters
- Sensible defaults
- Self-explanatory field names

#### 3. Flexibility

- Optional query parameters for filtering
- Multiple response formats (planned: JSON, CSV)
- Pagination for large datasets
- Field selection (planned)

#### 4. Performance

- Database query optimization
- Redis caching for frequent queries
- Response compression
- Efficient pagination

#### 5. Security

- Authentication required for most endpoints
- Role-based access control (RBAC)
- Input validation and sanitization
- Rate limiting to prevent abuse

## RESTful Design

### Resource Naming

```
# ✓ Good: Plural nouns for collections
GET /api/v1/credentials
GET /api/v1/institutions
GET /api/v1/pathways

# ✓ Good: Singular resource with ID
GET /api/v1/credentials/{id}
GET /api/v1/institutions/{id}

# ✓ Good: Nested resources
GET /api/v1/credentials/{id}/outcomes
GET /api/v1/credentials/{id}/recognitions

# ✗ Bad: Verbs in URLs
GET /api/v1/getCredentials
POST /api/v1/createCredential

# ✗ Bad: Actions as endpoints
POST /api/v1/credentials/publish
GET /api/v1/search-credentials
```

### HTTP Methods

| Method | Purpose | Example |
|--------|---------|---------|
| GET | Retrieve resource(s) | `GET /api/v1/credentials` |
| POST | Create new resource | `POST /api/v1/credentials` |
| PUT | Update entire resource | `PUT /api/v1/credentials/{id}` |
| PATCH | Partial update | `PATCH /api/v1/credentials/{id}` |
| DELETE | Delete resource | `DELETE /api/v1/credentials/{id}` |

### Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH, DELETE |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE with no response body |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource conflict (e.g., duplicate) |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily unavailable |

## API Versioning

### URL Versioning

All endpoints include version in URL path:

```
https://api.bccb.example.com/api/v1/credentials
https://api.bccb.example.com/api/v1/pathways
```

### Version Policy

- **Current Version**: v1
- **Deprecation Notice**: 6 months before removal
- **Breaking Changes**: New major version
- **Backward Compatibility**: Within same major version

### Version Headers (Planned)

```http
Accept: application/vnd.bccb.v1+json
API-Version: 1
```

## Request/Response Format

### Request Headers

```http
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Accept: application/json
```

### Success Response

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Animal Cell Culture",
    "status": "PUBLISHED"
  },
  "metadata": {
    "timestamp": "2024-01-02T19:00:00Z",
    "request_id": "uuid"
  }
}
```

### List Response with Pagination

```json
{
  "success": true,
  "data": [
    { "id": "uuid1", "title": "Credential 1" },
    { "id": "uuid2", "title": "Credential 2" }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8,
    "has_next": true,
    "has_prev": false
  },
  "metadata": {
    "timestamp": "2024-01-02T19:00:00Z",
    "request_id": "uuid"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format",
        "value": "invalid-email"
      }
    ]
  },
  "metadata": {
    "timestamp": "2024-01-02T19:00:00Z",
    "request_id": "uuid"
  }
}
```

## Data Models

### Core Resources

#### MicroCredential

```typescript
interface MicroCredential {
  id: string;
  title: string;
  shortTitle?: string;
  description: string;
  programCode: string;
  institutionId: string;
  institution: Institution;
  credentialType: CredentialType;
  deliveryMode: DeliveryMode;
  duration: number;  // hours
  credits?: number;
  level: EducationLevel;
  status: CredentialStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}
```

#### Institution

```typescript
interface Institution {
  id: string;
  name: string;
  type: InstitutionType;
  code: string;
  city?: string;
  province?: string;
  country: string;
  website?: string;
  isActive: boolean;
}
```

#### Pathway

```typescript
interface Pathway {
  id: string;
  name: string;
  description: string;
  sourceInstitutionId: string;
  targetInstitutionId: string;
  microCredentialId: string;
  pathwayType: PathwayType;
  transferCredits?: number;
  status: PathwayStatus;
  isAiSuggested: boolean;
  confidenceScore?: number;
}
```

### Enumerations

```typescript
enum CredentialStatus {
  DRAFT = 'DRAFT',
  UNDER_REVIEW = 'UNDER_REVIEW',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

enum PathwayType {
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL'
}

enum UserRole {
  USER = 'USER',
  PROGRAM_COORDINATOR = 'PROGRAM_COORDINATOR',
  INSTITUTION_ADMIN = 'INSTITUTION_ADMIN',
  ADMIN = 'ADMIN'
}
```

## Pagination

### Query Parameters

```http
GET /api/v1/credentials?page=1&limit=20
```

**Parameters:**
- `page` (default: 1) - Page number (1-indexed)
- `limit` (default: 20, max: 100) - Items per page

### Response

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

### Cursor-Based Pagination (Planned)

For real-time data:

```http
GET /api/v1/credentials?cursor=eyJpZCI6InV1aWQifQ&limit=20
```

## Filtering and Sorting

### Filtering

```http
# Single filter
GET /api/v1/credentials?status=PUBLISHED

# Multiple filters
GET /api/v1/credentials?status=PUBLISHED&level=INTERMEDIATE

# Search
GET /api/v1/credentials?search=biology

# Date range
GET /api/v1/credentials?createdAfter=2024-01-01&createdBefore=2024-12-31
```

### Sorting

```http
# Sort ascending
GET /api/v1/credentials?sort=title

# Sort descending (prefix with -)
GET /api/v1/credentials?sort=-createdAt

# Multiple sort fields
GET /api/v1/credentials?sort=-createdAt,title
```

### Complex Queries (Planned)

```http
# Logical operators
GET /api/v1/credentials?filter[status][in]=PUBLISHED,UNDER_REVIEW
GET /api/v1/credentials?filter[credits][gte]=3.0
GET /api/v1/credentials?filter[title][like]=%biology%

# Field selection
GET /api/v1/credentials?fields=id,title,status
```

## Rate Limiting

### Limits

- **Authenticated Users**: 1000 requests/hour
- **Unauthenticated**: 100 requests/hour
- **AI Endpoints**: 100 requests/hour

### Headers

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 998
X-RateLimit-Reset: 1704216000
```

### Response When Exceeded

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 3600

{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retry_after": 3600
  }
}
```

## CORS Policy

### Allowed Origins

- Development: `http://localhost:5173`, `http://localhost:3000`
- Production: `https://app.bccb.example.com`

### Allowed Methods

- GET, POST, PUT, PATCH, DELETE, OPTIONS

### Allowed Headers

- Authorization, Content-Type, Accept

### Example Configuration

```typescript
app.use(cors({
  origin: process.env.CORS_ORIGIN.split(','),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Authorization', 'Content-Type'],
  credentials: true,
  maxAge: 86400
}));
```

## SDK and Client Libraries

### JavaScript/TypeScript

```typescript
import { BCCBClient } from '@bccb/client';

const client = new BCCBClient({
  baseURL: 'https://api.bccb.example.com',
  apiKey: 'your-api-key'
});

// Get credentials
const credentials = await client.credentials.list({
  status: 'PUBLISHED',
  page: 1,
  limit: 20
});

// Create credential
const newCredential = await client.credentials.create({
  title: 'New Credential',
  programCode: 'TEST-101',
  // ...
});
```

### Python

```python
from bccb_client import BCCBClient

client = BCCBClient(
    base_url='https://api.bccb.example.com',
    api_key='your-api-key'
)

# Get credentials
credentials = client.credentials.list(
    status='PUBLISHED',
    page=1,
    limit=20
)

# Create credential
new_credential = client.credentials.create(
    title='New Credential',
    program_code='TEST-101'
)
```

### cURL

```bash
# Get credentials
curl -X GET https://api.bccb.example.com/api/v1/credentials \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json"

# Create credential
curl -X POST https://api.bccb.example.com/api/v1/credentials \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Credential",
    "programCode": "TEST-101",
    "institutionId": "uuid"
  }'
```

## Best Practices for API Consumers

### 1. Use HTTPS

Always use HTTPS in production:
```
https://api.bccb.example.com/api/v1/...
```

### 2. Handle Errors Gracefully

```typescript
try {
  const credential = await api.getCredential(id);
} catch (error) {
  if (error.status === 404) {
    // Handle not found
  } else if (error.status === 401) {
    // Handle unauthorized
  } else {
    // Handle other errors
  }
}
```

### 3. Implement Retry Logic

```typescript
async function fetchWithRetry(url, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(url, options);
    } catch (error) {
      if (i === retries - 1) throw error;
      await sleep(Math.pow(2, i) * 1000);  // Exponential backoff
    }
  }
}
```

### 4. Cache Responses

```typescript
// Cache GET responses
const cache = new Map();

async function getCachedCredential(id) {
  if (cache.has(id)) {
    return cache.get(id);
  }
  
  const credential = await api.getCredential(id);
  cache.set(id, credential);
  return credential;
}
```

### 5. Monitor Rate Limits

```typescript
function checkRateLimit(response) {
  const remaining = response.headers.get('X-RateLimit-Remaining');
  if (parseInt(remaining) < 10) {
    console.warn('Rate limit approaching');
  }
}
```

## Next Steps

- [Authentication Guide](authentication.md) - Learn about JWT authentication
- [Error Handling](error-handling.md) - Understand error codes and handling
- [API Endpoints Reference](endpoints.md) - Detailed endpoint documentation

---

**Questions?** Check the [API Endpoints Reference](endpoints.md) or open an issue on [GitHub](https://github.com/adamsalah13/bccb/issues).
