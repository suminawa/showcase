/*
 * THESIS: 選ぶと 3D と価格が変わる、を先に触らせる（Operate）。売り物のキットのページの型（kit-parts.tsx。手本は deadline）。
 *   頭: 題は検索語と差（色・刻印を選ぶと、3D と価格が変わる商品ページ部品）、品物の名は題の下。右に購入の箱（KitOffer）。
 *   頭の下に 2 択の一行（Shopify に置く方は Shopify 版へ。スマホは見本の下）。
 *   1 画面目: 頭のすぐ下に 3D の見本。PC は見本の 3D が左・選択肢が右で、頭の題と購入の箱の列にそろう。
 *     スマホは右の箱を出さず、3D を題のすぐ下に、値段と 2 つの押す先を下の帯（KitBuyBar）に。
 *   見本のあと: 証拠 → 誰向け → 比較 → 値段（設置込み・領収書）→ つまずき（KitSales）→ note → Shopify 版の節（#shopify）
 * OWN-WORLD: 道具の中だけは別の世界で、色も字も道具自身が持つ（--pc-*。configurator.module.css）。
 * FORM: 方眼（DESIGN.md）
 * このページはサーバー部品のまま。three.js は Tool の中で、この画面だけに読み込む。
 */
import "@suminawa/product-configurator/styles.css";

import Link from "next/link";

import { projectPriceNow } from "@/i18n/catalog";
import { hrefFor, type Lang } from "@/i18n/routes";
import { money } from "@/i18n/ui";

import { KitBuyBar, KitOffer, KitSales } from "../kit-parts";
import { AFTER_TOOL, DemoNote, ProjectShell, ShopEmbed, ShopLinks, projectMetadata } from "../shell";
import s from "../projects.module.css";
import c from "./configurator.module.css";
import { copy } from "./copy";
import { ShopifyFrame } from "./ShopifyFrame";
import { Tool } from "./Tool";

/** BOOTH・note の鍵（links.json） */
const LINK = "configurator";

/** Shopify 版の見本。売り物に同梱の page/mock-product.html を、並びごと public/demos/shopify-configurator/ に写してある */
export const SHOPIFY_DEMO_SRC = "/demos/shopify-configurator/page/mock-product.html";

export const metadataFor = (lang: Lang) => projectMetadata(lang, "configurator", copy[lang].meta);

/**
 * 2 択の一行（Shopify に置く方は Shopify 版へ）。PC は頭の題の下、スマホは 3D を題のすぐ下に出すため見本の下に置く
 * （同じ一行を 2 か所に置き、CSS でどちらか一方だけを出す）
 */
function Choice({ lang, price, className }: { lang: Lang; price: string; className: string }) {
  const t = copy[lang].choice;
  return (
    <p className={className}>
      {t.before}
      <Link href={hrefFor(lang, "/projects/shopify-configurator")} className={s.textLink}>
        {t.link}
      </Link>
      {t.after(price)}
    </p>
  );
}

export function Content({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const shopifyPrice = money(lang, projectPriceNow("shopify-configurator").price);
  return (
    <ProjectShell
      lang={lang}
      slug="configurator"
      title={t.title}
      name={t.name}
      latin="Configurator"
      lede={t.lede}
      head={<Choice lang={lang} price={shopifyPrice} className={c.choiceHead} />}
      aside={<KitOffer lang={lang} slug="configurator" linkKey={LINK} />}
      bar={<KitBuyBar lang={lang} slug="configurator" linkKey={LINK} />}
    >
      <DemoNote lang={lang} />
      <Tool />
      <Choice lang={lang} price={shopifyPrice} className={c.choiceAfter} />
      <p className={s.lede} style={AFTER_TOOL}>
        {t.how}
      </p>

      <KitSales lang={lang} slug="configurator" name={t.name} linkKey={LINK} copy={t.sales} />
      <ShopEmbed linkKey={LINK} />

      {/* Shopify 版。売り物に同梱の架空の商品ページを、そのまま枠で見せる */}
      <section id="shopify" className={c.shopify} aria-labelledby="shopify-heading">
        <h2 id="shopify-heading" className={c.heading}>
          {t.shopifyHeading}
        </h2>
        <p className={s.lede}>{t.shopifyAbout}</p>
        <p className={s.lede}>{t.shopifyDemo}</p>
        <ShopifyFrame src={SHOPIFY_DEMO_SRC} />
        <p className={s.lede}>
          {t.shopifyStatus(shopifyPrice)}
          <ShopLinks lang={lang} slug="configurator" linkKey="shopify-configurator" />
          {" / "}
          <a href={SHOPIFY_DEMO_SRC} className={s.textLink} target="_blank" rel="noopener">
            {t.shopifyOpen}
          </a>
          {" / "}
          <Link href={hrefFor(lang, "/projects/shopify-configurator")} className={s.textLink}>
            {t.shopifyPage}
          </Link>
        </p>
      </section>
    </ProjectShell>
  );
}
