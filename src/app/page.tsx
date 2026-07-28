/*
 * THESIS: 紙・構造・出来事の三つに役を分け、重なりを一つも作らない。
 *     紙  （最下層・静止・不動）  = 界線。ここが料紙であることを示す。触れても変わらない。
 *     構造（中層・静止・不動）    = 筆脈。読み手が通る道筋。触れても変わらない。
 *     出来事（最上層・触れた時だけ）= 流れ。この画面で動くものは、これひとつしか無い。
 *   一度の接触で走る出来事は一つだけ。だから語り手はいつも一人でいる。
 * INTEGRATION: 界線は流れに【吸収】してある。濡れた紙は、そこに既に引かれていた墨を吸う ──
 *   水の届いた範囲の界線だけが墨を増す。その形は罫が決めるのではなく水の雲マスクが決め、
 *   時間も水の 1.55s / 0.84s に従う。波形・位相・左右の勾配は静止の罫と完全に同一なので、
 *   二重線にはならず「同じ罫が滲んで太る」。罫はホバーの主語ではなく目的語である。
 *   筆脈は水源。水の包絡の芯は、各段で脈が降りきる位置に重ねてある。
 * OWN-WORLD: 字の寸法は「大」(28〜140px) と「小」(13〜15px) の二段だけで、中間帯を使わない。
 *   起点の斜行（名乗り 1 列目 / 作品 6 列目 / 結び 1 列目）は界線の左端が段ごとに右へ
 *   階段を上ることで初めて目に見える。界線は「罫を使わない」という飛白の法を意図的に
 *   破る一点で、分けるための線ではなく、字を載せるための線として引いている。
 * FIRST VIEWPORT: 右上に入りの一筆、左下に SUMINAWA、左端を降りる脈の頭。
 *   界線は名乗りの版面（大字の帯を除く）に既に敷かれている。作品の文字は一切出さない。
 * ASSET: 水の素材は /ink/sumi-wide.png ── 結びの掠れ（.trace）が静止時から読んでいる画と
 *   同一なので、流れを足しても追加のダウンロードが 1 バイトも発生しない。
 * COLOR: 唯一の色は朱 #A63A2E の落款ひとつ。罫も脈も墨の濃淡だけで語る。
 *   水だけは青墨（あおずみ）── 藍を含んだ墨で、最も濃い芯にだけ色が出る。
 * FORM: 三つ — 料紙に脈、触れて流れ。文法は DESIGN.md
 */
import Link from "next/link";
import { Hina_Mincho, Shippori_Mincho } from "next/font/google";

import {
  CATEGORIES,
  projectHref,
  projectsByCategory,
  type Project,
} from "@/lib/projects";
import {
  STRANDS,
  STRANDS_NARROW,
  veinPlan,
  type VeinSegment,
} from "@/lib/vein";

import s from "./page.module.css";

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

/** 芯 / 添え / 乾き の三筋。太さと不透明度は CSS 側で与える */
const STRAND_CLASS = [s.strandCore, s.strandSide, s.strandDry];

/**
 * 脈の一区間。
 *
 * 層は一枚だけで、状態を一つしか持たない ── 脈は構造であって出来事ではないので、
 * 触れても変化しない。dx は区間の横送り（@/lib/vein が計算する）で、
 * 前の区間の終点に始点を合わせるためのもの。作品が増えても繋ぎ目で飛ばない。
 */
