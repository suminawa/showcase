// scripts/build.mjs が src/ から作る。ここを直接編集しない
// ===== text.js =====
/**
 * 束ねた 1 本の中で共有する小さな道具。どのファイルからも import して使う（各ファイルで同名の関数を定義しない）。
 */

/** セルや入力の値を、前後の空白を落とした文字にする。null / undefined は "" */
function textOf(value) {
  return value === null || value === undefined ? "" : String(value).trim();
}

/** TRUE / FALSE のほか、はい・いいえ・1・0・○・× も読む。空や読めない字は fallback */
function boolOf(value, fallback) {
  if (value === true) return true;
  if (value === false) return false;
  const t = textOf(value).toUpperCase();
  if (t === "") return fallback;
  if (t === "TRUE" || t === "1" || t === "はい" || t === "○") return true;
  if (t === "FALSE" || t === "0" || t === "いいえ" || t === "×") return false;
  return fallback;
}

/** 2 桁に揃える */
function pad2(value) {
  return value < 10 ? "0" + value : String(value);
}

// ===== dates.js =====
/**
 * 日付と時刻の扱い。GAS のグローバルには触らないので、Node でそのままテストできる。
 * 日付キーは "YYYY-MM-DD"、日時キーは "YYYY-MM-DD HH:mm"（Asia/Tokyo）で統一する。
 */


/** Asia/Tokyo は夏時間が無いので、UTC からの +9 時間は年中変わらない */
const JST_OFFSET_MINUTES = 540;

/** Date かどうか。別の realm（node:vm やテストの偽の GAS）から来た Date も見分けられるよう、instanceof は使わない */
function isDate_(value) {
  return Object.prototype.toString.call(value) === "[object Date]";
}

function shifted_(value) {
  if (!isDate_(value) || Number.isNaN(value.getTime())) return null;
  return new Date(value.getTime() + JST_OFFSET_MINUTES * 60000);
}

/** 全角の英数記号と全角空白を半角にする（入力欄と検索で同一視するため） */
function toHalfWidth(text) {
  return String(text === null || text === undefined ? "" : text)
    .replace(/[！-～]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/　/g, " ");
}

function ymd_(year, month, day) {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  // Date.UTC(2026, 1, 30) は 3/2 に繰り上がるだけで NaN にならないので、年月日で照合する
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (probe.getUTCMonth() + 1 !== month || probe.getUTCDate() !== day) return null;
  return year + "-" + pad2(month) + "-" + pad2(day);
}

/**
 * セルの値（Date・文字列・空）を "YYYY-MM-DD" にする。読めなければ null。
 * 日付セルは Date で来るので、+9 時間ずらしてから年月日を取り出す。
 */
function toDateKey(value) {
  if (value === null || value === undefined || value === "") return null;
  if (isDate_(value)) {
    const at = shifted_(value);
    if (at === null) return null;
    return at.getUTCFullYear() + "-" + pad2(at.getUTCMonth() + 1) + "-" + pad2(at.getUTCDate());
  }
  const matched = toHalfWidth(value).trim().match(/^(\d{4})[-/年.](\d{1,2})[-/月.](\d{1,2})日?$/);
  if (!matched) return null;
  return ymd_(Number(matched[1]), Number(matched[2]), Number(matched[3]));
}

/** "YYYY-MM-DD HH:mm"。Date、"2026-09-16 10:30"、"2026/09/16T10:30"、"2026-09-16 10:30:00" を読む。読めなければ null */
function toDateTimeKey(value) {
  if (value === null || value === undefined || value === "") return null;
  if (isDate_(value)) {
    const at = shifted_(value);
    if (at === null) return null;
    return at.getUTCFullYear() + "-" + pad2(at.getUTCMonth() + 1) + "-" + pad2(at.getUTCDate()) + " " + pad2(at.getUTCHours()) + ":" + pad2(at.getUTCMinutes());
  }
  const matched = toHalfWidth(value).trim().match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})[ T](\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!matched) return null;
  const date = ymd_(Number(matched[1]), Number(matched[2]), Number(matched[3]));
  const hour = Number(matched[4]);
  const minute = Number(matched[5]);
  if (date === null || hour > 23 || minute > 59) return null;
  return date + " " + pad2(hour) + ":" + pad2(minute);
}

/** 作成日時・更新日時に書く "2026-09-16 10:32:05"（Asia/Tokyo） */
function formatStamp(value) {
  const at = shifted_(value);
  if (at === null) throw new Error("日時を読めません: " + String(value));
  return (
    at.getUTCFullYear() + "-" + pad2(at.getUTCMonth() + 1) + "-" + pad2(at.getUTCDate()) +
    " " + pad2(at.getUTCHours()) + ":" + pad2(at.getUTCMinutes()) + ":" + pad2(at.getUTCSeconds())
  );
}

/** "2026-09-16" → "20260916"。ID の前半に使う */
function compactDate(dateKey) {
  return String(dateKey).replace(/-/g, "");
}

/** "YYYY-MM-DD" を、その日の 0 時（Asia/Tokyo）の Date にする（シートの日付セルに書く形）。読めなければ null */
function dateFromKey(dateKey) {
  const key = toDateKey(dateKey);
  if (key === null) return null;
  const parts = key.split("-");
  return new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])) - JST_OFFSET_MINUTES * 60000);
}

/** "YYYY-MM-DD HH:mm" を Date（Asia/Tokyo）にする。読めなければ null */
function dateTimeFromKey(key) {
  const k = toDateTimeKey(key);
  if (k === null) return null;
  const m = k.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/);
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5])) - JST_OFFSET_MINUTES * 60000);
}

// ===== definition.js =====
/**
 * 「定義」シートの行から、テーブルと列のスキーマを組む。誤りは敬体の文で集めて返す（投げない）。
 * GAS のグローバルには触らない。
 */

const TYPES = ["文字", "長文", "数値", "金額", "日付", "日時", "選択", "複数選択", "チェック", "メール", "電話", "URL"];
const SYSTEM_COLUMNS = ["ID", "作成日時", "更新日時", "更新者"];
const RESERVED_SHEETS = ["設定", "定義"];
/** 既定で検索欄の対象にする型 */
const DEFAULT_SEARCHABLE = ["文字", "長文", "メール", "電話"];
/** 定義シートの見出し → 内部の名前 */
const HEADER_KEYS = { テーブル: "table", 列: "column", 型: "type", 必須: "required", 選択肢: "options", 一覧: "inList", 検索: "searchable", 既定値: "defaultValue", 説明: "note" };
const HEADER_LABELS = { table: "テーブル", column: "列", type: "型" };

/** カンマと読点で分け、前後の空白を落とし、空を除く */
function splitList(text) {
  const parts = textOf(text).split(/[,、]/);
  const out = [];
  for (let i = 0; i < parts.length; i += 1) {
    const p = parts[i].trim();
    if (p !== "") out.push(p);
  }
  return out;
}

function isReservedSheet(name) {
  const n = textOf(name);
  return RESERVED_SHEETS.indexOf(n) >= 0 || n.charAt(0) === "_";
}

/** 表示名の列: 最初の 文字 型。無ければ ID */
function displayColumn(table) {
  for (let i = 0; i < table.columns.length; i += 1) {
    if (table.columns[i].type === "文字") return table.columns[i].name;
  }
  return "ID";
}

/** シートの見出し: ID、定義の列、システム列 */
function headerFor(table) {
  const names = ["ID"];
  for (let i = 0; i < table.columns.length; i += 1) names.push(table.columns[i].name);
  return names.concat(["作成日時", "更新日時", "更新者"]);
}

function findTable(tables, name) {
  for (let i = 0; i < tables.length; i += 1) {
    if (tables[i].name === name) return tables[i];
  }
  return null;
}

function findColumn(table, name) {
  for (let i = 0; i < table.columns.length; i += 1) {
    if (table.columns[i].name === name) return table.columns[i];
  }
  return null;
}

function typeError_(line, typeText) {
  return "sheet-app: 定義の " + line + " 行目: 型「" + typeText + "」は使えません。" + TYPES.join("・") + "・参照:<テーブル名> のいずれかにしてください";
}

/**
 * rows は「定義」シートの 2 次元配列（1 行目が見出し）。
 * 返り値 { tables, errors }。誤りのある行は落とし、通った行だけでテーブルを組む。
 */
function parseDefinition(rows) {
  const tables = [];
  const errors = [];
  if (!Array.isArray(rows) || rows.length === 0) {
    return { tables: tables, errors: ["sheet-app: 「定義」シートが空です。README の「定義の書き方」を見て、テーブルと列を書いてください"] };
  }
  const index = {};
  const header = rows[0];
  for (let i = 0; i < header.length; i += 1) {
    const key = HEADER_KEYS[textOf(header[i])];
    if (key !== undefined && index[key] === undefined) index[key] = i;
  }
  const requiredKeys = ["table", "column", "type"];
  for (let i = 0; i < requiredKeys.length; i += 1) {
    if (index[requiredKeys[i]] === undefined) {
      errors.push("sheet-app: 「定義」シートの 1 行目に「" + HEADER_LABELS[requiredKeys[i]] + "」の見出しがありません");
    }
  }
  if (errors.length > 0) return { tables: tables, errors: errors };
  const cell = (row, key) => (index[key] === undefined || index[key] >= row.length ? "" : row[index[key]]);
  const byName = {};
  for (let r = 1; r < rows.length; r += 1) {
    const row = rows[r];
    const line = r + 1;
    const tableName = textOf(cell(row, "table"));
    const columnName = textOf(cell(row, "column"));
    const typeText = textOf(cell(row, "type"));
    if (tableName === "" && columnName === "" && typeText === "") continue;
    if (tableName === "") {
      errors.push("sheet-app: 定義の " + line + " 行目: テーブル名が空です");
      continue;
    }
    if (isReservedSheet(tableName)) {
      errors.push("sheet-app: 定義の " + line + " 行目: テーブル名「" + tableName + "」は使えません（設定・定義・_ で始まる名前は予約されています）");
      continue;
    }
    if (columnName === "") {
      errors.push("sheet-app: 定義の " + line + " 行目: 列名が空です");
      continue;
    }
    if (SYSTEM_COLUMNS.indexOf(columnName) >= 0) {
      errors.push("sheet-app: 定義の " + line + " 行目: 列名「" + columnName + "」はアプリが自動で付ける列なので使えません");
      continue;
    }
    let type = typeText;
    let refTable = null;
    const ref = typeText.match(/^参照[:：]\s*(.+)$/);
    if (ref) {
      type = "参照";
      refTable = ref[1].trim();
    } else if (TYPES.indexOf(typeText) < 0) {
      errors.push(typeError_(line, typeText));
      continue;
    }
    const options = splitList(cell(row, "options"));
    if ((type === "選択" || type === "複数選択") && options.length === 0) {
      errors.push("sheet-app: 定義の " + line + " 行目: 「" + columnName + "」は " + type + " なので、選択肢をカンマ区切りで書いてください");
      continue;
    }
    let table = byName[tableName];
    if (table === undefined) {
      table = { name: tableName, display: "ID", columns: [] };
      byName[tableName] = table;
      tables.push(table);
    }
    if (findColumn(table, columnName) !== null) {
      errors.push("sheet-app: 定義の " + line + " 行目: テーブル「" + tableName + "」に列「" + columnName + "」が 2 回あります");
      continue;
    }
    table.columns.push({
      name: columnName,
      type: type,
      required: boolOf(cell(row, "required"), false),
      options: options,
      inList: boolOf(cell(row, "inList"), true),
      searchable: boolOf(cell(row, "searchable"), DEFAULT_SEARCHABLE.indexOf(type) >= 0),
      defaultValue: textOf(cell(row, "defaultValue")),
      note: textOf(cell(row, "note")),
      refTable: refTable,
    });
  }
  for (let t = 0; t < tables.length; t += 1) {
    const table = tables[t];
    for (let c = 0; c < table.columns.length; c += 1) {
      const column = table.columns[c];
      if (column.type === "参照" && byName[column.refTable] === undefined) {
        errors.push("sheet-app: テーブル「" + table.name + "」の列「" + column.name + "」の参照先「" + column.refTable + "」が定義にありません");
      }
    }
    table.display = displayColumn(table);
  }
  if (tables.length === 0 && errors.length === 0) {
    errors.push("sheet-app: 「定義」シートにテーブルがありません。2 行目から、テーブル・列・型を書いてください");
  }
  return { tables: tables, errors: errors };
}

