/*
 * THESIS: 予約という実務を、料紙の上の【道具】として扱う（Operate）。
 *   スプレッドシート業務アプリと同じ構えで、紙は床の間に退き、道具だけが載る。
 * OWN-WORLD: 頭（戻り・名乗り・一行）は料紙の文法そのまま。
 *   道具の中だけは別の世界で、色も字も道具自身が持つ（--bk-*）──
 *   額装が変わっても、掛かっている道具は変わらない。水盤と同じ理屈。
 * COLOR: 紙の側で色を持つのは朱の落款ひとつだけ。道具の中の緑は道具の色で、
 *   料紙には寄せない。
 * STORY: 空きカレンダーで日を選ぶと時間が出て、名前と連絡先を入れ、確認して予約が済む。
 * FIRST VIEWPORT: 頭（戻り・名乗り・一行）、見本の断りが一行、その下に道具。
 * FORM: 料紙（作品ページ）— 文法は DESIGN.md
 * このページはサーバー部品のまま。道具（Tool）は "use client" のこの下だけに閉じる。
 */
import type { Lang } from "@/i18n/routes";

import {
  AFTER_TOOL,
  ProjectShell,
  PurchaseNote,
  ShopEmbed,
  ShopLinks,
  projectMetadata,
} from "../shell";
import s from "../projects.module.css";
import f from "./booking.module.css";
import { copy } from "./copy";
import { Tool } from "./Tool";

export const metadataFor = (lang: Lang) =>
  projectMetadata(lang, "booking", copy[lang].meta);

export function Content({ lang }: { lang: Lang }) {
  const t = copy[lang];
  return (
    <ProjectShell
      lang={lang}
      slug="booking"
      title={t.title}
      latin="Booking"
      lede={t.lede}
    >
      <p className={s.lede}>{t.intro}</p>
      {/* 道具の中だけは自前の色と字を持つ。その根がこの一枚 */}
      <div className={f.tool}>
        <Tool />
      </div>
      <p className={s.lede} style={AFTER_TOOL}>
        {t.flow}
      </p>
      <p className={s.lede}>{t.options}</p>
      <p className={s.lede}>{t.setup}</p>
      <p className={s.lede}>
        {t.kit}
        <ShopLinks lang={lang} slug="booking" linkKey="booking" />
      </p>
      <ShopEmbed linkKey="booking" />
      <PurchaseNote lang={lang} />
    </ProjectShell>
  );
}
