import { GAME_NAME } from '../constants/brand';

type BrandNameSize = 'sm' | 'md' | 'lg' | 'hero';

const sizeClasses: Record<BrandNameSize, string> = {
  sm: 'text-sm sm:text-base',
  md: 'text-base sm:text-lg',
  lg: 'text-xl sm:text-2xl',
  hero: 'text-3xl sm:text-5xl',
};

interface BrandNameProps {
  size?: BrandNameSize;
  className?: string;
  as?: 'span' | 'h1' | 'h2' | 'p';
}

export function BrandName({
  size = 'md',
  className = '',
  as: Tag = 'span',
}: BrandNameProps) {
  return (
    <Tag
      className={`font-display font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-br from-gold-300 via-gold-400 to-gold-600 ${sizeClasses[size]} ${className}`}
    >
      {GAME_NAME}
    </Tag>
  );
}
