/*
 * THESIS: 問い合わせが「整理されて届く」ところを、先に読ませる（Operate）。売り物のキットの型（kit-parts.tsx。手本は /projects/deadline）。
 *   頭: 題は検索語（Gmail の問い合わせ）と差（AI が分類・要約・返信案。送るのは人）、品物の名は題の下。右に購入の箱、スマホは下の帯。
 *   1 画面目: 頭のすぐ下に見本（5 通を整理した回に届く 1 通）。その下で 1 通ずつ、分類・要約・下書き・シートの行を読む。
 *   見本のあと: 証拠 → 誰向け → 比較 → 値段（設置込み・領収書）→ つまずき（KitSales）→ 結び（KitClose。比較は KitSales に任せる）
 * FORM: 方眼（DESIGN.md）。道具の中は帳面の法（components/kit-demo/kit-demo.module.css）。
 * COLOR: 朱は落款と、選んでいるメールの印だけ。要対応も墨の字（⚠）で語る。
 * TRUTH: このページは API を一度も呼ばない。AI の答えは見本の記録（キットの SAMPLE_ANSWERS と、
 *   その形で置いた 1 通）で、画面にもそう書く。答え以外はキットの src/ の写し（./kit/）が作る。
 */
import { KitClose } from "@/components/kit-demo/KitClose";
import type { Lang } from "@/i18n/routes";

import { DemoLabel } from "../demo-label";
import { KitBuyBar, KitOffer, KitSales } from "../kit-parts";
import { DemoNote, ProjectShell, projectMetadata } from "../shell";
import { copy } from "./copy";
import { InboxDemo } from "./InboxDemo";

/** BOOTH・note の鍵（links.json。kit-demos.ts の linkKey と同じ） */
const LINK = "inbox-triage";

export const metadataFor = (lang: Lang) => projectMetadata(lang, "inbox-triage", copy[lang].meta, false);

export function Content({ lang }: { lang: Lang }) {
  const t = copy[lang];
  return (
    <ProjectShell
      lang={lang}
      slug="inbox-triage"
      title={t.title}
      name={t.name}
      latin="Inbox Triage"
      lede={t.lede}
      aside={<KitOffer lang={lang} slug="inbox-triage" linkKey={LINK} />}
      bar={<KitBuyBar lang={lang} slug="inbox-triage" linkKey={LINK} />}
    >
      <DemoLabel lang={lang} />
      <DemoNote lang={lang} />
      <InboxDemo />
      <KitSales lang={lang} slug="inbox-triage" name={t.name} linkKey={LINK} copy={t.sales} />
      <KitClose slug="inbox-triage" lang={lang} made={t.made} compare={false} />
    </ProjectShell>
  );
}
