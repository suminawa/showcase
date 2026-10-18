/*
 * 見本サイトの全件（/sites）。日本語と英仏（src/app/[lang]/sites/page.tsx）が同じものを描く。
 * どれも架空の会社で作ったもので、業種別 LP テンプレ パックの中身でもある。
 * 行の飛び先は見本そのもの（/demos/*）で、値段はここに出さない ── 売り物としての値段は /kits に一箇所だけ置く。
 * 写真は実画面（scripts/site-cards.mjs で撮る。public/sites/<slug>-{480,960}.webp）。
 * FORM: 方眼（DESIGN.md）
 */
import Link from "next/link";

import { CatalogPage } from "@/components/site/CatalogPage";
import { KitCard, KitGrid } from "@/components/site/KitCard";
import u from "@/components/site/ui.module.css";
import { localIndexPage, localProject } from "@/i18n/catalog";
import { hrefFor, type Lang } from "@/i18n/routes";
import { projects, projectsByCategory } from "@/lib/projects";

const PACK: Record<Lang, { before: string; after: string }> = {
  ja: { before: "6 本は、", after: "としてまとめてお求めいただけます。文言と色を替えて、そのまま使えます。" },
  en: { before: "All six are included in the ", after: ". Swap the copy and colors to make them yours." },
  fr: { before: "Les six sites font partie du ", after: ". Remplacez les textes et les couleurs pour les adapter." },
};

export function SitesPage({ lang }: { lang: Lang }) {
  const page = localIndexPage(lang, "sites");
  const sites = projectsByCategory("sites");
  const pack = localProject(lang, projects.find((p) => p.slug === "lp-pack")!);
  const t = PACK[lang];
  return (
    <CatalogPage
      lang={lang}
      title={page.title}
      lede={page.lede}
      note={
        <>
          {t.before}
          <Link href={hrefFor(lang, "/projects/lp-pack")} className={u.link}>
            {pack.title}
          </Link>
          {t.after}
        </>
      }
    >
      <KitGrid count={sites.length} label={page.title}>
        {sites.map((site, i) => (
          <KitCard key={site.slug} project={site} lang={lang} showTags shot={`/sites/${site.slug}`} eager={i < 3} />
        ))}
      </KitGrid>
    </CatalogPage>
  );
}
