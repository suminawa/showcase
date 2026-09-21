import type { MetadataRoute } from "next";

import { demoHref, demos } from "@/lib/demos";
import { GATES, projectHref, projects } from "@/lib/projects";
import { siteUrl } from "@/lib/site";

/**
 * 索引。紙の住所はレジストリから組む ── 品物を足したときに
 * ここだけ古くなる、という壊れ方を作らないため。
 *
 * 載せるのは自分の紙だけで、同じ名義の note へ出る行は載せない（よその索引）。
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const at = (path: string) => new URL(path, siteUrl).toString();
  const now = new Date();

  const pages = [
    // トップ
    { url: at("/"), priority: 1 },
    // 分類の紙と、制作のご相談
    ...GATES.map((gate) => ({ url: at(gate.href), priority: 0.8 })),
    { url: at("/contact"), priority: 0.8 },
    // 作品ページ（自分の紙を持つものだけ）
    ...projects
      .map(projectHref)
      .filter((href) => href.startsWith("/projects/"))
      .map((href) => ({ url: at(href), priority: 0.7 })),
    // 見本サイト
    ...demos.map((demo) => ({ url: at(demoHref(demo)), priority: 0.6 })),
  ];

  return pages.map((page) => ({ ...page, lastModified: now }));
}
