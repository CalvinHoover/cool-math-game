# E2E Tests

## Prerequisites

1. Start the test database:
   ```bash
   docker compose up -d test_db
   ```

2. Ensure `.env.test` is present in the project root.

## Running tests

```bash
# Run all e2e tests (headless)
npm run test:e2e

# Run with UI for debugging
npm run test:e2e:ui

# Run a single spec file
npx playwright test tests/e2e/auth.spec.ts
```

## Architecture

- `global-setup.ts` — runs Prisma migrations and seeds topics/questions before the test suite.
- `global-teardown.ts` — truncates user-related tables after the suite to keep the test DB clean.
- `auth.spec.ts` — validates the signup flow.
- `practice.spec.ts` — validates login → practice → profile → logout.
