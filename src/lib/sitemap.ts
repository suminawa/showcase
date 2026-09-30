import { demoHref, demos } from "./demos";
import { guideHref, guides } from "./guides";
import { isGoHref } from "./go";
import { GATES, projectHref, projects } from "./projects";
import { siteUrl } from "./site";

import { languageAlternates } from "@/i18n/meta";
import { FOREIGN_LANGS, TRANSLATED_PATHS, isTranslated, localePath, splitLang } from "@/i18n/routes";

/**
 * sitemap に載せる紙の道。トップ、分類の紙と制作のご相談、作品ページ（外へ飛ぶものは除く）、見本サイト、悩みから読む紙。
 * 最後に、訳のある紙の英仏の道（/en…・/fr…）。/go/ の from もこの一覧で照らす。
 */
export function sitemapPaths(): string[] {
  const paths = ["/", ...GATES.map((gate) => gate.href), "/contact"];
  for (const p of projects) {
    // 紙の中の節へ飛ぶ行（#…）は、その紙を 1 度だけ載せる
    const href = projectHref(p).split("#")[0];
    // /go/ は売り場への渡し口で、紙ではない
    if (href.startsWith("/") && !isGoHref(href)) paths.push(href);
  }
  for (const d of demos) paths.push(demoHref(d));
  paths.push("/guides");
  for (const g of guides) paths.push(guideHref(g));
  for (const lang of FOREIGN_LANGS) for (const p of TRANSLATED_PATHS) paths.push(localePath(lang, p));
  return Array.from(new Set(paths));
}

const abs = (path: string) => new URL(path, siteUrl).toString();

export function sitemapEntries(now: Date) {
  return sitemapPaths().map((path) => {
    // 訳のある紙は、三言語の道と x-default を hreflang の組として添える
    const base = splitLang(path).path;
    const top = base === "/";
    return {
      url: abs(path),
      lastModified: now,
      changeFrequency: (top ? "weekly" : "monthly") as "weekly" | "monthly",
      priority: top ? 1 : 0.7,
      ...(isTranslated(base)
        ? {
            alternates: {
              languages: Object.fromEntries(Object.entries(languageAlternates(base)).map(([k, v]) => [k, abs(v)])),
            },
          }
        : {}),
    };
  });
}
