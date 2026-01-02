# API Application

## Backend for BCCB Micro-Credentials Platform

A complete Node.js + Express + TypeScript REST API with comprehensive CRUD operations for micro-credentials, pathways, and recognition management.

## Features

- **RESTful API endpoints** for credentials, pathways, and recognition
- **PostgreSQL + Prisma ORM** for robust data management
- **TypeScript** for type safety
- **JWT Authentication** with role-based access control
- **Input Validation** using Zod schemas
- **Error Handling** with structured error responses
- **Rate Limiting** to prevent abuse
- **Logging** with Winston
- **CORS** configuration for frontend integration
- **Health Check** endpoint for monitoring

## Tech Stack

- Node.js 20+
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- Redis (optional, for caching)
- Zod (validation)
- Winston (logging)
- JWT (authentication)

## Project Structure

```
apps/api/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── controllers/           # Business logic
│   │   ├── credentialsController.ts
│   │   ├── pathwaysController.ts
│   │   └── recognitionController.ts
│   ├── middleware/            # Express middleware
│   │   ├── auth.ts           # Authentication & authorization
│   │   └── errorHandler.ts   # Error handling
│   ├── routes/               # API routes
│   │   ├── credentials.ts
│   │   ├── pathways.ts
│   │   └── recognition.ts
│   ├── types/                # TypeScript types
│   │   └── index.ts
│   ├── utils/                # Utilities
│   │   ├── db.ts            # Prisma client
│   │   ├── logger.ts        # Winston logger
│   │   └── validation.ts    # Zod schemas
│   └── server.ts            # Express app setup
├── package.json
├── tsconfig.json
└── .env.example

```

## Setup

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- npm 10+

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Generate Prisma client:
```bash
npm run db:generate
```

4. Run database migrations:
```bash
npm run db:migrate
```

5. Start development server:
```bash
npm run dev
```

The API will be available at http://localhost:3000

## API Endpoints

### Credentials

- `GET /api/credentials` - List all micro-credentials (public)
- `GET /api/credentials/:id` - Get credential by ID (public)
- `POST /api/credentials` - Create credential (authenticated)
- `PUT /api/credentials/:id` - Update credential (authenticated)
- `DELETE /api/credentials/:id` - Delete credential (admin)
- `POST /api/credentials/:id/publish` - Publish credential (admin)
- `POST /api/credentials/:id/archive` - Archive credential (admin)

### Pathways

- `GET /api/pathways` - List all pathways (public)
- `GET /api/pathways/:id` - Get pathway by ID (public)
- `GET /api/pathways/suggested/:microCredentialId` - Get AI-suggested pathways
- `POST /api/pathways` - Create pathway (authenticated)
- `PUT /api/pathways/:id` - Update pathway (authenticated)
- `DELETE /api/pathways/:id` - Delete pathway (admin)
- `POST /api/pathways/:id/approve` - Approve pathway (admin)
- `POST /api/pathways/:id/activate` - Activate pathway (admin)
- `POST /api/pathways/:id/suspend` - Suspend pathway (admin)

### Recognition

- `GET /api/recognition` - List all recognitions (public)
- `GET /api/recognition/:id` - Get recognition by ID (public)
- `GET /api/recognition/credential/:credentialId` - Get recognitions for a credential
- `GET /api/recognition/institution/:institutionId` - Get recognitions by institution
- `POST /api/recognition` - Create recognition (authenticated)
- `PUT /api/recognition/:id` - Update recognition (authenticated)
- `DELETE /api/recognition/:id` - Delete recognition (admin)
- `POST /api/recognition/:id/activate` - Activate recognition (admin)
- `POST /api/recognition/:id/deactivate` - Deactivate recognition (admin)

### Health Check

- `GET /health` - Health check endpoint

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles

- `USER` - Basic user access
- `PROGRAM_COORDINATOR` - Can create and edit credentials
- `INSTITUTION_ADMIN` - Full access to institution data
- `ADMIN` - Full system access

## Environment Variables

See `.env.example` for all required environment variables:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/microcredentials
JWT_SECRET=your_jwt_secret_here
CORS_ORIGIN=http://localhost:5173
```

## Development

### Available Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm start            # Start production server
npm run typecheck    # Run TypeScript type checking
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm test             # Run tests
```

### Database Operations

```bash
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
```

## Production Deployment

1. Build the application:
```bash
npm run build
```

2. Set production environment variables

3. Start the server:
```bash
npm start
```

## Error Handling

All errors are handled consistently with structured responses:

```json
{
  "status": "error",
  "message": "Error description"
}
```

HTTP status codes follow REST conventions:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Security Features

- Helmet.js for HTTP security headers
- CORS configuration
- Rate limiting
- JWT authentication
- Input validation with Zod
- SQL injection protection via Prisma ORM

## Contributing

Please follow the project's coding standards and ensure all tests pass before submitting pull requests.

## License

MIT

