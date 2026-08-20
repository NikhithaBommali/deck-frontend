import { Card as CardType, Rank } from '../types/game';
import { Card } from './Card';

interface DiscardPileProps {
  discardTop: CardType | null;
  pickableDiscardCard: CardType | null;
  myPlacedOnDiscard: CardType[];
  wildRank: Rank | null;
  canPick: boolean;
  onPick: () => void;
}

export function DiscardPile({
  discardTop,
  pickableDiscardCard,
  myPlacedOnDiscard,
  wildRank,
  canPick,
  onPick,
}: DiscardPileProps) {
  const pickableIsTop =
    pickableDiscardCard &&
    discardTop &&
    pickableDiscardCard.id === discardTop.id;
  const hasSeparatePickable =
    pickableDiscardCard && !pickableIsTop && canPick;

  return (
    <div className="text-center space-y-2">
      <p className="text-white/50 text-[10px] uppercase tracking-wider">Discard</p>

      <div className="flex flex-col items-center gap-2 min-h-[5.5rem]">
        {discardTop ? (
          <div className="relative">
            {myPlacedOnDiscard.length > 1 ? (
              <div className="relative flex items-end justify-center">
                {myPlacedOnDiscard.slice(0, 3).map((card, i) => (
                  <div
                    key={card.id}
                    className={i > 0 ? 'absolute' : 'relative'}
                    style={
                      i > 0 ? { left: i * 8, bottom: i * 2, zIndex: i + 1 } : undefined
                    }
                  >
                    <Card card={card} zeroRank={wildRank} small />
                  </div>
                ))}
                {myPlacedOnDiscard.length > 1 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-blue-600 text-white text-[9px] rounded-full flex items-center justify-center font-bold z-20">
                    {myPlacedOnDiscard.length}
                  </span>
                )}
              </div>
            ) : (
              <Card card={discardTop} zeroRank={wildRank} small />
            )}
            {myPlacedOnDiscard.length > 0 && hasSeparatePickable && (
              <p className="text-white/40 text-[9px] mt-1">Your discard</p>
            )}
          </div>
        ) : (
          <div className="w-12 h-16 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center">
            <span className="text-white/30 text-[10px]">Empty</span>
          </div>
        )}

        {hasSeparatePickable && pickableDiscardCard && (
          <div className="flex flex-col items-center gap-1">
            <p className="text-teal-300/80 text-[9px] uppercase tracking-wide">
              Previous player left
            </p>
            <button
              type="button"
              onClick={onPick}
              className="relative rounded-lg ring-2 ring-teal-400 ring-offset-2 ring-offset-emerald-900 animate-pulse hover:scale-105 transition-transform"
            >
              <Card card={pickableDiscardCard} zeroRank={wildRank} small highlight />
            </button>
            <span className="text-teal-300 text-[10px] font-bold">Tap to pick</span>
          </div>
        )}

        {canPick && pickableDiscardCard && pickableIsTop && (
          <button
            type="button"
            onClick={onPick}
            className="flex flex-col items-center gap-1 group"
          >
            <span className="text-teal-300/80 text-[9px] uppercase tracking-wide">
              Previous player&apos;s card
            </span>
            <div className="relative rounded-lg ring-2 ring-teal-400 animate-pulse group-hover:scale-105 transition-transform">
              <Card card={pickableDiscardCard} zeroRank={wildRank} small highlight />
            </div>
            <span className="text-teal-300 text-[10px] font-bold">Tap to pick</span>
          </button>
        )}
      </div>
    </div>
  );
}
