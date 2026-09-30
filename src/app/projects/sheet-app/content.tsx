/*
 * THESIS: スプレッドシート運用という実務を、料紙の上の【道具】として扱う（Operate）。
 *   間取りシミュレーターと同じ構えで、紙は床の間に退き、道具だけが載る。
 * OWN-WORLD: 頭（戻り・名乗り・一行）は料紙の文法そのまま。
 *   道具の中だけは別の世界で、色も字も道具自身が持つ（--sa-*）──
 *   額装が変わっても、掛かっている道具は変わらない。水盤と同じ理屈。
 * COLOR: 紙の側で色を持つのは朱の落款ひとつだけ。道具の中の緑は道具の色で、
 *   料紙には寄せない。
 * STORY: 検索すると一覧が絞れ、行を開くと詳細と編集が出る。
 * FIRST VIEWPORT: 頭（戻り・名乗り・一行）、その下に道具。
 * FORM: 料紙（作品ページ）— 文法は DESIGN.md
 * このページはサーバー部品のまま。道具（Tool）は "use client" のこの下だけに閉じる。
 */
import type { Lang } from "@/i18n/routes";

import { AFTER_TOOL, DemoNote, ProjectShell, PurchaseNote, ShopLinks, projectMetadata } from "../shell";
import s from "../projects.module.css";
import { copy } from "./copy";
import f from "./sheet-app.module.css";
import { Tool } from "./Tool";

export const metadataFor = (lang: Lang) => projectMetadata(lang, "sheet-app", copy[lang].meta);

export function Content({ lang }: { lang: Lang }) {
  const t = copy[lang];
  return (
    <ProjectShell lang={lang} slug="sheet-app" title={t.title} latin="Sheet App" lede={t.lede}>
      <DemoNote lang={lang} />
      {/* 道具の中だけは自前の色と字を持つ。その根がこの一枚 */}
      <div className={f.tool}>
        <Tool />
      </div>
      <p className={s.lede} style={AFTER_TOOL}>
        {t.demo}
      </p>
      <p className={s.lede}>{t.access}</p>
      <p className={s.lede}>
        {t.kit}
        <ShopLinks lang={lang} slug="sheet-app" linkKey="sheet-app" />
      </p>
      <PurchaseNote lang={lang} />
    </ProjectShell>
  );
}
