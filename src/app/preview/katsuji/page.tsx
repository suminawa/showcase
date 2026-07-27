import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Alfa_Slab_One, Shippori_Mincho, Source_Serif_4 } from "next/font/google";

import styles from "./katsuji.module.css";

/** 木活字 — 太く、スラブが重い。見出しと分類の小文字組に使う */
const woodType = Alfa_Slab_One({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--kt-wood",
});

/** 活版印刷の面影を残す和文明朝。インクが食い込んだ縁の太りに近い */
const mincho = Shippori_Mincho({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--kt-mincho",
});

/** 欧文の本文・小物。ステムが太く、活字の粒が揃う */
const serif = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
  variable: "--kt-serif",
});

export const metadata: Metadata = {
  title: "活版の組版 — Preview",
  description: "鉄のチェースに締め込まれた版。余白は込め物という物体である。",
};

const WORKS = [
  {
    no: "01",
    cat: "SITES",
    title: "墨流し — Suminagashi",
    desc: "藍と墨が水面で渦を巻く、GPU 流体の水盤。指でかき混ぜ、墨を落とし、気に入った模様はそのまま保存できる。",
    tags: ["WebGL2", "GLSL", "TypeScript"],
    href: "/projects/suminagashi",
    cut: "/ink/sites.png",
  },
  {
    no: "02",
    cat: "TOOLS",
    title: "見積もりシミュレーター",
    desc: "作業条件を入れると、見積もりの内訳と合計がその場で見える。フリーランスの「いくらでやる？」を 30 秒で形にする電卓。",
    tags: ["Next.js", "TypeScript", "Tailwind CSS"],
    href: "/projects/quote-simulator",
    cut: "/ink/tools.png",
  },
] as const;

const WORDMARK = ["S", "U", "M", "I", "N", "A", "W", "A"];

