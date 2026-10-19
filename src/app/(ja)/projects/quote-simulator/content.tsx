/*
 * THESIS: 選ぶと、その場で金額が出る。だから 1 画面目は電卓そのもの（売り物のキットのページの型。手本は ../deadline）。
 *   頭: 題は検索語（料金シミュレーター）、品物の名は題の下。右に購入の箱（KitOffer）。スマホは下の帯（KitBuyBar）。
 *   1 画面目: 頭のすぐ下に無料の電卓（基本の計算だけ）。
 *   そのあと: お求めいただく版で増えるもの（実物の画面と見積書の写し）→ 証拠 → 誰向け → 比較 → 値段（設置込み・領収書）→ つまずき → 更新とご利用の範囲
 * COLOR: 電卓の中の朱は「選ばれていること」の印だけ（components/quote-simulator）。紙の側は方眼（DESIGN.md）。
 * TRUTH: 「増えるもの」の画像は、お求めいただく版（1.1.1）を設定の例で動かして撮った実物。見せかけの画面を描かない。
 */
import { QuoteSimulator } from "@/components/quote-simulator/QuoteSimulator";
import type { Lang } from "@/i18n/routes";

import g from "../../guides/guides.module.css";
import { DemoLabel } from "../demo-label";
import p from "../kit-parts.module.css";
import { KitBuyBar, KitOffer, KitSales } from "../kit-parts";
import { DemoNote, ProjectShell, PurchaseNote, ShopEmbed, projectMetadata } from "../shell";
import { copy } from "./copy";
import q from "./quote.module.css";

/** BOOTH・note の鍵（links.json） */
const LINK = "s1";

/** お求めいただく版の写し（public/projects/。scratchpad で 1.1.1 を動かして撮った） */
const FIGURES = [
  { src: "/projects/quote-simulator-calc", width: 960, height: 590 },
  { src: "/projects/quote-simulator-sheet", width: 960, height: 749 },
];

export const metadataFor = (lang: Lang) => projectMetadata(lang, "quote-simulator", copy[lang].meta);

export function Content({ lang }: { lang: Lang }) {
  const t = copy[lang];
  return (
    <ProjectShell
      lang={lang}
      slug="quote-simulator"
      title={t.title}
      name={t.name}
      latin="Quote"
      lede={t.lede}
      aside={<KitOffer lang={lang} slug="quote-simulator" linkKey={LINK} />}
      bar={<KitBuyBar lang={lang} slug="quote-simulator" linkKey={LINK} />}
    >
      <DemoLabel lang={lang} />
      <DemoNote lang={lang} />
      <QuoteSimulator />

      <section className={p.section} aria-labelledby="paid">
        <h2 id="paid" className={p.h2}>
          {t.paid.heading}
        </h2>
        <p className={p.body}>{t.paid.intro}</p>
        <ul className={p.list}>
          {t.paid.list.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <div className={`${p.pair} ${q.figures}`}>
          {FIGURES.map((f, i) => (
            <figure key={f.src} className={`${p.cell} ${q.figure}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${f.src}-960.webp`}
                srcSet={`${f.src}-480.webp 480w, ${f.src}-960.webp 960w`}
                sizes="(min-width: 768px) 560px, 100vw"
                width={f.width}
                height={f.height}
                loading="lazy"
                decoding="async"
                alt={t.paid.figures[i].alt}
              />
              <figcaption className={p.small}>{t.paid.figures[i].caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <KitSales lang={lang} slug="quote-simulator" name={t.name} linkKey={LINK} copy={t.sales} />

      <section className={g.section}>
        <h2 className={g.heading}>{t.closeHeading}</h2>
        <p className={g.text}>{t.close}</p>
        <ShopEmbed linkKey={LINK} />
        <PurchaseNote lang={lang} className={g.text} />
      </section>
    </ProjectShell>
  );
}
