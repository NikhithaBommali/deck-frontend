import { useRoomSocialContext } from '../../context/RoomSocialContext';

export function IncomingCallModal() {
  const { incomingCalls, acceptCall, declineCall } = useRoomSocialContext();

  if (incomingCalls.length === 0) return null;

  const call = incomingCalls[0];

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-[2px]" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-[min(92vw,340px)] rounded-2xl bg-gradient-to-b from-felt-800 to-felt-950 border border-emerald-500/40 shadow-2xl overflow-hidden">
        <div className="px-5 py-5 text-center border-b border-white/10">
          <div className="text-4xl mb-3 animate-bounce">📞</div>
          <p className="text-white font-semibold text-lg">{call.fromPlayerName}</p>
          <p className="text-emerald-300 text-sm mt-1">Incoming voice call</p>
        </div>
        <div className="p-4 flex gap-3">
          <button
            type="button"
            onClick={() => declineCall(call.fromPlayerId)}
            className="flex-1 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold border border-red-500/30 transition-colors"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => void acceptCall(call.fromPlayerId)}
            className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </>
  );
}
