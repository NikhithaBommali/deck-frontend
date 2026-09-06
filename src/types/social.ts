export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  text: string;
  ts: number;
  scope: 'room' | 'direct';
  targetPlayerId?: string;
  targetPlayerName?: string;
}

export interface ReactionPayload {
  id: string;
  playerId: string;
  playerName: string;
  emoji: string;
  targetPlayerId?: string;
  ts: number;
}

export interface VoiceInvitePayload {
  fromPlayerId: string;
  fromPlayerName: string;
}

export interface VoiceInviteResponsePayload {
  fromPlayerId: string;
  accepted: boolean;
}

export interface VoiceHangupPayload {
  fromPlayerId: string;
}

export interface VoiceStatePayload {
  playerId: string;
  inVoice: boolean;
  muted: boolean;
  peerId?: string;
  group?: boolean;
}

export interface GroupVoiceSyncPayload {
  members: VoiceStatePayload[];
}

export interface FloatingReaction {
  id: string;
  emoji: string;
  playerName?: string;
  x: number;
}

export interface ActiveReaction extends ReactionPayload {
  expiresAt: number;
}

export interface IncomingVoiceCall {
  fromPlayerId: string;
  fromPlayerName: string;
}

export type ChatTarget = 'room' | string;

export const ALLOWED_REACTIONS = [
  '👍',
  '👏',
  '😂',
  '😮',
  '🔥',
  '🎉',
  '❤️',
  '🃏',
] as const;

export type AllowedReaction = (typeof ALLOWED_REACTIONS)[number];

export type SocialPanel = 'chat' | 'reactions' | 'voice' | null;

export function getDirectChatKey(a: string, b: string): string {
  return [a, b].sort().join(':');
}

export function isMessageInConversation(
  message: ChatMessage,
  playerId: string,
  target: ChatTarget
): boolean {
  if (target === 'room') {
    return message.scope === 'room';
  }
  if (message.scope !== 'direct') return false;
  return (
    (message.playerId === playerId && message.targetPlayerId === target) ||
    (message.playerId === target && message.targetPlayerId === playerId)
  );
}
