/*
 * 悩みから読む紙の一覧。1 行 = 悩みの言葉 1 つ。飛び先はそれぞれの着地の紙。
 * 帳票の並び（CatalogRows）で、題と一行を置く。新しいものを上に。
 * FORM: 方眼（DESIGN.md）
 */
import type { Metadata } from "next";

import { CatalogPage, CatalogRows } from "@/components/site/CatalogPage";
import { ROOT_OG_IMAGE } from "@/i18n/meta";
import { guideHref, guides } from "@/lib/guides";

import { GUIDES_TITLE } from "./parts";

const TITLE = GUIDES_TITLE;
const LEDE = "事務や受付で繰り返し起きる困りごとを 1 つずつ取り上げ、手で解く手順と見本をまとめています。";

/** metadata の description。頭の一行に、扱っている悩みと本数を足す（100〜160 字） */
const DESCRIPTION = `${LEDE}請求書 PDF の転記、顧客管理の表、LINE や問い合わせの自動返信、予約、期限の通知、売上の集計、LP の構成など、${guides.length} 本の記事があります。`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/guides" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/guides", images: [ROOT_OG_IMAGE] },
};

export default function GuidesPage() {
  const rows = [...guides].reverse().map((guide) => ({ href: guideHref(guide), title: guide.title, description: guide.lede }));
  return (
    <CatalogPage lang="ja" title={TITLE} lede={LEDE}>
      <CatalogRows rows={rows} label={TITLE} />
    </CatalogPage>
  );
}
