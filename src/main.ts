import Phaser from "phaser";
import { BootScene } from "./game/scenes/BootScene";
import { GardenScene } from "./game/scenes/GardenScene";
import { UI } from "./ui/UI";
import "./style.css";
const ui = new UI(document.querySelector("#app")!);
const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: "#cbd3ad",
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  render: { antialias: true, roundPixels: false },
  physics: {
    default: "arcade",
    arcade: { debug: false, gravity: { x: 0, y: 0 } },
  },
  scene: [BootScene, GardenScene],
  callbacks: {
    preBoot: (g) => g.registry.set("bridge", ui),
    postBoot: (g) => {
      // Observe the actual host: mobile orientation and browser chrome can resize
      // CSS viewport units independently of Phaser's window-size polling.
      const observer = new ResizeObserver((entries) => {
        const { width, height } = entries[0].contentRect;
        if (width > 0 && height > 0) g.scale.resize(width, height);
      });
      observer.observe(document.querySelector("#game")!);
      g.events.once("destroy", () => observer.disconnect());
    },
  },
});
// Exposed only on the development server for deterministic browser integration tests.
if (import.meta.env.DEV)
  (window as unknown as { __miso: unknown }).__miso = { game, ui };
