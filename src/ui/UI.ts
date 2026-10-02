import type { GardenScene, GameBridge } from "../game/scenes/GardenScene";
import { sound } from "../audio/Sound";
import { catTexture } from "../assets/art";
import { cats, DEFAULT_CAT, isCatCoat, type CatCoat } from "../config/cats";
import { icon } from "./icons";
import { TouchControls } from "./TouchControls";
export class UI implements GameBridge {
  cat: CatCoat = DEFAULT_CAT;
  touch: { x: number; y: number };
  scene?: GardenScene;
  private controls: TouchControls;
  private restartPending = false;
  private modalKind = "";
  private previousMode: GardenScene["mode"] = "home";
  private helpFromPause = false;
  private toastTimer = 0;
  private lastFocus?: HTMLElement;
  constructor(private root: HTMLElement) {
    try {
      const saved = localStorage.getItem("meowie-coat");
      if (isCatCoat(saved)) this.cat = saved;
    } catch {}
    const cat = this.catImage(this.cat);
    const selected = cats.find((cat) => cat.id === this.cat)!;
    const choices = cats.map((coat) => `<label class="cat-choice"><input type="radio" name="cat-coat" value="${coat.id}" ${coat.id === this.cat ? "checked" : ""}><span class="cat-choice-art"><img src="${this.catImage(coat.id)}" alt="" width="64" height="64"><span>${coat.label}</span></span></label>`).join("");
    root.innerHTML = `
      <div id="game" aria-label="Meowie’s garden adventure"></div>
      <div class="world-shade" aria-hidden="true"></div>
      <header class="header"><a class="brand" href="#" data-action="home" aria-label="Meowie’s Little Adventure home"><span class="brand-icon">${icon("paw")}</span><span>MEOWIE<span class="brand-sub">LITTLE ADVENTURES</span></span></a><nav aria-label="Main navigation"><button class="nav-link" data-action="about">A little about this</button><span class="nav-divider"></span><button class="icon-button sound-button" data-action="sound" aria-label="Turn sound off">${icon("sound")}</button></nav></header>
      <main id="home" class="home">
        <div class="eyebrow"><span class="tiny-sun">✺</span> A POCKET-SIZED ESCAPE</div>
        <h1><span class="miso-title">Meowie’s</span><br>Little<br>Adventure<span class="title-dot">.</span></h1>
        <p class="subtitle">A tiny adventure about one cat<br>and ten missing sardines.</p>
        <p class="intro">Take the scenic route. Follow your curiosity.<br>There’s no hurry here.</p>
        <div class="home-actions"><button class="primary" data-action="play">Let’s play ${icon("arrow")}</button><button class="secondary" data-action="help">How to play</button></div>
        <div class="home-meta"><span>~ 5–10 MINUTES</span><i></i><span>ONE VERY GOOD CAT</span></div>
      </main>
      <div id="home-details" class="home-details"><div class="garden-tag"><span class="live-dot"></span> CHAMOMILE GARDEN <span class="tag-weather">22° &nbsp; ☀</span></div><fieldset class="cat-picker"><legend>Choose your Meowie</legend><div class="cat-choices">${choices}</div></fieldset><div class="miso-card"><img id="explorer-image" src="${cat}" alt="Meowie: ${selected.description}"><div><span class="eyebrow">MEET YOUR EXPLORER</span><strong>Meowie</strong><span id="coat-label">${selected.label}</span></div><span class="card-heart">♡</span></div><div class="scene-note"><span>01 / A SUNNY AFTERNOON</span><span>Made for a little wandering ${icon("compass")}</span></div></div>
      <section id="hud" class="hud hidden" aria-label="Game controls"><div class="count-pill"><span class="fish-icon">${icon("fish")}</span><strong id="count">0 <span>/ 10</span></strong><div class="count-caption">SARDINES FOUND</div></div><div class="hud-tools"><button class="pill-button" data-action="hint" aria-label="Get a hint">${icon("compass")}<span>A little hint</span></button><button class="icon-button" data-action="help" aria-label="How to play">${icon("info")}</button><button class="icon-button" data-action="pause" aria-label="Pause adventure">${icon("pause")}</button></div></section>
      <div id="game-caption" class="game-caption hidden"><span class="live-dot"></span> CHAMOMILE GARDEN <span class="caption-rule"></span><span class="keyboard-caption"><kbd>W A S D</kbd> to wander &nbsp; <kbd>E</kbd> to explore</span><span class="touch-caption">A little garden. A little adventure.</span></div>
      <div id="interaction" class="interaction hidden"><kbd>E</kbd><span></span></div>
      <div id="toast" class="toast hidden" role="status"></div>
      <div id="touch-controls" class="touch-controls hidden"><div id="joystick" role="group" aria-label="Movement joystick"><div class="joystick-cross"></div><div id="joystick-knob">${icon("paw")}</div></div><button id="touch-interact" aria-label="Interact with nearby object">E<span>EXPLORE</span></button></div>
      <footer id="credits" class="credits"><span>A SMALL WORLD, A SOFT LANDING.</span><button data-action="about">Made by Your Name <span>↗</span></button></footer>
      <div id="modal-layer" class="modal-layer hidden"><div class="modal-backdrop"></div><section id="modal" class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"></section></div>
      <div id="loading" class="loading"><span class="brand-icon">${icon("paw")}</span><p>A little garden is growing…</p></div>
      <div id="confetti" aria-hidden="true"></div>`;
    this.controls = new TouchControls(root, () => this.scene?.interact());
    this.touch = this.controls.vector;
    root.addEventListener("change", (e) => {
      const input = e.target as HTMLInputElement;
      if (input.name !== "cat-coat" || !isCatCoat(input.value)) return;
      this.cat = input.value;
      const selected = cats.find((cat) => cat.id === this.cat)!;
      const preview = this.el("explorer-image") as HTMLImageElement;
      preview.src = this.catImage(this.cat);
      preview.alt = `Meowie: ${selected.description}`;
      this.el("coat-label").textContent = selected.label;
      this.scene?.player.setCoat(this.cat);
      sound.play("click");
      try { localStorage.setItem("meowie-coat", this.cat); } catch {}
    });
    root.addEventListener("click", (e) => {
      const target = (e.target as HTMLElement).closest<HTMLElement>(
        "[data-action]",
      );
      if (target) {
        e.preventDefault();
        sound.play("click");
        this.action(target.dataset.action!);
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !e.repeat) {
        e.preventDefault();
        if (this.modalKind) this.closeModal();
        else if (this.scene?.mode === "playing") this.pause();
      }
      if (e.key === "Tab" && this.modalKind) this.trapFocus(e);
    });
    window.addEventListener("blur", () => {
      if (this.scene?.mode === "playing") this.pause();
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && this.scene?.mode === "playing") this.pause();
    });
    this.updateSound();
  }
  private catImage(coat: CatCoat) {
    return `data:image/svg+xml,${encodeURIComponent(catTexture("down", 0, coat))}`;
  }
  ready(scene: GardenScene) {
    this.scene = scene;
    this.root.querySelector("#loading")!.classList.add("hidden");
    if (this.restartPending) {
      this.restartPending = false;
      this.play();
    }
  }
  private el(id: string) {
    return this.root.querySelector<HTMLElement>(`#${id}`)!;
  }
  private action(action: string) {
    switch (action) {
      case "play":
        this.play();
        break;
      case "sound":
        sound.toggle();
        this.updateSound();
        break;
      case "pause":
        this.pause();
        break;
      case "resume":
        this.closeModal();
        break;
      case "restart":
        this.restart();
        break;
      case "home":
        this.home();
        break;
      case "help":
        this.help();
        break;
      case "about":
        this.about();
        break;
      case "close":
        this.closeModal();
        break;
      case "continue":
        this.dismiss();
        this.scene!.player.locked = false;
        this.scene!.setMode("playing");
        this.controls.enable(true);
        this.message(
          "All ten found. Stay a little longer — the garden is yours.",
        );
        break;
      case "hint":
        this.scene?.hint();
        break;
    }
  }
  private updateSound() {
    this.root.querySelectorAll(".sound-button").forEach((b) => {
      b.innerHTML = icon(sound.enabled ? "sound" : "mute");
      b.setAttribute(
        "aria-label",
        sound.enabled ? "Turn sound off" : "Turn sound on",
      );
      b.setAttribute("aria-pressed", String(sound.enabled));
    });
  }
  private play() {
    if (!this.scene) return;
    this.dismiss();
    this.el("home").classList.add("hidden");
    this.el("home-details").classList.add("hidden");
    this.el("credits").classList.add("hidden");
    this.el("hud").classList.remove("hidden");
    this.el("game-caption").classList.remove("hidden");
    this.el("touch-controls").classList.remove("hidden");
    this.root.classList.add("is-playing");
    this.controls.enable(true);
    this.scene.start();
    (document.activeElement as HTMLElement)?.blur();
  }
  private home() {
    this.dismiss();
    this.scene?.setMode("home");
    this.scene?.scene.restart();
    this.controls.enable(false);
    this.root.classList.remove("is-playing");
    ["home", "home-details", "credits"].forEach((id) =>
      this.el(id).classList.remove("hidden"),
    );
    ["hud", "game-caption", "touch-controls", "toast", "interaction"].forEach(
      (id) => this.el(id).classList.add("hidden"),
    );
  }
  private restart() {
    this.dismiss();
    this.controls.enable(false);
    this.restartPending = true;
    this.scene?.restart();
  }
  count(value: number) {
    this.el("count").innerHTML = `${value} <span>/ 10</span>`;
    this.el("count").setAttribute(
      "aria-label",
      `${value} of 10 sardines found`,
    );
    this.el("count").classList.remove("pop");
    void this.el("count").offsetWidth;
    this.el("count").classList.add("pop");
  }
  prompt(value: string) {
    this.el("interaction").classList.toggle("hidden", !value);
    this.el("interaction").querySelector("span")!.textContent = value;
    this.el("touch-interact").classList.toggle("available", !!value);
  }
  message(value: string) {
    window.clearTimeout(this.toastTimer);
    this.el("toast").textContent = value;
    this.el("toast").classList.remove("hidden");
    this.toastTimer = window.setTimeout(
      () => this.el("toast").classList.add("hidden"),
      4800,
    );
  }
  pause() {
    if (this.scene?.mode !== "playing") return;
    this.previousMode = "playing";
    this.scene.setMode("paused");
    this.controls.enable(false);
    this.show(
      "pause",
      `<div class="modal-symbol">${icon("paw")}</div><p class="eyebrow">A MOMENT TO PAWS</p><h2 id="modal-title">Take your time.</h2><p>The garden will be right here.</p><div class="modal-actions"><button class="primary" data-action="resume">Resume adventure ${icon("arrow")}</button><button class="secondary" data-action="restart">Restart adventure</button><button class="text-button" data-action="help">How to play</button><button class="text-button" data-action="home">Return to home</button></div>`,
    );
  }
  private help() {
    this.helpFromPause = this.modalKind === "pause";
    if (this.helpFromPause) {
      this.dismiss();
      this.previousMode = "playing";
    } else this.prepareModal();
    this.show(
      "help",
      `<button class="modal-close icon-button" data-action="close" aria-label="Close controls">${icon("close")}</button><p class="eyebrow">CURIOSITY IS YOUR COMPASS</p><h2 id="modal-title">A little field guide.</h2><p>Help Meowie find all <strong>10 missing sardines</strong>.<br>Walk close to a fish to scoop it up.</p><div class="control-list"><div><span class="control-keys"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></span><span>Wander around<span>Arrow keys work, too.</span></span></div><div><span class="control-keys"><kbd>E</kbd></span><span>Investigate<span>Boxes, benches & little curiosities.</span></span></div><div><span class="control-keys"><kbd>H</kbd><kbd>Esc</kbd></span><span>Hint / pause<span>Take a breather whenever you like.</span></span></div></div><div class="help-note"><strong>On a phone or tablet?</strong> Use the thumbstick to wander and the E button to investigate. Landscape gives you a little more room.</div><button class="primary" data-action="close">Got it ${icon("arrow")}</button><p class="modal-footnote">No timer. No scores. Just a very nice afternoon.</p>`,
    );
  }
  private about() {
    this.prepareModal();
    this.show(
      "about",
      `<button class="modal-close icon-button" data-action="close" aria-label="Close about">${icon("close")}</button><div class="modal-symbol">${icon("paw")}</div><p class="eyebrow">SMALL BY DESIGN</p><h2 id="modal-title">A little world<br>to get lost in.</h2><p><em>Meowie’s Little Adventure</em> is a short interactive browser-game demonstration, made for a portfolio and a few peaceful minutes of play.</p><div class="tech-tags"><span>Phaser</span><span>TypeScript</span><span>Vite</span></div><p class="about-detail">Original vector illustrations. A hand-designed garden. Tiny generated sounds. One exceptionally curious cat.</p><div class="portfolio-credit">Created by <strong>Your Name</strong><span>Add your portfolio link here · see README</span></div><button class="primary" data-action="close">Back to the garden ${icon("arrow")}</button>`,
    );
  }
  complete() {
    sound.play("complete");
    this.controls.enable(false);
    this.previousMode = "complete";
    this.show(
      "complete",
      `<div class="completion-cat"><img src="${this.catImage(this.cat)}" alt="Happy Meowie"><span>✦</span><span>✧</span></div><p class="eyebrow">TEN OUT OF TEN. PURRFECT.</p><h2 id="modal-title">Adventure Complete!</h2><p>Meowie found every missing sardine. 🐟</p><div class="completion-count">${icon("fish")} 10 / 10 <span>ONE HAPPY LITTLE CAT</span></div><div class="modal-actions"><button class="primary" data-action="continue">Continue exploring ${icon("arrow")}</button><button class="secondary" data-action="restart">Play again</button><button class="text-button" data-action="home">Return home</button></div>`,
    );
    for (let i = 0; i < 36; i++) {
      const p = document.createElement("i");
      p.style.cssText = `--x:${(i * 31.7) % 100}%;--delay:${(i % 9) * 0.07}s;--rot:${i * 49}deg;background:${["#d4af83", "#8fa787", "#b6c8b0", "#dbaba0"][i % 4]}`;
      this.el("confetti").append(p);
    }
    window.setTimeout(() => this.el("confetti").replaceChildren(), 4500);
  }
  private prepareModal() {
    if (!this.modalKind) this.previousMode = this.scene?.mode ?? "home";
    if (this.scene?.mode === "playing") {
      this.scene.setMode("paused");
      this.controls.enable(false);
    }
  }
  private show(kind: string, html: string) {
    this.lastFocus = document.activeElement as HTMLElement;
    this.modalKind = kind;
    this.el("modal").innerHTML = html;
    this.el("modal-layer").classList.remove("hidden");
    this.el("home").inert = true;
    this.el("hud").inert = true;
    this.root.querySelector<HTMLElement>(".header")!.inert = true;
    this.el("home-details").inert = true;
    this.el("credits").inert = true;
    this.el("touch-controls").inert = true;
    this.el("modal").querySelector<HTMLElement>("button")?.focus();
  }
  private dismiss() {
    this.modalKind = "";
    this.el("modal-layer").classList.add("hidden");
    ["home", "hud", "home-details", "credits", "touch-controls"].forEach(
      (id) => (this.el(id).inert = false),
    );
    this.root.querySelector<HTMLElement>(".header")!.inert = false;
    this.lastFocus?.focus();
  }
  private closeModal() {
    if (this.modalKind === "complete") {
      this.action("continue");
      return;
    }
    const was = this.modalKind;
    this.dismiss();
    if (was === "help" && this.helpFromPause) {
      this.scene!.setMode("playing");
      this.pause();
    } else if (this.previousMode === "playing") {
      this.scene!.setMode("playing");
      this.controls.enable(true);
    } else this.scene?.setMode(this.previousMode);
  }
  private trapFocus(e: KeyboardEvent) {
    const buttons = Array.from(
      this.el("modal").querySelectorAll<HTMLElement>("button,a[href]"),
    );
    const first = buttons[0],
      last = buttons[buttons.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}
