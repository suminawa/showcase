"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FluidSimulation } from "./fluid/simulation";
import s from "./basin.module.css";

type BasinState = "running" | "unsupported" | "contextlost";

/** タップ判定: 移動がこの px 未満なら「墨を落とす」 */
const TAP_MOVE_PX = 6;
/**
 * 縮小を判断するフレーム時間のしきい値。
 * 30fps 相当（33.3ms）の正常なカデンスを「遅い」と誤判定しないよう余裕を取る。
 */
const SLOW_FRAME_MS = 42;
const SLOW_FRAME_LIMIT = 60;

export function SuminagashiBasin() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<FluidSimulation | null>(null);
  const [state, setState] = useState<BasinState>("running");

  // ループ制御（re-render を避けるため ref に持つ）
  const loopRef = useRef<{
    raf: number;
    lastFrameMs: number;
    slowFrames: number;
    reducedMotion: boolean;
    paused: boolean;
    interactionUntil: number;
    touched: boolean;
  }>({
    raf: 0,
    lastFrameMs: 0,
    slowFrames: 0,
    reducedMotion: false,
    paused: false,
    interactionUntil: 0,
    touched: false,
  });

  const pointersRef = useRef(
    new Map<
      number,
      { x: number; y: number; startX: number; startY: number; moved: boolean }
    >(),
  );

  /** 直接操作の直後だけシミュレーションを動かすための猶予（reduced-motion 用） */
  const markInteraction = useCallback(() => {
    loopRef.current.interactionUntil = performance.now() + 1200;
    loopRef.current.touched = true;
  }, []);

  /** 流し直す = 無地の水面に戻す。次の一滴はまた手から */
  const restart = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.clearAll();
    const loop = loopRef.current;
    loop.touched = false;
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
    // 水面は無地で待つ。最初の一滴は見る人の手から。
    // 開幕の数フレームだけ描いて、素の水面(と地の色)を見せる
    loop.interactionUntil = performance.now() + 400;

    // 比較用の隠しダイヤル(URL クエリ)。通常は押し退けゼロ = 滴は重なる。
    // ?push=1 で従来の全域押し(同心円)、?push=0.5&reach=2 で至近だけの縁押し
    const params = new URLSearchParams(window.location.search);
    const push = Math.min(1, Math.max(0, Number(params.get("push")) || 0));
    const reach = Math.min(8, Math.max(1.1, Number(params.get("reach")) || 3));
    if (push > 0) engine.setDropPush(push, reach);

    const onFrame = (now: number) => {
      loop.raf = requestAnimationFrame(onFrame);
      if (loop.paused) return;

      // 大きく飛んだフレーム（タブ復帰・スロットリング）は 1/30 秒として扱う
      const dt =
        loop.lastFrameMs === 0
          ? 1 / 60
          : Math.min((now - loop.lastFrameMs) / 1000, 1 / 30);
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

      // 水は自分からは動かない ── 動きはすべて見る人の手(かき混ぜ・風)から。
      // 通常モードは step を回し続けて、渦の余韻が自然に減衰するのを見せる
      const idle = loop.reducedMotion && now > loop.interactionUntil;
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

    const observer = new ResizeObserver(() => {
      // 解像度が本当に変わった時だけ作り直す（空振りの通知で演出が止まらないように）
      const changed = engine.resize();
      // 触られる前の水面は無地なので、サイズが変わったら素の水面を作り直すだけでいい
      if (!changed || loop.touched) return;
      engine.clearAll();
      loop.interactionUntil = performance.now() + 400;
    });
    observer.observe(canvas);

    const onContextLost = (event: Event) => {
      event.preventDefault();
      // 失われた context に対してループを回し続けない
      cancelAnimationFrame(loop.raf);
      observer.disconnect();
      setState("contextlost");
    };
    canvas.addEventListener("webglcontextlost", onContextLost);

    return () => {
      cancelAnimationFrame(loop.raf);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      observer.disconnect();
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

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
    const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 13);
    anchor.download = `suminagashi-${stamp}.png`;
    anchor.click();
    // 同期で revoke すると一部ブラウザでダウンロードが落ちるため 1 拍置く
    setTimeout(() => URL.revokeObjectURL(url), 1000);
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
      {/* 枠も影も置かない。水盤の地（#F6F3ED）は料紙（#F6F3EB）と青が 2 違うだけなので、
          継ぎ目が消えて「紙の一部が濡れている」に見える */}
      <div className={s.basin}>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="墨流しの水盤。ドラッグでかき混ぜ、タップで墨を落とせます"
          className={s.canvas}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />
      </div>
      {/* 動詞は紙に書かれているだけ。ボタンの箱を持たないので、狭い紙では
          そのまま折り返って二段になる ── 框のときのように痩せて潰れることがない */}
      <div className={s.controls}>
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
        <BasinButton onClick={save} className={s.save}>
          保存
        </BasinButton>
        <p className={s.hint}>気に入った模様は「保存」で PNG になります</p>
      </div>
    </>
  );
}

function BasinButton({
  onClick,
  children,
  className = "",
}: {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${s.button} ${className}`}
    >
      {children}
    </button>
  );
}

function FallbackPane({ message }: { message: string }) {
  return <p className={s.fallback}>{message}</p>;
}
