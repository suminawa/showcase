import { describe, expect, it } from "vitest";
import { demoBySlug, demoHref, demos } from "./demos";

describe("demos registry", () => {
  it("saas-lp と shop-lp が、この順で登録されている", () => {
    expect(demos.map((d) => d.slug)).toEqual(["saas-lp", "shop-lp"]);
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
});
