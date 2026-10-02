import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
await mkdir("test-results", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.on("pageerror", (e) => console.log("ERROR:", e.message));
page.on("console", (m) => {
  if (m.type() === "error") console.log("CONSOLE:", m.text());
});
await page.goto("http://localhost:5173");
await page.waitForSelector("#loading", { state: "hidden" });
await page.screenshot({ path: "test-results/home.png" });
await page.getByRole("button", { name: "Let’s play" }).click();
await page.waitForTimeout(1600);
console.log(
  await page.evaluate(() => {
    const s = window.__miso.ui.scene;
    return {
      mode: s.mode,
      cat: { x: s.player.sprite.x, y: s.player.sprite.y },
      sardines: s.sardines.length,
      solids: s.obstacleBounds.length,
      canvas: { w: s.scale.width, h: s.scale.height },
    };
  }),
);
await page.screenshot({ path: "test-results/game.png" });
await browser.close();
