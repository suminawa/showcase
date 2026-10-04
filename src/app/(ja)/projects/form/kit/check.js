// このファイルは「フォーム受付 GAS キット」の src/ からの写しです（中身は書き換えていません）。
// 直すときはキットの側を直してから、scripts/sync-gas-kits.mjs を走らせてください。
/**
 * 初期化（何を足すか）と「設定を確かめる」（何を直すか・これから何が起きるか）を決める。純粋な処理。
 * 受け取るのはシートの値をそのまま写した snapshot（gas_sheets.js の readSetupSnapshot_ が作る）:
 *   { timeZone, sheets: { シート名: 2 次元配列 } }
 * 無いシートは sheets に載せない。空のシート（1 行も無い）は []。
 * ウェブアプリの公開状態は読まない（このキットはトリガーも公開 URL も読まない決まり）。
 */
import { ConfigError, DEFAULT_ROWS, configKeyOf, parseConfig } from "./config.js";
import { toDateKey } from "./dates.js";
import { RECEIPT_HEADER, SOURCE_HEADER, STAMP_HEADER, buildHeader, fieldNamesOf } from "./rows.js";
import { CAPACITY_HEADER, DATE_HEADER, SLOT_HEADER, parseSlots } from "./slots.js";
import { missingHeaders, missingSettingRows } from "./setup.js";

/** 設定シートの名前（1.0 から固定） */
export const SETTINGS_TAB = "設定";

/** 見本の Webhook URL に入っている印 */
const SAMPLE_URL_MARK = "XXXXXXXXX/YYYYYYYYY";

/** parseConfig が投げうる項目。読める設定を作るときは、ここを外して読み直す */
const STRICT_KEYS = ["通知先", "Slack Webhook URL", "Discord Webhook URL", "LINE チャネルアクセストークン", "LINE 送信先 ID", "自動返信"];

/** このキットが使う見出し（フォームの入力欄の名前に使えない） */
const RESERVED_HEADERS = [STAMP_HEADER, RECEIPT_HEADER, SOURCE_HEADER];

/** 枠シートの見出し */
const SLOT_HEADERS = [DATE_HEADER, SLOT_HEADER, CAPACITY_HEADER];

