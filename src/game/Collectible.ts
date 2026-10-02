import Phaser from "phaser";
export class Collectible {
  collected = false;
  sprite: Phaser.GameObjects.Image;
  private glow: Phaser.GameObjects.Ellipse;
  constructor(
    private scene: Phaser.Scene,
    public x: number,
    public y: number,
    public label: string,
    private index: number,
  ) {
    this.glow = scene.add.ellipse(x, y, 72, 48, 0xfff5b8, 0.26).setDepth(y - 1);
    this.sprite = scene.add
      .image(x, y, "fish")
      .setScale(0.78)
      .setDepth(y + 20);
  }
  update(time: number, px: number, py: number) {
    if (this.collected) return;
    const near = Phaser.Math.Distance.Between(px, py, this.x, this.y) < 140;
    this.sprite.y = this.y + Math.sin(time / 650 + this.index) * 5;
    this.sprite.rotation = Math.sin(time / 950 + this.index) * 0.07;
    this.glow.setAlpha((near ? 0.42 : 0.23) + Math.sin(time / 500) * 0.07);
    this.sprite.setScale(near ? 0.9 : 0.78);
  }
  collect() {
    this.collected = true;
    this.glow.destroy();
    this.scene.tweens.add({
      targets: this.sprite,
      y: this.sprite.y - 35,
      scale: 1.1,
      alpha: 0,
      duration: 250,
      onComplete: () => this.sprite.destroy(),
    });
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4,
        spark = this.scene.add
          .star(this.x, this.y, 4, 2, 5, 0xfff9d7)
          .setDepth(this.y + 100);
      this.scene.tweens.add({
        targets: spark,
        x: this.x + Math.cos(a) * 42,
        y: this.y + Math.sin(a) * 42,
        alpha: 0,
        scale: 0.2,
        duration: 550,
        onComplete: () => spark.destroy(),
      });
    }
  }
}
