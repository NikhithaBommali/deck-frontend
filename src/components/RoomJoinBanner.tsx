import { RoomPeekResult } from '../types/room';

interface RoomJoinBannerProps {
  code: string;
  peek: RoomPeekResult | null;
  loading: boolean;
}

function phaseLabel(phase: RoomPeekResult['phase'], roundNumber?: number): string {
  switch (phase) {
    case 'waiting':
      return 'Waiting for players';
    case 'dealing':
      return roundNumber ? `Round ${roundNumber} — dealing` : 'Dealing cards';
    case 'playing':
      return roundNumber ? `Round ${roundNumber} — in progress` : 'In progress';
    case 'round-end':
      return roundNumber ? `Round ${roundNumber} — between rounds` : 'Between rounds';
    case 'finished':
      return 'Game finished';
    default:
      return 'Unknown';
  }
}

const slotClass =
  'h-full w-full flex items-center justify-center px-3 rounded-lg border text-center';

export function RoomJoinBanner({
  code,
  peek,
  loading,
}: RoomJoinBannerProps) {
  if (loading) {
    return (
      <div className={`${slotClass} bg-white/5 border-white/10`}>
        <p className="text-white/60 text-xs sm:text-sm truncate">
          Checking room {code}...
        </p>
      </div>
    );
  }

  if (!peek || !peek.success) {
    return null;
  }

  if (!peek.exists) {
    return (
      <div className={`${slotClass} bg-red-500/15 border-red-500/30`}>
        <p className="text-red-300 text-xs sm:text-sm line-clamp-2">
          Room <span className="font-mono">{code}</span> not found
        </p>
      </div>
    );
  }

  if (peek.canJoin) {
    return (
      <div className={`${slotClass} bg-gold-500/15 border-gold-500/30`}>
        <p className="text-gold-300 text-xs sm:text-sm line-clamp-2">
          Join <span className="font-semibold text-white">{peek.hostName}</span>&apos;s
          table · {peek.playerCount}/{peek.maxPlayers} players
        </p>
      </div>
    );
  }

  if (peek.reason === 'ROOM_FULL') {
    return (
      <div className={`${slotClass} bg-amber-500/15 border-amber-500/30`}>
        <p className="text-amber-300 text-xs sm:text-sm line-clamp-2">
          {peek.hostName}&apos;s room is full ({peek.maxPlayers}/{peek.maxPlayers})
        </p>
      </div>
    );
  }

  if (peek.reason === 'GAME_FINISHED') {
    return (
      <div className={`${slotClass} bg-white/5 border-white/15`}>
        <p className="text-white/70 text-xs sm:text-sm line-clamp-2">
          This game has ended — create or join another room
        </p>
      </div>
    );
  }

  return (
    <div className={`${slotClass} bg-blue-500/15 border-blue-500/30`}>
      <p className="text-blue-200 text-xs sm:text-sm line-clamp-2">
        {peek.hostName}&apos;s game · {phaseLabel(peek.phase, peek.roundNumber)} —
        join before start only
      </p>
    </div>
  );
}
