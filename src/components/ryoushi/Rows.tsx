/*
 * 目録の行。分類のページ（/kits・/sites・/works）が共有する。
 *
 * 一行は 題と状態が一行目、説明が二行目（長ければ三行目まで）、札が最後の一行。
 * 行と行のあいだに空の罫を挟まないので、一件は三〜四本の罫に収まる。
 * 図版は字の塊の右（狭い紙では上）に一枚。**行に触れても図版は動かない** ──
 * 動くのは紙の湿りひとつだけ、という法を図版で破らない。
 */
import Link from "next/link";

import {
  projectFigure,
  projectHref,
  saleLabel,
  type Project,
} from "@/lib/projects";

import s from "@/app/ryoushi.module.css";

/** 行に添える図版。実画面の写しで、すでに出す寸法ちょうどに焼いてある */
function Figure({ src, title }: { src: string; title: string }) {
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
      alt={`${title}の画面`}
    />
  );
}

function Row({ project, showSale }: { project: Project; showSale: boolean }) {
  const href = projectHref(project);
  const fig = projectFigure(project);
  const inner = (
    <>
      <span className={s.text}>
        <span className={s.line}>
          <span className={s.title}>{project.title}</span>
          {showSale && project.sale && (
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
      {fig && <Figure src={fig} title={project.title} />}
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
        /* 紙の外（同じ名義の note）へ出る行。作品ページを持たないので
           図版は無く、字だけで一行が成立する */
        <a
          href={href}
          className={cls}
          target="_blank"
          rel="noopener noreferrer"
        >
          {inner}
        </a>
      )}
    </li>
  );
}

/**
 * 一覧。`showSale` は売り物の分類でだけ真にする ── 道具として無料で使える
 * 行に値札を添えると、その場で触れることと買うことが混ざる。
 */
export function Rows({
  items,
  showSale = false,
}: {
  items: Project[];
  showSale?: boolean;
}) {
  return (
    <ol className={s.rows}>
      {items.map((project) => (
        <Row key={project.slug} project={project} showSale={showSale} />
      ))}
    </ol>
  );
}
