// このファイルは「期限アラート GAS キット」の src/ からの写しです（中身は書き換えていません）。
// 直すときはキットの側を直してから、scripts/sync-gas-kits.mjs を走らせてください。
/**
 * 「期限」シートの値（2 次元配列）を、扱いやすい行の配列にする。
 * 列はヘッダーの名前で探すので、並び順は自由。担当と状態の列は無くても動く。
 */
import { toDateKey } from "./dates.js";

export class SheetError extends Error {
  constructor(message) {
    super(message);
    this.name = "SheetError";
  }
}

function cellText_(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function headerIndexOf_(header, name) {
  const wanted = cellText_(name);
  for (let i = 0; i < header.length; i += 1) {
    if (cellText_(header[i]) === wanted) return i;
  }
  return -1;
}

/**
 * 返り値:
 *   items:   { subject, dueKey, assignee, status, rowNumber }
 *   skipped: { rowNumber, reason }（期限が読めない / 件名が空）
 */
export function parseItems(values, config, offsetMinutes) {
  const rows = Array.isArray(values) ? values : [];
  if (rows.length === 0) {
    throw new SheetError("「" + config.sheetName + "」シートが空です。1 行目に見出しを書いてください。");
  }

  const header = Array.isArray(rows[0]) ? rows[0] : [];
  const subjectAt = headerIndexOf_(header, config.columns.subject);
  const dueAt = headerIndexOf_(header, config.columns.due);
  if (subjectAt < 0) {
    throw new SheetError(
      "「" + config.sheetName + "」シートの 1 行目に「" + config.columns.subject + "」列がありません。",
    );
  }
  if (dueAt < 0) {
    throw new SheetError(
      "「" + config.sheetName + "」シートの 1 行目に「" + config.columns.due + "」列がありません。",
    );
  }
  const assigneeAt = headerIndexOf_(header, config.columns.assignee);
  const statusAt = headerIndexOf_(header, config.columns.status);

  const done = [];
  for (let i = 0; i < config.doneValues.length; i += 1) done.push(cellText_(config.doneValues[i]));

  const items = [];
  const skipped = [];

  for (let i = 1; i < rows.length; i += 1) {
    const row = Array.isArray(rows[i]) ? rows[i] : [];
    const rowNumber = i + 1;
    const subject = cellText_(row[subjectAt]);
    const rawDue = row[dueAt];
    const status = statusAt < 0 ? "" : cellText_(row[statusAt]);

    if (subject === "" && cellText_(rawDue) === "") continue;
    if (done.indexOf(status) >= 0) continue;

    const dueKey = toDateKey(rawDue, offsetMinutes);
    if (dueKey === null) {
      skipped.push({ rowNumber: rowNumber, reason: "期限が読めません" });
      continue;
    }
    if (subject === "") {
      skipped.push({ rowNumber: rowNumber, reason: "「" + config.columns.subject + "」が空です" });
      continue;
    }

    items.push({
      subject: subject,
      dueKey: dueKey,
      assignee: assigneeAt < 0 ? "" : cellText_(row[assigneeAt]),
      status: status,
      rowNumber: rowNumber,
    });
  }

  return { items: items, skipped: skipped };
}
