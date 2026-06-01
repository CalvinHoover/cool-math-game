// React component which is the board for the duel game, showing player/opponent status and incoming attacks

'use client';

import { useDuelGame } from '../useDuelGame';
import './Duels.css';
import './QuestionOverlay.css';
import { sampleProblem } from '../testData';
import DuelAttack from "./DuelAttack"
import { ActiveAttack } from '../types';
import QuestionWindow from './QuestionWindow';

export default function DuelBoard() {
  const { gameState, spawnAttack, setActiveQuestion, resolveAttackResponse, resolveAttackHit } = useDuelGame();

  return (
    <div className="duel-container">

      <div className="status-bar">
        <div className="player-status">
          <h2>Player</h2>
          <p>HP: {gameState.player.hp}</p>
          <p>Coins: {gameState.player.coins}</p>
        </div>
        <div className="opponent-status">
          <h2>Opponent</h2>
          <p>HP: {gameState.opponent.hp}</p>
          <p>Coins: {gameState.opponent.coins}</p>
        </div>
      </div>


    <div className="duel-arena"
      onClick={(eventData) => {
        // Check to ensure the click is on the arena itself, not a child element (like an attack)
        if (eventData.target !== eventData.currentTarget) return;

        // Get relative Y coordinate of the click within the arena
        const rect = eventData.currentTarget.getBoundingClientRect();
        const relativeY = eventData.clientY - rect.top;

        spawnAttack({
          id: Date.now(),
          problem: sampleProblem,
          positionY: relativeY,
          owner: 'player'
        });
      }}

      // TODO this is bad, repeated placeholder code just so you can play as both sides for now.
      // Right click to spawn attacks for the opponent.
      onContextMenu={(eventData) => {
        eventData.preventDefault();

        if (eventData.target !== eventData.currentTarget) return;

        // Get relative Y coordinate of the click within the arena
        const rect = eventData.currentTarget.getBoundingClientRect();
        const relativeY = eventData.clientY - rect.top;

        spawnAttack({
          id: Date.now(),
          problem: sampleProblem,
          positionY: relativeY,
          owner: 'opponent'
        });
      }}
    >
        
      <div className="attack-container">
        {gameState.incomingAttacks.map((attack : ActiveAttack) => (
          <DuelAttack 
            key={attack.id} 
            attackData={attack}
            clickFunction={() => setActiveQuestion(attack)}
            hitFunction={() => resolveAttackHit(attack)}
          />
        ))}
      </div>
    </div>

    {gameState.activeQuestion && 
      <QuestionWindow 
        attackToRender={gameState.activeQuestion} 
        clickFunction={() => setActiveQuestion(null)} 
        resolutionFunction={(attack, userAnswer) => {
          resolveAttackResponse(attack, userAnswer);
        }} 
      />
    }
  
  </div>
  );
}