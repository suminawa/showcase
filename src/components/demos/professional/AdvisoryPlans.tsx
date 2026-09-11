"use client";

import { useState } from "react";

import { formatYenSuffix } from "@/lib/format";

import {
  ADVISORY_PLANS,
  advisoryPlanById,
  UNIT_LABELS,
  yearlyEstimate,
  type AdvisoryPlanId,
} from "./advisory";
import s from "./advisory.module.css";

/**
 * 顧問料の 3 プランを切り替える。選んだプランだけをカードで大きく出す ──
 * 3 つ横に並べると、スマホでは縦に長い列が 3 本続いて読み通せない。
 * 金額の計算（年間の目安）は advisory.ts にあり、ここでは表示だけをする。
 */
export function AdvisoryPlans() {
  const [id, setId] = useState<AdvisoryPlanId>("sole");
  const plan = advisoryPlanById(id);
  const yearly = yearlyEstimate(plan.lines);
  const [head, ...rest] = plan.lines;

  return (
    <div className={s.wrap}>
      <div className={s.switch} role="group" aria-label="料金のプラン">
        {ADVISORY_PLANS.map((option) => (
          <button
            key={option.id}
            type="button"
            className={s.switchButton}
            aria-pressed={option.id === id}
            onClick={() => setId(option.id)}
          >
            {option.name}
          </button>
        ))}
      </div>

      {/* 切り替えるとカードの中身が丸ごと入れ替わるので、ここを読み上げに載せる。
          金額は「15,000 円」の書き方（formatYenSuffix）── カードの本文と揃える */}
      <div className={s.card} aria-live="polite">
        <h3 className={s.name}>{plan.name}</h3>
        <p className={s.audience}>{plan.audience}</p>
        <p className={s.price}>
          <span className={s.priceLabel}>{head.label}</span>
          <span className={s.amount}>{formatYenSuffix(head.price)}</span>
          <span className={s.unit}>{UNIT_LABELS[head.unit]}</span>
        </p>
        {rest.length > 0 ? (
          <ul className={s.lines}>
            {rest.map((line) => (
              <li key={line.label}>
                <span>{line.label}</span>
                <span className={s.lineAmount}>
                  {formatYenSuffix(line.price)}
                  {UNIT_LABELS[line.unit]}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
        {yearly === null ? (
          <p className={s.yearly}>
            顧問契約はありません。必要なときだけお受けします。
          </p>
        ) : (
          <p className={s.yearly}>
            年間の目安 <strong>{formatYenSuffix(yearly)}</strong>
          </p>
        )}
        <ul className={s.includes}>
          {plan.includes.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className={s.note}>{plan.note}</p>
      </div>
    </div>
  );
}
