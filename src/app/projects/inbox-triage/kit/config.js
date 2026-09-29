// このファイルは「AI 問い合わせ整理キット」の src/ からの写しです（中身は書き換えていません）。
// 直すときはキットの側を直してから、scripts/sync-gas-kits.mjs を走らせてください。
/**
 * 「設定」シート（「項目」「値」の 2 列）を読んで、検証済みの設定にする。
 * 行が無ければ既定値、知らない行は無視する（買い手がメモ行を足しても壊れない）。
 * 「通知先」「検索条件」「除外する差出人」は、空欄にするとその働きを止める（S3 と同じ考え）。
 */

export class ConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = "ConfigError";
  }
}

/** 設定シートに並べるキー。README.ja.md の表と samples/settings-sample.csv はこの並びと一致させる */
export const CONFIG_KEYS = [
  "会社名",
  "担当者名",
  "署名",
  "営業時間",
  "返信の方針",
  "分類",
  "下書きを作らない分類",
  "下書きを作る",
  "検索条件",
  "除外する差出人",
  "1 回に読む数",
  "1 日の上限",
  "本文の上限文字数",
  "モデル",
  "間隔（分）",
  "通知先",
  "Slack Webhook URL",
  "Discord Webhook URL",
  "LINE チャネルアクセストークン",
  "LINE 送信先 ID",
  "通知の文面",
  "エラー通知",
];

export const DEFAULT_CATEGORIES = ["見積もり依頼", "質問", "クレーム", "予約や日程", "請求や支払い", "営業や勧誘", "採用", "その他"];

/** 既定の分類ごとの目安。system に入れて、分け方をそろえる */
export const CATEGORY_HINTS = {
  "見積もり依頼": "料金・見積もり・費用の問い合わせ。数量や条件が書かれていることが多い",
  "質問": "サービスや商品、営業時間、対応範囲についての質問",
  "クレーム": "不満・苦情・トラブルの申し出。怒りや失望の言葉があるもの",
  "予約や日程": "予約・訪問・打ち合わせの日程の相談や変更",
  "請求や支払い": "請求書・入金・支払い方法・領収書についての連絡",
  "営業や勧誘": "こちらへの売り込み・広告・提携の打診",
  "採用": "求人への応募や、採用についての問い合わせ",
  "その他": "上のどれにも当てはまらないもの",
};

export const INTERVALS = [5, 10, 15, 30, 60];

export const DEFAULT_CONFIG = {
  companyName: "",
  personName: "",
  signature: "",
  businessHours: "平日 10:00〜18:00",
  policy: "",
  categories: DEFAULT_CATEGORIES.slice(),
  noDraftCategories: ["営業や勧誘"],
  makeDrafts: true,
  query: "in:inbox -from:me -label:AI整理済 -label:AI整理対象外 newer_than:7d",
  excludedSenders: ["noreply@", "no-reply@", "mailer-daemon@", "newsletter@"],
  perRun: 20,
  perDay: 200,
  bodyLimit: 4000,
  model: "claude-opus-5",
  intervalMinutes: 15,
  targets: ["slack"],
  slackWebhookUrl: "",
  discordWebhookUrl: "",
  lineToken: "",
  lineTo: "",
  notifyTemplate: "新しい問い合わせ {件数} 件\n{一覧}",
  errorNotify: true,
};

const TARGETS = ["slack", "discord", "line"];
const OTHER = "その他";
/** 分類 1 つの長さの上限（`AI_` を付けて Gmail のラベル名にするので、短いほうが扱いやすい） */
const CATEGORY_LIMIT = 50;

/** 半角括弧・空白・大文字小文字の揺れを吸収して、キーを突き合わせられる形にする */
function normalizeKey_(key) {
  return String(key)
    .replace(/[(]/g, "（")
    .replace(/[)]/g, "）")
    .replace(/\s+/g, "")
    .toLowerCase();
}

/** カンマ（半角・全角）で区切って、空の要素と重複を落とす */
function splitList_(text) {
  const out = [];
  const parts = String(text).split(/[,、]/);
  for (let i = 0; i < parts.length; i += 1) {
    const part = parts[i].trim();
    if (part !== "" && out.indexOf(part) < 0) out.push(part);
  }
  return out;
}

function parseBoolean_(value, fallback, label) {
  if (typeof value === "boolean") return value;
  const text = String(value).trim().toLowerCase();
  if (text === "") return fallback;
  if (["true", "yes", "1", "はい", "する", "作る", "○", "on"].indexOf(text) >= 0) return true;
  if (["false", "no", "0", "いいえ", "しない", "作らない", "×", "off"].indexOf(text) >= 0) return false;
  throw new ConfigError("「" + label + "」は TRUE か FALSE で書いてください: " + String(value));
}

function parseInteger_(value, fallback, label, min, max) {
  if (value === undefined) return fallback;
  const text = String(value).trim();
  if (text === "") return fallback;
  const number = Number(text);
  if (!Number.isInteger(number) || number < min || number > max) {
    throw new ConfigError("「" + label + "」は " + min + "〜" + max + " の整数で書いてください: " + text);
  }
  return number;
}

/** 通知先に書いた宛先の設定が空なら、どの行を直せばよいかを言って止める */
function requireFor_(targets, target, value, label) {
  if (targets.indexOf(target) < 0) return;
  if (String(value).trim() !== "") return;
  throw new ConfigError("「通知先」に " + target + " がありますが、「" + label + "」が空です。設定シートのその行を埋めてください。");
}

