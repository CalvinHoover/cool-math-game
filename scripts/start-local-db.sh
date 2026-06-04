#!/usr/bin/env bash
set -e

echo "Starting local Postgres..."
docker compose up -d

echo "Waiting for Postgres to be ready..."
until docker compose exec -T db pg_isready -U postgres > /dev/null 2>&1; do
  sleep 1
done
echo "Postgres is ready."

echo "Pushing Prisma schema to local database..."
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/coolmathgame?schema=public"
export DIRECT_URL="postgresql://postgres:postgres@localhost:5432/coolmathgame?schema=public"
npx prisma db push --accept-data-loss

echo ""
echo "Local database is set up."
echo "Run 'npm run dev' to start the Next.js dev server."
