# Cool Math Game

A high-school level math education web application built with Next.js 16 App Router, Prisma ORM, PostgreSQL, and Tailwind CSS. Players complete single-player practice sessions across math topics, earn XP, unlock achievement badges, and track progress through a personal dashboard and profile page.

## Tech Stack

- **Framework**. Next.js 16 with App Router and Server Actions
- **Frontend**. React 19, Tailwind CSS 4, KaTeX for math rendering
- **Backend**. Next.js Server Actions and API Routes, JWT cookie sessions
- **Database**. PostgreSQL via Prisma ORM (local Docker or Supabase)
- **Testing**. Vitest for unit and component tests, Playwright for end-to-end tests

## Prerequisites

- Node.js and npm
- Docker Desktop (for local PostgreSQL)
- A Supabase account (optional, for shared cloud database)

## Environment Setup

1. Copy `.env.example` to `.env.local`
2. Fill in the required variables
   - `DATABASE_URL` for Prisma queries
   - `DIRECT_URL` for migrations and seeding
   - `JWT_SECRET` for signing session tokens

The `.env.local` file can hold both local and Supabase connection strings. Comment out the block you are not using.

## Running with Local PostgreSQL

For local development and testing without hitting a live cloud database.

1. Start the local database
   ```bash
   bash scripts/start-local-db.sh
   ```
   This starts a PostgreSQL 16 container via Docker Compose and pushes the Prisma schema.

2. Install dependencies
   ```bash
   npm install
   ```

3. Generate the Prisma client
   ```bash
   npx prisma generate
   ```

4. Seed the database with questions and achievements
   ```bash
   npx tsx prisma/seed/run.ts
   ```

5. Start the development server
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

6. Stop the local database when finished
   ```bash
   bash scripts/stop-local-db.sh
   ```

### Viewing the database

To browse tables with a visual GUI, run Prisma Studio.
```bash
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/coolmathgame?schema=public"
export DIRECT_URL="postgresql://postgres:postgres@localhost:5432/coolmathgame?schema=public"
npx prisma studio
```
Open `http://localhost:5555`.

## Running with Supabase

For shared development or production-like testing.

1. In `.env.local`, uncomment the Supabase connection strings and comment out the local ones.

2. Apply migrations manually via the Supabase SQL Editor. The free-tier Supabase pooler does not support PostgreSQL advisory locks, so `npx prisma migrate deploy` will time out. Generate migrations locally against your Docker database, then copy the generated SQL into the Supabase SQL Editor and run it.

3. Export the Supabase URLs and seed the database.
   ```bash
   export DATABASE_URL="your-supabase-pooler-url"
   export DIRECT_URL="your-supabase-direct-url"
   npx tsx prisma/seed/run.ts
   ```

4. Start the development server.
   ```bash
   npm run dev
   ```

For full deployment instructions with Vercel CLI, see `DEV.md`.

## Testing

Run the unit and component test suite with Vitest.
```bash
npm test
```

Run end-to-end tests with Playwright. The dev server must be running first.
```bash
npm run test:e2e
```

## UML Diagrams

### Auth Login (Sequence Diagram)

```mermaid
sequenceDiagram
    participant U as User
    participant LP as LoginPage
    participant AR as APIRoute
    participant AD as AuthDBAccess
    participant P as PrismaClient
    participant DB as PostgreSQL

    U->>LP: Enter email and password
    LP->>AR: POST /api/auth/login
    AR->>AD: findUserByEmail
    AD->>P: user.findUnique
    P->>DB: SELECT query
    DB-->>P: User row
    P-->>AD: User object
    AD-->>AR: User object
    AR->>AR: bcrypt.compare
    AR->>AR: signToken
    AR->>AR: setSessionCookie
    AR-->>LP: HTTP 200 OK
    LP-->>U: Redirect to dashboard
```

### User Profile (Entity Relation Diagram)

```mermaid
erDiagram
    USER {
        string id PK
        string username
        string email
        string password
        int elo
        datetime createdAt
        datetime updatedAt
    }

    TOPIC {
        string id PK
        string name
        string description
        datetime createdAt
        datetime updatedAt
    }

    USERTOPIC {
        string id PK
        string userId FK
        string topicId FK
        int xp
        int level
        datetime createdAt
        datetime updatedAt
    }

    PRACTICESESSION {
        string id PK
        string userId FK
        string topicId FK
        boolean completed
        int score
        int timeLimit
        datetime createdAt
        datetime updatedAt
    }

    ACHIEVEMENT {
        string id PK
        string slug UK
        string name
        string description
        string color
        string iconName
        datetime createdAt
    }

    USERACHIEVEMENT {
        string id PK
        string userId FK
        string achievementId FK
        datetime earnedAt
    }

    USER ||--o{ USERTOPIC : "tracks progress in"
    TOPIC ||--o{ USERTOPIC : "measured by"
    USER ||--o{ PRACTICESESSION : "completes"
    TOPIC ||--o{ PRACTICESESSION : "contains questions for"
    USER ||--o{ USERACHIEVEMENT : "earns"
    ACHIEVEMENT ||--o{ USERACHIEVEMENT : "awarded to"
```

### Practice Feature (Sequence Diagram)

```mermaid
sequenceDiagram
    participant U as User
    participant PS as PracticeSetup
    participant SA as Server Actions
    participant QA as QuestionDBAccess
    participant PA as PracticeDBAccess
    participant PB as PracticeBox
    participant PL as practiceLogic
    participant XL as XPLeveling
    participant AE as AchievementEngine

    U->>PS: Select topic and count
    PS->>SA: bootstrapPracticeSession
    SA->>QA: findQuestions
    QA-->>SA: Question list
    SA->>PA: createSession
    PA-->>SA: Session record
    SA-->>PS: Session ID and questions
    PS-->>U: Render PracticeBox
    U->>PB: Submit answer
    PB->>SA: verifyAnswer
    SA->>PA: updateSessionQuestion
    PA-->>SA: Updated attempts
    SA-->>PB: Correct or incorrect
    PB-->>U: Show feedback
    U->>PB: Finish session
    PB->>SA: completePracticeSession
    SA->>PL: getEarnedPoints
    PL-->>SA: Score total
    SA->>XL: getLevel
    XL-->>SA: Level info
    SA->>AE: checkAndAwardAchievements
    AE-->>SA: New badges
    SA-->>PB: XP earned and achievements
    PB-->>U: Show summary and toasts
```

## Contributors

- Carter handled sign up/login authentication and database schema.
- Max built the profile page UI and friends system.
- Aryan managed question seeding & generation, retrieval, friend search.
- Calvin handled duels functionality and deployment as repository owner.
- Practice mode, XP and leveling system, achievements, shared UI library, and infrastructure documentation
