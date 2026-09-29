// このファイルは「期限アラート GAS キット」の src/ からの写しです（中身は書き換えていません）。
// 直すときはキットの側を直してから、scripts/sync-gas-kits.mjs を走らせてください。
/**
 * 初期化（何を足すか）と「設定を確かめる」（何を直すか・これから何が起きるか）を決める。純粋な処理。
 * 受け取るのはシートの値をそのまま写した snapshot（gas_sheets.js の readSetupSnapshot_ が作る）:
 *   { timeZone, today: "YYYY-MM-DD", sheets: { シート名: 2 次元配列 }, hasTrigger }
 * 無いシートは sheets に載せない。空のシート（1 行も無い）は []。hasTrigger は「設定を確かめる」のときだけ使う。
 */
import { collectSections, OVERDUE } from "./buckets.js";
import { ConfigError, DEFAULT_ROWS, configKeyOf, parseConfig } from "./config.js";
import { parseItems } from "./items.js";
import { missingHeaders, missingSettingRows } from "./setup.js";

/** 設定シートの名前（1.0 から固定） */
export const SETTINGS_TAB = "設定";

/** 文面テンプレで置き換わる差し込み */
const TEMPLATE_KEYS = ["件名", "期限", "担当", "残日数"];

/** 見本の Webhook URL に入っている印 */
const SAMPLE_URL_MARK = "XXXXXXXXX/YYYYYYYYY";

/** parseConfig が投げうる 4 項目。「設定を確かめる」はここを 1 つずつ確かめる */
const STRICT_KEYS = ["通知先", "Webhook URL", "しきい値", "超過も通知する"];

