/**
 * 税込の切りのいい額から、請求書に書く税抜と消費税を逆算する。
 * 消費税の端数処理（切り捨て・四捨五入・切り上げ）は請求書の側の決まりなので、
 * 三通りそれぞれで「税抜をいくらにすれば、その税込にぴったり戻るか」を探す。
 */
export type TaxRounding = "floor" | "round" | "ceil";

export const TAX_ROUNDINGS: { value: TaxRounding; label: string }[] = [
  { value: "floor", label: "切り捨て" },
  { value: "round", label: "四捨五入" },
  { value: "ceil", label: "切り上げ" },
];

export const TAX_RATES: { value: 10 | 8; label: string }[] = [
  { value: 10, label: "10%" },
  { value: 8, label: "8%（軽減）" },
];

/** 税抜 × 税率 の端数を、整数の計算だけで処理する（浮動小数の誤差を持ち込まない） */
export function taxOf(excluded: number, ratePercent: number, rounding: TaxRounding): number {
  const product = Math.round(excluded) * Math.round(ratePercent); // 円 × %
  const whole = Math.trunc(product / 100);
  const rest = product % 100;
  if (rounding === "floor") return whole;
  if (rounding === "ceil") return rest === 0 ? whole : whole + 1;
  return rest >= 50 ? whole + 1 : whole;
}

/** 税抜 → 税込 */
export function toInclusive(excluded: number, ratePercent: number, rounding: TaxRounding): { tax: number; inclusive: number } {
  const tax = taxOf(excluded, ratePercent, rounding);
  return { tax, inclusive: Math.round(excluded) + tax };
}

/**
 * 税込 → 税抜。同じ端数処理で税込に戻る税抜を、割り算の答えの前後から探す。
 * 複数あれば割り算の答えに近いもの。無ければ null（その端数処理では、この税込は作れない）。
 */
export function solveExcluded(inclusive: number, ratePercent: number, rounding: TaxRounding): { excluded: number; tax: number } | null {
  const target = Math.round(inclusive);
  const exact = target / (1 + ratePercent / 100);
  let best: { excluded: number; tax: number } | null = null;
  for (let e = Math.max(0, Math.floor(exact) - 2); e <= Math.ceil(exact) + 2; e += 1) {
    const { tax, inclusive: back } = toInclusive(e, ratePercent, rounding);
    if (back !== target) continue;
    if (best === null || Math.abs(e - exact) < Math.abs(best.excluded - exact)) best = { excluded: e, tax };
  }
  return best;
}

/** その端数処理で作れる、いちばん近い税込の額（下と上）。作れない額を指定されたときの案内に使う */
export function nearestInclusives(inclusive: number, ratePercent: number, rounding: TaxRounding): { below: number | null; above: number | null } {
  const target = Math.round(inclusive);
  const exact = target / (1 + ratePercent / 100);
  let below: number | null = null;
  let above: number | null = null;
  for (let e = Math.max(0, Math.floor(exact) - 3); e <= Math.ceil(exact) + 3; e += 1) {
    const back = toInclusive(e, ratePercent, rounding).inclusive;
    if (back < target && (below === null || back > below)) below = back;
    if (back > target && (above === null || back < above)) above = back;
  }
  return { below, above };
}
