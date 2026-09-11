import { describe, expect, it } from "vitest";
import { demoBySlug, demoHref, demos } from "./demos";

describe("demos registry", () => {
  it("見本が順に登録されている（先頭 saas-lp、末尾 3d-viewer）", () => {
    const slugs = demos.map((d) => d.slug);
    expect(slugs[0]).toBe("saas-lp");
    expect(slugs[slugs.length - 1]).toBe("3d-viewer");
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("demoHref は /demos/<slug> を返す", () => {
    expect(demoHref({ slug: "saas-lp" })).toBe("/demos/saas-lp");
    expect(demoHref({ slug: "shop-lp" })).toBe("/demos/shop-lp");
  });

  it("demoBySlug は slug で引き、未知なら undefined", () => {
    expect(demoBySlug("saas-lp")?.industry).toBe("BtoB・SaaS");
    expect(demoBySlug("shop-lp")?.industry).toBe("店舗・サロン");
    expect(demoBySlug("nope")).toBeUndefined();
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

  it("3d-viewer は建築・不動産の見本", () => {
    const viewer = demoBySlug("3d-viewer");
    expect(viewer?.industry).toBe("建築・不動産");
    expect(viewer?.title).toBe("見本 — 間取りシミュレーター（3D）");
    expect(viewer?.tags).toContain("React Three Fiber");
  });
});
