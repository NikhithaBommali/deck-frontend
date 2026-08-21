import { useCallback, useEffect, useRef, useState } from 'react';
import { loadStoredProfile } from '../api/profile';
import { ClientGameState } from '../types/game';
import {
  DEMO_DISCARD_START,
  DEMO_DRAW_ZERO_R1,
  DEMO_DRAW_ZERO_R2,
  DEMO_IDS,
  DEMO_ROUND1_SCORES,
  DEMO_ROUND2_SCORES,
  DEMO_ROOM_CODE,
  DemoRuntime,
  createInitialDemoRuntime,
  getDealtHandAtStep,
  getDemoHandForRound,
  getDemoOpenForRound,
  getFiveIds,
  getJokerIds,
  getLastDealtPlayerId,
  getSevenIds,
  toDemoClientState,
} from '../demo/demoScenario';
import { RoomPeekResult } from '../types/room';

const DEAL_INTERVAL_MS = 420;
const BOT_TURN_MS = 1800;

function appendRoundScore(
  existing: number[],
  playerId: string,
  roundNumber: number
): number[] {
  const score =
    roundNumber >= 2
      ? DEMO_ROUND2_SCORES[playerId as keyof typeof DEMO_ROUND2_SCORES]
      : DEMO_ROUND1_SCORES[playerId as keyof typeof DEMO_ROUND1_SCORES];
  return [...existing, score];
}

