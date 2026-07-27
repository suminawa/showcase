/**
 * 潑墨（はつぼく）— 画面が墨に沈む
 * --------------------------------------------------------------------------
 * 構造 = 墨の量。画面のほぼ全面が濃い墨で、紙白の筋が稲妻のように走る。
 * 文字は墨の上に白く置かれ、作品だけが「墨を切り抜いた紙の窓」として現れる。
 *
 * 墨の地は position:fixed。スクロールしても墨は動かず、内容の方が墨の中を
 * 通り過ぎる。これが「沈む」の実装。
 *
 * 空カテゴリ（GAMES）だけは窓にしない — まだ墨が切り抜かれていない場所として
 * 墨のまま残す。空であることが構造で語られる。
 */
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { Jost, Noto_Serif_JP } from "next/font/google";
import s from "./hatsuboku.module.css";

/** 見出しの明朝。細い（200）を大きく使う */
const mincho = Noto_Serif_JP({
  subsets: ["latin"],
  weight: ["200", "300", "400"],
  display: "swap",
  variable: "--hb-mincho",
});

/** ラベル・タグの小さな大文字。開いたトラッキングで組む */
const label = Jost({
  subsets: ["latin"],
  weight: ["300", "400"],
  display: "swap",
  variable: "--hb-label",
});

export const metadata: Metadata = {
  title: "潑墨 — 画面が墨に沈む",
  description: "Things I've built — 潑墨で組んだトップページ案",
};

type Vars = CSSProperties & Record<string, string>;

const WORKS = [
  {
    cat: "SITES",
    title: "墨流し — Suminagashi",
    desc: "藍と墨が水面で渦を巻く、GPU 流体の水盤。指でかき混ぜ、墨を落とし、気に入った模様はそのまま保存できる。",
    tags: ["WebGL2", "GLSL", "TypeScript"],
    href: "/projects/suminagashi",
    plate: "/ink/sites.png",
  },
  {
    cat: "TOOLS",
    title: "見積もりシミュレーター",
    desc: "作業条件を入れると、見積もりの内訳と合計がその場で見える。フリーランスの「いくらでやる？」を 30 秒で形にする電卓。",
    tags: ["Next.js", "TypeScript", "Tailwind CSS"],
    href: "/projects/quote-simulator",
    plate: "/ink/tools.png",
  },
] as const;

export default function HatsubokuPreview() {
  return (
    <>
      {/* 墨の地は最初の一枚で全てが決まる。最優先で取りに行く */}
      <link
        rel="preload"
        as="image"
        href="/ink/sumi-dense.png"
        fetchPriority="high"
      />

      <div className={`${mincho.variable} ${label.variable} ${s.world}`}>
        {/* ---- 地：画面いっぱいの墨 ---- */}
        <div className={s.ink} aria-hidden="true">
          <span className={s.inkField} />
          <span className={s.inkVignette} />
          <span className={s.inkGrain} />
        </div>

        {/*
          .sheet は全幅の「切り取り枠」。墨だまりの羽根が画面の外まで
          伸びるのを許し、画面端でだけ切る。段組は内側の .column が持つ。
        */}
        <main className={s.sheet}>
         <div className={s.column}>
          {/* ---- 墨の上に白く置かれた見出し ---- */}
          <header className={s.hero}>
            <div className={s.pool}>
              <p className={s.mark}>
                <span className={s.wordmark}>SUMINAWA</span>
                <span className={s.showcase}>Showcase</span>
              </p>
              <h1 className={s.tagEn}>{"Things I've built."}</h1>
              <p className={s.tagJa}>口で説明するより、見た方が早い。</p>
            </div>
          </header>

          {/* ---- 墨を切り抜いた紙の窓 ---- */}
          <section className={s.works} aria-label="作品">
            {WORKS.map((w, i) => {
              const vars: Vars = {
                "--plate": `url("${w.plate}")`,
                "--delay": `${420 + i * 140}ms`,
              };
              return (
                <article
                  key={w.href}
                  className={`${s.slot} ${i === 0 ? s.slotA : s.slotB}`}
                >
                  <Link href={w.href} className={s.window} style={vars}>
                    <span className={s.plate} aria-hidden="true" />
                    <span className={s.paper}>
                      <span className={s.cat}>{w.cat}</span>
                      <span className={s.title}>{w.title}</span>
                      <span className={s.desc}>{w.desc}</span>
                      <span className={s.tags}>
                        {w.tags.map((t) => (
                          <span key={t} className={s.tag}>
                            {t}
                          </span>
                        ))}
                      </span>
                    </span>
                  </Link>
                </article>
              );
            })}

            {/* まだ切り抜かれていない窓。墨のまま残る */}
            <article className={`${s.slot} ${s.slotC}`}>
              <div className={s.uncut}>
                <span className={s.score} aria-hidden="true" />
                <span className={s.poolTight}>
                  <span className={s.catDim}>GAMES</span>
                  <span className={s.uncutNote}>
                    準備中 — 最初のゲームがここに嵌まります。
                  </span>
                </span>
              </div>
            </article>
          </section>

          <footer className={s.foot}>
            <span className={s.poolTight}>
              <span className={s.footNote}>
                すべての作品は、その場で実際に動きます。
              </span>
              <Link href="/preview" className={s.back}>
                ← 一覧へ
              </Link>
            </span>
          </footer>
         </div>
        </main>
      </div>
    </>
  );
}
