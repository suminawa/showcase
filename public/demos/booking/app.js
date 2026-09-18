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

/** 画面に出す前に HTML として安全な文字にする。null / undefined は "" */
function escapeHtml(value) {
  return String(value === null || value === undefined ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** すべてのセルが空の行か */
function isBlankRow(row) {
  const cells = Array.isArray(row) ? row : [];
  for (let i = 0; i < cells.length; i += 1) {
    if (textOf(cells[i]) !== "") return false;
  }
  return true;
}

/** 見出し行から列の位置を名前で探す。無ければ -1 */
function headerIndex(header, name) {
  const row = Array.isArray(header) ? header : [];
  for (let i = 0; i < row.length; i += 1) {
    if (textOf(row[i]) === name) return i;
  }
  return -1;
}

/** "booking: ○○シートの N 行目: message" の形にする */
function errorAt(sheet, row, message) {
  return "booking: " + sheet + "シートの " + row + " 行目: " + message;
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

/** 全角数字を半角にしてから整数として読む。整数でないか範囲外なら null */
function integerInRange(raw, min, max) {
  const n = Number(toHalfWidth(textOf(raw)));
  if (!Number.isInteger(n) || n < min || n > max) return null;
  return n;
}

/** Date を Asia/Tokyo の時刻 "HH:mm" にする（時刻だけのセルもこれで読む）。Date でない・不正な日付は null */
function jstTimeOf(date) {
  const at = shifted_(date);
  if (at === null) return null;
  return pad2(at.getUTCHours()) + ":" + pad2(at.getUTCMinutes());
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

/** "HH:mm" を 0 時からの分にする */
function minutesOf(time) {
  const parts = String(time).split(":");
  return Number(parts[0]) * 60 + Number(parts[1]);
}

/** 0 時からの分を "HH:mm" にする */
function timeOf(minutes) {
  return pad2(Math.floor(minutes / 60)) + ":" + pad2(minutes % 60);
}

/**
 * "YYYY-MM-DD" の日付・"HH:mm" の時刻に分を足す（負の数は引く）。日をまたいだ分は date 側に繰り上げ・繰り下げる。
 * 空きの計算で締切や枠の終わりを出すのに使う。文字だけの計算で、Date は日付の境をまたぐときだけ Date.UTC 経由で使う。
 */
function addMinutes(dateKey, time, minutes) {
  const total = minutesOf(time) + minutes;
  const dayOffset = Math.floor(total / 1440);
  const remainder = total - dayOffset * 1440;
  return { date: addDays(dateKey, dayOffset), time: timeOf(remainder) };
}

/** "YYYY-MM-DD" の曜日。0（日）〜6（土） */
function weekdayOf(dateKey) {
  const parts = String(dateKey).split("-").map(Number);
  return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2])).getUTCDay();
}

/** "YYYY-MM-DD" の曜日を漢字 1 字にする（日・月・火・水・木・金・土）。メールの日付表示・通知文の短い日付が共通で使う道具 */
function weekdayKanjiOf(dateKey) {
  const names = ["日", "月", "火", "水", "木", "金", "土"];
  return names[weekdayOf(dateKey)];
}

/**
 * 画面とメールに出す長い日付。設定「日付の書式」に沿って区切りを選び、曜日を添える：
 * "2026-10-03（土）"（`yyyy/MM/dd` なら "2026/10/03（土）"）。
 * 日付の形（YYYY-MM-DD）でない字は、そのまま返す（空は空のまま）
 */
function longDateOf(dateKey, dateFormat) {
  const key = textOf(dateKey);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return key;
  const shown = textOf(dateFormat) === "yyyy/MM/dd" ? key.split("-").join("/") : key;
  return shown + "（" + weekdayKanjiOf(key) + "）";
}

/** 件名・通知文に使う短い日付（0 埋めなし、曜日は全角カッコ）："9/20（土）" */
function shortDateOf(dateKey) {
  if (dateKey === "") return "";
  const parts = String(dateKey).split("-");
  return Number(parts[1]) + "/" + Number(parts[2]) + "（" + weekdayKanjiOf(dateKey) + "）";
}

/** "YYYY-MM-DD" に日数を足す（負の数は引く）。月・年をまたいでもよい */
function addDays(dateKey, days) {
  const parts = String(dateKey).split("-").map(Number);
  const at = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] + days));
  return at.getUTCFullYear() + "-" + pad2(at.getUTCMonth() + 1) + "-" + pad2(at.getUTCDate());
}

// ===== services.js =====
/**
 * 「サービス」シート（任意。予約の種類ごとの所要時間・説明・受付可否）を読む。
 * 誤りは敬体の文で `booking: ` から始めて集め、誤りのあった行は services に含めない。
 */

/**
 * 「サービス」シートの 2 次元配列（1 行目が見出し）→ { services, errors }。
 * サービス名が空・重複、所要時間が範囲外の行は services に含めない
 */
function parseServices(values) {
  const rows = Array.isArray(values) ? values : [];
  const services = [];
  const errors = [];
  if (rows.length < 2) return { services: services, errors: errors };

  const header = Array.isArray(rows[0]) ? rows[0] : [];
  const col = {
    name: headerIndex(header, "サービス"),
    minutes: headerIndex(header, "所要時間"),
    description: headerIndex(header, "説明"),
    active: headerIndex(header, "受付"),
  };

  const seen = new Set();

  for (let i = 1; i < rows.length; i += 1) {
    const row = Array.isArray(rows[i]) ? rows[i] : [];
    if (isBlankRow(row)) continue;
    const rowNum = i + 1;
    let ok = true;

    const name = textOf(row[col.name]);
    if (name === "") {
      errors.push(errorAt("サービス", rowNum, "サービス名をご記入ください"));
      ok = false;
    } else if (seen.has(name)) {
      errors.push(errorAt("サービス", rowNum, "サービス名「" + name + "」が重複しています"));
      ok = false;
    }

    const minutesText = textOf(row[col.minutes]);
    let minutes = null;
    if (minutesText !== "") {
      minutes = integerInRange(row[col.minutes], 5, 480);
      if (minutes === null) {
        errors.push(errorAt("サービス", rowNum, "所要時間は 5〜480 の整数にしてください"));
        ok = false;
      }
    }

    const description = textOf(row[col.description]);
    const active = boolOf(row[col.active], true);

    if (ok) {
      if (name !== "") seen.add(name);
      services.push({ name: name, minutes: minutes, description: description, active: active });
    }
  }

  return { services: services, errors: errors };
}

/** サービスの一覧から名前が一致するものを探す。前後の空白は無視。無ければ null */
function findService(services, name) {
  const list = Array.isArray(services) ? services : [];
  const target = textOf(name);
  for (let i = 0; i < list.length; i += 1) {
    const service = list[i];
    if (service && textOf(service.name) === target) return service;
  }
  return null;
}

// ===== validate.js =====
/**
 * 予約フォームの入力を検査する。
 * 値は textOf で前後の空白を落とし、メールと電話は toHalfWidth で半角にする。
 * 誤りは項目ごとに 1 つ、敬体の文で返す（キーは name email phone note date start service）。
 * 画面（demo を含む）でも同じ検査を動かすので、GAS のグローバルには触らない。
 */

/** 入力の上限（字数） */
const LIMITS = { name: 40, email: 100, phone: 20, note: 500 };

/**
 * input は画面から届く生の値（{ name, email, phone, note, date, start, service }）。
 * ctx = { settings, services }（services は「サービス」シートの一覧。空でもよい）。
 * 返り値: { ok: true, value } | { ok: false, errors }
 */
function validateReservation(input, ctx) {
  const row = input === null || input === undefined ? {} : input;
  const context = ctx === null || ctx === undefined ? {} : ctx;
  const settings = context.settings === null || context.settings === undefined ? {} : context.settings;
  const services = Array.isArray(context.services) ? context.services : [];
  const errors = {};

  const name = textOf(row.name);
  if (name === "") errors.name = "お名前をご記入ください";
  else if (name.length > LIMITS.name) errors.name = "お名前は " + LIMITS.name + " 字までにしてください";

  const email = toHalfWidth(textOf(row.email));
  if (email === "") errors.email = "メールアドレスをご記入ください";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "メールアドレスの形式をご確認ください";
  else if (email.length > LIMITS.email) errors.email = "メールアドレスは " + LIMITS.email + " 字までにしてください";

  const phone = toHalfWidth(textOf(row.phone));
  if (phone === "") {
    if (settings.phoneRequired === true) errors.phone = "電話番号をご記入ください";
  } else if (phone.length > LIMITS.phone) {
    errors.phone = "電話番号は " + LIMITS.phone + " 字までにしてください";
  }

  const note = textOf(row.note);
  if (note.length > LIMITS.note) errors.note = "ご要望は " + LIMITS.note + " 字までにしてください";

  const date = textOf(row.date);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.date = "日付をお選びください";

  const start = textOf(row.start);
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(start)) errors.start = "時間をお選びください";

  // サービスが 1 つも登録されていなければ、その項目自体が無いものとして扱う
  let service = textOf(row.service);
  if (services.length > 0) {
    const found = findService(services, service);
    if (!found || found.active !== true) errors.service = "サービスをお選びください";
  } else {
    service = "";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors: errors };

  return {
    ok: true,
    value: { date: date, start: start, service: service, name: name, email: email, phone: phone, note: note },
  };
}

// ===== settings.js =====
/**
 * 「設定」シート（項目・値の 2 列）を読む。空欄は既定値、知らない行は無視する。
 * 誤りは敬体の文で集め、誤りのあった項目だけ既定値のまま返す（他の項目はそのまま読み込む）。
 */

/** 設定シートに並べるキー。README.ja.md と samples/設定.csv はこの並びと一致させる */
const SETTING_KEYS = [
  "店名",
  "連絡先メール",
  "電話",
  "住所",
  "何日先まで",
  "何時間前まで",
  "キャンセルは何時間前まで",
  "電話を必須にする",
  "同じメールの予約数",
  "注意書き",
  "確認メールの件名",
  "確認メールの本文",
  "リマインドの件名",
  "リマインドの本文",
  "リマインドの時刻",
  "カレンダー ID",
  "Slack Webhook URL",
  "Discord Webhook URL",
  "LINE チャネルアクセストークン",
  "LINE 送信先 ID",
  "テーマ色",
  "日付の書式",
];

/** 既定の確認メール本文（設計書 §4）。{お名前} などの差し込みは mail.js が埋める */
const DEFAULT_CONFIRM_BODY = [
  "{お名前} 様",
  "",
  "ご予約を受け付けました。",
  "",
  "日時: {日付} {時間}",
  "内容: {サービス}",
  "受付番号: {受付番号}",
  "",
  "ご都合が悪くなった場合は、下の URL からキャンセルできます。",
  "{キャンセルURL}",
  "",
  "{店名}",
  "{電話}",
  "{住所}",
].join("\n");

/** 既定のリマインド本文。差し込みは確認メールと同じ */
const DEFAULT_REMIND_BODY = [
  "{お名前} 様",
  "",
  "明日のご予約のご案内です。",
  "",
  "日時: {日付} {時間}",
  "内容: {サービス}",
  "受付番号: {受付番号}",
  "",
  "ご都合が悪くなった場合は、下の URL からキャンセルできます。",
  "{キャンセルURL}",
  "",
  "{店名}",
  "{電話}",
  "{住所}",
].join("\n");

const DEFAULT_SETTINGS = {
  shopName: "予約ページ",
  contactEmail: "",
  phone: "",
  address: "",
  daysAhead: 30,
  leadHours: 24,
  cancelHours: 24,
  phoneRequired: false,
  maxPerEmail: 3,
  notice: "",
  confirmSubject: "ご予約を受け付けました（{店名}）",
  confirmBody: DEFAULT_CONFIRM_BODY,
  remindSubject: "明日のご予約のご案内（{店名}）",
  remindBody: DEFAULT_REMIND_BODY,
  remindHour: 18,
  calendarId: "",
  slackUrl: "",
  discordUrl: "",
  lineToken: "",
  lineTo: "",
  themeColor: "#2f6f5e",
  dateFormat: "yyyy-MM-dd",
};

