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
  "メールの宛先",
  "Google Chat の Webhook URL",
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
  /** 「通知先」が空のとき。1.0 から slack（1.1 までのシートをそのまま動かすため、変えない） */
  targets: ["slack"],
  webhookUrl: "",
  mailTo: [],
  chatWebhookUrl: "",
  /** 既定は「当日」と「3 日前」。設定シートには 3,0 と書く */
  thresholds: [0, 3],
  notifyOverdue: true,
  itemTemplate: "・{件名}（{期限}・{担当}）",
  sheetName: "期限",
  columns: { subject: "件名", due: "期限", assignee: "担当", status: "状態" },
  doneValues: ["完了"],
};

/** 「通知先」に書けるもの。カンマで区切って複数書ける */
export const TARGETS = ["slack", "discord", "gmail", "googlechat"];

/** Google Chat の Webhook の URL はここで始まる（スペースの「アプリと統合」→「Webhook を追加」で作る） */
export const CHAT_URL_PREFIX = "https://chat.googleapis.com/";

/** slack と discord は「Webhook URL」の行を分け合うので、同時には選べない */
const WEBHOOK_TARGETS = ["slack", "discord"];

const EMAIL_PATTERN = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/;

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
  ["メールの宛先", ""],
  ["Google Chat の Webhook URL", ""],
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

