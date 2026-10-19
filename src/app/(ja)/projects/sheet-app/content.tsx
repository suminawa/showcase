/*
 * THESIS: スプレッドシート運用という実務を、料紙の上の【道具】として扱う（Operate）。売り物のキットのページの型（kit-parts.tsx。手本は deadline）。
 *   頭: 題は検索語と差（今の台帳を、スマホで検索・登録できる画面に）、品物の名は題の下。右に購入の箱（KitOffer）。
 *   1 画面目: 頭のすぐ下に道具。スマホは値段と 2 つの押す先を下の帯（KitBuyBar）に。
 *   道具のあと: 見本の説明と権限 → 証拠 → 誰向け → 比較 → 値段（設置込み・領収書）→ つまずき（KitSales）→ 結び（KitClose。比較は KitSales に任せる）
 * OWN-WORLD: 頭（戻り・名乗り・一行）は料紙の文法そのまま。
 *   道具の中だけは別の世界で、色も字も道具自身が持つ（--sa-*）──
 *   額装が変わっても、掛かっている道具は変わらない。水盤と同じ理屈。
 * COLOR: 紙の側で色を持つのは朱の落款ひとつだけ。道具の中の緑は道具の色で、
 *   料紙には寄せない。
 * STORY: 検索すると一覧が絞れ、行を開くと詳細と編集が出る。
 * FORM: 料紙（作品ページ）— 文法は DESIGN.md
 * このページはサーバー部品のまま。道具（Tool）は "use client" のこの下だけに閉じる。
 */
import { KitClose } from "@/components/kit-demo/KitClose";
import type { Lang } from "@/i18n/routes";

import { DemoLabel } from "../demo-label";
import { KitBuyBar, KitOffer, KitSales } from "../kit-parts";
import {
  AFTER_TOOL,
  DemoNote,
  ProjectShell,
  projectMetadata,
} from "../shell";
import s from "../projects.module.css";
import { copy } from "./copy";
import f from "./sheet-app.module.css";
import { Tool } from "./Tool";

/** BOOTH・note の鍵（links.json。kit-demos.ts の linkKey と同じ） */
const LINK = "sheet-app";

export const metadataFor = (lang: Lang) =>
  projectMetadata(lang, "sheet-app", copy[lang].meta);

export function Content({ lang }: { lang: Lang }) {
  const t = copy[lang];
  return (
    <ProjectShell
      lang={lang}
      slug="sheet-app"
      title={t.title}
      name={t.name}
      latin="Sheet App"
      lede={t.lede}
      aside={<KitOffer lang={lang} slug="sheet-app" linkKey={LINK} />}
      bar={<KitBuyBar lang={lang} slug="sheet-app" linkKey={LINK} />}
    >
      <DemoLabel lang={lang} />
      <DemoNote lang={lang} />
      {/* 道具の中だけは自前の色と字を持つ。その根がこの一枚 */}
      <div className={f.tool}>
        <Tool />
      </div>
      <p className={s.lede} style={AFTER_TOOL}>
        {t.demo}
      </p>
      <p className={s.lede}>{t.access}</p>
      <KitSales lang={lang} slug="sheet-app" name={t.name} linkKey={LINK} copy={t.sales} />
      <KitClose slug="sheet-app" lang={lang} made={t.made} compare={false} />
    </ProjectShell>
  );
}
