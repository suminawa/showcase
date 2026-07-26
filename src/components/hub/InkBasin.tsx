"use client";

/*
 * ハブの水盤。作品 = 染料の species であり、押せる場所は DOM の矩形ではなく
 * GPU テクスチャの argmax として毎フレーム計算される。
 *
 * 作品ページの水盤との決定的な違い:
 *  - 墨を落とせない（空水域のタップは速度スプラットだけ）。訪問者はハブを塗り潰せない
 *  - homing がある。手を離せば染料は自分の生まれた場所へ滲み戻る
 *
 * 文字は水の上に一つも置かない。輪郭線も描かない。強調は濃度差だけ。
 */

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import type { FluidSimulation } from "@/components/suminagashi/fluid/simulation";
import {
  INITIAL_BASIN_STATUS,
  clearBasinFocus,
  getBasinFocus,
  getBasinStatus,
  patchBasinStatus,
  sendBasinCommand,
  setBasinFocus,
  subscribeBasinCommand,
  subscribeBasinFocus,
  subscribeBasinStatus,
  type BasinCommand,
  type BasinSpecies,
} from "./basinBridge";

// ---- 時間軸（仕様 §2-1。合計 2.6 秒） ----

/** 最初の滴 */
const FIRST_DROP_MS = 240;
/** 滴の間隔 = clamp(1400 / 滴の総数, 40, 90) */
const DROP_SPAN_MS = 1400;
const DROP_GAP_MIN_MS = 40;
const DROP_GAP_MAX_MS = 90;
/** 輪を羽根状に梳く風。1 回だけ */
const FAN_AT_MS = 1700;
const FAN_STRENGTH = 0.9;
/** この瞬間の配置が homing の帰る場所になる */
const CAPTURE_AT_MS = 1800;
/** 対提示: 作品ごとに 400ms ずつ（索引行・スウォッチ・水面が同時に光る） */
const PAIR_SLOT_MS = 400;

// ---- 記憶（homing） ----

const HOMING_REST = 0.06;
const HOMING_SETTLE = 0.3;
const HOMING_DELAY_MS = 2500;
const HOMING_RAMP_MS = 1500;
/** 「静める」が homing を上げている時間 */
const SETTLE_MS = 2500;

// ---- 強調の ease ----

const RISE_MS = 220;
/** species が入れ替わるときは一度濃度を落としてから乗せる（ポップを避ける） */
const SWAP_MS = 110;
/** 対提示の終了後 */
const ENTRANCE_RELEASE_MS = 240;
/** pointerup で戻す */
const RELEASE_MS = 400;

// ---- 当たり判定・ループ ----

const ID_MAP_INTERVAL_MS = 125;
/** エントランス完了 / settle 完了の後に 1 回だけ強制で読む */
const FORCE_ID_MAP_DELAY_MS = 200;
const TAP_MOVE_PX = 6;
const TAP_MAX_MS = 500;
/** 最後の操作からこれだけ経ったら rAF を完全にパークする（WCAG 2.2.2） */
const IDLE_PARK_MS = 20000;
/** reduced-motion で操作された直後だけ動かす猶予 */
const INTERACTION_WINDOW_MS = 1200;

const EDGE_FADE = 0.04;
/** 索引ホバーで立てる、その領域だけの弱い渦 */
const HOVER_RING_POINTS = 8;
const HOVER_RING_STRENGTH = 0.004;
/** 「渦を立てる」 */
const STIR_RING_POINTS = 12;
const STIR_RING_RADIUS = 0.24;
const STIR_RING_STRENGTH = 0.012;

/** reduced-motion のヘッドレス実行で進めるフレーム数 */
const HEADLESS_FRAMES = 130;

type Drop = {
  atMs: number;
  x: number;
  y: number;
  species: number;
  radius: number;
};

type Origin = { x: number; y: number; radius: number };

