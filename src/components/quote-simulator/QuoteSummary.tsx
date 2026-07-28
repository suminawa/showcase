"use client";

import { formatYen } from "@/lib/format";
import type { QuoteBreakdown } from "@/lib/quote";
import { AnimatedYen } from "./AnimatedYen";
import c from "./quote.module.css";

/**
 * 帳面の右。合計だけが「大」で、他はすべて「小」── 中間の寸法を作らない。
 * まとめの線は一本だけ引く。墨で引いた線なので左が濃く、右へ掠れて消える。
 */
export function QuoteSummary({
  breakdown,
  includeTax,
}: {
  breakdown: QuoteBreakdown;
  includeTax: boolean;
}) {
  return (
    <aside aria-label="見積もり内訳" className={c.summary}>
      <h2 className={c.summaryHead}>内訳</h2>
      <dl className={c.rows}>
        <div className={c.row}>
          <dt className={c.rowLabel}>小計</dt>
          <dd className={c.rowValue}>{formatYen(breakdown.subtotal)}</dd>
        </div>
        {breakdown.optionLines.map((line) => (
          <div key={line.id} className={c.row}>
            <dt className={c.rowLabel}>{line.label}</dt>
            <dd className={c.rowValue}>+{formatYen(line.amount)}</dd>
          </div>
        ))}
        {includeTax && (
          <div className={c.row}>
            <dt className={c.rowLabel}>消費税（10%）</dt>
            <dd className={c.rowValue}>{formatYen(breakdown.tax)}</dd>
          </div>
        )}
      </dl>
      <div className={c.totalBlock}>
        <p className={c.totalLabel}>
          合計{includeTax ? "（税込）" : "（税抜）"}
        </p>
        <AnimatedYen value={breakdown.total} className={c.total} />
      </div>
    </aside>
  );
}
