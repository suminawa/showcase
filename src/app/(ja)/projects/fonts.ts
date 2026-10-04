import { Hina_Mincho, Shippori_Mincho } from "next/font/google";

/**
 * 作品ページの書体。二枚が同じものを読むので、ここ一箇所で宣言する
 * （next/font はモジュール単位で解決されるため、共有すればリクエストも一組で済む）。
 *
 * 変数名は projects.module.css の --rp-serif / --rp-serif-display が参照する。
 * トップは同じ二書体を --hi-* という別名で持つ ── 面ごとに閉じた名前にしておくと、
 * どちらか一方の書体を替えたくなったときに他方を巻き込まない。
 */

/** 名乗りの一行だけに使う明朝。細身のローマンで、墨のかたまりの横で髪の毛の線に見える */
export const display = Hina_Mincho({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--rp-display",
});

/** 小さい字はすべてこの明朝。小さくても骨が残る 500 を併せて持つ */
export const mincho = Shippori_Mincho({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--rp-mincho",
});

/** <main> に載せるクラス名。`${paperClass} ${fontVars}` の形で使う */
export const fontVars = `${display.variable} ${mincho.variable}`;
