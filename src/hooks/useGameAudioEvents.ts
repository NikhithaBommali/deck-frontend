import { useEffect, useRef } from 'react';
import { ClientGameState, TURN_WARNING_SEC } from '../types/game';
import { useOptionalGameAudio } from '../context/GameAudioContext';
import { useTurnCountdown } from './useTurnCountdown';

export function useGameAudioEvents(gameState: ClientGameState | null) {
  const audio = useOptionalGameAudio();
  const prevRef = useRef<ClientGameState | null>(null);
  const timerWarnedRef = useRef<string | null>(null);
  const remainingSec = useTurnCountdown(gameState?.turnDeadlineAt ?? null);

  useEffect(() => {
    if (!audio || !gameState || gameState.phase !== 'playing') return;
    if (remainingSec === null) return;

    const turnKey = `${gameState.currentTurnPlayerId}-${gameState.turnDeadlineAt}`;
    if (remainingSec <= TURN_WARNING_SEC && timerWarnedRef.current !== turnKey) {
      timerWarnedRef.current = turnKey;
      if (gameState.isMyTurn) {
        audio.playSfx('timerWarning');
      }
    }
  }, [audio, gameState, remainingSec]);

  useEffect(() => {
    if (!gameState || gameState.phase !== 'playing') {
      timerWarnedRef.current = null;
    }
  }, [gameState?.phase, gameState?.turnDeadlineAt, gameState?.currentTurnPlayerId]);

  useEffect(() => {
    if (!audio || !gameState) {
      prevRef.current = gameState;
      return;
    }

    const prev = prevRef.current;
    prevRef.current = gameState;

    if (!prev) return;

    if (prev.phase !== gameState.phase) {
      if (
        gameState.phase === 'dealing' &&
        (prev.phase === 'waiting' || prev.phase === 'round-end')
      ) {
        audio.playSfx('gameStart');
      }
      if (gameState.phase === 'playing' && prev.phase === 'dealing') {
        audio.playSfx('roundStart');
      }
      if (gameState.phase === 'round-end' && prev.phase === 'playing') {
        audio.playSfx('roundEnd');
      }
    }

    if (
      gameState.phase === 'dealing' &&
      gameState.dealingStep > prev.dealingStep
    ) {
      audio.playSfx('dealCard');
    }

    if (
      gameState.phase === 'dealing' &&
      !prev.isDealingComplete &&
      gameState.isDealingComplete
    ) {
      audio.playSfx('dealComplete');
    }

    if (
      gameState.phase === 'playing' &&
      !prev.isMyTurn &&
      gameState.isMyTurn
    ) {
      audio.playSfx('yourTurn');
    }

    if (gameState.phase === 'playing' && prev.phase === 'playing') {
      const myId = gameState.myId;

      if (
        gameState.isMyTurn &&
        prev.isMyTurn &&
        !prev.hasDrawnThisTurn &&
        gameState.hasDrawnThisTurn
      ) {
        const pickedFromDiscard =
          !!prev.discardTop &&
          prev.canPickFromDiscard &&
          (!gameState.discardTop ||
            gameState.discardTop.id !== prev.discardTop.id);
        audio.playSfx(pickedFromDiscard ? 'pick' : 'draw');
      } else if (
        gameState.isMyTurn &&
        prev.isMyTurn &&
        !prev.hasPlacedThisTurn &&
        gameState.hasPlacedThisTurn
      ) {
        audio.playSfx('place');
      } else if (
        prev.currentTurnPlayerId !== gameState.currentTurnPlayerId &&
        gameState.currentTurnPlayerId !== myId
      ) {
        if (prev.discardTop?.id !== gameState.discardTop?.id) {
          audio.playSfx('place');
        }
      }
    }

    if (gameState.showPlayerId && !prev.showPlayerId) {
      audio.playSfx(gameState.showPenalty ? 'showPenalty' : 'show');
    }
  }, [audio, gameState]);
}
