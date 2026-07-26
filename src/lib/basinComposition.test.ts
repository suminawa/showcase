import { describe, expect, it } from "vitest";
import {
  ID_MAP_SIZE,
  ID_MIN_DENSITY,
  ID_MIN_DOMINANCE,
  sampleIdMap,
} from "@/components/suminagashi/fluid/simulation";
import {
  argmaxFromIdMap,
  hashString,
  MAX_DROPS,
  MIN_DROPS,
  OVERLAP,
  SAFE,
  seedLayout,
  type BasinEntry,
} from "./basinComposition";

// ---- 補助 ----

function entries(n: number): BasinEntry[] {
  return Array.from({ length: n }, (_, i) => ({ key: `entry-${i}` }));
}

/**
 * 画面上の距離（高さ 1 を単位とする）。dropShader / displaceShader が
 * `p.x *= aspect` で測る距離と同じ metric。SAFE はこの単位で定義されている。
 */
function screenOffset(
  origin: { x: number; y: number },
  aspect: number,
): number {
  const dx = (origin.x - 0.5) * aspect;
  const dy = origin.y - 0.5;
  return Math.hypot(dx, dy);
}

type Cell = { species: number; dominance: number; density: number };

/** idmapShader が RGBA8 へ書く形式でバッファを組む。行 0 は下端 */
function makeIdMap(
  w: number,
  h: number,
  cell: (col: number, row: number) => Cell,
): Uint8Array {
  const buf = new Uint8Array(w * h * 4);
  for (let row = 0; row < h; row++) {
    for (let col = 0; col < w; col++) {
      const { species, dominance, density } = cell(col, row);
      const i = (row * w + col) * 4;
      buf[i] = species;
      buf[i + 1] = Math.round(dominance * 255);
      buf[i + 2] = Math.round(density * 255);
      buf[i + 3] = 255;
    }
  }
  return buf;
}

const SOLID = { dominance: 1, density: 1 };

// ---- hashString ----

describe("hashString", () => {
  it("同じ文字列は必ず同じ値になる", () => {
    expect(hashString("suminagashi|quote-simulator")).toBe(
      hashString("suminagashi|quote-simulator"),
    );
  });

  it("32bit の非負整数を返す", () => {
    for (const s of ["", "a", "games|suminagashi|quote-simulator", "😀"]) {
      const h = hashString(s);
      expect(Number.isInteger(h)).toBe(true);
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThanOrEqual(0xffffffff);
    }
  });

  it("1 文字違えば別の値になる", () => {
    expect(hashString("games|suminagashi")).not.toBe(
      hashString("games|suminagashj"),
    );
    expect(hashString("ab")).not.toBe(hashString("ba"));
  });
});

// ---- seedLayout: 仕様の実測値 ----

