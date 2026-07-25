"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  FluidSimulation,
  ENTRANCE_DROPS,
  dropsBetween,
} from "./fluid/simulation";

type BasinState = "running" | "unsupported" | "contextlost";

/** タップ判定: 移動がこの px 未満なら「墨を落とす」 */
const TAP_MOVE_PX = 6;
/** パフォーマンスガード: この ms を超えるフレームが続いたら格子を縮小 */
const SLOW_FRAME_MS = 33;
const SLOW_FRAME_LIMIT = 60;

export function SuminagashiBasin() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<FluidSimulation | null>(null);
  const [state, setState] = useState<BasinState>("running");

  // 演出・ループ制御（re-render を避けるため ref に持つ）
  const loopRef = useRef<{
    raf: number;
    startMs: number;
    prevElapsed: number;
    lastFrameMs: number;
    slowFrames: number;
    entranceDone: boolean;
    stirred: boolean;
    fanned: boolean;
    reducedMotion: boolean;
    paused: boolean;
    interactionUntil: number;
  }>({
    raf: 0,
    startMs: 0,
    prevElapsed: -1,
    lastFrameMs: 0,
    slowFrames: 0,
    entranceDone: false,
    stirred: false,
    fanned: false,
    reducedMotion: false,
    paused: false,
    interactionUntil: 0,
  });

  const pointersRef = useRef(
    new Map<number, { x: number; y: number; startX: number; startY: number; moved: boolean }>(),
  );

  /** 直接操作の直後だけシミュレーションを動かすための猶予（reduced-motion 用） */
  const markInteraction = useCallback(() => {
    loopRef.current.interactionUntil = performance.now() + 1200;
  }, []);

  /** エントランスの渦: 中心の周りに接線方向の力を 3 点 */
  const applyStir = useCallback((engine: FluidSimulation) => {
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const x = 0.5 + 0.16 * Math.cos(angle);
      const y = 0.5 + 0.16 * Math.sin(angle);
      engine.splatVelocity(x, y, -Math.sin(angle) * 0.0016, Math.cos(angle) * 0.0016);
    }
  }, []);

  const restart = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.clearAll();
    const loop = loopRef.current;
    loop.startMs = performance.now();
    loop.prevElapsed = -1;
    loop.entranceDone = false;
    loop.stirred = false;
    loop.fanned = false;
    if (loop.reducedMotion) {
      runInstantEntrance(engine);
      loop.entranceDone = true;
    }
    loop.interactionUntil = performance.now() + 1200;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new FluidSimulation(canvas);
    engineRef.current = engine;
    if (!engine.supported) {
      // effect 本体での直接 setState は react-hooks/set-state-in-effect に反するため遅延させる
      const timer = setTimeout(() => setState("unsupported"), 0);
      return () => {
        clearTimeout(timer);
        engine.destroy();
        engineRef.current = null;
      };
    }

    const loop = loopRef.current;
    loop.reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    loop.startMs = performance.now();

    if (loop.reducedMotion) {
      runInstantEntrance(engine);
      loop.entranceDone = true;
    }

    const onFrame = (now: number) => {
      loop.raf = requestAnimationFrame(onFrame);
      if (loop.paused) return;

      const dt = loop.lastFrameMs === 0 ? 1 / 60 : (now - loop.lastFrameMs) / 1000;
      // パフォーマンスガード
      if (loop.lastFrameMs !== 0 && now - loop.lastFrameMs > SLOW_FRAME_MS) {
        loop.slowFrames += 1;
        if (loop.slowFrames >= SLOW_FRAME_LIMIT) {
          loop.slowFrames = 0;
          engine.downscale();
        }
      } else {
        loop.slowFrames = 0;
      }
      loop.lastFrameMs = now;

      // エントランス演出
      if (!loop.entranceDone) {
        const elapsed = now - loop.startMs;
        for (const drop of dropsBetween(loop.prevElapsed, elapsed)) {
          engine.splatInk(drop.x, drop.y, drop.ink, drop.radius);
        }
        if (!loop.stirred && elapsed >= 2600) {
          applyStir(engine);
          loop.stirred = true;
        }
        if (!loop.fanned && elapsed >= 3300) {
          engine.fan();
          loop.fanned = true;
        }
        if (elapsed >= 4200) loop.entranceDone = true;
        loop.prevElapsed = elapsed;
      } else if (!loop.reducedMotion) {
        engine.applyDrift(now);
      }

      // reduced-motion: 操作していない間は完全に静止させる（染料の減衰も止める）
      const idle =
        loop.reducedMotion &&
        loop.entranceDone &&
        now > loop.interactionUntil;
      if (!idle) {
        engine.step(dt);
        engine.render();
      }
    };
    loop.raf = requestAnimationFrame(onFrame);

    const onVisibility = () => {
      loop.paused = document.hidden;
      loop.lastFrameMs = 0;
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onContextLost = (event: Event) => {
      event.preventDefault();
      setState("contextlost");
    };
    canvas.addEventListener("webglcontextlost", onContextLost);

    const observer = new ResizeObserver(() => engine.resize());
    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(loop.raf);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      observer.disconnect();
      engine.destroy();
      engineRef.current = null;
    };
  }, [applyStir]);

  // ---- ポインタ操作 ----

  const toBasinCoords = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) / rect.width,
      y: 1 - (event.clientY - rect.top) / rect.height,
    };
  };

  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    const { x, y } = toBasinCoords(event);
    pointersRef.current.set(event.pointerId, {
      x,
      y,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    });
    markInteraction();
  };

  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const pointer = pointersRef.current.get(event.pointerId);
    const engine = engineRef.current;
    if (!pointer || !engine) return;
    const { x, y } = toBasinCoords(event);
    const movedPx = Math.hypot(
      event.clientX - pointer.startX,
      event.clientY - pointer.startY,
    );
    if (movedPx > TAP_MOVE_PX) pointer.moved = true;
    engine.splatVelocity(x, y, x - pointer.x, y - pointer.y);
    pointer.x = x;
    pointer.y = y;
    markInteraction();
  };

  const onPointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const pointer = pointersRef.current.get(event.pointerId);
    const engine = engineRef.current;
    pointersRef.current.delete(event.pointerId);
    if (!pointer || !engine) return;
    if (!pointer.moved) {
      engine.splatInk(pointer.x, pointer.y, engine.nextInk());
    }
    markInteraction();
  };

  // ---- ボタン ----

  const dropInkRandom = () => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.splatInk(
      0.25 + Math.random() * 0.5,
      0.3 + Math.random() * 0.4,
      engine.nextInk(),
    );
    markInteraction();
  };

  const save = async () => {
    const engine = engineRef.current;
    if (!engine) return;
    const blob = await engine.captureBlob();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    const stamp = new Date()
      .toISOString()
      .replace(/[-:]/g, "")
      .slice(0, 13);
    anchor.download = `suminagashi-${stamp}.png`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (state === "unsupported") {
    return (
      <FallbackPane message="この作品は WebGL2（float テクスチャ）対応のブラウザで動きます。お使いの環境では表示できません。" />
    );
  }
  if (state === "contextlost") {
    return (
      <FallbackPane message="描画コンテキストが失われました。ページを再読み込みしてください。" />
    );
  }

  return (
    <>
      <div className="pane relative min-h-[62svh] flex-1 overflow-hidden">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="墨流しの水盤。ドラッグでかき混ぜ、タップで墨を落とせます"
          className="absolute inset-0 h-full w-full touch-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />
      </div>
      <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
        <div className="inline-grid grid-flow-col gap-[3px] bg-bar p-[3px]">
          <BasinButton onClick={dropInkRandom}>墨を落とす</BasinButton>
          <BasinButton
            onClick={() => {
              engineRef.current?.fan();
              markInteraction();
            }}
          >
            風を送る
          </BasinButton>
          <BasinButton
            onClick={() => {
              engineRef.current?.still();
              markInteraction();
            }}
          >
            静める
          </BasinButton>
          <BasinButton onClick={restart}>流し直す</BasinButton>
          <BasinButton onClick={save}>保存</BasinButton>
        </div>
        <p className="pane px-4 py-2.5 text-[0.8125rem] text-ink-soft">
          気に入った模様は「保存」で PNG になります
        </p>
      </div>
    </>
  );
}

