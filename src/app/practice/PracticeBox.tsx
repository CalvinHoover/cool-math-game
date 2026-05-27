'use client';

import React, { useState } from 'react';
import { practiceActionClient, type PracticeActionClient } from '@/features/practice/practiceActionClient';
import {
  deriveInitialState,
  getAttemptForQuestion,
  getNextQuestionIndex,
  type PracticeQuestion,
} from '@/features/practice/practiceLogic';
interface PracticeBoxProps {
  sessionId: string;
  initialQuestions: PracticeQuestion[];
  actions?: PracticeActionClient;
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
  actions,
}: PracticeBoxProps) {
  // allow injected actions for tests while keeping default production wiring
  const actionClient = actions ?? practiceActionClient;
  const initialState = deriveInitialState(initialQuestions);
  const [questions, setQuestions] = useState<PracticeQuestion[]>(
    () => initialQuestions
  );
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

    const result = await actionClient.completePracticeSession({ sessionId });

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