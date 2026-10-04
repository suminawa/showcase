// このファイルは「期限アラート GAS キット」の src/ からの写しです（中身は書き換えていません）。
// 直すときはキットの側を直してから、scripts/sync-gas-kits.mjs を走らせてください。
/**
 * 「設定」シート（キーと値の 2 列）を読んで、検証済みの設定にする。
 * 空欄は既定値に戻し、知らないキーは無視する（買い手がメモ行を足しても壊れない）。
 */

export class ConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = "ConfigError";
  }
}

/** 設定シートに並べるキー。README.ja.md と samples/settings-sample.csv はこの並びと一致させる */
export const CONFIG_KEYS = [
  "通知先",
  "Webhook URL",
  "しきい値",
  "超過も通知する",
  "文面テンプレ",
  "対象シート名",
  "列名（件名）",
  "列名（期限）",
  "列名（担当）",
  "列名（状態）",
  "完了とみなす状態の値",
];

export const DEFAULT_CONFIG = {
  target: "slack",
  webhookUrl: "",
  /** 既定は「当日」と「3 日前」。設定シートには 3,0 と書く */
  thresholds: [0, 3],
  notifyOverdue: true,
  itemTemplate: "・{件名}（{期限}・{担当}）",
  sheetName: "期限",
  columns: { subject: "件名", due: "期限", assignee: "担当", status: "状態" },
  doneValues: ["完了"],
};

const TARGETS = ["slack", "discord"];

/** 半角括弧・空白・大文字小文字の揺れを吸収して、キーを突き合わせられる形にする */
function normalizeKey_(key) {
  return String(key)
    .replace(/[(]/g, "（")
    .replace(/[)]/g, "）")
    .replace(/\s+/g, "")
    .toLowerCase();
}

/** 設定シートの項目名を parseConfig と同じそろえ方にする（初期化と「設定を確かめる」の突き合わせに使う） */
export function configKeyOf(key) {
  return normalizeKey_(key);
}

/**
 * 初期化で足す設定の行（CONFIG_KEYS の順に [項目, 値]）。行が無いときと同じ働きになる既定値を書く。
 * Webhook URL だけは空。samples/settings-sample.csv とは Webhook URL 以外が同じ（docs テストが見る）。
 */
export const DEFAULT_ROWS = [
  ["通知先", "slack"],
  ["Webhook URL", ""],
  ["しきい値", "3,0"],
  ["超過も通知する", "TRUE"],
  ["文面テンプレ", "・{件名}（{期限}・{担当}）"],
  ["対象シート名", "期限"],
  ["列名（件名）", "件名"],
  ["列名（期限）", "期限"],
  ["列名（担当）", "担当"],
  ["列名（状態）", "状態"],
  ["完了とみなす状態の値", "完了"],
];

/** カンマ（半角・全角）で区切って、空の要素を落とす */
function splitList_(text) {
  return String(text)
    .split(/[,、]/)
    .map(function (part) {
      return part.trim();
    })
    .filter(function (part) {
      return part !== "";
    });
}

function parseBoolean_(value, fallback) {
  if (typeof value === "boolean") return value;
  const text = String(value).trim().toLowerCase();
  if (text === "") return fallback;
  if (["true", "yes", "1", "はい", "する", "○"].indexOf(text) >= 0) return true;
  if (["false", "no", "0", "いいえ", "しない", "×"].indexOf(text) >= 0) return false;
  throw new ConfigError("「超過も通知する」は TRUE か FALSE で書いてください: " + String(value));
}

/** 全角数字（０〜９）を半角に直す。IME の全角入力を許すため */
function toHalfWidthDigits_(text) {
  return String(text).replace(/[０-９]/g, function (ch) {
    return String.fromCharCode(ch.charCodeAt(0) - 0xfee0);
  });
}

function parseThresholds_(value) {
  const parts = splitList_(value);
  if (parts.length === 0) throw new ConfigError("「しきい値」が空です。例: 3,0");
  const days = [];
  for (let i = 0; i < parts.length; i += 1) {
    const part = toHalfWidthDigits_(parts[i]);
    if (!/^\d+$/.test(part)) {
      throw new ConfigError("「しきい値」は 0 以上の整数をカンマで並べてください: " + parts[i]);
    }
    const day = Number(part);
    if (days.indexOf(day) < 0) days.push(day);
  }
  return days.sort(function (a, b) {
    return a - b;
  });
}

/** rows: [[キー, 値], ...]（ヘッダー行が混ざっていてもよい） */
export function parseConfig(rows) {
  const raw = {};
  const source = Array.isArray(rows) ? rows : [];
  for (let i = 0; i < source.length; i += 1) {
    const row = source[i];
    if (!Array.isArray(row) || row.length === 0) continue;
    const key = normalizeKey_(row[0]);
    if (key === "") continue;
    raw[key] = row[1] === null || row[1] === undefined ? "" : row[1];
  }

  function rawOf(key) {
    const normalized = normalizeKey_(key);
    return Object.prototype.hasOwnProperty.call(raw, normalized) ? raw[normalized] : undefined;
  }

  function textOf(key, fallback) {
    const value = rawOf(key);
    if (value === undefined) return fallback;
    const trimmed = String(value).trim();
    return trimmed === "" ? fallback : trimmed;
  }

  function listOf(key, fallback) {
    const value = rawOf(key);
    if (value === undefined || String(value).trim() === "") return fallback.slice();
    return splitList_(value);
  }

  const target = textOf("通知先", DEFAULT_CONFIG.target).toLowerCase();
  if (TARGETS.indexOf(target) < 0) {
    throw new ConfigError("「通知先」は slack か discord です: " + target);
  }

  const webhookUrl = textOf("Webhook URL", "");
  if (webhookUrl === "") {
    throw new ConfigError("「Webhook URL」が空です。README の手順 2 を見てください。");
  }
  if (webhookUrl.indexOf("https://") !== 0) {
    throw new ConfigError("「Webhook URL」は https:// で始まる URL です: " + webhookUrl);
  }

  const rawThresholds = rawOf("しきい値");
  const thresholds =
    rawThresholds === undefined || String(rawThresholds).trim() === ""
      ? DEFAULT_CONFIG.thresholds.slice()
      : parseThresholds_(rawThresholds);

  const rawOverdue = rawOf("超過も通知する");
  const notifyOverdue =
    rawOverdue === undefined ? DEFAULT_CONFIG.notifyOverdue : parseBoolean_(rawOverdue, DEFAULT_CONFIG.notifyOverdue);

  return {
    target: target,
    webhookUrl: webhookUrl,
    thresholds: thresholds,
    notifyOverdue: notifyOverdue,
    itemTemplate: textOf("文面テンプレ", DEFAULT_CONFIG.itemTemplate),
    sheetName: textOf("対象シート名", DEFAULT_CONFIG.sheetName),
    columns: {
      subject: textOf("列名（件名）", DEFAULT_CONFIG.columns.subject),
      due: textOf("列名（期限）", DEFAULT_CONFIG.columns.due),
      assignee: textOf("列名（担当）", DEFAULT_CONFIG.columns.assignee),
      status: textOf("列名（状態）", DEFAULT_CONFIG.columns.status),
    },
    doneValues: listOf("完了とみなす状態の値", DEFAULT_CONFIG.doneValues),
  };
}
