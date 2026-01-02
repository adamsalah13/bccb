# Contributing to BCCB

Thank you for your interest in contributing to the AI-Native Micro-Credentials Platform (BCCB)! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Documentation](#documentation)
- [Community](#community)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of:
- Age, body size, disability, ethnicity, gender identity and expression
- Level of experience, education, socio-economic status
- Nationality, personal appearance, race, religion
- Sexual identity and orientation

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes:**
- Harassment, trolling, or discriminatory comments
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team. All complaints will be reviewed and investigated promptly and fairly.

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- Node.js 20+
- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Git
- Docker (optional but recommended)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/bccb.git
cd bccb
```

3. Add the upstream repository:

```bash
git remote add upstream https://github.com/adamsalah13/bccb.git
```

### Initial Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your local configuration

# Setup database
npm run db:migrate
npm run db:seed

# Verify setup
npm run typecheck
npm run lint
npm test
```

## Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

**Branch Naming Convention:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions/changes
- `chore/` - Maintenance tasks

### 2. Make Changes

- Write clean, maintainable code
- Follow coding standards (see below)
- Add tests for new functionality
- Update documentation as needed
- Keep commits focused and atomic

### 3. Test Your Changes

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Check code quality
npm run lint
npm run typecheck
npm run format
```

### 4. Commit Your Changes

See [Commit Messages](#commit-messages) section for guidelines.

```bash
git add .
git commit -m "feat: add pathway recommendation feature"
```

### 5. Keep Your Branch Updated

```bash
# Fetch latest changes
git fetch upstream

# Rebase your branch
git rebase upstream/main
```

### 6. Push and Create PR

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create pull request on GitHub
```

## Coding Standards

### TypeScript/JavaScript

#### Style Guide

- Use TypeScript for all new code
- Follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use ESLint and Prettier (configured in project)
- Prefer functional programming patterns
- Use async/await over callbacks

#### Code Examples

```typescript
// ✓ Good: Properly typed, clear naming
interface MicroCredential {
  id: string;
  title: string;
  credits: number;
}

async function getCredentialById(id: string): Promise<MicroCredential> {
  const credential = await prisma.microCredential.findUnique({
    where: { id },
  });
  
  if (!credential) {
    throw new NotFoundError(`Credential ${id} not found`);
  }
  
  return credential;
}

// ✗ Bad: No types, unclear naming
async function get(x) {
  const c = await prisma.microCredential.findUnique({ where: { id: x } });
  return c;
}
```

#### React Components

```typescript
// ✓ Good: Typed props, named export, documented
interface CredentialCardProps {
  credential: MicroCredential;
  onSelect?: (id: string) => void;
}

/**
 * Displays a micro-credential card with title, description, and actions.
 */
export function CredentialCard({ credential, onSelect }: CredentialCardProps) {
  return (
    <div className="credential-card">
      <h3>{credential.title}</h3>
      <p>{credential.description}</p>
      {onSelect && (
        <button onClick={() => onSelect(credential.id)}>
          Select
        </button>
      )}
    </div>
  );
}

// ✗ Bad: No types, default export, no documentation
export default function Card({ data, onClick }) {
  return <div onClick={onClick}>{data.title}</div>;
}
```

### Python

#### Style Guide

- Follow [PEP 8](https://pep8.org/)
- Use type hints
- Use docstrings (Google style)
- Use Black for formatting
- Use pylint for linting

#### Code Examples

```python
# ✓ Good: Type hints, docstrings, clear logic
from typing import List, Optional
from dataclasses import dataclass

@dataclass
class PathwayRecommendation:
    """Represents a recommended educational pathway."""
    pathway_id: str
    confidence_score: float
    reasoning: str

def recommend_pathways(
    credential_id: str,
    limit: int = 10
) -> List[PathwayRecommendation]:
    """
    Generate pathway recommendations for a micro-credential.
    
    Args:
        credential_id: The ID of the micro-credential
        limit: Maximum number of recommendations to return
        
    Returns:
        List of pathway recommendations sorted by confidence score
        
    Raises:
        ValueError: If credential_id is invalid
    """
    if not credential_id:
        raise ValueError("credential_id cannot be empty")
    
    # Implementation
    recommendations = []
    return recommendations[:limit]

# ✗ Bad: No types, no docs, unclear names
def rec(c, l=10):
    if not c:
        raise ValueError("bad")
    r = []
    return r[:l]
```

### SQL/Prisma

```prisma
// ✓ Good: Clear naming, indexes, relations
model MicroCredential {
  id          String   @id @default(uuid())
  title       String
  programCode String   @unique
  
  // Relations
  institution Institution @relation(fields: [institutionId], references: [id])
  
  @@index([institutionId])
  @@map("micro_credentials")
}

// ✗ Bad: Unclear names, no indexes
model MC {
  id  String @id
  t   String
  c   String
}
```

### CSS/Tailwind

```tsx
// ✓ Good: Semantic classes, organized
<div className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md">
  <h2 className="text-2xl font-bold text-gray-900">
    {title}
  </h2>
  <p className="text-gray-600">
    {description}
  </p>
</div>

// ✗ Bad: Inline styles, unclear structure
<div style={{ display: 'flex', padding: '20px' }}>
  <h2 style={{ fontSize: '24px' }}>{title}</h2>
</div>
```

## Testing Guidelines

### Test Coverage Requirements

- **New features:** 80% coverage minimum
- **Bug fixes:** Add regression test
- **Refactoring:** Maintain existing coverage

### Writing Tests

```typescript
// ✓ Good: Descriptive, focused, follows AAA pattern
describe('CredentialService', () => {
  describe('createCredential', () => {
    it('should create a new micro-credential with valid data', async () => {
      // Arrange
      const data = {
        title: 'Test Credential',
        programCode: 'TEST-101',
        institutionId: 'inst-123',
      };

      // Act
      const result = await credentialService.createCredential(data);

      // Assert
      expect(result).toHaveProperty('id');
      expect(result.title).toBe('Test Credential');
    });

    it('should throw ValidationError with invalid program code', async () => {
      // Arrange
      const data = { ...validData, programCode: 'invalid' };

      // Act & Assert
      await expect(
        credentialService.createCredential(data)
      ).rejects.toThrow(ValidationError);
    });
  });
});

// ✗ Bad: Unclear, tests multiple things
test('test1', async () => {
  const x = await create({ a: 'b' });
  expect(x).toBeTruthy();
  const y = await get(x.id);
  expect(y).toBeTruthy();
});
```

See [tests/README.md](tests/README.md) for detailed testing guidelines.

## Commit Messages

### Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, no logic change)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks
- `perf` - Performance improvements

### Examples

```bash
# Feature
feat(api): add pathway recommendation endpoint

Implement POST /api/pathways/recommend endpoint that uses
the AI engine to suggest optimal educational pathways.

Closes #123

# Bug fix
fix(web): correct credential status display

Status badge was showing wrong color for DRAFT status.
Updated color mapping in CredentialCard component.

Fixes #456

# Documentation
docs(readme): update installation instructions

Add section for Docker installation and update
prerequisites list.

# Breaking change
feat(api)!: change credential response format

BREAKING CHANGE: The API response structure for
/api/credentials has changed to include nested
institution object instead of just institutionId.

Migration guide: Update client code to access
credential.institution.id instead of
credential.institutionId.
```

### Best Practices

- Use imperative mood ("add" not "added")
- Keep subject line under 72 characters
- Capitalize subject line
- Don't end subject with period
- Explain *what* and *why*, not *how*
- Reference issues/PRs in footer

## Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] All tests pass locally
- [ ] Added tests for new features
- [ ] Updated documentation
- [ ] Commit messages follow convention
- [ ] Branch is up to date with main

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #123

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally
```

### Review Process

1. **Automated checks** must pass (CI/CD)
2. **At least one approval** required
3. **No unresolved conversations**
4. **Branch up to date** with main

### Addressing Feedback

- Respond to all review comments
- Make requested changes in new commits
- Mark conversations as resolved when addressed
- Request re-review when ready

### Merging

- Use **Squash and merge** for feature branches
- Use **Rebase and merge** for hotfixes
- Delete branch after merging

## Issue Reporting

### Bug Reports

Use the bug report template:

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment:**
- OS: [e.g. macOS 13]
- Browser: [e.g. Chrome 120]
- Version: [e.g. 1.0.0]

**Additional context**
Any other relevant information
```

### Feature Requests

Use the feature request template:

```markdown
**Problem Description**
What problem does this solve?

**Proposed Solution**
How would you solve it?

**Alternatives Considered**
Other approaches you've thought about

**Additional Context**
Mockups, examples, etc.
```

## Documentation

### When to Update Docs

- New features or APIs
- Changed behavior
- Breaking changes
- Setup/configuration changes

### Documentation Types

1. **Code comments** - Complex logic, algorithms
2. **JSDoc/Docstrings** - Function/class documentation
3. **README files** - Package/module documentation
4. **Wiki/Guides** - Tutorials, how-tos
5. **API docs** - Endpoint documentation

### Writing Guidelines

- Be clear and concise
- Include examples
- Keep up to date
- Use proper grammar
- Link to related docs

## Community

### Getting Help

- **GitHub Issues** - Bug reports, feature requests
- **Discussions** - Questions, ideas
- **Discord** - Real-time chat (if available)
- **Email** - For sensitive matters

### Ways to Contribute

Not just code! You can contribute by:

- Reporting bugs
- Suggesting features
- Improving documentation
- Reviewing pull requests
- Answering questions
- Writing tutorials
- Creating examples

### Recognition

Contributors are recognized in:
- GitHub contributors list
- Release notes
- Project documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Don't hesitate to ask! Open an issue or discussion if you're unsure about anything.

---

**Thank you for contributing to BCCB!** 🎉
