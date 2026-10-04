/*
 * 英仏の紙（/en・/fr）の根。<html lang> はサーバーの出力の時点で en・fr になる。
 * 日本語の紙の根（app/(ja)/layout.tsx）とは別の根なので、言語をまたぐ移動はページの読み直しになる。
 */
import { notFound } from "next/navigation";

import { RootDocument, rootMetadata } from "@/components/RootDocument";

import type { LangParams } from "@/i18n/params";
import { FOREIGN_LANGS, isForeignLang } from "@/i18n/routes";

export const dynamicParams = false;

export const metadata = rootMetadata;

export function generateStaticParams() {
  return FOREIGN_LANGS.map((lang) => ({ lang }));
}

export default async function LangLayout({ children, params }: LangParams & { children: React.ReactNode }) {
  const { lang } = await params;
  if (!isForeignLang(lang)) notFound();
  return <RootDocument lang={lang}>{children}</RootDocument>;
}
