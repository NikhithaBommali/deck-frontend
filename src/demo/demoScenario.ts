import {
  Card,
  ClientGameState,
  ClientPlayer,
  ELIMINATION_SCORE,
  MAX_SCORE,
  SHOW_THRESHOLD,
  calculateScore,
} from '../types/game';

export const DEMO_ROOM_CODE = 'DEMO01';

export const DEMO_IDS = {
  player: 'demo-player',
  alex: 'demo-bot-alex',
  sam: 'demo-bot-sam',
} as const;

export const DEMO_OPEN_CARD: Card = {
  id: 'demo-open',
  suit: 'hearts',
  rank: '7',
};

export const DEMO_DISCARD_TOP: Card = {
  id: 'demo-discard-k',
  suit: 'spades',
  rank: 'K',
};

/** Full dealt hand — score 3 with wild rank 7 (A + 2 + five zeros). */
export const DEMO_PLAYER_HAND: Card[] = [
  { id: 'demo-p-a', suit: 'spades', rank: 'A' },
  { id: 'demo-p-2', suit: 'clubs', rank: '2' },
  { id: 'demo-p-7d', suit: 'diamonds', rank: '7' },
  { id: 'demo-p-7c', suit: 'clubs', rank: '7' },
  { id: 'demo-p-joker', suit: 'joker', rank: 'J' },
  { id: 'demo-p-7h', suit: 'hearts', rank: '7' },
  { id: 'demo-p-7s', suit: 'spades', rank: '7' },
];

export const DEMO_DRAW_CARD: Card = {
  id: 'demo-draw-7',
  suit: 'diamonds',
  rank: '7',
};

export const DEMO_BOT_SCORES = {
  [DEMO_IDS.alex]: 28,
  [DEMO_IDS.sam]: 31,
} as const;

const CARDS_PER_PLAYER = 7;
const PLAYER_COUNT = 3;

export interface DemoRuntime {
  playerName: string;
  phase: ClientGameState['phase'];
  roundNumber: number;
  myHand: Card[];
  dealingStep: number;
  cardsRevealed: boolean;
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
    myHand: [],
    dealingStep: 0,
    cardsRevealed: false,
    turnHasPlaced: false,
    turnHasDrawn: false,
    placedOnDiscard: [],
    discardTop: DEMO_DISCARD_TOP,
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
    hint: 'Tap Ready Up, then Play to start the demo game.',
  };
}

function cardCountAtStep(seatIndex: number, step: number): number {
  if (step <= 0) return 0;
  let count = 0;
  for (let s = 1; s <= step; s++) {
    if ((s - 1) % PLAYER_COUNT === seatIndex) count++;
  }
  return count;
}

function buildPlayers(runtime: DemoRuntime): ClientPlayer[] {
  const names: Record<string, string> = {
    [DEMO_IDS.player]: runtime.playerName,
    [DEMO_IDS.alex]: 'Alex',
    [DEMO_IDS.sam]: 'Sam',
  };

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
      ? calculateScore(runtime.myHand, DEMO_OPEN_CARD.rank)
      : id === DEMO_IDS.alex
        ? DEMO_BOT_SCORES[DEMO_IDS.alex]
        : DEMO_BOT_SCORES[DEMO_IDS.sam];

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

export function toDemoClientState(runtime: DemoRuntime): ClientGameState {
  const players = buildPlayers(runtime);
  const me = players.find((p) => p.id === DEMO_IDS.player)!;
  const handScore = calculateScore(runtime.myHand, DEMO_OPEN_CARD.rank);
  const dealingTotalSteps = PLAYER_COUNT * CARDS_PER_PLAYER;
  const isDealingComplete = runtime.dealingStep >= dealingTotalSteps;

  const activeScores = players
    .filter((p) => !p.isEliminated)
    .map((p) => p.handScore);
  const hasLowestScore =
    runtime.phase === 'playing' &&
    activeScores.every((s) => handScore <= s);

  const isMyTurn = runtime.phase === 'playing';
  const mustDrawAfterPlace =
    isMyTurn &&
    runtime.turnHasPlaced &&
    !runtime.turnHasDrawn &&
    runtime.placedOnDiscard.length > 0 &&
    runtime.placedOnDiscard[0].rank !== runtime.discardTop?.rank;

  return {
    roomId: 'demo-room',
    phase: runtime.phase,
    players,
    myHand: runtime.myHand,
    myId: DEMO_IDS.player,
    openCard: runtime.phase === 'waiting' ? null : DEMO_OPEN_CARD,
    wildRank: runtime.phase === 'waiting' ? null : DEMO_OPEN_CARD.rank,
    discardTop: runtime.discardTop,
    currentTurnPlayerId: isMyTurn ? DEMO_IDS.player : null,
    isMyTurn,
    hasPlacedThisTurn: runtime.turnHasPlaced,
    mustDrawAfterPlace,
    hasDrawnThisTurn: runtime.turnHasDrawn,
    canPickFromDiscard: false,
    pickableDiscardCard: null,
    myPlacedOnDiscard: runtime.placedOnDiscard,
    hasLowestScore,
    canShow:
      isMyTurn &&
      !runtime.turnHasPlaced &&
      handScore < SHOW_THRESHOLD,
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

export function getDealtHandAtStep(step: number): Card[] {
  if (step <= 0) return [];
  const order = [
    DEMO_IDS.player,
    DEMO_IDS.alex,
    DEMO_IDS.sam,
  ] as const;
  const counts = { [DEMO_IDS.player]: 0, [DEMO_IDS.alex]: 0, [DEMO_IDS.sam]: 0 };

  for (let i = 0; i < step; i++) {
    const id = order[i % order.length];
    counts[id]++;
  }

  if (counts[DEMO_IDS.player] === 0) return [];
  return DEMO_PLAYER_HAND.slice(0, counts[DEMO_IDS.player]);
}

export function getLastDealtPlayerId(step: number): string | null {
  if (step <= 0) return null;
  const order = [DEMO_IDS.player, DEMO_IDS.alex, DEMO_IDS.sam];
  return order[(step - 1) % order.length];
}
