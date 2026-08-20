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
      return roundNumber ? `Round ${roundNumber} — dealing cards` : 'Dealing cards';
    case 'playing':
      return roundNumber ? `Round ${roundNumber} — in progress` : 'Game in progress';
    case 'round-end':
      return roundNumber ? `Round ${roundNumber} — between rounds` : 'Between rounds';
    case 'finished':
      return 'Game finished';
    default:
      return 'Unknown';
  }
}

export function RoomJoinBanner({ code, peek, loading }: RoomJoinBannerProps) {
  if (loading) {
    return (
      <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
        <p className="text-white/60 text-sm">Checking room {code}...</p>
      </div>
    );
  }

  if (!peek || !peek.success) {
    return null;
  }

  if (!peek.exists) {
    return (
      <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-center space-y-1">
        <p className="text-red-300 text-sm font-medium">Room not found</p>
        <p className="text-white/50 text-xs">
          No active game for code{' '}
          <span className="font-mono text-red-200 tracking-widest">{code}</span>.
          Ask the host for a new invite.
        </p>
      </div>
    );
  }

  if (peek.canJoin) {
    return (
      <div className="p-3 rounded-xl bg-gold-500/15 border border-gold-500/30 text-center space-y-1">
        <p className="text-gold-300 text-sm font-medium">You&apos;re invited to join</p>
        <p className="text-white/70 text-xs">
          <span className="font-semibold text-white">{peek.hostName}</span>&apos;s table ·{' '}
          {peek.playerCount}/{peek.maxPlayers} players · Waiting room
        </p>
        <p className="text-white/40 text-[10px] font-mono tracking-widest">{code}</p>
      </div>
    );
  }

  if (peek.reason === 'ROOM_FULL') {
    return (
      <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-center space-y-1">
        <p className="text-amber-300 text-sm font-medium">Room is full</p>
        <p className="text-white/50 text-xs">
          {peek.hostName}&apos;s game has {peek.maxPlayers}/{peek.maxPlayers} players.
          You cannot join this room.
        </p>
      </div>
    );
  }

  if (peek.reason === 'GAME_FINISHED') {
    return (
      <div className="p-3 rounded-xl bg-white/5 border border-white/15 text-center space-y-1">
        <p className="text-white/80 text-sm font-medium">This game has ended</p>
        <p className="text-white/50 text-xs">
          {peek.hostName}&apos;s room is no longer accepting players. Create or join a
          different game.
        </p>
      </div>
    );
  }

  return (
    <div className="p-3 rounded-xl bg-blue-500/15 border border-blue-500/30 text-center space-y-1">
      <p className="text-blue-200 text-sm font-medium">Game already in progress</p>
      <p className="text-white/60 text-xs">
        {peek.hostName}&apos;s table · {phaseLabel(peek.phase, peek.roundNumber)}
      </p>
      <p className="text-white/45 text-xs">
        New players can only join before the game starts. Ask {peek.hostName} to share
        an invite from the waiting room next time.
      </p>
    </div>
  );
}
