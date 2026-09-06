/**
 * Generates royalty-free procedural WAV assets for Rummy Roar.
 * Run: node scripts/generate-sounds.mjs
 */
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '../public/sounds');
const SAMPLE_RATE = 44100;

mkdirSync(OUT_DIR, { recursive: true });

function writeWav(filename, samples) {
  const numSamples = samples.length;
  const buffer = Buffer.alloc(44 + numSamples * 2);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40);
  for (let i = 0; i < numSamples; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.floor(clamped * 32767), 44 + i * 2);
  }
  writeFileSync(join(OUT_DIR, filename), buffer);
}

function env(t, attack, decay, sustain, release, duration) {
  if (t < attack) return t / attack;
  if (t < attack + decay) return 1 - (1 - sustain) * ((t - attack) / decay);
  if (t < duration - release) return sustain;
  if (t < duration) return sustain * (1 - (t - (duration - release)) / release);
  return 0;
}

function noise(duration, fn) {
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    out[i] = fn(t, i / n) * (Math.random() * 2 - 1);
  }
  return out;
}

function tone(duration, freqFn, volumeFn, type = 'sine') {
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const freq = typeof freqFn === 'function' ? freqFn(t) : freqFn;
    phase += (2 * Math.PI * freq) / SAMPLE_RATE;
    const wave =
      type === 'sine'
        ? Math.sin(phase)
        : type === 'triangle'
          ? (2 / Math.PI) * Math.asin(Math.sin(phase))
          : phase % (2 * Math.PI) < Math.PI
            ? 1
            : -1;
    out[i] = wave * volumeFn(t);
  }
  return out;
}

function mix(...tracks) {
  const len = Math.max(...tracks.map((t) => t.length));
  const out = new Float32Array(len);
  for (const track of tracks) {
    for (let i = 0; i < track.length; i++) out[i] += track[i];
  }
  let peak = 0;
  for (let i = 0; i < out.length; i++) peak = Math.max(peak, Math.abs(out[i]));
  const gain = peak > 0.98 ? 0.98 / peak : 1;
  for (let i = 0; i < out.length; i++) out[i] *= gain;
  return out;
}

function lowpass(samples, cutoff = 800) {
  const out = new Float32Array(samples.length);
  const rc = 1 / (2 * Math.PI * cutoff);
  const dt = 1 / SAMPLE_RATE;
  const alpha = dt / (rc + dt);
  out[0] = samples[0];
  for (let i = 1; i < samples.length; i++) {
    out[i] = out[i - 1] + alpha * (samples[i] - out[i - 1]);
  }
  return out;
}

function cardPlace() {
  const thud = tone(0.12, 90, (t) => env(t, 0.002, 0.04, 0.2, 0.06, 0.12) * 0.55, 'sine');
  const snap = lowpass(
    noise(0.05, (t) => env(t, 0.001, 0.01, 0, 0.03, 0.05) * 0.35),
    1200
  );
  return mix(thud, snap);
}

function cardDraw() {
  const slide = lowpass(
    noise(0.18, (t) => {
      const e = env(t, 0.01, 0.05, 0.5, 0.08, 0.18);
      return e * (0.15 + t * 0.4);
    }),
    600 + 800 * 0.5
  );
  const tap = tone(0.08, (t) => 900 - t * 1200, (t) => env(t, 0.001, 0.02, 0, 0.04, 0.08) * 0.2);
  return mix(slide, tap);
}

function cardPick() {
  const lift = tone(0.1, (t) => 280 + t * 900, (t) => env(t, 0.005, 0.03, 0.3, 0.05, 0.1) * 0.35);
  const rustle = lowpass(noise(0.08, (t) => env(t, 0.002, 0.02, 0.2, 0.04, 0.08) * 0.25), 900);
  return mix(lift, rustle);
}

function cardDeal() {
  const flip = lowpass(noise(0.06, (t) => env(t, 0.001, 0.015, 0.1, 0.03, 0.06) * 0.45), 2000);
  const click = tone(0.04, 520, (t) => env(t, 0.001, 0.01, 0, 0.02, 0.04) * 0.25);
  return mix(flip, click);
}

function uiClick() {
  return tone(0.05, 660, (t) => env(t, 0.001, 0.015, 0, 0.03, 0.05) * 0.18, 'triangle');
}

function fanfare(notes, duration = 0.55) {
  const tracks = notes.map(([freq, delay, vol], idx) => {
    const d = duration - delay;
    const pad = new Float32Array(Math.floor(SAMPLE_RATE * delay));
    const note = tone(d, freq, (t) => env(t, 0.01, 0.08, 0.6, 0.2, d) * vol);
    const combined = new Float32Array(pad.length + note.length);
    combined.set(pad);
    combined.set(note, pad.length);
    return combined;
  });
  return mix(...tracks);
}

function tableBgm() {
  const duration = 24;
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  const chords = [
    [220, 277, 330],
    [247, 311, 370],
    [196, 247, 294],
    [220, 277, 330],
  ];
  const chordLen = duration / chords.length;

  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const chordIdx = Math.min(chords.length - 1, Math.floor(t / chordLen));
    const localT = t - chordIdx * chordLen;
    const e = env(localT, 0.8, 0.5, 0.35, 1.2, chordLen);
    let sample = 0;
    for (const f of chords[chordIdx]) {
      sample += Math.sin((2 * Math.PI * f * t)) * 0.045 * e;
      sample += Math.sin((2 * Math.PI * f * 2 * t)) * 0.015 * e;
    }
    const bed = (Math.random() * 2 - 1) * 0.012 * e;
    out[i] = sample + bed;
  }
  return lowpass(out, 900);
}

const files = {
  'bgm-table.wav': tableBgm(),
  'card-place.wav': cardPlace(),
  'card-draw.wav': cardDraw(),
  'card-pick.wav': cardPick(),
  'card-deal.wav': cardDeal(),
  'card-shuffle.wav': mix(cardDeal(), cardDeal()),
  'ui-click.wav': uiClick(),
  'game-start.wav': fanfare([[220, 0, 0.2], [277, 0.06, 0.18], [330, 0.12, 0.15]]),
  'round-start.wav': fanfare([[392, 0, 0.18], [494, 0.07, 0.16], [587, 0.14, 0.14]]),
  'deal-complete.wav': fanfare([[660, 0, 0.16], [880, 0.08, 0.12]]),
  'show-success.wav': fanfare([[523, 0, 0.14], [659, 0.05, 0.12], [784, 0.1, 0.1], [1047, 0.16, 0.08]]),
  'show-penalty.wav': mix(
    tone(0.25, 140, (t) => env(t, 0.01, 0.05, 0.5, 0.15, 0.25) * 0.2, 'square'),
    tone(0.3, 90, (t) => env(t, 0.02, 0.08, 0.4, 0.18, 0.3) * 0.12, 'sawtooth')
  ),
  'round-end.wav': fanfare([[440, 0, 0.15], [330, 0.12, 0.12]], 0.45),
  'your-turn.wav': fanfare([[880, 0, 0.12], [988, 0.08, 0.1]], 0.2),
  'timer-warning.wav': tone(0.12, 740, (t) => env(t, 0.005, 0.02, 0.5, 0.06, 0.12) * 0.22, 'triangle'),
};

for (const [name, samples] of Object.entries(files)) {
  writeWav(name, samples);
  console.log('Wrote', name);
}

console.log('Done — assets in public/sounds/');
