/*
 * キットのカードの写真（4:3）を、キットの実画面の切り抜きから焼く。
 *
 *   node scripts/kit-cards.mjs <30days/products のパス> [--site http://localhost:3041]
 *
 * 写真はすべて実物の画面（各キットの assets/ にある撮影済みの画面）で、意匠の写しは作らない。
 * 紙の地 #F4EFE6（撮影の台紙と同じ色）の上に、画面を余白つきで置く。生の画面には細い縁を付ける。
 * --site を渡すと、フォーム受付（自動返信の 1 通）と予約ページ（空きカレンダー）は、このサイトの
 * 見本をその場で 2 倍で撮って使う（1 場面だけを大きく見せるため。本番ビルドを立ててから。
 * Playwright の場所は SHOWCASE_PLAYWRIGHT で渡す。bake-og.mjs と同じ決まり）。
 * 出力は public/kits/<slug>-960.webp と <slug>-480.webp。sharp は next が連れてくるものを使う。
 */
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PRODUCTS = process.argv[2];
if (!PRODUCTS) {
  console.error("使い方: node scripts/kit-cards.mjs <30days/products のパス>");
  process.exit(1);
}
const siteAt = process.argv.indexOf("--site");
const SITE = siteAt > 0 ? process.argv[siteAt + 1] : null;
const OUT = path.join(ROOT, "public", "kits");
mkdirSync(OUT, { recursive: true });

const W = 960;
const H = 720;
const MARGIN = 56;
const PLATE = "#f4efe6";
const LINE = "#d7d4cb";

/** crop は元画像のピクセル [x, y, w, h]。frame は生の画面に縁を付けるかどうか（撮影の台紙つきの画は付けない） */
const items = [
  { slug: "deadline", src: path.join(ROOT, "public/og/booth/s2-first.png"), crop: [70, 350, 1060, 645], frame: false },
  { slug: "form", src: "s3-form-intake-gas/assets/email.png", crop: [0, 0, 1316, 660], frame: true },
  { slug: "booking", src: "booking-gas/assets/calendar.png", crop: [770, 30, 460, 740], frame: false },
  { slug: "sheet-app", src: "sheet-app-gas/assets/list.png", crop: [0, 0, 2187, 1640], frame: true },
  { slug: "inbox-triage", src: "inbox-triage-gas/assets/sheet.png", crop: [40, 90, 1210, 680], frame: false },
  { slug: "ai-concierge", src: "ai-concierge/assets/window.png", crop: [1166, 240, 834, 860], frame: true },
  { slug: "doc-reader", src: "doc-reader/assets/review.png", crop: [30, 0, 1067, 800], frame: true },
  { slug: "line-concierge", src: "line-concierge/assets/chat-answer.png", crop: [740, 20, 490, 760], frame: false },
  { slug: "dashboard", src: "dashboard-kit/assets/overview.png", crop: [40, 80, 590, 620], frame: false },
  { slug: "survey-analysis", src: "survey-analysis/assets/summary.png", crop: [190, 150, 1400, 1050], frame: true },
  { slug: "floorplan", src: "floorplan-simulator/assets/scene-3d.png", crop: [186, 0, 1104, 828], frame: true },
  { slug: "configurator", src: "product-configurator/assets/engrave.png", crop: [0, 0, 960, 720], frame: true },
  { slug: "shopify-configurator", src: "shopify-configurator/assets/product-page.png", crop: [0, 0, 1173, 880], frame: true },
  { slug: "saas-starter", src: "saas-starter/assets/overview.png", crop: [40, 90, 590, 650], frame: false },
  { slug: "rag-eval-harness", src: "rag-eval-harness/assets/report-table.png", crop: [0, 0, 2133, 1600], frame: true },
  { slug: "mcp-server", src: "mcp-server/assets/tools.png", crop: [40, 300, 1220, 950], frame: false },
  { slug: "quote-simulator", src: "s1-quote-calculator/assets/demo.png", crop: [0, 0, 2400, 1800], frame: true },
  { slug: "order-report", src: "order-report-template/assets/screen-split-raw.png", crop: [1130, 20, 1352, 1176], frame: false },
];

