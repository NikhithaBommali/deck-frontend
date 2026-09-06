import { useCallback, useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';
import {
  GroupVoiceSyncPayload,
  IncomingVoiceCall,
  VoiceHangupPayload,
  VoiceInvitePayload,
  VoiceInviteResponsePayload,
  VoiceStatePayload,
} from '../types/social';
import {
  attachVoiceSocketListeners,
  setVoiceSocketHandlers,
} from './socialSocketBridge';
import { notifySocialVibrate } from '../components/social/NotificationDot';

interface UseVoiceChatOptions {
  socket: Socket | null;
  enabled: boolean;
  playerId: string | null;
  peerIds: string[];
}

type PeerEntry = {
  pc: RTCPeerConnection;
  stream?: MediaStream;
};

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

export function useVoiceChat({
  socket,
  enabled,
  playerId,
  peerIds,
}: UseVoiceChatOptions) {
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(
    new Map()
  );
  const [connectedPeers, setConnectedPeers] = useState<Set<string>>(new Set());
  const [outgoingCalls, setOutgoingCalls] = useState<Set<string>>(new Set());
  const [incomingCalls, setIncomingCalls] = useState<IncomingVoiceCall[]>([]);
  const [groupVoiceMembers, setGroupVoiceMembers] = useState<Set<string>>(
    new Set()
  );
  const [inGroupVoice, setInGroupVoice] = useState(false);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectingPeerId, setConnectingPeerId] = useState<string | null>(null);
  const [voiceNotify, setVoiceNotify] = useState(false);

  const peersRef = useRef<Map<string, PeerEntry>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const playerIdRef = useRef<string | null>(playerId);
  const peerIdsRef = useRef<string[]>(peerIds);
  const allowedPeersRef = useRef<Set<string>>(new Set());
  const inGroupVoiceRef = useRef(false);
  const groupMembersRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    playerIdRef.current = playerId;
  }, [playerId]);

  useEffect(() => {
    peerIdsRef.current = peerIds;
  }, [peerIds]);

  useEffect(() => {
    inGroupVoiceRef.current = inGroupVoice;
  }, [inGroupVoice]);

  useEffect(() => {
    groupMembersRef.current = groupVoiceMembers;
  }, [groupVoiceMembers]);

  const updateRemoteStreams = useCallback(() => {
    const next = new Map<string, MediaStream>();
    peersRef.current.forEach((peer, id) => {
      if (peer.stream) next.set(id, peer.stream);
    });
    setRemoteStreams(next);
  }, []);

  const ensureLocalStream = useCallback(async (): Promise<MediaStream | null> => {
    if (localStreamRef.current) return localStreamRef.current;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });
      localStreamRef.current = stream;
      return stream;
    } catch {
      setError('Microphone access denied or unavailable');
      return null;
    }
  }, []);

  const removePeer = useCallback(
    (peerId: string) => {
      const peer = peersRef.current.get(peerId);
      if (peer) {
        peer.pc.close();
        peersRef.current.delete(peerId);
      }
      allowedPeersRef.current.delete(peerId);
      setConnectedPeers((prev) => {
        const next = new Set(prev);
        next.delete(peerId);
        return next;
      });
      setOutgoingCalls((prev) => {
        const next = new Set(prev);
        next.delete(peerId);
        return next;
      });
      updateRemoteStreams();
    },
    [updateRemoteStreams]
  );

  const stopLocalStreamIfIdle = useCallback(() => {
    if (peersRef.current.size > 0 || inGroupVoiceRef.current) return;
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    setMuted(false);
  }, []);

  const createPeerConnection = useCallback(
    (peerId: string, initiator: boolean) => {
      if (!playerIdRef.current || peersRef.current.has(peerId)) return;
      if (peerId === playerIdRef.current) return;

      const pc = new RTCPeerConnection(ICE_SERVERS);
      peersRef.current.set(peerId, { pc });
      allowedPeersRef.current.add(peerId);

      if (localStreamRef.current) {
        localStreamRef.current
          .getTracks()
          .forEach((track) => pc.addTrack(track, localStreamRef.current!));
      }

      pc.ontrack = (event) => {
        const [stream] = event.streams;
        if (!stream) return;
        const existing = peersRef.current.get(peerId);
        if (existing) {
          existing.stream = stream;
          peersRef.current.set(peerId, existing);
          updateRemoteStreams();
        }
      };

      pc.onicecandidate = (event) => {
        if (!event.candidate || !playerIdRef.current) return;
        socket?.emit('voiceSignal', {
          toPlayerId: peerId,
          signal: { candidate: event.candidate },
        });
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
          removePeer(peerId);
          stopLocalStreamIfIdle();
        }
        if (pc.connectionState === 'connected') {
          setConnectedPeers((prev) => new Set(prev).add(peerId));
          setOutgoingCalls((prev) => {
            const next = new Set(prev);
            next.delete(peerId);
            return next;
          });
        }
      };

      if (initiator) {
        void pc.createOffer().then((offer) => {
          void pc.setLocalDescription(offer);
          socket?.emit('voiceSignal', {
            toPlayerId: peerId,
            signal: { sdp: offer },
          });
        });
      }
    },
    [socket, removePeer, updateRemoteStreams, stopLocalStreamIfIdle]
  );

  const connectToPeerIfReady = useCallback(
    (peerId: string) => {
      if (!playerIdRef.current || peerId === playerIdRef.current) return;
      if (peersRef.current.has(peerId)) return;
      const initiator =
        (playerIdRef.current ?? '') < peerId;
      createPeerConnection(peerId, initiator);
    },
    [createPeerConnection]
  );

  const connectGroupMesh = useCallback(() => {
    groupMembersRef.current.forEach((peerId) => {
      if (peerId !== playerIdRef.current) {
        connectToPeerIfReady(peerId);
      }
    });
  }, [connectToPeerIfReady]);

  const handleSignal = useCallback(
    async (fromPlayerId: string, signal: unknown) => {
      if (!playerIdRef.current || fromPlayerId === playerIdRef.current) return;

      if (!allowedPeersRef.current.has(fromPlayerId)) {
        const isTableVoicePeer =
          inGroupVoiceRef.current ||
          groupMembersRef.current.has(fromPlayerId);
        const isRoomPeer = peerIdsRef.current.includes(fromPlayerId);
        if (isTableVoicePeer && isRoomPeer) {
          allowedPeersRef.current.add(fromPlayerId);
        } else {
          return;
        }
      }

      let peer = peersRef.current.get(fromPlayerId);
      if (!peer) {
        if (!localStreamRef.current && inGroupVoiceRef.current) {
          await ensureLocalStream();
        }
        createPeerConnection(fromPlayerId, false);
        peer = peersRef.current.get(fromPlayerId);
      }
      if (!peer) return;

      const payload = signal as {
        sdp?: RTCSessionDescriptionInit;
        candidate?: RTCIceCandidateInit;
      };

      if (payload.sdp) {
        await peer.pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        if (payload.sdp.type === 'offer') {
          const answer = await peer.pc.createAnswer();
          await peer.pc.setLocalDescription(answer);
          socket?.emit('voiceSignal', {
            toPlayerId: fromPlayerId,
            signal: { sdp: answer },
          });
        }
      } else if (payload.candidate) {
        try {
          await peer.pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
        } catch {
          // Ignore stale ICE candidates.
        }
      }
    },
    [createPeerConnection, socket, ensureLocalStream]
  );

  const notifyTableVoiceActivity = useCallback(() => {
    if (inGroupVoiceRef.current) return;
    setVoiceNotify(true);
    notifySocialVibrate();
  }, []);

  const applyGroupMemberState = useCallback(
    (payload: VoiceStatePayload, notifyOnJoin: boolean) => {
      if (payload.playerId === playerIdRef.current) return;

      const wasMember = groupMembersRef.current.has(payload.playerId);

      setGroupVoiceMembers((prev) => {
        const next = new Set(prev);
        if (payload.inVoice) next.add(payload.playerId);
        else next.delete(payload.playerId);
        groupMembersRef.current = next;
        return next;
      });

      if (payload.inVoice) {
        if (notifyOnJoin && !wasMember) {
          notifyTableVoiceActivity();
        }
        if (inGroupVoiceRef.current) {
          allowedPeersRef.current.add(payload.playerId);
          connectToPeerIfReady(payload.playerId);
        }
      } else {
        removePeer(payload.playerId);
      }
    },
    [connectToPeerIfReady, removePeer, notifyTableVoiceActivity]
  );

  const handleGroupVoiceSync = useCallback(
    (payload: GroupVoiceSyncPayload) => {
      const members = Array.isArray(payload.members) ? payload.members : [];
      members.forEach((member) => {
        applyGroupMemberState(member, false);
      });
      if (inGroupVoiceRef.current) {
        connectGroupMesh();
      } else if (members.length > 0) {
        notifyTableVoiceActivity();
      }
    },
    [applyGroupMemberState, connectGroupMesh, notifyTableVoiceActivity]
  );

  const handleVoiceState = useCallback(
    (payload: VoiceStatePayload) => {
      if (payload.playerId === playerIdRef.current) return;

      if (payload.group) {
        applyGroupMemberState(payload, true);
        return;
      }

      if (payload.inVoice && payload.peerId === playerIdRef.current) {
        allowedPeersRef.current.add(payload.playerId);
      }
    },
    [applyGroupMemberState]
  );

  const clearVoiceNotify = useCallback(() => setVoiceNotify(false), []);

  const joinGroupVoice = useCallback(async () => {
    if (!socket || !enabled || inGroupVoice) return;
    setError(null);
    const stream = await ensureLocalStream();
    if (!stream) return;

    setInGroupVoice(true);
    inGroupVoiceRef.current = true;
    setGroupVoiceMembers((prev) => new Set(prev).add(playerIdRef.current!));
    setMuted(false);
    setVoiceNotify(false);

    socket.emit(
      'voiceState',
      {
        inVoice: true,
        muted: false,
        group: true,
      },
      () => {
        connectGroupMesh();
      }
    );
  }, [socket, enabled, inGroupVoice, ensureLocalStream, connectGroupMesh]);

  const leaveGroupVoice = useCallback(() => {
    if (!inGroupVoiceRef.current) return;

    setInGroupVoice(false);
    inGroupVoiceRef.current = false;
    if (playerIdRef.current) {
      setGroupVoiceMembers((prev) => {
        const next = new Set(prev);
        next.delete(playerIdRef.current!);
        return next;
      });
    }

    [...peersRef.current.keys()].forEach((peerId) => removePeer(peerId));

    socket?.emit('voiceState', {
      inVoice: false,
      muted: true,
      group: true,
    });

    stopLocalStreamIfIdle();
  }, [removePeer, socket, stopLocalStreamIfIdle]);

  const hangUp = useCallback(
    (peerId: string) => {
      removePeer(peerId);
      socket?.emit('voiceHangup', { toPlayerId: peerId });
      stopLocalStreamIfIdle();
    },
    [removePeer, socket, stopLocalStreamIfIdle]
  );

  const callPlayer = useCallback(
    async (peerId: string) => {
      if (!socket || !enabled || !playerId || peerId === playerId) return;
      if (connectedPeers.has(peerId) || outgoingCalls.has(peerId)) return;

      setError(null);
      setConnectingPeerId(peerId);
      const stream = await ensureLocalStream();
      if (!stream) {
        setConnectingPeerId(null);
        return;
      }

      setOutgoingCalls((prev) => new Set(prev).add(peerId));
      socket.emit(
        'voiceInvite',
        { toPlayerId: peerId },
        (result: { success: boolean; error?: string }) => {
          if (!result?.success) {
            setOutgoingCalls((prev) => {
              const next = new Set(prev);
              next.delete(peerId);
              return next;
            });
            setError(result?.error ?? 'Could not start call');
          }
          setConnectingPeerId(null);
        }
      );
    },
    [socket, enabled, playerId, connectedPeers, outgoingCalls, ensureLocalStream]
  );

  const acceptCall = useCallback(
    async (fromPlayerId: string) => {
      if (!socket || !enabled) return;
      setIncomingCalls((prev) =>
        prev.filter((c) => c.fromPlayerId !== fromPlayerId)
      );
      setVoiceNotify(false);

      const stream = await ensureLocalStream();
      if (!stream) return;

      allowedPeersRef.current.add(fromPlayerId);
      createPeerConnection(fromPlayerId, false);

      socket.emit('voiceInviteResponse', {
        toPlayerId: fromPlayerId,
        accepted: true,
      });
    },
    [socket, enabled, ensureLocalStream, createPeerConnection]
  );

  const declineCall = useCallback(
    (fromPlayerId: string) => {
      setIncomingCalls((prev) => {
        const next = prev.filter((c) => c.fromPlayerId !== fromPlayerId);
        if (next.length === 0) setVoiceNotify(false);
        return next;
      });
      socket?.emit('voiceInviteResponse', {
        toPlayerId: fromPlayerId,
        accepted: false,
      });
    },
    [socket]
  );

  const teardownVoice = useCallback(() => {
    if (inGroupVoiceRef.current) {
      socket?.emit('voiceState', { inVoice: false, muted: true, group: true });
    }
    [...peersRef.current.keys()].forEach((peerId) => {
      socket?.emit('voiceHangup', { toPlayerId: peerId });
    });
    peersRef.current.forEach((peer) => peer.pc.close());
    peersRef.current.clear();
    allowedPeersRef.current.clear();
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    setRemoteStreams(new Map());
    setConnectedPeers(new Set());
    setOutgoingCalls(new Set());
    setIncomingCalls([]);
    setGroupVoiceMembers(new Set());
    setInGroupVoice(false);
    inGroupVoiceRef.current = false;
    setMuted(false);
    setConnectingPeerId(null);
    setVoiceNotify(false);
  }, [socket]);

  useEffect(() => {
    attachVoiceSocketListeners(socket);
  }, [socket]);

  useEffect(() => {
    if (!enabled) {
      setVoiceSocketHandlers(null);
      return;
    }

    setVoiceSocketHandlers({
      onVoiceSignal: ({ fromPlayerId, signal }) => {
        void handleSignal(fromPlayerId, signal);
      },
      onVoiceInvite: (payload: VoiceInvitePayload) => {
        setIncomingCalls((prev) => {
          if (prev.some((c) => c.fromPlayerId === payload.fromPlayerId)) {
            return prev;
          }
          return [...prev, payload];
        });
        setVoiceNotify(true);
        notifySocialVibrate();
      },
      onVoiceInviteResponse: (payload: VoiceInviteResponsePayload) => {
        if (!payload.accepted) {
          setOutgoingCalls((prev) => {
            const next = new Set(prev);
            next.delete(payload.fromPlayerId);
            return next;
          });
          setError('Call declined');
          return;
        }
        void (async () => {
          await ensureLocalStream();
          allowedPeersRef.current.add(payload.fromPlayerId);
          createPeerConnection(payload.fromPlayerId, true);
        })();
      },
      onVoiceHangup: (payload: VoiceHangupPayload) => {
        removePeer(payload.fromPlayerId);
        stopLocalStreamIfIdle();
      },
      onVoiceState: handleVoiceState,
      onGroupVoiceSync: handleGroupVoiceSync,
    });

    return () => setVoiceSocketHandlers(null);
  }, [
    enabled,
    handleSignal,
    handleVoiceState,
    handleGroupVoiceSync,
    ensureLocalStream,
    createPeerConnection,
    removePeer,
    stopLocalStreamIfIdle,
  ]);

  useEffect(() => {
    if (inGroupVoice) connectGroupMesh();
  }, [peerIds, inGroupVoice, connectGroupMesh]);

  useEffect(() => {
    if (!enabled) teardownVoice();
  }, [enabled, teardownVoice]);

  const toggleMute = useCallback(() => {
    if (!localStreamRef.current) return;
    const nextMuted = !muted;
    localStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted;
    });
    setMuted(nextMuted);

    if (inGroupVoice) {
      socket?.emit('voiceState', {
        inVoice: true,
        muted: nextMuted,
        group: true,
      });
    }
  }, [muted, inGroupVoice, socket]);

  const isConnectedTo = useCallback(
    (peerId: string) => connectedPeers.has(peerId),
    [connectedPeers]
  );

  const isCalling = useCallback(
    (peerId: string) => outgoingCalls.has(peerId),
    [outgoingCalls]
  );

  const isInGroupVoice = useCallback(
    (peerId: string) =>
      groupVoiceMembers.has(peerId) ||
      (peerId === playerId && inGroupVoice),
    [groupVoiceMembers, playerId, inGroupVoice]
  );

  const othersInTableVoice =
    !inGroupVoice &&
    [...groupVoiceMembers].some((id) => id !== playerId);

  return {
    muted,
    error,
    connectingPeerId,
    incomingCalls,
    connectedPeers,
    outgoingCalls,
    groupVoiceMembers,
    inGroupVoice,
    voiceNotify,
    othersInTableVoice,
    remoteStreams,
    joinGroupVoice,
    leaveGroupVoice,
    callPlayer,
    acceptCall,
    declineCall,
    hangUp,
    toggleMute,
    clearVoiceNotify,
    isConnectedTo,
    isCalling,
    isInGroupVoice,
    isPeerInVoiceWithMe: isConnectedTo,
    inVoice: inGroupVoice || connectedPeers.size > 0 || outgoingCalls.size > 0,
  };
}
