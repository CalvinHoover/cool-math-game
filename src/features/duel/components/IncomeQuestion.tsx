// Component for the income question buttons at the bottom of the screen. Answering these questions correctly awards coins.

'use client';

import { useIncomeQuestion } from "../useIncomeQuestion";
import './Toolbar.css';
import { Question } from '../types';
import { getDifficultyLabel, getDifficultyColor } from "../gameEngine";

interface IncomeQuestionProps {
  clickFunction: (myQuestion: Question, onCorrect: () => void, onIncorrect: () => void) => void;
  difficulty: number;
}

export default function IncomeQuestion({ clickFunction, difficulty } : IncomeQuestionProps) {
  const { incomeQuestionState, generateNewProblem, triggerVeto } = useIncomeQuestion(difficulty);

  return (
    <div className={`income-question ${incomeQuestionState.isVetoed ? 'vetoed' : ''}`}
      onClick={() => {
        if (incomeQuestionState.isVetoed) return;
        clickFunction(incomeQuestionState.question, generateNewProblem, triggerVeto);
      }}
    >
    
      <button 
        className="veto-button"
        onClick={(event) => {
          event.stopPropagation(); // Prevent the parent div's click handler from being triggered
          if (incomeQuestionState.isVetoed) return; // If already vetoed, do nothing
          triggerVeto();
        }}
      >
        VETO
      </button>

      <div className="income-content">
        <h3>INCOME QUESTION</h3>
        <p style={{ color: getDifficultyColor(difficulty) }}>
          {incomeQuestionState.isVetoed ? 'VETOED...' : getDifficultyLabel(difficulty)}
        </p>
      </div>
    </div>
  );
}