// Typing Sound Utility using Web Audio API
// Sketch/Pencil theme sounds - like writing on paper

let audioContext: AudioContext | null = null;
let enabled = true;
let volume = 0.5;

// Initialize AudioContext (must be called after user interaction)
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }

  // Resume if suspended (browser autoplay policy)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  return audioContext;
}

// Create noise buffer for scratchy pencil sounds
function createNoiseBuffer(ctx: AudioContext, duration: number): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const bufferSize = sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  return buffer;
}

// Play pencil scratch sound (for correct keystrokes)
function playPencilScratch() {
  if (!enabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const duration = 0.04 + Math.random() * 0.02; // Slight variation

  // Create noise source
  const noiseBuffer = createNoiseBuffer(ctx, duration);
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = noiseBuffer;

  // Bandpass filter for pencil-like sound
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 2000 + Math.random() * 1000; // Vary frequency
  filter.Q.value = 0.5;

  // Gain envelope
  const gainNode = ctx.createGain();
  const finalVolume = volume * 0.3;
  gainNode.gain.setValueAtTime(finalVolume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  // Connect
  noiseSource.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  noiseSource.start(ctx.currentTime);
  noiseSource.stop(ctx.currentTime + duration);
}

// Play error sound (like eraser or paper crinkle)
function playEraserSound() {
  if (!enabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const duration = 0.1;

  // Create noise for eraser
  const noiseBuffer = createNoiseBuffer(ctx, duration);
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = noiseBuffer;

  // Lowpass filter for softer eraser sound
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 800;
  filter.Q.value = 1;

  // Gain envelope
  const gainNode = ctx.createGain();
  const finalVolume = volume * 0.25;
  gainNode.gain.setValueAtTime(finalVolume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  // Connect
  noiseSource.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  noiseSource.start(ctx.currentTime);
  noiseSource.stop(ctx.currentTime + duration);
}

// Play space/word complete sound (like pen tap on desk)
function playPenTap() {
  if (!enabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const duration = 0.06;

  // Short click with oscillator
  const oscillator = ctx.createOscillator();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(400, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + duration);

  // Add some noise for texture
  const noiseBuffer = createNoiseBuffer(ctx, duration);
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = noiseBuffer;

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'highpass';
  noiseFilter.frequency.value = 1000;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(volume * 0.1, ctx.currentTime);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  // Oscillator gain
  const oscGain = ctx.createGain();
  oscGain.gain.setValueAtTime(volume * 0.2, ctx.currentTime);
  oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  // Connect
  oscillator.connect(oscGain);
  oscGain.connect(ctx.destination);

  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
  noiseSource.start(ctx.currentTime);
  noiseSource.stop(ctx.currentTime + duration);
}

// Play backspace sound (light paper rustle)
function playPaperRustle() {
  if (!enabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const duration = 0.05;

  // Create noise
  const noiseBuffer = createNoiseBuffer(ctx, duration);
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = noiseBuffer;

  // Highpass filter for paper-like sound
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 3000;
  filter.Q.value = 0.3;

  // Gain envelope
  const gainNode = ctx.createGain();
  const finalVolume = volume * 0.15;
  gainNode.gain.setValueAtTime(finalVolume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  // Connect
  noiseSource.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  noiseSource.start(ctx.currentTime);
  noiseSource.stop(ctx.currentTime + duration);
}

// Exported functions
export function playCorrectKeystroke() {
  playPencilScratch();
}

export function playErrorKeystroke() {
  playEraserSound();
}

export function playSpaceSound() {
  playPenTap();
}

export function playBackspaceSound() {
  playPaperRustle();
}

export function playKeystroke(correct: boolean) {
  if (correct) {
    playCorrectKeystroke();
  } else {
    playErrorKeystroke();
  }
}

// Volume control (0-1)
export function setVolume(vol: number) {
  volume = Math.max(0, Math.min(1, vol));
}

export function getVolume(): number {
  return volume;
}

// Enable/disable sounds
export function setEnabled(value: boolean) {
  enabled = value;
}

export function isEnabled(): boolean {
  return enabled;
}

// Initialize audio context (call on first user interaction)
export function initAudio() {
  getAudioContext();
}
