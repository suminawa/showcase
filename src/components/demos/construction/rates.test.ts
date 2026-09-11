import { describe, expect, it } from "vitest";
import {
  formatRate,
  NIGHT_RATE,
  priceFor,
  RATE_PLANS,
  RATE_ROWS,
} from "./rates";

describe("construction rates", () => {
  it("行は 3 つ、id は重ならない", () => {
    expect(RATE_ROWS).toHaveLength(3);
    expect(new Set(RATE_ROWS.map((row) => row.id)).size).toBe(3);
  });

  it("切替は平日と夜間・休日の 2 つ", () => {
    expect(RATE_PLANS.map((item) => item.plan)).toEqual(["weekday", "night"]);
    expect(RATE_PLANS.map((item) => item.label)).toEqual([
      "平日（昼）",
      "夜間・休日",
    ]);
  });

  it("夜間・休日は 5 割増", () => {
    expect(NIGHT_RATE).toBe(1.5);
    expect(priceFor({ weekday: 2200, surcharged: true }, "weekday")).toBe(2200);
    expect(priceFor({ weekday: 2200, surcharged: true }, "night")).toBe(3300);
    expect(priceFor({ weekday: 5500, surcharged: true }, "weekday")).toBe(5500);
    expect(priceFor({ weekday: 5500, surcharged: true }, "night")).toBe(8250);
  });

  it("見積もりは夜間・休日でも無料のまま", () => {
    const estimate = RATE_ROWS.filter((row) => row.id === "estimate");
    expect(estimate).toHaveLength(1);
    expect(priceFor(estimate[0], "weekday")).toBe(0);
    expect(priceFor(estimate[0], "night")).toBe(0);
  });

  it("formatRate は 0 を「無料」にする", () => {
    expect(formatRate(0)).toBe("無料");
    expect(formatRate(2200)).toBe("2,200 円");
    expect(formatRate(8250)).toBe("8,250 円");
  });

  it("どの行にも注記があり、句点で終わる", () => {
    for (const row of RATE_ROWS) {
      expect(row.label.length).toBeGreaterThan(0);
      expect(row.note.endsWith("。")).toBe(true);
    }
  });
});
