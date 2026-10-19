/*
 * THESIS: 数字を眺めるという実務を、料紙の上の【道具】として扱う（Operate）。
 *   予約ページ・業務アプリと同じ構えで、紙は床の間に退き、道具だけが載る。
 * OWN-WORLD: 頭（戻り・名乗り・一行）は料紙の文法そのまま。
 *   道具の中だけは別の世界で、色も字も道具自身が持つ（--db-*）──
 *   額装が変わっても、掛かっている道具は変わらない。水盤と同じ理屈。
 * COLOR: 紙の側で色を持つのは朱の落款ひとつだけ。道具の中の系列の色は道具の色で、
 *   料紙には寄せない（色覚の差があっても見分けられる並びを崩さないため）。
 * STORY: 期間と区分で絞ると、数字の札・折れ線・棒・目標・表が同時に変わる。
 *   折れ線に触れると縦の線が付いてきて、その日の値がまとめて読める。
 * FIRST VIEWPORT: 頭（題・品物の名・一行。右に購入の箱）、見本の札、その下に道具。
 * 売り物のページの型（kit-parts.tsx。手本は deadline/content.tsx。2026-10-20）:
 *   道具のあと: 使い方の一行 → 証拠 → 誰向け → 比較 → 値段（設置込み・領収書）→ つまずき（KitSales）→ できること・置き方 → note。
 *   スマホは右の箱を出さず、値段と 2 つの押す先を下の帯（KitBuyBar）に。
 * FORM: 料紙（作品ページ）— 文法は DESIGN.md
 * このページはサーバー部品のまま。道具（Tool）は "use client" のこの下だけに閉じる。
 */
import type { Lang } from "@/i18n/routes";

import g from "../../guides/guides.module.css";
import { DemoLabel } from "../demo-label";
import { KitBuyBar, KitOffer, KitSales } from "../kit-parts";
import {
  AFTER_TOOL,
  ProjectShell,
  PurchaseNote,
  ShopEmbed,
  ShopLinks,
  projectMetadata,
} from "../shell";
import s from "../projects.module.css";
import { copy } from "./copy";
import f from "./dashboard.module.css";
import { Tool } from "./Tool";

/** BOOTH・note の鍵（links.json） */
const LINK = "dashboard";

export const metadataFor = (lang: Lang) =>
  projectMetadata(lang, "dashboard", copy[lang].meta);

export function Content({ lang }: { lang: Lang }) {
  const t = copy[lang];
  return (
    <ProjectShell
      lang={lang}
      slug="dashboard"
      title={t.title}
      name={t.name}
      latin="Dashboard"
      lede={t.lede}
      aside={<KitOffer lang={lang} slug="dashboard" linkKey={LINK} />}
      bar={<KitBuyBar lang={lang} slug="dashboard" linkKey={LINK} />}
    >
      <DemoLabel lang={lang} />
      {/* 道具の中だけは自前の色と字を持つ。その根がこの一枚 */}
      <div className={f.tool}>
        <Tool initialLang={lang === "ja" ? undefined : "en"} />
      </div>
      <p className={s.lede} style={AFTER_TOOL}>
        {t.intro}
      </p>
      <p className={s.lede}>{t.use}</p>
      <KitSales lang={lang} slug="dashboard" name={t.name} linkKey={LINK} copy={t.sales} />
      <section className={g.section}>
        <h2 className={g.heading}>{t.partsHeading}</h2>
        <p className={g.text}>{t.parts}</p>
      </section>
      <section className={g.section}>
        <h2 className={g.heading}>{t.deployHeading}</h2>
        <p className={g.text}>{t.deploy}</p>
      </section>
      <section className={g.section}>
        <h2 className={g.heading}>{t.buyHeading}</h2>
        <p className={g.text}>
          {t.kit}
          <ShopLinks lang={lang} slug="dashboard" linkKey={LINK} />
        </p>
        <ShopEmbed linkKey={LINK} />
        <PurchaseNote lang={lang} className={g.text} />
      </section>
    </ProjectShell>
  );
}
