/*
 * THESIS: 毎朝届く 1 通を、料紙の上で先に読ませる（Operate）。
 *   最初の画面は「届くもの」── 期限の表から作られた 1 通。表と今日の日付はその下で書き換えられる。
 * FORM: 料紙（作品ページ）— 文法は DESIGN.md。道具の中は帳面の法（components/kit-demo/kit-demo.module.css）。
 * COLOR: 朱は落款と、設定の切り替えで選ばれている印だけ。直すところの文も墨の濃さだけで語る。
 * TRUTH: 通知と「設定を確かめる」の文は、キットの src/ の写し（./kit/）が作る。見せかけの文を書かない。
 * このページはサーバー部品のまま。道具（DeadlineDemo）は "use client" のこの下だけに閉じる。
 */
import { KitClose, KitPriceLine } from "@/components/kit-demo/KitClose";
import type { Lang } from "@/i18n/routes";

import { DemoNote, ProjectShell, projectMetadata } from "../shell";
import { copy } from "./copy";
import { DeadlineDemo } from "./DeadlineDemo";

export const metadataFor = (lang: Lang) => projectMetadata(lang, "deadline", copy[lang].meta, false);

export function Content({ lang }: { lang: Lang }) {
  const t = copy[lang];
  return (
    <ProjectShell lang={lang} slug="deadline" title={t.title} latin="Deadline Alert" lede={t.lede}>
      <KitPriceLine slug="deadline" lang={lang} />
      <DemoNote lang={lang} />
      <DeadlineDemo />
      <KitClose slug="deadline" lang={lang} made={t.made} />
    </ProjectShell>
  );
}
