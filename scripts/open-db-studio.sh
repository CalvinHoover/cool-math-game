#!/usr/bin/env bash
set -e

export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/coolmathgame?schema=public"
export DIRECT_URL="postgresql://postgres:postgres@localhost:5432/coolmathgame?schema=public"

echo "Opening Prisma Studio..."
npx prisma studio
