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

// This is a wrapper which contains a math question along with the information of what in game object it is associated with
// (either some particular attack or some particular income question)
export interface QuestionWithSource {
  id: number;
  type: 'attack' | 'income';
  question: Question;
  
  onCorrect?: () => void;
  onIncorrect?: () => void;
}