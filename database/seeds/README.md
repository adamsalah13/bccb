# Database Seeds

This directory contains seed data for populating the BCCB database with initial and test data.

## Overview

Database seeds are used to:
- Populate initial reference data (institutions, enums)
- Create sample micro-credentials for development
- Generate test data for integration testing
- Provide demo data for presentations

## Structure

```
database/seeds/
├── data/
│   ├── institutions.json       # BC institutions and partners
│   ├── micro-credentials.json  # Sample credentials
│   ├── pathways.json          # Example pathways
│   ├── recognitions.json      # Recognition agreements
│   └── users.json             # Test users
├── scripts/
│   ├── 01-institutions.ts     # Seed institutions
│   ├── 02-credentials.ts      # Seed micro-credentials
│   ├── 03-outcomes.ts         # Seed learning outcomes
│   ├── 04-recognitions.ts     # Seed recognitions
│   ├── 05-pathways.ts         # Seed pathways
│   └── 06-users.ts            # Seed test users
├── run-seeds.ts               # Main seed runner
└── README.md
```

## Usage

### Running All Seeds

From the project root:

```bash
# Run all seeds in order
npm run db:seed

# Reset database and re-seed
npm run db:reset
```

### Running Specific Seeds

```bash
# Run only institution seeds
tsx database/seeds/scripts/01-institutions.ts

# Run only credentials
tsx database/seeds/scripts/02-credentials.ts
```

### Environment-Specific Seeds

```bash
# Development environment (includes test data)
NODE_ENV=development npm run db:seed

# Production environment (only essential data)
NODE_ENV=production npm run db:seed

# Test environment (minimal data for tests)
NODE_ENV=test npm run db:seed
```

## Seed Data Details

### 1. Institutions (`01-institutions.ts`)

Seeds BC post-secondary institutions:

- **Universities**: UBC, SFU, UVic, UNBC, etc.
- **Colleges**: Douglas, Langara, Camosun, etc.
- **Institutes**: BCIT, Emily Carr, etc.
- **External Partners**: Select institutions outside BC

**Data includes:**
- Institution name and code
- Type (University, College, Institute)
- Contact information
- Location details

### 2. Micro-Credentials (`02-credentials.ts`)

Seeds example micro-credentials:

**BCIT Examples:**
- Animal Cell Culture (case study from requirements)
- Digital Marketing Fundamentals
- Data Analytics Essentials
- Project Management Professional

**Other Institutions:**
- Sample programs from Douglas, Langara, SFU

**Data includes:**
- Program details (title, code, description)
- Duration, credits, cost
- Delivery mode and level
- Prerequisites

### 3. Learning Outcomes (`03-outcomes.ts`)

Seeds learning outcomes for each credential:

- Bloom's Taxonomy levels
- Outcome categories (knowledge, skills, competencies)
- AI-generated embeddings for semantic search
- Keywords for classification

**Example Outcome:**
```json
{
  "outcomeText": "Analyze cell culture techniques and identify best practices",
  "bloomLevel": "ANALYZE",
  "category": "SKILLS",
  "keywords": ["analysis", "cell culture", "techniques"]
}
```

### 4. Recognitions (`04-recognitions.ts`)

Seeds recognition agreements:

- Institution-to-institution recognitions
- Credit transfer agreements
- Badge and certificate mappings
- Transcript recording methods

**Example:**
```json
{
  "microCredentialId": "uuid",
  "recognizingInstitutionId": "ubc-id",
  "recognitionType": "PARTIAL_CREDIT",
  "creditValue": 3.0,
  "creditType": "ELECTIVE"
}
```

### 5. Pathways (`05-pathways.ts`)

Seeds educational pathways:

- Internal pathways (within same institution)
- External pathways (transfer between institutions)
- AI-suggested pathways with confidence scores

**Example:**
```json
{
  "name": "BCIT to UBC Transfer Pathway",
  "sourceInstitutionId": "bcit-id",
  "targetInstitutionId": "ubc-id",
  "microCredentialId": "credential-id",
  "transferCredits": 3.0,
  "confidenceScore": 0.85
}
```

### 6. Users (`06-users.ts`)

Seeds test users for different roles:

**Roles:**
- Admin (system administrator)
- Institution Admin (manages institution)
- Program Coordinator (manages programs)
- User (regular user)