// ===== validate.js =====
/**
 * 1 件の記録を定義に照らして検査し、値を揃える。画面とサーバーの両方で同じものを動かす。
 * 返り値 { ok, errors: { 列名: 敬体の文 }, values: { 列名: 揃えた値 } }。知らない列は無視する。
 */

const TEXT_LIMIT = 200;
const LONG_TEXT_LIMIT = 5000;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[0-9+\-() ]+$/;

function isEmpty_(value) {
  return value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0);
}

/** 「今日」だけ特別（日付の既定値に書ける） */
function defaultFor_(column, today) {
  if (column.type === "日付" && column.defaultValue === "今日") return today;
  if (column.type === "チェック") return column.defaultValue.toUpperCase() === "TRUE";
  if (column.type === "複数選択") return splitList(column.defaultValue);
  return column.defaultValue;
}

function toBool_(value) {
  if (value === true || value === false) return value;
  const t = textOf(value).toUpperCase();
  if (t === "" || t === "FALSE" || t === "いいえ" || t === "0") return false;
  if (t === "TRUE" || t === "はい" || t === "1" || t === "ON") return true;
  return null;
}

/** 1 列の検査。返り値 { error, value } */
function checkValue(column, raw) {
  const type = column.type;
  if (type === "チェック") {
    const b = toBool_(raw);
    return b === null ? { error: "はい か いいえ で入力してください", value: false } : { error: "", value: b };
  }
  if (type === "複数選択") {
    const items = Array.isArray(raw) ? raw.map(textOf).filter((s) => s !== "") : splitList(raw);
    const unknown = items.filter((s) => column.options.indexOf(s) < 0);
    if (unknown.length > 0) return { error: "候補にない値が含まれています: " + unknown.join("、"), value: items };
    return { error: "", value: items };
  }
  const t = textOf(Array.isArray(raw) ? raw.join(", ") : raw);
  if (t === "") return { error: "", value: type === "数値" || type === "金額" ? null : "" };
  if (type === "文字" || type === "参照") {
    if (t.length > TEXT_LIMIT) return { error: TEXT_LIMIT + " 字以内で入力してください", value: t };
    return { error: "", value: t };
  }
  if (type === "長文") {
    if (t.length > LONG_TEXT_LIMIT) return { error: LONG_TEXT_LIMIT.toLocaleString("en-US") + " 字以内で入力してください", value: t };
    return { error: "", value: t };
  }
  if (type === "数値") {
    const n = Number(toHalfWidth(t).replace(/,/g, ""));
    if (!Number.isFinite(n)) return { error: "数値で入力してください", value: t };
    return { error: "", value: n };
  }
  if (type === "金額") {
    const n = Number(toHalfWidth(t).replace(/[,¥￥円]/g, ""));
    if (!Number.isInteger(n)) return { error: "金額は整数（円）で入力してください", value: t };
    return { error: "", value: n };
  }
  if (type === "日付") {
    const key = toDateKey(t);
    if (key === null) return { error: "日付は 2026-09-16 の形で入力してください", value: t };
    return { error: "", value: key };
  }
  if (type === "日時") {
    const key = toDateTimeKey(t);
    if (key === null) return { error: "日時は 2026-09-16 10:30 の形で入力してください", value: t };
    return { error: "", value: key };
  }
  if (type === "選択") {
    if (column.options.indexOf(t) < 0) return { error: "候補から選んでください", value: t };
    return { error: "", value: t };
  }
  if (type === "メール") {
    const v = toHalfWidth(t);
    if (!EMAIL.test(v)) return { error: "メールアドレスの形で入力してください", value: v };
    return { error: "", value: v };
  }
  if (type === "電話") {
    const v = toHalfWidth(t);
    if (!PHONE.test(v)) return { error: "電話番号は数字とハイフンで入力してください", value: v };
    return { error: "", value: v };
  }
  if (type === "URL") {
    const v = toHalfWidth(t);
    if (!/^https?:\/\/\S+$/.test(v)) return { error: "URL は http:// か https:// から書いてください", value: v };
    return { error: "", value: v };
  }
  return { error: "", value: t };
}

/**
 * record は { 列名: 値 }。isNew のときは record に無い列に既定値を入れる。更新のときは record に無い列は values に含めない。
 */
function validate(table, record, options) {
  const opts = options || {};
  const today = opts.today || "";
  const isNew = opts.isNew === true;
  const source = record === null || typeof record !== "object" ? {} : record;
  const errors = {};
  const values = {};
  for (let i = 0; i < table.columns.length; i += 1) {
    const column = table.columns[i];
    const present = Object.prototype.hasOwnProperty.call(source, column.name);
    if (!present && !isNew) continue;
    const raw = present ? source[column.name] : defaultFor_(column, today);
    const checked = checkValue(column, raw);
    if (checked.error !== "") {
      errors[column.name] = checked.error;
      continue;
    }
    if (column.required && column.type !== "チェック" && isEmpty_(checked.value)) {
      errors[column.name] = column.name + " を入力してください";
      continue;
    }
    values[column.name] = checked.value;
  }
  return { ok: Object.keys(errors).length === 0, errors: errors, values: values };
}

// ===== format.js =====
/**
 * 表示用・シート用・API 用の値の変換。
 * API の形: 日付 "yyyy-MM-dd"、日時 "yyyy-MM-dd HH:mm"、数値・金額は number か null、チェックは boolean、複数選択は配列、ほかは文字。
 */

