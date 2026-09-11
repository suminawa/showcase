/**
 * 見本: 間取りシミュレーターの家具。3D の箱の一覧と、平面図の記号を 1 つの表から出す。
 * 色は three.js の材質に渡す値なので、CSS のトークンではなくここに直に持つ。
 * 箱の位置は「家具の中心を原点、y は床から」で書く。回転と階の高さは partsInScene が掛ける。
 */
import { HOUSE, type Floor, type Vec3 } from "./house";
import { snap, toScene } from "./layout";

export type FurnitureId =
  | "bed"
  | "sofa"
  | "dining"
  | "desk"
  | "shelf"
  | "kitchen"
  | "bath"
  | "tv";

export type Rotation = 0 | 90 | 180 | 270;

/** 家具の中心を原点にした箱の 1 つ（3D 用）。y は床から測った高さ */
export type Part = { offset: Vec3; size: Vec3; color: string };

/** 平面図の記号。footprint に対する相対座標（中心原点） */
export type Glyph = { rects: { x: number; z: number; w: number; d: number }[] };

export type FurnitureType = {
  id: FurnitureId;
  /** ボタンに出す名前 */
  name: string;
  /** 幅(x) × 奥行き(z)。回していないときの向き */
  footprint: [w: number, d: number];
  height: number;
  parts: Part[];
  glyph: Glyph;
};

export type PlacedFurniture = {
  id: string;
  type: FurnitureId;
  floor: Floor;
  /** 床座標での中心（x は東へ 0..9、z は南へ 0..8） */
  x: number;
  z: number;
  rotation: Rotation;
};

/** 3D に置く箱。Scene はこれを並べるだけ */
export type ScenePart = {
  id: string;
  position: Vec3;
  size: Vec3;
  color: string;
};

/* 木目・濃い木目・布・白の 4 色だけで 8 種を作る */
const WOOD = "#a9825a";
const WOOD_DARK = "#6f5334";
const FABRIC = "#7d8a99";
const WHITE = "#e6e3dc";

export const FURNITURE: readonly FurnitureType[] = [
  {
    id: "bed",
    name: "ベッド",
    footprint: [1.4, 2],
    height: 0.5,
    parts: [
      { offset: [0, 0.15, 0], size: [1.4, 0.3, 2], color: WOOD },
      { offset: [0, 0.4, 0.2], size: [1.3, 0.2, 1.5], color: FABRIC },
      { offset: [0, 0.36, -0.75], size: [1.2, 0.12, 0.4], color: WHITE },
    ],
    glyph: {
      rects: [
        { x: 0, z: 0, w: 1.4, d: 2 },
        { x: 0, z: -0.75, w: 1.2, d: 0.4 },
      ],
    },
  },
  {
    id: "sofa",
    name: "ソファ",
    footprint: [1.8, 0.9],
    height: 0.8,
    parts: [
      { offset: [0, 0.2, 0.05], size: [1.8, 0.4, 0.8], color: FABRIC },
      { offset: [0, 0.5, -0.37], size: [1.8, 0.6, 0.16], color: FABRIC },
    ],
    glyph: {
      rects: [
        { x: 0, z: 0.05, w: 1.8, d: 0.8 },
        { x: 0, z: -0.37, w: 1.8, d: 0.16 },
      ],
    },
  },
  {
    id: "dining",
    name: "ダイニングセット",
    footprint: [1.6, 0.9],
    height: 0.72,
    parts: [
      { offset: [0, 0.68, 0], size: [1.4, 0.08, 0.7], color: WOOD },
      { offset: [-0.45, 0.225, -0.25], size: [0.4, 0.45, 0.4], color: WOOD_DARK },
      { offset: [0.45, 0.225, -0.25], size: [0.4, 0.45, 0.4], color: WOOD_DARK },
      { offset: [-0.45, 0.225, 0.25], size: [0.4, 0.45, 0.4], color: WOOD_DARK },
      { offset: [0.45, 0.225, 0.25], size: [0.4, 0.45, 0.4], color: WOOD_DARK },
    ],
    glyph: {
      rects: [
        { x: 0, z: 0, w: 1.4, d: 0.7 },
        { x: -0.45, z: -0.3, w: 0.4, d: 0.28 },
        { x: 0.45, z: -0.3, w: 0.4, d: 0.28 },
        { x: -0.45, z: 0.3, w: 0.4, d: 0.28 },
        { x: 0.45, z: 0.3, w: 0.4, d: 0.28 },
      ],
    },
  },
  {
    id: "desk",
    name: "デスク",
    footprint: [1.2, 0.6],
    height: 0.72,
    parts: [
      { offset: [0, 0.68, -0.05], size: [1.2, 0.08, 0.5], color: WOOD },
      { offset: [0, 0.22, 0.1], size: [0.4, 0.44, 0.4], color: WOOD_DARK },
    ],
    glyph: {
      rects: [
        { x: 0, z: -0.05, w: 1.2, d: 0.5 },
        { x: 0, z: 0.1, w: 0.4, d: 0.4 },
      ],
    },
  },
  {
    id: "shelf",
    name: "本棚",
    footprint: [0.9, 0.35],
    height: 1.8,
    parts: [
      { offset: [0, 0.9, -0.025], size: [0.9, 1.8, 0.3], color: WOOD },
      { offset: [0, 0.95, 0.15], size: [0.82, 1.6, 0.05], color: FABRIC },
    ],
    glyph: { rects: [{ x: 0, z: 0, w: 0.9, d: 0.35 }] },
  },
  {
    id: "kitchen",
    name: "キッチン",
    footprint: [2.4, 0.65],
    height: 0.85,
    parts: [
      { offset: [0, 0.4, 0], size: [2.4, 0.8, 0.65], color: WHITE },
      { offset: [0, 0.825, 0], size: [2.4, 0.05, 0.65], color: WOOD_DARK },
    ],
    glyph: {
      rects: [
        { x: 0, z: 0, w: 2.4, d: 0.65 },
        { x: -0.6, z: 0, w: 0.6, d: 0.45 },
      ],
    },
  },
  {
    id: "bath",
    name: "浴槽",
    footprint: [1.6, 0.8],
    height: 0.55,
    parts: [
      { offset: [0, 0.25, 0], size: [1.6, 0.5, 0.8], color: WHITE },
      { offset: [0, 0.525, 0], size: [1.4, 0.05, 0.6], color: FABRIC },
    ],
    glyph: {
      rects: [
        { x: 0, z: 0, w: 1.6, d: 0.8 },
        { x: 0, z: 0, w: 1.4, d: 0.6 },
      ],
    },
  },
  {
    id: "tv",
    name: "テレビ台",
    footprint: [1.5, 0.45],
    height: 0.45,
    parts: [
      { offset: [0, 0.125, 0], size: [1.5, 0.25, 0.45], color: WOOD },
      { offset: [0, 0.35, -0.1], size: [1.1, 0.2, 0.05], color: FABRIC },
    ],
    glyph: {
      rects: [
        { x: 0, z: 0, w: 1.5, d: 0.45 },
        { x: 0, z: -0.1, w: 1.1, d: 0.06 },
      ],
    },
  },
];

