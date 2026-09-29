// このファイルは「フォーム受付 GAS キット」の src/ からの写しです（中身は書き換えていません）。
// 直すときはキットの側を直してから、scripts/sync-gas-kits.mjs を走らせてください。
/**
 * 「設定」シート（「項目」「値」の 2 列）を読んで、検証済みの設定にする。
 * 行が無ければ既定値に戻し、知らない行は無視する（買い手がメモ行を足しても壊れない）。
 * ただし働きを止められる 8 つは、値を空にするとその働きを止める。
 */

export class ConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = "ConfigError";
  }
}

/** 設定シートに並べるキー。README.ja.md の表と samples/settings-sample.csv はこの並びと一致させる */
export const CONFIG_KEYS = [
  "通知先",
  "Slack Webhook URL",
  "Discord Webhook URL",
  "LINE チャネルアクセストークン",
  "LINE 送信先 ID",
  "通知の文面",
  "必須項目",
  "項目の並び",
  "メールの項目名",
  "自動返信",
  "自動返信の件名",
  "自動返信の本文",
  "差出人名",
  "返信先",
  "受付シート名",
  "枠シート名",
  "日付の項目名",
  "時間帯の項目名",
  "ハニーポットの項目名",
  "送信元の項目名",
];

/** 自動返信の本文の見本。{受付番号} と {項目一覧} が使える */
export const DEFAULT_REPLY_BODY = [
  "お問い合わせいただきありがとうございます。",
  "次の内容で受け付けました。あらためてご連絡します。",
  "",
  "受付番号: {受付番号}",
  "",
  "{項目一覧}",
  "",
  "※ このメールは自動でお送りしています。",
].join("\n");

export const DEFAULT_CONFIG = {
  targets: ["slack"],
  slackWebhookUrl: "",
  discordWebhookUrl: "",
  lineToken: "",
  lineTo: "",
  notifyTemplate: "【受付】{受付番号}\n{項目一覧}",
  requiredFields: ["email"],
  fieldOrder: ["name", "email", "message"],
  emailField: "email",
  autoReply: true,
  replySubject: "お問い合わせを受け付けました（受付番号 {受付番号}）",
  replyBody: DEFAULT_REPLY_BODY,
  senderName: "",
  replyTo: "",
  intakeSheetName: "受付",
  slotSheetName: "枠",
  dateField: "date",
  slotField: "slot",
  honeypotField: "homepage",
  pageField: "page",
};

/**
 * 初期化で足す設定の行（CONFIG_KEYS の順に [項目, 値]）。行が無いときと同じ働きになる既定値を書く。
 * 空で書くと働きを止める 8 つがあるので、空にするのは URL・トークン・差出人名・返信先だけ。
 * samples/settings-sample.csv とは Slack Webhook URL 以外が同じ（docs テストが見る）。
 */
export const DEFAULT_ROWS = [
  ["通知先", "slack"],
  ["Slack Webhook URL", ""],
  ["Discord Webhook URL", ""],
  ["LINE チャネルアクセストークン", ""],
  ["LINE 送信先 ID", ""],
  ["通知の文面", DEFAULT_CONFIG.notifyTemplate],
  ["必須項目", "email"],
  ["項目の並び", "name,email,message"],
  ["メールの項目名", "email"],
  ["自動返信", "TRUE"],
  ["自動返信の件名", DEFAULT_CONFIG.replySubject],
  ["自動返信の本文", DEFAULT_REPLY_BODY],
  ["差出人名", ""],
  ["返信先", ""],
  ["受付シート名", "受付"],
  ["枠シート名", "枠"],
  ["日付の項目名", "date"],
  ["時間帯の項目名", "slot"],
  ["ハニーポットの項目名", "homepage"],
  ["送信元の項目名", "page"],
];

const TARGETS = ["slack", "discord", "line"];

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

function parseBoolean_(value, fallback, label) {
  if (typeof value === "boolean") return value;
  const text = String(value).trim().toLowerCase();
  if (text === "") return fallback;
  if (["true", "yes", "1", "はい", "する", "○"].indexOf(text) >= 0) return true;
  if (["false", "no", "0", "いいえ", "しない", "×"].indexOf(text) >= 0) return false;
  throw new ConfigError("「" + label + "」は TRUE か FALSE で書いてください: " + String(value));
}

/** 通知先に書いた宛先の設定が空なら、どの行を直せばよいかを言って止める */
function requireFor_(targets, target, value, label) {
  if (targets.indexOf(target) < 0) return;
  if (String(value).trim() !== "") return;
  throw new ConfigError(
    "「通知先」に " + target + " がありますが、「" + label + "」が空です。設定シートのその行を埋めてください。",
  );
}

/**
 * 通知先に書いた宛先の URL だけを確かめる。使わない宛先の行は、メモ書きのままでも止めない。
 * URL は人に見せない鍵なので、エラーの文には出さない。
 */
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

  /** 行が無ければ既定値、空欄なら "" （= その働きを使わない） */
  function textOrOff(key, fallback) {
    const value = rawOf(key);
    if (value === undefined) return fallback;
    return String(value).trim();
  }

  /** 行が無ければ既定値、空欄なら [] （= その働きを使わない） */
  function listOrOff(key, fallback) {
    const value = rawOf(key);
    if (value === undefined) return fallback.slice();
    if (String(value).trim() === "") return [];
    return splitList_(value);
  }

  const targets = [];
  const wanted = listOrOff("通知先", DEFAULT_CONFIG.targets);
  for (let i = 0; i < wanted.length; i += 1) {
    const name = String(wanted[i]).trim().toLowerCase();
    if (TARGETS.indexOf(name) < 0) {
      throw new ConfigError("「通知先」に書けるのは slack / discord / line です: " + wanted[i]);
    }
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

  const rawAutoReply = rawOf("自動返信");
  const autoReply =
    rawAutoReply === undefined
      ? DEFAULT_CONFIG.autoReply
      : parseBoolean_(rawAutoReply, DEFAULT_CONFIG.autoReply, "自動返信");

  return {
    targets: targets,
    slackWebhookUrl: slackWebhookUrl,
    discordWebhookUrl: discordWebhookUrl,
    lineToken: lineToken,
    lineTo: lineTo,
    notifyTemplate: textOf("通知の文面", DEFAULT_CONFIG.notifyTemplate),
    requiredFields: listOrOff("必須項目", DEFAULT_CONFIG.requiredFields),
    fieldOrder: listOrOff("項目の並び", DEFAULT_CONFIG.fieldOrder),
    emailField: textOf("メールの項目名", DEFAULT_CONFIG.emailField),
    autoReply: autoReply,
    replySubject: textOf("自動返信の件名", DEFAULT_CONFIG.replySubject),
    replyBody: textOf("自動返信の本文", DEFAULT_CONFIG.replyBody),
    senderName: textOf("差出人名", ""),
    replyTo: textOf("返信先", ""),
    intakeSheetName: textOf("受付シート名", DEFAULT_CONFIG.intakeSheetName),
    slotSheetName: textOrOff("枠シート名", DEFAULT_CONFIG.slotSheetName),
    dateField: textOrOff("日付の項目名", DEFAULT_CONFIG.dateField),
    slotField: textOrOff("時間帯の項目名", DEFAULT_CONFIG.slotField),
    honeypotField: textOrOff("ハニーポットの項目名", DEFAULT_CONFIG.honeypotField),
    pageField: textOrOff("送信元の項目名", DEFAULT_CONFIG.pageField),
  };
}