/** 「日付の書式」に使える値 */
const SETTINGS_DATE_FORMATS = ["yyyy-MM-dd", "yyyy/MM/dd"];
/** 「テーマ色」の形。# + 3 桁か 6 桁の 16 進 */
const THEME_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/**
 * rows は「設定」シートの 2 次元配列。1 行目が見出し（1 列目が「項目」）でも、無くてもよい。
 * 空欄は既定値、知らない項目は無視する。
 */
function parseSettings(rows) {
  const settings = Object.assign({}, DEFAULT_SETTINGS);
  const errors = [];
  const list = Array.isArray(rows) ? rows : [];

  for (let i = 0; i < list.length; i += 1) {
    const row = Array.isArray(list[i]) ? list[i] : [];
    const key = textOf(row[0]);
    if (i === 0 && key === "項目") continue;
    const value = row.length > 1 ? row[1] : "";
    const raw = textOf(value);

    if (key === "店名") {
      if (raw !== "") settings.shopName = raw;
    } else if (key === "連絡先メール") {
      if (raw !== "") {
        if (raw.indexOf("@") < 0) errors.push("booking: 設定「連絡先メール」の形式をご確認ください");
        else settings.contactEmail = raw;
      }
    } else if (key === "電話") {
      if (raw !== "") settings.phone = raw;
    } else if (key === "住所") {
      if (raw !== "") settings.address = raw;
    } else if (key === "何日先まで") {
      if (raw !== "") {
        const n = integerInRange(raw, 1, 180);
        if (n === null) errors.push("booking: 設定「何日先まで」は 1〜180 にしてください");
        else settings.daysAhead = n;
      }
    } else if (key === "何時間前まで") {
      if (raw !== "") {
        const n = integerInRange(raw, 0, 720);
        if (n === null) errors.push("booking: 設定「何時間前まで」は 0〜720 にしてください");
        else settings.leadHours = n;
      }
    } else if (key === "キャンセルは何時間前まで") {
      if (raw !== "") {
        const n = integerInRange(raw, 0, 720);
        if (n === null) errors.push("booking: 設定「キャンセルは何時間前まで」は 0〜720 にしてください");
        else settings.cancelHours = n;
      }
    } else if (key === "電話を必須にする") {
      settings.phoneRequired = boolOf(value, DEFAULT_SETTINGS.phoneRequired);
    } else if (key === "同じメールの予約数") {
      if (raw !== "") {
        const n = integerInRange(raw, 1, 20);
        if (n === null) errors.push("booking: 設定「同じメールの予約数」は 1〜20 にしてください");
        else settings.maxPerEmail = n;
      }
    } else if (key === "注意書き") {
      if (raw !== "") settings.notice = raw;
    } else if (key === "確認メールの件名") {
      if (raw !== "") settings.confirmSubject = raw;
    } else if (key === "確認メールの本文") {
      if (raw !== "") settings.confirmBody = raw;
    } else if (key === "リマインドの件名") {
      if (raw !== "") settings.remindSubject = raw;
    } else if (key === "リマインドの本文") {
      if (raw !== "") settings.remindBody = raw;
    } else if (key === "リマインドの時刻") {
      if (raw !== "") {
        const n = integerInRange(raw, 0, 23);
        if (n === null) errors.push("booking: 設定「リマインドの時刻」は 0〜23 にしてください");
        else settings.remindHour = n;
      }
    } else if (key === "カレンダー ID") {
      if (raw !== "") settings.calendarId = raw;
    } else if (key === "Slack Webhook URL") {
      if (raw !== "") settings.slackUrl = raw;
    } else if (key === "Discord Webhook URL") {
      if (raw !== "") settings.discordUrl = raw;
    } else if (key === "LINE チャネルアクセストークン") {
      if (raw !== "") settings.lineToken = raw;
    } else if (key === "LINE 送信先 ID") {
      if (raw !== "") settings.lineTo = raw;
    } else if (key === "テーマ色") {
      if (raw !== "") {
        if (!THEME_COLOR_PATTERN.test(raw)) errors.push("booking: 設定「テーマ色」は #2f6f5e のような形にしてください");
        else settings.themeColor = raw;
      }
    } else if (key === "日付の書式") {
      if (raw !== "") {
        if (SETTINGS_DATE_FORMATS.indexOf(raw) < 0) errors.push("booking: 設定「日付の書式」は yyyy-MM-dd か yyyy/MM/dd にしてください");
        else settings.dateFormat = raw;
      }
    }
  }

  return { settings: settings, errors: errors };
}

// ===== rules.js =====
/**
 * 「枠」シート（受け付ける曜日・時間・間隔・定員・サービス）と「休み」シート（受け付けない日）を読む。
 * 誤りは敬体の文で `booking: ` から始めて集め、誤りのあった行は rules / closed に含めない。
 */

/** 曜日の文字 → 0（日）〜6（土） */
const WEEKDAY_WORDS = { 日: 0, 月: 1, 火: 2, 水: 3, 木: 4, 金: 5, 土: 6 };

/** 「平日」「土日」「毎日」のように、1 語でまとめて複数の曜日を指す言い方 */
const WEEKDAY_GROUPS_ = {
  平日: [1, 2, 3, 4, 5],
  土日: [0, 6],
  毎日: [0, 1, 2, 3, 4, 5, 6],
};

/**
 * 曜日の文字を読む。「火, 水, 金」「平日」「土日」「毎日」「月曜」「月・火」「月曜日」などを受ける。
 * 区切りはカンマ・読点・中黒・空白。語の末尾の `曜日` `曜` は落とす。知らない語があれば null。
 * 返す配列は重複のない昇順（0〜6）
 */
function parseWeekdays(text) {
  const normalized = toHalfWidth(textOf(text));
  if (normalized === "") return null;
  const tokens = normalized.split(/[,、・\s]+/).filter((token) => token !== "");
  if (tokens.length === 0) return null;

  const found = new Set();
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (Object.prototype.hasOwnProperty.call(WEEKDAY_GROUPS_, token)) {
      const group = WEEKDAY_GROUPS_[token];
      for (let j = 0; j < group.length; j += 1) found.add(group[j]);
      continue;
    }
    const stripped = token.replace(/曜日$|曜$/, "");
    if (!Object.prototype.hasOwnProperty.call(WEEKDAY_WORDS, stripped)) return null;
    found.add(WEEKDAY_WORDS[stripped]);
  }
  return Array.from(found).sort((a, b) => a - b);
}

/**
 * 時刻を "HH:mm" にする。"10:00" "9:30" "10時" "10時30分" "10:00:00"、全角の書き方、
 * セルの Date（時刻だけ使う。Asia/Tokyo）を受ける。読めなければ null
 */
