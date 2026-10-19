/*
 * THESIS: 料紙の上に、窓を一つだけ開ける（Operate）。ここにある読み取りは見本ではなく実物で、
 *   同梱の書類 5 枚も、お手元の書類も、その場で読み取れる（AI は中継を通して呼ぶ）。見せかけの成功を作らない。
 *   売り物のキットの型（kit-parts.tsx。手本は /projects/deadline）:
 *   頭: 題は検索語（請求書・領収書・スプレッドシート）と差（確認してから出す）、品物の名は題の下。右に購入の箱、スマホは下の帯。
 *   1 画面目: 頭のすぐ下に読み取りの実物。そのあと 証拠 → 誰向け → 比較 → 値段（設置込み・領収書）→ つまずき → 結び。
 * FORM: 料紙（作品ページ）— 文法は DESIGN.md。窓の中は部品の文法（doc-reader.module.css の --dr-* だけ料紙に寄せる）。
 * COLOR: 朱は落款だけ。窓の中に選ぶ行為が無いので、朱は一切使わない。
 */
import type { Lang } from "@/i18n/routes";

import { KitBuyBar, KitOffer, KitSales } from "../kit-parts";
import {
  AFTER_TOOL,
  ContactLine,
  DemoNote,
  ProjectShell,
  PurchaseNote,
  ShopEmbed,
  ShopLinks,
  projectMetadata,
} from "../shell";
import s from "../projects.module.css";
import { copy } from "./copy";
import { DocReaderDemo } from "./DocReaderDemo";

/** BOOTH・note の鍵（links.json） */
const LINK = "doc-reader";

export const metadataFor = (lang: Lang) =>
  projectMetadata(lang, "doc-reader", copy[lang].meta);

export function Content({ lang }: { lang: Lang }) {
  const t = copy[lang];
  return (
    <ProjectShell
      lang={lang}
      slug="doc-reader"
      title={t.title}
      name={t.name}
      latin="Document Reader"
      lede={t.lede}
      aside={<KitOffer lang={lang} slug="doc-reader" linkKey={LINK} />}
      bar={<KitBuyBar lang={lang} slug="doc-reader" linkKey={LINK} />}
    >
      <DemoNote lang={lang} />
      <DocReaderDemo />

      <p className={s.lede} style={AFTER_TOOL}>
        {t.privacy}
      </p>

      <KitSales lang={lang} slug="doc-reader" name={t.name} linkKey={LINK} copy={t.sales} />

      <p className={s.lede} style={AFTER_TOOL}>
        {t.kit}
        <ShopLinks lang={lang} slug="doc-reader" linkKey={LINK} />
      </p>
      <ShopEmbed linkKey={LINK} />
      <PurchaseNote lang={lang} />
      <ContactLine lang={lang} />
    </ProjectShell>
  );
}
