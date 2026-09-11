import { describe, expect, it } from "vitest";
import {
  ADVISORY_PLANS,
  advisoryPlanById,
  UNIT_LABELS,
  yearlyEstimate,
} from "./advisory";

describe("advisory plans", () => {
  it("プランは 個人事業・法人・スポット の 3 つ、この順", () => {
    expect(ADVISORY_PLANS.map((p) => p.id)).toEqual(["sole", "corp", "spot"]);
    expect(ADVISORY_PLANS.map((p) => p.name)).toEqual([
      "個人事業",
      "法人",
      "スポット",
    ]);
  });

  it("advisoryPlanById は id で引き、知らない id は投げる", () => {
    expect(advisoryPlanById("corp").name).toBe("法人");
    expect(() => advisoryPlanById("nope" as never)).toThrow();
  });

  it("年間の目安は 月額 ×12 と 年 1 回の料金の合計", () => {
    expect(yearlyEstimate(advisoryPlanById("sole").lines)).toBe(260000);
    expect(yearlyEstimate(advisoryPlanById("corp").lines)).toBe(510000);
  });

  it("単発だけのプランに年間の目安は出さない", () => {
    expect(yearlyEstimate(advisoryPlanById("spot").lines)).toBeNull();
    expect(yearlyEstimate([])).toBeNull();
  });

  it("金額は 1,000 円単位の正の数で、単位にラベルがある", () => {
    for (const plan of ADVISORY_PLANS) {
      expect(plan.lines.length).toBeGreaterThan(0);
      for (const line of plan.lines) {
        expect(line.price).toBeGreaterThan(0);
        expect(line.price % 1000).toBe(0);
        expect(UNIT_LABELS[line.unit].length).toBeGreaterThan(0);
      }
    }
  });

  it("どのプランにも対象・含むもの・結びの一行がある", () => {
    for (const plan of ADVISORY_PLANS) {
      expect(plan.audience.length).toBeGreaterThan(0);
      expect(plan.includes.length).toBeGreaterThanOrEqual(3);
      expect(plan.note.endsWith("。")).toBe(true);
    }
  });
});
