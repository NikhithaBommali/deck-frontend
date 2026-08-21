import { useState } from 'react';
import { ClientGameState } from '../types/game';
import { ScoreTable } from './ScoreTable';

interface CollapsibleScorePanelProps {
  gameState: ClientGameState;
  highlightRound?: number | null;
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`w-5 h-5 text-gold-400/80 flex-shrink-0 transition-transform duration-300 ${
        expanded ? 'rotate-180' : ''
      }`}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function CollapsibleScorePanel({
  gameState,
  highlightRound,
}: CollapsibleScorePanelProps) {
  const [expanded, setExpanded] = useState(false);
  const sorted = [...gameState.players].sort((a, b) => a.seatIndex - b.seatIndex);

  const expandedMaxHeight =
    gameState.phase === 'round-end' || gameState.phase === 'finished'
      ? 'min(48vh,320px)'
      : 'min(42vh,280px)';

  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((open) => !open)}
        aria-expanded={expanded}
        aria-controls="mobile-score-table"
        className="w-full px-3 py-2 flex items-center gap-2 text-left hover:bg-white/5 active:bg-white/10 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <p className="font-display text-gold-400 font-bold text-sm leading-tight">
            Score Table
          </p>
          <p className="text-white/40 text-[10px] mt-0.5 truncate">
            Out at {gameState.eliminationScore}+ · Round {gameState.roundNumber}
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0 max-w-[45%] overflow-x-auto">
          {sorted.map((player) => {
            const isMe = player.id === gameState.myId;
            return (
              <span
                key={player.id}
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono whitespace-nowrap border ${
                  isMe
                    ? 'bg-gold-500/15 border-gold-500/30 text-gold-300'
                    : 'bg-white/5 border-white/10 text-white/70'
                } ${player.isEliminated ? 'opacity-50 line-through' : ''}`}
                title={player.name}
              >
                {player.name.split(' ')[0].slice(0, 6)}: {player.totalScore}
              </span>
            );
          })}
        </div>

        <ChevronIcon expanded={expanded} />
      </button>

      <div
        id="mobile-score-table"
        className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
        style={{ maxHeight: expanded ? expandedMaxHeight : '0px' }}
      >
        <div
          className="border-t border-white/10 overflow-hidden flex flex-col"
          style={{ height: expandedMaxHeight }}
        >
          <ScoreTable
            gameState={gameState}
            highlightRound={highlightRound}
            showHeader={false}
            embedded
          />
        </div>
      </div>
    </div>
  );
}
