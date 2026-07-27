/*
 * THESIS: 床の間は「物を置く場所」ではなく「余白を成立させるための枠」である。
 *   漆喰の壁に穿たれた凹み、それを縁取る一本の床柱と落掛。掛かるものは常に一つ。
 *   だから画面の構造そのものを床の間にした ── 左は室（名乗り）、右は床（作品）、
 *   その境目に立つのが床柱。壁は半分以上が何も無いまま残る。それが主題。
 * OWN-WORLD: 角丸はゼロ。線は 1px の罫と柱の木理だけ。色は漆喰・石・松・青銅、
 *   そして挿し色は菖蒲の藍ただ一色。藍が出るのは四箇所しかない ──
 *   一文字（掛軸の裂）、三輪の菖蒲、落款、そして押せる矩形。
 * STORY: 掛軸が上から掛かる（clip-path 1.2s）→ 壁の余白 → 床框の上に水盤と菖蒲。
 *   主（掛軸＝墨流し）・副（見積もり）・控え（空の GAMES）が右上から左下へ降りる
 *   三角形を組む。控えの図版枠は空のまま残す。そこに嵌まるものがまだ無いから。
 * FIRST VIEWPORT: 左に SUMINAWA と縦組みのタグライン、床柱、右の凹みに掛軸と生花。
 *   作品の文字は一切出さない。床の間は、まず何も無いことを見せる場所。
 * FORM: tokonoma — 掛軸と生花の設え（プレビュー案・比較用）
 */
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Cormorant_Garamond, Jost } from "next/font/google";
import styles from "./tokonoma.module.css";

/** 高コントラストの上品なローマン。大見出しは細く、大きく。 */
const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--tk-serif",
});

/** ラベル専用。小さく、大文字で、トラッキングを開いて使う。 */
const sans = Jost({
  subsets: ["latin"],
  weight: ["300", "400"],
  display: "swap",
  variable: "--tk-sans",
});

export const metadata: Metadata = {
  title: "床の間 — 掛軸と生花の設え",
  description: "漆喰・床柱・掛軸・水盤。余白を主役に据えたトップページ案。",
};

