"use client";

/*
 * 見本: 間取りシミュレーターの操作。状態（間取り + 家具）はここだけが持ち、
 * 3D の場面（Scene）と間取り図（PlanEditor）には props で配る。
 * だから壁や家具を動かしている最中も、3D がそのまま追いつく。
 * ボタンは素の <button> なので、three.js を読み終える前でも押せる。
 */

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import { type PlacedFurniture } from "./furniture";
import { type GridLayout } from "./grid";
import {
  wallColors,
  type Floor,
  type FloorMode,
  type LightingMode,
  type ViewMode,
  type WallColor,
} from "./house";
import { PlanEditor } from "./PlanEditor";
import {
  defaultPlanState,
  parsePlanState,
  serializePlanState,
  STORAGE_KEY,
  type PlanState,
} from "./plan-state";
import s from "./viewer.module.css";

/*
 * three.js はこの画面だけで要る。ssr: false はクライアント部品の中でしか使えないので、
 * ページ（サーバー部品）ではなくここで読む。読み終わるまでは枠だけ置いて、
 * 高さが動かないようにする。
 */
const Scene = dynamic(() => import("./Scene"), {
  ssr: false,
  loading: () => <p className={s.loading}>建物を組み立てています…</p>,
});

type Support = "checking" | "ok" | "none";

/**
 * WebGL が使えるか。型が無い環境と、あっても文脈を作れない環境（古い端末・
 * 省電力・拡張で切っている）の両方を見る。
 */
