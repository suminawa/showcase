/*
 * THESIS: 飛白（ひはく）は「墨で描く」意匠ではない。乾いた筆が紙を掠め、
 *   墨が飛んで【白が残る】。だから主役は紙であって墨ではない。画面の八割以上を
 *   何も無い紙のまま残し、墨は決定的な二筆しか置かない ── 入りの一筆（右上から
 *   紙を斜めに掠める）と、筆が紙を離れる最後の掠れ（右下に散る点）。
 * OWN-WORLD: 大と小の【断絶】が飛白の呼吸。字は「大きな明朝」と「極端に小さい補足」の
 *   二段しか無く、その中間（20〜30px 帯）を一つも使わない。罫・枠・角丸・チップは皆無。
 *   構造を作るのは縦の余白と、段ごとに右へずれていく起点だけ ──
 *   名乗り=1列目 / 言葉=3列目 / 作品=6列目 / 結び=1列目に戻る。左の紙が斜めに削れていく。
 * STORY: 読み込み時、乾いた筆が左から右へ一息で走る（clip-path 1.45s / 掠れが 0.3s 遅れて追う）。
 *   走り終えたら、あとは何も動かない。一筆の勢いと、その後の長い沈黙。
 * FIRST VIEWPORT: 右上に一筆。左下に SUMINAWA。作品の文字は一切出さない。
 *   飛白はまず「紙に何も無いこと」を見せる様式なので、初画面は名乗りだけで終える。
 * COLOR: 紙 #F6F3EB / 墨 #1C1A15 / 掠れの灰 #8E8A80（図版専用・文字には使わない）。
 *   唯一の色は朱 #A63A2E の落款ひとつ。画面全体でここ一箇所しか色が無い。
 * FORM: hihaku — かすれと余白（プレビュー案・比較用）
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Hina_Mincho, Shippori_Mincho } from "next/font/google";

import s from "./hihaku.module.css";

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
  title: "飛白 — かすれと余白",
  description:
    "Things I've built. — 乾いた筆が紙を掠め、白が残る。紙が主で、墨は決定的な数筆だけ",
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

export default function HihakuPreview() {
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
