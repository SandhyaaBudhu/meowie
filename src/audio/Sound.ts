import meowUrl from "./meow.mp3";

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
  private meowAudio = new Audio(meowUrl);
  constructor() {
    this.meowAudio.preload = "auto";
    this.meowAudio.volume = 0.45;
    try {
      this.enabled = localStorage.getItem("miso-sound") !== "off";
    } catch {
      /* Private browsing can disable storage. */
    }
  }
  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.meowAudio.pause();
      this.meowAudio.currentTime = 0;
    }
    try {
      localStorage.setItem("miso-sound", this.enabled ? "on" : "off");
    } catch {
      /* The game still works without persistence. */
    }
  }
  play(cue: Cue) {
    if (!this.enabled) return;
    if (cue === "meow") {
      this.meowAudio.currentTime = 0;
      void this.meowAudio.play().catch(() => {
        // Browsers may block playback until the next user gesture.
      });
      return;
    }
    this.context ??= new AudioContext();
    void this.context.resume();
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
}
export const sound = new Sound();
