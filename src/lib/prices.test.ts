import { describe, expect, it } from "vitest";

import { INTRO_PRICES, jstDate, priceNow, shortDate } from "./prices";
import { priceLabel, projects, saleLabel } from "./projects";

const at = (iso: string) => new Date(iso);

describe("発売記念の価格は日本時間の日付で切り替わる", () => {
  it("jstDate は UTC 15:00 で日付が進む", () => {
    expect(jstDate(at("2026-10-02T14:59:59Z"))).toBe("2026-10-02");
    expect(jstDate(at("2026-10-02T15:00:00Z"))).toBe("2026-10-03");
  });

  it("最終日の 23:59:59 JST までは記念の値、翌 00:00 JST から定価", () => {
    expect(priceNow("sheet-app", 12800, at("2026-10-02T23:59:59+09:00"))).toEqual({
      price: 9800,
      intro: { list: 12800, until: "2026-10-02" },
    });
    expect(priceNow("sheet-app", 12800, at("2026-10-03T00:00:00+09:00"))).toEqual({
      price: 12800,
    });
  });

  it("9/30 に切り替わる 2 本と、10/1 に切り替わる 3 本", () => {
    const before = at("2026-09-29T23:59:59+09:00");
    const sep30 = at("2026-09-30T00:00:00+09:00");
    const oct1 = at("2026-10-01T00:00:00+09:00");
    expect(priceNow("inbox-triage", 5980, before).price).toBe(4980);
    expect(priceNow("inbox-triage", 5980, sep30).price).toBe(5980);
    expect(priceNow("dashboard", 9800, before).price).toBe(8800);
    expect(priceNow("dashboard", 9800, sep30).price).toBe(9800);
    for (const [slug, intro, list] of [
      ["line-concierge", 9800, 12800],
      ["configurator", 9800, 12800],
      ["saas-starter", 16800, 19800],
    ] as const) {
      expect(priceNow(slug, list, sep30).price).toBe(intro);
      expect(priceNow(slug, list, oct1).price).toBe(list);
    }
  });

  it("表に無いキットはいつでも定価", () => {
    expect(priceNow("booking", 7980, at("2026-09-29T12:00:00+09:00"))).toEqual({ price: 7980 });
  });

  it("記念の値が定価以上なら（表の書き違い）定価に倒す", () => {
    expect(priceNow("sheet-app", 9800, at("2026-09-29T12:00:00+09:00"))).toEqual({ price: 9800 });
  });

  it("shortDate は「10/2」の形", () => {
    expect(shortDate("2026-10-02")).toBe("10/2");
    expect(shortDate("2026-09-30")).toBe("9/30");
  });
});

describe("一覧の札", () => {
  const by = Object.fromEntries(projects.map((p) => [p.slug, p]));

  it("期間中は記念の値・最終日・定価、翌日からは定価だけ", () => {
    expect(priceLabel(by["sheet-app"], at("2026-10-02T23:59:59+09:00"))).toBe(
      "発売記念 ¥9,800（10/2 まで・定価 ¥12,800）",
    );
    expect(priceLabel(by["sheet-app"], at("2026-10-03T00:00:00+09:00"))).toBe("発売中 ¥12,800");
  });

  it("表に載せたキットは、どれも発売中で、記念の値が定価より安い", () => {
    for (const [slug, intro] of Object.entries(INTRO_PRICES)) {
      const sale = by[slug]?.sale;
      expect(sale?.status, slug).toBe("onsale");
      expect(intro.price, slug).toBeLessThan(sale!.price!);
      expect(intro.until, slug).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("slug を渡さない saleLabel は定価のまま（作品ページの頭の使い方は変わらない）", () => {
    expect(saleLabel(by["sheet-app"].sale!)).toBe("発売中 ¥12,800");
  });

  it("売り物でない行は札を持たない", () => {
    expect(priceLabel(by["suminagashi"])).toBeNull();
  });
});
