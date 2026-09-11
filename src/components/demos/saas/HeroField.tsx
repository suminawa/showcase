"use client";

import { useEffect, useRef } from "react";

import { createParticles, stepParticles, type Particle } from "./field";

/** 既定は saas-lp の青。ほかの見本は rgb で自分の色を渡す */
const DEFAULT_RGB = "31, 94, 255";
const DEFAULT_COUNT = 48;
const SEED = 11;

/**
 * ヒーローの背景。淡い粒がゆっくり流れる canvas。
 * 減速の設定（prefers-reduced-motion: reduce）なら 1 枚だけ描いて止める。
 * タブが隠れている間は止め、寸法が変わったら粒を撒き直す。
 */
export function HeroField({
  className,
  rgb = DEFAULT_RGB,
  count = DEFAULT_COUNT,
}: {
  className?: string;
  /** 粒の色。"R, G, B" の並び。濃さは粒ごとに決まるので、ここでは指定しない */
  rgb?: string;
  /** 粒の数。増やすほど紙の地のように見える */
  count?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let raf = 0;
    let last = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb}, ${p.a})`;
        ctx.fill();
      }
    };

    const frame = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      stepParticles(particles, dt, width, height);
      draw();
      raf = window.requestAnimationFrame(frame);
    };

    const start = () => {
      if (reduced || raf) return;
      last = 0;
      raf = window.requestAnimationFrame(frame);
    };

    const stop = () => {
      if (raf) window.cancelAnimationFrame(raf);
      raf = 0;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = createParticles(count, width, height, SEED);
      draw();
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    resize();
    start();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [rgb, count]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
