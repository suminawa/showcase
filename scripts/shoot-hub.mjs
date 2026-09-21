/*
 * ハブの目録に添える図版（実画面の写し）を撮る。
 *
 *   node scripts/shoot-hub.mjs [http://localhost:3013] [slug ...]
 *
 * 出すもの: public/hub/<slug>-640.webp と public/hub/<slug>-320.webp（4:3）。
 * どちらも実画面の写しで、意匠の札（public/og/*.png）は使わない ──
 * 「OG 画像を意匠の写しで作らない。実画面を焼く」と同じ考えで、目録に載るのは
 * 作品そのものの姿でなければならない。
 *
 * ── 何に図版を添えるか（2026-09-21 に絞った）────────────────────
 * **見た目そのものが中身であるものだけ**。見本サイト 6 件と、作品「墨流し」。
 *
 * 道具とキットには添えない。何をする道具かは【動き】にあり、静止した写しを
 * 目録の寸法（196px）に落とすと、白い枠のなかで字が潰れるだけだった
 * （見積もり電卓・予約ページ・AI 案内窓口・AI 書類読み取り・業務アプリの
 * 5 件を実画面で確かめた）。役に立たない図版は、紙の罫を隠し、
 * 行の高さを字より先に決めてしまう ── 無いほうが目録は読める。
 * どの行が図版を持つかは src/lib/projects.ts の projectFigure() が決めており、
 * ここと食い違うと src/lib/hub-shots.test.ts が落ちる。
 *
 * 品物を足したら、下の SHOTS に 1 行足して撮り直す。
 *
 * 先に本番ビルドを立てておくこと（開発サーバーだと初回描画が間に合わない）:
 *   npm run build && npx next start --port 3013
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/*
 * Playwright はこの紙の依存ではない（本番に要らないものを package.json に
 * 積まない）。入っている場所を環境変数で渡す ──
 *   SHOWCASE_PLAYWRIGHT=/path/to/node_modules/playwright/index.mjs node scripts/shoot-hub.mjs
 * 既定では素直に "playwright" を読むので、入れてあるなら何も渡さなくてよい。
 */
const { chromium } = await import(process.env.SHOWCASE_PLAYWRIGHT ?? "playwright");

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "hub");
const TMP = path.join(ROOT, ".hub-shots");

/** 出す寸法。4:3 ＝ CSS 側の --hi-fig-w / --hi-fig-h と同じ縦横比 */
const WIDE = 640;
const NARROW = 320;
const RATIO = 4 / 3;

/**
 * 撮るもの。
 *
 *   where    "demo"   見本サイト。その紙ぜんぶが作品なので窓をそのまま撮る
 *            "work"   作品ページ。作品の塊だけを切る
 *            "canvas" 水盤。空の水は写らないので、墨を落としてかき混ぜてから撮る
 *   viewport 撮るときの窓。狭い窓ほど作品が大きく写るが、二段組みが一段に畳まれる
 *   act      その作品だと分かる状態を作る手（省略可）
 *   target   切り取る塊の札（CSS Modules の末尾の名）。省略すると作品の塊ぜんぶ
 *   fit      "width"  … 塊の幅に合わせ、高さは 4:3 から決める（既定）
 *            "height" … 塊の高さに合わせ、幅を 4:3 から決める（横を中央で切る）
 *   anchor   fit:"width" で塊が縦に長いときの寄せ先。"top"（既定）か "center"
 */
const SHOTS = [
  /* ---- SITES（見本サイトは頭をそのまま）--------------------------------
     見本は【その見た目そのもの】が商品なので、窓を素直に撮れば図版になる。
     6 枚が並んで初めて「業種ごとに違う紙が 6 枚ある」と言える。 */
  { slug: "corporate-site", url: "/demos/corporate-site", where: "demo" },
  { slug: "saas-lp", url: "/demos/saas-lp", where: "demo" },
  { slug: "shop-lp", url: "/demos/shop-lp", where: "demo" },
  { slug: "construction-lp", url: "/demos/construction-lp", where: "demo" },
  { slug: "professional-lp", url: "/demos/professional-lp", where: "demo" },
  { slug: "clinic-lp", url: "/demos/clinic-lp", where: "demo" },

  /* ---- WORKS ----------------------------------------------------------
     作品そのものが絵であるものだけ。水盤は空のままでは紙にしか見えないので、
     墨を落としてかき混ぜてから撮る。 */
  {
    slug: "suminagashi",
    url: "/projects/suminagashi",
    where: "canvas",
    viewport: { width: 1280, height: 900 },
    wait: 2500,
  },
];

/** 見本サイトを撮る窓。4:3 なので、窓をそのまま撮れば縦横比が合う */
const DEMO_VIEWPORT = { width: 1280, height: 960 };

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
    // 覆うように縮めてから切る。元が 4:3 より横長でも縦長でも寸法が揃う
    `scale=${width}:${height}:force_original_aspect_ratio=increase,` +
      `crop=${width}:${height}:(iw-ow)/2:0`,
    scaled,
  ]);
  run("cwebp", ["-quiet", "-q", "78", "-m", "6", scaled, "-o", dest]);
  rmSync(scaled, { force: true });
}

