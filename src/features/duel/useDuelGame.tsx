// React hook bridging gameEngine.tsx and the UI

import { useState, useCallback } from 'react';
import { PlayerState, QuestionWithSource, ActiveAttack} from './types';
import { checkAnswer, opponentOf } from './gameEngine';

export interface GameState {
  player: PlayerState;
  opponent: PlayerState;
  incomingAttacks: ActiveAttack[]; 
  activeQuestion: QuestionWithSource | null; // Question currently being answered, if any
}

export const useDuelGame = () => {
  const [gameState, setGameState] = useState<GameState>({player: { hp: 100, coins: 0 },
    opponent: { hp: 100, coins: 1000 },
    incomingAttacks: [],
    activeQuestion: null });

  // Adds newAttack to the array of active attacks
  const spawnAttack = useCallback((newAttack: ActiveAttack) => {
    setGameState((prevState) => ({
      ...prevState,
      incomingAttacks: [
        ...prevState.incomingAttacks,
        newAttack                   
      ]
    }));
  }, []);

  // Removes an attack from the array of active attacks based on its ID, and also clears the active question if it's the one being deleted
  const deleteAttack = useCallback((attackID: number) => {
    setGameState((prevState) => {
      const remainingAttacks = prevState.incomingAttacks.filter(
        (attack) => attack.id !== attackID
      );

      const newActiveQuestion = 
        prevState.activeQuestion &&
        prevState.activeQuestion.type === 'attack' &&
        prevState.activeQuestion.id === attackID
          ? null 
          : prevState.activeQuestion;

      return {
        ...prevState,
        incomingAttacks: remainingAttacks,
        activeQuestion: newActiveQuestion,
      };
    });
  }, []);

  // Sets the active question to the passed parameter
  const setActiveQuestion = useCallback((question: QuestionWithSource | null) => { // FIXME should be a MathQuestion, but this is easier for now
    setGameState((prevState) => ({ ...prevState, activeQuestion: question }));
  }, []);

  // Add HP equal to amountToAdd to the target ('player' or 'opponent'). The parameter amountToAdd can be negative or positive.
  // HP loss that would lead to a negative number instead rounds up to zero.
  const addHP = useCallback((amountToAdd: number, target: 'player' | 'opponent') => {
    setGameState((prevState) => ({
      ...prevState,
      [target]: {
        ...prevState[target],
        hp: prevState[target].hp >= -amountToAdd ? prevState[target].hp + amountToAdd : 0 // Clamps HP at 0, so you can't have negative HP
      }
    }));
  }, []);

  // Add coins equal to amountToAdd to the target ('player' or 'opponent'). The parameter amountToAdd can be negative or positive.
  // Negative coins are allowed, but the code which calls addCoins should ensure that the player doesn't go into negative coins.
  const addCoins = useCallback((amountToAdd: number, target: 'player' | 'opponent') => {
    setGameState((prevState) => ({
      ...prevState,
      [target]: {
        ...prevState[target],
        coins: prevState[target].coins + amountToAdd
      }
    }));
  }, []);

  // 
  const resolveAttackResponse = useCallback((attackToResolve: ActiveAttack, answerInputted: string) => {
    if (checkAnswer(attackToResolve.question, answerInputted)) {
      deleteAttack(attackToResolve.id);
    }
    else {
      // FIXME the penalty will eventually be that the question speeds up on the first wrong answer, and then immediately deals its damage on the second wrong answer
      addHP(-10, opponentOf(attackToResolve.owner)); // Temporary penalty for wrong answer: lose 10 HP
    }
  }, [deleteAttack, addHP]);


  const resolveIncomeQuestionResponse = useCallback((questionToResolve: QuestionWithSource, answerInputted: string) => { //FIXME not implemented
    if (checkAnswer(questionToResolve.question, answerInputted)) {
      addCoins(10, 'player');
      setActiveQuestion(null);
      
      // TODO this will call a function in useIncomeQuesiton that generates a new income question in that slot
      if (questionToResolve.onCorrect) {
        questionToResolve.onCorrect();
      }
      else {
        console.error('No onCorrect callback defined when one was expected in resolveIncomeQuestionResponse');
      }
    }

    else {
      setActiveQuestion(null);
      // TODO this will call a function in useIncomeQuesiton that forces a veto
      if (questionToResolve.onIncorrect) {
        questionToResolve.onIncorrect();
      }
      else {
        console.error('No onIncorrect callback defined when one was expected in resolveIncomeQuestionResponse');
      }
    }
  }, [deleteAttack, addHP]);

  // 
  const resolveQuestionResponse = useCallback((questionToResolve: QuestionWithSource, answerInputted: string) => {
    if (questionToResolve.type === 'attack') {
      const targetAttack = gameState.incomingAttacks.find(attack => attack.id === questionToResolve.id);
      if (targetAttack) {
        resolveAttackResponse(targetAttack, answerInputted);
      }
      else {
        console.error('Could not find attack corresponding to active question in resolveQuestionResponse call');
      }
    }

    else {
      resolveIncomeQuestionResponse(questionToResolve, answerInputted);
    }
  }, [gameState.incomingAttacks, resolveAttackResponse, resolveIncomeQuestionResponse]);

  // Triggered when an attack reaches the end of the screen. Deals damage to the appropriate player and deletes the attack.
  const resolveAttackHit = useCallback((attack: ActiveAttack) => {
    addHP(-10, opponentOf(attack.owner));
    deleteAttack(attack.id);
  }, [addHP, deleteAttack]);



  return { gameState, spawnAttack, setActiveQuestion, resolveQuestionResponse, resolveAttackHit };
};