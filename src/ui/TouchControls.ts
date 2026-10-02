export class TouchControls {
  vector = { x: 0, y: 0 };
  private pointer: number | null = null;
  private knob: HTMLElement;
  private base: HTMLElement;
  private active = false;
  constructor(root: HTMLElement, interact: () => void) {
    this.base = root.querySelector<HTMLElement>("#joystick")!;
    this.knob = root.querySelector<HTMLElement>("#joystick-knob")!;
    this.base.addEventListener("pointerdown", (e) => {
      if (!this.active) return;
      e.preventDefault();
      this.pointer = e.pointerId;
      this.base.setPointerCapture(e.pointerId);
      this.move(e);
    });
    this.base.addEventListener("pointermove", (e) => {
      if (e.pointerId === this.pointer) this.move(e);
    });
    ["pointerup", "pointercancel", "lostpointercapture"].forEach((event) =>
      this.base.addEventListener(event, () => this.reset()),
    );
    root.querySelector("#touch-interact")!.addEventListener("click", interact);
    window.addEventListener("blur", () => this.reset());
  }
  enable(value: boolean) {
    this.active = value;
    if (!value) this.reset();
  }
  reset() {
    this.pointer = null;
    this.vector.x = 0;
    this.vector.y = 0;
    this.knob.style.transform = "translate(0px,0px)";
  }
  private move(e: PointerEvent) {
    const rect = this.base.getBoundingClientRect(),
      dx = e.clientX - rect.left - rect.width / 2,
      dy = e.clientY - rect.top - rect.height / 2;
    const length = Math.hypot(dx, dy),
      radius = rect.width * 0.29,
      scale = Math.min(1, radius / Math.max(length, 1));
    this.vector.x = length < 7 ? 0 : (dx * scale) / radius;
    this.vector.y = length < 7 ? 0 : (dy * scale) / radius;
    this.knob.style.transform = `translate(${dx * scale}px,${dy * scale}px)`;
  }
}
