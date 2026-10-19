// このファイルは「期限アラート GAS キット」の src/ からの写しです（中身は書き換えていません）。
// 直すときはキットの側を直してから、scripts/sync-gas-kits.mjs を走らせてください。
/**
 * 初期化（何を足すか）と「設定を確かめる」（何を直すか・これから何が起きるか）を決める。純粋な処理。
 * 受け取るのはシートの値をそのまま写した snapshot（gas_sheets.js の readSetupSnapshot_ が作る）:
 *   { timeZone, today: "YYYY-MM-DD", sheets: { シート名: 2 次元配列 }, hasTrigger, secrets }
 * secrets は「鍵を保存」でスクリプト プロパティに移した URL（{ 鍵の名前: 値 }。無ければ省いてよい）。
 * 無いシートは sheets に載せない。空のシート（1 行も無い）は []。hasTrigger は「設定を確かめる」のときだけ使う。
 */
import { collectSections, OVERDUE, overdueLimitOf } from "./buckets.js";
import { diffDays } from "./dates.js";
import { CHAT_URL_PREFIX, ConfigError, DEFAULT_ROWS, NO_DESTINATION_TEXT, TARGETS, configKeyOf, mailListOf, parseConfig, secretsInSheet, targetNamesOf, withSecrets } from "./config.js";
import { parseItems } from "./items.js";
import { missingHeaders, missingSettingRows } from "./setup.js";

/** 設定シートの名前（1.0 から固定） */
export const SETTINGS_TAB = "設定";

/** 文面テンプレで置き換わる差し込み */
const TEMPLATE_KEYS = ["件名", "期限", "担当", "残日数"];

/** 見本の Webhook URL に入っている印 */
const SAMPLE_URL_MARK = "XXXXXXXXX/YYYYYYYYY";

/** parseConfig が投げうる項目。「設定を確かめる」はここを 1 つずつ確かめる */
const STRICT_KEYS = [
  "通知先",
  "Webhook URL",
  "Discord の Webhook URL",
  "メールの宛先",
  "Google Chat の Webhook URL",
  "しきい値",
  "超過も通知する",
  "超過を知らせる上限日数",
];

/** 設定シートの行に、スクリプト プロパティに移した鍵を入れたもの（無ければ undefined のまま） */
function settingsOf_(snapshot) {
  const values = snapshot.sheets[SETTINGS_TAB];
  return values === undefined ? undefined : withSecrets(values, snapshot.secrets);
}

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
 * 誤りがあっても読める設定。まず parseConfig をそのまま試し、投げたら投げうる項目を外して読み直す
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
  const values = settingsOf_(snapshot);
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

  plan.nextStep = destinationsReady_(rawSettings_(rows))
    ? "次は「設定を確かめる」を実行してください。"
    : "次は README の手順 2 のとおりに、「設定」シートの「通知先」と送り先（「メールの宛先」か Webhook の URL）を書き、「設定を確かめる」を実行してください。";
  return plan;
}

/** 「通知先」に書いた名前のうち、知っているもの。空なら既定の slack */
function chosenTargets_(raw) {
  const names = targetNamesOf(rawOf_(raw, "通知先"));
  if (names.length === 0) return ["slack"];
  return names.filter((name) => TARGETS.indexOf(name) >= 0);
}

/** 通知先ごとの、送り先を書く設定の行（discord は「Discord の Webhook URL」が空なら 1.2.0 までの「Webhook URL」） */
const DESTINATION_KEYS = { slack: "Webhook URL", discord: "Discord の Webhook URL", gmail: "メールの宛先", googlechat: "Google Chat の Webhook URL" };

function destinationOf_(raw, target, targets) {
  const value = checkText_(rawOf_(raw, DESTINATION_KEYS[target]));
  if (target === "discord" && value === "" && targets.indexOf("slack") < 0) return checkText_(rawOf_(raw, "Webhook URL"));
  return value;
}

