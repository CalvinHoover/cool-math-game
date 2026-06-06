'use client';

import React, { useEffect, useState, startTransition } from 'react';
import { MathText } from '@/components/math/MathText';
import PracticeSummary from './PracticeSummary';
import { actions as defaultActions, type PracticeActions } from '@/features/practice/client';
import { useToast } from '@/components/providers/ToastProvider';
import {
  deriveInitialState,
  getAttemptForQuestion,
  getNextQuestionIndex,
  type PracticeQuestion,
} from '@/features/practice/practiceLogic';

interface PracticeBoxProps {
  sessionId: string;
  initialQuestions: PracticeQuestion[];
  timeLimit?: number;
  actions?: PracticeActions;
}

const ERROR_MESSAGES: Record<string, string> = {
  unauthorized: 'Please log in to continue.',
  'invalid-input': 'Enter an answer before submitting.',
  'not-found': 'We could not find this question for your session.',
  'already-correct': 'This question is already marked correct.',
  'max-attempts': 'No attempts remain for this question.',
};

const inputStyle: React.CSSProperties = {
  padding: '10px 12px',
  fontFamily: 'Courier New, monospace',
  fontSize: '1rem',
  background: '#FFFFFF',
  color: '#000000',
  border: '4px inset #CCCCCC',
  flex: 1,
};

const btnStyle = (color: string, textColor = '#000000'): React.CSSProperties => ({
  padding: '10px 20px',
  fontFamily: 'Courier New, monospace',
  fontWeight: 'bold',
  fontSize: '1rem',
  border: '4px outset #CCCCCC',
  cursor: 'pointer',
  background: color,
  color: textColor,
  textTransform: 'uppercase',
  flexShrink: 0,
});

