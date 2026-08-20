import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { ClientGameState } from '../types/game';
import {
  clearGameSession,
  loadGameSession,
  saveGameSession,
} from '../api/session';
import { getInviteCodeFromUrl } from '../utils/roomInvite';
import { RoomPeekResult, JoinRoomResult } from '../types/room';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

interface SocketCallbacks {
  onGameState?: (state: ClientGameState) => void;
}

export function useSocket(callbacks: SocketCallbacks = {}) {
  const socketRef = useRef<Socket | null>(null);
  const callbacksRef = useRef(callbacks);
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(!!loadGameSession());
  const [gameState, setGameState] = useState<ClientGameState | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  const emit = useCallback(
    <T>(event: string, data?: unknown): Promise<T> => {
      return new Promise((resolve) => {
        socketRef.current?.emit(event, data, resolve);
      });
    },
    []
  );

  const tryReconnect = useCallback(async () => {
    const session = loadGameSession();
    if (!session) return;

    setReconnecting(true);
    setError(null);

    const result = await emit<{
      success: boolean;
      roomId?: string;
      code?: string;
      playerId?: string;
      error?: string;
    }>('reconnectRoom', {
      playerId: session.playerId,
      roomCode: session.roomCode,
    });

    if (result.success) {
      setRoomCode(result.code!);
      setPlayerId(result.playerId!);
      setReconnecting(false);
    } else {
      clearGameSession();
      setReconnecting(false);
      setGameState(null);
      setRoomCode(null);
      setPlayerId(null);
      if (!getInviteCodeFromUrl()) {
        setError(result.error || 'Could not restore your session');
      }
    }
  }, [emit]);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      void tryReconnect();
    });

    socket.on('disconnect', () => {
      setConnected(false);
      if (loadGameSession()) setReconnecting(true);
    });

    socket.on('gameState', (state: ClientGameState) => {
      setGameState(state);
      setReconnecting(false);
      callbacksRef.current.onGameState?.(state);
    });

    return () => {
      socket.disconnect();
    };
  }, [tryReconnect]);

  const persistSession = (id: string, code: string, name: string) => {
    saveGameSession({ playerId: id, roomCode: code, playerName: name });
  };

  const peekRoom = async (code: string): Promise<RoomPeekResult> => {
    return emit<RoomPeekResult>('peekRoom', { code });
  };

  const createRoom = async (playerName: string, profilePicture = '') => {
    setError(null);
    const result = await emit<{
      success: boolean;
      roomId?: string;
      code?: string;
      playerId?: string;
      error?: string;
    }>('createRoom', { playerName, profilePicture });

    if (result.success) {
      setRoomCode(result.code!);
      setPlayerId(result.playerId!);
      persistSession(result.playerId!, result.code!, playerName);
    } else {
      setError(result.error || 'Failed to create room');
    }
    return result;
  };

  const joinRoom = async (code: string, playerName: string, profilePicture = '') => {
    setError(null);
    const result = await emit<JoinRoomResult>('joinRoom', {
      code,
      playerName,
      profilePicture,
    });

    if (result.success) {
      setRoomCode(result.code!);
      setPlayerId(result.playerId!);
      persistSession(result.playerId!, result.code!, playerName);
    } else {
      setError(result.error || 'Failed to join room');
    }
    return result;
  };

  const leaveRoom = async () => {
    await emit('leaveRoom');
    clearGameSession();
    setGameState(null);
    setRoomCode(null);
    setPlayerId(null);
    setError(null);
    setReconnecting(false);
  };

  const setReady = (ready: boolean) => emit('setReady', { ready });
  const startGame = () => emit('startGame');
  const startDealing = () => emit('startDealing');
  const distributeCards = () => emit('distributeCards');
  const drawFromDeck = () => emit('drawFromDeck');
  const pickFromDiscard = () => emit('pickFromDiscard');
  const placeCard = (cardIds: string[]) => emit('placeCard', { cardIds });
  const show = () => emit('show');
  const nextRound = () => emit('nextRound');
  const updateProfilePicture = (profilePicture: string) =>
    emit('updateProfilePicture', { profilePicture });

  return {
    connected,
    reconnecting,
    gameState,
    roomCode,
    playerId,
    error,
    peekRoom,
    createRoom,
    joinRoom,
    leaveRoom,
    setReady,
    startGame,
    startDealing,
    distributeCards,
    drawFromDeck,
    pickFromDiscard,
    placeCard,
    show,
    nextRound,
    updateProfilePicture,
  };
}