export function useDemoGame() {
  const [isActive, setIsActive] = useState(false);
  const [gameState, setGameState] = useState<ClientGameState | null>(null);
  const [demoHint, setDemoHint] = useState<string | null>(null);
  const runtimeRef = useRef<DemoRuntime | null>(null);
  const dealingTimerRef = useRef<number | null>(null);
  const botTimerRef = useRef<number | null>(null);

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

  const clearBotTimer = useCallback(() => {
    if (botTimerRef.current !== null) {
      window.clearTimeout(botTimerRef.current);
      botTimerRef.current = null;
    }
  }, []);

  const clearAllTimers = useCallback(() => {
    clearDealingTimer();
    clearBotTimer();
  }, [clearDealingTimer, clearBotTimer]);

  const scheduleBotTurns = useCallback(() => {
    clearBotTimer();
      botTimerRef.current = window.setTimeout(() => {
        const current = runtimeRef.current;
        if (!current || current.phase !== 'playing') return;

        syncState({
          ...current,
          playingStep: 'bot_sam',
          isMyTurn: false,
          hint: "Sam's turn — players take turns placing cards and drawing.",
        });

        botTimerRef.current = window.setTimeout(() => {
          const latest = runtimeRef.current;
          if (!latest || latest.phase !== 'playing') return;

          const isRound2 = latest.roundNumber >= 2;
          syncState({
            ...latest,
            playingStep: isRound2 ? 'place_fives' : 'place_sevens',
            isMyTurn: true,
            hint: isRound2
              ? 'Your turn! The open card is 5 — all 5s score 0. Tap the group of 5s to Place them.'
              : 'Your turn! The open card is 7 — all 7s score 0 (purple badge). Tap the group of 7s to Place them.',
          });
        }, BOT_TURN_MS);
    }, BOT_TURN_MS);
  }, [clearBotTimer, syncState]);

  const startPlayingPhase = useCallback(
    (runtime: DemoRuntime) => {
      const hand = getDemoHandForRound(runtime.roundNumber);
      syncState({
        ...runtime,
        phase: 'playing',
        cardsRevealed: true,
        myHand: hand,
        isMyTurn: false,
        playingStep: 'bot_alex',
        turnHasPlaced: false,
        turnHasDrawn: false,
        placedOnDiscard: [],
        discardTop: DEMO_DISCARD_START,
        hint:
          runtime.roundNumber >= 2
            ? 'Round 2! Alex is playing first — watch how turns rotate around the table.'
            : 'Round 1 begins! Alex plays first — each player takes a turn to Place and Draw.',
      });
      scheduleBotTurns();
    },
    [scheduleBotTurns, syncState]
  );

  const startDemo = useCallback(
    (playerName?: string) => {
      clearAllTimers();
      const stored = loadStoredProfile();
      const name = playerName?.trim() || stored.name.trim() || 'You';
      const runtime = createInitialDemoRuntime(name);
      setIsActive(true);
      syncState(runtime);
    },
    [clearAllTimers, syncState]
  );

  const leaveRoom = useCallback(async () => {
    clearAllTimers();
    runtimeRef.current = null;
    setIsActive(false);
    setGameState(null);
    setDemoHint(null);
  }, [clearAllTimers]);

  useEffect(() => clearAllTimers(), [clearAllTimers]);

  const runDealingStep = useCallback(() => {
    const runtime = runtimeRef.current;
    if (!runtime || runtime.phase !== 'dealing') return;

    const totalSteps = 21;
    if (runtime.dealingStep >= totalSteps) {
      clearDealingTimer();
      syncState({
        ...runtime,
        hint: 'All 7 cards dealt to each player! Tap Start Round when you are ready.',
      });
      return;
    }

    const nextStep = runtime.dealingStep + 1;
    syncState({
      ...runtime,
      dealingStep: nextStep,
      myHand: getDealtHandAtStep(nextStep, runtime.roundNumber),
      lastDealtPlayerId: getLastDealtPlayerId(nextStep),
      hint:
        nextStep >= totalSteps
          ? 'All 7 cards dealt to each player! Tap Start Round when you are ready.'
          : `Dealing card ${nextStep} of ${totalSteps} — cards fly from the deck to each seat.`,
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
          ? 'You are ready! Alex and Sam are too. Tap Play to start Round 1.'
          : 'Welcome! Tap Ready Up so everyone knows you are set to play.',
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
      openCard: getDemoOpenForRound(1),
      dealingStep: 0,
      myHand: [],
      cardsRevealed: false,
      hint: 'Round 1 — the open card will be 7 (zero score). Tap Distribute Cards to deal.',
    });
  }, [syncState]);

  const startDealing = useCallback(async () => {
    const runtime = runtimeRef.current;
    if (!runtime || runtime.phase !== 'dealing' || runtime.dealingStep > 0) return;

    clearDealingTimer();
    syncState({
      ...runtime,
      hint: 'Dealing 7 cards to each player — watch them arrive one by one.',
    });

    dealingTimerRef.current = window.setInterval(runDealingStep, DEAL_INTERVAL_MS);
  }, [clearDealingTimer, runDealingStep, syncState]);

  const distributeCards = useCallback(async () => {
    const runtime = runtimeRef.current;
    if (!runtime || runtime.phase !== 'dealing' || runtime.dealingStep < 21) return;

    clearDealingTimer();
    startPlayingPhase(runtime);
  }, [clearDealingTimer, startPlayingPhase]);

  const placeCard = useCallback(
    async (cardIds: string[]) => {
      const runtime = runtimeRef.current;
      if (!runtime || runtime.phase !== 'playing' || !runtime.isMyTurn) return;
      if (runtime.turnHasPlaced) return;

      const placing = runtime.myHand.filter((c) => cardIds.includes(c.id));
      if (placing.length === 0) return;

      const firstRank = placing[0].rank;
      if (!placing.every((c) => c.rank === firstRank)) return;

      if (runtime.playingStep === 'place_sevens') {
        const sevenIds = getSevenIds(runtime.myHand);
        if (!cardIds.every((id) => sevenIds.includes(id)) || cardIds.length !== sevenIds.length) {
          return;
        }
      } else if (runtime.playingStep === 'place_joker') {
        const jokerIds = getJokerIds(runtime.myHand);
        if (cardIds.length !== 1 || !jokerIds.includes(cardIds[0])) return;
      } else if (runtime.playingStep === 'place_fives') {
        const fiveIds = getFiveIds(runtime.myHand);
        if (!cardIds.every((id) => fiveIds.includes(id)) || cardIds.length !== fiveIds.length) {
          return;
        }
      } else {
        return;
      }

      const remaining = runtime.myHand.filter((c) => !cardIds.includes(c.id));
      const newDiscard = placing[placing.length - 1];

      if (runtime.playingStep === 'place_sevens') {
        syncState({
          ...runtime,
          myHand: remaining,
          placedOnDiscard: placing,
          turnHasPlaced: true,
          turnHasDrawn: false,
          discardTop: newDiscard,
          playingStep: 'draw_after_sevens',
          hint: 'Great! Zero-score cards cleared. Now tap the deck to Draw one card — every turn ends with a draw.',
        });
        return;
      }

      if (runtime.playingStep === 'place_joker') {
        syncState({
          ...runtime,
          myHand: remaining,
          placedOnDiscard: placing,
          turnHasPlaced: true,
          turnHasDrawn: false,
          discardTop: newDiscard,
          playingStep: 'draw_after_joker',
          hint: 'Joker placed! Draw one more card from the deck to complete your turn.',
        });
        return;
      }

      if (runtime.playingStep === 'place_fives') {
        syncState({
          ...runtime,
          myHand: remaining,
          placedOnDiscard: placing,
          turnHasPlaced: true,
          turnHasDrawn: false,
          discardTop: newDiscard,
          playingStep: 'draw_round2',
          hint: 'Nice! Now draw from the deck, then Show to finish Round 2.',
        });
      }
    },
    [syncState]
  );

  const drawFromDeck = useCallback(async () => {
    const runtime = runtimeRef.current;
    if (!runtime || runtime.phase !== 'playing' || !runtime.isMyTurn) return;
    if (!runtime.turnHasPlaced) return;

    if (runtime.playingStep === 'draw_after_sevens') {
      syncState({
        ...runtime,
        myHand: [...runtime.myHand, DEMO_DRAW_ZERO_R1],
        turnHasPlaced: false,
        turnHasDrawn: false,
        placedOnDiscard: [],
        playingStep: 'place_joker',
        hint: 'You drew a 7 — still 0 points! Tap the Joker to Place it (jokers always score 0).',
      });
      return;
    }

    if (runtime.playingStep === 'draw_after_joker') {
      syncState({
        ...runtime,
        myHand: [...runtime.myHand, DEMO_DRAW_ZERO_R1],
        turnHasPlaced: false,
        turnHasDrawn: false,
        placedOnDiscard: [],
        playingStep: 'show_round',
        hint: 'Your hand score is 3 — the lowest at the table! Tap Show to end the round with 0 points.',
      });
      return;
    }

    if (runtime.playingStep === 'draw_round2') {
      syncState({
        ...runtime,
        myHand: [...runtime.myHand, DEMO_DRAW_ZERO_R2],
        turnHasPlaced: false,
        turnHasDrawn: false,
        placedOnDiscard: [],
        playingStep: 'show_round2',
        hint: 'Hand score is 3 again — lowest at the table. Tap Show to win Round 2!',
      });
    }
  }, [syncState]);

  const pickFromDiscard = useCallback(async () => {}, []);

  const applyRoundEnd = useCallback(
    (runtime: DemoRuntime) => {
      const roundNumber = runtime.roundNumber;
      const roundScoreMap =
        roundNumber >= 2 ? DEMO_ROUND2_SCORES : DEMO_ROUND1_SCORES;

      const playerTotals = {
        [DEMO_IDS.player]:
          (runtime.playerTotals[DEMO_IDS.player] ?? 0) + roundScoreMap[DEMO_IDS.player],
        [DEMO_IDS.alex]:
          (runtime.playerTotals[DEMO_IDS.alex] ?? 0) + roundScoreMap[DEMO_IDS.alex],
        [DEMO_IDS.sam]:
          (runtime.playerTotals[DEMO_IDS.sam] ?? 0) + roundScoreMap[DEMO_IDS.sam],
      };

      return {
        playerTotals,
        roundScores: {
          [DEMO_IDS.player]: appendRoundScore(
            runtime.roundScores[DEMO_IDS.player] ?? [],
            DEMO_IDS.player,
            roundNumber
          ),
          [DEMO_IDS.alex]: appendRoundScore(
            runtime.roundScores[DEMO_IDS.alex] ?? [],
            DEMO_IDS.alex,
            roundNumber
          ),
          [DEMO_IDS.sam]: appendRoundScore(
            runtime.roundScores[DEMO_IDS.sam] ?? [],
            DEMO_IDS.sam,
            roundNumber
          ),
        },
      };
    },
    []
  );

  const show = useCallback(async () => {
    const runtime = runtimeRef.current;
    if (!runtime || runtime.phase !== 'playing' || !runtime.isMyTurn) return;
    if (runtime.turnHasPlaced) return;
    if (runtime.playingStep !== 'show_round' && runtime.playingStep !== 'show_round2') {
      return;
    }

    clearBotTimer();
    const { playerTotals, roundScores } = applyRoundEnd(runtime);

    syncState({
      ...runtime,
      phase: 'round-end',
      winnerId: DEMO_IDS.player,
      showPlayerId: DEMO_IDS.player,
      showPenalty: false,
      playerTotals,
      roundScores,
      hasShown: {
        ...runtime.hasShown,
        [DEMO_IDS.player]: true,
      },
      playingStep: 'idle',
      hint:
        runtime.roundNumber >= 2
          ? 'Round 2 complete! Check the score table — lowest total wins the game.'
          : 'Round 1 complete with 0 points! Tap Continue to deal Round 2.',
    });
  }, [applyRoundEnd, clearBotTimer, syncState]);

  const nextRound = useCallback(async () => {
    const runtime = runtimeRef.current;
    if (!runtime || runtime.phase !== 'round-end') return;

    if (runtime.roundNumber >= 2) {
      syncState({
        ...runtime,
        phase: 'finished',
        winnerId: DEMO_IDS.player,
        hint: 'Demo complete — you win with the lowest total score!',
      });
      return;
    }

    syncState({
      ...runtime,
      phase: 'dealing',
      roundNumber: 2,
      openCard: getDemoOpenForRound(2),
      dealingStep: 0,
      myHand: [],
      cardsRevealed: false,
      isMyTurn: false,
      playingStep: 'idle',
      turnHasPlaced: false,
      turnHasDrawn: false,
      placedOnDiscard: [],
      discardTop: DEMO_DISCARD_START,
      winnerId: null,
      showPlayerId: null,
      showPenalty: false,
      hint: 'Round 2 — open card is now 5. Tap Distribute Cards to deal again.',
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
