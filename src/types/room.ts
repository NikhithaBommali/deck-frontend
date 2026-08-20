import { GamePhase } from './game';

export type RoomJoinBlockReason =
  | 'NOT_FOUND'
  | 'GAME_IN_PROGRESS'
  | 'ROOM_FULL'
  | 'GAME_FINISHED';

export interface RoomPeekResult {
  success: boolean;
  exists: boolean;
  code?: string;
  phase?: GamePhase;
  hostName?: string;
  playerCount?: number;
  maxPlayers?: number;
  roundNumber?: number;
  canJoin?: boolean;
  reason?: RoomJoinBlockReason;
  error?: string;
}

export interface JoinRoomResult {
  success: boolean;
  roomId?: string;
  code?: string;
  playerId?: string;
  error?: string;
  reason?: RoomJoinBlockReason | 'JOIN_FAILED';
}
