import { ChatPanel } from './ChatPanel';
import { ReactionPicker } from './ReactionPicker';
import { VoicePanel } from './VoicePanel';
import { NotificationDot } from './NotificationDot';
import { useRoomSocialContext } from '../../context/RoomSocialContext';

export function SocialDock() {
  const {
    activePanel,
    togglePanel,
    unreadCount,
    inVoice,
    inGroupVoice,
    muted,
    voiceNotify,
    incomingCalls,
    othersInTableVoice,
  } = useRoomSocialContext();

  const showChatDot = unreadCount > 0 && activePanel !== 'chat';
  const showVoiceDot =
    activePanel !== 'voice' &&
    (voiceNotify || incomingCalls.length > 0 || othersInTableVoice);

  return (
    <>
      <div className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] right-3 sm:right-4 z-50 flex flex-col items-end gap-2 pointer-events-none">
        {activePanel && (
          <div className="pointer-events-auto w-[min(92vw,320px)] max-h-[min(50dvh,420px)] rounded-2xl bg-gradient-to-b from-felt-800/95 to-felt-950/95 border border-white/15 shadow-2xl backdrop-blur-md overflow-hidden flex flex-col">
            {activePanel === 'chat' && <ChatPanel />}
            {activePanel === 'reactions' && <ReactionPicker />}
            {activePanel === 'voice' && <VoicePanel />}
          </div>
        )}

        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-2xl bg-black/50 border border-white/15 backdrop-blur-md shadow-xl">
          <button
            type="button"
            onClick={() => togglePanel('chat')}
            className={`relative px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
              activePanel === 'chat'
                ? 'bg-gold-500/25 text-gold-300 border border-gold-500/40'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            💬 Chat
            {showChatDot && <NotificationDot />}
          </button>

          <button
            type="button"
            onClick={() => togglePanel('reactions')}
            className={`px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
              activePanel === 'reactions'
                ? 'bg-gold-500/25 text-gold-300 border border-gold-500/40'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            😄 React
          </button>

          <button
            type="button"
            onClick={() => togglePanel('voice')}
            className={`relative px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
              activePanel === 'voice' || inVoice
                ? inGroupVoice && !muted
                  ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                  : inVoice && !muted
                    ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                    : 'bg-gold-500/25 text-gold-300 border border-gold-500/40'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            {inGroupVoice
              ? muted
                ? '🔇 Table'
                : '🎙 Table'
              : inVoice
                ? muted
                  ? '🔇 Voice'
                  : '🎙 Voice'
                : '🎙 Voice'}
            {showVoiceDot && <NotificationDot />}
          </button>
        </div>
      </div>
    </>
  );
}
