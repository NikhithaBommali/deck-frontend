import { LOGO_PATH } from '../constants/brand';

type BrandLogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero' | 'banner';

const sizeClasses: Record<BrandLogoSize, string> = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
  hero: 'w-28 h-28 sm:w-36 sm:h-36',
  banner: 'w-[min(72vw,220px)] sm:w-[240px]',
};

interface BrandLogoProps {
  size?: BrandLogoSize;
  className?: string;
  withGlow?: boolean;
}

export function BrandLogo({
  size = 'md',
  className = '',
  withGlow = false,
}: BrandLogoProps) {
  return (
    <div
      className={`relative flex-shrink-0 ${sizeClasses[size]} ${className}`}
    >
      {withGlow && (
        <div
          className="absolute inset-0 rounded-full bg-gold-500/20 blur-xl scale-110"
          aria-hidden
        />
      )}
      <img
        src={LOGO_PATH}
        alt=""
        className="relative w-full h-full object-contain drop-shadow-lg"
        draggable={false}
      />
    </div>
  );
}
