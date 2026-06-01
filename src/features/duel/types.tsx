// Object types for the Duel game

export interface MathQuestion { // TODO: this should match the format of the database questions
  body: string;
  correctAnswer: string;
}

export interface PlayerState {
  hp: number;
  coins: number;
}

export interface ActiveAttack {
  id: number;
  question: MathQuestion;
  positionY: number;
  owner: 'player' | 'opponent';
}

// This type is used to identify a math question, along with its source (which attack or income game object it corresponds to)
export interface QuestionWithSource {
  id: number;
  type: 'attack' | 'income';
  question: MathQuestion;
  
  onCorrect?: () => void;
  onIncorrect?: () => void;
}