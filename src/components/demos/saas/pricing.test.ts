import { describe, expect, it } from "vitest";
import { PLANS, priceFor, YEARLY_DISCOUNT } from "./pricing";

describe("pricing", () => {
  it("月額はそのまま、年額払いは 20% 引きの月あたり換算", () => {
    expect(priceFor({ monthly: 500 }, "monthly")).toBe(500);
    expect(priceFor({ monthly: 500 }, "yearly")).toBe(400);
    expect(priceFor({ monthly: 900 }, "yearly")).toBe(720);
    expect(priceFor({ monthly: 1500 }, "yearly")).toBe(1200);
  });

  it("端数は切り捨て", () => {
    expect(priceFor({ monthly: 999 }, "yearly")).toBe(799);
  });

  it("プランは 3 つ、おすすめは 1 つ、金額は昇順", () => {
    expect(PLANS.map((p) => p.id)).toEqual(["starter", "standard", "business"]);
    expect(PLANS.filter((p) => p.recommended)).toHaveLength(1);
    const monthly = PLANS.map((p) => p.monthly);
    expect([...monthly].sort((a, b) => a - b)).toEqual(monthly);
    expect(YEARLY_DISCOUNT).toBe(0.2);
  });

  it("各プランは対象と機能を持つ", () => {
    for (const plan of PLANS) {
      expect(plan.audience.length).toBeGreaterThan(0);
      expect(plan.features.length).toBeGreaterThanOrEqual(3);
    }
  });
});
