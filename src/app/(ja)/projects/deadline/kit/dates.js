// このファイルは「期限アラート GAS キット」の src/ からの写しです（中身は書き換えていません）。
// 直すときはキットの側を直してから、scripts/sync-gas-kits.mjs を走らせてください。
/**
 * 日付の扱い。GAS のグローバルには触らないので、Node でそのままテストできる。
 * 期限キーは "YYYY-MM-DD"（Asia/Tokyo）で統一する。
 */

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

/** Asia/Tokyo は夏時間が無いので、UTC からの +9 時間は年中変わらない */
const JST_OFFSET_MINUTES = 540;

function pad2_(value) {
  return value < 10 ? "0" + value : String(value);
}

function utcMillisOf_(dateKey) {
  const parts = String(dateKey).split("-");
  return Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

/**
 * セルの値（Date・文字列・空）を "YYYY-MM-DD" にする。読めなければ null。
 * 日付セルは Date で来るので、+9 時間ずらしてから年月日を取り出す。
 */
export function toDateKey(value, offsetMinutes) {
  const offset = offsetMinutes === undefined ? JST_OFFSET_MINUTES : offsetMinutes;
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    const shifted = new Date(value.getTime() + offset * 60000);
    return (
      shifted.getUTCFullYear() + "-" + pad2_(shifted.getUTCMonth() + 1) + "-" + pad2_(shifted.getUTCDate())
    );
  }
  const matched = String(value).trim().match(/^(\d{4})[-/年.](\d{1,2})[-/月.](\d{1,2})日?$/);
  if (!matched) return null;
  const year = Number(matched[1]);
  const month = Number(matched[2]);
  const day = Number(matched[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const key = year + "-" + pad2_(month) + "-" + pad2_(day);
  // Date.UTC(2026, 1, 30) は 3/2 に繰り上がるだけで NaN にならないので、年月日で照合する
  const probe = new Date(utcMillisOf_(key));
  if (Number.isNaN(probe.getTime())) return null;
  if (probe.getUTCMonth() + 1 !== month || probe.getUTCDate() !== day) return null;
  return key;
}

/** fromKey から toKey までの日数。同じ日なら 0、toKey が過去なら負 */
export function diffDays(fromKey, toKey) {
  return Math.round((utcMillisOf_(toKey) - utcMillisOf_(fromKey)) / 86400000);
}

/** "2026-09-20" → "9/20（日）" */
export function formatDisplay(dateKey) {
  const parts = String(dateKey).split("-");
  const weekday = WEEKDAYS[new Date(utcMillisOf_(dateKey)).getUTCDay()];
  return Number(parts[1]) + "/" + Number(parts[2]) + "（" + weekday + "）";
}

/** 実行時点の Asia/Tokyo の日付キー */
export function todayKey(now, offsetMinutes) {
  const at = now === undefined ? new Date() : now;
  const key = toDateKey(at, offsetMinutes);
  if (key === null) throw new Error("日付を読めません: " + String(now));
  return key;
}
