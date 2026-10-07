"use client";

/*
 * 入りの一筆を、生きた墨にする（2026-10-07）。
 *
 * トップの右上にある墨は、これまで写真（/ink/sumi-sparse.webp）に飛白の mask を
 * 掛けた静止画だった。縞のある雲のように見え、紙の最初の 3 秒を「染み」で
 * 始めていた。ここでは作品「墨流し」の流体（WebGL2）を同じ箱に置き、
 * 読み込みの直後に筆が一画を引く ── 墨が水に乗って伸び、指やカーソルが
 * 触れると渦を巻く。紙の上の出来事は依然ひとつ（湿り）で、墨は【構造】の
 * 側に置く: 自分からは動かず、来た人の手にだけ応える。
 *
 * 落とし方:
 *   ・prefers-reduced-motion … 起動しない。静止画のまま
 *   ・WebGL2 が無い／float テクスチャが無い … 起動しない。静止画のまま
 *   ・画面の外へ出た・タブが隠れた … 止める（電池）
 *   ・遅いフレームが続く … 流体の解像度を落とす（simulation.downscale）
 * 起動できた紙だけ、箱に data-live="on" が付き、CSS が静止画を墨に差し替える。
 */
import { useEffect, useRef } from "react";

import { FluidSimulation } from "@/components/suminagashi/fluid/simulation";

import s from "./ink.module.css";

