import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Barlow_Condensed, Roboto_Mono } from "next/font/google";
import s from "./aoyaki.module.css";

/** 図面の見出し — コンデンスドの大文字。装飾のない製図の字 */
const cond = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500"],
  display: "swap",
  variable: "--aoyaki-cond",
});

/** 注記・寸法値 — 細い等幅 */
const mono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--aoyaki-mono",
});

export const metadata: Metadata = {
  title: "青焼き — シアノタイプの図面",
  description: "Things I've built. — 光が焼き付けた図面としてのトップページ",
};

/** 図面枠の区域記号 */
const ZONE_COLS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const ZONE_ROWS = ["1", "2", "3", "4", "5"];

type Part = {
  no: string;
  ref: string;
  cat: string;
  spec: string;
  title: string;
  desc: string;
  tags: string[];
  href: string;
  img: string;
  note: string;
  dim: string;
};

const PARTS: Part[] = [
  {
    no: "01",
    ref: "PT-01",
    cat: "SITES",
    spec: "SPEC. A",
    title: "墨流し — Suminagashi",
    desc: "藍と墨が水面で渦を巻く、GPU 流体の水盤。指でかき混ぜ、墨を落とし、気に入った模様はそのまま保存できる。",
    tags: ["WebGL2", "GLSL", "TypeScript"],
    href: "/projects/suminagashi",
    img: "/ink/sites.png",
    note: "触れれば水が動く",
    dim: "REAL-TIME",
  },
  {
    no: "02",
    ref: "PT-02",
    cat: "TOOLS",
    spec: "SPEC. B",
    title: "見積もりシミュレーター",
    desc: "作業条件を入れると、見積もりの内訳と合計がその場で見える。フリーランスの「いくらでやる？」を 30 秒で形にする電卓。",
    tags: ["Next.js", "TypeScript", "Tailwind CSS"],
    href: "/projects/quote-simulator",
    img: "/ink/tools.png",
    note: "入れれば数字が出る",
    dim: "30 SEC.",
  },
];

function Balloon({ no }: { no: string }) {
  return (
    <span className={s.gutter} aria-hidden="true">
      <span className={s.balloon}>{no}</span>
      <span className={s.leader} />
    </span>
  );
}

