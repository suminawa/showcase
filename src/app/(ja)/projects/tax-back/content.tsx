/*
 * THESIS: 見積もりシミュレーターと同じ帳面の法で、税込の切りのいい額から
 *   請求書に書く税抜と消費税を出す（Operate）。動くものは数字だけ。
 * FORM: 料紙（作品ページ）— 文法は DESIGN.md
 */
import { TaxBack } from "@/components/tax-back/TaxBack";
import type { Lang } from "@/i18n/routes";

import { DemoNote, ProjectShell, projectMetadata } from "../shell";
import { copy } from "./copy";

export const metadataFor = (lang: Lang) => projectMetadata(lang, "tax-back", copy[lang].meta);

export function Content({ lang }: { lang: Lang }) {
  const t = copy[lang];
  return (
    <ProjectShell lang={lang} slug="tax-back" title={t.title} latin="Tax" lede={t.lede}>
      <DemoNote lang={lang} />
      <TaxBack />
    </ProjectShell>
  );
}
