// Component for the popup window that appears when an attack or income question is clicked, allowing the player to input their answer.

'use client';

import { useState } from 'react';
import { QuestionWithSource } from '../types';

interface DuelAttackProps {
  questionToRender: QuestionWithSource;
  clickFunction: () => void;
  resolutionFunction: (question: QuestionWithSource, userAnswer: string) => void; // Function to handle the form submission  
}

export default function QuestionWindow({ questionToRender, clickFunction, resolutionFunction }: DuelAttackProps) {
  const [currentInput, setCurrentInput] = useState(''); // User input in the answer box

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Stops the page from refreshing, which is the default behavior of form submission
    resolutionFunction(questionToRender, currentInput);
    setCurrentInput(''); 
  };

  return (
    <div className="modal-overlay">
      <div className="question-window">
        <div className="window-header">
          <h3>{questionToRender.type === 'attack' ? 'INCOMING ATTACK' : 'INCOME QUESTION'}</h3>
          <button onClick={() => clickFunction()}>X</button>
        </div>
          
        <div className="window-body">
          <p>
            {questionToRender.question.text}
          </p>
        </div>

        <form className="answer-area" onSubmit={handleSubmit}>
          <input 
            type="text" 
            className="answer-input" 
            value={currentInput}
            onChange={(event) => setCurrentInput(event.target.value)}
            autoFocus // Automatically puts the cursor in the box so the player can type instantly
          />
          <button type="submit" className="answer-submit">
            FIRE
          </button>
        </form>

      </div>
    </div>
  );
}