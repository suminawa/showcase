import {
  sineWavePath,
  WAVE_HEIGHT,
  WAVE_LAYERS,
  WAVE_SAMPLES,
  WAVE_TILE,
} from "./wave";
import s from "./corporate-parts.module.css";

/**
 * ヒーローの背景の波。タイル 2 枚ぶんの長さで描いた波を、CSS で 1 タイルぶん流す。
 * 波長がタイルを割り切るので継ぎ目が出ない（wave.test.ts がその見張り）。
 * 動かすのは CSS だけ ── JavaScript は要らないし、減速の設定のときは animation が付かない。
 * 図は飾りなので aria-hidden。
 */
export function WaveField({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${WAVE_TILE} ${WAVE_HEIGHT}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {WAVE_LAYERS.map((layer) => (
        <g
          key={layer.id}
          className={layer.reverse ? s.waveBack : s.wave}
          style={{ animationDuration: `${layer.duration}s` }}
        >
          <path
            d={sineWavePath({
              width: WAVE_TILE * 2,
              height: WAVE_HEIGHT,
              baseline: layer.baseline,
              amplitude: layer.amplitude,
              wavelength: layer.wavelength,
              samples: WAVE_SAMPLES,
            })}
            fill="var(--d-brand)"
            fillOpacity={layer.opacity}
          />
        </g>
      ))}
    </svg>
  );
}
