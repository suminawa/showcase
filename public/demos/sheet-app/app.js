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
/** お客さまの LINE のユーザー ID を持つ型。参照 と同じく TYPES の外で読む。1 テーブルに 1 列まで */
const LINE_TYPE = "LINE";
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

/** テーブルの LINE の列。無ければ null */
function lineColumn(table) {
  for (let i = 0; i < table.columns.length; i += 1) {
    if (table.columns[i].type === LINE_TYPE) return table.columns[i];
  }
  return null;
}

function typeError_(line, typeText) {
  return "sheet-app: 定義の " + line + " 行目: 型「" + typeText + "」は使えません。" + TYPES.join("・") + "・LINE・参照:<テーブル名> のいずれかにしてください";
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
    } else if (typeText.toUpperCase() === LINE_TYPE) {
      type = LINE_TYPE;
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
    if (type === LINE_TYPE && lineColumn(table) !== null) {
      errors.push("sheet-app: 定義の " + line + " 行目: テーブル「" + tableName + "」の LINE の列は 1 つまでです（すでに「" + lineColumn(table).name + "」があります）");
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

// ===== line.js =====
/**
 * お客さまへの LINE 送信の純粋な処理: webhook の本文の読み取り、ユーザー ID の形、定型文（題|本文）と置き換え、
 * 友だちの一覧の整え、月の送信数、LINE の応答の言い換え、断りの文。画面（App.html）でも同じものを動かす。
 */

/** LINE のユーザー ID は U と 32 桁の 16 進 */
const LINE_USER_ID = /^U[0-9a-f]{32}$/;
/** LINE のテキストメッセージは 5,000 字まで */
const LINE_TEXT_LIMIT = 5000;
const FRIENDS_SHEET = "_LINE友だち";
const FRIENDS_HEADER = ["ユーザー ID", "表示名", "追加日時", "状態"];
const FRIEND_STATE = "友だち";
const BLOCKED_STATE = "ブロック";
const SEND_LOG_SHEET = "_LINE送信履歴";
const SEND_LOG_HEADER = ["日時", "テーブル", "ID", "送り先ユーザー ID", "送信者", "本文", "結果"];
const SENT = "送信済み";
/** 詳細画面に出す送信履歴の件数 */
const HISTORY_LIMIT = 20;
/** 送信と下書きを断るときの文（サーバーと見本で同じものを使う） */
const LINE_MESSAGES = {
  noColumn: "このテーブルには LINE の列がありません",
  viewer: "この画面では閲覧のみできます。LINE を送るには、スプレッドシートの編集者である必要があります",
  notSender: "LINE を送れるのは、設定「LINE を送れる人」に書かれた方だけです。送る必要がある場合は、所有者に追加をご依頼ください",
  noToken: "LINE の送信は使えません。設定「LINE チャネルアクセストークン」をご確認ください",
  noFriend: "この記録には LINE の友だちが結びついていません。編集で LINE の欄を選んでから送ってください",
  unknown: "この LINE のユーザー ID は友だちの一覧にありません。友だち追加をしていただいてから、もう一度お試しください",
  blocked: "この方は LINE でブロック中のため送れません",
  blockedChoice: "この方は LINE でブロック中のため選べません。ほかの友だちを選ぶか、空にしてください",
  emptyText: "本文を入力してください",
  emptyIntent: "用件を入力してください（例: 先日の内見のお礼と、次の候補日を 2 つ聞く）",
};
const LINE_MARK = /\{([^{}\n]{1,60})\}/g;

function isLineUserId(value) {
  return LINE_USER_ID.test(textOf(value));
}

/**
 * LINE の webhook の本文から、友だち追加（follow）とブロック（unfollow）だけを取り出す。
 * ほかの出来事（message など）・グループ・形の違う ID は捨てる。本文が JSON のオブジェクトでなければ error に文
 */
function parseWebhook(body) {
  const broken = { events: [], error: "LINE からの本文を JSON として読めませんでした" };
  let json;
  try {
    json = JSON.parse(String(body === null || body === undefined ? "" : body));
  } catch (error) {
    return broken;
  }
  if (json === null || typeof json !== "object" || Array.isArray(json)) return broken;
  const list = Array.isArray(json.events) ? json.events : [];
  const events = [];
  for (let i = 0; i < list.length; i += 1) {
    const event = list[i];
    if (event === null || typeof event !== "object") continue;
    if (event.type !== "follow" && event.type !== "unfollow") continue;
    const source = event.source && typeof event.source === "object" ? event.source : {};
    if (source.type !== "user" || !isLineUserId(source.userId)) continue;
    events.push({ type: event.type, userId: String(source.userId).trim() });
  }
  return { events: events, error: "" };
}

/** 「LINE 定型文」の値。1 行 1 本の「題|本文」（全角の｜も可）、本文の \n は改行。空行は飛ばす */
function parseLineTemplates(text) {
  const lines = String(text === null || text === undefined ? "" : text).split(/\r?\n/);
  const templates = [];
  const errors = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (line === "") continue;
    const at = line.search(/[|｜]/);
    if (at < 0) {
      errors.push("設定「LINE 定型文」の " + (i + 1) + " 行目に「|」がありません。「題|本文」の形で書いてください");
      continue;
    }
    const title = line.slice(0, at).trim();
    const body = line.slice(at + 1).trim().replace(/\\n/g, "\n");
    if (title === "" || body === "") {
      errors.push("設定「LINE 定型文」の " + (i + 1) + " 行目は、題と本文の両方を書いてください");
      continue;
    }
    templates.push({ title: title.slice(0, 40), body: body });
  }
  return { templates: templates, errors: errors };
}

/**
 * 定型文の本文の置き換え。{担当者名} と列名そのもの（{会社名} など。values は画面に出ている文字）。
 * 知らない印は残す。値の中に {…} があっても置き換えない（1 回の走査）
 */
function fillLineTemplate(body, context) {
  const values = context && context.values ? context.values : {};
  const staff = context && context.staffName ? String(context.staffName) : "";
  return String(body === null || body === undefined ? "" : body).replace(LINE_MARK, (whole, key) => {
    if (key === "担当者名") return staff;
    if (Object.prototype.hasOwnProperty.call(values, key)) return String(values[key]);
    return whole;
  });
}

/** 本文に残っている {…} の印（重複なし） */
function leftoverPlaceholders(text) {
  const found = String(text === null || text === undefined ? "" : text).match(LINE_MARK) || [];
  const out = [];
  for (let i = 0; i < found.length; i += 1) if (out.indexOf(found[i]) < 0) out.push(found[i]);
  return out;
}

/** 定型文の {担当者名}。設定「担当者名」、空ならメールの @ の前 */
function staffNameFor(settings, email) {
  const name = textOf(settings && settings.staffName);
  if (name !== "") return name;
  return textOf(email).split("@")[0];
}

/**
 * _LINE友だち の行（{ userId, name, state }）を画面の候補の形 [{ id, name, blocked }] にする。
 * 表示名が空（profile が取れなかった「未確認」）の ID と、形の違う ID と、2 回目以降の同じ ID は出さない。表示名の順
 */
function friendsForScreen(rows) {
  const list = Array.isArray(rows) ? rows : [];
  const seen = {};
  const out = [];
  for (let i = 0; i < list.length; i += 1) {
    const row = list[i] || {};
    const id = textOf(row.userId);
    const name = textOf(row.name);
    if (!isLineUserId(id) || name === "" || seen[id] === true) continue;
    seen[id] = true;
    out.push({ id: id, name: name, blocked: textOf(row.state) === BLOCKED_STATE });
  }
  out.sort((a, b) => a.name.localeCompare(b.name, "ja"));
  return out;
}

function findFriend(friends, id) {
  const key = textOf(id);
  const list = Array.isArray(friends) ? friends : [];
  for (let i = 0; i < list.length; i += 1) if (list[i].id === key) return list[i];
  return null;
}

/** 一覧・詳細に出す LINE の列の文字。友だちなら表示名（ブロック中は印を添える）、一覧に無い ID はそのまま */
function friendLabel(friends, id) {
  const key = textOf(id);
  if (key === "") return "";
  const friend = findFriend(friends, key);
  if (friend === null) return key;
  return friend.name + (friend.blocked ? "（ブロック中）" : "");
}

/** _LINE送信履歴 の行（{ at, result }）のうち、monthKey（"2026-09"）の「送信済み」の数 */
function countMonthSends(rows, monthKey) {
  const prefix = textOf(monthKey) + "-";
  const list = Array.isArray(rows) ? rows : [];
  let count = 0;
  for (let i = 0; i < list.length; i += 1) {
    const row = list[i] || {};
    if (textOf(row.result) === SENT && textOf(row.at).indexOf(prefix) === 0) count += 1;
  }
  return count;
}

/** LINE が送信を断ったときの文。LINE の message はそのまま出さず、状態コードごとに敬体で言い換える */
function lineSendError(status) {
  const code = Number(status) || 0;
  if (code === 0) return "送れませんでした。LINE につながりませんでした。しばらくしてからもう一度お試しください";
  const head = "送れませんでした（LINE の応答: " + code + "）。";
  if (code === 400) return head + "本文か送り先の形が受け付けられませんでした。本文を短くするか、LINE の欄を選び直してください";
  if (code === 401) return head + "設定「LINE チャネルアクセストークン」が正しくないか、失効しています";
  if (code === 403) return head + "ブロックされているか、トークンが失効しています";
  if (code === 429) return head + "今月の送信数の上限に達したか、短い間に送りすぎています。LINE Official Account Manager でプランと送信数をご確認ください";
  return head + "しばらくしてからもう一度お試しください";
}

/** 送る本文の検査。問題が無ければ "" */
function lineTextError(text) {
  const body = String(text === null || text === undefined ? "" : text).trim();
  if (body === "") return LINE_MESSAGES.emptyText;
  if (body.length > LINE_TEXT_LIMIT) return "本文は 5,000 字以内にしてください（いまは " + body.length.toLocaleString("en-US") + " 字）";
  return "";
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
  if (type === "LINE") {
    if (!isLineUserId(t)) return { error: "LINE の友だちから選んでください", value: t };
    return { error: "", value: t };
  }
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

/**
 * 文字は必ず「文字として保存」する印（先頭の '）を付けて書く。見た目は変わらない。
 * Sheets は書いた文字を人の入力と同じように読み直すので、印が無いと 数式（=…）だけでなく
 * 電話の先頭 0 や「1-2」「2026-09-16 10:32:05」まで数や日付に化ける。
 */
function safeCell(value) {
  const text = String(value === null || value === undefined ? "" : value);
  return text === "" ? "" : "'" + text;
}

/** セル 1 つに入る字数（Google スプレッドシートの上限 50,000 字に、' と余裕を見込む） */
const TRASH_JSON_LIMIT = 49000;

/**
 * _ごみ箱 に書く JSON。長い値から順に切って上限に収める（収まらなければ ID と注記だけを残す）。
 * 切らずに書くとセルの上限で書き込みが失敗し、削除そのものができなくなる
 */
function trashJson(record, limit) {
  const max = limit === undefined ? TRASH_JSON_LIMIT : limit;
  const copy = Object.assign({}, record);
  let json = JSON.stringify(copy);
  let guard = 0;
  while (json.length > max && guard < 100) {
    guard += 1;
    const keys = Object.keys(copy).filter((k) => typeof copy[k] === "string" && copy[k].length > 20);
    if (keys.length === 0) break;
    keys.sort((a, b) => copy[b].length - copy[a].length);
    const value = copy[keys[0]];
    const keep = Math.max(0, value.length - (json.length - max) - 8);
    copy[keys[0]] = value.slice(0, keep) + "…（切りました）";
    json = JSON.stringify(copy);
  }
  if (json.length > max) json = JSON.stringify({ ID: copy.ID, 注記: "行が長すぎたため内容を残せませんでした" });
  return json;
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
/** 検索の言葉と条件の数の上限（画面からもらう値を無制限に受けない） */
const MAX_Q_LENGTH = 200;
const MAX_FILTERS = 20;
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
    if (filters.length >= MAX_FILTERS) break;
  }
  let sort = null;
  if (source.sort && typeof source.sort === "object" && columnOf_(table, textOf(source.sort.column)) !== null) {
    sort = { column: textOf(source.sort.column), dir: textOf(source.sort.dir).toLowerCase() === "desc" ? "desc" : "asc" };
  }
  const page = Math.max(1, Math.floor(Number(source.page)) || 1);
  let pageSize = Math.floor(Number(source.pageSize)) || DEFAULT_PAGE_SIZE;
  pageSize = Math.min(MAX_PAGE_SIZE, Math.max(MIN_PAGE_SIZE, pageSize));
  return { q: textOf(source.q).slice(0, MAX_Q_LENGTH), filters: filters, sort: sort, page: page, pageSize: pageSize };
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
    // 画面の select は はい / いいえ を送る。TRUE / 1 / ○ も同じに読む
    const want = boolOf(filter.value, false);
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

/** 2 つの ID のうち後ろの方（日付キー → 連番の順で比べる）。読めない方は無視し、どちらも読めなければ "" */
function laterId(a, b) {
  const first = parseId(a);
  const second = parseId(b);
  if (first === null) return second === null ? "" : String(b);
  if (second === null) return String(a);
  if (first.dateKey !== second.dateKey) return first.dateKey > second.dateKey ? String(a) : String(b);
  return first.sequence >= second.sequence ? String(a) : String(b);
}

/** 前回の ID と今日の日付キーから、次の ID を作る */
function nextId(lastId, dateKey) {
  const last = parseId(lastId);
  if (last === null || last.dateKey !== dateKey) return formatId(dateKey, 1);
  return formatId(dateKey, last.sequence + 1);
}

// ===== notify.js =====
/**
 * 登録・更新・削除の通知の純粋な処理: 変更点の整形、テンプレの置き換え、記録の URL、通知するかの判定、
 * Slack / Discord / LINE の送信データ。Node でそのままテストできる。
 * buildPayload と、テンプレを 1 回の走査で置き換える作りは packages/form-intake-gas/src/message.js から写した
 * （build が src/ を 1 本に束ねる作りなので、パッケージをまたいで import しない）。
 */

const NOTIFY_TARGETS = ["slack", "discord", "line"];
const NOTIFY_OPS = ["登録", "更新", "削除"];
const NOTIFY_LOG_SHEET = "_通知ログ";
const NOTIFY_LOG_HEADER = ["日時", "テーブル", "操作", "ID", "宛先", "結果"];
/** 変更点の 1 つの値は 60 字で切る（長文の中身が Slack などに流れすぎないように） */
const CHANGE_TEXT_LIMIT = 60;
/** 変更点は 10 列まで。超えた分は「ほか n 列」 */
const CHANGE_COLUMN_LIMIT = 10;
const DEFAULT_NOTIFY_TEMPLATE = ["【{アプリ名}】{テーブル}を{操作}しました", "{表示名}（{ID}）", "{変更点}", "{更新者}", "{URL}"].join("\n");

/** Slack の text は 40,000 字まで。余裕を見てここで切る */
const SLACK_PAYLOAD_LIMIT = 39000;
/** Discord の content は 2,000 字まで。余裕を見てここで切る */
const DISCORD_PAYLOAD_LIMIT = 1900;
/** LINE のテキストメッセージは 5,000 字まで */
const LINE_PAYLOAD_LIMIT = 5000;
const NOTIFY_MARK = /\{([^{}\n]{1,60})\}/g;

function truncatePayload_(text, limit) {
  if (text.length <= limit) return text;
  // Slack の文字参照（&amp; など）を途中で切らない
  return text.slice(0, limit - 8).replace(/&[a-z]{0,3}$/, "") + "\n…（以下省略）";
}

/** Slack の text では & < > が制御の字（<!channel> や <@U…> のメンション・リンク）なので、文字として送る */
function escapeSlack(text) {
  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** 1 行にして limit 字（既定 60 字）で切る。切ったら … を付ける */
function shortText(text, limit) {
  const max = limit === undefined ? CHANGE_TEXT_LIMIT : limit;
  const t = String(text === null || text === undefined ? "" : text).replace(/\s*\r?\n\s*/g, " ").trim();
  return t.length > max ? t.slice(0, max) + "…" : t;
}

function isBlank_(value) {
  return value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0);
}

/** 通知に出す 1 つの値（切らない）。チェックは はい / いいえ、labels にある値（参照・LINE）は表示名、ほかは画面と同じ書式 */
function plainValue_(column, value, options) {
  if (isBlank_(value)) return "";
  if (column.type === "チェック") return value === true || String(value).toUpperCase() === "TRUE" ? "はい" : "いいえ";
  const labels = options.labels && options.labels[column.name] ? options.labels[column.name] : null;
  if (labels !== null && Object.prototype.hasOwnProperty.call(labels, String(value))) return String(labels[String(value)]);
  return formatCell(column, value, { dateFormat: options.dateFormat });
}

/** 記録を { 列名: 表示の文字 } にする（テンプレの {列名} と表示名に使う。切らない） */
function displayValues(table, record, options) {
  const opts = options || {};
  const source = record || {};
  const values = {};
  for (let i = 0; i < table.columns.length; i += 1) {
    const column = table.columns[i];
    values[column.name] = plainValue_(column, source[column.name], opts);
  }
  return values;
}

/**
 * 変更点。op は 登録 / 更新 / 削除、before・after は API の形の記録（無い側は null）。
 * 返り値 { items: [{ column, before, after }], more }。値は画面向けの文字で、60 字で切る。10 列を超えた数は more
 */
function buildChanges(table, op, before, after, options) {
  const opts = options || {};
  const items = [];
  if (op !== "削除") {
    for (let i = 0; i < table.columns.length; i += 1) {
      const column = table.columns[i];
      const raw = after ? after[column.name] : "";
      const next = shortText(plainValue_(column, raw, opts));
      if (op === "登録") {
        // 登録は空でない列だけ（チェックの いいえ も空とみなす）
        if (next === "" || raw === false) continue;
        items.push({ column: column.name, before: "", after: next });
      } else {
        const prev = shortText(plainValue_(column, before ? before[column.name] : "", opts));
        if (prev !== next) items.push({ column: column.name, before: prev, after: next });
      }
    }
  }
  return { items: items.slice(0, CHANGE_COLUMN_LIMIT), more: Math.max(0, items.length - CHANGE_COLUMN_LIMIT) };
}

/** {変更点} に入る文。1 行 1 列「列名: 前 → 後」（登録は「列名: 値」）。超えた分は「ほか n 列」 */
function formatChanges(op, changes) {
  const list = changes && Array.isArray(changes.items) ? changes.items : [];
  const lines = [];
  for (let i = 0; i < list.length; i += 1) {
    const item = list[i];
    if (op === "登録") lines.push(item.column + ": " + item.after);
    else lines.push(item.column + ": " + (item.before === "" ? "（空）" : item.before) + " → " + (item.after === "" ? "（空）" : item.after));
  }
  if (changes && changes.more > 0) lines.push("ほか " + changes.more + " 列");
  return lines.join("\n");
}

/**
 * 通知の文面。{アプリ名} {テーブル} {操作} {ID} {表示名} {更新者} {変更点} {URL} と、列名そのもの（event.values）が使える。
 * 知らない印はそのまま残す（書き間違いに気づけるように）。値の中に {…} があっても置き換えない（1 回の走査）。
 * 印のあった行が置き換えの結果で空になったら、その行ごと省く（削除の {変更点}、URL が無いときの {URL} など）
 */
function buildNotifyText(template, event) {
  const reserved = {
    アプリ名: textOf(event.appName),
    テーブル: textOf(event.table),
    操作: textOf(event.op),
    ID: textOf(event.id),
    表示名: textOf(event.label),
    更新者: textOf(event.actor),
    変更点: formatChanges(event.op, event.changes),
    URL: textOf(event.url),
  };
  const values = event.values || {};
  const lines = String(template).split("\n");
  const out = [];
  for (let i = 0; i < lines.length; i += 1) {
    let used = false;
    const rendered = lines[i].replace(NOTIFY_MARK, (whole, key) => {
      if (Object.prototype.hasOwnProperty.call(reserved, key)) {
        used = true;
        return reserved[key];
      }
      if (Object.prototype.hasOwnProperty.call(values, key)) {
        used = true;
        return String(values[key]);
      }
      return whole;
    });
    if (used && rendered.trim() === "") continue;
    out.push(rendered);
  }
  return out.join("\n");
}

/** メニュー「通知のテストを送る」の本文 */
function buildTestNotifyText(appName) {
  return "【" + textOf(appName) + "】これはテストです。通知の設定ができています。";
}

/** 通知の URL。画面は #<テーブル>/<ID> で詳細を直接開く。Web アプリの URL が分からなければ "" */
function recordUrl(appUrl, tableName, id) {
  const base = textOf(appUrl);
  if (base === "") return "";
  return base + "#" + encodeURIComponent(textOf(tableName)) + "/" + encodeURIComponent(textOf(id));
}

/**
 * 通知するか。event は { table, op, actor }。
 * 「自分の操作は通知しない」（skipOwn）は、更新者がスプレッドシートの所有者のときだけ飛ばす（所有者が分からなければ飛ばさない）
 */
function shouldNotify(settings, event, ownerEmail) {
  if (!Array.isArray(settings.notifyTargets) || settings.notifyTargets.length === 0) return false;
  if (settings.notifyTables.length > 0 && settings.notifyTables.indexOf(event.table) < 0) return false;
  if (settings.notifyOps.indexOf(event.op) < 0) return false;
  const owner = textOf(ownerEmail).toLowerCase();
  if (settings.skipOwn === true && owner !== "" && textOf(event.actor).toLowerCase() === owner) return false;
  return true;
}

/**
 * Slack は text、Discord は content、LINE は push message の中身（form-intake-gas の message.js と同じ形）。
 * 通知にはお客さまが決めた名前（LINE の表示名など）も入るので、@everyone やメンションとして働かせない:
 * Discord は allowed_mentions を空に、Slack は & < > を文字参照にする
 */
function buildPayload(text, target, options) {
  if (target === "discord") return { content: truncatePayload_(text, DISCORD_PAYLOAD_LIMIT), allowed_mentions: { parse: [] } };
  if (target === "line") {
    const to = options === undefined || options === null || options.lineTo === undefined ? "" : String(options.lineTo);
    return { to: to, messages: [{ type: "text", text: truncatePayload_(text, LINE_PAYLOAD_LIMIT) }] };
  }
  return { text: truncatePayload_(escapeSlack(text), SLACK_PAYLOAD_LIMIT) };
}

// ===== settings.js =====
/**
 * 「設定」シート（項目・値の 2 列）を読む。空欄は既定値、知らない行は無視。誤りは敬体の文で集める。
 * errors は画面を止める誤り（1.0 の行）。notifyErrors は通知とお客さまへの LINE 送信の行の誤りで、
 * 画面は止めず、メニュー「設定を確かめる」「通知のテストを送る」で知らせる。
 */

const SETTING_KEYS = ["アプリ名", "編集できる人", "1 ページの件数", "日付の書式", "AI を使う", "モデル", "AI の 1 日の上限"];
/** 1.1 で足した行（通知とお客さまへの LINE 送信）。README の表と samples/設定.csv はこの並び */
const LINE_SETTING_KEYS = ["通知先", "Slack Webhook URL", "Discord Webhook URL", "LINE チャネルアクセストークン", "LINE 送信先 ID", "通知するテーブル", "通知する操作", "自分の操作は通知しない", "通知の文面", "LINE 定型文", "LINE を送れる人", "担当者名", "画面の URL"];
const DATE_FORMATS = ["yyyy-MM-dd", "yyyy/MM/dd"];
/** 「LINE 定型文」の既定（見本 3 本）。1 行に 1 本の「題|本文」で、本文の改行は \n と書く */
const DEFAULT_LINE_TEMPLATE_TEXT = [
  "お礼|{会社名} {担当者} 様\\n\\nいつもお世話になっております。{担当者名}です。\\n先日はお時間をいただき、ありがとうございました。\\nご不明な点がございましたら、お気軽にお知らせください。",
  "打ち合わせの確認|{会社名} {担当者} 様\\n\\nいつもお世話になっております。{担当者名}です。\\n次回のお打ち合わせについて、ご都合のよい日時の候補を 2 つほどお知らせいただけますでしょうか。\\nどうぞよろしくお願いいたします。",
  "資料のご案内|{会社名} {担当者} 様\\n\\nいつもお世話になっております。{担当者名}です。\\n先日お話しした資料をご用意しました。メールでお送りしますので、届きましたらご確認をお願いいたします。",
].join("\n");
const DEFAULT_SETTINGS = {
  appName: "業務アプリ",
  editors: [],
  pageSize: 50,
  dateFormat: "yyyy-MM-dd",
  aiEnabled: true,
  model: "claude-sonnet-5",
  aiDailyLimit: 200,
  notifyTargets: [],
  slackWebhookUrl: "",
  discordWebhookUrl: "",
  lineToken: "",
  lineTo: "",
  notifyTables: [],
  notifyOps: NOTIFY_OPS.slice(),
  skipOwn: false,
  notifyTemplate: DEFAULT_NOTIFY_TEMPLATE,
  lineTemplateText: DEFAULT_LINE_TEMPLATE_TEXT,
  lineSenders: [],
  staffName: "",
  appUrl: "",
};

function normalizeKey_(value) {
  return String(value === null || value === undefined ? "" : value).replace(/\s+/g, "").toLowerCase();
}

function integer_(value, min, max) {
  // 全角で打たれた「１００」も数として読む
  const n = Number(toHalfWidth(textOf(value)));
  if (!Number.isInteger(n) || n < min || n > max) return null;
  return n;
}

/** 通知先に書いた宛先の行が空なら、どの行を埋めればよいかを言う（フォーム受付キットの ConfigError と同じ文） */
function requireFor_(errors, targets, target, value, label) {
  if (targets.indexOf(target) < 0 || value !== "") return;
  errors.push("「通知先」に " + target + " がありますが、「" + label + "」が空です。設定シートのその行を埋めてください。");
}

/** Webhook の URL は https:// から。URL は鍵なので、誤りの文には出さない */
function requireHttps_(errors, targets, target, value, label) {
  if (targets.indexOf(target) < 0 || value === "" || value.indexOf("https://") === 0) return;
  errors.push("「" + label + "」は https:// で始まる URL です。設定シートのその行を確かめてください。");
}

/** rows は「設定」シートの 2 次元配列（1 行目の見出しはあってもなくてもよい） */
function parseSettings(rows) {
  const settings = {
    appName: DEFAULT_SETTINGS.appName,
    editors: [],
    pageSize: DEFAULT_SETTINGS.pageSize,
    dateFormat: DEFAULT_SETTINGS.dateFormat,
    aiEnabled: DEFAULT_SETTINGS.aiEnabled,
    model: DEFAULT_SETTINGS.model,
    aiDailyLimit: DEFAULT_SETTINGS.aiDailyLimit,
    notifyTargets: [],
    slackWebhookUrl: "",
    discordWebhookUrl: "",
    lineToken: "",
    lineTo: "",
    notifyTables: [],
    notifyOps: DEFAULT_SETTINGS.notifyOps.slice(),
    skipOwn: false,
    notifyTemplate: DEFAULT_SETTINGS.notifyTemplate,
    lineTemplateText: DEFAULT_SETTINGS.lineTemplateText,
    lineSenders: [],
    staffName: "",
    appUrl: "",
  };
  const errors = [];
  const notifyErrors = [];
  const list = Array.isArray(rows) ? rows : [];
  for (let i = 0; i < list.length; i += 1) {
    const key = normalizeKey_(list[i][0]);
    const value = list[i].length > 1 ? list[i][1] : "";
    const raw = textOf(value);
    if (key === "アプリ名") {
      if (raw !== "") settings.appName = raw.slice(0, 40);
    } else if (key === "編集できる人") {
      settings.editors = splitList(raw).map((s) => s.toLowerCase());
    } else if (key === "1ページの件数") {
      if (raw !== "") {
        const n = integer_(raw, 10, 200);
        if (n === null) errors.push("設定「1 ページの件数」は 10〜200 の整数にしてください（いまは「" + raw + "」）");
        else settings.pageSize = n;
      }
    } else if (key === "日付の書式") {
      if (raw !== "") {
        if (DATE_FORMATS.indexOf(raw) < 0) errors.push("設定「日付の書式」は yyyy-MM-dd か yyyy/MM/dd にしてください（いまは「" + raw + "」）");
        else settings.dateFormat = raw;
      }
    } else if (key === "aiを使う") {
      settings.aiEnabled = boolOf(value, DEFAULT_SETTINGS.aiEnabled);
    } else if (key === "モデル") {
      if (raw !== "") settings.model = raw;
    } else if (key === "aiの1日の上限") {
      if (raw !== "") {
        const n = integer_(raw, 1, 10000);
        if (n === null) errors.push("設定「AI の 1 日の上限」は 1〜10000 の整数にしてください（いまは「" + raw + "」）");
        else settings.aiDailyLimit = n;
      }
    } else if (key === "通知先") {
      const wanted = splitList(raw);
      for (let j = 0; j < wanted.length; j += 1) {
        const name = wanted[j].toLowerCase();
        if (NOTIFY_TARGETS.indexOf(name) < 0) notifyErrors.push("「通知先」に書けるのは slack / discord / line です: " + wanted[j]);
        else if (settings.notifyTargets.indexOf(name) < 0) settings.notifyTargets.push(name);
      }
    } else if (key === "slackwebhookurl") {
      settings.slackWebhookUrl = raw;
    } else if (key === "discordwebhookurl") {
      settings.discordWebhookUrl = raw;
    } else if (key === "lineチャネルアクセストークン") {
      settings.lineToken = raw;
    } else if (key === "line送信先id") {
      settings.lineTo = raw;
    } else if (key === "通知するテーブル") {
      settings.notifyTables = splitList(raw);
    } else if (key === "通知する操作") {
      if (raw !== "") {
        const ops = [];
        const wanted = splitList(raw);
        for (let j = 0; j < wanted.length; j += 1) {
          if (NOTIFY_OPS.indexOf(wanted[j]) < 0) notifyErrors.push("「通知する操作」に書けるのは 登録・更新・削除 です: " + wanted[j]);
          else if (ops.indexOf(wanted[j]) < 0) ops.push(wanted[j]);
        }
        settings.notifyOps = ops;
      }
    } else if (key === "自分の操作は通知しない") {
      settings.skipOwn = boolOf(value, false);
    } else if (key === "通知の文面") {
      if (raw !== "") settings.notifyTemplate = raw;
    } else if (key === "line定型文") {
      if (raw !== "") settings.lineTemplateText = raw;
    } else if (key === "lineを送れる人") {
      settings.lineSenders = splitList(raw).map((s) => s.toLowerCase());
    } else if (key === "担当者名") {
      settings.staffName = raw.slice(0, 40);
    } else if (key === "画面のurl") {
      // 通知の {URL} の元。画面用と webhook 用の 2 つのデプロイがあると、Apps Script の getUrl() がどちらを返すか決まらないため
      if (raw === "") settings.appUrl = "";
      else if (raw.indexOf("https://") !== 0) notifyErrors.push("「画面の URL」は https:// で始まる URL です（画面用のデプロイの URL を貼ってください）。いまは使わずに、Apps Script が返す URL で通知します");
      else settings.appUrl = raw.replace(/#.*$/, "");
    }
  }
  const targets = settings.notifyTargets;
  requireFor_(notifyErrors, targets, "slack", settings.slackWebhookUrl, "Slack Webhook URL");
  requireFor_(notifyErrors, targets, "discord", settings.discordWebhookUrl, "Discord Webhook URL");
  requireFor_(notifyErrors, targets, "line", settings.lineToken, "LINE チャネルアクセストークン");
  requireFor_(notifyErrors, targets, "line", settings.lineTo, "LINE 送信先 ID");
  requireHttps_(notifyErrors, targets, "slack", settings.slackWebhookUrl, "Slack Webhook URL");
  requireHttps_(notifyErrors, targets, "discord", settings.discordWebhookUrl, "Discord Webhook URL");
  const templateErrors = parseLineTemplates(settings.lineTemplateText).errors;
  for (let i = 0; i < templateErrors.length; i += 1) notifyErrors.push(templateErrors[i]);
  return { settings: settings, errors: errors, notifyErrors: notifyErrors };
}

/** 定義と突き合わせる誤り（「通知するテーブル」に定義に無い名前） */
function crossCheckSettings(settings, tables) {
  const errors = [];
  for (let i = 0; i < settings.notifyTables.length; i += 1) {
    const name = settings.notifyTables[i];
    if (findTable(tables, name) === null) errors.push("設定「通知するテーブル」の「" + name + "」は定義にありません。定義のテーブル名と同じに書いてください");
  }
  return errors;
}

/** 「設定を確かめる」で問題が無いときに添える、通知とお客さまへの LINE 送信の状態（2 行） */
function settingsSummary(settings, tables) {
  const lines = [];
  if (settings.notifyTargets.length === 0) {
    lines.push("通知: 使っていません（設定「通知先」が空です）");
  } else {
    const where = settings.notifyTables.length === 0 ? "すべてのテーブル" : settings.notifyTables.join("・");
    lines.push("通知: " + settings.notifyTargets.join("・") + " に、" + where + "の" + settings.notifyOps.join("・") + "を知らせます");
  }
  const withLine = tables.filter((table) => lineColumn(table) !== null);
  if (withLine.length === 0) {
    lines.push("お客さまへの LINE 送信: 定義に LINE の列がないため使っていません");
  } else if (settings.lineToken === "") {
    lines.push("お客さまへの LINE 送信: 定義に LINE の列がありますが、設定「LINE チャネルアクセストークン」が空のため使えません。使うときは設定シートのその行を埋めてください");
  } else {
    lines.push("お客さまへの LINE 送信: 使えます（" + withLine.map((table) => table.name + "「" + lineColumn(table).name + "」").join("、") + "）");
  }
  return lines;
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
  ["通知先", ""],
  ["Slack Webhook URL", ""],
  ["Discord Webhook URL", ""],
  ["LINE チャネルアクセストークン", ""],
  ["LINE 送信先 ID", ""],
  ["通知するテーブル", ""],
  ["通知する操作", "登録, 更新, 削除"],
  ["自分の操作は通知しない", "FALSE"],
  ["通知の文面", DEFAULT_NOTIFY_TEMPLATE],
  ["LINE 定型文", DEFAULT_LINE_TEMPLATE_TEXT],
  ["LINE を送れる人", ""],
  ["担当者名", ""],
  ["画面の URL", ""],
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
    def_("顧客", "LINE", "LINE", false, "", false, false, "", "LINE 公式アカウントの友だち。表示名から選びます"),
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
    LINE: "",
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
 * 1.1: LINE の列（友だちの表示名）、詳細の「LINE で送る」と送信の欄、LINE の送信履歴。
 */

const OP_LABELS = { contains: "を含む", eq: "と等しい", ne: "と等しくない", gt: "より大きい", gte: "以上", lt: "より小さい", lte: "以下", between: "の範囲", in: "のいずれか", empty: "が空", notEmpty: "が空でない" };
const LONG_TEXT_PREVIEW = 40;
const TYPE_INPUT = { 文字: "text", メール: "email", 電話: "tel", URL: "url", 日付: "date", 日時: "datetime-local" };
/** 型ごとに使える条件（当たりようのない条件は出さない） */
const TEXT_OPS = ["contains", "eq", "ne", "empty", "notEmpty"];
const ORDER_OPS = ["eq", "ne", "gt", "gte", "lt", "lte", "between", "empty", "notEmpty"];
const CHOICE_OPS = ["eq", "ne", "empty", "notEmpty"];
const FILTER_OPS = { 文字: TEXT_OPS, 長文: TEXT_OPS, メール: TEXT_OPS, 電話: TEXT_OPS, URL: TEXT_OPS, 数値: ORDER_OPS, 金額: ORDER_OPS, 日付: ORDER_OPS, 日時: ORDER_OPS, 選択: CHOICE_OPS, 参照: CHOICE_OPS, 複数選択: ["in", "contains", "empty", "notEmpty"], チェック: ["eq"], LINE: ["empty", "notEmpty"] };
const FILTER_PLACEHOLDER = "範囲は 最小,最大。いずれかは 値1,値2";
/** 友だちがこれより多いときは、LINE の欄の上に表示名で探す欄を出す */
const LINE_SEARCH_THRESHOLD = 500;
const LINE_NO_FRIENDS_NOTE = "友だちがまだいません。LINE 公式アカウントを友だち追加していただくと、ここに表示名が出ます。";

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

/** 一覧・詳細に出す文字。参照は refs（{ 列名: { ID: 表示名 } }）で、LINE は opts.friends で表示名に */
function labelFor(column, value, refs, opts) {
  if (column.type === "参照") {
    const id = value === null || value === undefined ? "" : String(value);
    if (id === "") return "";
    const map = refs && refs[column.name] ? refs[column.name] : {};
    return map[id] !== undefined ? map[id] : id;
  }
  if (column.type === "LINE") return friendLabel(opts && Array.isArray(opts.friends) ? opts.friends : [], value);
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
  else if (column.type === "チェック") value = boolOf(filter.value, false) ? "はい" : "いいえ";
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

function choiceField_(list) {
  return '<select name="value"><option value="">（未選択）</option>' + list.map((o) => '<option value="' + attr_(o.value) + '">' + escapeHtml(o.label) + "</option>").join("") + "</select>";
}

/** 値の欄。型に合う入力にする（op が between のときは main.js が text に戻す） */
function valueField_(column, options) {
  const type = column === null ? "文字" : column.type;
  if (type === "選択" || type === "複数選択") return choiceField_(column.options.map((o) => ({ value: o, label: o })));
  if (type === "チェック") return '<select name="value"><option value="はい">はい</option><option value="いいえ">いいえ</option></select>';
  if (type === "参照") {
    const list = Array.isArray(options) ? options : null;
    if (list === null) return '<select name="value"></select><span class="sa-note">候補を読み込んでいます…</span>';
    return choiceField_(list.map((o) => ({ value: o.id, label: o.label })));
  }
  if (type === "日付") return '<input type="date" name="value">';
  if (type === "日時") return '<input type="datetime-local" name="value">';
  if (type === "数値" || type === "金額") return '<input type="text" inputmode="decimal" name="value" placeholder="範囲は 最小,最大">';
  return '<input type="text" name="value" placeholder="' + attr_(FILTER_PLACEHOLDER) + '">';
}

/** column は選ばれている列（null なら先頭の列）、options は 参照 の列の候補 [{ id, label }]（無ければ null） */
function renderFilterPanel(table, column, options) {
  const chosen = column === null || column === undefined ? (table.columns.length > 0 ? table.columns[0] : null) : column;
  const columns = table.columns.map((c) => '<option value="' + attr_(c.name) + '"' + (chosen !== null && c.name === chosen.name ? " selected" : "") + ">" + escapeHtml(c.name) + "</option>").join("");
  const names = chosen === null ? TEXT_OPS : FILTER_OPS[chosen.type] || TEXT_OPS;
  const ops = names.map((op) => '<option value="' + op + '">' + escapeHtml(OP_LABELS[op]) + "</option>").join("");
  return '<form class="sa-filter-panel" data-form="filter"><label>列<select name="column">' + columns + "</select></label><label>条件<select name=\"op\">" + ops + "</select></label><label>値" + valueField_(chosen, options) + '</label><button type="submit" class="sa-btn">条件を足す</button></form>';
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

/** api_get の refs（{ 列名: 表示名 }）を、labelFor の形（{ 列名: { ID: 表示名 } }）にする */
function nestRefs_(row, refs) {
  const nested = {};
  Object.keys(refs || {}).forEach((name) => {
    nested[name] = {};
    nested[name][String(row[name])] = refs[name];
  });
  return nested;
}

/** 詳細に出ている文字を { 列名: 文字 } に（定型文の {列名} の置き換えに使う） */
function detailValues(table, row, refs, opts) {
  const nested = nestRefs_(row, refs);
  const values = {};
  table.columns.forEach((column) => {
    values[column.name] = labelFor(column, row[column.name], nested, opts || {});
  });
  return values;
}

/** 本文の残り字数（LINE は 5,000 字まで） */
function remainingText(text) {
  const rest = LINE_TEXT_LIMIT - String(text === null || text === undefined ? "" : text).length;
  return rest >= 0 ? "残り " + withCommas(rest) + " 字" : withCommas(-rest) + " 字多すぎます";
}

/** 送る前の確認の文 */
function lineConfirmText(name) {
  const who = String(name === null || name === undefined ? "" : name).trim();
  return (who === "" ? "この方" : who + " さん") + "の LINE に送ります。送ったあとは取り消せません。よろしいですか？";
}

/** 詳細の下の「LINE の送信履歴」（新しい順） */
function renderLineHistory(history) {
  const list = Array.isArray(history) ? history : [];
  const items =
    list.length === 0
      ? '<p class="sa-note">まだ送っていません</p>'
      : '<ol class="sa-line-history-list">' + list.map((h) => '<li><div class="sa-muted">' + escapeHtml(h.at) + " " + escapeHtml(h.sender) + '</div><div class="sa-pre">' + escapeHtml(h.text) + "</div></li>").join("") + "</ol>";
  return '<section class="sa-line-history"><h3>LINE の送信履歴</h3>' + items + "</section>";
}

/** 「LINE で送る」を押したあとの欄。friend は送り先、view は state.view、line は state.line */
function renderLinePanel(friend, view, line, ai) {
  const templates = Array.isArray(line.templates) ? line.templates : [];
  const select =
    templates.length > 0
      ? '<label class="sa-field">定型文<select data-field="line-template"><option value="">（定型文を選ぶ）</option>' + templates.map((t, i) => '<option value="' + i + '">' + escapeHtml(t.title) + "</option>").join("") + "</select></label>"
      : "";
  const draft = ai
    ? '<div class="sa-ai"><input type="text" data-field="line-intent" value="' + attr_(view.lineIntent || "") + '" placeholder="用件（例: 先日の内見のお礼と、次の候補日を 2 つ聞く）" aria-label="AI に伝える用件"><button type="button" class="sa-btn" data-action="line-draft"' + (view.lineDrafting ? " disabled" : "") + ">" + (view.lineDrafting ? "下書きしています…" : "AI で下書き") + "</button></div>"
    : "";
  const leftovers = leftoverPlaceholders(view.lineText || "");
  const warn = leftovers.length > 0 ? '<div class="sa-note sa-warn">置き換わっていない印があります: ' + escapeHtml(leftovers.join(" ")) + "。送る前に直してください</div>" : "";
  const error = view.lineError ? '<div class="sa-error" role="alert">' + escapeHtml(view.lineError) + "</div>" : "";
  return (
    '<section class="sa-line" aria-labelledby="sa-line-title"><h3 id="sa-line-title">LINE で送る</h3>' +
    '<p class="sa-note">送り先: ' + escapeHtml(friend.name) + " さん。今月の送信数: " + escapeHtml(line.monthCount || 0) + " 通</p>" +
    select +
    draft +
    '<textarea data-field="line-text" rows="8" maxlength="' + LINE_TEXT_LIMIT + '" aria-label="送る本文">' + escapeHtml(view.lineText || "") + "</textarea>" +
    '<div class="sa-note" data-role="line-count" aria-live="polite">' + escapeHtml(remainingText(view.lineText || "")) + "</div>" +
    warn +
    error +
    '<div class="sa-actions"><button type="button" class="sa-btn sa-btn-primary" data-action="line-send"' + (view.lineSending ? " disabled" : "") + ">" + (view.lineSending ? "送っています…" : "送る") + "</button></div></section>"
  );
}

/** refs は { 列名: 表示名 }（api_get の形）。opts.friends・opts.line（state.line）・opts.view（state.view）は 1.1 から */
function renderDetail(table, row, refs, opts) {
  const flat = nestRefs_(row, refs);
  const friends = Array.isArray(opts.friends) ? opts.friends : [];
  const shown = Object.assign({}, opts, { friends: friends });
  const rows = table.columns.map((c) => "<dt>" + escapeHtml(c.name) + "</dt><dd>" + valueHtml_(c, row, flat, shown) + "</dd>").join("");
  const system = '<dt class="sa-muted">ID</dt><dd class="sa-muted">' + escapeHtml(row.ID) + '</dd><dt class="sa-muted">作成</dt><dd class="sa-muted">' + escapeHtml(row.作成日時 || "") + '</dd><dt class="sa-muted">更新</dt><dd class="sa-muted">' + escapeHtml(row.更新日時 || "") + " " + escapeHtml(row.更新者 || "") + "</dd>";
  const line = opts.line || { canSend: false, templates: [], monthCount: 0 };
  const view = opts.view || {};
  const column = lineColumn(table);
  const friend = column === null ? null : findFriend(friends, row[column.name]);
  const canLine = line.canSend === true && friend !== null && !friend.blocked;
  const buttons =
    (opts.canEdit ? '<button type="button" class="sa-btn" data-action="edit">編集</button><button type="button" class="sa-btn sa-btn-danger" data-action="delete">削除</button>' : "") +
    (canLine ? '<button type="button" class="sa-btn" data-action="line-open" aria-expanded="' + (view.lineOpen === true ? "true" : "false") + '">LINE で送る</button>' : "") +
    (opts.ai ? '<button type="button" class="sa-btn sa-btn-quiet" data-action="ai-summary"' + (opts.summaryLoading ? " disabled" : "") + ">AI 要約</button>" : "");
  const summary = opts.summaryLoading ? '<div class="sa-summary sa-muted">要約しています…</div>' : opts.summary ? '<div class="sa-summary"><div class="sa-pre">' + escapeHtml(opts.summary) + "</div></div>" : "";
  const panel = canLine && view.lineOpen === true ? renderLinePanel(friend, view, line, opts.ai === true) : "";
  const history = column === null ? "" : renderLineHistory(view.history);
  const title = labelFor(table.columns.find((c) => c.name === table.display) || { name: "ID", type: "文字" }, row[table.display], flat, shown) || row.ID;
  return '<div class="sa-detail"><header class="sa-drawer-head"><h2 id="sa-drawer-title">' + escapeHtml(title) + '</h2><button type="button" class="sa-close" data-action="close" aria-label="閉じる">×</button></header><div class="sa-actions">' + buttons + "</div>" + summary + panel + "<dl>" + rows + system + "</dl>" + history + "</div>";
}

/** 参照の候補はサーバー側で先頭 2,000 件に切られる（gas_web.js の OPTIONS_LIMIT）。切れているときは欄の下に出す */
const OPTIONS_TRUNCATED_NOTE = "候補が多いため、表示名の順で先頭の 2,000 件だけを出しています。";

/** LINE の欄。新しく選べるのはブロック中でない友だち。いまの値はブロック中や一覧に無い ID でも残す */
function lineSelect_(column, value, id, describe, friends) {
  const current = value === null || value === undefined ? "" : String(value);
  const list = friends.filter((f) => !f.blocked || f.id === current);
  const known = list.some((f) => f.id === current);
  const options = ['<option value="">（未選択）</option>'];
  if (current !== "" && !known) options.push('<option value="' + attr_(current) + '" selected>' + escapeHtml(current) + "</option>");
  list.forEach((f) => {
    options.push('<option value="' + attr_(f.id) + '"' + (f.id === current ? " selected" : "") + ">" + escapeHtml(f.name + (f.blocked ? "（ブロック中）" : "")) + "</option>");
  });
  const search = friends.length > LINE_SEARCH_THRESHOLD ? '<input type="search" class="sa-line-search" data-line-search="' + attr_(column.name) + '" placeholder="表示名で探す" aria-label="LINE の友だちを表示名で探す">' : "";
  const empty = friends.length === 0 ? '<div class="sa-note">' + LINE_NO_FRIENDS_NOTE + "</div>" : "";
  return search + '<select name="' + attr_(column.name) + '" id="' + attr_(id) + '"' + describe + ">" + options.join("") + "</select>" + empty;
}

function fieldHtml_(column, values, errors, options, truncated, friends) {
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
    if (truncated && truncated[column.name] === true) input += '<div class="sa-note">' + OPTIONS_TRUNCATED_NOTE + "</div>";
  } else if (column.type === "LINE") {
    input = lineSelect_(column, value, id, describe, friends);
  } else if (column.type === "数値" || column.type === "金額") {
    input = '<input type="text" inputmode="' + (column.type === "金額" ? "numeric" : "decimal") + '" name="' + attr_(column.name) + '" id="' + attr_(id) + '" value="' + attr_(value === null || value === undefined ? "" : value) + '"' + describe + ">";
  } else {
    const type = TYPE_INPUT[column.type] || "text";
    const v = column.type === "日時" && value ? String(value).replace(" ", "T") : value;
    input = '<input type="' + type + '" name="' + attr_(column.name) + '" id="' + attr_(id) + '" value="' + attr_(v === null || v === undefined ? "" : v) + '"' + describe + ">";
  }
  return '<div class="sa-field' + (error ? " sa-field-error" : "") + '"><label for="' + attr_(id) + '">' + escapeHtml(column.name) + (column.required ? ' <span class="sa-required">必須</span>' : "") + "</label>" + input + (column.note ? '<div class="sa-note">' + escapeHtml(column.note) + "</div>" : "") + (error ? '<div class="sa-error" id="' + attr_(errId) + '">' + escapeHtml(error) + "</div>" : "") + "</div>";
}

/** options は { 参照の列名: [{ id, label }] }、opts.optionsTruncated は { 参照の列名: true }、opts.friends は LINE の友だち */
function renderForm(table, values, errors, options, opts) {
  const friends = Array.isArray(opts.friends) ? opts.friends : [];
  const fields = table.columns.map((c) => fieldHtml_(c, values || {}, errors || {}, options || {}, opts.optionsTruncated || {}, friends)).join("");
  const title = opts.isNew ? table.name + " を登録" : table.name + " を編集";
  return '<form class="sa-form" data-form="record" novalidate><header class="sa-drawer-head"><h2 id="sa-drawer-title">' + escapeHtml(title) + '</h2><button type="button" class="sa-close" data-action="close" aria-label="閉じる">×</button></header>' + fields + '<div class="sa-actions"><button type="submit" class="sa-btn sa-btn-primary">' + (opts.isNew ? "登録" : "保存") + '</button><button type="button" class="sa-btn sa-btn-quiet" data-action="close">やめる</button></div></form>';
}

function renderToolbar(state) {
  const table = currentTable(state);
  if (table === null) return "";
  const ai = state.ai ? '<div class="sa-ai"><input type="text" data-field="ai" value="' + attr_(state.aiText) + '" placeholder="言葉で絞り込む（例: 先月連絡した取引中の顧客）"><button type="button" class="sa-btn" data-action="ai-filter">AI で絞り込み</button></div>' + (state.aiExplanation ? '<div class="sa-ai-note">' + escapeHtml(state.aiExplanation) + "</div>" : "") : "";
  return '<div class="sa-toolbar"><input type="search" class="sa-search" data-field="q" value="' + attr_(state.q) + '" placeholder="検索" aria-label="検索"><button type="button" class="sa-btn sa-btn-quiet" data-action="toggle-filters" aria-expanded="' + (state.filterPanel ? "true" : "false") + '">絞り込み</button>' + (state.user.canEdit ? '<button type="button" class="sa-btn sa-btn-primary" data-action="new">新規</button>' : "") + '<button type="button" class="sa-btn sa-btn-quiet" data-action="csv">CSV</button>' + (state.loading ? '<span class="sa-spinner" aria-label="読み込み中"></span>' : "") + "</div>" + ai + (state.filterPanel ? renderFilterPanel(table, state.filterColumn ? findColumn(table, state.filterColumn) : null, state.filterOptions) : "") + renderFilterChips(table, state.filters, state.refs);
}

function renderList(state) {
  const table = currentTable(state);
  if (table === null) return "";
  if (state.total === 0) return '<p class="sa-empty">' + (state.loading ? "読み込んでいます…" : "該当する記録はありません") + "</p>";
  const opts = { dateFormat: state.dateFormat, friends: state.line.friends };
  return renderTable(table, state.rows, state.refs, state.sort, opts) + renderCards(table, state.rows, state.refs, opts) + renderPager(state.total, state.page, state.pageSize);
}

function renderDrawer(state) {
  const table = currentTable(state);
  if (table === null || state.view === null) return "";
  let inner = "";
  if (state.view.kind === "detail") {
    inner = renderDetail(table, state.view.row, state.view.refs, { dateFormat: state.dateFormat, canEdit: state.user.canEdit, ai: state.ai, summary: state.view.summary, summaryLoading: state.view.summaryLoading, friends: state.line.friends, line: state.line, view: state.view });
  } else {
    inner = renderForm(table, state.view.values, state.view.errors, state.view.options, { isNew: state.view.isNew, id: state.view.id, optionsTruncated: state.view.optionsTruncated, friends: state.line.friends });
  }
  return '<div class="sa-backdrop" data-action="close"></div><aside class="sa-drawer" role="dialog" aria-modal="true" aria-labelledby="sa-drawer-title">' + inner + "</aside>";
}

function csvBox_(state) {
  if (state.csv === null) return "";
  return '<section class="sa-csv"><header class="sa-drawer-head"><h2 id="sa-drawer-title">CSV</h2><button type="button" class="sa-close" data-action="csv-close" aria-label="閉じる">×</button></header><p>ファイルとして保存できない環境では、下の内容をコピーして .csv として保存してください。</p><div class="sa-actions"><button type="button" class="sa-btn" data-action="copy-csv">コピー</button></div><textarea readonly rows="8">' + escapeHtml(state.csv) + "</textarea></section>";
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
 * 1.1: state.line（LINE の友だち・定型文・送れるか・今月の送信数・担当者名）と、詳細の送信欄。URL のハッシュの読み書き。
 */
function normalizeLine_(line) {
  const source = line && typeof line === "object" ? line : {};
  return {
    enabled: source.enabled === true,
    friends: Array.isArray(source.friends) ? source.friends : [],
    templates: Array.isArray(source.templates) ? source.templates : [],
    canSend: source.canSend === true,
    monthCount: Number(source.monthCount) || 0,
    staffName: String(source.staffName || ""),
  };
}

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
    filterColumn: "",
    filterOptions: null,
    aiText: "",
    aiExplanation: "",
    view: null,
    csv: null,
    line: normalizeLine_(null),
  };
}

function currentTable(state) {
  for (let i = 0; i < state.tables.length; i += 1) if (state.tables[i].name === state.current) return state.tables[i];
  return null;
}

/** URL のハッシュ（#<テーブル>/<ID>。# は無くてもよい）を読む。読めなければ null */
function parseHash(hash) {
  const text = String(hash === null || hash === undefined ? "" : hash).replace(/^#/, "");
  const at = text.lastIndexOf("/");
  if (at <= 0 || at === text.length - 1) return null;
  try {
    return { table: decodeURIComponent(text.slice(0, at)), id: decodeURIComponent(text.slice(at + 1)) };
  } catch (error) {
    return null;
  }
}

/** 詳細を開いているときの URL のハッシュ（# は付けない） */
function hashFor(table, id) {
  return encodeURIComponent(String(table)) + "/" + encodeURIComponent(String(id));
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
      line: normalizeLine_(data.line),
    });
  }
  if (type === "select-table") {
    if (!state.tables.some((t) => t.name === action.name)) return state;
    return assign_(state, { current: action.name, q: "", filters: [], sort: null, page: 1, rows: [], total: 0, refs: {}, view: null, filterPanel: false, filterColumn: "", filterOptions: null, aiText: "", aiExplanation: "", csv: null, error: "", notice: "" });
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
  if (type === "filter-column") return assign_(state, { filterColumn: String(action.column || ""), filterOptions: Array.isArray(action.options) ? action.options : null });
  if (type === "ai-text") return assign_(state, { aiText: String(action.text || "") });
  if (type === "ai-explanation") return assign_(state, { aiExplanation: String(action.text || "") });
  if (type === "open-detail") {
    return assign_(state, {
      view: { kind: "detail", id: action.row ? action.row.ID : "", row: action.row, refs: action.refs || {}, summary: "", summaryLoading: false, history: Array.isArray(action.history) ? action.history : [], lineOpen: false, lineText: "", lineIntent: "", lineError: "", lineSending: false, lineDrafting: false },
      error: "",
      notice: "",
    });
  }
  if (type === "open-form") {
    return assign_(state, { view: { kind: "form", isNew: action.isNew === true, id: action.id || "", seenUpdatedAt: action.seenUpdatedAt || "", values: action.values || {}, errors: {}, options: action.options || {}, optionsTruncated: action.optionsTruncated || {} }, error: "", notice: "" });
  }
  if (type === "form-errors") return withView_(state, { errors: action.errors || {} });
  if (type === "form-values") return withView_(state, { values: action.values || {} });
  if (type === "summary-loading") return withView_(state, { summaryLoading: action.on === true });
  if (type === "summary") return withView_(state, { summary: String(action.text || ""), summaryLoading: false });
  if (type === "line-toggle") return state.view === null ? state : withView_(state, { lineOpen: state.view.lineOpen !== true, lineError: "" });
  if (type === "line-text") return withView_(state, { lineText: String(action.text || "") });
  if (type === "line-intent") return withView_(state, { lineIntent: String(action.text || "") });
  if (type === "line-drafting") return withView_(state, { lineDrafting: action.on === true, lineError: "" });
  if (type === "line-sending") return withView_(state, { lineSending: action.on === true, lineError: "" });
  if (type === "line-error") return withView_(state, { lineError: String(action.message || ""), lineSending: false, lineDrafting: false });
  if (type === "line-sent") {
    const next = withView_(state, { history: Array.isArray(action.history) ? action.history : [], lineText: "", lineIntent: "", lineError: "", lineSending: false, lineOpen: false });
    return assign_(next, { line: Object.assign({}, next.line, { monthCount: Number(action.monthCount) || 0 }) });
  }
  if (type === "close") return assign_(state, { view: null });
  if (type === "csv") return assign_(state, { csv: action.text === null || action.text === undefined ? null : String(action.text) });
  return state;
}

// ===== api-memory.js =====
/**
 * 見本ページ用の api。GAS に触らず、見本のテンプレをブラウザの中の配列で動かす。ページを閉じれば消える。
 * 1.1: 顧客の先頭 8 件に架空の LINE の友だちを結びつけ（8 人目はブロック中）、「送る」は送ったことにして履歴に足す。
 */

const DEMO_EMAIL = "demo@example.com";
const DEMO_PAGE_SIZE = 20;
const DELAY_MS = 120;
/** 見本の友だちの表示名（架空）。最後の 1 人はブロック中 */
const DEMO_FRIEND_NAMES = ["はるか", "けんた", "みさき", "ゆうと", "あかり", "そうた", "りな", "だいき"];

function delay_(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), DELAY_MS));
}

