/**
 * 見本: 間取りシミュレーターの間取り。部屋は「マス目を塗る」形で持つ。
 * 1 マス 0.5m の格子（18 × 16 = 288 マス）に、どの部屋のものかを 1 つずつ書く。
 * すべてのマスがどれかの部屋に属するので、隙間も重なりも出ず、面積の合計はいつでも 72m²。
 * 分割木（縦か横に半分ずつ切る木）と違い、廊下も L 字も飛び地も描ける。
 *
 * 座標は床の輪郭の北西の角を原点にしたメートル。x は東へ 0..9、z は南へ 0..8。
 * col は東へ、row は南へ。マスの番号は index = row * COLS + col。
 * 3D の中心座標（原点が床の真ん中）へは toScene で写す。
 * 乱数と Date は使わない（テストを決定的にするため）。
 */
import { HOUSE, type Floor } from "./house";

/** 部屋名は固定の一覧から選ぶ（自由入力にはしない） */
export const ROOM_LABELS = [
  "LDK",
  "リビング",
  "キッチン",
  "和室",
  "主寝室",
  "子ども部屋",
  "書斎",
  "浴室・洗面",
  "トイレ",
  "玄関ホール",
  "廊下・階段",
  "ホール・階段",
  "収納",
  "ワークスペース",
] as const;

export type RoomLabel = (typeof ROOM_LABELS)[number];

/** "room-<n>" の連番 */
export type RoomId = string;

export type Room = { id: RoomId; label: RoomLabel };

/** cells.length === CELL_COUNT。空きマスは無く、どのマスもどれかの部屋の id を持つ */
export type GridLayout = { rooms: Room[]; cells: RoomId[] };

/** 床の上の矩形。x, z は北西の角 */
export type Rect = { x: number; z: number; w: number; d: number };

/** 部屋のマスを長方形に分解した 1 つ。id は "<roomId>-<k>" */
export type RoomRect = Rect & { id: string; roomId: RoomId; label: RoomLabel };

/** 部屋の境目の壁。axis が x なら南北に走る線で、from/to は z の範囲 */
export type Divider = {
  id: string;
  axis: "x" | "z";
  at: number;
  from: number;
  to: number;
};

/** 1 マスの辺（m） */
export const CELL = 0.5;

export const COLS = Math.round(HOUSE.width / CELL);
export const ROWS = Math.round(HOUSE.depth / CELL);
export const CELL_COUNT = COLS * ROWS;

/** 家具の格子（m）。家具の位置はこの倍数に丸める */
export const SNAP = 0.25;

/** 床の輪郭。間口 9m × 奥行き 8m */
export const FLOOR_RECT: Rect = { x: 0, z: 0, w: HOUSE.width, d: HOUSE.depth };

/** 家具の格子に丸める */
export function snap(value: number): number {
  return Math.round(value / SNAP) * SNAP;
}

/** 床座標 → 3D の中心座標 */
export function toScene(x: number, z: number): [number, number] {
  return [x - HOUSE.width / 2, z - HOUSE.depth / 2];
}

export function cellAt(col: number, row: number): number {
  return row * COLS + col;
}

export function colRowOf(index: number): [number, number] {
  return [index % COLS, Math.floor(index / COLS)];
}

/** マスの中心（床座標 m） */
function cellCenter(index: number): [number, number] {
  const [col, row] = colRowOf(index);
  return [(col + 0.5) * CELL, (row + 0.5) * CELL];
}

/** 床座標（m）→ マス番号。輪郭の外なら null（9 と 8 はもう外） */
export function cellFromPoint(x: number, z: number): number | null {
  if (x < 0 || z < 0 || x >= HOUSE.width || z >= HOUSE.depth) return null;
  return cellAt(Math.floor(x / CELL), Math.floor(z / CELL));
}

/** そのマスがどの部屋か。番号は cellFromPoint が返した正しいものを渡すこと */
export function roomOfCell(layout: GridLayout, index: number): RoomId {
  return layout.cells[index];
}

/** マスを 1 つも持たない部屋を消す。部屋が 1 つも無くなるなら消さない */
export function prune(layout: GridLayout): GridLayout {
  const used = new Set(layout.cells);
  const rooms = layout.rooms.filter((room) => used.has(room.id));
  if (rooms.length === 0 || rooms.length === layout.rooms.length) return layout;
  return { rooms, cells: layout.cells };
}

/**
 * 通ったマスをまとめて roomId のものにする。
 * 1 マスも変わらないとき（同じ部屋・知らない部屋・番号が外）は同じ layout を返す。
 */
