import { useRoomSocialContext } from '../../context/RoomSocialContext';

export function VoicePanel() {
  const {
    playerId,
    players,
    muted,
    voiceError,
    connectingPeerId,
    incomingCalls,
    inGroupVoice,
    groupVoiceMembers,
    joinGroupVoice,
    leaveGroupVoice,
    callPlayer,
    acceptCall,
    declineCall,
    hangUp,
    toggleMute,
    isConnectedTo,
    isCalling,
    isInGroupVoice,
    setActivePanel,
  } = useRoomSocialContext();

  const otherPlayers = players.filter(
    (p) => p.id !== playerId && p.isConnected
  );
  const activeCallCount = otherPlayers.filter((p) => isConnectedTo(p.id)).length;
  const groupCount = groupVoiceMembers.size;
  const tableVoiceActive = groupCount > 0;
  const othersOnTable = otherPlayers.filter((p) => isInGroupVoice(p.id));

  return (
    <div className="p-3 max-h-[min(50dvh,420px)] overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-white font-semibold text-sm">Voice</h3>
          <p className="text-white/40 text-[10px]">
            Join table voice or call someone privately
          </p>
        </div>
        <button
          type="button"
          onClick={() => setActivePanel(null)}
          className="text-white/50 hover:text-white text-lg leading-none px-2"
          aria-label="Close voice panel"
        >
          ×
        </button>
      </div>

      {voiceError && (
        <p className="text-red-300 text-xs mb-3 text-center">{voiceError}</p>
      )}

      {!inGroupVoice && tableVoiceActive && (
        <div className="mb-3 rounded-xl bg-red-500/10 border border-red-500/30 p-3">
          <p className="text-red-200 text-xs font-semibold">
            Table voice is live
          </p>
          <p className="text-white/50 text-[10px] mt-1">
            {othersOnTable.length > 0
              ? `${othersOnTable.map((p) => p.name).join(', ')} ${othersOnTable.length === 1 ? 'is' : 'are'} talking — join to hear everyone.`
              : `${groupCount} player${groupCount === 1 ? '' : 's'} on table voice — join to hear everyone.`}
          </p>
        </div>
      )}

      <div className="mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <p className="text-emerald-200 text-sm font-semibold">Table voice</p>
            <p className="text-white/45 text-[10px]">
              Everyone who joins can hear and speak together
            </p>
          </div>
          {groupCount > 0 && (
            <span className="flex-shrink-0 text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">
              {groupCount} active
            </span>
          )}
        </div>

        {inGroupVoice ? (
          <div className="space-y-2">
            <button
              type="button"
              onClick={toggleMute}
              className={`w-full py-2.5 rounded-xl font-bold text-sm transition-colors ${
                muted
                  ? 'bg-amber-600/80 hover:bg-amber-500 text-white'
                  : 'bg-white/10 hover:bg-white/15 text-white border border-white/15'
              }`}
            >
              {muted ? '🔇 Unmute microphone' : '🎤 Mute microphone'}
            </button>
            <button
              type="button"
              onClick={leaveGroupVoice}
              className="w-full py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-bold border border-red-500/30"
            >
              Leave table voice
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => void joinGroupVoice()}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-colors"
          >
            Join table voice
          </button>
        )}

        {groupCount > 0 && (
          <p className="text-white/35 text-[10px] mt-2">
            {[
              ...otherPlayers
                .filter((p) => isInGroupVoice(p.id))
                .map((p) => p.name),
              ...(inGroupVoice
                ? [players.find((p) => p.id === playerId)?.name ?? 'You']
                : []),
            ].join(', ')}
          </p>
        )}
      </div>

      {incomingCalls.length > 0 && (
        <div className="mb-3 space-y-2">
          <p className="text-white/50 text-[10px] font-medium uppercase tracking-wide">
            Incoming calls
          </p>
          {incomingCalls.map((call) => (
            <div
              key={call.fromPlayerId}
              className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-3"
            >
              <p className="text-emerald-200 text-xs font-medium mb-2">
                {call.fromPlayerName} is calling you
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void acceptCall(call.fromPlayerId)}
                  className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  Accept
                </button>
                <button
                  type="button"
                  onClick={() => declineCall(call.fromPlayerId)}
                  className="flex-1 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-bold border border-red-500/30"
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeCallCount > 0 && !inGroupVoice && (
        <button
          type="button"
          onClick={toggleMute}
          className={`w-full mb-3 py-2.5 rounded-xl font-bold text-sm transition-colors ${
            muted
              ? 'bg-amber-600/80 hover:bg-amber-500 text-white'
              : 'bg-white/10 hover:bg-white/15 text-white border border-white/15'
          }`}
        >
          {muted ? '🔇 Unmute microphone' : '🎤 Mute microphone'}
        </button>
      )}

      <p className="text-white/50 text-[10px] font-medium uppercase tracking-wide mb-2">
        Private calls
      </p>

      <div className="space-y-2">
        {otherPlayers.length === 0 ? (
          <p className="text-white/40 text-xs text-center py-4">
            No other connected players yet.
          </p>
        ) : (
          otherPlayers.map((player) => {
            const connected = isConnectedTo(player.id);
            const calling = isCalling(player.id);
            const isConnecting = connectingPeerId === player.id;
            const onTableVoice = isInGroupVoice(player.id);

            return (
              <div
                key={player.id}
                className="flex items-center justify-between gap-2 rounded-xl bg-black/25 border border-white/10 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {player.name}
                    {onTableVoice && (
                      <span className="ml-1 text-emerald-400/80 text-[10px]">
                        · on table voice
                      </span>
                    )}
                  </p>
                  <p className="text-white/40 text-[10px]">
                    {connected
                      ? 'Connected — you can hear each other'
                      : calling || isConnecting
                        ? 'Calling...'
                        : 'Tap call to talk privately'}
                  </p>
                </div>
                {connected ? (
                  <button
                    type="button"
                    onClick={() => hangUp(player.id)}
                    className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-bold border border-red-500/30"
                  >
                    End
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void callPlayer(player.id)}
                    disabled={calling || isConnecting}
                    className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold"
                  >
                    {calling || isConnecting ? '...' : 'Call'}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
