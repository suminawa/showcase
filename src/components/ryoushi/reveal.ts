/**
 * 現れる演出の印。JS が動いた紙にだけ付く（前の世界・料紙の紙が読む）。
 *
 * 土台は「本文が最初から見えていること」で、隠してから現す演出は
 * この印が付いた紙でしか走らない（ryoushi.module.css の `html[data-hi="on"]` の下）。
 * 根の文書（RootDocument）が読むので、書体の宣言（fonts.ts）とは別の小さな一つに分けてある ──
 * fonts.ts を根から読むと、料紙の二書体の @font-face（240 余り）がどの紙にも載ってしまう。
 */
export const REVEAL_FLAG = 'document.documentElement.dataset.hi="on"';