function parseTime(value) {
  if (value === null || value === undefined) return null;
  if (Object.prototype.toString.call(value) === "[object Date]") {
    // 時刻だけのセルも Date で来るので、dates.js の JST 変換をそのまま使う
    return jstTimeOf(value);
  }

  const text = toHalfWidth(textOf(value));
  if (text === "") return null;

  let matched = text.match(/^([01]?\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/);
  if (matched) return pad2(Number(matched[1])) + ":" + matched[2];

  matched = text.match(/^([01]?\d|2[0-3])時(?:([0-5]?\d)分)?$/);
  if (matched) return pad2(Number(matched[1])) + ":" + pad2(matched[2] === undefined ? 0 : Number(matched[2]));

  return null;
}

/**
 * 「枠」シートの 2 次元配列（1 行目が見出し）→ { rules, errors }。
 * 空行は飛ばす。誤りのあった行は rules に含めない
 */
function parseRules(values) {
  const rows = Array.isArray(values) ? values : [];
  const rules = [];
  const errors = [];
  if (rows.length < 2) return { rules: rules, errors: errors };

  const header = Array.isArray(rows[0]) ? rows[0] : [];
  const col = {
    weekday: headerIndex(header, "曜日"),
    date: headerIndex(header, "日付"),
    start: headerIndex(header, "開始"),
    end: headerIndex(header, "終了"),
    interval: headerIndex(header, "間隔"),
    capacity: headerIndex(header, "定員"),
    service: headerIndex(header, "サービス"),
  };

  for (let i = 1; i < rows.length; i += 1) {
    const row = Array.isArray(rows[i]) ? rows[i] : [];
    if (isBlankRow(row)) continue;
    const rowNum = i + 1;
    let ok = true;

    const weekdayText = textOf(row[col.weekday]);
    const dateRaw = row[col.date];
    const dateText = textOf(dateRaw);
    let weekdays = [];
    let date = null;

    if (weekdayText === "" && dateText === "") {
      errors.push(errorAt("枠", rowNum, "曜日か日付のどちらかをご記入ください"));
      ok = false;
    } else if (dateText !== "") {
      // 日付があれば曜日より優先する。weekdays は空のまま
      date = toDateKey(dateRaw);
      if (date === null) {
        errors.push(errorAt("枠", rowNum, "日付を読み取れません"));
        ok = false;
      }
    } else {
      weekdays = parseWeekdays(weekdayText);
      if (weekdays === null) {
        errors.push(errorAt("枠", rowNum, "曜日を読み取れません"));
        ok = false;
        weekdays = [];
      }
    }

    const start = parseTime(row[col.start]);
    if (start === null) {
      errors.push(errorAt("枠", rowNum, "開始を読み取れません"));
      ok = false;
    }
    const end = parseTime(row[col.end]);
    if (end === null) {
      errors.push(errorAt("枠", rowNum, "終了を読み取れません"));
      ok = false;
    }
    if (start !== null && end !== null && minutesOf(end) <= minutesOf(start)) {
      errors.push(errorAt("枠", rowNum, "終了は開始より後にしてください"));
      ok = false;
    }

    const intervalText = textOf(row[col.interval]);
    let interval = null;
    if (intervalText === "") {
      errors.push(errorAt("枠", rowNum, "間隔は 5〜480 の整数にしてください"));
      ok = false;
    } else {
      interval = integerInRange(row[col.interval], 5, 480);
      if (interval === null) {
        errors.push(errorAt("枠", rowNum, "間隔は 5〜480 の整数にしてください"));
        ok = false;
      }
    }

    const capacityText = textOf(row[col.capacity]);
    let capacity = 1;
    if (capacityText !== "") {
      const n = integerInRange(row[col.capacity], 0, 99);
      if (n === null) {
        errors.push(errorAt("枠", rowNum, "定員は 0〜99 の整数にしてください"));
        ok = false;
      } else {
        capacity = n;
      }
    }

    const service = textOf(row[col.service]);

    if (ok) {
      rules.push({
        row: rowNum,
        weekdays: weekdays,
        date: date,
        start: start,
        end: end,
        interval: interval,
        capacity: capacity,
        service: service,
      });
    }
  }

  return { rules: rules, errors: errors };
}

/**
 * 「休み」シートの 2 次元配列（1 行目が見出し）→ { closed, errors }。
 * `日付` があればその日だけ、無ければ `開始日`・`終了日` の期間にする
 */
function parseClosedDays(values) {
  const rows = Array.isArray(values) ? values : [];
  const closed = [];
  const errors = [];
  if (rows.length < 2) return { closed: closed, errors: errors };

  const header = Array.isArray(rows[0]) ? rows[0] : [];
  const col = {
    date: headerIndex(header, "日付"),
    from: headerIndex(header, "開始日"),
    to: headerIndex(header, "終了日"),
  };

  for (let i = 1; i < rows.length; i += 1) {
    const row = Array.isArray(rows[i]) ? rows[i] : [];
    if (isBlankRow(row)) continue;
    const rowNum = i + 1;
    const dateText = textOf(row[col.date]);

    if (dateText !== "") {
      const date = toDateKey(row[col.date]);
      if (date === null) {
        errors.push(errorAt("休み", rowNum, "日付を読み取れません"));
        continue;
      }
      closed.push({ from: date, to: date });
      continue;
    }

    const from = toDateKey(row[col.from]);
    if (from === null) {
      errors.push(errorAt("休み", rowNum, "開始日を読み取れません"));
      continue;
    }
    const to = toDateKey(row[col.to]);
    if (to === null) {
      errors.push(errorAt("休み", rowNum, "終了日を読み取れません"));
      continue;
    }
    if (to < from) {
      errors.push(errorAt("休み", rowNum, "終了日は開始日より後にしてください"));
      continue;
    }
    closed.push({ from: from, to: to });
  }

  return { closed: closed, errors: errors };
}

/** dateKey（"YYYY-MM-DD"）が休みの期間のどれかに入っているか（両端を含む） */
function isClosed(closed, dateKey) {
  const list = Array.isArray(closed) ? closed : [];
  for (let i = 0; i < list.length; i += 1) {
    const period = list[i] || {};
    if (dateKey >= period.from && dateKey <= period.to) return true;
  }
  return false;
}

// ===== availability.js =====
/**
 * 空きの計算。「枠」「休み」「予約」と設定から、その日に出す時間と残りの数、カレンダーの日ごとの状態を出す。
 *
 * 日付は "YYYY-MM-DD"、時刻は "HH:mm"、日時は "YYYY-MM-DD HH:mm"（Asia/Tokyo）の文字だけで計算する。
 * 「いま」は必ず now（"YYYY-MM-DD HH:mm"）を引数で受け取り、このファイルからは時計を読まない。
 */

/** 枠を埋めるのは「確定」の予約だけ。人が状態を「キャンセル」に直せばその枠は空く */
const CONFIRMED_STATE_ = "確定";

/** 時刻をキーにした覚え書きを引くとき、Object の元からある名前（constructor など）と取り違えないようにする */
function has_(map, key) {
  return Object.prototype.hasOwnProperty.call(map, key);
}

/** 数として使える値ならそのまま、そうでなければ既定値 */
function numberOr_(value, fallback) {
  return typeof value === "number" && isFinite(value) ? value : fallback;
}

/** 設定の数を 1 つ読む。渡されていない・数でないときは既定値（設定シートの誤りで計算が壊れないように） */
function settingNumber_(settings, key) {
  const source = settings === null || settings === undefined ? {} : settings;
  return numberOr_(source[key], DEFAULT_SETTINGS[key]);
}

/** "YYYY-MM-DD" と "HH:mm" を、比べられる 1 つの文字 "YYYY-MM-DD HH:mm" にする */
function stampOf_(dateKey, time) {
  return dateKey + " " + time;
}

/** 開始の leadHours 時間前（締切）。日をまたぐときは日付も繰り下がる */
function deadlineOf_(dateKey, time, hours) {
  const at = addMinutes(dateKey, time, -hours * 60);
  return stampOf_(at.date, at.time);
}

/**
 * その日に使う「枠」の行を選ぶ。
 * 同じ日付の「日付」の行があればその日はそれだけを使い、曜日の行は見ない（設計書 §2-2）
 */
function rulesForDay_(dateKey, rules) {
  const list = Array.isArray(rules) ? rules : [];
  const dated = [];
  const weekly = [];
  const weekday = weekdayOf(dateKey);

  for (let i = 0; i < list.length; i += 1) {
    const rule = list[i];
    if (rule === null || rule === undefined) continue;
    if (rule.date !== null && rule.date !== undefined && rule.date !== "") {
      if (rule.date === dateKey) dated.push(rule);
      continue;
    }
    if (Array.isArray(rule.weekdays) && rule.weekdays.indexOf(weekday) >= 0) weekly.push(rule);
  }

  return dated.length > 0 ? dated : weekly;
}

/**
 * サービスの絞り込み。サービス名の無い行はいつでも出し、サービス名の付いた行はそのサービスが選ばれているときだけ出す
 * （サービスを選んでいないときに、特定のサービス専用の枠を出さないため）
 */
function matchesService_(rule, serviceName) {
  const bound = textOf(rule.service);
  if (bound === "") return true;
  return serviceName !== "" && bound === serviceName;
}

/**
 * その日に出す枠 → `{ start, end, capacity }[]`（開始の早い順）。休みの日は空。
 * 開始から終了まで間隔ごとに区切り（終了ちょうどに始まる枠は作らない）、枠の終わりは開始＋間隔。
 * 別の行に同じ開始があれば 1 つにまとめ、定員を足して終わりは遅い方にする
 */
function slotsFor(dateKey, rules, closed, serviceName) {
  const date = toDateKey(dateKey);
  if (date === null) return [];
  if (isClosed(closed, date)) return [];

  const name = textOf(serviceName);
  const dayRules = rulesForDay_(date, rules);
  const found = [];
  const indexByStart = {};

  for (let i = 0; i < dayRules.length; i += 1) {
    const rule = dayRules[i];
    if (!matchesService_(rule, name)) continue;

    const interval = numberOr_(rule.interval, 0);
    const startMinutes = minutesOf(rule.start);
    const endMinutes = minutesOf(rule.end);
    if (interval <= 0 || !isFinite(startMinutes) || !isFinite(endMinutes)) continue;

    const capacity = Math.max(0, numberOr_(rule.capacity, 1));
    for (let at = startMinutes; at < endMinutes; at += interval) {
      const start = timeOf(at);
      const finish = at + interval;
      const seen = has_(indexByStart, start) ? indexByStart[start] : undefined;
      if (seen === undefined) {
        indexByStart[start] = found.length;
        found.push({ minutes: at, finish: finish, capacity: capacity });
      } else {
        found[seen].capacity += capacity;
        if (finish > found[seen].finish) found[seen].finish = finish;
      }
    }
  }

  found.sort((a, b) => a.minutes - b.minutes);

  const slots = [];
  for (let i = 0; i < found.length; i += 1) {
    const start = timeOf(found[i].minutes);
    // 終わりが日をまたぐ枠（23:30 開始の 30 分など）は "00:00" 側に回す
    const end = addMinutes(date, start, found[i].finish - found[i].minutes).time;
    slots.push({ start: start, end: end, capacity: found[i].capacity });
  }
  return slots;
}

/**
 * 枠に残りの数を足す → `{ start, end, capacity, remaining }[]`。
 * その日・その開始の「確定」の予約の数を定員から引く（0 より下にはしない）
 */
function remainingFor(slots, reservations, dateKey) {
  const list = Array.isArray(slots) ? slots : [];
  const date = toDateKey(dateKey);
  const rows = Array.isArray(reservations) ? reservations : [];
  const taken = {};

  if (date !== null) {
    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      if (row === null || row === undefined) continue;
      if (textOf(row["状態"]) !== CONFIRMED_STATE_) continue;
      if (toDateKey(row["日付"]) !== date) continue;
      const start = parseTime(row["開始"]);
      if (start === null) continue;
      taken[start] = (has_(taken, start) ? taken[start] : 0) + 1;
    }
  }

  const out = [];
  for (let i = 0; i < list.length; i += 1) {
    const slot = list[i];
    const capacity = Math.max(0, numberOr_(slot.capacity, 0));
    const used = has_(taken, slot.start) ? taken[slot.start] : 0;
    out.push({ start: slot.start, end: slot.end, capacity: capacity, remaining: Math.max(0, capacity - used) });
  }
  return out;
}

/**
 * その枠をいま受け付けられるか。
 * 「何日先まで」の範囲（今日を 1 日目とする）の外は false。開始の「何時間前まで」を過ぎていても false
 */
function isBookable(dateKey, start, now, settings) {
  const date = toDateKey(dateKey);
  const time = parseTime(start);
  const nowStamp = toDateTimeKey(now);
  if (date === null || time === null || nowStamp === null) return false;

  const today = nowStamp.slice(0, 10);
  const daysAhead = settingNumber_(settings, "daysAhead");
  if (date < today) return false;
  if (date > addDays(today, daysAhead - 1)) return false;

  return nowStamp < deadlineOf_(date, time, settingNumber_(settings, "leadHours"));
}

/**
 * その日のカレンダーに出す状態。slots は remainingFor を通した枠。
 * closed（枠が無い・休み）／past（受けられる枠が無い）／full（残り 0）／few（残りのある枠が 2 つ以下）／open
 */
function daySummary(dateKey, slots, now, settings) {
  const list = Array.isArray(slots) ? slots : [];
  if (list.length === 0) return "closed";

  let bookable = 0;
  let withRoom = 0;
  let total = 0;
  for (let i = 0; i < list.length; i += 1) {
    const slot = list[i];
    if (!isBookable(dateKey, slot.start, now, settings)) continue;
    bookable += 1;
    const remaining = Math.max(0, numberOr_(slot.remaining, 0));
    total += remaining;
    if (remaining > 0) withRoom += 1;
  }

  if (bookable === 0) return "past";
  if (total === 0) return "full";
  return withRoom <= 2 ? "few" : "open";
}

/** 今日から「何日先まで」の日ごとの `{ date, status }`。画面のカレンダーはこれを並べる */
function calendarDays(now, settings, rules, closed, reservations, serviceName) {
  const nowStamp = toDateTimeKey(now);
  if (nowStamp === null) return [];

  const today = nowStamp.slice(0, 10);
  const daysAhead = settingNumber_(settings, "daysAhead");
  const days = [];
  for (let i = 0; i < daysAhead; i += 1) {
    const date = addDays(today, i);
    const slots = remainingFor(slotsFor(date, rules, closed, serviceName), reservations, date);
    days.push({ date: date, status: daySummary(date, slots, now, settings) });
  }
  return days;
}

/** ページからキャンセルできるか。開始の「キャンセルは何時間前まで」より前なら true */
function cancelAllowed(reservation, now, settings) {
  const row = reservation === null || reservation === undefined ? {} : reservation;
  const date = toDateKey(row["日付"]);
  const time = parseTime(row["開始"]);
  const nowStamp = toDateTimeKey(now);
  if (date === null || time === null || nowStamp === null) return false;

  return nowStamp < deadlineOf_(date, time, settingNumber_(settings, "cancelHours"));
}

// ===== receipt.js =====
/**
 * 受付番号（その日の連番）。連番は前回の受付番号だけを覚えておけば足りる（日が変われば 001 に戻る）。
 * フォーム受付キット（packages/form-intake-gas/src/receipt.js）からの写し。
 */

/** ("2026-09-14", 3) → "20260914-003"。1000 件目からは桁が増える */
function formatReceipt(dateKey, sequence) {
  const number = Math.max(1, Math.floor(Number(sequence) || 1));
  let text = String(number);
  while (text.length < 3) text = "0" + text;
  return compactDate(dateKey) + "-" + text;
}

/** "20260914-003" → { dateKey: "2026-09-14", sequence: 3 }。読めなければ null */
function parseReceipt(receipt) {
  const text = String(receipt === null || receipt === undefined ? "" : receipt).trim();
  const matched = text.match(/^(\d{4})(\d{2})(\d{2})-(\d+)$/);
  if (!matched) return null;
  return { dateKey: matched[1] + "-" + matched[2] + "-" + matched[3], sequence: Number(matched[4]) };
}

/** 前回の受付番号と今日の日付キーから、次の受付番号を作る */
function nextReceipt(lastReceipt, dateKey) {
  const last = parseReceipt(lastReceipt);
  if (last === null || last.dateKey !== dateKey) return formatReceipt(dateKey, 1);
  return formatReceipt(dateKey, last.sequence + 1);
}

// ===== token.js =====
/**
 * キャンセル用の合い言葉の形と検査。
 * 生成そのものは GAS 側の役目（getUuid() で作った UUID を渡す）なので、ここでは UUID から作る関数だけを持つ。
 */

