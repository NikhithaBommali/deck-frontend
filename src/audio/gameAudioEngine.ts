export type GameSound =
  | 'button'
  | 'gameStart'
  | 'dealCard'
  | 'dealComplete'
  | 'roundStart'
  | 'draw'
  | 'pick'
  | 'place'
  | 'show'
  | 'showPenalty'
  | 'roundEnd'
  | 'yourTurn'
  | 'timerWarning';

const BGM_VOLUME = 0.22;
const SFX_VOLUME = 0.55;

const SOUND_FILES: Record<GameSound, string> = {
  button: '/sounds/ui-click.wav',
  gameStart: '/sounds/game-start.wav',
  dealCard: '/sounds/card-deal.wav',
  dealComplete: '/sounds/deal-complete.wav',
  roundStart: '/sounds/round-start.wav',
  draw: '/sounds/card-draw.wav',
  pick: '/sounds/card-pick.wav',
  place: '/sounds/card-place.wav',
  show: '/sounds/show-success.wav',
  showPenalty: '/sounds/show-penalty.wav',
  roundEnd: '/sounds/round-end.wav',
  yourTurn: '/sounds/your-turn.wav',
  timerWarning: '/sounds/timer-warning.wav',
};

class GameAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private bgmSource: AudioBufferSourceNode | null = null;
  private buffers = new Map<GameSound, AudioBuffer>();
  private bgmBuffer: AudioBuffer | null = null;
  private loadPromise: Promise<void> | null = null;
  private bgmEnabled = false;
  private sfxEnabled = true;

  setBgmEnabled(enabled: boolean) {
    this.bgmEnabled = enabled;
    if (enabled) {
      void this.startBgm();
    } else {
      this.stopBgm();
    }
  }

  setSfxEnabled(enabled: boolean) {
    this.sfxEnabled = enabled;
  }

  private async ensureContext(): Promise<AudioContext | null> {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return null;

      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.bgmGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.masterGain.gain.value = 1;
      this.bgmGain.gain.value = BGM_VOLUME;
      this.sfxGain.gain.value = SFX_VOLUME;
      this.bgmGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    return this.ctx;
  }

  private async ensureLoaded(): Promise<void> {
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = (async () => {
      const ctx = await this.ensureContext();
      if (!ctx) return;

      const entries = Object.entries(SOUND_FILES) as [GameSound, string][];
      await Promise.all(
        entries.map(async ([key, url]) => {
          if (this.buffers.has(key)) return;
          const response = await fetch(url);
          const arrayBuffer = await response.arrayBuffer();
          const buffer = await ctx.decodeAudioData(arrayBuffer);
          this.buffers.set(key, buffer);
        })
      );

      const bgmResponse = await fetch('/sounds/bgm-table.wav');
      const bgmArray = await bgmResponse.arrayBuffer();
      this.bgmBuffer = await ctx.decodeAudioData(bgmArray);
    })();

    return this.loadPromise;
  }

  async unlock() {
    await this.ensureLoaded();
  }

  private stopBgm() {
    if (this.bgmSource) {
      try {
        this.bgmSource.stop();
      } catch {
        /* already stopped */
      }
      this.bgmSource.disconnect();
      this.bgmSource = null;
    }
  }

  private async startBgm() {
    const ctx = await this.ensureContext();
    await this.ensureLoaded();
    if (!ctx || !this.bgmGain || !this.bgmEnabled || !this.bgmBuffer) return;

    this.stopBgm();

    const source = ctx.createBufferSource();
    source.buffer = this.bgmBuffer;
    source.loop = true;
    source.connect(this.bgmGain);
    source.start(0);
    this.bgmSource = source;
  }

  private playSoundInternal(sound: GameSound) {
    if (!this.sfxEnabled || !this.ctx || !this.sfxGain) return;
    const buffer = this.buffers.get(sound);
    if (!buffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.sfxGain);
    source.start(0);
  }

  async playSfx(sound: GameSound) {
    await this.ensureLoaded();
    this.playSoundInternal(sound);
  }

  async toggleBgm(currentlyEnabled: boolean): Promise<boolean> {
    await this.ensureLoaded();
    const next = !currentlyEnabled;
    this.setBgmEnabled(next);
    if (next) {
      this.playSoundInternal('button');
    }
    return next;
  }

  async toggleSfx(currentlyEnabled: boolean): Promise<boolean> {
    await this.ensureLoaded();
    const next = !currentlyEnabled;
    this.setSfxEnabled(next);
    if (next) {
      this.playSoundInternal('button');
    }
    return next;
  }

  syncSettings(bgmEnabled: boolean, sfxEnabled: boolean) {
    this.sfxEnabled = sfxEnabled;
    if (bgmEnabled !== this.bgmEnabled) {
      this.setBgmEnabled(bgmEnabled);
    }
  }
}

export const gameAudioEngine = new GameAudioEngine();
