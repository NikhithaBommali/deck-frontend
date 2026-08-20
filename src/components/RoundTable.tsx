import { ReactNode } from 'react';
import { ClientGameState } from '../types/game';
import { PlayerAvatar } from './PlayerAvatar';
import { CardBack } from './CardBack';
import { getSeatPosition } from '../utils/tableLayout';

interface RoundTableProps {
  gameState: ClientGameState;
  centerContent?: ReactNode;
  showCardCounts?: boolean;
  faceDownCards?: boolean;
  showDealingHighlight?: boolean;
  flyingCard?: { x: number; y: number; key: number } | null;
  compact?: boolean;
  dense?: boolean;
}

export function RoundTable({
  gameState,
  centerContent,
  showCardCounts = true,
  faceDownCards = false,
  showDealingHighlight = false,
  flyingCard = null,
  compact = false,
  dense = false,
}: RoundTableProps) {
  const mySeat =
    gameState.players.find((p) => p.id === gameState.myId)?.seatIndex ?? 0;
  const total = gameState.players.length;
  const inDealing = gameState.phase === 'dealing';
  const avatarSize = dense ? 'sm' : compact ? 'md' : 'lg';

  return (
    <div
      className={`relative mx-auto ${
        compact
          ? 'w-[min(100%,260px)] sm:w-[min(100%,320px)] aspect-[4/3] flex-shrink-0'
          : 'w-full max-w-3xl aspect-[4/3] min-h-[200px] max-h-[min(50vh,420px)]'
      }`}
    >
      {flyingCard && (
        <CardBack
          key={flyingCard.key}
          size="md"
          className="deal-fly-card pointer-events-none absolute z-40"
          style={
            {
              '--tx': `${flyingCard.x}%`,
              '--ty': `${flyingCard.y}%`,
            } as React.CSSProperties
          }
        />
      )}

      <div className="absolute inset-[8%] rounded-full bg-gradient-to-br from-emerald-800 via-emerald-900 to-emerald-950 border-4 border-amber-900/60 shadow-2xl shadow-black/50">
        <div
          className="absolute inset-4 rounded-full border border-emerald-600/30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.04) 0%, transparent 70%)',
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto">{centerContent}</div>
        </div>
      </div>

      {gameState.players.map((player) => {
        const pos = getSeatPosition(player.seatIndex, mySeat, total);
        const isActive = player.id === gameState.currentTurnPlayerId;
        const isMe = player.id === gameState.myId;
        const isAway = !player.isConnected && gameState.phase !== 'waiting';
        const isReceiving =
          showDealingHighlight &&
          player.id === gameState.lastDealtPlayerId &&
          inDealing &&
          !gameState.isDealingComplete;
        const dealtCount = player.cardCount;

        if (player.isEliminated && gameState.phase !== 'waiting') {
          return (
            <div
              key={player.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-10 opacity-40"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              <PlayerAvatar
                name={player.name}
                profilePicture={player.profilePicture}
                size={avatarSize}
                isHost={player.id === gameState.hostId}
                isMe={isMe}
              />
              <span className="text-red-400 text-[10px] font-bold px-2 py-0.5 bg-black/50 rounded">
                OUT
              </span>
            </div>
          );
        }

        return (
          <div
            key={player.id}
            className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-10 transition-all duration-300 ${
              isAway ? 'opacity-60' : ''
            }`}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            <PlayerAvatar
              name={player.name}
              profilePicture={player.profilePicture}
              size={avatarSize}
              isHost={player.id === gameState.hostId}
              isActive={
                (isActive && gameState.phase === 'playing') || isReceiving
              }
              isMe={isMe}
              isReady={player.isReady}
              showReadyRing={gameState.phase === 'waiting'}
            />

            <div
              className={`
                px-1.5 py-0.5 rounded-lg text-center backdrop-blur-sm border transition-all max-w-[72px] sm:max-w-[90px]
                ${isReceiving ? 'bg-gold-500/30 border-gold-400/60 scale-105' : ''}
                ${!isReceiving && isActive && gameState.phase === 'playing' ? 'bg-green-500/30 border-green-400/50' : ''}
                ${!isReceiving && !(isActive && gameState.phase === 'playing') ? 'bg-black/50 border-white/10' : ''}
              `}
            >
              <p className="text-white text-[10px] sm:text-xs font-medium truncate">
                {player.name}
              </p>
              {showCardCounts && (
                <p className="text-white/50 text-[10px]">
                  {faceDownCards && inDealing
                    ? `${dealtCount}/7 🂠`
                    : faceDownCards
                      ? '7 🂠'
                      : `${player.cardCount} cards`}
                  {gameState.phase === 'playing' &&
                    isMe &&
                    ` · ${player.handScore}pts`}
                </p>
              )}
              {gameState.phase === 'waiting' && (
                <p
                  className={`text-[10px] ${player.isReady ? 'text-green-400' : 'text-white/30'}`}
                >
                  {player.isReady ? 'Ready' : 'Waiting'}
                </p>
              )}
              {!player.isConnected && gameState.phase !== 'waiting' && (
                <p className="text-amber-400 text-[10px] font-medium">Away</p>
              )}
            </div>

            {faceDownCards && inDealing && dealtCount > 0 && !isMe && (
              <div className="flex -space-x-2 mt-1 min-h-[1.75rem]">
                {Array.from({ length: dealtCount }).map((_, i) => (
                  <CardBack
                    key={i}
                    size="sm"
                    className={`transition-all duration-300 ${
                      isReceiving && i === dealtCount - 1
                        ? 'deal-card-land ring-1 ring-gold-400/60'
                        : ''
                    }`}
                    style={{
                      transform: `rotate(${(i - (dealtCount - 1) / 2) * 5}deg)`,
                    }}
                  />
                ))}
              </div>
            )}

            {faceDownCards && inDealing && isMe && dealtCount > 0 && (
              <div className="flex -space-x-1 mt-1">
                {Array.from({ length: dealtCount }).map((_, i) => (
                  <CardBack
                    key={i}
                    size="xs"
                    className={`${
                      isReceiving && i === dealtCount - 1 ? 'deal-card-land' : ''
                    }`}
                    style={{ transform: `rotate(${(i - 3) * 6}deg)` }}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
