import { useRoomSocialContext } from '../../context/RoomSocialContext';

export function FloatingReactionLayer() {
  const { floatingReactions } = useRoomSocialContext();

  if (floatingReactions.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-[45] pointer-events-none overflow-hidden"
      aria-hidden
    >
      {floatingReactions.map((reaction) => (
        <div
          key={reaction.id}
          className="floating-reaction absolute bottom-[20%] flex flex-col items-center"
          style={{ left: `${reaction.x}%` }}
        >
          <span className="text-4xl sm:text-5xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
            {reaction.emoji}
          </span>
          {reaction.playerName && (
            <span className="mt-1 text-[10px] font-semibold text-white/70 drop-shadow-md">
              {reaction.playerName}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
