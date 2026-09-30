/*
 * 英仏の紙（/en・/fr）。根のレイアウトは <html lang="ja"> のままなので、描画の前に
 * 一行の script で en・fr に替える（根を言語ごとに分けると全ページの移動になるため）。
 * 検索エンジンへの言語の合図は、各ページの hreflang が担う。
 */
import { notFound } from "next/navigation";

import { HtmlLang } from "@/components/lang/HtmlLang";

import type { LangParams } from "@/i18n/params";
import { FOREIGN_LANGS, isForeignLang } from "@/i18n/routes";

export const dynamicParams = false;

export function generateStaticParams() {
  return FOREIGN_LANGS.map((lang) => ({ lang }));
}

export default async function LangLayout({ children, params }: LangParams & { children: React.ReactNode }) {
  const { lang } = await params;
  if (!isForeignLang(lang)) notFound();
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(lang)}` }} />
      <HtmlLang lang={lang} />
      {children}
    </>
  );
}
