import type { Metadata } from "next";
import {
  Big_Shoulders,
  Noto_Sans_JP,
  Shippori_Mincho_B1,
} from "next/font/google";
import "./globals.css";

const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto-sans-jp",
});

const bigShoulders = Big_Shoulders({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-big-shoulders",
});

/** 墨の世界（/preview/sumi）のディスプレイ書体。ラテン専用 */
const shippori = Shippori_Mincho_B1({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
  variable: "--font-shippori",
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
        className={`${notoSansJp.variable} ${bigShoulders.variable} ${shippori.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
