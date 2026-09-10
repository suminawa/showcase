import { describe, expect, it } from "vitest";
import { cumulativeRevenue, sparklinePath, totals, type DayRow } from "./thirtydays";

const row = (day: number, revenue: number, humanMinutes: number): DayRow => ({
  day, date: `2026-09-${10 + day}`, revenue, proposals: day, replies: 0, meetings: 0, humanMinutes, release: "", ai: "",
});

describe("totals", () => {
  it("合計と平均介在時間", () => {
    const t = totals([row(0, 0, 80), row(1, 1980, 40), row(2, 3960, 60)]);
    expect(t).toEqual({ revenue: 5940, proposals: 3, replies: 0, meetings: 0, humanMinutes: 180, daysLogged: 3, avgHumanMinutes: 60 });
  });
  it("空なら全部 0", () => {
    expect(totals([]).avgHumanMinutes).toBe(0);
    expect(totals([]).daysLogged).toBe(0);
  });
});

describe("cumulativeRevenue", () => {
  it("累計にする", () => {
    expect(cumulativeRevenue([row(0, 0, 0), row(1, 1980, 0), row(2, 3960, 0)])).toEqual([0, 1980, 5940]);
  });
});

describe("sparklinePath", () => {
  it("最大値を上端、0 を下端に置く", () => {
    expect(sparklinePath([0, 10], 100, 20)).toBe("M0.0,20.0 L100.0,0.0");
  });
  it("全部 0 なら下端の直線", () => {
    expect(sparklinePath([0, 0, 0], 100, 20)).toBe("M0.0,20.0 L50.0,20.0 L100.0,20.0");
  });
  it("1 点なら M だけ", () => {
    expect(sparklinePath([5], 100, 20)).toBe("M0.0,0.0");
  });
  it("空なら空文字", () => {
    expect(sparklinePath([], 100, 20)).toBe("");
  });
});
