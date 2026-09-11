import { describe, expect, it } from "vitest";
import {
  addRoom,
  cellAt,
  defaultLayout,
  paintCells,
  roomRects,
  wallSegments,
  type GridLayout,
} from "./grid";
import { HOUSE } from "./house";
import {
  annotationPositions,
  INTERIOR_WALL,
  interiorWallPanels,
  roofShape,
  roomSlab,
  slabPanel,
  spread,
  wallPanels,
  WINDOW,
  windowPanels,
} from "./shell";

/**
 * 同じ部屋が 2 枚の長方形に分かれる間取り。2F の主寝室（room-1）の北側を
 * 子ども部屋へ 1m ぶん食い込ませて L 字にする。
 * roomRects は北の帯（z 0〜0.5）と残り（z 0.5〜4）の 2 枚に分ける。
 */
function twoRectRoom(): GridLayout {
  return paintCells(
    defaultLayout(2),
    [cellAt(10, 0), cellAt(11, 0)],
    "room-1",
  );
}

describe("spread", () => {
  it("端の余白を半分ずつ残して等間隔に並べる", () => {
    expect(spread(3, 9)).toEqual([-3, 0, 3]);
    expect(spread(2, 8)).toEqual([-2, 2]);
    expect(spread(1, 4)).toEqual([0]);
  });
});

