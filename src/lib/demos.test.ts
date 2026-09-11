import { describe, expect, it } from "vitest";
import { demoBySlug, demoHref, demos } from "./demos";

describe("demos registry", () => {
  it("saas-lp が登録されている", () => {
    expect(demos.map((d) => d.slug)).toEqual(["saas-lp"]);
  });

  it("demoHref は /demos/<slug> を返す", () => {
    expect(demoHref({ slug: "saas-lp" })).toBe("/demos/saas-lp");
  });

  it("demoBySlug は slug で引き、未知なら undefined", () => {
    expect(demoBySlug("saas-lp")?.industry).toBe("BtoB・SaaS");
    expect(demoBySlug("nope")).toBeUndefined();
  });

  it("説明は 80 字以内、タグは 1 つ以上", () => {
    for (const d of demos) {
      expect(d.description.length).toBeLessThanOrEqual(80);
      expect(d.tags.length).toBeGreaterThan(0);
    }
  });
});