/** 合い言葉の形：24 桁の英数字（小文字） */
const TOKEN_RE = /^[0-9a-f]{24}$/;

/** UUID（"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"）からハイフンを除き、小文字にして先頭 24 桁にする */
function tokenFromUuid(uuid) {
  const text = String(uuid === null || uuid === undefined ? "" : uuid)
    .replace(/-/g, "")
    .toLowerCase();
  return text.slice(0, 24);
}

/** 値が合い言葉の形をしているか */
function isToken(value) {
  return typeof value === "string" && TOKEN_RE.test(value);
}

// ===== mail.js =====
/**
 * 確認・リマインド・キャンセルのメール文と、店への知らせメールを作る。
 * 差し込みは fillTemplate（{お名前} など）。メールは文字だけで、HTML にはしない。
 */

/**
 * シートのセルに書く前に、数式と誤認される文字列を無害にする。
 * 先頭が = + - @ かタブ・CR・LF なら ' を前置する。空はそのまま（設計書 §7）
 */
function safeCell(value) {
  const text = value === null || value === undefined ? "" : String(value);
  if (text === "") return text;
  return /^[=+\-@\t\r\n]/.test(text) ? "'" + text : text;
}

/**
 * テンプレの {お名前} のような差し込みを置き換える。
 * vars に無い名前は、そのままの字（{…}）で残す
 */
function fillTemplate(template, vars) {
  const map = vars === null || vars === undefined ? {} : vars;
  const text = template === null || template === undefined ? "" : String(template);
  return text.replace(/\{([^{}\n]+)\}/g, function (whole, name) {
    return Object.prototype.hasOwnProperty.call(map, name) ? String(map[name]) : whole;
  });
}

/**
 * メールの差し込み用の値。settings.dateFormat に沿って日付を作り、曜日を付ける。
 * reservation はシートの見出し名をキーにした 1 件（ID 状態 日付 開始 終了 サービス お名前 メール 電話 ご要望）
 */
function varsFor(settings, reservation, cancelUrl) {
  const s = settings === null || settings === undefined ? {} : settings;
  const row = reservation === null || reservation === undefined ? {} : reservation;
  const service = textOf(row["サービス"]);
  return {
    "お名前": textOf(row["お名前"]),
    "日付": longDateOf(row["日付"], s.dateFormat),
    "時間": textOf(row["開始"]) + "〜" + textOf(row["終了"]),
    "サービス": service === "" ? "ご予約" : service,
    "店名": textOf(s.shopName),
    "電話": textOf(s.phone),
    "住所": textOf(s.address),
    "受付番号": textOf(row["ID"]),
    "キャンセルURL": cancelUrl === null || cancelUrl === undefined ? "" : String(cancelUrl),
  };
}

/** 確認メール（設定「確認メールの件名・本文」に差し込む） */
function buildConfirmMail(settings, reservation, cancelUrl) {
  const s = settings === null || settings === undefined ? {} : settings;
  const vars = varsFor(s, reservation, cancelUrl);
  return { subject: fillTemplate(s.confirmSubject, vars), body: fillTemplate(s.confirmBody, vars) };
}

/** 前日リマインドのメール（設定「リマインドの件名・本文」に差し込む） */
function buildRemindMail(settings, reservation, cancelUrl) {
  const s = settings === null || settings === undefined ? {} : settings;
  const vars = varsFor(s, reservation, cancelUrl);
  return { subject: fillTemplate(s.remindSubject, vars), body: fillTemplate(s.remindBody, vars) };
}

/** 店（連絡先メール）へ送る、予約が入ったことの知らせ */
function buildOwnerMail(settings, reservation) {
  const s = settings === null || settings === undefined ? {} : settings;
  const row = reservation === null || reservation === undefined ? {} : reservation;
  const vars = varsFor(s, row, "");
  const lines = [
    "ご予約が入りました。",
    "",
    "日時: " + vars["日付"] + " " + vars["時間"],
    "サービス: " + vars["サービス"],
    "お名前: " + vars["お名前"] + " 様",
    "メール: " + textOf(row["メール"]),
    "電話: " + textOf(row["電話"]),
    "ご要望: " + textOf(row["ご要望"]),
    "受付番号: " + vars["受付番号"],
  ];
  const subject =
    "ご予約が入りました: " + shortDateOf(textOf(row["日付"])) + textOf(row["開始"]) + " " + textOf(row["お名前"]) + " 様";
  return { subject: subject, body: lines.join("\n") };
}

/** お客さまへ送る、キャンセルの確認メール */
function buildCancelMail(settings, reservation) {
  const s = settings === null || settings === undefined ? {} : settings;
  const row = reservation === null || reservation === undefined ? {} : reservation;
  const vars = varsFor(s, row, "");
  const lines = [
    vars["お名前"] + " 様",
    "",
    "ご予約をキャンセルしました。",
    "",
    "日時: " + vars["日付"] + " " + vars["時間"],
    "内容: " + vars["サービス"],
    "",
    vars["店名"],
    vars["電話"],
    vars["住所"],
  ];
  return { subject: fillTemplate("ご予約をキャンセルしました（{店名}）", vars), body: lines.join("\n") };
}

// ===== samples.js =====
/**
 * 見本の店「ひだまり整体院」（架空）。メニュー「見本を入れる」（Task 7）と scripts/samples.mjs（samples/*.csv）、
 * 見本ページ（api-memory.js、Task 9）が使う。同じ today（"YYYY-MM-DD"）から同じ出力になる（乱数を使わない）。
 */

const SHOP_NAME = "ひだまり整体院";

const SAMPLE_PHONE = "045-000-0000";
const SAMPLE_ADDRESS = "横浜市中区みなと町 1-2-3";
const SAMPLE_NOTICE = "初めての方は、開始の 10 分前にお越しください。";

const SERVICE_FIRST = "初回カウンセリング（60 分）";
const SERVICE_REGULAR = "通常の施術";

/** 予約の見本を入れる曜日（火・水・金・土）。weekdayOf と同じ 0（日）〜6（土） */
const SAMPLE_RESERVATION_WEEKDAYS = [2, 3, 5, 6];
/** 予約の見本で使う架空のお客さま。実在の人物ではない */
const SAMPLE_NAMES = ["山川", "田中", "佐藤", "鈴木", "高橋", "伊藤", "渡辺", "中村"];
/** SAMPLE_NAMES のローマ字（メールの見本用） */
const SAMPLE_NAME_ROMAJI = {
  山川: "yamakawa",
  田中: "tanaka",
  佐藤: "sato",
  鈴木: "suzuki",
  高橋: "takahashi",
  伊藤: "ito",
  渡辺: "watanabe",
  中村: "nakamura",
};
/** SAMPLE_NAMES と同じ並びのご要望。空は「ご要望なし」 */
const SAMPLE_WISHES = ["", "初めての利用です。", "", "", "肩こりが気になります。", "", "腰まわりをお願いします。", ""];
/** 何件目（1 始まり）をキャンセル扱いにするか */
const SAMPLE_CANCELLED_AT = 5;
/** キャンセル用の見本トークン（24 桁の英数）の先頭 23 桁。末尾に 1 桁の連番を足す */
const SAMPLE_TOKEN_PREFIX = "0123456789abcdef0123456";

const RESERVATION_HEADER = [
  "ID", "状態", "日付", "開始", "終了", "サービス", "お名前", "メール", "電話",
  "ご要望", "受付日時", "キャンセル日時", "カレンダー", "リマインド", "キャンセル用",
];

function settingsRows_() {
  return [
    ["項目", "値"],
    ["店名", SHOP_NAME],
    ["連絡先メール", ""],
    ["電話", SAMPLE_PHONE],
    ["住所", SAMPLE_ADDRESS],
    ["注意書き", SAMPLE_NOTICE],
  ];
}

function serviceRows_() {
  return [
    ["サービス", "所要時間", "説明", "受付"],
    [SERVICE_FIRST, "60", "初めての方はこちら", "TRUE"],
    [SERVICE_REGULAR, "45", "2 回目以降の方", "TRUE"],
  ];
}

/** 火水金の 2 本（初回・通常）、土（サービス指定なし）、today + 3 日だけの日付指定（曜日は空） */
function ruleRows_(today) {
  return [
    ["曜日", "日付", "開始", "終了", "間隔", "定員", "サービス"],
    ["火, 水, 金", "", "10:00", "13:00", "60", "1", SERVICE_FIRST],
    ["火, 水, 金", "", "14:00", "19:00", "45", "1", SERVICE_REGULAR],
    ["土", "", "10:00", "17:00", "45", "2", ""],
    ["", addDays(today, 3), "10:00", "12:00", "60", "1", ""],
  ];
}

/** today + 5 日の単発休みと、today + 12〜13 日の期間休み */
function closedRows_(today) {
  return [
    ["日付", "開始日", "終了日", "理由"],
    [addDays(today, 5), "", "", "臨時休業"],
    ["", addDays(today, 12), addDays(today, 13), "研修"],
  ];
}

/** addMinutes などが返す { date, time } を "YYYY-MM-DD HH:mm:ss" の文字にする */
function sampleStampOf_(part) {
  return part.date + " " + part.time + ":00";
}

/** 1 件分の予約行。slot は slotsFor が返す { start, end } のどれか */
function reservationRow_(today, index, date, service, slot, cancelled) {
  const sequence = index + 1;
  const name = SAMPLE_NAMES[index];
  const receivedAt = addMinutes(today, "09:00", index * 5);
  const cancelledAt = cancelled ? sampleStampOf_(addMinutes(receivedAt.date, receivedAt.time, 120)) : "";

  return [
    formatReceipt(today, sequence),
    cancelled ? "キャンセル" : "確定",
    date,
    slot.start,
    slot.end,
    service,
    name,
    SAMPLE_NAME_ROMAJI[name] + "@example.com",
    "045-000-00" + pad2(sequence),
    SAMPLE_WISHES[index],
    sampleStampOf_(receivedAt),
    cancelledAt,
    "",
    "",
    SAMPLE_TOKEN_PREFIX + sequence,
  ];
}

/**
 * today + 1 日から先を 1 日ずつ確かめ、曜日が火・水・金・土で休みでない日を 8 つ選ぶ（休みの日は次の日へ）。
 * 火・水・金は初回カウンセリングと通常の施術を交互に、土はサービスを指定しない（枠の §2-2 のとおり）。
 * rules・closed は parseRules / parseClosedDays を通した後の形
 */
function reservationRows_(today, rules, closed) {
  const rows = [RESERVATION_HEADER];
  const total = SAMPLE_NAMES.length;
  const slotTurn = { first: 0, regular: 0, saturday: 0 };
  let weekdayTurn = 0;
  let date = addDays(today, 1);

  while (rows.length - 1 < total) {
    const weekday = weekdayOf(date);
    if (SAMPLE_RESERVATION_WEEKDAYS.indexOf(weekday) >= 0) {
      const isSaturday = weekday === 6;
      const service = isSaturday ? "" : weekdayTurn % 2 === 0 ? SERVICE_FIRST : SERVICE_REGULAR;
      const slots = slotsFor(date, rules, closed, service);
      // slots が空なら休みの日（isClosed）。この日は数えず、次の日へ進む
      if (slots.length > 0) {
        const turnKey = isSaturday ? "saturday" : service === SERVICE_FIRST ? "first" : "regular";
        const slot = slots[Math.min(slotTurn[turnKey], slots.length - 1)];
        slotTurn[turnKey] += 1;
        const index = rows.length - 1;
        rows.push(reservationRow_(today, index, date, service, slot, index + 1 === SAMPLE_CANCELLED_AT));
        if (!isSaturday) weekdayTurn += 1;
      }
    }
    date = addDays(date, 1);
  }

  return rows;
}