/** 分類はそのまま Gmail のラベル名（`AI_` + 分類）になるので、ラベルとして困る字と長さを入口で弾く */
function checkCategories_(categories) {
  for (let i = 0; i < categories.length; i += 1) {
    const name = categories[i];
    if (name.indexOf("/") >= 0) {
      throw new ConfigError("「分類」に / は使えません（Gmail のラベルが入れ子になります）: " + name);
    }
    if (name.length > CATEGORY_LIMIT) {
      throw new ConfigError("「分類」は 1 つ " + CATEGORY_LIMIT + " 字までにしてください: " + name);
    }
  }
}

/** URL は人に見せない鍵なので、エラーの文には出さない */
function requireHttps_(targets, target, value, label) {
  if (targets.indexOf(target) < 0) return;
  if (value === "") return;
  if (String(value).indexOf("https://") === 0) return;
  throw new ConfigError("「" + label + "」は https:// で始まる URL です。設定シートのその行を確かめてください。");
}

/** rows: [[項目, 値], ...]（見出し行が混ざっていてもよい） */
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

  /** 行が無いか空欄なら既定値 */
  function textOf(key, fallback) {
    const value = rawOf(key);
    if (value === undefined) return fallback;
    const trimmed = String(value).trim();
    return trimmed === "" ? fallback : trimmed;
  }

  /** 行が無ければ既定値、空欄なら [] （= その働きを使わない） */
  function listOrOff(key, fallback) {
    const value = rawOf(key);
    if (value === undefined) return fallback.slice();
    if (String(value).trim() === "") return [];
    return splitList_(value);
  }

  function booleanOf(key, fallback) {
    const value = rawOf(key);
    return value === undefined ? fallback : parseBoolean_(value, fallback, key);
  }

  const companyName = textOf("会社名", "");
  if (companyName === "") throw new ConfigError("「会社名」が空です。設定シートの「会社名」の行に会社名を書いてください。");

  const categories = listOrOff("分類", DEFAULT_CATEGORIES);
  if (categories.length === 0) categories.push.apply(categories, DEFAULT_CATEGORIES);
  if (categories.indexOf(OTHER) < 0) categories.push(OTHER);
  checkCategories_(categories);

  const noDraftWanted = listOrOff("下書きを作らない分類", DEFAULT_CONFIG.noDraftCategories);
  const noDraftCategories = [];
  for (let i = 0; i < noDraftWanted.length; i += 1) {
    if (categories.indexOf(noDraftWanted[i]) >= 0) noDraftCategories.push(noDraftWanted[i]);
  }

  const targets = [];
  const wanted = listOrOff("通知先", DEFAULT_CONFIG.targets);
  for (let i = 0; i < wanted.length; i += 1) {
    const name = String(wanted[i]).trim().toLowerCase();
    if (TARGETS.indexOf(name) < 0) throw new ConfigError("「通知先」に書けるのは slack / discord / line です: " + wanted[i]);
    if (targets.indexOf(name) < 0) targets.push(name);
  }
  const slackWebhookUrl = textOf("Slack Webhook URL", "");
  const discordWebhookUrl = textOf("Discord Webhook URL", "");
  const lineToken = textOf("LINE チャネルアクセストークン", "");
  const lineTo = textOf("LINE 送信先 ID", "");
  requireFor_(targets, "slack", slackWebhookUrl, "Slack Webhook URL");
  requireFor_(targets, "discord", discordWebhookUrl, "Discord Webhook URL");
  requireFor_(targets, "line", lineToken, "LINE チャネルアクセストークン");
  requireFor_(targets, "line", lineTo, "LINE 送信先 ID");
  requireHttps_(targets, "slack", slackWebhookUrl, "Slack Webhook URL");
  requireHttps_(targets, "discord", discordWebhookUrl, "Discord Webhook URL");

  const intervalMinutes = parseInteger_(rawOf("間隔（分）"), DEFAULT_CONFIG.intervalMinutes, "間隔（分）", 1, 60);
  if (INTERVALS.indexOf(intervalMinutes) < 0) {
    throw new ConfigError("「間隔（分）」は " + INTERVALS.join(" / ") + " のどれかにしてください: " + intervalMinutes);
  }

  const model = textOf("モデル", DEFAULT_CONFIG.model);
  if (model.indexOf("claude-") !== 0) throw new ConfigError("「モデル」は claude- で始まる名前です: " + model);

  return {
    companyName: companyName,
    personName: textOf("担当者名", ""),
    signature: textOf("署名", ""),
    businessHours: textOf("営業時間", DEFAULT_CONFIG.businessHours),
    policy: textOf("返信の方針", ""),
    categories: categories,
    noDraftCategories: noDraftCategories,
    makeDrafts: booleanOf("下書きを作る", DEFAULT_CONFIG.makeDrafts),
    query: textOf("検索条件", DEFAULT_CONFIG.query),
    excludedSenders: listOrOff("除外する差出人", DEFAULT_CONFIG.excludedSenders),
    perRun: parseInteger_(rawOf("1 回に読む数"), DEFAULT_CONFIG.perRun, "1 回に読む数", 1, 100),
    perDay: parseInteger_(rawOf("1 日の上限"), DEFAULT_CONFIG.perDay, "1 日の上限", 1, 5000),
    bodyLimit: parseInteger_(rawOf("本文の上限文字数"), DEFAULT_CONFIG.bodyLimit, "本文の上限文字数", 500, 20000),
    model: model,
    intervalMinutes: intervalMinutes,
    targets: targets,
    slackWebhookUrl: slackWebhookUrl,
    discordWebhookUrl: discordWebhookUrl,
    lineToken: lineToken,
    lineTo: lineTo,
    notifyTemplate: textOf("通知の文面", DEFAULT_CONFIG.notifyTemplate),
    errorNotify: booleanOf("エラー通知", DEFAULT_CONFIG.errorNotify),
  };
}
