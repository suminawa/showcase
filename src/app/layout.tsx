import type { Metadata } from "next";
import { siteUrl } from "@/lib/site";
import { Noto_Sans_JP } from "next/font/google";
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
  title: { default: "Showcase", template: "%s | Showcase" },
  description: "Things I've built — 動くもので見せるポートフォリオ",
  openGraph: {
    type: "website",
    siteName: "Showcase",
    title: "Showcase",
    description: "Things I've built — 動くもので見せるポートフォリオ",
    locale: "ja_JP",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Showcase",
    description: "Things I've built — 動くもので見せるポートフォリオ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJp.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
