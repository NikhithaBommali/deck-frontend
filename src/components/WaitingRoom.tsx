import { ClientGameState } from '../types/game';
import { GameLayout } from './GameLayout';
import { RoundTable } from './RoundTable';
import { RoomInviteShare } from './RoomInviteShare';
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
      <div className="flex flex-col flex-1 min-h-0">
        <header className="flex-shrink-0 px-3 sm:px-4 py-2 bg-black/30 border-b border-white/10">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h1 className="font-display text-base sm:text-lg text-gold-400 font-bold">
                Waiting Room
              </h1>
              <p className="text-white/50 text-[10px] sm:text-xs truncate">
                {gameState.players.length}/6 players ·{' '}
                <span className="font-mono text-gold-400 tracking-widest">
                  {roomCode}
                </span>
              </p>
            </div>
          </div>
        </header>

        <div className="hidden sm:block flex-shrink-0 px-4 py-1.5 bg-black/20 border-b border-white/5">
          <ScoreBar gameState={gameState} showScores={false} />
        </div>

        <div className="flex-1 min-h-0 flex flex-col overflow-y-auto">
          <div className="flex-shrink-0 px-3 pt-3 sm:pt-4 lg:hidden">
            <RoomInviteShare roomCode={roomCode} variant="sidebar" />
          </div>

          <div className="flex-1 min-h-[180px] flex items-center justify-center px-3 py-2">
            <RoundTable
              gameState={gameState}
              showCardCounts={false}
              compact
              dense
              centerContent={
                <div className="text-center space-y-0.5 px-2">
                  <p className="text-gold-400/80 font-display text-sm sm:text-base font-bold">
                    Deck Score
                  </p>
                  <p className="text-white/40 text-[10px] sm:text-xs">
                    Take a seat at the table
                  </p>
                </div>
              }
            />
          </div>

          <div className="flex-shrink-0 sticky bottom-0 px-3 sm:px-4 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-felt-900 via-felt-900/95 to-transparent space-y-2 max-w-md mx-auto w-full">
            <button
              onClick={() => onSetReady(!me?.isReady)}
              className={`w-full py-2.5 px-4 font-bold rounded-xl transition-all text-sm sm:text-base ${
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
                className="w-full py-2.5 px-4 bg-gold-500 hover:bg-gold-400 disabled:opacity-40 disabled:cursor-not-allowed text-felt-900 font-bold rounded-xl transition-all text-sm sm:text-base"
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
