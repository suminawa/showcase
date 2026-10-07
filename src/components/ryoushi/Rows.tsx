/*
 * 目録の行。分類のページ（/kits・/sites・/works）が共有する。
 *
 * 一行は 題と状態が一行目、説明が二行目（長ければ三行目まで）、札が最後の一行。
 * 行と行のあいだに空の罫を挟まないので、一件は三〜四本の罫に収まる。
 * 図版は字の塊の右（狭い紙では上）に一枚。**行に触れても図版は動かない** ──
 * 動くのは紙の湿りひとつだけ、という法を図版で破らない。
 */
import Link from "next/link";
import { Fragment, ViewTransition } from "react";

import { localPriceLabel, localProject } from "@/i18n/catalog";
import { hrefFor, type Lang } from "@/i18n/routes";
import { UI } from "@/i18n/ui";
import { isGoHref, withFrom } from "@/lib/go";
import { guideHref, guides } from "@/lib/guides";
import { projectFigure, projectHref, type Project } from "@/lib/projects";

import s from "@/app/(ja)/ryoushi.module.css";

/**
 * 値札の字。発売記念の札（「発売記念 ¥9,800（10/2 まで・定価 ¥12,800）」）は
 * 狭い紙で一行に収まらないので、値段と括弧を別の塊にして、折れるのは
 * その間だけにする（「¥12,」で割れると値段が読めない）。
 */
export function SaleText({ label }: { label: string }) {
  const at = label.indexOf("（");
  if (at < 0) {
    // 英仏の札は半角の括弧（「Launch price ¥9,800 (until Oct 2, then ¥12,800)」）。空白は塊の外に置く
    const sp = label.indexOf(" (");
    if (sp < 0) return <>{label}</>;
    return (
      <>
        <span className={s.saleChunk}>{label.slice(0, sp)}</span>{" "}
        <span className={s.saleChunk}>{label.slice(sp + 1)}</span>
      </>
    );
  }
  return (
    <>
      <span className={s.saleChunk}>{label.slice(0, at)}</span>
      <span className={s.saleChunk}>{label.slice(at)}</span>
    </>
  );
}

/** 行に添える図版。実画面の写しで、すでに出す寸法ちょうどに焼いてある */
function Figure({ src, title, lang }: { src: string; title: string; lang: Lang }) {
  return (
    // next/image を通さないのは、幅 320 と 640 の 2 枚を出す寸法ちょうどに
    // 焼いてあるから。読み込みで行が跳ねないよう、寸法は CSS で固定してある。
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={s.fig}
      src={`${src}-640.webp`}
      srcSet={`${src}-320.webp 320w, ${src}-640.webp 640w`}
      sizes="(max-width: 767px) 176px, 200px"
      width={640}
      height={480}
      loading="lazy"
      decoding="async"
      alt={UI[lang].figureAlt(title)}
    />
  );
}

function Row({
  project: source,
  showSale,
  from,
  lang,
  localized,
  withGuides,
}: {
  project: Project;
  showSale: boolean;
  from: string;
  lang: Lang;
  localized: boolean;
  withGuides: boolean;
}) {
  const project = localized ? source : localProject(lang, source);
  const href = hrefFor(lang, projectHref(project));
  const fig = projectFigure(project);
  const inner = (
    <>
      <span className={s.text}>
        <span className={s.line}>
          {/* 題が、次の紙の題へ伸びる（ProjectShell の h1 と同じ名） */}
          <ViewTransition name={`t-${project.slug}`} share="morph" default="none">
            <span className={s.title}>{project.title}</span>
          </ViewTransition>
          {showSale && project.sale && (
            <span className={s.sale}>
              <SaleText label={localPriceLabel(lang, project) ?? ""} />
            </span>
          )}
        </span>
        <span className={s.desc}>{project.description}</span>
        <span className={s.tags}>
          {project.tags.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </span>
      </span>
      {fig && <Figure src={fig} title={project.title} lang={lang} />}
    </>
  );

  const cls = `${s.entry} ${fig ? s.withFig : ""}`;

  return (
    // id は /kits#<slug> で行へ直に来るため（悩みから読む紙の結びから）
    <li className={s.row} id={source.slug}>
      {/*
        水の二枚。静止時は opacity 0 で、紙の上には何も無い。
        flow     = 差してくる水（表層。粒と雲が別の速さで走る）
        flowDeep = 底の流れ（触れているあいだ 31s 周期でゆっくり揺れる）
        この二枚と、同じ雲マスクで抜いた濃い界線（.row::after）の三枚が
        一つの湿りを作る。三枚とも同じ時間・同じ包絡で動くので、出来事は一つ。
      */}
      <span className={s.flow} aria-hidden="true" />
      <span className={s.flowDeep} aria-hidden="true" />

      {href.startsWith("/") && !isGoHref(href) ? (
        // 英仏の紙から、訳の無い紙（見本・guides）へ出る行は hreflang="ja"
        <Link href={href} className={cls} hrefLang={lang !== "ja" && href === projectHref(project) ? "ja" : undefined}>
          {inner}
        </Link>
      ) : (
        /* 紙の外（同じ名義の note）へ出る行。作品ページを持たないので
           図版は無く、字だけで一行が成立する。/go/ を通して、どの紙から出たかを数える
           （next/link で描くと先読みが渡し口を叩いて数が狂うので、素の a のまま） */
        <a
          href={isGoHref(href) ? withFrom(href, from) : href}
          className={cls}
          target="_blank"
          rel="nofollow noopener noreferrer"
        >
          {inner}
        </a>
      )}
      <RowGuides slug={source.slug} show={withGuides} />
    </li>
  );
}

/** 行の下の一行。その売り物へ結びの道を向けている案内記事（guides の shop が行の slug） */
function RowGuides({ slug, show }: { slug: string; show: boolean }) {
  const related = show ? guides.filter((g) => g.shop === slug) : [];
  if (related.length === 0) return null;
  return (
    <p className={s.rowGuides}>
      案内記事:{" "}
      {related.map((g, i) => (
        <Fragment key={g.slug}>
          {i > 0 && "／"}
          <Link href={guideHref(g)} className={s.contact}>
            {g.title}
          </Link>
        </Fragment>
      ))}
    </p>
  );
}

/**
 * 一覧。`showSale` は売り物の分類でだけ真にする ── 道具として無料で使える
 * 行に値札を添えると、その場で触れることと買うことが混ざる。
 * `from` はこの一覧を置いている紙の道（/kits など）。売り場へ出る行の数え分けに使う。
 */
export function Rows({
  items,
  from,
  showSale = false,
  lang = "ja",
  localized = false,
  withGuides = false,
}: {
  items: Project[];
  from: string;
  showSale?: boolean;
  lang?: Lang;
  /** items がすでにその言語の字で組んである（目録の外の行。英仏の guides の行） */
  localized?: boolean;
  /** 行の下に案内記事への道を添える（日本語の /kits だけ） */
  withGuides?: boolean;
}) {
  return (
    <ol className={s.rows}>
      {items.map((project) => (
        <Row key={project.slug} project={project} showSale={showSale} from={from} lang={lang} localized={localized} withGuides={withGuides} />
      ))}
    </ol>
  );
}
