/**
 * 見本「潮見計測」のヒーローの波。
 * 波は 1 タイル（WAVE_TILE）ぶんずらすと元の形に戻るように作る ──
 * 波長がタイルを割り切るなら、タイル 2 枚ぶんの長さで描いて
 * CSS で translateX(-WAVE_TILE) まで動かせば、継ぎ目なく回り続ける。
 * 動かすのは CSS だけで、JavaScript は使わない。
 */

/** viewBox の幅。1 周ぶんのずらし幅でもある */
export const WAVE_TILE = 1200;

/** viewBox の高さ */
export const WAVE_HEIGHT = 240;

/** タイル 2 枚（2400）を何点で刻むか。2400 / 96 = 25 単位ごと */
export const WAVE_SAMPLES = 96;

export type WaveLayer = {
  id: string;
  /** 波 1 つぶんの長さ。WAVE_TILE を割り切る値にする */
  wavelength: number;
  /** 山と谷の高さ */
  amplitude: number;
  /** 波の中心の高さ（上からの距離） */
  baseline: number;
  /** 塗りの濃さ。3 枚重なるので、合計が濃くなりすぎないようにする */
  opacity: number;
  /** 1 周にかける秒数 */
  duration: number;
  /** 逆向きに流すか */
  reverse: boolean;
};

export const WAVE_LAYERS: readonly WaveLayer[] = [
  {
    id: "far",
    wavelength: 600,
    amplitude: 26,
    baseline: 120,
    opacity: 0.1,
    duration: 40,
    reverse: true,
  },
  {
    id: "mid",
    wavelength: 400,
    amplitude: 18,
    baseline: 150,
    opacity: 0.07,
    duration: 28,
    reverse: false,
  },
  {
    id: "near",
    wavelength: 300,
    amplitude: 12,
    baseline: 178,
    opacity: 0.05,
    duration: 22,
    reverse: true,
  },
];

/** SVG のパスに載せるので、桁を小数第 2 位で切る（文字数を抑える） */
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * 正弦の波を、下辺まで閉じた塗りのパスにする。
 * y は baseline から amplitude だけ上下し、上に凸のところが山になる。
 */
export function sineWavePath(options: {
  width: number;
  height: number;
  baseline: number;
  amplitude: number;
  wavelength: number;
  samples: number;
  phase?: number;
}): string {
  const { width, height, baseline, amplitude, wavelength, samples } = options;
  const phase = options.phase ?? 0;
  const step = width / samples;
  const points: string[] = [];

  for (let i = 0; i <= samples; i++) {
    const x = step * i;
    const t = (x / wavelength) * Math.PI * 2 + phase;
    points.push(`${round2(x)},${round2(baseline - amplitude * Math.sin(t))}`);
  }

  const line = points
    .slice(1)
    .map((point) => `L${point}`)
    .join(" ");
  return `M${points[0]} ${line} L${round2(width)},${round2(height)} L0,${round2(height)} Z`;
}
