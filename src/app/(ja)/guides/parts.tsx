/*
 * 悩みから読む紙の共通の部品（方眼。DESIGN.md）。metadata（canonical・記事の OGP）と構造化データ
 * （Article・BreadcrumbList）、紙の枠（GuideArticle: 現在地 → 題 → 答え → 一行 → 署名 → 本文）、結びの行を、
 * 全部の記事が同じ形で持つ。本文の文は各ページが持ち、ここでは触らない。
 */
import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/JsonLd";
import u from "@/components/site/ui.module.css";
import { guideHref, type Guide } from "@/lib/guides";
import { priceLabel, projects } from "@/lib/projects";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/jsonld";
import { SITE_NAME } from "@/lib/site";

import g from "./guides.module.css";

export const GUIDES_TITLE = "悩みから読む";

const updatedOf = (guide: Guide) => guide.updated ?? guide.date;

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
    </section>
  );
}
