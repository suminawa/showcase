import { areaPoint, AREAS } from "./areas";
import s from "./parts.module.css";

/**
 * 対応エリアの図。地図の画像は使わず、中心（営業所）からの同心円と点だけで描く。
 * 図は飾りなので aria-hidden ── 読み上げに要る情報は、隣の一覧が文字で持つ。
 */
const CENTER = 100;
const SCALE = 82;

export function AreaTags() {
  return (
    <div className={s.areaWrap}>
      <svg className={s.areaSvg} viewBox="0 0 200 200" aria-hidden="true">
        <circle cx={CENTER} cy={CENTER} r={SCALE} className={s.areaRing} />
        <circle cx={CENTER} cy={CENTER} r={SCALE * 0.6} className={s.areaRing} />
        <circle cx={CENTER} cy={CENTER} r={SCALE * 0.3} className={s.areaRing} />
        <line
          x1={CENTER - SCALE}
          y1={CENTER}
          x2={CENTER + SCALE}
          y2={CENTER}
          className={s.areaAxis}
        />
        <line
          x1={CENTER}
          y1={CENTER - SCALE}
          x2={CENTER}
          y2={CENTER + SCALE}
          className={s.areaAxis}
        />
        {AREAS.map((area) => {
          const point = areaPoint(area, CENTER, SCALE);
          return (
            <circle
              key={area.id}
              cx={point.x}
              cy={point.y}
              r={5}
              className={s.areaDot}
            />
          );
        })}
        <circle cx={CENTER} cy={CENTER} r={7} className={s.areaHome} />
      </svg>

      <ul className={s.areaList}>
        {AREAS.map((area) => (
          <li key={area.id} className={s.areaTag}>
            {area.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
