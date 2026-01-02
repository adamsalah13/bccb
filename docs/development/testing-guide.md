# Testing Guide

Comprehensive guide for writing and running tests in the BCCB platform.

## Table of Contents

- [Overview](#overview)
- [Testing Strategy](#testing-strategy)
- [Test Types](#test-types)
- [Writing Tests](#writing-tests)
- [Running Tests](#running-tests)
- [Test Data Management](#test-data-management)
- [Mocking and Stubbing](#mocking-and-stubbing)
- [Coverage Requirements](#coverage-requirements)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

BCCB uses a comprehensive testing strategy to ensure code quality and reliability across the stack.

### Testing Philosophy

1. **Test Behavior, Not Implementation** - Focus on what the code does, not how
2. **Test Isolation** - Each test should be independent
3. **Fast Feedback** - Tests should run quickly
4. **Maintainable** - Tests should be easy to understand and update
5. **Comprehensive** - Cover happy paths, edge cases, and error scenarios

### Tools

- **Jest** - JavaScript/TypeScript test runner
- **Testing Library** - React component testing
- **Supertest** - API endpoint testing
- **Playwright** - End-to-end browser testing
- **pytest** - Python testing framework

## Testing Strategy

### Testing Pyramid

```
           /\
          /  \
         / E2E \        ← Few (5-10% of tests)
        /______\          Slow, brittle, expensive
       /        \
      /Integration\     ← Some (20-30% of tests)
     /____________\       Medium speed, moderate cost
    /              \
   /   Unit Tests   \   ← Many (60-75% of tests)
  /________________\     Fast, stable, cheap
```

### Test Distribution

- **Unit Tests** (60-75%): Test individual functions and components
- **Integration Tests** (20-30%): Test module interactions
- **E2E Tests** (5-10%): Test critical user workflows

## Test Types

### Unit Tests

Test individual functions, components, and classes in isolation.

**Location**: `tests/unit/`

**Example - Testing a Service Function**:
```typescript
// apps/api/src/services/credential.service.ts
export async function calculateTotalCredits(
  credentials: MicroCredential[]
): Promise<number> {
  return credentials.reduce((sum, cred) => sum + (cred.credits || 0), 0);
}

// tests/unit/api/services/credential.service.test.ts
import { calculateTotalCredits } from '@/services/credential.service';
import { createMockCredential } from '@/tests/factories';

describe('CredentialService', () => {
  describe('calculateTotalCredits', () => {
    it('should calculate total credits for multiple credentials', () => {
      // Arrange
      const credentials = [
        createMockCredential({ credits: 3.0 }),
        createMockCredential({ credits: 1.5 }),
        createMockCredential({ credits: 2.5 }),
      ];

      // Act
      const total = calculateTotalCredits(credentials);

      // Assert
      expect(total).toBe(7.0);
    });

    it('should handle credentials with no credits', () => {
      const credentials = [
        createMockCredential({ credits: 3.0 }),
        createMockCredential({ credits: null }),
      ];

      const total = calculateTotalCredits(credentials);

      expect(total).toBe(3.0);
    });

    it('should return 0 for empty array', () => {
      expect(calculateTotalCredits([])).toBe(0);
    });
  });
});
```

**Example - Testing a React Component**:
```typescript
// apps/web/src/components/CredentialCard.tsx
interface CredentialCardProps {
  credential: MicroCredential;
  onSelect?: (id: string) => void;
}

export function CredentialCard({ credential, onSelect }: CredentialCardProps) {
  return (
    <div data-testid="credential-card">
      <h3>{credential.title}</h3>
      <p>{credential.description}</p>
      <span>{credential.credits} credits</span>
      {onSelect && (
        <button onClick={() => onSelect(credential.id)}>
          Select
        </button>
      )}
    </div>
  );
}

// tests/unit/web/components/CredentialCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { CredentialCard } from '@/components/CredentialCard';
import { createMockCredential } from '@/tests/factories';

describe('CredentialCard', () => {
  it('should display credential information', () => {
    const credential = createMockCredential({
      title: 'Test Credential',
      description: 'Test description',
      credits: 3.0,
    });

    render(<CredentialCard credential={credential} />);

    expect(screen.getByText('Test Credential')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('3 credits')).toBeInTheDocument();
  });

  it('should call onSelect when button clicked', () => {
    const credential = createMockCredential({ id: 'test-id' });
    const onSelect = jest.fn();

    render(<CredentialCard credential={credential} onSelect={onSelect} />);

    fireEvent.click(screen.getByText('Select'));

    expect(onSelect).toHaveBeenCalledWith('test-id');
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('should not render select button when onSelect is not provided', () => {
    const credential = createMockCredential();

    render(<CredentialCard credential={credential} />);

    expect(screen.queryByText('Select')).not.toBeInTheDocument();
  });
});
```

### Integration Tests

Test interactions between components, API endpoints, and database.

**Location**: `tests/integration/`

**Example - Testing API Endpoint**:
```typescript
// tests/integration/api/credentials.test.ts
import request from 'supertest';
import { app } from '@/app';
import { prisma } from '@/utils/db';
import { createTestUser, createTestInstitution } from '@/tests/helpers';

describe('POST /api/v1/credentials', () => {
  let authToken: string;
  let institutionId: string;

  beforeAll(async () => {
    // Setup test data
    const institution = await createTestInstitution();
    institutionId = institution.id;

    const user = await createTestUser({ role: 'PROGRAM_COORDINATOR' });
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: user.email, password: 'password' });
    authToken = response.body.data.access_token;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.microCredential.deleteMany();
    await prisma.institution.deleteMany();
    await prisma.user.deleteMany();
  });

  it('should create a new micro-credential with valid data', async () => {
    const credentialData = {
      title: 'Test Credential',
      description: 'Test description',
      programCode: 'TEST-101',
      institutionId,
      credentialType: 'MICRO_CREDENTIAL',
      deliveryMode: 'ONLINE',
      duration: 80,
      credits: 2.5,
      level: 'INTERMEDIATE',
    };

    const response = await request(app)
      .post('/api/v1/credentials')
      .set('Authorization', `Bearer ${authToken}`)
      .send(credentialData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.title).toBe('Test Credential');
    expect(response.body.data.programCode).toBe('TEST-101');

    // Verify in database
    const credential = await prisma.microCredential.findUnique({
      where: { id: response.body.data.id },
    });
    expect(credential).not.toBeNull();
    expect(credential?.title).toBe('Test Credential');
  });

  it('should return 400 for invalid data', async () => {
    const invalidData = {
      title: 'T',  // Too short
      programCode: 'TEST-101',
    };

    const response = await request(app)
      .post('/api/v1/credentials')
      .set('Authorization', `Bearer ${authToken}`)
      .send(invalidData)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 401 without authentication', async () => {
    const credentialData = {
      title: 'Test Credential',
      programCode: 'TEST-102',
    };

    await request(app)
      .post('/api/v1/credentials')
      .send(credentialData)
      .expect(401);
  });
});
```

### End-to-End Tests

Test complete user workflows through the browser.

**Location**: `tests/e2e/`

**Example - Testing User Flow**:
```typescript
// tests/e2e/credential-creation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Credential Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[name="email"]', 'admin@bcit.ca');
    await page.fill('[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should create a new micro-credential', async ({ page }) => {
    // Navigate to create page
    await page.goto('/credentials/new');

    // Fill form
    await page.fill('[name="title"]', 'Animal Cell Culture');
    await page.fill('[name="shortTitle"]', 'ACC');
    await page.fill('[name="programCode"]', 'BIOL-2340');
    await page.fill('[name="description"]', 'Learn cell culture techniques');
    await page.selectOption('[name="credentialType"]', 'MICRO_CREDENTIAL');
    await page.selectOption('[name="deliveryMode"]', 'HYBRID');
    await page.fill('[name="duration"]', '120');
    await page.fill('[name="credits"]', '3.0');
    await page.selectOption('[name="level"]', 'INTERMEDIATE');

    // Add learning outcome
    await page.click('button:has-text("Add Learning Outcome")');
    await page.fill('[name="outcomes[0].text"]', 'Demonstrate aseptic technique');
    await page.selectOption('[name="outcomes[0].bloomLevel"]', 'APPLY');

    // Submit
    await page.click('button[type="submit"]');

    // Verify redirect and success
    await expect(page).toHaveURL(/\/credentials\/[a-f0-9-]+/);
    await expect(page.locator('h1')).toContainText('Animal Cell Culture');
    await expect(page.locator('.status-badge')).toContainText('Draft');
  });

  test('should show validation errors for invalid input', async ({ page }) => {
    await page.goto('/credentials/new');

    // Submit without filling required fields
    await page.click('button[type="submit"]');

    // Check for validation errors
    await expect(page.locator('.error')).toContainText('Title is required');
    await expect(page.locator('.error')).toContainText('Program code is required');
  });
});
```

## Writing Tests

### Test Structure (AAA Pattern)

Every test should follow the **Arrange-Act-Assert** pattern:

```typescript
test('should do something', () => {
  // Arrange: Setup test data and dependencies
  const input = createTestData();
  const mockService = createMockService();

  // Act: Execute the code under test
  const result = performAction(input, mockService);

  // Assert: Verify the outcome
  expect(result).toEqual(expectedOutput);
});
```

### Descriptive Test Names

```typescript
// ✓ Good: Describes what is tested and expected outcome
test('should return 404 when credential does not exist', () => {});
test('should calculate total credits correctly for multiple credentials', () => {});
test('should throw ValidationError when email format is invalid', () => {});

// ✗ Bad: Vague or unclear
test('test1', () => {});
test('should work', () => {});
test('handles error', () => {});
```

### Test One Thing

```typescript
// ✓ Good: Tests single behavior
describe('validateEmail', () => {
  it('should return true for valid email', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  it('should return false for missing @', () => {
    expect(validateEmail('userexample.com')).toBe(false);
  });

  it('should return false for missing domain', () => {
    expect(validateEmail('user@')).toBe(false);
  });
});

// ✗ Bad: Tests multiple things
test('should validate all inputs', () => {
  expect(validateEmail('invalid')).toBe(false);
  expect(validatePassword('123')).toBe(false);
  expect(validatePhone('abc')).toBe(false);
});
```

## Running Tests

### All Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode (re-run on changes)
npm run test:watch
```

### Unit Tests

```bash
# All unit tests
npm run test:unit

# Specific workspace
npm run test:unit --workspace=apps/api
npm run test:unit --workspace=apps/web

# Specific file
npm test -- tests/unit/services/credential.service.test.ts

# With pattern matching
npm test -- --testNamePattern="calculateTotalCredits"
```

### Integration Tests

```bash
# Setup test database (first time)
docker-compose -f docker-compose.test.yml up -d

# Run integration tests
npm run test:integration

# Specific test
npm test -- tests/integration/api/credentials.test.ts

# Cleanup
docker-compose -f docker-compose.test.yml down -v
```

### E2E Tests

```bash
# Install browsers (first time)
npx playwright install

# Run E2E tests
npm run test:e2e

# Headed mode (see browser)
npm run test:e2e -- --headed

# Debug mode
npm run test:e2e -- --debug

# Specific test
npm run test:e2e -- tests/e2e/credential-creation.spec.ts

# Generate report
npm run test:e2e -- --reporter=html
```

### Python Tests

```bash
# Navigate to AI service
cd apps/ai-service

# Run all tests
pytest

# With coverage
pytest --cov=src --cov-report=html

# Specific test file
pytest tests/test_pathway_recommender.py

# Specific test function
pytest tests/test_pathway_recommender.py::test_recommend_pathways

# Skip slow tests
pytest -m "not slow"

# Verbose output
pytest -v
```

## Test Data Management

### Factories

Create reusable test data factories:

```typescript
// tests/factories/credential.factory.ts
import { MicroCredential } from '@prisma/client';

export function createMockCredential(
  overrides: Partial<MicroCredential> = {}
): MicroCredential {
  return {
    id: 'test-id',
    title: 'Test Credential',
    shortTitle: 'TC',
    description: 'Test description',
    programCode: 'TEST-101',
    institutionId: 'inst-id',
    credentialType: 'MICRO_CREDENTIAL',
    deliveryMode: 'ONLINE',
    duration: 80,
    credits: 2.5,
    level: 'INTERMEDIATE',
    status: 'PUBLISHED',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: new Date(),
    ...overrides,
  };
}

// Usage
const credential = createMockCredential({ title: 'Custom Title' });
```

### Fixtures

Use JSON fixtures for complex data:

```typescript
// tests/fixtures/credentials.json
{
  "animalCellCulture": {
    "title": "Animal Cell Culture",
    "programCode": "BIOL-2340",
    "duration": 120,
    "credits": 3.0,
    "learningOutcomes": [
      {
        "text": "Demonstrate aseptic technique",
        "bloomLevel": "APPLY"
      }
    ]
  }
}

// Load in tests
import credentialFixtures from '@/tests/fixtures/credentials.json';

const credential = credentialFixtures.animalCellCulture;
```

### Test Helpers

```typescript
// tests/helpers/auth.ts
export async function createTestUser(
  overrides: Partial<User> = {}
): Promise<User> {
  return await prisma.user.create({
    data: {
      email: `test-${Date.now()}@example.com`,
      password: await hashPassword('password'),
      firstName: 'Test',
      lastName: 'User',
      role: 'USER',
      institutionId: 'default-institution',
      ...overrides,
    },
  });
}

export async function getAuthToken(user: User): Promise<string> {
  const response = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: user.email, password: 'password' });
  
  return response.body.data.access_token;
}
```

## Mocking and Stubbing

### Mocking Prisma

```typescript
// __mocks__/@prisma/client.ts
export const prisma = {
  microCredential: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  // Other models...
};

// In test
import { prisma } from '@prisma/client';

jest.mock('@prisma/client');

test('should fetch credential', async () => {
  const mockCredential = createMockCredential();
  (prisma.microCredential.findUnique as jest.Mock).mockResolvedValue(mockCredential);

  const result = await getCredentialById('test-id');

  expect(prisma.microCredential.findUnique).toHaveBeenCalledWith({
    where: { id: 'test-id' },
  });
  expect(result).toEqual(mockCredential);
});
```

### Mocking External APIs

```typescript
// Use MSW (Mock Service Worker)
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('http://localhost:8000/api/recommend', (req, res, ctx) => {
    return res(
      ctx.json({
        recommendations: [
          { pathway_id: '1', confidence: 0.9 },
        ],
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('should fetch AI recommendations', async () => {
  const recommendations = await fetchRecommendations('cred-id');
  expect(recommendations).toHaveLength(1);
});
```

## Coverage Requirements

### Minimum Coverage

- **Overall**: 80%
- **Critical Business Logic**: 95%
- **Utility Functions**: 90%
- **UI Components**: 75%

### Viewing Coverage

```bash
# Generate coverage report
npm run test:coverage

# Open HTML report
open coverage/index.html
# or
xdg-open coverage/index.html  # Linux
```

### Coverage Configuration

```javascript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/**/index.ts',
  ],
  coverageThresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // Stricter for critical modules
    './src/services/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};
```

## Best Practices

### 1. Test Isolation

```typescript
// ✓ Good: Each test is independent
describe('CredentialService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await prisma.microCredential.deleteMany();
  });

  it('test 1', async () => {
    // ...
  });

  it('test 2', async () => {
    // ...
  });
});

// ✗ Bad: Tests depend on each other
let credentialId: string;

it('should create credential', async () => {
  const result = await createCredential(data);
  credentialId = result.id;  // Bad: shared state
});

it('should fetch credential', async () => {
  const result = await getCredential(credentialId);  // Depends on previous test
});
```

### 2. Don't Test Implementation Details

```typescript
// ✓ Good: Tests behavior
test('should display user name', () => {
  render(<UserProfile user={mockUser} />);
  expect(screen.getByText('John Doe')).toBeInTheDocument();
});

// ✗ Bad: Tests implementation
test('should set state correctly', () => {
  const component = mount(<UserProfile user={mockUser} />);
  expect(component.state('userName')).toBe('John Doe');
});
```

### 3. Keep Tests Fast

- Mock external dependencies
- Use in-memory database for unit tests
- Run E2E tests separately
- Parallelize test execution

### 4. Clean Up After Tests

```typescript
afterEach(async () => {
  // Clear database
  await prisma.$transaction([
    prisma.microCredential.deleteMany(),
    prisma.institution.deleteMany(),
  ]);
  
  // Reset mocks
  jest.clearAllMocks();
  
  // Clear cache
  await redis.flushdb();
});
```

## Troubleshooting

### Tests Failing Intermittently

```typescript
// Problem: Race conditions
test('should update state', () => {
  component.asyncUpdate();
  expect(component.state).toBe('updated');  // May fail
});

// Solution: Wait for async operations
test('should update state', async () => {
  await component.asyncUpdate();
  expect(component.state).toBe('updated');
});

// Or use waitFor from Testing Library
test('should update state', async () => {
  component.asyncUpdate();
  await waitFor(() => {
    expect(component.state).toBe('updated');
  });
});
```

### Database Connection Issues

```bash
# Check test database is running
docker-compose -f docker-compose.test.yml ps

# Reset test database
docker-compose -f docker-compose.test.yml down -v
docker-compose -f docker-compose.test.yml up -d

# Check connection
psql -U test_user -d test_db -h localhost
```

### Memory Leaks in Tests

```typescript
// Problem: Not cleaning up
test('should work', () => {
  const interval = setInterval(() => {}, 1000);
  // interval never cleared
});

// Solution: Clean up resources
test('should work', () => {
  const interval = setInterval(() => {}, 1000);
  // ... test code
  clearInterval(interval);
});

// Or use afterEach
let interval: NodeJS.Timer;

afterEach(() => {
  if (interval) clearInterval(interval);
});
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/)
- [Playwright](https://playwright.dev/docs/intro)
- [pytest](https://docs.pytest.org/en/stable/)
- [Testing Best Practices](https://testingjavascript.com/)

---

**Remember**: Good tests are readable, maintainable, and give you confidence in your code!
