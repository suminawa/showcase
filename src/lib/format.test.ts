import { describe, expect, it } from "vitest";
import { formatYen, formatYenSuffix } from "./format";

describe("format", () => {
  it("formatYen は円記号を前に付ける", () => {
    expect(formatYen(380)).toBe("¥380");
    expect(formatYen(12345)).toBe("¥12,345");
    expect(formatYen(0)).toBe("¥0");
  });

  it("formatYenSuffix は「円」を後ろに付ける", () => {
    expect(formatYenSuffix(380)).toBe("380 円");
    expect(formatYenSuffix(12345)).toBe("12,345 円");
    expect(formatYenSuffix(0)).toBe("0 円");
  });
});
