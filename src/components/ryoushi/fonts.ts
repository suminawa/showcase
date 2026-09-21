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
});

/** <main> に載せるクラス名。`${s.paper} ${fontVars}` の形で使う */
export const fontVars = `${display.variable} ${mincho.variable}`;

/**
 * 現れる演出の印。JS が動いた紙にだけ付く。
 *
 * 土台は「本文が最初から見えていること」で、隠してから現す演出は
 * この印が付いた紙でしか走らない（ryoushi.module.css の
 * `html[data-hi="on"]` の下に、入場の animation を全部まとめてある）。
 * JS を切った紙・印刷・読み込みに失敗した紙では、隠す規則が一つも
 * 当たらないので、全部の行が最初から読める。
 */
export const REVEAL_FLAG = 'document.documentElement.dataset.hi="on"';
