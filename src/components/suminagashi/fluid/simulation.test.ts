import { describe, expect, it, vi } from "vitest";
import {
  DEFAULT_PALETTE,
  DROP_RADIUS,
  ENTRANCE_DROPS,
  FluidSimulation,
  ID_MAP_SIZE,
  INK_ABSORPTION,
  PAPER,
  UNDYED,
  centroidFromIdMap,
  correctRadius,
  dropsBetween,
  pickInk,
  sampleIdMap,
  speciesOfInk,
} from "./simulation";

describe("entrance choreography", () => {
  it("同心円が育つだけの滴数があり、時刻昇順、座標は 0..1 に収まる", () => {
    // 同じ一点へ交互に落として輪を育てる演出なので、滴は多く必要
    expect(ENTRANCE_DROPS.length).toBeGreaterThanOrEqual(12);
    for (let i = 1; i < ENTRANCE_DROPS.length; i++) {
      expect(ENTRANCE_DROPS[i].atMs).toBeGreaterThan(
        ENTRANCE_DROPS[i - 1].atMs,
      );
    }
    for (const drop of ENTRANCE_DROPS) {
      expect(drop.x).toBeGreaterThan(0);
      expect(drop.x).toBeLessThan(1);
      expect(drop.y).toBeGreaterThan(0);
      expect(drop.y).toBeLessThan(1);
      expect(drop.radius).toBeGreaterThan(0);
    }
  });

  it("dropsBetween は (prev, now] の滴だけ返す", () => {
    const all = dropsBetween(-1, 10000);
    expect(all).toEqual(ENTRANCE_DROPS);
    expect(dropsBetween(-1, 0)).toEqual([]);
    const first = ENTRANCE_DROPS[0];
    expect(dropsBetween(first.atMs - 1, first.atMs)).toEqual([first]);
    expect(dropsBetween(first.atMs, first.atMs)).toEqual([]);
    const last = ENTRANCE_DROPS[ENTRANCE_DROPS.length - 1];
    expect(dropsBetween(last.atMs - 1, last.atMs + 1000)).toEqual([last]);
    expect(dropsBetween(last.atMs, last.atMs + 1000)).toEqual([]);
  });
});

