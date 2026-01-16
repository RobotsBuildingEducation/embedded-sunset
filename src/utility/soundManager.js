import * as Tone from "tone";

class SoundManager {
  constructor() {
    this.isMuted = false;
    this.polySynth = new Tone.PolySynth(Tone.Synth).toDestination();
    this.synth = new Tone.Synth().toDestination();
    this.membrane = new Tone.MembraneSynth().toDestination();
    this.metal = new Tone.MetalSynth().toDestination();
    this.isReady = false;
  }

  async ensureReady() {
    if (!this.isReady) {
      await Tone.start();
      this.isReady = true;
    }
    if (Tone.context.state !== "running") {
      await Tone.context.resume();
    }
  }

  resume() {
    return this.ensureReady();
  }

  async playSelect() {
    if (this.isMuted) return;
    await this.ensureReady();
    // Quick, high-pitched blip
    this.synth.triggerAttackRelease("C6", "32n");
  }

  async playCorrect() {
    if (this.isMuted) return;
    await this.ensureReady();
    // Ascending major triad: C5, E5, G5, C6
    const now = Tone.now();
    this.polySynth.triggerAttackRelease(["C5", "E5", "G5", "C6"], "8n", now);
  }

  async playWrong() {
    if (this.isMuted) return;
    await this.ensureReady();
    // Low dissonant buzz
    const now = Tone.now();
    this.polySynth.triggerAttackRelease(["C2", "F#2"], "4n", now);
  }

  async playLearn() {
    if (this.isMuted) return;
    await this.ensureReady();
    // Rising magical sweep
    const now = Tone.now();
    this.polySynth.triggerAttackRelease(["C4", "E4", "G4", "B4", "C5"], "16n", now);
  }

  async playFlashcard() {
    if (this.isMuted) return;
    await this.ensureReady();
    // Quick paper flip sound (approximated with noise)
    const noise = new Tone.Noise("white").start();
    const filter = new Tone.Filter(1000, "lowpass");

    const env = new Tone.AmplitudeEnvelope({
      attack: 0.01,
      decay: 0.1,
      sustain: 0,
      release: 0.1,
    }).toDestination();

    noise.connect(filter);
    filter.connect(env);

    // Trigger and dispose
    env.triggerAttackRelease(0.1);

    // Clean up after the sound finishes (approx 0.2s + buffer)
    setTimeout(() => {
        noise.stop();
        noise.dispose();
        filter.dispose();
        env.dispose();
    }, 500);
  }

  async playSparkle() {
    if (this.isMuted) return;
    await this.ensureReady();
    // Rapid arpeggio
    const now = Tone.now();
    this.polySynth.triggerAttackRelease(["C5", "E5", "G5", "C6", "E6"], "32n", now);
  }

  async playComplete() {
      if (this.isMuted) return;
      await this.ensureReady();
      // Full Major Chord
      const now = Tone.now();
      this.polySynth.triggerAttackRelease(["C4", "E4", "G4", "C5"], "2n", now);
  }
}

export const soundManager = new SoundManager();
