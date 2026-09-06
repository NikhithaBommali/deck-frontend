import { useCallback, useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';
import {
  ActiveReaction,
  AllowedReaction,
  ChatMessage,
  FloatingReaction,
  ReactionPayload,
} from '../types/social';
import { notifySocialVibrate } from '../components/social/NotificationDot';

const REACTION_TTL_MS = 2500;
const FLOAT_REACTION_TTL_MS = 2200;

interface UseRoomSocialOptions {
  socket: Socket | null;
  enabled: boolean;
  playerId: string | null;
  playerName?: string;
}

export function useRoomSocial({
  socket,
  enabled,
  playerId,
  playerName = 'You',
}: UseRoomSocialOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeReactions, setActiveReactions] = useState<ActiveReaction[]>([]);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const reactionTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );
  const floatTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  const clearReaction = useCallback((id: string) => {
    setActiveReactions((prev) => prev.filter((r) => r.id !== id));
    const timer = reactionTimers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      reactionTimers.current.delete(id);
    }
  }, []);

  const clearFloatingReaction = useCallback((id: string) => {
    setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
    const timer = floatTimers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      floatTimers.current.delete(id);
    }
  }, []);

  const showFloatingReaction = useCallback(
    (emoji: string, name?: string) => {
      const id = crypto.randomUUID();
      const item: FloatingReaction = {
        id,
        emoji,
        playerName: name,
        x: 15 + Math.random() * 70,
      };
      setFloatingReactions((prev) => [...prev.slice(-8), item]);
      const timer = setTimeout(
        () => clearFloatingReaction(id),
        FLOAT_REACTION_TTL_MS
      );
      floatTimers.current.set(id, timer);
    },
    [clearFloatingReaction]
  );

  const addReaction = useCallback(
    (reaction: ReactionPayload) => {
      const active: ActiveReaction = {
        ...reaction,
        expiresAt: Date.now() + REACTION_TTL_MS,
      };
      setActiveReactions((prev) => [...prev.slice(-30), active]);
      if (reaction.playerId !== playerId) {
        showFloatingReaction(reaction.emoji, reaction.playerName);
      }
      const timer = setTimeout(() => clearReaction(reaction.id), REACTION_TTL_MS);
      reactionTimers.current.set(reaction.id, timer);
    },
    [clearReaction, showFloatingReaction, playerId]
  );

  useEffect(() => {
    if (!socket || !enabled) return;

    const onHistory = (history: ChatMessage[]) => {
      const sorted = (Array.isArray(history) ? history : []).sort(
        (a, b) => a.ts - b.ts
      );
      setMessages(sorted);
    };

    const onMessage = (message: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message].sort((a, b) => a.ts - b.ts);
      });
      if (!chatOpen && message.playerId !== playerId) {
        setUnreadCount((c) => c + 1);
        notifySocialVibrate();
      }
    };

    const onReaction = (reaction: ReactionPayload) => {
      addReaction(reaction);
    };

    socket.on('chatHistory', onHistory);
    socket.on('chatMessage', onMessage);
    socket.on('reaction', onReaction);

    return () => {
      socket.off('chatHistory', onHistory);
      socket.off('chatMessage', onMessage);
      socket.off('reaction', onReaction);
    };
  }, [socket, enabled, chatOpen, playerId, addReaction]);

  useEffect(() => {
    if (!enabled) {
      setMessages([]);
      setActiveReactions([]);
      setFloatingReactions([]);
      setUnreadCount(0);
      setChatOpen(false);
      reactionTimers.current.forEach((timer) => clearTimeout(timer));
      reactionTimers.current.clear();
      floatTimers.current.forEach((timer) => clearTimeout(timer));
      floatTimers.current.clear();
    }
  }, [enabled]);

  const openChat = useCallback(() => {
    setChatOpen(true);
    setUnreadCount(0);
  }, []);

  const closeChat = useCallback(() => {
    setChatOpen(false);
  }, []);

  const sendMessage = useCallback(
    async (
      text: string,
      target: 'room' | string = 'room'
    ): Promise<{ success: boolean; error?: string }> => {
      if (!socket || !enabled) {
        return { success: false, error: 'Not connected' };
      }

      const payload =
        target === 'room' ? { text } : { text, targetPlayerId: target };

      return new Promise((resolve) => {
        socket.emit('chatMessage', payload, (result: { success: boolean; error?: string }) => {
          resolve(result ?? { success: false, error: 'Failed to send' });
        });
      });
    },
    [socket, enabled]
  );

  const sendReaction = useCallback(
    async (emoji: AllowedReaction): Promise<{ success: boolean; error?: string }> => {
      if (!socket || !enabled) {
        return { success: false, error: 'Not connected' };
      }

      showFloatingReaction(emoji, playerName);

      return new Promise((resolve) => {
        socket.emit('reaction', { emoji }, (result: { success: boolean; error?: string }) => {
          resolve(result ?? { success: false, error: 'Failed to react' });
        });
      });
    },
    [socket, enabled, playerName, showFloatingReaction]
  );

  const getReactionsForPlayer = useCallback(
    (seatPlayerId: string) =>
      activeReactions.filter((r) => r.playerId === seatPlayerId),
    [activeReactions]
  );

  const getAllMessages = useCallback(() => messages, [messages]);

  return {
    messages,
    floatingReactions,
    unreadCount,
    chatOpen,
    openChat,
    closeChat,
    sendMessage,
    sendReaction,
    getReactionsForPlayer,
    getAllMessages,
  };
}
