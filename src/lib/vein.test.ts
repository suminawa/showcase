import { describe, expect, it } from "vitest";

import { veinPlan } from "./vein";

// 端点は vein.ts の表と同じもの。ここで固定して、d を書き換えたら落ちるようにする
const WIDE = {
  w1: [33, 91],
  w2: [91, 87],
  w3: [87, 80],
  tail: [80, 6],
} as const;

const NARROW = {
  w1: [36, 84],
  w2: [84, 74],
  w3: [74, 56],
  tail: [56, 17],
} as const;

/** 区間の x を、送りと伸縮を掛けたあとの紙の上の位置へ写す */
const at = (x: number, dx: number, scale: number) => dx + scale * x;

describe("veinPlan", () => {
  it("段が 3 つのとき、送りは全て 0・伸縮は 1（手で描いた数値と一致する）", () => {
    const plan = veinPlan(3);

    expect(plan.rows).toEqual([
      { at: "w1", dx: 0, dxNarrow: 0 },
      { at: "w2", dx: 0, dxNarrow: 0 },
      { at: "w3", dx: 0, dxNarrow: 0 },
    ]);
    expect(plan.tailDx).toBe(0);
    expect(plan.tailDxNarrow).toBe(0);
    expect(plan.tailScale).toBe(1);
    expect(plan.tailScaleNarrow).toBe(1);
  });

  it("1 段目は必ず w1（斜行の起点は一つしかない）", () => {
    for (const n of [1, 2, 3, 5, 9]) {
      expect(veinPlan(n).rows[0]).toEqual({ at: "w1", dx: 0, dxNarrow: 0 });
    }
  });

  it("段が増えても繋ぎ目で飛ばない ── 各区間の始点は前の区間の終点に一致する", () => {
    for (const rowCount of [1, 2, 3, 4, 5, 6, 7, 8]) {
      const plan = veinPlan(rowCount);
      let x = WIDE.w1[1];

      for (const row of plan.rows.slice(1)) {
        const [start, end] = WIDE[row.at as "w2" | "w3"];
        expect(start + row.dx).toBeCloseTo(x, 6);
        x = end + row.dx;
      }

      // 結びも例外ではない。送りだけでは両端を同時に合わせられないので、
      // 伸縮を併せて持たせてある（もとの実装はここで送りを下限に丸めていて、
      // 4 段以上のとき紙の上で線が切れていた）
      expect(at(WIDE.tail[0], plan.tailDx, plan.tailScale)).toBeCloseTo(x, 6);
    }
  });

  it("狭い紙の d も同じ規則で繋がる（端点の表が別なので独立に確かめる）", () => {
    for (const rowCount of [1, 3, 4, 5, 6]) {
      const plan = veinPlan(rowCount);
      let x = NARROW.w1[1];

      for (const row of plan.rows.slice(1)) {
        const [start, end] = NARROW[row.at as "w2" | "w3"];
        expect(start + row.dxNarrow).toBeCloseTo(x, 6);
        x = end + row.dxNarrow;
      }

      expect(
        at(NARROW.tail[0], plan.tailDxNarrow, plan.tailScaleNarrow),
      ).toBeCloseTo(x, 6);
    }
  });

  it("結びは手で描いた着地点（紙の左）に着く ── 潰れの下限に当たるまでは", () => {
    for (const rowCount of [1, 2, 3, 4, 5, 6, 7, 8]) {
      const plan = veinPlan(rowCount);
      // 下限に当たったときだけは、着地点を譲って繋ぎ目のほうを守る
      if (plan.tailScale > 0.3) {
        expect(at(WIDE.tail[1], plan.tailDx, plan.tailScale)).toBeCloseTo(
          WIDE.tail[1],
          6,
        );
      }
      if (plan.tailScaleNarrow > 0.3) {
        expect(
          at(NARROW.tail[1], plan.tailDxNarrow, plan.tailScaleNarrow),
        ).toBeCloseTo(NARROW.tail[1], 6);
      }
    }
  });

  it("結びが縦の一本に潰れない（横の伸縮に下限がある）", () => {
    for (const rowCount of [1, 4, 8, 12, 20, 40]) {
      const plan = veinPlan(rowCount);
      expect(plan.tailScale).toBeGreaterThanOrEqual(0.3);
      expect(plan.tailScaleNarrow).toBeGreaterThanOrEqual(0.3);
      // 潰れを下限で止めたときも、繋ぎ目のほうは必ず守る
      const rows = plan.rows;
      const last = rows[rows.length - 1];
      const end =
        rows.length === 1
          ? WIDE.w1[1]
          : WIDE[last.at as "w2" | "w3"][1] + last.dx;
      expect(at(WIDE.tail[0], plan.tailDx, plan.tailScale)).toBeCloseTo(end, 6);
    }
  });

  it("送りが続いても脈は紙の縁に貼り付かない（下限で止まる）", () => {
    const ends: Record<string, number> = { w2: 87, w3: 80 };

    for (const rowCount of [10, 16, 30]) {
      for (const row of veinPlan(rowCount).rows.slice(1)) {
        expect(ends[row.at] + row.dx).toBeGreaterThanOrEqual(18);
      }
    }
  });

  it("中間の区間は w2 と w3 を交互に使う（同じ形が続かない）", () => {
    const plan = veinPlan(6);
    expect(plan.rows.map((r) => r.at)).toEqual([
      "w1",
      "w2",
      "w3",
      "w2",
      "w3",
      "w2",
    ]);
  });

  it("段が無くても落ちない", () => {
    expect(veinPlan(0).rows).toEqual([]);
  });
});
