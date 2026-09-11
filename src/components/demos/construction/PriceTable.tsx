"use client";

import { useState } from "react";

import {
  formatRate,
  priceFor,
  RATE_PLANS,
  RATE_ROWS,
  type RatePlan,
} from "./rates";
import s from "./parts.module.css";

/** 平日（昼）と夜間・休日を切り替える料金の目安。金額の計算は rates.ts */
export function PriceTable() {
  const [plan, setPlan] = useState<RatePlan>("weekday");

  return (
    <div className={s.priceWrap}>
      <div className={s.toggle} role="group" aria-label="時間帯">
        {RATE_PLANS.map((item) => (
          <button
            key={item.plan}
            type="button"
            className={s.toggleButton}
            aria-pressed={plan === item.plan}
            onClick={() => setPlan(item.plan)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 切り替えで変わるのは金額の列と下の一行の両方なので、二つまとめて
          読み上げに載せる。切替ボタンは外に置く（押した状態まで読ませない） */}
      <div className={s.priceLive} aria-live="polite">
        <ul className={s.rates}>
          {RATE_ROWS.map((row) => (
            <li key={row.id} className={s.rate}>
              <p className={s.rateLabel}>{row.label}</p>
              <p className={s.rateAmount}>{formatRate(priceFor(row, plan))}</p>
              <p className={s.rateNote}>{row.note}</p>
            </li>
          ))}
        </ul>

        <p className={s.priceNote}>
          {plan === "night"
            ? "夜間・休日は 18 時以降と、土日祝の金額です。基本料金と出張費が 5 割増になります。"
            : "平日の 8 時から 18 時までの金額です。18 時以降と土日祝は 5 割増になります。"}
        </p>
      </div>
    </div>
  );
}
