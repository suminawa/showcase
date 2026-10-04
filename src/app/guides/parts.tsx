/*
 * 悩みから読む紙の共通の部品。metadata（canonical・記事の OGP）と構造化データ
 * （Article・BreadcrumbList）を、10 枚が同じ形で持つ。
 */
import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/JsonLd";
import { guideHref, type Guide } from "@/lib/guides";
import { projects } from "@/lib/projects";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/jsonld";
import { SITE_NAME } from "@/lib/site";

import s from "../projects/projects.module.css";
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

/** 題のすぐ下の答え。AI の回答も検索の抜き出しも、この段落だけで通じるように */
export function GuideAnswer({ guide }: { guide: Guide }) {
  return <p className={`${s.lede} ${g.answer}`}>{guide.answer}</p>;
}

/** 公開日・更新日・書いた人 */
export function GuideByline({ guide }: { guide: Guide }) {
  const updated = updatedOf(guide);
  return (
    <p className={g.caption}>
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

/** 結びの道。見本 → キット → ご相談 */
export function GuideLinks({ guide }: { guide: Guide }) {
  const kit = projects.find((p) => p.slug === guide.shop);
  return (
    <section className={g.section}>
      <h2 className={g.heading}>見本・キット・ご相談</h2>
      <ul className={g.list}>
        {guide.demo && (
          <li>
            <Link href={guide.demo.href} className={s.textLink}>
              {guide.demo.label}を開く
            </Link>
            （その場で試せます）
          </li>
        )}
        {kit && (
          <li>
            <Link href={`/kits#${kit.slug}`} className={s.textLink}>
              {kit.title}
            </Link>
            （キットとテンプレートの一覧）
          </li>
        )}
        <li>
          <Link href="/contact" className={s.textLink}>
            制作のご相談
          </Link>
          （料金の目安と進め方）
        </li>
      </ul>
    </section>
  );
}