async function place(input, frame) {
  let img = sharp(input).resize({ width: W - 2 * MARGIN, height: H - 2 * MARGIN, fit: "inside" });
  if (frame) img = sharp(await img.toBuffer()).extend({ top: 1, bottom: 1, left: 1, right: 1, background: LINE });
  const buf = await img.toBuffer();
  const { width, height } = await sharp(buf).metadata();
  const left = Math.floor((W - width) / 2);
  const top = Math.floor((H - height) / 2);
  return sharp(buf)
    .extend({ left, right: W - width - left, top, bottom: H - height - top, background: PLATE })
    .flatten({ background: PLATE })
    .toBuffer();
}

async function write(slug, buf) {
  await sharp(buf).webp({ quality: 82 }).toFile(path.join(OUT, `${slug}-960.webp`));
  await sharp(buf).resize(480, 360).webp({ quality: 82 }).toFile(path.join(OUT, `${slug}-480.webp`));
  console.log("wrote", slug);
}

/** このサイトの見本を 2 倍で撮る（フォームの自動返信の 1 通・予約の空きカレンダー） */
async function captureSite(base) {
  const { chromium } = await import(process.env.SHOWCASE_PLAYWRIGHT ?? "playwright");
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2, locale: "ja-JP" });
  const shots = {};
  await page.goto(`${base}/projects/form`, { waitUntil: "networkidle" });
  const mail = page.locator("section", { has: page.locator("h3", { hasText: "送った方へ届く自動返信" }) }).locator("> div").first();
  shots.form = { buffer: await mail.screenshot(), cropHeightRatio: 0.59 }; // 「メール」の行までで切る（行の途中で切らない）
  await page.goto(`${base}/projects/booking`, { waitUntil: "networkidle" });
  await page.waitForSelector(".bk-shell");
  await page.locator(".bk-shell button").first().click();
  await page.waitForTimeout(500);
  shots.booking = { buffer: await page.locator(".bk-shell").screenshot(), cropHeightRatio: 1 };
  await browser.close();
  return shots;
}

const site = SITE ? await captureSite(SITE) : {};

for (const it of items) {
  if (process.env.ONLY && it.slug !== process.env.ONLY) continue; // 1 枚だけ焼き直す
  const shot = site[it.slug];
  if (shot) {
    const { width, height } = await sharp(shot.buffer).metadata();
    const cut = await sharp(shot.buffer).extract({ left: 0, top: 0, width, height: Math.round(height * shot.cropHeightRatio) }).toBuffer();
    await write(it.slug, await place(cut, true));
    continue;
  }
  const src = path.isAbsolute(it.src) ? it.src : path.join(PRODUCTS, it.src);
  const [left, top, width, height] = it.crop;
  const cut = await sharp(src).extract({ left, top, width, height }).toBuffer();
  await write(it.slug, await place(cut, it.frame));
}

/* 業種別 LP テンプレ パック: 中身の見本サイト 6 枚（/sites の写真）を 3 × 2 に並べる */
{
  const sites = ["corporate-site", "saas-lp", "shop-lp", "construction-lp", "professional-lp", "clinic-lp"];
  const tw = 272;
  const th = 204;
  const gap = 16;
  const tiles = await Promise.all(
    sites.map((slug) =>
      sharp(path.join(ROOT, "public/hub", `${slug}-640.webp`))
        .resize(tw, th)
        .extend({ top: 1, bottom: 1, left: 1, right: 1, background: LINE })
        .toBuffer(),
    ),
  );
  const gridW = 3 * (tw + 2) + 2 * gap;
  const gridH = 2 * (th + 2) + gap;
  const x0 = Math.floor((W - gridW) / 2);
  const y0 = Math.floor((H - gridH) / 2);
  const buf = await sharp({ create: { width: W, height: H, channels: 3, background: PLATE } })
    .composite(tiles.map((input, i) => ({ input, left: x0 + (i % 3) * (tw + 2 + gap), top: y0 + Math.floor(i / 3) * (th + 2 + gap) })))
    .png()
    .toBuffer();
  await write("lp-pack", buf);
}
