/*
 * 悩みから読む紙の共通の部品（方眼。DESIGN.md）。metadata（canonical・記事の OGP）と構造化データ
 * （Article・BreadcrumbList）、紙の枠（GuideArticle: 現在地 → 題 → 答え → 一行 → 署名 → 本文）、結びの行を、
 * 全部の記事が同じ形で持つ。本文の文は各ページが持ち、ここでは触らない。
 */
import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/JsonLd";
import u from "@/components/site/ui.module.css";
import { guideHref, guideUpdated, guides, type Guide } from "@/lib/guides";
import { yen } from "@/lib/prices";
import { priceLabel, projects } from "@/lib/projects";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/jsonld";
import { SITE_NAME } from "@/lib/site";

import t from "../projects/kit-parts.module.css";
import g from "./guides.module.css";

export const GUIDES_TITLE = "悩みから読む";

const updatedOf = guideUpdated;

export function guideMetadata(guide: Guide, image: string): Metadata {
  const url = guideHref(guide);
  const title = guide.searchTitle ?? guide.title;
  return {
    title,
    description: guide.lede,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      siteName: SITE_NAME,
      title,
      description: guide.lede,
      url,
      locale: "ja_JP",
      images: [image],
      publishedTime: guide.date,
      modifiedTime: updatedOf(guide),
    },
    twitter: { card: "summary_large_image", images: [image] },
  };
}

export function GuideJsonLd({ guide, image }: { guide: Guide; image: string }) {
  const path = guideHref(guide);
  return (
    <JsonLd
      data={[
        articleJsonLd({
          headline: guide.title,
          description: guide.lede,
          path,
          datePublished: guide.date,
          dateModified: updatedOf(guide),
          image,
        }),
        breadcrumbJsonLd([
          { name: SITE_NAME, path: "/" },
          { name: GUIDES_TITLE, path: "/guides" },
          { name: guide.title, path },
        ]),
      ]}
    />
  );
}

