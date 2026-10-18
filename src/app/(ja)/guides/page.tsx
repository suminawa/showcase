/*
 * 悩みから読む紙の一覧。1 行 = 悩みの言葉 1 つ。飛び先はそれぞれの着地の紙。
 * 帳票の並び（CatalogRows）で、題と一行を置く。新しいものを上に。
 * FORM: 方眼（DESIGN.md）
 */
import type { Metadata } from "next";

import { CatalogPage, CatalogRows } from "@/components/site/CatalogPage";
import { guideHref, guides } from "@/lib/guides";

import { GUIDES_TITLE } from "./parts";

const TITLE = GUIDES_TITLE;
const LEDE = "事務や受付で繰り返し起きる困りごとを 1 つずつ取り上げ、手で解く手順と見本をまとめています。";

export const metadata: Metadata = {
  title: TITLE,
  description: LEDE,
  alternates: { canonical: "/guides" },
  openGraph: { title: TITLE, description: LEDE, url: "/guides" },
};

export default function GuidesPage() {
  const rows = [...guides].reverse().map((guide) => ({ href: guideHref(guide), title: guide.title, description: guide.lede }));
  return (
    <CatalogPage lang="ja" title={TITLE} lede={LEDE}>
      <CatalogRows rows={rows} label={TITLE} />
    </CatalogPage>
  );
}
