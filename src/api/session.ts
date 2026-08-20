export const GAME_SESSION_KEY = 'deck-score-session';

export interface GameSession {
  playerId: string;
  roomCode: string;
  playerName: string;
}

export function saveGameSession(session: GameSession): void {
  localStorage.setItem(GAME_SESSION_KEY, JSON.stringify(session));
}

export function loadGameSession(): GameSession | null {
  try {
    const raw = localStorage.getItem(GAME_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameSession;
    if (!parsed.playerId || !parsed.roomCode) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearGameSession(): void {
  localStorage.removeItem(GAME_SESSION_KEY);
}
