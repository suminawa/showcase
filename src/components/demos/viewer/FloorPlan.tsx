/*
 * 見本: WebGL が使えないときに出す平面図。
 * 3D とまったく同じ寸法の表から描くので、形がずれない。
 */
import { HOUSE, rooms, visibleRooms, type Floor } from "./house";

import s from "./viewer.module.css";

/** 1m を何 px で描くか */
const SCALE = 100;

export function FloorPlan({ floor }: { floor: Floor }) {
  const width = HOUSE.width * SCALE;
  const depth = HOUSE.depth * SCALE;
  const shown = visibleRooms(rooms, floor === 1 ? "1f" : "2f");

  return (
    <svg
      className={s.plan}
      viewBox={`-10 -10 ${width + 20} ${depth + 20}`}
      role="img"
      aria-label={`${floor} 階の平面図`}
    >
      <rect
        className={s.planOutline}
        x={0}
        y={0}
        width={width}
        height={depth}
      />
      {shown.map((room) => {
        const w = room.size[0] * SCALE;
        const d = room.size[2] * SCALE;
        const x = (room.position[0] - room.size[0] / 2 + HOUSE.width / 2) * SCALE;
        const y = (room.position[2] - room.size[2] / 2 + HOUSE.depth / 2) * SCALE;
        return (
          <g key={room.id}>
            <rect
              className={s.planRoom}
              x={x + 4}
              y={y + 4}
              width={w - 8}
              height={d - 8}
            />
            <text className={s.planName} x={x + w / 2} y={y + d / 2 - 6}>
              {room.label}
            </text>
            <text className={s.planArea} x={x + w / 2} y={y + d / 2 + 24}>
              {room.area.toFixed(1)} m²
            </text>
          </g>
        );
      })}
    </svg>
  );
}
