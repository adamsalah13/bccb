# Error Handling

Comprehensive guide to error codes, handling strategies, and best practices for the BCCB API.

## Table of Contents

- [Overview](#overview)
- [Error Response Format](#error-response-format)
- [HTTP Status Codes](#http-status-codes)
- [Error Codes](#error-codes)
- [Error Categories](#error-categories)
- [Error Handling Strategies](#error-handling-strategies)
- [Client-Side Error Handling](#client-side-error-handling)
- [Server-Side Error Handling](#server-side-error-handling)
- [Best Practices](#best-practices)

## Overview

The BCCB API uses a consistent error format across all endpoints, making it easy to handle errors programmatically.

### Error Handling Principles

1. **Consistency**: All errors follow the same format
2. **Clarity**: Error messages are clear and actionable
3. **Detail**: Provide enough context to debug issues
4. **Security**: Don't expose sensitive information
5. **Standards**: Follow HTTP and REST conventions

## Error Response Format

### Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": [
      {
        "field": "fieldName",
        "message": "Field-specific error message",
        "value": "invalid-value"
      }
    ]
  },
  "metadata": {
    "timestamp": "2024-01-02T19:00:00Z",
    "request_id": "uuid",
    "path": "/api/v1/credentials"
  }
}
```

### Error Object Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Always `false` for errors |
| `error.code` | string | Machine-readable error code |
| `error.message` | string | Human-readable error description |
| `error.details` | array | Optional detailed error information |
| `metadata.timestamp` | string | ISO 8601 timestamp |
| `metadata.request_id` | string | Unique request identifier for tracking |
| `metadata.path` | string | API endpoint path |

## HTTP Status Codes

### 2xx Success (No Errors)

| Code | Status | Meaning |
|------|--------|---------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created successfully |
| 204 | No Content | Request succeeded with no response body |

### 4xx Client Errors

| Code | Status | Meaning | When to Use |
|------|--------|---------|-------------|
| 400 | Bad Request | Invalid request syntax or parameters | Malformed JSON, invalid parameters |
| 401 | Unauthorized | Missing or invalid authentication | No token, expired token, invalid token |
| 403 | Forbidden | Insufficient permissions | Valid auth but lacking required role |
| 404 | Not Found | Resource doesn't exist | Credential ID not found |
| 409 | Conflict | Resource conflict | Duplicate program code |
| 422 | Unprocessable Entity | Validation error | Business rule validation failed |
| 429 | Too Many Requests | Rate limit exceeded | Too many requests in time window |

### 5xx Server Errors

| Code | Status | Meaning | When to Use |
|------|--------|---------|-------------|
| 500 | Internal Server Error | Unexpected server error | Unhandled exception |
| 502 | Bad Gateway | Upstream service error | AI service unavailable |
| 503 | Service Unavailable | Service temporarily down | Maintenance mode, database down |
| 504 | Gateway Timeout | Upstream service timeout | AI service timeout |

## Error Codes

### Authentication Errors (AUTH_*)

| Code | HTTP Status | Description | Example |
|------|-------------|-------------|---------|
| `AUTHENTICATION_ERROR` | 401 | Authentication failed | Invalid credentials |
| `TOKEN_EXPIRED` | 401 | JWT token expired | Access token expired |
| `TOKEN_INVALID` | 401 | Invalid JWT token | Malformed token |
| `TOKEN_MISSING` | 401 | Authorization header missing | No Authorization header |
| `AUTHORIZATION_ERROR` | 403 | Insufficient permissions | USER trying to delete credential |
| `ACCOUNT_DISABLED` | 403 | User account disabled | User marked as inactive |

**Example**:
```json
{
  "success": false,
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "Your session has expired. Please log in again."
  },
  "metadata": {
    "timestamp": "2024-01-02T19:00:00Z",
    "request_id": "uuid"
  }
}
```

### Validation Errors (VALIDATION_*)

| Code | HTTP Status | Description | Example |
|------|-------------|-------------|---------|
| `VALIDATION_ERROR` | 400/422 | Input validation failed | Invalid email format |
| `REQUIRED_FIELD_MISSING` | 422 | Required field not provided | Missing 'title' field |
| `INVALID_FORMAT` | 422 | Field format incorrect | Invalid date format |
| `VALUE_OUT_OF_RANGE` | 422 | Value outside valid range | Credits must be 0-10 |
| `INVALID_ENUM_VALUE` | 422 | Invalid enum value | Invalid status value |

**Example**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Input validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format",
        "value": "not-an-email"
      },
      {
        "field": "credits",
        "message": "Must be between 0 and 10",
        "value": 15
      }
    ]
  },
  "metadata": {
    "timestamp": "2024-01-02T19:00:00Z",
    "request_id": "uuid"
  }
}
```

### Resource Errors (RESOURCE_*)

| Code | HTTP Status | Description | Example |
|------|-------------|-------------|---------|
| `NOT_FOUND` | 404 | Resource not found | Credential ID doesn't exist |
| `RESOURCE_CONFLICT` | 409 | Resource conflict | Duplicate program code |
| `RESOURCE_LOCKED` | 409 | Resource locked for editing | Credential being edited |
| `RESOURCE_DELETED` | 410 | Resource was deleted | Archived credential |

**Example**:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Credential with ID 'abc-123' not found"
  },
  "metadata": {
    "timestamp": "2024-01-02T19:00:00Z",
    "request_id": "uuid",
    "path": "/api/v1/credentials/abc-123"
  }
}
```

### Database Errors (DB_*)

| Code | HTTP Status | Description | Example |
|------|-------------|-------------|---------|
| `DATABASE_ERROR` | 500 | Database operation failed | Query timeout |
| `CONSTRAINT_VIOLATION` | 409 | Database constraint violated | Foreign key violation |
| `DUPLICATE_KEY` | 409 | Unique constraint violated | Program code already exists |
| `CONNECTION_ERROR` | 503 | Database connection failed | Cannot connect to database |

**Example**:
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_KEY",
    "message": "A credential with program code 'BIOL-1010' already exists"
  },
  "metadata": {
    "timestamp": "2024-01-02T19:00:00Z",
    "request_id": "uuid"
  }
}
```

### Rate Limiting Errors (RATE_*)

| Code | HTTP Status | Description | Example |
|------|-------------|-------------|---------|
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests | Exceeded 1000 req/hour |
| `QUOTA_EXCEEDED` | 429 | API quota exceeded | Monthly limit reached |

**Example**:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retry_after": 3600
  },
  "metadata": {
    "timestamp": "2024-01-02T19:00:00Z",
    "request_id": "uuid"
  }
}
```

### External Service Errors (SERVICE_*)

| Code | HTTP Status | Description | Example |
|------|-------------|-------------|---------|
| `AI_SERVICE_ERROR` | 502 | AI service error | ML model failed |
| `AI_SERVICE_TIMEOUT` | 504 | AI service timeout | Request took too long |
| `EXTERNAL_SERVICE_ERROR` | 502 | External service error | Third-party API failed |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable | System maintenance |

**Example**:
```json
{
  "success": false,
  "error": {
    "code": "AI_SERVICE_TIMEOUT",
    "message": "AI service request timed out. Please try again."
  },
  "metadata": {
    "timestamp": "2024-01-02T19:00:00Z",
    "request_id": "uuid"
  }
}
```

### Internal Errors (INTERNAL_*)

| Code | HTTP Status | Description | Example |
|------|-------------|-------------|---------|
| `INTERNAL_ERROR` | 500 | Unexpected server error | Unhandled exception |
| `CONFIGURATION_ERROR` | 500 | Server misconfiguration | Missing environment variable |
| `NOT_IMPLEMENTED` | 501 | Feature not implemented | Planned feature |

**Example**:
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred. Our team has been notified."
  },
  "metadata": {
    "timestamp": "2024-01-02T19:00:00Z",
    "request_id": "uuid"
  }
}
```

## Error Categories

### Retryable Errors

These errors may succeed if retried:

- `RATE_LIMIT_EXCEEDED` - Retry after waiting
- `SERVICE_UNAVAILABLE` - Retry with backoff
- `AI_SERVICE_TIMEOUT` - Retry with longer timeout
- `DATABASE_ERROR` - May be temporary
- `CONNECTION_ERROR` - May resolve

**Retry Strategy**:
```typescript
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3
): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      
      // Don't retry on client errors (4xx except 429)
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        return response;
      }
      
      // Retry on server errors (5xx) and 429
      if (response.status >= 500 || response.status === 429) {
        if (i === maxRetries - 1) return response;
        
        // Exponential backoff
        const delay = Math.pow(2, i) * 1000;
        await sleep(delay);
        continue;
      }
      
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(Math.pow(2, i) * 1000);
    }
  }
  
  throw new Error('Max retries exceeded');
}
```

### Non-Retryable Errors

These errors won't be fixed by retrying:

- `AUTHENTICATION_ERROR` - Fix credentials
- `AUTHORIZATION_ERROR` - User lacks permissions
- `VALIDATION_ERROR` - Fix input data
- `NOT_FOUND` - Resource doesn't exist
- `DUPLICATE_KEY` - Already exists

## Error Handling Strategies

### Client-Side Error Handling

#### TypeScript/JavaScript

```typescript
interface ApiError {
  code: string;
  message: string;
  details?: Array<{
    field: string;
    message: string;
    value?: any;
  }>;
}

class ApiClient {
  async request<T>(url: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      
      if (!response.ok) {
        throw new ApiRequestError(
          data.error.code,
          data.error.message,
          response.status,
          data.error.details
        );
      }
      
      return data.data;
    } catch (error) {
      if (error instanceof ApiRequestError) {
        throw error;
      }
      throw new NetworkError('Network request failed', error);
    }
  }
  
  handleError(error: ApiRequestError) {
    switch (error.code) {
      case 'TOKEN_EXPIRED':
        // Refresh token and retry
        return this.refreshTokenAndRetry();
      
      case 'AUTHORIZATION_ERROR':
        // Redirect to unauthorized page
        window.location.href = '/unauthorized';
        break;
      
      case 'VALIDATION_ERROR':
        // Show validation errors to user
        this.showValidationErrors(error.details);
        break;
      
      case 'NOT_FOUND':
        // Show not found message
        this.showNotFoundMessage();
        break;
      
      case 'RATE_LIMIT_EXCEEDED':
        // Show rate limit message
        this.showRateLimitMessage(error.retryAfter);
        break;
      
      default:
        // Show generic error message
        this.showGenericError(error.message);
    }
  }
}
```

#### React Error Boundary

```typescript
class ErrorBoundary extends React.Component<Props, State> {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error reporting service
    logErrorToService(error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <ErrorDisplay
          error={this.state.error}
          onRetry={() => this.setState({ hasError: false, error: null })}
        />
      );
    }
    
    return this.props.children;
  }
}
```

### Server-Side Error Handling

#### Express Error Middleware

```typescript
import { Request, Response, NextFunction } from 'express';

// Custom error classes
class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number,
    public details?: any[]
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ValidationError extends ApiError {
  constructor(message: string, details?: any[]) {
    super('VALIDATION_ERROR', message, 422, details);
  }
}

class NotFoundError extends ApiError {
  constructor(message: string) {
    super('NOT_FOUND', message, 404);
  }
}

class AuthenticationError extends ApiError {
  constructor(message: string) {
    super('AUTHENTICATION_ERROR', message, 401);
  }
}

// Error handling middleware
function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error
  logger.error('API Error', {
    error: err,
    path: req.path,
    method: req.method,
    body: req.body,
    user: req.user?.id
  });
  
  // Handle known API errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details
      },
      metadata: {
        timestamp: new Date().toISOString(),
        request_id: req.id,
        path: req.path
      }
    });
  }
  
  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    return handlePrismaError(err, req, res);
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_INVALID',
        message: 'Invalid authentication token'
      },
      metadata: {
        timestamp: new Date().toISOString(),
        request_id: req.id
      }
    });
  }
  
  // Handle unknown errors
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : err.message
    },
    metadata: {
      timestamp: new Date().toISOString(),
      request_id: req.id
    }
  });
}

// Prisma error handler
function handlePrismaError(err: any, req: Request, res: Response) {
  switch (err.code) {
    case 'P2002':
      // Unique constraint violation
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_KEY',
          message: `${err.meta.target} already exists`
        },
        metadata: {
          timestamp: new Date().toISOString(),
          request_id: req.id
        }
      });
    
    case 'P2025':
      // Record not found
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Record not found'
        },
        metadata: {
          timestamp: new Date().toISOString(),
          request_id: req.id
        }
      });
    
    default:
      return res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Database operation failed'
        },
        metadata: {
          timestamp: new Date().toISOString(),
          request_id: req.id
        }
      });
  }
}
```

## Best Practices

### For API Consumers

1. **Always Check Response Status**
   ```typescript
   if (!response.ok) {
     // Handle error
   }
   ```

2. **Handle All Error Cases**
   ```typescript
   try {
     const data = await api.getCredential(id);
   } catch (error) {
     if (error.code === 'NOT_FOUND') {
       // Handle not found
     } else if (error.code === 'UNAUTHORIZED') {
       // Handle unauthorized
     } else {
       // Handle other errors
     }
   }
   ```

3. **Display User-Friendly Messages**
   ```typescript
   function getErrorMessage(code: string): string {
     const messages = {
       'NOT_FOUND': 'The credential you\'re looking for doesn\'t exist.',
       'VALIDATION_ERROR': 'Please check your input and try again.',
       'RATE_LIMIT_EXCEEDED': 'Too many requests. Please wait a moment.'
     };
     return messages[code] || 'An unexpected error occurred.';
   }
   ```

4. **Log Errors for Debugging**
   ```typescript
   logger.error('API request failed', {
     code: error.code,
     message: error.message,
     url: url,
     method: method
   });
   ```

5. **Implement Retry Logic for Transient Errors**
   ```typescript
   async function fetchWithRetry(fn, retries = 3) {
     for (let i = 0; i < retries; i++) {
       try {
         return await fn();
       } catch (error) {
         if (i === retries - 1 || !isRetryable(error)) {
           throw error;
         }
         await sleep(Math.pow(2, i) * 1000);
       }
     }
   }
   ```

### For API Developers

1. **Use Appropriate Status Codes**
2. **Provide Clear Error Messages**
3. **Include Actionable Details**
4. **Log All Errors**
5. **Don't Expose Sensitive Information**
6. **Test Error Scenarios**

## Next Steps

- [API Overview](api-overview.md) - Learn about API architecture
- [Authentication](authentication.md) - Understand authentication flow
- [API Endpoints](endpoints.md) - Detailed endpoint documentation

---

**Remember**: Good error handling improves user experience and makes debugging easier!
