/*
 * THESIS: 飛白の法は「罫・枠・区切り線を一つも使わない」── この案だけが、それを正面から破る。
 *   写経の料紙には、字を書く前から界線（かいせん）が引いてある。線は飾りでも仕切りでもなく、
 *   字を【載せる】ための下地であり、紙の性格そのものだ。施主が「線が欲しい」と言うなら、
 *   線を後から足すのではなく、はじめから線の引かれた紙に書き直す道も見せなければ比較にならない。
 *   よってこの案は、紙を料紙に取り替える。墨の総量は増やさない ── 増えたのは紙の側の支度である。
 * WHY 横罫（この案の最大の判断）: 界線は本文の行に従う。飛白の本文は横組みだから、
 *   縦罫を引けば字を串刺しにする列の枠にしかならず、それは「分けるための線」＝区切り線になる。
 *   横罫なら字はその上に座る ── 載せるための線になる。さらに決定的な理由がもう一つある。
 *   飛白の骨は法1「起点の斜行」（名乗り=1列目 / 作品=6列目 / 結び=1列目）で、これは今まで
 *   【何も無い左余白】としてしか読めなかった。横罫を各段の版面の左端から引き、右へ掠れて
 *   消えるようにすると、罫の左端そのものが段ごとに右へ階段を上る。斜行が初めて目に見える。
 *   界線は法3を破るために引くのではなく、法1を可視化するために引く。
 * MECHANISM: 罫は border ではない（border は印刷の線であって墨ではない）。一本の横線を
 *   data-URI SVG の中で描き、feTurbulence → feDisplacementMap に食わせて微かに波打たせ、
 *   左から右への stop-opacity グラデーションで「引き始めに墨が溜まり、引き終わりで掠れて消える」を作る。
 *   これを 3 本入りのタイルにして background-repeat: repeat-y で行送りぶんだけ繰り返す。
 *   本文の line-height・行間・落款の寸法をすべて罫の間隔 (--hi-kei-pitch) の整数倍に揃えたので、
 *   字は必ず罫の上に座る。字が罫に乗らない料紙は、ただの罫線紙である。
 * HOVER: 触れると、その一件の版面の罫だけが墨を得る（380ms）。同じ波形・同じ位相の
 *   濃い罫を淡い罫の真上に重ね、上から下へ落ちる mask で減衰させてあるので、
 *   題の一本が真墨、その下は六割・二割と薄れる。読み手がいる場所が、紙の上で一本だけ濃い。
 *   他の罫は淡いまま待っている。走らない・伸びない ── 罫はもともとそこに在り、墨を得るだけ。
 * STORY: 料紙には時間が無い。読み込み時に罫は一切アニメーションしない（紙に先に引いてあるから）。
 *   その上を、従来どおり乾いた筆が一息で走る。支度は静止し、筆だけが動く。
 * COLOR: 紙 #F6F3EB / 墨 #1C1A15。罫は墨の alpha 0.34 前後（実効 #ACAAA4 ≒ 2.3:1）で、
 *   文字（最低 5.2:1）の下にはっきり沈む。唯一の色は朱 #A63A2E の落款ひとつ ── これは変えない。
 * FORM: hihaku-kei — 界線（プレビュー案・比較用 / 飛白の法3を意図的に破る唯一の案）
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Hina_Mincho, Shippori_Mincho } from "next/font/google";

import s from "./hihaku-kei.module.css";

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
  title: "界線 — 料紙に敷く",
  description:
    "Things I've built. — 字を書く前に紙へ引いてある横罫。触れた一件の界線だけが墨を得る",
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

export default function HihakuKeiPreview() {
  return (
    <main className={`${s.paper} ${display.variable} ${mincho.variable}`}>
      {/* 入りの一筆。紙の右上を斜めに掠めて画面外へ抜ける */}
      <div className={s.stroke} aria-hidden="true">
        <span className={`${s.ink} ${s.inkKasure}`} />
        <span className={`${s.ink} ${s.inkCore}`} />
      </div>

      {/* 筆が紙を離れる最後の掠れ。点だけになって右下で消える */}
      <div className={s.trace} aria-hidden="true" />

      {/* 界線は要素を足さずに引く。各段の ::before が、その段の版面ぶんだけ罫を敷く
          （装飾は擬似要素なので支援技術には現れず、pointer-events も持たない） */}
      <header className={s.mark}>
        <p className={s.showcase}>Showcase</p>
        <h1 className={s.wordmark}>SUMINAWA</h1>
        <p className={s.en}>{"Things I've built."}</p>
        {/* 落款。画面で色を持つのはここ一箇所だけ。寸法は界線一行ぶんの正方形に揃えた */}
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
