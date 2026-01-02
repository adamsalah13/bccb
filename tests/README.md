# Testing Documentation

Comprehensive testing strategy and guidelines for the BCCB platform.

## Overview

The BCCB platform uses a multi-layered testing approach to ensure code quality, reliability, and maintainability.

## Testing Strategy

### Testing Pyramid

```
        /\
       /  \
      / E2E \          Few, high-level tests
     /______\
    /        \
   /Integration\      Moderate number of tests
  /____________\
 /              \
/   Unit Tests   \    Many, fast tests
/________________\
```

## Test Types

### 1. Unit Tests

**Purpose:** Test individual functions, components, and classes in isolation.

**Location:** `tests/unit/`

**Tools:**
- Jest - Test runner and assertion library
- React Testing Library - Component testing
- pytest - Python unit tests

**Coverage Target:** 80%+

**Example:**

```typescript
// tests/unit/utils/validation.test.ts
import { validateProgramCode } from '@bccb/shared/utils';

describe('validateProgramCode', () => {
  it('should validate correct program codes', () => {
    expect(validateProgramCode('BIOL-1010')).toBe(true);
    expect(validateProgramCode('CS-301')).toBe(true);
  });

  it('should reject invalid program codes', () => {
    expect(validateProgramCode('invalid')).toBe(false);
    expect(validateProgramCode('123-456')).toBe(false);
  });
});
```

### 2. Integration Tests

**Purpose:** Test interactions between components, services, and external systems.

**Location:** `tests/integration/`

**Tools:**
- Supertest - API testing
- Testcontainers - Database/Redis containers
- pytest - Python integration tests

**Coverage Target:** 60%+

**Example:**

```typescript
// tests/integration/api/credentials.test.ts
import request from 'supertest';
import { app } from '../../../apps/api/src/app';

describe('POST /api/credentials', () => {
  it('should create a new micro-credential', async () => {
    const response = await request(app)
      .post('/api/credentials')
      .send({
        title: 'Test Credential',
        programCode: 'TEST-101',
        institutionId: 'uuid',
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe('Test Credential');
  });
});
```

### 3. End-to-End (E2E) Tests

**Purpose:** Test complete user workflows through the UI.

**Location:** `tests/e2e/`

**Tools:**
- Playwright - Browser automation
- Cucumber (optional) - BDD scenarios

**Coverage Target:** Critical paths only

**Example:**

```typescript
// tests/e2e/credential-creation.spec.ts
import { test, expect } from '@playwright/test';

test('create micro-credential workflow', async ({ page }) => {
  await page.goto('/credentials/new');
  
  await page.fill('[name="title"]', 'Animal Cell Culture');
  await page.fill('[name="programCode"]', 'BIOL-2340');
  await page.selectOption('[name="credentialType"]', 'MICRO_CREDENTIAL');
  
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL(/\/credentials\/[a-f0-9-]+/);
  await expect(page.locator('h1')).toContainText('Animal Cell Culture');
});
```

## Running Tests

### All Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
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
npm test -- tests/unit/utils/validation.test.ts
```

### Integration Tests

```bash
# All integration tests
npm run test:integration

# Requires Docker for test containers
docker-compose -f docker-compose.test.yml up -d

# Run tests
npm run test:integration

# Cleanup
docker-compose -f docker-compose.test.yml down
```

### E2E Tests

```bash
# Install browsers first
npx playwright install

# Run E2E tests
npm run test:e2e

# Run in headed mode (see browser)
npm run test:e2e -- --headed

# Run specific test
npm run test:e2e -- tests/e2e/credential-creation.spec.ts

# Debug mode
npm run test:e2e -- --debug
```

### Python/AI Tests

```bash
# Navigate to AI engine
cd packages/ai-engine

# Run tests
pytest

# With coverage
pytest --cov=src --cov-report=html

# Specific test file
pytest tests/test_pathway_recommender.py

# With markers
pytest -m "not slow"  # Skip slow tests
```

## Test Structure

### Naming Conventions

```
tests/
├── unit/
│   ├── api/
│   │   └── services/
│   │       └── credential.service.test.ts
│   ├── web/
│   │   └── components/
│   │       └── CredentialCard.test.tsx
│   └── shared/
│       └── utils/
│           └── validation.test.ts
├── integration/
│   ├── api/
│   │   ├── credentials.test.ts
│   │   └── pathways.test.ts
│   └── ai/
│       └── recommendations.test.py
└── e2e/
    ├── credential-management.spec.ts
    ├── pathway-creation.spec.ts
    └── user-authentication.spec.ts
