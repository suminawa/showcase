// このファイルは「フォーム受付 GAS キット」の src/ からの写しです（中身は書き換えていません）。
// 直すときはキットの側を直してから、scripts/sync-gas-kits.mjs を走らせてください。
/**
 * 送信の中身を「項目名 → 値（文字列）」の組にそろえる。
 * 受ける形は 3 つ。
 *   1. JSON（Content-Type が application/json、または text/plain の中身が JSON）
 *   2. application/x-www-form-urlencoded
 *   3. 素の <form method="post">（Apps Script が e.parameter に入れてくれる）
 */

export class ParseError extends Error {
  constructor(message) {
    super(message);
    this.name = "ParseError";
  }
}

/** どの形で来ても、値は文字列 1 つにそろえる */
function valueText_(value) {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) {
    const parts = [];
    for (let i = 0; i < value.length; i += 1) parts.push(valueText_(value[i]));
    return parts.join(", ");
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

/** 同じ項目名が 2 回来たら、後の値で上書きする（並びは最初に出た位置のまま） */
function put_(fields, order, name, value) {
  const key = String(name).trim();
  if (key === "") return;
  if (!Object.prototype.hasOwnProperty.call(fields, key)) order.push(key);
  fields[key] = valueText_(value).trim();
}

/** Content-Type から "; charset=utf-8" を落として小文字にする */
function mediaTypeOf_(type) {
  return String(type === null || type === undefined ? "" : type)
    .split(";")[0]
    .trim()
    .toLowerCase();
}

function parseUrlEncoded_(text) {
  const fields = {};
  const order = [];
  const parts = String(text).split("&");
  for (let i = 0; i < parts.length; i += 1) {
    const part = parts[i];
    if (part === "") continue;
    const at = part.indexOf("=");
    const rawName = at < 0 ? part : part.slice(0, at);
    const rawValue = at < 0 ? "" : part.slice(at + 1);
    try {
      put_(
        fields,
        order,
        decodeURIComponent(rawName.replace(/\+/g, " ")),
        decodeURIComponent(rawValue.replace(/\+/g, " ")),
      );
    } catch (error) {
      throw new ParseError("送信の中身を読み取れませんでした（文字の形が壊れています）。");
    }
  }
  return { fields: fields, order: order };
}

function parseJson_(text) {
  let parsed = null;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    throw new ParseError("送信の中身を読み取れませんでした（JSON として読めません）。");
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new ParseError("送信の中身は、項目名と値の組にしてください。");
  }
  const fields = {};
  const order = [];
  const names = Object.keys(parsed);
  for (let i = 0; i < names.length; i += 1) put_(fields, order, names[i], parsed[names[i]]);
  return { fields: fields, order: order };
}

function fromParameter_(parameter) {
  const fields = {};
  const order = [];
  const names = Object.keys(parameter);
  for (let i = 0; i < names.length; i += 1) put_(fields, order, names[i], parameter[names[i]]);
  return { fields: fields, order: order };
}

/**
 * doPost(e) の e を { fields, order } にする。
 * fields は項目名 → 文字列（前後の空白は落とす）、order は送られてきた順の項目名。
 */
export function parseBody(event) {
  const source = event === null || event === undefined ? {} : event;
  const postData = source.postData;
  const contents = postData && typeof postData.contents === "string" ? postData.contents : "";
  if (contents.trim() !== "") {
    if (mediaTypeOf_(postData.type) === "application/x-www-form-urlencoded") return parseUrlEncoded_(contents);
    return parseJson_(contents);
  }
  const parameter = source.parameter;
  if (parameter && typeof parameter === "object" && Object.keys(parameter).length > 0) {
    return fromParameter_(parameter);
  }
  throw new ParseError("送信の中身がありません。");
}