type Loop = {
  raf: number;
  /** IntersectionObserver: 画面内か */
  visible: boolean;
  /** document.hidden */
  hidden: boolean;
  /** アイドルで rAF を落としたか */
  parked: boolean;
  reduced: boolean;
  /** reduced-motion: 流体を進めない */
  frozen: boolean;
  lastFrameMs: number;
  lastActivityMs: number;
  interactionUntil: number;
  /** 一度でも訪問者が触ったか。触られた模様はリサイズで作り直さない */
  touched: boolean;

  entranceMs: number;
  schedule: Drop[];
  origins: Origin[];
  nextDrop: number;
  phase: number;
  fanDone: boolean;
  restCaptured: boolean;
  pairing: boolean;
  pairIndex: number;
  pairOrder: number[];
  entranceDone: boolean;

  hlSpecies: number | null;
  hlAmt: number;
  targetSpecies: number | null;
  targetAmt: number;
  easeMs: number;

  quiet: boolean;
  settleUntil: number;

  lastIdMapMs: number;
  forceIdMapAt: number;
  dragging: boolean;
};

function createLoop(): Loop {
  return {
    raf: 0,
    visible: true,
    hidden: false,
    parked: false,
    reduced: false,
    frozen: false,
    lastFrameMs: 0,
    lastActivityMs: 0,
    interactionUntil: 0,
    touched: false,
    entranceMs: 0,
    schedule: [],
    origins: [],
    nextDrop: 0,
    phase: 0,
    fanDone: false,
    restCaptured: false,
    pairing: true,
    pairIndex: -1,
    pairOrder: [],
    entranceDone: false,
    hlSpecies: null,
    hlAmt: 0,
    targetSpecies: null,
    targetAmt: 0,
    easeMs: RISE_MS,
    quiet: false,
    settleUntil: 0,
    lastIdMapMs: 0,
    forceIdMapAt: 0,
    dragging: false,
  };
}

function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

/** requestIdleCallback（無ければ setTimeout 0）。LCP の後にエンジンを積む */
function onIdle(callback: () => void, timeout: number): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(callback, { timeout });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(callback, 0);
  return () => window.clearTimeout(id);
}

export type InkBasinProps = {
  /** seed 配列。index = 染料チャンネル。先頭は素水（GAMES） */
  species: BasinSpecies[];
  className?: string;
  /**
   * 静止 composition。LCP・WebGL2 非対応・context lost の 3 役を兼ねる。
   * まだ書き出していない間はただの紙白なので、無くても壊れない。
   */
  restImage?: string;
};

