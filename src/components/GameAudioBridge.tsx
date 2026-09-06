import { ClientGameState } from '../types/game';
import { useGameAudioEvents } from '../hooks/useGameAudioEvents';

interface GameAudioBridgeProps {
  gameState: ClientGameState | null;
}

export function GameAudioBridge({ gameState }: GameAudioBridgeProps) {
  useGameAudioEvents(gameState);
  return null;
}
