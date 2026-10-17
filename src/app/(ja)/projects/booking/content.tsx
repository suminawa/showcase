/*
 * THESIS: 予約という実務を、お客さまが触る画面そのもので見せる（Operate）。頭の右に購入の箱。
 * OWN-WORLD: 頭と枠は方眼（DESIGN.md）。見本の中だけは別の世界で、色も字もキットの画面自身が持つ（--bk-*）──
 *   お客さまに届く画面の色は、キットの色のまま見せる。
 * STORY: 空きカレンダーで日を選ぶと時間が出て、名前と連絡先を入れ、確認して予約が済む。
 *   予約が月 50 件を超えても月額はかからない（帳票と比べ方）。
 * FIRST VIEWPORT: 現在地・題・一行、右に値段と BOOTH と帳票。その下に見本の頭。
 * このページはサーバー部品のまま。道具（Tool）は "use client" のこの下だけに閉じる。
 */
import { KitBuy, KitClose, KitFacts } from "@/components/kit-demo/KitClose";
import type { Lang } from "@/i18n/routes";

import { DemoLabel } from "../demo-label";
import { ProjectShell, projectMetadata } from "../shell";
import sh from "../shell.module.css";
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
      aside={<KitBuy slug="booking" lang={lang} />}
      head={<KitFacts slug="booking" lang={lang} />}
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
        <p className={sh.body}>{t.setup}</p>
      </div>
      <KitClose slug="booking" lang={lang} />
    </ProjectShell>
  );
}
