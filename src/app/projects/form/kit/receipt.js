// このファイルは「フォーム受付 GAS キット」の src/ からの写しです（中身は書き換えていません）。
// 直すときはキットの側を直してから、scripts/sync-gas-kits.mjs を走らせてください。
/**
 * 受付番号（その日の連番）と、二重送信を見分ける鍵のもとになる文字列。
 * 連番は前回の受付番号だけを覚えておけば足りる（日が変われば 001 に戻る）。
 */
import { compactDate } from "./dates.js";

/** ("2026-09-14", 3) → "20260914-003"。1000 件目からは桁が増える */
export function formatReceipt(dateKey, sequence) {
  const number = Math.max(1, Math.floor(Number(sequence) || 1));
  let text = String(number);
  while (text.length < 3) text = "0" + text;
  return compactDate(dateKey) + "-" + text;
}

/** "20260914-003" → { dateKey: "2026-09-14", sequence: 3 }。読めなければ null */
export function parseReceipt(receipt) {
  const text = String(receipt === null || receipt === undefined ? "" : receipt).trim();
  const matched = text.match(/^(\d{4})(\d{2})(\d{2})-(\d+)$/);
  if (!matched) return null;
  return { dateKey: matched[1] + "-" + matched[2] + "-" + matched[3], sequence: Number(matched[4]) };
}

/** 前回の受付番号と今日の日付キーから、次の受付番号を作る */
export function nextReceipt(lastReceipt, dateKey) {
  const last = parseReceipt(lastReceipt);
  if (last === null || last.dateKey !== dateKey) return formatReceipt(dateKey, 1);
  return formatReceipt(dateKey, last.sequence + 1);
}

/**
 * 二重送信を見分けるもとの文字列。
 * 項目名で並べ替えてつなぐので、送られてきた順が違っても、中身が同じなら同じ字になる。
 */
export function dedupeSourceOf(fields, order) {
  const names = (Array.isArray(order) ? order.slice() : Object.keys(fields)).sort();
  const parts = [];
  for (let i = 0; i < names.length; i += 1) {
    const name = names[i];
    const value = fields[name] === null || fields[name] === undefined ? "" : String(fields[name]);
    parts.push(name + "=" + value);
  }
  return parts.join("\n");
}
