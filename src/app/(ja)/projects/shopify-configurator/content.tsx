/*
 * THESIS: Shopify 標準の 3D との差（選ぶと 3D と価格が変わり、注文に残る）を先に触らせる（Operate）。
 *   売り物のキットのページの型（kit-parts.tsx。手本は deadline）。
 *   頭: 題は検索語（Shopify で名入れ商品を 3D で見せて売る）、品物の名は題の下。右に購入の箱（KitOffer。BOOTH 8921194 への道）。
 *   1 画面目: 頭のすぐ下に見本の商品ページ（同梱の page/mock-product.html の写し）を、店の頭を枠の上に隠して 3D から見せる
 *     （ShopifyFrame の crop。中の紙は 1 字も変えない）。英仏は見本も英語の表示（?lang=en）で開く。
 *     スマホは右の箱を出さず、値段と 2 つの押す先を下の帯（KitBuyBar）に。
 *   見本のあと: 2 択（Shopify を使わない方は 3D 商品コンフィギュレーターへ）→ 証拠 → 誰向け → 比較 → 値段（設置込み・領収書）
 *     → つまずき（KitSales）→ 中身の節 → 設置の代行 → note
 * FORM: 方眼（DESIGN.md）。節の字は悩みから読む紙と同じ（guides.module.css）
 */
import Link from "next/link";

import { projectPriceNow } from "@/i18n/catalog";
import { hrefFor, type Lang } from "@/i18n/routes";
import { money } from "@/i18n/ui";

import g from "../../guides/guides.module.css";
import { SHOPIFY_DEMO_SRC } from "../configurator/content";
import { ShopifyFrame } from "../configurator/ShopifyFrame";
import { KitBuyBar, KitOffer, KitSales } from "../kit-parts";
import { ProjectShell, ShopEmbed, projectMetadata } from "../shell";
import s from "../projects.module.css";
import { copy } from "./copy";
import c from "./shopify-configurator.module.css";

/** BOOTH（8921194）・note の鍵（links.json） */
const LINK = "shopify-configurator";

export const metadataFor = (lang: Lang) => projectMetadata(lang, "shopify-configurator", copy[lang].meta);

export function Content({ lang }: { lang: Lang }) {
  const t = copy[lang];
  // 英仏の紙では、見本も英語の表示で開く（見本の店の頭の「English」と同じ）
  const src = lang === "ja" ? SHOPIFY_DEMO_SRC : `${SHOPIFY_DEMO_SRC}?lang=en`;
  return (
    <ProjectShell
      lang={lang}
      slug="shopify-configurator"
      title={t.title}
      name={t.name}
      latin="Shopify Configurator"
      lede={t.lede}
      aside={<KitOffer lang={lang} slug="shopify-configurator" linkKey={LINK} />}
      bar={<KitBuyBar lang={lang} slug="shopify-configurator" linkKey={LINK} />}
    >
      <p className={c.demoNote}>{t.demoNote}</p>
      <ShopifyFrame src={src} crop />
      <p className={c.after}>
        {t.choice.before}
        <Link href={hrefFor(lang, "/projects/configurator")} className={s.textLink}>
          {t.choice.link}
        </Link>
        {t.choice.after(money(lang, projectPriceNow("configurator").price))}
      </p>
      <p className={c.links}>
        <a href={src} className={s.textLink} target="_blank" rel="noopener">
          {t.open}
        </a>
        {" / "}
        <Link href={hrefFor(lang, "/projects/configurator#shopify")} className={s.textLink}>
          {t.samePage}
        </Link>
      </p>

      <KitSales lang={lang} slug="shopify-configurator" name={t.name} linkKey={LINK} copy={t.sales} />

      {t.sections.map((sec) => (
        <section key={sec.heading} className={g.section}>
          <h2 className={g.heading}>{sec.heading}</h2>
          {sec.text?.map((p) => (
            <p key={p} className={g.text}>
              {p}
            </p>
          ))}
          {sec.list && (
            <ul className={g.list}>
              {sec.list.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
      <section className={g.section}>
        <h2 className={g.heading}>{t.serviceHeading}</h2>
        <p className={g.text}>{t.service}</p>
        <ShopEmbed linkKey={LINK} />
      </section>
    </ProjectShell>
  );
}
