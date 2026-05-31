'use server';

import { getSession } from '@/features/auth/session';
import { DuelRepository } from './duelRepository';
import type { MathProblem } from './types';

export type QuestionResult =
  | { ok: true; questionId: string; problem: MathProblem }
  | { ok: false; error: string };

export type RecordResult = { ok: true } | { ok: false; error: string };

function toDuelProblem(question: { id: string; text: string; answer: string }): { questionId: string; problem: MathProblem } {
  return {
    questionId: question.id,
    problem: {
      body: question.text,
      correctAnswer: question.answer,
    },
  };
}

export async function fetchMiningQuestion(topicId: string): Promise<QuestionResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'unauthorized' };

  const trimmed = topicId?.trim();
  if (!trimmed) return { ok: false, error: 'invalid-topic' };

  const question = await DuelRepository.fetchQuestionByDifficulty(trimmed, 1);
  if (!question) return { ok: false, error: 'no-question' };

  return { ok: true, ...toDuelProblem(question) };
}

export async function fetchAttackQuestion(topicId: string): Promise<QuestionResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'unauthorized' };

  const trimmed = topicId?.trim();
  if (!trimmed) return { ok: false, error: 'invalid-topic' };

  const question = await DuelRepository.fetchQuestionByDifficulty(trimmed, 2);
  if (!question) return { ok: false, error: 'no-question' };

  return { ok: true, ...toDuelProblem(question) };
}

export async function recordMatchResult(
  matchId: string,
  winnerId: string
): Promise<RecordResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'unauthorized' };

  const trimmedMatchId = matchId?.trim();
  const trimmedWinnerId = winnerId?.trim();
  if (!trimmedMatchId || !trimmedWinnerId) return { ok: false, error: 'invalid-input' };

  await DuelRepository.completeMatch(trimmedMatchId, trimmedWinnerId);
  return { ok: true };
}
