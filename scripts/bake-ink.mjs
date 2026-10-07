/*
 * 生きた一画を引き終えた姿を、写真の墨として焼く。
 *
 *   SHOWCASE_PLAYWRIGHT=/path/to/playwright/index.mjs node scripts/bake-ink.mjs [http://localhost:3011]
 *
 * 焼くもの:
 *   public/ink/stroke-still-wide.webp    広い紙（1440×900 で引いた一画。箱は 1879×1223）
 *   public/ink/stroke-still-narrow.webp  狭い紙（375×812 で引いた一画。箱は 489×319）
 *
 * トップの流体（InkHero）が一画を引き終えた直後（2.6 秒）の canvas を、
 * rAF の中で toDataURL して取る（流体は preserveDrawingBuffer を持たないので、
 * 描いた直後の同じフレームで読む）。reduced-motion と WebGL2 の無い紙、分類のページ、
 * 作品ページは、この一枚を `.ink` の背景として darken で紙に乗せる。
 * ＊ 一画の形（InkHero.tsx の point / 筆圧）を変えたら焼き直すこと。
 *
 * 先に本番ビルドを立てておくこと: npm run build && npx next start --port 3011
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const { chromium } = await import(process.env.SHOWCASE_PLAYWRIGHT ?? "playwright");
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const base = process.argv[2] ?? "http://localhost:3011";

const SHOTS = [
  { name: "wide", width: 1440, height: 900 },
  { name: "narrow", width: 375, height: 812 },
];

const tmp = mkdtempSync(path.join(tmpdir(), "ink-"));
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
try {
  for (const shot of SHOTS) {
    const page = await browser.newPage({ viewport: { width: shot.width, height: shot.height }, deviceScaleFactor: 1 });
    await page.goto(`${base}/`, { waitUntil: "load" });
    // 流体が起動した印（data-live）を待ってから、一画（1.1 秒 + 書き出しの間）が終わるまで待つ
    await page.waitForSelector('[data-live="on"]', { timeout: 15000 });
    await page.waitForTimeout(3200);
    const data = await page.evaluate(
      () =>
        new Promise((resolve) => {
          requestAnimationFrame(() => {
            const c = document.querySelector("canvas");
            const live = c && c.parentElement && c.parentElement.dataset.live === "on";
            resolve(live ? c.toDataURL("image/png") : null);
          });
        }),
    );
    await page.close();
    if (!data) throw new Error(`${shot.name}: 流体が起動していない（WebGL2 が無い？）`);
    const png = path.join(tmp, `${shot.name}.png`);
    writeFileSync(png, Buffer.from(data.split(",")[1], "base64"));
    const dest = path.join(ROOT, "public", "ink", `stroke-still-${shot.name}.webp`);
    // Homebrew の ffmpeg は webp を書けない（shoot-hub.mjs と同じ理由）。cwebp で焼く
    const r = spawnSync("cwebp", ["-quiet", "-q", "82", "-m", "6", png, "-o", dest], { stdio: "inherit" });
    if (r.status !== 0) throw new Error(`cwebp failed: ${shot.name}`);
    console.log("焼いた", dest);
  }
} finally {
  await browser.close();
  rmSync(tmp, { recursive: true, force: true });
}