describe("seedLayout の幾何", () => {
  it("N=3 は仕様の実測値 R=0.198 / ρ=0.202 / k=7 / r=0.076 になる", () => {
    const seeds = seedLayout(entries(3), 1);
    expect(seeds).toHaveLength(3);
    expect(seeds[0].ringRadius).toBeCloseTo(0.198, 3);
    expect(seeds[0].radius).toBeCloseTo(0.202, 3);
    expect(seeds[0].drops).toBe(7);
    expect(seeds[0].dropRadius).toBeCloseTo(0.076, 3);
  });

  it("N=5 は R=0.236 / ρ=0.164 / k=5 / r=0.073", () => {
    const seeds = seedLayout(entries(5), 1);
    expect(seeds[0].ringRadius).toBeCloseTo(0.236, 3);
    expect(seeds[0].radius).toBeCloseTo(0.164, 3);
    expect(seeds[0].drops).toBe(5);
    expect(seeds[0].dropRadius).toBeCloseTo(0.073, 3);
  });

  it("N=8 は R=0.276 / ρ=0.124 / k=5 / r=0.056", () => {
    const seeds = seedLayout(entries(8), 1);
    expect(seeds[0].ringRadius).toBeCloseTo(0.276, 3);
    expect(seeds[0].radius).toBeCloseTo(0.124, 3);
    expect(seeds[0].drops).toBe(5);
    expect(seeds[0].dropRadius).toBeCloseTo(0.056, 3);
  });

  it("R + ρ は N によらず SAFE に一致する（R = SAFE/(1+s), ρ = R·s）", () => {
    for (let n = 1; n <= 12; n++) {
      const [seed] = seedLayout(entries(n), 1);
      expect(seed.ringRadius + seed.radius).toBeCloseTo(SAFE, 12);
      const s = Math.sin(Math.PI / n) / (1 - OVERLAP);
      expect(seed.radius / seed.ringRadius).toBeCloseTo(s, 12);
    }
  });

  it("原点は画面上で真円の輪に等間隔で乗る", () => {
    for (const aspect of [0.6, 1, 1.05, 2]) {
      const seeds = seedLayout(entries(5), aspect);
      const distances = seeds.map((s) => screenOffset(s.origin, aspect));
      for (const d of distances) {
        expect(d).toBeCloseTo(distances[0], 10);
      }
      for (let i = 1; i < seeds.length; i++) {
        const step = seeds[i].angle - seeds[i - 1].angle;
        expect(step).toBeCloseTo((2 * Math.PI) / 5, 12);
      }
    }
  });
});

// ---- 面積保存 ----

describe("面積保存", () => {
  it("k 滴 × 半径 r の面積の和が育ちきったクラスタの面積に等しい（k·r² = ρ²）", () => {
    for (let n = 1; n <= 12; n++) {
      for (const seed of seedLayout(entries(n), 1.05)) {
        expect(seed.drops * seed.dropRadius ** 2).toBeCloseTo(
          seed.radius ** 2,
          12,
        );
      }
    }
  });

  it("滴数は [5, 14] に収まり、N が増えるほど減る", () => {
    let previous = Infinity;
    // N=1 は輪が縮退して ρ=0 になる degenerate なので N≥2 で見る
    for (let n = 2; n <= 12; n++) {
      const [seed] = seedLayout(entries(n), 1);
      expect(seed.drops).toBeGreaterThanOrEqual(MIN_DROPS);
      expect(seed.drops).toBeLessThanOrEqual(MAX_DROPS);
      expect(seed.drops).toBeLessThanOrEqual(previous);
      previous = seed.drops;
    }
  });

  it("クランプで滴数が増えても面積保存は崩れない（N=8 は k=3→5 に切り上がる）", () => {
    const [seed] = seedLayout(entries(8), 1);
    expect(seed.drops).toBe(MIN_DROPS);
    expect(seed.drops * seed.dropRadius ** 2).toBeCloseTo(seed.radius ** 2, 12);
  });

  it("水面が黒く潰れない — 染料の総面積は水盤の 45% を超えない", () => {
    for (let n = 1; n <= 12; n++) {
      const seeds = seedLayout(entries(n), 1);
      const inked = seeds.reduce((sum, s) => sum + Math.PI * s.radius ** 2, 0);
      expect(inked).toBeLessThan(0.45);
    }
  });
});

// ---- 到達範囲 ----

