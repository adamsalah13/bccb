# API Reference

## Overview

The BCCB platform provides a comprehensive REST API for managing micro-credentials, pathways, recognition, and AI-powered recommendations. This document describes all available endpoints, request/response formats, and authentication requirements.

## Base URLs

- **Development**: `http://localhost:3000`
- **Production**: `https://api.bccb.example.com`

## API Versioning

All endpoints are versioned. Current version: `v1`

Base path: `/api/v1`

## Authentication

### JWT Bearer Token

All endpoints (except health checks and public data) require JWT authentication.

```http
Authorization: Bearer <jwt_token>
```

### Obtaining a Token

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 900
}
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
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
        "message": "Invalid email format"
      }
    ]
  },
  "metadata": {
    "timestamp": "2024-01-02T19:00:00Z",
    "request_id": "uuid"
  }
}
```

### HTTP Status Codes

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `204 No Content`: Request succeeded with no content to return
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., duplicate)
- `422 Unprocessable Entity`: Validation error
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: Service temporarily unavailable

## Pagination

Endpoints returning lists support pagination using query parameters:

```http
GET /api/v1/credentials?page=1&limit=20
```

**Parameters:**
- `page` (default: 1): Page number
- `limit` (default: 20, max: 100): Items per page
- `sort` (optional): Sort field (e.g., `createdAt`, `-updatedAt` for descending)

**Response:**
```json
{
  "success": true,
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

## Rate Limiting

API requests are rate-limited per user/IP address:

- **Authenticated users**: 1000 requests per hour
- **Unauthenticated**: 100 requests per hour

Rate limit headers:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 998
X-RateLimit-Reset: 1704216000
```

---

## Endpoints

## Health Check

### Get API Health Status

```http
GET /health
```

Check API service health and dependencies.

**Authentication:** Not required

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2024-01-02T19:00:00Z",
  "services": {
    "database": "healthy",
    "cache": "healthy",
    "ai_service": "healthy"
  }
}
```

---

## Authentication

### Login

```http
POST /api/v1/auth/login
Content-Type: application/json
```

Authenticate user and obtain access tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 900,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER"
    }
  }
}
```

### Refresh Token

```http
POST /api/v1/auth/refresh
Content-Type: application/json
```

Refresh access token using refresh token.

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 900
  }
}
```

### Logout

```http
POST /api/v1/auth/logout
Authorization: Bearer <token>
```

Invalidate current access token.

**Response:** `204 No Content`

### Register

```http
POST /api/v1/auth/register
Content-Type: application/json
```

Register a new user account.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "firstName": "Jane",
  "lastName": "Smith",
  "institutionId": "uuid"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "newuser@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "USER"
  }
}
```

---

## Institutions

### List Institutions

```http
GET /api/v1/institutions?type=UNIVERSITY&page=1&limit=20
Authorization: Bearer <token>
```

Get list of institutions.

**Query Parameters:**
- `type` (optional): Filter by institution type (UNIVERSITY, COLLEGE, INSTITUTE, POLYTECHNIC, EXTERNAL)
- `search` (optional): Search by name or code
- `isActive` (optional): Filter active/inactive institutions

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "British Columbia Institute of Technology",
      "type": "INSTITUTE",
      "code": "BCIT",
      "city": "Burnaby",
      "province": "BC",
      "country": "Canada",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

### Get Institution

```http
GET /api/v1/institutions/:id
Authorization: Bearer <token>
```

Get institution details by ID.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "British Columbia Institute of Technology",
    "type": "INSTITUTE",
    "code": "BCIT",
    "address": "3700 Willingdon Ave",
    "city": "Burnaby",
    "province": "BC",
    "postalCode": "V5G 3H2",
    "country": "Canada",
    "website": "https://www.bcit.ca",
    "contactEmail": "info@bcit.ca",
    "contactPhone": "+1-604-434-5734",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-02T10:00:00Z",
    "stats": {
      "microCredentialsCount": 45,
      "pathwaysCount": 120,
      "recognitionsProvided": 78
    }
  }
}
```

### Create Institution

```http
POST /api/v1/institutions
Authorization: Bearer <token>
Content-Type: application/json
```

Create a new institution. Requires `ADMIN` role.

