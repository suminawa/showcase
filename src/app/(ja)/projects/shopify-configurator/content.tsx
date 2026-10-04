/*
 * 見本は 3D 商品コンフィギュレーターの紙の「Shopify 版」の節と同じもの（売り物に同梱の page/mock-product.html の写し）。
 * 新しい見本は作らず、同じ枠（ShopifyFrame）で同じ紙を見せ、節への道も添える。
 * FORM: 料紙（作品ページ）— 文法は DESIGN.md。組み方は ../kit-sheet.tsx
 */
import Link from "next/link";

import { hrefFor, type Lang } from "@/i18n/routes";

import g from "../../guides/guides.module.css";
import { SHOPIFY_DEMO_SRC } from "../configurator/content";
import { ShopifyFrame } from "../configurator/ShopifyFrame";
import { KitSheet, kitMetadata } from "../kit-sheet";
import { DemoNote } from "../shell";
import s from "../projects.module.css";
import { copy } from "./copy";

export const metadataFor = (lang: Lang) => kitMetadata(lang, "shopify-configurator", copy[lang]);

export function Content({ lang }: { lang: Lang }) {
  const t = copy[lang];
  return (
    <KitSheet lang={lang} slug="shopify-configurator" latin="Shopify Configurator" linkKey="shopify-configurator" copy={t}>
      <section className={g.section}>
        <h2 className={g.heading}>{t.demoHeading}</h2>
        <DemoNote lang={lang} />
        {t.demo.map((p) => (
          <p key={p} className={g.text}>
            {p}
          </p>
        ))}
        <ShopifyFrame src={SHOPIFY_DEMO_SRC} />
        <p className={g.text}>
          <Link href={hrefFor(lang, "/projects/configurator#shopify")} className={s.textLink}>
            {t.samePage}
          </Link>
          {" / "}
          <a href={SHOPIFY_DEMO_SRC} className={s.textLink} target="_blank" rel="noopener">
            {t.open}
          </a>
        </p>
      </section>
    </KitSheet>
  );
}