describe("到達範囲", () => {
  it("N=3/5/8 で UV の両軸とも [0.10, 0.90] を出ない", () => {
    for (const n of [3, 5, 8]) {
      for (const aspect of [1, 1.05, 1.5, 2]) {
        for (const seed of seedLayout(entries(n), aspect)) {
          // 滴の半径は高さ基準（dropShader の p.x *= aspect）なので u 方向は ρ/aspect
          const rx = seed.radius / Math.max(aspect, 1);
          const ry = seed.radius * Math.min(aspect, 1);
          expect(seed.origin.x - rx).toBeGreaterThanOrEqual(0.1 - 1e-12);
          expect(seed.origin.x + rx).toBeLessThanOrEqual(0.9 + 1e-12);
          expect(seed.origin.y - ry).toBeGreaterThanOrEqual(0.1 - 1e-12);
          expect(seed.origin.y + ry).toBeLessThanOrEqual(0.9 + 1e-12);
        }
      }
    }
  });

  it("画面上の到達距離は SAFE を超えない（乾いた縁 10% が残る）", () => {
    for (const n of [3, 5, 8]) {
      for (const aspect of [0.6, 1, 1.05, 2]) {
        for (const seed of seedLayout(entries(n), aspect)) {
          expect(screenOffset(seed.origin, aspect) + seed.radius).toBeLessThanOrEqual(
            SAFE + 1e-12,
          );
        }
      }
    }
  });
});

// ---- 決定論 ----

describe("決定論", () => {
  it("同じ入力は同じ出力（SSR とハイドレーションで一致する）", () => {
    const input = [
      { key: "games", inert: true },
      { key: "suminagashi" },
      { key: "quote-simulator" },
    ];
    expect(seedLayout(input, 1.05)).toEqual(seedLayout(input, 1.05));
    // 同一内容の別インスタンスでも一致する
    expect(seedLayout(input.map((e) => ({ ...e })), 1.05)).toEqual(
      seedLayout(input, 1.05),
    );
  });

  it("baseAngle は key の並びから決まる（乱数を使わない）", () => {
    const a = seedLayout(
      [{ key: "games" }, { key: "suminagashi" }, { key: "quote-simulator" }],
      1,
    );
    const b = seedLayout(
      [{ key: "games" }, { key: "quote-simulator" }, { key: "suminagashi" }],
      1,
    );
    expect(a[0].angle).not.toBeCloseTo(b[0].angle, 6);

    const expected =
      (hashString("games|suminagashi|quote-simulator") / 2 ** 32) *
      Math.PI *
      2;
    expect(a[0].angle).toBeCloseTo(expected, 12);
    expect(a[0].angle).toBeGreaterThanOrEqual(0);
    expect(a[0].angle).toBeLessThan(Math.PI * 2);
  });

  it("species は配列 index、key と inert はそのまま透過する", () => {
    const seeds = seedLayout(
      [{ key: "games", inert: true }, { key: "suminagashi" }],
      1,
    );
    expect(seeds.map((s) => s.species)).toEqual([0, 1]);
    expect(seeds.map((s) => s.key)).toEqual(["games", "suminagashi"]);
    expect(seeds.map((s) => s.inert)).toEqual([true, false]);
  });

  it("空の入力は空の配列", () => {
    expect(seedLayout([], 1)).toEqual([]);
  });
});

// ---- 3×3 多数決 ----

