import { CardBack } from './CardBack';

interface CenterDeckProps {
  count: number;
  isDealing: boolean;
}

export function CenterDeck({ count, isDealing }: CenterDeckProps) {
  const layers = Math.min(8, Math.max(2, Math.ceil(count / 8)));

  return (
    <div className="relative flex flex-col items-center">
      <div
        className="relative overflow-visible"
        style={{ width: '4.25rem', height: '5.5rem' }}
      >
        {Array.from({ length: layers }).map((_, i) => (
          <CardBack
            key={i}
            size="lg"
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
