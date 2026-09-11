/**
 * 見本「粉とゆげ」の営業時間。架空の店の、架空の時間割。
 * 曜日の並びと時刻の書き方は ../openHours と共通（医院の診療時間と同じ部品を使う）。
 * 日をまたぐ営業は扱わない（この店は日中だけ開く）。
 */
import {
  dayLabel,
  formatMinute,
  inSpan,
  minuteOfDay,
  WEEK_FROM_MONDAY,
  type Span,
  type Weekday,
} from "../openHours";

// 先行の呼び出し元（hours.test.ts / shop-lp の page.tsx）が ./hours から引き続けるので、そのまま出し直す
export { formatMinute };
export type { Weekday };

/** 月・火・水は休み */
export const CLOSED_DAYS: readonly Weekday[] = [1, 2, 3];

/** 一日の始まりからの分。10:00 / 18:00 / 17:30 */
export const OPEN_MINUTE = 10 * 60;
export const CLOSE_MINUTE = 18 * 60;
export const LAST_ORDER_MINUTE = 17 * 60 + 30;

const OPEN_SPAN: Span = { start: OPEN_MINUTE, end: CLOSE_MINUTE };

function labelFor(days: readonly Weekday[]): string {
  return days.map(dayLabel).join("・");
}

export function openDaysLabel(): string {
  return labelFor(WEEK_FROM_MONDAY.filter((day) => !CLOSED_DAYS.includes(day)));
}

/** 「定休日：月・火・水」の形で返す。休みます、のような文にはしない */
export function closedDaysLabel(): string {
  return `定休日：${labelFor(WEEK_FROM_MONDAY.filter((day) => CLOSED_DAYS.includes(day)))}`;
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
  return inSpan(minuteOfDay(date), OPEN_SPAN);
}
