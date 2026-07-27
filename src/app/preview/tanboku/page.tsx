import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { Shippori_Mincho } from "next/font/google";
import s from "./tanboku.module.css";

/**
 * 書体は一書体だけ。色が一つも無い世界なので、字面も一つに絞る。
 * 和文は環境の明朝へ落ちる（Google の日本語サブセットは next/font に無い）。
 */
const mincho = Shippori_Mincho({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--tanboku-mincho",
});

export const metadata: Metadata = {
  title: "淡墨 — 濃淡だけで階層を作る",
  description: "Things I've built — 墨の濃度 6 段だけで組んだトップページ案",
};

type Vars = CSSProperties & Record<string, string>;

/** 帯ごとに、墨が紙へ滲み出す時刻をずらす */
const delay = (ms: number): Vars => ({ "--delay": `${ms}ms` });

/** 濃度の梯子。6 段の名は視覚上の物差しなので支援技術には読ませない */
const RUNGS = [
  { key: "paper", name: "紙", ink: s.onLight },
  { key: "goku", name: "極淡", ink: s.onLight },
  { key: "tan", name: "淡墨", ink: s.onLight },
  { key: "chu", name: "中墨", ink: s.onDark },
  { key: "no", name: "濃墨", ink: s.onDark },
  { key: "sho", name: "焦墨", ink: s.onDark },
];

export default function TanbokuPreview() {
  return (
    <main className={`${mincho.variable} ${s.world}`}>
      {/* 紙 — 墨が一滴も落ちていない面 */}
      <header className={`${s.band} ${s.head}`} style={delay(0)}>
        <div className={s.inner}>
          <h1 className={s.mark}>
            SUMINAWA
            <span className={s.showcase}>Showcase</span>
          </h1>
          <p className={s.tagEn}>{"Things I've built."}</p>
        </div>
      </header>

      {/* 濃度の梯子 — この世界の物差しを一度だけ見せて、作品の地へ降りる */}
      <div
        className={`${s.band} ${s.ladder}`}
        style={delay(200)}
        aria-hidden="true"
      >
        {RUNGS.map((r) => (
          <div key={r.key} className={s.rung}>
            <span className={`${s.rungLabel} ${r.ink}`}>{r.name}</span>
          </div>
        ))}
      </div>

      {/* 焦墨 — いちばん深い墨に沈む面 */}
      <Link
        href="/projects/suminagashi"
        className={`${s.band} ${s.plane} ${s.p1}`}
        style={delay(360)}
      >
        <div className={s.inner}>
          <p className={s.cat}>SITES</p>
          <h2 className={s.title}>墨流し — Suminagashi</h2>
          <p className={s.desc}>
            藍と墨が水面で渦を巻く、GPU
            流体の水盤。指でかき混ぜ、墨を落とし、気に入った模様はそのまま保存できる。
          </p>
          <ul className={s.tags}>
            <li>WebGL2</li>
            <li>GLSL</li>
            <li>TypeScript</li>
          </ul>
        </div>
      </Link>

      {/* 濃墨から焦墨へ戻る面。上の面との境は、線ではなく濃度の腰 */}
      <Link
        href="/projects/quote-simulator"
        className={`${s.band} ${s.plane} ${s.p2}`}
        style={delay(500)}
      >
        <div className={s.inner}>
          <p className={s.cat}>TOOLS</p>
          <h2 className={s.title}>見積もりシミュレーター</h2>
          <p className={s.desc}>
            作業条件を入れると、見積もりの内訳と合計がその場で見える。フリーランスの「いくらでやる？」を
            30 秒で形にする電卓。
          </p>
          <ul className={s.tags}>
            <li>Next.js</li>
            <li>TypeScript</li>
            <li>Tailwind CSS</li>
          </ul>
        </div>
      </Link>

      {/* 墨が乾いていく区間 */}
      <div className={`${s.band} ${s.dry}`} style={delay(640)} />

      {/* 極淡 — まだ墨の載っていない面 */}
      <section className={`${s.band} ${s.p3}`} style={delay(740)}>
        <div className={s.inner}>
          <p className={`${s.cat} ${s.catDim}`}>GAMES</p>
          <p className={s.soon}>準備中 — 最初のゲームがここに嵌まります。</p>
        </div>
      </section>

      {/* 紙に戻る */}
      <footer className={`${s.band} ${s.foot}`} style={delay(860)}>
        <div className={s.inner}>
          <p className={s.note}>すべての作品は、その場で実際に動きます。</p>
          <p className={s.back}>
            <Link href="/preview" className={s.backLink}>
              ← 一覧へ
            </Link>
          </p>
        </div>
      </footer>
    </main>
  );
}
