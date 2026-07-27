import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Cinzel, Zen_Old_Mincho } from "next/font/google";
import s from "./takuhon.module.css";

/**
 * 拓本 — 石を拓り取る。
 *
 * 石碑に紙を当て、墨で叩いて写し取る。地は墨で真っ黒、文字と図は紙の白で抜ける。
 * この世界の構造は「反転」ひとつ。白が figure、墨が ground。
 * 明るい地は一切作らない。作品は、黒い石の面から拓り取られた白い区画として現れる。
 */

/** 碑文。石に刻まれた字の重さ = 太い明朝。縦組みの本体もこれ */
const mincho = Zen_Old_Mincho({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  display: "swap",
  variable: "--takuhon-mincho",
});

/** 題額のラテン。Cinzel はローマ碑文の刻字（capitalis monumentalis）が母型 */
const sekkoku = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600", "900"],
  display: "swap",
  variable: "--takuhon-sekkoku",
});

export const metadata: Metadata = {
  title: "拓本 — 石を拓り取る",
  description: "Things I've built — 拓本の反転で組んだトップページ案",
};

/** JSX に直接置くとエスケープが要る文字列は定数にする */
const TAGLINE_EN = "Things I've built.";
const DESC_SUMINAGASHI =
  "藍と墨が水面で渦を巻く、GPU 流体の水盤。指でかき混ぜ、墨を落とし、気に入った模様はそのまま保存できる。";
const DESC_QUOTE =
  "作業条件を入れると、見積もりの内訳と合計がその場で見える。フリーランスの「いくらでやる？」を 30 秒で形にする電卓。";
const GAMES_NOTE = "準備中 — 最初のゲームがここに嵌まります。";

/** 碑の界格（外枠）。石の縁のように少し欠ける不定形 */
const FRAME_POINTS =
  "0.5,1.1 8.7,0.8 16.6,1.3 25.3,1.1 32.9,0.7 41.2,0.8 50.6,2.0 58.6,0.7 66.7,0.6 75.1,1.3 82.9,0.8 91.4,1.1 99.4,0.5 99.1,8.5 99.1,16.2 99.1,25.2 98.9,33.0 98.8,42.2 99.2,50.5 98.8,58.3 98.9,66.3 99.2,74.6 98.7,83.1 98.8,91.1 100,98.8 91.1,99.0 83.2,99.0 75.2,98.8 66.4,99.1 58.6,99.4 50.1,99.2 41.2,99.0 33.2,99.3 25.1,98.9 16.5,99.1 7.9,99.0 1.0,99.6 2.2,91.7 0.7,83.9 1.3,74.5 0.8,67.1 1.1,58.7 1.3,49.8 0.7,42.2 1.1,33.3 0.9,24.5 0.8,16.5 0.8,8.2";

/** まだ拓っていない石。輪郭だけが残る */
const BLANK_POINTS =
  "0.4,1.2 11.9,1.0 23.9,0.9 35.7,1.2 47.3,0.9 59.1,1.3 70.1,1.4 81.8,2.9 94.2,1.1 98.6,6.2 99.1,17.1 96.8,29.7 98.9,41.3 96.4,53.3 98.7,64.4 98.9,76.1 99.2,88.7 99.7,98.6 87.7,98.6 76.5,98.8 65.2,98.6 53.1,98.8 41.2,99.1 29.7,99.0 17.8,98.8 6.4,99.1 1.1,94.5 1.0,82.3 1.5,70.3 1.4,59.1 1.0,47.6 1.1,35.1 1.3,23.7 1.2,12.2";

type Vars = CSSProperties & Record<string, string | number>;

type Work = {
  cat: string;
  title: string;
  desc: string;
  tags: string[];
  href: string;
  fig: string;
  /** 叩きむらの出方を区画ごとにずらす */
  tap: string;
  slab: string;
  delay: number;
};

const WORKS: Work[] = [
  {
    cat: "SITES",
    title: "墨流し — Suminagashi",
    desc: DESC_SUMINAGASHI,
    tags: ["WebGL2", "GLSL", "TypeScript"],
    href: "/projects/suminagashi",
    fig: "/ink/sites.png",
    tap: "22% 30%",
    slab: s.slabA,
    delay: 520,
  },
  {
    cat: "TOOLS",
    title: "見積もりシミュレーター",
    desc: DESC_QUOTE,
    tags: ["Next.js", "TypeScript", "Tailwind CSS"],
    href: "/projects/quote-simulator",
    fig: "/ink/tools.png",
    tap: "68% 62%",
    slab: s.slabB,
    delay: 640,
  },
];

export default function TakuhonPreview() {
  return (
    <main className={`${mincho.variable} ${sekkoku.variable} ${s.page}`}>
      {/* 石の面。叩きむら・紙の繊維・四隅の沈み */}
      <div className={s.ground} aria-hidden="true" />
      <div className={s.grain} aria-hidden="true" />
      <div className={s.vignette} aria-hidden="true" />

      <header className={s.hi}>
        <svg
          className={s.kekkaku}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <polygon points={FRAME_POINTS} vectorEffect="non-scaling-stroke" />
        </svg>

        <div className={s.gaku}>
          <p className={s.showcase}>Showcase</p>
          <h1 className={s.wordmark}>SUMINAWA</h1>
        </div>

        <div className={`${s.kai} ${s.kaisen}`} aria-hidden="true" />

        <div className={s.hibun}>
          <p className={s.hibunJa}>口で説明するより、見た方が早い。</p>
          <div className={`${s.kai} ${s.kaisenTate}`} aria-hidden="true" />
          <p className={s.hibunLa}>{TAGLINE_EN}</p>
        </div>

        <div className={s.tap} aria-hidden="true" />
      </header>

      <section className={s.works} aria-label="作品">
        {WORKS.map((w) => (
          <Link
            key={w.href}
            href={w.href}
            className={`${s.slab} ${w.slab}`}
            style={{ "--delay": `${w.delay}ms` } as Vars}
          >
            <span className={s.cat}>{w.cat}</span>
            <span
              className={s.fig}
              style={{ "--fig": `url("${w.fig}")` } as Vars}
              aria-hidden="true"
            />
            <div className={s.slabIn}>
              <h2 className={s.title}>{w.title}</h2>
              <p className={s.desc}>{w.desc}</p>
              <ul className={s.tags}>
                {w.tags.map((t) => (
                  <li key={t} className={s.tag}>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <span
              className={s.slabTap}
              style={{ "--pos": w.tap } as Vars}
              aria-hidden="true"
            />
          </Link>
        ))}

        <div
          className={`${s.slab} ${s.blank}`}
          style={{ "--delay": "760ms" } as Vars}
        >
          <svg
            className={s.blankFrame}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polygon points={BLANK_POINTS} vectorEffect="non-scaling-stroke" />
          </svg>
          <span className={`${s.cat} ${s.catBlank}`}>GAMES</span>
          <span className={s.figGhost} aria-hidden="true" />
          <div className={s.slabIn}>
            <h2 className={s.blankNote}>{GAMES_NOTE}</h2>
          </div>
        </div>
      </section>

      <footer className={s.foot}>
        <p className={s.footNote}>すべての作品は、その場で実際に動きます。</p>
        <Link href="/preview" className={s.back}>
          ← 一覧へ
        </Link>
      </footer>
    </main>
  );
}
