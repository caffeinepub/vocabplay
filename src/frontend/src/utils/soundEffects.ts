function getAudioContext(): AudioContext | null {
  try {
    return new (window.AudioContext || (window as any).webkitAudioContext)();
  } catch {
    return null;
  }
}

export function isMuted(): boolean {
  return localStorage.getItem("vocabplay_muted") === "true";
}

function playNote(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  duration: number,
  volume: number,
  type: OscillatorType = "sine",
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

export function playCorrect(): void {
  if (isMuted()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    playNote(ctx, 523.25, now, 0.25, 0.35);
    playNote(ctx, 659.25, now + 0.12, 0.25, 0.35);
  } catch {
    // silently ignore
  }
}

export function playWrong(): void {
  if (isMuted()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.25);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.32);
  } catch {
    // silently ignore
  }
}

export function playFinish(): void {
  if (isMuted()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    // Cheerful ascending jingle: C5 E5 G5 E5 G5 C6
    const melody = [
      { freq: 523.25, time: 0.0, dur: 0.18 }, // C5
      { freq: 659.25, time: 0.16, dur: 0.18 }, // E5
      { freq: 783.99, time: 0.32, dur: 0.18 }, // G5
      { freq: 659.25, time: 0.48, dur: 0.14 }, // E5
      { freq: 783.99, time: 0.6, dur: 0.18 }, // G5
      { freq: 1046.5, time: 0.76, dur: 0.45 }, // C6
    ];
    for (const { freq, time, dur } of melody) {
      playNote(ctx, freq, now + time, dur, 0.4);
    }
  } catch {
    // silently ignore
  }
}
