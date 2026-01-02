# Database Layer

Complete database implementation for the BCCB Micro-Credentials Platform.

## Structure

```
database/
├── migrations/           # Prisma migration files
├── schema/              # Prisma schema definition
├── seeds/               # Database seed scripts
│   ├── seed.ts         # Main seed orchestrator
│   ├── institutions.seed.ts
│   ├── micro-credentials.seed.ts
│   ├── pathways.seed.ts
│   ├── recognitions.seed.ts
│   └── users.seed.ts
└── utils/               # Database utilities
    ├── client.ts       # Prisma client singleton
    ├── connection.ts   # Connection management
    └── helpers.ts      # Query helpers
```

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Docker (optional, for local development)

### Setup

1. **Start PostgreSQL** (using Docker):
   ```bash
   docker compose up -d postgres
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Generate Prisma Client**:
   ```bash
   npm run db:generate
   ```

4. **Run migrations**:
   ```bash
   npm run db:migrate
   ```

5. **Seed the database**:
   ```bash
   npm run db:seed
   ```

## Available Scripts

### Migration Commands

- `npm run db:migrate` - Run migrations in development mode
- `npm run db:migrate:create` - Create a new migration (schema changes only)
- `npm run db:migrate:deploy` - Deploy migrations in production
- `npm run db:generate` - Generate Prisma Client from schema

### Seeding Commands

- `npm run db:seed` - Seed the database with sample data
- `npm run db:reset` - Reset database and re-seed (⚠️ destructive!)

### Database Management

- `npm run db:studio` - Open Prisma Studio (GUI for database)

## Database Schema

The schema includes the following models:

### Core Models

- **Institution** - Post-secondary institutions in BC
- **MicroCredential** - Micro-credential programs
- **LearningOutcome** - Learning outcomes for credentials
- **Recognition** - Credit recognition agreements
- **Pathway** - Transfer pathways between institutions
- **Prerequisite** - Prerequisites for credentials

### Supporting Models

- **User** - System users with roles
- **AuditLog** - Audit trail for changes

## Seed Data

The seed scripts populate the database with realistic sample data:

### Institutions (5)
- BCIT, UBC, Douglas College, SFU, Langara College

### Micro-Credentials (15)
Sample credentials across various disciplines:
- Animal Cell Culture Techniques
- Digital Marketing Fundamentals
- Data Analytics with Python
- Project Management Essentials
- Cloud Computing Essentials
- And 10 more...

### Pathways (15)
Transfer pathways between institutions with:
- Credit transfer agreements
- Articulation pathways
- AI-suggested pathways
- Internal and external pathways

### Recognitions (10)
Recognition agreements including:
- Full credit transfers
- Partial credit recognitions
- Equivalencies
- Exemptions
- Advanced standing

### Users (5)
Test users with different roles:
- System Administrator
- Institution Admins (BCIT, UBC)
- Program Coordinator
- Regular User

**Test User Credentials:**
```
admin@bccb.ca / Admin123!
bcit.admin@bcit.ca / BcitAdmin123!
coordinator@bcit.ca / Coordinator123!
ubc.admin@ubc.ca / UbcAdmin123!
user@example.com / User123!
```

⚠️ **Note**: User seeds only run in non-production environments.

## Database Utilities

### Prisma Client Singleton

```typescript
import { prisma } from './database/utils/client';

// Use prisma client in your code
const institutions = await prisma.institution.findMany();
```

### Connection Management

```typescript
import { 
  connect, 
  disconnect, 
  testConnection, 
  healthCheck 
} from './database/utils/connection';

// Test connection
await testConnection();

// Health check with latency
const health = await healthCheck();
console.log(`Database latency: ${health.latency}ms`);
```

### Query Helpers

```typescript
import { 
  findManyWithCount,
  createPagination,
  safeUpsert 
} from './database/utils/helpers';

// Paginated queries
const result = await findManyWithCount(
  prisma.microCredential,
  { status: 'PUBLISHED' },
  { page: 1, pageSize: 20 }
);

// Safe upsert with error handling
await safeUpsert(
  prisma.institution,
  { code: 'BCIT' },
  institutionData
);
```

## Development Workflow

### Making Schema Changes

1. Edit `database/schema/schema.prisma`
2. Create migration:
   ```bash
   npm run db:migrate:create
   ```
3. Apply migration:
   ```bash
   npm run db:migrate
   ```
4. Update seed data if needed

### Adding New Seeds

1. Create seed file in `database/seeds/`:
   ```typescript
   // database/seeds/my-data.seed.ts
   import { prisma } from '../utils/client';
   
   export async function seedMyData() {
     // Seed implementation
   }
   ```

2. Add to seed orchestrator in `database/seeds/seed.ts`:
   ```typescript
   import { seedMyData } from './my-data.seed';
   
   async function seed() {
     // ...
     await seedMyData();
     // ...
   }
   ```

3. Test your seed:
   ```bash
   npm run db:seed
   ```

## Production Deployment

### Database Setup

1. Create production database
2. Set `DATABASE_URL` environment variable
3. Run migrations:
   ```bash
   NODE_ENV=production npm run db:migrate:deploy
   ```

### Seeding Production

⚠️ **Important**: Only essential reference data should be seeded in production.

The seed scripts automatically skip:
- Test users
- Sample credentials (optional)
- Development-only data

## Troubleshooting

### Connection Issues

If you can't connect to the database:

1. Verify PostgreSQL is running:
   ```bash
   docker compose ps
   ```

2. Check connection string in `.env`:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/microcredentials
   ```

3. Test connection:
   ```bash
   docker compose exec postgres pg_isready -U user
   ```

### Migration Errors

If migrations fail:

1. Check migration status:
   ```bash
   npx prisma migrate status --schema=database/schema/schema.prisma
   ```

2. Reset database (development only):
   ```bash
   npm run db:reset
   ```

### Seed Errors

If seeding fails:

1. Check for foreign key violations
2. Ensure migrations have been run
3. Verify data integrity in seed files

## Best Practices

### Schema Design

- Always add indexes for foreign keys
- Use enums for fixed value sets
- Include `createdAt` and `updatedAt` timestamps
- Use soft deletes (`isActive`) when appropriate

### Migrations

- Keep migrations small and focused
- Test migrations on a copy of production data
- Never edit existing migrations
- Always review migration SQL before deploying

### Seeding

- Make seeds idempotent (use upsert)
- Respect data dependencies (institutions before credentials)
- Include realistic, diverse sample data
- Check environment before seeding sensitive data

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Database Schema Diagram](../docs/database-schema.md)

## License

MIT License - See root LICENSE file
