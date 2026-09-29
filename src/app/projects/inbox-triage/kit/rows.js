// このファイルは「AI 問い合わせ整理キット」の src/ からの写しです（中身は書き換えていません）。
// 直すときはキットの側を直してから、scripts/sync-gas-kits.mjs を走らせてください。
/**
 * 「問い合わせ」シートの見出し（18 列）と 1 行。
 * 見出しは名前で探すので、買い手が列を並べ替えていても正しい場所に書く。無い標準の列は末尾に足す。
 * メールと Claude から来た字は safeCell_ を通す（数式として動いたり、数や日付に読み替えられたりしないように）。
 */

export const HEADERS = [
  "受信日時",
  "受付番号",
  "分類",
  "緊急度",
  "要約",
  "求められていること",
  "期限",
  "差出人名",
  "会社",
  "電話",
  "メールアドレス",
  "件名",
  "添付",
  "状態",
  "担当",
  "AI の自信",
  "メモ",
  "スレッド",
];

export const STATUS_NEW = "未対応";

function cellText_(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

/**
 * Sheets は書いた文字を、人が打ち込んだときと同じように読み替える（数式・数・日付・割合・TRUE/FALSE）。
 * そう読まれうる字は先頭に ' を付けて文字のまま残す（' はセルに出ない。先頭の 0 も消えない）。
 */
function safeCell_(value) {
  const text = value === undefined || value === null ? "" : String(value);
  if (/^[=+\-@\t\r']/.test(text)) return "'" + text;
  const trimmed = text.trim();
  if (/^(true|false)$/i.test(trimmed)) return "'" + text;
  // 数字を含み、数字と区切り（. , / : - 空白 % ¥ $ 年月日時分秒 午前午後 AM PM e）だけでできている字は、数か日付か時刻に読まれうる
  if (/\d/.test(trimmed) && /^[\d\s.,\/:%¥$年月日時分秒午前後eE-]+$|^[\d\s.,\/:]+\s*(am|pm)$/i.test(trimmed)) return "'" + text;
  return text;
}

export function buildHeader() {
  return HEADERS.slice();
}

/** 見出しの名前 → その列に入れる値 */
function valueOf_(name, entry) {
  const a = entry.answer;
  const i = entry.input;
  switch (name) {
    case "受信日時":
      return entry.stamp;
    case "受付番号":
      return safeCell_(entry.receipt);
    case "分類":
      return safeCell_(a.category);
    case "緊急度":
      return a.urgency;
    case "要約":
      return safeCell_(a.summary);
    case "求められていること":
      return safeCell_(a.request);
    case "期限":
      return a.deadline === null ? "" : a.deadline;
    case "差出人名":
      return safeCell_(a.person.name === null ? i.from.name : a.person.name);
    case "会社":
      return safeCell_(a.person.company === null ? "" : a.person.company);
    case "電話":
      return safeCell_(a.person.phone === null ? "" : a.person.phone);
    case "メールアドレス":
      return safeCell_(i.from.address);
    case "件名":
      return safeCell_(i.subject);
    case "添付":
      return safeCell_(i.attachments.join(", "));
    case "状態":
      return STATUS_NEW;
    case "担当":
      return "";
    case "AI の自信":
      return Math.round(a.confidence * 100) + "%";
    case "メモ":
      return safeCell_(a.notes);
    case "スレッド":
      return entry.link;
    default:
      return "";
  }
}

/**
 * 既にある見出しに合わせて 1 行を作る。
 * 返り値 { header, row, added }。header は足した見出しまで入った最終形で、そのままシートに書ける。
 */
export function buildRow(header, entry) {
  const names = [];
  const source = Array.isArray(header) ? header : [];
  for (let i = 0; i < source.length; i += 1) names.push(cellText_(source[i]));
  const added = [];
  for (let i = 0; i < HEADERS.length; i += 1) {
    if (names.indexOf(HEADERS[i]) < 0) {
      names.push(HEADERS[i]);
      added.push(HEADERS[i]);
    }
  }
  const row = [];
  for (let i = 0; i < names.length; i += 1) row.push(valueOf_(names[i], entry));
  return { header: names, row: row, added: added };
}
