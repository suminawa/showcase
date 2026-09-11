import { describe, expect, it } from "vitest";
import {
  addRoom,
  CELL,
  cellAt,
  CELL_COUNT,
  cellFromPoint,
  cellsAlong,
  COLS,
  colRowOf,
  defaultLayout,
  FLOOR_RECT,
  labelAnchor,
  nextRoomId,
  PAINT_STEP,
  paintCell,
  paintCells,
  prune,
  renameRoom,
  ROOM_LABELS,
  roomArea,
  roomOfCell,
  roomRects,
  ROWS,
  snap,
  SNAP,
  toScene,
  wallSegments,
  type GridLayout,
} from "./grid";

/** 長方形（マス単位）の中のマス番号を並べる */
function cellsOf(col0: number, row0: number, cols: number, rows: number): number[] {
  const out: number[] = [];
  for (let row = row0; row < row0 + rows; row++) {
    for (let col = col0; col < col0 + cols; col++) out.push(cellAt(col, row));
  }
  return out;
}

/**
 * L 字の間取り。room-1 は西の 4 列（x 0〜2）と南の 4 行（z 6〜8）、room-2 が残り。
 * 重心（x 3.1, z 5.4）が room-1 のマスの外（へこみの中）に来るので、labelAnchor の検証に使う。
 */
function lShaped(): GridLayout {
  const cells: string[] = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      cells.push(col < 4 || row >= ROWS - 4 ? "room-1" : "room-2");
    }
  }
  return {
    rooms: [
      { id: "room-1", label: "LDK" },
      { id: "room-2", label: "和室" },
    ],
    cells,
  };
}

/** roomRects が「重ならず・隙間なく・同じ部屋のマスだけ」を覆っているか */
function checkRects(layout: GridLayout): void {
  const seen: boolean[] = Array.from({ length: CELL_COUNT }, () => false);
  for (const rect of roomRects(layout)) {
    const col0 = Math.round(rect.x / CELL);
    const row0 = Math.round(rect.z / CELL);
    const cols = Math.round(rect.w / CELL);
    const rows = Math.round(rect.d / CELL);
    for (const index of cellsOf(col0, row0, cols, rows)) {
      expect(seen[index]).toBe(false);
      expect(layout.cells[index]).toBe(rect.roomId);
      seen[index] = true;
    }
  }
  expect(seen.every(Boolean)).toBe(true);
}

describe("マス目", () => {
  it("0.5m のマスで 18 × 16 = 288", () => {
    expect(CELL).toBe(0.5);
    expect(COLS).toBe(18);
    expect(ROWS).toBe(16);
    expect(CELL_COUNT).toBe(288);
    expect(SNAP).toBe(0.25);
    expect(FLOOR_RECT).toEqual({ x: 0, z: 0, w: 9, d: 8 });
  });

  it("番号と (col, row) は行き来できる", () => {
    expect(cellAt(0, 0)).toBe(0);
    expect(cellAt(11, 12)).toBe(227);
    expect(cellAt(17, 15)).toBe(287);
    expect(colRowOf(0)).toEqual([0, 0]);
    expect(colRowOf(227)).toEqual([11, 12]);
    expect(colRowOf(287)).toEqual([17, 15]);
  });

  it("床座標からマスを引く。輪郭の外は null", () => {
    expect(cellFromPoint(0, 0)).toBe(0);
    expect(cellFromPoint(5.5, 6)).toBe(cellAt(11, 12));
    expect(cellFromPoint(8.99, 7.99)).toBe(cellAt(17, 15));
    expect(cellFromPoint(9, 4)).toBeNull();
    expect(cellFromPoint(4, 8)).toBeNull();
    expect(cellFromPoint(-0.1, 4)).toBeNull();
    expect(cellFromPoint(4, -0.1)).toBeNull();
  });

  it("snap は家具の格子に丸め、toScene は床の真ん中を原点に写す", () => {
    expect(snap(3.13)).toBe(3.25);
    expect(snap(5.6)).toBe(5.5);
    expect(toScene(0, 0)).toEqual([-4.5, -4]);
    expect(toScene(9, 8)).toEqual([4.5, 4]);
    expect(toScene(4.5, 4)).toEqual([0, 0]);
  });
});

