// Object types for the Duel game
export interface Question {
  text: string;
  answer: string;
  difficulty: number;
  topic: string;
}

export interface PlayerState {
  hp: number;
  coins: number;
}

export interface ActiveAttack {
  id: number;
  question: Question;
  positionY: number;
  owner: 'player' | 'opponent';
}

// This type is used to identify a math question, along with its source (which attack or income game object it corresponds to)
export interface QuestionWithSource {
  id: number;
  type: 'attack' | 'income';
  question: Question;
  
  onCorrect?: () => void;
  onIncorrect?: () => void;
}