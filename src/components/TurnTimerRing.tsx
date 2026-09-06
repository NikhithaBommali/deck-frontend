import { ReactNode } from 'react';
import { TURN_WARNING_SEC } from '../types/game';
import { useTurnProgress } from '../hooks/useTurnCountdown';

interface TurnTimerRingProps {
  deadlineAt: number | null;
  durationSec: number;
  isMyTurn?: boolean;
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const ringSizePx = {
  sm: 48,
  md: 68,
  lg: 96,
} as const;

const strokeWidth = {
  sm: 2.5,
  md: 3,
  lg: 3.5,
} as const;

export function TurnTimerRing({
  deadlineAt,
  durationSec,
  isMyTurn = false,
  size = 'md',
  children,
}: TurnTimerRingProps) {
  const progress = useTurnProgress(deadlineAt, durationSec);

  if (progress === null || !deadlineAt) {
    return <>{children}</>;
  }

  const outer = ringSizePx[size];
  const stroke = strokeWidth[size];
  const radius = (outer - stroke) / 2 - 1;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);
  const isUrgent = progress <= TURN_WARNING_SEC / durationSec;

  const ringColor = isUrgent
    ? '#f87171'
    : isMyTurn
      ? '#f5d061'
      : '#34d399';

  return (
    <div
      className={`relative inline-flex items-center justify-center ${isUrgent ? 'animate-pulse' : ''}`}
      style={{ width: outer, height: outer }}
      role="timer"
      aria-label="Turn time remaining"
    >
      <svg
        className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
        viewBox={`0 0 ${outer} ${outer}`}
        aria-hidden
      >
        <circle
          cx={outer / 2}
          cy={outer / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={stroke}
        />
        <circle
          cx={outer / 2}
          cy={outer / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-[stroke-dashoffset] duration-100 ease-linear"
          style={{
            filter: isUrgent
              ? 'drop-shadow(0 0 4px rgba(248,113,113,0.6))'
              : isMyTurn
                ? 'drop-shadow(0 0 4px rgba(245,208,97,0.35))'
                : 'drop-shadow(0 0 3px rgba(52,211,153,0.3))',
          }}
        />
      </svg>
      <div className="relative z-10 flex items-center justify-center">{children}</div>
    </div>
  );
}
