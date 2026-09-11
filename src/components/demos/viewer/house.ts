/**
 * 見本: 間取りシミュレーターの家。glTF も外部の 3D データも読まず、この表だけから組み立てる。
 * 単位はメートル。Three.js の座標系（y が高さ）で、原点は 1 階の床の中心。
 * 部屋の形は layout.ts（分割木）が決める。ここは階・外皮の寸法・色・明かり・視点だけを持つ。
 */

export type Vec3 = [number, number, number];

/** 1 階だけ / 2 階だけ / 全体 */
export type FloorMode = "1f" | "2f" | "all";

/**
 * 斜めから見る / 真上から見る。どちらもカメラの位置が違うだけで、
 * 断面（腰の高さで切る）かどうかは階の選択だけで決まる。
 */
export type ViewMode = "orbit" | "top";

export type LightingMode = "day" | "night";

export type Floor = 1 | 2;

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

/** 部屋の床の色。外壁の色を変えても床は変えない（間取りの読みやすさを保つため） */
export const FLOOR_TONE: Record<Floor, string> = {
  1: "#d8d2c6",
  2: "#cec7b9",
};

/** 選択中の部屋の床。少し明るくして、どれを選んでいるか 3D でも分かるようにする */
export const SELECTED_FLOOR_TONE = "#f0e9d8";

/** 内壁。外壁の色を変えても、中は白い塗り壁のまま */
export const INTERIOR_TONE = "#e4dfd5";

/** 窓の色。昼は空を映した水色、夜は室内の明かりが漏れた暖色。emissive は夜に光らせる発光色 */
export const WINDOW_TONE = { day: "#8fb6d8", night: "#ffe3ac", emissive: "#ffd79a" } as const;

/** 見せる階。全体は 1 階と 2 階の両方 */
export function visibleFloors(mode: FloorMode): Floor[] {
  if (mode === "all") return [1, 2];
  return mode === "1f" ? [1] : [2];
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

/** 切って見る状態か。1 つの階だけ見るときは、外壁を腰の高さで切って中をのぞく */
export function isCutaway(mode: FloorMode): boolean {
  return mode !== "all";
}

/** 屋根は切っていないとき（全体のとき）だけ載せる。真上から全体を見れば屋根が見える */
export function showsRoof(mode: FloorMode): boolean {
  return !isCutaway(mode);
}

export type CameraPose = { position: Vec3; target: Vec3 };

/**
 * 視点。真上のとき z をわずかにずらすのは、視線と上方向が重なって回転が定まらなくなるのを避けるため。
 * 全体を真上から見るときは屋根の上から。階を選んだときはその階の床の上から見下ろす。
 */
export function cameraPose(mode: FloorMode, view: ViewMode): CameraPose {
  if (view === "top") {
    if (mode === "all") return { position: [0, 22, 0.01], target: [0, 0, 0] };
    const base = mode === "2f" ? HOUSE.floors[2].base : HOUSE.floors[1].base;
    return { position: [0, base + 18, 0.01], target: [0, base, 0] };
  }
  if (mode === "1f") return { position: [11, 8, 12], target: [0, 1.4, 0] };
  if (mode === "2f") return { position: [11, 11, 12], target: [0, 4.2, 0] };
  return { position: [13, 10, 14], target: [0, 3.2, 0] };
}
