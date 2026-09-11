/**
 * 見本: 建物ビューアの家。glTF も外部の 3D データも読まず、この表だけから組み立てる。
 * 単位はメートル。Three.js の座標系（y が高さ）で、原点は 1 階の床の中心。
 * 3D の部品（Scene.tsx）はここと shell.ts を読むだけで、寸法も色も自前で持たない。
 */

export type Vec3 = [number, number, number];

/** 1 階だけ / 2 階だけ / 全体 */
export type FloorMode = "1f" | "2f" | "all";

/** 回して見る / 真上から見る（上の階を外した断面 = 間取り） */
export type ViewMode = "orbit" | "plan";

export type LightingMode = "day" | "night";

export type Floor = 1 | 2;

export type Room = {
  id: string;
  /** 注記と平面図に出す部屋名 */
  label: string;
  floor: Floor;
  /** 部屋の中心。y は床と天井のちょうど間 */
  position: Vec3;
  /** 幅(x)・高さ(y)・奥行き(z) */
  size: Vec3;
  /** 広さ（m²）。size の x × z と一致させる */
  area: number;
  /** 注記の吹き出しを出す部屋。全部で 5 つ */
  annotated: boolean;
};

/**
 * 家の寸法。間口 9m × 奥行き 8m の 2 階建て。
 * 2 階の base は 1 階の天井（2.7）にスラブの厚み（0.25）を足した高さ。
 */
export const HOUSE = {
  width: 9,
  depth: 8,
  /** 階ごとの床の高さ（base）と天井までの高さ（height） */
  floors: {
    1: { base: 0, height: 2.7 },
    2: { base: 2.95, height: 2.5 },
  },
  /** 外壁の厚み */
  wallThickness: 0.2,
  /** 切って見るときの外壁の高さ。腰の高さまで残して中をのぞく */
  cutawayWallHeight: 1.1,
  /** 床スラブの厚み */
  slabThickness: 0.25,
  /** 軒から棟までの立ち上がり */
  roofRise: 1.6,
  /** 軒の出 */
  eaves: 0.5,
} as const;

/**
 * 部屋の表。1 階・2 階とも合計 72m²（= 9 × 8）にそろえてある。
 * annotated の 5 部屋に注記の吹き出しが出る。
 */
export const rooms: readonly Room[] = [
  {
    id: "ldk",
    label: "LDK",
    floor: 1,
    position: [-1.75, 1.35, -1],
    size: [5.5, 2.7, 6],
    area: 33,
    annotated: true,
  },
  {
    id: "entrance",
    label: "玄関ホール",
    floor: 1,
    position: [2.75, 1.35, -2.25],
    size: [3.5, 2.7, 3.5],
    area: 12.25,
    annotated: false,
  },
  {
    id: "bath",
    label: "浴室・洗面",
    floor: 1,
    position: [2.75, 1.35, 0.75],
    size: [3.5, 2.7, 2.5],
    area: 8.75,
    annotated: true,
  },
  {
    id: "washitsu",
    label: "和室",
    floor: 1,
    position: [-2, 1.35, 3],
    size: [5, 2.7, 2],
    area: 10,
    annotated: true,
  },
  {
    id: "corridor",
    label: "階段・廊下",
    floor: 1,
    position: [2.5, 1.35, 3],
    size: [4, 2.7, 2],
    area: 8,
    annotated: false,
  },
  {
    id: "bedroom",
    label: "主寝室",
    floor: 2,
    position: [-2, 4.2, -2],
    size: [5, 2.5, 4],
    area: 20,
    annotated: true,
  },
  {
    id: "kids",
    label: "子ども部屋",
    floor: 2,
    position: [2.5, 4.2, -2],
    size: [4, 2.5, 4],
    area: 16,
    annotated: true,
  },
  {
    id: "study",
    label: "書斎",
    floor: 2,
    position: [-2.5, 4.2, 2],
    size: [4, 2.5, 4],
    area: 16,
    annotated: false,
  },
  {
    id: "hall",
    label: "ホール・階段",
    floor: 2,
    position: [2, 4.2, 2],
    size: [5, 2.5, 4],
    area: 20,
    annotated: false,
  },
];

/** 見せる階で絞る。呼び出し側が並べ替えないよう、新しい配列で返す */
export function visibleRooms(list: readonly Room[], mode: FloorMode): Room[] {
  if (mode === "all") return [...list];
  const floor: Floor = mode === "1f" ? 1 : 2;
  return list.filter((room) => room.floor === floor);
}

export type Annotation = {
  id: string;
  label: string;
  /** 広さ（m²） */
  area: number;
  /** 吹き出しを置く位置。部屋の天井の少し下 */
  position: Vec3;
};

