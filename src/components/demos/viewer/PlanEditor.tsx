"use client";

/*
 * 見本: 編集できる間取り図。SVG で 1m = 100 単位、マスは 0.5m。
 * 間取りは自分では持たない（モードと、なぞっている途中の覚え書きだけ持つ）。
 * 変更はすべて props のコールバックで親へ返す。
 * 3D と同じ 1 つの状態を親（Viewer）が持っているので、なぞっている最中も 3D がそのまま追いつく。
 */

import {
  useEffect,
  useRef,
  useState,
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
  addRoom,
  CELL,
  cellFromPoint,
  cellsAlong,
  COLS,
  labelAnchor,
  paintCells,
  renameRoom,
  ROOM_LABELS,
  roomArea,
  roomOfCell,
  roomRects,
  ROWS,
  wallSegments,
  type GridLayout,
  type RoomId,
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

/** 「選ぶ」= 部屋と家具を選び、家具を動かす。「塗る」= なぞったマスを部屋にする */
type EditMode = "select" | "paint";

const MODE_BUTTONS: { value: EditMode; label: string }[] = [
  { value: "select", label: "選ぶ" },
  { value: "paint", label: "塗る" },
];

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

/**
 * なぞっている最中の覚え書き。通ったマスをすべて覚えておく。at は補間の起点（床座標 m）。
 * pointerId を持たせて、2 本目の指の pointermove や pointerup を取り違えないようにする。
 */
type Stroke = {
  pointerId: number;
  room: RoomId;
  cells: number[];
  at: { x: number; z: number };
};

/** 家具をつかんだ点と中心のずれ。つかんだ瞬間に跳ばないよう覚えておく。pointerId は Stroke と同じ理由 */
type Grab = { pointerId: number; id: string; dx: number; dz: number };

/**
 * setPointerCapture は環境によっては例外を投げる。取れなくても pointermove 自体は
 * 要素の上にいるあいだ届くので、失敗しても塗り・ドラッグの開始は止めない。
 */
function captureQuietly(target: Element, pointerId: number): void {
  try {
    target.setPointerCapture(pointerId);
  } catch {
    // 取れなくても続行する
  }
}

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
  const editorRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const stroke = useRef<Stroke | null>(null);
  const grab = useRef<Grab | null>(null);
  const [mode, setMode] = useState<EditMode>("select");

  const layout = plan.floors[activeFloor];
  const rects = roomRects(layout);
  // 広さは読み上げにも部屋名にも要る。矩形ごとに数え直さず、描くたびに部屋ごとへ 1 回だけ数える
  const areas = new Map<RoomId, number>(
    layout.rooms.map((room) => [room.id, roomArea(layout, room.id)]),
  );
  // 同じ部屋が何枚もの長方形に分かれるので、キーボードの的は部屋ごとに 1 枚目だけにする
  const firstRectIds = new Map<RoomId, string>();
  for (const rect of rects) {
    if (!firstRectIds.has(rect.roomId)) firstRectIds.set(rect.roomId, rect.id);
  }
  const walls = wallSegments(layout);
  const items = furnitureOnFloor(plan.furniture, activeFloor);
  const selectedRoom =
    layout.rooms.find((room) => room.id === selectedId) ?? null;
  const selectedItem = items.find((item) => item.id === selectedId) ?? null;

  // Delete / Backspace でも選択中の家具を消す。編集画面にフォーカスが無いとき・
  // 入力中のキーは横取りしない
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Delete" && event.key !== "Backspace") return;
      if (!selectedItem) return;
      if (!editorRef.current?.contains(document.activeElement)) return;
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
   * Delete / Backspace を受けられるよう、触った時点で編集画面へフォーカスを移す。
   * pointerdown の既定の動きを止めないと、ブラウザがフォーカスを body へ移してしまう。
   */
  function focusEditor(event: ReactPointerEvent<SVGElement>) {
    event.preventDefault();
    svgRef.current?.focus({ preventScroll: true });
  }

  /**
   * マスごとに当たり判定を付けず、SVG 1 つのハンドラで座標から決める（288 個の要素を作らない）。
   * 部屋でも家具でもない場所（輪郭の外側の余白）をタップしたときは、
   * 「選ぶ」モードなら選択を外す。
   */
  function handlePlanDown(event: ReactPointerEvent<SVGSVGElement>) {
    // すでに塗っている・家具をつかんでいる最中なら、2 本目の指は受けない
    if (stroke.current || grab.current) return;
    focusEditor(event);
    const at = planPoint(event);
    const index = at ? cellFromPoint(at.x, at.z) : null;
    if (!at || index === null) {
      if (mode === "select") onSelect(null);
      return;
    }
    if (mode === "select") {
      onSelect(roomOfCell(layout, index));
      return;
    }
    // 部屋を選んでいないときは、最初に触ったマスの部屋を選んでから塗り始める
    const target = selectedRoom ? selectedRoom.id : roomOfCell(layout, index);
    if (!selectedRoom) onSelect(target);
    captureQuietly(event.currentTarget, event.pointerId);
    stroke.current = {
      pointerId: event.pointerId,
      room: target,
      cells: [index],
      at,
    };
    // すでにその部屋のマスなら layout は変わらない。同じものを送り返さない
    const painted = paintCells(layout, [index], target);
    if (painted !== layout) onLayoutChange(activeFloor, painted);
  }

  function handlePlanMove(event: ReactPointerEvent<SVGSVGElement>) {
    const active = stroke.current;
    if (!active || active.pointerId !== event.pointerId) return;
    // ボタンを離したのを取りこぼしたまま動いている（画面の外で離した等）。なぞり足さない
    if (event.buttons === 0) return;
    const at = planPoint(event);
    if (!at) return;
    const along = cellsAlong(active.at, at);
    active.at = at;
    let changed = false;
    for (const index of along) {
      if (active.cells.includes(index)) continue;
      active.cells.push(index);
      changed = true;
    }
    if (!changed) return;
    // 通ったマスをまとめて塗り直す。props の layout が 1 回分古くても跡が欠けない
    onLayoutChange(activeFloor, paintCells(layout, active.cells, active.room));
  }

  function handlePlanUp(event: ReactPointerEvent<SVGSVGElement>) {
    const active = stroke.current;
    if (!active || active.pointerId !== event.pointerId) return;
    stroke.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  /**
   * SVG の外へ出た。capture が取れていれば離した合図はこのあと必ず届くので、そのまま続ける。
   * 取れていない環境だけ、ここでなぞりを終える（外で離されると気づけないため）。
   */
  function handlePlanLeave(event: ReactPointerEvent<SVGSVGElement>) {
    const active = stroke.current;
    if (!active || active.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) return;
    stroke.current = null;
  }

  function startFurniture(
    event: ReactPointerEvent<SVGGElement>,
    item: PlacedFurniture,
  ) {
    // 家具をつかんだときは、下の部屋を選び直さない
    event.stopPropagation();
    // すでに塗っている・別の家具をつかんでいる最中なら、2 本目の指は受けない
    if (stroke.current || grab.current) return;
    focusEditor(event);
    const at = planPoint(event);
    captureQuietly(event.currentTarget, event.pointerId);
    grab.current = {
      pointerId: event.pointerId,
      id: item.id,
      dx: at ? item.x - at.x : 0,
      dz: at ? item.z - at.z : 0,
    };
    onSelect(item.id);
  }

  function moveFurnitureTo(event: ReactPointerEvent<SVGGElement>) {
    const held = grab.current;
    if (!held || held.pointerId !== event.pointerId) return;
    event.stopPropagation();
    const at = planPoint(event);
    if (!at) return;
    onFurnitureChange(
      moveFurniture(plan.furniture, held.id, at.x + held.dx, at.z + held.dz),
    );
  }

  function endFurniture(event: ReactPointerEvent<SVGGElement>) {
    const held = grab.current;
    if (!held || held.pointerId !== event.pointerId) return;
    grab.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  /** 新しい部屋を足して選び、そのまま塗れるように「塗る」へ移る */
  function startNewRoom() {
    const added = addRoom(layout, ROOM_LABELS[0]);
    onLayoutChange(activeFloor, added.layout);
    onSelect(added.id);
    setMode("paint");
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
    <div className={s.editor} ref={editorRef}>
      <div className={s.editorRow}>
        <div className={s.group} role="group" aria-label="間取りの編集モード">
          {MODE_BUTTONS.map((item) => (
            <button
              key={item.value}
              type="button"
              className={s.button}
              aria-pressed={mode === item.value}
              onClick={() => setMode(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
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
        className={mode === "paint" ? `${s.plan} ${s.planPaint}` : s.plan}
        viewBox={`-12 -12 ${HOUSE.width * SCALE + 24} ${HOUSE.depth * SCALE + 24}`}
        role="group"
        aria-label={`${activeFloor} 階の間取り図`}
        /* 触ったら Delete / Backspace が届くよう、フォーカスを置ける先にする。
           Tab では止まらない（部屋の矩形が順番に受け持つ） */
        tabIndex={-1}
        onPointerDown={handlePlanDown}
        onPointerMove={handlePlanMove}
        onPointerUp={handlePlanUp}
        onPointerCancel={handlePlanUp}
        onPointerLeave={handlePlanLeave}
        onLostPointerCapture={handlePlanUp}
      >
        {/* 部屋の塗り → マス目の線 → 壁と輪郭 → 家具 → 部屋名、の順に重ねる */}
        {rects.map((rect) => {
          const selected = rect.roomId === selectedId;
          // 1 枚目だけがキーボードの的。残りは同じ見た目のただの塗りで、
          // タップは SVG のハンドラが受ける（同じ部屋で何度も Tab が止まらないように）
          const target = firstRectIds.get(rect.roomId) === rect.id;
          return (
            <rect
              key={rect.id}
              className={selected ? s.planRoomSelected : s.planRoom}
              x={rect.x * SCALE}
              y={rect.z * SCALE}
              width={rect.w * SCALE}
              height={rect.d * SCALE}
              tabIndex={target ? 0 : undefined}
              role={target ? "button" : undefined}
              aria-pressed={target ? selected : undefined}
              aria-label={
                target
                  ? `${rect.label} ${(areas.get(rect.roomId) ?? 0).toFixed(1)} m²`
                  : undefined
              }
              onKeyDown={
                target
                  ? (event) => {
                      if (event.key !== "Enter" && event.key !== " ") return;
                      event.preventDefault();
                      onSelect(rect.roomId);
                    }
                  : undefined
              }
            />
          );
        })}

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
            className={
              mode === "paint" ? `${s.planItem} ${s.planItemLocked}` : s.planItem
            }
            transform={`translate(${item.x * SCALE} ${item.z * SCALE}) rotate(${item.rotation})`}
            onPointerDown={(event) => startFurniture(event, item)}
            onPointerMove={moveFurnitureTo}
            onPointerUp={endFurniture}
            onPointerCancel={endFurniture}
            onLostPointerCapture={endFurniture}
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
          const area = areas.get(room.id) ?? 0;
          // まだ 1 マスも塗られていない部屋は、名前を出す場所が無いので出さない
          if (area === 0) return null;
          const [ax, az] = labelAnchor(layout, room.id);
          return (
            <g key={room.id} className={s.planLabels}>
              {/* 2 行の上下の振り分けは CSS の font-size（44 / 40 単位）に合わせた値。
                  重ならず、2 行の塊が labelAnchor の点をだいたい挟むようにする */}
              <text className={s.planName} x={ax * SCALE} y={az * SCALE - 10}>
                {room.label}
              </text>
              <text className={s.planArea} x={ax * SCALE} y={az * SCALE + 37}>
                {area.toFixed(1)} m²
              </text>
            </g>
          );
        })}
      </svg>

      <div className={s.group} role="group" aria-label="部屋の操作">
        <button type="button" className={s.button} onClick={startNewRoom}>
          新しい部屋
        </button>
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
        )}
      </div>

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
