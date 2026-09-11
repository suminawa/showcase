import { describe, expect, it } from "vitest";
import { demoBySlug, demoHref, demos } from "./demos";

describe("demos registry", () => {
  it("見本が順に登録されている（先頭 corporate-site、末尾 clinic-lp）", () => {
    const slugs = demos.map((d) => d.slug);
    expect(slugs).toEqual([
      "corporate-site",
      "saas-lp",
      "shop-lp",
      "construction-lp",
      "professional-lp",
      "clinic-lp",
    ]);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("demoHref は /demos/<slug> を返す", () => {
    expect(demoHref({ slug: "corporate-site" })).toBe("/demos/corporate-site");
    expect(demoHref({ slug: "saas-lp" })).toBe("/demos/saas-lp");
    expect(demoHref({ slug: "shop-lp" })).toBe("/demos/shop-lp");
    expect(demoHref({ slug: "construction-lp" })).toBe("/demos/construction-lp");
    expect(demoHref({ slug: "professional-lp" })).toBe("/demos/professional-lp");
    expect(demoHref({ slug: "clinic-lp" })).toBe("/demos/clinic-lp");
  });

  it("demoBySlug は slug で引き、未知なら undefined", () => {
    expect(demoBySlug("corporate-site")?.industry).toBe("コーポレート");
    expect(demoBySlug("saas-lp")?.industry).toBe("BtoB・SaaS");
    expect(demoBySlug("shop-lp")?.industry).toBe("店舗・サロン");
    expect(demoBySlug("construction-lp")?.industry).toBe("建設・工事");
    expect(demoBySlug("professional-lp")?.industry).toBe("士業・研修");
    expect(demoBySlug("clinic-lp")?.industry).toBe("クリニック・医院");
    expect(demoBySlug("nope")).toBeUndefined();
  });

  it("間取りシミュレーターは見本ではなくなった（ツールへ移した）", () => {
    expect(demoBySlug("3d-viewer")).toBeUndefined();
    expect(demos.map((d) => d.slug)).not.toContain("3d-viewer");
  });

  it("説明は 80 字以内、タグは 1 つ以上", () => {
    for (const d of demos) {
      expect(d.description.length).toBeLessThanOrEqual(80);
      expect(d.tags.length).toBeGreaterThan(0);
    }
  });

  it("slug も題も重ならない", () => {
    expect(new Set(demos.map((d) => d.slug)).size).toBe(demos.length);
    expect(new Set(demos.map((d) => d.title)).size).toBe(demos.length);
  });

  it("題は業種の名だけ ──「見本 — 」は付けない（見本であることは欄の頭が言う）", () => {
    expect(demos.map((d) => d.title)).toEqual([
      "会社案内サイト",
      "BtoB・SaaS の LP",
      "店舗・サロンの LP",
      "建設・工事の LP",
      "士業・研修の LP",
      "クリニック・医院の LP",
    ]);
    for (const d of demos) {
      expect(d.title.startsWith("見本")).toBe(false);
    }
  });
});
