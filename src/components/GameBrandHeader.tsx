import { ReactNode } from 'react';
import { BrandLogo } from './BrandLogo';
import { BrandName } from './BrandName';

interface GameBrandHeaderProps {
  size?: 'sm' | 'md';
  subtitle?: ReactNode;
  className?: string;
}

export function GameBrandHeader({
  size = 'sm',
  subtitle,
  className = '',
}: GameBrandHeaderProps) {
  return (
    <div className={`flex items-center gap-2 min-w-0 ${className}`}>
      <BrandLogo size={size === 'sm' ? 'xs' : 'sm'} />
      <div className="min-w-0">
        <BrandName size={size === 'sm' ? 'sm' : 'md'} as="span" />
        {subtitle && (
          <div className="text-white/40 text-[10px] sm:text-xs truncate mt-0.5">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}
