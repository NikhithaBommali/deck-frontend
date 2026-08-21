import {
  Card,
  ClientGameState,
  ClientPlayer,
  ELIMINATION_SCORE,
  MAX_SCORE,
  Rank,
  SHOW_THRESHOLD,
  calculateScore,
} from '../types/game';

export const DEMO_ROOM_CODE = 'DEMO01';

export const DEMO_IDS = {
  player: 'demo-player',
  alex: 'demo-bot-alex',
  sam: 'demo-bot-sam',
} as const;

export type DemoPlayingStep =
  | 'idle'
  | 'bot_alex'
  | 'bot_sam'
  | 'place_sevens'
  | 'draw_after_sevens'
  | 'place_joker'
  | 'draw_after_joker'
  | 'show_round'
  | 'place_fives'
  | 'draw_round2'
  | 'show_round2';

export const DEMO_OPEN_ROUND1: Card = {
  id: 'demo-open-r1',
  suit: 'hearts',
  rank: '7',
};

export const DEMO_OPEN_ROUND2: Card = {
  id: 'demo-open-r2',
  suit: 'diamonds',
  rank: '5',
};

/** Round 1 — score 3 (A + 2 + five zero cards). */
export const DEMO_HAND_ROUND1: Card[] = [
  { id: 'demo-r1-a', suit: 'spades', rank: 'A' },
  { id: 'demo-r1-2', suit: 'clubs', rank: '2' },
  { id: 'demo-r1-7d', suit: 'diamonds', rank: '7' },
  { id: 'demo-r1-7c', suit: 'clubs', rank: '7' },
  { id: 'demo-r1-joker', suit: 'joker', rank: 'J' },
  { id: 'demo-r1-7h', suit: 'hearts', rank: '7' },
  { id: 'demo-r1-7s', suit: 'spades', rank: '7' },
];

/** Round 2 — open card is 5, so all 5s are zero; score 3 again. */
export const DEMO_HAND_ROUND2: Card[] = [
  { id: 'demo-r2-a', suit: 'hearts', rank: 'A' },
  { id: 'demo-r2-2', suit: 'diamonds', rank: '2' },
  { id: 'demo-r2-5d', suit: 'diamonds', rank: '5' },
  { id: 'demo-r2-5c', suit: 'clubs', rank: '5' },
  { id: 'demo-r2-joker', suit: 'joker', rank: 'J' },
  { id: 'demo-r2-5h', suit: 'hearts', rank: '5' },
  { id: 'demo-r2-5s', suit: 'spades', rank: '5' },
];

export const DEMO_DISCARD_START: Card = {
  id: 'demo-discard-k',
  suit: 'spades',
  rank: 'K',
};

export const DEMO_DRAW_ZERO_R1: Card = {
  id: 'demo-draw-r1-7',
  suit: 'diamonds',
  rank: '7',
};

export const DEMO_DRAW_ZERO_R2: Card = {
  id: 'demo-draw-r2-5',
  suit: 'clubs',
  rank: '5',
};

export const DEMO_BOT_HAND_SCORES_R1 = {
  [DEMO_IDS.alex]: 28,
  [DEMO_IDS.sam]: 31,
} as const;

export const DEMO_BOT_HAND_SCORES_R2 = {
  [DEMO_IDS.alex]: 14,
  [DEMO_IDS.sam]: 19,
} as const;

export const DEMO_ROUND1_SCORES = {
  [DEMO_IDS.player]: 0,
  [DEMO_IDS.alex]: 28,
  [DEMO_IDS.sam]: 31,
} as const;

export const DEMO_ROUND2_SCORES = {
  [DEMO_IDS.player]: 0,
  [DEMO_IDS.alex]: 14,
  [DEMO_IDS.sam]: 19,
} as const;

const CARDS_PER_PLAYER = 7;
const PLAYER_COUNT = 3;

export interface DemoRuntime {
  playerName: string;
  phase: ClientGameState['phase'];
  roundNumber: number;
  openCard: Card | null;
  myHand: Card[];
  dealingStep: number;
  cardsRevealed: boolean;
  isMyTurn: boolean;
  playingStep: DemoPlayingStep;
  turnHasPlaced: boolean;
  turnHasDrawn: boolean;
  placedOnDiscard: Card[];
  discardTop: Card | null;
  winnerId: string | null;
  showPlayerId: string | null;
  showPenalty: boolean;
  lastDealtPlayerId: string | null;
  playerReady: boolean;
  playerTotals: Record<string, number>;
  roundScores: Record<string, number[]>;
  hasShown: Record<string, boolean>;
  hint: string;
}

