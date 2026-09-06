import { useEffect, useState } from 'react';
import { saveProfile, storeProfile, loadStoredProfile } from '../api/profile';
import { GAME_TAGLINE } from '../constants/brand';
import { RoomPeekResult } from '../types/room';
import { clearInviteFromUrl, normalizeRoomCode } from '../utils/roomInvite';
import { BrandLogo } from './BrandLogo';
import { FeltBackground } from './FeltBackground';
import { ProfileUpload } from './ProfileUpload';
import { RoomJoinBanner } from './RoomJoinBanner';
import { GameRulesModal } from './GameRulesModal';
import { GameAudioControls } from './GameAudioControls';

interface LobbyProps {
  connected: boolean;
  initialJoinCode?: string | null;
  onCreateRoom: (name: string, profilePicture: string) => void;
  onJoinRoom: (code: string, name: string, profilePicture: string) => void;
  onPeekRoom: (code: string) => Promise<RoomPeekResult>;
  onStartDemo: () => void;
  error: string | null;
}

const FEATURES = [
  { icon: '👥', label: '2–6 players' },
  { icon: '🏆', label: 'Lowest score wins' },
  { icon: '⚡', label: 'Real-time play' },
] as const;

export function Lobby({
  connected,
  initialJoinCode,
  onCreateRoom,
  onJoinRoom,
  onPeekRoom,
  onStartDemo,
  error,
}: LobbyProps) {
  const stored = loadStoredProfile();
  const [name, setName] = useState(stored.name);
  const [picture, setPicture] = useState(stored.picture);
  const [code, setCode] = useState(initialJoinCode ?? '');
  const [mode, setMode] = useState<'home' | 'create' | 'join'>(
    initialJoinCode ? 'join' : 'home'
  );
  const [saving, setSaving] = useState(false);
  const [roomPeek, setRoomPeek] = useState<RoomPeekResult | null>(null);
  const [peekLoading, setPeekLoading] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);

  useEffect(() => {
    if (initialJoinCode) {
      setCode(initialJoinCode);
      setMode('join');
    }
  }, [initialJoinCode]);

  useEffect(() => {
    if (mode !== 'join' || !connected || !code.trim()) {
      setRoomPeek(null);
      return;
    }

    const normalized = normalizeRoomCode(code);
    if (normalized.length < 6) {
      setRoomPeek(null);
      return;
    }

    let cancelled = false;
    setPeekLoading(true);

    void onPeekRoom(normalized).then((result) => {
      if (!cancelled) {
        setRoomPeek(result);
        setPeekLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [mode, connected, code, onPeekRoom]);

  const persistProfile = async (playerName: string) => {
    storeProfile(playerName, picture);
    setSaving(true);
    await saveProfile(playerName, playerName, picture || undefined);
    setSaving(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await persistProfile(name.trim());
    onCreateRoom(name.trim(), picture);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;
    if (roomPeek && !roomPeek.canJoin) return;
    await persistProfile(name.trim());
    onJoinRoom(code.trim(), name.trim(), picture);
    clearInviteFromUrl();
  };

  const joinBlocked = !!roomPeek?.exists && roomPeek.canJoin === false;
  const joinCode = normalizeRoomCode(code);
  const showJoinBanner =
    mode === 'join' && (peekLoading || !!roomPeek || joinCode.length === 6);
  const isFormMode = mode === 'create' || mode === 'join';

  return (
    <FeltBackground
      variant="lobby"
      decorative={false}
      className="flex flex-col items-center justify-center p-4 sm:p-6 min-h-dvh"
    >
      <div className="fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 sm:px-6 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`connection-dot flex-shrink-0 ${connected ? 'connection-dot--online' : 'connection-dot--offline'}`}
            aria-hidden
          />
          <span className="text-white/45 text-xs sm:text-sm truncate">
            {connected ? 'Connected' : 'Connecting...'}
          </span>
        </div>
        <GameAudioControls compact />
        <button
          type="button"
          onClick={() => setRulesOpen(true)}
          className="w-10 h-10 rounded-full bg-black/35 hover:bg-black/50 border border-white/10 text-gold-400 font-bold text-lg transition-colors flex items-center justify-center flex-shrink-0"
          aria-label="How to play"
          title="How to play"
        >
          ?
        </button>
      </div>

      <GameRulesModal
        open={rulesOpen}
        onClose={() => setRulesOpen(false)}
        onStartDemo={() => {
          setRulesOpen(false);
          onStartDemo();
        }}
      />

      <div className="relative w-full max-w-md mx-auto pt-10 sm:pt-12">
        <div className="relative card-panel rounded-2xl overflow-hidden shadow-card-panel">
          <div
            className={`relative text-center border-b border-gold-500/15 bg-gradient-to-b from-black/25 to-transparent ${
              isFormMode
                ? 'px-5 py-4 sm:px-6 sm:py-5'
                : 'px-5 sm:px-8 pt-6 sm:pt-7 pb-5'
            }`}
          >
            {isFormMode ? (
              <>
                <BrandLogo size="lg" className="mx-auto" />
                <h2 className="mt-2 text-white font-display font-semibold text-lg sm:text-xl">
                  {mode === 'create' ? 'Create Game' : 'Join Game'}
                </h2>
                <p className="text-white/45 text-[11px] sm:text-xs mt-1">
                  {mode === 'create'
                    ? 'Set up your profile and start a new table'
                    : 'Enter the room code shared by your host'}
                </p>
              </>
            ) : (
              <>
                <BrandLogo size="banner" className="mx-auto" />
                <p className="mt-3 text-white/55 text-xs sm:text-sm leading-relaxed max-w-xs mx-auto">
                  {GAME_TAGLINE}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                  {FEATURES.map(({ icon, label }) => (
                    <span key={label} className="feature-pill">
                      <span aria-hidden>{icon}</span>
                      {label}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className={`${isFormMode ? 'p-4 sm:p-5' : 'p-5 sm:p-7'}`}>
            {!connected && mode !== 'home' && (
              <div className="mb-3 p-2.5 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-200 text-xs text-center flex items-center justify-center gap-2">
                <span className="connection-dot connection-dot--offline" aria-hidden />
                Connecting to server...
              </div>
            )}

            {error && (
              <div className="mb-3 p-2.5 bg-red-500/15 border border-red-500/30 rounded-xl text-red-300 text-xs text-center">
                {error}
              </div>
            )}

            {mode === 'home' && (
              <div className="space-y-3">
                <div className="text-center mb-4">
                  <p className="text-white/85 font-display text-lg font-semibold mb-1">
                    Welcome to the table
                  </p>
                  <p className="text-white/45 text-xs sm:text-sm">
                    Create a room for friends or join with a room code.{' '}
                    <button
                      type="button"
                      onClick={() => setRulesOpen(true)}
                      className="text-gold-400/90 hover:text-gold-300 underline underline-offset-2 transition-colors"
                    >
                      View rules
                    </button>
                  </p>
                </div>

                <button
                  onClick={() => setMode('create')}
                  disabled={!connected}
                  className="btn-primary hover:scale-[1.01]"
                >
                  Create New Game
                </button>
                <button
                  onClick={() => setMode('join')}
                  disabled={!connected}
                  className="btn-secondary hover:scale-[1.01]"
                >
                  Join Game
                </button>

                {!connected && (
                  <p className="text-center text-amber-300/70 text-xs pt-1">
                    Waiting for server connection...
                  </p>
                )}
              </div>
            )}

            {isFormMode && (
              <form
                onSubmit={mode === 'create' ? handleCreate : handleJoin}
                className="space-y-3"
              >
                {mode === 'join' && (
                  <div>
                    <label
                      htmlFor="room-code"
                      className="block text-white/50 text-[10px] mb-1 text-center uppercase tracking-wider"
                    >
                      Room Code
                    </label>
                    <input
                      id="room-code"
                      type="text"
                      placeholder="ABC123"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      className="w-full px-4 py-2.5 bg-black/30 border border-gold-500/25 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-gold-500/50 uppercase tracking-[0.3em] text-center font-mono text-lg shadow-inner"
                      maxLength={6}
                      autoFocus={mode === 'join'}
                    />
                  </div>
                )}

                {mode === 'join' && (
                  <div className="h-11 sm:h-12" aria-live="polite">
                    {showJoinBanner ? (
                      <RoomJoinBanner
                        code={joinCode.length === 6 ? joinCode : code.toUpperCase()}
                        peek={roomPeek}
                        loading={peekLoading}
                      />
                    ) : null}
                  </div>
                )}

                <ProfileUpload
                  picture={picture}
                  onPictureChange={setPicture}
                  disabled={!connected}
                  compact
                />

                <div>
                  <label
                    htmlFor="player-name"
                    className="block text-white/50 text-[10px] mb-1 text-center uppercase tracking-wider"
                  >
                    Your Name
                  </label>
                  <input
                    id="player-name"
                    type="text"
                    placeholder="Enter your display name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-black/30 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-gold-500/50 text-center text-sm"
                    maxLength={20}
                    autoFocus={mode === 'create'}
                  />
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setMode('home')}
                    className="flex-1 py-2.5 px-4 btn-secondary !w-auto text-sm"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={
                      !name.trim() ||
                      !connected ||
                      saving ||
                      (mode === 'join' && !code.trim()) ||
                      (mode === 'join' && joinBlocked)
                    }
                    className="flex-1 py-2.5 px-4 btn-primary !w-auto disabled:cursor-not-allowed text-sm"
                  >
                    {saving
                      ? 'Saving...'
                      : mode === 'create'
                        ? 'Create'
                        : joinBlocked
                          ? 'Cannot Join'
                          : 'Join'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </FeltBackground>
  );
}
