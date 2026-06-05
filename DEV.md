# Ways to test and deploy
 
**Database**
- *Local Postgres* (Docker Compose) — for local development and testing
- *Supabase* (production / shared) — live cloud database
 
**Application Server**
- *Local* (`npm run dev`) — runs Next.js on `localhost:3000`
- *Vercel* (production) — hosts the live Next.js app

## Local PostgreSQL Setup (Docker) + Local server (`npm run dev`)

For manual testing without hitting the live Supabase instance, a local Postgres 16 container is available via Docker Compose.

### Prerequisites

Install Docker Desktop for Windows from [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop).

During setup, **enable the WSL 2 backend** when prompted. After installation:

1. Open Docker Desktop
2. **Settings → General** → check **"Use the WSL 2 based engine"**
3. **Settings → Resources → WSL Integration** → toggle **Ubuntu-24.04** ON
4. Click **Apply & Restart**

Verify from your WSL terminal:

```bash
docker --version
docker compose version
```

If `docker` is not found, try one of the following:
- Fully quit and restart Docker Desktop
- Run `wsl --shutdown` from PowerShell, then reopen your WSL terminal
- Run `sudo usermod -aG docker $USER` inside WSL, then exit and reopen the terminal

### Start the local database

```bash
bash scripts/start-local-db.sh
```

This script will:
- Start a Postgres 16 container (`docker compose up -d`)
- Wait for Postgres to be ready
- Push the Prisma schema to the local database (`npx prisma db push`)

### Then run `npm run dev` to start the local server

### Stop the local database

```bash
bash scripts/stop-local-db.sh
```

This runs `docker compose down` to stop and remove the container. Data is persisted in a named Docker volume (`pgdata`) so it survives restarts.

### View / edit database contents

```bash
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/coolmathgame?schema=public"
export DIRECT_URL="postgresql://postgres:postgres@localhost:5432/coolmathgame?schema=public"
npx prisma studio
```

Open `http://localhost:5555` for a visual GUI of all tables.

## Switching between local and Supabase

The `.env.local` file contains both connection strings. To use the local database, ensure the local `DATABASE_URL` and `DIRECT_URL` lines are **uncommented** and the Supabase lines above them are **commented out**.

```env
# --- Supabase (production / shared) ---
# DATABASE_URL="postgresql://postgres.<ref>:<password>@..."
# DIRECT_URL="postgresql://postgres.<ref>:<password>@..."

# --- Local Docker Postgres (for manual testing) ---
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/coolmathgame?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/coolmathgame?schema=public"
```

---

## Deploying with Vercel CLI + Supabase

This project uses manual deployment via the Vercel CLI rather than GitHub integration.

### Prerequisites

1. Install the Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```

2. Link the project (one-time setup):
   ```bash
   npx vercel link
   ```
   When prompted, select the existing project (`calvin-hoovers-projects/cool-math-game`).

3. Set environment variables on Vercel (one-time setup):
   ```bash
   npx vercel env add DATABASE_URL
   npx vercel env add DIRECT_URL
   npx vercel env add JWT_SECRET
   ```
   For each variable, paste the value when prompted and select **Production**, **Preview**, and **Development** as the target environments.

### Deploying to production

```bash
npx vercel --prod
```

### Note

- If your teammate sets up GitHub integration in the future, stop using manual CLI deploys and switch to the auto-deploy workflow (push to `dev` branch → Vercel auto-deploys).

---

## Supabase Migration Workflow

### Problem: Prisma migrate commands do not work with the Supabase IPv4 pooler

Supabase's free-tier shared connection pooler does not support PostgreSQL advisory locks (`pg_advisory_lock`), which Prisma Migrate requires. Running `npx prisma migrate deploy` or `npx prisma migrate resolve` will always time out with:

```
Error: P1002 — Timed out trying to acquire a postgres advisory lock
```

Additionally, Supabase direct connections (`db.<project>.supabase.co`) are IPv6-only by default. Enabling the dedicated IPv4 add-on costs $4/month, so this project uses the shared pooler.

### Workaround: Manual SQL application

Apply migrations manually via the Supabase SQL Editor, then generate the Prisma Client locally. The `_prisma_migrations` tracking table is not required for the application to function.

#### Creating a new migration

1. **Generate locally** using your local Docker database:
   ```bash
   # Ensure local DB is running
   bash scripts/start-local-db.sh

   # Generate migration (creates SQL file without applying to local DB)
   npx prisma migrate dev --create-only --name <descriptive_name>
   ```

2. **Review the generated SQL** in `prisma/migrations/<timestamp>_<name>/migration.sql`.

3. **Apply via Supabase SQL Editor**:
   - Open your Supabase Dashboard → SQL Editor
   - Copy-paste the contents of the generated migration SQL
   - Run it

4. **Regenerate Prisma Client** locally:
   ```bash
   npx prisma generate
   ```

5. **Commit** the new migration folder.

#### First-time setup (empty Supabase DB)

If the Supabase database is empty, apply the full migration history in order via the SQL Editor:

1. Run all migrations from `prisma/migrations/` in chronological order.
2. Seed the database:
   ```bash
   export DATABASE_URL="postgresql://postgres.<ref>:<password>@aws-1-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
   export DIRECT_URL="postgresql://postgres.<ref>:<password>@aws-1-us-west-1.pooler.supabase.com:5432/postgres"
   npx tsx prisma/seed/run.ts
   ```

#### Important notes

- **Do not run `prisma migrate reset` on Supabase** — it will drop all tables.
- **Row Level Security (RLS)** can be left disabled for the current `dev` branch. The app accesses the database exclusively through Prisma in server-side code (Next.js server actions and API routes). Enable RLS only when client-side Supabase code is introduced (e.g., the duels branch).
- Future migrations should be generated locally and applied manually to Supabase. Do not attempt `prisma migrate deploy`, `prisma migrate resolve`, or `prisma db push` against the Supabase pooler.
