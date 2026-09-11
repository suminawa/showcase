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
   編集は続けられるよう、読み書きはすべて try/catch で包む。中身は 6KB ほど
   （288 マス × 2 階ぶんの部屋 id）で、なぞるあいだに何十回も変わる。
   書き出しは同期なので、SAVE_DELAY だけ待ってまとめて 1 回にする */

/** 最後の変更から、これだけ経ってから書き出す（ms） */
const SAVE_DELAY = 300;

/** 分割木のころの鍵。もう読まないので、見かけたらそのまま消す */
const OLD_STORAGE_KEY = "suminawa-demo-3d-viewer:v1";

function readStored(): PlanState | null {
  try {
    // 読めない形式が残っていても意味が無いので、同じ try の中でついでに片づける
    window.localStorage.removeItem(OLD_STORAGE_KEY);
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
  // 下の effect が扱い終えた plan。初回はまだ保存を読む前なので null で、そのときは書かない。
  // detect の中で「読み終えた」と立ててしまうと、同じ回に走る初回の保存が
  // まだ読んでいない既定値を書いてしまうので、印は effect の側で付ける。
  // 同じ plan で走り直したとき（開発時の二重実行）も、ここで止まる
  const savedPlan = useRef<PlanState | null>(null);
  // 「最初に戻す」のあと 1 回だけ保存を見送る印。消した直後に既定値を書き戻さないため
  const skipNextSave = useRef(false);
  // 書き出しを待っている plan と、その時計。同じ plan で effect が走り直しても取りこぼさない
  const pendingSave = useRef<PlanState | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // 描いたあとに調べる。サーバーとの食い違い（ハイドレーション）を避けるため
    const detect = () => {
      setSupport(hasWebgl() ? "ok" : "none");
      setReducedMotion(
        window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      );
      const stored = readStored();
      if (stored) setPlan(stored);
    };
    detect();
  }, []);

  useEffect(() => {
    // plan が変わるたびに保存する。ただし書き出しは待ち時間のあと 1 回だけ
    const save = () => {
      if (savedPlan.current !== plan) {
        const first = savedPlan.current === null;
        savedPlan.current = plan;
        // 初回は見送る。保存を読み終えて入れ直したときに、この effect がもう一度走る。
        // 読むものが無ければ plan は動かないので、ただ訪れただけでは保存を作らない
        if (first) return;
        // 「最初に戻す」で消した直後。既定値を書き戻さず、次の編集から保存を再開する
        if (skipNextSave.current) {
          skipNextSave.current = false;
          return;
        }
        pendingSave.current = plan;
      }
      // 待っているものを積み直す。下の後始末で時計を落としているので、ここで必ず掛け直す
      const waiting = pendingSave.current;
      if (waiting === null) return;
      saveTimer.current = setTimeout(() => {
        saveTimer.current = null;
        pendingSave.current = null;
        writeStored(waiting);
      }, SAVE_DELAY);
    };
    save();
    // 次の変更が来た・画面を離れた。待っている時計は落とす（次の実行が積み直す）
    return () => {
      if (saveTimer.current === null) return;
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    };
  }, [plan]);

  // pointermove の連打でも古い plan を読まないよう、setPlan は関数形で直前の状態から作る
  // （保存は上の effect が行う）
  const changeLayout = (floor: Floor, layout: GridLayout) => {
    setPlan((prev) => {
      const floors: Record<Floor, GridLayout> =
        floor === 1
          ? { 1: layout, 2: prev.floors[2] }
          : { 1: prev.floors[1], 2: layout };
      return { ...prev, floors };
    });
    // 全体は屋根で中が見えないので、最初の編集でその階の断面へ移す
    if (floorMode === "all") setFloorMode(floor === 1 ? "1f" : "2f");
  };

  const changeFurniture = (list: PlacedFurniture[]) => {
    setPlan((prev) => ({ ...prev, furniture: list }));
    // 家具も同じ。全体のままでは置いても動かしても 3D に何も見えない
    if (floorMode === "all") setFloorMode(activeFloor === 1 ? "1f" : "2f");
  };

  const reset = () => {
    // 既定値に戻し、保存も消す。この setPlan で走る保存は skipNextSave が 1 回だけ止め、
    // 待っている書き出しはここで落とすので、「最初に戻す」のあとブラウザには何も残らない
    skipNextSave.current = true;
    if (saveTimer.current !== null) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    pendingSave.current = null;
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
          3D はドラッグで回転、ピンチまたはホイールで拡大縮小、右ドラッグか 2 本指で平行移動。間取り図は「塗る」で部屋をなぞり、「選ぶ」で家具を動かします。
        </p>
      )}
    </div>
  );
}
