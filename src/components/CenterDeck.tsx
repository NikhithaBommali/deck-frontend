import { CardBack, CardBackSize } from './CardBack';

interface CenterDeckProps {
  count: number;
  isDealing: boolean;
  size?: CardBackSize;
}

const deckDimensions: Record<CardBackSize, { w: string; h: string }> = {
  xs: { w: '1rem', h: '1.5rem' },
  sm: { w: '1.25rem', h: '1.75rem' },
  md: { w: '3rem', h: '4rem' },
  lg: { w: '3.5rem', h: '5rem' },
  xl: { w: '4rem', h: '6rem' },
};

export function CenterDeck({ count, isDealing, size = 'lg' }: CenterDeckProps) {
  const layers = Math.min(8, Math.max(2, Math.ceil(count / 8)));
  const dims = deckDimensions[size];

  return (
    <div className="relative flex flex-col items-center">
      <div
        className="relative overflow-visible"
        style={{ width: dims.w, height: dims.h }}
      >
        {Array.from({ length: layers }).map((_, i) => (
          <CardBack
            key={i}
            size={size}
            animated={isDealing && i === layers - 1}
            className="absolute top-0 left-0 border-amber-900/30"
            style={{
              transform: `translate(${i * 2}px, ${-i * 2}px)`,
              zIndex: i,
              opacity: 1 - i * 0.08,
            }}
          />
        ))}
      </div>
      <p className="text-white/50 text-[10px] uppercase tracking-wider mt-2">
        {count > 0 ? `${count} in deck` : 'Deck empty'}
      </p>
    </div>
  );
}