function checkText_(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function blankRow_(row) {
  const cells = Array.isArray(row) ? row : [];
  for (let i = 0; i < cells.length; i += 1) if (checkText_(cells[i]) !== "") return false;
  return true;
}

/** 2 行目から下の、空でない行の数 */
function dataRowCount_(values) {
  let count = 0;
  for (let i = 1; i < values.length; i += 1) if (!blankRow_(values[i])) count += 1;
  return count;
}

/** 設定の生の値（そろえた項目名 → 値）。同じ項目が 2 行あれば後ろが勝つ（parseConfig と同じ） */
function rawSettings_(rows) {
  const raw = {};
  const source = Array.isArray(rows) ? rows : [];
  for (let i = 0; i < source.length; i += 1) {
    const row = Array.isArray(source[i]) ? source[i] : [];
    const key = configKeyOf(checkText_(row[0]));
    if (key === "") continue;
    raw[key] = row[1] === null || row[1] === undefined ? "" : row[1];
  }
  return raw;
}

function rawOf_(raw, key) {
  const normalized = configKeyOf(key);
  return Object.prototype.hasOwnProperty.call(raw, normalized) ? raw[normalized] : undefined;
}

/**
 * 誤りがあっても読める設定。まず parseConfig をそのまま試し、投げたら通知先と自動返信を外して読み直す
 * （通知先を空にすると宛先の確かめは走らない。シート名・項目名・必須項目はそのまま効く）。
 */
function readableConfig_(rows) {
  try {
    return parseConfig(rows);
  } catch (error) {
    if (!(error instanceof ConfigError)) throw error;
  }
  const strict = STRICT_KEYS.map(configKeyOf);
  const kept = [];
  const source = Array.isArray(rows) ? rows : [];
  for (let i = 0; i < source.length; i += 1) {
    const row = Array.isArray(source[i]) ? source[i] : [];
    if (strict.indexOf(configKeyOf(checkText_(row[0]))) >= 0) continue;
    kept.push(row);
  }
  kept.push(["通知先", ""]);
  return parseConfig(kept);
}

function missingRowsOf_(values) {
  return missingSettingRows(values, DEFAULT_ROWS, configKeyOf);
}

/** 初期化のあとの設定シートの行（無ければ既定の全行、あれば足りない行を足したもの） */
function effectiveSettings_(values) {
  if (values === undefined || values.length === 0) return [["項目", "値"]].concat(DEFAULT_ROWS);
  return values.concat(missingRowsOf_(values));
}

/** readSetupSnapshot_ が読むシートの名前（設定シートのほか）。受付シートと、使うなら枠シート */
export function sheetNamesFor(settingsValues) {
  const config = readableConfig_(effectiveSettings_(settingsValues === null ? undefined : settingsValues));
  return config.slotSheetName === "" ? [config.intakeSheetName] : [config.intakeSheetName, config.slotSheetName];
}

function timeZoneNote_(timeZone) {
  return "スプレッドシートのタイムゾーンが " + timeZone + " です。ファイル → 設定 → タイムゾーンを「（GMT+09:00）東京」にしてください（そのままだと受付日時と予約の日付が 1 日ずれます）。";
}

/** 枠シートが無い（空の）ときの文。exists は「シートはあるが空」 */
function slotMissingText_(name, exists) {
  const state = exists ? "「" + name + "」シートが空です" : "「" + name + "」シートがありません";
  const make = exists ? "「" + name + "」シートの 1 行目に" : "「" + name + "」シートを作り 1 行目に";
  return "設定「枠シート名」が「" + name + "」ですが、" + state + "。いまは予約枠を使わずに受け付けています（定員は効いていません）。使うなら" + make + " 日付・時間帯・定員 と書き、使わないなら設定「枠シート名」の値を空にしてください。";
}

/** 初期化で足すもの。返り値は setup.js の Plan に、次の一歩の文 nextStep を足したもの */
export function planInit(snapshot) {
  const plan = { createSheets: [], appendHeaders: [], appendSettings: { sheet: SETTINGS_TAB, rows: [], blank: false }, notes: [], nextStep: "" };
  const settings = snapshot.sheets[SETTINGS_TAB];
  // 設定シートをこの実行で書く（無い・空だった）なら新しいブック。枠シートを作ってよいのはこのときだけ
  const freshBook = settings === undefined || settings.length === 0;
  if (freshBook) {
    plan.createSheets.push({ name: SETTINGS_TAB, rows: [["項目", "値"]].concat(DEFAULT_ROWS), freeze: true, exists: settings !== undefined });
  } else {
    plan.appendSettings.rows = missingRowsOf_(settings);
  }

  // 設定を先にそろえ、足した行の既定値も使って、受付シートと枠シートを決める
  const rows = effectiveSettings_(settings);
  const config = readableConfig_(rows);

  const intakeName = config.intakeSheetName;
  const intake = snapshot.sheets[intakeName];
  if (intake === undefined || intake.length === 0) {
    plan.createSheets.push({ name: intakeName, rows: [buildHeader(config, [])], freeze: true, exists: intake !== undefined });
  } else {
    // 足すのは「項目の並び」の名前だけ。消された 受付日時・受付番号・送信元 は足し直さない（rows.js と同じ決まり）
    const missing = missingHeaders(intake[0], fieldNamesOf(config, []));
    if (missing.length > 0) plan.appendHeaders.push({ sheet: intakeName, names: missing });
    const lacking = missingHeaders(intake[0], RESERVED_HEADERS);
    for (let i = 0; i < lacking.length; i += 1) {
      plan.notes.push("「" + intakeName + "」シートに「" + lacking[i] + "」の列がありません（消した列は足し直しません）。" + lacking[i] + "を残したいときは、1 行目の右端に「" + lacking[i] + "」と書いてください。");
    }
  }

  const slotName = config.slotSheetName;
  if (slotName !== "") {
    const slot = snapshot.sheets[slotName];
    if (slot === undefined || slot.length === 0) {
      // 既にあるブックに空の枠シートを置くと、日付・時間帯つきの送信がすべて「枠なし」で断られる
      if (freshBook) plan.createSheets.push({ name: slotName, rows: [SLOT_HEADERS.slice()], freeze: true, exists: slot !== undefined });
      else plan.notes.push(slotMissingText_(slotName, slot !== undefined));
    } else {
      const missing = missingHeaders(slot[0], SLOT_HEADERS);
      if (missing.length > 0) plan.appendHeaders.push({ sheet: slotName, names: missing });
    }
  }

  if (snapshot.timeZone !== "Asia/Tokyo") plan.notes.push(timeZoneNote_(snapshot.timeZone));

  let ready = false;
  try {
    ready = parseConfig(rows).targets.length > 0;
  } catch (error) {
    if (!(error instanceof ConfigError)) throw error;
  }
  plan.nextStep = ready ? "次は「設定を確かめる」を実行してください。" : "次は「設定」シートに通知先の URL かトークンを書き、「設定を確かめる」を実行してください。そのあと README の手順 3 で、ウェブアプリとして公開します。";
  return plan;
}

/** 1 項目だけを parseConfig に通して、投げるかどうか（通知先は空にして、宛先の確かめを走らせない） */
function failsAlone_(key, value) {
  try {
    parseConfig([["通知先", ""], [key, value]]);
    return false;
  } catch (error) {
    if (error instanceof ConfigError) return true;
    throw error;
  }
}

/** Webhook URL の行の誤り（空は requireFor と同じ文、形・見本のまま・もう片方の URL） */
function webhookProblems_(label, url, own, other) {
  if (url.indexOf("https://") !== 0) return ["「設定」シートの「" + label + "」は https:// で始まる URL です。前後に余分な字が入っていないかも確かめてください。"];
  if (url.indexOf(SAMPLE_URL_MARK) >= 0) return ["「設定」シートの「" + label + "」が見本の URL のままです。README の手順 2 で作ったご自身の URL に貼り替えてください。"];
  if (other.pattern.test(url)) return ["「" + label + "」は " + other.name + " の URL です。" + other.name + " に送るなら「" + other.label + "」の行に貼り、「" + label + "」には " + own + " で作った URL を貼ってください。"];
  return [];
}

/** 設定の行ごとの誤りを、最初の 1 つで止めずに全部集める（文は parseConfig と同じ語を使う） */
export function collectConfigProblems(rows) {
  const problems = [];
  const raw = rawSettings_(rows);
  const config = readableConfig_(rows);

  const targetRaw = rawOf_(raw, "通知先");
  const targets = [];
  const names = targetRaw === undefined ? ["slack"] : String(targetRaw).split(/[,、]/).map(checkText_).filter((name) => name !== "");
  for (let i = 0; i < names.length; i += 1) {
    const name = names[i].toLowerCase();
    if (["slack", "discord", "line"].indexOf(name) < 0) {
      problems.push("「設定」シートの「通知先」に書けるのは slack / discord / line です（いまは「" + names[i] + "」）。");
    } else if (targets.indexOf(name) < 0) targets.push(name);
  }

  // URL とトークンは人に見せない鍵なので、文には出さない
  const slack = checkText_(rawOf_(raw, "Slack Webhook URL"));
  const discord = checkText_(rawOf_(raw, "Discord Webhook URL"));
  const token = checkText_(rawOf_(raw, "LINE チャネルアクセストークン"));
  const lineTo = checkText_(rawOf_(raw, "LINE 送信先 ID"));
  const emptyText = (target, label) => "「通知先」に " + target + " がありますが、「" + label + "」が空です。設定シートのその行を埋めてください。";
  if (targets.indexOf("slack") >= 0) {
    if (slack === "") problems.push(emptyText("slack", "Slack Webhook URL"));
    else problems.push(...webhookProblems_("Slack Webhook URL", slack, "Slack", { name: "Discord", label: "Discord Webhook URL", pattern: /discord(app)?\.com\/api\/webhooks/ }));
  }
  if (targets.indexOf("discord") >= 0) {
    if (discord === "") problems.push(emptyText("discord", "Discord Webhook URL"));
    else problems.push(...webhookProblems_("Discord Webhook URL", discord, "Discord", { name: "Slack", label: "Slack Webhook URL", pattern: /hooks\.slack\.com/ }));
  }
  if (targets.indexOf("line") >= 0) {
    if (token === "" && lineTo === "") {
      problems.push(emptyText("line", "LINE チャネルアクセストークン"));
      problems.push(emptyText("line", "LINE 送信先 ID"));
    } else if (token === "") {
      problems.push("「LINE 送信先 ID」が書いてありますが、「LINE チャネルアクセストークン」が空です。");
    } else if (lineTo === "") {
      problems.push("「LINE チャネルアクセストークン」が書いてありますが、「LINE 送信先 ID」が空です。");
    }
  }

  const autoReply = rawOf_(raw, "自動返信");
  if (autoReply !== undefined && failsAlone_("自動返信", autoReply)) {
    problems.push("「設定」シートの「自動返信」は TRUE か FALSE にしてください（いまは「" + checkText_(autoReply) + "」）。");
  }

  if (config.honeypotField !== "" && config.requiredFields.indexOf(config.honeypotField) >= 0) {
    problems.push("「必須項目」に、迷惑投稿よけの見えない欄 " + config.honeypotField + " が入っています。この欄は人が入力しないので、すべての送信を受け付けなくなります。「必須項目」から外してください。");
  }
  for (let i = 0; i < RESERVED_HEADERS.length; i += 1) {
    if (config.fieldOrder.indexOf(RESERVED_HEADERS[i]) >= 0) {
      problems.push("「項目の並び」に「" + RESERVED_HEADERS[i] + "」があります。受付日時・受付番号・送信元はこのキットが使う見出しなので、フォームの入力欄には別の名前を付けてください。");
    }
  }
  if (config.slotSheetName !== "" && (config.dateField === "") !== (config.slotField === "")) {
    problems.push("予約枠を使うときは「日付の項目名」と「時間帯の項目名」を両方書いてください（いまは「" + (config.dateField === "" ? "日付の項目名" : "時間帯の項目名") + "」が空です）。");
  }
  return problems;
}

/** 枠シートの誤り（シートが無い・見出しが無い・読めない行）。parseSlots は読めない行を黙って飛ばすので、ここで拾う */
function slotProblems_(name, values) {
  if (values === undefined || values.length === 0) return [slotMissingText_(name, values !== undefined)];
  const lacking = missingHeaders(values[0], SLOT_HEADERS);
  if (lacking.length > 0) {
    return lacking.map((header) => "「" + name + "」シートの 1 行目に「" + header + "」の列がありません。「初期化」を実行すると右端に足します。");
  }
  const header = values[0].map(checkText_);
  const at = { date: header.indexOf(DATE_HEADER), slot: header.indexOf(SLOT_HEADER), capacity: header.indexOf(CAPACITY_HEADER) };
  const problems = [];
  for (let i = 1; i < values.length; i += 1) {
    const row = values[i];
    if (blankRow_(row)) continue;
    const rowNumber = i + 1;
    const date = row[at.date];
    const slot = checkText_(row[at.slot]);
    const capacity = checkText_(row[at.capacity]);
    if (checkText_(date) === "" || slot === "" || capacity === "") {
      problems.push("「" + name + "」シートの " + rowNumber + " 行目は、日付・時間帯・定員のどれかが空のため使われていません。3 つとも書いてください。");
      continue;
    }
    if (toDateKey(date) === null) problems.push("「" + name + "」シートの " + rowNumber + " 行目の日付を読めません。2026-09-14 の形で入れ直してください。");
    const number = Number(capacity.replace(/[０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0)));
    if (!Number.isFinite(number) || number < 0) problems.push("「" + name + "」シートの " + rowNumber + " 行目の定員は 0 以上の数にしてください（いまは「" + capacity + "」）。");
  }
  return problems;
}

/** 設定を確かめるの「直すところ」。最初の 1 つで止めずに全部 */
export function findProblems(snapshot) {
  const problems = [];
  if (snapshot.timeZone !== "Asia/Tokyo") problems.push(timeZoneNote_(snapshot.timeZone));
  const settings = snapshot.sheets[SETTINGS_TAB];
  if (settings === undefined) {
    problems.push("「設定」シートがありません。メニュー「フォーム受付」→「初期化」を実行してください。");
    return problems;
  }
  problems.push(...collectConfigProblems(settings));
  const config = readableConfig_(settings);
  if (config.slotSheetName !== "") problems.push(...slotProblems_(config.slotSheetName, snapshot.sheets[config.slotSheetName]));
  return problems;
}

/** 誤りではないが知っておくとよいこと（「ご参考:」の下に並べる） */
export function checkNotes(snapshot) {
  const notes = [];
  const settings = snapshot.sheets[SETTINGS_TAB];
  if (settings === undefined) return notes;
  const missing = missingRowsOf_(settings);
  if (missing.length > 0) {
    notes.push("「設定」シートに" + missing.map((row) => "「" + row[0] + "」").join("") + "の行がありません。行が無い項目は既定値で動きます。「初期化」を実行すると、既定値の行を足します。");
  }
  const config = readableConfig_(settings);
  if (config.autoReply && config.requiredFields.indexOf(config.emailField) < 0) {
    notes.push("「メールの項目名」の " + config.emailField + " が「必須項目」に入っていないため、メールアドレスの無い送信には自動返信を送りません。");
  }
  if (snapshot.sheets[config.intakeSheetName] === undefined) {
    notes.push("「" + config.intakeSheetName + "」シートはまだありません。1 件目の受付で作ります（いま作るなら「初期化」）。");
  }
  return notes;
}

/** 直すところが無いときの「これから起きること」。extra = { quota: 今日あと送れるメールの数 } */
export function summaryLines(snapshot, extra) {
  const config = parseConfig(snapshot.sheets[SETTINGS_TAB]);
  const intake = snapshot.sheets[config.intakeSheetName];
  const lines = [
    "通知先: " + (config.targets.length === 0 ? "（通知しない）" : config.targets.join(", ")),
    "受付シート: 「" + config.intakeSheetName + "」" + (intake === undefined ? "（まだありません。1 件目の受付で作ります）" : "（いま " + dataRowCount_(intake) + " 件）"),
  ];
  if (config.slotSheetName === "") {
    lines.push("予約枠: 使っていません（設定「枠シート名」が空です）");
  } else {
    const slots = parseSlots(snapshot.sheets[config.slotSheetName]);
    const dates = slots.map((slot) => slot.dateKey).sort();
    lines.push("予約枠: 「" + config.slotSheetName + "」シートの " + slots.length + " 枠" + (dates.length === 0 ? "" : "（" + dates[0] + "〜" + dates[dates.length - 1] + "）"));
  }
  lines.push("必須項目: " + (config.requiredFields.length === 0 ? "（なし）" : config.requiredFields.join(", ")));
  lines.push("項目の並び: " + (config.fieldOrder.length === 0 ? "（送られてきた順）" : config.fieldOrder.join(", ")));
  lines.push("自動返信: " + (config.autoReply ? "送る（宛先は「" + config.emailField + "」の値）。今日あと送れるメール: " + extra.quota + " 通" : "送らない"));
  lines.push("公開のしかた: README の手順 3。スクリプトを直したときは「新バージョン」で公開し直してください");
  return lines;
}
