import { GameState, MathProblem, ActiveAttack, PlayerState} from './types';


export const sampleProblem: MathProblem = {
  body: 'What is 2 + 2?',
  correctAnswer: '4',
};


/*
export interface MathProblem { // TODO: this should match the format of the database problems
  body: string;
  correctAnswer: string;
}

export interface PlayerState {
  hp: number;
  coins: number;
}

export interface ActiveAttack {
  id: number;
  problem: MathProblem;
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
