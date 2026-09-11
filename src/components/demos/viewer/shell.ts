/**
 * 見本: 家の外皮（床・外壁・窓・屋根）と、間取りから出る中身（部屋の床・内壁・注記）を組み立てる。
 * 返すのは「どこに、どの大きさの箱を置くか」だけ。3D の部品はそれを並べる。
 */
import {
  labelAnchor,
  roomArea,
  toScene,
  type Divider,
  type GridLayout,
  type RoomRect,
} from "./grid";
import { HOUSE, type Floor, type Vec3 } from "./house";

export type Panel = {
  id: string;
  position: Vec3;
  /** 幅(x)・高さ(y)・奥行き(z) */
  size: Vec3;
};

/** 内壁の厚み */
export const INTERIOR_WALL = 0.12;

/** その階の床スラブ。上面がちょうどその階の床の高さに来る */
export function slabPanel(floor: Floor): Panel {
  const { base } = HOUSE.floors[floor];
  const t = HOUSE.slabThickness;
  return {
    id: `f${floor}-slab`,
    position: [0, base - t / 2, 0],
    size: [HOUSE.width, t, HOUSE.depth],
  };
}

/**
 * 部屋ごとの床。1 つの部屋が複数の矩形に分かれるので、隙間は空けない ──
 * 同じ部屋の矩形どうしが継ぎ目なく並ぶようにするため。部屋の境目は内壁が覆う。
 */
export function roomSlab(room: RoomRect, floor: Floor): Panel {
  const t = 0.06;
  const { base } = HOUSE.floors[floor];
  const [sx, sz] = toScene(room.x + room.w / 2, room.z + room.d / 2);
  return {
    id: `f${floor}-${room.id}-floor`,
    position: [sx, base + t / 2, sz],
    size: [room.w, t, room.d],
  };
}

/**
 * その階の外壁 4 枚。外側の面がちょうど間口・奥行きの線に乗るよう、厚みの半分だけ内に寄せる。
 * 東西の壁は南北の壁と重ならないよう、両端を厚みぶん詰める。
 * cutaway のときは腰の高さで切って、中をのぞけるようにする。
 */
export function wallPanels(floor: Floor, cutaway: boolean): Panel[] {
  const { base, height } = HOUSE.floors[floor];
  const h = cutaway ? Math.min(height, HOUSE.cutawayWallHeight) : height;
  const y = base + h / 2;
  const t = HOUSE.wallThickness;
  const halfW = HOUSE.width / 2;
  const halfD = HOUSE.depth / 2;
  return [
    {
      id: `f${floor}-north`,
      position: [0, y, -halfD + t / 2],
      size: [HOUSE.width, h, t],
    },
    {
      id: `f${floor}-south`,
      position: [0, y, halfD - t / 2],
      size: [HOUSE.width, h, t],
    },
    {
      id: `f${floor}-west`,
      position: [-halfW + t / 2, y, 0],
      size: [t, h, HOUSE.depth - t * 2],
    },
    {
      id: `f${floor}-east`,
      position: [halfW - t / 2, y, 0],
      size: [t, h, HOUSE.depth - t * 2],
    },
  ];
}

/** 部屋の境目の壁（grid.ts の wallSegments）を、厚み 0.12m の内壁にする。高さは外壁と同じ決まり */
export function interiorWallPanels(
  lines: readonly Divider[],
  floor: Floor,
  cutaway: boolean,
): Panel[] {
  const { base, height } = HOUSE.floors[floor];
  const h = cutaway ? Math.min(height, HOUSE.cutawayWallHeight) : height;
  const y = base + h / 2;
  const t = INTERIOR_WALL;
  return lines.map((line) => {
    const middle = (line.from + line.to) / 2;
    const length = line.to - line.from;
    if (line.axis === "x") {
      // 南北に走る線。x = at に立て、z 方向に伸ばす
      const [sx, sz] = toScene(line.at, middle);
      return {
        id: `f${floor}-${line.id}`,
        position: [sx, y, sz],
        size: [t, h, length],
      };
    }
    const [sx, sz] = toScene(middle, line.at);
    return {
      id: `f${floor}-${line.id}`,
      position: [sx, y, sz],
      size: [length, h, t],
    };
  });
}

/** count 個を span の幅に等間隔で並べたときの、それぞれの中心 */
export function spread(count: number, span: number): number[] {
  const step = span / count;
  const out: number[] = [];
  for (let i = 0; i < count; i++) out.push(-span / 2 + step * (i + 0.5));
  return out;
}

