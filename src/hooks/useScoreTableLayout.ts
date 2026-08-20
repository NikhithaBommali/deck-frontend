import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'deck-score-table-layout';

export interface ScoreTableLayout {
  /** Width of the round-label column (R1, R2, Total). */
  labelColWidth: number;
  /** Width of each player column. */
  playerColWidth: number;
  /** Height of the player header row. */
  headerRowHeight: number;
  /** Height of each score row. */
  rowHeight: number;
}

export const DEFAULT_SCORE_TABLE_LAYOUT: ScoreTableLayout = {
  labelColWidth: 52,
  playerColWidth: 92,
  headerRowHeight: 56,
  rowHeight: 38,
};

const LIMITS = {
  labelColWidth: { min: 40, max: 100 },
  playerColWidth: { min: 64, max: 180 },
  headerRowHeight: { min: 44, max: 100 },
  rowHeight: { min: 32, max: 72 },
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function migrateLayout(raw: Record<string, unknown>): ScoreTableLayout {
  if ('labelColWidth' in raw) {
    return {
      labelColWidth: clamp(
        Number(raw.labelColWidth) || DEFAULT_SCORE_TABLE_LAYOUT.labelColWidth,
        LIMITS.labelColWidth.min,
        LIMITS.labelColWidth.max
      ),
      playerColWidth: clamp(
        Number(raw.playerColWidth) || DEFAULT_SCORE_TABLE_LAYOUT.playerColWidth,
        LIMITS.playerColWidth.min,
        LIMITS.playerColWidth.max
      ),
      headerRowHeight: clamp(
        Number(raw.headerRowHeight) || DEFAULT_SCORE_TABLE_LAYOUT.headerRowHeight,
        LIMITS.headerRowHeight.min,
        LIMITS.headerRowHeight.max
      ),
      rowHeight: clamp(
        Number(raw.rowHeight) || DEFAULT_SCORE_TABLE_LAYOUT.rowHeight,
        LIMITS.rowHeight.min,
        LIMITS.rowHeight.max
      ),
    };
  }

  // Migrate from old row=player / col=round layout keys
  return {
    labelColWidth: clamp(
      Number(raw.playerColWidth) || DEFAULT_SCORE_TABLE_LAYOUT.labelColWidth,
      LIMITS.labelColWidth.min,
      LIMITS.labelColWidth.max
    ),
    playerColWidth: clamp(
      Number(raw.roundColWidth) || DEFAULT_SCORE_TABLE_LAYOUT.playerColWidth,
      LIMITS.playerColWidth.min,
      LIMITS.playerColWidth.max
    ),
    headerRowHeight: clamp(
      Number(raw.totalColWidth) || DEFAULT_SCORE_TABLE_LAYOUT.headerRowHeight,
      LIMITS.headerRowHeight.min,
      LIMITS.headerRowHeight.max
    ),
    rowHeight: clamp(
      Number(raw.rowHeight) || DEFAULT_SCORE_TABLE_LAYOUT.rowHeight,
      LIMITS.rowHeight.min,
      LIMITS.rowHeight.max
    ),
  };
}

function loadLayout(): ScoreTableLayout {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SCORE_TABLE_LAYOUT;
    return migrateLayout(JSON.parse(raw) as Record<string, unknown>);
  } catch {
    return DEFAULT_SCORE_TABLE_LAYOUT;
  }
}

export function useScoreTableLayout() {
  const [layout, setLayout] = useState<ScoreTableLayout>(loadLayout);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  }, [layout]);

  const resizeColumn = useCallback(
    (key: keyof ScoreTableLayout, delta: number) => {
      setLayout((prev) => {
        const limits = LIMITS[key];
        return {
          ...prev,
          [key]: clamp(prev[key] + delta, limits.min, limits.max),
        };
      });
    },
    []
  );

  const resetLayout = useCallback(() => {
    setLayout(DEFAULT_SCORE_TABLE_LAYOUT);
  }, []);

  return { layout, resizeColumn, resetLayout };
}
