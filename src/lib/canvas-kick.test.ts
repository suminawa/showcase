import { describe, expect, it } from "vitest";

import { isSized, kickUntilSized, type CanvasSize } from "./canvas-kick";

/** 手で進める時計。tick() で登録された fn を 1 回呼ぶ */
function manualClock() {
  let fn: (() => void) | null = null;
  let cancelled = false;
  return {
    every: (f: () => void) => {
      fn = f;
      return () => {
        cancelled = true;
      };
    },
    tick: () => {
      if (!cancelled) fn?.();
    },
    get cancelled() {
      return cancelled;
    },
  };
}

describe("isSized", () => {
  it("HTML の既定の 300×150 は測る前とみなす", () => {
    expect(isSized({ width: 300, height: 150 })).toBe(false);
    expect(isSized({ width: 1043, height: 585 })).toBe(true);
    expect(isSized({ width: 300, height: 400 })).toBe(true);
  });
});

describe("kickUntilSized", () => {
  it("canvas が現れるまでは促さず、現れたら測られるまで促し、測られたら止まる", () => {
    const clock = manualClock();
    let canvas: CanvasSize | null = null;
    let kicks = 0;
    kickUntilSized({ findCanvas: () => canvas, kick: () => kicks++, every: clock.every });

    clock.tick();
    clock.tick();
    expect(kicks).toBe(0);

    canvas = { width: 300, height: 150 };
    clock.tick();
    clock.tick();
    expect(kicks).toBe(2);

    canvas = { width: 1060, height: 794 };
    clock.tick();
    expect(kicks).toBe(2);
    expect(clock.cancelled).toBe(true);
  });

  it("決めた回数で諦める", () => {
    const clock = manualClock();
    let kicks = 0;
    kickUntilSized(
      { findCanvas: () => ({ width: 300, height: 150 }), kick: () => kicks++, every: clock.every },
      { maxTicks: 3 },
    );
    for (let i = 0; i < 10; i++) clock.tick();
    expect(kicks).toBe(3);
    expect(clock.cancelled).toBe(true);
  });

  it("返した関数で外から止められる", () => {
    const clock = manualClock();
    let kicks = 0;
    const stop = kickUntilSized({
      findCanvas: () => ({ width: 300, height: 150 }),
      kick: () => kicks++,
      every: clock.every,
    });
    clock.tick();
    stop();
    clock.tick();
    expect(kicks).toBe(1);
    expect(clock.cancelled).toBe(true);
  });
});
