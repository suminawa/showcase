// このファイルは「フォーム受付 GAS キット」の src/ からの写しです（中身は書き換えていません）。
// 直すときはキットの側を直してから、scripts/sync-gas-kits.mjs を走らせてください。
/**
 * 受付シートの見出しと 1 行を組み立てる。
 * 見出しは名前で探すので、買い手が列を並べ替えていても正しい場所に書く。
 * 見出しに無い項目は末尾に足す。消された見出し（受付日時・受付番号・送信元）は足し直さない。
 * シートに書く字は buildRow で safeCell_ を通す。買い手が送りつけられた数式を動かさないため。
 */

export const STAMP_HEADER = "受付日時";
export const RECEIPT_HEADER = "受付番号";
export const SOURCE_HEADER = "送信元";

function cellText_(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

/** Sheets が数式として解釈する先頭文字を無力化する（見た目は変わらない） */
function safeCell_(value) {
  const text = value === undefined || value === null ? "" : String(value);
  return /^[=+\-@\t\r]/.test(text) ? "'" + text : text;
}

/** 列に並べる項目名。「項目の並び」があればその順、無ければ送られてきた順 */
export function fieldNamesOf(config, order) {
  const source = config.fieldOrder.length > 0 ? config.fieldOrder : Array.isArray(order) ? order : [];
  const names = [];
  for (let i = 0; i < source.length; i += 1) {
    const name = cellText_(source[i]);
    if (name === "") continue;
    if (config.pageField !== "" && name === config.pageField) continue;
    if (config.honeypotField !== "" && name === config.honeypotField) continue;
    if (names.indexOf(name) >= 0) continue;
    names.push(name);
  }
  return names;
}

/** シートが空のときの 1 行目。ここでは元の字のまま返し、シートに書く形にするのは buildRow */
export function buildHeader(config, order) {
  return [STAMP_HEADER, RECEIPT_HEADER].concat(fieldNamesOf(config, order)).concat([SOURCE_HEADER]);
}

/**
 * 既にある見出しに合わせて 1 行を作る。
 * entry = { stamp, receipt, fields, order, source }（fields と order は stripInternal を通したもの）
 * 返り値 { header, row, added }。header は足した見出しまで入った最終形で、そのままシートに書ける。
 * 送信から来る字（項目名・値・送信元）は safeCell_ を通す。受付日時と受付番号はこのキットが作る字なのでそのまま。
 * added は突き合わせに使う元の字のまま返す。
 */
export function buildRow(header, entry) {
  const names = [];
  const source = Array.isArray(header) ? header : [];
  for (let i = 0; i < source.length; i += 1) names.push(cellText_(source[i]));

  const added = [];
  const incoming = Array.isArray(entry.order) ? entry.order : [];
  for (let i = 0; i < incoming.length; i += 1) {
    const name = cellText_(incoming[i]);
    if (name === "") continue;
    if (names.indexOf(name) >= 0) continue;
    names.push(name);
    added.push(name);
  }

  const row = [];
  const written = [];
  for (let i = 0; i < names.length; i += 1) {
    const name = names[i];
    written.push(safeCell_(name));
    if (name === STAMP_HEADER) {
      row.push(entry.stamp);
    } else if (name === RECEIPT_HEADER) {
      row.push(entry.receipt);
    } else if (name === SOURCE_HEADER) {
      row.push(safeCell_(entry.source));
    } else {
      row.push(safeCell_(entry.fields[name]));
    }
  }
  return { header: written, row: row, added: added };
}
