/*
 * 共有カードの画（src/app/opengraph-image.png、1200×630）を焼く。
 *
 *   node scripts/bake-og.mjs [http://localhost:3013]
 *
 * **意匠の写しで作らない。実画面を焼く。** 1200×630 の窓でトップを開き、
 * 名乗りの段をそのまま 2 倍で撮って縮める ── 焼き直したものが本物と
 * 食い違わないための、いちばん確実なやり方である。
 * ＊ トップの意匠を変えたら焼き直すこと。自動では追随しない。
 *
 * 先に本番ビルドを立てておくこと:
 *   npm run build && npx next start --port 3013
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "/Users/anzai/Projects/creator-os/node_modules/playwright/index.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEST = path.join(ROOT, "src", "app", "opengraph-image.png");
const SIZE = { width: 1200, height: 630 };

const base = process.argv[2] ?? "http://localhost:3013";
const tmp = mkdtempSync(path.join(tmpdir(), "og-"));
const raw = path.join(tmp, "og@2x.png");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: SIZE, deviceScaleFactor: 2 });
await page.goto(base + "/", { waitUntil: "load" });
// 入場の演出（いちばん遅い目次で 1420ms + 1000ms）が終わるのを待つ
await page.waitForTimeout(3200);
await page.screenshot({ path: raw });
await browser.close();

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
    DEST,
  ],
  { stdio: "inherit" },
);
rmSync(tmp, { recursive: true, force: true });
if (r.status !== 0) throw new Error("ffmpeg failed");
console.log("焼いた", DEST);
