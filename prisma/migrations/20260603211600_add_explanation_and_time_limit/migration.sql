-- AlterTable
ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "explanation" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "PracticeSession" ADD COLUMN IF NOT EXISTS "timeLimit" INTEGER;