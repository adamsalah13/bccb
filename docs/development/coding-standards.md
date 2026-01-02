# Coding Standards

This document defines the code style guidelines, best practices, and conventions for the BCCB project.

## Table of Contents

- [General Principles](#general-principles)
- [TypeScript/JavaScript](#typescriptjavascript)
- [React](#react)
- [Python](#python)
- [Prisma/SQL](#prismasql)
- [CSS/Tailwind](#csstailwind)
- [Documentation](#documentation)
- [File Organization](#file-organization)
- [Naming Conventions](#naming-conventions)
- [Code Review Checklist](#code-review-checklist)

## General Principles

### Code Quality Principles

1. **Readability First**: Code is read more than it's written
2. **Explicit Over Implicit**: Be clear about intent
3. **DRY (Don't Repeat Yourself)**: Extract reusable logic
4. **KISS (Keep It Simple)**: Avoid unnecessary complexity
5. **YAGNI (You Aren't Gonna Need It)**: Don't add unused features
6. **Single Responsibility**: Each function/class does one thing well

### Best Practices

- Write self-documenting code with clear naming
- Keep functions small and focused (< 50 lines ideal)
- Prefer composition over inheritance
- Handle errors explicitly, never silently fail
- Write tests for all business logic
- Use version control properly with atomic commits

## TypeScript/JavaScript

### Style Guide

Follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) with TypeScript extensions.

### Configuration

**ESLint**: `.eslintrc.json`
**Prettier**: `.prettierrc`
**TypeScript**: `tsconfig.json`

### Type Safety

#### Always Use Types

```typescript
// ✓ Good: Explicit types
interface MicroCredential {
  id: string;
  title: string;
  credits: number;
  status: CredentialStatus;
}

function getCredentialById(id: string): Promise<MicroCredential> {
  // Implementation
}

// ✗ Bad: Using 'any' or no types
function getCredentialById(id): any {
  // Implementation
}
```

#### Avoid 'any'

```typescript
// ✓ Good: Use specific types
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: ApiError;
}

// ✗ Bad: Using 'any'
function fetchData(): any {
  // Implementation
}

// If type is truly unknown, use 'unknown' and type guard
function processData(data: unknown) {
  if (typeof data === 'string') {
    // TypeScript knows data is string here
  }
}
```

#### Use Type Inference

```typescript
// ✓ Good: Let TypeScript infer when obvious
const count = 10;  // inferred as number
const items = ['a', 'b'];  // inferred as string[]

// ✓ Good: Explicit when needed
const credentials: MicroCredential[] = [];

// ✗ Bad: Unnecessary explicit type
const count: number = 10;
```

### Functions

#### Prefer Arrow Functions

```typescript
// ✓ Good: Arrow function
const add = (a: number, b: number): number => a + b;

// ✓ Good: Named function for complex logic
function calculateCredits(
  credentials: MicroCredential[]
): number {
  return credentials.reduce((sum, cred) => sum + cred.credits, 0);
}

// ✗ Bad: function keyword for simple operations
function add(a: number, b: number): number {
  return a + b;
}
```

#### Async/Await Over Callbacks

```typescript
// ✓ Good: async/await
async function fetchCredential(id: string): Promise<MicroCredential> {
  const credential = await prisma.microCredential.findUnique({
    where: { id },
  });
  
  if (!credential) {
    throw new NotFoundError(`Credential ${id} not found`);
  }
  
  return credential;
}

// ✗ Bad: callbacks
function fetchCredential(id: string, callback: Function) {
  prisma.microCredential.findUnique({ where: { id } }, (err, credential) => {
    if (err) return callback(err);
    callback(null, credential);
  });
}
```

### Error Handling

```typescript
// ✓ Good: Explicit error handling with custom errors
class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

async function createCredential(
  data: CreateCredentialDto
): Promise<MicroCredential> {
  // Validate input
  if (!data.title || data.title.length < 3) {
    throw new ValidationError('Title must be at least 3 characters', 'title');
  }
  
  try {
    return await prisma.microCredential.create({ data });
  } catch (error) {
    if (error.code === 'P2002') {
      throw new ConflictError('Program code already exists');
    }
    throw error;
  }
}

// ✗ Bad: Silent failure or generic errors
async function createCredential(data: any) {
  try {
    return await prisma.microCredential.create({ data });
  } catch (error) {
    console.log(error);  // Don't just log!
    return null;  // Don't hide errors!
  }
}
```

### Object and Array Operations

```typescript
// ✓ Good: Use modern array methods
const publishedCredentials = credentials.filter(c => c.status === 'PUBLISHED');
const titles = credentials.map(c => c.title);
const totalCredits = credentials.reduce((sum, c) => sum + c.credits, 0);

// ✓ Good: Destructuring
const { id, title, credits } = credential;
const [first, second, ...rest] = items;

// ✓ Good: Spread operator
const updated = { ...credential, status: 'PUBLISHED' };
const merged = [...array1, ...array2];

// ✗ Bad: Imperative loops for simple operations
const publishedCredentials = [];
for (let i = 0; i < credentials.length; i++) {
  if (credentials[i].status === 'PUBLISHED') {
    publishedCredentials.push(credentials[i]);
  }
}
```

### Imports

```typescript
// ✓ Good: Named imports, organized
import { Router } from 'express';
import { z } from 'zod';

import { prisma } from '@/utils/db';
import { logger } from '@/utils/logger';
import { authenticate } from '@/middleware/auth';

import type { Request, Response } from 'express';
import type { MicroCredential } from '@prisma/client';

// ✗ Bad: Default imports for everything, unorganized
import prisma from '@/utils/db';
import * as everything from 'express';
```

## React

### Component Structure

```typescript
// ✓ Good: Functional component with TypeScript
import React from 'react';
import { MicroCredential } from '@/types';

interface CredentialCardProps {
  credential: MicroCredential;
  onSelect?: (id: string) => void;
  className?: string;
}

/**
 * Displays a micro-credential card with title, credits, and actions.
 */
export function CredentialCard({ 
  credential, 
  onSelect,
  className = ''
}: CredentialCardProps) {
  return (
    <div className={`credential-card ${className}`}>
      <h3 className="text-xl font-bold">{credential.title}</h3>
      <p className="text-gray-600">{credential.description}</p>
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm">{credential.credits} credits</span>
        {onSelect && (
          <button 
            onClick={() => onSelect(credential.id)}
            className="btn-primary"
          >
            Select
          </button>
        )}
      </div>
    </div>
  );
}

// ✗ Bad: Class component, no types, default export
export default class Card extends React.Component {
  render() {
    return <div onClick={this.props.onClick}>{this.props.data.title}</div>;
  }
}
```

### Hooks

```typescript
// ✓ Good: Custom hooks with proper naming
function useCredentials(filters?: CredentialFilters) {
  const [credentials, setCredentials] = useState<MicroCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchCredentials() {
      try {
        const data = await api.getCredentials(filters);
        setCredentials(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCredentials();
  }, [filters]);

  return { credentials, loading, error };
}

// Usage
function CredentialList() {
  const { credentials, loading, error } = useCredentials({ status: 'PUBLISHED' });
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      {credentials.map(c => (
        <CredentialCard key={c.id} credential={c} />
      ))}
    </div>
  );
}
```

### State Management

```typescript
// ✓ Good: Use Redux Toolkit for global state
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CredentialState {
  items: MicroCredential[];
  selectedId: string | null;
  loading: boolean;
}

const credentialSlice = createSlice({
  name: 'credentials',
  initialState: {
    items: [],
    selectedId: null,
    loading: false,
  } as CredentialState,
  reducers: {
    setCredentials(state, action: PayloadAction<MicroCredential[]>) {
      state.items = action.payload;
    },
    selectCredential(state, action: PayloadAction<string>) {
      state.selectedId = action.payload;
    },
  },
});
```

## Python

### Style Guide

Follow [PEP 8](https://pep8.org/) and use type hints throughout.

### Type Hints

```python
# ✓ Good: Full type hints
from typing import List, Optional, Dict, Any
from dataclasses import dataclass

@dataclass
class PathwayRecommendation:
    """Represents a recommended educational pathway."""
    pathway_id: str
    confidence_score: float
    reasoning: str
    matched_outcomes: List[str]

def recommend_pathways(
    credential_id: str,
    target_institution_id: str,
    limit: int = 10,
    min_confidence: float = 0.6
) -> List[PathwayRecommendation]:
    """
    Generate pathway recommendations for a micro-credential.
    
    Args:
        credential_id: The ID of the micro-credential
        target_institution_id: The target institution ID
        limit: Maximum number of recommendations to return
        min_confidence: Minimum confidence score threshold
        
    Returns:
        List of pathway recommendations sorted by confidence score
        
    Raises:
        ValueError: If credential_id or institution_id is invalid
        DatabaseError: If database query fails
    """
    if not credential_id or not target_institution_id:
        raise ValueError("credential_id and institution_id are required")
    
    recommendations = _fetch_recommendations(credential_id, target_institution_id)
    filtered = [r for r in recommendations if r.confidence_score >= min_confidence]
    return sorted(filtered, key=lambda r: r.confidence_score, reverse=True)[:limit]

# ✗ Bad: No types, no docstring
def recommend_pathways(cred_id, inst_id, limit=10):
    if not cred_id:
        raise ValueError("bad input")
    recs = get_recs(cred_id)
    return recs[:limit]
```

### Docstrings

Use Google-style docstrings:

```python
# ✓ Good: Complete docstring
def calculate_similarity(
    text1: str,
    text2: str,
    method: str = "cosine"
) -> float:
    """
    Calculate semantic similarity between two texts.
    
    Uses word embeddings and specified similarity metric to compute
    a score between 0 and 1, where 1 indicates identical meaning.
    
    Args:
        text1: First text to compare
        text2: Second text to compare
        method: Similarity metric to use ("cosine", "euclidean", or "manhattan")
            Defaults to "cosine"
    
    Returns:
        Similarity score between 0 and 1
        
    Raises:
        ValueError: If texts are empty or method is invalid
        
    Examples:
        >>> calculate_similarity("hello world", "hi world")
        0.87
        
        >>> calculate_similarity("cat", "dog", method="cosine")
        0.64
    """
    # Implementation
```

### Error Handling

```python
# ✓ Good: Specific exceptions
class DataValidationError(Exception):
    """Raised when input data fails validation."""
    pass

class ModelNotFoundError(Exception):
    """Raised when requested ML model is not available."""
    pass

def load_model(model_name: str) -> Any:
    """Load machine learning model by name."""
    try:
        model_path = MODELS_DIR / f"{model_name}.pkl"
        if not model_path.exists():
            raise ModelNotFoundError(f"Model {model_name} not found")
        
        return joblib.load(model_path)
    except Exception as e:
        logger.error(f"Failed to load model {model_name}: {e}")
        raise

# ✗ Bad: Generic exceptions
def load_model(name):
    try:
        return joblib.load(f"{name}.pkl")
    except:  # Never use bare except!
        print("error")
        return None
```

## Prisma/SQL

### Schema Design

```prisma
// ✓ Good: Clear naming, proper indexes, relations
model MicroCredential {
  id              String            @id @default(uuid())
  title           String
  shortTitle      String?
  description     String
  programCode     String            @unique
  institutionId   String
  status          CredentialStatus  @default(DRAFT)
  credits         Float?
  duration        Int               // in hours
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  publishedAt     DateTime?

  // Relations
  institution     Institution       @relation(fields: [institutionId], references: [id], onDelete: Cascade)
  learningOutcomes LearningOutcome[]
  recognitions    Recognition[]
  pathways        Pathway[]

  // Indexes for performance
  @@index([institutionId])
  @@index([programCode])
  @@index([status])
  @@index([createdAt])
  @@map("micro_credentials")
}

// ✗ Bad: Unclear names, no indexes
model MC {
  id  String @id
  t   String
  d   String
  c   String
}
```

### Queries

```typescript
// ✓ Good: Type-safe, efficient queries
const credentials = await prisma.microCredential.findMany({
  where: {
    status: 'PUBLISHED',
    institutionId: institutionId,
  },
  include: {
    institution: {
      select: {
        id: true,
        name: true,
        code: true,
      },
    },
    learningOutcomes: {
      where: {
        isCore: true,
      },
      orderBy: {
        orderIndex: 'asc',
      },
    },
  },
  orderBy: {
    publishedAt: 'desc',
  },
  take: 20,
  skip: (page - 1) * 20,
});

// ✗ Bad: Over-fetching, no filtering
const credentials = await prisma.microCredential.findMany({
  include: {
    institution: true,  // Fetches all fields
    learningOutcomes: true,  // Fetches all outcomes
    recognitions: true,
    pathways: true,
  },
});
```

## CSS/Tailwind

### Utility-First Approach

```tsx
// ✓ Good: Tailwind utilities, semantic grouping
<div className="
  flex flex-col gap-4 
  p-6 
  bg-white rounded-lg shadow-md 
  hover:shadow-lg transition-shadow
">
  <h2 className="text-2xl font-bold text-gray-900">
    {title}
  </h2>
  <p className="text-gray-600 line-clamp-3">
    {description}
  </p>
  <div className="flex justify-between items-center mt-auto">
    <span className="text-sm text-gray-500">{credits} credits</span>
    <button className="
      px-4 py-2 
      bg-blue-600 text-white 
      rounded-md 
      hover:bg-blue-700 
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      transition-colors
    ">
      View Details
    </button>
  </div>
</div>

// ✗ Bad: Inline styles
<div style={{ 
  display: 'flex', 
  padding: '24px', 
  backgroundColor: 'white' 
}}>
  <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>{title}</h2>
</div>
```

### Component Classes

```typescript
// ✓ Good: Reusable class compositions with clsx
import clsx from 'clsx';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Button({ 
  variant = 'primary', 
  size = 'md',
  className,
  ...props 
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'rounded-md font-medium transition-colors focus:outline-none focus:ring-2',
        {
          'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
          'bg-gray-200 text-gray-900 hover:bg-gray-300': variant === 'secondary',
          'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-base': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
        },
        className
      )}
      {...props}
    />
  );
}
```

## Documentation

### Code Comments

```typescript
// ✓ Good: Explain WHY, not WHAT
// Retry failed requests with exponential backoff to handle transient network errors
const maxRetries = 3;
const backoffMs = 1000;

// ✓ Good: Document complex algorithms
/**
 * Calculate pathway recommendations using collaborative filtering.
 * 
 * Algorithm:
 * 1. Find similar credentials using cosine similarity on embeddings
 * 2. Aggregate pathways from similar credentials
 * 3. Score pathways based on similarity and historical success rate
 * 4. Filter by confidence threshold and return top N
 */
function calculateRecommendations() {
  // Implementation
}

// ✗ Bad: Obvious comments
// Increment counter by 1
counter++;

// Set status to published
status = 'PUBLISHED';
```

### JSDoc/TSDoc

```typescript
/**
 * Fetches micro-credentials with optional filtering and pagination.
 * 
 * @param filters - Optional filters for status, institution, etc.
 * @param pagination - Page number and items per page
 * @returns Promise resolving to paginated credentials
 * @throws {ValidationError} If pagination parameters are invalid
 * @throws {DatabaseError} If database query fails
 * 
 * @example
 * ```typescript
 * const result = await getCredentials(
 *   { status: 'PUBLISHED' },
 *   { page: 1, limit: 20 }
 * );
 * ```
 */
export async function getCredentials(
  filters?: CredentialFilters,
  pagination?: PaginationParams
): Promise<PaginatedResult<MicroCredential>> {
  // Implementation
}
```

## File Organization

### Directory Structure

```
apps/api/src/
├── controllers/      # Request handlers
├── middleware/       # Express middleware
├── routes/           # Route definitions
├── services/         # Business logic
├── utils/            # Utility functions
├── types/            # TypeScript types
├── config/           # Configuration
└── server.ts         # Entry point

apps/web/src/
├── components/       # React components
│   ├── common/      # Reusable components
│   ├── features/    # Feature-specific components
│   └── layout/      # Layout components
├── pages/            # Page components
├── hooks/            # Custom hooks
├── store/            # Redux store
├── services/         # API services
├── utils/            # Utility functions
├── types/            # TypeScript types
└── App.tsx           # Root component
```

### File Naming

```
// ✓ Good: Descriptive, consistent naming
credential-controller.ts
useCredentials.ts
CredentialCard.tsx
api.service.ts
validation.utils.ts

// ✗ Bad: Unclear, inconsistent
cred.ts
utils.ts
component1.tsx
helper.ts
```

## Naming Conventions

### Variables and Functions

```typescript
// ✓ Good: Descriptive camelCase
const credentialCount = 10;
const isPublished = true;
function calculateTotalCredits() {}
async function fetchCredentialById() {}

// ✗ Bad: Unclear abbreviations
const credCnt = 10;
const pub = true;
function calc() {}
function get() {}
```

### Constants

```typescript
// ✓ Good: UPPER_SNAKE_CASE for true constants
const MAX_RETRIES = 3;
const API_BASE_URL = 'https://api.example.com';
const DEFAULT_PAGE_SIZE = 20;

// Config objects use camelCase
const appConfig = {
  apiUrl: process.env.API_URL,
  timeout: 5000,
};
```

### Classes and Types

```typescript
// ✓ Good: PascalCase
class CredentialService {}
interface MicroCredential {}
type CredentialStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}
```

### Boolean Variables

```typescript
// ✓ Good: Use is/has/should prefixes
const isLoading = true;
const hasError = false;
const shouldRetry = true;
const canEdit = false;

// ✗ Bad: Ambiguous names
const loading = true;
const error = false;
```

## Code Review Checklist

Before submitting code for review:

- [ ] Code follows style guide and passes linter
- [ ] All functions have proper type annotations
- [ ] Error handling is explicit and appropriate
- [ ] No console.log statements (use logger)
- [ ] Tests are written and passing
- [ ] No commented-out code
- [ ] Documentation is updated
- [ ] No sensitive data (keys, passwords) in code
- [ ] Performance considerations addressed
- [ ] Security implications considered

## Tools and Automation

### Pre-commit Hooks

```bash
# Install husky
npm install --save-dev husky

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run lint && npm run typecheck"
```

### VS Code Settings

See [Development Setup Guide](development-setup.md#ide-configuration) for complete VS Code configuration.

## Resources

- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [PEP 8](https://pep8.org/)
- [Clean Code by Robert C. Martin](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)

---

**Remember**: These are guidelines, not absolute rules. Use judgment and discuss with the team when uncertain.
