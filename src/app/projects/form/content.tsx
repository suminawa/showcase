/*
 * THESIS: 送信先を持つということを、送って確かめさせる（Operate）。
 *   最初の画面は「キットがすること」── 受付シートの 1 行・通知・自動返信。その横で本物のフォームを送れる。
 * FORM: 料紙（作品ページ）— 文法は DESIGN.md。道具の中は帳面の法（components/kit-demo/kit-demo.module.css）。
 * COLOR: 朱は落款と、bot のふりの印が点いたときだけ。断った文も墨の濃さだけで語る。
 * TRUTH: 検証・受付番号・行・通知・自動返信は、キットの src/ の写し（./kit/）がこの画面の中で作る。
 *   どこにも送らず、何も保存しない（ページにもそう書く）。
 */
import { KitClose, KitPriceLine } from "@/components/kit-demo/KitClose";
import type { Lang } from "@/i18n/routes";

import { DemoNote, ProjectShell, projectMetadata } from "../shell";
import { copy } from "./copy";
import { FormDemo } from "./FormDemo";

export const metadataFor = (lang: Lang) => projectMetadata(lang, "form", copy[lang].meta, false);

export function Content({ lang }: { lang: Lang }) {
  const t = copy[lang];
  return (
    <ProjectShell lang={lang} slug="form" title={t.title} latin="Form Intake" lede={t.lede}>
      <KitPriceLine slug="form" lang={lang} />
      <DemoNote lang={lang} />
      <FormDemo />
      <KitClose slug="form" lang={lang} made={t.made} />
    </ProjectShell>
  );
}
