import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { gameAudioEngine, GameSound } from '../audio/gameAudioEngine';

const BGM_KEY = 'rummy-roar-bgm-enabled';
const SFX_KEY = 'rummy-roar-sfx-enabled';

function loadBool(key: string, fallback: boolean): boolean {
  if (typeof window === 'undefined') return fallback;
  const raw = localStorage.getItem(key);
  if (raw === null) return fallback;
  return raw === 'true';
}

interface GameAudioContextValue {
  bgmEnabled: boolean;
  sfxEnabled: boolean;
  toggleBgm: () => void;
  toggleSfx: () => void;
  playSfx: (sound: GameSound) => void;
  unlockAudio: () => void;
}

const GameAudioContext = createContext<GameAudioContextValue | null>(null);

export function GameAudioProvider({ children }: { children: ReactNode }) {
  const [bgmEnabled, setBgmEnabled] = useState(() => loadBool(BGM_KEY, false));
  const [sfxEnabled, setSfxEnabled] = useState(() => loadBool(SFX_KEY, true));

  useEffect(() => {
    gameAudioEngine.syncSettings(bgmEnabled, sfxEnabled);
  }, [bgmEnabled, sfxEnabled]);

  useEffect(() => {
    localStorage.setItem(BGM_KEY, String(bgmEnabled));
  }, [bgmEnabled]);

  useEffect(() => {
    localStorage.setItem(SFX_KEY, String(sfxEnabled));
  }, [sfxEnabled]);

  const unlockAudio = useCallback(() => {
    void gameAudioEngine.unlock();
  }, []);

  const toggleBgm = useCallback(() => {
    void gameAudioEngine.toggleBgm(bgmEnabled).then(setBgmEnabled);
  }, [bgmEnabled]);

  const toggleSfx = useCallback(() => {
    void gameAudioEngine.toggleSfx(sfxEnabled).then(setSfxEnabled);
  }, [sfxEnabled]);

  const playSfx = useCallback((sound: GameSound) => {
    void gameAudioEngine.playSfx(sound);
  }, []);

  const value = useMemo(
    () => ({
      bgmEnabled,
      sfxEnabled,
      toggleBgm,
      toggleSfx,
      playSfx,
      unlockAudio,
    }),
    [bgmEnabled, sfxEnabled, toggleBgm, toggleSfx, playSfx, unlockAudio]
  );

  return (
    <GameAudioContext.Provider value={value}>{children}</GameAudioContext.Provider>
  );
}

export function useGameAudio() {
  const ctx = useContext(GameAudioContext);
  if (!ctx) {
    throw new Error('useGameAudio must be used within GameAudioProvider');
  }
  return ctx;
}

export function useOptionalGameAudio() {
  return useContext(GameAudioContext);
}