/** reduced-motion: 全滴 + 渦を即時適用し、シミュレーションを進めて静的な模様を作る */
function runInstantEntrance(engine: FluidSimulation) {
  for (const drop of ENTRANCE_DROPS) {
    engine.splatInk(drop.x, drop.y, drop.ink, drop.radius);
  }
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2;
    engine.splatVelocity(
      0.5 + 0.16 * Math.cos(angle),
      0.5 + 0.16 * Math.sin(angle),
      -Math.sin(angle) * 0.0016,
      Math.cos(angle) * 0.0016,
    );
  }
  for (let i = 0; i < 150; i++) {
    engine.step(1 / 60);
  }
  engine.still();
  engine.render();
}

function BasinButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="pane pane-lit px-4 py-2.5 text-[0.8125rem] font-medium transition-[background-color,box-shadow] duration-500 ease-[var(--ease-glass)] active:bg-glass-frost motion-reduce:transition-none"
    >
      {children}
    </button>
  );
}

function FallbackPane({ message }: { message: string }) {
  return (
    <div className="pane-frost flex min-h-[62svh] flex-1 flex-col items-start justify-end gap-4 p-[clamp(20px,3vw,40px)]">
      <p className="max-w-[46ch] text-[0.9375rem] leading-[1.9] text-ink-soft">
        {message}
      </p>
      <Link
        href="/"
        className="font-display text-[0.8125rem] font-semibold tracking-[0.14em] uppercase underline underline-offset-4"
      >
        ← Showcase に戻る
      </Link>
    </div>
  );
}
