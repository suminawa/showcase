import { describe, expect, it } from "vitest";
import { HOUSE, rooms } from "./house";
import {
  roofShape,
  roomSlab,
  slabPanel,
  spread,
  wallPanels,
  WINDOW,
  windowPanels,
} from "./shell";

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

  it("部屋の床は部屋より少し小さく、床の高さに置く", () => {
    const ldk = rooms.filter((room) => room.id === "ldk")[0];
    const slab = roomSlab(ldk);
    expect(slab.size[0]).toBeLessThan(ldk.size[0]);
    expect(slab.size[2]).toBeLessThan(ldk.size[2]);
    expect(slab.position[0]).toBe(ldk.position[0]);
    expect(slab.position[2]).toBe(ldk.position[2]);
    expect(slab.position[1] - slab.size[1] / 2).toBeCloseTo(0, 6);
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
