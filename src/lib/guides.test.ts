import { describe, expect, it } from "vitest";

import { guides } from "./guides";
import { projects } from "./projects";
import { sitemapPaths } from "./sitemap";

describe("guides", () => {
  it("検索の題は 32 字まで、答えは 1〜2 文、日付は公開日以降", () => {
    for (const g of guides) {
      expect((g.searchTitle ?? g.title).length, g.slug).toBeLessThanOrEqual(32);
      const sentences = g.answer.split("。").filter(Boolean).length;
      expect(sentences, g.slug).toBeGreaterThanOrEqual(1);
      expect(sentences, g.slug).toBeLessThanOrEqual(2);
      expect((g.updated ?? g.date) >= g.date, g.slug).toBe(true);
    }
  });
  it("結びの道は、/kits にある売り物の行と、sitemap にある見本の紙へ向く", () => {
    const paths = sitemapPaths();
    for (const g of guides) {
      expect(projects.find((p) => p.slug === g.shop)?.category, g.slug).toBe("kits");
      if (g.demo) expect(paths, g.slug).toContain(g.demo.href);
    }
  });
});
