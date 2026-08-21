import { useEffect, useRef, useState } from 'react';
import { Card } from './Card';
import { CardBack } from './CardBack';
import { CenterDeck } from './CenterDeck';
import { PlayerAvatar } from './PlayerAvatar';
import { RoundTable } from './RoundTable';
import { ClientGameState } from '../types/game';
import { getSeatPosition } from '../utils/tableLayout';

interface DealingTableProps {
  gameState: ClientGameState;
  isHost: boolean;
  compact?: boolean;
  onStartDealing: () => void;
  onDistributeCards: () => void;
}

function DealingActions({
  gameState,
  isHost,
  onStartDealing,
  onDistributeCards,
  compact = false,
}: DealingTableProps) {
  const dealingStarted = gameState.dealingStep > 0;
  const dealingInProgress =
    dealingStarted && !gameState.isDealingComplete;

  const btnClass = compact
    ? 'w-full max-w-xs py-2.5 px-4 text-sm font-bold rounded-xl transition-all'
    : 'px-4 sm:px-8 py-2 sm:py-3 text-xs sm:text-base font-bold rounded-xl transition-all';

  if (!dealingStarted && isHost) {
    return (
      <button
        onClick={onStartDealing}
        className={`${btnClass} bg-gold-500 hover:bg-gold-400 text-felt-900 shadow-xl ring-2 ring-gold-300/50`}
      >
        Distribute Cards
      </button>
    );
  }

  if (!dealingStarted && !isHost) {
    return (
      <p className="text-gold-400/80 text-xs sm:text-sm px-3 py-2 bg-black/30 rounded-lg border border-white/10 text-center max-w-xs">
        Waiting for host to distribute...
      </p>
    );
  }

  if (dealingInProgress) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-black/40 rounded-full border border-gold-500/30">
        <span className="w-2 h-2 rounded-full bg-gold-400 animate-ping" />
        <p className="text-gold-300 text-xs sm:text-sm font-medium">Dealing...</p>
      </div>
    );
  }

  if (gameState.isDealingComplete && isHost) {
    return (
      <button
        onClick={onDistributeCards}
        className={`${btnClass} bg-green-500 hover:bg-green-400 text-white shadow-xl animate-pulse`}
      >
        Start Round
      </button>
    );
  }

  if (gameState.isDealingComplete && !isHost) {
    return (
      <p className="text-green-400/80 text-xs sm:text-sm px-3 py-2 bg-green-500/10 rounded-lg border border-green-500/20 text-center max-w-xs">
        All cards dealt — waiting for host...
      </p>
    );
  }

  return null;
}

