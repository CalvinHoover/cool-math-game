// React component which is the board for the duel game, showing player/opponent status and incoming attacks

'use client';

import { useDuelGame } from '../useDuelGame';
import './Duels.css';
import './QuestionOverlay.css';
import './IncomeQuestion.css';
import { sampleQuestion } from '../testData';
import DuelAttack from "./DuelAttack"
import { ActiveAttack } from '../types';
import QuestionWindow from './QuestionWindow';
import IncomeQuestion from './IncomeQuestion';

export default function DuelBoard() {
  const { gameState, spawnAttack, setActiveQuestion, resolveQuestionResponse, resolveAttackHit } = useDuelGame();

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
          question: sampleQuestion,
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
          question: sampleQuestion,
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
            clickFunction={() => setActiveQuestion(
             { id: attack.id, question: attack.question, type: 'attack' }
            )}
            hitFunction={() => resolveAttackHit(attack)}
          />
        ))}
      </div>
    </div>

    {gameState.activeQuestion && 
      <QuestionWindow 
        questionToRender={gameState.activeQuestion} 
        clickFunction={() => setActiveQuestion(null)} 
        resolutionFunction={(question, userAnswer) => {
          resolveQuestionResponse(question, userAnswer);
        }} 
      />
    }

  {/* Income question area */}
    <div className="income-question-space">
      <div className="income-question-array">
        {Array.from({ length: 3 }).map((_, i) => (
          <IncomeQuestion
            key={i}
            clickFunction={(myQuestion) => setActiveQuestion(
              { id: i, 
                question: myQuestion, 
                type: 'income', 
                onCorrect: () => console.log('This will generate a new problem'), // TODO implement
                onIncorrect: () => console.log('This will force an automatic veto') // TODO implement
              }
            )} 
          />
        ))}
      </div>
    </div>

  </div>

  );
}