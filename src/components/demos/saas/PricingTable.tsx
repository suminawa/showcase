"use client";

import { useState } from "react";

import { formatYen } from "@/lib/format";

import { PLANS, priceFor, type Cycle } from "./pricing";
import s from "./pricing.module.css";

/** 月額払い／年額払いを切り替える料金表。金額の計算は pricing.ts */
export function PricingTable() {
  const [cycle, setCycle] = useState<Cycle>("monthly");

  return (
    <div className={s.wrap}>
      <div className={s.toggle} role="group" aria-label="支払いの周期">
        <button
          type="button"
          className={s.toggleButton}
          aria-pressed={cycle === "monthly"}
          onClick={() => setCycle("monthly")}
        >
          月額払い
        </button>
        <button
          type="button"
          className={s.toggleButton}
          aria-pressed={cycle === "yearly"}
          onClick={() => setCycle("yearly")}
        >
          年額払い（20% 引き）
        </button>
      </div>

      <ul className={s.plans}>
        {PLANS.map((plan) => (
          <li
            key={plan.id}
            className={`${s.plan} ${plan.recommended ? s.recommended : ""}`}
          >
            {plan.recommended ? <span className={s.badge}>おすすめ</span> : null}
            <h3 className={s.name}>{plan.name}</h3>
            <p className={s.price}>
              <span className={s.amount}>{formatYen(priceFor(plan, cycle))}</span>
              <span className={s.unit}>／人／月</span>
            </p>
            <p className={s.audience}>{plan.audience}</p>
            <ul className={s.features}>
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <p className={s.note}>
        {cycle === "yearly"
          ? "年額払いの月あたり換算です。"
          : "年額払いは 20% 引きです。"}
      </p>
    </div>
  );
}
