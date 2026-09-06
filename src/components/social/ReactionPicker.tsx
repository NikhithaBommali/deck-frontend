import { ALLOWED_REACTIONS } from '../../types/social';
import { useRoomSocialContext } from '../../context/RoomSocialContext';

export function ReactionPicker() {
  const { sendReaction, setActivePanel } = useRoomSocialContext();

  const handleReaction = async (emoji: (typeof ALLOWED_REACTIONS)[number]) => {
    await sendReaction(emoji);
    setActivePanel(null);
  };

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-white font-semibold text-sm">Reactions</h3>
          <p className="text-white/40 text-[10px]">
            Sent to everyone at the table — floats on all screens
          </p>
        </div>
        <button
          type="button"
          onClick={() => setActivePanel(null)}
          className="text-white/50 hover:text-white text-lg leading-none px-2"
          aria-label="Close reactions"
        >
          ×
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {ALLOWED_REACTIONS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => void handleReaction(emoji)}
            className="aspect-square rounded-xl bg-black/30 hover:bg-black/45 border border-white/10 hover:border-gold-500/40 text-2xl transition-all hover:scale-105 active:scale-95"
            aria-label={`React with ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
