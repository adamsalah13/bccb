# Git Workflow

This guide describes our Git branching strategy, commit conventions, and pull request process for the BCCB project.

## Table of Contents

- [Branching Strategy](#branching-strategy)
- [Commit Conventions](#commit-conventions)
- [Pull Request Process](#pull-request-process)
- [Code Review Guidelines](#code-review-guidelines)
- [Common Git Commands](#common-git-commands)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Branching Strategy

We follow a **Git Flow** inspired branching model with some simplifications.

### Main Branches

#### `main`
- **Purpose**: Production-ready code
- **Protection**: Protected, requires PR reviews
- **Deployment**: Automatically deploys to production
- **Never commit directly to main**

#### `develop`
- **Purpose**: Integration branch for features
- **Protection**: Protected, requires PR reviews
- **Deployment**: Deploys to staging environment
- **Used for day-to-day development**

### Supporting Branches

#### Feature Branches (`feature/*`)
```bash
# Create feature branch from develop
git checkout develop
git pull upstream develop
git checkout -b feature/add-pathway-recommendations

# Work on your feature
git add .
git commit -m "feat: add pathway recommendations API"

# Push to your fork
git push origin feature/add-pathway-recommendations

# Create PR when ready
```

**Naming Convention**:
- `feature/short-description`
- `feature/issue-123-description`
- Examples: `feature/add-ai-recommendations`, `feature/credential-search`

**Lifecycle**:
1. Branch from `develop`
2. Develop and test feature
3. Create PR to `develop`
4. After merge, delete branch

#### Bug Fix Branches (`fix/*`)
```bash
# Create fix branch
git checkout develop
git checkout -b fix/credential-status-validation

# Fix the bug
git add .
git commit -m "fix: correct status validation logic"

# Push and create PR
git push origin fix/credential-status-validation
```

**Naming Convention**:
- `fix/short-description`
- `fix/issue-456-description`
- Examples: `fix/login-redirect`, `fix/database-connection`

#### Hotfix Branches (`hotfix/*`)
```bash
# Create hotfix from main for critical production bug
git checkout main
git pull upstream main
git checkout -b hotfix/security-vulnerability

# Fix the critical issue
git add .
git commit -m "fix: patch security vulnerability"

# Create PR to main (and backport to develop)
git push origin hotfix/security-vulnerability
```

**Naming Convention**:
- `hotfix/critical-issue`
- Used only for emergency production fixes

**Lifecycle**:
1. Branch from `main`
2. Fix critical issue
3. Create PR to `main`
4. After merge, also merge to `develop`

#### Release Branches (`release/*`)
```bash
# Create release branch from develop
git checkout develop
git pull upstream develop
git checkout -b release/v1.2.0

# Perform release tasks (version bumps, changelog)
npm version minor
git add .
git commit -m "chore: bump version to 1.2.0"

# Create PR to main
git push origin release/v1.2.0
```

**Naming Convention**:
- `release/v1.2.0`
- Used for preparing production releases

#### Other Branch Types

- `docs/*` - Documentation updates
- `refactor/*` - Code refactoring
- `test/*` - Adding or updating tests
- `chore/*` - Maintenance tasks

## Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat: add pathway recommendation endpoint` |
| `fix` | Bug fix | `fix: correct credential status validation` |
| `docs` | Documentation | `docs: update API authentication guide` |
| `style` | Code style (formatting) | `style: format code with prettier` |
| `refactor` | Code refactoring | `refactor: simplify credential service logic` |
| `test` | Tests | `test: add unit tests for pathway service` |
| `chore` | Maintenance | `chore: update dependencies` |
| `perf` | Performance | `perf: optimize database queries` |
| `ci` | CI/CD changes | `ci: add test coverage reporting` |
| `build` | Build system | `build: update webpack config` |
| `revert` | Revert commit | `revert: revert commit abc123` |

### Scopes

Common scopes in our project:

- `api` - Backend API changes
- `web` - Frontend web app
- `ai` - AI/ML service
- `db` - Database changes
- `auth` - Authentication/authorization
- `docs` - Documentation
- `infra` - Infrastructure
- `deps` - Dependencies

### Subject Line Rules

- Use imperative mood: "add" not "added" or "adds"
- Don't capitalize first letter
- No period at the end
- Keep under 72 characters
- Be descriptive but concise

### Examples

#### Simple Commit
```bash
git commit -m "feat(api): add pathway recommendation endpoint"
```

#### Commit with Body
```bash
git commit -m "feat(api): add pathway recommendation endpoint

Implement POST /api/v1/ai/pathways/recommend endpoint that uses
the AI engine to suggest optimal educational pathways based on
micro-credential similarities and historical data.

- Add recommendation service
- Integrate with AI engine
- Add input validation
- Add comprehensive tests"
```

#### Commit with Issue Reference
```bash
git commit -m "fix(web): correct credential status display

Status badge was showing wrong color for DRAFT status.
Updated color mapping in CredentialCard component.

Fixes #456"
```

#### Breaking Change
```bash
git commit -m "feat(api)!: change credential response format

BREAKING CHANGE: The API response structure for
/api/v1/credentials has changed to include nested
institution object instead of just institutionId.

Before:
{
  \"institutionId\": \"uuid\"
}

After:
{
  \"institution\": {
    \"id\": \"uuid\",
    \"name\": \"BCIT\"
  }
}

Migration: Update client code to access
credential.institution.id instead of credential.institutionId."
```

### Commit Message Best Practices

#### ✓ Good Commits

```bash
feat(api): add JWT token refresh endpoint
fix(web): prevent infinite loop in useEffect hook
docs: add deployment guide for Kubernetes
test(api): add integration tests for pathways API
refactor(ai): optimize recommendation algorithm
chore(deps): update React to v18.2.0
```

#### ✗ Bad Commits

```bash
update stuff
fix bug
WIP
asdf
fix
changes
```

### Commit Often

```bash
# ✓ Good: Small, focused commits
git commit -m "feat(api): add credential validation"
git commit -m "feat(api): add credential creation endpoint"
git commit -m "test(api): add tests for credential creation"

# ✗ Bad: Large, unfocused commit
git commit -m "add credential feature with validation, API endpoint, and tests"
```

## Pull Request Process

### Creating a Pull Request

1. **Ensure branch is up to date**
```bash
git fetch upstream
git rebase upstream/develop
```

2. **Push to your fork**
```bash
git push origin feature/my-feature
```

3. **Create PR on GitHub**
- Go to repository on GitHub
- Click "New Pull Request"
- Select your branch
- Fill in PR template

### PR Title

Follow commit convention format:
```
feat(api): add pathway recommendation endpoint
fix(web): correct status display bug
docs: update installation guide
```

### PR Description Template

```markdown
## Description
Brief description of changes and why they were made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Refactoring
- [ ] Performance improvement

## Related Issues
Closes #123
Relates to #456

## Changes Made
- Added pathway recommendation service
- Implemented AI integration
- Added comprehensive tests
- Updated API documentation

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

### Test Results
```
npm test
✓ All tests passing (125 total)
Coverage: 87%
```

## Screenshots (if applicable)
![Screenshot description](url)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally
- [ ] PR is focused and atomic
```

### Before Submitting PR

```bash
# Run all checks
npm run lint
npm run typecheck
npm test

# Format code
npm run format

# Build to ensure no errors
npm run build

# Review your changes
git diff develop...feature/my-feature
```

## Code Review Guidelines

### For Authors

**Before Requesting Review**:
- [ ] All tests pass
- [ ] Code is formatted
- [ ] Documentation is updated
- [ ] PR description is complete
- [ ] Branch is up to date with base
- [ ] No merge conflicts

**During Review**:
- Respond to all comments
- Make requested changes
- Mark conversations as resolved when addressed
- Re-request review when ready
- Be open to feedback

### For Reviewers

**What to Look For**:
- [ ] Code correctness and logic
- [ ] Test coverage
- [ ] Security implications
- [ ] Performance considerations
- [ ] Code readability
- [ ] Documentation completeness
- [ ] Follows style guidelines
- [ ] No unnecessary changes

**Review Comments**:

```markdown
# ✓ Good: Specific, constructive feedback
This function could benefit from error handling. What happens if the API request fails?

Suggest adding a try-catch block:
\`\`\`typescript
try {
  const data = await fetchData();
  return data;
} catch (error) {
  logger.error('Failed to fetch data', error);
  throw new ApiError('Data fetch failed');
}
\`\`\`

# ✗ Bad: Vague, unhelpful
This is wrong.
Bad code.
```

**Approval Checklist**:
- [ ] Code meets requirements
- [ ] Tests are comprehensive
- [ ] No obvious bugs
- [ ] Documentation is clear
- [ ] Security is considered
- [ ] Performance is acceptable
- [ ] Follows coding standards

### Review Process

1. **Author creates PR** → Status: Draft (optional)
2. **Author requests review** → Status: Review Requested
3. **Reviewers provide feedback** → Status: Changes Requested
4. **Author addresses feedback** → Back to Review Requested
5. **Reviewers approve** → Status: Approved
6. **Author merges** → Status: Merged
7. **Branch deleted** → Clean up

### Merge Methods

- **Squash and Merge** (default): Combine all commits into one
  - Use for feature branches
  - Keeps main/develop history clean
  
- **Rebase and Merge**: Replay commits on base branch
  - Use for hotfixes
  - Maintains individual commits

- **Merge Commit**: Create merge commit
  - Rarely used
  - For special cases only

## Common Git Commands

### Daily Workflow

```bash
# Start new feature
git checkout develop
git pull upstream develop
git checkout -b feature/my-feature

# Make changes
git add .
git commit -m "feat: add feature"

# Keep branch updated
git fetch upstream
git rebase upstream/develop

# Push changes
git push origin feature/my-feature

# After PR is merged
git checkout develop
git pull upstream develop
git branch -d feature/my-feature
git push origin --delete feature/my-feature
```

### Updating Your Branch

```bash
# Rebase on develop
git fetch upstream
git rebase upstream/develop

# If conflicts, resolve and continue
git add .
git rebase --continue

# Force push to update PR
git push origin feature/my-feature --force-with-lease
```

### Undoing Changes

```bash
# Undo uncommitted changes
git checkout -- filename
git restore filename

# Undo staged changes
git reset HEAD filename
git restore --staged filename

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Amend last commit message
git commit --amend -m "new message"

# Amend last commit (add forgotten file)
git add forgotten_file
git commit --amend --no-edit
```

### Stashing Changes

```bash
# Stash uncommitted changes
git stash

# Stash with message
git stash save "WIP: feature implementation"

# List stashes
git stash list

# Apply most recent stash
git stash pop

# Apply specific stash
git stash apply stash@{1}

# Delete stash
git stash drop stash@{1}
```

### Interactive Rebase

```bash
# Clean up commits before PR
git rebase -i HEAD~3

# In editor:
# pick abc123 feat: add feature
# squash def456 fix: typo
# fixup ghi789 refactor: cleanup

# Common commands:
# pick - keep commit
# squash - combine with previous
# fixup - combine, discard message
# reword - change message
# drop - remove commit
```

### Cherry-picking

```bash
# Apply specific commit to current branch
git cherry-pick abc123

# Cherry-pick multiple commits
git cherry-pick abc123 def456

# Cherry-pick without committing
git cherry-pick -n abc123
```

## Best Practices

### Commit Guidelines

1. **Commit atomic changes** - One logical change per commit
2. **Write meaningful messages** - Future you will thank you
3. **Commit frequently** - Don't wait until end of day
4. **Test before committing** - Ensure code works
5. **Keep commits focused** - No unrelated changes

### Branch Management

1. **Keep branches short-lived** - Merge within a week
2. **Update frequently** - Rebase on develop regularly
3. **Delete after merge** - Keep repository clean
4. **One feature per branch** - Don't mix unrelated work
5. **Descriptive names** - Use clear branch names

### Pull Requests

1. **Small PRs** - Easier to review (< 400 lines ideal)
2. **Complete description** - Help reviewers understand
3. **Link issues** - Reference related issues
4. **Add tests** - Ensure changes are tested
5. **Update docs** - Keep documentation current

### Code Reviews

1. **Review promptly** - Within 24 hours
2. **Be constructive** - Helpful, not critical
3. **Ask questions** - Clarify understanding
4. **Suggest improvements** - Provide examples
5. **Approve when ready** - Don't block unnecessarily

## Troubleshooting

### Merge Conflicts

```bash
# Update branch
git fetch upstream
git rebase upstream/develop

# If conflicts occur
# 1. Edit conflicted files
# 2. Remove conflict markers (<<<, ===, >>>)
# 3. Stage resolved files
git add resolved_file.ts

# Continue rebase
git rebase --continue

# Or abort and try merge instead
git rebase --abort
git merge upstream/develop
```

### Accidentally Committed to Wrong Branch

```bash
# If not pushed yet
git reset --soft HEAD~1
git checkout correct-branch
git add .
git commit -m "message"

# If already pushed
git checkout wrong-branch
git revert abc123
git push origin wrong-branch

git checkout correct-branch
git cherry-pick abc123
git push origin correct-branch
```

### Lost Commits

```bash
# View all commits including lost ones
git reflog

# Recover lost commit
git cherry-pick abc123

# Or reset to previous state
git reset --hard abc123
```

### Force Push Safety

```bash
# ✗ Dangerous: Can overwrite others' work
git push --force

# ✓ Safe: Only force push if no new commits
git push --force-with-lease

# Check what would be pushed
git push --dry-run
```

## Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/)
- [Pro Git Book](https://git-scm.com/book/en/v2)

## Quick Reference

```bash
# Common commands
git status                    # Check status
git branch                    # List branches
git checkout -b name          # Create branch
git add .                     # Stage all changes
git commit -m "message"       # Commit with message
git push origin branch        # Push to fork
git pull upstream develop     # Update from upstream
git rebase upstream/develop   # Rebase on develop
git log --oneline             # View commit history
git diff                      # View unstaged changes
git stash                     # Stash changes
git stash pop                 # Apply stashed changes

# Configuration
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global core.editor "code --wait"
git config --global init.defaultBranch main
```

---

**Remember**: Good Git hygiene makes collaboration smoother and code history clearer!