**Request Body:**
```json
{
  "name": "University of Example",
  "type": "UNIVERSITY",
  "code": "UOEX",
  "address": "123 Main St",
  "city": "Vancouver",
  "province": "BC",
  "postalCode": "V6B 1A1",
  "country": "Canada",
  "website": "https://example.edu",
  "contactEmail": "contact@example.edu",
  "contactPhone": "+1-604-123-4567"
}
```

**Response:** `201 Created`

### Update Institution

```http
PUT /api/v1/institutions/:id
Authorization: Bearer <token>
Content-Type: application/json
```

Update institution details. Requires `ADMIN` or `INSTITUTION_ADMIN` role.

**Request Body:** Same as Create Institution (all fields optional)

**Response:** `200 OK`

### Delete Institution

```http
DELETE /api/v1/institutions/:id
Authorization: Bearer <token>
```

Soft delete institution (sets `isActive` to false). Requires `ADMIN` role.

**Response:** `204 No Content`

---

## Micro-Credentials

### List Micro-Credentials

```http
GET /api/v1/credentials?status=PUBLISHED&page=1&limit=20
Authorization: Bearer <token>
```

Get list of micro-credentials.

**Query Parameters:**
- `status` (optional): Filter by status (DRAFT, UNDER_REVIEW, PUBLISHED, ARCHIVED)
- `institutionId` (optional): Filter by institution
- `credentialType` (optional): Filter by type
- `level` (optional): Filter by education level
- `search` (optional): Search in title and description

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Animal Cell Culture",
      "shortTitle": "ACC",
      "programCode": "26.0406",
      "institutionId": "uuid",
      "institution": {
        "id": "uuid",
        "name": "BCIT",
        "code": "BCIT"
      },
      "credentialType": "MICRO_CREDENTIAL",
      "deliveryMode": "HYBRID",
      "duration": 120,
      "credits": 3.0,
      "level": "INTERMEDIATE",
      "status": "PUBLISHED",
      "publishedAt": "2024-01-01T00:00:00Z",
      "createdAt": "2023-12-15T00:00:00Z"
    }
  ],
  "pagination": {...}
}
```

### Get Micro-Credential

```http
GET /api/v1/credentials/:id
Authorization: Bearer <token>
```

Get detailed micro-credential information.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Animal Cell Culture",
    "shortTitle": "ACC",
    "description": "This micro-credential provides foundational knowledge...",
    "programCode": "26.0406",
    "institutionId": "uuid",
    "institution": {
      "id": "uuid",
      "name": "British Columbia Institute of Technology",
      "code": "BCIT"
    },
    "credentialType": "MICRO_CREDENTIAL",
    "deliveryMode": "HYBRID",
    "duration": 120,
    "credits": 3.0,
    "assessmentMethod": "Practical demonstration and written exam",
    "cost": 1500.00,
    "language": "English",
    "level": "INTERMEDIATE",
    "campus": "Burnaby",
    "department": "Life Sciences",
    "faculty": "School of Health Sciences",
    "status": "PUBLISHED",
    "effectiveDate": "2024-01-01T00:00:00Z",
    "programUrl": "https://www.bcit.ca/programs/animal-cell-culture",
    "learningOutcomes": [
      {
        "id": "uuid",
        "outcomeText": "Demonstrate proper aseptic technique",
        "bloomLevel": "APPLY",
        "category": "SKILLS",
        "isCore": true,
        "orderIndex": 1
      }
    ],
    "prerequisites": [
      {
        "id": "uuid",
        "description": "Basic biology knowledge",
        "type": "ACADEMIC",
        "isMandatory": true
      }
    ],
    "createdAt": "2023-12-15T00:00:00Z",
    "updatedAt": "2024-01-02T10:00:00Z",
    "publishedAt": "2024-01-01T00:00:00Z"
  }
}
```

### Create Micro-Credential

```http
POST /api/v1/credentials
Authorization: Bearer <token>
Content-Type: application/json
```

Create a new micro-credential. Requires `PROGRAM_COORDINATOR` or higher role.

