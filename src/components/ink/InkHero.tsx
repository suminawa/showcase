"use client";

/*
 * 入りの一筆を、生きた墨にする（2026-10-07）。
 *
 * トップの右上の墨は、作品「墨流し」の流体（WebGL2）そのものである。読み込みの
 * 直後に筆が一画を引き、カーソルや指が触れると墨が渦を巻く。手が離れて 9 秒たつと
 * 墨は乾いて一画へ戻る（captureRest / setHoming）── 名乗りの字に被ったまま凍らない。
 * 紙の上の出来事は依然ひとつ（湿り）。墨は構造の側: 自分からは動かず、手にだけ応える。
 *
 * 落とし方:
 *   ・prefers-reduced-motion … 起動しない。静止画のまま
 *   ・WebGL2 が無い／float テクスチャが無い … 起動しない。静止画のまま
 *   ・画面の外へ出た・タブが隠れた・乾ききった … rAF を止める（電池）。手で起きる
 *   ・遅いフレームが続く … 流体の解像度を落とす（simulation.downscale）
 * 起動できた紙だけ、箱に data-live="on" が付き、CSS が静止画を墨に差し替える。
 *
 * 手が効く範囲は、入口の 1 行目の上端より上だけ ── 行の上で動かすと湿りと渦の二つが
 * 同時に動き、「一度の接触で動くものは一つ」が破れる。
 */
import { useEffect, useRef } from "react";

import { FluidSimulation } from "@/components/suminagashi/fluid/simulation";

import s from "./ink.module.css";

const SLOW_FRAME_MS = 42;
const SLOW_FRAME_LIMIT = 45;
/** 手が離れてから乾き始めるまで */
const IDLE_MS = 5000;
/** 乾く（一画へ戻る）のにかける流体の時間（秒） */
const DRY_SEC = 2.2;
/** 一画の歩数と長さ。歩幅（約 0.003）は滴の半径（≥ 0.0035）より小さいので一本に繋がる */
const STEPS = 120;
const STROKE_SEC = 1.1;