export function paintCells(
  layout: GridLayout,
  indexes: readonly number[],
  roomId: RoomId,
): GridLayout {
  if (!layout.rooms.some((room) => room.id === roomId)) return layout;
  let cells: RoomId[] | null = null;
  for (const index of indexes) {
    if (index < 0 || index >= CELL_COUNT) continue;
    const current = cells ?? layout.cells;
    if (current[index] === roomId) continue;
    if (!cells) cells = layout.cells.slice();
    cells[index] = roomId;
  }
  if (!cells) return layout;
  // 塗り替えた結果、マスが 0 になった部屋はここで消える
  return prune({ rooms: layout.rooms, cells });
}

export function paintCell(
  layout: GridLayout,
  index: number,
  roomId: RoomId,
): GridLayout {
  return paintCells(layout, [index], roomId);
}

/** 新しい id。部屋の表の中の最大番号 + 1 */
export function nextRoomId(layout: GridLayout): RoomId {
  let max = 0;
  for (const room of layout.rooms) {
    const match = /^room-(\d+)$/.exec(room.id);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `room-${max + 1}`;
}

/**
 * マスを持たない部屋を足す。次の塗りで形ができる。
 * 塗られないまま次の変更が来たら prune が消す。
 */
export function addRoom(
  layout: GridLayout,
  label: RoomLabel,
): { layout: GridLayout; id: RoomId } {
  const id = nextRoomId(layout);
  return {
    layout: { rooms: [...layout.rooms, { id, label }], cells: layout.cells },
    id,
  };
}

export function renameRoom(
  layout: GridLayout,
  id: RoomId,
  label: RoomLabel,
): GridLayout {
  const found = layout.rooms.find((room) => room.id === id);
  if (!found || found.label === label) return layout;
  return {
    rooms: layout.rooms.map((room) =>
      room.id === id ? { ...room, label } : room,
    ),
    cells: layout.cells,
  };
}

/** 広さ（m²）。マス数 × 0.25 */
export function roomArea(layout: GridLayout, id: RoomId): number {
  let count = 0;
  for (const cell of layout.cells) if (cell === id) count++;
  return count * CELL * CELL;
}

/** row の col..col+w-1 がすべて id のマスで、まだ使われていないか */
function rowMatches(
  layout: GridLayout,
  used: readonly boolean[],
  row: number,
  col: number,
  w: number,
  id: RoomId,
): boolean {
  for (let c = col; c < col + w; c++) {
    const index = cellAt(c, row);
    if (used[index] || layout.cells[index] !== id) return false;
  }
  return true;
}

/**
 * 部屋ごとに、マスを長方形に分解する。
 * 行ごとの連なりを取り、同じ連なりが続く限り下へ伸ばす貪欲法。
 * 3D の床（roomSlab）と平面図の塗りに使う。
 */
export function roomRects(layout: GridLayout): RoomRect[] {
  const labels = new Map(layout.rooms.map((room) => [room.id, room.label]));
  const used: boolean[] = Array.from({ length: CELL_COUNT }, () => false);
  const counts = new Map<RoomId, number>();
  const out: RoomRect[] = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const index = cellAt(col, row);
      if (used[index]) continue;
      const id = layout.cells[index];
      const label = labels.get(id);
      // 表に無い部屋のマスは描かない（保存データを壊したときだけ起きる）
      if (label === undefined) {
        used[index] = true;
        continue;
      }
      let w = 1;
      while (
        col + w < COLS &&
        !used[cellAt(col + w, row)] &&
        layout.cells[cellAt(col + w, row)] === id
      ) {
        w++;
      }
      let d = 1;
      while (row + d < ROWS && rowMatches(layout, used, row + d, col, w, id)) {
        d++;
      }
      for (let r = row; r < row + d; r++) {
        for (let c = col; c < col + w; c++) used[cellAt(c, r)] = true;
      }
      const k = (counts.get(id) ?? 0) + 1;
      counts.set(id, k);
      out.push({
        id: `${id}-${k}`,
        roomId: id,
        label,
        x: col * CELL,
        z: row * CELL,
        w: w * CELL,
        d: d * CELL,
      });
    }
  }
  return out;
}

/**
 * 部屋の境目の壁。横に隣り合う 2 マスの部屋が違えば南北に走る壁（axis: "x"）、
 * 縦に隣り合えば東西に走る壁（axis: "z"）。
 * 同じ線の上で連続する区間は 1 本にまとめる（両側がどの部屋かは問わない。
 * 壁としてつながっていれば 1 枚の板になる）。外周は外壁が受け持つので出さない。
 */
