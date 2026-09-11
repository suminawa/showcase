export type Particle = {
  x: number;
  y: number;
  /** 1 秒あたりの移動量（px） */
  vx: number;
  vy: number;
  /** 半径（px） */
  r: number;
  /** 不透明度 */
  a: number;
};

/** 決定的な乱数（mulberry32）。同じ種なら同じ粒が出るので、テストと再描画が安定する */
export function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/** width × height の面に count 個の粒を撒く。速さ 6〜18 px/s、半径 1〜3 px、不透明度 0.15〜0.5 */
export function createParticles(
  count: number,
  width: number,
  height: number,
  seed = 1,
): Particle[] {
  const rand = mulberry32(seed);
  const out: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = rand() * Math.PI * 2;
    const speed = 6 + rand() * 12;
    out.push({
      x: rand() * width,
      y: rand() * height,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: 1 + rand() * 2,
      a: 0.15 + rand() * 0.35,
    });
  }
  return out;
}

/** dt 秒ぶん進める。縁を出た粒は反対側から戻る（面の外に粒が溜まらない） */
export function stepParticles(
  particles: Particle[],
  dt: number,
  width: number,
  height: number,
): void {
  for (const p of particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.x < -p.r) p.x += width + p.r * 2;
    else if (p.x > width + p.r) p.x -= width + p.r * 2;
    if (p.y < -p.r) p.y += height + p.r * 2;
    else if (p.y > height + p.r) p.y -= height + p.r * 2;
  }
}
