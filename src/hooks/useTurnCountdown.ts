import { useEffect, useState } from 'react';

export function useTurnCountdown(deadlineAt: number | null) {
  const [remainingSec, setRemainingSec] = useState<number | null>(null);

  useEffect(() => {
    if (!deadlineAt) {
      setRemainingSec(null);
      return;
    }

    const tick = () => {
      const left = Math.max(0, Math.ceil((deadlineAt - Date.now()) / 1000));
      setRemainingSec(left);
    };

    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [deadlineAt]);

  return remainingSec;
}

/** Smooth 0–1 progress for ring animation (1 = full time left). */
export function useTurnProgress(
  deadlineAt: number | null,
  durationSec: number
): number | null {
  const [progress, setProgress] = useState<number | null>(null);

  useEffect(() => {
    if (!deadlineAt || durationSec <= 0) {
      setProgress(null);
      return;
    }

    const durationMs = durationSec * 1000;

    const tick = () => {
      const remaining = Math.max(0, deadlineAt - Date.now());
      setProgress(Math.max(0, Math.min(1, remaining / durationMs)));
    };

    tick();
    const id = window.setInterval(tick, 50);
    return () => window.clearInterval(id);
  }, [deadlineAt, durationSec]);

  return progress;
}
