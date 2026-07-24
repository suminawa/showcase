"use client";

import { useEffect, useRef, useState } from "react";
import { formatYen } from "@/lib/format";

const DURATION_MS = 250;

/** 値の変化を短いカウントアップ/ダウンで表示する。reduced-motion 時は即時反映 */
export function AnimatedYen({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const [displayValue, setDisplayValue] = useState(value);
  const displayRef = useRef(value);

  useEffect(() => {
    const from = displayRef.current;
    if (from === value) return;

    // reduced-motion 時は 1 フレームで即時反映（duration 0）
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? 0
      : DURATION_MS;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress =
        duration === 0 ? 1 : Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      const current = Math.round(from + (value - from) * eased);
      displayRef.current = current;
      setDisplayValue(current);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <span className={className}>{formatYen(displayValue)}</span>;
}
