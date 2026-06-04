// src/app/api/questions/route.ts
// GET /api/questions?topic=algebra&difficulty=1
// Returns a single random Question matching the given filters.
// Both parameters are optional; omitting them returns any random question.

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const topicParam      = searchParams.get('topic');
  const difficultyParam = searchParams.get('difficulty');

  const where: Parameters<typeof prisma.question.findMany>[0]['where'] = {};

  if (topicParam) {
    where.topic = { name: { equals: topicParam, mode: 'insensitive' } };
  }

  if (difficultyParam !== null && difficultyParam !== '') {
    const parsed = parseInt(difficultyParam, 10);
    if (!isNaN(parsed)) {
      where.difficulty = parsed;
    }
  }

  const questions = await prisma.question.findMany({
    where,
    include: { topic: true },
  });

  if (questions.length === 0) {
    return NextResponse.json(
      { error: 'No questions found for the given filters.' },
      { status: 404 }
    );
  }

  const picked = questions[Math.floor(Math.random() * questions.length)];

  return NextResponse.json({
    text:       picked.text,
    answer:     picked.answer,
    difficulty: picked.difficulty,
    topic:      picked.topic.name,
  });
}
