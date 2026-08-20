import { Suit } from '../../types/game';

export const CARD_RED = '#D40000';
export const CARD_BLACK = '#0A0A0A';

export function suitColor(suit: Suit): string {
  if (suit === 'hearts' || suit === 'diamonds') return CARD_RED;
  if (suit === 'joker') return '#6B21A8';
  return CARD_BLACK;
}

interface SuitIconProps {
  suit: Suit;
  x: number;
  y: number;
  size: number;
  color: string;
}

export function SuitIcon({ suit, x, y, size, color }: SuitIconProps) {
  const scale = size / 10;
  const transform = `translate(${x} ${y}) scale(${scale}) translate(-5 -5)`;

  if (suit === 'joker') return null;

  if (suit === 'hearts') {
    return (
      <path
        transform={transform}
        fill={color}
        d="M5 9.2C1.8 6.2 0 4.2 0 2.3 0 0.8 1.1 0 2.5 0 3.6 0 4.5 0.7 5 1.6 5.5 0.7 6.4 0 7.5 0 8.9 0 10 0.8 10 2.3 10 4.2 8.2 6.2 5 9.2Z"
      />
    );
  }

  if (suit === 'diamonds') {
    return (
      <path transform={transform} fill={color} d="M5 0.5 L9.5 5 L5 9.5 L0.5 5 Z" />
    );
  }

  if (suit === 'spades') {
    return (
      <g transform={transform} fill={color}>
        <path d="M5 0.2 C1.2 3.8 0 5.8 0 7.5 C0 8.8 1 9.8 2.5 9.8 C3.5 9.8 4.4 9.3 5 8.5 C5.6 9.3 6.5 9.8 7.5 9.8 C9 9.8 10 8.8 10 7.5 C10 5.8 8.8 3.8 5 0.2 Z" />
        <rect x="4.1" y="9.5" width="1.8" height="2.2" rx="0.2" />
      </g>
    );
  }

  return (
    <g transform={transform} fill={color}>
      <circle cx="5" cy="3.2" r="2" />
      <circle cx="2.8" cy="5.8" r="2" />
      <circle cx="7.2" cy="5.8" r="2" />
      <rect x="4.1" y="7.8" width="1.8" height="2.4" rx="0.2" />
    </g>
  );
}

export function OrnateSpade({ x, y, size }: { x: number; y: number; size: number }) {
  const s = size / 28;
  return (
    <g
      transform={`translate(${x} ${y}) scale(${s}) translate(-14 -16)`}
      fill={CARD_BLACK}
    >
      <path d="M14 0 C6 8 4 12 4 16 C4 19 6 21 9 21 C11 21 12.5 20 14 18 C15.5 20 17 21 19 21 C22 21 24 19 24 16 C24 12 22 8 14 0 Z" />
      <path d="M12 21 H16 V28 H12 Z" />
      <ellipse cx="14" cy="12" rx="3" ry="4" fill="#ffffff" opacity="0.12" />
    </g>
  );
}
