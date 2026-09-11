import { describe, expect, it } from "vitest";
import {
  sineWavePath,
  WAVE_HEIGHT,
  WAVE_LAYERS,
  WAVE_SAMPLES,
  WAVE_TILE,
} from "./wave";

describe("corporate wave", () => {
  it("波は正弦で、最後に下辺まで閉じる", () => {
    expect(
      sineWavePath({
        width: 4,
        height: 20,
        baseline: 10,
        amplitude: 2,
        wavelength: 4,
        samples: 4,
      }),
    ).toBe("M0,10 L1,8 L2,10 L3,12 L4,10 L4,20 L0,20 Z");
  });

  it("位相を半周ずらすと山と谷が入れ替わる", () => {
    expect(
      sineWavePath({
        width: 4,
        height: 20,
        baseline: 10,
        amplitude: 2,
        wavelength: 4,
        samples: 4,
        phase: Math.PI,
      }),
    ).toBe("M0,10 L1,12 L2,10 L3,8 L4,10 L4,20 L0,20 Z");
  });

  it("刻みが細かいときは小数第 2 位まで丸める", () => {
    expect(
      sineWavePath({
        width: 8,
        height: 20,
        baseline: 10,
        amplitude: 2,
        wavelength: 8,
        samples: 8,
      }),
    ).toBe("M0,10 L1,8.59 L2,8 L3,8.59 L4,10 L5,11.41 L6,12 L7,11.41 L8,10 L8,20 L0,20 Z");
  });

  it("層は 3 枚、id は重ならない", () => {
    expect(WAVE_LAYERS).toHaveLength(3);
    expect(new Set(WAVE_LAYERS.map((layer) => layer.id)).size).toBe(3);
  });

  it("どの層の波長もタイルを割り切る（1 タイルずらすと継ぎ目なく戻る）", () => {
    for (const layer of WAVE_LAYERS) {
      expect(WAVE_TILE % layer.wavelength).toBe(0);
    }
  });

  it("刻みもタイル 2 枚ぶんを割り切る", () => {
    expect(((WAVE_TILE * 2) / WAVE_SAMPLES) % 1).toBe(0);
  });

  it("どの層も画面の高さに収まり、濃さは 0.1 以下", () => {
    for (const layer of WAVE_LAYERS) {
      expect(layer.baseline + layer.amplitude).toBeLessThan(WAVE_HEIGHT);
      expect(layer.amplitude).toBeLessThan(layer.baseline);
      expect(layer.opacity).toBeLessThanOrEqual(0.1);
    }
  });

  it("3 枚の濃さを足しても 0.25 を超えない（ヒーローの文字が読める前提）", () => {
    const total = WAVE_LAYERS.reduce((sum, layer) => sum + layer.opacity, 0);
    expect(total).toBeLessThanOrEqual(0.25);
  });
});
