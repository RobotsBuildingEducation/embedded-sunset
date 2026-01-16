class SoundManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
  }

  getContext() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    return this.ctx;
  }

  resume() {
    const ctx = this.getContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
  }

  playSelect() {
    const ctx = this.getContext();
    if (!ctx || this.isMuted) return;
    this.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // "Select" sound: quick, slightly high-pitched blip
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  }

  playSparkle() {
    const ctx = this.getContext();
    if (!ctx || this.isMuted) return;
    this.resume();

    // "Sparkle": rapid arpeggio
    const now = ctx.currentTime;
    const frequencies = [523.25, 659.25, 783.99, 1046.5, 1318.51]; // C major pentatonic

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sine";
      osc.frequency.value = freq;

      const startTime = now + i * 0.05;
      const duration = 0.1;

      gain.gain.setValueAtTime(0.05, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  }

  playComplete() {
    const ctx = this.getContext();
    if (!ctx || this.isMuted) return;
    this.resume();

    // "Complete": A nice major chord
    const now = ctx.currentTime;
    // C Major: C4, E4, G4, C5
    const frequencies = [261.63, 329.63, 392.0, 523.25];

    frequencies.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "triangle";
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5); // Long decay

      osc.start(now);
      osc.stop(now + 1.5);
    });
  }
}

export const soundManager = new SoundManager();
