'use client';

import { useIncomeQuestion } from "../useIncomeQuestion";
import './IncomeQuestion.css';
import { MathQuestion } from '../types';

interface IncomeQuestionProps {
  clickFunction: (myQuestion : MathQuestion) => void; 
}

export default function IncomeQuestion({ clickFunction } : IncomeQuestionProps) {
  const { incomeQuestionState } = useIncomeQuestion();

  return (
    <div className="income-question"
      onClick={() => clickFunction(incomeQuestionState.question)}
    >
    
      <button 
        className="veto-button"
        onClick={() => {
          console.log("Veto clicked!"); 
        }}
      >
        VETO
      </button>

      <div className="income-content">
        <h3>INCOME QUESTION</h3>
        <p>{incomeQuestionState.question.body}</p>
      </div>
    </div>
  );
}