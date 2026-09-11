"use client";

import { useState } from "react";

import s from "./parts.module.css";

/**
 * 電話の CTA。見本なので番号は載せず、どこにも発信しない ──
 * 押すと DemoForm と同じ調子で「つながりません」と出すだけ。
 * 脈打つ輪は飾りなので、減速の設定のときは CSS 側で止まる。
 */
export function CallButton({
  label,
  sub,
  variant = "hero",
}: {
  label: string;
  /** ボタンの中の小さい一行（受付時間など）。header では隠れる */
  sub?: string;
  /** hero は大きく、header は 1 行の小さい形 */
  variant?: "hero" | "header";
}) {
  const [notice, setNotice] = useState("");

  return (
    <span className={s.callWrap}>
      <button
        type="button"
        className={`${s.call} ${variant === "header" ? s.callSmall : ""}`}
        onClick={() =>
          setNotice(
            "見本のため、電話はつながりません。実際の LP ではここから発信できます。",
          )
        }
      >
        <span className={s.callRing} aria-hidden="true" />
        <svg
          className={s.callIcon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6.5 3h3l1.5 4-2 1.5a12 12 0 0 0 6.5 6.5L17 13l4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4 5.2 2 2 0 0 1 6 3Z" />
        </svg>
        <span className={s.callText}>
          <span className={s.callLabel}>{label}</span>
          {sub ? <span className={s.callSub}>{sub}</span> : null}
        </span>
      </button>
      <span className={s.callNotice} role="status" aria-live="polite">
        {notice}
      </span>
    </span>
  );
}