function withCommas(n) {
  const parts = String(n).split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

/** Sheets が数式として解釈する先頭文字を無力化する（見た目は変わらない） */
function safeCell(value) {
  const text = String(value === null || value === undefined ? "" : value);
  return /^[=+\-@\t\r]/.test(text) ? "'" + text : text;
}

function applyDateFormat_(key, dateFormat) {
  if (dateFormat === "yyyy/MM/dd") return key.replace(/-/g, "/");
  return key;
}

/** 一覧・詳細に出す文字。空は "" */
function formatCell(column, value, options) {
  const opts = options || {};
  const dateFormat = opts.dateFormat || "yyyy-MM-dd";
  if (value === null || value === undefined || value === "") return "";
  const type = column.type;
  if (type === "金額") return "¥" + withCommas(value);
  if (type === "数値") return withCommas(value);
  if (type === "日付") return applyDateFormat_(String(value), dateFormat);
  if (type === "日時") return applyDateFormat_(String(value).slice(0, 10), dateFormat) + String(value).slice(10);
  if (type === "チェック") return value === true || String(value).toUpperCase() === "TRUE" ? "✓" : "";
  if (type === "複数選択") return (Array.isArray(value) ? value : splitList(value)).join("、");
  return String(value);
}

/** API の形 → シートのセル */
function toSheetValue(column, value) {
  if (value === null || value === undefined) return "";
  const type = column.type;
  if (type === "日付") {
    const d = dateFromKey(value);
    return d === null ? "" : d;
  }
  if (type === "日時") {
    const d = dateTimeFromKey(value);
    return d === null ? "" : d;
  }
  if (type === "数値" || type === "金額") return value === "" ? "" : Number(value);
  if (type === "チェック") return value === true || String(value).toUpperCase() === "TRUE";
  if (type === "複数選択") return safeCell((Array.isArray(value) ? value : splitList(value)).join(", "));
  return safeCell(value);
}

/** シートのセル → API の形 */
function fromSheetValue(column, raw) {
  if (raw === null || raw === undefined || raw === "") return column.type === "数値" || column.type === "金額" ? null : column.type === "チェック" ? false : column.type === "複数選択" ? [] : "";
  const type = column.type;
  if (type === "日付") {
    const key = toDateKey(raw);
    return key === null ? String(raw) : key;
  }
  if (type === "日時") {
    const key = toDateTimeKey(raw);
    return key === null ? String(raw) : key;
  }
  if (type === "数値" || type === "金額") {
    const n = typeof raw === "number" ? raw : Number(String(raw).replace(/[,¥￥円]/g, ""));
    return Number.isFinite(n) ? n : String(raw);
  }
  if (type === "チェック") return raw === true || String(raw).toUpperCase() === "TRUE";
  if (type === "複数選択") return splitList(raw);
  return String(raw);
}

/** システム列の値（ID・作成日時・更新日時・更新者）は文字のまま */
function fromSystemValue(raw) {
  if (raw === null || raw === undefined) return "";
  if (Object.prototype.toString.call(raw) === "[object Date]") {
    const key = toDateTimeKey(raw);
    return key === null ? "" : key;
  }
  return String(raw);
}

// ===== query.js =====
/**
 * 検索・絞り込み・並び替え・ページ送り。rows は API の形の記録の配列。元の配列は変えない。
 */

const OPS = ["contains", "eq", "ne", "gt", "gte", "lt", "lte", "between", "in", "empty", "notEmpty"];
const DEFAULT_PAGE_SIZE = 50;
const MIN_PAGE_SIZE = 1;
const MAX_PAGE_SIZE = 200;
const NUMBER_TYPES = ["数値", "金額"];
const DATE_TYPES = ["日付", "日時"];
const SYSTEM_SORTABLE = ["ID", "作成日時", "更新日時", "更新者"];

/** 大文字小文字と全角半角の英数を同一視する(かなの正規化はしない) */
function normalizeText(text) {
  return toHalfWidth(text).toLowerCase();
}

function toNumber_(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const t = toHalfWidth(textOf(value)).replace(/[,¥￥円]/g, "");
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function isEmptyValue_(value) {
  return value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0);
}

function columnOf_(table, name) {
  const column = findColumn(table, name);
  if (column !== null) return column;
  if (SYSTEM_SORTABLE.indexOf(name) >= 0) return { name: name, type: "文字", options: [], searchable: false };
  return null;
}

/** 生の query を、定義に合う形に揃える。知らない列・op は落とす */
function normalizeQuery(table, raw) {
  const source = raw === null || typeof raw !== "object" ? {} : raw;
  const filters = [];
  const list = Array.isArray(source.filters) ? source.filters : [];
  for (let i = 0; i < list.length; i += 1) {
    const f = list[i] === null || typeof list[i] !== "object" ? {} : list[i];
    const column = columnOf_(table, textOf(f.column));
    const op = textOf(f.op);
    if (column === null || OPS.indexOf(op) < 0) continue;
    let value = f.value;
    if (op === "between") {
      if (!Array.isArray(value) || value.length !== 2) continue;
      value = [textOf(value[0]), textOf(value[1])];
    } else if (op === "in") {
      if (!Array.isArray(value)) value = [value];
      value = value.map(textOf).filter((s) => s !== "");
      if (value.length === 0) continue;
    } else if (op === "empty" || op === "notEmpty") {
      value = "";
    } else {
      value = typeof value === "boolean" ? value : textOf(value);
      if (value === "") continue;
    }
    filters.push({ column: column.name, op: op, value: value });
  }
  let sort = null;
  if (source.sort && typeof source.sort === "object" && columnOf_(table, textOf(source.sort.column)) !== null) {
    sort = { column: textOf(source.sort.column), dir: textOf(source.sort.dir).toLowerCase() === "desc" ? "desc" : "asc" };
  }
  const page = Math.max(1, Math.floor(Number(source.page)) || 1);
  let pageSize = Math.floor(Number(source.pageSize)) || DEFAULT_PAGE_SIZE;
  pageSize = Math.min(MAX_PAGE_SIZE, Math.max(MIN_PAGE_SIZE, pageSize));
  return { q: textOf(source.q), filters: filters, sort: sort, page: page, pageSize: pageSize };
}

function compareScalar_(column, value, target) {
  if (NUMBER_TYPES.indexOf(column.type) >= 0) {
    const a = toNumber_(value);
    const b = toNumber_(target);
    if (a === null || b === null) return null;
    return a < b ? -1 : a > b ? 1 : 0;
  }
  const a = normalizeText(value);
  const b = normalizeText(target);
  return a < b ? -1 : a > b ? 1 : 0;
}

/** 1 つの条件に当たるか */
function matchesFilter(column, value, filter) {
  const op = filter.op;
  if (op === "empty") return isEmptyValue_(value);
  if (op === "notEmpty") return !isEmptyValue_(value);
  if (column.type === "チェック") {
    // チェックに使えるのは eq / ne（empty / notEmpty は上で済み）。ほかの op は当たらない
    if (op !== "eq" && op !== "ne") return false;
    const want = filter.value === true || String(filter.value).toLowerCase() === "true";
    const got = value === true;
    return op === "ne" ? got !== want : got === want;
  }
  if (column.type === "複数選択") {
    const items = Array.isArray(value) ? value : [];
    if (op === "in") return filter.value.some((v) => items.indexOf(v) >= 0);
    if (op === "contains") return items.some((v) => normalizeText(v).indexOf(normalizeText(filter.value)) >= 0);
    if (op === "eq") return items.indexOf(filter.value) >= 0;
    if (op === "ne") return items.indexOf(filter.value) < 0;
    return false;
  }
  if (isEmptyValue_(value)) return false;
  if (op === "in") return filter.value.some((v) => normalizeText(v) === normalizeText(value));
  if (op === "contains") return normalizeText(value).indexOf(normalizeText(filter.value)) >= 0;
  if (op === "eq") return compareScalar_(column, value, filter.value) === 0;
  if (op === "ne") {
    const c = compareScalar_(column, value, filter.value);
    return c === null ? true : c !== 0;
  }
  if (op === "between") {
    const lo = compareScalar_(column, value, filter.value[0]);
    const hi = compareScalar_(column, value, filter.value[1]);
    return lo !== null && hi !== null && lo >= 0 && hi <= 0;
  }
  const c = compareScalar_(column, value, filter.value);
  if (c === null) return false;
  if (op === "gt") return c > 0;
  if (op === "gte") return c >= 0;
  if (op === "lt") return c < 0;
  if (op === "lte") return c <= 0;
  return false;
}

function matchesQ_(table, row, q) {
  if (q === "") return true;
  const needle = normalizeText(q);
  for (let i = 0; i < table.columns.length; i += 1) {
    const column = table.columns[i];
    if (!column.searchable) continue;
    const value = row[column.name];
    const text = Array.isArray(value) ? value.join(" ") : value === null || value === undefined ? "" : String(value);
    if (normalizeText(text).indexOf(needle) >= 0) return true;
  }
  return false;
}

/** q と filters で絞る(ページ送りはしない) */
function filterRows(table, rows, query) {
  const out = [];
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    if (!matchesQ_(table, row, query.q)) continue;
    let ok = true;
    for (let j = 0; j < query.filters.length; j += 1) {
      const filter = query.filters[j];
      const column = columnOf_(table, filter.column);
      if (column === null || !matchesFilter(column, row[filter.column], filter)) {
        ok = false;
        break;
      }
    }
    if (ok) out.push(row);
  }
  return out;
}