const SLOW_FRAME_MS = 42;
const SLOW_FRAME_LIMIT = 45;
/** 手が離れてから止まるまで。渦の余韻が収まる長さ */
const IDLE_MS = 9000;

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
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __inkHero?: unknown }).__inkHero = { engine, loop: () => loop, drawn: () => drawn };
    }

    const loop = {
      raf: 0,
      last: 0,
      slow: 0,
      visible: true,
      // 隠れているかは visibilitychange で知る。読み込み時の document.hidden は
      // 見ない ── 隠れたタブでは rAF が止まるので、見始めた時に動き出せば足りる
      hidden: false,
      activeUntil: performance.now() + 6000,
    };

    /**
     * 筆の一画。箱の右上から左下へ、墨を乗せながら 1.1 秒で引く。
     * 芯の一本と、その両脇の細い二本（筆の毛が割れた筋）。終わりは掠れる（点を間引く）。
     * 速度はごく弱く ── 強いと墨が塊になって飛び、名乗りの字へ降りてくる。
     * 箱の左 4 割は字の上（SUMINAWA）なので、一画は x ≥ 0.5 の帯に収める。
     */
    let t0 = performance.now() + 220;
    let drawn = 0;
    let stepped = 0;
    let lastX = 0;
    let lastY = 0;
    let seed = 7;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    const isNarrow = () => canvas.clientWidth < 700;
    /** 一画の書き出しへ戻す。引き直すとき（形が変わった）も同じ所から */
    const beginStroke = (delayMs: number) => {
      t0 = performance.now() + delayMs;
      drawn = 0;
      seed = 7;
      lastX = isNarrow() ? 0.74 : 0.72;
      lastY = isNarrow() ? 0.95 : 0.82;
      stepped = 0;
    };
    beginStroke(220);
    /**
     * 一画を一歩ぶん進める。歩みは【フレーム】で数える（時間ではなく）──
     * 時間で引くと、rAF が間引かれた紙（隠れたタブ・省電力）で一画が一点に潰れる。
     * 大きく時間が飛んだときは、その分だけ歩数をまとめて進める（最大 70 歩＝一画の全部）。
     */
    const STEPS = 66;
    const draw = (now: number, dt: number) => {
      if (now < t0) return false;
      const steps = Math.max(1, Math.min(STEPS, Math.round(dt / (1 / 60))));
      for (let i = 0; i < steps && stepped < STEPS; i++) {
        stepped += 1;
        const k = stepped / STEPS;
        const narrow = isNarrow();
        // 名乗りの字の上を掠め、「WA」の上端で掠れて終わる（字には掛からない）。
        // 狭い紙では箱の右 4 割が画面の外なので、一画を左へ寄せ、字の上の帯に収める
        // 箱は紙の右端より 30% ほど外へ張り出している（広い紙で x ≈ 0.66 が紙の右端）。
        // 一画は紙の右上の角から入り、名乗りの「AW」の上で掠れて終わる
        const x = narrow ? 0.74 - 0.4 * k : 0.72 - 0.3 * k;
        const y = narrow
          ? 0.95 - 0.24 * k + 0.03 * Math.sin(k * Math.PI)
          : 0.82 - 0.15 * k + 0.03 * Math.sin(k * Math.PI);
        // 筆圧: 書き出しで太く、終わりへ向けて細く、最後は掠れる
        const press =
          (narrow ? 0.0028 : 0.004) +
          (narrow ? 0.0085 : 0.012) * Math.pow(Math.sin(Math.PI * Math.min(1, 0.2 + k * 0.9)), 0.8);
        const dry = k > 0.74 && rand() < (k - 0.74) * 1.8;
        if (!dry) engine.splatInk(x, y, "carbon", press);
        // 脇の二筋。進む向きに直交して、少し離れた所に細く
        const dx = x - lastX;
        const dy = y - lastY;
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;
        if (rand() < 0.75) engine.splatInk(x + nx * 0.016, y + ny * 0.016, "carbon", press * 0.38);
        if (rand() < 0.6) engine.splatInk(x - nx * 0.013, y - ny * 0.013, "carbon", press * 0.3);
        engine.splatVelocity(x, y, dx * 0.1, dy * 0.1);
        lastX = x;
        lastY = y;
      }
      drawn = stepped / STEPS;
      return drawn >= 1;
    };

    const onFrame = (now: number) => {
      loop.raf = requestAnimationFrame(onFrame);
      if (loop.hidden || !loop.visible) return;
      if (now > loop.activeUntil && drawn >= 1) return;
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
      dbg.frames += 1;
      if (drawn < 1) {
        dbg.draws += 1;
        draw(now, elapsed);
      }
      engine.step(dt);
      engine.render();
    };
    loop.raf = requestAnimationFrame(onFrame);

    /** 手。箱の少し外まで効く（墨の縁を撫でる所作が多いので） */
    let px = -1;
    let py = -1;
    const onMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const m = rect.width * 0.08;
      if (
        event.clientX < rect.left - m ||
        event.clientX > rect.right + m ||
        event.clientY < rect.top - m ||
        event.clientY > rect.bottom + m
      ) {
        px = -1;
        return;
      }
      const x = (event.clientX - rect.left) / rect.width;
      const y = 1 - (event.clientY - rect.top) / rect.height;
      if (px >= 0) engine.splatVelocity(x, y, (x - px) * 0.3, (y - py) * 0.3);
      px = x;
      py = y;
      loop.activeUntil = performance.now() + IDLE_MS;
      loop.last = loop.last || performance.now();
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const onVisibility = () => {
      loop.hidden = document.hidden;
      loop.last = 0;
    };
    document.addEventListener("visibilitychange", onVisibility);

    const io = new IntersectionObserver(([entry]) => {
      loop.visible = entry.isIntersecting;
      loop.last = 0;
    });
    io.observe(canvas);

    const dbg = { ro: 0, resized: 0, frames: 0, draws: 0 };
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __inkDbg?: unknown }).__inkDbg = dbg;
    }
    const ro = new ResizeObserver(() => {
      dbg.ro += 1;
      const changed = engine.resize();
      if (changed) dbg.resized += 1;
      if (changed && drawn > 0) {
        // 形が大きく変わった。一画を書き出しから引き直す（t0 を戻さないと一点に潰れる）
        engine.clearAll();
        beginStroke(120);
        loop.activeUntil = performance.now() + 6000;
      }
    });
    ro.observe(canvas);

    const onLost = (event: Event) => {
      event.preventDefault();
      cancelAnimationFrame(loop.raf);
      if (box) delete box.dataset.live;
    };
    canvas.addEventListener("webglcontextlost", onLost);

    return () => {
      cancelAnimationFrame(loop.raf);
      window.removeEventListener("pointermove", onMove);
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
