import Phaser from "phaser";
import { WORLD } from "../config/world";
import { DEFAULT_CAT, type CatCoat } from "../config/cats";
export class Player {
  sprite: Phaser.Physics.Arcade.Sprite;
  shadow: Phaser.GameObjects.Ellipse;
  private keys: Record<string, Phaser.Input.Keyboard.Key>;
  private facing = "down";
  private phase = 0;
  locked = false;
  constructor(private scene: Phaser.Scene, private coat: CatCoat = DEFAULT_CAT) {
    this.shadow = scene.add.ellipse(
      WORLD.spawn.x,
      WORLD.spawn.y + 8,
      44,
      16,
      0x465641,
      0.16,
    );
    this.sprite = scene.physics.add
      .sprite(WORLD.spawn.x, WORLD.spawn.y, `cat-${coat}-down-0`)
      .setOrigin(0.5, 0.85);
    this.sprite.body!.setSize(30, 24).setOffset(25, 49);
    this.sprite.setCollideWorldBounds(true);
    this.keys = scene.input.keyboard!.addKeys(
      "W,A,S,D,UP,DOWN,LEFT,RIGHT",
    ) as Record<string, Phaser.Input.Keyboard.Key>;
  }
  update(delta: number, touch: { x: number; y: number }) {
    let x =
      Number(this.keys.D.isDown || this.keys.RIGHT.isDown) -
      Number(this.keys.A.isDown || this.keys.LEFT.isDown) +
      touch.x;
    let y =
      Number(this.keys.S.isDown || this.keys.DOWN.isDown) -
      Number(this.keys.W.isDown || this.keys.UP.isDown) +
      touch.y;
    if (this.locked) {
      x = 0;
      y = 0;
    }
    const length = Math.hypot(x, y);
    if (length > 1) {
      x /= length;
      y /= length;
    }
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    const factor = 1 - Math.exp(-delta / 70);
    this.sprite.setVelocity(
      Phaser.Math.Linear(body.velocity.x, x * WORLD.speed, factor),
      Phaser.Math.Linear(body.velocity.y, y * WORLD.speed, factor),
    );
    if (length > 0.12) {
      this.facing =
        Math.abs(x) > Math.abs(y)
          ? x > 0
            ? "right"
            : "left"
          : y > 0
            ? "down"
            : "up";
      this.phase += delta;
      this.sprite.setTexture(
        `cat-${this.coat}-${this.facing}-${Math.floor(this.phase / 135) % 4}`,
      );
      this.sprite.setScale(1, 1 + Math.sin(this.phase / 85) * 0.025);
    } else {
      this.phase = 0;
      this.sprite.setTexture(`cat-${this.coat}-${this.facing}-0`);
      this.sprite.setScale(1, 1 + Math.sin(this.scene.time.now / 700) * 0.012);
    }
    this.sprite.setDepth(this.sprite.y);
    this.shadow
      .setPosition(this.sprite.x, this.sprite.y + 3)
      .setDepth(this.sprite.y - 1);
  }
  setCoat(coat: CatCoat) {
    this.coat = coat;
    this.sprite.setTexture(`cat-${coat}-${this.facing}-0`);
  }
  stop() {
    this.sprite.setVelocity(0, 0);
  }
}
