# Commit conventions
FEAT: Added new feature
FIX: Bug fix
CHORE: Cleanup/refactor

## Local PostgreSQL Setup (Docker)

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

### Switching between local and Supabase

The `.env.local` file contains both connection strings. To use the local database, ensure the local `DATABASE_URL` and `DIRECT_URL` lines are **uncommented** and the Supabase lines above them are **commented out**.

```env
# --- Supabase (production / shared) ---
# DATABASE_URL="postgresql://postgres.<ref>:<password>@..."
# DIRECT_URL="postgresql://postgres.<ref>:<password>@..."

# --- Local Docker Postgres (for manual testing) ---
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/coolmathgame?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/coolmathgame?schema=public"
```

### Start the dev server (after local DB is running)

```bash
npm run dev
```

The Next.js dev server reads `.env.local` automatically and connects to whichever database is configured.