export function wallSegments(layout: GridLayout): Divider[] {
  const out: Divider[] = [];
  for (let col = 1; col < COLS; col++) {
    let start: number | null = null;
    for (let row = 0; row <= ROWS; row++) {
      const differs =
        row < ROWS &&
        layout.cells[cellAt(col - 1, row)] !== layout.cells[cellAt(col, row)];
      if (differs && start === null) start = row;
      if (!differs && start !== null) {
        out.push({
          id: `wx-${col}-${start}`,
          axis: "x",
          at: col * CELL,
          from: start * CELL,
          to: row * CELL,
        });
        start = null;
      }
    }
  }
  for (let row = 1; row < ROWS; row++) {
    let start: number | null = null;
    for (let col = 0; col <= COLS; col++) {
      const differs =
        col < COLS &&
        layout.cells[cellAt(col, row - 1)] !== layout.cells[cellAt(col, row)];
      if (differs && start === null) start = col;
      if (!differs && start !== null) {
        out.push({
          id: `wz-${row}-${start}`,
          axis: "z",
          at: row * CELL,
          from: start * CELL,
          to: col * CELL,
        });
        start = null;
      }
    }
  }
  return out;
}

/**
 * 注記と部屋名の位置。部屋のマスの重心にいちばん近い「その部屋のマス」の中心。
 * L 字の部屋でも名前が部屋の中に出る。同じ距離なら番号の小さいマス（どこでも同じ場所に出す）。
 */
export function labelAnchor(layout: GridLayout, id: RoomId): [number, number] {
  let sumX = 0;
  let sumZ = 0;
  let count = 0;
  for (let index = 0; index < CELL_COUNT; index++) {
    if (layout.cells[index] !== id) continue;
    const [x, z] = cellCenter(index);
    sumX += x;
    sumZ += z;
    count++;
  }
  // まだ 1 マスも塗られていない部屋は床の真ん中に出す
  if (count === 0) return [HOUSE.width / 2, HOUSE.depth / 2];
  const cx = sumX / count;
  const cz = sumZ / count;
  let best = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (let index = 0; index < CELL_COUNT; index++) {
    if (layout.cells[index] !== id) continue;
    const [x, z] = cellCenter(index);
    const distance = (x - cx) ** 2 + (z - cz) ** 2;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = index;
    }
  }
  return cellCenter(best);
}

type RoomPlan = Rect & { label: RoomLabel };

/**
 * 既定の間取り。前の分割木と同じ寸法の矩形を、そのままマス目に塗る。
 * 1F: LDK 5.5 × 6、和室 5.5 × 2、玄関ホール 3.5 × 3.5、浴室・洗面 3.5 × 2.5、廊下・階段 3.5 × 2。
 * 2F: 主寝室 5 × 4、子ども部屋 4 × 4、書斎 4 × 4、ホール・階段 5 × 4。どちらも合計 72m²。
 */
const DEFAULT_ROOMS: Record<Floor, readonly RoomPlan[]> = {
  1: [
    { label: "LDK", x: 0, z: 0, w: 5.5, d: 6 },
    { label: "和室", x: 0, z: 6, w: 5.5, d: 2 },
    { label: "玄関ホール", x: 5.5, z: 0, w: 3.5, d: 3.5 },
    { label: "浴室・洗面", x: 5.5, z: 3.5, w: 3.5, d: 2.5 },
    { label: "廊下・階段", x: 5.5, z: 6, w: 3.5, d: 2 },
  ],
  2: [
    { label: "主寝室", x: 0, z: 0, w: 5, d: 4 },
    { label: "子ども部屋", x: 5, z: 0, w: 4, d: 4 },
    { label: "書斎", x: 0, z: 4, w: 4, d: 4 },
    { label: "ホール・階段", x: 4, z: 4, w: 5, d: 4 },
  ],
};

export function defaultLayout(floor: Floor): GridLayout {
  const plans = DEFAULT_ROOMS[floor];
  const rooms: Room[] = plans.map((plan, index) => ({
    id: `room-${index + 1}`,
    label: plan.label,
  }));
  // どのマスも必ずどれかの部屋になるよう、まず先頭の部屋で埋めてから塗り重ねる
  const cells: RoomId[] = Array.from({ length: CELL_COUNT }, () => rooms[0].id);
  plans.forEach((plan, index) => {
    const id = rooms[index].id;
    const col0 = Math.round(plan.x / CELL);
    const row0 = Math.round(plan.z / CELL);
    const cols = Math.round(plan.w / CELL);
    const rows = Math.round(plan.d / CELL);
    for (let row = row0; row < row0 + rows; row++) {
      for (let col = col0; col < col0 + cols; col++) cells[cellAt(col, row)] = id;
    }
  });
  return { rooms, cells };
}
