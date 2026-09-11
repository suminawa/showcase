import { describe, expect, it } from "vitest";
import {
  cameraPose,
  FLOOR_TONE,
  HOUSE,
  INTERIOR_TONE,
  isCutaway,
  lightingPreset,
  SELECTED_FLOOR_TONE,
  showsRoof,
  visibleFloors,
  wallColorById,
  wallColors,
  type WallColor,
} from "./house";

describe("家の寸法", () => {
  it("間口 9m × 奥行き 8m の 2 階建て", () => {
    expect(HOUSE.width).toBe(9);
    expect(HOUSE.depth).toBe(8);
    expect(HOUSE.floors[2].base).toBeCloseTo(
      HOUSE.floors[1].height + HOUSE.slabThickness,
      6,
    );
  });
});

describe("外壁の色", () => {
  it("3 種あり、id は重複しない", () => {
    expect(wallColors).toHaveLength(3);
    expect(new Set(wallColors.map((c) => c.id)).size).toBe(3);
  });

  it("色は #rrggbb で書く", () => {
    for (const color of wallColors) {
      for (const value of [color.wall, color.trim, color.roof]) {
        expect(value).toMatch(/^#[0-9a-f]{6}$/);
      }
    }
  });

  it("wallColorById は id で引き、未知なら投げる", () => {
    expect(wallColorById("cedar").name).toBe("杉の下見板");
    // 表を壊したときの挙動を見る。string を経由しないと型で弾かれて書けない
    const brokenId: string = "none";
    expect(() => wallColorById(brokenId as WallColor["id"])).toThrow(
      "未知の外壁の色: none",
    );
  });
});

describe("3D の中の色", () => {
  it("床と内壁の色は #rrggbb", () => {
    for (const value of [
      FLOOR_TONE[1],
      FLOOR_TONE[2],
      SELECTED_FLOOR_TONE,
      INTERIOR_TONE,
    ]) {
      expect(value).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});

describe("昼夜の照明", () => {
  it("昼のほうが日射しが強く、夜は窓が光る", () => {
    const day = lightingPreset("day");
    const night = lightingPreset("night");
    expect(day.key.intensity).toBeGreaterThan(night.key.intensity);
    expect(night.windowEmissive).toBeGreaterThan(1);
    expect(day.windowEmissive).toBeLessThan(0.5);
  });

  it("背景と地面の色が昼夜で入れ替わる", () => {
    const day = lightingPreset("day");
    const night = lightingPreset("night");
    expect(day.background).not.toBe(night.background);
    expect(day.ground).not.toBe(night.ground);
    for (const value of [
      day.background,
      day.ground,
      night.background,
      night.ground,
    ]) {
      expect(value).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("太陽と月は反対側から差す", () => {
    expect(lightingPreset("day").key.position[0]).toBeGreaterThan(0);
    expect(lightingPreset("night").key.position[0]).toBeLessThan(0);
  });
});

describe("表示の切替", () => {
  it("全体のときだけ屋根を載せ、階を選んだときは腰で切る", () => {
    expect(showsRoof("all")).toBe(true);
    expect(showsRoof("1f")).toBe(false);
    expect(showsRoof("2f")).toBe(false);
    expect(isCutaway("all")).toBe(false);
    expect(isCutaway("1f")).toBe(true);
    expect(isCutaway("2f")).toBe(true);
  });

  it("visibleFloors は見せる階を返す", () => {
    expect(visibleFloors("all")).toEqual([1, 2]);
    expect(visibleFloors("1f")).toEqual([1]);
    expect(visibleFloors("2f")).toEqual([2]);
  });
});

describe("cameraPose", () => {
  it("斜めからは離れた上から見る", () => {
    for (const mode of ["1f", "2f", "all"] as const) {
      const pose = cameraPose(mode, "orbit");
      expect(pose.position[1]).toBeGreaterThan(5);
      expect(Math.hypot(pose.position[0], pose.position[2])).toBeGreaterThan(10);
    }
  });

  it("真上からの全体は屋根の上から見下ろす", () => {
    const pose = cameraPose("all", "top");
    expect(pose.position).toEqual([0, 22, 0.01]);
    expect(pose.target).toEqual([0, 0, 0]);
  });

  it("真上から階を選ぶと、その階の床の上から見下ろす", () => {
    expect(cameraPose("1f", "top").position[1]).toBe(18);
    const pose = cameraPose("2f", "top");
    expect(pose.target[1]).toBeCloseTo(HOUSE.floors[2].base, 6);
    expect(pose.position[1]).toBeCloseTo(HOUSE.floors[2].base + 18, 6);
    expect(Math.abs(pose.position[2])).toBeLessThan(0.1);
  });
});
