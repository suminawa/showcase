import { describe, expect, it } from "vitest";
import { guideBySlug, guideUpdated } from "./guides";
import { SITE_UPDATED, lastModifiedOf, sitemapEntries, sitemapPaths } from "./sitemap";
import { updatesFor } from "./updates";

describe("sitemap", () => {
  it("トップ・作品ページ・見本サイトが載り、配布の道と外部リンクは載らない", () => {
    const paths = sitemapPaths();
    expect(paths[0]).toBe("/");
    expect(paths).toContain("/kits");
    expect(paths).toContain("/contact");
    expect(paths).toContain("/projects/booking");
    expect(paths).toContain("/projects/mcp-server");
    for (const slug of ["line-concierge", "survey-analysis", "rag-eval-harness", "lp-pack", "shopify-configurator", "order-report", "payslip"]) {
      expect(paths).toContain(`/projects/${slug}`);
      expect(paths).toContain(`/en/projects/${slug}`);
      expect(paths).toContain(`/fr/projects/${slug}`);
    }
    expect(paths).toContain("/demos/corporate-site");
    expect(paths).toContain("/guides");
    expect(paths).toContain("/guides/pdf-to-spreadsheet");
    expect(paths).toContain("/guides/form-auto-reply");
    expect(paths).toContain("/guides/spreadsheet-app");
    expect(paths).toContain("/guides/quote-calculator");
    expect(paths.some((p) => p.startsWith("/dl/"))).toBe(false);
    expect(paths.every((p) => p.startsWith("/"))).toBe(true);
    expect(paths.some((p) => p.includes("#"))).toBe(false);
    expect(new Set(paths).size).toBe(paths.length);
  });
  it("URL は絶対で、トップ（三言語）だけ priority 1", () => {
    const entries = sitemapEntries();
    expect(entries[0].url).toMatch(/^https?:\/\/.+\/$/);
    const tops = entries.filter((e) => e.priority === 1).map((e) => new URL(e.url).pathname);
    expect(tops).toEqual(["/", "/en", "/fr"]);
    expect(entries.every((e) => e.priority === 1 || e.priority === 0.7)).toBe(true);
  });
  it("英仏の道が載り、訳のある紙には hreflang の組が付く（見本と guides には付かない）", () => {
    const paths = sitemapPaths();
    expect(paths).toContain("/en");
    expect(paths).toContain("/fr/kits");
    expect(paths).toContain("/en/projects/booking");
    expect(paths.some((p) => p.startsWith("/en/demos") || p.startsWith("/fr/guides"))).toBe(false);
    const entries = sitemapEntries();
    const kits = entries.find((e) => new URL(e.url).pathname === "/fr/kits");
    expect(Object.keys(kits?.alternates?.languages ?? {}).sort()).toEqual(["en", "fr", "ja", "x-default"]);
    expect(kits?.alternates?.languages?.["x-default"]).toMatch(/\/kits$/);
    const demo = entries.find((e) => new URL(e.url).pathname === "/demos/shop-lp");
    expect(demo?.alternates).toBeUndefined();
  });
  it("lastmod はビルドの時刻ではなく、紙ごとの更新日", () => {
    const booking = updatesFor("booking")[0].date;
    expect(lastModifiedOf("/projects/booking")).toBe(booking);
    expect(lastModifiedOf("/projects/tax-back")).toBe(SITE_UPDATED);
    expect(lastModifiedOf("/guides/pdf-to-spreadsheet")).toBe(guideUpdated(guideBySlug("pdf-to-spreadsheet")));
    expect(lastModifiedOf("/about")).toBe(SITE_UPDATED);
    const fr = sitemapEntries().find((e) => new URL(e.url).pathname === "/fr/projects/booking");
    expect(fr?.lastModified).toEqual(new Date(`${booking}T00:00:00+09:00`));
    expect(new Set(sitemapEntries().map((e) => String(e.lastModified))).size).toBeGreaterThan(1);
  });
});
