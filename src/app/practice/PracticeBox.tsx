// src/app/practice/PracticeIsland.tsx
'use client';

import React, { useState } from 'react';
import { verifyAnswer, saveUserScore } from '@/features/practice/actions';

interface Question {
    id: string;
    text: string;
    points: number;
}
interface PracticeBoxProps {
    initialQuestions: Question[];
}

export default function PracticeBox({ initialQuestions }: PracticeBoxProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [attempt, setAttempt] = useState(1);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ message: string, correct?: boolean } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const currentQuestion = initialQuestions[currentIndex];
  const isGameOver = currentIndex >= initialQuestions.length;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback({ message: 'Checking...' });

    // Call the Server Action
    const result = await verifyAnswer(currentQuestion.id, userAnswer, attempt);

    if (result.correct) {
      const pointsEarned = attempt === 1 ? currentQuestion.points : currentQuestion.points / 2;
      setScore(prev => prev + pointsEarned);
      setFeedback({ message: 'Correct! ' + result.explanation + ` You earned ${pointsEarned} points.`, correct: true });
    } else {
      if (attempt === 1) {
        setAttempt(2);
        setFeedback({ message: 'Incorrect. Try again!', correct: false });
        setUserAnswer('');
        return; // Stop here, let them try again
      } else {
        setFeedback({ message: 'Incorrect. The correct answer was ' + result.answer + '. ' + result.explanation, correct: false });
        setAttempt(3);
      }
    }
  };

  const nextQuestion = () => {
    setCurrentIndex(prev => prev + 1);
    setAttempt(1);
    setUserAnswer('');
    setFeedback(null);
  };  

  const handleGameOver = async () => {
    setIsSaving(true);

    // const result = await saveUserScore(userId, score);
    const result = await saveUserScore("0", score);
    
    if (result.success) {
      console.log('Score saved successfully!');
    }
    setIsSaving(false);
  };

  if (isGameOver) {
    return (
      <div>
        <h2 className="text-xl text-green-600">
            Session Complete! You scored {score}/{initialQuestions.map(q=>q.points).reduce((acc, curr)=>acc+curr)}.
        </h2>
        <button 
          onClick={handleGameOver} 
          disabled={isSaving}
          className="mt-4 bg-purple-500 text-white p-2 rounded"
        >
          {isSaving ? 'Saving...' : 'Save My Score'}
        </button>
      </div>
    );
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