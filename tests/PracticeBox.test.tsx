import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import PracticeBox from '@/app/practice/PracticeBox';
import type { PracticeQuestion } from '@/features/practice/practiceLogic';

// inject action stubs to drive component behavior without server actions
const question = (overrides: Partial<PracticeQuestion> = {}): PracticeQuestion => ({
  id: 'q1',
  text: 'Question',
  points: 2,
  attempts: 0,
  correct: false,
  ...overrides,
});

describe('PracticeBox', () => {
  it('runs through a full session and computes score', async () => {
    const user = userEvent.setup();
    // as described in practiceActionClient.ts and PracticeBox.tsx, we need to inject test versions of the helper functions (responsible for the business logic of the practice loop).
    const actions = { 
      verifyAnswer: vi.fn(),
      completePracticeSession: vi.fn(),
    };

    actions.verifyAnswer
      .mockResolvedValueOnce({
        ok: true,
        correct: true,
        attempts: 1,
        explanation: 'nice',
      })
      .mockResolvedValueOnce({
        ok: true,
        correct: false,
        attempts: 1,
      })
      .mockResolvedValueOnce({
        ok: true,
        correct: false,
        attempts: 2,
        answer: 'Paris',
      });

    const questions = [
      question({ id: 'q1', text: 'Q1', points: 2 }),
      question({ id: 'q2', text: 'Q2', points: 4 }),
    ];

    render(
      <PracticeBox
        sessionId="session-1"
        initialQuestions={questions}
        actions={actions}
      />
    );

    await user.type(screen.getByRole('textbox'), 'Paris');
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await screen.findByText(/Correct!/);

    await user.click(screen.getByRole('button', { name: 'Next Question' }));
    await screen.findByText('Q2');

    await user.type(screen.getByRole('textbox'), 'London');
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await screen.findByText('Incorrect. Try again!');

    await user.clear(screen.getByRole('textbox'));
    await user.type(screen.getByRole('textbox'), 'Rome');
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await screen.findByText(/The correct answer was Paris/);

    await user.click(screen.getByRole('button', { name: 'View Score' }));
    await screen.findByText(/You scored 2\/6/);
  });

  it('resumes at the first unanswered question', () => {
    const actions = {
      verifyAnswer: vi.fn(),
      completePracticeSession: vi.fn(),
    };

    const questions = [
      question({ id: 'q1', text: 'Q1', correct: true, attempts: 1 }),
      question({ id: 'q2', text: 'Q2', correct: true, attempts: 2, points: 4 }),
      question({ id: 'q3', text: 'Q3', correct: false, attempts: 0 }),
    ];

    render(
      <PracticeBox
        sessionId="session-1"
        initialQuestions={questions}
        actions={actions}
      />
    );

    expect(screen.getByText('Question 3 (2 pts)')).toBeInTheDocument();
  });

  it('shows auth errors from actions', async () => {
    const user = userEvent.setup();
    const actions = {
      verifyAnswer: vi.fn().mockResolvedValue({ ok: false, error: 'unauthorized' }),
      completePracticeSession: vi.fn(),
    };

    render(
      <PracticeBox
        sessionId="session-1"
        initialQuestions={[question({ text: 'Q1' })]}
        actions={actions}
      />
    );

    await user.type(screen.getByRole('textbox'), 'Paris');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await screen.findByText('Please log in to continue.');
  });

  it('completes the session when saving', async () => {
    const user = userEvent.setup();
    const actions = {
      verifyAnswer: vi.fn(),
      completePracticeSession: vi.fn().mockResolvedValue({ ok: true }),
    };

    const questions = [
      question({ id: 'q1', correct: true, attempts: 1 }),
      question({ id: 'q2', correct: false, attempts: 2 }),
    ];

    render(
      <PracticeBox
        sessionId="session-1"
        initialQuestions={questions}
        actions={actions}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Save My Session' }));
    await screen.findByText('Session saved.');
    expect(actions.completePracticeSession).toHaveBeenCalledWith({
      sessionId: 'session-1',
    });
  });
});
