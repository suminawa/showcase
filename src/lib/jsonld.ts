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
