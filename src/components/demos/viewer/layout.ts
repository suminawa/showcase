/**
 * 見本: 間取りシミュレーターの間取り。部屋を自由な矩形にすると重なりと隙間の管理が要るので、
 * 床の輪郭を縦か横の壁で 2 つに分ける操作を繰り返した木（分割木）で持つ。葉が部屋。
 * 壁を動かす = 分割位置を動かすだけなので、部屋はいつでも輪郭を隙間なく埋め、重ならない。
 *
 * 座標は床の輪郭の北西の角を原点にしたメートル。x は東へ 0..9、z は南へ 0..8。
 * 3D の中心座標（原点が床の真ん中）へは toScene で写す。
 */
import { HOUSE, type Floor } from "./house";

/** x: 東西方向に分ける壁（南北に走る線）, z: その逆 */
export type Axis = "x" | "z";

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

export type RoomNode = { kind: "room"; id: string; label: RoomLabel };

export type SplitNode = {
  kind: "split";
  id: string;
  axis: Axis;
  /** 分割線の絶対座標（親の矩形の中ではなく床全体の座標） */
  at: number;
  /** 西または北側 */
  first: LayoutNode;
  /** 東または南側 */
  second: LayoutNode;
};

export type LayoutNode = RoomNode | SplitNode;

/** 床の上の矩形。x, z は北西の角 */
export type Rect = { x: number; z: number; w: number; d: number };

export type RoomRect = Rect & {
  id: string;
  label: RoomLabel;
  /** 広さ（m²）。小数 2 桁で丸める */
  area: number;
};

export type Divider = {
  id: string;
  axis: Axis;
  at: number;
  /** 線の両端。axis が x なら z 方向の範囲 */
  from: number;
  to: number;
};

/** 格子（m）。壁と家具の位置はこの倍数に丸める */
export const SNAP = 0.25;

/** 部屋の最小辺（m） */
export const MIN_ROOM = 1.5;

/** 床の輪郭。間口 9m × 奥行き 8m */
export const FLOOR_RECT: Rect = { x: 0, z: 0, w: HOUSE.width, d: HOUSE.depth };

/** 格子に丸める */
export function snap(value: number): number {
  return Math.round(value / SNAP) * SNAP;
}

/**
 * 挟んで直す。lo と hi が逆転する（親の矩形が両側の最小値に足りない）ときは lo を優先する。
 * 矩形が負の幅にならないようにするため。
 */