/** 見本の店「ひだまり整体院」の全シート。today（"YYYY-MM-DD"）から作る。同じ today なら同じ出力 */
function sampleData(today) {
  const rules = ruleRows_(today);
  const closed = closedRows_(today);
  const { rules: parsedRules } = parseRules(rules);
  const { closed: parsedClosed } = parseClosedDays(closed);

  return {
    settings: settingsRows_(),
    rules: rules,
    closed: closed,
    services: serviceRows_(),
    reservations: reservationRows_(today, parsedRules, parsedClosed),
  };
}

// ===== render.js =====
/**
 * 画面の描画。state から HTML の文字列を作るだけ（DOM に触るのは main.js）。
 * 画面に出す値はすべて escapeHtml / attr_ を通す（シートの文字がそのまま HTML にならないように）。
 * 押せるところは data-action で印をつけ、main.js が委譲で受ける。
 */

/** テーマ色は # と 16 進（3 桁か 6 桁）だけ通す。ほかの値は style に入れない */
const ACCENT_RE = /^#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?$/;
const WEEKDAY_HEADS = ["日", "月", "火", "水", "木", "金", "土"];
/** 空きのある日の印。読み上げには DAY_LABELS の言葉を隠し文字で添える */
const DAY_MARKS = { open: "○", few: "△" };
const DAY_LABELS = { open: "空きあり", few: "残りわずか", full: "満席", closed: "受付なし", past: "受付終了" };
const CONFIRMED_LABEL = "確定";
/** 受付を止めているのに知らせの文が届かなかったときの、控えめな言い方 */
const BOOT_STOPPED_FALLBACK = "ただいま予約を受け付けられません。";

function attr_(value) {
  return escapeHtml(value);
}

/** 読み込み前（boot が null）でも壊れないよう、無ければ空の入れ物を返す */
function shopFrom_(state) {
  const boot = state === null || state === undefined ? null : state.boot;
  return boot && boot.shop ? boot.shop : {};
}

function servicesOf_(state) {
  const boot = state === null || state === undefined ? null : state.boot;
  return boot && Array.isArray(boot.services) ? boot.services : [];
}

function accentStyle_(shop) {
  const color = textOf(shop.themeColor);
  if (!ACCENT_RE.test(color)) return "";
  return ' style="--bk-accent: ' + attr_(color) + '"';
}

/** 読み上げ用の隠し文字（style.css の .bk-sr で見えなくする） */
function srOnly_(text) {
  return '<span class="bk-sr">' + escapeHtml(text) + "</span>";
}

/** "10:00〜10:45"。終わりが無ければ始まりだけ。返り値はエスケープ済み */
function timeRange_(start, end) {
  const from = textOf(start);
  const to = textOf(end);
  return escapeHtml(to === "" ? from : from + "〜" + to);
}

/** "2026-10-03（土） 10:00〜10:45"。日付は dates.js の longDateOf（メールと同じ言い方）。返り値はエスケープ済み */
function whenHtml_(shop, dateKey, start, end) {
  return escapeHtml(longDateOf(dateKey, shop.dateFormat)) + " " + timeRange_(start, end);
}

/** 電話はかけられるようにする。href には数字と + だけを入れる */
function phoneHtml_(phone) {
  const text = textOf(phone);
  if (text === "") return "";
  return '<a class="bk-tel" href="tel:' + attr_(text.replace(/[^0-9+]/g, "")) + '">' + escapeHtml(text) + "</a>";
}

/** rows は [見出し, 中身の HTML] の配列。null の行は出さない（中身は呼ぶ側でエスケープ済み） */
function defList_(className, rows) {
  let items = "";
  for (let i = 0; i < rows.length; i += 1) {
    if (rows[i] === null) continue;
    items += "<dt>" + escapeHtml(rows[i][0]) + "</dt><dd>" + rows[i][1] + "</dd>";
  }
  return '<dl class="' + className + '">' + items + "</dl>";
}

/** 「内容」の行に出す言葉。サービスを選んでいない・登録の無い店は「ご予約」（mail.js の差し込みと同じ） */
function serviceLabel_(service) {
  const text = textOf(service);
  return escapeHtml(text === "" ? "ご予約" : text);
}

function orNone_(value) {
  const text = textOf(value);
  return text === "" ? '<span class="bk-muted">ご記入なし</span>' : escapeHtml(text);
}

function backButton_(label) {
  return '<div class="bk-actions"><button type="button" class="bk-btn bk-btn-quiet" data-action="back">' + escapeHtml(label) + "</button></div>";
}

/** 赤い帯。誤りが無ければ空文字 */
function renderError(state) {
  const message = textOf(state.error);
  if (message === "") return "";
  return (
    '<div class="bk-error" role="alert"><span class="bk-error-text">' + escapeHtml(message) +
    '</span><button type="button" class="bk-error-x" data-action="dismiss-error" aria-label="この知らせを閉じる">×</button></div>'
  );
}

/**
 * 受付を止めている画面。お客さまには当たりさわりのない 1 文とお店の電話だけを出す。
 * 何が起きているかは、お店の方がメニュー「設定を確かめる」でご覧になれる
 */
function bootErrorHtml_(state) {
  const shop = shopFrom_(state);
  const boot = state.boot || {};
  const errors = Array.isArray(boot.errors) ? boot.errors : [];
  const message = textOf(errors[0]) === "" ? BOOT_STOPPED_FALLBACK : textOf(errors[0]);
  const phone = textOf(shop.phone) === "" ? "" : '<p class="bk-boot-tel">' + phoneHtml_(shop.phone) + "</p>";
  return '<section class="bk-step bk-boot-error" role="alert"><h2 class="bk-h2">' + escapeHtml(message) + "</h2>" + phone + "</section>";
}

/** サービスを選ぶ画面（サービスが 2 つ以上のときだけ出る） */
function renderServices(state) {
  const services = servicesOf_(state);
  let items = "";
  for (let i = 0; i < services.length; i += 1) {
    const service = services[i];
    const minutes = service.minutes === null || service.minutes === undefined || service.minutes === ""
      ? ""
      : '<span class="bk-service-minutes">' + escapeHtml(service.minutes) + " 分</span>";
    const description = textOf(service.description) === ""
      ? ""
      : '<span class="bk-service-note">' + escapeHtml(service.description) + "</span>";
    items +=
      '<li><button type="button" class="bk-service" data-action="select-service" data-name="' + attr_(service.name) +
      '"><span class="bk-service-name">' + escapeHtml(service.name) + "</span>" + minutes + description + "</button></li>";
  }
  return '<section class="bk-step"><h2 class="bk-h2">ご希望のサービスをお選びください。</h2><ul class="bk-services">' + items + "</ul></section>";
}

function chosenServiceHtml_(state) {
  const service = textOf(state.service);
  if (service === "") return "";
  return '<p class="bk-chosen">ご希望のサービス：' + escapeHtml(service) + "</p>";
}

/** その月の 1 日から末日までを、日曜はじまりの 7 列に並べる。月の外は "" */
function monthCells_(month) {
  const first = month + "-01";
  const cells = [];
  for (let i = 0; i < weekdayOf(first); i += 1) cells.push("");
  let date = first;
  while (date.slice(0, 7) === month) {
    cells.push(date);
    date = addDays(date, 1);
  }
  while (cells.length % 7 !== 0) cells.push("");
  return cells;
}

function dayCellHtml_(date, marks, today) {
  // 受け付ける範囲の外（days に無い日）と月の外は、押せない空のマスにする
  if (date === "" || !Object.prototype.hasOwnProperty.call(marks, date)) return '<td class="bk-cal-empty"></td>';

  const status = Object.prototype.hasOwnProperty.call(DAY_LABELS, marks[date]) ? marks[date] : "closed";
  const number = Number(date.slice(8, 10));
  const cls = "bk-cal-cell bk-" + status + (date === today ? " bk-today" : "");
  const label = srOnly_(DAY_LABELS[status]);

  // 満席・休み・締切の日は押せない（data-action を付けないので main.js の委譲も拾わない）
  if (!Object.prototype.hasOwnProperty.call(DAY_MARKS, status)) {
    return (
      '<td class="' + cls + '"><button type="button" class="bk-day" data-date="' + attr_(date) +
      '" disabled aria-disabled="true"><span class="bk-day-n">' + number + "</span>" + label + "</button></td>"
    );
  }
  return (
    '<td class="' + cls + '"><button type="button" class="bk-day" data-action="select-date" data-date="' + attr_(date) +
    '"><span class="bk-day-n">' + number + '</span><span class="bk-day-mark" aria-hidden="true">' + DAY_MARKS[status] + "</span>" + label + "</button></td>"
  );
}

/** 月ごとの空きのカレンダー。前後の月は、今日の月と受け付ける最後の日の月で止まる */
function renderCalendar(state) {
  const boot = state.boot || {};
  // 印は選ばれたサービスで数えたもの（state.days）。無ければ読み込みのときのぶんを使う
  const bootDays = Array.isArray(boot.days) ? boot.days : [];
  const days = Array.isArray(state.days) && state.days.length > 0 ? state.days : bootDays;
  const today = textOf(boot.today);
  const month = textOf(state.month) || today.slice(0, 7);
  if (!/^\d{4}-\d{2}$/.test(month)) return "";

  const marks = {};
  for (let i = 0; i < days.length; i += 1) marks[textOf(days[i].date)] = textOf(days[i].status);

  const min = today.slice(0, 7);
  const last = days.length > 0 ? textOf(days[days.length - 1].date).slice(0, 7) : min;
  const max = last < min ? min : last;
  const title = Number(month.slice(0, 4)) + "年" + Number(month.slice(5, 7)) + "月";

  let heads = "";
  for (let i = 0; i < WEEKDAY_HEADS.length; i += 1) heads += '<th scope="col">' + WEEKDAY_HEADS[i] + "</th>";

  const cells = monthCells_(month);
  let body = "";
  for (let i = 0; i < cells.length; i += 7) {
    let row = "";
    for (let j = i; j < i + 7; j += 1) row += dayCellHtml_(cells[j], marks, today);
    body += "<tr>" + row + "</tr>";
  }

  const nav =
    '<div class="bk-cal-nav"><button type="button" class="bk-nav" data-action="month" data-delta="-1"' + (month <= min ? " disabled" : "") +
    '>前の月</button><h3 class="bk-month">' + escapeHtml(title) + '</h3><button type="button" class="bk-nav" data-action="month" data-delta="1"' +
    (month >= max ? " disabled" : "") + ">次の月</button></div>";

  return (
    '<section class="bk-step"><h2 class="bk-h2">ご希望の日をお選びください。</h2>' + chosenServiceHtml_(state) + nav +
    '<table class="bk-cal"><caption class="bk-sr">' + escapeHtml(title) + 'の空き状況</caption><thead><tr>' + heads + "</tr></thead><tbody>" + body + "</tbody></table>" +
    '<p class="bk-legend">○ は空きあり、△ は残りわずかです。押せない日は受け付けていません。</p>' +
    (servicesOf_(state).length >= 2 ? backButton_("サービスを選び直す") : "") + "</section>"
  );
}

function slotItemHtml_(slot) {
  const time = timeRange_(slot.start, slot.end);
  const remaining = Number(slot.remaining);
  if (!(remaining > 0)) {
    return (
      '<li><button type="button" class="bk-slot" disabled aria-disabled="true"><span class="bk-slot-time">' + time +
      '</span><span class="bk-slot-left">満席</span></button></li>'
    );
  }
  return (
    '<li><button type="button" class="bk-slot" data-action="select-slot" data-start="' + attr_(slot.start) +
    '"><span class="bk-slot-time">' + time + '</span><span class="bk-slot-left">残り ' + escapeHtml(remaining) + "</span></button></li>"
  );
}

