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
 *   起点の斜行（名乗り 1 列目 / 目録 6 列目 / 結び 1 列目）は界線の左端が段ごとに右へ
 *   階段を上ることで初めて目に見える。界線は「罫を使わない」という飛白の法を意図的に
 *   破る一点で、分けるための線ではなく、字を載せるための線として引いている。
 * FIRST VIEWPORT: 右上に入りの一筆、左下に SUMINAWA、左端を降りる脈の頭。
 *   界線は名乗りの版面（大字の帯を除く）に既に敷かれている。名乗りの下に置くのは
 *   段の目次（承ります / KITS / SITES / WORKS）だけで、品物の文字は一切出さない。
 * CATALOGUE: 段は四つ。承ります（品書き）→ KITS（売っているもの）→ SITES（見本）→
 *   WORKS（作品と道具）。各行は題と状態・説明・札の三つを、四行以内に組む。
 *   自分のページを持つ行には、その実画面を写した図版を一枚添える ── 紙に刷られた
 *   図版として置くので、枠も角丸も影も持たず、触れても動かない。
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
import { Fragment } from "react";
import Link from "next/link";
import { Hina_Mincho, Shippori_Mincho } from "next/font/google";

import {
  SERVICES,
  SERVICES_NOTE,
  SHELVES,
  projectFigure,
  projectHref,
  projectsByCategory,
  saleLabel,
  shelfAnchors,
  type Project,
  type ShelfId,
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

/**
 * 現れる演出の印。JS が動いた紙にだけ付く。
 *
 * 土台は「本文が最初から見えていること」で、隠してから現す演出は
 * この印が付いた紙でしか走らない（page.module.css の
 * `html[data-hi="on"]` の下に、入場の animation を全部まとめてある）。
 * JS を切った紙・印刷・読み込みに失敗した紙では、隠す規則が一つも
 * 当たらないので、全部の行が最初から読める。
 */
const REVEAL_FLAG = 'document.documentElement.dataset.hi="on"';

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

type Shelf = {
  id: ShelfId;
  label: string;
  lead?: string;
  items: Project[];
};

/**
 * 段の並びをレジストリから組む。品物を足すときに触るのは projects.ts だけ。
 * **中身の無い段は描かない** ── 空の段は「何を作る場所か」を先に見せる
 * 役に立つと考えていたが、実際には「準備中」の一行だけが載った段が
 * 目録の途中に空白として残るだけだった（GAMES の段を外した理由）。
 */
function buildShelves(): Shelf[] {
  return SHELVES.map((shelf) => ({
    ...shelf,
    items: shelf.id === "services" ? [] : projectsByCategory(shelf.id),
  })).filter((shelf) => shelf.id === "services" || shelf.items.length > 0);
}

/**
 * 目録の一行。
 *
 * 題と状態が一行目、説明が二行目（長ければ三行目まで）、札が最後の一行。
 * 行と行のあいだに空の罫を挟まないので、一件は三〜四本の罫に収まる。
 * 図版は字の塊の右（狭い紙では上）に一枚。**行に触れても図版は動かない** ──
 * 動くのは紙の湿りひとつだけ、という法を図版で破らない。
 */
function Row({ project }: { project: Project }) {
  const href = projectHref(project);
  const fig = projectFigure(project);
  const inner = (
    <>
      <span className={s.text}>
        <span className={s.line}>
          <span className={s.title}>{project.title}</span>
          {project.sale && (
            <span className={s.sale}>{saleLabel(project.sale)}</span>
          )}
        </span>
        <span className={s.desc}>{project.description}</span>
        <span className={s.tags}>
          {project.tags.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </span>
      </span>
      {fig && (
        // 図版は実画面の写し。next/image を通さないのは、すでに出す寸法ちょうどに
        // 焼いてあるからで（幅 320 と 640 の 2 枚）、読み込みで行が跳ねないよう
        // 寸法は CSS で固定してある。
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className={s.fig}
          src={`${fig}-640.webp`}
          srcSet={`${fig}-320.webp 320w, ${fig}-640.webp 640w`}
          sizes="(max-width: 767px) 176px, 200px"
          width={640}
          height={400}
          loading="lazy"
          decoding="async"
          alt={`${project.title}の画面`}
        />
      )}
    </>
  );

  const cls = `${s.entry} ${fig ? s.withFig : ""}`;

  return (
    <li className={s.row}>
      {/*
        水の二枚。静止時は opacity 0 で、紙の上には何も無い。
        flow     = 差してくる水（表層。粒と雲が別の速さで走る）
        flowDeep = 底の流れ（触れているあいだ 31s 周期でゆっくり揺れる）
        この二枚と、同じ雲マスクで抜いた濃い界線（.row::after）の三枚が
        一つの湿りを作る。三枚とも同じ時間・同じ包絡で動くので、出来事は一つ。
      */}
      <span className={s.flow} aria-hidden="true" />
      <span className={s.flowDeep} aria-hidden="true" />

      {href.startsWith("/") ? (
        <Link href={href} className={cls}>
          {inner}
        </Link>
      ) : (
        /* 紙の外（同じ名義の note）と、紙の中の段（#sites）へ飛ぶ行。
           作品ページを持たないので図版は無く、字だけで一行が成立する */
        <a href={href} className={cls}>
          {inner}
        </a>
      )}
    </li>
  );
}

export default function Home() {
  const shelves = buildShelves();
  const plan = veinPlan(shelves.length);

  return (
    <main className={`${s.paper} ${display.variable} ${mincho.variable}`}>
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

        {/* 段の目次。名乗りの次の罫に座る一行で、各段の頭へ飛ぶ。
            字は下の段の名（.shelfName）と同じ「小」── 同じ字であることが
            目次と見出しを結ぶ唯一の手がかりで、印も枠も足さない */}
        <nav className={s.index} aria-label="目次">
          {shelfAnchors().map(({ id, label, anchor }, i) => (
            <Fragment key={id}>
              {i > 0 && "　"}
              <a className={s.indexLink} href={anchor}>
                {label}
              </a>
            </Fragment>
          ))}
        </nav>
      </header>

      {shelves.map((shelf, i) => {
        const vein = plan.rows[i];
        return (
          <section
            key={shelf.id}
            id={shelf.id}
            className={`${s.shelf} ${i === 0 ? s.shelfFirst : ""}`}
            aria-labelledby={`${shelf.id}-name`}
          >
            <Myaku
              zone={`${s.zShelf} ${i === 0 ? s.zShelfFirst : ""}`}
              at={vein.at}
              dx={vein.dx}
              dxNarrow={vein.dxNarrow}
              delayMs={1120 + i * 210}
            />

            <div className={s.shelfHead}>
              <h2 className={s.shelfName} id={`${shelf.id}-name`}>
                {shelf.label}
              </h2>
              {shelf.lead && <p className={s.shelfLead}>{shelf.lead}</p>}
            </div>

            {shelf.id === "services" ? (
              <>
                {/* 品書き。題と目安が同じ罫に並ぶ ── 献立表と同じ組み方で、
                    行そのものは何処へも飛ばない（触れても濡れない） */}
                <ul className={s.menu}>
                  {SERVICES.map((item) => (
                    <li key={item.title} className={s.menuItem}>
                      <span className={s.menuName}>{item.title}</span>
                      <span className={s.menuPrice}>{item.price}</span>
                    </li>
                  ))}
                </ul>
                <p className={s.menuNote}>
                  {SERVICES_NOTE.before}
                  <a
                    className={s.mailLink}
                    href={`mailto:${SERVICES_NOTE.mail}`}
                  >
                    {SERVICES_NOTE.mail}
                  </a>
                  {SERVICES_NOTE.after}
                </p>
              </>
            ) : (
              <ol className={s.rows}>
                {shelf.items.map((project) => (
                  <Row key={project.slug} project={project} />
                ))}
              </ol>
            )}
          </section>
        );
      })}

      <footer className={s.close}>
        {/* 脈の尾。目録と結びのあいだの間を、左へ帰りながら埋める。
            結びの界線が始まる 3 行手前で終わり、線が二重に走る帯を作らない */}
        <Myaku
          zone={s.zTail}
          at="tail"
          dx={plan.tailDx}
          dxNarrow={plan.tailDxNarrow}
          sx={plan.tailScale}
          sxNarrow={plan.tailScaleNarrow}
          delayMs={1120 + shelves.length * 210}
        />
        <p className={s.closeLine}>すべての作品は、その場で実際に動きます。</p>
        <a className={s.contact} href="mailto:hello@suminawa.dev">
          依頼や相談は hello@suminawa.dev へ
        </a>
      </footer>
    </main>
  );
}
