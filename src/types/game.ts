export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades' | 'joker';

export type Rank =
  | 'A'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'J'
  | 'Q'
  | 'K';

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
}

export type GamePhase = 'waiting' | 'dealing' | 'playing' | 'round-end' | 'finished';

export interface ClientPlayer {
  id: string;
  name: string;
  cardCount: number;
  score: number;
  handScore: number;
  totalScore: number;
  roundScores: number[];
  lastRoundScore: number | null;
  isReady: boolean;
  hasShown: boolean;
  isEliminated: boolean;
  isConnected: boolean;
  profilePicture: string;
  seatIndex: number;
}

export interface ClientGameState {
  roomId: string;
  phase: GamePhase;
  players: ClientPlayer[];
  myHand: Card[];
  myId: string;
  openCard: Card | null;
  wildRank: Rank | null;
  discardTop: Card | null;
  currentTurnPlayerId: string | null;
  isMyTurn: boolean;
  hasPlacedThisTurn: boolean;
  mustDrawAfterPlace: boolean;
  hasDrawnThisTurn: boolean;
  canPickFromDiscard: boolean;
  pickableDiscardCard: Card | null;
  myPlacedOnDiscard: Card[];
  hasLowestScore: boolean;
  canShow: boolean;
  myHandScore: number;
  myTotalScore: number;
  maxScore: number;
  eliminationScore: number;
  showThreshold: number;
  roundNumber: number;
  winnerId: string | null;
  showPlayerId: string | null;
  showPenalty: boolean;
  hostId: string;
  cardsRevealed: boolean;
  dealingStep: number;
  dealingTotalSteps: number;
  isDealingComplete: boolean;
  lastDealtPlayerId: string | null;
  deckRemaining: number;
  activePlayerCount: number;
}

export const MAX_SCORE = 51;
export const ELIMINATION_SCORE = 51;
export const SHOW_THRESHOLD = 4;

/** Reference target for the score bar — actual hand scores may exceed this. */
export function getScoreBarPercent(score: number, maxScore: number): number {
  return Math.min(100, (score / maxScore) * 100);
}

export function getScoreColorClass(
  score: number,
  maxScore: number,
  showThreshold: number
): string {
  if (score === 0) return 'text-green-400';
  if (score < showThreshold) return 'text-yellow-400';
  if (score > maxScore) return 'text-red-400';
  if (score <= maxScore / 2) return 'text-yellow-400';
  return 'text-red-400';
}

export function getScoreBarFillClass(
  score: number,
  maxScore: number
): string {
  if (score > maxScore || score >= maxScore * 0.7) return 'bg-red-500';
  if (score === 0) return 'bg-green-500';
  return 'bg-yellow-500';
}

export const RANK_VALUES: Record<Rank, number> = {
  A: 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  J: 10,
  Q: 10,
  K: 10,
};

/** Joker = 0. Open-card rank = 0. Jack (J suit card) = 10. */
export function isZeroScoreCard(card: Card, openRank: Rank | null): boolean {
  if (card.suit === 'joker') return true;
  if (openRank && card.rank === openRank) return true;
  return false;
}

export function getCardScore(card: Card, openRank: Rank | null): number {
  if (isZeroScoreCard(card, openRank)) return 0;
  return RANK_VALUES[card.rank];
}

export function calculateScore(hand: Card[], openRank: Rank | null): number {
  return hand.reduce((sum, c) => sum + getCardScore(c, openRank), 0);
}

export function cardMatchesDiscardTop(
  card: Card,
  discardTop: Card | null
): boolean {
  if (!discardTop) return false;
  return card.rank === discardTop.rank;
}

export function cardBatchKey(card: Card): string {
  if (card.suit === 'joker') return 'joker';
  return card.rank;
}

export interface RankGroup {
  key: string;
  label: string;
  cards: Card[];
}

export function groupHandByRank(hand: Card[]): RankGroup[] {
  const map = new Map<string, Card[]>();
  for (const card of hand) {
    const key = cardBatchKey(card);
    const group = map.get(key) ?? [];
    group.push(card);
    map.set(key, group);
  }
  return Array.from(map.entries()).map(([key, cards]) => ({
    key,
    label: key === 'joker' ? '🃏' : cards[0].rank,
    cards,
  }));
}