/** 押せる矩形に付く右向き矢印。線一本と穂先だけ。 */
function Arrow() {
  return (
    <svg
      className={styles.arrow}
      width="26"
      height="8"
      viewBox="0 0 26 8"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M0 4h24M20.5 0.7 24.6 4l-4.1 3.3"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  );
}

/** 三輪の菖蒲。主・副・控えの三角形をそのまま丈で作る。 */
function Irises() {
  const blooms = [
    { x: 98, y: 64, s: 1, r: -4 },
    { x: 70, y: 126, s: 0.86, r: -13 },
    { x: 115, y: 178, s: 0.72, r: 10 },
  ];
  return (
    <svg
      className={styles.stems}
      viewBox="0 0 180 252"
      role="img"
      aria-label="青銅の水盤に生けられた三輪の菖蒲"
    >
      {/* 剣葉。松の色で、根元から立ち上がって撓む */}
      <g fill="var(--tk-pine)">
        <path d="M74 252C64 202 56 148 43 94c15 52 32 106 45 158Z" />
        <path d="M106 252c13-40 25-80 38-118-6 42-20 80-26 118Z" />
        <path d="M88 252c-7-34-14-66-24-96 13 30 25 62 32 96Z" />
      </g>
      {/* 茎 */}
      <g
        fill="none"
        stroke="var(--tk-pine)"
        strokeWidth="1.7"
        strokeLinecap="round"
      >
        <path d="M96 252c-3-54 5-122 2-188" />
        <path d="M68 252c-3-36 5-82 2-126" />
        <path d="M116 252c4-26-2-50-1-74" />
      </g>
      {/* 花。外花被三枚が垂れ、内花被三枚が立つ */}
      {blooms.map((b) => (
        <g
          key={`${b.x}-${b.y}`}
          transform={`translate(${b.x} ${b.y}) rotate(${b.r}) scale(${b.s})`}
        >
          <g fill="var(--tk-iris)">
            {/* 内花被 ── 立つ三枚 */}
            <path d="M0-2C-4-7-6-13-3-18C0-13 1-7 0-2Z" />
            <path d="M0-2C4-7 6-13 3-18C0-13-1-7 0-2Z" />
            <path d="M0-3C-1-9-1-15 0-20C1-15 1-9 0-3Z" />
            {/* 外花被 ── 垂れる三枚 */}
            <path d="M0 1C-5 3-11 8-16 17C-18 8-13 1-6-2Z" />
            <path d="M0 1C5 3 11 8 16 17C18 8 13 1 6-2Z" />
            <path d="M0 2C-4 8-5 15-1 21C3 15 4 8 1 2Z" />
          </g>
          <path
            d="M0 7V16"
            stroke="var(--tk-plaster)"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </g>
      ))}
    </svg>
  );
}

const SUMINAGASHI_TAGS = ["WebGL2", "GLSL", "TypeScript"];
const QUOTE_TAGS = ["Next.js", "TypeScript", "Tailwind CSS"];

function Tags({ items }: { items: string[] }) {
  return (
    <ul className={styles.tags}>
      {items.map((t) => (
        <li key={t} className={styles.tag}>
          {t}
        </li>
      ))}
    </ul>
  );
}

export default function TokonomaPreview() {
  return (
    <main className={`${serif.variable} ${sans.variable} ${styles.root}`}>
      {/* ─────────── 床の間 ─────────── */}
      <section className={styles.alcoveSection}>
        <div className={styles.room}>
          <div className={styles.identity}>
            <h1 className={styles.wordmark}>SUMINAWA</h1>
            <p className={styles.showcase}>Showcase</p>
            <span className={styles.hair} aria-hidden="true" />
            <p className={styles.taglineEn}>Things I&apos;ve built.</p>
          </div>
        </div>

        {/* 床柱。室と床を分かつ、風化した松の丸太 */}
        <div className={styles.post} aria-hidden="true" />

        <div className={styles.alcove}>
          {/* 落掛。凹みの上端を押さえる横木 */}
          <div className={styles.kamoi} aria-hidden="true" />

          {/* 掛軸。掛かるのは常に一つ */}
          <figure className={styles.kakejiku}>
            <span className={styles.rodTop} aria-hidden="true" />
            <span className={styles.fuutai} aria-hidden="true" />
            <span
              className={`${styles.fuutai} ${styles.fuutaiB}`}
              aria-hidden="true"
            />
            <div className={styles.mount}>
              <span className={styles.ichimonji} aria-hidden="true" />
              <div className={styles.honshi}>
                <Image
                  src="/ink/sites.png"
                  alt="墨流しの作例。藍が水面で渦を巻いている"
                  fill
                  sizes="(max-width: 899px) 40vw, 214px"
                  className={styles.honshiImg}
                  preload
                />
              </div>
              <span className={styles.ichimonji} aria-hidden="true" />
            </div>
            <span className={styles.rodBottom} aria-hidden="true" />
          </figure>

          {/* 水盤と菖蒲。床框の上に据わる */}
          <div className={styles.ikebana}>
            <Irises />
            <div className={styles.basin} aria-hidden="true">
              <span className={styles.basinRim} />
            </div>
          </div>

          {/* 床框。槌目の青銅 */}
          <div className={styles.sill} aria-hidden="true" />
        </div>
      </section>

      {/* ─────────── 主・副・控え ─────────── */}
      <section className={styles.works} aria-labelledby="tk-works">
        <h2 id="tk-works" className={styles.worksLabel}>
          作品
        </h2>

        {/* 主 ── 掛かっているもの */}
        <article className={styles.primary}>
          <div className={styles.itemHead}>
            <span className={styles.numeral}>一</span>
            <span className={styles.headRule} aria-hidden="true" />
            <span className={styles.label}>SITES</span>
          </div>
          <h3 className={styles.primaryTitle}>墨流し — Suminagashi</h3>
          <p className={styles.primaryDesc}>
            藍と墨が水面で渦を巻く、GPU 流体の水盤。指でかき混ぜ、墨を落とし、気に入った模様はそのまま保存できる。
          </p>
          <Tags items={SUMINAGASHI_TAGS} />
          <Link
            href="/projects/suminagashi"
            className={styles.button}
            aria-label="墨流し — Suminagashi を見る"
          >
            <span>View</span>
            <Arrow />
          </Link>
        </article>

        {/* 副 ── 罫の矩形。左に文字、右に図版 */}
        <Link href="/projects/quote-simulator" className={styles.card}>
          <div className={styles.cardBody}>
            <div className={styles.itemHead}>
              <span className={styles.numeral}>二</span>
              <span className={styles.headRule} aria-hidden="true" />
              <span className={styles.label}>TOOLS</span>
            </div>
            <h3 className={styles.cardTitle}>見積もりシミュレーター</h3>
            <p className={styles.cardDesc}>
              作業条件を入れると、見積もりの内訳と合計がその場で見える。フリーランスの「いくらでやる？」を 30 秒で形にする電卓。
            </p>
            <Tags items={QUOTE_TAGS} />
          </div>
          <div className={styles.cardFigure}>
            <Image
              src="/ink/tools.png"
              alt=""
              fill
              sizes="(max-width: 899px) 120px, 164px"
              className={styles.cardImg}
            />
            <span className={styles.tint} aria-hidden="true" />
          </div>
        </Link>

        {/* 控え ── 図版の枠だけが空いている */}
        <div className={`${styles.card} ${styles.cardEmpty}`}>
          <div className={styles.cardBody}>
            <div className={styles.itemHead}>
              <span className={styles.numeral}>三</span>
              <span className={styles.headRule} aria-hidden="true" />
              <span className={styles.label}>GAMES</span>
            </div>
            <p className={styles.emptyText}>
              準備中 — 最初のゲームがここに嵌まります。
            </p>
          </div>
          <div className={styles.figureEmpty} aria-hidden="true" />
        </div>
      </section>

      <footer className={styles.footer}>
        <span className={styles.footRule} aria-hidden="true" />
        <div className={styles.footRow}>
          <p className={styles.footNote}>
            すべての作品は、その場で実際に動きます。
          </p>
          <Link href="/preview" className={styles.back}>
            ← 一覧へ
          </Link>
        </div>
      </footer>
    </main>
  );
}