export function InkBasin({
  species,
  className = "absolute inset-0 overflow-hidden",
  restImage = "/basin-rest.webp",
}: InkBasinProps) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<FluidSimulation | null>(null);
  const loopRef = useRef<Loop>(createLoop());
  const speciesRef = useRef<BasinSpecies[]>(species);
  const controlRef = useRef<{ start: () => void } | null>(null);
  const pointersRef = useRef(
    new Map<
      number,
      {
        x: number;
        y: number;
        startX: number;
        startY: number;
        downAt: number;
        moved: boolean;
        species: number | null;
      }
    >(),
  );

  // props の更新はエンジンを作り直さずに反映する
  useEffect(() => {
    speciesRef.current = species;
  }, [species]);

  const speciesKey = species.map((item) => item.key).join("|");

  const markActivity = useCallback(() => {
    const loop = loopRef.current;
    loop.lastActivityMs = performance.now();
    loop.interactionUntil = loop.lastActivityMs + INTERACTION_WINDOW_MS;
    loop.touched = true;
    controlRef.current?.start();
  }, []);

  const setHighlightTarget = useCallback(
    (target: number | null, amount: number, easeMs: number) => {
      const loop = loopRef.current;
      loop.targetSpecies = target;
      loop.targetAmt = target === null ? 0 : amount;
      loop.easeMs = easeMs;
    },
    [],
  );

  useEffect(() => {
    const mounted = canvasRef.current;
    if (!mounted) return;
    // 型を確定させてから閉じ込める（入れ子の関数でも null 判定を繰り返さない）
    const canvas: HTMLCanvasElement = mounted;

    const loop = loopRef.current;
    Object.assign(loop, createLoop());
    loop.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let disposed = false;
    let engine: FluidSimulation | null = null;
    let layout: typeof import("@/lib/basinComposition") | null = null;
    const teardown: Array<() => void> = [];

    const cancelIdle = onIdle(() => {
      void boot();
    }, 180);
    teardown.push(cancelIdle);

    async function boot() {
      // sim とレイアウトは idle 遅延チャンク。初期 JS には 1 バイトも入れない
      const [sim, composition] = await Promise.all([
        import("@/components/suminagashi/fluid/simulation"),
        import("@/lib/basinComposition"),
      ]);
      if (disposed) return;
      layout = composition;

      const created = new sim.FluidSimulation(canvas, {
        resStep: 1,
        pressureIterations: 16,
        maxDpr: 1.5,
      });
      if (!created.supported) {
        // 静止画へ黙って戻す。ハブは全訪問者が通る面なので失敗を告知しない
        created.destroy();
        canvas.hidden = true;
        return;
      }
      engine = created;
      engineRef.current = created;
      created.setEdgeFade(EDGE_FADE);
      created.setHoming(0);
      // 背面タブで開かれた場合は rAF がそもそも回らない。初期値を実物に合わせる
      loop.hidden = document.hidden;

      seed(true);
      patchBasinStatus({ ready: true, quiet: false });

      // --- 監視 ---

      const resizeObserver = new ResizeObserver(() => {
        if (!engine) return;
        const reshaped = engine.resize();
        // 相似変形なら模様は歪まない。輪が歪むほど変わった時だけ蒔き直す
        if (reshaped && !loop.touched) seed(!loop.entranceDone);
      });
      resizeObserver.observe(canvas);
      teardown.push(() => resizeObserver.disconnect());

      const intersection = new IntersectionObserver((entries) => {
        loop.visible = entries.some((entry) => entry.isIntersecting);
        if (loop.visible) start();
        else stop();
      });
      intersection.observe(canvas);
      teardown.push(() => intersection.disconnect());

      const onVisibility = () => {
        loop.hidden = document.hidden;
        if (loop.hidden) stop();
        else start();
      };
      document.addEventListener("visibilitychange", onVisibility);
      teardown.push(() =>
        document.removeEventListener("visibilitychange", onVisibility),
      );

      const onContextLost = (event: Event) => {
        event.preventDefault();
        stop();
        // エラーメッセージは出さない。静止画に戻すだけ
        canvas.hidden = true;
        patchBasinStatus({ ready: false, quiet: false });
      };
      canvas.addEventListener("webglcontextlost", onContextLost);
      teardown.push(() =>
        canvas.removeEventListener("webglcontextlost", onContextLost),
      );

      teardown.push(subscribeBasinFocus(onFocusChanged));
      teardown.push(subscribeBasinCommand(onCommand));
      // 初期化中に索引へ触れられていたら、その強調を取りこぼさない
      if (getBasinFocus().species !== null) onFocusChanged();

      start();
    }

    // --- 種まき ---

    function seed(withPairing: boolean) {
      if (!engine || !layout) return;
      const items = speciesRef.current;

      engine.clearAll();
      engine.setPalette(items.map((item) => item.absorption));
      engine.setHoming(0);
      engine.highlight(null, 0);

      const aspect = canvas.width / canvas.height;
      const seeds = layout.seedLayout(
        items.map((item) => ({ key: item.key, inert: item.inert })),
        aspect,
      );
      const total = seeds.reduce((sum, item) => sum + item.drops, 0) || 1;
      const gap = clamp(DROP_SPAN_MS / total, DROP_GAP_MIN_MS, DROP_GAP_MAX_MS);

      const schedule: Drop[] = [];
      for (const item of seeds) {
        for (let i = 0; i < item.drops; i++) {
          schedule.push({
            atMs: FIRST_DROP_MS + schedule.length * gap,
            x: item.origin.x,
            y: item.origin.y,
            species: item.species,
            radius: item.dropRadius,
          });
        }
      }

      loop.schedule = schedule;
      loop.origins = seeds.map((item) => ({
        x: item.origin.x,
        y: item.origin.y,
        radius: item.radius,
      }));
      loop.entranceMs = 0;
      loop.nextDrop = 0;
      loop.fanDone = false;
      loop.restCaptured = false;
      loop.entranceDone = false;
      loop.pairing = withPairing;
      loop.pairIndex = -1;
      loop.pairOrder = items
        .filter((item) => !item.inert)
        .map((item) => item.species);
      loop.phase =
        (layout.hashString(items.map((item) => item.key).join("|")) / 2 ** 32) *
        Math.PI *
        2;
      loop.hlSpecies = null;
      loop.hlAmt = 0;
      loop.targetSpecies = null;
      loop.targetAmt = 0;
      loop.frozen = false;
      loop.lastActivityMs = performance.now();

      if (loop.reduced) headlessEntrance();
    }

    /** reduced-motion: 全滴 + 風をヘッドレスに適用して、完成形だけを出す */
    function headlessEntrance() {
      if (!engine) return;
      for (const drop of loop.schedule) {
        engine.splatSpecies(drop.x, drop.y, drop.species, drop.radius);
      }
      engine.fan(FAN_STRENGTH, loop.phase);
      for (let i = 0; i < HEADLESS_FRAMES; i++) {
        engine.step(1 / 60);
      }
      engine.still();
      engine.captureRest();
      engine.render();
      loop.nextDrop = loop.schedule.length;
      loop.fanDone = true;
      loop.restCaptured = true;
      loop.entranceMs = CAPTURE_AT_MS;
      loop.frozen = true;
      loop.forceIdMapAt = performance.now() + FORCE_ID_MAP_DELAY_MS;
    }

    // --- ループ ---

    function start() {
      if (disposed || !engine) return;
      if (loop.raf || !loop.visible || loop.hidden) return;
      loop.parked = false;
      loop.lastFrameMs = 0;
      loop.raf = requestAnimationFrame(frame);
    }

    function stop() {
      if (loop.raf) cancelAnimationFrame(loop.raf);
      loop.raf = 0;
    }

    /** 最終フレームを 1 枚だけ描いてから rAF を落とす */
    function park() {
      if (engine) {
        // 止まった姿で当たり判定を焼き直しておく。以後は読み戻しも走らない
        if (!loop.dragging && !loop.hidden && loop.visible) {
          engine.updateIdMap();
          loop.lastIdMapMs = performance.now();
          loop.forceIdMapAt = 0;
        }
        engine.render();
      }
      stop();
      loop.parked = true;
    }

    function frame(now: number) {
      loop.raf = requestAnimationFrame(frame);
      if (!engine) return;

      const dt =
        loop.lastFrameMs === 0
          ? 1 / 60
          : Math.min((now - loop.lastFrameMs) / 1000, 1 / 30);
      loop.lastFrameMs = now;

      if (!loop.entranceDone) advanceEntrance(dt);
      advanceHighlight(dt);
      advanceHoming(now);

      const interacting = now <= loop.interactionUntil;
      const frozen = loop.frozen && !interacting;

      if (!frozen) {
        if (loop.entranceDone && !loop.quiet && !loop.reduced) {
          engine.applyDrift(now);
        }
        engine.step(dt);
      }
      engine.render();

      maybeReadIdMap(now);

      // アイドルで完全に止める。GPU 負荷がゼロになる
      if (loop.entranceDone && loop.hlAmt <= 0.001) {
        const idleFor = now - loop.lastActivityMs;
        const settled = loop.quiet && now > loop.settleUntil;
        if (settled || frozen || idleFor > IDLE_PARK_MS) park();
      }
    }

    function advanceEntrance(dt: number) {
      if (!engine) return;
      const elapsed = loop.entranceMs + dt * 1000;
      loop.entranceMs = elapsed;

      while (
        loop.nextDrop < loop.schedule.length &&
        loop.schedule[loop.nextDrop].atMs <= elapsed
      ) {
        const drop = loop.schedule[loop.nextDrop++];
        engine.splatSpecies(drop.x, drop.y, drop.species, drop.radius);
      }

      if (!loop.fanDone && elapsed >= FAN_AT_MS) {
        engine.fan(FAN_STRENGTH, loop.phase);
        loop.fanDone = true;
      }

      if (!loop.restCaptured && elapsed >= CAPTURE_AT_MS) {
        engine.still();
        engine.captureRest();
        loop.restCaptured = true;
      }
      if (!loop.restCaptured) return;

      // 対提示: 索引行・スウォッチ・水面が同時に光る。ホバーもタップも要らない
      if (loop.pairing && loop.pairOrder.length > 0) {
        const slot = Math.floor((elapsed - CAPTURE_AT_MS) / PAIR_SLOT_MS);
        if (slot < loop.pairOrder.length) {
          if (slot !== loop.pairIndex) {
            loop.pairIndex = slot;
            setBasinFocus(loop.pairOrder[slot], "entrance", 1);
          }
          return;
        }
        // 終了後 240ms かけて戻す。訪問者が既に触っていれば、その強調は消さない
        clearBasinFocus("entrance");
      }

      loop.entranceDone = true;
      loop.forceIdMapAt = performance.now() + FORCE_ID_MAP_DELAY_MS;
    }

    function advanceHighlight(dt: number) {
      if (!engine) return;
      const swapping =
        loop.targetSpecies !== loop.hlSpecies && loop.hlAmt > 0.001;
      const goal = swapping ? 0 : loop.targetAmt;
      // reduced-motion では ease を掛けない（濃度がふっと変わるだけ）
      const easeMs = loop.reduced ? 1 : swapping ? SWAP_MS : loop.easeMs;
      const stepAmt = (dt * 1000) / Math.max(easeMs, 1);

      if (loop.hlAmt < goal) loop.hlAmt = Math.min(goal, loop.hlAmt + stepAmt);
      else if (loop.hlAmt > goal) loop.hlAmt = Math.max(goal, loop.hlAmt - stepAmt);

      if (loop.hlAmt <= 0.001) {
        loop.hlAmt = 0;
        loop.hlSpecies = loop.targetSpecies;
      }
      engine.highlight(loop.hlAmt > 0 ? loop.hlSpecies : null, loop.hlAmt);
    }

    function advanceHoming(now: number) {
      if (!engine || !loop.restCaptured) return;
      // reduced-motion では drift も homing も回さない
      if (loop.reduced) {
        engine.setHoming(0);
        return;
      }
      if (loop.quiet && now <= loop.settleUntil) {
        engine.setHoming(HOMING_SETTLE);
        return;
      }
      const since = now - loop.lastActivityMs;
      const ramp = clamp((since - HOMING_DELAY_MS) / HOMING_RAMP_MS, 0, 1);
      engine.setHoming(HOMING_REST * ramp);
    }

    function maybeReadIdMap(now: number) {
      if (!engine) return;
      const forced = loop.forceIdMapAt > 0 && now >= loop.forceIdMapAt;
      if (loop.dragging || loop.hidden || !loop.visible) return;
      if (!forced && loop.frozen) return;
      if (!forced && now - loop.lastIdMapMs < ID_MAP_INTERVAL_MS) return;
      engine.updateIdMap();
      loop.lastIdMapMs = now;
      if (forced) loop.forceIdMapAt = 0;
    }

    // --- 索引からの連動 ---

    function onFocusChanged() {
      const next = getBasinFocus();
      if (next.species === null) {
        setHighlightTarget(
          null,
          0,
          next.source === "entrance" ? ENTRANCE_RELEASE_MS : RELEASE_MS,
        );
      } else {
        setHighlightTarget(next.species, next.amount, RISE_MS);
        // 索引からのホバー / フォーカスにだけ、その領域だけの弱い渦を 1 回
        if (next.source === "index") ringAround(next.species);
      }
      if (next.source !== "entrance") {
        loop.lastActivityMs = performance.now();
        start();
      }
    }

    function ringAround(target: number) {
      if (!engine || loop.reduced) return;
      const origin = loop.origins[target];
      const centroid = engine.speciesCentroid(target);
      const cx = centroid?.x ?? origin?.x ?? 0.5;
      const cy = centroid?.y ?? origin?.y ?? 0.5;
      const radius = origin?.radius ?? 0.2;
      for (let i = 0; i < HOVER_RING_POINTS; i++) {
        const angle = (i / HOVER_RING_POINTS) * Math.PI * 2;
        engine.splatVelocity(
          cx + radius * Math.cos(angle),
          cy + radius * Math.sin(angle),
          -Math.sin(angle) * HOVER_RING_STRENGTH,
          Math.cos(angle) * HOVER_RING_STRENGTH,
        );
      }
    }

    function onCommand(command: BasinCommand) {
      if (!engine) return;
      const now = performance.now();
      if (command === "quiet") {
        loop.quiet = true;
        loop.settleUntil = now + SETTLE_MS;
        loop.forceIdMapAt = now + SETTLE_MS + FORCE_ID_MAP_DELAY_MS;
        engine.still();
        patchBasinStatus({ quiet: true });
        start();
        return;
      }
      if (command === "resume") {
        loop.quiet = false;
        loop.lastActivityMs = now;
        patchBasinStatus({ quiet: false });
        start();
        return;
      }
      if (command === "stir") {
        for (let i = 0; i < STIR_RING_POINTS; i++) {
          const angle = (i / STIR_RING_POINTS) * Math.PI * 2;
          engine.splatVelocity(
            0.5 + STIR_RING_RADIUS * Math.cos(angle),
            0.5 + STIR_RING_RADIUS * Math.sin(angle),
            -Math.sin(angle) * STIR_RING_STRENGTH,
            Math.cos(angle) * STIR_RING_STRENGTH,
          );
        }
        loop.quiet = false;
        patchBasinStatus({ quiet: false });
        markActivity();
        return;
      }
      // 流し直す
      loop.quiet = false;
      patchBasinStatus({ quiet: false });
      seed(false);
      markActivity();
    }

    controlRef.current = { start };

    return () => {
      disposed = true;
      stop();
      for (const dispose of teardown) dispose();
      clearBasinFocus("basin");
      clearBasinFocus("entrance");
      patchBasinStatus({ ready: false, quiet: false });
      engine?.destroy();
      engine = null;
      engineRef.current = null;
      controlRef.current = null;
    };
  }, [markActivity, setHighlightTarget, speciesKey]);

  // ---- ポインタの裁定 ----

  const toBasinCoords = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) / rect.width,
      // v は GL 座標（y 上向き）。sampleAt にそのまま渡せる
      y: 1 - (event.clientY - rect.top) / rect.height,
    };
  };

  /** 空水域は crosshair、作品の上は pointer。id map から引くので追加コストはゼロ */
  const updateCursor = (canvas: HTMLCanvasElement, target: number | null) => {
    canvas.style.cursor = target === null ? "crosshair" : "pointer";
  };

  const hitTest = (x: number, y: number): number | null => {
    const engine = engineRef.current;
    if (!engine || !loopRef.current.entranceDone) return null;
    const hit = engine.sampleAt(x, y);
    if (!hit) return null;
    // 素水は当たり判定を返さない。索引側からの連動にだけ応える
    if (speciesRef.current[hit.species]?.inert !== false) return null;
    return hit.species;
  };

  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const engine = engineRef.current;
    if (!engine) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const { x, y } = toBasinCoords(event);
    const target = hitTest(x, y);
    pointersRef.current.set(event.pointerId, {
      x,
      y,
      startX: event.clientX,
      startY: event.clientY,
      downAt: performance.now(),
      moved: false,
      species: target,
    });
    loopRef.current.dragging = true;
    // 押した瞬間に水が沈み込むように濃くなる
    if (target !== null) setBasinFocus(target, "basin", 1);
    markActivity();
  };

  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const engine = engineRef.current;
    if (!engine) return;
    const { x, y } = toBasinCoords(event);
    const pointer = pointersRef.current.get(event.pointerId);

    if (!pointer) {
      // ホバー: 索引を光らせるだけ。水には触れない
      const target = hitTest(x, y);
      updateCursor(event.currentTarget, target);
      if (target === null) clearBasinFocus("basin");
      else setBasinFocus(target, "basin", 1);
      return;
    }

    if (
      Math.hypot(event.clientX - pointer.startX, event.clientY - pointer.startY) >
      TAP_MOVE_PX
    ) {
      pointer.moved = true;
    }
    // 速度スプラットは押した瞬間から常時入る（水は必ず応える）
    engine.splatVelocity(x, y, x - pointer.x, y - pointer.y);
    pointer.x = x;
    pointer.y = y;
    markActivity();
  };

  const onPointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const engine = engineRef.current;
    const pointer = pointersRef.current.get(event.pointerId);
    pointersRef.current.delete(event.pointerId);
    loopRef.current.dragging = pointersRef.current.size > 0;
    if (!engine || !pointer) return;

    const { x, y } = toBasinCoords(event);
    const held = performance.now() - pointer.downAt;
    const target = hitTest(x, y);
    const href =
      pointer.species === null
        ? null
        : (speciesRef.current[pointer.species]?.href ?? null);

    if (
      !pointer.moved &&
      held < TAP_MAX_MS &&
      pointer.species !== null &&
      target === pointer.species &&
      href
    ) {
      router.push(href);
      return;
    }
    clearBasinFocus("basin");
    markActivity();
  };

  const onPointerLeave = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.style.cursor = "";
    clearBasinFocus("basin");
  };

  return (
    <div
      className={className}
      style={{
        backgroundImage: `url(${restImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <canvas
        ref={canvasRef}
        // 水面は活字が持っていない情報を一つも持たない。装飾として扱わせる
        aria-hidden="true"
        className="h-full w-full touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={onPointerLeave}
      />
    </div>
  );
}

/**
 * ハブの動詞は 3 つだけ。地なし・枠なしのテキストボタン。
 * 「静める」は aria-pressed のトグルで、WCAG 2.2.2 の停止手段を兼ねる。
 * 水盤が動いていない環境（WebGL2 非対応 / context lost）では何も出さない。
 */
export function BasinVerbs({ className }: { className?: string }) {
  const status = useSyncExternalStore(
    subscribeBasinStatus,
    getBasinStatus,
    () => INITIAL_BASIN_STATUS,
  );
  if (!status.ready) return null;

  return (
    <div
      className={`flex flex-wrap items-center gap-x-[clamp(18px,2vw,28px)] gap-y-2 ${className ?? ""}`}
    >
      <VerbButton
        pressed={status.quiet}
        onClick={() => sendBasinCommand(status.quiet ? "resume" : "quiet")}
      >
        静める
      </VerbButton>
      <VerbButton onClick={() => sendBasinCommand("stir")}>
        渦を立てる
      </VerbButton>
      <VerbButton onClick={() => sendBasinCommand("reflow")}>
        流し直す
      </VerbButton>
    </div>
  );
}

function VerbButton({
  pressed,
  onClick,
  children,
}: {
  pressed?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className="cursor-pointer text-[0.875rem] font-semibold text-[color:var(--sumi,#14171b)] underline-offset-[6px] hover:underline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[color:var(--sumi,#14171b)] aria-pressed:underline"
    >
      {children}
    </button>
  );
}
