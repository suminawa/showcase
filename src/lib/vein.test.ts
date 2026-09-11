import { describe, expect, it } from "vitest";

import { veinPlan } from "./vein";

describe("veinPlan", () => {
  it("作品 2 件＋空カテゴリ 1 行のとき、送りは全て 0（手で描いた数値と一致する）", () => {
    const plan = veinPlan(3);

    expect(plan.rows).toEqual([
      { at: "w1", dx: 0, dxNarrow: 0 },
      { at: "w2", dx: 0, dxNarrow: 0 },
      { at: "w3", dx: 0, dxNarrow: 0 },
    ]);
    expect(plan.tailDx).toBe(0);
    expect(plan.tailDxNarrow).toBe(0);
  });

  it("1 行目は必ず w1（斜行の起点は一つしかない）", () => {
    for (const n of [1, 2, 3, 5, 9]) {
      expect(veinPlan(n).rows[0]).toEqual({ at: "w1", dx: 0, dxNarrow: 0 });
    }
  });

  it("行が増えても繋ぎ目で飛ばない ── 各区間の始点は前の区間の終点に一致する", () => {
    // 端点は vein.ts の表と同じもの。ここで固定して、d を書き換えたら落ちるようにする
    const wide = {
      w1: [33, 91],
      w2: [91, 87],
      w3: [87, 80],
      tail: [80, 6],
    } as const;

    for (const rowCount of [1, 2, 3, 4, 5, 6, 7]) {
      const plan = veinPlan(rowCount);
      let x = wide.w1[1];

      for (const row of plan.rows.slice(1)) {
        const [start, end] = wide[row.at as "w2" | "w3"];
        expect(start + row.dx).toBeCloseTo(x, 6);
        x = end + row.dx;
      }

      // 結びの本来の終点は下限に近く、中間の区間が下限に当たるほど左へ
      // 流れた（x が結びの始点より左に来た）ときは、結びは継ぎ目より下限を
      // 優先する（vein.ts の floor clamp。「結びの送りも下限で止まる」で別に
      // 確かめている）。継ぎ目が保たれるのは、x がまだ結びの始点以上の間だけ
      if (x >= wide.tail[0]) {
        expect(wide.tail[0] + plan.tailDx).toBeCloseTo(x, 6);
      }
    }
  });

  it("狭い紙の d も同じ規則で繋がる（端点の表が別なので独立に確かめる）", () => {
    const narrow = {
      w1: [36, 84],
      w2: [84, 74],
      w3: [74, 56],
      tail: [56, 17],
    } as const;

    for (const rowCount of [1, 3, 4, 6]) {
      const plan = veinPlan(rowCount);
      let x = narrow.w1[1];

      for (const row of plan.rows.slice(1)) {
        const [start, end] = narrow[row.at as "w2" | "w3"];
        expect(start + row.dxNarrow).toBeCloseTo(x, 6);
        x = end + row.dxNarrow;
      }

      // 同じ理由（上のテストと同様）で、下限に当たる rowCount では継ぎ目より
      // 下限を優先するので、その場合は結びの継ぎ目チェックをしない
      if (x >= narrow.tail[0]) {
        expect(narrow.tail[0] + plan.tailDxNarrow).toBeCloseTo(x, 6);
      }
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

  it("結びの送りも下限で止まる ── 5 行目以降で紙の外まで送られない", () => {
    // FLOOR は vein.ts の非公開定数（18）と同じ値。端点も表の値をそのまま書く
    // （他のテストと同じやり方 ── d を書き換えたら落ちるようにする）
    const FLOOR = 18;
    const wideTailEnd = 6; // WIDE.tail の終点 x
    const narrowTailEnd = 17; // NARROW.tail の終点 x

    for (const rowCount of [4, 5, 6, 7, 8]) {
      const plan = veinPlan(rowCount);
      expect(wideTailEnd + plan.tailDx).toBeGreaterThanOrEqual(FLOOR);
      expect(narrowTailEnd + plan.tailDxNarrow).toBeGreaterThanOrEqual(FLOOR);
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

  it("行が無くても落ちない", () => {
    expect(veinPlan(0).rows).toEqual([]);
  });
});
