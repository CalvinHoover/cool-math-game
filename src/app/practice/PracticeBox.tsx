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

export default function PracticeBox({
  sessionId,
  initialQuestions,
  timeLimit,
  actions,
}: PracticeBoxProps) {
  // allow injected actions for tests while keeping default production wiring
  const actionClient = actions ?? defaultActions;
  const initialState = deriveInitialState(initialQuestions);
  const [questions, setQuestions] = useState<PracticeQuestion[]>(
    () => initialQuestions
  );
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
  const [newAchievements, setNewAchievements] = useState<
    { slug: string; name: string; color: string }[] | undefined
  >(undefined);
  const [secondsLeft, setSecondsLeft] = useState<number | undefined>(
    timeLimit
  );
  const { toast } = useToast();

  const currentQuestion = questions[currentIndex];
  const isGameOver = currentIndex >= questions.length;
  const totalPoints = questions.reduce((total, question) => total + question.points, 0);

  const handleTimedExpiry = React.useCallback(() => {
    if (!currentQuestion) return;
    setQuestions((prev) => {
      const next = [...prev];
      next[currentIndex] = {
        ...next[currentIndex],
        attempts: Math.min(2, next[currentIndex].attempts + 1),
        correct: false,
      };
      return next;
    });
    setFeedback({
      message: "Time's up! Moving to next question.",
      correct: false,
    });
    setAttempt(3);
  }, [currentQuestion, currentIndex]);

  const handleGameOver = React.useCallback(async () => {
    // bail out if a save is already in flight or the session was already persisted
    if (isSaving || isSaved) return;
    setIsSaving(true);

    const result = await actionClient.completePracticeSession({ sessionId });

    if (!result.ok) {
      setIsSaved(false);
    } else {
      setIsSaved(true);
      setXpEarned(result.xpEarned);
      setNewLevel(result.newLevel);
      setNewAchievements(result.newAchievements);
      toast({
        title: `+${result.xpEarned} XP`,
        variant: 'xp',
      });
      if (result.newLevel) {
        toast({
          title: 'Level Up!',
          description: `You are now Level ${result.newLevel}`,
          variant: 'success',
        });
      }
      if (result.newAchievements) {
        for (const achievement of result.newAchievements) {
          toast({
            title: 'Achievement Unlocked!',
            description: achievement.name,
            variant: 'success',
          });
        }
      }
    }
    setIsSaving(false);
  }, [actionClient, sessionId, toast]);

  useEffect(() => {
    if (!timeLimit || isGameOver) return;
    startTransition(() => {
      setSecondsLeft(timeLimit);
    });
    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === undefined || prev <= 1) {
          clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timeLimit, currentIndex, isGameOver]);

  useEffect(() => {
    if (secondsLeft === 0 && !isGameOver && currentQuestion) {
      startTransition(() => {
        handleTimedExpiry();
      });
    }
  }, [secondsLeft, isGameOver, currentQuestion, handleTimedExpiry]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!currentQuestion || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setFeedback({ message: 'Checking...' });

    const result = await actionClient.verifyAnswer({
      sessionId,
      questionId: currentQuestion.id,
      userAnswer,
    });

    if (!result.ok) {
      setFeedback({
        message: ERROR_MESSAGES[result.error] ?? 'Unable to check your answer.',
        correct: false,
      });
      setIsSubmitting(false);
      return;
    }

    setQuestions((prev) => {
      const next = [...prev];
      next[currentIndex] = {
        ...next[currentIndex],
        attempts: result.attempts,
        correct: result.correct,
      };
      return next;
    });

    if (result.correct) {
      const pointsEarned =
        result.attempts === 1 ? currentQuestion.points : currentQuestion.points / 2;
      const explanationText = result.explanation ? ` ${result.explanation}` : '';

      setScore((prev) => prev + pointsEarned);
      setFeedback({
        message: `Correct!${explanationText} You earned ${pointsEarned} points.`,
        correct: true,
      });
      setUserAnswer('');
    } else {
      if (result.attempts === 1) {
        setAttempt(2);
        setFeedback({ message: 'Incorrect. Try again!', correct: false });
        setUserAnswer('');
        setIsSubmitting(false);
        return;
      } else {
        const answerText = result.answer
          ? `The correct answer was ${result.answer}.`
          : 'The correct answer was not available.';
        const explanationText = result.explanation ? ` ${result.explanation}` : '';

        setFeedback({
          message: `Incorrect. ${answerText}${explanationText}`,
          correct: false,
        });
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
        newAchievements={newAchievements}
        onSave={handleGameOver}
        isSaving={isSaving}
        isSaved={isSaved}
      />
    );
  }

  if (!currentQuestion) {
    return <p className="text-red-600">Unable to load the current question.</p>;
  }

  return (
    <div className="border p-6 rounded shadow">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg">Question {currentIndex + 1} ({currentQuestion.points} pts)</h2>
        {typeof secondsLeft === 'number' && (
          <span className={`text-sm font-mono font-bold px-2 py-1 rounded ${
            secondsLeft <= 5 ? 'bg-red-100 text-red-700' : 'bg-gray-100'
          }`}>
            {secondsLeft}s
          </span>
        )}
      </div>
      <p className="text-xl mb-4"><MathText text={currentQuestion.text} /></p>
      
      {!feedback?.correct && attempt <= 2 ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input 
            type="text" 
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="border p-2 flex-grow"
            required
          />
          <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-wait">
            Submit
          </button>
        </form>
      ) : (
        <button onClick={nextQuestion} className="bg-green-600 text-white px-4 py-2 rounded mt-2">
          {currentIndex === initialQuestions.length - 1 ? 'View Score' : 'Next Question'}
        </button>
      )}

      {feedback && (
        <p className={`mt-4 ${feedback.correct ? 'text-green-600' : 'text-red-600'}`}>
          {feedback.message}
        </p>
      )}
    </div>
  );
}