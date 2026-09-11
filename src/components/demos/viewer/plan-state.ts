/**
 * 見本: 間取りシミュレーターの状態（間取り + 家具）。ブラウザに保存する形でもある。
 * 保存先は localStorage だけで、サーバーへは送らない（読み書きの try/catch は Viewer.tsx）。
 * 古い保存データや壊れたデータで画面が落ちないよう、読み込みは必ずこの関数を通す。
 */
import {
  clampInside,
  defaultFurniture,
  FURNITURE,
  type FurnitureId,
  type PlacedFurniture,
} from "./furniture";
import { type Floor } from "./house";
import {
  defaultLayout,
  FLOOR_RECT,
  normalize,
  ROOM_LABELS,
  type LayoutNode,
  type RoomLabel,
} from "./layout";

export type PlanState = {
  version: 1;
  floors: Record<Floor, LayoutNode>;
  furniture: PlacedFurniture[];
};

export const STORAGE_KEY = "suminawa-demo-3d-viewer:v1";

export function defaultPlanState(): PlanState {
  return {
    version: 1,
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

function parseNode(value: unknown): LayoutNode | null {
  if (!isObject(value)) return null;
  if (typeof value.id !== "string" || value.id === "") return null;
  if (value.kind === "room") {
    if (typeof value.label !== "string") return null;
    if (!(ROOM_LABELS as readonly string[]).includes(value.label)) return null;
    return { kind: "room", id: value.id, label: value.label as RoomLabel };
  }
  if (value.kind !== "split") return null;
  if (value.axis !== "x" && value.axis !== "z") return null;
  if (!isFiniteNumber(value.at)) return null;
  const first = parseNode(value.first);
  const second = parseNode(value.second);
  if (!first || !second) return null;
  return {
    kind: "split",
    id: value.id,
    axis: value.axis,
    at: value.at,
    first,
    second,
  };
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

/** JSON でない・形が違う・未知の label / type・数値でない座標なら null */
export function parsePlanState(raw: string | null): PlanState | null {
  if (!raw) return null;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isObject(data)) return null;
  if (data.version !== 1) return null;
  if (!isObject(data.floors)) return null;
  const first = parseNode(data.floors[1]);
  const second = parseNode(data.floors[2]);
  if (!first || !second) return null;
  if (!Array.isArray(data.furniture)) return null;
  const furniture: PlacedFurniture[] = [];
  for (const entry of data.furniture) {
    const item = parseItem(entry);
    if (!item) return null;
    furniture.push(item);
  }
  return {
    version: 1,
    // 保存したあとに最小辺の決まりを変えていても、読み込んだ時点で直す
    floors: {
      1: normalize(first, FLOOR_RECT),
      2: normalize(second, FLOOR_RECT),
    },
    furniture,
  };
}
