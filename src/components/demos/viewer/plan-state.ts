/**
 * 見本: 間取りシミュレーターの状態（間取り + 家具）。ブラウザに保存する形でもある。
 * 保存先は localStorage だけで、サーバーへは送らない（読み書きの try/catch は Viewer.tsx）。
 * 古い保存データや壊れたデータで画面が落ちないよう、読み込みは必ずこの関数を通す。
 * マス目に変えたので version は 2。鍵も v2 にして、分割木のころの保存データは読まない。
 */
import {
  clampInside,
  defaultFurniture,
  FURNITURE,
  type FurnitureId,
  type PlacedFurniture,
} from "./furniture";
import {
  CELL_COUNT,
  defaultLayout,
  prune,
  ROOM_LABELS,
  type GridLayout,
  type Room,
  type RoomId,
  type RoomLabel,
} from "./grid";
import { type Floor } from "./house";

export type PlanState = {
  version: 2;
  floors: Record<Floor, GridLayout>;
  furniture: PlacedFurniture[];
};

export const STORAGE_KEY = "suminawa-demo-3d-viewer:v2";

export function defaultPlanState(): PlanState {
  return {
    version: 2,
    floors: { 1: defaultLayout(1), 2: defaultLayout(2) },
    furniture: defaultFurniture(),
  };
}

export function serializePlanState(state: PlanState): string {
  return JSON.stringify(state);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * 部屋の表とマスの表を検証する。マスの数が違う・知らない id・知らない部屋名・
 * id の重複のどれかがあれば null。通ったら prune を通して、マス 0 の部屋を落とす。
 */
function parseLayout(value: unknown): GridLayout | null {
  if (!isObject(value)) return null;
  if (!Array.isArray(value.rooms) || !Array.isArray(value.cells)) return null;
  if (value.cells.length !== CELL_COUNT) return null;
  const rooms: Room[] = [];
  const ids = new Set<RoomId>();
  for (const entry of value.rooms) {
    if (!isObject(entry)) return null;
    if (typeof entry.id !== "string" || entry.id === "") return null;
    if (ids.has(entry.id)) return null;
    if (typeof entry.label !== "string") return null;
    if (!(ROOM_LABELS as readonly string[]).includes(entry.label)) return null;
    ids.add(entry.id);
    rooms.push({ id: entry.id, label: entry.label as RoomLabel });
  }
  if (rooms.length === 0) return null;
  const cells: RoomId[] = [];
  for (const cell of value.cells) {
    if (typeof cell !== "string" || !ids.has(cell)) return null;
    cells.push(cell);
  }
  return prune({ rooms, cells });
}

function parseItem(value: unknown): PlacedFurniture | null {
  if (!isObject(value)) return null;
  if (typeof value.id !== "string" || value.id === "") return null;
  // const に受けてから絞る。そうしないと下の関数の中で string に絞られたままにならない
  const typeId = value.type;
  if (typeof typeId !== "string") return null;
  if (!FURNITURE.some((type) => type.id === typeId)) return null;
  if (value.floor !== 1 && value.floor !== 2) return null;
  if (!isFiniteNumber(value.x) || !isFiniteNumber(value.z)) return null;
  const rotation = value.rotation;
  if (rotation !== 0 && rotation !== 90 && rotation !== 180 && rotation !== 270) {
    return null;
  }
  // 輪郭の外に出ている保存データは、弾かずに中へ寄せて受け取る
  return clampInside({
    id: value.id,
    type: typeId as FurnitureId,
    floor: value.floor,
    x: value.x,
    z: value.z,
    rotation,
  });
}

/** JSON でない・形が違う・version が 2 でない・未知の label / type・数値でない座標なら null */
export function parsePlanState(raw: string | null): PlanState | null {
  if (!raw) return null;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isObject(data)) return null;
  if (data.version !== 2) return null;
  if (!isObject(data.floors)) return null;
  const first = parseLayout(data.floors[1]);
  const second = parseLayout(data.floors[2]);
  if (!first || !second) return null;
  if (!Array.isArray(data.furniture)) return null;
  const furniture: PlacedFurniture[] = [];
  for (const entry of data.furniture) {
    const item = parseItem(entry);
    if (!item) return null;
    furniture.push(item);
  }
  return { version: 2, floors: { 1: first, 2: second }, furniture };
}
