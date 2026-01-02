# Authentication

Complete guide to authentication and authorization in the BCCB API.

## Table of Contents

- [Overview](#overview)
- [Authentication Flow](#authentication-flow)
- [JWT Tokens](#jwt-tokens)
- [User Roles and Permissions](#user-roles-and-permissions)
- [API Endpoints](#api-endpoints)
- [Token Management](#token-management)
- [Security Best Practices](#security-best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

The BCCB API uses **JWT (JSON Web Tokens)** for authentication and **Role-Based Access Control (RBAC)** for authorization.

### Authentication Methods

- **JWT Bearer Tokens** - Primary authentication method
- **Refresh Tokens** - For obtaining new access tokens
- **API Keys** - Planned for service-to-service authentication

### Key Features

- 🔒 Secure JWT-based authentication
- 🔑 Role-based access control (RBAC)
- ⏰ Automatic token expiration
- 🔄 Token refresh mechanism
- 🛡️ Password hashing with bcrypt
- 🚫 Token blacklisting (planned)

## Authentication Flow

### Standard Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Database
    
    Client->>API: POST /auth/login (email, password)
    API->>Database: Verify credentials
    Database-->>API: User data
    API-->>Client: Access token + Refresh token
    
    Client->>API: GET /credentials (with access token)
    API->>API: Verify token
    API-->>Client: Credentials data
    
    Note over Client,API: Access token expires
    
    Client->>API: POST /auth/refresh (refresh token)
    API->>API: Verify refresh token
    API-->>Client: New access token
```

### Step-by-Step Flow

1. **User Registration**
   - User signs up with email and password
   - Password is hashed using bcrypt
   - User record created in database

2. **User Login**
   - User provides email and password
   - API verifies credentials
   - API generates access token and refresh token
   - Tokens returned to client

3. **Making Authenticated Requests**
   - Client includes access token in Authorization header
   - API validates token on each request
   - If valid, request proceeds
   - If invalid/expired, 401 Unauthorized returned

4. **Token Refresh**
   - When access token expires, use refresh token
   - Request new access token
   - Continue making requests with new token

## JWT Tokens

### Token Structure

JWT tokens consist of three parts: Header, Payload, and Signature.

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.     ← Header
eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2.   ← Payload
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c   ← Signature
```

### Access Token Payload

```json
{
  "sub": "user-uuid",              // Subject (user ID)
  "email": "user@example.com",     // User email
  "role": "PROGRAM_COORDINATOR",   // User role
  "institutionId": "inst-uuid",    // Institution ID
  "iat": 1704216000,               // Issued at
  "exp": 1704219600                // Expires at
}
```

### Token Types

#### Access Token
- **Purpose**: Authenticate API requests
- **Expiration**: 15 minutes (default)
- **Storage**: Memory or sessionStorage (never localStorage)
- **Usage**: Include in Authorization header

#### Refresh Token
- **Purpose**: Obtain new access tokens
- **Expiration**: 7 days (default)
- **Storage**: HttpOnly cookie (recommended) or secure storage
- **Usage**: Only for /auth/refresh endpoint

### Token Expiration

| Token Type | Default Expiration | Configurable |
|------------|-------------------|--------------|
| Access Token | 15 minutes | Yes (JWT_EXPIRES_IN) |
| Refresh Token | 7 days | Yes (JWT_REFRESH_EXPIRES_IN) |

## User Roles and Permissions

### Role Hierarchy

```
ADMIN
  └── INSTITUTION_ADMIN
        └── PROGRAM_COORDINATOR
              └── USER
```

### Role Definitions

#### USER
**Description**: Basic authenticated user

**Permissions**:
- View published credentials
- View institutions
- View pathways
- View public data

**Use Case**: Students, researchers browsing catalog

#### PROGRAM_COORDINATOR
**Description**: Can manage credentials for their institution

**Permissions**:
- All USER permissions
- Create/edit credentials
- Create/edit learning outcomes
- Create pathways
- Publish credentials (draft → review → published)

**Use Case**: Faculty members, program coordinators

#### INSTITUTION_ADMIN
**Description**: Administrative access within institution

**Permissions**:
- All PROGRAM_COORDINATOR permissions
- Manage institution settings
- Manage users within institution
- Create recognitions
- Approve pathways
- View analytics

**Use Case**: Department heads, registrars

#### ADMIN
**Description**: Platform-wide administrative access

**Permissions**:
- All INSTITUTION_ADMIN permissions
- Manage all institutions
- Manage all users
- Access all data
- System configuration
- View audit logs

**Use Case**: Platform administrators

### Permission Matrix

| Action | USER | PROGRAM_COORDINATOR | INSTITUTION_ADMIN | ADMIN |
|--------|------|---------------------|-------------------|-------|
| View published credentials | ✓ | ✓ | ✓ | ✓ |
| Create credentials | ✗ | ✓ | ✓ | ✓ |
| Edit own credentials | ✗ | ✓ | ✓ | ✓ |
| Edit any credentials | ✗ | ✗ | ✓* | ✓ |
| Publish credentials | ✗ | ✓ | ✓ | ✓ |
| Delete credentials | ✗ | ✗ | ✓* | ✓ |
| Create pathways | ✗ | ✓ | ✓ | ✓ |
| Approve pathways | ✗ | ✗ | ✓ | ✓ |
| Create recognitions | ✗ | ✗ | ✓ | ✓ |
| Manage users | ✗ | ✗ | ✓* | ✓ |
| View audit logs | ✗ | ✗ | ✓* | ✓ |

\* Within own institution only

## API Endpoints

### Register

Create a new user account.

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "firstName": "Jane",
  "lastName": "Smith",
  "institutionId": "uuid"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "newuser@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "USER",
    "institutionId": "uuid"
  }
}
```

### Login

Authenticate and obtain tokens.

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** (200 OK):
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
      "role": "PROGRAM_COORDINATOR",
      "institutionId": "uuid"
    }
  }
}
```

### Refresh Token

Obtain a new access token using refresh token.

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 900
  }
}
```

### Logout

Invalidate current tokens.

```http
POST /api/v1/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response** (204 No Content)

### Get Current User

Get authenticated user profile.

```http
GET /api/v1/users/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response** (200 OK):
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

## Token Management

### Storing Tokens

#### Client-Side (Web)

```typescript
// ✓ Good: Store access token in memory
class AuthService {
  private accessToken: string | null = null;
  
  setAccessToken(token: string) {
    this.accessToken = token;
  }
  
  getAccessToken(): string | null {
    return this.accessToken;
  }
}

// ✓ Good: Store refresh token in HttpOnly cookie
// Set cookie on backend:
res.cookie('refresh_token', refreshToken, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});

// ✗ Bad: Never store tokens in localStorage
localStorage.setItem('token', accessToken);  // Vulnerable to XSS!
```

#### Mobile Apps

```typescript
// Use secure storage
import * as SecureStore from 'expo-secure-store';

// Store token
await SecureStore.setItemAsync('access_token', accessToken);

// Retrieve token
const token = await SecureStore.getItemAsync('access_token');
```

### Using Tokens

```typescript
// Include in Authorization header
const response = await fetch('https://api.bccb.example.com/api/v1/credentials', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});
```

### Automatic Token Refresh

```typescript
class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  
  async request(url: string, options: RequestInit) {
    let response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${this.accessToken}`
      }
    });
    
    // If unauthorized, try to refresh
    if (response.status === 401) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        // Retry original request with new token
        response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${this.accessToken}`
          }
        });
      } else {
        // Refresh failed, redirect to login
        window.location.href = '/login';
      }
    }
    
    return response;
  }
  
  private async refreshAccessToken(): Promise<boolean> {
    try {
      const response = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: this.refreshToken })
      });
      
      if (response.ok) {
        const data = await response.json();
        this.accessToken = data.data.access_token;
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }
}
```

### Token Validation

Server-side token validation:

```typescript
import jwt from 'jsonwebtoken';

