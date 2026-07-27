/*
 * THESIS: 線が先にあり、木がそれに従う。
 *   大工は刻む前に、板の上へ原寸で墨を打つ。仕口も寸法も番付も、材が来る前に
 *   もう板の上にある。だからこの画面では、レイアウトが装飾を持たない代わりに、
 *   すべての線が「寸法・基準・番付」のいずれかである。装飾の線は一本も無い。
 * OWN-WORLD: 白木の杉板（柾目）に墨壺で打った板図。朱は番付と要所だけ。
 *   作品は「刻む部材」として矩形で置かれ、寸法線と通り芯がその周りを走る。
 * GRID: 総丈 3640 = 910 + 455 + 910 + 455 + 910。この数字は飾りではなく、
 *   grid-template-columns にそのまま fr として入っている。板図に書かれた寸法が
 *   実際にこの画面の寸法である（原寸 1:1）。
 * INTERACTION: 触れると番付に朱の印が捺され、心墨（朱の基準線）が立つ。
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Archivo, Noto_Sans_Mono } from "next/font/google";
import s from "./sumitsuke.module.css";

/** ワードマークと見出し。太く、詰めて、やや幅を締めて組む */
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--f-mark",
});

/** 寸法・番付・注記。大工の書き文字の規律＝等幅 */
const mono = Noto_Sans_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--f-fig",
});

export const metadata: Metadata = {
  title: "墨付けの板図",
  description: "Things I've built. — 原寸で板に打った下図",
};

type Piece = {
  /** 通り（縦）の番付 */
  tsuji: string;
  /** 材に書く番付。通り × 段 */
  ban: string;
  cat: string;
  title: string;
  desc: string;
  tags: string[];
  href: string;
  /** 見付（幅）の寸法 */
  w: string;
};

const PIECES: Piece[] = [
  {
    tsuji: "い",
    ban: "い二",
    cat: "SITES",
    title: "墨流し — Suminagashi",
    desc: "藍と墨が水面で渦を巻く、GPU 流体の水盤。指でかき混ぜ、墨を落とし、気に入った模様はそのまま保存できる。",
    tags: ["WebGL2", "GLSL", "TypeScript"],
    href: "/projects/suminagashi",
    w: "910",
  },
  {
    tsuji: "ろ",
    ban: "ろ二",
    cat: "TOOLS",
    title: "見積もりシミュレーター",
    desc: "作業条件を入れると、見積もりの内訳と合計がその場で見える。フリーランスの「いくらでやる？」を 30 秒で形にする電卓。",
    tags: ["Next.js", "TypeScript", "Tailwind CSS"],
    href: "/projects/quote-simulator",
    w: "910",
  },
];

/** 天端の目盛に振る寸法 */
const SCALE = ["0", "910", "1820", "2730", "3640"];

/** 見付の寸法チェーン。910 + 455 + 910 + 455 + 910 = 3640 */
const CHAIN = ["910", "455", "910", "455", "910"];

