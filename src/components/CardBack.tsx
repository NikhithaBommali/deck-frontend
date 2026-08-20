import { useId, type CSSProperties } from 'react';

export type CardBackSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const sizeClasses: Record<CardBackSize, string> = {
  xs: 'w-4 h-6 rounded-[3px]',
  sm: 'w-5 h-7 rounded-[4px]',
  md: 'w-12 h-16 rounded-lg',
  lg: 'w-14 h-20 rounded-lg',
  xl: 'w-16 h-24 rounded-lg',
};

interface CardBackProps {
  size?: CardBackSize;
  className?: string;
  animated?: boolean;
  style?: CSSProperties;
}

export function CardBack({
  size = 'md',
  className = '',
  animated = false,
  style,
}: CardBackProps) {
  const uid = useId().replace(/:/g, '');
  const gradId = `card-back-grad-${uid}`;
  const shineId = `card-back-shine-${uid}`;
  const latticeId = `card-back-lattice-${uid}`;

  return (
    <div className={`${sizeClasses[size]} ${className}`} style={style} aria-hidden>
      <div
        className={`relative h-full w-full overflow-hidden shadow-card ring-1 ring-black/20 ${
          animated ? 'animate-pulse' : ''
        }`}
      >
        <svg
          viewBox="0 0 56 80"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9f1239" />
              <stop offset="45%" stopColor="#7f1d1d" />
              <stop offset="100%" stopColor="#450a0a" />
            </linearGradient>
            <linearGradient id={shineId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
              <stop offset="35%" stopColor="rgba(255,255,255,0.04)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.15)" />
            </linearGradient>
            <pattern
              id={latticeId}
              width="6"
              height="6"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <rect width="6" height="6" fill="transparent" />
              <path
                d="M0 3 L3 0 L6 3 L3 6 Z"
                fill="none"
                stroke="rgba(255,235,200,0.14)"
                strokeWidth="0.45"
              />
            </pattern>
          </defs>

          <rect width="56" height="80" rx="4" fill={`url(#${gradId})`} />

          <rect
            x="2.5"
            y="2.5"
            width="51"
            height="75"
            rx="3"
            fill="none"
            stroke="#fde68a"
            strokeWidth="1.1"
            opacity="0.95"
          />

          <rect
            x="5"
            y="5"
            width="46"
            height="70"
            rx="2.5"
            fill={`url(#${latticeId})`}
            stroke="#d4af37"
            strokeWidth="0.75"
          />

          {[
            [10, 10],
            [46, 10],
            [10, 70],
            [46, 70],
          ].map(([cx, cy], i) => (
            <g key={i} transform={`translate(${cx} ${cy})`} opacity="0.85">
              <circle r="2.2" fill="none" stroke="#fde68a" strokeWidth="0.5" />
              <path
                d="M-1.5 0 H1.5 M0 -1.5 V1.5"
                stroke="#fde68a"
                strokeWidth="0.45"
              />
            </g>
          ))}

          <ellipse
            cx="28"
            cy="40"
            rx="11"
            ry="14.5"
            fill="rgba(69,10,10,0.35)"
            stroke="#fde68a"
            strokeWidth="0.8"
          />
          <ellipse
            cx="28"
            cy="40"
            rx="8"
            ry="10.5"
            fill="none"
            stroke="#d4af37"
            strokeWidth="0.55"
          />

          <g transform="translate(28 40)" fill="#fde68a" opacity="0.92">
            <text y="-2.5" textAnchor="middle" fontSize="5.5">
              ♠
            </text>
            <text y="6.5" textAnchor="middle" fontSize="5.5">
              ♥
            </text>
            <text x="-5.5" y="2.5" textAnchor="middle" fontSize="5">
              ♦
            </text>
            <text x="5.5" y="2.5" textAnchor="middle" fontSize="5">
              ♣
            </text>
          </g>

          <line
            x1="8"
            y1="40"
            x2="18"
            y2="40"
            stroke="#fde68a"
            strokeWidth="0.45"
            opacity="0.45"
          />
          <line
            x1="38"
            y1="40"
            x2="48"
            y2="40"
            stroke="#fde68a"
            strokeWidth="0.45"
            opacity="0.45"
          />

          <rect width="56" height="80" rx="4" fill={`url(#${shineId})`} />
        </svg>
      </div>
    </div>
  );
}