export function createInitialDemoRuntime(playerName: string): DemoRuntime {
  return {
    playerName: playerName.trim() || 'You',
    phase: 'waiting',
    roundNumber: 0,
    openCard: null,
    myHand: [],
    dealingStep: 0,
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
    lastDealtPlayerId: null,
    playerReady: false,
    playerTotals: {
      [DEMO_IDS.player]: 0,
      [DEMO_IDS.alex]: 0,
      [DEMO_IDS.sam]: 0,
    },
    roundScores: {
      [DEMO_IDS.player]: [],
      [DEMO_IDS.alex]: [],
      [DEMO_IDS.sam]: [],
    },
    hasShown: {
      [DEMO_IDS.player]: false,
      [DEMO_IDS.alex]: false,
      [DEMO_IDS.sam]: false,
    },
    hint: 'Welcome! Tap Ready Up so everyone knows you are set to play.',
  };
}

export function getDemoHandForRound(roundNumber: number): Card[] {
  return roundNumber >= 2 ? [...DEMO_HAND_ROUND2] : [...DEMO_HAND_ROUND1];
}

export function getDemoOpenForRound(roundNumber: number): Card {
  return roundNumber >= 2 ? DEMO_OPEN_ROUND2 : DEMO_OPEN_ROUND1;
}

function cardCountAtStep(seatIndex: number, step: number): number {
  if (step <= 0) return 0;
  let count = 0;
  for (let s = 1; s <= step; s++) {
    if ((s - 1) % PLAYER_COUNT === seatIndex) count++;
  }
  return count;
}

function botHandScore(runtime: DemoRuntime, id: string): number {
  const scores =
    runtime.roundNumber >= 2 ? DEMO_BOT_HAND_SCORES_R2 : DEMO_BOT_HAND_SCORES_R1;
  return id === DEMO_IDS.alex
    ? scores[DEMO_IDS.alex]
    : scores[DEMO_IDS.sam];
}

function buildPlayers(runtime: DemoRuntime): ClientPlayer[] {
  const names: Record<string, string> = {
    [DEMO_IDS.player]: runtime.playerName,
    [DEMO_IDS.alex]: 'Alex',
    [DEMO_IDS.sam]: 'Sam',
  };

  const wildRank = runtime.openCard?.rank ?? null;

  return [
    { id: DEMO_IDS.player, seatIndex: 0 },
    { id: DEMO_IDS.alex, seatIndex: 1 },
    { id: DEMO_IDS.sam, seatIndex: 2 },
  ].map(({ id, seatIndex }) => {
    const isPlayer = id === DEMO_IDS.player;
    const cardCount =
      runtime.phase === 'waiting'
        ? 0
        : runtime.phase === 'dealing' && !runtime.cardsRevealed
          ? cardCountAtStep(seatIndex, runtime.dealingStep)
          : isPlayer
            ? runtime.myHand.length
            : CARDS_PER_PLAYER;

    const handScore = isPlayer
      ? calculateScore(runtime.myHand, wildRank)
      : botHandScore(runtime, id);

    const roundScore =
      runtime.phase === 'round-end' || runtime.phase === 'finished'
        ? runtime.roundScores[id]?.[runtime.roundScores[id].length - 1] ?? null
        : null;

    return {
      id,
      name: names[id],
      cardCount,
      score:
        runtime.phase === 'round-end' || runtime.phase === 'finished'
          ? roundScore ?? handScore
          : runtime.cardsRevealed || runtime.phase === 'playing'
            ? handScore
            : runtime.dealingStep >= PLAYER_COUNT * CARDS_PER_PLAYER
              ? handScore
              : 0,
      handScore,
      totalScore: runtime.playerTotals[id] ?? 0,
      roundScores: [...(runtime.roundScores[id] ?? [])],
      lastRoundScore: roundScore,
      isReady: isPlayer ? runtime.playerReady : true,
      hasShown: runtime.hasShown[id] ?? false,
      isEliminated: false,
      isConnected: true,
      profilePicture: '',
      seatIndex,
    };
  });
}