function hasWebgl(): boolean {
  if (typeof window === "undefined") return false;
  if (typeof window.WebGLRenderingContext === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (!ctx) return false;
    // 判定専用のコンテキストなので、持ち続けずすぐ手放す
    ctx.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/* 保存はブラウザの localStorage だけ。使えない環境（プライベート表示・容量超過）でも
   編集は続けられるよう、読み書きはすべて try/catch で包む。中身は 2KB ほどなので、
   ドラッグのたびに書いても重くならない */

function readStored(): PlanState | null {
  try {
    return parsePlanState(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

function writeStored(state: PlanState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, serializePlanState(state));
  } catch {
    // 保存できなくても編集は続けられる
  }
}

function clearStored(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 同上
  }
}

const FLOOR_BUTTONS: { value: FloorMode; label: string }[] = [
  { value: "1f", label: "1F" },
  { value: "2f", label: "2F" },
  { value: "all", label: "全体" },
];

const VIEW_BUTTONS: { value: ViewMode; label: string }[] = [
  { value: "orbit", label: "斜めから" },
  { value: "top", label: "真上から" },
];

const LIGHT_BUTTONS: { value: LightingMode; label: string }[] = [
  { value: "day", label: "昼" },
  { value: "night", label: "夜" },
];

export function Viewer() {
  const [support, setSupport] = useState<Support>("checking");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [plan, setPlan] = useState<PlanState>(defaultPlanState);
  const [activeFloor, setActiveFloor] = useState<Floor>(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [floorMode, setFloorMode] = useState<FloorMode>("all");
  const [view, setView] = useState<ViewMode>("orbit");
  const [lighting, setLighting] = useState<LightingMode>("day");
  const [wallColorId, setWallColorId] = useState<WallColor["id"]>("plaster");
  // 保存の読み込みが済んだか。済む前に書くと、まだ読んでいない既定値で保存データを上書きしてしまう
  const loaded = useRef(false);

  useEffect(() => {
    // 描いたあとに調べる。サーバーとの食い違い（ハイドレーション）を避けるため
    const detect = () => {
      setSupport(hasWebgl() ? "ok" : "none");
      setReducedMotion(
        window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      );
      const stored = readStored();
      if (stored) setPlan(stored);
      loaded.current = true;
    };
    detect();
  }, []);

  useEffect(() => {
    // plan が変わるたびに保存する。読み込みが済む前はまだ書かない
    const save = () => {
      if (!loaded.current) return;
      writeStored(plan);
    };
    save();
  }, [plan]);

  // pointermove の連打でも古い plan を読まないよう、関数形で直前の状態から作る（保存は上の effect が行う）
  const updatePlan = (updater: (prev: PlanState) => PlanState) => {
    setPlan(updater);
  };

  const changeLayout = (floor: Floor, layout: GridLayout) => {
    updatePlan((prev) => {
      const floors: Record<Floor, GridLayout> =
        floor === 1
          ? { 1: layout, 2: prev.floors[2] }
          : { 1: prev.floors[1], 2: layout };
      return { ...prev, floors };
    });
  };

  const changeFurniture = (list: PlacedFurniture[]) => {
    updatePlan((prev) => ({ ...prev, furniture: list }));
  };

  const reset = () => {
    setPlan(defaultPlanState());
    setSelectedId(null);
    clearStored();
  };

  const goToFloor = (floor: Floor) => {
    if (floor === activeFloor) return;
    setActiveFloor(floor);
    // 選んでいた部屋や家具は別の階のものなので外す
    setSelectedId(null);
  };

  const changeFloorMode = (mode: FloorMode) => {
    setFloorMode(mode);
    if (mode === "1f") goToFloor(1);
    if (mode === "2f") goToFloor(2);
  };

  const changeActiveFloor = (floor: Floor) => {
    goToFloor(floor);
    // 間取り図のタブを押したら、3D が「全体」のときもその階に合わせる。
    // 全体表示のままタブを押すと 3D に変化が見えず、壊れて見えるため
    setFloorMode(floor === 1 ? "1f" : "2f");
  };

  return (
    <div>
      {support !== "none" && (
        <div className={s.controls}>
          <div className={s.group} role="group" aria-label="表示する階">
            <span className={s.groupLabel}>階</span>
            {FLOOR_BUTTONS.map((item) => (
              <button
                key={item.value}
                type="button"
                className={s.button}
                aria-pressed={floorMode === item.value}
                onClick={() => changeFloorMode(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className={s.group} role="group" aria-label="視点">
            <span className={s.groupLabel}>視点</span>
            {VIEW_BUTTONS.map((item) => (
              <button
                key={item.value}
                type="button"
                className={s.button}
                aria-pressed={view === item.value}
                onClick={() => setView(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className={s.group} role="group" aria-label="明かり">
            <span className={s.groupLabel}>明かり</span>
            {LIGHT_BUTTONS.map((item) => (
              <button
                key={item.value}
                type="button"
                className={s.button}
                aria-pressed={lighting === item.value}
                onClick={() => setLighting(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className={s.group} role="group" aria-label="外壁の色">
            <span className={s.groupLabel}>外壁</span>
            {wallColors.map((color) => (
              <button
                key={color.id}
                type="button"
                className={s.button}
                aria-pressed={wallColorId === color.id}
                onClick={() => setWallColorId(color.id)}
              >
                {/* 色見本だけは実際の 3D の色を見せる必要があるので直に指定する */}
                <span
                  className={s.swatch}
                  style={{ background: color.wall }}
                  aria-hidden="true"
                />
                {color.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={s.workspace}>
        {support === "none" ? (
          <div className={s.fallback}>
            <p className={s.fallbackText}>
              お使いの環境では 3D（WebGL）を表示できません。間取り図の編集はそのまま使えます。
            </p>
          </div>
        ) : (
          <div className={s.stage}>
            {support === "ok" ? (
              <Scene
                plan={plan}
                activeFloor={activeFloor}
                floorMode={floorMode}
                view={view}
                lighting={lighting}
                wallColorId={wallColorId}
                reducedMotion={reducedMotion}
                selectedId={selectedId}
                onContextLost={() => setSupport("none")}
              />
            ) : (
              <p className={s.loading}>建物を組み立てています…</p>
            )}
          </div>
        )}

        <PlanEditor
          plan={plan}
          activeFloor={activeFloor}
          selectedId={selectedId}
          onFloorChange={changeActiveFloor}
          onSelect={setSelectedId}
          onLayoutChange={changeLayout}
          onFurnitureChange={changeFurniture}
          onReset={reset}
        />
      </div>

      {support !== "none" && (
        <p className={s.caption}>
          3D はドラッグで回転、ピンチまたはホイールで拡大縮小、右ドラッグか 2 本指で平行移動。間取り図は壁と家具をドラッグで動かします。
        </p>
      )}
    </div>
  );
}
