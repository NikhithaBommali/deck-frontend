import { useEffect, useRef, useState } from 'react';
import { Card } from './Card';
import { CenterDeck } from './CenterDeck';
import { RoundTable } from './RoundTable';
import { ClientGameState } from '../types/game';
import { getSeatPosition } from '../utils/tableLayout';

interface DealingTableProps {
  gameState: ClientGameState;
  isHost: boolean;
  onStartDealing: () => void;
  onDistributeCards: () => void;
}

export function DealingTable({
  gameState,
  isHost,
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
    if (
      gameState.dealingStep > prevStep.current &&
      gameState.lastDealtPlayerId
    ) {
      const player = gameState.players.find(
        (p) => p.id === gameState.lastDealtPlayerId
      );
      if (player) {
        const pos = getSeatPosition(player.seatIndex, mySeat, total);
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
    gameState.dealingStep,
    gameState.lastDealtPlayerId,
    gameState.players,
    mySeat,
    total,
  ]);

  return (
    <RoundTable
      gameState={gameState}
      faceDownCards
      showDealingHighlight
      flyingCard={flyingCard}
      centerContent={
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-end gap-5 justify-center">
            {gameState.openCard && (
              <div className="text-center space-y-1.5">
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
            />
          </div>

          {!dealingStarted && isHost && (
            <button
              onClick={onStartDealing}
              className="px-8 py-3 bg-gold-500 hover:bg-gold-400 text-felt-900 font-bold rounded-xl transition-all text-base shadow-xl hover:scale-105 active:scale-95 ring-2 ring-gold-300/50"
            >
              Distribute Cards
            </button>
          )}

          {!dealingStarted && !isHost && (
            <p className="text-gold-400/80 text-sm px-4 py-2 bg-black/30 rounded-lg border border-white/10">
              Waiting for host to distribute from the deck...
            </p>
          )}

          {dealingInProgress && (
            <div className="flex items-center gap-2 px-4 py-2 bg-black/40 rounded-full border border-gold-500/30">
              <span className="w-2 h-2 rounded-full bg-gold-400 animate-ping" />
              <p className="text-gold-300 text-sm font-medium">
                Dealing from center...
              </p>
            </div>
          )}

          {gameState.isDealingComplete && isHost && (
            <button
              onClick={onDistributeCards}
              className="px-8 py-3 bg-green-500 hover:bg-green-400 text-white font-bold rounded-xl transition-all text-base shadow-xl hover:scale-105 active:scale-95 animate-pulse"
            >
              Start Round
            </button>
          )}

          {gameState.isDealingComplete && !isHost && (
            <p className="text-green-400/80 text-sm px-4 py-2 bg-green-500/10 rounded-lg border border-green-500/20">
              All cards dealt — waiting for host to start...
            </p>
          )}
        </div>
      }
    />
  );
}
