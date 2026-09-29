// このファイルは「フォーム受付 GAS キット」の src/ からの写しです（中身は書き換えていません）。
// 直すときはキットの側を直してから、scripts/sync-gas-kits.mjs を走らせてください。
/**
 * 予約枠。「枠」シート（日付・時間帯・定員）と、受付シートに入っている同じ日付・時間帯の行数を
 * 突き合わせて、満席かどうかを決める。枠シートに無い日付・時間帯は「枠なし」として受け付けない。
 */
import { toDateKey } from "./dates.js";

export const DATE_HEADER = "日付";
export const SLOT_HEADER = "時間帯";
export const CAPACITY_HEADER = "定員";

/** 満席のときにフォームへ返す文 */
export const FULL_MESSAGE = "選ばれた日時は、すでに受付を終えています。別の日時をお選びください。";

/** 日付か時間帯のどちらかだけが来たときにフォームへ返す文 */
export const HALF_MESSAGE = "日付と時間帯の両方をお選びください。";

function slotText_(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

/** 全角数字（０〜９）を半角に直す。IME の全角入力を許すため */
function toHalfWidthDigits_(text) {
  return String(text).replace(/[０-９]/g, function (ch) {
    return String.fromCharCode(ch.charCodeAt(0) - 0xfee0);
  });
}

/** 時間帯の突き合わせ用。空白（全角も）を落として比べる */
export function normalizeSlot(value) {
  return String(value === null || value === undefined ? "" : value).replace(/\s+/g, "");
}

export function slotKeyOf(dateKey, slot) {
  return String(dateKey) + "|" + normalizeSlot(slot);
}

function headerIndexOf_(header, name) {
  for (let i = 0; i < header.length; i += 1) {
    if (slotText_(header[i]) === name) return i;
  }
  return -1;
}

/** 枠シートの 2 次元配列 → [{ dateKey, slot, capacity, rowNumber }]。読めない行は飛ばす */
export function parseSlots(values) {
  const rows = Array.isArray(values) ? values : [];
  if (rows.length === 0) return [];
  const header = Array.isArray(rows[0]) ? rows[0] : [];
  const dateAt = headerIndexOf_(header, DATE_HEADER);
  const slotAt = headerIndexOf_(header, SLOT_HEADER);
  const capacityAt = headerIndexOf_(header, CAPACITY_HEADER);
  if (dateAt < 0 || slotAt < 0 || capacityAt < 0) return [];

  const slots = [];
  for (let i = 1; i < rows.length; i += 1) {
    const row = Array.isArray(rows[i]) ? rows[i] : [];
    const dateKey = toDateKey(row[dateAt]);
    const slot = slotText_(row[slotAt]);
    const capacityText = slotText_(row[capacityAt]);
    // 定員が空の行は書きかけとみなして飛ばす。0 と書いてあれば「受け付けない枠」として残す
    if (dateKey === null || slot === "" || capacityText === "") continue;
    const capacity = Number(toHalfWidthDigits_(capacityText));
    if (!Number.isFinite(capacity) || capacity < 0) continue;
    slots.push({ dateKey: dateKey, slot: slot, capacity: Math.floor(capacity), rowNumber: i + 1 });
  }
  return slots;
}

/** 受付シートの 2 次元配列から、日付 × 時間帯ごとの受付数を数える */
export function countReservations(values, config) {
  const counts = {};
  const rows = Array.isArray(values) ? values : [];
  if (rows.length === 0) return counts;
  const header = Array.isArray(rows[0]) ? rows[0] : [];
  if (config.dateField === "" || config.slotField === "") return counts;
  const dateAt = headerIndexOf_(header, config.dateField);
  const slotAt = headerIndexOf_(header, config.slotField);
  if (dateAt < 0 || slotAt < 0) return counts;

  for (let i = 1; i < rows.length; i += 1) {
    const row = Array.isArray(rows[i]) ? rows[i] : [];
    const dateKey = toDateKey(row[dateAt]);
    const slot = normalizeSlot(row[slotAt]);
    if (dateKey === null || slot === "") continue;
    const key = slotKeyOf(dateKey, slot);
    counts[key] = (counts[key] === undefined ? 0 : counts[key]) + 1;
  }
  return counts;
}

function findSlot_(slots, dateKey, slot) {
  for (let i = 0; i < slots.length; i += 1) {
    if (slots[i].dateKey === dateKey && normalizeSlot(slots[i].slot) === slot) return slots[i];
  }
  return null;
}

/**
 * 1 件を受け付けてよいか。
 * 日付も時間帯も空なら、予約ではない送信とみなして通す。
 * 片方だけ、または日付が読めないときは invalid。
 */
export function checkAvailability(slots, counts, dateValue, slotValue) {
  const rawDate = slotText_(dateValue);
  const rawSlot = slotText_(slotValue);
  if (rawDate === "" && rawSlot === "") return { ok: true, reason: "", message: "" };

  const dateKey = toDateKey(rawDate);
  const slot = normalizeSlot(rawSlot);
  if (dateKey === null || slot === "") return { ok: false, reason: "invalid", message: HALF_MESSAGE };

  const found = findSlot_(slots, dateKey, slot);
  if (found === null) return { ok: false, reason: "full", message: FULL_MESSAGE };
  const used = counts[slotKeyOf(dateKey, slot)] === undefined ? 0 : counts[slotKeyOf(dateKey, slot)];
  if (used >= found.capacity) return { ok: false, reason: "full", message: FULL_MESSAGE };
  return { ok: true, reason: "", message: "" };
}

/** doGet 用。その日の枠ごとの残り数を、枠シートの並び順のまま返す */
export function availabilityOf(slots, counts, dateKey) {
  const list = [];
  for (let i = 0; i < slots.length; i += 1) {
    const entry = slots[i];
    if (entry.dateKey !== dateKey) continue;
    const key = slotKeyOf(entry.dateKey, entry.slot);
    const used = counts[key] === undefined ? 0 : counts[key];
    const remaining = entry.capacity - used;
    list.push({ slot: entry.slot, capacity: entry.capacity, used: used, remaining: remaining < 0 ? 0 : remaining });
  }
  return list;
}
