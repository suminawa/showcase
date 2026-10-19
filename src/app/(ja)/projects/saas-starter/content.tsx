/*
 * THESIS: 売り物のログイン画面から触らせる（Operate）。売り物のキットのページの型（kit-parts.tsx。手本は deadline）。
 *   頭: 題は検索語と差（ログイン・組織・権限・月額課金が動く、日本向け SaaS の土台）、品物の名は題の下。
 *     右に購入の箱（KitOffer）。BOOTH の 2 つの選択肢（個人・社内用／制作会社用）を値段の表で。
 *   1 画面目: 頭のすぐ下に見本（キットの見本モードと同じログインの画面から始まる）。
 *     スマホは右の箱を出さず、値段と 2 つの押す先を下の帯（KitBuyBar）に。
 *   見本のあと: 試せること → 証拠 → 誰向け → 比較 → 値段（設置込み・制作会社用・領収書）→ つまずき（KitSales）
 *     → 結び（KitClose。比較は KitSales に任せる）
 * OWN-WORLD: 道具の中だけは別の世界で、色も字も道具自身が持つ（--st-*。saas-starter.module.css）。
 * FORM: 方眼（DESIGN.md）
 * このページはサーバー部品のまま。道具（Tool）は "use client" のこの下だけに閉じる。
 */
import { KitClose } from "@/components/kit-demo/KitClose";
import type { Lang } from "@/i18n/routes";

import { KitBuyBar, KitOffer, KitSales } from "../kit-parts";
import { AFTER_TOOL, ProjectShell, projectMetadata } from "../shell";
import s from "../projects.module.css";
import { copy } from "./copy";
import { Tool } from "./Tool";

/** BOOTH・note の鍵（links.json。kit-demos.ts の linkKey と同じ） */
const LINK = "saas-starter";

export const metadataFor = (lang: Lang) => projectMetadata(lang, "saas-starter", copy[lang].meta);

export function Content({ lang }: { lang: Lang }) {
  const t = copy[lang];
  return (
    <ProjectShell
      lang={lang}
      slug="saas-starter"
      title={t.title}
      name={t.name}
      latin="SaaS Starter"
      lede={t.lede}
      aside={<KitOffer lang={lang} slug="saas-starter" linkKey={LINK} />}
      bar={<KitBuyBar lang={lang} slug="saas-starter" linkKey={LINK} />}
    >
      {/* 道具の中だけは自前の色と字を持つ。その根が Tool の中の 1 枚。英仏の紙からは英語の画面で始める */}
      <Tool initialLang={lang === "ja" ? undefined : "en"} />

      <p className={s.lede} style={AFTER_TOOL}>
        {t.try}
      </p>
      <p className={s.lede}>{t.table}</p>
      <p className={s.lede}>{t.billing}</p>
      <p className={s.lede}>{t.offline}</p>
      <p className={s.lede}>{t.contents}</p>

      <KitSales lang={lang} slug="saas-starter" name={t.name} linkKey={LINK} copy={t.sales} />
      <KitClose slug="saas-starter" lang={lang} made={t.made} compare={false} />
    </ProjectShell>
  );
}
