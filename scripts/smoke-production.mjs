import { chromium } from "@playwright/test";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { PNG } = require(resolve("node_modules/playwright-core/lib/utilsBundle.js"));
await mkdir("test-results", { recursive: true });

// Serve the built artifact under a repository-style subdirectory to verify
// the relative paths used by GitHub Pages as well as a normal static host.
const root = resolve("dist"),
  prefix = "/meowie/";
const liveURL = process.env.MEOWIE_PRODUCTION_URL;
const server = createServer(async (req, res) => {
  try {
    const pathname = new URL(req.url, "http://localhost").pathname;
    if (!pathname.startsWith(prefix)) {
      res.writeHead(404);
      res.end();
      return;
    }
    const file = resolve(
      root,
      decodeURIComponent(pathname.slice(prefix.length)) || "index.html",
    );
    if (!file.startsWith(root + sep)) {
      res.writeHead(403);
      res.end();
      return;
    }
    const content = await readFile(file);
    res.setHeader(
      "Content-Type",
      {
        ".html": "text/html; charset=utf-8",
        ".js": "text/javascript",
        ".css": "text/css",
        ".svg": "image/svg+xml",
      }[extname(file)] ?? "application/octet-stream",
    );
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end();
  }
});
if (!liveURL) await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const url = liveURL ?? `http://127.0.0.1:${server.address().port}${prefix}`;
const browser = await chromium.launch({
  channel: process.env.MISO_BROWSER_CHANNEL ?? "chrome",
  headless: true,
});
const errors = [],
  page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
try {
  for (const viewport of [{width:1366,height:768},{width:390,height:844},{width:320,height:568},{width:844,height:390}]) {
    await page.setViewportSize(viewport);
    await page.goto(url);
    await page.waitForSelector("#loading", { state: "hidden" });
    assert.equal(await page.evaluate(() => window.__miso), undefined);
    assert.match(await page.title(), /Meowie/);
    const overlap = await page.evaluate(() => {
      const home = document.querySelector('#home').getBoundingClientRect();
      const picker = document.querySelector('.cat-picker').getBoundingClientRect();
      return home.left < picker.right && home.right > picker.left && home.top < picker.bottom && home.bottom > picker.top;
    });
    assert.equal(overlap, false, `Home and cat picker overlap at ${viewport.width}x${viewport.height}`);
    assert.equal(await page.evaluate(()=>document.body.scrollWidth>innerWidth), false);
    await page.screenshot({ path: `test-results/${liveURL?'live':'production'}-home-${viewport.width}.png` });
    const portraits = new Set();
    for (const coat of ['tuxedo-blaze','tuxedo-mask','tabby-socks','tabby']) {
      await page.locator(`input[value="${coat}"]`).check();
      portraits.add(await page.locator('#explorer-image').getAttribute('src'));
      assert.equal(await page.locator('#explorer-image').evaluate(img=>img.complete && img.naturalWidth>0), true);
      await page.getByRole("button", { name: "Let’s play" }).click();
      await page.waitForTimeout(250);
      const canvasImage = await page.locator('canvas').screenshot({ path: `test-results/${liveURL?'live':'production'}-${coat}-${viewport.width}.png` });
      const pixels = PNG.sync.read(canvasImage);
      const colors = new Set();
      for(let i=0;i<pixels.data.length;i+=16)colors.add(pixels.data.subarray(i,i+3).toString('hex'));
      assert.ok(colors.size>100, 'Game canvas is blank');
      await page.keyboard.down("w");
      await page.waitForTimeout(800);
      await page.keyboard.up("w");
      await page.waitForTimeout(300);
      assert.match(await page.locator("#count").innerText(), /1\s*\/\s*10/);
      await page.getByRole("button", { name: "Pause adventure" }).click();
      await page.getByRole("button", { name: "Restart adventure" }).click();
      await page.waitForTimeout(400);
      assert.match(await page.locator("#count").innerText(), /0\s*\/\s*10/);
      await page.getByRole("button", { name: "Pause adventure" }).click();
      await page.getByRole("button", { name: "Return to home" }).click();
      await page.waitForTimeout(300);
      console.log(`PASS ${liveURL?'Live':'Built'} ${coat}: rendered, collected and restarted at ${viewport.width}x${viewport.height}`);
    }
    assert.equal(portraits.size,4);
  }
  assert.deepEqual(errors, []);
  console.log(
    "PASS Built static site loads from a subdirectory, collects a fish, and restarts without errors; development hook absent.",
  );
} finally {
  await browser.close();
  if (server.listening) await new Promise((resolve) => server.close(resolve));
}
