import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react';
import { ClientGameState } from '../types/game';
import { ChatTarget, FloatingReaction, SocialPanel } from '../types/social';
import { useRoomSocial } from '../hooks/useRoomSocial';
import { useVoiceChat } from '../hooks/useVoiceChat';
import type { Socket } from 'socket.io-client';

interface RoomSocialContextValue {
  enabled: boolean;
  playerId: string | null;
  players: ClientGameState['players'];
  selectedPlayerId: string | null;
  setSelectedPlayerId: (id: string | null) => void;
  activePanel: SocialPanel;
  setActivePanel: (panel: SocialPanel) => void;
  togglePanel: (panel: Exclude<SocialPanel, null>) => void;
  chatTarget: ChatTarget;
  setChatTarget: (target: ChatTarget) => void;
  unreadCount: number;
  floatingReactions: FloatingReaction[];
  getAllMessages: ReturnType<typeof useRoomSocial>['getAllMessages'];
  sendMessage: ReturnType<typeof useRoomSocial>['sendMessage'];
  sendReaction: ReturnType<typeof useRoomSocial>['sendReaction'];
  getReactionsForPlayer: ReturnType<typeof useRoomSocial>['getReactionsForPlayer'];
  openChatWith: (target: ChatTarget) => void;
  openReactions: () => void;
  interactWithPlayer: (playerId: string) => void;
  inVoice: boolean;
  inGroupVoice: boolean;
  muted: boolean;
  voiceError: string | null;
  voiceNotify: boolean;
  othersInTableVoice: boolean;
  connectingPeerId: string | null;
  incomingCalls: ReturnType<typeof useVoiceChat>['incomingCalls'];
  connectedPeers: ReturnType<typeof useVoiceChat>['connectedPeers'];
  outgoingCalls: ReturnType<typeof useVoiceChat>['outgoingCalls'];
  groupVoiceMembers: ReturnType<typeof useVoiceChat>['groupVoiceMembers'];
  joinGroupVoice: ReturnType<typeof useVoiceChat>['joinGroupVoice'];
  leaveGroupVoice: ReturnType<typeof useVoiceChat>['leaveGroupVoice'];
  callPlayer: ReturnType<typeof useVoiceChat>['callPlayer'];
  acceptCall: ReturnType<typeof useVoiceChat>['acceptCall'];
  declineCall: ReturnType<typeof useVoiceChat>['declineCall'];
  hangUp: ReturnType<typeof useVoiceChat>['hangUp'];
  toggleMute: ReturnType<typeof useVoiceChat>['toggleMute'];
  clearVoiceNotify: ReturnType<typeof useVoiceChat>['clearVoiceNotify'];
  isConnectedTo: ReturnType<typeof useVoiceChat>['isConnectedTo'];
  isCalling: ReturnType<typeof useVoiceChat>['isCalling'];
  isInGroupVoice: ReturnType<typeof useVoiceChat>['isInGroupVoice'];
  isPeerInVoiceWithMe: ReturnType<typeof useVoiceChat>['isPeerInVoiceWithMe'];
  hasIncomingCallFrom: (playerId: string) => boolean;
  isOutgoingCallTo: (playerId: string) => boolean;
  remoteStreams: ReturnType<typeof useVoiceChat>['remoteStreams'];
}

const RoomSocialContext = createContext<RoomSocialContextValue | null>(null);

interface RoomSocialProviderProps {
  socket: Socket | null;
  enabled: boolean;
  playerId: string | null;
  playerName?: string;
  gameState: ClientGameState;
  children: ReactNode;
}

export function RoomSocialProvider({
  socket,
  enabled,
  playerId,
  playerName,
  gameState,
  children,
}: RoomSocialProviderProps) {
  const [activePanel, setActivePanel] = useState<SocialPanel>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [chatTarget, setChatTarget] = useState<ChatTarget>('room');

  const peerIds = useMemo(
    () =>
      gameState.players
        .filter((p) => p.isConnected && p.id !== playerId)
        .map((p) => p.id),
    [gameState.players, playerId]
  );

  const social = useRoomSocial({
    socket,
    enabled,
    playerId,
    playerName,
  });
  const voice = useVoiceChat({ socket, enabled, playerId, peerIds });

  const togglePanel = (panel: Exclude<SocialPanel, null>) => {
    setActivePanel((current) => {
      const next = current === panel ? null : panel;
      if (next === 'chat') social.openChat();
      else social.closeChat();
      if (next === 'voice') voice.clearVoiceNotify();
      return next;
    });
  };

  const openChatWith = (target: ChatTarget) => {
    setChatTarget(target);
    social.openChat();
    setActivePanel('chat');
  };

  const openReactions = () => {
    setActivePanel('reactions');
  };

  const interactWithPlayer = (targetId: string) => {
    if (targetId === playerId) return;
    setSelectedPlayerId(targetId);
  };

  const value: RoomSocialContextValue = {
    enabled,
    playerId,
    players: gameState.players,
    selectedPlayerId,
    setSelectedPlayerId,
    activePanel,
    setActivePanel: (panel) => {
      if (panel === 'chat') social.openChat();
      else social.closeChat();
      if (panel === 'voice') voice.clearVoiceNotify();
      setActivePanel(panel);
    },
    togglePanel,
    chatTarget,
    setChatTarget,
    unreadCount: social.unreadCount,
    floatingReactions: social.floatingReactions,
    getAllMessages: social.getAllMessages,
    sendMessage: social.sendMessage,
    sendReaction: social.sendReaction,
    getReactionsForPlayer: social.getReactionsForPlayer,
    openChatWith,
    openReactions,
    interactWithPlayer,
    inVoice: voice.inVoice,
    inGroupVoice: voice.inGroupVoice,
    muted: voice.muted,
    voiceError: voice.error,
    voiceNotify: voice.voiceNotify,
    othersInTableVoice: voice.othersInTableVoice,
    connectingPeerId: voice.connectingPeerId,
    incomingCalls: voice.incomingCalls,
    connectedPeers: voice.connectedPeers,
    outgoingCalls: voice.outgoingCalls,
    groupVoiceMembers: voice.groupVoiceMembers,
    joinGroupVoice: voice.joinGroupVoice,
    leaveGroupVoice: voice.leaveGroupVoice,
    callPlayer: voice.callPlayer,
    acceptCall: voice.acceptCall,
    declineCall: voice.declineCall,
    hangUp: voice.hangUp,
    toggleMute: voice.toggleMute,
    clearVoiceNotify: voice.clearVoiceNotify,
    isConnectedTo: voice.isConnectedTo,
    isCalling: voice.isCalling,
    isInGroupVoice: voice.isInGroupVoice,
    isPeerInVoiceWithMe: voice.isPeerInVoiceWithMe,
    hasIncomingCallFrom: (id: string) =>
      voice.incomingCalls.some((call) => call.fromPlayerId === id),
    isOutgoingCallTo: voice.isCalling,
    remoteStreams: voice.remoteStreams,
  };

  return (
    <RoomSocialContext.Provider value={value}>
      {children}
    </RoomSocialContext.Provider>
  );
}

export function useRoomSocialContext() {
  const ctx = useContext(RoomSocialContext);
  if (!ctx) {
    throw new Error('useRoomSocialContext must be used within RoomSocialProvider');
  }
  return ctx;
}

export function useOptionalRoomSocial() {
  return useContext(RoomSocialContext);
}
