import { describe, expect, it } from "vitest";
import {
  COUNT_UP_DURATION,
  countUpValue,
  easeOutCubic,
  formatCount,
  STATS,
} from "./stats";

describe("corporate stats", () => {
  it("数字は 4 つ、id は重ならない", () => {
    expect(STATS).toHaveLength(4);
    expect(new Set(STATS.map((stat) => stat.id)).size).toBe(4);
  });

  it("どの数字にも名前と単位があり、値は 1 以上", () => {
    for (const stat of STATS) {
      expect(stat.label.length).toBeGreaterThan(0);
      expect(stat.unit.length).toBeGreaterThan(0);
      expect(stat.value).toBeGreaterThanOrEqual(1);
    }
  });

  it("easeOutCubic は 0 から 1 へ、外れた t は端で止める", () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(0.5)).toBe(0.875);
    expect(easeOutCubic(1)).toBe(1);
    expect(easeOutCubic(-1)).toBe(0);
    expect(easeOutCubic(2)).toBe(1);
  });

  it("countUpValue は 0 から最終値まで、終わりに近づくほど遅くなる", () => {
    expect(countUpValue(1240, 0, 1200)).toBe(0);
    expect(countUpValue(1240, 600, 1200)).toBe(1085);
    expect(countUpValue(1240, 1200, 1200)).toBe(1240);
    expect(countUpValue(24, 300, 1200)).toBe(14);
  });

  it("時間を過ぎても最終値を超えない", () => {
    expect(countUpValue(1240, 2400, 1200)).toBe(1240);
  });

  it("duration が 0 以下なら最初から最終値", () => {
    expect(countUpValue(1240, 0, 0)).toBe(1240);
    expect(countUpValue(1240, 600, -1)).toBe(1240);
  });

  it("formatCount は三桁区切り", () => {
    expect(formatCount(0)).toBe("0");
    expect(formatCount(38)).toBe("38");
    expect(formatCount(1240)).toBe("1,240");
  });

  it("数え上げは 1 秒台で終わる", () => {
    expect(COUNT_UP_DURATION).toBeGreaterThan(0);
    expect(COUNT_UP_DURATION).toBeLessThanOrEqual(2000);
  });
});