function canShowForStep(runtime: DemoRuntime, handScore: number): boolean {
  if (runtime.phase !== 'playing' || !runtime.isMyTurn || runtime.turnHasPlaced) {
    return false;
  }
  if (handScore >= SHOW_THRESHOLD) return false;
  return (
    runtime.playingStep === 'show_round' || runtime.playingStep === 'show_round2'
  );
}

export function toDemoClientState(runtime: DemoRuntime): ClientGameState {
  const players = buildPlayers(runtime);
  const me = players.find((p) => p.id === DEMO_IDS.player)!;
  const wildRank = runtime.openCard?.rank ?? null;
  const handScore = calculateScore(runtime.myHand, wildRank);
  const dealingTotalSteps = PLAYER_COUNT * CARDS_PER_PLAYER;
  const isDealingComplete = runtime.dealingStep >= dealingTotalSteps;

  const activeScores = players
    .filter((p) => !p.isEliminated)
    .map((p) => p.handScore);
  const hasLowestScore =
    runtime.phase === 'playing' &&
    runtime.isMyTurn &&
    activeScores.every((s) => handScore <= s);

  const mustDrawAfterPlace =
    runtime.isMyTurn &&
    runtime.turnHasPlaced &&
    !runtime.turnHasDrawn &&
    (runtime.playingStep === 'draw_after_sevens' ||
      runtime.playingStep === 'draw_after_joker' ||
      runtime.playingStep === 'draw_round2');

  const currentTurnId = runtime.isMyTurn
    ? DEMO_IDS.player
    : runtime.playingStep === 'bot_alex'
      ? DEMO_IDS.alex
      : runtime.playingStep === 'bot_sam'
        ? DEMO_IDS.sam
        : null;

  return {
    roomId: 'demo-room',
    phase: runtime.phase,
    players,
    myHand: runtime.myHand,
    myId: DEMO_IDS.player,
    openCard: runtime.openCard,
    wildRank,
    discardTop: runtime.discardTop,
    currentTurnPlayerId: currentTurnId,
    isMyTurn: runtime.isMyTurn,
    hasPlacedThisTurn: runtime.turnHasPlaced,
    mustDrawAfterPlace,
    hasDrawnThisTurn: runtime.turnHasDrawn,
    canPickFromDiscard: false,
    pickableDiscardCard: null,
    myPlacedOnDiscard: runtime.placedOnDiscard,
    hasLowestScore,
    canShow: canShowForStep(runtime, handScore),
    myHandScore: handScore,
    myTotalScore: me.totalScore,
    maxScore: MAX_SCORE,
    eliminationScore: ELIMINATION_SCORE,
    showThreshold: SHOW_THRESHOLD,
    roundNumber: runtime.roundNumber,
    winnerId: runtime.winnerId,
    showPlayerId: runtime.showPlayerId,
    showPenalty: runtime.showPenalty,
    hostId: DEMO_IDS.player,
    cardsRevealed: runtime.cardsRevealed,
    dealingStep: runtime.dealingStep,
    dealingTotalSteps,
    isDealingComplete,
    lastDealtPlayerId: runtime.lastDealtPlayerId,
    deckRemaining: 24,
    activePlayerCount: PLAYER_COUNT,
  };
}

export function getDealtHandAtStep(step: number, roundNumber: number): Card[] {
  if (step <= 0) return [];
  const hand = getDemoHandForRound(roundNumber);
  const order = [DEMO_IDS.player, DEMO_IDS.alex, DEMO_IDS.sam] as const;
  let playerCount = 0;

  for (let i = 0; i < step; i++) {
    if (order[i % order.length] === DEMO_IDS.player) playerCount++;
  }

  return hand.slice(0, playerCount);
}

export function getLastDealtPlayerId(step: number): string | null {
  if (step <= 0) return null;
  const order = [DEMO_IDS.player, DEMO_IDS.alex, DEMO_IDS.sam];
  return order[(step - 1) % order.length];
}

export function isZeroGroupPlaced(cards: Card[], wildRank: Rank | null): boolean {
  return cards.every(
    (c) => c.suit === 'joker' || (wildRank !== null && c.rank === wildRank)
  );
}

export function getSevenIds(hand: Card[]): string[] {
  return hand.filter((c) => c.rank === '7').map((c) => c.id);
}

export function getFiveIds(hand: Card[]): string[] {
  return hand.filter((c) => c.rank === '5').map((c) => c.id);
}

export function getJokerIds(hand: Card[]): string[] {
  return hand.filter((c) => c.suit === 'joker').map((c) => c.id);
}
