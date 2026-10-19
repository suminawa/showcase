/*
 * THESIS: 予約という実務を、お客さまが触る画面そのもので見せる（Operate）。売り物のキットのページの型（kit-parts.tsx。手本は deadline）。
 *   頭: 題は検索語と差（定員つきの予約ページを、月額 0 円で）、品物の名は題の下。右に購入の箱（KitOffer）。
 *   1 画面目: 頭のすぐ下に見本。スマホは値段と 2 つの押す先を下の帯（KitBuyBar）に。
 *   見本のあと: 流れと選べること → 証拠 → 誰向け → 比較 → 値段（設置込み・領収書）→ つまずき（KitSales）→ 結び（KitClose。比較は KitSales に任せる）
 * OWN-WORLD: 頭と枠は方眼（DESIGN.md）。見本の中だけは別の世界で、色も字もキットの画面自身が持つ（--bk-*）──
 *   お客さまに届く画面の色は、キットの色のまま見せる。
 * このページはサーバー部品のまま。道具（Tool）は "use client" のこの下だけに閉じる。
 */
import { KitClose } from "@/components/kit-demo/KitClose";
import type { Lang } from "@/i18n/routes";

import { DemoLabel } from "../demo-label";
import { KitBuyBar, KitOffer, KitSales } from "../kit-parts";
import { ProjectShell, projectMetadata } from "../shell";
import sh from "../shell.module.css";
import f from "./booking.module.css";
import { copy } from "./copy";
import { Tool } from "./Tool";

/** BOOTH・note の鍵（links.json。kit-demos.ts の linkKey と同じ） */
const LINK = "booking";

export const metadataFor = (lang: Lang) =>
  projectMetadata(lang, "booking", copy[lang].meta);

export function Content({ lang }: { lang: Lang }) {
  const t = copy[lang];
  return (
    <ProjectShell
      lang={lang}
      slug="booking"
      title={t.title}
      name={t.name}
      latin="Booking"
      lede={t.lede}
      aside={<KitOffer lang={lang} slug="booking" linkKey={LINK} />}
      bar={<KitBuyBar lang={lang} slug="booking" linkKey={LINK} />}
    >
      <DemoLabel lang={lang} />
      <p className={sh.body}>{t.intro}</p>
      {/* 道具の中だけは自前の色と字を持つ。その根がこの一枚 */}
      <div className={f.tool}>
        <Tool />
      </div>
      <div className={sh.prose}>
        <p className={sh.body}>{t.flow}</p>
        <p className={sh.body}>{t.options}</p>
      </div>
      <KitSales lang={lang} slug="booking" name={t.name} linkKey={LINK} copy={t.sales} />
      <KitClose slug="booking" lang={lang} compare={false} />
    </ProjectShell>
  );
}
