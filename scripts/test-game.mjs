import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";

const url = process.env.MISO_TEST_URL ?? "http://localhost:5173";
await mkdir("test-results", { recursive: true });
const browser = await chromium.launch({
  channel: process.env.MISO_BROWSER_CHANNEL ?? "chrome",
  headless: true,
});
const errors = [],
  results = [];
const record = (name) => {
  results.push(name);
  console.log(`PASS ${name}`);
};
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
const snapshot = () =>
  page.evaluate(() => {
    const s = window.__miso.ui.scene;
    return {
      mode: s.mode,
      count: s.count,
      x: s.player.sprite.x,
      y: s.player.sprite.y,
      locked: s.player.locked,
      velocity: {
        x: s.player.sprite.body.velocity.x,
        y: s.player.sprite.body.velocity.y,
      },
      total: s.sardines.length,
    };
  });
async function keyMove(key, ms) {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
  await page.waitForTimeout(180);
}
async function resetAt(x, y) {
  await page.evaluate(
    ({ x, y }) => {
      const s = window.__miso.ui.scene;
      s.player.sprite.body.reset(x, y);
      s.player.stop();
    },
    { x, y },
  );
}
try {
  await page.goto(url);
  await page.waitForSelector("#loading", { state: "hidden" });
  assert.equal((await snapshot()).total, 10);
  record("Exactly ten collectibles at boot");
  const coveredFish = await page.evaluate(() => {
    const scene = window.__miso.ui.scene;
    const scenery = scene.children.list.filter(object => object.texture &&
      !['garden', 'fish', 'bird', 'butterfly'].includes(object.texture.key) &&
      !object.texture.key.startsWith('cat-'));
    return scene.sardines.flatMap(fish => scenery.filter(object => {
      if (object.depth < fish.sprite.depth) return false;
      const bounds = object.getBounds();
      // Include the largest fish scale, rotation, bobbing and surrounding glow.
      return fish.x - 36 < bounds.right && fish.x + 36 > bounds.left &&
        fish.y - 30 < bounds.bottom && fish.y + 30 > bounds.top;
    }).map(object => `${fish.label} is covered by ${object.texture.key}`));
  });
  assert.deepEqual(coveredFish, []);
  record("All ten sardines stay clear of foreground artwork, including their glow and bobbing");
  assert.match(await page.title(), /Meowie/);
  const coats = ["tuxedo-blaze", "tuxedo-mask", "tabby-socks", "tabby"];
  assert.equal(await page.getByRole("radio").count(), 4);
  await page.locator('input[value="tuxedo-mask"]').check();
  const previews = new Set();
  for (const coat of coats) {
    await page.locator(`input[value="${coat}"]`).check();
    previews.add(await page.locator("#explorer-image").getAttribute("src"));
    assert.equal(await page.evaluate(() => localStorage.getItem("meowie-coat")), coat);
    await page.screenshot({ path: `test-results/choose-${coat}.png` });
    await page.getByRole("button", { name: "Let’s play" }).click();
    for (const [key, direction] of [["d", "right"], ["s", "down"], ["a", "left"], ["w", "up"]]) {
      await keyMove(key, 220);
      const texture = await page.evaluate(() => window.__miso.ui.scene.player.sprite.texture.key);
      assert.ok(texture.startsWith(`cat-${coat}-${direction}-`), texture);
    }
    await page.screenshot({ path: `test-results/play-${coat}.png` });
    await page.getByRole("button", { name: "Pause adventure" }).click();
    await page.getByRole("button", { name: "Restart adventure" }).click();
    await page.waitForTimeout(350);
    assert.equal(await page.evaluate(() => window.__miso.ui.scene.player.sprite.texture.key), `cat-${coat}-down-0`);
    await page.getByRole("button", { name: "Pause adventure" }).click();
    await page.getByRole("button", { name: "Return to home" }).click();
    await page.waitForTimeout(250);
    await page.reload();
    await page.waitForSelector("#loading", { state: "hidden" });
    assert.equal(await page.locator(`input[value="${coat}"]`).isChecked(), true);
    assert.equal(await page.evaluate(() => window.__miso.ui.scene.player.sprite.texture.key), `cat-${coat}-down-0`);
    record(`${coat}: all directions, restart and saved selection`);
  }
  assert.equal(previews.size, 4, "Each coat needs its own preview artwork");
  await page.evaluate(() => localStorage.setItem("meowie-coat", "invalid-cat"));
  await page.reload();
  await page.waitForSelector("#loading", { state: "hidden" });
  assert.equal(await page.locator('input[value="tuxedo-blaze"]').isChecked(), true);
  await page.locator('input[value="tabby-socks"]').check();
  record("Four distinct portraits and safe recovery from an invalid saved coat");
  await page.screenshot({ path: "test-results/home-desktop.png" });
  await page.getByRole("button", { name: "How to play", exact: true }).click();
  await page.getByRole("button", { name: "Got it" }).click();
  assert.equal((await snapshot()).mode, "home");
  await page.getByRole("button", { name: "A little about this" }).click();
  assert.match(
    await page.locator("#modal").innerText(),
    /Phaser[\s\S]*TypeScript[\s\S]*Vite/,
  );
  await page.getByRole("button", { name: "Back to the garden" }).click();
  record("Home, controls, and portfolio information");
  const sound = page.getByRole("button", { name: "Turn sound off" });
  await sound.click();
  assert.equal(
    await page.getByRole("button", { name: "Turn sound on" }).count(),
    1,
  );
  await page.getByRole("button", { name: "Turn sound on" }).click();
  record("Global sound toggle");
  await page.getByRole("button", { name: "Let’s play" }).click();
  await page.waitForTimeout(1000);
  let initial = await snapshot();
  await keyMove("d", 500);
  let moved = await snapshot();
  assert.ok(moved.x > initial.x + 45);
  initial = moved;
  await keyMove("ArrowLeft", 500);
  moved = await snapshot();
  assert.ok(moved.x < initial.x - 45);
  await keyMove("w", 450);
  assert.ok((await snapshot()).y < moved.y - 40);
  moved = await snapshot();
  await keyMove("ArrowDown", 450);
  assert.ok((await snapshot()).y > moved.y + 40);
  record("WASD, arrow keys, acceleration, and deceleration");
  await page.getByRole("button", { name: "Pause adventure" }).click();
  initial = await snapshot();
  await keyMove("d", 350);
  assert.ok(Math.abs((await snapshot()).x - initial.x) < 1);
  assert.equal((await snapshot()).mode, "paused");
  await page
    .locator("#modal")
    .getByRole("button", { name: "How to play", exact: true })
    .click();
  await page.getByRole("button", { name: "Got it" }).click();
  assert.equal((await snapshot()).mode, "paused");
  await page.getByRole("button", { name: "Resume adventure" }).click();
  assert.equal((await snapshot()).mode, "playing");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(120);
  assert.equal((await snapshot()).mode, "paused");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(180);
  assert.equal((await snapshot()).mode, "playing");
  record("Pause freezes movement; help and Escape resume correctly");

  // Probe each collision category with actual keyboard movement into its boundary.
  for (const probe of [
    {
      name: "pond",
      x: 1300,
      y: 1070,
      key: "w",
      axis: "y",
      limit: 970,
      direction: "min",
    },
    {
      name: "fence",
      x: 400,
      y: 615,
      key: "w",
      axis: "y",
      limit: 570,
      direction: "min",
    },
    {
      name: "tree",
      x: 160,
      y: 845,
      key: "w",
      axis: "y",
      limit: 800,
      direction: "min",
    },
    {
      name: "building",
      x: 1160,
      y: 365,
      key: "w",
      axis: "y",
      limit: 285,
      direction: "min",
    },
    {
      name: "bench",
      x: 1010,
      y: 835,
      key: "w",
      axis: "y",
      limit: 775,
      direction: "min",
    },
    {
      name: "café furniture",
      x: 1960,
      y: 875,
      key: "w",
      axis: "y",
      limit: 805,
      direction: "min",
    },
    {
      name: "world edge",
      x: 110,
      y: 1110,
      key: "a",
      axis: "x",
      limit: 85,
      direction: "min",
    },
  ]) {
    await resetAt(probe.x, probe.y);
    await keyMove(probe.key, 1000);
    const value = (await snapshot())[probe.axis];
    assert.ok(
      Math.abs(value - probe[probe.axis]) > 8,
      `${probe.name}: Meowie must actually move toward the obstacle`,
    );
    assert.ok(
      value >= probe.limit - 5,
      `${probe.name} collision: ${value} crossed ${probe.limit}`,
    );
    record(`Collision: ${probe.name}`);
  }
  await resetAt(800, 1470);
  await page.waitForTimeout(120);
  await page.keyboard.press("e");
  await page.waitForTimeout(250);
  assert.equal((await snapshot()).locked, true);
  await page.waitForTimeout(1500);
  assert.equal((await snapshot()).locked, false);
  assert.ok(Math.abs((await snapshot()).x - 800) < 1);
  record("Cardboard box jump returns Meowie safely");
  for (const item of [
    {
      id: "bike",
      x: 1810,
      y: 545,
      prompt: "bicycle bell",
      message: "Brrring!",
    },
    { id: "mailbox", x: 650, y: 510, prompt: "mailbox", message: "A postcard" },
    {
      id: "chime",
      x: 910,
      y: 705,
      prompt: "wind chimes",
      message: "Ting, ting.",
    },
    {
      id: "yarn",
      x: 930,
      y: 1325,
      prompt: "ball of yarn",
      message: "One little paw.",
    },
  ]) {
    await resetAt(item.x, item.y);
    await page.waitForTimeout(160);
    assert.match(
      await page.locator("#interaction").innerText(),
      new RegExp(item.prompt),
    );
    const countBefore = (await snapshot()).count;
    await page.keyboard.press("e");
    await page.waitForTimeout(150);
    assert.match(
      await page.locator("#toast").innerText(),
      new RegExp(item.message),
    );
    if (item.id === "yarn") {
      const toy = await page.evaluate(() => {
        const image = window.__miso.ui.scene.children.list.find(
          (o) => o.texture?.key === "yarn",
        );
        return { x: image.x, y: image.y, angle: image.angle };
      });
      assert.ok(Math.abs(toy.y - 1260) > 1 || Math.abs(toy.angle) > 5);
    }
    if (item.id === "chime") {
      await page.getByRole("button", { name: "Pause adventure" }).click();
      const angle = await page.evaluate(
        () =>
          window.__miso.ui.scene.children.list.find(
            (o) => o.texture?.key === "chime",
          ).angle,
      );
      await page.waitForTimeout(300);
      assert.equal(
        await page.evaluate(
          () =>
            window.__miso.ui.scene.children.list.find(
              (o) => o.texture?.key === "chime",
            ).angle,
        ),
        angle,
      );
      await page.getByRole("button", { name: "Resume adventure" }).click();
      await page.waitForTimeout(100);
      assert.match(await page.locator("#interaction").innerText(), /wind chimes/);
      assert.equal(await page.locator("#interaction").isVisible(), true);
    }
    await page.screenshot({ path: `test-results/interaction-${item.id}.png` });
    await page.waitForTimeout(1500);
    assert.equal((await snapshot()).locked, false);
    assert.equal((await snapshot()).count, countBefore);
    assert.ok(Math.abs((await snapshot()).x - item.x) < 1);
    record(
      `New interaction: ${item.id} responds to E without moving or trapping Meowie`,
    );
  }
  await page.getByRole("button", { name: "Pause adventure" }).click();
  await page.getByRole("button", { name: "Restart adventure" }).click();
  await page.waitForTimeout(450);
  assert.equal((await snapshot()).count, 0);
  assert.equal((await snapshot()).mode, "playing");
  record("Restart resets all ten fish and player");
  await page.screenshot({ path: "test-results/game-desktop.png" });

  // Build routes around expanded obstacle bounds, then drive the same movement vector as
  // the real joystick. No teleports or direct collection calls are used for this full run.
  await page.exposeFunction("testProgress", (name) =>
    record(`Reachable collectible: ${name}`),
  );
  const navigation = await page.evaluate(async () => {
    const { ui } = window.__miso,
      s = ui.scene,
      grid = 30,
      cols = 80,
      rows = 60;
    const blocked = (x, y) =>
      x < 105 ||
      y < 115 ||
      x > 2295 ||
      y > 1685 ||
      s.obstacleBounds.some(
        (o) =>
          Math.abs(x - o.x) < o.w / 2 + 23 &&
          Math.abs(y - 7 - o.y) < o.h / 2 + 23,
      );
    const pos = (id) => ({
      x: (id % cols) * grid + 15,
      y: Math.floor(id / cols) * grid + 15,
    });
    const nearest = (x, y) => {
      let best = -1,
        dist = Infinity;
      for (let id = 0; id < cols * rows; id++) {
        const p = pos(id),
          d = Math.hypot(p.x - x, p.y - y);
        if (d < dist && !blocked(p.x, p.y)) {
          dist = d;
          best = id;
        }
      }
      return best;
    };
    function route(x, y, tx, ty) {
      const start = nearest(x, y),
        end = nearest(tx, ty),
        queue = [start],
        parent = new Map([[start, -1]]);
      for (let i = 0; i < queue.length; i++) {
        const id = queue[i];
        if (id === end) break;
        const p = pos(id);
        for (const [dx, dy] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1],
        ]) {
          const nx = p.x + dx * grid,
            ny = p.y + dy * grid,
            nid = id + dx + dy * cols;
          if (
            nid < 0 ||
            nid >= cols * rows ||
            blocked(nx, ny) ||
            parent.has(nid)
          )
            continue;
          if (dx && dy && (blocked(nx, p.y) || blocked(p.x, ny))) continue;
          parent.set(nid, id);
          queue.push(nid);
        }
      }
      if (!parent.has(end)) throw new Error(`No reachable path to ${tx},${ty}`);
      const result = [];
      for (let id = end; id !== -1; id = parent.get(id))
        result.unshift(pos(id));
      result.push({ x: tx, y: ty });
      return result;
    }
    let distance = 0;
    for (const fish of s.sardines) {
      if (fish.collected) continue;
      const points = route(
        s.player.sprite.x,
        s.player.sprite.y,
        fish.x,
        fish.y,
      );
      await new Promise((resolve, reject) => {
        let waypoint = 0,
          start = performance.now(),
          last = { x: s.player.sprite.x, y: s.player.sprite.y };
        function tick() {
          const p = s.player.sprite;
          distance += Math.hypot(p.x - last.x, p.y - last.y);
          last = { x: p.x, y: p.y };
          if (fish.collected) {
            ui.touch.x = ui.touch.y = 0;
            resolve();
            return;
          }
          if (performance.now() - start > 45000) {
            ui.touch.x = ui.touch.y = 0;
            reject(
              new Error(
                `Navigation stalled for ${fish.label} at ${p.x},${p.y}`,
              ),
            );
            return;
          }
          const goal = points[waypoint],
            dx = goal.x - p.x,
            dy = goal.y - p.y,
            len = Math.hypot(dx, dy);
          if (len < 14 && waypoint < points.length - 1) {
            waypoint++;
            requestAnimationFrame(tick);
            return;
          }
          ui.touch.x = dx / Math.max(len, 1);
          ui.touch.y = dy / Math.max(len, 1);
          requestAnimationFrame(tick);
        }
        tick();
      });
      await window.testProgress(fish.label);
    }
    return { distance, count: s.count };
  });
  assert.equal(navigation.count, 10);
  assert.ok(navigation.distance > 3000);
  await page.waitForSelector("#modal-title");
  await page.waitForTimeout(1000);
  assert.equal(
    await page.locator("#modal-title").innerText(),
    "Adventure Complete!",
  );
  assert.equal((await snapshot()).mode, "complete");
  assert.equal(await page.locator("#count").innerText(), "10 / 10");
  assert.equal(await page.locator('.completion-cat img').getAttribute('src'), await page.locator('#explorer-image').getAttribute('src'));
  record(
    "All ten collected through continuous obstacle-aware movement; win state",
  );
  await page.screenshot({ path: "test-results/completion.png" });
  await page.getByRole("button", { name: "Continue exploring" }).click();
  assert.equal((await snapshot()).locked, false);
  initial = await snapshot();
  await keyMove("a", 350);
  assert.ok((await snapshot()).x < initial.x - 20);
  assert.equal((await snapshot()).count, 10);
  record("Continue exploring after completion");
  await page.getByRole("button", { name: "Pause adventure" }).click();
  await page.getByRole("button", { name: "Return to home" }).click();
  await page.waitForTimeout(350);
  await page.getByRole("button", { name: "Let’s play" }).click();
  assert.equal((await snapshot()).count, 0);
  record("Return home and start a fresh adventure");

  await page.close();
  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });
  mobile.on("pageerror", (e) => errors.push(e.message));
  mobile.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await mobile.goto(url);
  await mobile.waitForSelector("#loading", { state: "hidden" });
  await mobile.locator('input[value="tabby"]').check();
  assert.equal(await mobile.evaluate(() => window.__miso.ui.scene.player.sprite.texture.key), 'cat-tabby-down-0');
  await mobile.screenshot({ path: "test-results/home-mobile.png" });
  await mobile.getByRole("button", { name: "Let’s play" }).tap();
  await mobile.waitForTimeout(700);
  assert.equal(await mobile.locator("#touch-controls").isVisible(), true);
  const joystick = await mobile.locator("#joystick").boundingBox();
  assert.ok(joystick.y + joystick.height <= 844);
  const before = await mobile.evaluate(
    () => window.__miso.ui.scene.player.sprite.x,
  );
  const cx = joystick.x + joystick.width / 2,
    cy = joystick.y + joystick.height / 2;
  const touchSession = await mobile.context().newCDPSession(mobile);
  await touchSession.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: cx, y: cy }],
  });
  await touchSession.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: cx + 40, y: cy }],
  });
  await mobile.waitForTimeout(550);
  const after = await mobile.evaluate(
    () => window.__miso.ui.scene.player.sprite.x,
  );
  assert.ok(after > before + 40);
  await touchSession.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await mobile.waitForTimeout(200);
  assert.equal(await mobile.evaluate(() => window.__miso.ui.touch.x), 0);
  await mobile.screenshot({ path: "test-results/game-mobile.png" });
  record("Portrait layout and touchscreen joystick movement/release");
  await mobile.evaluate(() =>
    window.__miso.ui.scene.player.sprite.body.reset(800, 1470),
  );
  await mobile.waitForTimeout(150);
  await mobile
    .getByRole("button", { name: "Interact with nearby object" })
    .tap();
  await mobile.waitForTimeout(200);
  assert.equal(
    await mobile.evaluate(() => window.__miso.ui.scene.player.locked),
    true,
  );
  await mobile.waitForTimeout(1600);
  record("Mobile interaction button");
  await mobile.evaluate(() =>
    window.__miso.ui.scene.player.sprite.body.reset(930, 1325),
  );
  await mobile.waitForTimeout(180);
  assert.match(
    await mobile.locator("#interaction").innerText(),
    /ball of yarn/,
  );
  await mobile
    .getByRole("button", { name: "Interact with nearby object" })
    .tap();
  await mobile.waitForTimeout(150);
  assert.match(await mobile.locator("#toast").innerText(), /One little paw/);
  record("New yarn interaction works with the mobile Explore button");
  await mobile.setViewportSize({ width: 844, height: 390 });
  await mobile.waitForTimeout(550);
  const landscape = await mobile.locator("#joystick").boundingBox();
  assert.ok(landscape.y + landscape.height <= 390);
  assert.deepEqual(
    await mobile.evaluate(() => {
      const c = window.__miso.game.canvas;
      return [c.width, c.height];
    }),
    [844, 390],
  );
  assert.equal(
    await mobile
      .locator("body")
      .evaluate((e) => e.scrollWidth <= window.innerWidth),
    true,
  );
  await mobile.screenshot({ path: "test-results/game-landscape.png" });
  record("Landscape resize keeps controls in the viewport");
  await mobile.getByRole("button", { name: "Pause adventure" }).tap();
  await mobile.getByRole("button", { name: "Restart adventure" }).tap();
  await mobile.waitForTimeout(400);
  assert.equal(await mobile.evaluate(() => window.__miso.ui.scene.count), 0);
  record("Mobile pause and restart");
  assert.deepEqual(errors, []);
  record("No browser console or uncaught errors");
  await writeFile(
    "test-results/report.json",
    JSON.stringify({ passed: results, errors, navigation }, null, 2),
  );
} finally {
  await browser.close();
}
