interface PlayerAvatarProps {
  name: string;
  profilePicture?: string;
  size?: 'sm' | 'md' | 'lg';
  isHost?: boolean;
  isActive?: boolean;
  isMe?: boolean;
  isReady?: boolean;
  showReadyRing?: boolean;
}

const sizeClasses = {
  sm: 'w-10 h-10 text-sm',
  md: 'w-14 h-14 text-base',
  lg: 'w-20 h-20 text-xl',
};

export function PlayerAvatar({
  name,
  profilePicture,
  size = 'md',
  isHost = false,
  isActive = false,
  isMe = false,
  isReady = false,
  showReadyRing = false,
}: PlayerAvatarProps) {
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="relative flex flex-col items-center">
      <div
        className={`
          relative rounded-full overflow-hidden border-2 shadow-lg transition-all duration-300
          ${sizeClasses[size]}
          ${isActive ? 'border-green-400 ring-4 ring-green-400/50 animate-pulse scale-110' : ''}
          ${!isActive && isMe ? 'border-gold-400 ring-2 ring-gold-400/40' : ''}
          ${!isActive && !isMe ? 'border-white/30' : ''}
          ${showReadyRing && isReady ? 'ring-2 ring-green-500/60' : ''}
        `}
      >
        {profilePicture ? (
          <img
            src={profilePicture}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gold-500/30 to-gold-700/30 flex items-center justify-center font-bold text-gold-300">
            {initial}
          </div>
        )}
      </div>

      {isHost && (
        <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-gold-500 text-felt-900 text-[9px] font-bold rounded-full z-10">
          HOST
        </span>
      )}

      {isActive && (
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-green-500 text-white text-[9px] font-bold rounded-full whitespace-nowrap z-10">
          TURN
        </span>
      )}
    </div>
  );
}
