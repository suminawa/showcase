/*
 * 作品ページの書体。トップ・分類のページと同じ二書体なので、宣言は
 * src/components/ryoushi/fonts.ts の一組だけを使う（2026-10-07）。
 * ＊ 面ごとに宣言を分けていたあいだ、同じ @font-face が二組（498 本）出ていた。
 * projects.module.css は --hi-display / --hi-mincho を読む。
 */
export { display, mincho, fontVars } from "@/components/ryoushi/fonts";
