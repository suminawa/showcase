/*
 * 共有カードの画（1200×630）を焼く。
 *
 *   node scripts/bake-og.mjs [http://localhost:3013] [slug ...]
 *
 * 焼くもの:
 *   トップ          src/app/opengraph-image.png
 *   分類のページ    public/og/{kits,sites,works,contact}.png
 *
 * **意匠の写しで作らない。実画面を焼く。** 1200×630 の窓でその紙を開き、
 * 頭の段をそのまま 2 倍で撮って縮める ── 焼き直したものが本物と食い違わない
 * ための、いちばん確実なやり方である。
 * ＊ その紙の意匠を変えたら焼き直すこと。自動では追随しない。
 *
 * 先に本番ビルドを立てておくこと（開発サーバーだと初回描画が間に合わない）:
 *   npm run build && npx next start --port 3013
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "/Users/anzai/Projects/creator-os/node_modules/playwright/index.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SIZE = { width: 1200, height: 630 };

/** 焼くもの。分類のページを足したら 1 行足す（metadata の images と対に） */
const CARDS = [
  { slug: "home", url: "/", dest: ["src", "app", "opengraph-image.png"] },
  { slug: "kits", url: "/kits", dest: ["public", "og", "kits.png"] },
  { slug: "sites", url: "/sites", dest: ["public", "og", "sites.png"] },
  { slug: "works", url: "/works", dest: ["public", "og", "works.png"] },
  { slug: "contact", url: "/contact", dest: ["public", "og", "contact.png"] },
];

const base = process.argv[2]?.startsWith("http")
  ? process.argv[2]
  : "http://localhost:3013";
const only = process.argv.slice(process.argv[2]?.startsWith("http") ? 3 : 2);
const cards = only.length ? CARDS.filter((c) => only.includes(c.slug)) : CARDS;

const tmp = mkdtempSync(path.join(tmpdir(), "og-"));
const browser = await chromium.launch();

for (const card of cards) {
  const raw = path.join(tmp, `${card.slug}@2x.png`);
  const dest = path.join(ROOT, ...card.dest);

  const page = await browser.newPage({
    viewport: SIZE,
    deviceScaleFactor: 2,
  });
  await page.goto(base + card.url, { waitUntil: "load" });
  // 入場の演出（いちばん遅い入口の 3 行で 1420ms + 1000ms）が終わるのを待つ
  await page.waitForTimeout(3200);
  await page.screenshot({ path: raw });
  await page.close();

  const r = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-loglevel",
      "error",
      "-i",
      raw,
      "-vf",
      `scale=${SIZE.width}:${SIZE.height}:flags=lanczos`,
      dest,
    ],
    { stdio: "inherit" },
  );
  if (r.status !== 0) throw new Error(`ffmpeg failed: ${card.slug}`);
  console.log("焼いた", dest);
}

await browser.close();
rmSync(tmp, { recursive: true, force: true });
