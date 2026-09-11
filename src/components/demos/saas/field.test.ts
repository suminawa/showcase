import { describe, expect, it } from "vitest";
import { createParticles, mulberry32, stepParticles } from "./field";

describe("hero field", () => {
  it("同じ種なら同じ粒（決定的）", () => {
    expect(createParticles(5, 100, 50, 7)).toEqual(createParticles(5, 100, 50, 7));
    expect(createParticles(5, 100, 50, 7)).not.toEqual(
      createParticles(5, 100, 50, 8),
    );
  });

  it("mulberry32 は [0, 1) を返す", () => {
    const rand = mulberry32(42);
    for (let i = 0; i < 1000; i++) {
      const v = rand();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("撒いた粒は面の中にあり、大きさ・濃さ・速さは決めた範囲", () => {
    for (const p of createParticles(200, 300, 200, 1)) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(300);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(200);
      expect(p.r).toBeGreaterThanOrEqual(1);
      expect(p.r).toBeLessThanOrEqual(3);
      expect(p.a).toBeGreaterThanOrEqual(0.15);
      expect(p.a).toBeLessThanOrEqual(0.5);
      const speed = Math.hypot(p.vx, p.vy);
      expect(speed).toBeGreaterThan(5.99);
      expect(speed).toBeLessThan(18.01);
    }
  });

  it("縁を出た粒は反対側から戻る", () => {
    const right = [{ x: 99, y: 10, vx: 10, vy: 0, r: 2, a: 0.3 }];
    stepParticles(right, 1, 100, 50);
    expect(right[0].x).toBeCloseTo(5);

    const up = [{ x: 10, y: 1, vx: 0, vy: -10, r: 2, a: 0.3 }];
    stepParticles(up, 1, 100, 50);
    expect(up[0].y).toBeCloseTo(45);
  });

  it("dt = 0 なら動かない", () => {
    const ps = createParticles(3, 100, 100, 2);
    const before = JSON.parse(JSON.stringify(ps));
    stepParticles(ps, 0, 100, 100);
    expect(ps).toEqual(before);
  });
});
