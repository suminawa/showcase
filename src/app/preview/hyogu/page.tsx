import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { Cormorant_Garamond, Zen_Old_Mincho } from "next/font/google";
import s from "./hyogu.module.css";

/** 本紙の中はすべて明朝。縦組みが主 */
const mincho = Zen_Old_Mincho({
  subsets: ["latin"],
  weight: ["400", "600", "900"],
  display: "swap",
  variable: "--hyogu-mincho",
});

/** 本紙に控えめに添えるラテン */
const garamond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--hyogu-latin",
});

export const metadata: Metadata = {
  title: "表具 — 掛軸の表装",
  description: "Things I've built — 掛軸の表装で組んだトップページ案",
};

type Vars = CSSProperties & Record<string, string | number>;

/**
 * 一幅の掛軸。
 * 表装の比は本紙丈 H を 1 とする定数で、hyogu.module.css に一括で置いてある。
 * ここでは寸法（--h = 本紙丈）と本紙の縦横比だけを渡す。
 */
function Kakejiku({
  h,
  paper,
  tone = "hon",
  delay = 0,
  children,
}: {
  h: string;
  paper: number;
  tone?: "hon" | "hakushi";
  delay?: number;
  children: React.ReactNode;
}) {
  const vars: Vars = { "--h": h, "--paper": paper, "--delay": `${delay}ms` };
  return (
    <div
      className={`${s.kake} ${tone === "hakushi" ? s.kakeHakushi : ""}`}
      style={vars}
    >
      <span className={s.kugi} aria-hidden="true" />
      <svg
        className={s.kakeo}
        viewBox="0 0 100 26"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M9 26 L50 2" vectorEffect="non-scaling-stroke" />
        <path d="M91 26 L50 2" vectorEffect="non-scaling-stroke" />
      </svg>
      <span className={s.hasso} aria-hidden="true" />
      <div className={s.jiku}>
        <span className={s.ten} aria-hidden="true">
          <i className={s.fuutai} />
          <i className={s.fuutai} />
        </span>
        <span className={s.ichimonjiUe} aria-hidden="true" />
        <div className={s.honshi}>{children}</div>
        <span className={s.ichimonjiShita} aria-hidden="true" />
        <span className={s.chi} aria-hidden="true" />
      </div>
      <span className={s.jikubou} aria-hidden="true">
        <i className={s.jikusaki} />
        <i className={s.jikusaki} />
      </span>
    </div>
  );
}

const WORKS = [
  {
    category: "SITES",
    title: "墨流し",
    latin: "Suminagashi",
    body: "藍と墨が水面で渦を巻く、GPU 流体の水盤。指でかき混ぜ、墨を落とし、気に入った模様はそのまま保存できる。",
    tags: ["WebGL2", "GLSL", "TypeScript"],
    href: "/projects/suminagashi",
  },
  {
    category: "TOOLS",
    title: "見積もりシミュレーター",
    latin: null,
    body: "作業条件を入れると、見積もりの内訳と合計がその場で見える。フリーランスの「いくらでやる？」を 30 秒で形にする電卓。",
    tags: ["Next.js", "TypeScript", "Tailwind CSS"],
    href: "/projects/quote-simulator",
  },
] as const;

export default function HyoguPreview() {
  return (
    <main className={`${s.world} ${mincho.variable} ${garamond.variable}`}>
      {/* ── 床の間 ── */}
      <section className={s.toko}>
        <span className={s.tokobashira} aria-hidden="true" />
        <div className={s.otoshigake} aria-hidden="true" />
        <div className={s.tokoOku}>
          <Kakejiku h="var(--h-hero)" paper={0.78}>
            <span className={s.wash} aria-hidden="true" />
            <div className={s.honshiHero}>
              {/* 縦組みの改行位置は読点で決める（一行 = 一句） */}
              <p className={s.tagline}>
                <span>口で説明するより、</span>
                <span>見た方が早い。</span>
              </p>
              <p className={s.en}>Things I&rsquo;ve built.</p>
              <div className={s.sig}>
                <h1 className={s.wordmark}>
                  SUMINAWA
                  <span className={s.showcase}>Showcase</span>
                </h1>
                <span className={s.rakkan} aria-hidden="true">
                  墨
                </span>
              </div>
            </div>
          </Kakejiku>
        </div>
        <div className={s.tokogamachi} aria-hidden="true" />
      </section>

      {/* ── 壁：三幅対 ── */}
      <section className={s.kabe} aria-label="作品">
        <div className={s.nageshi} aria-hidden="true" />
        <div className={s.sanpuku}>
          {WORKS.map((w, i) => (
            <Link key={w.href} href={w.href} className={s.kakeLink}>
              <Kakejiku h="var(--h-work)" paper={0.62} delay={i * 110}>
                <article className={s.flow}>
                  <p className={s.category}>{w.category}</p>
                  <h2 className={s.title}>
                    {w.title}
                    {w.latin ? (
                      <span className={s.titleLatin}>— {w.latin}</span>
                    ) : null}
                  </h2>
                  <p className={s.body}>{w.body}</p>
                  <ul className={s.tags}>
                    {w.tags.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </article>
              </Kakejiku>
            </Link>
          ))}

          <Kakejiku h="var(--h-work)" paper={0.62} tone="hakushi" delay={220}>
            <div className={s.flow}>
              <p className={s.category}>GAMES</p>
              <p className={s.junbi}>
                <span>準備中 — 最初のゲームが</span>
                <span>ここに嵌まります。</span>
              </p>
            </div>
          </Kakejiku>
        </div>
      </section>

      {/* ── 地板 ── */}
      <footer className={s.jiita}>
        <p className={s.note}>すべての作品は、その場で実際に動きます。</p>
        <Link href="/preview" className={s.back}>
          ← 一覧へ
        </Link>
      </footer>
    </main>
  );
}
