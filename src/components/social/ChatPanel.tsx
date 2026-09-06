import { FormEvent, useEffect, useRef, useState } from 'react';
import { useRoomSocialContext } from '../../context/RoomSocialContext';
import { ChatMessage, ChatTarget } from '../../types/social';

export function ChatPanel() {
  const {
    playerId,
    players,
    chatTarget,
    setChatTarget,
    getAllMessages,
    sendMessage,
    setActivePanel,
  } = useRoomSocialContext();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const allMessages = getAllMessages();
  const otherPlayers = players.filter(
    (p) => p.id !== playerId && p.isConnected
  );

  const getTargetLabel = (target: ChatTarget) => {
    if (target === 'room') return 'Everyone';
    return players.find((p) => p.id === target)?.name ?? 'Player';
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setError(null);
    const result = await sendMessage(trimmed, chatTarget);
    setSending(false);

    if (result.success) {
      setText('');
    } else {
      setError(result.error ?? 'Could not send message');
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 gap-2">
        <div className="min-w-0">
          <h3 className="text-white font-semibold text-sm">Table Chat</h3>
          <p className="text-white/40 text-[10px] truncate">
            Full conversation for this game — room & your private messages
          </p>
        </div>
        <button
          type="button"
          onClick={() => setActivePanel(null)}
          className="text-white/50 hover:text-white text-lg leading-none px-2 flex-shrink-0"
          aria-label="Close chat"
        >
          ×
        </button>
      </div>

      <div className="px-3 py-2 border-b border-white/10 flex gap-1.5 overflow-x-auto">
        <span className="flex-shrink-0 self-center text-[10px] text-white/40 mr-1">
          Send to:
        </span>
        <button
          type="button"
          onClick={() => setChatTarget('room')}
          className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
            chatTarget === 'room'
              ? 'bg-gold-500/25 text-gold-300 border border-gold-500/40'
              : 'bg-white/5 text-white/60 border border-white/10'
          }`}
        >
          Everyone
        </button>
        {otherPlayers.map((player) => (
          <button
            key={player.id}
            type="button"
            onClick={() => setChatTarget(player.id)}
            className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
              chatTarget === player.id
                ? 'bg-gold-500/25 text-gold-300 border border-gold-500/40'
                : 'bg-white/5 text-white/60 border border-white/10'
            }`}
          >
            {player.name}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2 space-y-2">
        {allMessages.length === 0 ? (
          <p className="text-white/40 text-xs text-center py-6">
            No messages yet. Say hello to the table!
          </p>
        ) : (
          allMessages.map((msg: ChatMessage) => {
            const isMe = msg.playerId === playerId;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                {!isMe && (
                  <span className="text-[10px] text-gold-400/80 mb-0.5">
                    {msg.playerName}
                    {msg.scope === 'direct' && (
                      <span className="text-purple-300/70"> · private</span>
                    )}
                  </span>
                )}
                {isMe && msg.scope === 'direct' && (
                  <span className="text-[10px] text-purple-300/70 mb-0.5">
                    To {msg.targetPlayerName}
                  </span>
                )}
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm break-words ${
                    isMe
                      ? msg.scope === 'direct'
                        ? 'bg-purple-500/20 border border-purple-400/30 text-white rounded-br-md'
                        : 'bg-gold-500/25 border border-gold-500/30 text-white rounded-br-md'
                      : 'bg-black/35 border border-white/10 text-white/90 rounded-bl-md'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex-shrink-0 p-3 border-t border-white/10 bg-black/20"
      >
        {error && (
          <p className="text-red-300 text-[10px] mb-2 text-center">{error}</p>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              chatTarget === 'room'
                ? 'Message everyone...'
                : `Message ${getTargetLabel(chatTarget)}...`
            }
            maxLength={280}
            className="flex-1 min-w-0 px-3 py-2 bg-black/30 border border-white/15 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-gold-500/40"
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 disabled:opacity-40 text-felt-900 font-bold text-sm transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
