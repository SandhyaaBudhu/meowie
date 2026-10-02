import Phaser from "phaser";
import {
  WORLD,
  decorations,
  fences,
  pond,
  sardineSpots,
  interactions,
} from "../../config/world";
import type { Obstacle } from "../../config/world";
import { Player } from "../Player";
import { Collectible } from "../Collectible";
import { Ambience } from "../Ambience";
import { InteractionEffects } from "../InteractionEffects";
import { sound } from "../../audio/Sound";
import type { CatCoat } from "../../config/cats";
export interface GameBridge {
  cat: CatCoat;
  touch: { x: number; y: number };
  ready(scene: GardenScene): void;
  count(value: number): void;
  prompt(value: string): void;
  message(value: string): void;
  complete(): void;
  pause(): void;
}
export class GardenScene extends Phaser.Scene {
  player!: Player;
  sardines: Collectible[] = [];
  obstacleBounds: Obstacle[] = [];
  mode: "home" | "playing" | "paused" | "complete" = "home";
  count = 0;
  private ambience!: Ambience;
  private interactionEffects!: InteractionEffects;
  private nearest?: (typeof interactions)[number];
  private lastRipple = 0;
  private bridge!: GameBridge;
  private interactKey!: Phaser.Input.Keyboard.Key;
  private hintKey!: Phaser.Input.Keyboard.Key;
  private nextHint = 0;
  constructor() {
    super("Garden");
  }
  create() {
    this.bridge = this.registry.get("bridge");
    this.count = 0;
    this.sardines = [];
    this.obstacleBounds = [];
    this.nearest = undefined;
    this.lastRipple = 0;
    this.nextHint = 0;
    this.add.image(0, 0, "garden").setOrigin(0).setDepth(0);
    this.physics.world.setBounds(75, 85, WORLD.width - 150, WORLD.height - 170);
    const solids = this.physics.add.staticGroup();
    const obstacle = (bounds: Obstacle) => {
      this.obstacleBounds.push(bounds);
      const zone = this.add.zone(bounds.x, bounds.y, bounds.w, bounds.h);
      solids.add(zone);
      const body = zone.body as Phaser.Physics.Arcade.StaticBody;
      body.setSize(bounds.w, bounds.h);
    };
    const interactiveObjects = new Map<string, Phaser.GameObjects.Image>();
    decorations.forEach((d) => {
      const scale = d.scale ?? 1;
      const image = this.add
        .image(d.x, d.y, d.kind)
        .setOrigin(0.5, 1)
        .setScale(scale)
        .setDepth(d.y);
      if (["bike", "mailbox", "chime", "yarn"].includes(d.kind))
        interactiveObjects.set(d.kind, image);
      if (d.obstacle)
        obstacle({
          x: d.x,
          y: d.y + (d.obstacle.dy ?? 0) * scale,
          w: d.obstacle.w * scale,
          h: d.obstacle.h * scale,
        });
      if (d.kind === "flowers")
        this.tweens.add({
          targets: image,
          angle: 2,
          duration: 1800 + (d.x % 500),
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
    });
    fences.forEach(obstacle);
    obstacle(pond);
    this.player = new Player(this, this.bridge.cat);
    this.physics.add.collider(this.player.sprite, solids);
    sardineSpots.forEach((s, i) =>
      this.sardines.push(new Collectible(this, s.x, s.y, s.label, i)),
    );
    this.ambience = new Ambience(this);
    this.interactionEffects = new InteractionEffects(this, interactiveObjects);
    this.interactKey = this.input.keyboard!.addKey("E");
    this.hintKey = this.input.keyboard!.addKey("H");
    // Key-down events preserve even a very brief tap between rendered frames.
    const onInteract = () => this.interact(),
      onHint = () => this.hint();
    this.interactKey.on("down", onInteract);
    this.hintKey.on("down", onHint);
    this.events.once("shutdown", () => {
      this.interactKey.off("down", onInteract);
      this.hintKey.off("down", onHint);
    });
    this.input.keyboard!.addCapture(["UP", "DOWN", "LEFT", "RIGHT", "SPACE"]);
    this.scale.on("resize", this.resize, this);
    this.events.once("shutdown", () =>
      this.scale.off("resize", this.resize, this),
    );
    this.setMode("home");
    this.resize();
    this.bridge.ready(this);
    this.time.addEvent({
      delay: 3600,
      loop: true,
      callback: () => this.ambience.ripple(1350, 780),
    });
  }
  resize() {
    const camera = this.cameras.main,
      w = this.scale.width,
      h = this.scale.height;
    if (this.mode === "home") {
      camera.stopFollow();
      camera.setBounds(-100, -100, WORLD.width + 200, WORLD.height + 200);
      camera.setZoom(Math.max(w / 2600, h / 1900));
      camera.centerOn(1220, 920);
    } else {
      // Keep a readable cat and touch targets on phones, while offering a wider desktop view.
      camera.setZoom(w < 700 ? 0.85 : Math.min(1.22, Math.max(0.9, w / 1350)));
      camera.setBounds(0, 0, WORLD.width, WORLD.height);
      camera.startFollow(this.player.sprite, true, 0.1, 0.1, 0, 25);
    }
  }
  start() {
    this.setMode("playing");
    this.bridge.count(this.count);
    this.bridge.message(
      "A sunny afternoon. Ten missing sardines. Let’s have a little look around.",
    );
  }
  setMode(mode: GardenScene["mode"]) {
    this.mode = mode;
    this.player?.stop();
    this.bridge.touch.x = 0;
    this.bridge.touch.y = 0;
    this.input.keyboard?.resetKeys();
    this.nearest = undefined;
    if (mode === "playing") {
      this.physics.world.resume();
      this.tweens.resumeAll();
      this.time.paused = false;
    } else if (mode === "home") {
      this.physics.world.pause();
      this.tweens.resumeAll();
      this.time.paused = false;
    } else {
      this.physics.world.pause();
      this.tweens.pauseAll();
      this.time.paused = true;
    }
    this.bridge.prompt("");
    this.resize();
  }
  restart() {
    this.mode = "playing";
    this.scene.restart();
  }
  interact() {
    if (this.mode !== "playing" || !this.nearest || this.player.locked) return;
    if (!this.interactionEffects.ready()) return;
    const target = this.nearest;
    sound.play(
      target.id === "bike"
        ? "bell"
        : target.id === "chime"
          ? "chime"
          : target.id === "yarn"
            ? "paw"
            : target.id === "box"
              ? "meow"
              : "interact",
    );
    this.bridge.message(target.message);
    this.interactionEffects.play(target, this.player.sprite);
    if (target.id === "pond") this.ambience.ripple();
    if (target.id === "box") {
      this.player.locked = true;
      this.player.stop();
      const sprite = this.player.sprite;
      const start = { x: sprite.x, y: sprite.y };
      const body = sprite.body as Phaser.Physics.Arcade.Body;
      body.enable = false;
      this.player.shadow.setVisible(false);
      this.tweens.add({
        targets: sprite,
        x: target.x,
        y: target.y - 35,
        alpha: 0.35,
        angle: 8,
        duration: 350,
        ease: "Back.easeOut",
        yoyo: true,
        hold: 650,
        onComplete: () => {
          this.player.locked = false;
          sprite.setAlpha(1).setAngle(0);
          body.enable = true;
          body.reset(start.x, start.y);
          this.player.shadow.setVisible(true);
        },
      });
      const heart = this.add
        .text(sprite.x, sprite.y - 85, "♡", {
          fontSize: "35px",
          color: "#bf826f",
        })
        .setOrigin(0.5)
        .setDepth(3000);
      this.tweens.add({
        targets: heart,
        y: heart.y - 25,
        alpha: 0,
        duration: 1600,
        onComplete: () => heart.destroy(),
      });
    }
  }
  hint() {
    if (this.mode !== "playing") return;
    const remaining = this.sardines.filter((s) => !s.collected);
    if (!remaining.length) {
      this.bridge.message("Every sardine is home. The afternoon is yours.");
      return;
    }
    if (this.time.now < this.nextHint) {
      this.bridge.message(
        "Follow the little golden circle. You’re getting warmer.",
      );
      return;
    }
    this.nextHint = this.time.now + 5000;
    const p = this.player.sprite;
    remaining.sort(
      (a, b) =>
        Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y),
    );
    const s = remaining[0];
    this.bridge.message(`A little nose knows… try ${s.label.toLowerCase()}.`);
    const ring = this.add
      .circle(s.x, s.y, 48)
      .setStrokeStyle(3, 0xfff1b0)
      .setDepth(s.y + 30);
    this.tweens.add({
      targets: ring,
      scale: 1.5,
      alpha: 0,
      duration: 1200,
      repeat: 3,
      onComplete: () => ring.destroy(),
    });
    const direction = Math.atan2(s.y - p.y, s.x - p.x);
    const arrow = this.add
      .triangle(
        p.x + Math.cos(direction) * 80,
        p.y + Math.sin(direction) * 80,
        0,
        0,
        22,
        10,
        0,
        20,
        0xfff1b0,
      )
      .setRotation(direction)
      .setDepth(3000);
    this.tweens.add({
      targets: arrow,
      alpha: 0,
      duration: 3000,
      onComplete: () => arrow.destroy(),
    });
  }
  update(time: number, delta: number) {
    if (!this.player) return;
    if (this.mode === "home") {
      this.ambience.update(time, -1000, -1000);
      this.sardines.forEach((s) => s.update(time, -1000, -1000));
      return;
    }
    if (this.mode !== "playing") return;
    this.player.update(Math.min(delta, 50), this.bridge.touch);
    const p = this.player.sprite;
    this.ambience.update(time, p.x, p.y);
    this.sardines.forEach((s) => {
      s.update(time, p.x, p.y);
      if (
        !s.collected &&
        Phaser.Math.Distance.Between(p.x, p.y, s.x, s.y) < 49
      ) {
        s.collect();
        sound.play("collect");
        this.count++;
        this.bridge.count(this.count);
        if (this.count === 10) {
          this.player.stop();
          this.player.locked = true;
          this.time.delayedCall(600, () => {
            this.setMode("complete");
            this.bridge.complete();
          });
        }
      }
    });
    const near = interactions
      .filter(
        (i) => Phaser.Math.Distance.Between(p.x, p.y, i.x, i.y) < i.radius,
      )
      .sort(
        (a, b) =>
          Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y),
      )[0];
    if (near !== this.nearest) {
      this.nearest = near;
      this.bridge.prompt(near ? near.prompt : "");
    }
    if (
      Math.hypot(p.x - 1300, p.y - 1000) < 150 &&
      time - this.lastRipple > 5000
    ) {
      this.lastRipple = time;
      this.ambience.ripple(1300, 885);
    }
  }
}
