/**
 * 見本「灯月設備」の対応エリア。
 * 実在の市区町村名は書かない ── 住所を書かない決まりがあるので、方角と距離と目印だけで示す。
 * 角度は真上を 0 度として時計回り、半径は中心（営業所）から外周までの割合（0〜1）。
 */
export type Area = {
  id: string;
  label: string;
  /** 中心からの距離の割合。0 が中心、1 が外周 */
  radius: number;
  /** 真上を 0 度とした時計回りの角度 */
  angle: number;
};

export const AREAS: readonly Area[] = [
  { id: "center", label: "市の中心部", radius: 0.28, angle: 20 },
  { id: "north", label: "北側の住宅地", radius: 0.62, angle: 340 },
  { id: "east", label: "川の東側", radius: 0.55, angle: 95 },
  { id: "station", label: "駅から車で 20 分まで", radius: 0.42, angle: 200 },
  { id: "next-city", label: "となりの市（一部）", radius: 0.9, angle: 250 },
  { id: "hill", label: "山側の集落（要相談）", radius: 0.86, angle: 130 },
];

/** SVG の座標に載せるので、桁を小数第 2 位で切る（パスの文字数を抑える） */
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** 中心が center、外周までの長さが scale の座標系に、area を置いたときの点 */
export function areaPoint(
  area: Pick<Area, "radius" | "angle">,
  center: number,
  scale: number,
): { x: number; y: number } {
  const rad = (area.angle * Math.PI) / 180;
  return {
    x: round2(center + scale * area.radius * Math.sin(rad)),
    y: round2(center - scale * area.radius * Math.cos(rad)),
  };
}
