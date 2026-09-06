import { useOptionalRoomSocial } from '../../context/RoomSocialContext';

interface VoiceCallBadgeProps {
  playerId: string;
}

export function VoiceCallBadge({ playerId }: VoiceCallBadgeProps) {
  const social = useOptionalRoomSocial();
  if (!social) return null;

  const incoming = social.hasIncomingCallFrom(playerId);
  const outgoing = social.isOutgoingCallTo(playerId);
  const connected = social.isConnectedTo(playerId);
  const onTableVoice = social.isInGroupVoice(playerId);

  if (onTableVoice) {
    return (
      <span className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold whitespace-nowrap shadow-lg">
        🎙 Table voice
      </span>
    );
  }

  if (connected) {
    return (
      <span className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold whitespace-nowrap shadow-lg">
        On call
      </span>
    );
  }

  if (incoming) {
    return (
      <span className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 px-2 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold whitespace-nowrap shadow-lg animate-pulse">
        📞 Calling
      </span>
    );
  }

  if (outgoing) {
    return (
      <span className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 px-2 py-0.5 rounded-full bg-amber-500 text-felt-900 text-[9px] font-bold whitespace-nowrap shadow-lg animate-pulse">
        Calling...
      </span>
    );
  }

  return null;
}
