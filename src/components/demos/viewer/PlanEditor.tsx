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
  type RoomRect,
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
 * floor はなぞり始めた階。途中で階が変わったら、別の階のマスを塗ってしまうので捨てる。
 */
type Stroke = {
  pointerId: number;
  floor: Floor;
  room: RoomId;
  cells: number[];
  at: { x: number; z: number };
};

/** 家具をつかんだ点と中心のずれ。つかんだ瞬間に跳ばないよう覚えておく。pointerId と floor は Stroke と同じ理由 */
type Grab = {
  pointerId: number;
  floor: Floor;
  id: string;
  dx: number;
  dz: number;
};

/**
 * 部屋名を輪郭の内側に留めるための余白（ユーザー単位）。labelAnchor はマスの中心を返すので、
 * 端の部屋では文字が輪郭からはみ出す。横は長めの部屋名（44 単位 × 5 字）の半分、
 * 縦は 2 行のぶん。
 */
const LABEL_PAD_X = 110;
const LABEL_PAD_Y = 40;

/** 名前を出すマス数の下限と、広さも出すマス数の下限（1 マス = 0.25m²） */
const LABEL_MIN_CELLS = 2;
const AREA_MIN_CELLS = 4;

/** value を min..max に収める */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * マウスの右ボタン・中ボタンで押した。右ドラッグは 3D の平行移動に使う操作なので、
 * 間取り図でも塗りやつかみは始めない。指とペンは button が 0 で来るので通る。
 */
function isSecondaryPress(event: ReactPointerEvent<SVGElement>): boolean {
  return event.pointerType === "mouse" && event.button !== 0;
}

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
  const firstRects = new Map<RoomId, RoomRect>();
  for (const rect of rects) {
    if (!firstRects.has(rect.roomId)) firstRects.set(rect.roomId, rect);
  }
  const walls = wallSegments(layout);
  const items = furnitureOnFloor(plan.furniture, activeFloor);
  const selectedRoom =
    layout.rooms.find((room) => room.id === selectedId) ?? null;
  const selectedItem = items.find((item) => item.id === selectedId) ?? null;

  // Escape で選択を外し、Delete / Backspace で選択中の家具を消す。
  // 編集画面にフォーカスが無いとき・入力中のキーは横取りしない
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const escape = event.key === "Escape";
      if (!escape && event.key !== "Delete" && event.key !== "Backspace") return;
      if (!editorRef.current?.contains(document.activeElement)) return;
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      // Escape は部屋にも家具にも効く。既定の動きは残す（他の場所の取り消しを邪魔しない）
      if (escape) {
        onSelect(null);
        return;
      }
      if (!selectedItem) return;
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
    if (isSecondaryPress(event)) return;
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
      floor: activeFloor,
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
    // なぞっている途中で階が変わった。いまの階に前の階のマスを塗らないよう、ここで捨てる
    if (active.floor !== activeFloor) {
      stroke.current = null;
      return;
    }
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
    if (isSecondaryPress(event)) return;
    // 家具をつかんだときは、下の部屋を選び直さない
    event.stopPropagation();
    // すでに塗っている・別の家具をつかんでいる最中なら、2 本目の指は受けない
    if (stroke.current || grab.current) return;
    focusEditor(event);
    const at = planPoint(event);
    captureQuietly(event.currentTarget, event.pointerId);
    grab.current = {
      pointerId: event.pointerId,
      floor: activeFloor,
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
    // 離したのを取りこぼしたまま動いている・途中で階が変わった。どちらもつかみを捨てる
    // （そのままだと、押していないのに家具が指について回る）
    if (event.buttons === 0 || held.floor !== activeFloor) {
      grab.current = null;
      return;
    }
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

  /**
   * 家具の記号の外へ出た。capture が取れていれば離した合図はこのあと必ず届くので、そのまま続ける。
   * 取れていない環境だけ、ここでつかみを終える（外で離されると気づけないため）。なぞりと同じ扱い。
   */
  function leaveFurniture(event: ReactPointerEvent<SVGGElement>) {
    const held = grab.current;
    if (!held || held.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) return;
    grab.current = null;
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
        {/* 部屋の塗り → マス目の線 → 壁と輪郭 → 家具 → 部屋名 → キーボードの的、の順に重ねる。
            塗りはただの塗りで、タップは SVG のハンドラが座標から決める */}
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
            className={
              mode === "paint" ? `${s.planItem} ${s.planItemLocked}` : s.planItem
            }
            transform={`translate(${item.x * SCALE} ${item.z * SCALE}) rotate(${item.rotation})`}
            onPointerDown={(event) => startFurniture(event, item)}
            onPointerMove={moveFurnitureTo}
            onPointerUp={endFurniture}
            onPointerCancel={endFurniture}
            onPointerLeave={leaveFurniture}
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

        {/* 家具の記号の上に重なっても読めるよう、部屋名と広さはすべての上に最後に描く。
            読み上げは下のキーボードの的（aria-label）が受け持つので、ここは読ませない */}
        {layout.rooms.map((room) => {
          const area = areas.get(room.id) ?? 0;
          const cells = Math.round(area / (CELL * CELL));
          // 狭い部屋に押し込むと文字が部屋からはみ出すので、マス数で減らす。
          // 1 マス以下は名前も出さない（出す場所が無い）
          if (cells < LABEL_MIN_CELLS) return null;
          const withArea = cells >= AREA_MIN_CELLS;
          const [ax, az] = labelAnchor(layout, room.id);
          // labelAnchor は端のマスも返す。文字が輪郭の外へ出ないよう、内側へ寄せる
          const x = clamp(
            ax * SCALE,
            LABEL_PAD_X,
            HOUSE.width * SCALE - LABEL_PAD_X,
          );
          const y = clamp(
            az * SCALE,
            LABEL_PAD_Y,
            HOUSE.depth * SCALE - LABEL_PAD_Y,
          );
          return (
            <g key={room.id} className={s.planLabels} aria-hidden="true">
              {/* 2 行の上下の振り分けは CSS の font-size（44 / 40 単位）に合わせた値。
                  重ならず、2 行の塊が labelAnchor の点をだいたい挟むようにする。
                  名前だけのときは 1 行なので、その点に重なる高さまで下げる */}
              <text className={s.planName} x={x} y={withArea ? y - 10 : y + 14}>
                {room.label}
              </text>
              {withArea && (
                <text className={s.planArea} x={x} y={y + 37}>
                  {area.toFixed(1)} m²
                </text>
              )}
            </g>
          );
        })}

        {/* キーボードの的。部屋ごとに 1 枚だけ置く（同じ部屋で何度も Tab が止まらないように）。
            囲みが壁（10 単位の太い線）に隠れないよう、塗りを持たない矩形をいちばん上に重ねる。
            タップはこれまでどおり SVG のハンドラが受ける */}
        {Array.from(firstRects.values()).map((rect) => (
          <rect
            key={`focus-${rect.id}`}
            className={s.planFocus}
            x={rect.x * SCALE}
            y={rect.z * SCALE}
            width={rect.w * SCALE}
            height={rect.d * SCALE}
            tabIndex={0}
            role="button"
            aria-pressed={rect.roomId === selectedId}
            aria-label={`${rect.label} ${(areas.get(rect.roomId) ?? 0).toFixed(1)} m²`}
            onKeyDown={(event) => {
              if (event.key !== "Enter" && event.key !== " ") return;
              event.preventDefault();
              onSelect(rect.roomId);
            }}
          />
        ))}
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
