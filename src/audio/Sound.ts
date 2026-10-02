type Cue =
  | "click"
  | "collect"
  | "complete"
  | "interact"
  | "bell"
  | "chime"
  | "meow"
  | "paw";
export class Sound {
  enabled = true;
  private context?: AudioContext;
  constructor() {
    try {
      this.enabled = localStorage.getItem("miso-sound") !== "off";
    } catch {
      /* Private browsing can disable storage. */
    }
  }
  toggle() {
    this.enabled = !this.enabled;
    try {
      localStorage.setItem("miso-sound", this.enabled ? "on" : "off");
    } catch {
      /* The game still works without persistence. */
    }
  }
  play(cue: Cue) {
    if (!this.enabled) return;
    this.context ??= new AudioContext();
    void this.context.resume();
    if (cue === "meow") {
      this.meow(this.context);
      return;
    }
    const notes = {
      click: [520],
      collect: [660, 880, 1100],
      complete: [523, 659, 784, 1047, 784, 1047],
      interact: [330, 440, 392],
      bell: [1175, 1568],
      chime: [784, 1047, 1319],
      paw: [280, 350],
    }[cue];
    const decay = cue === "bell" || cue === "chime" ? 0.45 : 0.22;
    notes.forEach((freq, i) => {
      const ctx = this.context!,
        oscillator = ctx.createOscillator(),
        gain = ctx.createGain(),
        t = ctx.currentTime + i * 0.09;
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.065, t + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, t + decay);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(t);
      oscillator.stop(t + decay + 0.02);
    });
  }
  private meow(ctx: AudioContext) {
    const voice = ctx.createOscillator();
    const vowel = ctx.createBiquadFilter();
    const softness = ctx.createBiquadFilter();
    const volume = ctx.createGain();
    const t = ctx.currentTime;

    // A gentle pitch arch and closing vowel give the voice its "me-ow" shape.
    voice.type = "sawtooth";
    voice.frequency.setValueAtTime(580, t);
    voice.frequency.exponentialRampToValueAtTime(810, t + 0.16);
    voice.frequency.exponentialRampToValueAtTime(660, t + 0.32);
    voice.frequency.exponentialRampToValueAtTime(390, t + 0.72);
    vowel.type = "bandpass";
    vowel.Q.value = 0.8;
    vowel.frequency.setValueAtTime(1900, t);
    vowel.frequency.linearRampToValueAtTime(2200, t + 0.18);
    vowel.frequency.exponentialRampToValueAtTime(650, t + 0.65);
    softness.type = "lowpass";
    softness.frequency.value = 2800;
    volume.gain.setValueAtTime(0, t);
    volume.gain.linearRampToValueAtTime(0.16, t + 0.07);
    volume.gain.linearRampToValueAtTime(0.13, t + 0.3);
    volume.gain.exponentialRampToValueAtTime(0.001, t + 0.74);
    volume.gain.linearRampToValueAtTime(0, t + 0.78);
    voice.connect(vowel);
    vowel.connect(softness);
    softness.connect(volume);
    volume.connect(ctx.destination);
    voice.start(t);
    voice.stop(t + 0.8);
    voice.onended = () => {
      voice.disconnect();
      vowel.disconnect();
      softness.disconnect();
      volume.disconnect();
    };
  }
}
export const sound = new Sound();