/** 選んだ日の時間の一覧 */
function renderSlots(state) {
  let body = "";
  if (state.slots === null || state.slots === undefined) {
    body = '<p class="bk-loading">空きを読み込んでいます…</p>';
  } else if (state.slots.length === 0) {
    body = '<p class="bk-empty">この日は受け付けていません。</p>';
  } else {
    let items = "";
    for (let i = 0; i < state.slots.length; i += 1) items += slotItemHtml_(state.slots[i]);
    body = '<ul class="bk-slots">' + items + "</ul>";
  }
  return (
    '<section class="bk-step"><h2 class="bk-h2">' + escapeHtml(shortDateOf(textOf(state.date))) + "の時間をお選びください。</h2>" +
    chosenServiceHtml_(state) + body + backButton_("日を選び直す") + "</section>"
  );
}

/** 入力欄 1 つ。誤りは欄の下に置き、aria-describedby で入力と結ぶ */
function fieldHtml_(spec, values, errors) {
  const id = "bk-f-" + spec.field;
  const errorId = "bk-err-" + spec.field;
  const message = textOf(errors[spec.field]);
  const value = values[spec.field] === null || values[spec.field] === undefined ? "" : String(values[spec.field]);
  const described = message === "" ? "" : ' aria-describedby="' + errorId + '" aria-invalid="true"';
  const badge = spec.required
    ? ' <span class="bk-required">必須</span>'
    : ' <span class="bk-optional">任意</span>';
  const common = ' name="' + spec.field + '" id="' + id + '" maxlength="' + spec.max + '"' + (spec.required ? " required" : "") + described;
  const input = spec.type === "textarea"
    ? "<textarea" + common + ' rows="4">' + escapeHtml(value) + "</textarea>"
    : '<input type="' + spec.type + '"' + common + ' autocomplete="' + spec.autocomplete + '" value="' + attr_(value) + '">';
  const note = message === "" ? "" : '<p class="bk-field-error" id="' + errorId + '">' + escapeHtml(message) + "</p>";
  return (
    '<div class="bk-field' + (message === "" ? "" : " bk-has-error") + '"><label for="' + id + '">' + escapeHtml(spec.label) + badge + "</label>" +
    input + note + "</div>"
  );
}

/** お客さまの情報を書く画面。website は人には見えない欄（埋まっていたら書き込まない） */
function renderForm(state) {
  const shop = shopFrom_(state);
  const values = state.values || {};
  const errors = state.errors || {};
  const slot = state.slot || {};
  const summary = defList_("bk-summary", [
    ["日時", whenHtml_(shop, state.date, slot.start, slot.end)],
    ["内容", serviceLabel_(state.service)],
  ]);
  const notice = textOf(shop.notice) === "" ? "" : '<p class="bk-notice">' + escapeHtml(shop.notice) + "</p>";
  const fields =
    fieldHtml_({ field: "name", label: "お名前", type: "text", autocomplete: "name", max: LIMITS.name, required: true }, values, errors) +
    fieldHtml_({ field: "email", label: "メールアドレス", type: "email", autocomplete: "email", max: LIMITS.email, required: true }, values, errors) +
    fieldHtml_({ field: "phone", label: "電話番号", type: "tel", autocomplete: "tel", max: LIMITS.phone, required: shop.phoneRequired === true }, values, errors) +
    fieldHtml_({ field: "note", label: "ご要望", type: "textarea", max: LIMITS.note, required: false }, values, errors);
  const honeypot =
    '<input type="text" name="website" class="bk-hp" tabindex="-1" autocomplete="off" aria-hidden="true" value="' + attr_(values.website) + '">';
  return (
    '<form class="bk-form" data-form="reserve" novalidate><h2 class="bk-h2">お客さまの情報をご記入ください。</h2>' + summary + notice + fields + honeypot +
    '<div class="bk-actions"><button type="submit" class="bk-btn bk-btn-primary">確認へ</button>' +
    '<button type="button" class="bk-btn bk-btn-quiet" data-action="back">戻る</button></div></form>'
  );
}

/** 送る前の確認。送信中は二重に押せないよう disabled にする */
function renderConfirm(state) {
  const shop = shopFrom_(state);
  const values = state.values || {};
  const slot = state.slot || {};
  const list = defList_("bk-confirm", [
    ["日時", whenHtml_(shop, state.date, slot.start, slot.end)],
    ["内容", serviceLabel_(state.service)],
    ["お名前", escapeHtml(values.name)],
    ["メール", escapeHtml(values.email)],
    ["電話", orNone_(values.phone)],
    ["ご要望", orNone_(values.note)],
  ]);
  const off = state.busy === true ? " disabled" : "";
  const waiting = state.busy === true ? '<p class="bk-busy" role="status">お受けしています。そのままお待ちください。</p>' : "";
  return (
    '<section class="bk-step"><h2 class="bk-h2">ご予約の内容をご確認ください。</h2>' + list + waiting +
    '<div class="bk-actions"><button type="button" class="bk-btn bk-btn-primary" data-action="reserve"' + off + ">この内容で予約する</button>" +
    '<button type="button" class="bk-btn bk-btn-quiet" data-action="back"' + off + ">戻る</button></div></section>"
  );
}

/** 受け付けたあとの画面。メールが送れなかったときは正直に書く */
function renderDone(state) {
  const shop = shopFrom_(state);
  const done = state.done || {};
  const list = defList_("bk-done-list", [
    ["受付番号", escapeHtml(done.id)],
    ["日時", whenHtml_(shop, done.date, done.start, done.end)],
    textOf(done.service) === "" ? null : ["サービス", escapeHtml(done.service)],
  ]);
  const mail = done.mailSent === true
    ? "<p>確認メールをお送りしました。ご予約の取り消しは、メールの URL からお手続きいただけます。</p>"
    : '<p class="bk-caution">受付はできています。確認メールは届いていませんので、この画面の受付番号をお控えください。</p>';
  const phone = textOf(shop.phone) === "" ? "" : "<p>ご不明な点は " + phoneHtml_(shop.phone) + " までお電話ください。</p>";
  return '<section class="bk-step bk-done"><h2 class="bk-h2">ご予約を受け付けました。</h2>' + list + mail + phone + "</section>";
}

/** キャンセルの URL で開いた画面 */
function renderCancel(state) {
  const shop = shopFrom_(state);
  const info = state.cancel || {};
  if (info.found !== true) {
    return (
      '<section class="bk-step"><h2 class="bk-h2">このご予約は見つかりませんでした。</h2>' +
      "<p>メールに書かれた URL を、もう一度お確かめください。</p></section>"
    );
  }

  const reservation = info.reservation || {};
  const list = defList_("bk-confirm", [
    ["受付番号", escapeHtml(reservation.id)],
    ["日時", whenHtml_(shop, reservation.date, reservation.start, reservation.end)],
    textOf(reservation.service) === "" ? null : ["サービス", escapeHtml(reservation.service)],
    ["お名前", escapeHtml(reservation.name)],
  ]);

  let body = "";
  if (textOf(reservation.status) !== CONFIRMED_LABEL) {
    body = "<p>このご予約はすでにキャンセルされています。</p>";
  } else if (info.canCancel === true) {
    const off = state.busy === true ? " disabled" : "";
    body =
      '<p class="bk-caution">キャンセルすると元に戻せません。ご確認のうえ、お進みください。</p>' +
      '<div class="bk-actions"><button type="button" class="bk-btn bk-btn-danger" data-action="cancel"' + off + ">このご予約をキャンセルする</button></div>";
  } else {
    const hours = Number(shop.cancelHours);
    const limit = Number.isFinite(hours) && hours > 0
      ? "キャンセルの受付は開始の " + hours + " 時間前までです。"
      : "このご予約は、ページからのキャンセルの受付を終了しました。";
    const phone = textOf(info.phone) === "" ? textOf(shop.phone) : textOf(info.phone);
    body = "<p>" + escapeHtml(limit + "お電話でご連絡ください。") + "</p>" + (phone === "" ? "" : "<p>" + phoneHtml_(phone) + "</p>");
  }
  return '<section class="bk-step"><h2 class="bk-h2">ご予約の内容</h2>' + list + body + "</section>";
}

function renderCancelled(state) {
  const done = state.done || {};
  const id = textOf(done.id);
  return (
    '<section class="bk-step"><h2 class="bk-h2">ご予約をキャンセルしました。</h2>' +
    (id === "" ? "" : "<p>受付番号：" + escapeHtml(id) + "</p>") +
    "<p>またのご利用をお待ちしております。</p></section>"
  );
}

function stepHtml_(state) {
  const step = state.step;
  if (step === "boot-error") return bootErrorHtml_(state);
  if (step === "service") return renderServices(state);
  if (step === "calendar") return renderCalendar(state);
  if (step === "slots") return renderSlots(state);
  if (step === "form") return renderForm(state);
  if (step === "confirm") return renderConfirm(state);
  if (step === "done") return renderDone(state);
  if (step === "cancel") return renderCancel(state);
  if (step === "cancelled") return renderCancelled(state);
  return '<p class="bk-loading">読み込んでいます…</p>';
}

/** ページ全体。main.js はこの文字列を root に入れ直す */
function renderApp(state) {
  const shop = shopFrom_(state);
  const name = textOf(shop.name) === "" ? "予約ページ" : textOf(shop.name);
  return (
    '<div class="bk-shell"' + accentStyle_(shop) + '><header class="bk-head"><h1 class="bk-title">' + escapeHtml(name) + "</h1></header>" +
    renderError(state) + '<main class="bk-main">' + stepHtml_(state) + "</main></div>"
  );
}

// ===== state.js =====
/**
 * 画面の状態と、それを変える reduce。純粋（DOM にも google にも触らない）。
 * reduce は渡された state を書き換えず、必ず新しい入れ物を返す（変わらないときは同じ state をそのまま返す）。
 *
 * step の流れ:
 *   loading → （boot-error）
 *           → service → calendar → slots → form → confirm → done
 *   キャンセルの URL で開いたときは cancel → cancelled
 */

/** 「戻る」の行き先。calendar から service へはサービスが 2 つ以上のときだけ */
const BACK_TO = { confirm: "form", form: "slots", slots: "calendar", calendar: "service" };

function initialState() {
  return {
    step: "loading",
    boot: null,
    service: "",
    days: [],
    month: "",
    date: "",
    slots: null,
    slot: null,
    values: { name: "", email: "", phone: "", note: "", website: "" },
    errors: {},
    busy: false,
    error: "",
    done: null,
    cancel: null,
  };
}

function next_(state, patch) {
  return Object.assign({}, state, patch);
}

function serviceList_(state) {
  const boot = state === null || state === undefined ? null : state.boot;
  return boot && Array.isArray(boot.services) ? boot.services : [];
}

/**
 * カレンダーの印は、選ばれたサービスで数えたものを使う。
 * bootstrap が返す daysByService にそのサービスが無ければ、サービスを選ぶ前のぶん（days）で代える
 */
function daysFor_(data, service) {
  const boot = data === null || data === undefined ? {} : data;
  const byService = boot.daysByService === null || typeof boot.daysByService !== "object" ? {} : boot.daysByService;
  const name = String(service === null || service === undefined ? "" : service);
  const chosen = Object.prototype.hasOwnProperty.call(byService, name) ? byService[name] : null;
  if (Array.isArray(chosen)) return chosen;
  return Array.isArray(boot.days) ? boot.days : [];
}

/** "2026-09" に月を足し引きする（年をまたいでもよい） */
function shiftMonth_(month, delta) {
  const parts = String(month).split("-");
  const total = Number(parts[0]) * 12 + (Number(parts[1]) - 1) + delta;
  return Math.floor(total / 12) + "-" + pad2((total % 12) + 1);
}

