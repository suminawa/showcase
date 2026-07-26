import type { Metadata } from "next";
import { Big_Shoulders, Noto_Sans_JP, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto-sans-jp",
});

/** 框の世界（作品ページ 2 枚）のディスプレイ書体 */
const bigShoulders = Big_Shoulders({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-big-shoulders",
});

/** 水盤の世界（ハブ）の書体 — a quiet humanist sans。ラテン専用 */
const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-sans-3",
});

export const metadata: Metadata = {
  title: { default: "Showcase", template: "%s | Showcase" },
  description: "Things I've built — 動くもので見せるポートフォリオ",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body
        className={`${notoSansJp.variable} ${bigShoulders.variable} ${sourceSans.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
