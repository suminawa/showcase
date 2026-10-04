/*
 * 構造化データ（JSON-LD）。値は素のオブジェクトで組み、<script> への書き出しは
 * src/components/JsonLd.tsx が serializeJsonLd を通して行う。
 */
import { ELSEWHERE } from "./projects";
import { SITE_DESCRIPTION, SITE_NAME, siteUrl } from "./site";

type Json = Record<string, unknown>;

export const abs = (path: string) => new URL(path, siteUrl).toString();

const ORG_ID = abs("/#organization");

/** <script> の中で閉じタグを作らせない（< を < に） */
export function serializeJsonLd(data: Json | Json[]): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/** 根のレイアウトに置く 2 つ。sameAs は紙の結びの「ほかの場所」から、友だち追加の LINE を除いて */
export function siteJsonLd(): Json[] {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": ORG_ID,
      name: SITE_NAME,
      alternateName: ["suminawa", "墨縄"],
      url: abs("/"),
      logo: abs("/icon.svg"),
      description: SITE_DESCRIPTION,
      sameAs: ELSEWHERE.filter((e) => e.name !== "LINE").map((e) => e.href),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": abs("/#website"),
      name: SITE_NAME,
      alternateName: ["suminawa", "墨縄"],
      url: abs("/"),
      inLanguage: ["ja", "en", "fr"],
      publisher: { "@id": ORG_ID },
    },
  ];
}

const ORG_REF = { "@type": "Organization", "@id": ORG_ID, name: SITE_NAME, url: abs("/") };

/** パンくず。items は頭（トップ）から順に、名前と道 */
export function breadcrumbJsonLd(items: { name: string; path: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: abs(item.path),
    })),
  };
}

/** 売り物の紙の Product と Offer。price はいま払う税込の円（無料の見本は 0） */
export function productJsonLd(p: { name: string; description: string; path: string; price: number; image?: string }): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    url: abs(p.path),
    ...(p.image ? { image: abs(p.image) } : {}),
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      price: p.price,
      priceCurrency: "JPY",
      availability: "https://schema.org/InStock",
      url: abs(p.path),
      seller: ORG_REF,
    },
  };
}

/** 悩みから読む紙の Article。日付は YYYY-MM-DD（日本時間の日付として +09:00 を添える） */
export function articleJsonLd(a: {
  headline: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified: string;
  image?: string;
}): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.headline,
    description: a.description,
    url: abs(a.path),
    mainEntityOfPage: abs(a.path),
    ...(a.image ? { image: [abs(a.image)] } : {}),
    datePublished: `${a.datePublished}T00:00:00+09:00`,
    dateModified: `${a.dateModified}T00:00:00+09:00`,
    inLanguage: "ja",
    author: ORG_REF,
    publisher: ORG_REF,
  };
}
