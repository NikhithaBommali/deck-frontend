import { useCallback, useEffect, useRef, useState } from 'react';
import { loadStoredProfile } from '../api/profile';
import { ClientGameState } from '../types/game';
import {
  DEMO_DISCARD_TOP,
  DEMO_DRAW_CARD,
  DEMO_IDS,
  DEMO_PLAYER_HAND,
  DEMO_ROOM_CODE,
  DemoRuntime,
  createInitialDemoRuntime,
  getDealtHandAtStep,
  getLastDealtPlayerId,
  toDemoClientState,
} from '../demo/demoScenario';
import { RoomPeekResult } from '../types/room';

const DEAL_INTERVAL_MS = 480;

export function useDemoGame() {
  const [isActive, setIsActive] = useState(false);
  const [gameState, setGameState] = useState<ClientGameState | null>(null);
  const [demoHint, setDemoHint] = useState<string | null>(null);
  const runtimeRef = useRef<DemoRuntime | null>(null);
  const dealingTimerRef = useRef<number | null>(null);

  const syncState = useCallback((runtime: DemoRuntime) => {
    runtimeRef.current = runtime;
    setDemoHint(runtime.hint);
    setGameState(toDemoClientState(runtime));
  }, []);

  const clearDealingTimer = useCallback(() => {
    if (dealingTimerRef.current !== null) {
      window.clearInterval(dealingTimerRef.current);
      dealingTimerRef.current = null;
    }
  }, []);

  const startDemo = useCallback(
    (playerName?: string) => {
      clearDealingTimer();
      const stored = loadStoredProfile();
      const name = playerName?.trim() || stored.name.trim() || 'You';
      const runtime = createInitialDemoRuntime(name);
      setIsActive(true);
      syncState(runtime);
    },
    [clearDealingTimer, syncState]
  );

  const leaveRoom = useCallback(async () => {
    clearDealingTimer();
    runtimeRef.current = null;
    setIsActive(false);
    setGameState(null);
    setDemoHint(null);
  }, [clearDealingTimer]);

  useEffect(() => () => clearDealingTimer(), [clearDealingTimer]);

  const runDealingStep = useCallback(() => {
    const runtime = runtimeRef.current;
    if (!runtime || runtime.phase !== 'dealing') return;

    const totalSteps = 21;
    if (runtime.dealingStep >= totalSteps) {
      clearDealingTimer();
      syncState({
        ...runtime,
        hint: 'All cards dealt! Tap Start Round to begin playing.',
      });
      return;
    }

    const nextStep = runtime.dealingStep + 1;
    syncState({
      ...runtime,
      dealingStep: nextStep,
      myHand: getDealtHandAtStep(nextStep),
      lastDealtPlayerId: getLastDealtPlayerId(nextStep),
      hint:
        nextStep >= totalSteps
          ? 'All cards dealt! Tap Start Round to begin playing.'
          : 'Watch the cards fly from the deck to each player...',
    });
  }, [clearDealingTimer, syncState]);

  const noopAsync = useCallback(
    () => Promise.resolve({ success: true } as const),
    []
  );

  const peekRoom = useCallback(
    async (): Promise<RoomPeekResult> => ({
      success: true,
      exists: false,
      canJoin: false,
    }),
    []
  );

  const createRoom = noopAsync;
  const joinRoom = noopAsync;

  const setReady = useCallback(
    async (ready: boolean) => {
      const runtime = runtimeRef.current;
      if (!runtime || runtime.phase !== 'waiting') return;
      syncState({
        ...runtime,
        playerReady: ready,
        hint: ready
          ? 'Great! Tap Play to start dealing.'
          : 'Tap Ready Up, then Play to start the demo game.',
      });
    },
    [syncState]
  );

  const startGame = useCallback(async () => {
    const runtime = runtimeRef.current;
    if (!runtime || runtime.phase !== 'waiting' || !runtime.playerReady) return;

    syncState({
      ...runtime,
      phase: 'dealing',
      roundNumber: 1,
      dealingStep: 0,
      myHand: [],
      cardsRevealed: false,
      hint: 'Tap Distribute Cards to deal 7 cards to each player.',
    });
  }, [syncState]);

  const startDealing = useCallback(async () => {
    const runtime = runtimeRef.current;
    if (!runtime || runtime.phase !== 'dealing' || runtime.dealingStep > 0) return;

    clearDealingTimer();
    syncState({
      ...runtime,
      hint: 'Watch the cards fly from the deck to each player...',
    });

    dealingTimerRef.current = window.setInterval(runDealingStep, DEAL_INTERVAL_MS);
  }, [clearDealingTimer, runDealingStep, syncState]);

  const distributeCards = useCallback(async () => {
    const runtime = runtimeRef.current;
    if (!runtime || runtime.phase !== 'dealing' || runtime.dealingStep < 21) return;

    clearDealingTimer();
    syncState({
      ...runtime,
      phase: 'playing',
      cardsRevealed: true,
      myHand: [...DEMO_PLAYER_HAND],
      turnHasPlaced: false,
      turnHasDrawn: false,
      placedOnDiscard: [],
      discardTop: DEMO_DISCARD_TOP,
      hint:
        'Your hand score is 3 — the lowest at the table! Try placing your 7s (zero cards), or tap Show to win the round.',
    });
  }, [clearDealingTimer, syncState]);

  const placeCard = useCallback(
    async (cardIds: string[]) => {
      const runtime = runtimeRef.current;
      if (!runtime || runtime.phase !== 'playing' || runtime.turnHasPlaced) return;

      const placing = runtime.myHand.filter((c) => cardIds.includes(c.id));
      if (placing.length === 0) return;

      const firstRank = placing[0].rank;
      if (!placing.every((c) => c.rank === firstRank)) return;

      const remaining = runtime.myHand.filter((c) => !cardIds.includes(c.id));
      const newDiscard = placing[placing.length - 1];
      const matchedDiscard = newDiscard.rank === runtime.discardTop?.rank;

      syncState({
        ...runtime,
        myHand: remaining,
        placedOnDiscard: placing,
        turnHasPlaced: true,
        turnHasDrawn: matchedDiscard,
        discardTop: newDiscard,
        hint: matchedDiscard
          ? 'Nice! That matched the discard — no draw needed. Tap Show to finish the round with 0 points!'
          : 'Nice! Those zero cards are off your hand. Now draw one card from the deck.',
      });
    },
    [syncState]
  );

  const drawFromDeck = useCallback(async () => {
    const runtime = runtimeRef.current;
    if (!runtime || runtime.phase !== 'playing') return;
    if (!runtime.turnHasPlaced || runtime.turnHasDrawn) return;

    syncState({
      ...runtime,
      myHand: [...runtime.myHand, DEMO_DRAW_CARD],
      turnHasPlaced: false,
      turnHasDrawn: false,
      placedOnDiscard: [],
      hint: 'Perfect! Tap Show to end the round with 0 points — you have the lowest score.',
    });
  }, [syncState]);

  const pickFromDiscard = useCallback(async () => {}, []);

  const show = useCallback(async () => {
    const runtime = runtimeRef.current;
    if (!runtime || runtime.phase !== 'playing' || runtime.turnHasPlaced) return;

    const roundScores = {
      [DEMO_IDS.player]: 0,
      [DEMO_IDS.alex]: 28,
      [DEMO_IDS.sam]: 31,
    };

    syncState({
      ...runtime,
      phase: 'round-end',
      winnerId: DEMO_IDS.player,
      showPlayerId: DEMO_IDS.player,
      showPenalty: false,
      playerTotals: { ...roundScores },
      roundScores: {
        [DEMO_IDS.player]: [0],
        [DEMO_IDS.alex]: [28],
        [DEMO_IDS.sam]: [31],
      },
      hasShown: {
        ...runtime.hasShown,
        [DEMO_IDS.player]: true,
      },
      hint: 'You showed with the lowest score — 0 points this round! Continue to see the final results.',
    });
  }, [syncState]);

  const nextRound = useCallback(async () => {
    const runtime = runtimeRef.current;
    if (!runtime || runtime.phase !== 'round-end') return;

    syncState({
      ...runtime,
      phase: 'finished',
      winnerId: DEMO_IDS.player,
      hint: 'Demo complete — you win with the lowest total score!',
    });
  }, [syncState]);

  const updateProfilePicture = useCallback(async () => {}, []);

  return {
    isActive,
    demoHint,
    connected: true,
    reconnecting: false,
    gameState,
    roomCode: isActive ? DEMO_ROOM_CODE : null,
    playerId: isActive ? DEMO_IDS.player : null,
    error: null,
    startDemo,
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
