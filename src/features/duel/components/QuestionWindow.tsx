'use client';

import { ActiveAttack } from '../types';

interface DuelAttackProps {
  questionToRender: ActiveAttack;
  clickFunction: () => void;  
}

export default function QuestionWindow({ questionToRender, clickFunction }: DuelAttackProps) {

  // A temporary shell function to handle the form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevents the page from refreshing!
    console.log("Answer submitted!");
    // You'll eventually check the answer here and call clickFunction() to close it
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
            {questionToRender.problem.body}
          </p>
        </div>

        <form className="answer-area" onSubmit={handleSubmit}>
          <input 
            type="string" 
            className="answer-input" 
            autoFocus // Automatically puts the cursor in the box so they can type instantly
          />
          <button type="submit" className="answer-submit">
            FIRE
          </button>
        </form>


      </div>
    </div>
  );
}