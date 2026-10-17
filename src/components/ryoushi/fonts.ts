import { Hina_Mincho, Shippori_Mincho } from "next/font/google";

/**
 * 料紙の書体。トップと分類のページが同じものを読むので、ここ一箇所で宣言する
 * （next/font はモジュール単位で解決されるため、共有すればリクエストも一組で済む）。
 *
 * 変数名は ryoushi.module.css の --hi-serif / --hi-serif-display が参照する。
 * 作品ページは同じ二書体を --rp-* という別名で持つ ── 面ごとに閉じた名前に
 * しておくと、どちらか一方の書体を替えたくなったときに他方を巻き込まない。
 */

/** 大の一行だけに使う明朝。細身のローマンで、墨のかたまりの横で髪の毛の線に見える */
export const display = Hina_Mincho({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--hi-display",
});

/** 小さい字はすべてこの明朝。小さくても骨が残る 500 を併せて持つ */
export const mincho = Shippori_Mincho({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--hi-mincho",
  /*
   * 日本語の書体は 120 余りの小さな切れ（unicode-range）に分かれていて、
   * preload を付けると next/font が全部を <link rel=preload> に並べる
   * （2026-10-07 の実測: 124 本・3.8MB が毎ページ）。字が要る切れだけを
   * ブラウザに取りに行かせるので、先読みは付けない。
   */
  preload: false,
});

/** <main> に載せるクラス名。`${s.paper} ${fontVars}` の形で使う */
export const fontVars = `${display.variable} ${mincho.variable}`;

/** 現れる演出の印（宣言は reveal.ts。根の文書がこちらを読まずに済むように分けた） */
export { REVEAL_FLAG } from "./reveal";