export function InkHero() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const box = canvas.parentElement;
    const engine = new FluidSimulation(canvas, {
      resStep: 1,
      maxDpr: 1,
      pressureIterations: 12,
    });
    if (!engine.supported) {
      engine.destroy();
      return;
    }
    engine.setEdgeFade(0.14);
    // 最初の一枚（無地の水面）を先に描いてから箱に印を付ける ── 描く前に見せると、
    // 空の WebGL の面（黒）が darken で紙に乗る
    engine.step(1 / 60);
    engine.render();
    if (box) box.dataset.live = "on";

    const loop = {
      raf: 0,
      last: 0,
      slow: 0,
      visible: true,
      hidden: false,
      /** 手の余韻が切れる時刻。これを過ぎると乾き始める */
      activeUntil: performance.now() + 6000,
      /** 乾き始めてからの流体の時間（秒）。-1 なら乾いていない。壁時計ではなく dt で積む ──
          フレームの遅い端末では壁時計で打ち切ると戻りきらないまま凍る */
      dryT: -1,
      rested: false,
    };

    // ---- 一画 ----
    const isNarrow = () => canvas.clientWidth < 700;
    let t0 = 0;
    let stepped = 0;
    let drawn = 0;
    let lastX = 0;
    let lastY = 0;
    let seed = 7;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    /**
     * 一画の点。k ∈ [0,1]。箱は紙の幅から決まる大きな矩形（紙の右と上の外へ張り出す）なので、
     * 箱の比率で置くと窓の幅ごとに違う所へ来る（1116px の窓で画面の上端に掛かり、棒に見えた）。
     * だから【画面の上の名乗りと言語の切り替え】から決める:
     *   入り … 紙の右端の少し内側、言語の切り替えの下
     *   終わり … 名乗りの字の上端のすぐ上、広い紙は「AW」の上・狭い紙は「AWA」の上
     * 画面の座標を箱の UV に写して splat する。
     */
    let geo = { x0: 0.68, y0: 0.75, x1: 0.35, y1: 0.63 };
    /** 墨が見える帯（紙の座標、px）。手もこの帯の中でだけ効く */
    let band = { top: 0, bottom: Infinity };
    const measure = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const vw = document.documentElement.clientWidth;
      const h1 = box?.parentElement?.querySelector("h1");
      const nav = box?.parentElement?.querySelector("nav");
      const wordTop = h1 ? h1.getBoundingClientRect().top + window.scrollY : 190;
      const navBottom = nav ? nav.getBoundingClientRect().bottom + window.scrollY : 48;
      const n = isNarrow();
      const top = rect.top + window.scrollY;
      const pxX0 = n ? vw - 18 : vw - 36;
      const pxX1 = n ? vw * 0.42 : vw * 0.62;
      // 入りの太さ（半径 ≒ 0.02 × 箱の高さ）のぶん、切り替えから離す
      const pxY0 = Math.max(navBottom + (n ? 20 : 0.03 * rect.height + 14), top + 4);
      const pxY1 = Math.max(pxY0 + (n ? 40 : 60), wordTop - (n ? 4 : 8));
      const toU = (px: number) => (px - rect.left) / rect.width;
      const toV = (py: number) => 1 - (py - top) / rect.height;
      geo = { x0: toU(pxX0), y0: toV(pxY0), x1: toU(pxX1), y1: toV(pxY1) };
      // 墨が見える帯: 言語の切り替えの下から名乗りの字の上端まで。帯の外の墨は CSS の mask で
      // 消す（流れても字には被らない。棟梁 10/7「墨が動いた先に文字が被ると視認性 0」）
      band = { top: navBottom - 4, bottom: wordTop - 4 };
      if (box) {
        box.style.setProperty("--ink-top", `${band.top - top}px`);
        box.style.setProperty("--ink-bottom", `${band.bottom - top}px`);
      }
    };
    const point = (k: number) => {
      const bow = 0.028 * Math.sin(k * Math.PI);
      return { x: geo.x0 + (geo.x1 - geo.x0) * k, y: geo.y0 + (geo.y1 - geo.y0) * k + bow };
    };
    const beginStroke = (delayMs: number) => {
      measure();
      t0 = performance.now() + delayMs;
      stepped = 0;
      drawn = 0;
      seed = 7;
      const p = point(0);
      lastX = p.x;
      lastY = p.y;
    };
    beginStroke(220);

    /**
     * 一画を進める。歩みはフレームではなく経過時間で数え、まとめて進めるときは
     * 一歩ごとに水を一拍（1/120 秒）進めて滴どうしを馴染ませる（間引かれた rAF でも点線にならない）。
     */
    const draw = (now: number, elapsed: number) => {
      if (now < t0) return;
      const steps = Math.max(1, Math.min(40, Math.round(elapsed / (STROKE_SEC / STEPS))));
      const narrow = isNarrow();
      for (let i = 0; i < steps && stepped < STEPS; i++) {
        stepped += 1;
        const k = stepped / STEPS;
        const { x, y } = point(k);
        // 筆圧: 入り（k≈0.12）で最も太く、終わりへ向けて 0.25 倍まで細る
        // 起筆は鈍く押さえる（尖らせると鳥のくちばしに見えた）
        const attack = 0.6 + 0.4 * Math.min(1, k / 0.12);
        const taper = 1 - 0.75 * Math.max(0, (k - 0.12) / 0.88);
        const press = (narrow ? 0.0035 + 0.011 : 0.005 + 0.015) * attack * taper;
        const dx = x - lastX;
        const dy = y - lastY;
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;
        const SPLIT = 0.72;
        if (k < SPLIT) {
          engine.splatInk(x, y, "carbon", press);
        } else {
          // 筆の毛が割れる（飛白）。五本の毛は胴の幅の中に収め（外へ出すと足に見えた）、
          // それぞれ決まった所で紙を離れ、離れる手前で細る。揺れはごく僅か
          const spread = press * 0.5;
          const hairs = [
            { off: 0, end: 1.0, w: 0.5, ph: 0.3 },
            { off: spread * 0.55, end: 0.92, w: 0.34, ph: 2.1 },
            { off: -spread * 0.5, end: 0.88, w: 0.3, ph: 4.0 },
            { off: spread, end: 0.84, w: 0.24, ph: 1.2 },
            { off: -spread * 0.95, end: 0.8, w: 0.22, ph: 5.3 },
          ];
          // 半径の下限は歩幅の 1.1 倍（下回ると毛が点線になる）
          const floor = (Math.hypot(geo.x1 - geo.x0, geo.y1 - geo.y0) / STEPS) * 1.1;
          for (const hair of hairs) {
            if (k > hair.end) continue;
            const life = 1 - (k - SPLIT) / (hair.end - SPLIT);
            const wob = 0.0006 * Math.sin((k - SPLIT) * 40 + hair.ph) * (1 - life);
            const r = Math.max(floor, press * hair.w * (0.35 + 0.65 * life));
            engine.splatInk(x + nx * (hair.off + wob), y + ny * (hair.off + wob), "carbon", r);
          }
        }
        // 速度は終点へ向けて消す ── 終わりに塊を作らない
        const v = (1 - k) * (1 - k) * 0.1;
        engine.splatVelocity(x, y, dx * v, dy * v);
        lastX = x;
        lastY = y;
        if (steps > 1) engine.step(1 / 120);
      }
      drawn = stepped / STEPS;
      if (drawn >= 1) {
        // 引き終わった姿を憶える。乾くときはここへ戻る
        engine.step(1 / 60);
        engine.captureRest();
        loop.rested = true;
      }
    };

    // ---- 手 ----
    /** 入口の 1 行目の上端。これより下では手を受けない */
    const gates = box?.parentElement?.querySelector("ol");
    const limitY = () => (gates ? gates.getBoundingClientRect().top : Infinity);
    let px = -1;
    let py = -1;
    const wake = () => {
      loop.activeUntil = performance.now() + IDLE_MS;
      loop.dryT = -1;
      engine.setHoming(0);
      if (loop.raf === 0) {
        loop.last = 0;
        loop.raf = requestAnimationFrame(onFrame);
      }
    };
    const toUV = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const pageY = event.clientY + window.scrollY;
      // 帯の中だけ。名乗り・切り替え・行の上を通る手には応えない
      if (
        event.clientY >= limitY() ||
        pageY < band.top ||
        pageY > band.bottom ||
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      ) {
        return null;
      }
      return { x: (event.clientX - rect.left) / rect.width, y: 1 - (event.clientY - rect.top) / rect.height };
    };
    const onMove = (event: PointerEvent) => {
      const uv = toUV(event);
      if (!uv) {
        px = -1;
        return;
      }
      if (px >= 0) engine.splatVelocity(uv.x, uv.y, (uv.x - px) * 0.18, (uv.y - py) * 0.18);
      px = uv.x;
      py = uv.y;
      wake();
    };
    /** 指で一度触れる（タップ）。スクロールと競わないので、ここに小さな渦を置く */
    const onDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse") return;
      const uv = toUV(event);
      if (!uv) return;
      const a = rand() * Math.PI * 2;
      engine.splatVelocity(uv.x + Math.cos(a) * 0.01, uv.y + Math.sin(a) * 0.01, -Math.sin(a) * 0.004, Math.cos(a) * 0.004);
      engine.splatVelocity(uv.x - Math.cos(a) * 0.01, uv.y - Math.sin(a) * 0.01, Math.sin(a) * 0.004, -Math.cos(a) * 0.004);
      wake();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });

    // ---- 拍 ----
    const onFrame = (now: number) => {
      loop.raf = requestAnimationFrame(onFrame);
      if (loop.hidden || !loop.visible) return;
      const elapsed = loop.last === 0 ? 1 / 60 : (now - loop.last) / 1000;
      const dt = Math.min(elapsed, 1 / 30);
      if (loop.last !== 0 && now - loop.last > SLOW_FRAME_MS) {
        loop.slow += 1;
        if (loop.slow >= SLOW_FRAME_LIMIT) {
          loop.slow = 0;
          engine.downscale();
        }
      } else {
        loop.slow = 0;
      }
      loop.last = now;
      if (drawn < 1) draw(now, elapsed);
      // 乾く: 手の余韻が切れたら、憶えた一画へ戻していき、戻りきったら拍を止める
      if (drawn >= 1 && now > loop.activeUntil) {
        if (loop.dryT < 0) {
          loop.dryT = 0;
          if (loop.rested) engine.setHoming(2.2);
        } else if ((loop.dryT += dt) >= DRY_SEC) {
          engine.setHoming(0);
          engine.still();
          engine.step(dt);
          engine.render();
          cancelAnimationFrame(loop.raf);
          loop.raf = 0;
          return;
        }
      }
      engine.step(dt);
      engine.render();
    };
    loop.raf = requestAnimationFrame(onFrame);

    const onVisibility = () => {
      loop.hidden = document.hidden;
      loop.last = 0;
      if (!loop.hidden) wake();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const io = new IntersectionObserver(([entry]) => {
      loop.visible = entry.isIntersecting;
      loop.last = 0;
      if (loop.visible && loop.raf === 0 && drawn < 1) wake();
    });
    io.observe(canvas);

    const onWindowResize = () => measure();
    window.addEventListener("resize", onWindowResize, { passive: true });
    const ro = new ResizeObserver(() => {
      if (engine.resize() && drawn > 0) {
        // 形が大きく変わった。一画を書き出しから引き直す
        engine.clearAll();
        engine.setHoming(0);
        loop.rested = false;
        beginStroke(120);
        wake();
      }
    });
    ro.observe(canvas);

    const onLost = (event: Event) => {
      event.preventDefault();
      cancelAnimationFrame(loop.raf);
      loop.raf = 0;
      if (box) delete box.dataset.live;
    };
    canvas.addEventListener("webglcontextlost", onLost);

    return () => {
      cancelAnimationFrame(loop.raf);
      window.removeEventListener("resize", onWindowResize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onLost);
      io.disconnect();
      ro.disconnect();
      engine.destroy();
      if (box) delete box.dataset.live;
    };
  }, []);

  return <canvas ref={canvasRef} className={s.live} aria-hidden="true" />;
}
