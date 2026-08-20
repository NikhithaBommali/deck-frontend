import { useId } from 'react';
import { Rank, Suit } from '../types/game';
import { isSpriteCourtCard, SpriteCourtFace } from './cards/courtCardSprite';
import {
  OrnateSpade,
  SuitIcon,
  suitColor,
} from './cards/suitIcons';

const RANK_NUM: Partial<Record<Rank, number>> = {
  A: 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
};

const PIP_LAYOUTS: Record<number, Array<[number, number]>> = {
  2: [[50, 28], [50, 72]],
  3: [[50, 22], [50, 50], [50, 78]],
  4: [
    [33, 28],
    [67, 28],
    [33, 72],
    [67, 72],
  ],
  5: [
    [33, 26],
    [67, 26],
    [50, 50],
    [33, 74],
    [67, 74],
  ],
  6: [
    [33, 24],
    [67, 24],
    [33, 50],
    [67, 50],
    [33, 76],
    [67, 76],
  ],
  7: [
    [33, 20],
    [67, 20],
    [50, 35],
    [33, 50],
    [67, 50],
    [33, 80],
    [67, 80],
  ],
  8: [
    [33, 20],
    [67, 20],
    [33, 38],
    [67, 38],
    [33, 62],
    [67, 62],
    [33, 80],
    [67, 80],
  ],
  9: [
    [33, 18],
    [67, 18],
    [33, 36],
    [67, 36],
    [50, 50],
    [33, 64],
    [67, 64],
    [33, 82],
    [67, 82],
  ],
  10: [
    [33, 16],
    [67, 16],
    [50, 30],
    [33, 44],
    [67, 44],
    [33, 56],
    [67, 56],
    [50, 70],
    [33, 84],
    [67, 84],
  ],
};

function CornerRank({
  rank,
  color,
  compact,
}: {
  rank: Rank;
  color: string;
  compact: boolean;
}) {
  const rankSize = compact ? (rank === '10' ? 5.5 : 6.5) : rank === '10' ? 7 : 8.5;

  return (
    <text
      x={0}
      y={0}
      fontFamily="Georgia, 'Times New Roman', serif"
      fontWeight="700"
      fontSize={rankSize}
      fill={color}
      textAnchor="start"
    >
      {rank}
    </text>
  );
}

function CenterArt({
  rank,
  suit,
  color,
  compact,
}: {
  rank: Rank;
  suit: Suit;
  color: string;
  compact: boolean;
}) {
  if (rank === 'A') {
    if (suit === 'spades') {
      return <OrnateSpade x={25} y={38} size={compact ? 22 : 30} />;
    }
    return (
      <SuitIcon
        suit={suit}
        x={25}
        y={compact ? 36 : 38}
        size={compact ? 22 : 28}
        color={color}
      />
    );
  }

  const num = RANK_NUM[rank];
  if (num && PIP_LAYOUTS[num]) {
    const pipSize = compact ? 7 : 9;
    return (
      <g>
        {PIP_LAYOUTS[num].map(([px, py], i) => (
          <SuitIcon
            key={i}
            suit={suit}
            x={(px / 100) * 50}
            y={(py / 100) * 70}
            size={pipSize}
            color={color}
          />
        ))}
      </g>
    );
  }

  return null;
}

interface PlayingCardFaceProps {
  rank: Rank;
  suit: Suit;
  compact?: boolean;
}

export function PlayingCardFace({ rank, suit, compact = false }: PlayingCardFaceProps) {
  if (isSpriteCourtCard(rank, suit)) {
    return <SpriteCourtFace rank={rank} suit={suit} />;
  }

  const color = suitColor(suit);
  const cornerX = compact ? 3.5 : 4.5;
  const cornerY = compact ? 5 : 6;
  const shadowId = useId().replace(/:/g, '');

  return (
    <svg viewBox="0 0 50 70" className="h-full w-full" aria-hidden>
      <defs>
        <filter id={`cardShadow-${shadowId}`} x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="0.5" stdDeviation="0.4" floodOpacity="0.15" />
        </filter>
      </defs>

      <rect
        x={0.5}
        y={0.5}
        width={49}
        height={69}
        rx={compact ? 3 : 3.5}
        fill="#ffffff"
        stroke="#cbd5e1"
        strokeWidth={0.5}
        filter={`url(#cardShadow-${shadowId})`}
      />

      <g transform={`translate(${cornerX} ${cornerY})`}>
        <CornerRank rank={rank} color={color} compact={compact} />
      </g>

      <g transform={`translate(${50 - cornerX} ${70 - cornerY}) rotate(180)`}>
        <CornerRank rank={rank} color={color} compact={compact} />
      </g>

      <CenterArt rank={rank} suit={suit} color={color} compact={compact} />
    </svg>
  );
}
