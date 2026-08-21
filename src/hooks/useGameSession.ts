import { useSocket } from './useSocket';
import { useDemoGame } from './useDemoGame';

export function useGameSession() {
  const socket = useSocket();
  const demo = useDemoGame();

  if (demo.isActive) {
    return {
      ...demo,
      isDemo: true as const,
      startDemo: demo.startDemo,
    };
  }

  return {
    ...socket,
    isDemo: false as const,
    demoHint: null,
    startDemo: demo.startDemo,
  };
}