describe("床", () => {
  it("スラブの上面が各階の床の高さと合う", () => {
    for (const floor of [1, 2] as const) {
      const slab = slabPanel(floor);
      expect(slab.position[1] + slab.size[1] / 2).toBeCloseTo(
        HOUSE.floors[floor].base,
        6,
      );
      expect(slab.size[0]).toBe(HOUSE.width);
      expect(slab.size[2]).toBe(HOUSE.depth);
    }
  });

  it("2 階のスラブは 1 階の天井のすぐ上に載る", () => {
    const slab = slabPanel(2);
    expect(slab.position[1] - slab.size[1] / 2).toBeCloseTo(
      HOUSE.floors[1].height,
      6,
    );
  });

  it("部屋の床は部屋の矩形ちょうどの大きさで、床の高さに置く", () => {
    const [ldk] = roomRects(defaultLayout(1));
    expect(ldk.label).toBe("LDK");
    const slab = roomSlab(ldk, 1);
    // 同じ部屋の矩形どうしが継ぎ目なく並ぶよう、隙間は空けない
    expect(slab.size[0]).toBe(ldk.w);
    expect(slab.size[2]).toBe(ldk.d);
    // 床座標の中心が 3D の中心座標に写る
    expect(slab.position[0]).toBeCloseTo(ldk.x + ldk.w / 2 - HOUSE.width / 2, 6);
    expect(slab.position[2]).toBeCloseTo(ldk.z + ldk.d / 2 - HOUSE.depth / 2, 6);
    expect(slab.position[1] - slab.size[1] / 2).toBeCloseTo(0, 6);
  });

  it("同じ部屋が 2 枚に分かれても、床は継ぎ目なく隣り合う", () => {
    const layout = twoRectRoom();
    const rects = roomRects(layout).filter((rect) => rect.roomId === "room-1");
    expect(rects).toHaveLength(2);
    const [north, south] = rects.map((rect) => roomSlab(rect, 2));
    // 北の板の南端と、南の板の北端がちょうど同じ線に乗る（隙間も重なりも無い）
    expect(north.position[2] + north.size[2] / 2).toBeCloseTo(
      south.position[2] - south.size[2] / 2,
      9,
    );
    // 高さも厚みも同じなので段差にならない
    expect(north.position[1]).toBe(south.position[1]);
    expect(north.size[1]).toBe(south.size[1]);
  });

  it("部屋の床の id は階をまたいでも重複しない", () => {
    const ids = [
      ...roomRects(defaultLayout(1)).map((rect) => roomSlab(rect, 1)),
      ...roomRects(defaultLayout(2)).map((rect) => roomSlab(rect, 2)),
    ].map((panel) => panel.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("外壁", () => {
  it("4 枚とも外側の面が間口・奥行きの線に乗る", () => {
    const walls = wallPanels(1, false);
    expect(walls).toHaveLength(4);
    const north = walls.filter((w) => w.id === "f1-north")[0];
    expect(north.position[2] - north.size[2] / 2).toBeCloseTo(
      -HOUSE.depth / 2,
      6,
    );
    const east = walls.filter((w) => w.id === "f1-east")[0];
    expect(east.position[0] + east.size[0] / 2).toBeCloseTo(HOUSE.width / 2, 6);
  });

  it("切らないときは天井まで、切るときは腰の高さ", () => {
    const full = wallPanels(2, false)[0];
    expect(full.size[1]).toBe(HOUSE.floors[2].height);
    expect(full.position[1] - full.size[1] / 2).toBeCloseTo(
      HOUSE.floors[2].base,
      6,
    );

    const cut = wallPanels(2, true)[0];
    expect(cut.size[1]).toBe(HOUSE.cutawayWallHeight);
    expect(cut.position[1] - cut.size[1] / 2).toBeCloseTo(
      HOUSE.floors[2].base,
      6,
    );
  });

  it("id は階をまたいでも重複しない", () => {
    const ids = [...wallPanels(1, false), ...wallPanels(2, false)].map(
      (w) => w.id,
    );
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("内壁", () => {
  it("境目の壁の本数だけ立ち、厚みは 0.12m", () => {
    const layout = defaultLayout(1);
    const walls = interiorWallPanels(wallSegments(layout), 1, false);
    expect(walls).toHaveLength(3);
    for (const wall of walls) {
      expect(Math.min(wall.size[0], wall.size[2])).toBeCloseTo(INTERIOR_WALL, 6);
      expect(wall.size[1]).toBe(HOUSE.floors[1].height);
      expect(wall.position[1] - wall.size[1] / 2).toBeCloseTo(0, 6);
    }
  });

  it("最初の 1 枚は東西を分ける壁（南北に走る）で、南北いっぱいに 1 本", () => {
    const [wall] = interiorWallPanels(wallSegments(defaultLayout(1)), 1, false);
    expect(wall.size[0]).toBeCloseTo(INTERIOR_WALL, 6);
    expect(wall.size[2]).toBe(HOUSE.depth);
    expect(wall.position[0]).toBeCloseTo(5.5 - HOUSE.width / 2, 6);
  });

  it("断面のときは腰の高さで切る", () => {
    const [wall] = interiorWallPanels(wallSegments(defaultLayout(2)), 2, true);
    expect(wall.size[1]).toBe(HOUSE.cutawayWallHeight);
    expect(wall.position[1] - wall.size[1] / 2).toBeCloseTo(
      HOUSE.floors[2].base,
      6,
    );
  });

  it("id は階をまたいでも重複しない", () => {
    const ids = [
      ...interiorWallPanels(wallSegments(defaultLayout(1)), 1, false),
      ...interiorWallPanels(wallSegments(defaultLayout(2)), 2, false),
    ].map((panel) => panel.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("窓", () => {
  it("1 つの階に 10 か所", () => {
    expect(windowPanels(1)).toHaveLength(10);
    expect(new Set(windowPanels(1).map((w) => w.id)).size).toBe(10);
  });

  it("腰高から窓の高さぶん取り、天井の内側に収まる", () => {
    for (const floor of [1, 2] as const) {
      const { base, height } = HOUSE.floors[floor];
      for (const win of windowPanels(floor)) {
        expect(win.position[1] - WINDOW.height / 2).toBeCloseTo(
          base + WINDOW.sill,
          6,
        );
        expect(win.position[1] + WINDOW.height / 2).toBeLessThan(base + height);
      }
    }
  });

  it("外壁の面から出るのは 2cm だけ", () => {
    for (const win of windowPanels(1)) {
      expect(Math.abs(win.position[0]) + win.size[0] / 2).toBeLessThanOrEqual(
        HOUSE.width / 2 + 0.021,
      );
      expect(Math.abs(win.position[2]) + win.size[2] / 2).toBeLessThanOrEqual(
        HOUSE.depth / 2 + 0.021,
      );
    }
  });
});

describe("屋根", () => {
  it("四角錐の底面が軒の出まで届く", () => {
    const roof = roofShape();
    const halfSide = roof.radius * Math.SQRT1_2;
    expect(halfSide * 2).toBeCloseTo(HOUSE.width + HOUSE.eaves * 2, 6);
    expect(halfSide * 2 * roof.scaleZ).toBeCloseTo(
      HOUSE.depth + HOUSE.eaves * 2,
      6,
    );
  });

  it("2 階の天井の上に載り、棟までの高さは決めたぶん", () => {
    const roof = roofShape();
    const top = HOUSE.floors[2].base + HOUSE.floors[2].height;
    expect(roof.position[1] - roof.height / 2).toBeCloseTo(top, 6);
    expect(roof.height).toBe(HOUSE.roofRise);
    expect(roof.rotationY).toBeCloseTo(Math.PI / 4, 6);
  });
});

describe("注記", () => {
  it("部屋ごとに 1 つ、labelAnchor の位置に、天井の 0.35m 下に置く", () => {
    const notes = annotationPositions(defaultLayout(2), 2);
    expect(notes).toHaveLength(4);
    expect(notes[0].label).toBe("主寝室");
    expect(notes[0].area).toBe(20);
    // 主寝室（x 0〜5、z 0〜4）の重心にいちばん近いマスの中心は (2.25, 1.75)
    expect(notes[0].position[0]).toBeCloseTo(2.25 - HOUSE.width / 2, 6);
    expect(notes[0].position[2]).toBeCloseTo(1.75 - HOUSE.depth / 2, 6);
    expect(notes[0].position[1]).toBeCloseTo(
      HOUSE.floors[2].base + HOUSE.floors[2].height - 0.35,
      6,
    );
  });

  it("まだ 1 マスも塗られていない部屋には吹き出しを出さない", () => {
    const { layout, id } = addRoom(defaultLayout(1), "収納");
    const notes = annotationPositions(layout, 1);
    // 「新しい部屋」を足しただけでは、床の真ん中に 0.0 m² の吹き出しを出さない
    expect(notes).toHaveLength(5);
    expect(notes.map((note) => note.id)).not.toContain(`f1-${id}`);
    expect(notes.every((note) => note.area > 0)).toBe(true);
  });

  it("id は階をまたいでも重複しない", () => {
    const ids = [
      ...annotationPositions(defaultLayout(1), 1),
      ...annotationPositions(defaultLayout(2), 2),
    ].map((note) => note.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
