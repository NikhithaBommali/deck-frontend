import { useOptionalRoomSocial } from '../../context/RoomSocialContext';

interface ReactionOverlayProps {
  playerId: string;
}

export function ReactionOverlay({ playerId }: ReactionOverlayProps) {
  const social = useOptionalRoomSocial();
  if (!social) return null;

  const reactions = social.getReactionsForPlayer(playerId).slice(-3);

  if (reactions.length === 0) return null;

  return (
    <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-0.5 z-20 pointer-events-none">
      {reactions.map((reaction) => (
        <span
          key={reaction.id}
          className="reaction-pop text-lg sm:text-xl drop-shadow-lg"
          title={reaction.playerName}
        >
          {reaction.emoji}
        </span>
      ))}
    </div>
  );
}
