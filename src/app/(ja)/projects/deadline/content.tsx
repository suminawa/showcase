/*
 * THESIS: 毎朝届く 1 通を、先に読ませる（Operate）。頭の右に購入の箱（値段・BOOTH・帳票・無料版）。
 *   見本は「届くもの」── 期限の表から作られた 1 通。表と今日の日付はその横で書き換えられる。
 * FORM: 方眼（DESIGN.md）。見本の中はスプレッドシートの文法（components/kit-demo/kit-demo.module.css）。
 * COLOR: 朱は選んでいるセルと設定の印だけ。直すところの文も墨の濃さだけで語る。
 * TRUTH: 通知と「設定を確かめる」の文は、キットの src/ の写し（./kit/）が作る。見せかけの文を書かない。
 * このページはサーバー部品のまま。道具（DeadlineDemo）は "use client" のこの下だけに閉じる。
 */
import { KitBuy, KitClose, KitFacts } from "@/components/kit-demo/KitClose";
import type { Lang } from "@/i18n/routes";
import { goHref } from "@/lib/go";

import { DemoLabel } from "../demo-label";
import { DemoNote, ProjectShell, projectMetadata } from "../shell";
import { copy } from "./copy";
import { DeadlineDemo } from "./DeadlineDemo";

/** ココナラの出品。名は日本語のまま出す（出品のページが日本語のため） */
const SERVICE = { name: "GASでスプレッドシートの期限を毎朝通知します", href: "https://coconala.com/services/4427437" };

/** 無料版（期限アラート ライト）。名は日本語のまま出す（BOOTH のページが日本語のため） */
const FREE = { name: "期限アラート ライト", href: goHref("deadline-lite", "booth", "/projects/deadline") };

export const metadataFor = (lang: Lang) => projectMetadata(lang, "deadline", copy[lang].meta, false);

export function Content({ lang }: { lang: Lang }) {
  const t = copy[lang];
  return (
    <ProjectShell lang={lang} slug="deadline" title={t.title} latin="Deadline Alert" lede={t.lede} aside={<KitBuy slug="deadline" lang={lang} />}
      head={<KitFacts slug="deadline" lang={lang} />}>
      <DemoLabel lang={lang} />
      <DemoNote lang={lang} />
      <DeadlineDemo />
      <KitClose slug="deadline" lang={lang} made={t.made} service={{ ...t.service, ...SERVICE }} free={{ ...t.free, ...FREE }} />
    </ProjectShell>
  );
}