/** 見本の友だちのユーザー ID（U と 32 桁の 16 進） */
function demoLineId_(index) {
  const hex = (index + 1).toString(16);
  return "U" + "0".repeat(32 - hex.length) + hex;
}

function memoryApi(templateName) {
  const name = templateName || "顧客管理";
  const template = TEMPLATES[name];
  const tables = parseDefinition(template.definition).tables;
  const store = {};
  const lastIds = {};
  const friendRows = DEMO_FRIEND_NAMES.map((friendName, i) => ({ userId: demoLineId_(i), name: friendName, state: i === DEMO_FRIEND_NAMES.length - 1 ? BLOCKED_STATE : FRIEND_STATE }));
  const friends = friendsForScreen(friendRows);
  const templates = parseLineTemplates(DEFAULT_LINE_TEMPLATE_TEXT).templates;
  const sendLog = [];
  tables.forEach((t) => {
    store[t.name] = (template.tables[t.name] || []).map((r) => Object.assign({}, r));
    const column = lineColumn(t);
    if (column === null) return;
    store[t.name].slice(0, friendRows.length).forEach((row, i) => {
      row[column.name] = friendRows[i].userId;
    });
  });
  const lineEnabled = tables.some((t) => lineColumn(t) !== null);

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

  /** 1 件の記録の送信履歴（新しい順・20 件まで） */
  function historyFor(tableName, id) {
    const out = [];
    for (let i = sendLog.length - 1; i >= 0 && out.length < HISTORY_LIMIT; i -= 1) {
      const entry = sendLog[i];
      if (entry.table === tableName && entry.id === id) out.push({ at: entry.at, sender: entry.sender, text: entry.text, result: entry.result });
    }
    return out;
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
    bootstrap: wrap(() => ({
      appName: "見本: " + name,
      tables: tables,
      errors: [],
      user: { email: DEMO_EMAIL, canEdit: true },
      ai: true,
      pageSize: DEMO_PAGE_SIZE,
      dateFormat: "yyyy-MM-dd",
      today: toDateKey(new Date()),
      line: { enabled: lineEnabled, friends: lineEnabled ? friends : [], templates: lineEnabled ? templates : [], canSend: lineEnabled, monthCount: sendLog.length, staffName: "見本" },
    })),
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
      return { row: Object.assign({}, found.row), refs: flat, history: historyFor(table.name, found.row.ID) };
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
    lineSend: wrap((tableName, id, text) => {
      const table = tableOf(tableName);
      const column = lineColumn(table);
      if (column === null) throw new Error(LINE_MESSAGES.noColumn);
      const problem = lineTextError(text);
      if (problem !== "") throw new Error(problem);
      const found = find(table, id);
      const userId = textOf(found.row[column.name]);
      if (userId === "") throw new Error(LINE_MESSAGES.noFriend);
      const friend = findFriend(friends, userId);
      if (friend === null) throw new Error(LINE_MESSAGES.unknown);
      if (friend.blocked) throw new Error(LINE_MESSAGES.blocked);
      // 見本は送ったことにするだけ（LINE には何も届かない）
      sendLog.push({ table: table.name, id: found.row.ID, at: formatStamp(new Date()), sender: DEMO_EMAIL, text: String(text).trim(), result: SENT });
      return { history: historyFor(table.name, found.row.ID), monthCount: sendLog.length };
    }),
    aiDraft: wrap((tableName, id, intent) => {
      const table = tableOf(tableName);
      const words = textOf(intent);
      if (words === "") throw new Error(LINE_MESSAGES.emptyIntent);
      const found = find(table, id);
      const title = textOf(found.row[table.display]) || found.row.ID;
      return { text: title + " 様\n\nいつもお世話になっております。見本の担当です。\n（見本の下書き）用件「" + words + "」に沿って、実物では記録の内容から AI が敬体で下書きを作ります。送る前に読み直して整えてください。" };
    }),
    readHash: () => Promise.resolve(typeof window !== "undefined" && window.location ? String(window.location.hash || "").replace(/^#/, "") : ""),
    writeHash: (hash) => {
      try {
        if (typeof window === "undefined" || !window.history || !window.history.replaceState) return;
        const base = window.location.pathname + window.location.search;
        window.history.replaceState(null, "", hash ? base + "#" + hash : base);
      } catch (error) {
        // 見本のページで履歴を書けなくても、動きは変わらない
      }
    },
  };
}

// ===== main.js =====
/**
 * 画面の組み立て。state と api をつなぐ。DOM に触るのはこのファイルだけ。
 * mountSheetApp(root, api) → { getState, dispatch, load }
 * 1.1: URL のハッシュ #<テーブル>/<ID> で詳細を直接開く（通知の URL から来たとき）。詳細の「LINE で送る」。
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
          // type=search や select は setSelectionRange を持たない
        }
      }
    }
  }

  function dispatch(action) {
    state = reduce(state, action);
    paint();
  }

  function messageOf(error) {
    return error && error.message ? error.message : String(error);
  }

  function fail(error) {
    dispatch({ type: "error", message: messageOf(error) });
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

  /** 画面の外の URL のハッシュ（読み書きは api に任せる: 実物は api-gas.js、見本は location）。api に無ければ何もしない */
  function writeHash(hash) {
    if (typeof api.writeHash === "function") api.writeHash(hash);
  }

  function readHash() {
    if (typeof api.readHash !== "function") return Promise.resolve("");
    return Promise.resolve(api.readHash()).catch(() => "");
  }

  /** fromHash: URL のハッシュから開いたとき。記録が無ければ、誤りを出してからハッシュを消す（読み直しで同じ誤りを繰り返さない） */
  function openDetail(id, fromHash) {
    const table = state.current;
    return api
      .get(table, id)
      .then((result) => {
        dispatch({ type: "open-detail", row: result.row, refs: result.refs, history: result.history });
        writeHash(hashFor(table, result.row.ID));
      })
      .catch((error) => {
        fail(error);
        if (fromHash === true) writeHash("");
      });
  }

  function closeView() {
    dispatch({ type: "close" });
    writeHash("");
  }

  /** 参照の列の候補をまとめて取る */
  function optionsFor(table) {
    const refColumns = table.columns.filter((c) => c.type === "参照");
    return Promise.all(refColumns.map((c) => api.options(table.name, c.name))).then((results) => {
      const options = {};
      const truncated = {};
      refColumns.forEach((c, i) => {
        options[c.name] = results[i].options;
        if (results[i].truncated === true) truncated[c.name] = true;
      });
      return { options: options, truncated: truncated };
    });
  }

  function openForm(isNew, row) {
    const table = currentTable(state);
    optionsFor(table)
      .then((got) => {
        const values = isNew ? validate(table, {}, { today: state.today, isNew: true }).values : Object.assign({}, row);
        dispatch({ type: "open-form", isNew: isNew, id: isNew ? "" : row.ID, seenUpdatedAt: isNew ? "" : row.更新日時, values: values, options: got.options, optionsTruncated: got.truncated });
        const first = root.querySelector(".sa-form input, .sa-form select, .sa-form textarea");
        if (first) first.focus();
      })
      .catch(fail);
  }

  /** フォームの欄を { 列名: 値 } に。列名に " があっても壊れないよう、選択子ではなく elements から集める */
  function collect(form, table) {
    const record = {};
    table.columns.forEach((column) => {
      const fields = Array.prototype.filter.call(form.elements, (el) => el.name === column.name);
      if (column.type === "複数選択") {
        record[column.name] = fields.filter((el) => el.checked).map((el) => el.value);
      } else if (column.type === "チェック") {
        record[column.name] = fields.length > 0 && fields[0].checked === true;
      } else {
        let value = fields.length > 0 ? fields[0].value : "";
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
        closeView();
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
        closeView();
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
    let raw = String(form.elements.namedItem("value").value || "").trim();
    // datetime-local の値は "2026-09-16T10:30" なので、API の形（空白区切り）に直す
    const chosen = table === null ? null : findColumn(table, column);
    if (chosen !== null && chosen.type === "日時" && op !== "between") raw = raw.replace("T", " ");
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

  /** 絞り込みの列が変わったら、その型に合う条件と入力欄に描き直す（参照は候補を取ってから） */
  function filterColumn(name) {
    const table = currentTable(state);
    const column = table === null ? null : findColumn(table, name);
    if (column === null || column.type !== "参照") {
      dispatch({ type: "filter-column", column: name, options: null });
      return;
    }
    api
      .options(table.name, name)
      .then((result) => dispatch({ type: "filter-column", column: name, options: result.options }))
      .catch((error) => {
        dispatch({ type: "filter-column", column: name, options: null });
        fail(error);
      });
  }

  /** 範囲（between）は「最小,最大」の 2 つを入れるので、値の欄はそのあいだだけ text にする */
  function swapRangeField(form, op) {
    const field = form.elements.namedItem("value");
    if (!field || field.tagName !== "INPUT") return;
    if (field.dataset.type === undefined) {
      field.dataset.type = field.type;
      field.dataset.placeholder = field.placeholder;
    }
    field.type = op === "between" ? "text" : field.dataset.type;
    field.placeholder = op === "between" ? "最小,最大（例: 2026-08-01,2026-08-31）" : field.dataset.placeholder;
  }

  /** 詳細の記録に結びついた LINE の友だち（無ければ null） */
  function lineFriend() {
    const table = currentTable(state);
    const view = state.view;
    const column = table === null ? null : lineColumn(table);
    if (column === null || !view || view.kind !== "detail") return null;
    return findFriend(state.line.friends, view.row[column.name]);
  }

  /** 定型文を選んだら、詳細に出ている値と担当者名で置き換えて本文の欄に入れる */
  function applyTemplate(value) {
    const view = state.view;
    if (value === "" || !view || view.kind !== "detail") return;
    const template = state.line.templates[Number(value)];
    if (!template) return;
    const values = detailValues(currentTable(state), view.row, view.refs, { dateFormat: state.dateFormat, friends: state.line.friends });
    dispatch({ type: "line-text", text: fillLineTemplate(template.body, { values: values, staffName: state.line.staffName }) });
  }

  function lineDraft() {
    const view = state.view;
    if (!view || view.kind !== "detail" || view.lineDrafting) return;
    const intent = view.lineIntent.trim();
    if (intent === "") {
      dispatch({ type: "line-error", message: LINE_MESSAGES.emptyIntent });
      return;
    }
    dispatch({ type: "line-drafting", on: true });
    api
      .aiDraft(state.current, view.id, intent)
      .then((result) => {
        dispatch({ type: "line-text", text: result.text });
        dispatch({ type: "line-drafting", on: false });
      })
      .catch((error) => dispatch({ type: "line-error", message: messageOf(error) }));
  }

  function lineSend() {
    const view = state.view;
    if (!view || view.kind !== "detail" || view.lineSending) return;
    if (view.lineText.trim() === "") {
      dispatch({ type: "line-error", message: LINE_MESSAGES.emptyText });
      return;
    }
    const friend = lineFriend();
    if (!window.confirm(lineConfirmText(friend ? friend.name : ""))) return;
    dispatch({ type: "line-sending", on: true });
    api
      .lineSend(state.current, view.id, view.lineText)
      .then((result) => {
        dispatch({ type: "line-sent", history: result.history, monthCount: result.monthCount });
        // 送れたが履歴に書けなかったときは、送り直さないよう server の文（note）を出す
        dispatch({ type: "notice", message: result && result.note ? String(result.note) : "LINE を送りました" });
      })
      .catch((error) => dispatch({ type: "line-error", message: messageOf(error) }));
  }

  /** 友だちが多いときの「表示名で探す」欄: 合わない option を隠す（選んでいるものは隠さない） */
  function filterLineOptions(input) {
    const form = input.form;
    const select = form ? form.elements.namedItem(input.dataset.lineSearch) : null;
    if (!select || !select.options) return;
    const word = input.value.trim().toLowerCase();
    Array.prototype.forEach.call(select.options, (option) => {
      option.hidden = word !== "" && option.value !== "" && !option.selected && option.text.toLowerCase().indexOf(word) < 0;
    });
  }

  root.addEventListener("click", (event) => {
    const el = event.target.closest("[data-action]");
    if (!el || !root.contains(el)) return;
    const action = el.dataset.action;
    if (action === "select-table") {
      clearTimeout(searchTimer);
      dispatch({ type: "select-table", name: el.dataset.table });
      writeHash("");
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
    else if (action === "close") closeView();
    else if (action === "csv") exportCsv();
    else if (action === "csv-close") dispatch({ type: "csv", text: null });
    else if (action === "copy-csv") copyCsv();
    else if (action === "ai-filter") aiFilter();
    else if (action === "ai-summary") aiSummary();
    else if (action === "line-open") dispatch({ type: "line-toggle" });
    else if (action === "line-draft") lineDraft();
    else if (action === "line-send") lineSend();
    else if (action === "dismiss-error") dispatch({ type: "error", message: "" });
  });

  root.addEventListener("keydown", (event) => {
    const target = event.target;
    const data = target.dataset || {};
    if (event.key === "Enter" && data.field === "ai") {
      event.preventDefault();
      state = reduce(state, { type: "ai-text", text: target.value });
      aiFilter();
    } else if (event.key === "Enter" && data.field === "line-intent") {
      event.preventDefault();
      state = reduce(state, { type: "line-intent", text: target.value });
      lineDraft();
    } else if (event.key === "Enter" && data.lineSearch !== undefined) {
      // 探す欄で Enter を押しても、フォームを送らない
      event.preventDefault();
    } else if (event.key === "Enter" && data.action === "open") {
      openDetail(data.id);
    } else if (event.key === "Escape" && state.view !== null) {
      closeView();
    }
  });

  root.addEventListener("input", (event) => {
    const target = event.target;
    const data = target.dataset || {};
    const field = data.field || "";
    if (field === "q") {
      const value = target.value;
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        dispatch({ type: "set-q", q: value });
        load();
      }, SEARCH_WAIT_MS);
    } else if (field === "ai") {
      state = reduce(state, { type: "ai-text", text: target.value });
    } else if (field === "line-text") {
      // 打つたびに描き直すとカーソルが飛ぶので、状態だけ変えて残り字数の表示を直接直す
      state = reduce(state, { type: "line-text", text: target.value });
      const counter = root.querySelector('[data-role="line-count"]');
      if (counter) counter.textContent = remainingText(target.value);
    } else if (field === "line-intent") {
      state = reduce(state, { type: "line-intent", text: target.value });
    } else if (data.lineSearch !== undefined) {
      filterLineOptions(target);
    }
  });

  root.addEventListener("change", (event) => {
    const el = event.target;
    if (el && el.dataset && el.dataset.field === "line-template") {
      applyTemplate(el.value);
      return;
    }
    const form = el ? el.form : null;
    if (!form || form.dataset.form !== "filter") return;
    if (el.name === "column") filterColumn(el.value);
    else if (el.name === "op") swapRangeField(form, el.value);
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
      return readHash();
    })
    .then((hash) => {
      // 通知の URL（#<テーブル>/<ID>）から来たら、そのテーブルに切り替えて詳細を開く
      const target = parseHash(hash);
      if (target !== null && state.bootErrors.length === 0 && state.tables.some((t) => t.name === target.table)) {
        dispatch({ type: "select-table", name: target.table });
        load();
        openDetail(target.id, true);
        return undefined;
      }
      return load();
    })
    .catch(fail);

  return { getState: () => state, dispatch: dispatch, load: load };
}

window.SheetApp = { mount: function (root) { return mountSheetApp(root, memoryApi()); } };
