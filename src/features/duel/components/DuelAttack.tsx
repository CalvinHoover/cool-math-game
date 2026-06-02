// Floating attack component that moves across the arena and can be clicked to solve the corresponding math question.

'use client';

import { getTopicColor } from '../gameEngine';
import { ActiveAttack } from '../types';
import './DuelAttack.css';

interface DuelAttackProps {
  attackData: ActiveAttack;
  clickFunction: () => void; 
  hitFunction: () => void;  
}

export default function DuelAttack({ attackData, clickFunction, hitFunction } : DuelAttackProps) {
  const topicColor = getTopicColor(attackData.question.topic);
  // Easy questions render as a single triangle, medium render as two, and hard as three.
  const numTriangles = attackData.question.difficulty + 1;

  const triangleWidth = 75; // Width of the triangle
  const triangleHeight = 50; // Height of the flat side
  const totalWidth = triangleWidth * numTriangles;

  const triangles = Array.from({ length: numTriangles }).map((_, i) => {
    let path = '';
    const xOffset = i * triangleWidth;

    if (attackData.owner === 'player') {
      // Points Right: Flat side on the left, tip on the right
      path = `M ${xOffset} 0 L ${xOffset + triangleWidth} ${triangleHeight / 2} L ${xOffset} ${triangleHeight} Z`;
    } else {
      // Points Left: Flat side on the right, tip on the left
      path = `M ${xOffset + triangleWidth} 0 L ${xOffset} ${triangleHeight / 2} L ${xOffset + triangleWidth} ${triangleHeight} Z`;
    }

    return (
      <path
        key={i}
        d={path}
        fill="#000000"     
        stroke={topicColor}
        strokeWidth="3"
        strokeLinejoin="round"
      />
    );
  });

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
      <svg 
        width={totalWidth} 
        height={triangleHeight} 
        viewBox={`0 0 ${totalWidth} ${triangleHeight}`}
        style={{ 
          display: 'block', 
          filter: `drop-shadow(0px 0px 6px ${topicColor}80)` // Adds a slight neon glow
        }}
      >
        {triangles}
      </svg>
    </div> 
  );
}