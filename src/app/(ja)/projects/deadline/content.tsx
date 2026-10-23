/*
 * THESIS: 毎朝届く 1 通を、先に読ませる（Operate）。売り物のキットのページの型の手本（kit-parts.tsx。2026-10-20）。
 *   頭: 題は検索語（契約・車検・支払いの期限を、毎朝 1 通で）、品物の名は題の下。右に購入の箱（KitOffer）。
 *   1 画面目: 頭のすぐ下に結果の画面（届く 1 通）。スマホは右の箱を出さず、値段と 2 つの押す先を下の帯（KitBuyBar）に。
 *   見本のあと: 証拠 → 誰向け → 比較 → 値段（設置込み・領収書）→ つまずき（KitSales）→ 結び（KitClose。比較は KitSales に任せる）
 * FORM: 方眼（DESIGN.md）。見本の中はスプレッドシートの文法（components/kit-demo/kit-demo.module.css）。
 * COLOR: 朱は選んでいるセルと設定の印だけ。直すところの文も墨の濃さだけで語る。
 * TRUTH: 通知と「設定を確かめる」の文は、キットの src/ の写し（./kit/）が作る。見せかけの文を書かない。
 * このページはサーバー部品のまま。道具（DeadlineDemo）は "use client" のこの下だけに閉じる。
 */
import { KitClose } from "@/components/kit-demo/KitClose";
import type { Lang } from "@/i18n/routes";
import { goHref } from "@/lib/go";

import { DemoLabel } from "../demo-label";
import { KitBuyBar, KitOffer, KitSales } from "../kit-parts";
import { DemoNote, ProjectShell, projectMetadata } from "../shell";
import { copy } from "./copy";
import { DeadlineDemo } from "./DeadlineDemo";

/** BOOTH・note の鍵（links.json。kit-demos.ts の linkKey と同じ） */
const LINK = "s2";

/** ココナラの出品。名は日本語のまま出す（出品のページが日本語のため） */
const SERVICE = { name: "GASでスプレッドシートの期限を毎朝通知します", href: "https://coconala.com/services/4427437" };

/** 無料版（期限アラート ライト）。名は日本語のまま出す（BOOTH のページが日本語のため） */
const FREE = { name: "期限アラート ライト", href: goHref("deadline-lite", "booth", "/projects/deadline") };

export const metadataFor = (lang: Lang) => projectMetadata(lang, "deadline", copy[lang].meta);

export function Content({ lang }: { lang: Lang }) {
  const t = copy[lang];
  return (
    <ProjectShell
      lang={lang}
      slug="deadline"
      title={t.title}
      name={t.name}
      latin="Deadline Alert"
      lede={t.lede}
      aside={<KitOffer lang={lang} slug="deadline" linkKey={LINK} />}
      bar={<KitBuyBar lang={lang} slug="deadline" linkKey={LINK} />}
    >
      <DemoLabel lang={lang} />
      <DemoNote lang={lang} />
      <DeadlineDemo />
      <KitSales lang={lang} slug="deadline" name={t.name} linkKey={LINK} copy={t.sales} />
      <KitClose slug="deadline" lang={lang} made={t.made} compare={false} service={{ ...t.service, ...SERVICE }} free={{ ...t.free, ...FREE }} />
    </ProjectShell>
  );
}
