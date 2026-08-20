import { useEffect, useState } from 'react';
import { saveProfile, storeProfile, loadStoredProfile } from '../api/profile';
import { MAX_SCORE } from '../types/game';
import { RoomPeekResult } from '../types/room';
import { clearInviteFromUrl, normalizeRoomCode } from '../utils/roomInvite';
import { ProfileUpload } from './ProfileUpload';
import { RoomJoinBanner } from './RoomJoinBanner';

interface LobbyProps {
  connected: boolean;
  initialJoinCode?: string | null;
  onCreateRoom: (name: string, profilePicture: string) => void;
  onJoinRoom: (code: string, name: string, profilePicture: string) => void;
  onPeekRoom: (code: string) => Promise<RoomPeekResult>;
  error: string | null;
}

export function Lobby({
  connected,
  initialJoinCode,
  onCreateRoom,
  onJoinRoom,
  onPeekRoom,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-felt-900 via-felt-800 to-felt-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-conic-gradient(from 0deg, transparent 0deg 60deg, rgba(255,255,255,0.03) 60deg 120deg)`,
          }}
        />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="text-5xl">🃏</span>
            <h1 className="font-display text-4xl font-bold text-gold-400 tracking-wide">
              Deck Score
            </h1>
          </div>
          <p className="text-white/60 text-sm max-w-sm mx-auto">
            Reduce your score (max {MAX_SCORE}). Place cards, draw from deck, and Show
            when your score is below 4.
          </p>
        </div>

        <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6 shadow-2xl">
          {!connected && (
            <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-300 text-sm text-center">
              Connecting to server...
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm text-center">
              {error}
            </div>
          )}

          {mode === 'home' && (
            <div className="space-y-3">
              <button
                onClick={() => setMode('create')}
                disabled={!connected}
                className="w-full py-3 px-4 bg-gold-500 hover:bg-gold-400 disabled:opacity-50 text-felt-900 font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Create New Game
              </button>
              <button
                onClick={() => setMode('join')}
                disabled={!connected}
                className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white font-semibold rounded-xl border border-white/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Join Game
              </button>
            </div>
          )}

          {(mode === 'create' || mode === 'join') && (
            <form
              onSubmit={mode === 'create' ? handleCreate : handleJoin}
              className="space-y-4"
            >
              <h2 className="text-white font-semibold text-lg text-center">
                {mode === 'create' ? 'Create Game' : 'Join Game'}
              </h2>

              {showJoinBanner && (
                <RoomJoinBanner
                  code={joinCode.length === 6 ? joinCode : code.toUpperCase()}
                  peek={roomPeek}
                  loading={peekLoading}
                />
              )}

              <ProfileUpload
                picture={picture}
                onPictureChange={setPicture}
                disabled={!connected}
              />

              {mode === 'join' && (
                <input
                  type="text"
                  placeholder="Room code (e.g. ABC123)"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gold-500 uppercase tracking-widest text-center font-mono text-lg"
                  maxLength={6}
                  autoFocus
                />
              )}

              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gold-500"
                maxLength={20}
                autoFocus={mode === 'create'}
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setMode('home')}
                  className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
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
                  className="flex-1 py-3 px-4 bg-gold-500 hover:bg-gold-400 disabled:opacity-50 text-felt-900 font-bold rounded-xl transition-colors"
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

        <div className="mt-6 text-center text-white/40 text-xs space-y-1">
          <p>Max score: {MAX_SCORE} (hand can start higher) · Show when score &lt; 4</p>
          <p>Place a card → draw (unless you match discard top)</p>
          <p>Show: lowest score wins (0 pts). Wrong show = sum of others&apos; scores</p>
        </div>
      </div>
    </div>
  );
}