describe("argmaxFromIdMap", () => {
  it("v と readPixels の行順が一致する（行 0 = 下端 = v が小さい側）", () => {
    const buf = makeIdMap(ID_MAP_SIZE, ID_MAP_SIZE, (_col, row) => ({
      species: row < ID_MAP_SIZE / 2 ? 1 : 2,
      ...SOLID,
    }));
    expect(argmaxFromIdMap(buf, ID_MAP_SIZE, ID_MAP_SIZE, 0.5, 0.1)?.species).toBe(1);
    expect(argmaxFromIdMap(buf, ID_MAP_SIZE, ID_MAP_SIZE, 0.5, 0.9)?.species).toBe(2);
    // 端も同じ向き
    expect(argmaxFromIdMap(buf, ID_MAP_SIZE, ID_MAP_SIZE, 0.5, 0.0)?.species).toBe(1);
    expect(argmaxFromIdMap(buf, ID_MAP_SIZE, ID_MAP_SIZE, 0.5, 1.0)?.species).toBe(2);
  });

  it("u と列が一致する", () => {
    const buf = makeIdMap(ID_MAP_SIZE, ID_MAP_SIZE, (col) => ({
      species: col < ID_MAP_SIZE / 2 ? 3 : 0,
      ...SOLID,
    }));
    expect(argmaxFromIdMap(buf, ID_MAP_SIZE, ID_MAP_SIZE, 0.1, 0.5)?.species).toBe(3);
    expect(argmaxFromIdMap(buf, ID_MAP_SIZE, ID_MAP_SIZE, 0.9, 0.5)?.species).toBe(0);
  });

  it("行と列を取り違えていない（非正方バッファで w と h が効く）", () => {
    // 8 列 × 4 行。下 2 行が species 1、上 2 行が species 2
    const buf = makeIdMap(8, 4, (_col, row) => ({
      species: row < 2 ? 1 : 2,
      ...SOLID,
    }));
    expect(argmaxFromIdMap(buf, 8, 4, 0.5, 0.1)?.species).toBe(1);
    expect(argmaxFromIdMap(buf, 8, 4, 0.5, 0.9)?.species).toBe(2);
  });

  it("3×3 の多数決は 1 セルの飛び値に負けない", () => {
    const buf = makeIdMap(ID_MAP_SIZE, ID_MAP_SIZE, (col, row) => ({
      species: col === 48 && row === 48 ? 2 : 1,
      ...SOLID,
    }));
    const hit = argmaxFromIdMap(buf, ID_MAP_SIZE, ID_MAP_SIZE, 48.5 / 96, 48.5 / 96);
    expect(hit?.species).toBe(1);
    expect(hit?.dominance).toBeCloseTo(8 / 9, 2);
  });

  it("空の水域（density < 0.05）は null", () => {
    const empty = makeIdMap(ID_MAP_SIZE, ID_MAP_SIZE, () => ({
      species: 0,
      dominance: 0,
      density: 0,
    }));
    expect(argmaxFromIdMap(empty, ID_MAP_SIZE, ID_MAP_SIZE, 0.5, 0.5)).toBeNull();

    const faint = makeIdMap(ID_MAP_SIZE, ID_MAP_SIZE, () => ({
      species: 1,
      dominance: 1,
      density: ID_MIN_DENSITY * 0.6,
    }));
    expect(argmaxFromIdMap(faint, ID_MAP_SIZE, ID_MAP_SIZE, 0.5, 0.5)).toBeNull();
  });

  it("混ざりきった水域（dominance < 0.45）は null", () => {
    const mixed = makeIdMap(ID_MAP_SIZE, ID_MAP_SIZE, () => ({
      species: 1,
      dominance: ID_MIN_DOMINANCE - 0.05,
      density: 1,
    }));
    expect(argmaxFromIdMap(mixed, ID_MAP_SIZE, ID_MAP_SIZE, 0.5, 0.5)).toBeNull();

    const solid = makeIdMap(ID_MAP_SIZE, ID_MAP_SIZE, () => ({
      species: 1,
      dominance: ID_MIN_DOMINANCE + 0.05,
      density: 1,
    }));
    const hit = argmaxFromIdMap(solid, ID_MAP_SIZE, ID_MAP_SIZE, 0.5, 0.5);
    expect(hit?.species).toBe(1);
    expect(hit?.density).toBeCloseTo(1, 2);
  });

  it("エンジンの sampleIdMap と同じ判定を返す（しきい値が二重定義でずれない）", () => {
    let state = 12345;
    const rand = () => {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 2 ** 32;
    };
    const buf = makeIdMap(ID_MAP_SIZE, ID_MAP_SIZE, () => ({
      species: Math.floor(rand() * 4),
      dominance: rand(),
      density: rand(),
    }));
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 20; j++) {
        const u = i / 19;
        const v = j / 19;
        expect(argmaxFromIdMap(buf, ID_MAP_SIZE, ID_MAP_SIZE, u, v)).toEqual(
          sampleIdMap(buf, ID_MAP_SIZE, u, v),
        );
      }
    }
  });
});
