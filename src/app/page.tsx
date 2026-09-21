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
 *   筆脈は水源。水の包絡の芯は、脈が左の余白を降りる帯にそのまま重ねてある。
 * OWN-WORLD: 字の寸法は「大」(28〜140px) と「小」(14〜16px) の二段だけで、中間帯を使わない。
 *   起点の斜行（名乗り 1 列目 / 段 3 列目 / 結び 1 列目）は界線の左端が段ごとに右へ
 *   階段を上ることで初めて目に見える。界線は「罫を使わない」という飛白の法を意図的に
 *   破る一点で、分けるための線ではなく、字を載せるための線として引いている。
 * FIRST VIEWPORT: 右上に入りの一筆、左下に SUMINAWA、左端を降りる脈の頭。
 *   名乗りの下に置くのは入口の 3 行だけで、品物の名は一つも出さない。
 * SHORT PAGE: 2026-09-21 に組み替えた。前は全件（19 行）をこの一枚に積んでいて
 *   PC で 5,500px あり、提案の URL から来た人がひと目で選べなかった。
 *   いまは 入口 3 行 → いま見てほしいもの 4 点 → 制作のご相談 の三つだけを置き、
 *   全件は分類のページ（/kits・/sites・/works）へ移してある。
 * ASSET: 水の素材は /ink/sumi-wide.webp ── 結びの掠れ（.trace）が静止時から読んでいる画と
 *   同一なので、流れを足しても追加のダウンロードが 1 バイトも発生しない。
 *   図版は /hub/<slug>-{320,640}.webp で、すべて遅延読み込み。
 * COLOR: 唯一の色は朱 #A63A2E の落款ひとつ。罫も脈も墨の濃淡だけで語る。
 *   水だけは青墨（あおずみ）── 藍を含んだ墨で、最も濃い芯にだけ色が出る。
 *   値段にも売り止めにも朱は使わない ── 朱は「決めた」ことの印だからである。
 * REVEAL: 本文は最初から見えているのが土台。現れる演出は、JS が動いて印
 *   （html[data-hi="on"]）が付いたときにだけ足す。印が付かなければ何も隠さない。
 * FORM: 三つ — 料紙に脈、触れて流れ。文法は DESIGN.md
 */
import Link from "next/link";

import { REVEAL_FLAG, fontVars } from "@/components/ryoushi/fonts";
import {
  GATES,
  SERVICES_NOTE,
  countLabel,
  featuredProjects,
  projectFigure,
  projectHref,
  saleLabel,
} from "@/lib/projects";
import {
  STRANDS,
  STRANDS_NARROW,
  veinPlan,
  type VeinSegment,
} from "@/lib/vein";

import s from "./ryoushi.module.css";

/** 芯 / 添え / 乾き の三筋。太さと不透明度は CSS 側で与える */
const STRAND_CLASS = [s.strandCore, s.strandSide, s.strandDry];

/**
 * 脈の一区間。
 *
 * 層は一枚だけで、状態を一つしか持たない ── 脈は構造であって出来事ではないので、
 * 触れても変化しない。dx は区間の横送り、sx は横の伸縮（@/lib/vein が計算する）で、
 * 前の区間の終点に始点を合わせるためのもの。段が増えても繋ぎ目で飛ばない。
 */
function Myaku({
  zone,
  at,
  dx,
  dxNarrow,
  sx = 1,
  sxNarrow = 1,
  delayMs,
}: {
  zone: string;
  at: VeinSegment;
  dx: number;
  dxNarrow: number;
  sx?: number;
  sxNarrow?: number;
  delayMs: number;
}) {
  const bundle = (
    cls: string,
    strands: readonly string[],
    shift: number,
    scale: number,
  ) => {
    const moved = shift !== 0 || scale !== 1;
    return (
      <g
        className={cls}
        transform={
          moved ? `translate(${shift} 0) scale(${scale} 1)` : undefined
        }
      >
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
  };

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
        {bundle(s.onWide, STRANDS[at], dx, sx)}
        {bundle(s.onNarrow, STRANDS_NARROW[at], dxNarrow, sxNarrow)}
      </svg>
    </span>
  );
}

