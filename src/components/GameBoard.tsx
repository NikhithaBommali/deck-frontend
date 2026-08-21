import { Card } from './Card';
import { CardBack } from './CardBack';
import { DiscardPile } from './DiscardPile';
import { GameLayout } from './GameLayout';
import { RoundTable } from './RoundTable';
import { ScoreBar } from './ScoreBar';
import {
  ClientGameState,
  cardMatchesDiscardTop,
  getScoreColorClass,
  groupHandByRank,
} from '../types/game';
import { useMediaQuery } from '../hooks/useMediaQuery';

interface GameBoardProps {
  gameState: ClientGameState;
  roomCode: string;
  onDrawDeck: () => void;
  onPickFromDiscard: () => void;
  onPlaceCard: (cardIds: string[]) => void;
  onShow: () => void;
  onContinue: () => void;
  onLeave: () => void;
}

export function GameBoard({
  gameState,
  roomCode,
  onDrawDeck,
  onPickFromDiscard,
  onPlaceCard,
  onShow,
  onContinue,
  onLeave,
}: GameBoardProps) {
  const myScore = gameState.myHandScore;
  const isHost = gameState.hostId === gameState.myId;
  const winner = gameState.players.find((p) => p.id === gameState.winnerId);
  const showPlayer = gameState.players.find((p) => p.id === gameState.showPlayerId);
  const currentPlayer = gameState.players.find(
    (p) => p.id === gameState.currentTurnPlayerId
  );
  const rankGroups = groupHandByRank(gameState.myHand);
  const me = gameState.players.find((p) => p.id === gameState.myId);
  const eliminatedThisRound = gameState.players.filter(
    (p) => p.isEliminated && p.totalScore >= gameState.eliminationScore
  );

  const turnMessage = (() => {
    if (me?.isEliminated) {
      return 'You have been eliminated — spectating...';
    }
    if (!gameState.isMyTurn) {
      return `Waiting for ${currentPlayer?.name ?? 'opponent'} to play...`;
    }
    if (gameState.mustDrawAfterPlace) {
      if (gameState.canPickFromDiscard && gameState.pickableDiscardCard) {
        return "Cards placed! Tap the previous player's discard OR draw from the deck.";
      }
      return 'Cards placed! Draw from the deck.';
    }
    if (gameState.hasPlacedThisTurn && gameState.hasDrawnThisTurn) {
      return 'Turn complete — waiting for next player...';
    }
    return 'Click a card group to place (same ranks go together). Then draw unless you matched discard top.';
  })();

  const canPlace =
    gameState.isMyTurn && !gameState.hasPlacedThisTurn && !me?.isEliminated;

  const scoreColor = getScoreColorClass(
    myScore,
    gameState.maxScore,
    gameState.showThreshold
  );

  const handlePlaceGroup = (cardIds: string[]) => {
    if (canPlace) onPlaceCard(cardIds);
  };

  const isCompact = useMediaQuery('(max-width: 640px)');

  const tableControls = (
    <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
      <button
        onClick={onDrawDeck}
        disabled={!gameState.mustDrawAfterPlace}
        className="group relative disabled:opacity-40 disabled:cursor-not-allowed text-center space-y-1"
      >
        <p className="text-white/50 text-[10px] uppercase tracking-wider">Draw</p>
        <CardBack
          size={isCompact ? 'md' : 'xl'}
          className={`transition-all ${
            gameState.mustDrawAfterPlace
              ? 'ring-2 ring-yellow-400/50 animate-pulse group-hover:-translate-y-1'
              : ''
          }`}
        />
        {gameState.mustDrawAfterPlace && (
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-bold text-gold-300 bg-black/60 px-1.5 py-0.5 rounded-full">
            +1
          </span>
        )}
      </button>

      {gameState.openCard && (
        <div className="text-center space-y-1">
          <p className="text-white/50 text-[10px] uppercase tracking-wider">Open</p>
          <Card
            card={gameState.openCard}
            zeroRank={gameState.wildRank}
            small={isCompact}
          />
        </div>
      )}

      <DiscardPile
        discardTop={gameState.discardTop}
        pickableDiscardCard={gameState.pickableDiscardCard}
        myPlacedOnDiscard={gameState.myPlacedOnDiscard}
        wildRank={gameState.wildRank}
        canPick={gameState.canPickFromDiscard}
        onPick={onPickFromDiscard}
      />
    </div>
  );

  if (gameState.phase === 'finished') {
    const sorted = [...gameState.players].sort(
      (a, b) => a.totalScore - b.totalScore
    );
    return (
      <GameLayout gameState={gameState} roomCode={roomCode} onLeave={onLeave}>
        <div className="flex-1 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-black/40 backdrop-blur rounded-xl sm:rounded-2xl border border-white/10 p-5 sm:p-8 text-center space-y-4 sm:space-y-6">
            <div className="text-5xl sm:text-6xl">🎉</div>
            <h2 className="font-display text-2xl sm:text-3xl text-gold-400 font-bold">
              Game Over!
            </h2>
            <p className="text-white/80">
              {winner?.name ?? sorted[0]?.name} wins with the lowest total score!
            </p>
            <div className="space-y-2 text-left">
              {sorted.map((p, i) => (
                <div
                  key={p.id}
                  className={`flex justify-between p-3 rounded-xl ${
                    p.id === winner?.id
                      ? 'bg-gold-500/20 border border-gold-500/30'
                      : 'bg-white/5'
                  }`}
                >
                  <span className="text-white">
                    {i + 1}. {p.name}
                    {p.id === gameState.myId && ' (you)'}
                    {p.isEliminated && ' — out'}
                  </span>
                  <span className="font-bold text-gold-400">{p.totalScore}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </GameLayout>
    );
  }

  if (gameState.phase === 'round-end') {
    return (
      <GameLayout
        gameState={gameState}
        roomCode={roomCode}
        highlightRound={gameState.roundNumber}
        onLeave={onLeave}
      >
        <div className="flex-1 flex flex-col">
          <header className="px-2 sm:px-4 py-2 sm:py-3 bg-black/30 border-b border-white/10 flex-shrink-0">
            <div className="hidden sm:block">
              <ScoreBar gameState={gameState} />
            </div>
          </header>

          <div className="flex-1 flex items-center justify-center p-3 sm:p-4 overflow-y-auto min-h-0">
            <div className="w-full max-w-lg bg-black/40 backdrop-blur rounded-xl sm:rounded-2xl border border-white/10 p-5 sm:p-8 text-center space-y-4 sm:space-y-6 my-auto">
              <div className="text-5xl sm:text-6xl">{gameState.showPenalty ? '💥' : '🏆'}</div>
              <h2 className="font-display text-2xl sm:text-3xl text-gold-400 font-bold">
                Round {gameState.roundNumber} Complete
              </h2>

              {gameState.showPenalty ? (
                <p className="text-red-300">
                  <span className="font-semibold text-red-200">{showPlayer?.name}</span>{' '}
                  showed but didn&apos;t have the lowest score! Round penalty:{' '}
                  <span className="font-bold">{showPlayer?.score}</span>
                </p>
              ) : (
                <p className="text-white/80">
                  <span className="text-gold-400 font-semibold">
                    {showPlayer?.name ?? winner?.name}
                  </span>{' '}
                  showed with the lowest score —{' '}
                  <span className="text-green-400 font-bold">0 pts</span> this round!
                </p>
              )}

              <div className="space-y-2 text-left">
                <p className="text-white/50 text-xs uppercase tracking-wider text-center mb-2">
                  Round {gameState.roundNumber} scores
                </p>
                {[...gameState.players]
                  .filter((p) => !p.isEliminated || p.lastRoundScore !== null)
                  .sort((a, b) => (a.lastRoundScore ?? a.score) - (b.lastRoundScore ?? b.score))
                  .map((p) => {
                    const roundPts = p.lastRoundScore ?? p.score;
                    return (
                      <div
                        key={p.id}
                        className={`flex justify-between p-3 rounded-xl ${
                          p.id === gameState.winnerId
                            ? 'bg-gold-500/20 border border-gold-500/30'
                            : p.id === gameState.showPlayerId && gameState.showPenalty
                              ? 'bg-red-500/20 border border-red-500/30'
                              : 'bg-white/5'
                        }`}
                      >
                        <span className="text-white">
                          {p.name}
                          {p.id === gameState.myId && ' (you)'}
                          {p.hasShown && ' — showed'}
                          {p.isEliminated && ' — OUT'}
                        </span>
                        <span className="flex items-center gap-3">
                          <span
                            className={`font-bold ${roundPts === 0 ? 'text-green-400' : 'text-white/80'}`}
                          >
                            +{roundPts}
                          </span>
                          <span className="text-gold-400/80 text-sm">
                            → {p.totalScore}
                          </span>
                        </span>
                      </div>
                    );
                  })}
              </div>

              {eliminatedThisRound.length > 0 && (
                <p className="text-red-300 text-sm">
                  {eliminatedThisRound.map((p) => p.name).join(', ')} reached{' '}
                  {gameState.eliminationScore}+ and is eliminated!
                </p>
              )}

              {gameState.activePlayerCount < 2 ? (
                <p className="text-gold-300 text-sm">Not enough players to continue.</p>
              ) : isHost ? (
                <button
                  onClick={onContinue}
                  className="w-full py-3 bg-gold-500 hover:bg-gold-400 text-felt-900 font-bold rounded-xl transition-colors text-lg"
                >
                  Continue — Deal Next Round
                </button>
              ) : (
                <p className="text-white/40 text-sm">
                  Waiting for host to continue the game...
                </p>
              )}
            </div>
          </div>
        </div>
      </GameLayout>
    );
  }

  return (
    <GameLayout gameState={gameState} roomCode={roomCode} onLeave={onLeave}>
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <header className="px-2 sm:px-4 py-1.5 sm:py-2 bg-black/30 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap min-w-0 flex-1">
              <span className="font-display text-base sm:text-xl text-gold-400 font-bold">
                Deck Score
              </span>
              <span className="text-white/40 text-xs sm:text-sm truncate">
                Round {gameState.roundNumber} ·{' '}
                <span className="font-mono text-gold-400">{roomCode}</span>
              </span>
              <span className="text-white/40 text-xs">
                Total:{' '}
                <span className="text-gold-400 font-bold">{gameState.myTotalScore}</span>
              </span>
            </div>
          </div>
          <div className="hidden sm:block mt-2">
            <ScoreBar gameState={gameState} />
          </div>
        </header>

        <div className="flex-1 p-2 sm:p-4 max-w-6xl mx-auto w-full space-y-2 sm:space-y-4 min-h-0 flex flex-col">
          <div className="flex-shrink-0 flex justify-center w-full">
            <RoundTable
              gameState={gameState}
              compact={isCompact}
              dense={isCompact}
              seatSpread={isCompact ? 'wide' : 'normal'}
              centerContent={isCompact ? undefined : tableControls}
            />
          </div>

          {isCompact && (
            <div className="flex-shrink-0 w-full rounded-xl bg-black/30 border border-white/10 p-3">
              {tableControls}
            </div>
          )}

          {!me?.isEliminated && (
            <div
              className={`bg-black/20 rounded-xl sm:rounded-2xl border p-2 sm:p-4 space-y-2 sm:space-y-3 transition-opacity flex-shrink-0 ${
                gameState.isMyTurn ? 'border-white/10' : 'border-white/5 opacity-80'
              }`}
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-gold-400 font-display text-base sm:text-lg">
                  Your Hand ({gameState.myHand.length})
                </h3>
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  {canPlace && (
                    <span className="text-green-300 text-[10px] sm:text-xs font-medium">
                      Tap a group to place
                    </span>
                  )}
                  <span className="text-white/70 text-sm">
                    Hand:{' '}
                    <span className={`font-bold text-lg ${scoreColor}`}>
                      {myScore}
                    </span>
                    <span className="text-white/40 text-xs ml-2">
                      Total: {gameState.myTotalScore}
                    </span>
                  </span>
                </div>
              </div>

              {gameState.isMyTurn && (
                <p className="text-green-300/90 text-[11px] sm:text-xs leading-snug border-t border-white/10 pt-2">
                  {turnMessage}
                </p>
              )}

              <div className="flex flex-wrap gap-2 sm:gap-3 min-h-[4rem] sm:min-h-[5rem] overflow-x-auto pb-1">
                {rankGroups.map((group) => {
                  const rep = group.cards[0];
                  const isMatching =
                    canPlace && cardMatchesDiscardTop(rep, gameState.discardTop);
                  const cardIds = group.cards.map((c) => c.id);

                  return (
                    <button
                      key={group.key}
                      type="button"
                      disabled={!canPlace}
                      onClick={() => handlePlaceGroup(cardIds)}
                      className={`relative disabled:opacity-50 disabled:cursor-not-allowed ${
                        canPlace ? 'hover:-translate-y-1 transition-transform' : ''
                      }`}
                    >
                      <div className="relative flex items-end">
                        {group.cards.slice(0, 3).map((card, i) => (
                          <div
                            key={card.id}
                            className={i > 0 ? 'absolute' : ''}
                            style={
                              i > 0
                                ? { left: i * 10, bottom: i * 2, zIndex: i }
                                : undefined
                            }
                          >
                            <Card
                              card={card}
                              zeroRank={gameState.wildRank}
                              highlight={isMatching && i === 0}
                              disabled={!canPlace}
                              small={isCompact}
                            />
                          </div>
                        ))}
                      </div>
                      {group.cards.length > 1 && (
                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-blue-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold z-10">
                          {group.cards.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
                {gameState.isMyTurn && !gameState.hasPlacedThisTurn && (
                  <>
                    <button
                      onClick={onShow}
                      disabled={!gameState.canShow}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                        gameState.hasLowestScore
                          ? 'bg-green-500 hover:bg-green-400 text-white ring-2 ring-green-300'
                          : 'bg-gold-500 hover:bg-gold-400 text-felt-900'
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      Show ({myScore} pts)
                    </button>
                    {gameState.hasLowestScore && gameState.canShow ? (
                      <span className="text-green-300 text-xs">
                        You have the lowest score — show for 0 pts this round!
                      </span>
                    ) : gameState.canShow ? (
                      <span className="text-red-300 text-xs">
                        Warning: someone has a lower score. Wrong show = their scores
                        added to you!
                      </span>
                    ) : (
                      <span className="text-white/40 text-xs">
                        Show when score &lt; {gameState.showThreshold}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </GameLayout>
  );
}
