import { describe, expect, it } from "vitest";

import links from "@/data/links.json";

import { INBOX_LIST_PRICE_TEXT, INBOX_SALE_PRICE, KIT_DEMOS, yen } from "./kit-demos";
import { projectHref, projects } from "./projects";
import { sitemapPaths } from "./sitemap";

describe("GAS キット 3 本の見本の結び", () => {
  const demos = Object.values(KIT_DEMOS);

  it("3 本とも、一覧から見本のページへ渡し、sitemap に載る", () => {
    for (const demo of demos) {
      const project = projects.find((p) => p.slug === demo.slug);
      expect(project?.title).toBe(demo.name);
      expect(projectHref(project!)).toBe(`/projects/${demo.slug}`);
      expect(sitemapPaths()).toContain(`/projects/${demo.slug}`);
    }
  });

  it("値段は商品の値段の表と同じ（期限 ¥2,980・フォーム ¥3,480・問い合わせ整理は 9/29 まで ¥4,980、定価 ¥5,980）", () => {
    expect(KIT_DEMOS.deadline.price.startsWith("¥2,980（税込）")).toBe(true);
    expect(KIT_DEMOS.form.price.startsWith("¥3,480（税込）")).toBe(true);
    expect(INBOX_SALE_PRICE).toBe(4980);
    expect(KIT_DEMOS["inbox-triage"].price).toContain("¥4,980");
    expect(KIT_DEMOS["inbox-triage"].priceNote).toBe("9/29 までの発売記念の値で、9/30 から定価 ¥5,980 になります。");
    expect(KIT_DEMOS.deadline.priceNote).toBeUndefined();
    expect(INBOX_LIST_PRICE_TEXT).toBe("¥5,980（税込）の買い切り");
  });

  it("買う道は note と BOOTH の両方が links.json にある", () => {
    for (const demo of demos) {
      const entry = (links as Record<string, { note?: string; booth?: string }>)[demo.linkKey];
      expect(entry?.note?.startsWith("https://")).toBe(true);
      expect(entry?.booth?.startsWith("https://")).toBe(true);
    }
  });

  it("比べる相手はすべて出どころの URL を持ち、数字を書いた行は必ず出どころを添える", () => {
    for (const demo of demos) {
      expect(demo.freeEnough.length).toBeGreaterThan(0);
      expect(demo.fits.length).toBeGreaterThan(0);
      for (const { alt } of demo.freeEnough) expect(alt.href.startsWith("https://")).toBe(true);
      for (const fit of demo.fits) {
        for (const alt of fit.alts ?? []) expect(alt.href.startsWith("https://")).toBe(true);
        // 「N 日前」「8 分類」など自分のキットの中身の数は除き、月額・件数の数は出どころを持つ
        if (/[$€¥]|\d+ 件|\/月/.test(fit.who)) expect(fit.alts?.length ?? 0).toBeGreaterThan(0);
      }
    }
  });

  it("公開の文は敬体で、「承ります」を使わず、架空でない連絡先を書かない", () => {
    const text = JSON.stringify(KIT_DEMOS);
    expect(text).not.toContain("承ります");
    expect(text).not.toMatch(/\d{2,4}-\d{2,4}-\d{4}/);
    for (const demo of demos) {
      expect(demo.setup).toMatch(/(です|ます|ません)。$/);
      for (const line of demo.freeEnough) expect(line.alt.note).toMatch(/(です|ます|ません)。$/);
    }
  });

  it("GAS キットの導入時間は正直に（15〜20 分、確認画面を含む）", () => {
    expect(KIT_DEMOS.deadline.setup).toContain("15〜20 分");
    expect(KIT_DEMOS.form.setup).toContain("20 分");
    expect(KIT_DEMOS["inbox-triage"].setup).toContain("API キー");
    for (const demo of demos) expect(demo.setup).toContain("確認画面");
  });

  it("yen は 3 桁で区切る", () => {
    expect(yen(2980)).toBe("¥2,980");
    expect(yen(150000)).toBe("¥150,000");
  });
});