/** 注記の位置。天井から 0.35m 下げると、上から見ても横から見ても部屋の中に見える */
export function annotationPositions(list: readonly Room[]): Annotation[] {
  return list
    .filter((room) => room.annotated)
    .map((room) => ({
      id: room.id,
      label: room.label,
      area: room.area,
      position: [
        room.position[0],
        room.position[1] + room.size[1] / 2 - 0.35,
        room.position[2],
      ] as Vec3,
    }));
}

export type WallColor = {
  id: "plaster" | "charcoal" | "cedar";
  /** ボタンに出す名前 */
  name: string;
  /** 外壁 */
  wall: string;
  /** 床スラブの小口や軒 */
  trim: string;
  /** 屋根 */
  roof: string;
};

/** 外壁の色 3 種。CSS ではなく three.js の材質に渡す値なので、ここに直に持つ */
export const wallColors: readonly WallColor[] = [
  {
    id: "plaster",
    name: "白い塗り壁",
    wall: "#e8e4dc",
    trim: "#7d7568",
    roof: "#4a4f57",
  },
  {
    id: "charcoal",
    name: "黒い板張り",
    wall: "#3b3f45",
    trim: "#20232a",
    roof: "#2b2e34",
  },
  {
    id: "cedar",
    name: "杉の下見板",
    wall: "#b58757",
    trim: "#75512f",
    roof: "#4a4f57",
  },
];

export function wallColorById(id: WallColor["id"]): WallColor {
  const found = wallColors.find((color) => color.id === id);
  // 型で 3 つに絞っているので通常は必ず見つかる。落ちるのは表を壊したときだけ
  if (!found) throw new Error(`未知の外壁の色: ${id}`);
  return found;
}

export type LightingPreset = {
  /** 画面の背景（空の色） */
  background: string;
  /** 地面の色 */
  ground: string;
  ambient: { color: string; intensity: number };
  /** 太陽または月 */
  key: { color: string; intensity: number; position: Vec3 };
  /** 空と地面からの照り返し */
  hemisphere: { sky: string; ground: string; intensity: number };
  /** 窓の明るさ。夜は室内の明かりが漏れる */
  windowEmissive: number;
};

/** 昼夜の明かり。月は太陽と反対側（−x）から差して、切り替わったことが形で分かるようにする */
export function lightingPreset(mode: LightingMode): LightingPreset {
  if (mode === "night") {
    return {
      background: "#11151d",
      ground: "#181d26",
      ambient: { color: "#3a4a6b", intensity: 0.55 },
      key: { color: "#aebde6", intensity: 0.9, position: [-11, 15, -9] },
      hemisphere: { sky: "#27334d", ground: "#0d1017", intensity: 0.6 },
      windowEmissive: 1.6,
    };
  }
  return {
    background: "#cadcf0",
    ground: "#c9c4b6",
    ambient: { color: "#ffffff", intensity: 0.8 },
    key: { color: "#fff3df", intensity: 2.4, position: [11, 16, 9] },
    hemisphere: { sky: "#dbe9fb", ground: "#b6afa1", intensity: 1.1 },
    windowEmissive: 0.05,
  };
}

/** 切って見る状態か。1 階だけ・2 階だけ・間取りは、外壁を腰の高さで切って中をのぞく */
export function isCutaway(mode: FloorMode, view: ViewMode): boolean {
  return view === "plan" || mode !== "all";
}

/** 屋根は切っていないとき（全体を回して見るとき）だけ載せる */
export function showsRoof(mode: FloorMode, view: ViewMode): boolean {
  return !isCutaway(mode, view);
}

/** 間取りは断面。上の階を外して 1 つの階だけ見せる */
export function effectiveFloorMode(mode: FloorMode, view: ViewMode): FloorMode {
  return view === "plan" && mode === "all" ? "1f" : mode;
}

export type CameraPose = { position: Vec3; target: Vec3 };

/**
 * 視点。間取りは真上から見下ろす。
 * 真上のとき z をわずかにずらすのは、視線と上方向が重なって回転が定まらなくなるのを避けるため。
 */
export function cameraPose(mode: FloorMode, view: ViewMode): CameraPose {
  const floor = effectiveFloorMode(mode, view);
  if (view === "plan") {
    const base = floor === "2f" ? HOUSE.floors[2].base : HOUSE.floors[1].base;
    return { position: [0, base + 15, 0.01], target: [0, base, 0] };
  }
  if (floor === "1f") return { position: [11, 8, 12], target: [0, 1.4, 0] };
  if (floor === "2f") return { position: [11, 11, 12], target: [0, 4.2, 0] };
  return { position: [13, 10, 14], target: [0, 3.2, 0] };
}
