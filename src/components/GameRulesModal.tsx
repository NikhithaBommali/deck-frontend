import { useEffect } from 'react';
import {
  ELIMINATION_SCORE,
  MAX_SCORE,
  SHOW_THRESHOLD,
} from '../types/game';

interface GameRulesModalProps {
  open: boolean;
  onClose: () => void;
}

export function GameRulesModal({ open, onClose }: GameRulesModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Close rules"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="game-rules-title"
        className="relative w-full sm:max-w-lg max-h-[min(92dvh,720px)] bg-gradient-to-b from-felt-800 to-felt-900 border border-white/15 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-4 border-b border-white/10 flex-shrink-0">
          <div>
            <h2
              id="game-rules-title"
              className="font-display text-xl sm:text-2xl text-gold-400 font-bold"
            >
              How to Play Deck Score
            </h2>
            <p className="text-white/50 text-xs mt-0.5">
              Quick rules for new players
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white/80 flex items-center justify-center text-lg leading-none transition-colors flex-shrink-0"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto px-4 sm:px-5 py-4 space-y-5 text-sm text-white/85 leading-relaxed">
          <section>
            <h3 className="text-gold-400 font-semibold mb-1.5">Goal</h3>
            <p>
              Keep your <strong className="text-white">total score</strong> as low as
              possible. The player with the lowest total at the end wins. You are{' '}
              <strong className="text-red-300">out</strong> when your total reaches{' '}
              {ELIMINATION_SCORE}+.
            </p>
          </section>

          <section>
            <h3 className="text-gold-400 font-semibold mb-1.5">Setup</h3>
            <ul className="list-disc pl-5 space-y-1 text-white/75">
              <li>2–6 players join a room. Everyone taps Ready, then the host starts.</li>
              <li>Each player gets <strong className="text-white">7 cards</strong>.</li>
              <li>One card is flipped open — its rank becomes the <strong className="text-purple-300">zero rank</strong> (worth 0 points) this round.</li>
              <li>Jokers are always worth 0.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-gold-400 font-semibold mb-1.5">Card values</h3>
            <ul className="list-disc pl-5 space-y-1 text-white/75">
              <li>A = 1 · 2–10 = face value · J, Q, K = 10</li>
              <li>Joker = 0</li>
              <li>Any card matching the open card&apos;s rank = 0 (marked with a purple badge)</li>
            </ul>
          </section>

          <section>
            <h3 className="text-gold-400 font-semibold mb-1.5">Your turn</h3>
            <ol className="list-decimal pl-5 space-y-1.5 text-white/75">
              <li>
                <strong className="text-white">Place</strong> — tap a group of cards with
                the same rank to discard them together.
              </li>
              <li>
                <strong className="text-white">Draw</strong> — pick from the deck, or take
                the previous player&apos;s discard if it matches what you need.
              </li>
              <li>
                If your placed card <strong className="text-white">matches the top of the discard pile</strong>, you skip drawing this turn.
              </li>
            </ol>
          </section>

          <section>
            <h3 className="text-gold-400 font-semibold mb-1.5">Show (end the round)</h3>
            <p className="text-white/75 mb-2">
              When your hand score is <strong className="text-white">below {SHOW_THRESHOLD}</strong>, you
              can tap <strong className="text-gold-300">Show</strong>.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-white/75">
              <li>
                <strong className="text-green-300">Correct show</strong> — you have the
                lowest hand score: you get <strong className="text-white">0 points</strong> this
                round.
              </li>
              <li>
                <strong className="text-red-300">Wrong show</strong> — someone else has a
                lower score: you receive the <strong className="text-white">sum of every other
                player&apos;s hand scores</strong>.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-gold-400 font-semibold mb-1.5">Scoring & rounds</h3>
            <ul className="list-disc pl-5 space-y-1 text-white/75">
              <li>At round end, each player&apos;s hand score is added to their total (unless they showed correctly).</li>
              <li>The score table tracks every round and running totals.</li>
              <li>Play continues until one player remains or the game ends — lowest total wins.</li>
            </ul>
          </section>

          <section className="rounded-xl bg-black/30 border border-white/10 p-3">
            <h3 className="text-gold-400 font-semibold mb-1.5">Quick tips</h3>
            <ul className="list-disc pl-5 space-y-1 text-white/70 text-xs sm:text-sm">
              <li>Discard zero-rank and joker cards early — they don&apos;t help your hand score.</li>
              <li>Watch the score table to see who is close to {ELIMINATION_SCORE}.</li>
              <li>Only Show when you&apos;re sure no one has a lower hand (reference max ~{MAX_SCORE}).</li>
            </ul>
          </section>
        </div>

        <div className="flex-shrink-0 px-4 sm:px-5 py-3 border-t border-white/10 bg-black/20">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-gold-500 hover:bg-gold-400 text-felt-900 font-bold rounded-xl transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
