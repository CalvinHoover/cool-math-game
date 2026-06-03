'use client';
// src/app/duel/[matchId]/page.tsx
// Multiplayer game page. Reads matchId from the URL and passes it to DuelBoard,
// which activates the network sync layer via useDuelSync.

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MenuButton } from '../../../components/interface/MenuButton';
import DuelBoard from '../../../features/duel/components/DuelBoard';
import '../../dashboard/Dashboard.css';

export default function MultiplayerDuelPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = use(params);
  const router = useRouter();
  const [winner, setWinner] = useState<'player' | 'opponent' | null>(null);

  if (winner) {
    return (
      <div className="app-container">
        <h1 className="main-title">You {winner === 'player' ? 'win!' : 'lose!'}</h1>
        <div className="button-group">
          <MenuButton
            label="Find New Match"
            onClick={() => router.push('/duel')}
            className="btn-profile"
          />
          <MenuButton
            label="Back to Menu"
            onClick={() => router.push('/dashboard')}
            className="btn-settings"
          />
        </div>
      </div>
    );
  }

  return (
    <DuelBoard
      matchId={matchId}
      onGameOver={(result) => setWinner(result)}
    />
  );
}