/** 窓の寸法。腰高 0.9m、高さ 1.4m、幅 1.5m */
export const WINDOW = { width: 1.5, height: 1.4, sill: 0.9 } as const;

/**
 * その階の窓。南北の面に 3 つずつ、東西の面に 2 つずつの合計 10 か所。
 * 壁より 4cm 厚い板にして、外からも中からも面が見えるようにする（前後に 2cm ずつ出る）。
 */
export function windowPanels(floor: Floor): Panel[] {
  const { base } = HOUSE.floors[floor];
  const y = base + WINDOW.sill + WINDOW.height / 2;
  const t = HOUSE.wallThickness;
  const thickness = t + 0.04;
  const halfW = HOUSE.width / 2;
  const halfD = HOUSE.depth / 2;
  const out: Panel[] = [];

  spread(3, HOUSE.width - WINDOW.width).forEach((x, i) => {
    out.push({
      id: `f${floor}-win-s${i}`,
      position: [x, y, halfD - t / 2],
      size: [WINDOW.width, WINDOW.height, thickness],
    });
    out.push({
      id: `f${floor}-win-n${i}`,
      position: [x, y, -halfD + t / 2],
      size: [WINDOW.width, WINDOW.height, thickness],
    });
  });

  spread(2, HOUSE.depth - WINDOW.width).forEach((z, i) => {
    out.push({
      id: `f${floor}-win-e${i}`,
      position: [halfW - t / 2, y, z],
      size: [thickness, WINDOW.height, WINDOW.width],
    });
    out.push({
      id: `f${floor}-win-w${i}`,
      position: [-halfW + t / 2, y, z],
      size: [thickness, WINDOW.height, WINDOW.width],
    });
  });

  return out;
}

/** 使う側は rotationY を内側の mesh に、scaleZ を外側の group に掛けること（回転 → z 方向拡大の順）。 */
export type Roof = {
  /** 四角錐の外接円の半径（coneGeometry の radius） */
  radius: number;
  height: number;
  /** 底面を長方形にするための奥行き方向の縮み */
  scaleZ: number;
  position: Vec3;
  /** 稜線を間口・奥行きの向きに合わせるための回転（ラジアン） */
  rotationY: number;
};

/**
 * 屋根は四角錐（方形屋根。棟の無い寄棟に近い形）。角を 4 つにした円錐を 45 度回すと四角い屋根になる。
 * 板 2 枚の切妻と違って妻側に穴が開かないので、手数が少なく破綻もしない。
 */
export function roofShape(): Roof {
  const top = HOUSE.floors[2].base + HOUSE.floors[2].height;
  const width = HOUSE.width + HOUSE.eaves * 2;
  const depth = HOUSE.depth + HOUSE.eaves * 2;
  return {
    radius: (width / 2) * Math.SQRT2,
    height: HOUSE.roofRise,
    scaleZ: depth / width,
    position: [0, top + HOUSE.roofRise / 2, 0],
    rotationY: Math.PI / 4,
  };
}

export type Annotation = {
  id: string;
  label: string;
  /** 広さ（m²） */
  area: number;
  /** 吹き出しを置く位置。部屋の天井の少し下 */
  position: Vec3;
};

/**
 * 注記は部屋ごとに 1 つ。位置は labelAnchor（部屋のマスの重心にいちばん近いマスの中心）で、
 * L 字の部屋でも名前が部屋の中に出る。天井から 0.35m 下げると、
 * 上から見ても横から見ても部屋の中に見える。
 * まだ 1 マスも塗られていない部屋（「新しい部屋」の直後）は出さない ──
 * 置く場所が無く、labelAnchor が返す床の真ん中に「0.0 m²」が浮いてしまうため。
 */
export function annotationPositions(
  layout: GridLayout,
  floor: Floor,
): Annotation[] {
  const { base, height } = HOUSE.floors[floor];
  const out: Annotation[] = [];
  for (const room of layout.rooms) {
    const area = roomArea(layout, room.id);
    if (area === 0) continue;
    const [ax, az] = labelAnchor(layout, room.id);
    const [sx, sz] = toScene(ax, az);
    out.push({
      id: `f${floor}-${room.id}`,
      label: room.label,
      area,
      position: [sx, base + height - 0.35, sz] as Vec3,
    });
  }
  return out;
}
