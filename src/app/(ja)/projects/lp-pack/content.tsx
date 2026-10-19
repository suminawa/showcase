/*
 * THESIS: 中身は見本サイト 6 本そのもの。だから 1 画面目は 6 本の実画面と、値段と 2 つの押す先（売り物のキットのページの型。手本は ../deadline）。
 *   頭: 題は検索語（業種別の LP テンプレ 6 本、日本語の文言入り）、品物の名は題の下。右に購入の箱（KitOffer）。スマホは下の帯（KitBuyBar）。
 *   1 画面目: 頭のすぐ下に見本 6 本の帯（押すと /demos/* が開く）。紙の上に新しい見本は作らない。
 *   そのあと: 証拠 → 誰向け → 比較 → 値段（制作込み・領収書）→ つまずき（KitSales）→ テンプレの中身 → 更新とご利用の範囲
 * FORM: 方眼（DESIGN.md）。帯はセルの範囲、触れると選択の枠（朱）。
 */
import Link from "next/link";

import u from "@/components/site/ui.module.css";
import { localProject } from "@/i18n/catalog";
import { hrefFor, type Lang } from "@/i18n/routes";
import { UI } from "@/i18n/ui";
import { projectHref, projectsByCategory } from "@/lib/projects";

import g from "../../guides/guides.module.css";
import { KitBuyBar, KitOffer, KitSales } from "../kit-parts";
import { ProjectShell, PurchaseNote, ShopEmbed, projectMetadata } from "../shell";
import { copy } from "./copy";
import l from "./lp-pack.module.css";

/** BOOTH・note の鍵（links.json） */
const LINK = "lp";

export const metadataFor = (lang: Lang) => projectMetadata(lang, "lp-pack", copy[lang].meta);

export function Content({ lang }: { lang: Lang }) {
  const t = copy[lang];
  // 見本は日本語の紙だけ。英仏の紙からは hreflang="ja" を添えて渡す
  const hrefLang = lang === "ja" ? undefined : "ja";
  return (
    <ProjectShell
      lang={lang}
      slug="lp-pack"
      title={t.title}
      name={t.name}
      latin="LP Template Pack"
      lede={t.lede}
      aside={<KitOffer lang={lang} slug="lp-pack" linkKey={LINK} />}
      bar={<KitBuyBar lang={lang} slug="lp-pack" linkKey={LINK} />}
    >
      <section className={l.samples} aria-label={t.samples}>
        <ul className={l.strip}>
          {projectsByCategory("sites").map((p) => {
            const site = localProject(lang, p);
            return (
              <li key={p.slug} className={`${l.item} ${u.select}`}>
                <Link href={projectHref(p)} hrefLang={hrefLang}>
                  {/* 実画面の切り抜き（scripts/site-cards.mjs）。1 画面目なので先に読む */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/sites/${p.slug}-480.webp`} width={480} height={360} alt={UI[lang].figureAlt(site.title)} />
                  <span className={l.label}>{site.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        <p className={l.all}>
          <Link href={hrefFor(lang, "/sites")} className={u.linkLine}>
            {t.allSamples}
          </Link>
        </p>
      </section>

      <KitSales lang={lang} slug="lp-pack" name={t.name} linkKey={LINK} copy={t.sales} />

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
        <h2 className={g.heading}>{t.closeHeading}</h2>
        <p className={g.text}>{t.close}</p>
        <ShopEmbed linkKey={LINK} />
        <PurchaseNote lang={lang} className={g.text} />
      </section>
    </ProjectShell>
  );
}
