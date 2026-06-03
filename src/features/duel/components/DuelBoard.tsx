// src/features/duel/components/DuelBoard.tsx
// Top-level game board component.
// Accepts an optional matchId — when provided, runs in multiplayer mode via useDuelSync.
// Without matchId it behaves as before (solo / practice mode).

'use client';

import { useEffect, useState } from 'react';
import { useDuelSync } from '../useDuelSync';
import './Duels.css';
import './QuestionOverlay.css';
import './Toolbar.css';
import DuelAttack from './DuelAttack';
import QuestionWindow from './QuestionWindow';
import IncomeQuestion from './IncomeQuestion';
import { getDifficultyColor, getDifficultyLabel, getTopicColor } from '../gameEngine';
import { allDifficulties, allTopics } from '../constants';

interface DuelBoardProps {
  onGameOver: (winner: 'player' | 'opponent') => void;
  matchId?:   string; // omit for solo mode
}

export default function DuelBoard({ onGameOver, matchId }: DuelBoardProps) {
  const [selectedTopic,      setSelectedTopic]      = useState<string>(allTopics[0]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<number>(allDifficulties[0]);

  const {
    gameState,
    setActiveQuestion,
    resolveQuestionResponse,
    resolveAttackPurchase,
    resolveAttackHit,
    remoteWinner,
    postEvent,
    isMultiplayer,
  } = useDuelSync(matchId);

  // ── Game-over detection ────────────────────────────────────────────────────

  useEffect(() => {
    if (gameState.player.hp <= 0) {
      if (isMultiplayer) postEvent('game_over', {});
      onGameOver('opponent');
    } else if (gameState.opponent.hp <= 0) {
      onGameOver('player');
    }
  }, [gameState.player.hp, gameState.opponent.hp]);

  // Remote game-over (opponent's HP hit 0 on their side)
  useEffect(() => {
    if (remoteWinner) onGameOver(remoteWinner);
  }, [remoteWinner]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="duel-container">

      {/* HP / coins display */}
        <div className="status-bar">
        <div className="player-status">
            <h2>Player</h2>
            <p>HP: {gameState.player.hp}</p>
            <p>Coins: {gameState.player.coins}</p>
        </div>
        <div className="opponent-status">
            <h2>Opponent</h2>
            <p>HP: {gameState.opponent.hp}</p>
            {!isMultiplayer && <p>Coins: {gameState.opponent.coins}</p>}
        </div>
    </div>

      {/* Arena — click to launch an attack */}
      <div
        className="duel-arena"
        onClick={(e) => {
          if (e.target !== e.currentTarget) return;
          const rect      = e.currentTarget.getBoundingClientRect();
          const relativeY = e.clientY - rect.top;
          resolveAttackPurchase('player', relativeY, selectedDifficulty, selectedTopic);
        }}
        // Right-click spawns a free opponent attack — solo testing only
        onContextMenu={isMultiplayer ? undefined : (e) => {
          e.preventDefault();
          if (e.target !== e.currentTarget) return;
          const rect      = e.currentTarget.getBoundingClientRect();
          const relativeY = e.clientY - rect.top;
          resolveAttackPurchase('opponent', relativeY, selectedDifficulty, selectedTopic);
        }}
      >
        <div className="attack-container">
          {gameState.incomingAttacks.map((attack) => (
            <DuelAttack
              key={attack.id}
              attackData={attack}
              clickFunction={() => {
                // In multiplayer, only allow answering incoming (opponent) attacks
                if (isMultiplayer && attack.owner === 'player') return;
                setActiveQuestion({ id: attack.id, question: attack.question, type: 'attack' });
              }}
              hitFunction={() => resolveAttackHit(attack)}
            />
          ))}
        </div>
      </div>

      {/* Question overlay */}
      {gameState.activeQuestion && (
        <QuestionWindow
          questionToRender={gameState.activeQuestion}
          clickFunction={() => setActiveQuestion(null)}
          resolutionFunction={(question, userAnswer) => {
            resolveQuestionResponse(question, userAnswer);
          }}
        />
      )}

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-buttons">

          <div className="attack-selectors-container">
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

          <div className="income-question-array">
            {allDifficulties.map((difficulty) => (
              <IncomeQuestion
                key={difficulty}
                difficulty={difficulty}
                clickFunction={(myQuestion, handleCorrect, handleIncorrect) =>
                  setActiveQuestion({
                    id:          difficulty,
                    question:    myQuestion,
                    type:        'income',
                    onCorrect:   handleCorrect,
                    onIncorrect: handleIncorrect,
                  })
                }
              />
            ))}
          </div>

        </div>
      </div>

    </div>
  );
}
