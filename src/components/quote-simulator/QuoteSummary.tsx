"use client";

import { formatYen } from "@/lib/format";
import type { QuoteBreakdown } from "@/lib/quote";
import { AnimatedYen } from "./AnimatedYen";

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
      className="h-fit rounded-2xl border border-neutral-200 bg-neutral-50 p-6 lg:sticky lg:top-8"
    >
      <h2 className="text-sm font-medium text-neutral-500">お見積もり</h2>
      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between">
          <dt>小計</dt>
          <dd className="tabular-nums">{formatYen(breakdown.subtotal)}</dd>
        </div>
        {breakdown.optionLines.map((line) => (
          <div key={line.id} className="flex justify-between text-neutral-600">
            <dt>{line.label}</dt>
            <dd className="tabular-nums">+{formatYen(line.amount)}</dd>
          </div>
        ))}
        {includeTax && (
          <div className="flex justify-between text-neutral-600">
            <dt>消費税（10%）</dt>
            <dd className="tabular-nums">{formatYen(breakdown.tax)}</dd>
          </div>
        )}
      </dl>
      <div className="mt-6 border-t border-neutral-200 pt-4">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-sm font-medium">
            合計{includeTax ? "（税込）" : "（税抜）"}
          </span>
          <AnimatedYen
            value={breakdown.total}
            className="text-3xl font-bold tracking-tight tabular-nums"
          />
        </div>
      </div>
    </aside>
  );
}
