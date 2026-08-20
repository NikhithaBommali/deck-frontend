import { ClientGameState } from '../types/game';
import { useScoreTableLayout } from '../hooks/useScoreTableLayout';
import { PlayerAvatar } from './PlayerAvatar';
import { ResizeHandle } from './ResizeHandle';

interface ScoreTableProps {
  gameState: ClientGameState;
  highlightRound?: number | null;
}

export function ScoreTable({ gameState, highlightRound }: ScoreTableProps) {
  const { layout, resizeColumn, resetLayout } = useScoreTableLayout();
  const sorted = [...gameState.players].sort((a, b) => a.seatIndex - b.seatIndex);
  const visiblePlayers = sorted.filter((p) => p.id === gameState.myId);
  const maxRounds = Math.max(
    gameState.roundNumber,
    ...sorted.map((p) => p.roundScores.length),
    1
  );
  const roundRows = Array.from({ length: maxRounds }, (_, i) => i + 1);

  const thBase =
    'relative px-2 py-1 text-white/50 text-xs uppercase tracking-wider bg-black/60 backdrop-blur-sm';

  const scoreCell = (value: number | undefined, highlighted: boolean) => (
    <span
      className={`font-mono text-xs ${
        highlighted ? 'text-gold-300 font-bold' : 'text-white/70'
      }`}
    >
      {value !== undefined ? value : '—'}
    </span>
  );

  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden h-full flex flex-col">
      <div className="px-4 py-3 border-b border-white/10 bg-black/20 flex-shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="font-display text-gold-400 font-bold text-lg">
              Score Table
            </h2>
            <p className="text-white/40 text-xs mt-0.5">
              Out at {gameState.eliminationScore}+ · Round {gameState.roundNumber}
            </p>
          </div>
          <button
            type="button"
            onClick={resetLayout}
            className="text-[10px] text-white/40 hover:text-gold-300 transition-colors whitespace-nowrap pt-0.5"
            title="Reset column and row sizes"
          >
            Reset sizes
          </button>
        </div>
        <p className="text-white/30 text-[10px] mt-1.5">
          Rounds down · Players across · Drag edges to resize
        </p>
      </div>

      <div className="overflow-auto flex-1 min-h-0">
        <table
          className="text-sm border-collapse"
          style={{ tableLayout: 'fixed', minWidth: '100%' }}
        >
          <colgroup>
            <col style={{ width: layout.labelColWidth }} />
            {visiblePlayers.map((player) => (
              <col key={player.id} style={{ width: layout.playerColWidth }} />
            ))}
          </colgroup>
          <thead>
            <tr
              className="border-b border-white/10"
              style={{ height: layout.headerRowHeight }}
            >
              <th className={`${thBase} text-left sticky left-0 z-10`}>
                Round
                <ResizeHandle
                  direction="column"
                  onResize={(d) => resizeColumn('labelColWidth', d)}
                />
                <ResizeHandle
                  direction="row"
                  onResize={(d) => resizeColumn('headerRowHeight', d)}
                />
              </th>
              {visiblePlayers.map((player) => {
                const isMe = player.id === gameState.myId;
                return (
                  <th
                    key={player.id}
                    className={`${thBase} text-center ${
                      player.isEliminated ? 'opacity-50' : ''
                    } ${isMe ? 'bg-gold-500/10' : ''}`}
                  >
                    <div className="flex flex-col items-center gap-1 min-w-0 px-0.5">
                      <PlayerAvatar
                        name={player.name}
                        profilePicture={player.profilePicture}
                        size="sm"
                        isHost={player.id === gameState.hostId}
                        isMe={isMe}
                      />
                      <p className="text-white font-medium truncate text-[10px] leading-tight max-w-full">
                        {player.name}
                        {isMe && (
                          <span className="text-gold-400/70 block">(you)</span>
                        )}
                      </p>
                      {player.isEliminated && (
                        <span className="text-red-400 text-[9px] font-bold">OUT</span>
                      )}
                      {!player.isConnected && !player.isEliminated && (
                        <span className="text-amber-400 text-[9px] font-medium">
                          Away
                        </span>
                      )}
                    </div>
                    <ResizeHandle
                      direction="column"
                      onResize={(d) => resizeColumn('playerColWidth', d)}
                    />
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {roundRows.map((round) => {
              const isHighlighted =
                highlightRound === round ||
                (gameState.phase === 'round-end' &&
                  round === gameState.roundNumber);

              return (
                <tr
                  key={round}
                  className={`border-b border-white/5 ${
                    isHighlighted ? 'bg-gold-500/10' : ''
                  }`}
                  style={{ height: layout.rowHeight }}
                >
                  <td
                    className={`px-2 py-1 sticky left-0 z-[1] bg-black/40 backdrop-blur-sm font-medium text-xs uppercase tracking-wide relative ${
                      isHighlighted ? 'text-gold-300' : 'text-white/50'
                    }`}
                  >
                    R{round}
                    <ResizeHandle
                      direction="row"
                      onResize={(d) => resizeColumn('rowHeight', d)}
                    />
                  </td>
                  {visiblePlayers.map((player) => (
                    <td
                      key={player.id}
                      className={`px-1 py-1 text-center align-middle overflow-hidden ${
                        player.isEliminated ? 'opacity-50' : ''
                      } ${player.id === gameState.myId ? 'bg-gold-500/5' : ''} ${
                        isHighlighted ? 'bg-gold-500/15' : ''
                      }`}
                    >
                      {scoreCell(player.roundScores[round - 1], isHighlighted)}
                    </td>
                  ))}
                </tr>
              );
            })}

            <tr
              className="border-b border-white/10 bg-black/20"
              style={{ height: layout.rowHeight }}
            >
              <td className="px-2 py-1 sticky left-0 z-[1] bg-black/50 backdrop-blur-sm text-gold-400/80 font-bold text-xs uppercase relative">
                Total
                <ResizeHandle
                  direction="row"
                  onResize={(d) => resizeColumn('rowHeight', d)}
                />
              </td>
              {visiblePlayers.map((player) => (
                <td
                  key={player.id}
                  className={`px-1 py-1 text-center align-middle ${
                    player.isEliminated ? 'opacity-50' : ''
                  } ${player.id === gameState.myId ? 'bg-gold-500/5' : ''}`}
                >
                  <span
                    className={`font-bold font-mono text-sm ${
                      player.isEliminated
                        ? 'text-red-400 line-through'
                        : player.totalScore >= gameState.eliminationScore
                          ? 'text-red-400'
                          : player.totalScore >=
                              gameState.eliminationScore - 10
                            ? 'text-yellow-400'
                            : 'text-white'
                    }`}
                  >
                    {player.totalScore}
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {gameState.phase === 'round-end' && (
        <div className="px-3 py-2 border-t border-white/10 bg-gold-500/10 flex-shrink-0">
          <p className="text-gold-300/80 text-[10px] text-center">
            Round {gameState.roundNumber} scores added to totals
          </p>
        </div>
      )}
    </div>
  );
}
