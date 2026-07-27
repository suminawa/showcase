/*
 * THESIS: 飛白は「白が残る」意匠であって、墨で描く意匠ではない。紙が主で墨は従 ──
 *   その原則はそのまま置く。この案が足すのは【筆で描かれない線】ひとつだけ。
 *   墨縄（すみなわ）は大工の道具だ。墨壺から引いた糸に墨を含ませ、材の上に張って、
 *   指で摘んで弾く。糸が材を打った瞬間、そこに死ぬほど真っ直ぐな線が一本転写される。
 *   線を引くための墨 ── それが屋号 SUMINAWA の由来なので、屋号そのものを画面に持ち込む。
 * OWN-WORLD: 画面には手のゆらぎを持つ二筆（.stroke / .trace）しか無かった。そこへ
 *   ただ一本、【ゆらぎを持たない線】を対置する。筆と糸の対比がこの案の主題であって、
 *   線の色や太さの話ではない。だから線は必ず真っ直ぐ・必ず水平・必ず紙の端から端まで。
 *   斜行（名乗り1列目 / 作品6列目 / 結び1列目）で左に溜まった余白 ── 進行の目盛りを、
 *   この一本だけが横から串刺しにする。法1を横断してよいのはこの線だけ。
 * MECHANISM: .nawa は position:absolute だが top/bottom を書かない。縦は静止位置
 *   （grid コンテナ .work の content box 上端）に落ち、横は inset-inline:0 で
 *   包含ブロック ── position:relative を持つ最も近い祖先 .paper ── の padding box、
 *   すなわち紙の全幅に張られる。そのために .works から position:relative を外した
 *   （z-index:1 は grid item なので position 無しでも効く）。DOM を紙の直下へ
 *   移さずに全幅を得るのは、この静止位置の規則ひとつで足りる。
 * STORY: 静止した紙は原本と完全に同一 ── 糸はまだ張られていない。
 *   読み手が作品に触れた（hover / focus-visible）瞬間だけ、糸が左端から一気に張られ
 *   （clip-path 118ms）、打たれ、200ms ほど 1px 未満の残響で揺れて止まる。
 *   他案が「流れる」「滲む」のに対し、この案だけが【打撃】。離せば 120ms で消える。
 * COLOR: 原本のまま。紙 #F6F3EB / 墨 #1C1A15。唯一の色は朱 #A63A2E の落款ひとつ。
 *   墨縄の線も墨 #1C1A15 で、新しい色は一つも増やさない。
 * FORM: hihaku-nawa — 墨縄（すみなわ）・打つ
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Hina_Mincho, Shippori_Mincho } from "next/font/google";

import s from "./hihaku-nawa.module.css";

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
  title: "飛白 墨縄 — 打つ",
  description:
    "Things I've built. — 触れた行に、糸が張られて弾かれる。筆のゆらぎに、ただ一本まっすぐな墨縄を対置する",
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

export default function HihakuNawaPreview() {
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
            {/*
             * 墨縄。トリガは .work（作品の一行）なので、行のどこに触れても打たれる。
             * 静止時は clip-path で幅ゼロ ── 糸はまだ張られていない。
             * 触れた行にだけ、紙の左端から右端まで一本が打たれる。
             * 外側 .nawa が「張り」（clip-path）、内側 .nawaLine が「残響」（translateY）。
             */}
            <span className={s.nawa} aria-hidden="true">
              <i className={s.nawaLine} />
            </span>
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
