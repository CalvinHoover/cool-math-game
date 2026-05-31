'use client';

import { ActiveAttack } from '../types';
import './DuelAttack.css';

interface DuelAttackProps {
  attackData: ActiveAttack;
  clickFunction: () => void;  
}

export default function DuelAttack({ attackData, clickFunction } : DuelAttackProps) {
  return (
    <div 
      className={`attack-box ${attackData.owner}`}
      style={{ top: `${attackData.positionY}px` }}

      onClick={(event) => {
        event.stopPropagation(); // Stops click from also registering as a click on the arena
        clickFunction();           
      }}
    >
      Incoming attack!
    </div> 
  );
}