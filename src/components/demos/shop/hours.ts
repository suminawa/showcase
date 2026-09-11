/**
 * 見本「粉とゆげ」の営業時間。架空の店の、架空の時間割。
 * 日をまたぐ営業は扱わない（この店は日中だけ開く）。
 */

/** 0 = 日曜 … 6 = 土曜。Date#getDay と同じ並び */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** 月・火・水は休み */
export const CLOSED_DAYS: readonly Weekday[] = [1, 2, 3];

/** 一日の始まりからの分。10:00 / 18:00 / 17:30 */
export const OPEN_MINUTE = 10 * 60;
export const CLOSE_MINUTE = 18 * 60;
export const LAST_ORDER_MINUTE = 17 * 60 + 30;

/** 表示は月曜起点で並べる（日曜起点だと「日・木・金・土」になって読みにくい） */
const WEEK_FROM_MONDAY: readonly Weekday[] = [1, 2, 3, 4, 5, 6, 0];

const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"] as const;

/** 600 -> "10:00"。時も 0 詰めにする */
export function formatMinute(minute: number): string {
  const hour = Math.floor(minute / 60);
  const rest = minute % 60;
  return `${String(hour).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

function labelFor(days: readonly Weekday[]): string {
  return days.map((day) => DAY_LABELS[day]).join("・");
}

export function openDaysLabel(): string {
  return labelFor(WEEK_FROM_MONDAY.filter((day) => !CLOSED_DAYS.includes(day)));
}

export function closedDaysLabel(): string {
  return labelFor(WEEK_FROM_MONDAY.filter((day) => CLOSED_DAYS.includes(day)));
}

export function hoursLabel(): string {
  return `${formatMinute(OPEN_MINUTE)} - ${formatMinute(CLOSE_MINUTE)}`;
}

export function lastOrderLabel(): string {
  return formatMinute(LAST_ORDER_MINUTE);
}

/** その時刻に開いているか。開店ちょうどは開き、閉店ちょうどは閉まっているものとして扱う */
export function isOpenAt(date: Date): boolean {
  const day = date.getDay() as Weekday;
  if (CLOSED_DAYS.includes(day)) return false;
  const minute = date.getHours() * 60 + date.getMinutes();
  return minute >= OPEN_MINUTE && minute < CLOSE_MINUTE;
}
