// Object types for the Duel game

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
}

export interface GameState {
  player: PlayerState;
  opponent: PlayerState;
  incomingAttacks: ActiveAttack[]; 
}