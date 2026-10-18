/*
 * 根の文書（<html>・<body>）。根のレイアウトは言語ごとに 2 つあり（日本語 = app/(ja)、
 * 英仏 = app/[lang]）、どちらもここを通して同じ字・同じ構造化データ・同じ計測を持つ。
 * <html lang> をサーバーの出力の時点で言語ごとに正しくするための分け方。
 */
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";

import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/footer/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { ArriveTracker } from "@/components/track/ArriveTracker";
import { siteJsonLd } from "@/lib/jsonld";
import type { Lang } from "@/i18n/routes";
import { SITE_DESCRIPTION, SITE_NAME, siteUrl } from "@/lib/site";

import "@/app/globals.css";

/*
 * OGP の画像は src/app/opengraph-image.png（1200×630）。
 * 実際のトップ画面を焼いて縮めたもので、意匠の写しではなく現物である。
 * ＊ トップの意匠を変えたら焼き直すこと（scripts/bake-og.mjs）。自動では追随しない。
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

export function RootDocument({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return (
    /* 書体の CSS を足す script が head を触るので、その一点だけ照合を見送る */
    <html lang={lang} suppressHydrationWarning>
      <head>
        {/* 見出しの明朝（Shippori Mincho 600）。端末の明朝が無い Android でも同じ字にするため、Google Fonts から一書体・一太さだけ読む */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* 描画を止めないよう、書体の CSS は最初の描画のあとに足す（swap）。無くても端末の明朝で読める */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){var l=document.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@600&display=swap';document.head.appendChild(l)})()",
          }}
        />
      </head>
      <body className="antialiased">
        <JsonLd data={siteJsonLd()} />
        {/* 共通の頭（落款と名乗り・キット・頼み方と料金・運営者）。見本サイトでは globals.css が隠す */}
        <SiteHeader lang={lang} />
        {children}
        {/* 共通のフッター（キット・ご相談・このサイト・ほかの場所・言語）。どの紙にも出す */}
        <SiteFooter lang={lang} />
        {/* Vercel Web Analytics。Cookie を使わず、個人を特定する情報も持たないページビューの数だけ */}
        <Analytics />
        {/* 提案文・各媒体から ?ref= 付きで来たときだけ、arrive を 1 回送る */}
        <ArriveTracker />
      </body>
    </html>
  );
}