function verifyToken(token: string): UserPayload {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as UserPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthenticationError('Token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthenticationError('Invalid token');
    }
    throw error;
  }
}
```

## Security Best Practices

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (recommended)

### Password Hashing

```typescript
import bcrypt from 'bcryptjs';

// Hash password on registration
async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Verify password on login
async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
```

### Token Security

1. **Short-Lived Access Tokens**: 15 minutes expiration
2. **Secure Storage**: Never in localStorage
3. **HTTPS Only**: Always use HTTPS in production
4. **Token Rotation**: Refresh tokens regularly
5. **Revocation**: Implement token blacklist (planned)

### CORS Configuration

```typescript
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,  // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

// Auth endpoints have stricter limits
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many authentication attempts'
});

app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);
```

### Input Validation

```typescript
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

// Validate in middleware
function validateLogin(req, res, next) {
  try {
    loginSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid input' });
  }
}
```

## Troubleshooting

### Common Issues

#### 401 Unauthorized

**Problem**: Token is invalid or expired

**Solution**:
```typescript
// Check token expiration
const decoded = jwt.decode(token);
if (decoded.exp * 1000 < Date.now()) {
  // Token expired, refresh it
  await refreshAccessToken();
}
```

#### 403 Forbidden

**Problem**: Insufficient permissions

**Solution**:
```typescript
// Check user role
if (user.role !== 'ADMIN') {
  throw new ForbiddenError('Admin access required');
}
```

#### Token Not Being Sent

**Problem**: Authorization header missing

**Solution**:
```typescript
// Ensure token is included
const response = await fetch(url, {
  headers: {
    'Authorization': `Bearer ${token}`,  // Don't forget Bearer prefix
    'Content-Type': 'application/json'
  }
});
```

#### CORS Errors

**Problem**: Cross-origin requests blocked

**Solution**:
```typescript
// Backend: Configure CORS properly
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Frontend: Include credentials
fetch(url, {
  credentials: 'include',
  headers: { ... }
});
```

### Testing Authentication

```bash
# Login and save token
TOKEN=$(curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bcit.ca","password":"admin123"}' \
  | jq -r '.data.access_token')

# Use token in requests
curl http://localhost:3000/api/v1/credentials \
  -H "Authorization: Bearer $TOKEN"

# Refresh token
NEW_TOKEN=$(curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refresh_token\":\"$REFRESH_TOKEN\"}" \
  | jq -r '.data.access_token')
```

## Next Steps

- [API Overview](api-overview.md) - Learn about API architecture
- [Error Handling](error-handling.md) - Understand error responses
- [API Endpoints](endpoints.md) - Detailed endpoint documentation

---

**Security Notice**: Never commit secrets, tokens, or passwords to version control!