**Test Users:**
```
admin@bccb.ca / Admin123!
coordinator@bcit.ca / Test123!
user@example.com / Test123!
```

⚠️ **Note:** User seeds only run in non-production environments

## Creating New Seeds

### 1. Create Seed File

Create a new TypeScript file in `database/seeds/scripts/`:

```typescript
// database/seeds/scripts/07-my-seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedMyData() {
  console.log('Seeding my data...');

  const data = [
    { field1: 'value1' },
    { field2: 'value2' },
  ];

  for (const item of data) {
    await prisma.myModel.upsert({
      where: { uniqueField: item.field1 },
      update: item,
      create: item,
    });
  }

  console.log('✓ My data seeded successfully');
}

if (require.main === module) {
  seedMyData()
    .catch((e) => {
      console.error('Error seeding data:', e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
```

### 2. Add to Seed Runner

Update `database/seeds/run-seeds.ts`:

```typescript
import { seedMyData } from './scripts/07-my-seed';

async function runSeeds() {
  // ... existing seeds
  await seedMyData();
  // ...
}
```

### 3. Prepare Data (Optional)

If using JSON data files, create in `database/seeds/data/`:

```json
// database/seeds/data/my-data.json
[
  {
    "field1": "value1",
    "field2": "value2"
  }
]
```

Load in seed script:

```typescript
import myData from '../data/my-data.json';
```

## Best Practices

### 1. Idempotency

Seeds should be idempotent (can run multiple times safely):

```typescript
// ✓ Good: Use upsert
await prisma.institution.upsert({
  where: { code: 'BCIT' },
  update: data,
  create: data,
});

// ✗ Bad: Direct create (fails on second run)
await prisma.institution.create({ data });
```

### 2. Order Dependencies

Run seeds in order of dependencies:
1. Reference data (institutions, enums)
2. Core entities (credentials)
3. Related entities (outcomes, prerequisites)
4. Associations (recognitions, pathways)
5. Users and permissions

### 3. Environment Awareness

Check environment before seeding sensitive data:

```typescript
if (process.env.NODE_ENV !== 'production') {
  // Seed test data
  await seedTestUsers();
}
```

### 4. Error Handling

Handle errors gracefully:

```typescript
try {
  await seedData();
  console.log('✓ Seeded successfully');
} catch (error) {
  console.error('✗ Seed failed:', error);
  throw error;
}
```

### 5. Transaction Safety

Use transactions for related data:

```typescript
await prisma.$transaction(async (tx) => {
  const credential = await tx.microCredential.create({...});
  await tx.learningOutcome.createMany({
    data: outcomes.map(o => ({
      ...o,
      microCredentialId: credential.id
    }))
  });
});
```

## Data Sources

Seed data is based on:

1. **BC Council on Admissions and Transfer (BCCAT)** requirements
2. **BCIT** Animal Cell Culture case study
3. **Real institutions** in British Columbia
4. **Synthetic data** for testing and demos

## Maintenance

### Updating Seeds

When updating seed data:

1. Update JSON files in `database/seeds/data/`
2. Run seeds locally to test
3. Verify no duplicate or conflicting data
4. Document significant changes

### Production Seeds

Production should only include:
- Essential reference data (institutions)
- Required enums and lookups
- No test users or sample data

Use environment checks:

```typescript
if (process.env.NODE_ENV === 'production') {
  // Only essential data
  return;
}
```

## Testing

Verify seeds work correctly:

```bash
# Reset and seed
npm run db:reset

# Verify data
npm run db:studio

# Run integration tests
npm run test:integration
```

## Troubleshooting

### "Unique constraint failed"

- Seeds are not idempotent
- Run `npm run db:reset` to clear database
- Use `upsert` instead of `create`

### "Foreign key constraint failed"

- Seeds running out of order
- Check dependencies between models
- Ensure parent records exist before children

### "Too slow"

- Use `createMany` for bulk inserts
- Use transactions
- Consider using raw SQL for large datasets

## Contributing

When adding new seeds:

1. Follow existing naming conventions
2. Add descriptive comments
3. Include realistic test data
4. Update this README
5. Test in all environments (dev, test, prod)

## License

MIT License - See root LICENSE file
