import { describe, expect, it } from "vitest";
import { nearestInclusives, solveExcluded, taxOf, toInclusive } from "./tax";

describe("taxOf", () => {
  it("端数を整数の計算で処理する", () => {
    expect(taxOf(27272, 10, "floor")).toBe(2727);
    expect(taxOf(27272, 10, "ceil")).toBe(2728);
    expect(taxOf(8909, 10, "round")).toBe(891);
    expect(taxOf(1000, 8, "ceil")).toBe(80); // 80.00000000000001 にならない
  });
});

describe("solveExcluded", () => {
  it("税込 30,000 円（10%）は三通りとも作れる", () => {
    expect(solveExcluded(30000, 10, "round")).toEqual({ excluded: 27273, tax: 2727 });
    expect(solveExcluded(30000, 10, "floor")).toEqual({ excluded: 27273, tax: 2727 });
    expect(solveExcluded(30000, 10, "ceil")).toEqual({ excluded: 27272, tax: 2728 });
  });

  it("税込 9,800 円（10%）は切り捨てでは作れない", () => {
    expect(solveExcluded(9800, 10, "round")).toEqual({ excluded: 8909, tax: 891 });
    expect(solveExcluded(9800, 10, "ceil")).toEqual({ excluded: 8909, tax: 891 });
    expect(solveExcluded(9800, 10, "floor")).toBe(null);
    expect(nearestInclusives(9800, 10, "floor")).toEqual({ below: 9799, above: 9801 });
  });

  it("軽減税率でも同じ", () => {
    expect(solveExcluded(1080, 8, "round")).toEqual({ excluded: 1000, tax: 80 });
  });
});

describe("toInclusive", () => {
  it("税抜から税込へ", () => {
    expect(toInclusive(27273, 10, "floor")).toEqual({ tax: 2727, inclusive: 30000 });
    expect(toInclusive(0, 10, "round")).toEqual({ tax: 0, inclusive: 0 });
  });
});
