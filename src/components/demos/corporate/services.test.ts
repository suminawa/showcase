import { describe, expect, it } from "vitest";
import { pillarById, PILLARS } from "./services";

describe("corporate services", () => {
  it("柱は 3 本、この順で並ぶ", () => {
    expect(PILLARS.map((pillar) => pillar.id)).toEqual([
      "survey",
      "monitoring",
      "analysis",
    ]);
    expect(PILLARS.map((pillar) => pillar.name)).toEqual([
      "海域調査",
      "環境モニタリング",
      "データ解析",
    ]);
  });

  it("一文の要約と説明が、どちらも句点で終わる", () => {
    for (const pillar of PILLARS) {
      expect(pillar.summary.endsWith("。")).toBe(true);
      expect(pillar.body.endsWith("。")).toBe(true);
    }
  });

  it("流れは 3 つ以上、機材は 4 つ以上", () => {
    for (const pillar of PILLARS) {
      expect(pillar.steps.length).toBeGreaterThanOrEqual(3);
      expect(pillar.gear.length).toBeGreaterThanOrEqual(4);
      for (const step of pillar.steps) {
        expect(step.length).toBeGreaterThan(0);
      }
    }
  });

  it("pillarById は id で引き、未知なら undefined", () => {
    expect(pillarById("monitoring")?.name).toBe("環境モニタリング");
    expect(pillarById("nope")).toBeUndefined();
  });
});
