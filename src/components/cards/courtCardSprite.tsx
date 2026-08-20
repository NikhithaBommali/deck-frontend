import { Rank, Suit } from '../../types/game';
import svgCardsUrl from 'svg-cards/svg-cards.svg?url';

const SUIT_SPRITE: Record<Exclude<Suit, 'joker'>, string> = {
  hearts: 'heart',
  diamonds: 'diamond',
  clubs: 'club',
  spades: 'spade',
};

const RANK_SPRITE: Record<'K' | 'Q' | 'J', string> = {
  K: 'king',
  Q: 'queen',
  J: 'jack',
};

const CARD_VIEWBOX = { width: 169.075, height: 244.64 };

/** Hide only corner suit icons from the sprite; rank letters (K/Q/J) stay visible. */
function SpriteSuitCornerCovers() {
  return (
    <>
      <rect x={8} y={46} width={24} height={16} fill="#ffffff" />
      <rect x={145} y={183} width={22} height={18} fill="#ffffff" />
    </>
  );
}

export function courtCardSpriteId(rank: Rank, suit: Suit): string | null {
  if (suit === 'joker') {
    return 'joker_black';
  }

  if (rank !== 'K' && rank !== 'Q' && rank !== 'J') {
    return null;
  }

  return `${SUIT_SPRITE[suit]}_${RANK_SPRITE[rank]}`;
}

export function isSpriteCourtCard(rank: Rank, suit: Suit): boolean {
  return courtCardSpriteId(rank, suit) !== null;
}

interface SpriteCourtFaceProps {
  rank: Rank;
  suit: Suit;
}

export function SpriteCourtFace({ rank, suit }: SpriteCourtFaceProps) {
  const spriteId = courtCardSpriteId(rank, suit);
  if (!spriteId) {
    return null;
  }

  return (
    <svg
      viewBox={`0 0 ${CARD_VIEWBOX.width} ${CARD_VIEWBOX.height}`}
      className="h-full w-full"
      aria-hidden
    >
      <use
        href={`${svgCardsUrl}#${spriteId}`}
        width={CARD_VIEWBOX.width}
        height={CARD_VIEWBOX.height}
      />
      {suit !== 'joker' && <SpriteSuitCornerCovers />}
    </svg>
  );
}