export default function AoyakiPreview() {
  return (
    <div className={`${cond.variable} ${mono.variable} ${s.sheet}`}>
      {/* ── 感光紙 ── */}
      <div className={s.mottle} aria-hidden="true" />
      <div className={s.creases} aria-hidden="true" />
      <div className={s.burn} aria-hidden="true" />
      <div className={s.grain} aria-hidden="true" />
      <div className={s.edge} aria-hidden="true" />
      <div className={s.sweep} aria-hidden="true" />

      {/* ── 図面枠 ── */}
      <div className={s.frameOuter} aria-hidden="true" />
      <div className={s.frameInner} aria-hidden="true" />
      <div className={s.zoneTop} aria-hidden="true">
        {ZONE_COLS.map((z) => (
          <span key={z}>{z}</span>
        ))}
      </div>
      <div className={s.zoneLeft} aria-hidden="true">
        {ZONE_ROWS.map((z) => (
          <span key={z}>{z}</span>
        ))}
      </div>

      <main className={s.plate}>
        {/* ── 表題 ── */}
        <header className={s.head}>
          <div className={s.headMeta}>
            <span>CYANOTYPE PRINT — 青焼</span>
            <span className={s.headRule} aria-hidden="true" />
            <span>DWG. SW—001</span>
          </div>

          <div className={s.headBlock}>
            <div className={s.markRow}>
              <h1 className={s.mark}>SUMINAWA</h1>
              <span className={s.markSub}>
                <span className={s.markSubLead} aria-hidden="true" />
                Showcase
              </span>
            </div>
            <div className={s.dimWrap} aria-hidden="true">
              <span className={s.dimLabel}>03 PARTS</span>
              <span className={s.dimLine} />
            </div>
          </div>

          <div className={s.headLower}>
            <div>
              <p className={s.tagEn}>{"Things I've built."}</p>
            </div>

            {/* 凡例 — 線の意味を図面の作法どおり明かす */}
            <div className={s.legend} aria-hidden="true">
              <div className={s.legendHead}>
                <span>LEGEND</span>
                <span className={s.legendRule} />
              </div>
              <div className={s.legRow}>
                <span className={`${s.legSample} ${s.legSolid}`} />
                <span>OUTLINE — 部品の輪郭</span>
              </div>
              <div className={s.legRow}>
                <span className={`${s.legSample} ${s.legDash}`} />
                <span>PHANTOM — 未着工</span>
              </div>
              <div className={s.legRow}>
                <span className={s.legRev} />
                <span>REVISION — 改訂の注記</span>
              </div>
            </div>
          </div>
        </header>

        {/* ── 部品表 ── */}
        <div className={s.chainWrap} aria-hidden="true">
          <span className={s.chainLabel}>SECTION A—A / PARTS</span>
          <span className={s.chain} />
        </div>

        <section className={s.parts} aria-label="Parts">
          <span className={s.vdim} aria-hidden="true" />

          {PARTS.map((p) => (
            <article key={p.no} className={s.part}>
              <Balloon no={p.no} />

              <Link href={p.href} className={s.partFrame}>
                <span className={s.corners} aria-hidden="true" />

                <div
                  className={s.spec}
                  aria-hidden="true"
                  style={{ "--spec-img": `url(${p.img})` } as CSSProperties}
                >
                  <span className={s.photogram} />
                  <span className={s.specLabel}>{p.spec}</span>
                </div>

                <div className={s.partBody}>
                  <div className={s.partHead}>
                    <span className={s.cat}>{p.cat}</span>
                    <span className={s.headDash} aria-hidden="true" />
                    <span className={s.ref}>{p.ref}</span>
                  </div>

                  <h2 className={s.partTitle}>{p.title}</h2>
                  <p className={s.partDesc}>{p.desc}</p>

                  <div className={s.mat}>
                    <span className={s.matLabel}>MAT.</span>
                    <span className={s.matList}>
                      {p.tags.map((t) => (
                        <span key={t} className={s.matItem}>
                          {t}
                        </span>
                      ))}
                    </span>
                    <span className={s.matDim} aria-hidden="true">
                      {p.dim}
                    </span>
                  </div>
                </div>

                <div className={s.annot} aria-hidden="true">
                  <span className={s.annotText}>注記 — {p.note}</span>
                  <span className={s.annotArrow} />
                </div>
              </Link>
            </article>
          ))}

          {/* ── 未着工の部品 ── */}
          <article className={`${s.part} ${s.partVacant}`}>
            <Balloon no="03" />

            <div className={`${s.partFrame} ${s.partFrameVacant}`}>
              <span className={s.corners} aria-hidden="true" />

              <div className={`${s.spec} ${s.specHatch}`} aria-hidden="true">
                <span className={s.specLabel}>SPEC. —</span>
              </div>

              <div className={s.partBody}>
                <div className={s.partHead}>
                  <span className={s.cat}>GAMES</span>
                  <span className={s.headDash} aria-hidden="true" />
                  <span className={s.ref}>PT-03</span>
                </div>

                <p className={s.vacantText}>準備中 — 最初のゲームがここに嵌まります。</p>

                <div className={s.mat}>
                  <span className={s.matLabel}>MAT.</span>
                  <span className={s.matList}>
                    <span className={`${s.matItem} ${s.matItemNone}`}>—</span>
                  </span>
                  <span className={s.matDim} aria-hidden="true">
                    NOT ISSUED
                  </span>
                </div>
              </div>
            </div>
          </article>
        </section>

        {/* ── 脚注と表題欄 ── */}
        <footer className={s.foot}>
          <div className={s.footLeft}>
            <p className={s.footNote}>すべての作品は、その場で実際に動きます。</p>
            <Link href="/preview" className={s.back}>
              ← 一覧へ
            </Link>
          </div>

          <div className={s.titleBlock}>
            <div className={`${s.tbCell} ${s.tbName}`}>
              <span className={s.tbKey}>DRAWN BY</span>
              <span className={s.tbMark}>SUMINAWA</span>
              <span className={s.tbSub}>Showcase</span>
            </div>
            <div className={`${s.tbCell} ${s.tbRev}`}>
              <span className={s.tbKey}>REV</span>
              <span className={s.tbRevMark} aria-hidden="true" />
              <span className={s.tbRevVal}>A</span>
            </div>
            <div className={`${s.tbCell} ${s.tbTitle}`}>
              <span className={s.tbKey}>SHEET TITLE</span>
              <span className={s.tbVal}>青焼き — シアノタイプの図面</span>
            </div>
            <div className={s.tbCell}>
              <span className={s.tbKey}>DATE</span>
              <span className={s.tbVal}>2026—07—27</span>
            </div>
            <div className={s.tbCell}>
              <span className={s.tbKey}>SCALE</span>
              <span className={s.tbVal}>1:1</span>
            </div>
            <div className={s.tbCell}>
              <span className={s.tbKey}>SHEET</span>
              <span className={s.tbVal}>1 / 1</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
