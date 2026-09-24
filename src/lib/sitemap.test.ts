import { describe, expect, it } from "vitest";
import { sitemapEntries, sitemapPaths } from "./sitemap";

describe("sitemap", () => {
  it("トップ・作品ページ・見本サイトが載り、配布の道と外部リンクは載らない", () => {
    const paths = sitemapPaths();
    expect(paths[0]).toBe("/");
    expect(paths).toContain("/kits");
    expect(paths).toContain("/contact");
    expect(paths).toContain("/projects/booking");
    expect(paths).toContain("/demos/corporate-site");
    expect(paths).toContain("/guides");
    expect(paths).toContain("/guides/pdf-to-spreadsheet");
    expect(paths.some((p) => p.startsWith("/dl/"))).toBe(false);
    expect(paths.every((p) => p.startsWith("/"))).toBe(true);
    expect(new Set(paths).size).toBe(paths.length);
  });
  it("URL は絶対で、トップだけ priority 1", () => {
    const entries = sitemapEntries(new Date("2026-09-22T00:00:00Z"));
    expect(entries[0].url).toMatch(/^https?:\/\/.+\/$/);
    expect(entries[0].priority).toBe(1);
    expect(entries.slice(1).every((e) => e.priority === 0.7)).toBe(true);
  });
});
