/*
 * THESIS: 問い合わせが「整理されて届く」ところを、料紙の上で先に読ませる（Operate）。
 *   最初の画面は、5 通を整理した回に届く 1 通。その下で 1 通ずつ、分類・要約・下書き・シートの行を読む。
 * FORM: 料紙（作品ページ）— 文法は DESIGN.md。道具の中は帳面の法（components/kit-demo/kit-demo.module.css）。
 * COLOR: 朱は落款と、選んでいるメールの印だけ。要対応も墨の字（⚠）で語る。
 * TRUTH: このページは API を一度も呼ばない。AI の答えは見本の記録（キットの SAMPLE_ANSWERS と、
 *   その形で置いた 1 通）で、画面にもそう書く。答え以外はキットの src/ の写し（./kit/）が作る。
 */
import { KitClose, KitPriceLine } from "@/components/kit-demo/KitClose";
import type { Lang } from "@/i18n/routes";

import { DemoNote, ProjectShell, projectMetadata } from "../shell";
import { copy } from "./copy";
import { InboxDemo } from "./InboxDemo";

export const metadataFor = (lang: Lang) => projectMetadata(lang, "inbox-triage", copy[lang].meta, false);

export function Content({ lang }: { lang: Lang }) {
  const t = copy[lang];
  return (
    <ProjectShell lang={lang} slug="inbox-triage" title={t.title} latin="Inbox Triage" lede={t.lede}>
      <KitPriceLine slug="inbox-triage" lang={lang} />
      <DemoNote lang={lang} />
      <InboxDemo />
      <KitClose slug="inbox-triage" lang={lang} made={t.made} />
    </ProjectShell>
  );
}
