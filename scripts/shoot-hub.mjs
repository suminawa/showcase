/*
 * ハブの目録に添える図版（実画面の写し）を撮る。
 *
 *   node scripts/shoot-hub.mjs [http://localhost:3013] [slug ...]
 *
 * 出すもの: public/hub/<slug>-640.webp と public/hub/<slug>-320.webp（8:5）。
 * どちらも実画面の写しで、意匠の札（public/og/*.png）は使わない ──
 * 「OG 画像を意匠の写しで作らない。実画面を焼く」と同じ考えで、目録に載るのは
 * 作品そのものの姿でなければならない。
 *
 * 品物を足したら、下の SHOTS に 1 行足して撮り直す。
 * 行と図版の対応は src/lib/projects.ts の projectFigure() が決めているので、
 * 足し忘れると src/lib/hub-shots.test.ts が落ちる。
 *
 * 先に本番ビルドを立てておくこと（開発サーバーだと初回描画が間に合わない）:
 *   npm run build && npx next start --port 3013
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "/Users/anzai/Projects/creator-os/node_modules/playwright/index.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "hub");
const TMP = path.join(ROOT, ".hub-shots");

/** 出す寸法。8:5 ＝ CSS 側の --hi-fig-w / --hi-fig-h と同じ縦横比 */
const WIDE = 640;
const NARROW = 320;
const RATIO = 8 / 5;

/**
 * 撮るもの。
 *   where … "demo"   は見本サイトの頭（その紙ぜんぶが作品）
 *           "work"   は作品ページの作品の部分だけ（頭の名乗りは撮らない）
 *           "canvas" は水盤。空の水を撮っても何も写らないので、
 *                    墨を落としてかき混ぜてから撮る
 *   wait  … 描き終わるのを待つ時間。canvas と 3D は長めに要る
 */
const SHOTS = [
  // KITS（作品ページを持つもの。note と #sites へ飛ぶ 3 本は図版を持たない）
  { slug: "quote-simulator", url: "/projects/quote-simulator", where: "work" },
  { slug: "floorplan", url: "/projects/floorplan", where: "work", wait: 4500 },
  { slug: "ai-concierge", url: "/projects/ai-concierge", where: "work" },
  { slug: "sheet-app", url: "/projects/sheet-app", where: "work" },
  { slug: "doc-reader", url: "/projects/doc-reader", where: "work" },
  { slug: "booking", url: "/projects/booking", where: "work" },
  {
    slug: "configurator",
    url: "/projects/configurator",
    where: "work",
    wait: 5500,
  },

  // SITES（見本サイトは頭をそのまま）
  { slug: "corporate-site", url: "/demos/corporate-site", where: "demo" },
  { slug: "saas-lp", url: "/demos/saas-lp", where: "demo" },
  { slug: "shop-lp", url: "/demos/shop-lp", where: "demo" },
  { slug: "construction-lp", url: "/demos/construction-lp", where: "demo" },
  { slug: "professional-lp", url: "/demos/professional-lp", where: "demo" },
  { slug: "clinic-lp", url: "/demos/clinic-lp", where: "demo" },

  // WORKS
  {
    slug: "suminagashi",
    url: "/projects/suminagashi",
    where: "canvas",
    wait: 2500,
  },
  { slug: "tax-back", url: "/projects/tax-back", where: "work" },
  { slug: "30days", url: "/projects/30days", where: "work" },
];

const VIEWPORT = { width: 1280, height: Math.round(1280 / RATIO) }; // 1280×800
/** 作品ページから切り取る幅の上限。狭く切るほど図版の中身が大きく写る */
const WORK_CLIP = 780;

function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: "inherit" });
  if (r.status !== 0) throw new Error(`${cmd} failed: ${args.join(" ")}`);
}

/**
 * 寸法を揃えて webp にする。
 * 縮めるのは ffmpeg、webp に焼くのは cwebp ── Homebrew の ffmpeg は
 * webp の符号化器を持たないことがあるので、二段に分けてある。
 */
function webp(src, dest, width) {
  const height = Math.round(width / RATIO);
  const scaled = `${dest}.png`;
  run("ffmpeg", [
    "-y",
    "-loglevel",
    "error",
    "-i",
    src,
    "-vf",
    // 覆うように縮めてから切る。元が 8:5 より横長でも縦長でも寸法が揃う
    `scale=${width}:${height}:force_original_aspect_ratio=increase,` +
      `crop=${width}:${height}:(iw-ow)/2:0`,
    scaled,
  ]);
  run("cwebp", ["-quiet", "-q", "78", "-m", "6", scaled, "-o", dest]);
  rmSync(scaled, { force: true });
}

