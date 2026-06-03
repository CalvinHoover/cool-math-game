// React component which is the board for the duel game, showing player/opponent status and incoming attacks

'use client';

import { useEffect, useState } from 'react';
import { useDuelGame } from '../useDuelGame';
import './Duels.css';
import './QuestionOverlay.css';
import './Toolbar.css';
import DuelAttack from "./DuelAttack"
import QuestionWindow from './QuestionWindow';
import IncomeQuestion from './IncomeQuestion';
import { canAffordAttack, generateQuestion, getDifficultyColor, getDifficultyLabel, getTopicColor } from '../gameEngine';
import { allDifficulties, allTopics } from '../constants';
import { useBotOpponent } from '../useBotOpponent';

interface DuelBoardProps {
  onGameOver: (winner: 'player' | 'opponent') => void;
  botElo: number;
}

export default function DuelBoard({ onGameOver, botElo }: DuelBoardProps) {
  const [selectedTopic, setSelectedTopic] = useState<string>(allTopics[0]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<number>(allDifficulties[0]);
  const { gameState, setActiveQuestion, resolveQuestionResponse, resolveAttackPurchase, resolveAttackHit, deflectAttack } = useDuelGame();

  useBotOpponent({ botElo, gameState, resolveAttackPurchase, deflectAttack });

  useEffect(() => {
    if (gameState.player.hp <= 0) {
      onGameOver('opponent');
    } else if (gameState.opponent.hp <= 0) {
      onGameOver('player');
    }
  }, [gameState.player.hp, gameState.opponent.hp, onGameOver]);

  return (
    <div className="duel-container">

      {/* Displays HP and coins */}
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


      {/* Region where attacks appear and can be purchased by clicking */}
      <div className="duel-arena"
        onClick={(eventData) => {
          // Check to ensure the click is on the arena itself, not a child element (like an attack)
          if (eventData.target !== eventData.currentTarget) return;

          // Get relative Y coordinate of the click within the arena
          const rect = eventData.currentTarget.getBoundingClientRect();
          const relativeY = eventData.clientY - rect.top;

          resolveAttackPurchase('player', relativeY, selectedDifficulty, selectedTopic);
        }}

        // TODO this is bad, repeated placeholder code just so you can play as both sides for now.
        // Right click to spawn attacks for the opponent. These are free.
        onContextMenu={(eventData) => {
          eventData.preventDefault();
          if (eventData.target !== eventData.currentTarget) return;

          // Get relative Y coordinate of the click within the arena
          const rect = eventData.currentTarget.getBoundingClientRect();
          const relativeY = eventData.clientY - rect.top;

          resolveAttackPurchase('opponent', relativeY, selectedDifficulty, selectedTopic);
        }}
      >
        
        {/* Renders any active attacks */}
        <div className="attack-container">
          {gameState.incomingAttacks.map((attack) => (
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

      {/* Displays the answer window if there is an active question */}
      {gameState.activeQuestion && 
        <QuestionWindow 
          questionToRender={gameState.activeQuestion} 
          clickFunction={() => setActiveQuestion(null)} 
          resolutionFunction={(question, userAnswer) => {
            resolveQuestionResponse(question, userAnswer);
          }} 
        />
      }

    {/* Toolbar area */}
      <div className="toolbar">
        <div className="toolbar-buttons">

          <div className="attack-selectors-container">
            {/* Buttons for selecting topic of attacks */}
            <div className="attack-selector-array">
              {allTopics.map((topic) => (
                <button 
                  key={topic}
                  className={`attack-selector-button ${topic === selectedTopic ? 'selected' : ''}`}
                  style={{ backgroundColor: getTopicColor(topic) }}
                  onClick={() => setSelectedTopic(topic)}
                >
                  {topic}
                </button>
              ))}
            </div>

            {/* Buttons for selecting difficulty of attacks */}
            <div className="attack-selector-array">
              {allDifficulties.map((difficulty) => (
                <button 
                  key={difficulty}
                  className={`attack-selector-button ${difficulty === selectedDifficulty ? 'selected' : ''}`}
                  style={{ backgroundColor: getDifficultyColor(difficulty) }}
                  onClick={() => setSelectedDifficulty(difficulty)}
                >
                  {getDifficultyLabel(difficulty)}
                </button>
              ))}
            </div>
          </div>

          {/* Right side: Income Questions */}
          <div className="income-question-array">
            {allDifficulties.map((difficulty) => (
              <IncomeQuestion
                key={difficulty}
                difficulty={difficulty}
                clickFunction={(myQuestion, handleCorrect, handleIncorrect) => setActiveQuestion(
                  { id: difficulty, 
                    question: myQuestion, 
                    type: 'income', 
                    onCorrect: handleCorrect,
                    onIncorrect: handleIncorrect
                  }
                )} 
              />
            ))}
          </div>

        </div>
      </div>

    </div>
  );
}