import { Card as CardType, Rank } from '../types/game';
import { isZeroScoreCard } from '../types/game';
import { CardBack } from './CardBack';
import { PlayingCardFace } from './PlayingCardFace';

interface CardProps {
  card: CardType;
  zeroRank?: Rank | null;
  selected?: boolean;
  highlight?: boolean;
  disabled?: boolean;
  small?: boolean;
  faceDown?: boolean;
  onClick?: () => void;
}

export function Card({
  card,
  zeroRank = null,
  selected = false,
  highlight = false,
  disabled = false,
  small = false,
  faceDown = false,
  onClick,
}: CardProps) {
  const isZero = isZeroScoreCard(card, zeroRank);
  const sizeClass = small ? 'w-12 h-[4.25rem]' : 'w-16 h-[5.6rem]';

  if (faceDown || card.id === 'hidden') {
    return <CardBack size={small ? 'md' : 'xl'} />;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        relative overflow-hidden ${sizeClass} rounded-[0.65rem]
        bg-white shadow-card ring-1 ring-black/10
        transition-all duration-150
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-card-hover cursor-pointer'}
        ${selected ? 'ring-2 ring-gold-400 -translate-y-2 shadow-card-hover' : ''}
        ${highlight ? 'ring-2 ring-green-400 animate-pulse' : ''}
        ${isZero ? 'ring-2 ring-purple-400/80' : ''}
        select-none p-0
      `}
    >
      <PlayingCardFace rank={card.rank} suit={card.suit} compact={small} />
      {isZero && (
        <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-purple-500 rounded-full text-white text-[8px] flex items-center justify-center font-bold shadow-sm z-10">
          0
        </span>
      )}
    </button>
  );
}
