'use client';

import React from 'react';
import { MathText } from '@/components/math/MathText';
import { Badge } from '@/components/ui/Badge';
import type { PracticeQuestion } from '@/features/practice/practiceLogic';

type PracticeSummaryProps = {
  score: number;
  totalPoints: number;
  questions: PracticeQuestion[];
  xpEarned?: number;
  newLevel?: number;
  newAchievements?: { slug: string; name: string; color: string }[];
  onSave: () => void;
  isSaving: boolean;
  isSaved: boolean;
};

export default function PracticeSummary({
  score,
  totalPoints,
  questions,
  xpEarned,
  newLevel,
  newAchievements,
  onSave,
  isSaving,
  isSaved,
}: PracticeSummaryProps) {
  const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;

  return (
    <div className="border p-6 rounded shadow">
      <h2 className="text-2xl font-bold text-green-600 mb-2">
        Session Complete!
      </h2>
      <p className="text-lg mb-4">
        You scored <strong>{score}</strong> / {totalPoints} ({percentage}%)
      </p>

      {typeof newLevel === 'number' && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-4 text-center">
          <Badge variant="warning">Level Up!</Badge>
          <p className="mt-2 text-yellow-900 font-bold text-lg">
            You are now Level {newLevel}
          </p>
        </div>
      )}

      {newAchievements && newAchievements.length > 0 && (
        <div className="space-y-2 mb-4">
          {newAchievements.map((a) => (
            <div
              key={a.slug}
              className={`${a.color} text-white p-3 rounded text-center font-semibold`}
            >
              New Achievement Unlocked: {a.name}
            </div>
          ))}
        </div>
      )}

      {typeof xpEarned === 'number' && xpEarned > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-3 rounded mb-4">
          <p className="text-blue-800 font-medium">
            +{xpEarned} XP earned!
          </p>
        </div>
      )}

      <div className="mb-4">
        <h3 className="font-semibold mb-2">Breakdown</h3>
        <ul className="space-y-2">
          {questions.map((q, idx) => (
            <li key={q.id} className="flex items-center justify-between border-b pb-1">
              <span className="text-sm truncate max-w-[60%]">
                <MathText text={`Q${idx + 1}: ${q.text}`} />
              </span>
              <span className="text-sm">
                {q.correct
                  ? `+${q.attempts <= 1 ? q.points : q.points / 2} pts`
                  : `0 pts (${q.attempts} attempt${q.attempts !== 1 ? 's' : ''})`}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onSave}
          disabled={isSaving || isSaved}
          className="bg-purple-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : isSaved ? 'Saved' : 'Save My Session'}
        </button>
        <a
          href="/practice"
          className="bg-green-600 text-white px-4 py-2 rounded inline-block text-center"
        >
          Play Again
        </a>
      </div>
      {isSaved && (
        <p className="mt-3 text-sm text-green-600">Session saved.</p>
      )}
    </div>
  );
}
