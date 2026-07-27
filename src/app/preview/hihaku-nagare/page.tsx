/*
 * THESIS: 飛白は乾いた筆の意匠。だがこの案は乾かない方へ振る ── 施主の「流れ、みたいな」を
 *   最も文字通りに受け、【線を一本も引かない】ことで応える。水に落ちた墨は線にならない。
 *   端が無く、始点も終点も無く、ただ滲んで拡がってほどける。他の案が「引く／打つ」動作で
 *   線を作るのに対し、ここで起きるのは動作ではなく【時間の経過】である。
 * OWN-WORLD: 原本の三規則（起点の斜行 / 字の断絶 / 沈黙の段差）と墨の二筆は一切変えない。
 *   足したのは第三の墨ではなく、紙の【湿り】。静止した紙は原本と 1px も違わない。
 * STORY: 作品の一行に触れると、左に溜まった白い紙のほうから水が差してくる。
 *   1.55s かけて行まで届き、離すと 0.84s かけて水に薄まる。5 案で最も遅い。
 *   触れているあいだ、底の水は 31s 周期でゆっくり揺れつづける ── 完成して止まらない。
 * MECHANISM: 湿りは二枚の板でできている。どちらも背景に sumi-dense.png
 *   （このリポジトリの WebGL 流体ソルバが実際に水面を計算して描いた画）を敷き、
 *   等方 feTurbulence（baseFrequency x≒y）の雲マスクで抜く。原本の異方ノイズ（x≪y）が
 *   「筆の毛の割れ」なら、等方は「水の斑」── 縞の真逆で、これが筆ではない証拠になる。
 *   そのうえで background-position と mask-position を【別の速さ】で走らせる。
 *   同じ速さで動けば「板が移動した」に見えるが、速さが違うと視差が出て「流れている」に見える。
 *   輪郭は持たせない。マスクの包絡（3 つの重なる楕円グラデーション）が板の四辺すべてで
 *   0 まで落ちるので、どこにも境界の線が立たない。
 * A11Y: :hover と :focus-visible に完全に同じ表現。湿りが乗る行は文字を一段濃くして、
 *   最悪値（包絡 1.0 × 乱流 1.0 × 素材の最暗点）でも 6.3:1 以上を保つ。
 *   reduced-motion では流れず、「薄く墨が乗った状態」がそのまま静止画として出る。
 * FIRST VIEWPORT: 原本と同一。名乗りだけ。湿りは触れるまで存在しない。
 * COLOR: 原本のまま。唯一の色は朱 #A63A2E の落款ひとつ。湿りは無彩の墨を温めただけで色を持たない。
 * FORM: hihaku-nagare — 流れ（プレビュー案・比較用）
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Hina_Mincho, Shippori_Mincho } from "next/font/google";

import s from "./hihaku-nagare.module.css";

/**
 * 大の一行だけに使う明朝。日本語書体の細身のローマンで、
 * 太い墨のかたまりと並べたときに髪の毛のような線として残る。
 */
const display = Hina_Mincho({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--hi-display",
});

/** 極端に小さい補足はすべてこの明朝。小さくても骨が残る 500 を併せて持つ。 */
const mincho = Shippori_Mincho({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--hi-mincho",
});

export const metadata: Metadata = {
  title: "飛白・流れ — 触れた行の紙が濡れる",
  description:
    "Things I've built. — 線を一本も引かない案。触れると左の余白から水が差し、行の紙がゆっくり湿る",
};

const WORKS = [
  {
    cat: "SITES",
    title: "墨流し — Suminagashi",
    desc: "藍と墨が水面で渦を巻く、GPU 流体の水盤。指でかき混ぜ、墨を落とし、気に入った模様はそのまま保存できる。",
    tags: ["WebGL2", "GLSL", "TypeScript"],
    href: "/projects/suminagashi",
  },
  {
    cat: "TOOLS",
    title: "見積もりシミュレーター",
    desc: "作業条件を入れると、見積もりの内訳と合計がその場で見える。フリーランスの「いくらでやる？」を 30 秒で形にする電卓。",
    tags: ["Next.js", "TypeScript", "Tailwind CSS"],
    href: "/projects/quote-simulator",
  },
];

export default function HihakuNagarePreview() {
  return (
    <main className={`${s.paper} ${display.variable} ${mincho.variable}`}>
      {/* 入りの一筆。紙の右上を斜めに掠めて画面外へ抜ける */}
      <div className={s.stroke} aria-hidden="true">
        <span className={`${s.ink} ${s.inkKasure}`} />
        <span className={`${s.ink} ${s.inkCore}`} />
      </div>

      {/* 筆が紙を離れる最後の掠れ。点だけになって右下で消える */}
      <div className={s.trace} aria-hidden="true" />

      <header className={s.mark}>
        <p className={s.showcase}>Showcase</p>
        <h1 className={s.wordmark}>SUMINAWA</h1>
        <p className={s.en}>{"Things I've built."}</p>
        {/* 落款。画面で色を持つのはここ一箇所だけ */}
        <span className={s.seal} aria-hidden="true">
          墨
        </span>
      </header>

      <ol className={s.works}>
        {WORKS.map((w) => (
          <li key={w.href} className={s.work}>
            {/*
              湿りの二枚。静止時は opacity 0 で、紙の上には何も無い。
              flow     = 差してくる水（表層。背景と雲が別の速さで走る）
              flowDeep = 底の流れ（触れているあいだ 31s 周期でゆっくり揺れる）
              どちらも絶対配置で行の外へ大きくはみ出し、文字の背面に敷く。
            */}
            <span className={s.flow} aria-hidden="true" />
            <span className={s.flowDeep} aria-hidden="true" />

            <span className={s.cat}>{w.cat}</span>
            <Link href={w.href} className={s.entry}>
              <span className={s.title}>{w.title}</span>
              <span className={s.desc}>{w.desc}</span>
              <span className={s.tags}>
                {w.tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </span>
            </Link>
          </li>
        ))}

        <li className={s.work}>
          <span className={s.cat}>GAMES</span>
          <p className={s.empty}>準備中 — 最初のゲームがここに嵌まります。</p>
        </li>
      </ol>

      <footer className={s.close}>
        <p className={s.closeLine}>すべての作品は、その場で実際に動きます。</p>
        <Link href="/preview" className={s.back}>
          ← 一覧へ
        </Link>
      </footer>
    </main>
  );
}