describe("既定の間取り", () => {
  it("1F は 5 部屋、288 マスすべてが埋まり、面積の合計は 72m²", () => {
    const layout = defaultLayout(1);
    expect(layout.rooms).toEqual([
      { id: "room-1", label: "LDK" },
      { id: "room-2", label: "和室" },
      { id: "room-3", label: "玄関ホール" },
      { id: "room-4", label: "浴室・洗面" },
      { id: "room-5", label: "廊下・階段" },
    ]);
    expect(layout.cells).toHaveLength(CELL_COUNT);
    const ids = new Set(layout.rooms.map((room) => room.id));
    expect(layout.cells.every((id) => ids.has(id))).toBe(true);
    expect(layout.rooms.map((room) => roomArea(layout, room.id))).toEqual([
      33, 11, 12.25, 8.75, 7,
    ]);
    const total = layout.rooms.reduce(
      (sum, room) => sum + roomArea(layout, room.id),
      0,
    );
    expect(total).toBe(FLOOR_RECT.w * FLOOR_RECT.d);
  });

  it("2F は 4 部屋、面積の合計は 72m²", () => {
    const layout = defaultLayout(2);
    expect(layout.rooms).toEqual([
      { id: "room-1", label: "主寝室" },
      { id: "room-2", label: "子ども部屋" },
      { id: "room-3", label: "書斎" },
      { id: "room-4", label: "ホール・階段" },
    ]);
    expect(layout.rooms.map((room) => roomArea(layout, room.id))).toEqual([
      20, 16, 16, 20,
    ]);
    const total = layout.rooms.reduce(
      (sum, room) => sum + roomArea(layout, room.id),
      0,
    );
    expect(total).toBe(72);
  });

  it("部屋名は一覧の中から選ばれている", () => {
    for (const floor of [1, 2] as const) {
      for (const room of defaultLayout(floor).rooms) {
        expect(ROOM_LABELS).toContain(room.label);
      }
    }
  });
});

describe("roomRects", () => {
  it("既定の 1F は部屋ごとに 1 枚の長方形になる", () => {
    expect(roomRects(defaultLayout(1))).toEqual([
      { id: "room-1-1", roomId: "room-1", label: "LDK", x: 0, z: 0, w: 5.5, d: 6 },
      { id: "room-3-1", roomId: "room-3", label: "玄関ホール", x: 5.5, z: 0, w: 3.5, d: 3.5 },
      { id: "room-4-1", roomId: "room-4", label: "浴室・洗面", x: 5.5, z: 3.5, w: 3.5, d: 2.5 },
      { id: "room-2-1", roomId: "room-2", label: "和室", x: 0, z: 6, w: 5.5, d: 2 },
      { id: "room-5-1", roomId: "room-5", label: "廊下・階段", x: 5.5, z: 6, w: 3.5, d: 2 },
    ]);
  });

  it("既定の 2F も部屋ごとに 1 枚", () => {
    expect(roomRects(defaultLayout(2))).toEqual([
      { id: "room-1-1", roomId: "room-1", label: "主寝室", x: 0, z: 0, w: 5, d: 4 },
      { id: "room-2-1", roomId: "room-2", label: "子ども部屋", x: 5, z: 0, w: 4, d: 4 },
      { id: "room-3-1", roomId: "room-3", label: "書斎", x: 0, z: 4, w: 4, d: 4 },
      { id: "room-4-1", roomId: "room-4", label: "ホール・階段", x: 4, z: 4, w: 5, d: 4 },
    ]);
  });

  it("重ならず、隙間なく、同じ部屋のマスだけを覆う", () => {
    checkRects(defaultLayout(1));
    checkRects(defaultLayout(2));
    checkRects(lShaped());
    checkRects(paintCell(defaultLayout(1), cellAt(0, 0), "room-3"));
  });

  it("矩形の面積の合計は部屋の広さと合う", () => {
    const layout = lShaped();
    for (const room of layout.rooms) {
      const area = roomRects(layout)
        .filter((rect) => rect.roomId === room.id)
        .reduce((sum, rect) => sum + rect.w * rect.d, 0);
      expect(area).toBeCloseTo(roomArea(layout, room.id), 6);
    }
  });
});

