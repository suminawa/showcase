/*
 * 作品ページの構造化データ。パンくず（トップ → 分類 → この紙）と、売り物なら Product と Offer。
 * 値段はいま払う税込の円（発売記念の期間中は記念の値。無料の見本は 0）。
 * 紙（src/app/(ja)/projects/shell.tsx）とテストが同じ組み方を読む。
 */
import { localIndexPage, localProject } from "@/i18n/catalog";
import { localePath, type Lang } from "@/i18n/routes";

import { breadcrumbJsonLd, productJsonLd } from "./jsonld";
import { priceNow } from "./prices";
import { projects } from "./projects";
import { SITE_NAME } from "./site";

/** OGP の画（/og/<slug>.png）を持たない作品ページ */
export const NO_OG = new Set([
  "deadline",
  "form",
  "inbox-triage",
  "mcp-server",
  "line-concierge",
  "survey-analysis",
  "rag-eval-harness",
  "lp-pack",
  "shopify-configurator",
]);

export function projectJsonLd(lang: Lang, slug: string, title: string): Record<string, unknown>[] | null {
  const source = projects.find((p) => p.slug === slug);
  if (!source) return null;
  const project = localProject(lang, source);
  const path = localePath(lang, `/projects/${slug}`);
  const data = [
    breadcrumbJsonLd([
      { name: SITE_NAME, path: localePath(lang, "/") },
      { name: localIndexPage(lang, project.category).title, path: localePath(lang, `/${project.category}`) },
      { name: title, path },
    ]),
  ];
  const sale = project.sale;
  if (sale && (sale.status === "free" || (sale.status === "onsale" && sale.price != null))) {
    data.push(
      productJsonLd({
        name: project.title,
        description: project.description,
        path,
        price: sale.status === "free" ? 0 : priceNow(slug, sale.price!).price,
        image: NO_OG.has(slug) ? undefined : `/og/${slug}.png`,
      }),
    );
  }
  return data;
}
