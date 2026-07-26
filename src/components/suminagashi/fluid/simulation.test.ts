import { describe, expect, it } from "vitest";
import {
  ENTRANCE_DROPS,
  INK_ABSORPTION,
  PAPER,
  correctRadius,
  dropsBetween,
  pickInk,
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