describe("wallSegments", () => {
  it("既定の 1F は 3 本。同じ線の上で続く区間は 1 本にまとまる", () => {
    expect(wallSegments(defaultLayout(1))).toEqual([
      { id: "wx-11-0", axis: "x", at: 5.5, from: 0, to: 8 },
      { id: "wz-7-11", axis: "z", at: 3.5, from: 5.5, to: 9 },
      { id: "wz-12-0", axis: "z", at: 6, from: 0, to: 9 },
    ]);
  });

  it("既定の 2F は 3 本", () => {
    expect(wallSegments(defaultLayout(2))).toEqual([
      { id: "wx-8-8", axis: "x", at: 4, from: 4, to: 8 },
      { id: "wx-10-0", axis: "x", at: 5, from: 0, to: 4 },
      { id: "wz-8-0", axis: "z", at: 4, from: 0, to: 9 },
    ]);
  });

  it("L 字の境目は 2 本になる", () => {
    expect(wallSegments(lShaped())).toEqual([
      { id: "wx-4-0", axis: "x", at: 2, from: 0, to: 6 },
      { id: "wz-12-4", axis: "z", at: 6, from: 2, to: 9 },
    ]);
  });

  it("部屋が 1 つだけなら壁は無い", () => {
    const single: GridLayout = {
      rooms: [{ id: "room-1", label: "LDK" }],
      cells: Array.from({ length: CELL_COUNT }, () => "room-1"),
    };
    expect(wallSegments(single)).toEqual([]);
  });
});

describe("cellsAlong", () => {
  it("刻みはマスより十分細かい", () => {
    expect(PAINT_STEP).toBe(0.125);
    expect(PAINT_STEP).toBeLessThan(CELL);
  });

  it("横になぞると、通った列のマスを順に拾う", () => {
    const cells = cellsAlong({ x: 0.25, z: 0.25 }, { x: 1.75, z: 0.25 });
    expect([...new Set(cells)]).toEqual([
      cellAt(0, 0),
      cellAt(1, 0),
      cellAt(2, 0),
      cellAt(3, 0),
    ]);
  });

  it("縦になぞると、通った行のマスを順に拾う", () => {
    const cells = cellsAlong({ x: 0.25, z: 0.25 }, { x: 0.25, z: 1.75 });
    expect([...new Set(cells)]).toEqual([
      cellAt(0, 0),
      cellAt(0, 1),
      cellAt(0, 2),
      cellAt(0, 3),
    ]);
  });

  it("マスの角を斜めに越えたら、角を挟む両側のマスも足す", () => {
    // (0.5, 0.5) の角をかすめる短い斜めの線。すり抜けないよう 4 マスすべてを塗る
    const cells = new Set(cellsAlong({ x: 0.4, z: 0.4 }, { x: 0.6, z: 0.6 }));
    expect(cells).toEqual(
      new Set([cellAt(0, 0), cellAt(1, 0), cellAt(0, 1), cellAt(1, 1)]),
    );
  });

  it("長い斜めの線でも、途中のマスが抜けない", () => {
    const cells = new Set(cellsAlong({ x: 0.25, z: 0.25 }, { x: 2.25, z: 2.25 }));
    for (const step of [0, 1, 2, 3, 4]) {
      expect(cells.has(cellAt(step, step))).toBe(true);
    }
  });

  it("輪郭の外から入る線・外へ出る線は、中のマスだけを返す", () => {
    expect([
      ...new Set(cellsAlong({ x: -1, z: 0.25 }, { x: 0.75, z: 0.25 })),
    ]).toEqual([cellAt(0, 0), cellAt(1, 0)]);
    expect([
      ...new Set(cellsAlong({ x: 8.75, z: 0.25 }, { x: 9.5, z: 0.25 })),
    ]).toEqual([cellAt(17, 0)]);
    // 外を大きくまたいでも、返るのは必ず盤の中のマス
    const across = cellsAlong({ x: -2, z: -2 }, { x: 11, z: 10 });
    expect(across.length).toBeGreaterThan(0);
    expect(across.every((index) => index >= 0 && index < CELL_COUNT)).toBe(true);
  });

  it("両端とも外なら何も返さない", () => {
    expect(cellsAlong({ x: -2, z: -2 }, { x: -1, z: -1 })).toEqual([]);
  });
});