export default function SumitsukePreview() {
  return (
    <main className={`${s.board} ${archivo.variable} ${mono.variable}`}>
      <div className={s.grain} aria-hidden="true" />
      <div className={s.edges} aria-hidden="true" />

      <div className={s.inner}>
        {/* ── 天端の基準線。総丈と目盛。この目盛が以下すべての寸法の親になる ── */}
        <div className={s.scale} aria-hidden="true">
          <div className={`${s.dimH} ${s.scaleTotal}`}>
            <span className={s.dimFig}>総丈 3640</span>
          </div>
          <div className={s.scaleBar}>
            <div className={s.scaleTicks} />
            {SCALE.map((v, i) => (
              <span
                key={v}
                className={s.scaleFig}
                style={{
                  left: `${i * 25}%`,
                  transform:
                    i === 0
                      ? "none"
                      : i === SCALE.length - 1
                        ? "translateX(-100%)"
                        : "translateX(-50%)",
                }}
              >
                {v}
              </span>
            ))}
          </div>
        </div>

        <div className={s.sheet}>
          {/* ═══ 一段目 ═══ */}
          <header className={s.hero}>
            <span className={s.rowMark}>一</span>
            <div className={s.dimV}>
              <span className={s.dimVFig}>1200</span>
            </div>

            <div className={s.heroMain}>
              <div className={s.wordRow}>
                <h1 className={s.word}>SUMINAWA</h1>
                <span className={s.sub}>Showcase</span>
              </div>

              <p className={s.tagEn}>{"Things I've built."}</p>
            </div>

            {/* 表題欄。図面がまず名乗るところ */}
            <dl className={s.titleBlock}>
              <div className={s.tbRow}>
                <dt>図名</dt>
                <dd>SUMINAWA 板図</dd>
              </div>
              <div className={s.tbRow}>
                <dt>縮尺</dt>
                <dd>原寸 1:1</dd>
              </div>
              <div className={s.tbRow}>
                <dt>番付</dt>
                <dd>い・ろ・は / 一・二・三</dd>
              </div>
            </dl>
          </header>

          {/* ═══ 二段目 ═══ */}
          <section className={s.works} aria-label="作品">
            <span className={s.rowMark}>二</span>

            {/* 見付の寸法チェーン */}
            <div className={s.chain} aria-hidden="true">
              {CHAIN.map((v, i) => (
                <div className={s.dimH} key={`${v}-${i}`}>
                  <span className={s.dimFig}>{v}</span>
                </div>
              ))}
            </div>

            <div className={s.piecesWrap}>
              {/* 材の丈。寸法は材そのものに付く */}
              <div className={`${s.dimV} ${s.dimVFlush}`}>
                <span className={s.dimVFig}>1800</span>
              </div>

              {/* 通り芯と寸法補助線。線は材より先に引かれている */}
              <div className={s.axes} aria-hidden="true">
                <div className={s.axis}>
                  <span className={s.axisMark}>い</span>
                </div>
                <div className={s.aux} />
                <div className={s.axis}>
                  <span className={s.axisMark}>ろ</span>
                </div>
                <div className={s.aux} />
                <div className={s.axis}>
                  <span className={s.axisMark}>は</span>
                </div>
                <div className={s.auxEnd} />
              </div>

              <ul className={s.pieces}>
                {PIECES.map((p, i) => (
                  <li
                    key={p.href}
                    className={s.piece}
                    style={{ gridColumn: i * 2 + 1 }}
                  >
                    <div className={s.pieceDim} aria-hidden="true">
                      <div className={s.dimH}>
                        <span className={s.dimFig}>{p.w}</span>
                      </div>
                    </div>

                    <Link href={p.href} className={s.face}>
                      <span className={s.kokuchi} aria-hidden="true" />
                      <span className={s.shinzumi} aria-hidden="true" />

                      <span className={s.ban} aria-hidden="true">
                        {p.ban}
                      </span>
                      <span className={s.cat}>{p.cat}</span>
                      <h2 className={s.title}>{p.title}</h2>
                      <p className={s.desc}>{p.desc}</p>
                      <ul className={s.tags}>
                        {p.tags.map((t) => (
                          <li key={t} className={s.tag}>
                            {t}
                          </li>
                        ))}
                      </ul>
                      <span className={s.cta}>
                        原寸で見る
                        <i className={s.ctaTick} aria-hidden="true" />
                      </span>
                    </Link>
                  </li>
                ))}

                {/* は通り。線だけが先にある。材はまだ来ていない */}
                <li className={`${s.piece} ${s.pieceVoid}`} style={{ gridColumn: 5 }}>
                  <div className={s.pieceDim} aria-hidden="true">
                    <div className={s.dimH}>
                      <span className={s.dimFig}>910</span>
                    </div>
                  </div>

                  <div className={`${s.face} ${s.faceVoid}`}>
                    <span className={`${s.ban} ${s.banVoid}`} aria-hidden="true">
                      は二
                    </span>
                    <span className={s.cat}>GAMES</span>
                    <p className={s.voidNote}>
                      準備中 — 最初のゲームがここに嵌まります。
                    </p>
                    <span className={s.voidState} aria-hidden="true">
                      未刻 / NOT YET CUT
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          {/* ═══ 三段目 ═══ */}
          <footer className={s.foot}>
            <span className={s.rowMark}>三</span>

            <p className={s.note}>
              <span className={s.noteMark} aria-hidden="true" />
              すべての作品は、その場で実際に動きます。
            </p>

            <Link href="/preview" className={s.back}>
              ← 一覧へ
            </Link>
          </footer>
        </div>

        {/* 地墨。板の閉じ */}
        <div className={s.jizumi} aria-hidden="true" />
      </div>
    </main>
  );
}
