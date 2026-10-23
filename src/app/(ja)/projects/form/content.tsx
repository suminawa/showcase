/*
 * THESIS: 送信先を持つということを、送って確かめさせる（Operate）。売り物のキットのページの型（kit-parts.tsx。手本は deadline）。
 *   頭: 題は検索語（自社サイトのフォームに、受付シート・通知・自動返信を）、品物の名は題の下。右に購入の箱（KitOffer）。
 *   1 画面目: 頭のすぐ下に見本。スマホは値段と 2 つの押す先を下の帯（KitBuyBar）に。
 *   見本のあと: 証拠 → 誰向け → 比較 → 値段（設置込み・領収書）→ つまずき（KitSales）→ 結び（KitClose。比較は KitSales に任せる）
 *   見本は「キットがすること」── 受付シートの 1 行・通知・自動返信。その横で本物のフォームを送れる。
 * FORM: 方眼（DESIGN.md）。見本の中はスプレッドシートの文法（components/kit-demo/kit-demo.module.css）。
 * COLOR: 朱は選んでいる欄と、bot のふりの印が点いたときだけ。断った文も墨の濃さだけで語る。
 * TRUTH: 検証・受付番号・行・通知・自動返信は、キットの src/ の写し（./kit/）がこの画面の中で作る。
 *   どこにも送らず、何も保存しない（ページにもそう書く）。
 */
import { KitClose } from "@/components/kit-demo/KitClose";
import type { Lang } from "@/i18n/routes";

import { DemoLabel } from "../demo-label";
import { KitBuyBar, KitOffer, KitSales } from "../kit-parts";
import { DemoNote, ProjectShell, projectMetadata } from "../shell";
import { copy } from "./copy";
import { FormDemo } from "./FormDemo";

/** BOOTH・note の鍵（links.json。kit-demos.ts の linkKey と同じ） */
const LINK = "s3";

/** ココナラの出品。名は日本語のまま出す（出品のページが日本語のため） */
const SERVICE = { name: "Googleフォームの不具合を直します", href: "https://coconala.com/services/4427445" };
/** 設定ごと頼める出品（ココナラ ③）。名は公開中の題と同じ字にする */
const SETUP = { name: "問い合わせフォームに台帳・通知・自動返信をつけます", href: "https://coconala.com/services/4394572" };

export const metadataFor = (lang: Lang) => projectMetadata(lang, "form", copy[lang].meta);

export function Content({ lang }: { lang: Lang }) {
  const t = copy[lang];
  return (
    <ProjectShell
      lang={lang}
      slug="form"
      title={t.title}
      name={t.name}
      latin="Form Intake"
      lede={t.lede}
      aside={<KitOffer lang={lang} slug="form" linkKey={LINK} />}
      bar={<KitBuyBar lang={lang} slug="form" linkKey={LINK} />}
    >
      <DemoLabel lang={lang} />
      <DemoNote lang={lang} />
      <FormDemo />
      <KitSales lang={lang} slug="form" name={t.name} linkKey={LINK} copy={t.sales} />
      <KitClose slug="form" lang={lang} made={t.made} compare={false} setup={{ ...t.setup, ...SETUP }} service={{ ...t.service, ...SERVICE }} />
    </ProjectShell>
  );
}