describe("塗る", () => {
  it("塗ったマスは新しい部屋のものになり、元の配列は書き換えない", () => {
    const layout = defaultLayout(1);
    const painted = paintCell(layout, cellAt(0, 0), "room-2");
    expect(roomOfCell(painted, cellAt(0, 0))).toBe("room-2");
    expect(roomOfCell(layout, cellAt(0, 0))).toBe("room-1");
    expect(roomArea(painted, "room-1")).toBe(32.75);
    expect(roomArea(painted, "room-2")).toBe(11.25);
    expect(painted.cells).not.toBe(layout.cells);
  });

  it("変わらないときは同じ参照を返す", () => {
    const layout = defaultLayout(1);
    expect(paintCell(layout, cellAt(0, 0), "room-1")).toBe(layout);
    expect(paintCells(layout, [cellAt(0, 0), cellAt(1, 0)], "room-1")).toBe(layout);
    expect(paintCell(layout, cellAt(0, 0), "room-9")).toBe(layout);
    expect(paintCell(layout, -1, "room-2")).toBe(layout);
    expect(paintCell(layout, CELL_COUNT, "room-2")).toBe(layout);
  });

  it("まとめて塗ると、通ったマスがすべて移る", () => {
    const layout = defaultLayout(2);
    const painted = paintCells(layout, cellsOf(0, 0, 2, 2), "room-2");
    expect(roomArea(painted, "room-2")).toBe(17);
    expect(roomArea(painted, "room-1")).toBe(19);
  });

  it("最後のマスを塗られた部屋は消える", () => {
    const layout = defaultLayout(1);
    const painted = paintCells(layout, cellsOf(11, 12, 7, 4), "room-2");
    expect(painted.rooms.map((room) => room.id)).toEqual([
      "room-1",
      "room-2",
      "room-3",
      "room-4",
    ]);
    expect(roomArea(painted, "room-2")).toBe(18);
    expect(layout.rooms).toHaveLength(5);
  });
});

describe("部屋を足す・名前を変える・消す", () => {
  it("新しい部屋はマスを持たずに足され、塗って形ができる", () => {
    const base = defaultLayout(1);
    const { layout, id } = addRoom(base, "収納");
    expect(id).toBe("room-6");
    expect(layout.rooms).toHaveLength(6);
    expect(roomArea(layout, id)).toBe(0);
    expect(layout.cells).toBe(base.cells);
    const painted = paintCell(layout, cellAt(0, 0), id);
    expect(roomArea(painted, id)).toBe(0.25);
    expect(painted.rooms).toHaveLength(6);
  });

  it("塗られないまま次の変更が来たら消える", () => {
    const { layout } = addRoom(defaultLayout(1), "収納");
    const painted = paintCell(layout, cellAt(0, 0), "room-2");
    expect(painted.rooms.map((room) => room.id)).toEqual([
      "room-1",
      "room-2",
      "room-3",
      "room-4",
      "room-5",
    ]);
  });

  it("nextRoomId は最大の番号 + 1", () => {
    expect(nextRoomId(defaultLayout(1))).toBe("room-6");
    expect(nextRoomId(defaultLayout(2))).toBe("room-5");
    expect(nextRoomId(addRoom(defaultLayout(1), "収納").layout)).toBe("room-7");
  });

  it("renameRoom は選んだ部屋の名前だけを変える", () => {
    const base = defaultLayout(2);
    const renamed = renameRoom(base, "room-3", "ワークスペース");
    expect(renamed.rooms.map((room) => room.label)).toEqual([
      "主寝室",
      "子ども部屋",
      "ワークスペース",
      "ホール・階段",
    ]);
    expect(renamed.cells).toBe(base.cells);
    expect(renameRoom(base, "room-9", "収納")).toBe(base);
    expect(renameRoom(base, "room-3", "書斎")).toBe(base);
  });

  it("prune はマス 0 の部屋を消すが、部屋が 1 つも無くなるなら消さない", () => {
    const base = defaultLayout(1);
    expect(prune(base)).toBe(base);
    expect(prune(addRoom(base, "収納").layout).rooms).toHaveLength(5);
    const orphan: GridLayout = {
      rooms: [{ id: "room-1", label: "LDK" }],
      cells: Array.from({ length: CELL_COUNT }, () => "room-9"),
    };
    expect(prune(orphan)).toBe(orphan);
  });
});

describe("labelAnchor", () => {
  it("重心にいちばん近い、その部屋のマスの中心を返す", () => {
    const layout = defaultLayout(1);
    expect(labelAnchor(layout, "room-1")).toEqual([2.75, 2.75]);
    expect(labelAnchor(layout, "room-3")).toEqual([7.25, 1.75]);
  });

  it("L 字の部屋でも部屋のマスに乗る", () => {
    const layout = lShaped();
    expect(labelAnchor(layout, "room-1")).toEqual([3.25, 6.25]);
    expect(cellFromPoint(3.25, 6.25)).toBe(cellAt(6, 12));
    expect(roomOfCell(layout, cellAt(6, 12))).toBe("room-1");
  });

  it("まだ塗られていない部屋は床の真ん中に出す", () => {
    const { layout, id } = addRoom(defaultLayout(1), "収納");
    expect(labelAnchor(layout, id)).toEqual([4.5, 4]);
  });
});
