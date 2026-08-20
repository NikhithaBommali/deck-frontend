import { ClientGameState } from '../types/game';
import { PlayerAvatar } from './PlayerAvatar';

interface ScoreBarProps {
  gameState: ClientGameState;
  showScores?: boolean;
}

export function ScoreBar({ gameState, showScores = true }: ScoreBarProps) {
  const player = gameState.players.find((p) => p.id === gameState.myId);
  if (!player) {
    return null;
  }

  const isActive = player.id === gameState.currentTurnPlayerId;
  const handScore =
    gameState.phase === 'playing' ? player.handScore : player.score;

  return (
    <div className="w-full">
      <div className="flex items-stretch px-2 py-2">
        <div
          className={`
            flex items-center gap-2 px-3 py-2 rounded-xl border min-w-[140px] transition-all
            ${player.isEliminated ? 'opacity-40 border-red-500/20' : ''}
            ${isActive && !player.isEliminated ? 'bg-green-500/20 border-green-400/50 shadow-lg shadow-green-500/10' : 'bg-black/30 border-gold-500/30'}
          `}
        >
          <PlayerAvatar
            name={player.name}
            profilePicture={player.profilePicture}
            size="sm"
            isHost={player.id === gameState.hostId}
            isActive={isActive && !player.isEliminated}
            isMe
          />
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {player.name}
              <span className="text-gold-400/80 text-xs ml-1">(you)</span>
              {player.isEliminated && (
                <span className="text-red-400 text-[10px] ml-1">OUT</span>
              )}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              {showScores && !player.isEliminated ? (
                <>
                  {gameState.phase === 'playing' && (
                    <span className="text-white/50 text-[10px]">
                      Hand: {handScore}
                    </span>
                  )}
                  <span
                    className={`text-xs font-bold ${
                      player.totalScore >= gameState.eliminationScore
                        ? 'text-red-400'
                        : 'text-gold-400'
                    }`}
                  >
                    Total: {player.totalScore}
                  </span>
                </>
              ) : (
                <span className="text-white/40 text-xs">
                  {player.isEliminated
                    ? `Final: ${player.totalScore}`
                    : `${player.cardCount} cards`}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
