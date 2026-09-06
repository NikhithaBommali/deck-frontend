import { ReactNode } from 'react';

interface FeltBackgroundProps {
  children: ReactNode;
  className?: string;
  decorative?: boolean;
  variant?: 'default' | 'lobby' | 'minimal';
}

export function FeltBackground({
  children,
  className = '',
  decorative = true,
  variant = 'default',
}: FeltBackgroundProps) {
  const isLobby = variant === 'lobby';
  const isMinimal = variant === 'minimal';

  return (
    <div
      className={`min-h-dvh relative ${
        isLobby ? 'overflow-x-hidden' : 'overflow-hidden'
      } ${
        isLobby
          ? 'bg-[#071f14]'
          : 'bg-gradient-to-br from-felt-900 via-felt-800 to-felt-950'
      } ${className}`}
    >
      <div
        className={`absolute inset-0 ${isLobby ? 'felt-texture-lobby' : 'felt-texture'} ${isMinimal ? 'opacity-30' : 'opacity-100'}`}
        aria-hidden
      />
      <div
        className={`absolute inset-0 ${isLobby ? 'felt-vignette-lobby' : 'felt-vignette'}`}
        aria-hidden
      />

      {decorative && !isMinimal && !isLobby && (
        <>
          <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
            {['♠', '♥', '♦', '♣'].map((suit, i) => {
              const positions = [
                'top-[8%] left-[6%] -rotate-12',
                'top-[12%] right-[8%] rotate-6',
                'bottom-[10%] left-[10%] rotate-12',
                'bottom-[8%] right-[6%] -rotate-6',
              ];
              const colors = [
                'text-white/5',
                'text-red-400/8',
                'text-white/5',
                'text-red-400/8',
              ];
              return (
                <span
                  key={suit}
                  className={`absolute text-6xl sm:text-8xl font-display select-none ${positions[i]} ${colors[i]}`}
                >
                  {suit}
                </span>
              );
            })}
          </div>

          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(90vw,720px)] h-[min(90vw,720px)] rounded-full border border-gold-500/10 pointer-events-none"
            aria-hidden
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(75vw,580px)] h-[min(75vw,580px)] rounded-full border border-white/5 pointer-events-none"
            aria-hidden
          />
        </>
      )}

      {isLobby && (
        <>
          <div className="absolute inset-0 lobby-table-surface pointer-events-none" aria-hidden />
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/25 to-transparent pointer-events-none" aria-hidden />
        </>
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
}
