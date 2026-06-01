// React hook bridging gameEngine.tsx and the UI

import { useState, useCallback } from 'react';
import { GameState, MathProblem, ActiveAttack} from './types';
import { checkAnswer, opponentOf } from './gameEngine';

export const useDuelGame = () => {
  const [gameState, setGameState] = useState<GameState>({player: { hp: 100, coins: 1000 },
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
        prevState.activeQuestion && prevState.activeQuestion.id === attackID
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
  const setActiveQuestion = useCallback((question: ActiveAttack | null) => { // FIXME should be a MathProblem, but this is easier for now
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

  // Checks the player's answer to an attack and updates the game state accordingly, deleting an attack if the answer was correct
  const resolveAttackResponse = useCallback((attackToResolve: ActiveAttack, answerInputted: string) => {
    if (checkAnswer(attackToResolve.problem, answerInputted)) {
      deleteAttack(attackToResolve.id);
    }
    else {
      // FIXME the penalty will eventually be that the question speeds up on the first wrong answer, and then immediately deals its damage on the second wrong answer
      addHP(-10, opponentOf(attackToResolve.owner)); // Temporary penalty for wrong answer: lose 10 HP
    }
  }, [deleteAttack, addHP]);

  // Triggered when an attack reaches the end of the screen. Deals damage to the appropriate player and deletes the attack.
  const resolveAttackHit = useCallback((attack: ActiveAttack) => {
    addHP(-10, opponentOf(attack.owner));
    deleteAttack(attack.id);
  }, [addHP, deleteAttack]);



  return { gameState, spawnAttack, setActiveQuestion, resolveAttackResponse, resolveAttackHit };
};