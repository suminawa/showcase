/*
 * THESIS: 作品そのものが体験。紙は床の間に退き、水盤を載せる台になる（Experience）。
 * OWN-WORLD: トップと同じ料紙。ただし役の配り方が違う ── ここでは紙が主役ではない。
 *   界線は頭の版面にだけ敷き、作品の版面には一本も通さない。筆脈と流れは持ち込まない
 *   （どちらも「段から段へ移る」「索引の行に触れる」ための仕掛けで、この面には段が一つしか無い）。
 * COLOR: 紙は墨の濃淡だけ。唯一の色は朱の落款ひとつで、それが戻りの導線を兼ねる。
 *   ＊ 水盤の中の藍と墨は【作品の色】であって紙の色ではない。だから料紙に寄せない ──
 *     作品自体の色は作品のものである。額装が変わっても、掛かっている絵は変わらない。
 * STORY: 水面は無地で待つ。最初の一滴は見る人の手から ── 触れて初めて模様が始まる。
 * FIRST VIEWPORT: 頭（戻り・名乗り・一行）と、その下いっぱいの水盤。
 * FORM: 料紙（作品ページ）— 文法は DESIGN.md
 */
import { SuminagashiBasin } from "@/components/suminagashi/SuminagashiBasin";
import type { Lang } from "@/i18n/routes";

import { DemoNote, ProjectShell, projectMetadata } from "../shell";
import { copy } from "./copy";

export const metadataFor = (lang: Lang) => projectMetadata(lang, "suminagashi", copy[lang].meta);

export function Content({ lang }: { lang: Lang }) {
  const t = copy[lang];
  return (
    <ProjectShell lang={lang} slug="suminagashi" title={t.title} latin="Suminagashi" lede={t.lede}>
      <DemoNote lang={lang} />
      <SuminagashiBasin />
    </ProjectShell>
  );
}
