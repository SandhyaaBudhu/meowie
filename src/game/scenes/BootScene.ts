import Phaser from "phaser";
import { textures, catTexture } from "../../assets/art";
import { gardenSVG } from "../../assets/garden";
import { cats } from "../../config/cats";
export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }
  preload() {
    const load = (key: string, svg: string) => {
      const bytes = new TextEncoder().encode(svg);
      const data = btoa(
        Array.from(bytes, (byte) => String.fromCharCode(byte)).join(""),
      );
      this.load.svg(key, `data:image/svg+xml;base64,${data}`);
    };
    load("garden", gardenSVG());
    Object.entries(textures).forEach(([key, svg]) => load(key, svg));
    for (const cat of cats)
      for (const direction of ["up", "down", "left", "right"])
        for (let frame = 0; frame < 4; frame++)
          load(`cat-${cat.id}-${direction}-${frame}`, catTexture(direction, frame, cat.id));
  }
  create() {
    this.scene.start("Garden");
  }
}
