'use client';

import React from 'react';
import { MathText } from '@/components/math/MathText';
import type { PracticeQuestion } from '@/features/practice/practiceLogic';

type PracticeSummaryProps = {
  score: number;
  totalPoints: number;
  questions: PracticeQuestion[];
  xpEarned?: number;
  newLevel?: number;
};

export default function PracticeSummary({
  score,
  totalPoints,
  questions,
  xpEarned,
  newLevel,
}: PracticeSummaryProps) {
  const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;

  return (
    <div style={{
      border: '4px outset #CCCCCC',
      background: '#111111',
      padding: '28px 32px',
      width: '100%',
      maxWidth: '600px',
    }}>
      <p style={{ fontFamily: 'Courier New', color: '#00FF00', fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '8px' }}>
        SESSION COMPLETE!
      </p>
      <p style={{ fontFamily: 'Courier New', color: '#FFFF00', fontSize: '1.1rem', marginBottom: '20px' }}>
        Score: {score} / {totalPoints} ({percentage}%)
      </p>

      {typeof newLevel === 'number' && (
        <div style={{ border: '4px outset #FFFF00', background: '#222200', padding: '12px 16px', marginBottom: '16px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'Courier New', color: '#FFFF00', fontWeight: 'bold', fontSize: '1.1rem' }}>
            ★ LEVEL UP! You are now Level {newLevel} ★
          </p>
        </div>
      )}

{typeof xpEarned === 'number' && xpEarned > 0 && (
        <p style={{ fontFamily: 'Courier New', color: '#00FFFF', fontSize: '1rem', marginBottom: '20px' }}>
          +{xpEarned} XP earned!
        </p>
      )}

      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontFamily: 'Courier New', color: '#00FFFF', textTransform: 'uppercase', fontSize: '0.85rem', marginBottom: '10px' }}>
          Breakdown
        </p>
        {questions.map((q, idx) => (
          <div key={q.id} style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: 'Courier New',
            fontSize: '0.85rem',
            borderBottom: '1px solid #333333',
            padding: '6px 0',
            color: q.correct ? '#00FF00' : '#FF4444',
          }}>
            <span style={{ maxWidth: '70%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Q{idx + 1}: <MathText text={q.text} />
            </span>
            <span>
              {q.correct
                ? `+${q.attempts <= 1 ? q.points : q.points / 2} pts`
                : `0 pts`}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <a href="/practice" style={{
          padding: '10px 20px',
          fontFamily: 'Courier New',
          fontWeight: 'bold',
          fontSize: '1rem',
          border: '4px outset #CCCCCC',
          background: '#00FF00',
          color: '#000000',
          textDecoration: 'none',
          textTransform: 'uppercase',
        }}>
          Play Again
        </a>
        <a href="/dashboard" style={{
          padding: '10px 20px',
          fontFamily: 'Courier New',
          fontWeight: 'bold',
          fontSize: '1rem',
          border: '4px outset #CCCCCC',
          background: '#C0C0C0',
          color: '#000000',
          textDecoration: 'none',
          textTransform: 'uppercase',
        }}>
          ← Menu
        </a>
      </div>
    </div>
  );
}
