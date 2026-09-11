"use client";

/*
 * 見本: 建物ビューアの操作。状態はここだけが持ち、3D の場面には渡すだけにする。
 * ボタンは素の <button> なので、three.js を読み終える前でも押せる。
 */

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { FloorPlan } from "./FloorPlan";
import {
  effectiveFloorMode,
  wallColors,
  type FloorMode,
  type LightingMode,
  type ViewMode,
  type WallColor,
} from "./house";
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

const FLOOR_BUTTONS: { value: FloorMode; label: string }[] = [
  { value: "1f", label: "1F" },
  { value: "2f", label: "2F" },
  { value: "all", label: "全体" },
];

const VIEW_BUTTONS: { value: ViewMode; label: string }[] = [
  { value: "orbit", label: "立体" },
  { value: "plan", label: "間取り" },
];

const LIGHT_BUTTONS: { value: LightingMode; label: string }[] = [
  { value: "day", label: "昼" },
  { value: "night", label: "夜" },
];

export function Viewer() {
  const [support, setSupport] = useState<Support>("checking");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [floorMode, setFloorMode] = useState<FloorMode>("all");
  const [view, setView] = useState<ViewMode>("orbit");
  const [lighting, setLighting] = useState<LightingMode>("day");
  const [wallColorId, setWallColorId] = useState<WallColor["id"]>("plaster");

  useEffect(() => {
    const detect = () => {
      setSupport(hasWebgl() ? "ok" : "none");
      setReducedMotion(
        window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      );
    };
    detect();
  }, []);

  const planFloor = effectiveFloorMode(floorMode, "plan") === "2f" ? 2 : 1;
  // 間取りでは全体でも 1F だけを描くので、押下状態は実際に見えている階に合わせる
  const pressedFloorMode = effectiveFloorMode(floorMode, view);

  return (
    <div>
      <div className={s.controls}>
        <div className={s.group} role="group" aria-label="表示する階">
          <span className={s.groupLabel}>階</span>
          {FLOOR_BUTTONS.map((item) => (
            <button
              key={item.value}
              type="button"
              className={s.button}
              aria-pressed={pressedFloorMode === item.value}
              onClick={() => setFloorMode(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {support !== "none" && (
          <>
            <div className={s.group} role="group" aria-label="見え方">
              <span className={s.groupLabel}>見え方</span>
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
          </>
        )}
      </div>

      {support === "none" ? (
        <div className={s.fallback}>
          <p className={s.fallbackText}>
            お使いの環境では 3D（WebGL）を表示できません。同じ寸法の表から起こした平面図に切り替えました。表示の途中で描画できなくなった場合も、この画面のままご覧いただけます。
          </p>
          <FloorPlan floor={planFloor} />
        </div>
      ) : (
        <div className={s.stage}>
          {support === "ok" ? (
            <Scene
              floorMode={floorMode}
              view={view}
              lighting={lighting}
              wallColorId={wallColorId}
              reducedMotion={reducedMotion}
              onContextLost={() => setSupport("none")}
            />
          ) : (
            <p className={s.loading}>建物を組み立てています…</p>
          )}
        </div>
      )}

      <p className={s.caption}>
        {support === "none"
          ? "3D の代わりに平面図を出しています。階のボタンで 1F と 2F を切り替えられます。"
          : "ドラッグで回転、ピンチまたはホイールで拡大縮小。間取りではドラッグで平行移動します。"}
      </p>
    </div>
  );
}
