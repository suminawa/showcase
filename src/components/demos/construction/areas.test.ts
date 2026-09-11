import { describe, expect, it } from "vitest";
import { areaPoint, AREAS } from "./areas";

describe("construction areas", () => {
  it("エリアは 6 つ、id も名前も重ならない", () => {
    expect(AREAS).toHaveLength(6);
    expect(new Set(AREAS.map((area) => area.id)).size).toBe(6);
    expect(new Set(AREAS.map((area) => area.label)).size).toBe(6);
  });

  it("半径は 0 より大きく 1 以下、角度は 0 以上 360 未満", () => {
    for (const area of AREAS) {
      expect(area.radius).toBeGreaterThan(0);
      expect(area.radius).toBeLessThanOrEqual(1);
      expect(area.angle).toBeGreaterThanOrEqual(0);
      expect(area.angle).toBeLessThan(360);
    }
  });

  it("角度 0 は真上、90 は右、180 は真下、270 は左", () => {
    expect(areaPoint({ radius: 1, angle: 0 }, 100, 80)).toEqual({
      x: 100,
      y: 20,
    });
    expect(areaPoint({ radius: 1, angle: 90 }, 100, 80)).toEqual({
      x: 180,
      y: 100,
    });
    expect(areaPoint({ radius: 1, angle: 180 }, 100, 80)).toEqual({
      x: 100,
      y: 180,
    });
    expect(areaPoint({ radius: 1, angle: 270 }, 100, 80)).toEqual({
      x: 20,
      y: 100,
    });
  });

  it("斜めの点は小数第 2 位まで丸める", () => {
    expect(areaPoint({ radius: 1, angle: 45 }, 100, 80)).toEqual({
      x: 156.57,
      y: 43.43,
    });
  });

  it("中心に近いほど点も中心に寄る", () => {
    expect(areaPoint({ radius: 0.5, angle: 90 }, 100, 80)).toEqual({
      x: 140,
      y: 100,
    });
  });

  it("どのエリアの点も外周の円の中に収まる", () => {
    for (const area of AREAS) {
      const point = areaPoint(area, 100, 90);
      expect(Math.hypot(point.x - 100, point.y - 100)).toBeLessThanOrEqual(
        90.01,
      );
    }
  });
});
