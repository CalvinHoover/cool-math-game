// React component which is the board for the duel game, showing player/opponent status and incoming attacks

'use client';

import { useDuelGame } from './useDuelGame';
import { MenuButton } from '../../components/interface/MenuButton';
import './Duels.css';

export default function DuelBoard() {
  const { gameState } = useDuelGame();

  

  return (
    <div className="duel-arena">
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
    </div>
  );
}