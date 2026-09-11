import { describe, expect, it } from "vitest";
import {
  annotationPositions,
  cameraPose,
  effectiveFloorMode,
  HOUSE,
  isCutaway,
  lightingPreset,
  rooms,
  showsRoof,
  visibleRooms,
  wallColorById,
  wallColors,
  type WallColor,
} from "./house";

describe("家の表", () => {
  it("各部屋の広さは幅 × 奥行きと合う", () => {
    for (const room of rooms) {
      expect(room.area).toBeCloseTo(room.size[0] * room.size[2], 6);
    }
  });

  it("各階の広さの合計は間口 × 奥行き", () => {
    const footprint = HOUSE.width * HOUSE.depth;
    for (const floor of [1, 2] as const) {
      const total = rooms
        .filter((room) => room.floor === floor)
        .reduce((sum, room) => sum + room.area, 0);
      expect(total).toBeCloseTo(footprint, 6);
    }
  });

  it("どの部屋も建物の外に出ない", () => {
    for (const room of rooms) {
      expect(Math.abs(room.position[0]) + room.size[0] / 2).toBeLessThanOrEqual(
        HOUSE.width / 2 + 1e-6,
      );
      expect(Math.abs(room.position[2]) + room.size[2] / 2).toBeLessThanOrEqual(
        HOUSE.depth / 2 + 1e-6,
      );
    }
  });

  it("部屋の高さと中心は、その階の床から天井までに収まる", () => {
    for (const room of rooms) {
      const { base, height } = HOUSE.floors[room.floor];
      expect(room.size[1]).toBe(height);
      expect(room.position[1]).toBeCloseTo(base + height / 2, 6);
    }
  });

  it("id は重複しない", () => {
    const ids = rooms.map((room) => room.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("visibleRooms", () => {
  it("1f は 1 階だけ、2f は 2 階だけ、all は全部", () => {
    expect(visibleRooms(rooms, "1f").map((r) => r.id)).toEqual([
      "ldk",
      "entrance",
      "bath",
      "washitsu",
      "corridor",
    ]);
    expect(visibleRooms(rooms, "2f").map((r) => r.id)).toEqual([
      "bedroom",
      "kids",
      "study",
      "hall",
    ]);
    expect(visibleRooms(rooms, "all")).toHaveLength(rooms.length);
  });

  it("元の表を書き換えない", () => {
    const before = rooms.length;
    visibleRooms(rooms, "all").pop();
    expect(rooms).toHaveLength(before);
  });
});

describe("annotationPositions", () => {
  it("注記は 5 点", () => {
    expect(annotationPositions(rooms)).toHaveLength(5);
  });

  it("見えている階の注記だけを返す", () => {
    expect(
      annotationPositions(visibleRooms(rooms, "1f")).map((a) => a.id),
    ).toEqual(["ldk", "bath", "washitsu"]);
    expect(
      annotationPositions(visibleRooms(rooms, "2f")).map((a) => a.id),
    ).toEqual(["bedroom", "kids"]);
  });

  it("吹き出しは部屋の天井の少し下に置く", () => {
    const [ldk] = annotationPositions(visibleRooms(rooms, "1f"));
    expect(ldk.label).toBe("LDK");
    expect(ldk.area).toBe(33);
    expect(ldk.position[0]).toBeCloseTo(-1.75, 6);
    expect(ldk.position[1]).toBeCloseTo(2.35, 6);
    expect(ldk.position[2]).toBeCloseTo(-1, 6);
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
  it("全体を回して見るときだけ屋根を載せる", () => {
    expect(showsRoof("all", "orbit")).toBe(true);
    expect(showsRoof("1f", "orbit")).toBe(false);
    expect(showsRoof("2f", "orbit")).toBe(false);
    expect(showsRoof("all", "plan")).toBe(false);
    expect(isCutaway("all", "orbit")).toBe(false);
    expect(isCutaway("all", "plan")).toBe(true);
    expect(isCutaway("1f", "orbit")).toBe(true);
  });

  it("間取りは 1 つの階だけ見せる（断面）", () => {
    expect(effectiveFloorMode("all", "plan")).toBe("1f");
    expect(effectiveFloorMode("2f", "plan")).toBe("2f");
    expect(effectiveFloorMode("1f", "plan")).toBe("1f");
    expect(effectiveFloorMode("all", "orbit")).toBe("all");
  });
});

describe("cameraPose", () => {
  it("間取りは真上から見下ろす", () => {
    const pose = cameraPose("all", "plan");
    expect(pose.position[0]).toBe(0);
    expect(Math.abs(pose.position[2])).toBeLessThan(0.1);
    expect(pose.position[1]).toBeGreaterThan(pose.target[1] + 10);
  });

  it("2 階の間取りは 1 階より高い位置から見る", () => {
    expect(cameraPose("2f", "plan").position[1]).toBeGreaterThan(
      cameraPose("1f", "plan").position[1],
    );
  });

  it("回して見るときは斜め上の離れた位置", () => {
    for (const mode of ["1f", "2f", "all"] as const) {
      const pose = cameraPose(mode, "orbit");
      expect(pose.position[1]).toBeGreaterThan(5);
      expect(Math.hypot(pose.position[0], pose.position[2])).toBeGreaterThan(10);
    }
  });
});
