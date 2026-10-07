/*
 * 根の文書（<html>・<body>）。根のレイアウトは言語ごとに 2 つあり（日本語 = app/(ja)、
 * 英仏 = app/[lang]）、どちらもここを通して同じ字・同じ構造化データ・同じ計測を持つ。
 * <html lang> をサーバーの出力の時点で言語ごとに正しくするための分け方。
 */
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";

import { JsonLd } from "@/components/JsonLd";
import { REVEAL_FLAG } from "@/components/ryoushi/fonts";
import { siteJsonLd } from "@/lib/jsonld";
import { SITE_DESCRIPTION, SITE_NAME, siteUrl } from "@/lib/site";

import "@/app/globals.css";

/*
 * OGP の画像は src/app/opengraph-image.png（1200×630）。
 * 実際のトップ画面を 2 倍で焼いて縮めたもので、意匠の写しではなく現物である。
 * ＊ トップの意匠を変えたら焼き直すこと。自動では追随しない。
 */
export const rootMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    locale: "ja_JP",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

export function RootDocument({ lang, children }: { lang: string; children: React.ReactNode }) {
  return (
    /* 現れる演出の印（data-hi）は、本文より先に走る一行の script が付ける。
       サーバーが書いた html にはまだ無いので、その一点だけ照合を見送る */
    <html lang={lang} suppressHydrationWarning>
      <body className="antialiased">
        {/* 現れる演出の印（html[data-hi="on"]）。本文より先に走るので、隠す規則は最初の描画から効く。
            根のレイアウトに置く ── 面の部品に置くと、紙から紙へ移るたびに React が
            「script は描画されない」と叱る（2026-10-07）。根は移動で描き直されない */}
        <script dangerouslySetInnerHTML={{ __html: REVEAL_FLAG }} />
        <JsonLd data={siteJsonLd()} />
        {children}
        {/* Vercel Web Analytics。Cookie を使わず、個人を特定する情報も持たないページビューの数だけ */}
        <Analytics />
      </body>
    </html>
  );
}
