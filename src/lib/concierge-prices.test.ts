/*
 * 案内窓口の知識（concierge/content/product-*.md）に書いた値段が、サイトの値段と食い違わないか。
 * 定価は projects.ts の sale.price、発売記念の値と最終日は prices.ts の INTRO_PRICES が持つ。
 * 窓口は文書だけを根拠に答えるので、ここがずれると、お客さまに違う値段をお伝えしてしまう。
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { INTRO_PRICES, nextDate } from "./prices";
import { projects } from "./projects";

const CONTENT = join(process.cwd(), "concierge/content");

/** 文書のファイル名 → projects.ts の slug */
const DOC_SLUG: Record<string, string> = {
  "product-ai-concierge.md": "ai-concierge",
  "product-booking.md": "booking",
  "product-configurator.md": "configurator",
  "product-dashboard.md": "dashboard",
  "product-deadline-alert.md": "deadline",
  "product-doc-reader.md": "doc-reader",
  "product-floorplan.md": "floorplan",
  "product-form-intake.md": "form",
  "product-inbox-triage.md": "inbox-triage",
  "product-line-concierge.md": "line-concierge",
  "product-lp-templates.md": "lp-pack",
  "product-quote.md": "quote-simulator",
  "product-saas-starter.md": "saas-starter",
  "product-sheet-app.md": "sheet-app",
};

const productDocs = readdirSync(CONTENT).filter((name) => name.startsWith("product-"));

/** 「12,800」→ 12800 */
const num = (text: string) => Number(text.replace(/,/g, ""));
/** 「9 月 30 日」→「2026-09-30」 */
const iso = (month: string, day: string) => `2026-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

describe("案内窓口の知識の値段は、サイトの値段の表と同じ", () => {
  it("すべての商品の文書に、対応する slug がある", () => {
    expect(productDocs.sort()).toEqual(Object.keys(DOC_SLUG).sort());
  });

  for (const doc of productDocs) {
    const slug = DOC_SLUG[doc];
    const text = readFileSync(join(CONTENT, doc), "utf8");

    it(`${doc}: 定価は projects.ts の sale.price`, () => {
      const list = projects.find((p) => p.slug === slug)?.sale?.price;
      const stated = [...text.matchAll(/定価(?:の)? ?([\d,]+) 円/g)].map((m) => num(m[1]));
      expect(stated.length).toBeGreaterThan(0);
      for (const price of stated) expect(price).toBe(list);
    });

    it(`${doc}: 発売記念の値と最終日は prices.ts の INTRO_PRICES`, () => {
      const intro = INTRO_PRICES[slug];
      // 期間中の書き方:「発売記念価格の 4,980 円は 9 月 29 日までで、9 月 30 日からは定価の 5,980 円です」
      for (const m of text.matchAll(/発売記念価格の ([\d,]+) 円は (\d+) 月 (\d+) 日まで(?:で、(\d+) 月 (\d+) 日からは定価)?/g)) {
        expect(intro, `${slug} は INTRO_PRICES に無い`).toBeDefined();
        expect(num(m[1])).toBe(intro!.price);
        expect(iso(m[2], m[3])).toBe(intro!.until);
        if (m[4]) expect(iso(m[4], m[5])).toBe(nextDate(intro!.until));
      }
      // 終わった後の書き方:「発売記念価格（9,800 円）の期間は 9 月 27 日で終わり」。表に行が残っていれば一致すること
      for (const m of text.matchAll(/発売記念価格（([\d,]+) 円）の期間は (\d+) 月 (\d+) 日で終わり/g)) {
        if (intro) {
          expect(num(m[1])).toBe(intro.price);
          expect(iso(m[2], m[3])).toBe(intro.until);
        }
      }
    });
  }

  it("INTRO_PRICES に行があるキットは、文書にも記念の値を書いている", () => {
    for (const [doc, slug] of Object.entries(DOC_SLUG)) {
      if (!INTRO_PRICES[slug]) continue;
      const text = readFileSync(join(CONTENT, doc), "utf8");
      expect(text, doc).toMatch(/発売記念価格/);
    }
  });
});
