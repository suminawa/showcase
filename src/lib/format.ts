const yenFormatter = new Intl.NumberFormat("ja-JP");

/** 12345 -> "¥12,345" */
export function formatYen(amount: number): string {
  return `¥${yenFormatter.format(amount)}`;
}
