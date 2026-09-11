"use client";

/*
 * 見本: 編集できる間取り図。SVG で 1m = 100 単位、マスは 0.5m。
 * 間取りは自分では持たない（家具のドラッグの途中だけ ref に置く）。
 * 変更はすべて props のコールバックで親へ返す。
 * 3D と同じ 1 つの状態を親（Viewer）が持っているので、動かしている最中も 3D がそのまま追いつく。
 */

import {
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from "react";

import {
  addFurniture,
  FURNITURE,
  furnitureOnFloor,
  furnitureType,
  moveFurniture,
  removeFurniture,
  rotateFurniture,
  type FurnitureId,
  type PlacedFurniture,
} from "./furniture";
import {
  CELL,
  cellFromPoint,
  COLS,
  labelAnchor,
  renameRoom,
  ROOM_LABELS,
  roomArea,
  roomOfCell,
  roomRects,
  ROWS,
  wallSegments,
  type GridLayout,
  type RoomLabel,
} from "./grid";
import { HOUSE, type Floor } from "./house";
import { type PlanState } from "./plan-state";
import s from "./viewer.module.css";

export type PlanEditorProps = {
  plan: PlanState;
  activeFloor: Floor;
  /** 選択中の部屋または家具の id */
  selectedId: string | null;
  onFloorChange: (floor: Floor) => void;
  onSelect: (id: string | null) => void;
  onLayoutChange: (floor: Floor, layout: GridLayout) => void;
  onFurnitureChange: (list: PlacedFurniture[]) => void;
  onReset: () => void;
};

/** 1m を何単位で描くか */
const SCALE = 100;

const FLOOR_TABS: { value: Floor; label: string }[] = [
  { value: 1, label: "1F" },
  { value: 2, label: "2F" },
];

/** 0.5m ごとの薄い線。描くたびに組み立て直さないよう、いちど作って使い回す */
const GRID_PATH = (() => {
  const parts: string[] = [];
  for (let col = 1; col < COLS; col++) {
    parts.push(`M${col * CELL * SCALE} 0V${HOUSE.depth * SCALE}`);
  }
  for (let row = 1; row < ROWS; row++) {
    parts.push(`M0 ${row * CELL * SCALE}H${HOUSE.width * SCALE}`);
  }
  return parts.join("");
})();

/** 家具をつかんだ点と中心のずれ。つかんだ瞬間に跳ばないよう覚えておく */
type Grab = { id: string; dx: number; dz: number };

export function PlanEditor({
  plan,
  activeFloor,
  selectedId,
  onFloorChange,
  onSelect,
  onLayoutChange,
  onFurnitureChange,
  onReset,
}: PlanEditorProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const grab = useRef<Grab | null>(null);

  const layout = plan.floors[activeFloor];
  const rects = roomRects(layout);
  const walls = wallSegments(layout);
  const items = furnitureOnFloor(plan.furniture, activeFloor);
  const selectedRoom =
    layout.rooms.find((room) => room.id === selectedId) ?? null;
  const selectedItem = items.find((item) => item.id === selectedId) ?? null;

  // Delete / Backspace でも選択中の家具を消す。入力中のキーは横取りしない
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Delete" && event.key !== "Backspace") return;
      if (!selectedItem) return;
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      event.preventDefault();
      onFurnitureChange(removeFurniture(plan.furniture, selectedItem.id));
      onSelect(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [plan.furniture, selectedItem, onFurnitureChange, onSelect]);

  /** 画面のポインタ位置を床座標（m）に写す */
  function planPoint(
    event: ReactPointerEvent<SVGElement>,
  ): { x: number; z: number } | null {
    const ctm = svgRef.current?.getScreenCTM();
    if (!ctm) return null;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(
      ctm.inverse(),
    );
    return { x: point.x / SCALE, z: point.y / SCALE };
  }

  /**
   * ポインタの下のマス。輪郭の外なら null。
   * マスごとに当たり判定を付けず、SVG 1 つのハンドラで座標から決める（288 個の要素を作らない）。
   */
  function cellUnder(event: ReactPointerEvent<SVGElement>): number | null {
    const at = planPoint(event);
    if (!at) return null;
    return cellFromPoint(at.x, at.z);
  }

  /** マスをタップすると、そのマスの部屋を選ぶ */
  function handlePlanDown(event: ReactPointerEvent<SVGSVGElement>) {
    const index = cellUnder(event);
    if (index === null) return;
    onSelect(roomOfCell(layout, index));
  }

  function startFurniture(
    event: ReactPointerEvent<SVGGElement>,
    item: PlacedFurniture,
  ) {
    // 家具をつかんだときは、下の部屋を選び直さない
    event.stopPropagation();
    const at = planPoint(event);
    event.currentTarget.setPointerCapture(event.pointerId);
    grab.current = {
      id: item.id,
      dx: at ? item.x - at.x : 0,
      dz: at ? item.z - at.z : 0,
    };
    onSelect(item.id);
  }

  function moveFurnitureTo(event: ReactPointerEvent<SVGGElement>) {
    const held = grab.current;
    if (!held) return;
    event.stopPropagation();
    const at = planPoint(event);
    if (!at) return;
    onFurnitureChange(
      moveFurniture(plan.furniture, held.id, at.x + held.dx, at.z + held.dz),
    );
  }

  function endFurniture(event: ReactPointerEvent<SVGGElement>) {
    grab.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function placeFurniture(typeId: FurnitureId) {
    // 部屋を選んでいればその部屋の名前が出る位置、選んでいなければ床の中心に置く
    const at: [number, number] = selectedRoom
      ? labelAnchor(layout, selectedRoom.id)
      : [HOUSE.width / 2, HOUSE.depth / 2];
    const next = addFurniture(plan.furniture, typeId, activeFloor, at);
    onFurnitureChange(next);
    onSelect(next[next.length - 1].id);
  }

  return (
    <div className={s.editor}>
      <div className={s.editorRow}>
        <div className={s.group} role="group" aria-label="編集する階">
          {FLOOR_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={s.button}
              aria-pressed={activeFloor === tab.value}
              onClick={() => onFloorChange(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <svg
        ref={svgRef}
        className={s.plan}
        viewBox={`-12 -12 ${HOUSE.width * SCALE + 24} ${HOUSE.depth * SCALE + 24}`}
        role="img"
        aria-label={`${activeFloor} 階の間取り図`}
        onPointerDown={handlePlanDown}
      >
        {/* 部屋の塗り → マス目の線 → 壁と輪郭 → 家具 → 部屋名、の順に重ねる */}
        {rects.map((rect) => (
          <rect
            key={rect.id}
            className={
              rect.roomId === selectedId ? s.planRoomSelected : s.planRoom
            }
            x={rect.x * SCALE}
            y={rect.z * SCALE}
            width={rect.w * SCALE}
            height={rect.d * SCALE}
          />
        ))}

        <path className={s.planGrid} d={GRID_PATH} />

        {walls.map((line) => {
          const across = line.axis === "x";
          return (
            <line
              key={line.id}
              className={s.planWall}
              x1={(across ? line.at : line.from) * SCALE}
              y1={(across ? line.from : line.at) * SCALE}
              x2={(across ? line.at : line.to) * SCALE}
              y2={(across ? line.to : line.at) * SCALE}
            />
          );
        })}

        <rect
          className={s.planOutline}
          x={0}
          y={0}
          width={HOUSE.width * SCALE}
          height={HOUSE.depth * SCALE}
        />

        {items.map((item) => (
          <g
            key={item.id}
            className={s.planItem}
            transform={`translate(${item.x * SCALE} ${item.z * SCALE}) rotate(${item.rotation})`}
            onPointerDown={(event) => startFurniture(event, item)}
            onPointerMove={moveFurnitureTo}
            onPointerUp={endFurniture}
            onPointerCancel={endFurniture}
          >
            {furnitureType(item.type).glyph.rects.map((rect, index) => (
              <rect
                key={index}
                className={
                  item.id === selectedId ? s.planGlyphSelected : s.planGlyph
                }
                x={(rect.x - rect.w / 2) * SCALE}
                y={(rect.z - rect.d / 2) * SCALE}
                width={rect.w * SCALE}
                height={rect.d * SCALE}
              />
            ))}
          </g>
        ))}

        {/* 家具の記号の上に重なっても読めるよう、部屋名と広さはすべての上に最後に描く */}
        {layout.rooms.map((room) => {
          const area = roomArea(layout, room.id);
          // まだ 1 マスも塗られていない部屋は、名前を出す場所が無いので出さない
          if (area === 0) return null;
          const [ax, az] = labelAnchor(layout, room.id);
          return (
            <g key={room.id} className={s.planLabels}>
              <text className={s.planName} x={ax * SCALE} y={az * SCALE - 6}>
                {room.label}
              </text>
              <text className={s.planArea} x={ax * SCALE} y={az * SCALE + 22}>
                {area.toFixed(1)} m²
              </text>
            </g>
          );
        })}
      </svg>

      {/* 部屋を選んでいないときは列ごと出さない（空の列が余白だけ作らないように） */}
      {selectedRoom && (
        <div className={s.group} role="group" aria-label="部屋の操作">
          <label className={s.field}>
            部屋
            <select
              className={s.select}
              value={selectedRoom.label}
              onChange={(event) =>
                onLayoutChange(
                  activeFloor,
                  renameRoom(
                    layout,
                    selectedRoom.id,
                    event.target.value as RoomLabel,
                  ),
                )
              }
            >
              {ROOM_LABELS.map((label) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      <div className={s.group} role="group" aria-label="家具を置く">
        <span className={s.groupLabel}>家具</span>
        {FURNITURE.map((type) => (
          <button
            key={type.id}
            type="button"
            className={s.button}
            onClick={() => placeFurniture(type.id)}
          >
            {type.name}
          </button>
        ))}
      </div>

      {selectedItem && (
        <div className={s.group} role="group" aria-label="選択中の家具">
          <span className={s.groupLabel}>選択中</span>
          <button
            type="button"
            className={s.button}
            onClick={() =>
              onFurnitureChange(rotateFurniture(plan.furniture, selectedItem.id))
            }
          >
            回す
          </button>
          <button
            type="button"
            className={s.button}
            onClick={() => {
              onFurnitureChange(removeFurniture(plan.furniture, selectedItem.id));
              onSelect(null);
            }}
          >
            消す
          </button>
        </div>
      )}

      <div className={s.group}>
        <button type="button" className={s.button} onClick={onReset}>
          最初に戻す
        </button>
      </div>
    </div>
  );
}