function sortKey_(column, value) {
  if (isEmptyValue_(value)) return null;
  if (NUMBER_TYPES.indexOf(column.type) >= 0) return toNumber_(value);
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

/** 並び替え。空は末尾。sort が null なら更新日時の降順 */
function sortRows(table, rows, sort) {
  const s = sort === null || sort === undefined ? { column: "更新日時", dir: "desc" } : sort;
  const column = columnOf_(table, s.column) || { name: s.column, type: "文字" };
  const dir = s.dir === "desc" ? -1 : 1;
  const numeric = NUMBER_TYPES.indexOf(column.type) >= 0;
  const decorated = rows.map((row, index) => ({ row: row, index: index, key: sortKey_(column, row[s.column]) }));
  decorated.sort((a, b) => {
    if (a.key === null && b.key === null) return a.index - b.index;
    if (a.key === null) return 1;
    if (b.key === null) return -1;
    let c;
    if (numeric) c = a.key - b.key;
    else if (DATE_TYPES.indexOf(column.type) >= 0 || SYSTEM_SORTABLE.indexOf(column.name) >= 0) c = a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
    else c = String(a.key).localeCompare(String(b.key), "ja");
    if (c === 0) return a.index - b.index;
    return c * dir;
  });
  return decorated.map((d) => d.row);
}

function paginate(rows, page, pageSize) {
  const start = (page - 1) * pageSize;
  return rows.slice(start, start + pageSize);
}

function applyQuery(table, rows, query) {
  const filtered = sortRows(table, filterRows(table, rows, query), query.sort);
  return { rows: paginate(filtered, query.page, query.pageSize), total: filtered.length, page: query.page, pageSize: query.pageSize };
}

// ===== csv.js =====
/**
 * CSV(UTF-8 BOM 付き、CRLF)。Excel でそのまま開ける。
 */

function csvCell(value) {
  const text = value === null || value === undefined ? "" : String(value);
  if (/[",\r\n]/.test(text)) return '"' + text.replace(/"/g, '""') + '"';
  return text;
}

/** Excel が数式として解釈する先頭文字を無力化する（シートに書くときの safeCell と同じ考え。数値はそのまま） */
function guardCsvCell_(value) {
  if (typeof value !== "string") return value;
  return /^[=+\-@\t\r]/.test(value) ? "'" + value : value;
}

function cellValue_(column, value) {
  if (value === null || value === undefined) return "";
  if (column !== null && column.type === "チェック") return value === true ? "TRUE" : "FALSE";
  if (Array.isArray(value)) return guardCsvCell_(value.join(", "));
  return guardCsvCell_(value);
}

/** rows は API の形。列は ID・定義の列・システム列の順 */
function toCsv(table, rows) {
  const header = headerFor(table);
  const columns = {};
  for (let i = 0; i < table.columns.length; i += 1) columns[table.columns[i].name] = table.columns[i];
  const lines = [header.map(csvCell).join(",")];
  for (let r = 0; r < rows.length; r += 1) {
    const cells = [];
    for (let c = 0; c < header.length; c += 1) {
      const name = header[c];
      const column = Object.prototype.hasOwnProperty.call(columns, name) ? columns[name] : null;
      cells.push(csvCell(cellValue_(column, rows[r][name])));
    }
    lines.push(cells.join(","));
  }
  return "﻿" + lines.join("\r\n") + "\r\n";
}

// ===== ids.js =====
/**
 * 記録の ID（その日の連番）。連番は前回の ID だけを覚えておけば足りる（日が変われば 001 に戻る）。
 */

/** ("2026-09-16", 3) → "20260916-003"。1000 件目からは桁が増える */
function formatId(dateKey, sequence) {
  const number = Math.max(1, Math.floor(Number(sequence) || 1));
  let text = String(number);
  while (text.length < 3) text = "0" + text;
  return compactDate(dateKey) + "-" + text;
}

/** "20260916-003" → { dateKey: "2026-09-16", sequence: 3 }。読めなければ null */
function parseId(id) {
  const text = String(id === null || id === undefined ? "" : id).trim();
  const matched = text.match(/^(\d{4})(\d{2})(\d{2})-(\d+)$/);
  if (!matched) return null;
  return { dateKey: matched[1] + "-" + matched[2] + "-" + matched[3], sequence: Number(matched[4]) };
}

function isId(text) {
  return parseId(text) !== null;
}

/** 前回の ID と今日の日付キーから、次の ID を作る */
function nextId(lastId, dateKey) {
  const last = parseId(lastId);
  if (last === null || last.dateKey !== dateKey) return formatId(dateKey, 1);
  return formatId(dateKey, last.sequence + 1);
}

// ===== samples.js =====
/**
 * 見本のテンプレ 3 種（顧客管理・案件管理・在庫管理）。メニュー「見本を読み込む」と、見本ページ（api-memory）が使う。
 * 社名・人名は架空。同じ入力から同じ出力になる（乱数を使わない）。
 */

const TEMPLATE_NAMES = ["顧客管理", "案件管理", "在庫管理"];
const DEFINITION_HEADER = ["テーブル", "列", "型", "必須", "選択肢", "一覧", "検索", "既定値", "説明"];
const SETTINGS_ROWS = [
  ["項目", "値"],
  ["アプリ名", "業務アプリ"],
  ["編集できる人", ""],
  ["1 ページの件数", "50"],
  ["日付の書式", "yyyy-MM-dd"],
  ["AI を使う", "TRUE"],
  ["モデル", "claude-sonnet-5"],
  ["AI の 1 日の上限", "200"],
];

const COMPANIES = ["うみかぜ商店", "みなと工務店", "さくら不動産", "ひだまり整体院", "あおば設計", "つばさ運送", "こもれび保育園", "なぎさ食堂", "かえで税理士事務所", "ふもと農園", "しおさい旅館", "ひかり電機", "まつかぜ薬局", "いぶき製作所", "そよかぜ美容室", "たかね建設", "わかば学習塾", "みどり造園", "はまべ水産", "ゆうひ写真館"];
const PEOPLE = ["山川", "田中", "佐藤", "鈴木", "高橋", "伊藤", "渡辺", "中村", "小林", "加藤"];
const TOWNS = ["横浜市中区", "横浜市西区", "川崎市中原区", "藤沢市", "鎌倉市", "横須賀市", "茅ヶ崎市", "平塚市"];
const INDUSTRIES = ["建設", "不動産", "飲食", "小売", "士業", "医療", "製造", "その他"];
// 会社名（COMPANIES）に対応する業種。並びは COMPANIES と揃えてある。選択肢そのものは INDUSTRIES を使う
const CUSTOMER_INDUSTRIES = ["小売", "建設", "不動産", "医療", "建設", "その他", "その他", "飲食", "士業", "その他", "その他", "製造", "医療", "製造", "その他", "建設", "その他", "建設", "製造", "その他"];
const STATUSES = ["見込み", "取引中", "休眠"];
const CONTACT_KINDS = ["電話", "訪問", "メール", "打ち合わせ", "その他"];
const STAGES = ["相談", "見積もり", "受注", "進行中", "完了", "失注"];
const CONFIDENCE = ["高", "中", "低"];
const PROGRESS_KINDS = ["打ち合わせ", "作業", "納品", "請求", "その他"];
const CATEGORIES = ["部材", "工具", "消耗品", "完成品"];
const MOVE_KINDS = ["入庫", "出庫", "棚卸"];
const BASE_STAMP = Date.UTC(2026, 8, 1, 1, 0, 0); // 2026-09-01 10:00:00 JST
const UPDATER = "sample@example.com";

/** 2026-06-01 から days 日後の "yyyy-MM-dd" */
function dateAfter_(days) {
  const d = new Date(Date.UTC(2026, 5, 1) + days * 86400000);
  return d.getUTCFullYear() + "-" + pad2(d.getUTCMonth() + 1) + "-" + pad2(d.getUTCDate());
}
/** 作成日時・更新日時: 2026-09-01 10:00:00 から n 分後 */
function stamp_(minutes) {
  const d = new Date(BASE_STAMP + minutes * 60000);
  return d.getUTCFullYear() + "-" + pad2(d.getUTCMonth() + 1) + "-" + pad2(d.getUTCDate()) + " " + pad2(d.getUTCHours() + 9) + ":" + pad2(d.getUTCMinutes()) + ":00";
}
/** テーブルごとに ID を振る。日付キーは 2026-09-01 固定 */
function ids_(count) { const out = []; for (let i = 1; i <= count; i += 1) out.push(formatId("2026-09-01", i)); return out; }
function pick_(list, i) { return list[i % list.length]; }
/** 入出庫の備考を区分に合わせて書く */
function movementNote_(kind, i) {
  if (kind === "入庫") return "仕入れの入庫です。";
  if (kind === "出庫") return pick_(COMPANIES, i) + "の現場向けです。";
  return "月次の棚卸しです。";
}
function system_(id, n) { return { ID: id, 作成日時: stamp_(n), 更新日時: stamp_(n), 更新者: UPDATER }; }

function def_(table, column, type, required, options, inList, searchable, defaultValue, note) {
  return [table, column, type, required ? "TRUE" : "", options || "", inList === false ? "FALSE" : "", searchable === undefined ? "" : searchable ? "TRUE" : "FALSE", defaultValue || "", note || ""];
}

const JOB_KINDS = ["新規導入", "改修", "定期保守", "移転", "点検", "増設", "更新", "調査"];
const PRODUCTS = ["ヒノキ角材 30×40", "ステンレスねじ M6", "養生テープ", "電動ドリル", "塗料（白）", "塗料（グレー）", "合板 12mm", "コンクリート釘", "電動ノコギリ", "脚立 3段", "メジャー 5.5m", "作業灯（LED）", "ブルーシート 3.6m", "結束バンド 200mm", "サンドペーパー #240", "木工用接着剤", "軍手（Lサイズ）", "安全帯", "棚板ユニット", "収納箱"];
// 商品名（PRODUCTS）に対応する分類。並びは PRODUCTS と揃えてある。選択肢そのものは CATEGORIES を使う
const PRODUCT_CATEGORIES = ["部材", "部材", "消耗品", "工具", "消耗品", "消耗品", "部材", "部材", "工具", "工具", "工具", "工具", "消耗品", "消耗品", "消耗品", "消耗品", "消耗品", "工具", "完成品", "完成品"];
const LOCATIONS = ["棚 A-1", "棚 A-2", "棚 B-1", "棚 B-2", "棚 C-1", "倉庫 2"];
// 商品の仕入先。COMPANIES（顧客）とは別の、ここでしか使わない架空の仕入れ先
const SUPPLIERS = ["きたはま建材", "とうわ金物", "みなみ工具", "ひので塗料", "あさひ資材"];

function customers_() {
  const definition = [
    DEFINITION_HEADER,
    def_("顧客", "会社名", "文字", true, "", true, undefined, "", "法人名。個人は氏名"),
    def_("顧客", "担当者", "文字", false, "", true, undefined, "", "先方のご担当者の姓"),
    def_("顧客", "業種", "選択", false, INDUSTRIES.join(", "), true, undefined, "その他", ""),
    def_("顧客", "状況", "選択", false, STATUSES.join(", "), true, undefined, "見込み", ""),
    def_("顧客", "メール", "メール", false, "", false, undefined, "", ""),
    def_("顧客", "電話", "電話", false, "", true, undefined, "", ""),
    def_("顧客", "住所", "文字", false, "", false, undefined, "", ""),
    def_("顧客", "最終連絡日", "日付", false, "", true, undefined, "今日", ""),
    def_("顧客", "年間取引額", "金額", false, "", true, undefined, "", "円。見込みは空のまま"),
    def_("顧客", "要注意", "チェック", false, "", true, undefined, "", "支払いの遅れなど"),
    def_("顧客", "メモ", "長文", false, "", false, undefined, "", ""),
    def_("対応履歴", "顧客", "参照:顧客", true, "", true, undefined, "", ""),
    def_("対応履歴", "日付", "日付", true, "", true, undefined, "今日", ""),
    def_("対応履歴", "種別", "選択", true, CONTACT_KINDS.join(", "), true, undefined, "電話", ""),
    def_("対応履歴", "担当", "文字", false, "", true, undefined, "", "こちらの担当"),
    def_("対応履歴", "内容", "長文", true, "", true, undefined, "", ""),
    def_("対応履歴", "次回対応日", "日付", false, "", true, undefined, "", ""),
  ];
  const customerIds = ids_(20);
  const customers = COMPANIES.map((company, i) => Object.assign(system_(customerIds[i], i), {
    会社名: company,
    担当者: pick_(PEOPLE, i),
    業種: CUSTOMER_INDUSTRIES[i],
    状況: pick_(STATUSES, i),
    メール: "info" + (i + 1) + "@example.com",
    電話: "045-000-00" + pad2(i + 1),
    住所: pick_(TOWNS, i) + " " + (i + 1) + "-2-3",
    最終連絡日: dateAfter_(i * 5),
    年間取引額: pick_(STATUSES, i) === "見込み" ? null : (i + 1) * 120000,
    要注意: i % 7 === 3,
    メモ: i % 4 === 0 ? "紹介で知り合いました。年度末に予算の相談があります。" : "",
  }));
  const historyIds = ids_(30);
  const histories = historyIds.map((id, i) => Object.assign(system_(id, 20 + i), {
    顧客: customerIds[i % 20],
    日付: dateAfter_(30 + i * 3),
    種別: pick_(CONTACT_KINDS, i),
    担当: pick_(PEOPLE, i + 3),
    内容: pick_(["見積もりの内容についてご説明しました。", "納期のご相談を受け、社内で確認してからご連絡することにしました。", "請求書をお送りしました。", "新しいご担当者にごあいさつしました。", "保守契約の更新についてご案内しました。"], i),
    次回対応日: dateAfter_(60 + (i % 40)),
  }));
  return { definition: definition, tables: { 顧客: customers, 対応履歴: histories } };
}

function projects_() {
  const definition = [
    DEFINITION_HEADER,
    def_("案件", "案件名", "文字", true, "", true, undefined, "", "案件・工事の名前"),
    def_("案件", "顧客名", "文字", false, "", true, undefined, "", "先方の会社名"),
    def_("案件", "段階", "選択", false, STAGES.join(", "), true, undefined, "相談", ""),
    def_("案件", "金額", "金額", false, "", true, undefined, "", "円。相談中は空のまま"),
    def_("案件", "開始日", "日付", false, "", true, undefined, "", ""),
    def_("案件", "納期", "日付", false, "", true, undefined, "", ""),
    def_("案件", "担当", "文字", false, "", true, undefined, "", "社内の担当"),
    def_("案件", "確度", "選択", false, CONFIDENCE.join(", "), true, undefined, "", ""),
    def_("案件", "メモ", "長文", false, "", false, undefined, "", ""),
    def_("進捗", "案件", "参照:案件", true, "", true, undefined, "", ""),
    def_("進捗", "日付", "日付", true, "", true, undefined, "今日", ""),
    def_("進捗", "種別", "選択", false, PROGRESS_KINDS.join(", "), true, undefined, "", ""),
    def_("進捗", "内容", "長文", true, "", true, undefined, "", ""),
    def_("進捗", "担当", "文字", false, "", true, undefined, "", ""),
  ];
  const projectIds = ids_(15);
  const projects = projectIds.map((id, i) => Object.assign(system_(id, i), {
    案件名: pick_(COMPANIES, i) + "様 " + pick_(JOB_KINDS, i),
    顧客名: pick_(COMPANIES, i),
    段階: pick_(STAGES, i),
    金額: pick_(STAGES, i) === "相談" ? null : (i + 1) * 250000,
    開始日: dateAfter_(i * 6),
    納期: dateAfter_(i * 6 + 30),
    担当: pick_(PEOPLE, i + 1),
    確度: pick_(CONFIDENCE, i),
    メモ: i % 4 === 1 ? "先方のご希望を伺いながら進めています。" : "",
  }));
  const progressIds = ids_(25);
  const progresses = progressIds.map((id, i) => Object.assign(system_(id, 15 + i), {
    案件: projectIds[i % 15],
    日付: dateAfter_(20 + i * 3),
    種別: pick_(PROGRESS_KINDS, i),
    内容: pick_(["お打ち合わせを行い、ご要望を伺いました。", "現地で作業を行いました。", "納品を完了しました。", "請求書をお送りしました。", "進捗をご確認いただきました。"], i),
    担当: pick_(PEOPLE, i + 4),
  }));
  return { definition: definition, tables: { 案件: projects, 進捗: progresses } };
}

function inventory_() {
  const definition = [
    DEFINITION_HEADER,
    def_("商品", "商品名", "文字", true, "", true, undefined, "", ""),
    def_("商品", "型番", "文字", false, "", true, undefined, "", ""),
    def_("商品", "分類", "選択", false, CATEGORIES.join(", "), true, undefined, "", ""),
    def_("商品", "単価", "金額", false, "", true, undefined, "", "円"),
    def_("商品", "在庫数", "数値", false, "", true, undefined, "", ""),
    def_("商品", "発注点", "数値", false, "", true, undefined, "", "これを下回ったら発注"),
    def_("商品", "仕入先", "文字", false, "", true, undefined, "", ""),
    def_("商品", "保管場所", "文字", false, "", true, undefined, "", ""),
    def_("商品", "販売中", "チェック", false, "", true, undefined, "TRUE", ""),
    def_("商品", "商品ページ", "URL", false, "", false, undefined, "", ""),
    def_("商品", "メモ", "長文", false, "", false, undefined, "", ""),
    def_("入出庫", "商品", "参照:商品", true, "", true, undefined, "", ""),
    def_("入出庫", "日付", "日付", true, "", true, undefined, "今日", ""),
    def_("入出庫", "区分", "選択", false, MOVE_KINDS.join(", "), true, undefined, "入庫", ""),
    def_("入出庫", "数量", "数値", true, "", true, undefined, "", ""),
    def_("入出庫", "担当", "文字", false, "", true, undefined, "", ""),
    def_("入出庫", "備考", "文字", false, "", true, undefined, "", ""),
  ];
  const productIds = ids_(20);
  const products = productIds.map((id, i) => Object.assign(system_(id, i), {
    商品名: PRODUCTS[i],
    型番: "NO-" + String(i + 1).padStart(4, "0"),
    分類: PRODUCT_CATEGORIES[i],
    単価: (i + 1) * 350,
    在庫数: ((i * 7) % 40) + 5,
    発注点: 5 + (i % 5) * 5,
    仕入先: pick_(SUPPLIERS, i),
    保管場所: pick_(LOCATIONS, i),
    販売中: i % 9 !== 8,
    商品ページ: "https://example.com/items/" + (i + 1),
    メモ: i % 5 === 0 ? "人気の商品です。切らさないようにご注意ください。" : "",
  }));
  const movementIds = ids_(40);
  const movements = movementIds.map((id, i) => {
    const kind = pick_(MOVE_KINDS, i);
    return Object.assign(system_(id, 20 + i), {
      商品: productIds[i % 20],
      日付: dateAfter_(i * 2),
      区分: kind,
      数量: ((i % 12) + 1) * 5,
      担当: pick_(PEOPLE, i + 2),
      備考: movementNote_(kind, i),
    });
  });
  return { definition: definition, tables: { 商品: products, 入出庫: movements } };
}

const TEMPLATES = { 顧客管理: customers_(), 案件管理: projects_(), 在庫管理: inventory_() };

function csvOf_(header, rows) {
  return "﻿" + [header].concat(rows).map((row) => row.map(csvCell).join(",")).join("\r\n") + "\r\n";
}

function csvValue_(value) {
  if (value === null || value === undefined) return "";
  if (value === true) return "TRUE";
  if (value === false) return "FALSE";
  if (Array.isArray(value)) return value.join(", ");
  return value;
}

/** samples/<name>/ に置く CSV の中身。定義.csv とテーブルごとの CSV */
function templateCsvFiles(name) {
  const template = TEMPLATES[name];
  const files = { "定義.csv": csvOf_(template.definition[0], template.definition.slice(1)) };
  const tables = {};
  for (let i = 1; i < template.definition.length; i += 1) {
    const row = template.definition[i];
    if (!tables[row[0]]) tables[row[0]] = { name: row[0], columns: [] };
    tables[row[0]].columns.push({ name: row[1], type: row[2] });
  }
  Object.keys(tables).forEach((tableName) => {
    const header = headerFor(tables[tableName]);
    const rows = template.tables[tableName].map((record) => header.map((h) => csvValue_(record[h])));
    files[tableName + ".csv"] = csvOf_(header, rows);
  });
  return files;
}

function settingsCsv() {
  return csvOf_(SETTINGS_ROWS[0], SETTINGS_ROWS.slice(1));
}

// ===== render.js =====
/**
 * 画面の描画。state から HTML の文字列を作るだけ（DOM に触るのは main.js）。
 */

const OP_LABELS = { contains: "を含む", eq: "と等しい", ne: "と等しくない", gt: "より大きい", gte: "以上", lt: "より小さい", lte: "以下", between: "の範囲", in: "のいずれか", empty: "が空", notEmpty: "が空でない" };
const LONG_TEXT_PREVIEW = 40;
const TYPE_INPUT = { 文字: "text", メール: "email", 電話: "tel", URL: "url", 日付: "date", 日時: "datetime-local" };

function escapeHtml(value) {
  return String(value === null || value === undefined ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function attr_(value) {
  return escapeHtml(value);
}

/** 一覧・詳細に出す文字。参照は refs（{ 列名: { ID: 表示名 } }）で表示名に */
function labelFor(column, value, refs, opts) {
  if (column.type === "参照") {
    const id = value === null || value === undefined ? "" : String(value);
    if (id === "") return "";
    const map = refs && refs[column.name] ? refs[column.name] : {};
    return map[id] !== undefined ? map[id] : id;
  }
  return formatCell(column, value, opts);
}

function preview_(column, text) {
  if (column.type === "長文" && text.length > LONG_TEXT_PREVIEW) return text.slice(0, LONG_TEXT_PREVIEW) + "…";
  return text;
}

function renderTabs(tables, current) {
  return '<nav class="sa-tabs" role="tablist">' + tables.map((t) => '<button type="button" role="tab" class="sa-tab" aria-selected="' + (t.name === current ? "true" : "false") + '" data-action="select-table" data-table="' + attr_(t.name) + '">' + escapeHtml(t.name) + "</button>").join("") + "</nav>";
}

function filterText_(table, filter, refs) {
  const column = table.columns.find((c) => c.name === filter.column) || { name: filter.column, type: "文字" };
  let value = "";
  if (filter.op === "between") value = escapeHtml(filter.value[0]) + "〜" + escapeHtml(filter.value[1]);
  else if (filter.op === "in") value = filter.value.map((v) => escapeHtml(labelFor(column, v, refs, {}))).join("、");
  else if (filter.op === "empty" || filter.op === "notEmpty") value = "";
  else if (column.type === "チェック") value = filter.value === true || String(filter.value) === "true" ? "はい" : "いいえ";
  else value = escapeHtml(labelFor(column, filter.value, refs, {}));
  const label = OP_LABELS[filter.op] || filter.op;
  // empty / notEmpty の label は「が空」「が空でない」と「が」を含むので、つなぎの「が」を重ねない
  if (filter.op === "empty" || filter.op === "notEmpty") return escapeHtml(filter.column) + " " + label;
  return escapeHtml(filter.column) + " が " + (value === "" ? "" : value + " ") + label;
}

function renderFilterChips(table, filters, refs) {
  if (filters.length === 0) return "";
  return '<div class="sa-chips">' + filters.map((f, i) => '<span class="sa-chip">' + filterText_(table, f, refs) + ' <button type="button" class="sa-chip-x" data-action="remove-filter" data-index="' + i + '" aria-label="この条件を外す">×</button></span>').join("") + '<button type="button" class="sa-link" data-action="clear-filters">すべて外す</button></div>';
}

function renderFilterPanel(table) {
  const columns = table.columns.map((c) => '<option value="' + attr_(c.name) + '">' + escapeHtml(c.name) + "</option>").join("");
  const ops = Object.keys(OP_LABELS).map((op) => '<option value="' + op + '">' + escapeHtml(OP_LABELS[op]) + "</option>").join("");
  return '<form class="sa-filter-panel" data-form="filter"><label>列<select name="column">' + columns + "</select></label><label>条件<select name=\"op\">" + ops + '</select></label><label>値<input type="text" name="value" placeholder="範囲は 最小,最大。いずれかは 値1,値2"></label><button type="submit" class="sa-btn">条件を足す</button></form>';
}

function renderPager(total, page, pageSize) {
  if (total === 0) return "";
  const last = Math.max(1, Math.ceil(total / pageSize));
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const prev = page > 1 ? '<button type="button" class="sa-btn sa-btn-quiet" data-action="page" data-page="' + (page - 1) + '">前へ</button>' : "";
  const next = page < last ? '<button type="button" class="sa-btn sa-btn-quiet" data-action="page" data-page="' + (page + 1) + '">次へ</button>' : "";
  return '<div class="sa-pager"><span>' + total + " 件中 " + from + "〜" + to + " 件</span>" + prev + next + "</div>";
}

function listColumns_(table) {
  return table.columns.filter((c) => c.inList);
}

function renderTable(table, rows, refs, sort, opts) {
  const columns = listColumns_(table);
  const head = columns.map((c) => {
    const sorted = sort !== null && sort !== undefined && sort.column === c.name;
    const aria = sorted ? ' aria-sort="' + (sort.dir === "asc" ? "ascending" : "descending") + '"' : "";
    return "<th" + aria + '><button type="button" class="sa-th" data-action="sort" data-column="' + attr_(c.name) + '">' + escapeHtml(c.name) + (sorted ? (sort.dir === "asc" ? " ↑" : " ↓") : "") + "</button></th>";
  }).join("");
  const body = rows.map((row) => "<tr data-action=\"open\" data-id=\"" + attr_(row.ID) + '" tabindex="0">' + columns.map((c) => "<td>" + escapeHtml(preview_(c, labelFor(c, row[c.name], refs, opts))) + "</td>").join("") + "</tr>").join("");
  return '<div class="sa-table-wrap"><table class="sa-table"><thead><tr>' + head + "</tr></thead><tbody>" + body + "</tbody></table></div>";
}

function renderCards(table, rows, refs, opts) {
  const columns = listColumns_(table);
  const cards = rows.map((row) => {
    const title = escapeHtml(labelFor(table.columns.find((c) => c.name === table.display) || { name: "ID", type: "文字" }, row[table.display], refs, opts) || row.ID);
    const lines = columns.filter((c) => c.name !== table.display).slice(0, 3).map((c) => '<div class="sa-card-line"><span>' + escapeHtml(c.name) + "</span>" + escapeHtml(preview_(c, labelFor(c, row[c.name], refs, opts))) + "</div>").join("");
    return '<article class="sa-card" data-action="open" data-id="' + attr_(row.ID) + '" tabindex="0"><h3>' + title + "</h3>" + lines + '<div class="sa-card-line sa-muted"><span>更新</span>' + escapeHtml(row.更新日時 || "") + "</div></article>";
  }).join("");
  return '<div class="sa-cards">' + cards + "</div>";
}

function valueHtml_(column, row, refs, opts) {
  const raw = row[column.name];
  const text = labelFor(column, raw, refs, opts);
  if (text === "") return '<span class="sa-muted">（空）</span>';
  // シートに直接書かれた javascript: などを href にしない。http(s) だけリンクにし、ほかは文字のまま
  if (column.type === "URL") {
    if (!/^https?:\/\//i.test(String(raw))) return escapeHtml(text);
    return '<a href="' + attr_(raw) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(text) + "</a>";
  }
  if (column.type === "メール") return '<a href="mailto:' + attr_(raw) + '">' + escapeHtml(text) + "</a>";
  if (column.type === "電話") return '<a href="tel:' + attr_(String(raw).replace(/[^0-9+]/g, "")) + '">' + escapeHtml(text) + "</a>";
  if (column.type === "長文") return '<div class="sa-pre">' + escapeHtml(text) + "</div>";
  return escapeHtml(text);
}

/** refs は { 列名: 表示名 }（api_get の形） */
function renderDetail(table, row, refs, opts) {
  const flat = {};
  Object.keys(refs || {}).forEach((name) => {
    flat[name] = {};
    flat[name][String(row[name])] = refs[name];
  });
  const rows = table.columns.map((c) => "<dt>" + escapeHtml(c.name) + "</dt><dd>" + valueHtml_(c, row, flat, opts) + "</dd>").join("");
  const system = '<dt class="sa-muted">ID</dt><dd class="sa-muted">' + escapeHtml(row.ID) + '</dd><dt class="sa-muted">作成</dt><dd class="sa-muted">' + escapeHtml(row.作成日時 || "") + '</dd><dt class="sa-muted">更新</dt><dd class="sa-muted">' + escapeHtml(row.更新日時 || "") + " " + escapeHtml(row.更新者 || "") + "</dd>";
  const buttons = (opts.canEdit ? '<button type="button" class="sa-btn" data-action="edit">編集</button><button type="button" class="sa-btn sa-btn-danger" data-action="delete">削除</button>' : "") + (opts.ai ? '<button type="button" class="sa-btn sa-btn-quiet" data-action="ai-summary"' + (opts.summaryLoading ? " disabled" : "") + ">AI 要約</button>" : "");
  const summary = opts.summaryLoading ? '<div class="sa-summary sa-muted">要約しています…</div>' : opts.summary ? '<div class="sa-summary"><div class="sa-pre">' + escapeHtml(opts.summary) + "</div></div>" : "";
  return '<div class="sa-detail"><header class="sa-drawer-head"><h2>' + escapeHtml(labelFor(table.columns.find((c) => c.name === table.display) || { name: "ID", type: "文字" }, row[table.display], flat, opts) || row.ID) + '</h2><button type="button" class="sa-close" data-action="close" aria-label="閉じる">×</button></header><div class="sa-actions">' + buttons + "</div>" + summary + "<dl>" + rows + system + "</dl></div>";
}

function fieldHtml_(column, values, errors, options) {
  const value = values[column.name];
  const error = errors[column.name] || "";
  const id = "sa-f-" + column.name;
  const errId = "sa-err-" + column.name;
  const describe = (error ? ' aria-describedby="' + attr_(errId) + '" aria-invalid="true"' : "") ;
  let input = "";
  if (column.type === "長文") {
    input = '<textarea name="' + attr_(column.name) + '" id="' + attr_(id) + '" rows="4"' + describe + ">" + escapeHtml(value === null || value === undefined ? "" : value) + "</textarea>";
  } else if (column.type === "選択") {
    const opts = ['<option value="">（未選択）</option>'].concat(column.options.map((o) => '<option value="' + attr_(o) + '"' + (String(value) === o ? " selected" : "") + ">" + escapeHtml(o) + "</option>"));
    input = '<select name="' + attr_(column.name) + '" id="' + attr_(id) + '"' + describe + ">" + opts.join("") + "</select>";
  } else if (column.type === "複数選択") {
    const chosen = Array.isArray(value) ? value : [];
    input = '<div class="sa-checks" id="' + attr_(id) + '"' + describe + ">" + column.options.map((o) => '<label><input type="checkbox" name="' + attr_(column.name) + '" value="' + attr_(o) + '"' + (chosen.indexOf(o) >= 0 ? " checked" : "") + ">" + escapeHtml(o) + "</label>").join("") + "</div>";
  } else if (column.type === "チェック") {
    input = '<label class="sa-check"><input type="checkbox" name="' + attr_(column.name) + '" id="' + attr_(id) + '"' + (value === true ? " checked" : "") + describe + ">はい</label>";
  } else if (column.type === "参照") {
    const list = options[column.name] || [];
    const opts = ['<option value="">（未選択）</option>'].concat(list.map((o) => '<option value="' + attr_(o.id) + '"' + (String(value) === o.id ? " selected" : "") + ">" + escapeHtml(o.label) + "</option>"));
    input = '<select name="' + attr_(column.name) + '" id="' + attr_(id) + '"' + describe + ">" + opts.join("") + "</select>";
  } else if (column.type === "数値" || column.type === "金額") {
    input = '<input type="text" inputmode="' + (column.type === "金額" ? "numeric" : "decimal") + '" name="' + attr_(column.name) + '" id="' + attr_(id) + '" value="' + attr_(value === null || value === undefined ? "" : value) + '"' + describe + ">";
  } else {
    const type = TYPE_INPUT[column.type] || "text";
    const v = column.type === "日時" && value ? String(value).replace(" ", "T") : value;
    input = '<input type="' + type + '" name="' + attr_(column.name) + '" id="' + attr_(id) + '" value="' + attr_(v === null || v === undefined ? "" : v) + '"' + describe + ">";
  }
  return '<div class="sa-field' + (error ? " sa-field-error" : "") + '"><label for="' + attr_(id) + '">' + escapeHtml(column.name) + (column.required ? ' <span class="sa-required">必須</span>' : "") + "</label>" + input + (column.note ? '<div class="sa-note">' + escapeHtml(column.note) + "</div>" : "") + (error ? '<div class="sa-error" id="' + attr_(errId) + '">' + escapeHtml(error) + "</div>" : "") + "</div>";
}

/** options は { 参照の列名: [{ id, label }] } */
function renderForm(table, values, errors, options, opts) {
  const fields = table.columns.map((c) => fieldHtml_(c, values || {}, errors || {}, options || {})).join("");
  const title = opts.isNew ? table.name + " を登録" : table.name + " を編集";
  return '<form class="sa-form" data-form="record" novalidate><header class="sa-drawer-head"><h2>' + escapeHtml(title) + '</h2><button type="button" class="sa-close" data-action="close" aria-label="閉じる">×</button></header>' + fields + '<div class="sa-actions"><button type="submit" class="sa-btn sa-btn-primary">' + (opts.isNew ? "登録" : "保存") + '</button><button type="button" class="sa-btn sa-btn-quiet" data-action="close">やめる</button></div></form>';
}

function renderToolbar(state) {
  const table = currentTable(state);
  if (table === null) return "";
  const ai = state.ai ? '<div class="sa-ai"><input type="text" data-field="ai" value="' + attr_(state.aiText) + '" placeholder="言葉で絞り込む（例: 先月連絡した取引中の顧客）"><button type="button" class="sa-btn" data-action="ai-filter">AI で絞り込み</button></div>' + (state.aiExplanation ? '<div class="sa-ai-note">' + escapeHtml(state.aiExplanation) + "</div>" : "") : "";
  return '<div class="sa-toolbar"><input type="search" class="sa-search" data-field="q" value="' + attr_(state.q) + '" placeholder="検索" aria-label="検索"><button type="button" class="sa-btn sa-btn-quiet" data-action="toggle-filters" aria-expanded="' + (state.filterPanel ? "true" : "false") + '">絞り込み</button>' + (state.user.canEdit ? '<button type="button" class="sa-btn sa-btn-primary" data-action="new">新規</button>' : "") + '<button type="button" class="sa-btn sa-btn-quiet" data-action="csv">CSV</button>' + (state.loading ? '<span class="sa-spinner" aria-label="読み込み中"></span>' : "") + "</div>" + ai + (state.filterPanel ? renderFilterPanel(table) : "") + renderFilterChips(table, state.filters, state.refs);
}

function renderList(state) {
  const table = currentTable(state);
  if (table === null) return "";
  if (state.total === 0) return '<p class="sa-empty">' + (state.loading ? "読み込んでいます…" : "該当する記録はありません") + "</p>";
  const opts = { dateFormat: state.dateFormat };
  return renderTable(table, state.rows, state.refs, state.sort, opts) + renderCards(table, state.rows, state.refs, opts) + renderPager(state.total, state.page, state.pageSize);
}

function renderDrawer(state) {
  const table = currentTable(state);
  if (table === null || state.view === null) return "";
  let inner = "";
  if (state.view.kind === "detail") inner = renderDetail(table, state.view.row, state.view.refs, { dateFormat: state.dateFormat, canEdit: state.user.canEdit, ai: state.ai, summary: state.view.summary, summaryLoading: state.view.summaryLoading });
  else inner = renderForm(table, state.view.values, state.view.errors, state.view.options, { isNew: state.view.isNew, id: state.view.id });
  return '<div class="sa-backdrop" data-action="close"></div><aside class="sa-drawer" role="dialog" aria-modal="true">' + inner + "</aside>";
}

function csvBox_(state) {
  if (state.csv === null) return "";
  return '<section class="sa-csv"><header class="sa-drawer-head"><h2>CSV</h2><button type="button" class="sa-close" data-action="csv-close" aria-label="閉じる">×</button></header><p>ファイルとして保存できない環境では、下の内容をコピーして .csv として保存してください。</p><div class="sa-actions"><button type="button" class="sa-btn" data-action="copy-csv">コピー</button></div><textarea readonly rows="8">' + escapeHtml(state.csv) + "</textarea></section>";
}

function renderApp(state) {
  if (!state.ready) return '<div class="sa-shell"><p class="sa-empty">読み込んでいます…</p></div>';
  const head = '<header class="sa-head"><h1>' + escapeHtml(state.appName) + '</h1><div class="sa-user">' + escapeHtml(state.user.email || "") + (state.user.canEdit ? "" : ' <span class="sa-badge">閲覧のみ</span>') + "</div></header>";
  if (state.bootErrors.length > 0) {
    return '<div class="sa-shell">' + head + '<div class="sa-boot-errors" role="alert"><p>設定に直すところがあります。スプレッドシートの「定義」と「設定」を直してから、この画面を読み込み直してください。</p><ul>' + state.bootErrors.map((e) => "<li>" + escapeHtml(e) + "</li>").join("") + "</ul></div></div>";
  }
  const error = state.error ? '<div class="sa-alert" role="alert">' + escapeHtml(state.error) + ' <button type="button" class="sa-chip-x" data-action="dismiss-error" aria-label="閉じる">×</button></div>' : "";
  const notice = state.notice ? '<div class="sa-notice" role="status">' + escapeHtml(state.notice) + "</div>" : "";
  return '<div class="sa-shell">' + head + renderTabs(state.tables, state.current) + renderToolbar(state) + error + notice + '<main class="sa-main">' + renderList(state) + "</main>" + csvBox_(state) + renderDrawer(state) + "</div>";
}

// ===== state.js =====
/**
 * 画面の状態と、それを変える reduce。純粋（DOM にも google にも触らない）。
 */
function initialState() {
  return {
    ready: false,
    appName: "",
    tables: [],
    user: { email: "", canEdit: false },
    ai: false,
    pageSize: 50,
    dateFormat: "yyyy-MM-dd",
    today: "",
    bootErrors: [],
    current: "",
    q: "",
    filters: [],
    sort: null,
    page: 1,
    rows: [],
    total: 0,
    refs: {},
    loading: false,
    error: "",
    notice: "",
    filterPanel: false,
    aiText: "",
    aiExplanation: "",
    view: null,
    csv: null,
  };
}

function currentTable(state) {
  for (let i = 0; i < state.tables.length; i += 1) if (state.tables[i].name === state.current) return state.tables[i];
  return null;
}

function assign_(state, patch) {
  return Object.assign({}, state, patch);
}

function withView_(state, patch) {
  if (state.view === null) return state;
  return assign_(state, { view: Object.assign({}, state.view, patch) });
}

function reduce(state, action) {
  const type = action && action.type;
  if (type === "bootstrap") {
    const data = action.data || {};
    const tables = Array.isArray(data.tables) ? data.tables : [];
    return assign_(state, {
      ready: true,
      appName: data.appName || "業務アプリ",
      tables: tables,
      user: data.user || { email: "", canEdit: false },
      ai: data.ai === true,
      pageSize: data.pageSize || 50,
      dateFormat: data.dateFormat || "yyyy-MM-dd",
      today: data.today || "",
      bootErrors: Array.isArray(data.errors) ? data.errors : [],
      current: tables.length > 0 ? tables[0].name : "",
    });
  }
  if (type === "select-table") {
    if (!state.tables.some((t) => t.name === action.name)) return state;
    return assign_(state, { current: action.name, q: "", filters: [], sort: null, page: 1, rows: [], total: 0, refs: {}, view: null, filterPanel: false, aiText: "", aiExplanation: "", csv: null, error: "", notice: "" });
  }
  if (type === "set-q") return assign_(state, { q: String(action.q || ""), page: 1 });
  if (type === "add-filter") return assign_(state, { filters: state.filters.concat([action.filter]), page: 1 });
  if (type === "remove-filter") return assign_(state, { filters: state.filters.filter((f, i) => i !== action.index), page: 1 });
  if (type === "set-filters") {
    return assign_(state, {
      q: action.q === undefined ? state.q : String(action.q || ""),
      filters: Array.isArray(action.filters) ? action.filters : [],
      sort: action.sort === undefined ? state.sort : action.sort,
      page: 1,
    });
  }
  if (type === "clear-filters") return assign_(state, { q: "", filters: [], sort: null, page: 1, aiText: "", aiExplanation: "" });
  if (type === "toggle-sort") {
    let sort = { column: action.column, dir: "asc" };
    if (state.sort !== null && state.sort.column === action.column) sort = state.sort.dir === "asc" ? { column: action.column, dir: "desc" } : null;
    return assign_(state, { sort: sort, page: 1 });
  }
  if (type === "set-page") return assign_(state, { page: Math.max(1, Number(action.page) || 1) });
  if (type === "loading") return assign_(state, { loading: action.on === true });
  if (type === "rows") return assign_(state, { rows: action.rows || [], total: action.total || 0, refs: action.refs || {}, page: action.page || state.page, loading: false });
  if (type === "error") return assign_(state, { error: String(action.message || ""), loading: false });
  if (type === "notice") return assign_(state, { notice: String(action.message || "") });
  if (type === "toggle-filter-panel") return assign_(state, { filterPanel: !state.filterPanel });
  if (type === "ai-text") return assign_(state, { aiText: String(action.text || "") });
  if (type === "ai-explanation") return assign_(state, { aiExplanation: String(action.text || "") });
  if (type === "open-detail") return assign_(state, { view: { kind: "detail", id: action.row ? action.row.ID : "", row: action.row, refs: action.refs || {}, summary: "", summaryLoading: false }, error: "", notice: "" });
  if (type === "open-form") {
    return assign_(state, { view: { kind: "form", isNew: action.isNew === true, id: action.id || "", seenUpdatedAt: action.seenUpdatedAt || "", values: action.values || {}, errors: {}, options: action.options || {} }, error: "", notice: "" });
  }
  if (type === "form-errors") return withView_(state, { errors: action.errors || {} });
  if (type === "form-values") return withView_(state, { values: action.values || {} });
  if (type === "summary-loading") return withView_(state, { summaryLoading: action.on === true });
  if (type === "summary") return withView_(state, { summary: String(action.text || ""), summaryLoading: false });
  if (type === "close") return assign_(state, { view: null });
  if (type === "csv") return assign_(state, { csv: action.text === null || action.text === undefined ? null : String(action.text) });
  return state;
}

// ===== api-memory.js =====
/**
 * 見本ページ用の api。GAS に触らず、見本のテンプレをブラウザの中の配列で動かす。ページを閉じれば消える。
 */

const DEMO_EMAIL = "demo@example.com";
const DEMO_PAGE_SIZE = 20;
const DELAY_MS = 120;

function delay_(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), DELAY_MS));
}

function memoryApi(templateName) {
  const name = templateName || "顧客管理";
  const template = TEMPLATES[name];
  const tables = parseDefinition(template.definition).tables;
  const store = {};
  const lastIds = {};
  tables.forEach((t) => {
    store[t.name] = (template.tables[t.name] || []).map((r) => Object.assign({}, r));
  });

  function tableOf(tableName) {
    const table = findTable(tables, textOf(tableName));
    if (table === null) throw new Error("テーブル「" + textOf(tableName) + "」は定義にありません");
    return table;
  }

  function refsFor(table, rows) {
    const refs = {};
    table.columns.forEach((column) => {
      if (column.type !== "参照") return;
      const target = findTable(tables, column.refTable);
      const map = {};
      (store[target.name] || []).forEach((r) => {
        map[r.ID] = textOf(r[target.display]) || r.ID;
      });
      const out = {};
      rows.forEach((row) => {
        const id = textOf(row[column.name]);
        if (id !== "" && map[id] !== undefined) out[id] = map[id];
      });
      refs[column.name] = out;
    });
    return refs;
  }

  function find(table, id) {
    const rows = store[table.name];
    for (let i = 0; i < rows.length; i += 1) if (rows[i].ID === textOf(id)) return { row: rows[i], index: i };
    throw new Error("ID「" + textOf(id) + "」の記録が見つかりません。削除された可能性があります");
  }

  function checkRefs(table, values) {
    table.columns.forEach((column) => {
      if (column.type !== "参照" || !Object.prototype.hasOwnProperty.call(values, column.name)) return;
      const id = textOf(values[column.name]);
      if (id === "") return;
      const target = findTable(tables, column.refTable);
      if (!store[target.name].some((r) => r.ID === id)) throw new Error(column.name + ": 参照先の記録が見つかりません（" + id + "）");
    });
  }

  function errorText(errors) {
    return Object.keys(errors).map((k) => errors[k]).join("\n");
  }

  function wrap(fn) {
    return function () {
      try {
        return delay_(fn.apply(null, arguments));
      } catch (error) {
        return Promise.reject(error);
      }
    };
  }

  return {
    bootstrap: wrap(() => ({ appName: "見本: " + name, tables: tables, errors: [], user: { email: DEMO_EMAIL, canEdit: true }, ai: true, pageSize: DEMO_PAGE_SIZE, dateFormat: "yyyy-MM-dd", today: toDateKey(new Date()) })),
    list: wrap((tableName, rawQuery) => {
      const table = tableOf(tableName);
      const query = normalizeQuery(table, Object.assign({ pageSize: DEMO_PAGE_SIZE }, rawQuery || {}));
      const result = applyQuery(table, store[table.name], query);
      return { rows: result.rows, total: result.total, page: result.page, pageSize: result.pageSize, refs: refsFor(table, result.rows) };
    }),
    get: wrap((tableName, id) => {
      const table = tableOf(tableName);
      const found = find(table, id);
      const refs = refsFor(table, [found.row]);
      const flat = {};
      Object.keys(refs).forEach((column) => {
        const value = textOf(found.row[column]);
        if (value !== "" && refs[column][value] !== undefined) flat[column] = refs[column][value];
      });
      return { row: Object.assign({}, found.row), refs: flat };
    }),
    options: wrap((tableName, columnName) => {
      const table = tableOf(tableName);
      const column = findColumn(table, textOf(columnName));
      if (column === null || column.type !== "参照") throw new Error("列「" + textOf(columnName) + "」は参照の列ではありません");
      const target = tableOf(column.refTable);
      const rows = sortRows(target, store[target.name], { column: target.display, dir: "asc" });
      return { options: rows.map((r) => ({ id: r.ID, label: textOf(r[target.display]) || r.ID })), truncated: false };
    }),
    create: wrap((tableName, record) => {
      const table = tableOf(tableName);
      const today = toDateKey(new Date());
      const checked = validate(table, record, { today: today, isNew: true });
      if (!checked.ok) throw new Error(errorText(checked.errors));
      checkRefs(table, checked.values);
      const id = nextId(lastIds[table.name] || "", today);
      lastIds[table.name] = id;
      const stamp = formatStamp(new Date());
      store[table.name].push(Object.assign({ ID: id }, checked.values, { 作成日時: stamp, 更新日時: stamp, 更新者: DEMO_EMAIL }));
      return { id: id };
    }),
    update: wrap((tableName, id, record, seenUpdatedAt) => {
      const table = tableOf(tableName);
      const checked = validate(table, record, { today: toDateKey(new Date()), isNew: false });
      if (!checked.ok) throw new Error(errorText(checked.errors));
      checkRefs(table, checked.values);
      const found = find(table, id);
      if (textOf(found.row.更新日時) !== textOf(seenUpdatedAt)) throw new Error("ほかの方が先に更新しました。いちど閉じて、読み直してください");
      const stamp = formatStamp(new Date(Date.now() + 1000));
      store[table.name][found.index] = Object.assign({}, found.row, checked.values, { 更新日時: stamp, 更新者: DEMO_EMAIL });
      return { updatedAt: stamp };
    }),
    remove: wrap((tableName, id) => {
      const table = tableOf(tableName);
      const found = find(table, id);
      store[table.name].splice(found.index, 1);
      return { ok: true };
    }),
    exportCsv: wrap((tableName, rawQuery) => {
      const table = tableOf(tableName);
      const query = normalizeQuery(table, Object.assign({ pageSize: DEMO_PAGE_SIZE }, rawQuery || {}));
      return toCsv(table, sortRows(table, filterRows(table, store[table.name], query), query.sort));
    }),
    aiFilter: wrap((tableName, text) => {
      const table = tableOf(tableName);
      if (textOf(text) === "") throw new Error("絞り込みの言葉を入力してください");
      const column = table.columns.find((c) => c.type === "選択") || table.columns[0];
      const value = column.type === "選択" ? column.options[Math.min(1, column.options.length - 1)] : "";
      const filter = column.type === "選択" ? { column: column.name, op: "eq", value: value } : { column: column.name, op: "notEmpty", value: "" };
      return { q: "", filters: [filter], sort: null, explanation: "見本のため、決まった条件（" + column.name + " が " + (value || "空でない") + "）に絞りました。実物では入力した言葉から条件を作ります" };
    }),
    aiSummary: wrap((tableName, id) => {
      const table = tableOf(tableName);
      const found = find(table, id);
      const title = textOf(found.row[table.display]) || found.row.ID;
      const filled = table.columns.filter((c) => textOf(found.row[c.name]) !== "" && found.row[c.name] !== false).length;
      return { text: "（見本の要約）" + title + " の記録です。" + table.columns.length + " 項目のうち " + filled + " 項目が入力されています。実物では、記録の内容を AI が敬体で要約します。\n次の一手: 最終連絡日から間が空いていれば、ご連絡の予定を入れます" };
    }),
  };
}

// ===== main.js =====
/**
 * 画面の組み立て。state と api をつなぐ。DOM に触るのはこのファイルだけ。
 * mountSheetApp(root, api) → { getState, dispatch, load }
 */

const SEARCH_WAIT_MS = 300;

function mountSheetApp(root, api) {
  let state = initialState();
  let searchTimer = null;
  /** 一覧の要求番号。古い要求の答えが後から届いても捨てる */
  let requestSeq = 0;
  /** 登録・保存の送信中（二重送信を防ぐ） */
  let submitting = false;

  function paint() {
    const active = document.activeElement;
    const keep = active && root.contains(active) && active.dataset && active.dataset.field ? { field: active.dataset.field, start: active.selectionStart, end: active.selectionEnd } : null;
    root.innerHTML = renderApp(state);
    if (keep) {
      const el = root.querySelector('[data-field="' + keep.field + '"]');
      if (el) {
        el.focus();
        try {
          el.setSelectionRange(keep.start, keep.end);
        } catch (error) {
          // type=search は setSelectionRange を持たないブラウザがある
        }
      }
    }
  }

  function dispatch(action) {
    state = reduce(state, action);
    paint();
  }

  function fail(error) {
    dispatch({ type: "error", message: error && error.message ? error.message : String(error) });
  }

  function query() {
    return { q: state.q, filters: state.filters, sort: state.sort, page: state.page, pageSize: state.pageSize };
  }

  function load() {
    if (state.current === "") return Promise.resolve();
    const table = state.current;
    requestSeq += 1;
    const seq = requestSeq;
    dispatch({ type: "loading", on: true });
    return api
      .list(table, query())
      .then((result) => {
        if (seq !== requestSeq || state.current !== table) return;
        dispatch({ type: "rows", rows: result.rows, total: result.total, refs: result.refs, page: result.page });
      })
      .catch((error) => {
        if (seq !== requestSeq) return;
        fail(error);
      });
  }

  function openDetail(id) {
    api.get(state.current, id).then((result) => dispatch({ type: "open-detail", row: result.row, refs: result.refs })).catch(fail);
  }

  /** 参照の列の候補をまとめて取る */
  function optionsFor(table) {
    const refColumns = table.columns.filter((c) => c.type === "参照");
    return Promise.all(refColumns.map((c) => api.options(table.name, c.name))).then((results) => {
      const options = {};
      refColumns.forEach((c, i) => {
        options[c.name] = results[i].options;
      });
      return options;
    });
  }

  function openForm(isNew, row) {
    const table = currentTable(state);
    optionsFor(table)
      .then((options) => {
        const values = isNew ? validate(table, {}, { today: state.today, isNew: true }).values : Object.assign({}, row);
        dispatch({ type: "open-form", isNew: isNew, id: isNew ? "" : row.ID, seenUpdatedAt: isNew ? "" : row.更新日時, values: values, options: options });
        const first = root.querySelector(".sa-form input, .sa-form select, .sa-form textarea");
        if (first) first.focus();
      })
      .catch(fail);
  }

  /** フォームの欄を { 列名: 値 } に */
  function collect(form, table) {
    const record = {};
    table.columns.forEach((column) => {
      if (column.type === "複数選択") {
        record[column.name] = Array.prototype.map.call(form.querySelectorAll('input[name="' + column.name + '"]:checked'), (el) => el.value);
      } else if (column.type === "チェック") {
        const el = form.querySelector('input[name="' + column.name + '"]');
        record[column.name] = !!(el && el.checked);
      } else {
        const el = form.elements.namedItem(column.name);
        let value = el ? el.value : "";
        if (column.type === "日時") value = String(value).replace("T", " ");
        record[column.name] = value;
      }
    });
    return record;
  }

  function submitRecord(form) {
    if (submitting) return;
    const table = currentTable(state);
    const view = state.view;
    const record = collect(form, table);
    const checked = validate(table, record, { today: state.today, isNew: view.isNew });
    if (!checked.ok) {
      state = reduce(state, { type: "form-values", values: record });
      dispatch({ type: "form-errors", errors: checked.errors });
      const bad = root.querySelector(".sa-field-error input, .sa-field-error select, .sa-field-error textarea");
      if (bad) bad.focus();
      return;
    }
    submitting = true;
    const button = form.querySelector('button[type="submit"]');
    if (button) button.disabled = true;
    const request = view.isNew ? api.create(table.name, checked.values) : api.update(table.name, view.id, checked.values, view.seenUpdatedAt);
    request
      .then(() => {
        submitting = false;
        dispatch({ type: "close" });
        dispatch({ type: "notice", message: view.isNew ? "登録しました" : "保存しました" });
        return load();
      })
      .catch((error) => {
        submitting = false;
        state = reduce(state, { type: "form-values", values: record });
        fail(error);
      });
  }

  function remove() {
    const view = state.view;
    if (!view || view.kind !== "detail") return;
    if (!window.confirm("この 1 件を削除します。よろしいですか？\n削除した行は _ごみ箱 シートに残ります")) return;
    api
      .remove(state.current, view.id)
      .then(() => {
        dispatch({ type: "close" });
        dispatch({ type: "notice", message: "削除しました" });
        return load();
      })
      .catch(fail);
  }

  function tryDownload(text, filename) {
    try {
      const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      // サンドボックスで止まる環境では、画面の CSV の箱からコピーしてもらう
    }
  }

  function exportCsv() {
    api
      .exportCsv(state.current, query())
      .then((text) => {
        dispatch({ type: "csv", text: text });
        tryDownload(text, state.current + ".csv");
      })
      .catch(fail);
  }

  function copyCsv() {
    const text = state.csv || "";
    const fallback = () => {
      const area = root.querySelector(".sa-csv textarea");
      if (area) {
        area.select();
        document.execCommand("copy");
        dispatch({ type: "notice", message: "コピーしました" });
      }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => dispatch({ type: "notice", message: "コピーしました" })).catch(fallback);
    } else fallback();
  }

  function aiFilter() {
    const text = state.aiText.trim();
    if (text === "") return;
    dispatch({ type: "loading", on: true });
    api
      .aiFilter(state.current, text)
      .then((answer) => {
        dispatch({ type: "set-filters", q: answer.q, filters: answer.filters, sort: answer.sort });
        dispatch({ type: "ai-explanation", text: answer.explanation });
        return load();
      })
      .catch(fail);
  }

  function aiSummary() {
    const view = state.view;
    if (!view || view.kind !== "detail") return;
    dispatch({ type: "summary-loading", on: true });
    api
      .aiSummary(state.current, view.id)
      .then((result) => dispatch({ type: "summary", text: result.text }))
      .catch((error) => {
        dispatch({ type: "summary-loading", on: false });
        fail(error);
      });
  }

  function addFilter(form) {
    const table = currentTable(state);
    const column = form.elements.namedItem("column").value;
    const op = form.elements.namedItem("op").value;
    const raw = String(form.elements.namedItem("value").value || "").trim();
    let value = raw;
    if (op === "between") value = raw.split(/[,、]/).map((s) => s.trim()).slice(0, 2);
    else if (op === "in") value = raw.split(/[,、]/).map((s) => s.trim()).filter((s) => s !== "");
    else if (op === "empty" || op === "notEmpty") value = "";
    const normalized = normalizeQuery(table, { filters: [{ column: column, op: op, value: value }] });
    if (normalized.filters.length === 0) {
      dispatch({ type: "error", message: "条件を読み取れませんでした。値をご確認ください（範囲は 最小,最大 の形）" });
      return;
    }
    dispatch({ type: "add-filter", filter: normalized.filters[0] });
    load();
  }

  root.addEventListener("click", (event) => {
    const el = event.target.closest("[data-action]");
    if (!el || !root.contains(el)) return;
    const action = el.dataset.action;
    if (action === "select-table") {
      clearTimeout(searchTimer);
      dispatch({ type: "select-table", name: el.dataset.table });
      load();
    } else if (action === "toggle-filters") dispatch({ type: "toggle-filter-panel" });
    else if (action === "remove-filter") {
      dispatch({ type: "remove-filter", index: Number(el.dataset.index) });
      load();
    } else if (action === "clear-filters") {
      dispatch({ type: "clear-filters" });
      load();
    } else if (action === "sort") {
      dispatch({ type: "toggle-sort", column: el.dataset.column });
      load();
    } else if (action === "page") {
      dispatch({ type: "set-page", page: Number(el.dataset.page) });
      load();
    } else if (action === "open") openDetail(el.dataset.id);
    else if (action === "new") openForm(true, null);
    else if (action === "edit") openForm(false, state.view.row);
    else if (action === "delete") remove();
    else if (action === "close") dispatch({ type: "close" });
    else if (action === "csv") exportCsv();
    else if (action === "csv-close") dispatch({ type: "csv", text: null });
    else if (action === "copy-csv") copyCsv();
    else if (action === "ai-filter") aiFilter();
    else if (action === "ai-summary") aiSummary();
    else if (action === "dismiss-error") dispatch({ type: "error", message: "" });
  });

  root.addEventListener("keydown", (event) => {
    const target = event.target;
    if (event.key === "Enter" && target.dataset && target.dataset.field === "ai") {
      event.preventDefault();
      state = reduce(state, { type: "ai-text", text: target.value });
      aiFilter();
    } else if (event.key === "Enter" && target.dataset && target.dataset.action === "open") {
      openDetail(target.dataset.id);
    } else if (event.key === "Escape" && state.view !== null) {
      dispatch({ type: "close" });
    }
  });

  root.addEventListener("input", (event) => {
    const target = event.target;
    const field = target.dataset ? target.dataset.field : "";
    if (field === "q") {
      const value = target.value;
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        dispatch({ type: "set-q", q: value });
        load();
      }, SEARCH_WAIT_MS);
    } else if (field === "ai") {
      state = reduce(state, { type: "ai-text", text: target.value });
    }
  });

  root.addEventListener("submit", (event) => {
    const form = event.target;
    if (form.dataset.form === "record") {
      event.preventDefault();
      submitRecord(form);
    } else if (form.dataset.form === "filter") {
      event.preventDefault();
      addFilter(form);
    }
  });

  paint();
  api
    .bootstrap()
    .then((data) => {
      dispatch({ type: "bootstrap", data: data });
      return load();
    })
    .catch(fail);

  return { getState: () => state, dispatch: dispatch, load: load };
}

window.SheetApp = { mount: function (root) { return mountSheetApp(root, memoryApi()); } };
