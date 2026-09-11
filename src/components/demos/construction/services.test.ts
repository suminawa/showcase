import { describe, expect, it } from "vitest";
import { formatFrom, SERVICES } from "./services";

describe("construction services", () => {
  it("メニューは 6 つ、id は重ならない", () => {
    expect(SERVICES).toHaveLength(6);
    expect(new Set(SERVICES.map((item) => item.id)).size).toBe(6);
  });

  it("並びは水まわり 3 つ、電気と空調 3 つ", () => {
    expect(SERVICES.map((item) => item.id)).toEqual([
      "leak",
      "clog",
      "water-heater",
      "outlet",
      "panel",
      "aircon",
    ]);
  });

  it("目安料金は 1,000 円以上の 100 円単位", () => {
    for (const item of SERVICES) {
      expect(item.from).toBeGreaterThanOrEqual(1000);
      expect(item.from % 100).toBe(0);
    }
  });

  it("どの品にも名前と、句点で終わる説明がある", () => {
    for (const item of SERVICES) {
      expect(item.name.length).toBeGreaterThan(0);
      expect(item.note.endsWith("。")).toBe(true);
    }
  });

  it("formatFrom は「〜」を付ける", () => {
    expect(formatFrom(8800)).toBe("8,800 円〜");
    expect(formatFrom(88000)).toBe("88,000 円〜");
  });
});
