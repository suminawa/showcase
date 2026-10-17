/*
 * THESIS: 送信先を持つということを、送って確かめさせる（Operate）。頭の右に購入の箱。
 *   見本は「キットがすること」── 受付シートの 1 行・通知・自動返信。その横で本物のフォームを送れる。
 * FORM: 方眼（DESIGN.md）。見本の中はスプレッドシートの文法（components/kit-demo/kit-demo.module.css）。
 * COLOR: 朱は選んでいる欄と、bot のふりの印が点いたときだけ。断った文も墨の濃さだけで語る。
 * TRUTH: 検証・受付番号・行・通知・自動返信は、キットの src/ の写し（./kit/）がこの画面の中で作る。
 *   どこにも送らず、何も保存しない（ページにもそう書く）。
 */
import { KitBuy, KitClose, KitFacts } from "@/components/kit-demo/KitClose";
import type { Lang } from "@/i18n/routes";

import { DemoLabel } from "../demo-label";
import { DemoNote, ProjectShell, projectMetadata } from "../shell";
import { copy } from "./copy";
import { FormDemo } from "./FormDemo";

/** ココナラの出品。名は日本語のまま出す（出品のページが日本語のため） */
const SERVICE = { name: "フォームの不具合を直します", href: "https://coconala.com/services/4427445" };
/** 設定ごと頼める出品（ココナラ ③）。名は公開中の題と同じ字にする */
const SETUP = { name: "問い合わせフォームに台帳・通知・自動返信をつけます", href: "https://coconala.com/services/4394572" };

export const metadataFor = (lang: Lang) => projectMetadata(lang, "form", copy[lang].meta, false);

export function Content({ lang }: { lang: Lang }) {
  const t = copy[lang];
  return (
    <ProjectShell lang={lang} slug="form" title={t.title} latin="Form Intake" lede={t.lede} aside={<KitBuy slug="form" lang={lang} />}
      head={<KitFacts slug="form" lang={lang} />}>
      <DemoLabel lang={lang} />
      <DemoNote lang={lang} />
      <FormDemo />
      <KitClose slug="form" lang={lang} made={t.made} setup={{ ...t.setup, ...SETUP }} service={{ ...t.service, ...SERVICE }} />
    </ProjectShell>
  );
}
