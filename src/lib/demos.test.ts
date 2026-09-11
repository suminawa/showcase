import { describe, expect, it } from "vitest";
import { demoBySlug, demoHref, demos } from "./demos";

describe("demos registry", () => {
  it("見本が順に登録されている（先頭 saas-lp、末尾 3d-viewer）", () => {
    const slugs = demos.map((d) => d.slug);
    expect(slugs).toEqual([
      "saas-lp",
      "shop-lp",
      "construction-lp",
      "corporate-site",
      "professional-lp",
      "clinic-lp",
      "3d-viewer",
    ]);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("demoHref は /demos/<slug> を返す", () => {
    expect(demoHref({ slug: "saas-lp" })).toBe("/demos/saas-lp");
    expect(demoHref({ slug: "shop-lp" })).toBe("/demos/shop-lp");
    expect(demoHref({ slug: "construction-lp" })).toBe("/demos/construction-lp");
    expect(demoHref({ slug: "corporate-site" })).toBe("/demos/corporate-site");
    expect(demoHref({ slug: "professional-lp" })).toBe("/demos/professional-lp");
    expect(demoHref({ slug: "clinic-lp" })).toBe("/demos/clinic-lp");
  });

  it("demoBySlug は slug で引き、未知なら undefined", () => {
    expect(demoBySlug("saas-lp")?.industry).toBe("BtoB・SaaS");
    expect(demoBySlug("shop-lp")?.industry).toBe("店舗・サロン");
    expect(demoBySlug("construction-lp")?.industry).toBe("建設・工事");
    expect(demoBySlug("corporate-site")?.industry).toBe("コーポレート");
    expect(demoBySlug("professional-lp")?.industry).toBe("士業・研修");
    expect(demoBySlug("clinic-lp")?.industry).toBe("クリニック・医院");
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

  it("どの見本も「見本 — 」で始まる題を持つ", () => {
    for (const d of demos) {
      expect(d.title.startsWith("見本 — ")).toBe(true);
    }
  });

  it("3d-viewer は建築・不動産の見本", () => {
    const viewer = demoBySlug("3d-viewer");
    expect(viewer?.industry).toBe("建築・不動産");
    expect(viewer?.title).toBe("見本 — 間取りシミュレーター（3D）");
    expect(viewer?.description).toBe(
      "間取りを描きかえ、家具を置き、3D で確かめる見本。マス目を塗るだけで廊下も L 字も描けます。",
    );
    expect(viewer?.tags).toContain("React Three Fiber");
  });
});