/** 行き来できる月の範囲。今日の月から、受け付ける最後の日の月まで */
function monthRange_(state) {
  const boot = state.boot || {};
  const bootDays = Array.isArray(boot.days) ? boot.days : [];
  const days = Array.isArray(state.days) && state.days.length > 0 ? state.days : bootDays;
  const min = String(boot.today === null || boot.today === undefined ? "" : boot.today).slice(0, 7);
  const last = days.length > 0 ? String(days[days.length - 1].date).slice(0, 7) : min;
  return { min: min, max: last < min ? min : last };
}

function reduce(state, action) {
  const type = action === null || action === undefined ? "" : action.type;

  if (type === "bootstrap") {
    const data = action.data === null || action.data === undefined ? {} : action.data;
    const services = Array.isArray(data.services) ? data.services : [];
    const errors = Array.isArray(data.errors) ? data.errors : [];
    const today = String(data.today === null || data.today === undefined ? "" : data.today);
    let step = "calendar";
    if (errors.length > 0) step = "boot-error";
    else if (services.length >= 2) step = "service";
    // サービスが 1 つだけなら選ぶ画面を出さずに、そのサービスで進める
    const service = services.length === 1 ? String(services[0].name) : "";
    // 読み込み直しでも前の入力が残らないよう、はじめの状態から作り直す
    return Object.assign(initialState(), {
      step: step,
      boot: data,
      service: service,
      days: daysFor_(data, service),
      month: today.slice(0, 7),
    });
  }

  if (type === "select-service") {
    const name = String(action.name === null || action.name === undefined ? "" : action.name);
    const services = serviceList_(state);
    let known = services.length === 0;
    for (let i = 0; i < services.length; i += 1) {
      if (String(services[i].name) === name) known = true;
    }
    if (!known) return state;
    // カレンダーの印も、そのサービスで数えたものに入れ替える
    return next_(state, { service: name, step: "calendar", days: daysFor_(state.boot, name) });
  }

  if (type === "month") {
    if (state.month === "") return state;
    const range = monthRange_(state);
    const moved = shiftMonth_(state.month, Number(action.delta) < 0 ? -1 : 1);
    if (moved < range.min || moved > range.max) return state;
    return next_(state, { month: moved });
  }

  if (type === "select-date") {
    const date = String(action.date === null || action.date === undefined ? "" : action.date);
    return next_(state, { step: "slots", date: date, slots: null, slot: null });
  }

  if (type === "slots") {
    // 日を押し直したあとに届いた古い返事は捨てる
    const date = String(action.date === null || action.date === undefined ? "" : action.date);
    if (date !== state.date) return state;
    return next_(state, { slots: Array.isArray(action.slots) ? action.slots : [], busy: false });
  }

  if (type === "select-slot") {
    const slots = Array.isArray(state.slots) ? state.slots : [];
    const start = String(action.start === null || action.start === undefined ? "" : action.start);
    for (let i = 0; i < slots.length; i += 1) {
      if (String(slots[i].start) === start) return next_(state, { slot: slots[i], step: "form" });
    }
    return state;
  }

  if (type === "input") {
    const field = String(action.field === null || action.field === undefined ? "" : action.field);
    if (!Object.prototype.hasOwnProperty.call(state.values, field)) return state;
    const values = Object.assign({}, state.values);
    values[field] = action.value === null || action.value === undefined ? "" : String(action.value);
    return next_(state, { values: values });
  }

  if (type === "errors") return next_(state, { errors: action.errors === null || action.errors === undefined ? {} : action.errors });
  if (type === "confirm") return next_(state, { step: "confirm" });

  if (type === "back") {
    const to = BACK_TO[state.step];
    if (to === undefined) return state;
    if (to === "service" && serviceList_(state).length < 2) return state;
    return next_(state, { step: to });
  }

  if (type === "busy") return next_(state, { busy: action.on === true });
  // サーバーから返事が届いた action は、押せるように busy を下ろす
  if (type === "done") return next_(state, { step: "done", done: action.result === undefined ? null : action.result, busy: false });
  if (type === "error") return next_(state, { error: String(action.message === null || action.message === undefined ? "" : action.message), busy: false });
  if (type === "dismiss-error") return next_(state, { error: "" });
  if (type === "cancel-info") return next_(state, { step: "cancel", cancel: action.data === undefined ? null : action.data, busy: false });
  if (type === "cancelled") {
    const id = String(action.id === null || action.id === undefined ? "" : action.id);
    return next_(state, { step: "cancelled", done: { id: id }, busy: false });
  }

  return state;
}

// ===== api-memory.js =====
/**
 * 見本ページ用の api。GAS には触らず、見本の店「ひだまり整体院」のデータをブラウザの中の配列で動かす。
 * 予約・キャンセルはその場の配列に書くだけで、ページを閉じれば消える。
 * 規則（空き・検査・受付番号・合い言葉）はサーバー（gas_web.js）と同じものを呼ぶので、動きは実物と変わらない。
 *
 * 「いま」を知るために new Date() を使うのは、src の中でこのファイルだけ（purity テストもここだけ外している）。
 */

/** サーバーを待つ感じを出すための遅れ（ミリ秒） */
const DEMO_DELAY_MS = 120;
const DEMO_CONFIRMED = "確定";
const DEMO_CANCELLED = "キャンセル";
/** 見えない欄が埋まっていたときに返す受付番号（何も書かない） */
const DEMO_DECOY_ID = "—";
/** 設定・枠・休み・サービスに誤りがあるときに、お客さまの画面へ出す 1 文（gas_web.js と同じ言い方） */
const DEMO_BOOT_STOPPED_TEXT = "ただいま予約を受け付けられません。お手数ですが、お電話でご連絡ください。";

/** お客さまに見せてよい、こちらで用意した誤り（これ以外は当たりさわりのない文に置き換える） */
function demoStop_(message) {
  const error = new Error(message);
  error.expected = true;
  return error;
}

function demoWait_() {
  return new Promise(function (resolve) {
    setTimeout(resolve, DEMO_DELAY_MS);
  });
}

/** 遅れてから中身を動かす。中で投げた誤りは Promise の失敗になる */
function demoCall_(action) {
  return function () {
    const args = arguments;
    return demoWait_().then(function () {
      try {
        return action.apply(null, args);
      } catch (error) {
        if (error !== null && error !== undefined && error.expected === true) throw error;
        throw new Error("ただいま処理できませんでした。ページを読み込み直してください。");
      }
    });
  };
}

/** 2 次元の表（1 行目が見出し）を、見出しをキーにした行の配列にする */
function demoRecords_(values) {
  const rows = Array.isArray(values) ? values : [];
  const header = Array.isArray(rows[0]) ? rows[0] : [];
  const records = [];
  for (let i = 1; i < rows.length; i += 1) {
    const row = Array.isArray(rows[i]) ? rows[i] : [];
    const record = {};
    for (let j = 0; j < header.length; j += 1) record[textOf(header[j])] = row[j] === undefined ? "" : row[j];
    records.push(record);
  }
  return records;
}

/** 見本の合い言葉。実物は Utilities.getUuid() なので、ここでは同じ形の字を順番に作って token.js に通す */
function demoUuid_(sequence) {
  let hex = Number(sequence).toString(16);
  while (hex.length < 8) hex = "0" + hex;
  return hex.slice(-8) + "-0000-4000-8000-000000000000";
}

/** 画面に渡す店の情報（gas_web.js の shopOf_ と同じ形） */
function demoShop_(settings) {
  return {
    name: textOf(settings.shopName),
    phone: textOf(settings.phone),
    address: textOf(settings.address),
    notice: textOf(settings.notice),
    themeColor: textOf(settings.themeColor),
    phoneRequired: settings.phoneRequired === true,
    dateFormat: textOf(settings.dateFormat),
    cancelHours: settings.cancelHours,
    leadHours: settings.leadHours,
  };
}

/** 受付中のサービスだけを画面の形にする */
function demoOpenServices_(services) {
  const out = [];
  for (let i = 0; i < services.length; i += 1) {
    if (services[i].active !== true) continue;
    out.push({ name: services[i].name, minutes: services[i].minutes, description: services[i].description });
  }
  return out;
}

function demoFirstError_(errors) {
  const names = Object.keys(errors);
  return names.length === 0 ? "入力をご確認ください" : errors[names[0]];
}

function demoFindSlot_(slots, start) {
  for (let i = 0; i < slots.length; i += 1) if (slots[i].start === start) return slots[i];
  return null;
}

function demoFindByToken_(reservations, token) {
  for (let i = 0; i < reservations.length; i += 1) {
    if (textOf(reservations[i]["キャンセル用"]) === token) return reservations[i];
  }
  return null;
}

/**
 * 見本ページの api。fixedNow は「いま」を止めるための引数で、テストからだけ渡す
 * （見本ページは何も渡さず、ブラウザの時計を読む）。
 */
function memoryApi(fixedNow) {
  const fixed = textOf(fixedNow);

  /** "YYYY-MM-DD HH:mm:ss"（Asia/Tokyo） */
  function stamp_() {
    return fixed === "" ? formatStamp(new Date()) : fixed;
  }
  /** 空きの計算に渡す「いま」 */
  function now_() {
    return stamp_().slice(0, 16);
  }

  const today = now_().slice(0, 10);
  const data = sampleData(today);
  const settingsRead = parseSettings(data.settings);
  const rulesRead = parseRules(data.rules);
  const closedRead = parseClosedDays(data.closed);
  const servicesRead = parseServices(data.services);
  const settings = settingsRead.settings;
  const reservations = demoRecords_(data.reservations);

  // 受付番号は見本の予約の続きから。合い言葉は順番に作る
  let lastId = reservations.length === 0 ? "" : textOf(reservations[reservations.length - 1]["ID"]);
  let tokenCount = 0;

  return {
    bootstrap: demoCall_(function () {
      const now = now_();
      const services = demoOpenServices_(servicesRead.services);
      const errors = settingsRead.errors.concat(rulesRead.errors, closedRead.errors, servicesRead.errors);
      const boot = { shop: demoShop_(settings), services: services, days: [], daysByService: {}, today: now.slice(0, 10), errors: [] };
      // 誤りの中身はお客さまの画面に出さない（実物はメニュー「設定を確かめる」でお店にだけお伝えする）
      if (errors.length > 0) {
        boot.errors = [DEMO_BOOT_STOPPED_TEXT];
        return boot;
      }
      // サービスを選ぶ前のぶんと、受付中のサービスごとのぶん（選び替えたら印も入れ替わる）
      boot.days = calendarDays(now, settings, rulesRead.rules, closedRead.closed, reservations, "");
      for (let i = 0; i < services.length; i += 1) {
        boot.daysByService[services[i].name] = calendarDays(now, settings, rulesRead.rules, closedRead.closed, reservations, services[i].name);
      }
      return boot;
    }),

    availability: demoCall_(function (date, service) {
      const key = toDateKey(textOf(date));
      if (key === null) throw demoStop_("日付をお選びください");

      const now = now_();
      const slots = remainingFor(slotsFor(key, rulesRead.rules, closedRead.closed, textOf(service)), reservations, key);
      const out = [];
      for (let i = 0; i < slots.length; i += 1) {
        if (!isBookable(key, slots[i].start, now, settings)) continue;
        out.push({ start: slots[i].start, end: slots[i].end, remaining: slots[i].remaining });
      }
      return { date: key, slots: out };
    }),

    reserve: demoCall_(function (input) {
      const raw = input === null || input === undefined ? {} : input;

      // 見えない欄が埋まっていたら、成功したように見せて何も書かない（設計書 §7）
      if (textOf(raw.website) !== "") {
        return { ok: true, id: DEMO_DECOY_ID, date: textOf(raw.date), start: textOf(raw.start), end: textOf(raw.start), service: textOf(raw.service), mailSent: false };
      }

      const checked = validateReservation(raw, { settings: settings, services: servicesRead.services });
      if (!checked.ok) throw demoStop_(demoFirstError_(checked.errors));
      const value = checked.value;

      let same = 0;
      for (let i = 0; i < reservations.length; i += 1) {
        if (textOf(reservations[i]["状態"]) !== DEMO_CONFIRMED) continue;
        if (textOf(reservations[i]["メール"]).toLowerCase() === value.email.toLowerCase()) same += 1;
      }
      if (same >= settings.maxPerEmail) throw demoStop_("同じメールアドレスでのご予約は " + settings.maxPerEmail + " 件までです。");

      const now = now_();
      const slots = remainingFor(slotsFor(value.date, rulesRead.rules, closedRead.closed, value.service), reservations, value.date);
      const slot = demoFindSlot_(slots, value.start);
      if (slot === null || !isBookable(value.date, value.start, now, settings)) {
        throw demoStop_("選ばれた時間は、受付を終了しました。別の時間をお選びください。");
      }
      if (slot.remaining <= 0) throw demoStop_("選ばれた時間は、ただいま満席になりました。別の時間をお選びください。");

      const id = nextReceipt(lastId, today);
      lastId = id;
      tokenCount += 1;
      reservations.push({
        "ID": id,
        "状態": DEMO_CONFIRMED,
        "日付": value.date,
        "開始": value.start,
        "終了": slot.end,
        "サービス": value.service,
        "お名前": value.name,
        "メール": value.email,
        "電話": value.phone,
        "ご要望": value.note,
        "受付日時": stamp_(),
        "キャンセル日時": "",
        "カレンダー": "",
        "リマインド": "",
        "キャンセル用": tokenFromUuid(demoUuid_(tokenCount)),
      });
      // 見本ページはメールを送らないが、画面の流れは実物と同じ（送れたときの完了画面）を見せる
      return { ok: true, id: id, date: value.date, start: value.start, end: slot.end, service: value.service, mailSent: true };
    }),

    cancelInfo: demoCall_(function (token) {
      const key = textOf(token);
      if (!isToken(key)) return { found: false };
      const found = demoFindByToken_(reservations, key);
      if (found === null) return { found: false };

      const status = textOf(found["状態"]);
      return {
        found: true,
        reservation: {
          id: textOf(found["ID"]),
          date: textOf(found["日付"]),
          start: textOf(found["開始"]),
          end: textOf(found["終了"]),
          service: textOf(found["サービス"]),
          name: textOf(found["お名前"]),
          status: status,
        },
        canCancel: status === DEMO_CONFIRMED && cancelAllowed(found, now_(), settings),
        phone: textOf(settings.phone),
      };
    }),

    cancel: demoCall_(function (token) {
      const key = textOf(token);
      if (!isToken(key)) throw demoStop_("キャンセルの URL が正しくありません。メールの URL をもう一度お確かめください。");
      const found = demoFindByToken_(reservations, key);
      if (found === null) throw demoStop_("ご予約が見つかりませんでした。メールの URL をもう一度お確かめください。");
      if (textOf(found["状態"]) !== DEMO_CONFIRMED) throw demoStop_("このご予約はすでにキャンセルされています。");
      if (!cancelAllowed(found, now_(), settings)) {
        throw demoStop_("キャンセルの受付は開始の " + settings.cancelHours + " 時間前までです。お電話でご連絡ください。");
      }
      found["状態"] = DEMO_CANCELLED;
      found["キャンセル日時"] = stamp_();
      return { ok: true, id: textOf(found["ID"]) };
    }),
  };
}

