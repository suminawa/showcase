"use client";

import { useEffect, useRef, useState } from "react";

import { COUNT_UP_DURATION, countUpValue, formatCount } from "./stats";

/**
 * 画面に入ったら 0 から数え上げる数字。
 * 最初は最終値を出しておく ── サーバーで書き出した HTML にも、JavaScript が動かない環境にも、
 * ちゃんと数字が載っているようにするため。動かせるときだけ 0 に戻して数え上げる。
 * 減速の設定のときと、IntersectionObserver が無い環境では、最終値のまま動かさない。
 * 読み上げには使わせない（aria-hidden）── 文字の情報は呼び出し側が別に置く。
 */
export function CountUp({
  target,
  className,
}: {
  target: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(target);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced || typeof IntersectionObserver === "undefined") return;

    // useEffect の中で setState を直に呼ばない（react-hooks の set-state-in-effect）
    const reset = () => setValue(0);
    reset();

    let raf = 0;
    let start = 0;

    const frame = (now: number) => {
      if (!start) start = now;
      const elapsed = now - start;
      setValue(countUpValue(target, elapsed, COUNT_UP_DURATION));
      if (elapsed < COUNT_UP_DURATION) {
        raf = window.requestAnimationFrame(frame);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.disconnect();
          raf = window.requestAnimationFrame(frame);
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(element);

    return () => {
      observer.disconnect();
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [target]);

  return (
    <span ref={ref} className={className} aria-hidden="true">
      {formatCount(value)}
    </span>
  );
}