/** 2026-09-28 → 2026年9月28日 */
const jaDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${y}年${m}月${d}日`;
};

/**
 * 記事の枠。現在地（トップ › 悩みから読む）→ 題 → 答え（白いセル）→ 一行 → 署名 → 本文（children）。
 * 本文の段は g.section / g.heading / g.text / g.list / g.figure / g.code で、最後に GuideLinks を置く。
 */
export function GuideArticle({ guide, image, children }: { guide: Guide; image: string; children: React.ReactNode }) {
  return (
    <main id="main" className={g.page}>
      <GuideJsonLd guide={guide} image={image} />
      <div className={u.wrap}>
        <nav className={g.crumbs} aria-label="現在地">
          <ol>
            <li>
              <Link href="/" className={g.crumbLink}>
                トップ
              </Link>
            </li>
            <li>
              <Link href="/guides" className={g.crumbLink}>
                {GUIDES_TITLE}
              </Link>
            </li>
          </ol>
        </nav>
        <header className={g.head}>
          <h1 className={g.title}>{guide.title}</h1>
          <GuideAnswer guide={guide} />
          <p className={g.lede}>{guide.lede}</p>
          <GuideByline guide={guide} />
        </header>
        <div className={g.body}>{children}</div>
      </div>
    </main>
  );
}

/** 題のすぐ下の答え。AI の回答も検索の抜き出しも、この段落だけで通じるように */
function GuideAnswer({ guide }: { guide: Guide }) {
  return <p className={g.answer}>{guide.answer}</p>;
}

/** 公開日・更新日・書いた人 */
function GuideByline({ guide }: { guide: Guide }) {
  const updated = updatedOf(guide);
  return (
    <p className={g.byline}>
      公開日 <time dateTime={guide.date}>{jaDate(guide.date)}</time>
      {updated !== guide.date && (
        <>
          {" ／ "}更新日 <time dateTime={updated}>{jaDate(updated)}</time>
        </>
      )}
      {" ／ "}書いた人: 墨縄（suminawa）
    </p>
  );
}

/** 比べる表の 1 行。やり方・費用・向いている場合・足りなくなるところ */
export type GuideCompareRow = { way: string; cost: string; fits: string; limit: string };

const COMPARE_COLS = ["やり方", "費用", "向いている場合", "足りなくなるところ"] as const;

/**
 * 無料・よくある方法とキットを並べる表。表の見た目は作品ページの比較表（kit-parts.module.css）と同じ。
 * キットの行の費用は projects.ts の定価から組む（紙の上で値段を二重に持たない）
 */
export function GuideCompare({ rows, kit, note }: { rows: GuideCompareRow[]; kit: Omit<GuideCompareRow, "cost">; note?: string }) {
  const price = projects.find((p) => p.slug === kit.way)?.sale?.price;
  const name = projects.find((p) => p.slug === kit.way)?.title ?? kit.way;
  const all = [...rows, { ...kit, way: name, cost: price != null ? `${yen(price)}（税込・買い切り）` : "" }];
  return (
    <>
      <table className={t.table}>
        <thead>
          <tr>
            {COMPARE_COLS.map((c) => (
              <th key={c} scope="col">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {all.map((row, i) => (
            <tr key={row.way} className={i === all.length - 1 ? t.mine : undefined}>
              <th scope="row" data-label={COMPARE_COLS[0]}>
                {row.way}
              </th>
              <td data-label={COMPARE_COLS[1]}>{row.cost}</td>
              <td data-label={COMPARE_COLS[2]}>{row.fits}</td>
              <td data-label={COMPARE_COLS[3]}>{row.limit}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {note && <p className={g.caption}>{note}</p>}
    </>
  );
}

/** この記事と同じキットに結びつく記事と、related に書いた記事（重ねない・自分は除く） */
export function relatedGuides(guide: Guide): Guide[] {
  const picked = new Set([
    ...(guide.related ?? []),
    ...guides.filter((o) => o.shop === guide.shop || o.kit === guide.kit).map((o) => o.slug),
  ]);
  picked.delete(guide.slug);
  return guides.filter((o) => picked.has(o.slug));
}

/** 結びの道。帳票の行で 見本 → キット（値段つき）→ ご相談。行ごと押せる */
export function GuideLinks({ guide }: { guide: Guide }) {
  const kit = projects.find((p) => p.slug === guide.shop);
  return (
    <section className={g.close} aria-labelledby="guide-links">
      <h2 id="guide-links" className={g.closeHead}>
        見本・キット・ご相談
      </h2>
      <ul className={g.links}>
        {guide.demo && (
          <li>
            <Link href={guide.demo.href} className={g.rowLink}>
              <span className={g.rowLabel}>動く見本</span>
              <span className={g.rowText}>
                {guide.demo.label}
                <span className={g.rowNote}>その場で試せます</span>
              </span>
            </Link>
          </li>
        )}
        {kit && (
          <li>
            <Link href={`/projects/${kit.slug}`} className={g.rowLink}>
              <span className={g.rowLabel}>キット</span>
              <span className={g.rowText}>
                {kit.title}
                <span className={g.rowNote}>{priceLabel(kit) ?? "キットとテンプレートの一覧"}</span>
              </span>
            </Link>
          </li>
        )}
        <li>
          <Link href="/contact" className={g.rowLink}>
            <span className={g.rowLabel}>ご相談</span>
            <span className={g.rowText}>
              頼み方と料金
              <span className={g.rowNote}>料金の目安と進め方。3 営業日以内に返信します</span>
            </span>
          </Link>
        </li>
      </ul>
      <RelatedRows guide={guide} />
    </section>
  );
}

/** 結びの下の、あわせて読む記事。行の形は結びと同じ */
function RelatedRows({ guide }: { guide: Guide }) {
  const related = relatedGuides(guide);
  if (related.length === 0) return null;
  return (
    <>
      <h2 id="guide-related" className={g.closeHead}>
        あわせて読む
      </h2>
      <ul className={g.links}>
        {related.map((o) => (
          <li key={o.slug}>
            <Link href={guideHref(o)} className={g.rowLink}>
              <span className={g.rowLabel}>記事</span>
              <span className={g.rowText}>{o.title}</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className={g.caption}>
        <Link href="/guides" className={g.link}>
          記事の一覧へ
        </Link>
      </p>
    </>
  );
}