**Request Body:**
```json
{
  "title": "Advanced Lab Techniques",
  "shortTitle": "ALT",
  "description": "Advanced laboratory techniques for research...",
  "programCode": "26.0407",
  "institutionId": "uuid",
  "credentialType": "MICRO_CREDENTIAL",
  "deliveryMode": "IN_PERSON",
  "duration": 80,
  "credits": 2.0,
  "assessmentMethod": "Lab practical",
  "cost": 1200.00,
  "level": "ADVANCED",
  "campus": "Burnaby",
  "department": "Life Sciences",
  "faculty": "School of Health Sciences",
  "programUrl": "https://example.com/program",
  "learningOutcomes": [
    {
      "outcomeText": "Perform advanced microscopy techniques",
      "bloomLevel": "APPLY",
      "category": "SKILLS",
      "isCore": true,
      "orderIndex": 1
    }
  ],
  "prerequisites": [
    {
      "description": "Completion of basic lab course",
      "type": "COURSE_COMPLETION",
      "isMandatory": true,
      "orderIndex": 1
    }
  ]
}
```

**Response:** `201 Created`

### Update Micro-Credential

```http
PUT /api/v1/credentials/:id
Authorization: Bearer <token>
Content-Type: application/json
```

Update micro-credential. Requires `PROGRAM_COORDINATOR` or higher role.

**Request Body:** Same as Create (all fields optional)

**Response:** `200 OK`

### Publish Micro-Credential

```http
POST /api/v1/credentials/:id/publish
Authorization: Bearer <token>
```

Publish a micro-credential (change status from DRAFT to PUBLISHED).

**Response:** `200 OK`

### Archive Micro-Credential

```http
POST /api/v1/credentials/:id/archive
Authorization: Bearer <token>
```

Archive a micro-credential.

**Response:** `200 OK`

---

## Learning Outcomes

### List Learning Outcomes

```http
GET /api/v1/credentials/:credentialId/outcomes
Authorization: Bearer <token>
```

