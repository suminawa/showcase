/**
 * 見本「灯月設備」の料金の目安。架空の会社の、架空の値段。
 * 表示の順もこの配列の順に従う（並べ替えはしない）。
 */
import { formatYenSuffix } from "@/lib/format";

/** 平日（昼）と、夜間・休日の二本立て */
export type RatePlan = "weekday" | "night";

export type RateRow = {
  id: string;
  label: string;
  /** 平日（昼）の税込価格（円）。0 は「無料」として出す */
  weekday: number;
  /** 夜間・休日の割増を掛ける行かどうか。見積もりは掛けない */
  surcharged: boolean;
  note: string;
};

/** 夜間・休日は 5 割増 */
export const NIGHT_RATE = 1.5;

/** 切替の並び。表示の順もこのまま */
export const RATE_PLANS: readonly { plan: RatePlan; label: string }[] = [
  { plan: "weekday", label: "平日（昼）" },
  { plan: "night", label: "夜間・休日" },
];

export const RATE_ROWS: readonly RateRow[] = [
  {
    id: "trip",
    label: "出張費（片道 15 km まで）",
    weekday: 2200,
    surcharged: true,
    note: "エリアの外は 1 km ごとに 110 円を足します。",
  },
  {
    id: "base",
    label: "基本料金（作業 30 分まで）",
    weekday: 5500,
    surcharged: true,
    note: "30 分を超えた分は、15 分ごとに 2,750 円です。",
  },
  {
    id: "estimate",
    label: "見積もり",
    weekday: 0,
    surcharged: false,
    note: "作業の前に金額を出します。断っても費用はかかりません。",
  },
];

/** その行の、その時間帯の金額。夜間・休日は 5 割増（見積もりは割増なし） */
export function priceFor(
  row: Pick<RateRow, "weekday" | "surcharged">,
  plan: RatePlan,
): number {
  if (plan === "weekday" || !row.surcharged) return row.weekday;
  return Math.round(row.weekday * NIGHT_RATE);
}

/** 0 は「無料」、それ以外は「8,250 円」 */
export function formatRate(amount: number): string {
  return amount === 0 ? "無料" : formatYenSuffix(amount);
}
