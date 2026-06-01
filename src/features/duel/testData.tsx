import { MathQuestion, ActiveAttack, PlayerState} from './types';


export const sampleQuestion: MathQuestion = {
  body: 'What is 2 + 2?',
  correctAnswer: '4',
};



/*
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
  positionX: number; // 0 to 100 (percentage across the screen)
  positionY: number; // Height of the question on the screen
  owner: 'player' | 'opponent';
}

export interface GameState {
  player: PlayerState;
  opponent: PlayerState;
  incomingAttacks: ActiveAttack[]; 
}
*/