// ===== main.js =====
/**
 * 画面の組み立て。state（state.js）と描画（render.js）と api（api-gas.js / api-memory.js）をつなぐ。
 * DOM に触るのはこのファイルだけ。HTML の組み立ては render.js だけが行う（ここで文字を HTML にしない）。
 *
 * 流れ: bootstrap → サービス → カレンダー → 時間 → 入力 → 確認 → 完了。
 * キャンセルの URL（window.__BOOKING_CANCEL__）で開かれたときは、読み込みのあとキャンセルの画面から始める。
 */

/** 入力欄の名前（state.values と render.js の name 属性にそろえる） */
const FIELD_NAMES = ["name", "email", "phone", "note", "website"];

/** キャンセルの URL で開かれたときに doGet が差し込む合い言葉。無ければ空 */
function cancelTokenOf_() {
  if (typeof window === "undefined" || window === null) return "";
  return typeof window.__BOOKING_CANCEL__ === "string" ? window.__BOOKING_CANCEL__ : "";
}

/**
 * 画面の検査に渡すサービスの一覧。
 * bootstrap が返すのは受付中のサービスだけなので、validate.js が見る active を足す
 */
function servicesToCheck_(boot) {
  const services = boot && Array.isArray(boot.services) ? boot.services : [];
  const out = [];
  for (let i = 0; i < services.length; i += 1) out.push({ name: services[i].name, active: true });
  return out;
}

function mountBooking(root, api) {
  let state = initialState();
  /** 空きの要求の番号。日を押し替えたあとに届いた古い返事を捨てるために使う */
  let slotsSeq = 0;
  const cancelToken = cancelTokenOf_();

  function paint() {
    root.innerHTML = renderApp(state);
  }

  /** 新しい画面の見出しへ、読み上げと目線を移す */
  function focusHeading_() {
    const heading = root.querySelector(".bk-h2");
    if (!heading) return;
    if (heading.setAttribute) heading.setAttribute("tabindex", "-1");
    if (heading.focus) heading.focus();
  }

  /** いま目線のある要素。document の無いところ（テストの偽 DOM）では null */
  function activeElement_() {
    if (typeof document === "undefined" || document === null) return null;
    return document.activeElement === undefined ? null : document.activeElement;
  }

  /**
   * 描き直しで、目線の置きどころが無くなったか。
   * 同じ画面のまま描き直すと（空きが届いたときなど）目線のあった節点は捨てられ、
   * ブラウザは目線を <body> へ落としてしまう。そのときは見出しへ戻す
   */
  function focusLost_(before) {
    if (typeof document === "undefined" || document === null) return false;
    const active = activeElement_();
    if (active === null) return true;
    if (document.body !== undefined && document.body !== null && active === document.body) return true;
    return before !== null && before !== undefined && before.isConnected === false;
  }

  /** 誤りのある最初の入力欄へ移る */
  function focusFirstError_() {
    const field = root.querySelector(".bk-has-error input, .bk-has-error textarea");
    if (field && field.focus) field.focus();
  }

  function dispatch(action) {
    const before = state.step;
    const focused = activeElement_();
    state = reduce(state, action);
    paint();
    // はじめの読み込みでは目線を動かさない（お客さまが触る前から画面が動いて見えないように）
    if (before === "loading") return;
    // 画面が変わったとき、または描き直しで目線の置きどころが消えたときは、いまの画面の見出しへ移す
    if (state.step !== before || focusLost_(focused)) focusHeading_();
  }

  function fail(error) {
    dispatch({ type: "error", message: error && error.message ? error.message : String(error) });
  }

  /** 選んだ日の空きを取り直す。古い返事は捨てる */
  function loadSlots(date) {
    slotsSeq += 1;
    const seq = slotsSeq;
    return api
      .availability(date, state.service)
      .then(function (result) {
        if (seq !== slotsSeq) return;
        const answer = result === null || result === undefined ? {} : result;
        dispatch({ type: "slots", date: answer.date === undefined ? date : answer.date, slots: answer.slots });
      })
      .catch(function (error) {
        if (seq !== slotsSeq) return;
        fail(error);
      });
  }

  function chooseDate(date) {
    dispatch({ type: "select-date", date: date });
    loadSlots(state.date);
  }

  /** フォームの 5 つの欄を { name, email, phone, note, website } にする */
  function valuesOf(form) {
    const values = {};
    for (let i = 0; i < FIELD_NAMES.length; i += 1) {
      const field = FIELD_NAMES[i];
      const element = form && form.elements && form.elements.namedItem ? form.elements.namedItem(field) : null;
      values[field] = element === null || element === undefined ? state.values[field] : String(element.value === undefined ? "" : element.value);
    }
    return values;
  }

  /** 「確認へ」。サーバーと同じ検査を画面でも通し、誤りがあれば欄の下に出す */
  function toConfirm(form) {
    const values = valuesOf(form);
    for (let i = 0; i < FIELD_NAMES.length; i += 1) {
      state = reduce(state, { type: "input", field: FIELD_NAMES[i], value: values[FIELD_NAMES[i]] });
    }
    const slot = state.slot === null || state.slot === undefined ? {} : state.slot;
    const shop = state.boot && state.boot.shop ? state.boot.shop : {};
    const checked = validateReservation(
      { name: values.name, email: values.email, phone: values.phone, note: values.note, date: state.date, start: slot.start, service: state.service },
      { settings: { phoneRequired: shop.phoneRequired === true }, services: servicesToCheck_(state.boot) }
    );
    if (!checked.ok) {
      dispatch({ type: "errors", errors: checked.errors });
      focusFirstError_();
      return;
    }
    dispatch({ type: "errors", errors: {} });
    dispatch({ type: "confirm" });
  }

  /** 「この内容で予約する」。busy のあいだは二重に送らない */
  function reserve() {
    if (state.busy === true) return;
    const slot = state.slot === null || state.slot === undefined ? {} : state.slot;
    const values = state.values;
    const date = state.date;
    dispatch({ type: "busy", on: true });
    api
      .reserve({
        name: values.name,
        email: values.email,
        phone: values.phone,
        note: values.note,
        website: values.website,
        date: date,
        start: slot.start,
        service: state.service,
      })
      .then(function (result) {
        dispatch({ type: "done", result: result });
      })
      .catch(function (error) {
        fail(error);
        // 先に取られていた・締切を過ぎたときのために、その日の空きを読み直す（設計書 §2-5）
        if (state.date === date) loadSlots(date);
      });
  }

  /** キャンセルの画面の「このご予約をキャンセルする」 */
  function cancel() {
    if (state.busy === true || cancelToken === "") return;
    dispatch({ type: "busy", on: true });
    api
      .cancel(cancelToken)
      .then(function (result) {
        dispatch({ type: "cancelled", id: result && result.id ? result.id : "" });
      })
      .catch(fail);
  }

  root.addEventListener("click", function (event) {
    const element = event.target && event.target.closest ? event.target.closest("[data-action]") : null;
    if (!element || (root.contains && !root.contains(element))) return;
    const data = element.dataset || {};
    const action = data.action;
    if (action === "select-service") dispatch({ type: "select-service", name: data.name });
    else if (action === "month") dispatch({ type: "month", delta: Number(data.delta) });
    else if (action === "select-date") chooseDate(data.date);
    else if (action === "select-slot") dispatch({ type: "select-slot", start: data.start });
    else if (action === "back") dispatch({ type: "back" });
    else if (action === "reserve") reserve();
    else if (action === "cancel") cancel();
    else if (action === "dismiss-error") dispatch({ type: "dismiss-error" });
  });

  // 打っている字は state に写すだけで描き直さない（描き直すと、書きかけの字と変換が消えてしまう）
  function keep(event) {
    const element = event.target;
    if (!element || !element.name) return;
    state = reduce(state, { type: "input", field: element.name, value: element.value });
  }
  root.addEventListener("input", keep);
  root.addEventListener("change", keep);

  root.addEventListener("submit", function (event) {
    const form = event.target;
    if (!form || !form.dataset || form.dataset.form !== "reserve") return;
    event.preventDefault();
    toConfirm(form);
  });

  paint();
  const ready = api
    .bootstrap()
    .then(function (data) {
      dispatch({ type: "bootstrap", data: data });
      // 設定に誤りがあるときは、その知らせを消さない
      if (cancelToken === "" || state.step === "boot-error") return null;
      return api.cancelInfo(cancelToken).then(function (info) {
        dispatch({ type: "cancel-info", data: info });
      });
    })
    .catch(fail);

  return { getState: () => state, dispatch: dispatch, ready: ready };
}

window.Booking = { mount: function (root) { return mountBooking(root, memoryApi()); } };
