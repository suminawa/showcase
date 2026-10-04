/*
 * THESIS: 会員制サービスの土台を、料紙の上の【道具】として扱う（Operate）。
 *   ダッシュボード キットと同じ構えで、紙は床の間に退き、道具だけが載る。
 * OWN-WORLD: 頭（戻り・名乗り・一行）は料紙の文法そのまま。
 *   道具の中だけは別の世界で、色も字も道具自身が持つ（--st-*）──
 *   額装が変わっても、掛かっている道具は変わらない。水盤と同じ理屈。
 * COLOR: 紙の側で色を持つのは朱の落款ひとつだけ。道具の中の青は道具の色で、
 *   料紙には寄せない。
 * STORY: 見本の方を選んで入ると、その役割で画面が変わる。
 *   プロジェクトを足し、上限に当たり、プランを選び、偽のお支払いを終えると上限が動く。
 * FIRST VIEWPORT: 頭（戻り・名乗り・一行）、見本の断りが一行、その下に道具。
 * FORM: 料紙（作品ページ）— 文法は DESIGN.md
 * このページはサーバー部品のまま。道具（Tool）は "use client" のこの下だけに閉じる。
 */
import { projectPriceNow } from "@/i18n/catalog";
import type { Lang } from "@/i18n/routes";

import { AFTER_TOOL, ProjectShell, PurchaseNote, ShopLinks, projectMetadata } from "../shell";
import s from "../projects.module.css";
import { copy } from "./copy";
import { Tool } from "./Tool";

export const metadataFor = (lang: Lang) => projectMetadata(lang, "saas-starter", copy[lang].meta);

export function Content({ lang }: { lang: Lang }) {
  const t = copy[lang];
  return (
    <ProjectShell lang={lang} slug="saas-starter" title={t.title} latin="SaaS Starter" lede={t.lede}>
      <p className={s.lede}>{t.intro}</p>

      {/* 道具の中だけは自前の色と字を持つ。その根が Tool の中の 1 枚 */}
      <Tool initialLang={lang === "ja" ? undefined : "en"} />

      <p className={s.lede} style={AFTER_TOOL}>
        {t.try}
      </p>
      <p className={s.lede}>{t.table}</p>
      <p className={s.lede}>{t.billing}</p>
      <p className={s.lede}>{t.offline}</p>
      <p className={s.lede}>{t.contents}</p>
      <p className={s.lede}>
        {t.kit(projectPriceNow("saas-starter"))}
        <ShopLinks lang={lang} slug="saas-starter" linkKey="saas-starter" />
      </p>
      <PurchaseNote lang={lang} />
    </ProjectShell>
  );
}
