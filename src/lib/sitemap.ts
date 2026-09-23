import { demoHref, demos } from "./demos";
import { GATES, projectHref, projects } from "./projects";
import { siteUrl } from "./site";

/** sitemap に載せる紙の道。トップ、分類の紙と制作のご相談、作品ページ（外へ飛ぶものは除く）、見本サイト */
export function sitemapPaths(): string[] {
  const paths = ["/", ...GATES.map((gate) => gate.href), "/contact"];
  for (const p of projects) {
    const href = projectHref(p);
    if (href.startsWith("/")) paths.push(href);
  }
  for (const d of demos) paths.push(demoHref(d));
  return Array.from(new Set(paths));
}

export function sitemapEntries(now: Date) {
  return sitemapPaths().map((path) => ({
    url: new URL(path, siteUrl).toString(),
    lastModified: now,
    changeFrequency: (path === "/" ? "weekly" : "monthly") as "weekly" | "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
