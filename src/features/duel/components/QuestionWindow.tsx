'use client';

import { useState } from 'react';
import { ActiveAttack } from '../types';

interface DuelAttackProps {
  attackToRender: ActiveAttack;
  clickFunction: () => void;
  resolutionFunction: (thisAttack: ActiveAttack, userAnswer: string) => void; // Function to handle the form submission  
}

export default function QuestionWindow({ attackToRender, clickFunction, resolutionFunction }: DuelAttackProps) {
  const [currentInput, setCurrentInput] = useState(''); // User input in the answer box

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Stops the page from refreshing, which is the default behavior of form submission
    resolutionFunction(attackToRender, currentInput);
    setCurrentInput(''); 
  };

  return (
    <div className="modal-overlay">
      <div className="question-window">
        <div className="window-header">
          <h3>INCOMING ATTACK</h3>
          <button onClick={() => clickFunction()}>X</button>
        </div>
          
        <div className="window-body">
          <p>
            {attackToRender.problem.body}
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