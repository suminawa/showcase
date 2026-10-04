import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Noto_Sans_JP } from "next/font/google";

import { JsonLd } from "@/components/JsonLd";
import { siteJsonLd } from "@/lib/jsonld";
import { SITE_DESCRIPTION, SITE_NAME, siteUrl } from "@/lib/site";

import "./globals.css";

const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto-sans-jp",
});

/*
 * OGP の画像は src/app/opengraph-image.png（1200×630）。
 * 実際のトップ画面を 2 倍で焼いて縮めたもので、意匠の写しではなく現物である。
 * ＊ トップの意匠を変えたら焼き直すこと。自動では追随しない。
 */
export const metadata: Metadata = {
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    /* 現れる演出の印（data-hi）は、本文より先に走る一行の script が付ける。
       サーバーが書いた html にはまだ無いので、その一点だけ照合を見送る */
    <html lang="ja" suppressHydrationWarning>
      <body className={`${notoSansJp.variable} font-sans antialiased`}>
        <JsonLd data={siteJsonLd()} />
        {children}
        {/* Vercel Web Analytics。Cookie を使わず、個人を特定する情報も持たないページビューの数だけ */}
        <Analytics />
      </body>
    </html>
  );
}
