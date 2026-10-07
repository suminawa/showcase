/*
 * 画面の見本をこの紙に置けないキット（LINE の中・スプレッドシートの中・手元の端末で動くもの、
 * 中身がほかの紙にあるもの）の作品ページ。料紙の頭（ProjectShell）の下に、
 * 一行の前置き → 見本（あるキットだけ。children）→ 節（できること・入っているもの…）→ 値段と売り場。
 * 節の字と箇条は悩みから読む紙と同じ（guides.module.css）。
 * 値段は projects.ts の sale.price（発売記念の期間中は prices.ts の表）から、要求のたびに組む。
 */
import { projectPriceNow } from "@/i18n/catalog";
import type { Lang } from "@/i18n/routes";
import { listOf, longDate, money } from "@/i18n/ui";
import type { LinkKey } from "@/lib/go";

import g from "../guides/guides.module.css";
import {
  ProjectShell,
  PurchaseNote,
  ShopEmbed,
  ShopLinks,
  projectMetadata,
  type PageMeta,
} from "./shell";
import s from "./projects.module.css";

export type KitSection = { heading: string; text?: string[]; list?: string[] };

export type KitCopy = {
  meta: PageMeta;
  title: string;
  lede: string;
  intro: string;
  sections: KitSection[];
  buyHeading: string;
  /** 値段の一文のあと、売り場への道の前に置く一文 */
  buy: string;
  /** 設定ごと頼めるときの一文（あるキットだけ） */
  service?: string;
};

export const kitMetadata = (lang: Lang, slug: string, copy: KitCopy) =>
  projectMetadata(lang, slug, copy.meta);

function priceSentence(lang: Lang, slug: string): string {
  const p = projectPriceNow(slug);
  const list = money(lang, listOf(p));
  if (lang === "en") {
    return `${list} (tax included), one-time purchase.${p.intro ? ` Launch price ${money(lang, p.price)} until ${longDate(lang, p.intro.until)}.` : ""}`;
  }
  if (lang === "fr") {
    return `${list} TTC, achat unique.${p.intro ? ` Prix de lancement ${money(lang, p.price)} jusqu’au ${longDate(lang, p.intro.until)}.` : ""}`;
  }
  return `${list}（税込）の買い切りです。${p.intro ? `${longDate(lang, p.intro.until)}までは発売記念の ${money(lang, p.price)} です。` : ""}`;
}

export function KitSheet({
  lang,
  slug,
  latin,
  linkKey,
  copy: t,
  children,
}: {
  lang: Lang;
  slug: string;
  latin: string;
  linkKey: LinkKey;
  copy: KitCopy;
  /** 見本（ほかの紙にある実物への道、記録の再生の写しなど）。無いキットは置かない */
  children?: React.ReactNode;
}) {
  return (
    <ProjectShell
      lang={lang}
      slug={slug}
      title={t.title}
      latin={latin}
      lede={t.lede}
    >
      <p className={s.lede}>{t.intro}</p>
      {children}
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
        <h2 className={g.heading}>{t.buyHeading}</h2>
        <p className={g.text}>
          {priceSentence(lang, slug)}
          {t.buy}
          <ShopLinks lang={lang} slug={slug} linkKey={linkKey} />
        </p>
        <ShopEmbed linkKey={linkKey} />
        <PurchaseNote lang={lang} className={g.text} />
        {t.service && <p className={g.text}>{t.service}</p>}
      </section>
    </ProjectShell>
  );
}