Get learning outcomes for a micro-credential.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "outcomeText": "Demonstrate proper aseptic technique in cell culture",
      "bloomLevel": "APPLY",
      "category": "SKILLS",
      "orderIndex": 1,
      "isCore": true,
      "keywords": ["demonstrate", "aseptic", "technique", "cell", "culture"]
    }
  ]
}
```

### Add Learning Outcome

```http
POST /api/v1/credentials/:credentialId/outcomes
Authorization: Bearer <token>
Content-Type: application/json
```

Add a learning outcome to micro-credential.

**Request Body:**
```json
{
  "outcomeText": "Analyze cell viability using microscopy",
  "bloomLevel": "ANALYZE",
  "category": "COMPETENCIES",
  "isCore": true,
  "orderIndex": 2
}
```

**Response:** `201 Created`

---

## Recognition

### List Recognitions

```http
GET /api/v1/recognitions?microCredentialId=uuid
Authorization: Bearer <token>
```

Get recognitions for a micro-credential or institution.

**Query Parameters:**
- `microCredentialId` (optional): Filter by micro-credential
- `recognizingInstitutionId` (optional): Filter by recognizing institution
- `recognitionType` (optional): Filter by type
- `isActive` (optional): Filter active/inactive

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "microCredentialId": "uuid",
      "microCredential": {
        "id": "uuid",
        "title": "Animal Cell Culture",
        "programCode": "26.0406"
      },
      "recognizingInstitutionId": "uuid",
      "recognizingInstitution": {
        "id": "uuid",
        "name": "University of British Columbia",
        "code": "UBC"
      },
      "recognitionType": "FULL_CREDIT",
      "creditValue": 3.0,
      "creditType": "ELECTIVE",
      "transcriptMethod": "LISTED_ON_TRANSCRIPT",
      "conditions": "Minimum grade of B required",
      "effectiveDate": "2024-01-01T00:00:00Z",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Get Recognition

```http
GET /api/v1/recognitions/:id
Authorization: Bearer <token>
```

Get recognition details.

**Response:** `200 OK`

### Create Recognition

```http
POST /api/v1/recognitions
Authorization: Bearer <token>
Content-Type: application/json
```

Create a new recognition. Requires `INSTITUTION_ADMIN` or higher role.

**Request Body:**
```json
{
  "microCredentialId": "uuid",
  "recognizingInstitutionId": "uuid",
  "recognitionType": "FULL_CREDIT",
  "creditValue": 3.0,
  "creditType": "ELECTIVE",
  "transcriptMethod": "LISTED_ON_TRANSCRIPT",
  "conditions": "Minimum grade of B required",
  "effectiveDate": "2024-01-01T00:00:00Z",
  "expiryDate": "2029-12-31T23:59:59Z",
  "approvalReference": "REF-2024-001",
  "notes": "Approved by curriculum committee"
}
```

**Response:** `201 Created`

### Update Recognition

```http
PUT /api/v1/recognitions/:id
Authorization: Bearer <token>
Content-Type: application/json
```

Update recognition details.

**Response:** `200 OK`

### Delete Recognition

```http
DELETE /api/v1/recognitions/:id
Authorization: Bearer <token>
```

Soft delete recognition.

**Response:** `204 No Content`

---

## Pathways

### List Pathways

```http
GET /api/v1/pathways?sourceInstitutionId=uuid&status=ACTIVE
Authorization: Bearer <token>
```

Get pathways between institutions.

**Query Parameters:**
- `sourceInstitutionId` (optional): Filter by source institution
- `targetInstitutionId` (optional): Filter by target institution
- `microCredentialId` (optional): Filter by micro-credential
- `pathwayType` (optional): Filter by type
- `status` (optional): Filter by status
- `isAiSuggested` (optional): Filter AI-suggested pathways

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "BCIT ACC to UBC Biology",
      "description": "Pathway from Animal Cell Culture to Biology program",
      "sourceInstitutionId": "uuid",
      "sourceInstitution": {
        "id": "uuid",
        "name": "BCIT",
        "code": "BCIT"
      },
      "targetInstitutionId": "uuid",
      "targetInstitution": {
        "id": "uuid",
        "name": "UBC",
        "code": "UBC"
      },
      "microCredentialId": "uuid",
      "microCredential": {
        "id": "uuid",
        "title": "Animal Cell Culture"
      },
      "pathwayType": "EXTERNAL",
      "transferCredits": 3.0,
      "equivalencyNotes": "Counts towards Biology electives",
      "status": "ACTIVE",
      "isAiSuggested": false,
      "confidenceScore": null,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Get Pathway

```http
GET /api/v1/pathways/:id
Authorization: Bearer <token>
```

Get pathway details.

**Response:** `200 OK`

### Create Pathway

```http
POST /api/v1/pathways
Authorization: Bearer <token>
Content-Type: application/json
```

Create a new pathway. Requires `PROGRAM_COORDINATOR` or higher role.

**Request Body:**
```json
{
  "name": "BCIT to SFU Transfer",
  "description": "Transfer pathway to SFU Business program",
  "sourceInstitutionId": "uuid",
  "targetInstitutionId": "uuid",
  "microCredentialId": "uuid",
  "pathwayType": "EXTERNAL",
  "transferCredits": 3.0,
  "equivalencyNotes": "Counts as BUS 101 equivalent",
  "additionalRequirements": "Minimum GPA of 3.0 required",
  "status": "DRAFT"
}
```

**Response:** `201 Created`

### Update Pathway

```http
PUT /api/v1/pathways/:id
Authorization: Bearer <token>
Content-Type: application/json
```

Update pathway details.

**Response:** `200 OK`

### Approve Pathway

```http
POST /api/v1/pathways/:id/approve
Authorization: Bearer <token>
Content-Type: application/json
```

Approve a pathway. Requires `INSTITUTION_ADMIN` or higher role.

**Request Body:**
```json
{
  "approvedBy": "Jane Smith",
  "notes": "Approved by academic committee"
}
```

**Response:** `200 OK`

### Delete Pathway

```http
DELETE /api/v1/pathways/:id
Authorization: Bearer <token>
```

Soft delete pathway.

**Response:** `204 No Content`

---

## AI Recommendations

### Get Pathway Recommendations

```http
POST /api/v1/ai/pathways/recommend
Authorization: Bearer <token>
Content-Type: application/json
```

Get AI-powered pathway recommendations for a micro-credential.

**Request Body:**
```json
{
  "microCredentialId": "uuid",
  "targetInstitutionId": "uuid",
  "limit": 5,
  "minConfidence": 0.6
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "pathwayId": "uuid",
        "confidenceScore": 0.87,
        "transferCredits": 3.0,
        "reasoning": "High similarity in learning outcomes (0.92) and strong institutional relationship",
        "similarOutcomes": [
          "Understand cell culture techniques",
          "Apply aseptic procedures"
        ],
        "expectedDuration": "6 months",
        "targetProgram": {
          "id": "uuid",
          "title": "Biology Program",
          "institution": "UBC"
        }
      }
    ],
    "metadata": {
      "totalCandidates": 45,
      "filteredCount": 5,
      "computationTimeMs": 48
    }
  }
}
```

### Find Similar Programs

```http
POST /api/v1/ai/pathways/similar
Authorization: Bearer <token>
Content-Type: application/json
```

Find similar micro-credentials using AI semantic search.

**Request Body:**
```json
{
  "microCredentialId": "uuid",
  "limit": 10,
  "minSimilarity": 0.7
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "similar": [
      {
        "microCredentialId": "uuid",
        "title": "Cell Biology Fundamentals",
        "institution": "UBC",
        "similarityScore": 0.89,
        "matchedAreas": ["learning outcomes", "content", "level"]
      }
    ]
  }
}
```

### Assess Credit Eligibility

```http
POST /api/v1/ai/credits/assess
Authorization: Bearer <token>
Content-Type: application/json
```

Use AI to assess credit recognition eligibility.

**Request Body:**
```json
{
  "microCredentialId": "uuid",
  "recognizingInstitutionId": "uuid",
  "recognitionType": "FULL_CREDIT"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "assessment": {
      "recommendation": "APPROVE",
      "confidence": 0.89,
      "creditValue": 3.0,
      "creditType": "ELECTIVE"
    },
    "analysis": {
      "outcomeOverlap": 0.87,
      "durationSimilarity": 0.95,
      "levelCompatible": true,
      "historicalApprovalRate": 0.82
    },
    "reasoning": "High learning outcome alignment (87%) and compatible program levels.",
    "conditions": [
      "Requires prior completion of Biology 101",
      "Student must maintain minimum GPA of 2.5"
    ]
  }
}
```

### Classify Learning Outcomes

```http
POST /api/v1/ai/outcomes/classify
Authorization: Bearer <token>
Content-Type: application/json
```

Classify learning outcomes using AI.

**Request Body:**
```json
{
  "outcomes": [
    "Demonstrate proper aseptic technique in cell culture",
    "Analyze cell viability using microscopy techniques"
  ]
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "classifications": [
      {
        "text": "Demonstrate proper aseptic technique in cell culture",
        "bloomLevel": "APPLY",
        "bloomConfidence": 0.94,
        "category": "SKILLS",
        "categoryConfidence": 0.91,
        "keywords": ["demonstrate", "aseptic", "technique", "cell culture"]
      },
      {
        "text": "Analyze cell viability using microscopy techniques",
        "bloomLevel": "ANALYZE",
        "bloomConfidence": 0.89,
        "category": "COMPETENCIES",
        "categoryConfidence": 0.85,
        "keywords": ["analyze", "viability", "microscopy"]
      }
    ]
  }
}
```

### Semantic Search

```http
POST /api/v1/ai/search/semantic
Authorization: Bearer <token>
Content-Type: application/json
```

Perform semantic search across micro-credentials.

**Request Body:**
```json
{
  "query": "programs related to biotechnology and lab techniques",
  "filters": {
    "institutionId": "uuid",
    "credentialType": "MICRO_CREDENTIAL",
    "level": "INTERMEDIATE"
  },
  "limit": 10,
  "minSimilarity": 0.5
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "microCredentialId": "uuid",
        "title": "Animal Cell Culture",
        "similarityScore": 0.87,
        "matchedFields": ["description", "learningOutcomes"],
        "snippet": "...cell culture techniques in a laboratory setting..."
      }
    ],
    "total": 8,
    "queryTimeMs": 23
  }
}
```

### Generate Text Embeddings

```http
POST /api/v1/ai/embeddings
Authorization: Bearer <token>
Content-Type: application/json
```

Generate vector embeddings for text.

**Request Body:**
```json
{
  "texts": [
    "Learn cell culture techniques",
    "Advanced laboratory procedures"
  ]
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "embeddings": [
      [0.123, -0.456, 0.789, ...],  // 384-dimensional vector
      [0.234, -0.567, 0.890, ...]
    ],
    "dimension": 384,
    "model": "all-MiniLM-L6-v2"
  }
}
```

---

## Users

### Get Current User

```http
GET /api/v1/users/me
Authorization: Bearer <token>
```

Get current authenticated user profile.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "PROGRAM_COORDINATOR",
    "institutionId": "uuid",
    "institution": {
      "id": "uuid",
      "name": "BCIT",
      "code": "BCIT"
    },
    "isActive": true,
    "lastLoginAt": "2024-01-02T18:30:00Z",
    "createdAt": "2023-06-15T00:00:00Z"
  }
}
```

