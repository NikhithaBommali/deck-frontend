import { ReactNode } from 'react';
import { ClientGameState } from '../types/game';
import { useSidebarWidth } from '../hooks/useSidebarWidth';
import { CollapsibleScorePanel } from './CollapsibleScorePanel';
import { ScoreTable } from './ScoreTable';
import { RoomInviteShare } from './RoomInviteShare';

interface GameLayoutProps {
  gameState: ClientGameState;
  roomCode?: string;
  children: ReactNode;
  highlightRound?: number | null;
  onLeave?: () => void;
}

export function GameLayout({
  gameState,
  roomCode,
  children,
  highlightRound,
  onLeave,
}: GameLayoutProps) {
  const host = gameState.players.find((p) => p.id === gameState.hostId);
  const showInvite = gameState.phase === 'waiting' && !!roomCode;
  const { width: sidebarWidth, isResizing, startResize } = useSidebarWidth();

  // Waiting room already uses the main area; duplicating score table + invite on mobile causes overlap.
  const showMobileScorePanel =
    gameState.phase !== 'waiting' && gameState.phase !== 'dealing';

  return (
    <div className="h-dvh min-h-0 overflow-hidden bg-gradient-to-br from-felt-900 via-felt-800 to-felt-900 flex flex-col">
      {onLeave && (
        <div className="flex-shrink-0 flex items-center justify-between gap-2 px-3 sm:px-4 py-2 bg-black/40 border-b border-white/10">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-white/50 text-xs min-w-0 flex-1">
            {showInvite && roomCode && (
              <div className="flex items-center gap-2">
                <span>Room</span>
                <RoomInviteShare roomCode={roomCode} variant="inline" />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onLeave}
            className="flex-shrink-0 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 transition-colors"
          >
            Leave Game
          </button>
        </div>
      )}

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <aside
          className="hidden lg:flex flex-shrink-0 border-r border-white/10 p-3 flex-col gap-3 min-h-0 overflow-hidden relative"
          style={{ width: sidebarWidth }}
        >
          <div className="flex-1 min-h-0 overflow-hidden">
            <ScoreTable gameState={gameState} highlightRound={highlightRound} />
          </div>
          {showInvite && (
            <RoomInviteShare
              roomCode={roomCode!}
              hostName={host?.name}
              variant="sidebar"
            />
          )}
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize sidebar"
            onMouseDown={(e) => startResize(e.clientX)}
            className={`absolute top-0 right-0 bottom-0 w-1.5 cursor-col-resize hover:bg-gold-500/30 ${
              isResizing ? 'bg-gold-500/50' : ''
            }`}
          />
        </aside>

        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
          {showMobileScorePanel && (
            <div className="lg:hidden flex-shrink-0 px-2 sm:px-3 pt-2 pb-1">
              <CollapsibleScorePanel
                gameState={gameState}
                highlightRound={highlightRound}
              />
            </div>
          )}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col lg:overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
