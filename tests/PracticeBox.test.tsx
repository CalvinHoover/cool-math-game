import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import PracticeBox from '@/app/practice/PracticeBox';
import { ToastProvider } from '@/components/providers/ToastProvider';
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
      hasActiveSession: vi.fn(),
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

    // scope queries to this render to avoid leaked elements
    const { getByRole, findByText } = render(
      <ToastProvider>
      <PracticeBox
        sessionId="session-1"
        initialQuestions={questions}
        actions={actions}
      />
    </ToastProvider>
    );

    await user.type(getByRole('textbox'), 'Paris');
    await user.click(getByRole('button', { name: 'Submit' }));
    await findByText(/Correct!/);

    await user.click(getByRole('button', { name: 'Next Question' }));
    await findByText('Q2');

    await user.type(getByRole('textbox'), 'London');
    await user.click(getByRole('button', { name: 'Submit' }));
    await findByText('Incorrect. Try again!');

    await user.clear(getByRole('textbox'));
    await user.type(getByRole('textbox'), 'Rome');
    const submitBtn = getByRole('button', { name: 'Submit' });
    await waitFor(() => expect(submitBtn).toBeEnabled());
    await user.click(submitBtn);
    await findByText(/The correct answer was Paris/);

    await user.click(getByRole('button', { name: 'View Score' }));
    await findByText(/You scored/);
  });

  it('resumes at the first unanswered question', () => {
    const actions = {
      verifyAnswer: vi.fn(),
      completePracticeSession: vi.fn(),
      hasActiveSession: vi.fn(),
    };

    const questions = [
      question({ id: 'q1', text: 'Q1', correct: true, attempts: 1 }),
      question({ id: 'q2', text: 'Q2', correct: true, attempts: 2, points: 4 }),
      question({ id: 'q3', text: 'Q3', correct: false, attempts: 0 }),
    ];

    // scope queries to this render to avoid leaked elements
    const { getByText } = render(
      <ToastProvider>
      <PracticeBox
        sessionId="session-1"
        initialQuestions={questions}
        actions={actions}
      />
    </ToastProvider>
    );

    expect(getByText('Question 3 (2 pts)')).toBeInTheDocument();
  });

  it('shows auth errors from actions', async () => {
    const user = userEvent.setup();
    const actions = {
      verifyAnswer: vi.fn().mockResolvedValue({ ok: false, error: 'unauthorized' }),
      completePracticeSession: vi.fn(),
      hasActiveSession: vi.fn(),
    };

    // scope queries to this render to avoid leaked elements
    const { getByRole, findByText } = render(
      <ToastProvider>
      <PracticeBox
        sessionId="session-1"
        initialQuestions={[question({ text: 'Q1' })]}
        actions={actions}
      />
    </ToastProvider>
    );

    await user.type(getByRole('textbox'), 'Paris');
    await user.click(getByRole('button', { name: 'Submit' }));

    await findByText('Please log in to continue.');
  });

  it('completes the session when saving', async () => {
    const user = userEvent.setup();
    const actions = {
      verifyAnswer: vi.fn(),
      completePracticeSession: vi.fn().mockResolvedValue({ ok: true }),
      hasActiveSession: vi.fn(),
    };

    const questions = [
      question({ id: 'q1', correct: true, attempts: 1 }),
      question({ id: 'q2', correct: false, attempts: 2 }),
    ];

    // scope queries to this render to avoid leaked elements
    const { getByRole, findByText } = render(
      <ToastProvider>
      <PracticeBox
        sessionId="session-1"
        initialQuestions={questions}
        actions={actions}
      />
    </ToastProvider>
    );

    await user.click(getByRole('button', { name: 'Save My Session' }));
    await findByText('Session saved.');
    expect(actions.completePracticeSession).toHaveBeenCalledWith({
      sessionId: 'session-1',
    });
  });
});
