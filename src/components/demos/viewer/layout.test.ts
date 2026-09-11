import { describe, expect, it } from "vitest";
import {
  canMerge,
  canSplit,
  defaultLayout,
  dividers,
  findRoom,
  FLOOR_RECT,
  layoutRooms,
  mergeRoom,
  MIN_ROOM,
  minExtent,
  moveDivider,
  nextId,
  normalize,
  renameRoom,
  ROOM_LABELS,
  roomRect,
  snap,
  splitRoom,
  toScene,
  type LayoutNode,
  type RoomRect,
} from "./layout";

const FOOTPRINT = FLOOR_RECT.w * FLOOR_RECT.d;

function totalArea(node: LayoutNode): number {
  return layoutRooms(node, FLOOR_RECT).reduce(
    (sum, room) => sum + room.w * room.d,
    0,
  );
}

function overlaps(a: RoomRect, b: RoomRect): boolean {
  return (
    a.x < b.x + b.w && b.x < a.x + a.w && a.z < b.z + b.d && b.z < a.z + a.d
  );
}

function collectIds(node: LayoutNode): string[] {
  if (node.kind === "room") return [node.id];
  return [node.id, ...collectIds(node.first), ...collectIds(node.second)];
}

describe("既定の間取り", () => {
  it("1F は 5 部屋、面積の合計は 72m²", () => {
    const rooms = layoutRooms(defaultLayout(1), FLOOR_RECT);
    expect(rooms).toHaveLength(5);
    expect(rooms.map((room) => room.label)).toEqual([
      "LDK",
      "和室",
      "玄関ホール",
      "浴室・洗面",
      "廊下・階段",
    ]);
    expect(rooms.map((room) => room.area)).toEqual([33, 11, 12.25, 8.75, 7]);
    expect(totalArea(defaultLayout(1))).toBeCloseTo(FOOTPRINT, 6);
  });

  it("2F は 4 部屋、面積の合計は 72m²", () => {
    const rooms = layoutRooms(defaultLayout(2), FLOOR_RECT);
    expect(rooms).toHaveLength(4);
    expect(rooms.map((room) => room.label)).toEqual([
      "主寝室",
      "子ども部屋",
      "書斎",
      "ホール・階段",
    ]);
    expect(rooms.map((room) => room.area)).toEqual([20, 16, 16, 20]);
    expect(totalArea(defaultLayout(2))).toBeCloseTo(FOOTPRINT, 6);
  });

  it("どの 2 部屋も重ならず、輪郭からはみ出さない", () => {
    for (const floor of [1, 2] as const) {
      const rooms = layoutRooms(defaultLayout(floor), FLOOR_RECT);
      for (const room of rooms) {
        expect(room.x).toBeGreaterThanOrEqual(0);
        expect(room.z).toBeGreaterThanOrEqual(0);
        expect(room.x + room.w).toBeLessThanOrEqual(FLOOR_RECT.w + 1e-9);
        expect(room.z + room.d).toBeLessThanOrEqual(FLOOR_RECT.d + 1e-9);
      }
      for (let i = 0; i < rooms.length; i++) {
        for (let j = i + 1; j < rooms.length; j++) {
          expect(overlaps(rooms[i], rooms[j])).toBe(false);
        }
      }
    }
  });

  it("部屋名は一覧の中から選ばれている", () => {
    for (const floor of [1, 2] as const) {
      for (const room of layoutRooms(defaultLayout(floor), FLOOR_RECT)) {
        expect(ROOM_LABELS).toContain(room.label);
      }
    }
  });

  it("id は重複しない", () => {
    for (const floor of [1, 2] as const) {
      const ids = collectIds(defaultLayout(floor));
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});

describe("dividers", () => {
  it("本数は部屋の数 − 1", () => {
    for (const floor of [1, 2] as const) {
      const tree = defaultLayout(floor);
      expect(dividers(tree, FLOOR_RECT)).toHaveLength(
        layoutRooms(tree, FLOOR_RECT).length - 1,
      );
    }
  });

  it("線の両端は親の矩形の端に合う", () => {
    const [root] = dividers(defaultLayout(1), FLOOR_RECT);
    expect(root).toEqual({
      id: "split-1",
      axis: "x",
      at: 5.5,
      from: 0,
      to: 8,
    });
  });
});

describe("moveDivider", () => {
  it("格子に丸める", () => {
    const moved = moveDivider(defaultLayout(1), "split-1", 3.13);
    expect(dividers(moved, FLOOR_RECT)[0].at).toBe(3.25);
  });

  it("両側の最小辺より内には入らない", () => {
    const left = moveDivider(defaultLayout(1), "split-1", -5);
    expect(dividers(left, FLOOR_RECT)[0].at).toBe(MIN_ROOM);
    const right = moveDivider(defaultLayout(1), "split-1", 20);
    expect(dividers(right, FLOOR_RECT)[0].at).toBe(FLOOR_RECT.w - MIN_ROOM);
  });

  it("入れ子の部屋も最小辺を割らない", () => {
    const moved = moveDivider(defaultLayout(1), "split-3", 7);
    const rooms = layoutRooms(moved, FLOOR_RECT);
    expect(rooms.find((room) => room.label === "玄関ホール")?.d).toBe(5);
    for (const room of rooms) {
      expect(room.w).toBeGreaterThanOrEqual(MIN_ROOM - 1e-9);
      expect(room.d).toBeGreaterThanOrEqual(MIN_ROOM - 1e-9);
    }
    expect(totalArea(moved)).toBeCloseTo(FOOTPRINT, 6);
  });

  it("動かしても部屋の数は変わらない", () => {
    const moved = moveDivider(defaultLayout(2), "split-1", 2);
    expect(layoutRooms(moved, FLOOR_RECT)).toHaveLength(4);
  });

  it("知らない id は何も変えない", () => {
    const tree = defaultLayout(1);
    expect(moveDivider(tree, "split-99", 2)).toEqual(tree);
  });
});

describe("normalize", () => {
  it("親の壁が動いたとき、子の壁を矩形の中に戻す", () => {
    // 東の列の上の壁を南へ寄せると、その下の壁（split-4）も押し下げられる
    const moved = moveDivider(defaultLayout(1), "split-3", 7);
    const lines = dividers(moved, FLOOR_RECT);
    expect(lines.find((line) => line.id === "split-3")?.at).toBe(5);
    expect(lines.find((line) => line.id === "split-4")?.at).toBe(6.5);
  });

  it("木の形は変えない", () => {
    const tree = defaultLayout(2);
    expect(collectIds(normalize(tree, FLOOR_RECT))).toEqual(collectIds(tree));
  });

  it("矩形からはみ出した at を中に戻す", () => {
    const broken: LayoutNode = {
      kind: "split",
      id: "split-1",
      axis: "x",
      at: 99,
      first: { kind: "room", id: "room-1", label: "LDK" },
      second: { kind: "room", id: "room-2", label: "和室" },
    };
    const fixed = normalize(broken, FLOOR_RECT);
    expect(dividers(fixed, FLOOR_RECT)[0].at).toBe(FLOOR_RECT.w - MIN_ROOM);
  });
});

describe("splitRoom", () => {
  it("部屋が 1 つ増え、面積の合計は変わらない", () => {
    const split = splitRoom(defaultLayout(1), "room-1", "z");
    const rooms = layoutRooms(split, FLOOR_RECT);
    expect(rooms).toHaveLength(6);
    expect(totalArea(split)).toBeCloseTo(FOOTPRINT, 6);
    const halves = rooms.filter((room) => room.label === "LDK");
    expect(halves.map((room) => room.area)).toEqual([16.5, 16.5]);
    expect(halves.map((room) => room.id)).toEqual(["room-1", "room-6"]);
  });

  it("辺が最小辺の 2 倍に足りないときは何も変えない", () => {
    const tree = defaultLayout(1);
    // 和室は 5.5m × 2m。南北には分けられない
    expect(canSplit(tree, FLOOR_RECT, "room-2", "z")).toBe(false);
    expect(splitRoom(tree, "room-2", "z")).toEqual(tree);
    expect(canSplit(tree, FLOOR_RECT, "room-2", "x")).toBe(true);
    expect(layoutRooms(splitRoom(tree, "room-2", "x"), FLOOR_RECT)).toHaveLength(
      6,
    );
  });

  it("新しい id は木の中の最大 + 1", () => {
    const once = splitRoom(defaultLayout(2), "room-1", "x");
    expect(nextId(once, "room")).toBe("room-6");
    expect(nextId(once, "split")).toBe("split-5");
    const twice = splitRoom(once, "room-2", "x");
    const ids = collectIds(twice);
    expect(new Set(ids).size).toBe(ids.length);
    expect(layoutRooms(twice, FLOOR_RECT)).toHaveLength(6);
  });
});

describe("mergeRoom", () => {
  it("部屋が 1 つ減り、兄弟が広がる", () => {
    const merged = mergeRoom(defaultLayout(1), "room-2");
    const rooms = layoutRooms(merged, FLOOR_RECT);
    expect(rooms).toHaveLength(4);
    expect(rooms.find((room) => room.label === "LDK")?.area).toBe(44);
    expect(totalArea(merged)).toBeCloseTo(FOOTPRINT, 6);
  });

  it("兄弟の部分木は親の矩形を引き継ぐ", () => {
    // 玄関ホールを消すと、その下の 2 部屋が東の列いっぱいに広がる
    const merged = mergeRoom(defaultLayout(1), "room-3");
    const rooms = layoutRooms(merged, FLOOR_RECT);
    expect(rooms).toHaveLength(4);
    expect(rooms.find((room) => room.label === "浴室・洗面")?.d).toBe(6);
    expect(rooms.find((room) => room.label === "廊下・階段")?.d).toBe(2);
    expect(totalArea(merged)).toBeCloseTo(FOOTPRINT, 6);
  });

  it("部屋が 1 つだけのときは何も変えない", () => {
    const single: LayoutNode = { kind: "room", id: "room-1", label: "LDK" };
    expect(canMerge(single)).toBe(false);
    expect(mergeRoom(single, "room-1")).toEqual(single);
    expect(canMerge(defaultLayout(1))).toBe(true);
  });
});

describe("renameRoom", () => {
  it("選んだ部屋の名前だけを変える", () => {
    const renamed = renameRoom(defaultLayout(2), "room-3", "ワークスペース");
    expect(layoutRooms(renamed, FLOOR_RECT).map((room) => room.label)).toEqual([
      "主寝室",
      "子ども部屋",
      "ワークスペース",
      "ホール・階段",
    ]);
  });
});

describe("minExtent", () => {
  it("同じ向きの分割は足し算、違う向きは大きいほう", () => {
    const tree = defaultLayout(1);
    // 東の列は南北に 3 部屋ぶん要る
    expect(minExtent(tree, "z")).toBe(MIN_ROOM * 3);
    expect(minExtent(tree, "x")).toBe(MIN_ROOM * 2);
  });
});

describe("座標と id", () => {
  it("snap は格子に丸める", () => {
    expect(snap(3.13)).toBe(3.25);
    expect(snap(5.6)).toBe(5.5);
    expect(snap(5.63)).toBe(5.75);
  });

  it("toScene は床の真ん中を原点に写す", () => {
    expect(toScene(0, 0)).toEqual([-4.5, -4]);
    expect(toScene(9, 8)).toEqual([4.5, 4]);
    expect(toScene(4.5, 4)).toEqual([0, 0]);
  });

  it("findRoom と roomRect は id で引く", () => {
    const tree = defaultLayout(1);
    expect(findRoom(tree, "room-4")?.label).toBe("浴室・洗面");
    expect(findRoom(tree, "room-9")).toBeNull();
    expect(roomRect(tree, FLOOR_RECT, "room-4")).toEqual({
      id: "room-4",
      label: "浴室・洗面",
      x: 5.5,
      z: 3.5,
      w: 3.5,
      d: 2.5,
      area: 8.75,
    });
    expect(roomRect(tree, FLOOR_RECT, "room-9")).toBeNull();
  });

  it("nextId は最大の番号 + 1", () => {
    expect(nextId(defaultLayout(1), "room")).toBe("room-6");
    expect(nextId(defaultLayout(1), "split")).toBe("split-5");
  });
});