describe("ink", () => {
  it("pickInk は墨 1 : 藍 2 の繰り返し", () => {
    expect([0, 1, 2, 3, 4, 5].map(pickInk)).toEqual([
      "carbon",
      "indigo",
      "indigo",
      "carbon",
      "indigo",
      "indigo",
    ]);
  });

  it("表示色（紙白 − 吸収）が 0..1 に収まる", () => {
    for (const ink of ["indigo", "carbon"] as const) {
      const absorption = INK_ABSORPTION[ink];
      for (let c = 0; c < 3; c++) {
        const shown = PAPER[c] - absorption[c];
        expect(shown).toBeGreaterThanOrEqual(0);
        expect(shown).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe("correctRadius", () => {
  it("横長では aspect 倍、縦長ではそのまま", () => {
    expect(correctRadius(0.003, 2000, 1000)).toBeCloseTo(0.006);
    expect(correctRadius(0.003, 1000, 2000)).toBeCloseTo(0.003);
  });
});

describe("palette の既定値（後方互換の要）", () => {
  it("既定は [墨, 藍, 素水, 素水]。作品ページの出力が変わらない割り当て", () => {
    expect(DEFAULT_PALETTE).toEqual([
      INK_ABSORPTION.carbon,
      INK_ABSORPTION.indigo,
      UNDYED,
      UNDYED,
    ]);
    // INK_ABSORPTION を書き換えても既定パレットが道連れにならない
    expect(DEFAULT_PALETTE[0]).not.toBe(INK_ABSORPTION.carbon);
  });

  it("speciesOfInk: 墨 = 0 / 藍 = 1", () => {
    expect(speciesOfInk("carbon")).toBe(0);
    expect(speciesOfInk("indigo")).toBe(1);
  });

  it("setPalette は 4 色 × 3 成分に平坦化し、足りない分は素水で埋める", () => {
    const sim = Object.create(FluidSimulation.prototype) as FluidSimulation;
    const self = sim as unknown as { palette: Float32Array };
    self.palette = new Float32Array(12);
    sim.setPalette(DEFAULT_PALETTE);
    const expected = [
      ...INK_ABSORPTION.carbon,
      ...INK_ABSORPTION.indigo,
      0, 0, 0,
      0, 0, 0,
    ];
    expect(self.palette).toHaveLength(12);
    expected.forEach((value, i) => {
      expect(self.palette[i]).toBeCloseTo(value, 6);
    });

    sim.setPalette([[1, 0, 0]]);
    expect(Array.from(self.palette)).toEqual([1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  });
});

describe("splatInk は splatSpecies へ委譲する", () => {
  it("墨 → species 0 / 藍 → species 1、半径はそのまま渡る", () => {
    const sim = Object.create(FluidSimulation.prototype) as FluidSimulation;
    const spy = vi.fn();
    (sim as unknown as { splatSpecies: unknown }).splatSpecies = spy;

    sim.splatInk(0.3, 0.7, "carbon");
    sim.splatInk(0.4, 0.6, "indigo", 0.02);

    expect(spy.mock.calls).toEqual([
      [0.3, 0.7, 0, DROP_RADIUS],
      [0.4, 0.6, 1, 0.02],
    ]);
  });
});

/** id map の読み戻しバッファを組み立てる（row 0 = 下端） */
function makeIdBuffer(
  size: number,
  cell: (row: number, col: number) => [number, number, number],
): Uint8Array {
  const buf = new Uint8Array(size * size * 4);
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const [idx, dominance, density] = cell(row, col);
      const i = (row * size + col) * 4;
      buf[i] = idx;
      buf[i + 1] = dominance;
      buf[i + 2] = density;
      buf[i + 3] = 255;
    }
  }
  return buf;
}

describe("sampleIdMap", () => {
  const size = ID_MAP_SIZE;
  const half = size / 2;

  it("v は GL 座標（y 上向き）。row = floor(v*size) が readPixels の行順と一致する", () => {
    // 下半分（row < 48）が species 1、上半分が species 2
    const buf = makeIdBuffer(size, (row) => [row < half ? 1 : 2, 255, 255]);
    expect(sampleIdMap(buf, size, 0.5, 0.1)?.species).toBe(1);
    expect(sampleIdMap(buf, size, 0.5, 0.9)?.species).toBe(2);
    // 端も落ちない（3×3 は clamp される）
    expect(sampleIdMap(buf, size, 0.0, 0.0)?.species).toBe(1);
    expect(sampleIdMap(buf, size, 1.0, 1.0)?.species).toBe(2);
  });

  it("u は列。左右も取り違えない", () => {
    const buf = makeIdBuffer(size, (_row, col) => [col < half ? 1 : 2, 255, 255]);
    expect(sampleIdMap(buf, size, 0.1, 0.5)?.species).toBe(1);
    expect(sampleIdMap(buf, size, 0.9, 0.5)?.species).toBe(2);
  });

  it("空の水域（総濃度 < 0.05）は null", () => {
    expect(sampleIdMap(makeIdBuffer(size, () => [0, 0, 0]), size, 0.5, 0.5)).toBeNull();
    // density = 10/255 ≈ 0.039 < 0.05
    expect(sampleIdMap(makeIdBuffer(size, () => [1, 255, 10]), size, 0.5, 0.5)).toBeNull();
  });

  it("混ざりきった水域（占有率 < 0.45）は null", () => {
    // 占有率 100/255 ≈ 0.392
    const buf = makeIdBuffer(size, () => [1, 100, 255]);
    expect(sampleIdMap(buf, size, 0.5, 0.5)).toBeNull();
    // 0.45 を超えれば拾える
    const ok = sampleIdMap(makeIdBuffer(size, () => [1, 130, 255]), size, 0.5, 0.5);
    expect(ok?.species).toBe(1);
    expect(ok?.dominance).toBeGreaterThanOrEqual(0.45);
    expect(ok?.density).toBeCloseTo(1, 5);
  });

  it("3×3 の多数決なので 1 セルの飛び値では入れ替わらない", () => {
    const buf = makeIdBuffer(size, (row, col) =>
      row === 50 && col === 50 ? [2, 255, 255] : [1, 255, 255],
    );
    expect(sampleIdMap(buf, size, 50.5 / size, 50.5 / size)?.species).toBe(1);
  });
});

describe("centroidFromIdMap", () => {
  const size = ID_MAP_SIZE;

  it("重心は GL 座標。占有面積はセル比", () => {
    // 左下 1/4 のブロックだけが species 1
    const quarter = size / 2;
    const buf = makeIdBuffer(size, (row, col) =>
      row < quarter && col < quarter ? [1, 255, 255] : [0, 255, 255],
    );
    const centroid = centroidFromIdMap(buf, size, 1);
    expect(centroid).not.toBeNull();
    expect(centroid!.x).toBeCloseTo(0.25, 2);
    expect(centroid!.y).toBeCloseTo(0.25, 2);
    expect(centroid!.area).toBeCloseTo(0.25, 5);
  });

  it("居ない species は null", () => {
    const buf = makeIdBuffer(size, () => [0, 255, 255]);
    expect(centroidFromIdMap(buf, size, 3)).toBeNull();
  });
});
