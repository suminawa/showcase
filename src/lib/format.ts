const yenFormatter = new Intl.NumberFormat("ja-JP");

/** 12345 -> "¥12,345" */
export function formatYen(amount: number): string {
  return `¥${yenFormatter.format(amount)}`;
}

/**
 * 12345 -> "12,345 円"。
 * 日本語の本文や品書き・料金表に混ぜるときはこちら（記号より読みやすい）。
 */
export function formatYenSuffix(amount: number): string {
  return `${yenFormatter.format(amount)} 円`;
}
