/**
 * 見本: 家の外皮（床・外壁・窓・屋根）と、間取りから出る中身（部屋の床・内壁・注記）を組み立てる。
 * 返すのは「どこに、どの大きさの箱を置くか」だけ。3D の部品はそれを並べる。
 */
import { HOUSE, type Floor, type Vec3 } from "./house";
import {
  dividers,
  FLOOR_RECT,
  toScene,
  type LayoutNode,
  type RoomRect,
} from "./layout";

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

/** 部屋ごとの床。少しだけ縮めて置くと、継ぎ目がそのまま間取りの線に見える */
export function roomSlab(room: RoomRect, floor: Floor): Panel {
  const gap = 0.12;
  const t = 0.06;
  const { base } = HOUSE.floors[floor];
  const [sx, sz] = toScene(room.x + room.w / 2, room.z + room.d / 2);
  return {
    id: `f${floor}-${room.id}-floor`,
    position: [sx, base + t / 2, sz],
    size: [room.w - gap, t, room.d - gap],
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

/** 間取りの分割線を、厚み 0.12m の内壁にする。高さは外壁と同じ決まり */
export function interiorWallPanels(
  node: LayoutNode,
  floor: Floor,
  cutaway: boolean,
): Panel[] {
  const { base, height } = HOUSE.floors[floor];
  const h = cutaway ? Math.min(height, HOUSE.cutawayWallHeight) : height;
  const y = base + h / 2;
  const t = INTERIOR_WALL;
  return dividers(node, FLOOR_RECT).map((line) => {
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
 * 注記はすべての部屋に出す。天井から 0.35m 下げると、
 * 上から見ても横から見ても部屋の中に見える。
 */
export function annotationPositions(
  rooms: readonly RoomRect[],
  floor: Floor,
): Annotation[] {
  const { base, height } = HOUSE.floors[floor];
  return rooms.map((room) => {
    const [sx, sz] = toScene(room.x + room.w / 2, room.z + room.d / 2);
    return {
      id: `f${floor}-${room.id}`,
      label: room.label,
      area: room.area,
      position: [sx, base + height - 0.35, sz] as Vec3,
    };
  });
}