### Update User Profile

```http
PUT /api/v1/users/me
Authorization: Bearer <token>
Content-Type: application/json
```

Update current user profile.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "email": "john.smith@example.com"
}
```

**Response:** `200 OK`

### List Users

```http
GET /api/v1/users?role=PROGRAM_COORDINATOR
Authorization: Bearer <token>
```

List users. Requires `ADMIN` or `INSTITUTION_ADMIN` role.

**Query Parameters:**
- `role` (optional): Filter by role
- `institutionId` (optional): Filter by institution
- `isActive` (optional): Filter active/inactive users

**Response:** `200 OK`

---

## Audit Logs

### Get Audit Logs

```http
GET /api/v1/audit?entityType=MicroCredential&entityId=uuid
Authorization: Bearer <token>
```

Get audit logs. Requires `ADMIN` or `INSTITUTION_ADMIN` role.

**Query Parameters:**
- `entityType` (optional): Filter by entity type
- `entityId` (optional): Filter by entity ID
- `userId` (optional): Filter by user
- `action` (optional): Filter by action type
- `startDate` (optional): Filter by date range start
- `endDate` (optional): Filter by date range end

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "entityType": "MicroCredential",
      "entityId": "uuid",
      "action": "UPDATE",
      "userId": "uuid",
      "user": {
        "id": "uuid",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe"
      },
      "changes": {
        "status": {
          "before": "DRAFT",
          "after": "PUBLISHED"
        }
      },
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2024-01-02T19:00:00Z"
    }
  ],
  "pagination": {...}
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `AUTHENTICATION_ERROR` | Authentication failed or missing |
| `AUTHORIZATION_ERROR` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `CONFLICT` | Resource conflict (duplicate, etc.) |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INTERNAL_ERROR` | Internal server error |
| `SERVICE_UNAVAILABLE` | Service temporarily unavailable |
| `AI_SERVICE_ERROR` | AI service error or timeout |
| `DATABASE_ERROR` | Database operation failed |

