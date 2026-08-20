import { useState } from 'react';
import {
  buildRoomInviteUrl,
  copyRoomCode,
  copyRoomInviteLink,
  copyRoomInviteMessage,
  shareRoomInvite,
} from '../utils/roomInvite';

interface RoomInviteShareProps {
  roomCode: string;
  hostName?: string;
  variant?: 'card' | 'inline' | 'sidebar';
}

export function RoomInviteShare({
  roomCode,
  hostName,
  variant = 'card',
}: RoomInviteShareProps) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const inviteUrl = buildRoomInviteUrl(roomCode);

  const showFeedback = (message: string) => {
    setFeedback(message);
    window.setTimeout(() => setFeedback(null), 2500);
  };

  const handleShare = async () => {
    const result = await shareRoomInvite(roomCode, hostName);
    if (result.success) {
      showFeedback(
        result.method === 'share' ? 'Invite shared!' : 'Invite copied to clipboard!'
      );
    }
  };

  const handleCopyCode = async () => {
    if (await copyRoomCode(roomCode)) showFeedback('Room code copied!');
  };

  const handleCopyLink = async () => {
    if (await copyRoomInviteLink(roomCode)) showFeedback('Link copied!');
  };

  const handleCopyMessage = async () => {
    if (await copyRoomInviteMessage(roomCode, hostName)) {
      showFeedback('Full invite copied!');
    }
  };

  if (variant === 'sidebar') {
    return (
      <div className="rounded-xl border border-gold-500/25 bg-black/40 p-3 space-y-2 flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-gold-400 font-display font-bold text-xs uppercase tracking-wide">
            Invite Friends
          </p>
          <span className="text-base" aria-hidden>
            🔗
          </span>
        </div>

        <div>
          <p className="text-white/40 text-[10px] uppercase tracking-wider">Room Code</p>
          <p className="font-mono text-xl font-bold text-gold-400 tracking-[0.15em]">
            {roomCode}
          </p>
        </div>

        <p
          className="text-white/50 text-[10px] font-mono truncate"
          title={inviteUrl}
        >
          {inviteUrl}
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="flex-1 py-2 px-2 bg-gold-500 hover:bg-gold-400 text-felt-900 font-bold rounded-lg transition-colors text-xs"
          >
            Share
          </button>
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex-1 py-2 px-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/15 transition-colors text-xs"
          >
            Copy Link
          </button>
        </div>

        {feedback && (
          <p className="text-center text-green-300 text-[10px] font-medium">{feedback}</p>
        )}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-mono text-gold-400 tracking-widest text-sm">
          {roomCode}
        </span>
        <button
          type="button"
          onClick={handleCopyCode}
          className="px-2 py-1 text-[10px] font-semibold rounded-md bg-white/10 hover:bg-white/20 text-white/80 border border-white/10 transition-colors"
        >
          Copy
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="px-2 py-1 text-[10px] font-semibold rounded-md bg-gold-500/20 hover:bg-gold-500/30 text-gold-300 border border-gold-500/30 transition-colors"
        >
          Share
        </button>
        {feedback && (
          <span className="text-green-300 text-[10px] font-medium">{feedback}</span>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-gold-500/25 bg-gradient-to-br from-gold-500/10 via-black/30 to-black/40 p-4 space-y-3 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-gold-400 font-display font-bold text-sm uppercase tracking-wide">
            Invite Friends
          </p>
          <p className="text-white/50 text-xs mt-0.5">
            Share the link — friends tap to join instantly
          </p>
        </div>
        <span className="text-2xl" aria-hidden>
          🔗
        </span>
      </div>

      <div className="rounded-xl bg-black/40 border border-white/10 p-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-white/40 text-[10px] uppercase tracking-wider">
              Room Code
            </p>
            <p className="font-mono text-2xl font-bold text-gold-400 tracking-[0.2em]">
              {roomCode}
            </p>
          </div>
          <button
            type="button"
            onClick={handleCopyCode}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors shrink-0"
          >
            Copy Code
          </button>
        </div>

        <div className="pt-2 border-t border-white/10">
          <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">
            Join Link
          </p>
          <p className="text-white/70 text-xs font-mono break-all leading-relaxed">
            {inviteUrl}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={handleShare}
          className="flex-1 py-2.5 px-4 bg-gold-500 hover:bg-gold-400 text-felt-900 font-bold rounded-xl transition-colors text-sm"
        >
          Share Invite
        </button>
        <button
          type="button"
          onClick={handleCopyLink}
          className="flex-1 py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/15 transition-colors text-sm"
        >
          Copy Link
        </button>
        <button
          type="button"
          onClick={handleCopyMessage}
          className="sm:hidden py-2.5 px-4 bg-white/5 hover:bg-white/10 text-white/80 font-medium rounded-xl border border-white/10 transition-colors text-sm"
        >
          Copy Full Message
        </button>
      </div>

      {feedback && (
        <p className="text-center text-green-300 text-xs font-medium animate-pulse">
          {feedback}
        </p>
      )}
    </div>
  );
}
