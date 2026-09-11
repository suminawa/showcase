"use client";

/*
 * 見本: 編集できる間取り図。SVG で 1m = 100 単位。
 * 自分では状態を持たない（ドラッグの途中だけ ref に置く）。変更はすべて props のコールバックで親へ返す。
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
import { HOUSE, type Floor } from "./house";
import {
  canMerge,
  canSplit,
  dividers,
  FLOOR_RECT,
  layoutRooms,
  mergeRoom,
  moveDivider,
  renameRoom,
  ROOM_LABELS,
  splitRoom,
  type Divider,
  type LayoutNode,
  type RoomLabel,
} from "./layout";
import { type PlanState } from "./plan-state";
import s from "./viewer.module.css";

export type PlanEditorProps = {
  plan: PlanState;
  activeFloor: Floor;
  /** 選択中の部屋または家具の id */
  selectedId: string | null;
  onFloorChange: (floor: Floor) => void;
  onSelect: (id: string | null) => void;
  onLayoutChange: (floor: Floor, node: LayoutNode) => void;
  onFurnitureChange: (list: PlacedFurniture[]) => void;
  onReset: () => void;
};

/** 1m を何単位で描くか */
const SCALE = 100;

const FLOOR_TABS: { value: Floor; label: string }[] = [
  { value: 1, label: "1F" },
  { value: 2, label: "2F" },
];

/** ドラッグの途中の覚え書き。家具は「つかんだ点と中心のずれ」を覚えて、跳ばないようにする */
type DragState =
  | { kind: "divider"; id: string; axis: "x" | "z" }
  | { kind: "furniture"; id: string; dx: number; dz: number };

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
  const drag = useRef<DragState | null>(null);

  const tree = plan.floors[activeFloor];
  const rooms = layoutRooms(tree, FLOOR_RECT);
  const lines = dividers(tree, FLOOR_RECT);
  const items = furnitureOnFloor(plan.furniture, activeFloor);
  const selectedRoom = rooms.find((room) => room.id === selectedId) ?? null;
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

  function startDivider(event: ReactPointerEvent<SVGElement>, line: Divider) {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { kind: "divider", id: line.id, axis: line.axis };
  }

  function startFurniture(
    event: ReactPointerEvent<SVGElement>,
    item: PlacedFurniture,
  ) {
    const at = planPoint(event);
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      kind: "furniture",
      id: item.id,
      dx: at ? item.x - at.x : 0,
      dz: at ? item.z - at.z : 0,
    };
    onSelect(item.id);
  }

  function handleMove(event: ReactPointerEvent<SVGElement>) {
    const state = drag.current;
    if (!state) return;
    const at = planPoint(event);
    if (!at) return;
    if (state.kind === "divider") {
      onLayoutChange(
        activeFloor,
        moveDivider(tree, state.id, state.axis === "x" ? at.x : at.z),
      );
      return;
    }
    onFurnitureChange(
      moveFurniture(plan.furniture, state.id, at.x + state.dx, at.z + state.dz),
    );
  }

  function endDrag(event: ReactPointerEvent<SVGElement>) {
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function placeFurniture(typeId: FurnitureId) {
    // 部屋を選んでいればその中心、選んでいなければ床の中心に置く
    const at: [number, number] = selectedRoom
      ? [selectedRoom.x + selectedRoom.w / 2, selectedRoom.z + selectedRoom.d / 2]
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
        {selectedRoom && (
          <label className={s.field}>
            部屋
            <select
              className={s.select}
              value={selectedRoom.label}
              onChange={(event) =>
                onLayoutChange(
                  activeFloor,
                  renameRoom(
                    tree,
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
        )}
      </div>

      <svg
        ref={svgRef}
        className={s.plan}
        viewBox={`-12 -12 ${HOUSE.width * SCALE + 24} ${HOUSE.depth * SCALE + 24}`}
        role="img"
        aria-label={`${activeFloor} 階の間取り図`}
      >
        <rect
          className={s.planOutline}
          x={0}
          y={0}
          width={HOUSE.width * SCALE}
          height={HOUSE.depth * SCALE}
        />

        {rooms.map((room) => {
          const cx = (room.x + room.w / 2) * SCALE;
          const cy = (room.z + room.d / 2) * SCALE;
          return (
            <g key={room.id}>
              <rect
                className={
                  room.id === selectedId ? s.planRoomSelected : s.planRoom
                }
                x={room.x * SCALE + 4}
                y={room.z * SCALE + 4}
                width={room.w * SCALE - 8}
                height={room.d * SCALE - 8}
                onClick={() => onSelect(room.id)}
              />
              <text className={s.planName} x={cx} y={cy - 6}>
                {room.label}
              </text>
              <text className={s.planArea} x={cx} y={cy + 22}>
                {room.area.toFixed(1)} m²
              </text>
            </g>
          );
        })}

        {lines.map((line) => {
          const across = line.axis === "x";
          const x1 = (across ? line.at : line.from) * SCALE;
          const x2 = (across ? line.at : line.to) * SCALE;
          const y1 = (across ? line.from : line.at) * SCALE;
          const y2 = (across ? line.to : line.at) * SCALE;
          return (
            <g key={line.id}>
              <line className={s.planWall} x1={x1} y1={y1} x2={x2} y2={y2} />
              <line
                className={across ? s.planGrabX : s.planGrabZ}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                onPointerDown={(event) => startDivider(event, line)}
                onPointerMove={handleMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
              />
            </g>
          );
        })}

        {items.map((item) => (
          <g
            key={item.id}
            className={s.planItem}
            transform={`translate(${item.x * SCALE} ${item.z * SCALE}) rotate(${item.rotation})`}
            onPointerDown={(event) => startFurniture(event, item)}
            onPointerMove={handleMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
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
      </svg>

      {selectedRoom && (
        <div className={s.group} role="group" aria-label="選択中の部屋">
          <span className={s.groupLabel}>部屋</span>
          <button
            type="button"
            className={s.button}
            disabled={!canSplit(tree, FLOOR_RECT, selectedRoom.id, "x")}
            onClick={() =>
              onLayoutChange(activeFloor, splitRoom(tree, selectedRoom.id, "x"))
            }
          >
            分ける ↔
          </button>
          <button
            type="button"
            className={s.button}
            disabled={!canSplit(tree, FLOOR_RECT, selectedRoom.id, "z")}
            onClick={() =>
              onLayoutChange(activeFloor, splitRoom(tree, selectedRoom.id, "z"))
            }
          >
            分ける ↕
          </button>
          <button
            type="button"
            className={s.button}
            disabled={!canMerge(tree)}
            onClick={() => {
              onLayoutChange(activeFloor, mergeRoom(tree, selectedRoom.id));
              onSelect(null);
            }}
          >
            つなげる
          </button>
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
