import { ClientGameState } from '../types/game';
import { GameLayout } from './GameLayout';
import { RoundTable } from './RoundTable';
import { ScoreBar } from './ScoreBar';

interface WaitingRoomProps {
  gameState: ClientGameState;
  roomCode: string;
  onSetReady: (ready: boolean) => void;
  onStartGame: () => void;
  onLeave: () => void;
}

export function WaitingRoom({
  gameState,
  roomCode,
  onSetReady,
  onStartGame,
  onLeave,
}: WaitingRoomProps) {
  const me = gameState.players.find((p) => p.id === gameState.myId);
  const isHost = gameState.hostId === gameState.myId;
  const allReady =
    gameState.players.length >= 2 && gameState.players.every((p) => p.isReady);

  return (
    <GameLayout gameState={gameState} roomCode={roomCode} onLeave={onLeave}>
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <header className="flex-shrink-0 px-4 py-2 bg-black/30 border-b border-white/10">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
            <div>
              <h1 className="font-display text-lg text-gold-400 font-bold">
                Waiting Room
              </h1>
              <p className="text-white/50 text-xs">
                Invite friends to join · Room{' '}
                <span className="font-mono text-gold-400 tracking-widest">
                  {roomCode}
                </span>
              </p>
            </div>
            <span className="text-white/60 text-sm whitespace-nowrap">
              {gameState.players.length}/6 players
            </span>
          </div>
        </header>

        <div className="flex-shrink-0 px-4 py-1.5 bg-black/20 border-b border-white/5">
          <ScoreBar gameState={gameState} showScores={false} />
        </div>

        <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-3 gap-3 overflow-hidden">
          <div className="flex-1 min-h-0 w-full flex items-center justify-center">
            <RoundTable
              gameState={gameState}
              showCardCounts={false}
              compact
              centerContent={
                <div className="text-center space-y-1 px-4">
                  <p className="text-gold-400/80 font-display text-base font-bold">
                    Deck Score
                  </p>
                  <p className="text-white/40 text-xs">Take a seat at the table</p>
                </div>
              }
            />
          </div>

          <div className="w-full max-w-md space-y-2 flex-shrink-0 pb-1">
            <button
              onClick={() => onSetReady(!me?.isReady)}
              className={`w-full py-2.5 px-4 font-bold rounded-xl transition-all ${
                me?.isReady
                  ? 'bg-green-600 hover:bg-green-500 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
              }`}
            >
              {me?.isReady ? 'Ready ✓' : 'Ready Up'}
            </button>

            {isHost && (
              <button
                onClick={onStartGame}
                disabled={!allReady}
                className="w-full py-2.5 px-4 bg-gold-500 hover:bg-gold-400 disabled:opacity-40 disabled:cursor-not-allowed text-felt-900 font-bold rounded-xl transition-all"
              >
                {allReady ? '▶ Play' : 'Waiting for all players to ready up...'}
              </button>
            )}

            {!isHost && (
              <p className="text-center text-white/40 text-xs py-1">
                Waiting for host to start the game...
              </p>
            )}
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
