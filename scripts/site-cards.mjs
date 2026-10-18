/*
 * 見本サイトのカードの写真（4:3）を、見本の第一画面を撮って焼く。
 *
 *   SHOWCASE_PLAYWRIGHT=/path/to/playwright/index.mjs node scripts/site-cards.mjs [http://localhost:3044]
 *
 * 1280×960 の窓を 2 倍で撮り（実画面の写し。意匠の写しは作らない）、public/sites/<slug>-960.webp と -480.webp に出す。
 * 先に本番ビルドを立てておく（開発サーバーでは初回の描画が間に合うまで待ってから撮る）。sharp は next が連れてくるものを使う。
 */
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const { chromium } = await import(process.env.SHOWCASE_PLAYWRIGHT ?? "playwright");

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "sites");
const BASE = process.argv[2] ?? "http://localhost:3044";
const SLUGS = ["corporate-site", "saas-lp", "shop-lp", "construction-lp", "professional-lp", "clinic-lp"];

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 960 }, deviceScaleFactor: 2, reducedMotion: "reduce", locale: "ja-JP" });
for (const slug of SLUGS) {
  const page = await ctx.newPage();
  await page.goto(`${BASE}/demos/${slug}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1800);
  const buf = await page.screenshot();
  await sharp(buf).resize(960, 720).webp({ quality: 82 }).toFile(path.join(OUT, `${slug}-960.webp`));
  await sharp(buf).resize(480, 360).webp({ quality: 82 }).toFile(path.join(OUT, `${slug}-480.webp`));
  console.log("wrote", slug);
  await page.close();
}
await browser.close();