function Myaku({
  zone,
  at,
  dx,
  dxNarrow,
  delayMs,
}: {
  zone: string;
  at: VeinSegment;
  dx: number;
  dxNarrow: number;
  delayMs: number;
}) {
  const bundle = (cls: string, strands: readonly string[], shift: number) => (
    <g className={cls} transform={shift ? `translate(${shift} 0)` : undefined}>
      {strands.map((d, i) => (
        <path
          key={i}
          d={d}
          className={STRAND_CLASS[i]}
          fill="none"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </g>
  );

  return (
    <span
      className={`${s.myaku} ${zone}`}
      style={{ "--myaku-draw-delay": `${delayMs}ms` } as React.CSSProperties}
      aria-hidden="true"
    >
      <svg
        className={s.vein}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        focusable="false"
      >
        {bundle(s.onWide, STRANDS[at], dx)}
        {bundle(s.onNarrow, STRANDS_NARROW[at], dxNarrow)}
      </svg>
    </span>
  );
}

type Row = {
  key: string;
  /** その段に出す分類名。同じ分類が続く 2 行目以降は出さない */
  label: string | null;
  project: Project | null;
};

/**
 * 段の並びをレジストリから組む。作品を足すときに触るのは projects.ts だけ。
 * 作品を一件も持たない分類は「準備中」の一行になる ── 空であることも構造の一部で、
 * 何を作る場所なのかを先に見せておく。
 */
function buildRows(): Row[] {
  return CATEGORIES.flatMap(({ id, label }): Row[] => {
    const items = projectsByCategory(id);
    if (items.length === 0) {
      return [{ key: `empty-${id}`, label, project: null }];
    }
    return items.map((project, i) => ({
      key: project.slug,
      label: i === 0 ? label : null,
      project,
    }));
  });
}

export default function Home() {
  const rows = buildRows();
  const plan = veinPlan(rows.length);

  return (
    <main className={`${s.paper} ${display.variable} ${mincho.variable}`}>
      {/* 入りの一筆。紙の右上を斜めに掠めて画面外へ抜ける */}
      <div className={s.stroke} aria-hidden="true">
        <span className={`${s.ink} ${s.inkKasure}`} />
        <span className={`${s.ink} ${s.inkCore}`} />
      </div>

      {/* 筆が紙を離れる最後の掠れ。点だけになって右下で消える */}
      <div className={s.trace} aria-hidden="true" />

      {/* 界線は要素を足さずに引く。各段の ::before が、その段の版面ぶんだけ罫を敷く
          （装飾は擬似要素なので支援技術には現れず、pointer-events も持たない） */}
      <header className={s.mark}>
        {/* 脈の頭。名乗りの上に残った空白の行（1fr）を、そのまま器にしている */}
        <Myaku zone={s.zHead} at="head" dx={0} dxNarrow={0} delayMs={900} />
        <p className={s.showcase}>Showcase</p>
        <h1 className={s.wordmark}>SUMINAWA</h1>
        <p className={s.en}>
          <span>{"Things I've built."}</span>
          {/* 落款。画面で色を持つのはここ一箇所だけ。英文の右に捺す */}
          <span className={s.seal} aria-hidden="true">
            墨
          </span>
        </p>
      </header>

      <ol className={s.works}>
        {rows.map((row, i) => {
          const vein = plan.rows[i];
          return (
            <li key={row.key} className={s.work}>
              <Myaku
                zone={`${s.zWork} ${i === 0 ? s.zWorkFirst : ""}`}
                at={vein.at}
                dx={vein.dx}
                dxNarrow={vein.dxNarrow}
                delayMs={1120 + i * 210}
              />
              {/*
                水の二枚。静止時は opacity 0 で、紙の上には何も無い。
                flow     = 差してくる水（表層。粒と雲が別の速さで走る）
                flowDeep = 底の流れ（触れているあいだ 31s 周期でゆっくり揺れる）
                この二枚と、同じ雲マスクで抜いた濃い界線（.work::after）の三枚が
                一つの湿りを作る。三枚とも同じ時間・同じ包絡で動くので、出来事は一つ。
              */}
              <span className={s.flow} aria-hidden="true" />
              <span className={s.flowDeep} aria-hidden="true" />

              <span className={s.cat}>{row.label ?? ""}</span>

              {row.project ? (
                <Link href={projectHref(row.project)} className={s.entry}>
                  <span className={s.title}>{row.project.title}</span>
                  <span className={s.desc}>{row.project.description}</span>
                  <span className={s.tags}>
                    {row.project.tags.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </span>
                </Link>
              ) : (
                <p className={s.empty}>
                  準備中 — 最初の一つがここに嵌まります。
                </p>
              )}
            </li>
          );
        })}
      </ol>

      <footer className={s.close}>
        {/* 脈の尾。作品欄と結びのあいだの間を、左へ帰りながら埋める。
            結びの界線が始まる 3 行手前で終わり、線が二重に走る帯を作らない */}
        <Myaku
          zone={s.zTail}
          at="tail"
          dx={plan.tailDx}
          dxNarrow={plan.tailDxNarrow}
          delayMs={1120 + rows.length * 210}
        />
        <p className={s.closeLine}>すべての作品は、その場で実際に動きます。</p>
      </footer>
    </main>
  );
}