function checkText_(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function blankRow_(row) {
  const cells = Array.isArray(row) ? row : [];
  for (let i = 0; i < cells.length; i += 1) if (checkText_(cells[i]) !== "") return false;
  return true;
}

/** 2 行目から下に、空でない行があるか */
function hasDataRows_(values) {
  for (let i = 1; i < values.length; i += 1) if (!blankRow_(values[i])) return true;
  return false;
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

/** 1 項目だけを parseConfig に通して、投げるかどうか */
function failsAlone_(key, value) {
  try {
    parseConfig([["Webhook URL", "https://example.invalid/"], [key, value]]);
    return false;
  } catch (error) {
    if (error instanceof ConfigError) return true;
    throw error;
  }
}

/**
 * 誤りがあっても読める設定。まず parseConfig をそのまま試し、投げたら投げうる 4 項目を外して読み直す
 * （シート名・列名・完了の値・文面テンプレは投げないので、そのまま効く）。
 */
function readableConfig_(rows) {
  try {
    return parseConfig(rows);
  } catch (error) {
    if (!(error instanceof ConfigError)) throw error;
  }
  const strict = STRICT_KEYS.map(configKeyOf);
  const kept = [["Webhook URL", "https://example.invalid/"]];
  const source = Array.isArray(rows) ? rows : [];
  for (let i = 0; i < source.length; i += 1) {
    const row = Array.isArray(source[i]) ? source[i] : [];
    if (strict.indexOf(configKeyOf(checkText_(row[0]))) >= 0) continue;
    kept.push(row);
  }
  return parseConfig(kept);
}

/** 初期化のあとの設定シートの行（無ければ既定の全行、あれば足りない行を足したもの） */
function effectiveSettings_(snapshot) {
  const values = snapshot.sheets[SETTINGS_TAB];
  if (values === undefined || values.length === 0) return [["項目", "値"]].concat(DEFAULT_ROWS);
  return values.concat(missingRowsOf_(values));
}

function missingRowsOf_(values) {
  return missingSettingRows(values, DEFAULT_ROWS, configKeyOf);
}

/** readSetupSnapshot_ が読むシートの名前（設定シートのほか）。設定シートの値から決める */
export function sheetNamesFor(settingsValues) {
  const rows = settingsValues === undefined || settingsValues === null || settingsValues.length === 0 ? [["項目", "値"]].concat(DEFAULT_ROWS) : settingsValues;
  return [readableConfig_(rows).sheetName];
}

function uniqueNames_(names) {
  const out = [];
  for (let i = 0; i < names.length; i += 1) if (names[i] !== "" && out.indexOf(names[i]) < 0) out.push(names[i]);
  return out;
}

function timeZoneNote_(timeZone) {
  return "スプレッドシートのタイムゾーンが " + timeZone + " です。ファイル → 設定 → タイムゾーンを「（GMT+09:00）東京」にしてください（そのままだと日付が 1 日ずれます）。";
}

/** 初期化で足すもの。返り値は setup.js の Plan に、次の一歩の文 nextStep を足したもの */
export function planInit(snapshot) {
  const plan = { createSheets: [], appendHeaders: [], appendSettings: { sheet: SETTINGS_TAB, rows: [], blank: false }, notes: [], nextStep: "" };
  const settings = snapshot.sheets[SETTINGS_TAB];
  if (settings === undefined || settings.length === 0) {
    plan.createSheets.push({ name: SETTINGS_TAB, rows: [["項目", "値"]].concat(DEFAULT_ROWS), freeze: true, exists: settings !== undefined });
  } else {
    plan.appendSettings.rows = missingRowsOf_(settings);
  }

  // 設定を先にそろえ、足した行の既定値も使って、対象シートの名前と見出しを決める
  const rows = effectiveSettings_(snapshot);
  const config = readableConfig_(rows);
  const name = config.sheetName;
  const columns = config.columns;
  const wanted = uniqueNames_([columns.subject, columns.due, columns.assignee, columns.status]);
  const target = snapshot.sheets[name];
  if (target === undefined || target.length === 0) {
    plan.createSheets.push({ name: name, rows: [wanted], freeze: true, exists: target !== undefined });
  } else {
    let missing = missingHeaders(target[0], wanted);
    if (hasDataRows_(target)) {
      // 予定が入っているシートに空の「件名」「期限」の列を足すと、毎朝の通知が空だらけになる。足さずに案内する
      const guarded = [
        { name: columns.subject, key: "列名（件名）" },
        { name: columns.due, key: "列名（期限）" },
      ];
      for (let i = 0; i < guarded.length; i += 1) {
        if (missing.indexOf(guarded[i].name) < 0) continue;
        missing = missing.filter((header) => header !== guarded[i].name);
        plan.notes.push(
          "「" + name + "」シートの 1 行目に「" + guarded[i].name + "」の列がありません。いまの予定が別の見出しの列に入っているなら、設定「" + guarded[i].key + "」にその見出しを書いてください。新しく使うなら、1 行目の空いているところに「" + guarded[i].name + "」と書いてください。",
        );
      }
    }
    if (missing.length > 0) plan.appendHeaders.push({ sheet: name, names: missing });
  }

  if (snapshot.timeZone !== "Asia/Tokyo") plan.notes.push(timeZoneNote_(snapshot.timeZone));

  const url = checkText_(rawOf_(rawSettings_(rows), "Webhook URL"));
  plan.nextStep = url === "" ? "次は「設定」シートの「Webhook URL」に、README の手順 2 で作る URL を貼り、「設定を確かめる」を実行してください。" : "次は「設定を確かめる」を実行してください。";
  return plan;
}

/** 設定の行ごとの誤りを、最初の 1 つで止めずに全部集める（文は parseConfig と同じ語を使う） */
export function collectConfigProblems(rows) {
  const problems = [];
  const raw = rawSettings_(rows);

  const targetRaw = rawOf_(raw, "通知先");
  const target = targetRaw === undefined || checkText_(targetRaw) === "" ? "slack" : checkText_(targetRaw).toLowerCase();
  const targetOk = target === "slack" || target === "discord";
  if (!targetOk) problems.push("「設定」シートの「通知先」は slack か discord にしてください（いまは「" + checkText_(targetRaw) + "」）。");

  // URL は人に見せない鍵なので、文には出さない
  const url = checkText_(rawOf_(raw, "Webhook URL"));
  if (url === "") {
    problems.push("「設定」シートの「Webhook URL」が空です。README の手順 2 で作った URL を貼ってください。");
  } else if (url.indexOf("https://") !== 0) {
    problems.push("「設定」シートの「Webhook URL」は https:// で始まる URL です。前後に余分な字が入っていないかも確かめてください。");
  } else if (url.indexOf(SAMPLE_URL_MARK) >= 0) {
    problems.push("「設定」シートの「Webhook URL」が見本の URL のままです。README の手順 2 で作ったご自身の URL に貼り替えてください。");
  } else if (targetOk && target === "slack" && /discord(app)?\.com\/api\/webhooks/.test(url)) {
    problems.push("「通知先」が slack ですが、「Webhook URL」は Discord の URL です。「通知先」を discord にしてください。");
  } else if (targetOk && target === "discord" && url.indexOf("hooks.slack.com") >= 0) {
    problems.push("「通知先」が discord ですが、「Webhook URL」は Slack の URL です。「通知先」を slack にしてください。");
  }

  const thresholds = rawOf_(raw, "しきい値");
  if (thresholds !== undefined && checkText_(thresholds) !== "" && failsAlone_("しきい値", thresholds)) {
    problems.push("「設定」シートの「しきい値」は、0 以上の整数をカンマで区切って書いてください（いまは「" + checkText_(thresholds) + "」）。例: 3,0");
  }
  const overdue = rawOf_(raw, "超過も通知する");
  if (overdue !== undefined && failsAlone_("超過も通知する", overdue)) {
    problems.push("「設定」シートの「超過も通知する」は TRUE か FALSE にしてください（いまは「" + checkText_(overdue) + "」）。");
  }

  const template = checkText_(rawOf_(raw, "文面テンプレ"));
  const seen = [];
  const pattern = /\{([^{}]*)\}/g;
  let matched = pattern.exec(template);
  while (matched !== null) {
    if (TEMPLATE_KEYS.indexOf(matched[1]) < 0 && seen.indexOf(matched[0]) < 0) {
      seen.push(matched[0]);
      problems.push("「文面テンプレ」の " + matched[0] + " は置き換わりません。使えるのは {件名} {期限} {担当} {残日数} です。");
    }
    matched = pattern.exec(template);
  }
  return problems;
}

/** 設定を確かめるの「直すところ」。最初の 1 つで止めずに全部 */
export function findProblems(snapshot) {
  const problems = [];
  if (snapshot.timeZone !== "Asia/Tokyo") problems.push(timeZoneNote_(snapshot.timeZone));
  const settings = snapshot.sheets[SETTINGS_TAB];
  if (settings === undefined) {
    problems.push("「設定」シートがありません。メニュー「期限アラート」→「初期化」を実行してください。");
    return problems;
  }
  problems.push(...collectConfigProblems(settings));

  const config = readableConfig_(settings);
  const name = config.sheetName;
  const values = snapshot.sheets[name];
  if (values === undefined) {
    problems.push("設定「対象シート名」の「" + name + "」シートがありません。シートの名前を「" + name + "」にするか、設定「対象シート名」をいまのシートの名前にしてください。");
    return problems;
  }
  if (values.length === 0) {
    problems.push("「" + name + "」シートに見出しがありません。初期化を実行すると見出しを書きます。");
    return problems;
  }
  const header = values[0];
  const lacking = missingHeaders(header, uniqueNames_([config.columns.subject, config.columns.due]));
  const keyOf = {};
  keyOf[config.columns.subject] = "列名（件名）";
  keyOf[config.columns.due] = "列名（期限）";
  for (let i = 0; i < lacking.length; i += 1) {
    problems.push("「" + name + "」シートの 1 行目に「" + lacking[i] + "」の列がありません。見出しを「" + lacking[i] + "」にするか、設定「" + keyOf[lacking[i]] + "」にいまの見出しの名前を書いてください。");
  }
  if (lacking.length > 0) return problems;

  const parsed = parseItems(values, config);
  for (let i = 0; i < parsed.skipped.length; i += 1) {
    const skipped = parsed.skipped[i];
    if (skipped.reason === "期限が読めません") {
      problems.push("「" + name + "」シートの " + skipped.rowNumber + " 行目の" + config.columns.due + "を日付として読めません。2026-09-30 の形で入れ直してください。");
    } else {
      problems.push("「" + name + "」シートの " + skipped.rowNumber + " 行目は" + config.columns.due + "がありますが、" + config.columns.subject + "が空です。" + config.columns.subject + "を書いてください。");
    }
  }
  return problems;
}

/** 誤りではないが知っておくとよいこと（「ご参考:」の下に並べる） */
export function checkNotes(snapshot) {
  const notes = [];
  const settings = snapshot.sheets[SETTINGS_TAB];
  if (settings === undefined) return notes;
  const missing = missingRowsOf_(settings).filter((row) => row[0] !== "Webhook URL");
  if (missing.length > 0) {
    notes.push(
      "「設定」シートに" + missing.map((row) => "「" + row[0] + "」").join("") + "の行がありません。既定値（" + missing.map((row) => row[1]).join(" と ") + "）で動きます。「初期化」を実行すると、既定値の行を足します。",
    );
  }
  const config = readableConfig_(settings);
  const values = snapshot.sheets[config.sheetName];
  if (values !== undefined && values.length > 0 && missingHeaders(values[0], [config.columns.status]).length > 0) {
    notes.push("「" + config.sheetName + "」シートに「" + config.columns.status + "」の列がないため、完了した予定も知らせます。");
  }
  if (snapshot.hasTrigger === false) notes.push("毎朝 8 時の実行はまだ作っていません。メニュー「毎朝 8 時に動かす」を押してください。");
  return notes;
}

function dayLabel_(bucket) {
  if (bucket === OVERDUE) return "期限切れ";
  const days = Number(String(bucket).slice(1));
  return days === 0 ? "今日" : days + " 日後";
}

/** 直すところが無いときの「これから起きること」。findProblems が 0 件のときだけ呼ぶ */
export function summaryLines(snapshot) {
  const config = parseConfig(snapshot.sheets[SETTINGS_TAB]);
  const values = snapshot.sheets[config.sheetName];
  const parsed = parseItems(values, config);

  const days = [];
  if (config.notifyOverdue) days.push("期限を過ぎたもの");
  for (let i = 0; i < config.thresholds.length; i += 1) days.push(config.thresholds[i] === 0 ? "当日" : config.thresholds[i] + " 日前");

  const header = values[0].map(checkText_);
  const columns = [config.columns.subject, config.columns.due, config.columns.assignee, config.columns.status].filter((column) => header.indexOf(column) >= 0);

  const statusAt = header.indexOf(config.columns.status);
  let done = 0;
  if (statusAt >= 0) {
    for (let i = 1; i < values.length; i += 1) {
      const status = checkText_(values[i][statusAt]);
      if (status !== "" && config.doneValues.indexOf(status) >= 0) done += 1;
    }
  }

  const sections = collectSections(parsed.items, config, snapshot.today);
  const today =
    sections.length === 0
      ? "今日の分: ありません（今日すでに送った分も数えています）"
      : "今日の分: " + sections.map((section) => dayLabel_(section.bucket) + " " + section.items.length + " 件").join("・") + "（今日すでに送った分も数えています）";

  return [
    "通知: " + config.target + " に、毎朝 8 時ごろ 1 通送ります（毎朝の実行: " + (snapshot.hasTrigger === true ? "作ってあります" : "まだ作っていません") + "）",
    "知らせる日: " + days.join("・"),
    "読むシート: 「" + config.sheetName + "」の " + columns.join("・") + "。完了とみなす値: " + config.doneValues.join("・"),
    "いま知らせる対象の予定: " + parsed.items.length + " 件" + (done > 0 ? "（完了の " + done + " 件は除きます）" : ""),
    today,
  ];
}