function clampAt(value: number, lo: number, hi: number): number {
  return Math.min(Math.max(value, lo), Math.max(lo, hi));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** 分割線で親の矩形を 2 つに割る */
function splitRect(rect: Rect, axis: Axis, at: number): [Rect, Rect] {
  if (axis === "x") {
    return [
      { x: rect.x, z: rect.z, w: at - rect.x, d: rect.d },
      { x: at, z: rect.z, w: rect.x + rect.w - at, d: rect.d },
    ];
  }
  return [
    { x: rect.x, z: rect.z, w: rect.w, d: at - rect.z },
    { x: rect.x, z: at, w: rect.w, d: rect.z + rect.d - at },
  ];
}

/** 木を矩形に展開する。並びは木をたどった順（西・北が先） */
export function layoutRooms(node: LayoutNode, rect: Rect): RoomRect[] {
  if (node.kind === "room") {
    return [
      {
        id: node.id,
        label: node.label,
        x: rect.x,
        z: rect.z,
        w: rect.w,
        d: rect.d,
        area: round2(rect.w * rect.d),
      },
    ];
  }
  const [first, second] = splitRect(rect, node.axis, node.at);
  return [...layoutRooms(node.first, first), ...layoutRooms(node.second, second)];
}

/** 分割線の一覧。親が先、子が後 */
export function dividers(node: LayoutNode, rect: Rect): Divider[] {
  if (node.kind === "room") return [];
  const [first, second] = splitRect(rect, node.axis, node.at);
  const line: Divider =
    node.axis === "x"
      ? { id: node.id, axis: "x", at: node.at, from: rect.z, to: rect.z + rect.d }
      : { id: node.id, axis: "z", at: node.at, from: rect.x, to: rect.x + rect.w };
  return [line, ...dividers(node.first, first), ...dividers(node.second, second)];
}

/** その部分木が axis 方向に必要な最小の長さ */
export function minExtent(node: LayoutNode, axis: Axis): number {
  if (node.kind === "room") return MIN_ROOM;
  const first = minExtent(node.first, axis);
  const second = minExtent(node.second, axis);
  return node.axis === axis ? first + second : Math.max(first, second);
}

/** 分割線を動かせる範囲。両側の部分木が最小辺を保てるところまで */
function atRange(node: SplitNode, rect: Rect): [number, number] {
  const start = node.axis === "x" ? rect.x : rect.z;
  const end = start + (node.axis === "x" ? rect.w : rect.d);
  return [
    start + minExtent(node.first, node.axis),
    end - minExtent(node.second, node.axis),
  ];
}

/**
 * すべての at を、その時点の親矩形と両側の minExtent で挟んで直す。
 * 親の壁が動いたとき、子の壁が外にはみ出たり部屋が最小辺を割ったりしないように。木の形は変えない。
 */
export function normalize(node: LayoutNode, rect: Rect): LayoutNode {
  if (node.kind === "room") return node;
  const [lo, hi] = atRange(node, rect);
  const at = clampAt(snap(node.at), lo, hi);
  const [first, second] = splitRect(rect, node.axis, at);
  return {
    ...node,
    at,
    first: normalize(node.first, first),
    second: normalize(node.second, second),
  };
}

function moveIn(
  node: LayoutNode,
  rect: Rect,
  id: string,
  at: number,
): LayoutNode {
  if (node.kind === "room") return node;
  if (node.id === id) {
    const [lo, hi] = atRange(node, rect);
    // 子の at は後段の normalize が直すので、ここでは触らない
    return { ...node, at: clampAt(snap(at), lo, hi) };
  }
  const [first, second] = splitRect(rect, node.axis, node.at);
  return {
    ...node,
    first: moveIn(node.first, first, id, at),
    second: moveIn(node.second, second, id, at),
  };
}

/** 分割線を動かす。格子に丸め、両側の最小辺で止め、そのあと木全体を normalize する */
export function moveDivider(
  node: LayoutNode,
  id: string,
  at: number,
): LayoutNode {
  return normalize(moveIn(node, FLOOR_RECT, id, at), FLOOR_RECT);
}

export function findRoom(node: LayoutNode, id: string): RoomNode | null {
  if (node.kind === "room") return node.id === id ? node : null;
  return findRoom(node.first, id) ?? findRoom(node.second, id);
}

export function roomRect(
  node: LayoutNode,
  rect: Rect,
  id: string,
): RoomRect | null {
  return layoutRooms(node, rect).find((room) => room.id === id) ?? null;
}

/** 新しい id。木の中の同じ接頭辞の最大番号 + 1 */
export function nextId(node: LayoutNode, prefix: string): string {
  const pattern = new RegExp(`^${prefix}-(\\d+)$`);
  let max = 0;
  const visit = (current: LayoutNode) => {
    const match = pattern.exec(current.id);
    if (match) max = Math.max(max, Number(match[1]));
    if (current.kind === "split") {
      visit(current.first);
      visit(current.second);
    }
  };
  visit(node);
  return `${prefix}-${max + 1}`;
}

function replaceRoom(
  node: LayoutNode,
  roomId: string,
  make: (room: RoomNode) => LayoutNode,
): LayoutNode {
  if (node.kind === "room") return node.id === roomId ? make(node) : node;
  return {
    ...node,
    first: replaceRoom(node.first, roomId, make),
    second: replaceRoom(node.second, roomId, make),
  };
}

/** 部屋を axis 方向に半分に分ける。新しい部屋の名前は元と同じで id だけ違う */
export function splitRoom(
  node: LayoutNode,
  roomId: string,
  axis: Axis,
): LayoutNode {
  const rect = roomRect(node, FLOOR_RECT, roomId);
  if (!rect) return node;
  const extent = axis === "x" ? rect.w : rect.d;
  // 半分にしても両方が最小辺を保てるときだけ分ける
  if (extent < MIN_ROOM * 2) return node;
  const start = axis === "x" ? rect.x : rect.z;
  const at = clampAt(
    snap(start + extent / 2),
    start + MIN_ROOM,
    start + extent - MIN_ROOM,
  );
  const splitId = nextId(node, "split");
  const newRoomId = nextId(node, "room");
  return replaceRoom(node, roomId, (room) => ({
    kind: "split",
    id: splitId,
    axis,
    at,
    first: room,
    second: { kind: "room", id: newRoomId, label: room.label },
  }));
}

function removeRoom(node: LayoutNode, roomId: string): LayoutNode {
  if (node.kind === "room") return node;
  if (node.first.kind === "room" && node.first.id === roomId) return node.second;
  if (node.second.kind === "room" && node.second.id === roomId) return node.first;
  return {
    ...node,
    first: removeRoom(node.first, roomId),
    second: removeRoom(node.second, roomId),
  };
}

/** 部屋を消し、兄弟の部分木が親の矩形を引き継ぐ。部屋が 1 つのときは何もしない */
export function mergeRoom(node: LayoutNode, roomId: string): LayoutNode {
  if (node.kind === "room") return node;
  return normalize(removeRoom(node, roomId), FLOOR_RECT);
}

export function renameRoom(
  node: LayoutNode,
  roomId: string,
  label: RoomLabel,
): LayoutNode {
  return replaceRoom(node, roomId, (room) => ({ ...room, label }));
}

export function canSplit(
  node: LayoutNode,
  rect: Rect,
  roomId: string,
  axis: Axis,
): boolean {
  const found = roomRect(node, rect, roomId);
  if (!found) return false;
  return (axis === "x" ? found.w : found.d) >= MIN_ROOM * 2;
}

/** つなげられるのは部屋が 2 つ以上あるとき */
export function canMerge(node: LayoutNode): boolean {
  return node.kind === "split";
}

/** 床座標 → 3D の中心座標 */
export function toScene(x: number, z: number): [number, number] {
  return [x - HOUSE.width / 2, z - HOUSE.depth / 2];
}

/**
 * 既定の間取り。1F 5 部屋・2F 4 部屋で、どちらも合計 72m²（= 9 × 8）。
 * 1F: x = 5.5 で東西に分け、西は z = 6 で LDK と和室に、
 *     東は z = 3.5 で玄関ホールと残りに、残りを z = 6 で浴室・洗面と廊下・階段に分ける。
 * 2F: z = 4 で南北に分け、北は x = 5 で主寝室と子ども部屋に、
 *     南は x = 4 で書斎とホール・階段に分ける。
 */
export function defaultLayout(floor: Floor): LayoutNode {
  if (floor === 1) {
    return {
      kind: "split",
      id: "split-1",
      axis: "x",
      at: 5.5,
      first: {
        kind: "split",
        id: "split-2",
        axis: "z",
        at: 6,
        first: { kind: "room", id: "room-1", label: "LDK" },
        second: { kind: "room", id: "room-2", label: "和室" },
      },
      second: {
        kind: "split",
        id: "split-3",
        axis: "z",
        at: 3.5,
        first: { kind: "room", id: "room-3", label: "玄関ホール" },
        second: {
          kind: "split",
          id: "split-4",
          axis: "z",
          at: 6,
          first: { kind: "room", id: "room-4", label: "浴室・洗面" },
          second: { kind: "room", id: "room-5", label: "廊下・階段" },
        },
      },
    };
  }
  return {
    kind: "split",
    id: "split-1",
    axis: "z",
    at: 4,
    first: {
      kind: "split",
      id: "split-2",
      axis: "x",
      at: 5,
      first: { kind: "room", id: "room-1", label: "主寝室" },
      second: { kind: "room", id: "room-2", label: "子ども部屋" },
    },
    second: {
      kind: "split",
      id: "split-3",
      axis: "x",
      at: 4,
      first: { kind: "room", id: "room-3", label: "書斎" },
      second: { kind: "room", id: "room-4", label: "ホール・階段" },
    },
  };
}
