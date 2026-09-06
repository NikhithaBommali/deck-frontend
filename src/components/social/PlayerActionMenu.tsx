import { useRoomSocialContext } from '../../context/RoomSocialContext';

export function PlayerActionMenu() {
  const {
    selectedPlayerId,
    setSelectedPlayerId,
    players,
    openChatWith,
    openReactions,
    callPlayer,
    isConnectedTo,
    hangUp,
  } = useRoomSocialContext();

  if (!selectedPlayerId) return null;

  const player = players.find((p) => p.id === selectedPlayerId);
  if (!player) return null;

  const connected = isConnectedTo(player.id);

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/40"
        aria-label="Close player menu"
        onClick={() => setSelectedPlayerId(null)}
      />
      <div className="fixed left-1/2 bottom-[calc(6rem+env(safe-area-inset-bottom,0px))] sm:bottom-[calc(7rem+env(safe-area-inset-bottom,0px))] -translate-x-1/2 z-50 w-[min(92vw,280px)] rounded-2xl bg-gradient-to-b from-felt-800 to-felt-950 border border-white/15 shadow-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10">
          <p className="text-white font-semibold text-sm">{player.name}</p>
          <p className="text-white/45 text-[10px]">Choose how to interact</p>
        </div>
        <div className="p-2 space-y-1">
          <button
            type="button"
            onClick={() => {
              openChatWith(player.id);
              setSelectedPlayerId(null);
            }}
            className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/10 text-white text-sm transition-colors"
          >
            💬 Private message
          </button>
          <button
            type="button"
            onClick={() => {
              openReactions();
              setSelectedPlayerId(null);
            }}
            className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/10 text-white text-sm transition-colors"
          >
            😄 Send reaction to table
          </button>
          <button
            type="button"
            onClick={() => {
              if (connected) {
                hangUp(player.id);
              } else {
                void callPlayer(player.id);
              }
              setSelectedPlayerId(null);
            }}
            className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/10 text-white text-sm transition-colors"
          >
            {connected ? '📵 End voice call' : '🎙 Voice call'}
          </button>
        </div>
      </div>
    </>
  );
}
