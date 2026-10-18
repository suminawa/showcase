/*
 * 一覧のページ（/sites・/works・/guides）の共通の部品（方眼。DESIGN.md）。
 *   CatalogPage  頭（題・一行・添え）→ 並び → 結び（相談の段。UI の closeText / closeCta）
 *   CatalogRows  帳票の並び。行番号のマス・題・一行・札。行ごと押せる。写真を持たない品物と案内記事に使う
 * 写真を持つ見本サイトは KitCard の並び（KitGrid）を children に置く。
 */
import Link from "next/link";

import { hrefFor, type Lang } from "@/i18n/routes";
import { UI } from "@/i18n/ui";

import c from "./catalog-page.module.css";
import u from "./ui.module.css";

export function CatalogPage({
  lang,
  title,
  lede,
  note,
  children,
}: {
  lang: Lang;
  title: string;
  lede: string;
  /** 一行の下に添える小さな一文（売り場の断りなど） */
  note?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main id="main" className={c.page}>
      <header className={`${u.wrap} ${c.head}`}>
        <h1 className={c.title}>{title}</h1>
        <p className={u.lede}>{lede}</p>
        {note && <p className={u.small}>{note}</p>}
      </header>
      <div className={`${u.wrap} ${c.body}`}>{children}</div>
      <section className={c.close} aria-labelledby="catalog-close">
        <div className={`${u.wrap} ${c.closeInner}`}>
          <h2 id="catalog-close" className={u.h2}>
            {UI[lang].closeText}
          </h2>
          <Link href={hrefFor(lang, "/contact")} className={u.btn}>
            {UI[lang].closeCta}
          </Link>
        </div>
      </section>
    </main>
  );
}

export type CatalogRow = {
  href: string;
  title: string;
  description: string;
  tags?: string[];
  /** 訳の無い紙（日本語だけ）へ渡す行は "ja" */
  hrefLang?: string;
};

export function CatalogRows({ rows, label }: { rows: CatalogRow[]; label: string }) {
  return (
    <ol className={c.rows} aria-label={label}>
      {rows.map((row, i) => (
        <li key={row.href} className={u.select}>
          <Link href={row.href} className={c.row} hrefLang={row.hrefLang}>
            <span className={c.rowNo} aria-hidden="true">
              {i + 1}
            </span>
            <span className={c.rowBody}>
              <span className={c.rowTitle}>{row.title}</span>
              <span className={c.rowDesc}>{row.description}</span>
              {row.tags && row.tags.length > 0 && <span className={c.rowTags}>{row.tags.join(" ・ ")}</span>}
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
