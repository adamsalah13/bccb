# Shared Packages

Shared TypeScript types, utilities, and constants used across the BCCB platform.

## Overview

This package contains reusable code shared between the web frontend and API backend to ensure consistency and reduce duplication.

## Contents

### Types (`/types`)

Shared TypeScript type definitions and interfaces:

- **models/** - Database model types matching Prisma schema
- **api/** - API request/response types
- **common/** - Common utility types
- **enums/** - Shared enumerations

### Utilities (`/utils`)

Common utility functions:

- **validation.ts** - Input validation helpers
- **formatting.ts** - Data formatting utilities
- **date.ts** - Date manipulation functions
- **currency.ts** - Currency formatting
- **string.ts** - String manipulation utilities

### Constants (`/constants`)

Application-wide constants:

- **config.ts** - Configuration constants
- **messages.ts** - UI messages and labels
- **validation-rules.ts** - Validation rule constants
- **api-routes.ts** - API route paths

## Installation

This package is part of the monorepo workspace. It's automatically linked when you run:

```bash
npm install
```

## Usage

### In the API (Node.js)

```typescript
import { MicroCredentialType, ValidationError } from '@bccb/shared';
import { validateEmail, formatDate } from '@bccb/shared/utils';

// Use types
const credential: MicroCredentialType = {
  id: '123',
  title: 'Animal Cell Culture',
  // ...
};

// Use utilities
if (!validateEmail(email)) {
  throw new ValidationError('Invalid email');
}
```

### In the Web App (React)

```typescript
import { Institution, CredentialStatus } from '@bccb/shared';
import { formatCurrency, formatDate } from '@bccb/shared/utils';

// Use in components
const CredentialCard: React.FC<{ credential: MicroCredential }> = ({ credential }) => {
  return (
    <div>
      <h3>{credential.title}</h3>
      <p>Cost: {formatCurrency(credential.cost)}</p>
      <p>Duration: {credential.duration} hours</p>
    </div>
  );
};
```

## Development

### Adding New Types

1. Add type definitions to appropriate file in `/types`
2. Export from main index
3. Update version if needed

```typescript
// types/models/micro-credential.ts
export interface MicroCredential {
  id: string;
  title: string;
  // ... other fields
}

// index.ts
export * from './types/models/micro-credential';
```

### Adding New Utilities

1. Create utility function in `/utils`
2. Add comprehensive tests
3. Export from main index

```typescript
// utils/validation.ts
export function validateProgramCode(code: string): boolean {
  return /^[A-Z]{2,4}-\d{3,4}$/.test(code);
}

// index.ts
export * from './utils/validation';
```

## Testing

Run tests for shared package:

```bash
npm run test --workspace=packages/shared
```

## Type Generation from Prisma

Types are automatically generated from the Prisma schema:

```bash
npm run db:generate
```

This creates type-safe models in `node_modules/.prisma/client` which can be re-exported through this package.

## Best Practices

1. **Keep It Lean** - Only include truly shared code
2. **No Dependencies on Apps** - This package should not depend on web or api packages
3. **Type Safety** - All exports should be fully typed
4. **Documentation** - Add JSDoc comments for complex types/functions
5. **Versioning** - Follow semantic versioning for breaking changes

## Structure

```
packages/shared/
├── src/
│   ├── types/
│   │   ├── models/          # Database model types
│   │   ├── api/             # API types
│   │   └── common/          # Common types
│   ├── utils/
│   │   ├── validation.ts
│   │   ├── formatting.ts
│   │   └── date.ts
│   ├── constants/
│   │   ├── config.ts
│   │   └── messages.ts
│   └── index.ts             # Main export
├── tests/
│   └── utils/
├── package.json
├── tsconfig.json
└── README.md
```

## Contributing

When adding shared code:

1. Ensure it's used by at least 2 apps/packages
2. Add appropriate tests
3. Update this README if adding new categories
4. Keep backward compatibility in mind

## License

MIT License - See root LICENSE file
