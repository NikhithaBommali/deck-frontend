import { useOptionalGameAudio } from '../context/GameAudioContext';

interface GameAudioControlsProps {
  className?: string;
  compact?: boolean;
}

export function GameAudioControls({
  className = '',
  compact = false,
}: GameAudioControlsProps) {
  const audio = useOptionalGameAudio();
  if (!audio) return null;

  const btnClass = compact
    ? 'w-9 h-9 rounded-full flex items-center justify-center text-base transition-colors border'
    : 'px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-colors border';

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <button
        type="button"
        onClick={() => {
          audio.unlockAudio();
          audio.toggleBgm();
        }}
        className={`${btnClass} ${
          audio.bgmEnabled
            ? 'bg-gold-500/20 border-gold-500/40 text-gold-300'
            : 'bg-black/30 border-white/10 text-white/45 hover:text-white/70 hover:bg-white/10'
        }`}
        aria-label={audio.bgmEnabled ? 'Turn off table music' : 'Turn on table music'}
        title={audio.bgmEnabled ? 'Table music on' : 'Table music off'}
      >
        <span aria-hidden className={audio.bgmEnabled ? '' : 'opacity-45'}>
          🎵
        </span>
        {!compact && <span>Music</span>}
      </button>

      <button
        type="button"
        onClick={() => {
          audio.unlockAudio();
          audio.toggleSfx();
        }}
        className={`${btnClass} ${
          audio.sfxEnabled
            ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-300'
            : 'bg-black/30 border-white/10 text-white/45 hover:text-white/70 hover:bg-white/10'
        }`}
        aria-label={audio.sfxEnabled ? 'Turn off game sounds' : 'Turn on game sounds'}
        title={audio.sfxEnabled ? 'Action sounds on' : 'Action sounds off'}
      >
        <span aria-hidden>{audio.sfxEnabled ? '🔊' : '🔇'}</span>
        {!compact && <span>Sounds</span>}
      </button>
    </div>
  );
}
