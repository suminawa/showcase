// このファイルは「フォーム受付 GAS キット」の src/ からの写しです（中身は書き換えていません）。
// 直すときはキットの側を直してから、scripts/sync-gas-kits.mjs を走らせてください。
/**
 * 初期化と「設定を確かめる」の共通の部品（純粋）。3 つのキットに同じ中身を写して置く。
 * 元: 期限アラート GAS キット 1.1.0 の src/setup.js。考え方は業務アプリ キット 1.1.0 の
 * ensureSettingsSheet_ / ensureTable_（足りないものだけ足す。既にあるセルには書かない）。
 * 写した先: フォーム受付 GAS キット 1.1.0、予約ページ キット 1.1.0。直すときは 3 本とも直す。
 */

export const INIT_MENU_LABEL = "初期化（足りないシート・見出し・設定を足す。データは消しません）";
export const CHECK_MENU_LABEL = "設定を確かめる";

/** 「設定を確かめる」の一覧に並べる行の数。alert が画面に収まる量 */
export const CHECK_LINE_LIMIT = 15;

/** セルの値を、前後の空白を落とした文字にする。null / undefined は "" */
function setupText_(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

/** 1 行目に無い見出しを、wanted の順で返す。比べるのは前後の空白を落とした字どうし */
export function missingHeaders(header, wanted) {
  const have = (Array.isArray(header) ? header : []).map(setupText_);
  const missing = [];
  const list = Array.isArray(wanted) ? wanted : [];
  for (let i = 0; i < list.length; i += 1) {
    const name = setupText_(list[i]);
    if (name === "" || have.indexOf(name) >= 0 || missing.indexOf(name) >= 0) continue;
    missing.push(name);
  }
  return missing;
}

/**
 * 設定シートに無い項目の行を、wanted の順で返す。
 * keyOf はキットの読み取りと同じそろえ方（読み取りが同じ項目とみなす行があれば、足さない）。
 */
export function missingSettingRows(rows, wanted, keyOf) {
  const have = {};
  const source = Array.isArray(rows) ? rows : [];
  for (let i = 0; i < source.length; i += 1) {
    const row = Array.isArray(source[i]) ? source[i] : [];
    const name = setupText_(row[0]);
    if (name !== "") have[keyOf(name)] = true;
  }
  const missing = [];
  const list = Array.isArray(wanted) ? wanted : [];
  for (let i = 0; i < list.length; i += 1) {
    const key = keyOf(setupText_(list[i][0]));
    if (have[key] === true) continue;
    have[key] = true;
    missing.push([list[i][0], list[i][1]]);
  }
  return missing;
}

/** 長い一覧を max 行と「ほか N 件」に切る */
export function limitLines(lines, max) {
  const list = Array.isArray(lines) ? lines.slice() : [];
  if (list.length <= max) return list;
  return list.slice(0, max).concat(["ほか " + (list.length - max) + " 件"]);
}

/** 行頭に印を付ける（すでに付いていれば付けない） */
function setupMark_(line, marker) {
  const text = String(line);
  return text.indexOf(marker) === 0 ? text : marker + text;
}

/**
 * 初期化の 1 通。plan は各キットの check.js の planInit が返したもの:
 * { createSheets: [{ name, rows, freeze, exists }], appendHeaders: [{ sheet, names }],
 *   appendSettings: { sheet, rows, blank }, notes: [文] }
 * exists が true のシートは「あったが空だった」もの（シートは作らず、中身だけを書く）。
 */
export function initReport(plan, nextStep) {
  const lines = [];
  const made = [];
  const filled = [];
  for (let i = 0; i < plan.createSheets.length; i += 1) {
    const sheet = plan.createSheets[i];
    if (sheet.exists === true) filled.push(sheet.name);
    else made.push(sheet.name);
  }
  if (made.length > 0) lines.push("・シートを作りました: " + made.join("、"));
  for (let i = 0; i < filled.length; i += 1) lines.push("・空だった「" + filled[i] + "」シートに見出しを書きました");
  for (let i = 0; i < plan.appendHeaders.length; i += 1) {
    const entry = plan.appendHeaders[i];
    lines.push("・「" + entry.sheet + "」シートの見出しに足しました: " + entry.names.join("、"));
  }
  const settingRows = plan.appendSettings.rows;
  if (settingRows.length > 0) {
    const keys = settingRows.map((row) => row[0]);
    const after = plan.appendSettings.blank === true ? "（値は空のままです。空の項目は既定値で動きます）" : "（値は既定値です。変えるときは書き換えてください）";
    lines.push("・「" + plan.appendSettings.sheet + "」シートに " + settingRows.length + " 行足しました: " + keys.join("、") + after);
  }

  let text =
    lines.length === 0
      ? "変更はありません。シート・見出し・設定の行はそろっています。"
      : "初期化しました。足したものは次のとおりです（すでにあったデータは変えていません）。\n\n" + lines.join("\n");
  if (plan.notes.length > 0) {
    text += "\n\nご確認ください:\n" + plan.notes.map((note) => setupMark_(note, "・")).join("\n");
  }
  if (setupText_(nextStep) !== "") text += "\n\n" + nextStep;
  return text;
}

/**
 * 「設定を確かめる」の 1 通。
 * problems: 直すところ（15 行まで）。prefix が "" なら各行に「・」を付け、"booking: " のような前置きなら
 * その前置きで始める（前置きのあるキットは「・」を付けない）。
 * summary: 直すところが無いときの「これから起きること」。notes: 誤りではないが知っておくとよいこと。
 */
export function checkReport(problems, summary, prefix, notes) {
  const marker = setupText_(prefix) === "" ? "・" : String(prefix);
  const list = Array.isArray(problems) ? problems : [];
  let text;
  if (list.length > 0) {
    text =
      "直すところがあります。\n\n" +
      limitLines(list, CHECK_LINE_LIMIT)
        .map((line) => setupMark_(line, marker))
        .join("\n") +
      "\n\n直したら、もう一度「設定を確かめる」を実行してください。";
  } else {
    const lines = Array.isArray(summary) ? summary : [];
    text = "問題ありません。" + (lines.length > 0 ? "\n\n" + lines.join("\n") : "");
  }
  const extra = Array.isArray(notes) ? notes : [];
  if (extra.length > 0) {
    text += "\n\nご参考:\n" + limitLines(extra, CHECK_LINE_LIMIT).map((note) => setupMark_(note, "・")).join("\n");
  }
  return text;
}

/**
 * 初期化が途中で失敗したときの 1 文。done には、実際に書き終えた分だけの短い文を、起きた順に並べる
 * （例: ["設定に 3 行を足しました"]）。failedAt は止まった場所（例: 「見出しの追記」）。
 * 権限エラーなどへの言い換えは、この関数に渡す前に済ませておく。
 */
export function initFailureText(done, failedAt, error) {
  const message = String(error && error.message ? error.message : error);
  const parts = (Array.isArray(done) ? done : []).map(setupText_).filter((line) => line !== "");
  const before = parts.length > 0 ? parts.join("。") + "。そのあと " : "";
  return before + setupText_(failedAt) + "で止まりました: " + message;
}