/**
 * 切り取る枠を決める。
 *
 * どちらの向きでも【塊の外側】に切り口を置く ── 塊より内側で切ると、
 * 図版の端で部品が途中から切れて「壊れた写し」に見える。
 * 足りないぶんは周りの紙が入るだけで、紙は目録の地と同じ色なので目立たない。
 */
function frameFor(box, view, { fit = "width", anchor = "top", pad = 14 }) {
  const b = {
    x: box.x - pad,
    y: box.y - pad,
    w: box.w + pad * 2,
    h: box.h + pad * 2,
  };
  let w, h;
  if (fit === "height") {
    h = b.h;
    w = h * RATIO;
  } else {
    w = b.w;
    h = w / RATIO;
  }
  // 窓から出ない大きさまで落とす（縦横比は保つ）
  const k = Math.min(1, view.width / w, view.height / h);
  w *= k;
  h *= k;

  let x = b.x + (b.w - w) / 2;
  let y = anchor === "center" ? b.y + (b.h - h) / 2 : b.y;
  x = Math.max(0, Math.min(x, view.width - w));
  y = Math.max(0, Math.min(y, view.height - h));
  return { x, y, width: w, height: h };
}

/** 作品の塊。CSS Modules が吐く名は <file>-module__<hash>__<name> */
async function boxOf(page, token, { scroll = true } = {}) {
  const handle = await page.evaluateHandle((t) => {
    const re = t
      ? new RegExp(`(^|__)${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`)
      : /(^|__)work$/;
    return (
      [...document.querySelectorAll("main *")].find((node) =>
        [...node.classList].some((c) => re.test(c)),
      ) ?? null
    );
  }, token ?? null);
  const el = handle.asElement();
  if (!el) throw new Error(`塊が見つからない: ${token ?? "work"}`);
  if (scroll) {
    await el.evaluate((node) => {
      node.scrollIntoView({ block: "start", behavior: "instant" });
      window.scrollBy(0, -28);
    });
    await page.waitForTimeout(500);
  }
  const b = await el.boundingBox();
  if (!b) throw new Error(`寸法が取れない: ${token ?? "work"}`);
  return { x: b.x, y: b.y, w: b.width, h: b.height };
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

  for (const shot of shots) {
    const view =
      shot.viewport ??
      (shot.where === "demo" ? DEMO_VIEWPORT : { width: 1280, height: 1500 });
    /* 静止のものは動きを止めて撮る（何度撮り直しても同じ画になる）。
       水盤だけは流れそのものが作品なので、動きを止めない。 */
    const ctx = await browser.newContext({
      viewport: view,
      deviceScaleFactor: 2,
      ...(shot.where === "canvas" ? {} : { reducedMotion: "reduce" }),
    });
    const page = await ctx.newPage();
    await page.goto(base + shot.url, { waitUntil: "load" });
    await page.waitForTimeout(shot.wait ?? 1800);

    const out = path.join(TMP, `${shot.slug}.png`);

    if (shot.where === "demo") {
      await page.screenshot({ path: out });
    } else if (shot.where === "canvas") {
      /* 水盤は【空の状態で撮っても紙のまま】── 墨を落として初めて絵になる。
         だから撮る前に、実際に人がやることをそのままやる:
         数滴落とし、指でひと撫でして渦を作り、流れが落ち着くのを待つ。 */
      const canvas = await page.waitForSelector("canvas", { timeout: 10_000 });
      const b = await canvas.boundingBox();
      if (!b) throw new Error(`no canvas box: ${shot.slug}`);
      const at = (fx, fy) => [b.x + b.width * fx, b.y + b.height * fy];

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

      const clip = frameFor({ x: b.x, y: b.y, w: b.width, h: b.height }, view, {
        fit: "height",
        anchor: "center",
        pad: 0,
      });
      await page.screenshot({ path: out, clip });
    } else {
      if (shot.act) await shot.act(page);
      const box = await boxOf(page, shot.target);
      const clip = frameFor(box, view, shot);
      console.log(
        `  ${shot.slug}: 塊 ${Math.round(box.w)}x${Math.round(box.h)} → 枠 ${Math.round(clip.width)}x${Math.round(clip.height)}`,
      );
      await page.screenshot({ path: out, clip });
    }

    webp(out, path.join(OUT, `${shot.slug}-${WIDE}.webp`), WIDE);
    webp(out, path.join(OUT, `${shot.slug}-${NARROW}.webp`), NARROW);
    console.log("撮った", shot.slug);
    await ctx.close();
  }

  await browser.close();
  rmSync(TMP, { recursive: true, force: true });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
