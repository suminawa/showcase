// このファイルは「期限アラート GAS キット」の src/ からの写しです（中身は書き換えていません）。
// 直すときはキットの側を直してから、scripts/sync-gas-kits.mjs を走らせてください。
/**
 * 期限の行を「超過」「今日」「N 日後」に仕分ける。
 * 並びは 超過 → 今日 → 近い順。危ないものが上に来る。
 */
import { diffDays } from "./dates.js";

export const OVERDUE = "overdue";

/** バケット ID から節の見出しを作る */
export function headingOf(bucket) {
  if (bucket === OVERDUE) return "■ 期限を過ぎています";
  const days = Number(String(bucket).slice(1));
  return days === 0 ? "■ 今日が期限" : "■ " + days + " 日後が期限";
}

/** items: parseItems の items。todayKeyValue は "YYYY-MM-DD"。返り値は空の節を含まない */
export function collectSections(items, config, todayKeyValue) {
  const order = [];
  if (config.notifyOverdue) order.push(OVERDUE);
  const thresholds = config.thresholds.slice().sort(function (a, b) {
    return a - b;
  });
  for (let i = 0; i < thresholds.length; i += 1) order.push("d" + thresholds[i]);

  const collected = {};
  for (let i = 0; i < order.length; i += 1) collected[order[i]] = [];

  const source = Array.isArray(items) ? items : [];
  for (let i = 0; i < source.length; i += 1) {
    const item = source[i];
    const daysLeft = diffDays(todayKeyValue, item.dueKey);
    const bucket = daysLeft < 0 ? OVERDUE : "d" + daysLeft;
    // しきい値に無い日数、または超過を通知しない設定のときは捨てる
    if (!Object.prototype.hasOwnProperty.call(collected, bucket)) continue;
    collected[bucket].push(Object.assign({}, item, { daysLeft: daysLeft }));
  }

  const sections = [];
  for (let i = 0; i < order.length; i += 1) {
    const bucket = order[i];
    const rows = collected[bucket];
    if (rows.length === 0) continue;
    rows.sort(function (a, b) {
      if (a.dueKey === b.dueKey) return a.rowNumber - b.rowNumber;
      return a.dueKey < b.dueKey ? -1 : 1;
    });
    sections.push({ bucket: bucket, heading: headingOf(bucket), items: rows });
  }
  return sections;
}
