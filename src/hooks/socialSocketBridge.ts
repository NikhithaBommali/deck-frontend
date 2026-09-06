import type { Socket } from 'socket.io-client';
import {
  GroupVoiceSyncPayload,
  IncomingVoiceCall,
  VoiceHangupPayload,
  VoiceInvitePayload,
  VoiceInviteResponsePayload,
  VoiceStatePayload,
} from '../types/social';

export interface VoiceSocketHandlers {
  onVoiceSignal: (payload: { fromPlayerId: string; signal: unknown }) => void;
  onVoiceInvite: (payload: VoiceInvitePayload) => void;
  onVoiceInviteResponse: (payload: VoiceInviteResponsePayload) => void;
  onVoiceHangup: (payload: VoiceHangupPayload) => void;
  onVoiceState: (payload: VoiceStatePayload) => void;
  onGroupVoiceSync: (payload: GroupVoiceSyncPayload) => void;
}

let voiceHandlers: VoiceSocketHandlers | null = null;

export function setVoiceSocketHandlers(handlers: VoiceSocketHandlers | null) {
  voiceHandlers = handlers;
}

let attachedSocket: Socket | null = null;

export function attachVoiceSocketListeners(socket: Socket | null) {
  if (attachedSocket === socket) return;

  if (attachedSocket) {
    attachedSocket.off('voiceSignal');
    attachedSocket.off('voiceInvite');
    attachedSocket.off('voiceInviteResponse');
    attachedSocket.off('voiceHangup');
    attachedSocket.off('voiceState');
    attachedSocket.off('groupVoiceSync');
  }

  attachedSocket = socket;

  if (!socket) return;

  socket.on('voiceSignal', (payload) => {
    voiceHandlers?.onVoiceSignal(payload);
  });
  socket.on('voiceInvite', (payload: VoiceInvitePayload) => {
    voiceHandlers?.onVoiceInvite(payload);
  });
  socket.on('voiceInviteResponse', (payload: VoiceInviteResponsePayload) => {
    voiceHandlers?.onVoiceInviteResponse(payload);
  });
  socket.on('voiceHangup', (payload: VoiceHangupPayload) => {
    voiceHandlers?.onVoiceHangup(payload);
  });
  socket.on('voiceState', (payload: VoiceStatePayload) => {
    voiceHandlers?.onVoiceState(payload);
  });
  socket.on('groupVoiceSync', (payload: GroupVoiceSyncPayload) => {
    voiceHandlers?.onGroupVoiceSync(payload);
  });
}

export type { IncomingVoiceCall };
