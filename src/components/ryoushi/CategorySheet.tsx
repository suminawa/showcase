/*
 * 分類のページ（/kits・/sites・/works）の紙。日本語のページと英仏のページ（[lang]）が同じものを描く。
 * 英仏の /kits だけ、末尾に悩みから読む紙（guides、日本語のみ）の行を添える。
 * 日本語の /kits は、各行の下に結びつく案内記事への道を添える。
 */
import { CATALOG, localGuides, localIndexPage, localPillarName } from "@/i18n/catalog";
import { localePath, type Lang } from "@/i18n/routes";
import { guideHref } from "@/lib/guides";
import { PILLARS, pillarKits, projectsByCategory, type Category, type Project } from "@/lib/projects";

import { Rows } from "./Rows";
import { Sheet, SheetClose, SheetSection } from "./Sheet";

export { categoryMetadata } from "./category-meta";

/** 英仏の guides の行。題は訳、二行目は結びつくキットの名、札は「日本語」 */
function guideRows(lang: Exclude<Lang, "ja">): Project[] {
  const c = CATALOG[lang];
  return localGuides(lang).map((g) => ({
    slug: `guide-${g.slug}`,
    title: g.localTitle,
    description: c.guides.related + (c.projects[g.kit]?.title ?? g.kit),
    tags: [c.guides.marker],
    category: "works",
    href: guideHref(g),
  }));
}

export function CategorySheet({ lang, category }: { lang: Lang; category: Category }) {
  const sheet = localIndexPage(lang, category);
  const path = `/${category}`;
  const from = localePath(lang, path);
  const items = projectsByCategory(category);
  return (
    <Sheet title={sheet.title} latin={sheet.latin} lede={sheet.lede} lang={lang} path={path}>
      {category === "kits" ? (
        /* 三つの棚（業務自動化・AI活用・Web制作）。頭の案内の #automation・#ai・#web はここへ飛ぶ。
           事務の担当者向けの二つの棚には技術の札を出さない（2026-10-15 監査 改善 1） */
        PILLARS.map((pillar) => (
          <SheetSection key={pillar.id} id={pillar.id} name={localPillarName(lang, pillar)}>
            <Rows
              items={pillarKits(pillar)}
              from={from}
              showSale
              lang={lang}
              withGuides={lang === "ja"}
              showTags={pillar.id === "web"}
            />
          </SheetSection>
        ))
      ) : (
        <SheetSection>
          <Rows items={items} from={from} lang={lang} />
        </SheetSection>
      )}
      {category === "kits" && lang !== "ja" && (
        <SheetSection name={CATALOG[lang].guides.heading}>
          <Rows items={guideRows(lang)} from={from} lang={lang} localized />
        </SheetSection>
      )}
      <SheetClose lang={lang} />
    </Sheet>
  );
}
