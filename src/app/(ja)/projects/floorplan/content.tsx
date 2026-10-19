/*
 * THESIS: マス目を塗ると部屋になり、置いた家具がそのまま 3D に映る。だから 1 画面目は道具そのもの
 *   （売り物のキットのページの型。手本は ../deadline）。
 *   頭: 題は検索語（自社サイトに置ける 3D の間取りシミュレーター）、品物の名は題の下。右に購入の箱（KitOffer）。スマホは下の帯（KitBuyBar）。
 *   1 画面目: 頭のすぐ下に 3D と間取り図（見本）。
 *   そのあと: お求めいただく版で増えるもの（実物の画面）→ 証拠 → 誰向け → 比較 → 値段（設置込み・領収書）→ つまずき → 更新とご利用の範囲
 * OWN-WORLD: 道具の中だけは自前の色と字を持つ（--d-*。floorplan.module.css）。額装が変わっても、掛かっている図面は変わらない。
 * TRUTH: 「増えるもの」の画像は、お求めいただく版（1.0.1）に同梱の見本の間取りを読ませて撮った実物。
 * このページはサーバー部品のまま。three.js は Viewer の中で、この画面だけに読み込む。
 */
import { Viewer } from "@/components/demos/viewer/Viewer";
import type { Lang } from "@/i18n/routes";

import g from "../../guides/guides.module.css";
import { DemoLabel } from "../demo-label";
import p from "../kit-parts.module.css";
import { KitBuyBar, KitOffer, KitSales } from "../kit-parts";
import { AFTER_TOOL, DemoNote, ProjectShell, PurchaseNote, ShopEmbed, projectMetadata } from "../shell";
import s from "../projects.module.css";
import { copy } from "./copy";
import f from "./floorplan.module.css";

/** BOOTH・note の鍵（links.json） */
const LINK = "floorplan";

/** お求めいただく版の写し（public/projects/。scratchpad で 1.0.1 の page/ に samples/house-72.json を読ませて撮った） */
const FIGURE = { src: "/projects/floorplan-product", width: 960, height: 382 };

export const metadataFor = (lang: Lang) => projectMetadata(lang, "floorplan", copy[lang].meta);

export function Content({ lang }: { lang: Lang }) {
  const t = copy[lang];
  return (
    <ProjectShell
      lang={lang}
      slug="floorplan"
      title={t.title}
      name={t.name}
      latin="Floor Plan"
      lede={t.lede}
      aside={<KitOffer lang={lang} slug="floorplan" linkKey={LINK} />}
      bar={<KitBuyBar lang={lang} slug="floorplan" linkKey={LINK} />}
    >
      <DemoLabel lang={lang} />
      <DemoNote lang={lang} />
      {/* 道具の中だけは自前の色と字を持つ。その根がこの一枚 */}
      <div className={f.tool}>
        <Viewer />
      </div>
      <p className={s.lede} style={AFTER_TOOL}>
        {t.how}
      </p>

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
        <figure className={`${p.cell} ${f.figure}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${FIGURE.src}-960.webp`}
            srcSet={`${FIGURE.src}-480.webp 480w, ${FIGURE.src}-960.webp 960w`}
            sizes="(min-width: 1024px) 960px, 100vw"
            width={FIGURE.width}
            height={FIGURE.height}
            loading="lazy"
            decoding="async"
            alt={t.paid.alt}
          />
          <figcaption className={p.small}>{t.paid.caption}</figcaption>
        </figure>
      </section>

      <KitSales lang={lang} slug="floorplan" name={t.name} linkKey={LINK} copy={t.sales} />

      <section className={g.section}>
        <h2 className={g.heading}>{t.closeHeading}</h2>
        <p className={g.text}>{t.close}</p>
        <ShopEmbed linkKey={LINK} />
        <PurchaseNote lang={lang} className={g.text} />
      </section>
    </ProjectShell>
  );
}
