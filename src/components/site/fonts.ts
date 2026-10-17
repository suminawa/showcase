import { Shippori_Mincho } from "next/font/google";

/**
 * 見出しの明朝。一書体・一太さ（600）だけを読む。
 * Apple の端末はヒラギノ明朝が先に当たるので読み込まない（--m-mincho の並び。globals.css）。
 * 日本語の書体は 120 余りの切れに分かれているので、先読みは付けない（要る切れだけを取りに行かせる）。
 */
export const minchoFace = Shippori_Mincho({
  subsets: ["latin"],
  weight: "600",
  display: "swap",
  preload: false,
  variable: "--m-mincho-face",
});