function DealingTableMobile({
  gameState,
  isHost,
  onStartDealing,
  onDistributeCards,
}: DealingTableProps) {
  const dealingInProgress =
    gameState.dealingStep > 0 && !gameState.isDealingComplete;

  return (
    <div className="w-full max-w-lg mx-auto space-y-3 px-1">
      <div className="flex flex-wrap justify-center gap-3">
        {gameState.players.map((player) => {
          const isMe = player.id === gameState.myId;
          const isReceiving =
            player.id === gameState.lastDealtPlayerId &&
            dealingInProgress;
          const dealtCount = player.cardCount;

          return (
            <div
              key={player.id}
              className={`flex flex-col items-center gap-1 min-w-[4.5rem] ${
                isReceiving ? 'scale-105' : ''
              }`}
            >
              <PlayerAvatar
                name={player.name}
                profilePicture={player.profilePicture}
                size="sm"
                isHost={player.id === gameState.hostId}
                isActive={isReceiving}
                isMe={isMe}
              />
              <div
                className={`px-2 py-1 rounded-lg text-center border max-w-[5.5rem] ${
                  isReceiving
                    ? 'bg-gold-500/30 border-gold-400/60'
                    : 'bg-black/50 border-white/10'
                }`}
              >
                <p className="text-white text-[10px] font-medium truncate">
                  {player.name}
                </p>
                <p className="text-white/50 text-[9px]">{dealtCount}/7 🂠</p>
              </div>
              {dealtCount > 0 && (
                <div className="flex -space-x-1.5">
                  {Array.from({ length: Math.min(dealtCount, 4) }).map((_, i) => (
                    <CardBack key={i} size="xs" />
                  ))}
                  {dealtCount > 4 && (
                    <span className="text-white/40 text-[9px] self-end pb-0.5">
                      +{dealtCount - 4}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-emerald-800/90 via-emerald-900/90 to-emerald-950/90 border-2 border-amber-900/50 p-4 flex flex-col items-center gap-4">
        <div className="flex items-end justify-center gap-4 sm:gap-6">
          {gameState.openCard && (
            <div className="text-center space-y-1">
              <p className="text-white/50 text-[10px] uppercase tracking-wider">
                Open
              </p>
              <Card
                card={gameState.openCard}
                zeroRank={gameState.wildRank}
                small
              />
            </div>
          )}
          <CenterDeck
            count={gameState.deckRemaining}
            isDealing={dealingInProgress}
            size="md"
          />
        </div>
      </div>

      <div className="flex justify-center pb-1">
        <DealingActions
          gameState={gameState}
          isHost={isHost}
          compact
          onStartDealing={onStartDealing}
          onDistributeCards={onDistributeCards}
        />
      </div>
    </div>
  );
}

export function DealingTable({
  gameState,
  isHost,
  compact = false,
  onStartDealing,
  onDistributeCards,
}: DealingTableProps) {
  const dealingStarted = gameState.dealingStep > 0;
  const dealingInProgress =
    dealingStarted && !gameState.isDealingComplete;
  const mySeat =
    gameState.players.find((p) => p.id === gameState.myId)?.seatIndex ?? 0;
  const total = gameState.players.length;

  const [flyingCard, setFlyingCard] = useState<{
    x: number;
    y: number;
    key: number;
  } | null>(null);
  const prevStep = useRef(0);

  useEffect(() => {
    if (compact) return;

    if (
      gameState.dealingStep > prevStep.current &&
      gameState.lastDealtPlayerId
    ) {
      const player = gameState.players.find(
        (p) => p.id === gameState.lastDealtPlayerId
      );
      if (player) {
        const pos = getSeatPosition(player.seatIndex, mySeat, total, 'wide', 54);
        setFlyingCard({
          x: pos.x,
          y: pos.y,
          key: gameState.dealingStep,
        });
        const timer = setTimeout(() => setFlyingCard(null), 500);
        prevStep.current = gameState.dealingStep;
        return () => clearTimeout(timer);
      }
    }
    prevStep.current = gameState.dealingStep;
  }, [
    compact,
    gameState.dealingStep,
    gameState.lastDealtPlayerId,
    gameState.players,
    mySeat,
    total,
  ]);

  if (compact) {
    return (
      <DealingTableMobile
        gameState={gameState}
        isHost={isHost}
        onStartDealing={onStartDealing}
        onDistributeCards={onDistributeCards}
      />
    );
  }

  return (
    <RoundTable
      gameState={gameState}
      faceDownCards
      showDealingHighlight
      flyingCard={flyingCard}
      seatSpread="wide"
      centerContent={
        <div className="flex flex-col items-center gap-2 sm:gap-4 max-w-[90%]">
          <div className="flex items-end gap-3 sm:gap-5 justify-center">
            {gameState.openCard && (
              <div className="text-center space-y-1">
                <p className="text-white/50 text-[9px] sm:text-[10px] uppercase tracking-wider">
                  Open
                </p>
                <Card
                  card={gameState.openCard}
                  zeroRank={gameState.wildRank}
                  small
                />
              </div>
            )}

            <CenterDeck
              count={gameState.deckRemaining}
              isDealing={dealingInProgress}
            />
          </div>

          <DealingActions
            gameState={gameState}
            isHost={isHost}
            onStartDealing={onStartDealing}
            onDistributeCards={onDistributeCards}
          />
        </div>
      }
    />
  );
}