export default function Home() {
  /* 段はこの一つだけ（いま見てほしいもの）。脈の区間もそれに合わせて一本 */
  const plan = veinPlan(1);
  const picks = featuredProjects();

  return (
    <main className={`${s.paper} ${fontVars}`}>
      {/* 現れる演出の印。本文より先に走るので、隠す規則は最初の描画から効く */}
      <script dangerouslySetInnerHTML={{ __html: REVEAL_FLAG }} />

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
        {/* 脈の頭。名乗りの上に残った空白の行を、そのまま器にしている */}
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

        {/* 入口 3 行。全件はこの先にあり、件数はレジストリが数える。
            行の文法は目録の行と同じで、触れるとその紙だけが濡れる */}
        <ol className={s.gates} aria-label="分類">
          {GATES.map((gate) => (
            <li key={gate.id} className={s.row}>
              <span className={s.flow} aria-hidden="true" />
              <span className={s.flowDeep} aria-hidden="true" />
              <Link href={gate.href} className={s.gate}>
                <span className={s.gateLabel}>{gate.label}</span>
                <span className={s.gateLead}>{gate.lead}</span>
                <span className={s.gateCount}>{countLabel(gate.id)}</span>
              </Link>
            </li>
          ))}
        </ol>
      </header>

      <section className={s.shelf} aria-labelledby="picks-name">
        <Myaku
          zone={s.zShelf}
          at={plan.rows[0].at}
          dx={plan.rows[0].dx}
          dxNarrow={plan.rows[0].dxNarrow}
          delayMs={1120}
        />

        <div className={s.shelfHead}>
          <h2 className={s.shelfName} id="picks-name">
            いま見てほしいもの
          </h2>
        </div>

        {/* 4 点。図版は実画面の写しで、触れても動かない（動くのは字の墨だけ） */}
        <ul className={s.picks}>
          {picks.map((project) => {
            const fig = projectFigure(project);
            return (
              <li key={project.slug} className={s.pick}>
                <Link href={projectHref(project)} className={s.pickLink}>
                  {fig && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className={s.fig}
                      src={`${fig}-640.webp`}
                      srcSet={`${fig}-320.webp 320w, ${fig}-640.webp 640w`}
                      sizes="(max-width: 767px) 176px, 200px"
                      width={640}
                      height={480}
                      loading="lazy"
                      decoding="async"
                      alt={`${project.title}の画面`}
                    />
                  )}
                  <span className={s.line}>
                    <span className={s.title}>{project.title}</span>
                    {project.sale && (
                      <span className={s.sale}>{saleLabel(project.sale)}</span>
                    )}
                  </span>
                  <span className={s.desc}>{project.description}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <footer className={s.close}>
        {/* 脈の尾。段と結びのあいだの間を、左へ帰りながら埋める。
            結びの界線が始まる 3 行手前で終わり、線が二重に走る帯を作らない */}
        <Myaku
          zone={s.zTail}
          at="tail"
          dx={plan.tailDx}
          dxNarrow={plan.tailDxNarrow}
          sx={plan.tailScale}
          sxNarrow={plan.tailScaleNarrow}
          delayMs={1330}
        />
        <h2 className={s.closeHead}>制作のご相談</h2>
        <p className={s.closeText}>
          サイト・LP の制作、業務の自動化、埋め込み部品の設置、WebGL
          の演出をお引き受けします。料金の目安と進め方は次の紙にまとめました。
        </p>
        <p className={s.closeLinks}>
          <Link href="/contact" className={s.contact}>
            頼めることと目安
          </Link>
          <a
            className={s.contact}
            href={`mailto:${SERVICES_NOTE.mail}`}
          >
            {SERVICES_NOTE.mail}
          </a>
        </p>
        <p className={s.closeLine}>すべての作品は、その場で実際に動きます。</p>
      </footer>
    </main>
  );
}
