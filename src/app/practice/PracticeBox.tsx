'use client';

import React, { useState } from 'react';
import { verifyAnswer, completePracticeSession } from '@/features/practice/actions';

interface Question {
  id: string;
  text: string;
  points: number;
  attempts: number;
  correct: boolean;
}
interface PracticeBoxProps {
  sessionId: string;
  initialQuestions: Question[];
}

const ERROR_MESSAGES: Record<string, string> = {
  unauthorized: 'Please log in to continue.',
  'invalid-input': 'Enter an answer before submitting.',
  'not-found': 'We could not find this question for your session.',
  'already-correct': 'This question is already marked correct.',
  'max-attempts': 'No attempts remain for this question.',
};

function getEarnedPoints(question: Question): number {
  if (!question.correct) {
    return 0;
  }

  return question.attempts <= 1 ? question.points : question.points / 2;
}

function getNextQuestionIndex(questions: Question[], startIndex: number): number {
  for (let index = startIndex; index < questions.length; index += 1) {
    const question = questions[index];
    if (!question.correct && question.attempts < 2) {
      return index;
    }
  }

  return questions.length;
}

function getAttemptForQuestion(question?: Question): number {
  if (!question) {
    return 1;
  }

  return Math.min(2, question.attempts + 1);
}

function deriveInitialState(questions: Question[]) {
  const score = questions.reduce(
    (total, question) => total + getEarnedPoints(question),
    0
  );
  const currentIndex = getNextQuestionIndex(questions, 0);
  const attempt = getAttemptForQuestion(questions[currentIndex]);

  return { score, currentIndex, attempt };
}

export default function PracticeBox({ sessionId, initialQuestions }: PracticeBoxProps) {
  const initialState = deriveInitialState(initialQuestions);
  const [questions, setQuestions] = useState<Question[]>(() => initialQuestions);
  const [currentIndex, setCurrentIndex] = useState(initialState.currentIndex);
  const [score, setScore] = useState(initialState.score);
  const [attempt, setAttempt] = useState(initialState.attempt);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; correct?: boolean } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);

  const currentQuestion = questions[currentIndex];
  const isGameOver = currentIndex >= questions.length;
  const totalPoints = questions.reduce((total, question) => total + question.points, 0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!currentQuestion) {
      return;
    }

    setFeedback({ message: 'Checking...' });

    const result = await verifyAnswer({
      sessionId,
      questionId: currentQuestion.id,
      userAnswer,
    });

    if (!result.ok) {
      setFeedback({
        message: ERROR_MESSAGES[result.error] ?? 'Unable to check your answer.',
        correct: false,
      });
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
  };

  const nextQuestion = () => {
    const nextIndex = getNextQuestionIndex(questions, currentIndex + 1);

    setCurrentIndex(nextIndex);
    setAttempt(getAttemptForQuestion(questions[nextIndex]));
    setUserAnswer('');
    setFeedback(null);
  };  

  const handleGameOver = async () => {
    setIsSaving(true);
    setCompletionMessage(null);

    const result = await completePracticeSession({ sessionId });

    if (!result.ok) {
      setCompletionMessage(
        ERROR_MESSAGES[result.error] ?? 'Unable to save your session.'
      );
    } else {
      setIsSaved(true);
      setCompletionMessage('Session saved.');
    }
    setIsSaving(false);
  };

  if (isGameOver) {
    return (
      <div>
        <h2 className="text-xl text-green-600">
          Session Complete! You scored {score}/{totalPoints}.
        </h2>
        <button 
          onClick={handleGameOver} 
          disabled={isSaving || isSaved}
          className="mt-4 bg-purple-500 text-white p-2 rounded"
        >
          {isSaving ? 'Saving...' : isSaved ? 'Saved' : 'Save My Session'}
        </button>
        {completionMessage && (
          <p
            className={`mt-3 text-sm ${
              isSaved ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {completionMessage}
          </p>
        )}
      </div>
    );
  }

  if (!currentQuestion) {
    return <p className="text-red-600">Unable to load the current question.</p>;
  }

  return (
    <div className="border p-6 rounded shadow">
      <h2 className="text-lg mb-2">Question {currentIndex + 1} ({currentQuestion.points} pts)</h2>
      <p className="text-xl mb-4">{currentQuestion.text}</p>
      
      {!feedback?.correct && attempt <= 2 ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input 
            type="text" 
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="border p-2 flex-grow"
            required
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
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