export default function PracticeBox({
  sessionId,
  initialQuestions,
  timeLimit,
  actions,
}: PracticeBoxProps) {
  const actionClient = actions ?? defaultActions;
  const initialState = deriveInitialState(initialQuestions);
  const [questions, setQuestions] = useState<PracticeQuestion[]>(() => initialQuestions);
  const [currentIndex, setCurrentIndex] = useState(initialState.currentIndex);
  const [score, setScore] = useState(initialState.score);
  const [attempt, setAttempt] = useState(initialState.attempt);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; correct?: boolean } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [xpEarned, setXpEarned] = useState<number | undefined>(undefined);
  const [newLevel, setNewLevel] = useState<number | undefined>(undefined);
  const [secondsLeft, setSecondsLeft] = useState<number | undefined>(timeLimit);
  const { toast } = useToast();

  const currentQuestion = questions[currentIndex];
  const isGameOver = currentIndex >= questions.length;
  const totalPoints = questions.reduce((total, q) => total + q.points, 0);

  const handleTimedExpiry = React.useCallback(() => {
    if (!currentQuestion) return;
    setQuestions((prev) => {
      const next = [...prev];
      next[currentIndex] = { ...next[currentIndex], attempts: 2, correct: false };
      return next;
    });
    const answerText = currentQuestion.answer
      ? `The correct answer was ${currentQuestion.answer}.`
      : 'The correct answer was not available.';
    const explanationText = currentQuestion.explanation ? ` ${currentQuestion.explanation}` : '';
    setFeedback({ message: `Time's up! ${answerText}${explanationText}`, correct: false });
    setAttempt(3);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = getNextQuestionIndex(questions, prevIndex + 1);
        setAttempt(getAttemptForQuestion(questions[nextIndex]));
        setUserAnswer('');
        setFeedback(null);
        return nextIndex;
      });
    }, 2000);
  }, [currentQuestion, currentIndex, questions]);

  const handleGameOver = React.useCallback(async () => {
    if (isSaving || isSaved) return;
    setIsSaving(true);
    const result = await actionClient.completePracticeSession({ sessionId });
    if (!result.ok) {
      setIsSaved(false);
    } else {
      setIsSaved(true);
      setXpEarned(result.xpEarned);
      setNewLevel(result.newLevel);
      toast({ title: `+${result.xpEarned} XP`, variant: 'xp' });
      if (result.newLevel) {
        toast({ title: 'Level Up!', description: `You are now Level ${result.newLevel}`, variant: 'success' });
      }
    }
    setIsSaving(false);
  }, [actionClient, sessionId, toast, isSaving, isSaved]);

  useEffect(() => {
    if (isGameOver && !isSaving && !isSaved) handleGameOver();
  }, [isGameOver, isSaving, isSaved, handleGameOver]);

  useEffect(() => {
    if (!timeLimit || isGameOver || feedback !== null) return;
    startTransition(() => setSecondsLeft(timeLimit));
    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === undefined || prev <= 1) { clearInterval(id); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timeLimit, currentIndex, isGameOver, feedback]);

  useEffect(() => {
    if (secondsLeft === 0 && !isGameOver && currentQuestion && feedback === null) {
      startTransition(() => handleTimedExpiry());
    }
  }, [secondsLeft, isGameOver, currentQuestion, handleTimedExpiry, feedback]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentQuestion || isSubmitting) return;
    setIsSubmitting(true);
    setFeedback({ message: 'Checking...' });

    const result = await actionClient.verifyAnswer({ sessionId, questionId: currentQuestion.id, userAnswer });

    if (!result.ok) {
      setFeedback({ message: ERROR_MESSAGES[result.error] ?? 'Unable to check your answer.', correct: false });
      setIsSubmitting(false);
      return;
    }

    setQuestions((prev) => {
      const next = [...prev];
      next[currentIndex] = { ...next[currentIndex], attempts: result.attempts, correct: result.correct };
      return next;
    });

    if (result.correct) {
      const pointsEarned = result.attempts === 1 ? currentQuestion.points : currentQuestion.points / 2;
      setScore((prev) => prev + pointsEarned);
      setFeedback({ message: `Correct! ${result.explanation ?? ''} +${pointsEarned} pts`.trim(), correct: true });
      setUserAnswer('');
    } else {
      if (result.attempts === 1) {
        setAttempt(2);
        setFeedback({ message: 'Incorrect. Try again!', correct: false });
        setUserAnswer('');
        setIsSubmitting(false);
        return;
      } else {
        const answerText = result.answer ? `The correct answer was ${result.answer}.` : '';
        setFeedback({ message: `Incorrect. ${answerText} ${result.explanation ?? ''}`.trim(), correct: false });
        setAttempt(3);
      }
    }
    setIsSubmitting(false);
  };

  const nextQuestion = () => {
    const nextIndex = getNextQuestionIndex(questions, currentIndex + 1);
    setCurrentIndex(nextIndex);
    setAttempt(getAttemptForQuestion(questions[nextIndex]));
    setUserAnswer('');
    setFeedback(null);
  };

  if (isGameOver) {
    return (
      <PracticeSummary
        score={score}
        totalPoints={totalPoints}
        questions={questions}
        xpEarned={xpEarned}
        newLevel={newLevel}
      />
    );
  }

  if (!currentQuestion) {
    return <p style={{ color: '#FF4444', fontFamily: 'Courier New' }}>Unable to load the current question.</p>;
  }

  return (
    <div style={{
      border: '4px outset #CCCCCC',
      background: '#111111',
      padding: '28px 32px',
      width: '100%',
      maxWidth: '600px',
    }}>
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ fontFamily: 'Courier New', color: '#00FFFF', fontSize: '0.9rem', textTransform: 'uppercase' }}>
          Question {currentIndex + 1} of {questions.length} &nbsp;·&nbsp; {currentQuestion.points} pts
        </span>
        {typeof secondsLeft === 'number' && (
          <span style={{
            fontFamily: 'Courier New',
            fontWeight: 'bold',
            fontSize: '1rem',
            color: secondsLeft <= 5 ? '#FF4444' : '#FFFF00',
            border: '2px outset #CCCCCC',
            padding: '2px 10px',
          }}>
            {secondsLeft}s
          </span>
        )}
      </div>

<p style={{ fontFamily: 'Courier New', fontSize: '1.1rem', color: '#FFFFFF', marginBottom: '20px', lineHeight: 1.6 }}>
        <MathText text={currentQuestion.text} />
      </p>

{!feedback?.correct && attempt <= 2 ? (
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            style={inputStyle}
            placeholder="Your answer..."
            required
          />
          <button type="submit" disabled={isSubmitting} style={btnStyle('#0000FF', '#FFFFFF')}>
            {isSubmitting ? '...' : 'Submit'}
          </button>
        </form>
      ) : (
        <button onClick={nextQuestion} style={btnStyle('#00FF00')}>
          {currentIndex === initialQuestions.length - 1 ? 'View Score →' : 'Next Question →'}
        </button>
      )}

{feedback && (
        <p style={{
          marginTop: '16px',
          fontFamily: 'Courier New',
          fontSize: '0.95rem',
          color: feedback.correct ? '#00FF00' : '#FF4444',
          lineHeight: 1.5,
        }}>
          {feedback.message}
        </p>
      )}
    </div>
  );
}
