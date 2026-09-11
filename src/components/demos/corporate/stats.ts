/**
 * 見本「潮見計測」の実績の数字と、その数え上げ。架空の数字。
 * 表示の順もこの配列の順に従う。
 */
export type Stat = {
  id: string;
  label: string;
  value: number;
  unit: string;
};

export const STATS: readonly Stat[] = [
  { id: "surveys", label: "これまでの調査", value: 1240, unit: "件" },
  // 設立の 2002 年から数える（会社概要の「海の計測を、2002 年から続けています」と同じ）。
  // 自社ブイでの「観測」は 2007 年からなので、ここは「計測」と書く
  { id: "years", label: "計測を続けた年数", value: 24, unit: "年" },
  { id: "devices", label: "海に置いた観測機器", value: 96, unit: "台" },
  { id: "data", label: "解析したデータ", value: 38, unit: "TB" },
];

/** 数え上げにかける時間（ミリ秒） */
export const COUNT_UP_DURATION = 1200;

/** 終わりに近づくほど遅くなる曲線。0 より小さい t と 1 より大きい t は端で止める */
export function easeOutCubic(t: number): number {
  const clamped = Math.min(Math.max(t, 0), 1);
  return 1 - Math.pow(1 - clamped, 3);
}

/** 経過 elapsed ミリ秒の時点で出す数。duration が 0 以下なら最初から最終値 */
export function countUpValue(
  target: number,
  elapsed: number,
  duration: number,
): number {
  if (duration <= 0) return target;
  return Math.round(target * easeOutCubic(elapsed / duration));
}

const countFormatter = new Intl.NumberFormat("ja-JP");

/** 1240 -> "1,240" */
export function formatCount(value: number): string {
  return countFormatter.format(value);
}
