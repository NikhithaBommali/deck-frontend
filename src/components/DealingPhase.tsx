import { Card } from './Card';
import { GameLayout } from './GameLayout';
import { DealingTable } from './DealingTable';
import { ScoreBar } from './ScoreBar';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { ClientGameState, getScoreColorClass, groupHandByRank } from '../types/game';

interface DealingPhaseProps {
  gameState: ClientGameState;
  roomCode: string;
  onStartDealing: () => void;
  onDistributeCards: () => void;
  onLeave: () => void;
}

export function DealingPhase({
  gameState,
  roomCode,
  onStartDealing,
  onDistributeCards,
  onLeave,
}: DealingPhaseProps) {
  const isHost = gameState.hostId === gameState.myId;
  const dealingStarted = gameState.dealingStep > 0;
  const dealingInProgress =
    dealingStarted && !gameState.isDealingComplete;
  const rankGroups = groupHandByRank(gameState.myHand);
  const progressPct =
    gameState.dealingTotalSteps > 0
      ? Math.round(
          (gameState.dealingStep / gameState.dealingTotalSteps) * 100
        )
      : 0;

  const scoreColor = getScoreColorClass(
    gameState.myHandScore,
    gameState.maxScore,
    gameState.showThreshold
  );
  const isCompact = useMediaQuery('(max-width: 640px)');

  return (
    <GameLayout gameState={gameState} roomCode={roomCode} onLeave={onLeave}>
      <div className="flex flex-col flex-1 min-h-0">
      <header className="flex-shrink-0 px-3 sm:px-4 py-2 sm:py-3 bg-black/30 border-b border-white/10">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="min-w-0">
            <h1 className="font-display text-base sm:text-xl text-gold-400 font-bold">
              Round {gameState.roundNumber} — Dealing
            </h1>
            <p className="text-white/50 text-xs sm:text-sm truncate">
              Room:{' '}
              <span className="font-mono text-gold-400 tracking-widest">{roomCode}</span>
            </p>
          </div>
          {gameState.wildRank && (
            <div className="px-2 sm:px-3 py-1 bg-purple-500/20 rounded-lg border border-purple-500/30 text-xs sm:text-sm flex-shrink-0">
              <span className="text-purple-300">Zero: </span>
              <span className="text-purple-200 font-bold">{gameState.wildRank}</span>
            </div>
          )}
        </div>
      </header>

      {gameState.isDealingComplete && (
        <div className="hidden sm:block flex-shrink-0 px-4 py-2 bg-black/20 border-b border-white/5">
          <ScoreBar gameState={gameState} showScores />
        </div>
      )}

      {dealingStarted && (
        <div className="px-4 py-2 bg-black/20 border-b border-white/5">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between text-xs text-white/50 mb-1">
              <span>
                {dealingInProgress
                  ? 'Cards flying from the center deck...'
                  : 'Every player has 7 cards'}
              </span>
              <span>
                {gameState.dealingStep} / {gameState.dealingTotalSteps}
              </span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-gold-600 to-gold-400 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center p-2 sm:p-4 pt-4 sm:pt-6 gap-3 sm:gap-4 min-h-0 overflow-y-auto">
        <div className="w-full flex-shrink-0 flex justify-center">
          <DealingTable
            gameState={gameState}
            isHost={isHost}
            compact={isCompact}
            onStartDealing={onStartDealing}
            onDistributeCards={onDistributeCards}
          />
        </div>

        {gameState.myHand.length > 0 && (
          <div className="w-full max-w-4xl bg-black/30 rounded-xl sm:rounded-2xl border border-gold-500/20 p-3 sm:p-4 space-y-2 sm:space-y-3 shadow-inner flex-shrink-0">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-gold-400 font-display text-base sm:text-lg">
                Your Hand ({gameState.myHand.length}/7)
              </h3>
              <span className="text-white/70 text-xs sm:text-sm">
                Score:{' '}
                <span className={`font-bold text-base sm:text-lg ${scoreColor}`}>
                  {gameState.myHandScore}/{gameState.maxScore}
                </span>
              </span>
            </div>

            <div className="flex flex-wrap gap-2 min-h-[3.5rem] sm:min-h-[4rem] overflow-x-auto pb-1">
              {rankGroups.map((group) => (
                <div key={group.key} className="relative flex items-end flex-shrink-0">
                  {group.cards.map((card, i) => (
                    <div
                      key={card.id}
                      className={`${i > 0 ? 'absolute' : ''} deal-card-land transition-all duration-300`}
                      style={
                        i > 0 ? { left: i * 10, bottom: i * 2, zIndex: i } : undefined
                      }
                    >
                      <Card card={card} zeroRank={gameState.wildRank} small={isCompact} />
                    </div>
                  ))}
                  {group.cards.length > 1 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-blue-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold z-10">
                      {group.cards.length}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {dealingInProgress && (
              <p className="text-white/40 text-xs text-center">
                Your cards appear here as they arrive from the center deck
              </p>
            )}
          </div>
        )}
      </div>
      </div>
    </GameLayout>
  );
}
