/**
 * 水盤の配置 — 決定論的な純関数だけを置く。
 *
 * 乱数は一切使わない。SSR とハイドレーションで同じ配置が出ること、
 * スクリーンショットが再現できることが要件だから。ばらつきは
 * key の並びから引いたハッシュ（= baseAngle）だけが持つ。
 */

import {
  DROP_RADIUS,
  ID_MIN_DENSITY,
  ID_MIN_DOMINANCE,
  type IdSample,
} from "@/components/suminagashi/fluid/simulation";

/** 中心からの最大到達距離（画面上の距離。高さ 1 が単位）→ 乾いた縁 10% */
export const SAFE = 0.4;
/** 隣接クラスタの重なり率。重なりこそがマーブリング */
export const OVERLAP = 0.15;

/** 1 クラスタの滴数の下限・上限 */
export const MIN_DROPS = 5;
export const MAX_DROPS = 14;

export type BasinEntry = {
  /** 安定した識別子。並びが baseAngle を決める */
  key: string;
  /** 素水（GAMES）。濃度は持つが顔料を持たず、当たり判定を返さない */
  inert?: boolean;
};

export type BasinSeed = {
  /** 染料テクスチャのチャンネル番号。配列 index と同じ */
  species: number;
  key: string;
  inert: boolean;
  /** 滴を落とす原点（UV。アスペクト補正済みで、画面上は真円の輪に乗る） */
  origin: { x: number; y: number };
  /** 原点を置く輪の半径 R（画面上の距離） */
  ringRadius: number;
  /** 輪の中心角 θ（ラジアン、未正規化） */
  angle: number;
  /** 育ちきったクラスタの半径 ρ（画面上の距離） */
  radius: number;
  /** 滴数 k */
  drops: number;
  /** 1 滴の半径 r（splatSpecies にそのまま渡せる UV 半径） */
  dropRadius: number;
};

/** FNV-1a 32bit。決定論的で、1 文字の違いが全ビットに散る */
export function hashString(s: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    hash ^= s.charCodeAt(i);
    // 32bit の FNV 素数 16777619 を乗算（オーバーフローを避けてシフトで組む）
    hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0;
  }
  return hash >>> 0;
}

function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

/**
 * seed の配置。仕様 §2-2 の式そのまま。
 *
 * ```
 * s  = sin(π/N) / (1 - OVERLAP)
 * R  = SAFE / (1 + s)
 * ρ  = R * s
 * θᵢ = baseAngle + i * 2π/N
 * k  = clamp(round(ρ² / DROP_RADIUS²), 5, 14)
 * r  = ρ / sqrt(k)
 * ```
 *
 * k と r が `k·r² = ρ²` を満たすので、作品が増えて 1 クラスタが小さくなっても
 * 「滴を重ねて育てる」手順は同じままで、水面が黒く潰れない（面積保存）。
 *
 * 原点はアスペクト補正して、画面上で真円の輪に乗せる。滴の半径は
 * `dropShader` が `p.x *= aspect` で測るので高さ基準のまま渡してよい。
 */
export function seedLayout(
  entries: readonly BasinEntry[],
  aspect: number,
): BasinSeed[] {
  const n = entries.length;
  if (n === 0) return [];

  const s = Math.sin(Math.PI / n) / (1 - OVERLAP);
  const ringRadius = SAFE / (1 + s);
  const radius = ringRadius * s;
  const drops = clamp(
    Math.round(radius ** 2 / DROP_RADIUS ** 2),
    MIN_DROPS,
    MAX_DROPS,
  );
  const dropRadius = radius / Math.sqrt(drops);
  const baseAngle =
    (hashString(entries.map((entry) => entry.key).join("|")) / 2 ** 32) *
    Math.PI *
    2;

  return entries.map((entry, index) => {
    const angle = baseAngle + (index * 2 * Math.PI) / n;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      species: index,
      key: entry.key,
      inert: entry.inert === true,
      origin: {
        x: 0.5 + (aspect >= 1 ? (ringRadius * cos) / aspect : ringRadius * cos),
        y: 0.5 + (aspect >= 1 ? ringRadius * sin : ringRadius * sin * aspect),
      },
      ringRadius,
      angle,
      radius,
      drops,
      dropRadius,
    };
  });
}

/**
 * id map の読み戻しバッファから座標 (u, v) の作品を決める。
 *
 * **行順**: `readPixels` の行 0 は下端で、v は GL 座標（y 上向き）なので
 * `row = floor(v * h)` でそのまま一致する。ここは最も間違えやすいので
 * テストで固定してある。
 *
 * 3×3 近傍の density 重み付き多数決。しきい値はエンジン側と同じものを
 * import しているので、二重定義でずれることがない。
 * 正方（96×96）では `sampleIdMap` と完全に同じ判定を返す（テストで固定）。
 */
export function argmaxFromIdMap(
  buf: Uint8Array,
  w: number,
  h: number,
  u: number,
  v: number,
): IdSample | null {
  const col = clamp(Math.floor(u * w), 0, w - 1);
  const row = clamp(Math.floor(v * h), 0, h - 1);

  const votes = [0, 0, 0, 0];
  let densitySum = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const r = clamp(row + dr, 0, h - 1);
      const c = clamp(col + dc, 0, w - 1);
      const i = (r * w + c) * 4;
      const density = buf[i + 2] / 255;
      votes[buf[i] & 3] += density * (buf[i + 1] / 255);
      densitySum += density;
    }
  }
  if (densitySum <= 0) return null;

  let species = 0;
  for (let i = 1; i < votes.length; i++) {
    if (votes[i] > votes[species]) species = i;
  }
  const dominance = votes[species] / densitySum;
  const density = densitySum / 9;
  if (density < ID_MIN_DENSITY || dominance < ID_MIN_DOMINANCE) return null;
  return { species, dominance, density };
}