```

### File Naming

- Unit tests: `*.test.ts` or `*.test.tsx`
- Integration tests: `*.test.ts`
- E2E tests: `*.spec.ts`
- Python tests: `test_*.py`

## Writing Good Tests

### Follow AAA Pattern

```typescript
test('should calculate total credits', () => {
  // Arrange
  const pathway = createMockPathway({
    transferCredits: 3.0,
    additionalCredits: 1.5,
  });

  // Act
  const total = calculateTotalCredits(pathway);

  // Assert
  expect(total).toBe(4.5);
});
```

### Test One Thing

```typescript
// ✓ Good: Tests one behavior
test('should reject invalid email format', () => {
  expect(validateEmail('invalid')).toBe(false);
});

// ✗ Bad: Tests multiple things
test('should validate user input', () => {
  expect(validateEmail('invalid')).toBe(false);
  expect(validatePhone('123')).toBe(false);
  expect(validatePostal('ABC')).toBe(false);
});
```

### Use Descriptive Names

```typescript
// ✓ Good: Describes what and why
test('should return 404 when credential does not exist', () => {
  // ...
});

// ✗ Bad: Vague description
test('should handle error', () => {
  // ...
});
```

### Mock External Dependencies

```typescript
// Mock Prisma client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    microCredential: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  })),
}));

test('should fetch credential by ID', async () => {
  const mockCredential = { id: '123', title: 'Test' };
  prisma.microCredential.findUnique.mockResolvedValue(mockCredential);

  const result = await getCredentialById('123');
  
  expect(result).toEqual(mockCredential);
});
```

## Test Data Management

### Factories

Create reusable test data factories:

```typescript
// tests/factories/credential.factory.ts
export function createMockCredential(overrides = {}) {
  return {
    id: 'test-id',
    title: 'Test Credential',
    programCode: 'TEST-101',
    institutionId: 'inst-id',
    status: 'PUBLISHED',
    ...overrides,
  };
}
```

### Fixtures

Use fixtures for complex test data:

```typescript
// tests/fixtures/credentials.json
{
  "animalCellCulture": {
    "title": "Animal Cell Culture",
    "programCode": "BIOL-2340",
    "duration": 120
  }
}
```

## Code Coverage

### Coverage Requirements

- **Overall:** 80% minimum
- **Critical paths:** 95% minimum
- **Utility functions:** 90% minimum
- **UI components:** 75% minimum

### Viewing Coverage

```bash
# Generate coverage report
npm run test:coverage

# Open HTML report
open coverage/index.html
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
  },
};
```

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Push to main/develop branches
- Nightly builds

See `.github/workflows/ci.yml` for configuration.

## Best Practices

### 1. Test Isolation

Each test should be independent:

```typescript
beforeEach(() => {
  // Reset state before each test
  jest.clearAllMocks();
});

afterEach(async () => {
  // Cleanup after each test
  await clearDatabase();
});
```

### 2. Don't Test Implementation

Test behavior, not implementation:

```typescript
// ✓ Good: Tests behavior
test('should display user name', () => {
  render(<UserProfile user={mockUser} />);
  expect(screen.getByText('John Doe')).toBeInTheDocument();
});

// ✗ Bad: Tests implementation
test('should call getName method', () => {
  const spy = jest.spyOn(component, 'getName');
  component.render();
  expect(spy).toHaveBeenCalled();
});
```

### 3. Keep Tests Fast

- Mock external services
- Use in-memory databases when possible
- Run slow tests separately
- Parallelize test execution

### 4. Maintain Tests

- Update tests when requirements change
- Remove obsolete tests
- Refactor duplicated test code
- Keep tests readable

## Common Issues

### Flaky Tests

```typescript
// ✗ Bad: Race condition
test('should update after delay', () => {
  component.asyncUpdate();
  expect(component.state).toBe('updated'); // Fails intermittently
});

// ✓ Good: Wait for update
test('should update after delay', async () => {
  await component.asyncUpdate();
  expect(component.state).toBe('updated');
});
```

### Slow Tests

```typescript
// Mark slow tests
test.skip('should train AI model', () => {
  // Very slow test, skip in regular runs
});

// Or use markers in pytest
@pytest.mark.slow
def test_model_training():
    # Slow test
    pass
```

## Tools & Libraries

### JavaScript/TypeScript

- **Jest** - Test runner
- **Testing Library** - DOM testing utilities
- **Supertest** - HTTP assertions
- **MSW** - API mocking
- **Playwright** - E2E testing

### Python

- **pytest** - Test framework
- **pytest-cov** - Coverage plugin
- **pytest-mock** - Mocking utilities
- **faker** - Test data generation

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
- [pytest Documentation](https://docs.pytest.org/)

## Contributing

When adding tests:

1. Follow existing patterns
2. Write clear descriptions
3. Keep tests focused
4. Maintain high coverage
5. Document complex scenarios

## License

MIT License - See root LICENSE file
