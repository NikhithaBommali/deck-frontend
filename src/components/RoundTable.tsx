import { ReactNode } from 'react';
import { ClientGameState } from '../types/game';
import { PlayerAvatar } from './PlayerAvatar';
import { CardBack } from './CardBack';
import { ReactionOverlay } from './social/ReactionOverlay';
import { VoiceCallBadge } from './social/VoiceCallBadge';
import { TurnTimerRing } from './TurnTimerRing';
import { useOptionalRoomSocial } from '../context/RoomSocialContext';
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
  seatSpread?: 'normal' | 'wide';
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
  seatSpread = 'normal',
}: RoundTableProps) {
  const social = useOptionalRoomSocial();
  const mySeat =
    gameState.players.find((p) => p.id === gameState.myId)?.seatIndex ?? 0;
  const total = gameState.players.length;
  const inDealing = gameState.phase === 'dealing';
  const inPlaying = gameState.phase === 'playing';
  const avatarSize = dense ? 'sm' : compact ? 'md' : 'lg';
  const seatVerticalCenter = compact ? 50 : 54;

  return (
    <div
      className={
        compact
          ? 'relative mx-auto w-full max-w-[min(100%,340px)] aspect-[5/3] flex-shrink-0'
          : 'relative mx-auto w-full max-w-3xl flex-shrink-0 pt-1 sm:pt-2 pb-1 sm:pb-2'
      }
    >
      <div
        className={
          compact
            ? 'relative w-full aspect-[5/3]'
            : 'relative w-full aspect-[4/3] min-h-[160px] sm:min-h-[200px] max-h-[min(38vh,380px)] lg:max-h-[min(42vh,400px)]'
        }
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
          {centerContent ? (
            <div className="pointer-events-auto w-full max-w-[min(92%,520px)] px-1 sm:px-2">
              {centerContent}
            </div>
          ) : null}
        </div>
      </div>

      {gameState.players.map((player) => {
        const pos = getSeatPosition(
          player.seatIndex,
          mySeat,
          total,
          seatSpread,
          seatVerticalCenter
        );
        const isActive = player.id === gameState.currentTurnPlayerId;
        const isMe = player.id === gameState.myId;
        const isAway = !player.isConnected && gameState.phase !== 'waiting';
        const isReceiving =
          showDealingHighlight &&
          player.id === gameState.lastDealtPlayerId &&
          inDealing &&
          !gameState.isDealingComplete;
        const dealtCount = player.cardCount;

        const isTurnHolder = isActive && inPlaying && !!gameState.turnDeadlineAt;

        if (player.isEliminated && gameState.phase !== 'waiting') {
          return (
            <div
              key={player.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-10 opacity-40"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              <div className="relative">
                <PlayerAvatar
                  name={player.name}
                  profilePicture={player.profilePicture}
                  size={avatarSize}
                  isHost={player.id === gameState.hostId}
                  isMe={isMe}
                />
                <ReactionOverlay playerId={player.id} />
              </div>
              <span className="text-red-400 text-[10px] font-bold px-2 py-0.5 bg-black/50 rounded">
                OUT
              </span>
            </div>
          );
        }

        const avatar = (
          <PlayerAvatar
            name={player.name}
            profilePicture={player.profilePicture}
            size={avatarSize}
            isHost={player.id === gameState.hostId}
            isActive={isReceiving}
            isMe={isMe}
            isReady={player.isReady}
            showReadyRing={gameState.phase === 'waiting'}
          />
        );

        const seatContent = (
          <>
            <div className="relative">
              {isTurnHolder ? (
                <TurnTimerRing
                  deadlineAt={gameState.turnDeadlineAt}
                  durationSec={gameState.turnDurationSec}
                  isMyTurn={isMe}
                  size={avatarSize}
                >
                  {avatar}
                </TurnTimerRing>
              ) : (
                avatar
              )}
              <VoiceCallBadge playerId={player.id} />
              <ReactionOverlay playerId={player.id} />
              {social?.isPeerInVoiceWithMe(player.id) && (
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-felt-900 animate-pulse"
                  title="In voice call with you"
                />
              )}
            </div>

            <div
              className={`
                px-1.5 py-0.5 rounded-lg text-center backdrop-blur-sm border transition-all max-w-[72px] sm:max-w-[90px]
                ${isReceiving ? 'bg-gold-500/30 border-gold-400/60 scale-105' : ''}
                ${!isReceiving && isTurnHolder ? 'bg-green-500/25 border-green-400/40' : ''}
                ${!isReceiving && !isTurnHolder ? 'bg-black/50 border-white/10' : ''}
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
          </>
        );

        return (
          <div
            key={player.id}
            className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-10 transition-all duration-300 ${
              isAway ? 'opacity-60' : ''
            }`}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            {!isMe && social?.enabled && player.isConnected ? (
              <button
                type="button"
                onClick={() => social.interactWithPlayer(player.id)}
                className="flex flex-col items-center gap-1 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/60 hover:scale-[1.02] transition-transform"
                title={`Interact with ${player.name}`}
              >
                {seatContent}
              </button>
            ) : (
              seatContent
            )}
          </div>
        );
      })}
      </div>
    </div>
  );
}
