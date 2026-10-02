import Phaser from "phaser";

interface InteractiveItem {
  id: string;
  x: number;
  y: number;
}

/** Small reusable reactions; effects use the scene clock so pausing freezes them. */
export class InteractionEffects {
  private readyAt = 0;

  constructor(
    private scene: Phaser.Scene,
    private objects: Map<string, Phaser.GameObjects.Image>,
  ) {}

  ready() {
    if (this.scene.time.now < this.readyAt) return false;
    this.readyAt = this.scene.time.now + 1500;
    return true;
  }

  play(item: InteractiveItem, player: { x: number; y: number }) {
    const image = this.objects.get(item.id);
    if (!image) return;
    if (item.id === "bike") {
      this.scene.tweens.add({
        targets: image,
        angle: 2,
        duration: 80,
        yoyo: true,
        repeat: 3,
      });
      this.float(item.x + 45, item.y - 90, "♪", "#bd956a");
      this.float(item.x + 70, item.y - 115, "♫", "#8b9b76", 150);
    } else if (item.id === "mailbox") {
      const letter = this.scene.add
        .container(item.x + 15, item.y - 88)
        .setDepth(3000);
      const paper = this.scene.add
        .rectangle(0, 0, 38, 27, 0xfff5db)
        .setStrokeStyle(2, 0xc3ad89);
      const fold = this.scene.add.graphics().lineStyle(1.5, 0xc3ad89);
      fold.strokePoints([
        { x: -18, y: -12 },
        { x: 0, y: 2 },
        { x: 18, y: -12 },
      ]);
      const heart = this.scene.add
        .text(0, 3, "♡", { fontSize: "14px", color: "#b8867c" })
        .setOrigin(0.5);
      letter.add([paper, fold, heart]);
      this.scene.tweens.add({
        targets: letter,
        y: letter.y - 48,
        angle: -9,
        alpha: 0,
        duration: 1400,
        ease: "Sine.easeOut",
        onComplete: () => letter.destroy(),
      });
    } else if (item.id === "chime") {
      this.scene.tweens.add({
        targets: image,
        angle: 4,
        duration: 220,
        ease: "Sine.easeInOut",
        yoyo: true,
        repeat: 2,
      });
      ["♪", "♫", "♪"].forEach((note, i) =>
        this.float(
          item.x - 35 + i * 23,
          item.y - 120 - i * 12,
          note,
          "#91a383",
          i * 170,
        ),
      );
    } else if (item.id === "yarn") {
      const direction = new Phaser.Math.Vector2(
        item.x - player.x,
        item.y - player.y,
      ).normalize();
      if (direction.lengthSq() === 0) direction.set(1, 0);
      this.scene.tweens.add({
        targets: image,
        x: item.x + direction.x * 34,
        y: item.y + direction.y * 20,
        angle: 65,
        duration: 380,
        ease: "Sine.easeInOut",
        yoyo: true,
        onComplete: () => image.setPosition(item.x, item.y).setAngle(0),
      });
      this.float(item.x, item.y - 50, "♡", "#b8867c");
    }
  }

  private float(
    x: number,
    y: number,
    symbol: string,
    color: string,
    delay = 0,
  ) {
    const text = this.scene.add
      .text(x, y, symbol, {
        fontFamily: "Georgia, serif",
        fontSize: "28px",
        color,
      })
      .setOrigin(0.5)
      .setDepth(3000);
    this.scene.tweens.add({
      targets: text,
      y: y - 38,
      alpha: 0,
      duration: 1300,
      delay,
      ease: "Sine.easeOut",
      onComplete: () => text.destroy(),
    });
  }
}
