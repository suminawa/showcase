/*
 * THESIS: 飛白（ひはく）は「墨で描く」意匠ではない。乾いた筆が紙を掠め、
 *   墨が飛んで【白が残る】。だから主役は紙であって墨ではない。画面の八割以上を
 *   何も無い紙のまま残し、墨は決定的な二筆しか置かない ── 入りの一筆（右上から
 *   紙を斜めに掠める）と、筆が紙を離れる最後の掠れ（右下に散る点）。
 *
 * 走り（はしり）── この案が原本に足したもの
 *   原本の墨は二筆で終わっている。この案は【三筆目】を足す。ただし紙の上には置かない。
 *   静止した紙は原本と一ピクセルも違わず、読み手が作品に触れた、その一件の背後にだけ、
 *   同じ筆が左から右へ一息で走る。手を離せば 300ms で乾いて消え、紙は元の二筆に戻る。
 *   だから「墨は二筆だけ」は破れていない ── 三筆目は紙ではなく、読み手の手の中にある。
 *
 *   別の道具を持ち出さないことが、この案の全部である。原本の入りの一筆は
 *   .inkKasure / .inkCore という二層 ── 同じ乱流・同じ seed を閾値違いで
 *   「掠れの灰」と「濃い芯」に分解し、darken で紙に重ねる ── で出来ている。
 *   三筆目もまったく同じ作り方をする。違うのは寸法（短く細い一筆なので割れ目は
 *   もっと細かい：baseFrequency y=0.19、原本の入りは 0.1）と、時間の質だけ。
 *   これは打撃ではなく【筆速】なので、470〜620ms かけて clip-path が右へ抜ける。
 *
 * OWN-WORLD: 大と小の【断絶】が飛白の呼吸。字は「大きな明朝」と「極端に小さい補足」の
 *   二段しか無く、その中間（20〜30px 帯）を一つも使わない。罫・枠・角丸・チップは皆無。
 *   構造を作るのは縦の余白と、段ごとに右へずれていく起点だけ ──
 *   名乗り=1列目 / 作品=6列目 / 結び=1列目に戻る。左の紙が斜めに削れていく。
 * STORY: 読み込み時、乾いた筆が左から右へ一息で走る（clip-path 1.45s）。走り終えたら
 *   何も動かない。長い沈黙のあと、読み手が作品に手を伸ばしたときだけ、同じ手が
 *   もう一筆だけ走る。二筆目と三筆目のあいだに、読み手の時間が挟まっている。
 * FIRST VIEWPORT: 右上に一筆。左下に SUMINAWA。作品の文字は一切出さない。
 *   飛白はまず「紙に何も無いこと」を見せる様式なので、初画面は名乗りだけで終える。
 * COLOR: 紙 #F6F3EB / 墨 #1C1A15 / 掠れの灰 #8E8A80（図版専用・文字には使わない）。
 *   唯一の色は朱 #A63A2E の落款ひとつ。三筆目も色を持たない ── 同じ墨、同じ乾き。
 * FORM: hihaku-hashiri — 走り（三筆目）
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Hina_Mincho, Shippori_Mincho } from "next/font/google";

import s from "./hihaku-hashiri.module.css";

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
  title: "飛白 走り — 三筆目",
  description:
    "Things I've built. — 静止した紙には二筆しか無い。触れた一件の背後にだけ、同じ筆が左から右へ走る",
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

export default function HihakuHashiriPreview() {
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
              {/*
                三筆目。静止時は clip-path で幅ゼロに畳まれていて紙の上に存在しない。
                触れた（または focus した）ときだけ左から右へ走る。
                ラッパは transform も z-index も opacity も持てない ── 持つと
                中の mix-blend-mode: darken がここで隔離され、素材の地色の矩形が
                紙の上に浮いてしまう（原本 .stroke の実測メモと同じ理由）。
                傾き・合成・掠れは、すべて子の二層が担当する。
              */}
              <span className={s.hashiri} aria-hidden="true">
                <span className={`${s.run} ${s.runKasure}`} />
                <span className={`${s.run} ${s.runCore}`} />
              </span>
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
