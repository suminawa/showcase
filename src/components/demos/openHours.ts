/**
 * 見本の営業時間・診療時間で使う共通の部品。
 * 店（shop）と医院（clinic）で曜日の並びと時刻の書き方が同じなので、ここに置く。
 * 日をまたぐ時間帯は扱わない（どちらも日中だけ開く）。
 */

/** 0 = 日曜 … 6 = 土曜。Date#getDay と同じ並び */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** 一日のうちの、開いている時間帯。分で持つ（9:30 なら 570） */
export type Span = { start: number; end: number };

/** 表示は月曜起点で並べる（日曜起点だと「日・木・金・土」になって読みにくい） */
export const WEEK_FROM_MONDAY: readonly Weekday[] = [1, 2, 3, 4, 5, 6, 0];

const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"] as const;

/** 曜日の一文字。0 = 日曜 */
export function dayLabel(day: Weekday): string {
  return DAY_LABELS[day];
}

/**
 * 600 -> "10:00"。分は必ず 0 詰め。
 * pad: false なら時の 0 詰めをしない（570 -> "9:30"）── 医院の掲示はこちらの書き方。
 */
export function formatMinute(
  minute: number,
  options?: { pad?: boolean },
): string {
  const pad = options?.pad ?? true;
  const hour = Math.floor(minute / 60);
  const rest = minute % 60;
  const head = pad ? String(hour).padStart(2, "0") : String(hour);
  return `${head}:${String(rest).padStart(2, "0")}`;
}

/** その Date の、一日の始まりからの分 */
export function minuteOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/** 始まりちょうどは中、終わりちょうどは外として扱う */
export function inSpan(minute: number, span: Span): boolean {
  return minute >= span.start && minute < span.end;
}
