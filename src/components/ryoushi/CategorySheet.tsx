/*
 * 分類のページ（/kits・/sites・/works）の紙。日本語のページと英仏のページ（[lang]）が同じものを描く。
 * 英仏の /kits だけ、末尾に悩みから読む紙（guides、日本語のみ）の行を添える。
 */
import { CATALOG, localGuides, localIndexPage } from "@/i18n/catalog";
import { pageMetadata } from "@/i18n/meta";
import { localePath, type Lang } from "@/i18n/routes";
import { guideHref } from "@/lib/guides";
import { projectsByCategory, type Category, type Project } from "@/lib/projects";

import { Rows } from "./Rows";
import { Sheet, SheetClose, SheetSection } from "./Sheet";

export function categoryMetadata(lang: Lang, category: Category) {
  const sheet = localIndexPage(lang, category);
  return pageMetadata(lang, `/${category}`, {
    title: sheet.title,
    description: sheet.lede,
    image: `/og/${category}.png`,
  });
}

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
  return (
    <Sheet title={sheet.title} latin={sheet.latin} lede={sheet.lede} lang={lang} path={path}>
      <SheetSection>
        <Rows items={projectsByCategory(category)} from={from} showSale={category === "kits"} lang={lang} />
      </SheetSection>
      {category === "kits" && lang !== "ja" && (
        <SheetSection name={CATALOG[lang].guides.heading}>
          <Rows items={guideRows(lang)} from={from} lang={lang} localized />
        </SheetSection>
      )}
      <SheetClose lang={lang} />
    </Sheet>
  );
}
