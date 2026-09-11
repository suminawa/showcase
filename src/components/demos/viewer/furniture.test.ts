import { describe, expect, it } from "vitest";
import {
  addFurniture,
  clampInside,
  defaultFurniture,
  footprintOf,
  FURNITURE,
  furnitureOnFloor,
  furnitureType,
  lighten,
  moveFurniture,
  partsInScene,
  removeFurniture,
  rotateFurniture,
  type FurnitureId,
  type PlacedFurniture,
} from "./furniture";
import { HOUSE } from "./house";

function bed(over: Partial<PlacedFurniture> = {}): PlacedFurniture {
  return { id: "f-1", type: "bed", floor: 1, x: 4.5, z: 4, rotation: 0, ...over };
}

describe("家具の表", () => {
  it("8 種あり、id と名前は重複しない", () => {
    expect(FURNITURE).toHaveLength(8);
    expect(new Set(FURNITURE.map((type) => type.id)).size).toBe(8);
    expect(new Set(FURNITURE.map((type) => type.name)).size).toBe(8);
  });

  it("寸法は決めたとおり", () => {
    expect(furnitureType("bed").name).toBe("ベッド");
    expect(furnitureType("bed").footprint).toEqual([1.4, 2]);
    expect(furnitureType("bed").height).toBe(0.5);
    expect(furnitureType("kitchen").name).toBe("キッチン");
    expect(furnitureType("kitchen").footprint).toEqual([2.4, 0.65]);
    expect(furnitureType("shelf").height).toBe(1.8);
  });

  it("どの箱も footprint と高さの中に収まる", () => {
    for (const type of FURNITURE) {
      const [w, d] = type.footprint;
      expect(type.parts.length).toBeGreaterThan(0);
      for (const part of type.parts) {
        expect(Math.abs(part.offset[0]) + part.size[0] / 2).toBeLessThanOrEqual(
          w / 2 + 1e-9,
        );
        expect(Math.abs(part.offset[2]) + part.size[2] / 2).toBeLessThanOrEqual(
          d / 2 + 1e-9,
        );
        expect(part.offset[1] - part.size[1] / 2).toBeGreaterThanOrEqual(-1e-9);
        expect(part.offset[1] + part.size[1] / 2).toBeLessThanOrEqual(
          type.height + 1e-9,
        );
        expect(part.color).toMatch(/^#[0-9a-f]{6}$/);
      }
    }
  });

  it("平面図の記号も footprint の中に収まる", () => {
    for (const type of FURNITURE) {
      const [w, d] = type.footprint;
      expect(type.glyph.rects.length).toBeGreaterThan(0);
      for (const rect of type.glyph.rects) {
        expect(Math.abs(rect.x) + rect.w / 2).toBeLessThanOrEqual(w / 2 + 1e-9);
        expect(Math.abs(rect.z) + rect.d / 2).toBeLessThanOrEqual(d / 2 + 1e-9);
      }
    }
  });

  it("未知の家具は投げる", () => {
    // 表を壊したときの挙動を見る。string を経由しないと型で弾かれて書けない
    const brokenId: string = "none";
    expect(() => furnitureType(brokenId as FurnitureId)).toThrow(
      "未知の家具: none",
    );
  });
});

describe("置く・動かす・回す・消す", () => {
  it("回すと footprint の縦横が入れ替わる", () => {
    expect(footprintOf(bed())).toEqual([1.4, 2]);
    expect(footprintOf(bed({ rotation: 90 }))).toEqual([2, 1.4]);
    expect(footprintOf(bed({ rotation: 180 }))).toEqual([1.4, 2]);
    expect(footprintOf(bed({ rotation: 270 }))).toEqual([2, 1.4]);
  });

  it("clampInside は輪郭の外に出さない（回したあとも）", () => {
    expect(clampInside(bed({ x: -3, z: -3 }))).toMatchObject({ x: 0.7, z: 1 });
    expect(clampInside(bed({ x: 99, z: 99 }))).toMatchObject({
      x: HOUSE.width - 0.7,
      z: HOUSE.depth - 1,
    });
    expect(clampInside(bed({ x: 0, z: 0, rotation: 90 }))).toMatchObject({
      x: 1,
      z: 0.7,
    });
  });

  it("addFurniture は格子に丸め、id を連番で付ける", () => {
    const one = addFurniture([], "sofa", 1, [2.13, 3.4]);
    expect(one).toHaveLength(1);
    expect(one[0]).toEqual({
      id: "f-1",
      type: "sofa",
      floor: 1,
      x: 2.25,
      z: 3.5,
      rotation: 0,
    });
    const two = addFurniture(one, "desk", 2, [4.5, 4]);
    expect(two.map((item) => item.id)).toEqual(["f-1", "f-2"]);
    expect(two[1].floor).toBe(2);
  });

  it("moveFurniture は格子に丸めて輪郭に収める", () => {
    const list = addFurniture([], "bed", 1, [4.5, 4]);
    expect(moveFurniture(list, "f-1", 0.1, 0.1)[0]).toMatchObject({
      x: 0.7,
      z: 1,
    });
    expect(moveFurniture(list, "f-9", 1, 1)).toEqual(list);
  });

  it("rotateFurniture は 4 回で元に戻る", () => {
    let list = addFurniture([], "bed", 1, [4.5, 4]);
    const seen: number[] = [];
    for (let i = 0; i < 4; i++) {
      list = rotateFurniture(list, "f-1");
      seen.push(list[0].rotation);
    }
    expect(seen).toEqual([90, 180, 270, 0]);
  });

  it("removeFurniture と furnitureOnFloor", () => {
    const list = addFurniture(
      addFurniture([], "bed", 1, [4.5, 4]),
      "desk",
      2,
      [4.5, 4],
    );
    expect(removeFurniture(list, "f-1").map((item) => item.id)).toEqual(["f-2"]);
    expect(furnitureOnFloor(list, 1).map((item) => item.id)).toEqual(["f-1"]);
    expect(furnitureOnFloor(list, 2).map((item) => item.id)).toEqual(["f-2"]);
  });
});

describe("partsInScene", () => {
  it("床座標を 3D の中心座標に写し、階の床の高さを足す", () => {
    const [part] = partsInScene(bed({ floor: 2 }));
    expect(part.id).toBe("f-1-0");
    expect(part.position[0]).toBeCloseTo(0, 6);
    expect(part.position[2]).toBeCloseTo(0, 6);
    expect(part.position[1]).toBeCloseTo(HOUSE.floors[2].base + 0.15, 6);
    expect(part.size).toEqual([1.4, 0.3, 2]);
  });

  it("90 度で x と z が入れ替わる", () => {
    const parts = partsInScene(bed({ rotation: 90 }));
    expect(parts[0].size).toEqual([2, 0.3, 1.4]);
    // 枕は北（z −0.75）から東（x +0.75）へ回る
    const pillow = parts[2];
    expect(pillow.position[0]).toBeCloseTo(0.75, 6);
    expect(pillow.position[2]).toBeCloseTo(0, 6);
    expect(pillow.size).toEqual([0.4, 0.12, 1.2]);
  });
});

describe("既定の家具", () => {
  it("10 点あり、id は連番", () => {
    const list = defaultFurniture();
    expect(list).toHaveLength(10);
    expect(list.map((item) => item.id)).toEqual([
      "f-1",
      "f-2",
      "f-3",
      "f-4",
      "f-5",
      "f-6",
      "f-7",
      "f-8",
      "f-9",
      "f-10",
    ]);
  });

  it("1F に 5 点、2F に 5 点", () => {
    expect(furnitureOnFloor(defaultFurniture(), 1)).toHaveLength(5);
    expect(furnitureOnFloor(defaultFurniture(), 2)).toHaveLength(5);
  });

  it("すべて輪郭の中に収まる", () => {
    for (const item of defaultFurniture()) {
      const [w, d] = footprintOf(item);
      expect(item.x - w / 2).toBeGreaterThanOrEqual(-1e-9);
      expect(item.z - d / 2).toBeGreaterThanOrEqual(-1e-9);
      expect(item.x + w / 2).toBeLessThanOrEqual(HOUSE.width + 1e-9);
      expect(item.z + d / 2).toBeLessThanOrEqual(HOUSE.depth + 1e-9);
      expect(clampInside(item)).toEqual(item);
    }
  });
});

describe("lighten", () => {
  it("明度だけを上げる", () => {
    expect(lighten("#000000", 0.12)).toBe("#1f1f1f");
    expect(lighten("#ffffff", 0.12)).toBe("#ffffff");
    const brighter = lighten("#7d8a99", 0.12);
    expect(brighter).toMatch(/^#[0-9a-f]{6}$/);
    expect(Number.parseInt(brighter.slice(1, 3), 16)).toBeGreaterThan(0x7d);
  });
});