/** 選んだ通知先の送り先（宛先・URL）が、どれも空でないか。形までは見ない（それは「設定を確かめる」） */
function destinationsReady_(raw) {
  const targets = chosenTargets_(raw);
  if (targets.length === 0) return false;
  for (let i = 0; i < targets.length; i += 1) {
    if (destinationOf_(raw, targets[i], targets) === "") return false;
  }
  return true;
}

/** 送り先の行（URL 3 つとメールの宛先）が全部空で、通知先も既定の slack のまま（初期化しただけ）か */
function noDestination_(raw) {
  const targets = chosenTargets_(raw);
  if (targets.length !== 1 || targets[0] !== "slack") return false;
  if (mailListOf(rawOf_(raw, "メールの宛先")).addresses.length > 0) return false;
  for (const key of ["Webhook URL", "Discord の Webhook URL", "Google Chat の Webhook URL"]) {
    if (checkText_(rawOf_(raw, key)) !== "") return false;
  }
  return true;
}

/** 設定の行ごとの誤りを、最初の 1 つで止めずに全部集める（文は parseConfig と同じ語を使う） */
export function collectConfigProblems(rows) {
  const problems = [];
  const raw = rawSettings_(rows);

  const targetRaw = rawOf_(raw, "通知先");
  const named = targetNamesOf(targetRaw);
  if (named.some((name) => TARGETS.indexOf(name) < 0)) {
    problems.push("「設定」シートの「通知先」は " + TARGETS.join("・") + " から選んで、カンマで区切って書いてください（いまは「" + checkText_(targetRaw) + "」）。");
  }
  const targets = chosenTargets_(raw);
  const slack = targets.indexOf("slack") >= 0;
  const discord = targets.indexOf("discord") >= 0;
  // discord は「Discord の Webhook URL」が空で slack も選んでいなければ、1.2.0 までどおり「Webhook URL」を使う
  const discordRow = checkText_(rawOf_(raw, "Discord の Webhook URL"));
  const legacyDiscord = discord && !slack && discordRow === "";
  const unset = noDestination_(raw);
  if (unset) problems.push(NO_DESTINATION_TEXT);

  // Webhook URL は slack か（1.2.0 までの書き方の）discord を選んだときだけ確かめる（通知先が読めないときも、これまでどおり確かめる）。
  // URL は人に見せない鍵なので、文には出さない
  if (!unset && (slack || legacyDiscord || targets.length === 0)) {
    const url = checkText_(rawOf_(raw, "Webhook URL"));
    if (url === "") {
      problems.push("「設定」シートの「Webhook URL」が空です。README の手順 2 で作った URL を貼ってください。");
    } else if (url.indexOf("https://") !== 0) {
      problems.push("「設定」シートの「Webhook URL」は https:// で始まる URL です。前後に余分な字が入っていないかも確かめてください。");
    } else if (url.indexOf(SAMPLE_URL_MARK) >= 0) {
      problems.push("「設定」シートの「Webhook URL」が見本の URL のままです。README の手順 2 で作ったご自身の URL に貼り替えてください。");
    } else if (url.indexOf(CHAT_URL_PREFIX) === 0) {
      problems.push("「設定」シートの「Webhook URL」は Google Chat の URL です。Google Chat に送るときは、「通知先」を googlechat にし、URL は「Google Chat の Webhook URL」の行に貼ってください。");
    } else if (slack && !discord && /discord(app)?\.com\/api\/webhooks/.test(url)) {
      problems.push("「通知先」が slack ですが、「Webhook URL」は Discord の URL です。「通知先」を discord にしてください。");
    } else if (legacyDiscord && url.indexOf("hooks.slack.com") >= 0) {
      problems.push("「通知先」が discord ですが、「Webhook URL」は Slack の URL です。「通知先」を slack にしてください。");
    }
  }

  if (discord && !legacyDiscord) {
    if (discordRow === "") {
      problems.push("「設定」シートの「Discord の Webhook URL」が空です。README の手順 2 の「Discord の場合」で作った URL を貼ってください。");
    } else if (discordRow.indexOf("https://") !== 0) {
      problems.push("「設定」シートの「Discord の Webhook URL」は https:// で始まる URL です。前後に余分な字が入っていないかも確かめてください。");
    } else if (discordRow.indexOf("hooks.slack.com") >= 0) {
      problems.push("「通知先」が discord ですが、「Discord の Webhook URL」は Slack の URL です。Slack の URL は「Webhook URL」の行に貼ってください。");
    }
  }

  if (targets.indexOf("gmail") >= 0) {
    const mailRaw = rawOf_(raw, "メールの宛先");
    const list = mailListOf(mailRaw);
    if (mailRaw === undefined) {
      problems.push("「設定」シートに「メールの宛先」の行がありません。「初期化」を実行して行を足し、通知を受け取るメールアドレスを書いてください。");
    } else if (list.invalid.length > 0) {
      for (let i = 0; i < list.invalid.length; i += 1) {
        problems.push("「設定」シートの「メールの宛先」の「" + list.invalid[i] + "」はメールアドレスの形ではありません。");
      }
    } else if (list.addresses.length === 0) {
      problems.push("「設定」シートの「メールの宛先」が空です。通知を受け取るメールアドレスを書いてください（複数のときはカンマで区切ります）。");
    }
  }

  if (targets.indexOf("googlechat") >= 0) {
    const chatRaw = rawOf_(raw, "Google Chat の Webhook URL");
    const chatUrl = checkText_(chatRaw);
    if (chatRaw === undefined) {
      problems.push("「設定」シートに「Google Chat の Webhook URL」の行がありません。「初期化」を実行して行を足し、URL を貼ってください。");
    } else if (chatUrl === "") {
      problems.push("「設定」シートの「Google Chat の Webhook URL」が空です。README の手順 2 の「Google Chat の場合」で作った URL を貼ってください。");
    } else if (chatUrl.indexOf("https://") !== 0) {
      problems.push("「設定」シートの「Google Chat の Webhook URL」は https:// で始まる URL です。前後に余分な字が入っていないかも確かめてください。");
    } else if (chatUrl.indexOf(CHAT_URL_PREFIX) !== 0) {
      problems.push("「設定」シートの「Google Chat の Webhook URL」は " + CHAT_URL_PREFIX + " で始まる URL です。Google Chat のスペースで作った Webhook の URL を貼ってください。");
    }
  }

  const thresholds = rawOf_(raw, "しきい値");
  if (thresholds !== undefined && checkText_(thresholds) !== "" && failsAlone_("しきい値", thresholds)) {
    problems.push("「設定」シートの「しきい値」は、0 以上の整数をカンマで区切って書いてください（いまは「" + checkText_(thresholds) + "」）。例: 3,0");
  }
  const overdue = rawOf_(raw, "超過も通知する");
  if (overdue !== undefined && failsAlone_("超過も通知する", overdue)) {
    problems.push("「設定」シートの「超過も通知する」は TRUE か FALSE にしてください（いまは「" + checkText_(overdue) + "」）。");
  }
  const limit = rawOf_(raw, "超過を知らせる上限日数");
  if (limit !== undefined && failsAlone_("超過を知らせる上限日数", limit)) {
    problems.push("「設定」シートの「超過を知らせる上限日数」は 1 以上の整数で書いてください（いまは「" + checkText_(limit) + "」）。例: 30");
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
  const settings = settingsOf_(snapshot);
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
  const sheetRows = snapshot.sheets[SETTINGS_TAB];
  if (sheetRows === undefined) return notes;
  const settings = settingsOf_(snapshot);
  // 既定値が空の行（送り先）は、選んだ通知先で要るときに「直すところ」で出す
  const missing = missingRowsOf_(settings).filter((row) => row[1] !== "");
  if (missing.length > 0) {
    notes.push(
      "「設定」シートに" + missing.map((row) => "「" + row[0] + "」").join("") + "の行がありません。既定値（" + missing.map((row) => row[1]).join(" と ") + "）で動きます。「初期化」を実行すると、既定値の行を足します。",
    );
  }
  const raw = rawSettings_(settings);
  if (checkText_(rawOf_(raw, "メールの宛先")) !== "" && chosenTargets_(raw).indexOf("gmail") < 0) {
    notes.push("「メールの宛先」が書いてありますが、「通知先」に gmail が無いため、メールは送りません。メールでも受け取るときは「通知先」に gmail を足してください（例: slack,gmail）。");
  }
  if (checkText_(rawOf_(raw, "Google Chat の Webhook URL")) !== "" && chosenTargets_(raw).indexOf("googlechat") < 0) {
    notes.push("「Google Chat の Webhook URL」が書いてありますが、「通知先」に googlechat が無いため、Google Chat には送りません。Google Chat でも受け取るときは「通知先」に googlechat を足してください（例: gmail,googlechat）。");
  }
  // 見本の形だけの URL は鍵ではないので数えない
  const plain = secretsInSheet(sheetRows).filter((found) => found.value.indexOf(SAMPLE_URL_MARK) < 0);
  if (plain.length > 0) {
    notes.push(
      plain.map((found) => "「" + found.key + "」").join("") + "の URL がシートにそのまま書いてあります。シートを見られる人は誰でもそこへ投稿できます。メニュー「鍵を保存」で、URL をスクリプト プロパティに移せます。",
    );
  }
  const config = readableConfig_(settings);
  const values = snapshot.sheets[config.sheetName];
  if (values !== undefined && values.length > 0 && missingHeaders(values[0], [config.columns.status]).length > 0) {
    notes.push("「" + config.sheetName + "」シートに「" + config.columns.status + "」の列がないため、完了した予定も知らせます。");
  }
  if (config.notifyOverdue && values !== undefined && values.length > 0 && missingHeaders(values[0], [config.columns.subject, config.columns.due]).length === 0) {
    const limit = overdueLimitOf(config);
    const stale = parseItems(values, config).items.filter((item) => diffDays(snapshot.today, item.dueKey) < -limit).length;
    if (stale > 0) {
      notes.push(
        "「" + config.sheetName + "」シートに、期限を " + limit + " 日より前に過ぎた予定が " + stale + " 件あります。毎朝の通知には出しません。済んでいれば「" + config.columns.status + "」を「" + config.doneValues[0] + "」に、まだなら期限を書き直してください。",
      );
    }
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
  const config = parseConfig(settingsOf_(snapshot));
  const values = snapshot.sheets[config.sheetName];
  const parsed = parseItems(values, config);

  const days = [];
  if (config.notifyOverdue) days.push("期限を過ぎたもの（" + config.overdueLimit + " 日まで）");
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

  const lines = [
    "通知: " + config.targets.join("・") + " に、毎朝 8 時ごろ 1 通" + (config.targets.length > 1 ? "ずつ" : "") + "送ります（毎朝の実行: " + (snapshot.hasTrigger === true ? "作ってあります" : "まだ作っていません") + "）",
  ];
  if (config.targets.indexOf("gmail") >= 0) {
    lines.push("メールの宛先: " + config.mailTo.join("、") + "（件名は「【期限】月/日 の通知（件数）」です）");
  }
  return lines.concat([
    "知らせる日: " + days.join("・"),
    "読むシート: 「" + config.sheetName + "」の " + columns.join("・") + "。完了とみなす値: " + config.doneValues.join("・"),
    "いま知らせる対象の予定: " + parsed.items.length + " 件" + (done > 0 ? "（完了の " + done + " 件は除きます）" : ""),
    today,
  ]);
}
