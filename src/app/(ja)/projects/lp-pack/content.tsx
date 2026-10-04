/*
 * 中身は見本サイト 6 本そのもの。紙の上に新しい見本は作らず、このサイトの 6 本（/demos/*）と一覧（/sites）へ渡す。
 * FORM: 料紙（作品ページ）— 文法は DESIGN.md。組み方は ../kit-sheet.tsx
 */
import Link from "next/link";

import { localProject } from "@/i18n/catalog";
import { hrefFor, type Lang } from "@/i18n/routes";
import { projectHref, projectsByCategory } from "@/lib/projects";

import g from "../../guides/guides.module.css";
import { KitSheet, kitMetadata } from "../kit-sheet";
import s from "../projects.module.css";
import { copy } from "./copy";

export const metadataFor = (lang: Lang) => kitMetadata(lang, "lp-pack", copy[lang]);

export function Content({ lang }: { lang: Lang }) {
  const t = copy[lang];
  // 見本は日本語の紙だけ。英仏の紙からは hreflang="ja" を添えて渡す
  const hrefLang = lang === "ja" ? undefined : "ja";
  return (
    <KitSheet lang={lang} slug="lp-pack" latin="LP Template Pack" linkKey="lp" copy={t}>
      <section className={g.section}>
        <h2 className={g.heading}>{t.demoHeading}</h2>
        <p className={g.text}>{t.demo}</p>
        <ul className={g.list}>
          {projectsByCategory("sites").map((p) => {
            const site = localProject(lang, p);
            return (
              <li key={p.slug}>
                <Link href={projectHref(p)} className={s.textLink} hrefLang={hrefLang}>
                  {site.title}
                </Link>
                {" ── "}
                {site.description}
              </li>
            );
          })}
        </ul>
        <p className={g.text}>
          <Link href={hrefFor(lang, "/sites")} className={s.textLink}>
            {t.allSamples}
          </Link>
        </p>
      </section>
    </KitSheet>
  );
}