---

## SDKs and Code Examples

### JavaScript/TypeScript

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.bccb.example.com/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Set auth token
api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// Get micro-credentials
const response = await api.get('/credentials', {
  params: { status: 'PUBLISHED', page: 1, limit: 20 }
});

// Create micro-credential
const newCredential = await api.post('/credentials', {
  title: 'New Program',
  institutionId: 'uuid',
  // ... other fields
});
```

### Python

```python
import requests

class BCCBClient:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        })
    
    def get_credentials(self, status=None, page=1, limit=20):
        params = {'page': page, 'limit': limit}
        if status:
            params['status'] = status
        
        response = self.session.get(
            f'{self.base_url}/api/v1/credentials',
            params=params
        )
        return response.json()
    
    def create_credential(self, data):
        response = self.session.post(
            f'{self.base_url}/api/v1/credentials',
            json=data
        )
        return response.json()

# Usage
client = BCCBClient('https://api.bccb.example.com', 'your-token')
credentials = client.get_credentials(status='PUBLISHED')
```

---

## Webhooks (Future)

Webhook support for event notifications is planned for future releases.

**Planned Events:**
- `credential.published`
- `credential.updated`
- `recognition.created`
- `pathway.approved`
- `user.registered`

---

## Changelog

### Version 1.0 (January 2024)
- Initial API release
- Authentication endpoints
- CRUD operations for all resources
- AI recommendation endpoints
- Audit logging

---

## Support

For API issues or questions:
- GitHub Issues: https://github.com/adamsalah13/bccb/issues
- Email: support@bccb.example.com
- Documentation: https://docs.bccb.example.com

---

**Last Updated**: January 2024  
**API Version**: 1.0  
**Maintainers**: BCCB Platform Team