export function furnitureType(id: FurnitureId): FurnitureType {
  const found = FURNITURE.find((type) => type.id === id);
  // 型で 8 つに絞っているので通常は必ず見つかる。落ちるのは表を壊したときだけ
  if (!found) throw new Error(`未知の家具: ${id}`);
  return found;
}

/** 回転を掛けたあとの footprint。90/270 は幅と奥行きが入れ替わる */
export function footprintOf(item: PlacedFurniture): [number, number] {
  const [w, d] = furnitureType(item.type).footprint;
  return item.rotation === 90 || item.rotation === 270 ? [d, w] : [w, d];
}

/** 回転後の footprint が床の輪郭（0..9 × 0..8）に収まるよう中心を寄せる */
export function clampInside(item: PlacedFurniture): PlacedFurniture {
  const [w, d] = footprintOf(item);
  return {
    ...item,
    x: Math.min(Math.max(item.x, w / 2), HOUSE.width - w / 2),
    z: Math.min(Math.max(item.z, d / 2), HOUSE.depth - d / 2),
  };
}

function nextFurnitureId(list: readonly PlacedFurniture[]): string {
  let max = 0;
  for (const item of list) {
    const match = /^f-(\d+)$/.exec(item.id);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `f-${max + 1}`;
}

export function addFurniture(
  list: readonly PlacedFurniture[],
  type: FurnitureId,
  floor: Floor,
  at: [number, number],
): PlacedFurniture[] {
  return [
    ...list,
    clampInside({
      id: nextFurnitureId(list),
      type,
      floor,
      x: snap(at[0]),
      z: snap(at[1]),
      rotation: 0,
    }),
  ];
}

export function moveFurniture(
  list: readonly PlacedFurniture[],
  id: string,
  x: number,
  z: number,
): PlacedFurniture[] {
  return list.map((item) =>
    item.id === id ? clampInside({ ...item, x: snap(x), z: snap(z) }) : item,
  );
}

function turn(rotation: Rotation): Rotation {
  if (rotation === 0) return 90;
  if (rotation === 90) return 180;
  if (rotation === 180) return 270;
  return 0;
}

export function rotateFurniture(
  list: readonly PlacedFurniture[],
  id: string,
): PlacedFurniture[] {
  return list.map((item) =>
    item.id === id ? clampInside({ ...item, rotation: turn(item.rotation) }) : item,
  );
}

export function removeFurniture(
  list: readonly PlacedFurniture[],
  id: string,
): PlacedFurniture[] {
  return list.filter((item) => item.id !== id);
}

export function furnitureOnFloor(
  list: readonly PlacedFurniture[],
  floor: Floor,
): PlacedFurniture[] {
  return list.filter((item) => item.floor === floor);
}

/** 床座標の点を回す。x は東・z は南なので、3D も平面図（SVG の rotate）も同じ向きに回る */
function turnPoint(x: number, z: number, rotation: Rotation): [number, number] {
  if (rotation === 90) return [-z, x];
  if (rotation === 180) return [-x, -z];
  if (rotation === 270) return [z, -x];
  return [x, z];
}

/** 回転を掛けて 3D の座標にした箱の一覧。y は階の床の高さを足す */
export function partsInScene(item: PlacedFurniture): ScenePart[] {
  const type = furnitureType(item.type);
  const { base } = HOUSE.floors[item.floor];
  const [sx, sz] = toScene(item.x, item.z);
  const turned = item.rotation === 90 || item.rotation === 270;
  return type.parts.map((part, index) => {
    const [px, pz] = turnPoint(part.offset[0], part.offset[2], item.rotation);
    const [w, h, d] = part.size;
    return {
      id: `${item.id}-${index}`,
      position: [sx + px, base + part.offset[1], sz + pz] as Vec3,
      size: (turned ? [d, h, w] : [w, h, d]) as Vec3,
      color: part.color,
    };
  });
}

/**
 * 既定の家具。1F の LDK にソファ・テレビ台・ダイニングセット・キッチン、浴室に浴槽。
 * 2F の主寝室にベッド、子ども部屋にベッドとデスク、書斎にデスクと本棚。
 * 位置は既定の間取りの各部屋の中に収まる値を直に書く（乱数も Date も使わない）。
 */
export function defaultFurniture(): PlacedFurniture[] {
  return [
    { id: "f-1", type: "sofa", floor: 1, x: 2, z: 4.25, rotation: 0 },
    { id: "f-2", type: "tv", floor: 1, x: 2, z: 5.5, rotation: 0 },
    { id: "f-3", type: "dining", floor: 1, x: 1.5, z: 2, rotation: 0 },
    { id: "f-4", type: "kitchen", floor: 1, x: 1.5, z: 0.5, rotation: 0 },
    { id: "f-5", type: "bath", floor: 1, x: 7.25, z: 4.5, rotation: 0 },
    { id: "f-6", type: "bed", floor: 2, x: 1.25, z: 2, rotation: 0 },
    { id: "f-7", type: "bed", floor: 2, x: 6, z: 2, rotation: 0 },
    { id: "f-8", type: "desk", floor: 2, x: 8, z: 1, rotation: 90 },
    { id: "f-9", type: "desk", floor: 2, x: 2, z: 4.75, rotation: 0 },
    { id: "f-10", type: "shelf", floor: 2, x: 2, z: 7.5, rotation: 0 },
  ];
}

function hueToRgb(p: number, q: number, t: number): number {
  let u = t;
  if (u < 0) u += 1;
  if (u > 1) u -= 1;
  if (u < 1 / 6) return p + (q - p) * 6 * u;
  if (u < 1 / 2) return q;
  if (u < 2 / 3) return p + (q - p) * (2 / 3 - u) * 6;
  return p;
}

/**
 * #rrggbb を HSL に直し、明度（L）を amount だけ上げて #rrggbb に戻す。
 * 選択中の家具を「同じ色のまま少し明るく」見せるために使う。
 */
export function lighten(hex: string, amount: number): string {
  const value = hex.replace("#", "");
  const r = Number.parseInt(value.slice(0, 2), 16) / 255;
  const g = Number.parseInt(value.slice(2, 4), 16) / 255;
  const b = Number.parseInt(value.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const delta = max - min;
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    if (max === r) h = (g - b) / delta + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h /= 6;
  }
  const light = Math.min(1, l + amount);
  const q = light < 0.5 ? light * (1 + s) : light + s - light * s;
  const p = 2 * light - q;
  const channel = (t: number) =>
    Math.round(hueToRgb(p, q, t) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${channel(h + 1 / 3)}${channel(h)}${channel(h - 1 / 3)}`;
}
