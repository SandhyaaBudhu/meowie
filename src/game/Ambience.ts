import Phaser from "phaser";
export class Ambience {
  private butterflies: Phaser.GameObjects.Image[] = [];
  private birds: {
    image: Phaser.GameObjects.Image;
    home: { x: number; y: number };
    away: boolean;
  }[] = [];
  constructor(private scene: Phaser.Scene) {
    [
      [480, 780],
      [1950, 1360],
      [1500, 570],
      [940, 1370],
    ].forEach(([x, y], i) => {
      const b = scene.add
        .image(x, y, "butterfly")
        .setScale(0.6)
        .setDepth(y + 90);
      b.setData("home", { x, y, i });
      this.butterflies.push(b);
    });
    [
      [940, 990],
      [1750, 1100],
      [590, 1260],
    ].forEach(([x, y]) => {
      const image = scene.add.image(x, y, "bird").setDepth(y);
      this.birds.push({ image, home: { x, y }, away: false });
    });
    for (let i = 0; i < 9; i++) {
      const dot = scene.add
        .circle(1100 + i * 44, 800 + Math.sin(i) * 56, 2, 0xeaf1d4, 0.4)
        .setDepth(2);
      scene.tweens.add({
        targets: dot,
        alpha: 0.05,
        y: dot.y - 20,
        duration: 2500 + i * 260,
        yoyo: true,
        repeat: -1,
      });
    }
  }
  update(time: number, x: number, y: number) {
    this.butterflies.forEach((b) => {
      const h = b.getData("home");
      b.setPosition(
        h.x + Math.sin(time / 2300 + h.i) * 60,
        h.y + Math.cos(time / 1700 + h.i) * 36,
      );
      b.setScale(0.55 + Math.sin(time / 95) * 0.16, 0.6);
    });
    this.birds.forEach((b) => {
      if (
        !b.away &&
        Phaser.Math.Distance.Between(x, y, b.image.x, b.image.y) < 115
      ) {
        b.away = true;
        this.scene.tweens.add({
          targets: b.image,
          x: b.image.x + 150,
          y: b.image.y - 220,
          alpha: 0,
          duration: 950,
          ease: "Sine.easeOut",
          onComplete: () => {
            this.scene.time.delayedCall(14000, () => {
              b.image.setPosition(b.home.x, b.home.y).setAlpha(1);
              b.away = false;
            });
          },
        });
      }
    });
  }
  ripple(x = 1300, y = 820) {
    for (let i = 0; i < 3; i++) {
      const ring = this.scene.add
        .ellipse(x, y, 20, 10)
        .setStrokeStyle(2, 0xeaf2d7, 0.7)
        .setDepth(3);
      this.scene.tweens.add({
        targets: ring,
        scaleX: 6,
        scaleY: 6,
        alpha: 0,
        delay: i * 200,
        duration: 1400,
        onComplete: () => ring.destroy(),
      });
    }
  }
}
