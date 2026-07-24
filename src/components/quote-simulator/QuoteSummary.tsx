"use client";

import { formatYen } from "@/lib/format";
import type { QuoteBreakdown } from "@/lib/quote";
import { AnimatedYen } from "./AnimatedYen";

/** アンバーに灯った出力ペイン。合計がこの壁の主役。 */
export function QuoteSummary({
  breakdown,
  includeTax,
}: {
  breakdown: QuoteBreakdown;
  includeTax: boolean;
}) {
  return (
    <aside
      aria-label="見積もり内訳"
      className="pane-amber on-color h-fit p-[clamp(20px,3vw,36px)] lg:sticky lg:top-3"
    >
      <h2 className="font-display text-[0.8125rem] font-semibold tracking-[0.14em] uppercase">
        Estimate
      </h2>
      <dl className="mt-6 space-y-3.5 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-amber-ink">小計</dt>
          <dd className="font-medium tabular-nums">
            {formatYen(breakdown.subtotal)}
          </dd>
        </div>
        {breakdown.optionLines.map((line) => (
          <div key={line.id} className="flex justify-between gap-4">
            <dt className="text-amber-ink">{line.label}</dt>
            <dd className="font-medium tabular-nums">
              +{formatYen(line.amount)}
            </dd>
          </div>
        ))}
        {includeTax && (
          <div className="flex justify-between gap-4">
            <dt className="text-amber-ink">消費税（10%）</dt>
            <dd className="font-medium tabular-nums">
              {formatYen(breakdown.tax)}
            </dd>
          </div>
        )}
      </dl>
      <div className="mt-10">
        <p className="text-sm font-bold">
          合計{includeTax ? "（税込）" : "（税抜）"}
        </p>
        <AnimatedYen
          value={breakdown.total}
          className="mt-1 block text-[clamp(2.25rem,4vw,3rem)] leading-tight font-bold tracking-tight tabular-nums"
        />
      </div>
    </aside>
  );
}
