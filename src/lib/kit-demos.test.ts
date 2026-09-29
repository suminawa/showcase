import { describe, expect, it } from "vitest";

import links from "@/data/links.json";

import { kitDemos, kitPrice } from "./kit-demos";
import { INTRO_PRICES, yen } from "./prices";
import { projectHref, projects } from "./projects";
import { sitemapPaths } from "./sitemap";

/** 2026-09-29 23:59:59 JST（問い合わせ整理の発売記念の最終日の終わり） */
const LAST_SALE_MOMENT = new Date("2026-09-29T23:59:59+09:00");
/** 2026-09-30 00:00:00 JST（定価に切り替わる時刻） */
const FIRST_LIST_MOMENT = new Date("2026-09-30T00:00:00+09:00");

describe("GAS キット 3 本の見本の結び", () => {
  const KIT_DEMOS = kitDemos(LAST_SALE_MOMENT);
  const demos = Object.values(KIT_DEMOS);

  it("3 本とも、一覧から見本のページへ渡し、sitemap に載る", () => {
    for (const demo of demos) {
      const project = projects.find((p) => p.slug === demo.slug);
      expect(project?.title).toBe(demo.name);
      expect(projectHref(project!)).toBe(`/projects/${demo.slug}`);
      expect(sitemapPaths()).toContain(`/projects/${demo.slug}`);
    }
  });

  it("9/29 23:59:59（日本時間）までは、問い合わせ整理が記念の ¥4,980 で、最終日と定価を添える", () => {
    expect(INTRO_PRICES["inbox-triage"]).toEqual({ price: 4980, until: "2026-09-29" });
    expect(kitPrice("inbox-triage", LAST_SALE_MOMENT)).toEqual({
      price: "¥4,980（税込）の買い切り",
      priceNote: "9/29 までの発売記念の値で、9/30 から定価 ¥5,980 になります。",
    });
    // 記念の値を持たない 2 本は、いつでも定価だけ
    expect(kitPrice("deadline", LAST_SALE_MOMENT)).toEqual({ price: "¥2,980（税込）の買い切り" });
    expect(kitPrice("form", LAST_SALE_MOMENT)).toEqual({ price: "¥3,480（税込）の買い切り" });
    expect(KIT_DEMOS["inbox-triage"].price).toBe("¥4,980（税込）の買い切り");
    expect(KIT_DEMOS.deadline.priceNote).toBeUndefined();
  });

  it("9/30 00:00（日本時間）からは、問い合わせ整理も定価 ¥5,980 だけで、記念の一文は出ない", () => {
    expect(kitPrice("inbox-triage", FIRST_LIST_MOMENT)).toEqual({ price: "¥5,980（税込）の買い切り" });
    const later = kitDemos(FIRST_LIST_MOMENT);
    expect(later["inbox-triage"].price).toBe("¥5,980（税込）の買い切り");
    expect(later["inbox-triage"].priceNote).toBeUndefined();
    expect(later.deadline.price).toBe("¥2,980（税込）の買い切り");
    expect(later.form.price).toBe("¥3,480（税込）の買い切り");
    // 値段のほかは日付で変わらない
    expect({ ...later["inbox-triage"], price: "", priceNote: undefined }).toEqual({
      ...KIT_DEMOS["inbox-triage"],
      price: "",
      priceNote: undefined,
    });
  });

  it("見本ページの値段の一句は、手書きの値を持たず prices.ts と projects.ts から出す", async () => {
    const { readFile } = await import("node:fs/promises");
    const source = await readFile(new URL("./kit-demos.ts", import.meta.url), "utf8");
    expect(source).not.toMatch(/4980|5980|2980|3480/);
    expect(source).not.toContain("price-restore");
    for (const page of ["deadline", "form", "inbox-triage"]) {
      const tsx = await readFile(new URL(`../app/projects/${page}/page.tsx`, import.meta.url), "utf8");
      expect(tsx).toContain('export const dynamic = "force-dynamic"');
    }
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