async function main() {
  const base = process.argv[2]?.startsWith("http")
    ? process.argv[2]
    : "http://localhost:3013";
  const only = process.argv.slice(process.argv[2]?.startsWith("http") ? 3 : 2);
  const shots = only.length
    ? SHOTS.filter((s) => only.includes(s.slug))
    : SHOTS;

  mkdirSync(OUT, { recursive: true });
  mkdirSync(TMP, { recursive: true });

  const browser = await chromium.launch();
  /* 面はふたつ。静止のものは動きを止めて撮る（何度撮り直しても同じ画になる）。
     水盤だけは流れそのものが作品なので、動きを止めずに撮る。 */
  const still = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    reducedMotion: "reduce",
  });
  const moving = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
  });

  for (const shot of shots) {
    const page = await (shot.where === "canvas" ? moving : still).newPage();
    await page.goto(base + shot.url, { waitUntil: "load" });
    await page.waitForTimeout(shot.wait ?? 1800);

    if (shot.where === "work") {
      /* 作品ページの作品の部分だけを撮る。CSS Modules が吐く名は
         projects-module__<hash>__work なので、末尾が __work の札を探す。
         掴めなかったときは黙って頭を撮らず、落とす ── 名乗りの写しが
         目録に並ぶより、撮れていないことが分かるほうがよい。 */
      const handle = await page.evaluateHandle(
        () =>
          [...document.querySelectorAll("main *")].find((node) =>
            [...node.classList].some((c) => /(^|__)work$/.test(c)),
          ) ?? null,
      );
      const el = handle.asElement();
      if (!el) throw new Error(`作品の部分が見つからない: ${shot.slug}`);
      await el.evaluate((node) => {
        node.scrollIntoView({ block: "start", behavior: "instant" });
        window.scrollBy(0, -24);
      });
      await page.waitForTimeout(600);
      const box = await el.boundingBox();
      if (!box) throw new Error(`no box: ${shot.slug}`);
      /*
       * 切り取りは必ず 8:5 に保つ。画面に残っている高さから幅の上限を逆算して
       * おかないと、作品が画面の下寄りにある紙で縦が足りず、縦横比が崩れる。
       *
       * 幅は WORK_CLIP（780px）で頭打ちにする。目録に出る図版は 180px 角ほどで、
       * 1280px の版面をそのまま縮めると何が写っているか分からない
       * （実際に一度そうして、料紙の上の淡い道具が【空の紙】に見えた）。
       * 左寄りを 780px で切ると 1.64 倍に寄るので、数字や表の形が残る。
       * 作品ページの右上を掠める墨の一筆も、この切り方なら画に入らない。
       */
      const y = Math.max(0, Math.min(box.y, VIEWPORT.height - 80));
      const width = Math.min(
        box.width,
        WORK_CLIP,
        VIEWPORT.width - box.x,
        (VIEWPORT.height - y) * RATIO,
      );
      console.log(
        `  ${shot.slug}: x=${Math.round(box.x)} y=${Math.round(y)} w=${Math.round(width)}`,
      );
      await page.screenshot({
        path: path.join(TMP, `${shot.slug}.png`),
        clip: { x: box.x, y, width, height: width / RATIO },
      });
    } else if (shot.where === "canvas") {
      /* 水盤は【空の状態で撮っても紙のまま】── 墨を落として初めて絵になる。
         だから撮る前に、実際に人がやることをそのままやる:
         数滴落とし、指でひと撫でして渦を作り、流れが落ち着くのを待つ。 */
      const canvas = await page.waitForSelector("canvas", { timeout: 10_000 });
      const box = await canvas.boundingBox();
      if (!box) throw new Error(`no canvas box: ${shot.slug}`);
      const at = (fx, fy) => [box.x + box.width * fx, box.y + box.height * fy];

      for (const [fx, fy] of [
        [0.32, 0.42],
        [0.55, 0.55],
        [0.7, 0.35],
        [0.45, 0.62],
        [0.6, 0.48],
      ]) {
        await page.mouse.click(...at(fx, fy));
        await page.waitForTimeout(500);
      }
      await page.waitForTimeout(1500);

      await page.mouse.move(...at(0.2, 0.5));
      await page.mouse.down();
      for (let k = 0; k < 50; k++) {
        await page.mouse.move(
          ...at(0.2 + k * 0.012, 0.5 + Math.sin(k / 5) * 0.22),
        );
        await page.waitForTimeout(24);
      }
      await page.mouse.up();
      await page.waitForTimeout(3000);

      await page.screenshot({
        path: path.join(TMP, `${shot.slug}.png`),
        clip: box,
      });
    } else {
      await page.screenshot({ path: path.join(TMP, `${shot.slug}.png`) });
    }

    const src = path.join(TMP, `${shot.slug}.png`);
    webp(src, path.join(OUT, `${shot.slug}-${WIDE}.webp`), WIDE);
    webp(src, path.join(OUT, `${shot.slug}-${NARROW}.webp`), NARROW);
    console.log("撮った", shot.slug);
    await page.close();
  }

  await browser.close();
  rmSync(TMP, { recursive: true, force: true });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