export default function KatsujiPreview() {
  return (
    <div className={`${woodType.variable} ${mincho.variable} ${serif.variable} ${styles.page}`}>
      {/* 鉄のチェース。四隅にトンボ（見当）、内側にボルト */}
      <div className={styles.chase}>
        <span className={`${styles.reg} ${styles.regTl}`} aria-hidden="true" />
        <span className={`${styles.reg} ${styles.regTr}`} aria-hidden="true" />
        <span className={`${styles.reg} ${styles.regBl}`} aria-hidden="true" />
        <span className={`${styles.reg} ${styles.regBr}`} aria-hidden="true" />

        <div className={styles.lockup}>
          {/* ───────── 版（フォーム）───────── */}
          <div className={styles.forme}>
            {/* 込め物 — 上端 */}
            <div className={`${styles.furnH} ${styles.ft}`} aria-hidden="true">
              <span className={styles.pica}>24</span>
              <span className={styles.pica}>24</span>
              <span className={styles.pica}>18</span>
            </div>

            {/* 込め物 — 左右の側棒 */}
            <div className={`${styles.furnV} ${styles.rl}`} aria-hidden="true" />
            <div className={`${styles.furnV} ${styles.rr}`} aria-hidden="true" />

            {/* 題字の組 */}
            <header className={`${styles.type} ${styles.mark}`}>
              <div className={styles.markTop}>
                <span className={styles.showcase}>Showcase</span>
                <span className={styles.hair} aria-hidden="true" />
                <span className={styles.emQuad} aria-hidden="true">
                  ▣
                </span>
              </div>
              <h1 className={styles.wordmark} aria-label="SUMINAWA">
                {WORDMARK.map((ch, i) => (
                  <span key={`${ch}-${i}`} aria-hidden="true">
                    {ch}
                  </span>
                ))}
              </h1>
            </header>

            {/* 込め物 — 題字と標語のあいだ */}
            <div className={`${styles.furnH} ${styles.fa}`} aria-hidden="true" />

            {/* 縦組みの込め物（題字の右） */}
            <div className={`${styles.furnV} ${styles.fma}`} aria-hidden="true">
              <span className={styles.picaV}>12</span>
            </div>

            {/* 標語（欧文） */}
            <div className={`${styles.type} ${styles.tag}`}>
              <p className={styles.tagEn}>
                {"Things I've built"}
                <span className={styles.shu}>.</span>
              </p>
            </div>

            {/* 標語の行を埋める込め物 */}
            <div className={`${styles.furnEnd} ${styles.ftg}`} aria-hidden="true" />

            {/* 標語（和文・縦組み） */}
            <div className={`${styles.type} ${styles.jpa}`}>
              <p className={styles.tagJa}>口で説明するより、見た方が早い。</p>
            </div>

            {/* 木口の込め物 */}
            <div className={`${styles.furnEnd} ${styles.fna}`} aria-hidden="true" />

            <div className={`${styles.furnH} ${styles.fb}`} aria-hidden="true">
              <span className={styles.pica}>36</span>
              <span className={styles.pica}>36</span>
            </div>

            {/* ───── 作品の組 ───── */}
            {WORKS.map((w, i) => (
              <article
                key={w.href}
                className={`${styles.type} ${styles.work} ${i === 0 ? styles.w1 : styles.w2}`}
              >
                <Link href={w.href} className={styles.workLink}>
                  <figure className={styles.cutMount}>
                    <div className={`${styles.cut} ${i === 1 ? styles.cutTools : ""}`}>
                      <Image
                        src={w.cut}
                        alt=""
                        fill
                        sizes="(max-width: 760px) 92vw, 260px"
                        className={styles.cutImg}
                      />
                    </div>
                  </figure>

                  <div className={styles.setting}>
                    <div className={styles.catRow}>
                      <span className={styles.cat} data-ghost={w.cat}>
                        {w.cat}
                      </span>
                      <span className={styles.catRule} aria-hidden="true" />
                      <span className={styles.no}>{w.no}</span>
                    </div>
                    <h2 className={styles.workTitle}>{w.title}</h2>
                    <p className={styles.workDesc}>{w.desc}</p>
                    <ul className={styles.tags}>
                      {w.tags.map((t) => (
                        <li key={t} className={styles.sort}>
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Link>
              </article>
            ))}

            <div className={`${styles.furnH} ${styles.fc}`} aria-hidden="true" />
            <div className={`${styles.furnH} ${styles.fd}`} aria-hidden="true">
              <span className={styles.pica}>18</span>
              <span className={styles.pica}>18</span>
              <span className={styles.pica}>18</span>
            </div>

            {/* 空カテゴリ — まだ組が無いので、そこは込め物が埋めている */}
            <section className={`${styles.g}`} aria-labelledby="kt-games">
              <span id="kt-games" className={styles.catWood}>
                GAMES
              </span>
              <span className={styles.woodRule} aria-hidden="true" />
              <p className={styles.woodText}>準備中 — 最初のゲームがここに嵌まります。</p>
            </section>
            <div className={`${styles.furnEnd} ${styles.fge}`} aria-hidden="true" />

            <div className={`${styles.furnH} ${styles.fe}`} aria-hidden="true">
              <span className={styles.pica}>24</span>
              <span className={styles.pica}>24</span>
            </div>

            {/* 奥付 */}
            <div className={`${styles.type} ${styles.foot}`}>
              <p className={styles.colophon}>すべての作品は、その場で実際に動きます。</p>
            </div>
            <div className={`${styles.furnEnd} ${styles.ffm}`} aria-hidden="true" />
            <div className={styles.back}>
              <Link href="/preview" className={styles.backLink}>
                ← 一覧へ
              </Link>
            </div>

            <div className={`${styles.furnH} ${styles.fg}`} aria-hidden="true">
              <span className={styles.pica}>24</span>
              <span className={styles.pica}>24</span>
              <span className={styles.pica}>12</span>
            </div>
          </div>

          {/* ───────── クワタ（締め）───────── */}
          <div className={styles.quoinCol} aria-hidden="true">
            <span className={styles.quoin} />
            <span className={styles.quoin} />
            <span className={styles.quoin} />
          </div>
          <div className={styles.quoinRow} aria-hidden="true">
            <span className={styles.quoin} />
            <span className={styles.quoin} />
            <span className={styles.quoin} />
            <span className={styles.quoin} />
          </div>
          <div className={styles.quoinCorner} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