/** カンマ（半角・全角）と読点で区切って、空の要素を落とす */
function splitList_(text) {
  return String(text)
    .split(/[,、，]/)
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

/** 全角の英数字と記号（＠ ． など）を半角に、全角の空白を半角にする。メールアドレスを全角で書いても読めるように */
function toHalfWidth_(text) {
  return String(text)
    .replace(/[！-～]/g, function (ch) {
      return String.fromCharCode(ch.charCodeAt(0) - 0xfee0);
    })
    .replace(/\u3000/g, " ");
}

/**
 * 「通知先」の字を、そろえた名前の並びにする（空白を落として小文字に。「Google Chat」も「googlechat」になる）。
 * 知らない名前もそのまま返す（確かめるのは呼ぶ側）。空なら []
 */
export function targetNamesOf(value) {
  if (value === null || value === undefined) return [];
  const names = [];
  const parts = splitList_(value);
  for (let i = 0; i < parts.length; i += 1) {
    const name = parts[i].replace(/\s+/g, "").toLowerCase();
    if (name !== "" && names.indexOf(name) < 0) names.push(name);
  }
  return names;
}

/**
 * 「メールの宛先」を、宛先の並びと、形の崩れた字に分ける。区切りはカンマ・読点・セミコロン・空白。
 * 返り値: { addresses, invalid }
 */
export function mailListOf(value) {
  const addresses = [];
  const invalid = [];
  if (value === null || value === undefined) return { addresses: addresses, invalid: invalid };
  const parts = toHalfWidth_(value).split(/[,、;\s]+/);
  for (let i = 0; i < parts.length; i += 1) {
    const part = parts[i].trim();
    if (part === "") continue;
    if (!EMAIL_PATTERN.test(part)) {
      invalid.push(part);
      continue;
    }
    if (addresses.indexOf(part) < 0) addresses.push(part);
  }
  return { addresses: addresses, invalid: invalid };
}

function parseTargets_(value) {
  const names = targetNamesOf(value);
  if (names.length === 0) return DEFAULT_CONFIG.targets.slice();
  for (let i = 0; i < names.length; i += 1) {
    if (TARGETS.indexOf(names[i]) < 0) {
      throw new ConfigError("「通知先」は " + TARGETS.join("・") + " から選んで、カンマで区切って書いてください: " + names[i]);
    }
  }
  if (names.indexOf("slack") >= 0 && names.indexOf("discord") >= 0) {
    throw new ConfigError("「通知先」に slack と discord は同時に書けません（「Webhook URL」の行が 1 つのため）。どちらか一方にしてください。");
  }
  return names;
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

/** 設定の行を「そろえた項目名 → 値」にする。同じ項目が 2 行あれば後ろが勝つ */
function rawMapOf_(rows) {
  const raw = {};
  const source = Array.isArray(rows) ? rows : [];
  for (let i = 0; i < source.length; i += 1) {
    const row = source[i];
    if (!Array.isArray(row) || row.length === 0) continue;
    const key = normalizeKey_(row[0]);
    if (key === "") continue;
    raw[key] = row[1] === null || row[1] === undefined ? "" : row[1];
  }
  return raw;
}

function usesWebhook_(targets) {
  for (let i = 0; i < WEBHOOK_TARGETS.length; i += 1) if (targets.indexOf(WEBHOOK_TARGETS[i]) >= 0) return true;
  return false;
}

/**
 * 設定が壊れていてもエラーだけは届くように、通知先と送り先だけを検証せずに読む。
 * 送り先がそろっている通知先だけを残す。1 つも残らなければ null（そのときは実行ログだけが頼りになる）。
 */
export function rawTargetsOf(rows) {
  const raw = rawMapOf_(rows);
  const valueOf = function (key) {
    const value = raw[normalizeKey_(key)];
    return value === undefined ? "" : String(value).trim();
  };
  const named = targetNamesOf(valueOf("通知先")).filter(function (name) {
    return TARGETS.indexOf(name) >= 0;
  });
  const webhookUrl = valueOf("Webhook URL");
  const mailTo = mailListOf(valueOf("メールの宛先")).addresses;
  const chatWebhookUrl = valueOf("Google Chat の Webhook URL");
  const targets = [];
  const wanted = named.length === 0 ? DEFAULT_CONFIG.targets : named;
  for (let i = 0; i < wanted.length; i += 1) {
    const name = wanted[i];
    let ready = false;
    if (name === "gmail") ready = mailTo.length > 0;
    else if (name === "googlechat") ready = chatWebhookUrl.indexOf(CHAT_URL_PREFIX) === 0;
    else ready = webhookUrl.indexOf("https://") === 0 && !usesWebhook_(targets);
    if (ready) targets.push(name);
  }
  return targets.length === 0 ? null : { targets: targets, webhookUrl: webhookUrl, mailTo: mailTo, chatWebhookUrl: chatWebhookUrl };
}

/** rows: [[キー, 値], ...]（ヘッダー行が混ざっていてもよい） */
export function parseConfig(rows) {
  const raw = rawMapOf_(rows);

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

  const targets = parseTargets_(textOf("通知先", ""));

  // Webhook URL は slack か discord を選んだときだけ要る（gmail だけなら空でよい）
  const webhookUrl = textOf("Webhook URL", "");
  if (usesWebhook_(targets)) {
    if (webhookUrl === "") {
      throw new ConfigError("「Webhook URL」が空です。README の手順 2 を見てください。");
    }
    if (webhookUrl.indexOf("https://") !== 0) {
      throw new ConfigError("「Webhook URL」は https:// で始まる URL です: " + webhookUrl);
    }
  }

  let mailTo = [];
  if (targets.indexOf("gmail") >= 0) {
    const list = mailListOf(rawOf("メールの宛先"));
    if (list.invalid.length > 0) {
      throw new ConfigError("「メールの宛先」の「" + list.invalid[0] + "」はメールアドレスの形ではありません。");
    }
    if (list.addresses.length === 0) {
      throw new ConfigError("「メールの宛先」が空です。通知を受け取るメールアドレスを書いてください（README の手順 2）。");
    }
    mailTo = list.addresses;
  }

  // URL は人に見せない鍵なので、誤りの文には出さない
  const chatWebhookUrl = textOf("Google Chat の Webhook URL", "");
  if (targets.indexOf("googlechat") >= 0) {
    if (chatWebhookUrl === "") {
      throw new ConfigError("「Google Chat の Webhook URL」が空です。README の手順 2 を見てください。");
    }
    if (chatWebhookUrl.indexOf(CHAT_URL_PREFIX) !== 0) {
      throw new ConfigError("「Google Chat の Webhook URL」は " + CHAT_URL_PREFIX + " で始まる URL です。");
    }
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
    targets: targets,
    webhookUrl: webhookUrl,
    mailTo: mailTo,
    chatWebhookUrl: chatWebhookUrl,
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
