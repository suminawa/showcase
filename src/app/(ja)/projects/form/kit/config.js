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
  "連絡先メール",
  "受付シート名",
  "枠シート名",
  "日付の項目名",
  "時間帯の項目名",
  "ハニーポットの項目名",
  "送信元の項目名",
  "同じメールの上限（1 時間）",
  "全体の上限（1 分）",
  "Turnstile シークレット",
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
  contactEmail: "",
  /** 通知先 mail の宛先（「連絡先メール」、空なら「返信先」） */
  notifyMailTo: "",
  intakeSheetName: "受付",
  slotSheetName: "枠",
  dateField: "date",
  slotField: "slot",
  honeypotField: "homepage",
  pageField: "page",
  /** 同じメールアドレスから 1 時間に何件まで、自動返信と通知を出すか（0 は上限なし） */
  mailLimitPerHour: 3,
  /** 全体で 1 分に何件まで、自動返信と通知を出すか（0 は上限なし） */
  totalLimitPerMinute: 10,
  /** Cloudflare Turnstile のシークレット キー。空なら確かめない */
  turnstileSecret: "",
};

/**
 * 初期化で足す設定の行（CONFIG_KEYS の順に [項目, 値]）。行が無いときと同じ働きになる既定値を書く。
 * 空で書くと働きを止める 8 つがあるので、空にするのは URL・トークン・差出人名・返信先・連絡先メール・Turnstile だけ。
 * 「通知先」は 1.1.3 から mail（Slack も LINE も使わない会社でも、連絡先メールを書くだけで届く）。
 * 行ごと無いときの既定（DEFAULT_CONFIG.targets）は、1.1.2 までのシートを変えないよう slack のまま。
 * samples/settings-sample.csv とは Slack Webhook URL と通知先 以外が同じ（docs テストが見る）。
 */
export const DEFAULT_ROWS = [
  ["通知先", "mail"],
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
  ["連絡先メール", ""],
  ["受付シート名", "受付"],
  ["枠シート名", "枠"],
  ["日付の項目名", "date"],
  ["時間帯の項目名", "slot"],
  ["ハニーポットの項目名", "homepage"],
  ["送信元の項目名", "page"],
  ["同じメールの上限（1 時間）", "3"],
  ["全体の上限（1 分）", "10"],
  ["Turnstile シークレット", ""],
];

/** mail は「連絡先メール」（空なら「返信先」）へのメール */
const TARGETS = ["mail", "slack", "discord", "line"];

/**
 * 人に見せない鍵（知っている人なら誰でも通知先に投稿できる URL・トークン）の行。
 * メニュー「鍵を保存」でスクリプト プロパティに移せる。移した行には SAVED_SECRET_MARK を書く。
 * 読むときは、空か SAVED_SECRET_MARK の欄に保存した値を入れる（withSecrets）
 */
export const SECRET_KEYS = ["Slack Webhook URL", "Discord Webhook URL", "LINE チャネルアクセストークン", "Turnstile シークレット"];
export const SAVED_SECRET_MARK = "（保存済み）";

/** 鍵を入れるスクリプト プロパティの名前（受付番号の lastReceipt とは別の名前にする） */
export function secretPropertyName(key) {
  return "secret:" + key;
}

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

/** 鍵の行なら SECRET_KEYS の名前、そうでなければ null */
function secretKeyOf_(name) {
  const normalized = normalizeKey_(name);
  for (let i = 0; i < SECRET_KEYS.length; i += 1) if (normalizeKey_(SECRET_KEYS[i]) === normalized) return SECRET_KEYS[i];
  return null;
}

function cellOf_(row) {
  return row[1] === null || row[1] === undefined ? "" : String(row[1]).trim();
}

/**
 * 設定の行のうち、鍵の行で空か SAVED_SECRET_MARK のものに、保存した値（stored: { 鍵の名前: 値 }）を入れた写し。
 * 保存した値が無ければ空にする。シートに書き直した値は、そちらを先に使う（貼り替えがすぐ効くように）
 */
export function withSecrets(rows, stored) {
  const saved = stored || {};
  const source = Array.isArray(rows) ? rows : [];
  return source.map(function (row) {
    if (!Array.isArray(row) || row.length === 0) return row;
    const key = secretKeyOf_(row[0]);
    const value = cellOf_(row);
    if (key === null || (value !== "" && value !== SAVED_SECRET_MARK)) return row;
    const copy = row.slice();
    copy[1] = Object.prototype.hasOwnProperty.call(saved, key) ? saved[key] : "";
    return copy;
  });
}

/** 「鍵を保存」で移すもの: 鍵の行のうち、値が書いてあるもの（SAVED_SECRET_MARK は除く）。row はシートの 0 始まりの行 */
export function secretsInSheet(rows) {
  const found = [];
  const source = Array.isArray(rows) ? rows : [];
  for (let i = 0; i < source.length; i += 1) {
    const row = source[i];
    if (!Array.isArray(row) || row.length < 2) continue;
    const key = secretKeyOf_(row[0]);
    const value = cellOf_(row);
    if (key !== null && value !== "" && value !== SAVED_SECRET_MARK) found.push({ row: i, key: key, value: value });
  }
  return found;
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

/**
 * 回数の上限（0 以上の整数。全角の数字も読む）。空・読めない値は既定値のまま動かす。
 * 書き間違いで受付ごと止めないため、ここでは投げない（「設定を確かめる」が知らせる）
 */
export function limitOf(value, fallback) {
  if (value === undefined || value === null) return fallback;
  const text = String(value)
    .replace(/[０-９]/g, function (ch) {
      return String.fromCharCode(ch.charCodeAt(0) - 0xfee0);
    })
    .trim();
  return /^\d+$/.test(text) ? Number(text) : fallback;
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
      throw new ConfigError("「通知先」に書けるのは " + TARGETS.join(" / ") + " です: " + wanted[i]);
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

  // 通知先 mail の宛先は「連絡先メール」、空なら「返信先」（通知が届かなかったときのお知らせと同じ順）
  const contactEmail = textOf("連絡先メール", "");
  const replyTo = textOf("返信先", "");
  const notifyMailTo = contactEmail !== "" ? contactEmail : replyTo;
  if (targets.indexOf("mail") >= 0 && notifyMailTo === "") {
    throw new ConfigError("「通知先」に mail がありますが、「連絡先メール」が空です。通知を受け取るお店のメールアドレスを書いてください。");
  }

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
    replyTo: replyTo,
    // 形が崩れていても受付は止めない（送るときに失敗するだけ）。「設定を確かめる」が知らせる
    contactEmail: contactEmail,
    notifyMailTo: notifyMailTo,
    intakeSheetName: textOf("受付シート名", DEFAULT_CONFIG.intakeSheetName),
    slotSheetName: textOrOff("枠シート名", DEFAULT_CONFIG.slotSheetName),
    dateField: textOrOff("日付の項目名", DEFAULT_CONFIG.dateField),
    slotField: textOrOff("時間帯の項目名", DEFAULT_CONFIG.slotField),
    honeypotField: textOrOff("ハニーポットの項目名", DEFAULT_CONFIG.honeypotField),
    pageField: textOrOff("送信元の項目名", DEFAULT_CONFIG.pageField),
    mailLimitPerHour: limitOf(rawOf("同じメールの上限（1 時間）"), DEFAULT_CONFIG.mailLimitPerHour),
    totalLimitPerMinute: limitOf(rawOf("全体の上限（1 分）"), DEFAULT_CONFIG.totalLimitPerMinute),
    turnstileSecret: textOf("Turnstile シークレット", ""),
  };
}
