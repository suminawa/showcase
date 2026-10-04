/*
 * 悩みから読む紙の共通の部品。metadata（canonical・記事の OGP）と構造化データ
 * （Article・BreadcrumbList）を、10 枚が同じ形で持つ。
 */
import type { Metadata } from "next";

import { JsonLd } from "@/components/JsonLd";
import { guideHref, type Guide } from "@/lib/guides";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/jsonld";
import { SITE_NAME } from "@/lib/site";

export const GUIDES_TITLE = "悩みから読む";

const updatedOf = (guide: Guide) => guide.updated ?? guide.date;

export function guideMetadata(guide: Guide, image: string): Metadata {
  const url = guideHref(guide);
  return {
    title: guide.title,
    description: guide.lede,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      siteName: SITE_NAME,
      title: guide.title,
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
