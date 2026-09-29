// このファイルは「フォーム受付 GAS キット」の src/ からの写しです（中身は書き換えていません）。
// 直すときはキットの側を直してから、scripts/sync-gas-kits.mjs を走らせてください。
/**
 * 日付と時刻の扱い。GAS のグローバルには触らないので、Node でそのままテストできる。
 * 日付キーは "YYYY-MM-DD"（Asia/Tokyo）で統一する。
 */

/** Asia/Tokyo は夏時間が無いので、UTC からの +9 時間は年中変わらない */
const JST_OFFSET_MINUTES = 540;

function pad2_(value) {
  return value < 10 ? "0" + value : String(value);
}

/** Date を Asia/Tokyo にずらした Date にする。Date でなければ null */
function shifted_(value, offsetMinutes) {
  const offset = offsetMinutes === undefined ? JST_OFFSET_MINUTES : offsetMinutes;
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) return null;
  return new Date(value.getTime() + offset * 60000);
}

/**
 * セルの値（Date・文字列・空）を "YYYY-MM-DD" にする。読めなければ null。
 * 日付セルは Date で来るので、+9 時間ずらしてから年月日を取り出す。
 */
export function toDateKey(value, offsetMinutes) {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date) {
    const at = shifted_(value, offsetMinutes);
    if (at === null) return null;
    return at.getUTCFullYear() + "-" + pad2_(at.getUTCMonth() + 1) + "-" + pad2_(at.getUTCDate());
  }
  const matched = String(value).trim().match(/^(\d{4})[-/年.](\d{1,2})[-/月.](\d{1,2})日?$/);
  if (!matched) return null;
  const year = Number(matched[1]);
  const month = Number(matched[2]);
  const day = Number(matched[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  // Date.UTC(2026, 1, 30) は 3/2 に繰り上がるだけで NaN にならないので、年月日で照合する
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (probe.getUTCMonth() + 1 !== month || probe.getUTCDate() !== day) return null;
  return year + "-" + pad2_(month) + "-" + pad2_(day);
}

/** 受付シートに書く受付日時。"2026-09-14 10:32:05"（Asia/Tokyo） */
export function formatStamp(value, offsetMinutes) {
  const at = shifted_(value, offsetMinutes);
  if (at === null) throw new Error("日時を読めません: " + String(value));
  return (
    at.getUTCFullYear() +
    "-" +
    pad2_(at.getUTCMonth() + 1) +
    "-" +
    pad2_(at.getUTCDate()) +
    " " +
    pad2_(at.getUTCHours()) +
    ":" +
    pad2_(at.getUTCMinutes()) +
    ":" +
    pad2_(at.getUTCSeconds())
  );
}

/** "2026-09-14" → "20260914"。受付番号の前半に使う */
export function compactDate(dateKey) {
  return String(dateKey).replace(/-/g, "");
}
