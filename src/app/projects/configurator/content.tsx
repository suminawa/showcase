/*
 * THESIS: 料紙の上に、商品を一つ置く（Operate）。色・素材・パーツ・刻印を選ぶと、
 *   3D の商品と価格がその場で変わる。見積もりシミュレーターと同じ構えで、紙は退き、道具だけが載る。
 * OWN-WORLD: 頭（戻り・名乗り・一行）は料紙の文法そのまま。道具の中だけは別の世界で、
 *   色も字も道具自身が持つ（--pc-*）。
 * COLOR: 紙の側で色を持つのは朱の落款ひとつだけ。
 * STORY: 選ぶたびに商品が変わり、選んだ内容は JSON・PNG・共有 URL で持ち出せる。
 *   結びの下に「Shopify 版」の節（#shopify）。売り物に同梱の架空の商品ページを枠で見せる。
 * FORM: 料紙（作品ページ）— 文法は DESIGN.md
 * このページはサーバー部品のまま。three.js は Tool の中で、この画面だけに読み込む。
 */
import "@suminawa/product-configurator/styles.css";

import { projectPriceNow } from "@/i18n/catalog";
import type { Lang } from "@/i18n/routes";

import { AFTER_TOOL, DemoNote, ProjectShell, PurchaseNote, ShopLinks, projectMetadata } from "../shell";
import s from "../projects.module.css";
import c from "./configurator.module.css";
import { copy } from "./copy";
import { ShopifyFrame } from "./ShopifyFrame";
import { Tool } from "./Tool";

/** Shopify 版の見本。売り物に同梱の page/mock-product.html を、並びごと public/demos/shopify-configurator/ に写してある */
const SHOPIFY_DEMO_SRC = "/demos/shopify-configurator/page/mock-product.html";

export const metadataFor = (lang: Lang) => projectMetadata(lang, "configurator", copy[lang].meta);

export function Content({ lang }: { lang: Lang }) {
  const t = copy[lang];
  return (
    <ProjectShell lang={lang} slug="configurator" title={t.title} latin="Configurator" lede={t.lede}>
      <DemoNote lang={lang} />
      <Tool />
      <p className={s.lede} style={AFTER_TOOL}>
        {t.how}
      </p>
      <p className={s.lede}>
        {t.kit(projectPriceNow("configurator"))}
        <ShopLinks lang={lang} slug="configurator" linkKey="configurator" />
      </p>
      <PurchaseNote lang={lang} />

      {/* Shopify 版。売り物に同梱の架空の商品ページを、そのまま枠で見せる */}
      <section id="shopify" className={c.shopify} aria-labelledby="shopify-heading">
        <h2 id="shopify-heading" className={c.heading}>
          {t.shopifyHeading}
        </h2>
        <p className={s.lede}>{t.shopifyAbout}</p>
        <p className={s.lede}>{t.shopifyDemo}</p>
        <ShopifyFrame src={SHOPIFY_DEMO_SRC} />
        <p className={s.lede}>
          {t.shopifyStatus}{" "}
          <a href={SHOPIFY_DEMO_SRC} className={s.textLink} target="_blank" rel="noopener">
            {t.shopifyOpen}
          </a>
        </p>
      </section>
    </ProjectShell>
  );
}
