// Floating attack component that moves across the arena and can be clicked to solve the corresponding math question.

'use client';

import { ActiveAttack } from '../types';
import './DuelAttack.css';

interface DuelAttackProps {
  attackData: ActiveAttack;
  clickFunction: () => void; 
  hitFunction: () => void;  
}

export default function DuelAttack({ attackData, clickFunction, hitFunction } : DuelAttackProps) {
  return (
    <div 
      className={`attack-box ${attackData.owner}`}
      style={{ top: `${attackData.positionY}px` }}

      onClick={(event) => {
        event.stopPropagation(); // Stops click from also registering as a click on the arena
        clickFunction();           
      }}

      onAnimationEnd={() => {
        hitFunction();
      }}
    >
      Incoming attack!
    </div> 
  );
}