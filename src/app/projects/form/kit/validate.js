// このファイルは「フォーム受付 GAS キット」の src/ からの写しです（中身は書き換えていません）。
// 直すときはキットの側を直してから、scripts/sync-gas-kits.mjs を走らせてください。
/**
 * 受け取った項目を検証する。
 * ハニーポット（人には見えない欄）に字が入っていたら迷惑投稿。
 * 呼ぶ側は { ok: true } を返すので、bot には弾かれたと分からない。
 */

/** 1 項目に入れられる字数。絵文字も 1 字として数える */
export const MAX_FIELD_LENGTH = 2000;

/** 1 回の送信で受け取る項目の数 */
export const MAX_FIELD_COUNT = 30;

const EMAIL_PATTERN = /^[^\s@,]+@[^\s@,]+\.[^\s@,]+$/;

function fieldText_(fields, name) {
  const value = fields[name];
  return value === null || value === undefined ? "" : String(value);
}

/** 見た目どおりの字数。絵文字（🙂 など）は JavaScript の length では 2 字になるので、コードポイントで数える */
function lengthOf_(text) {
  return Array.from(text).length;
}

function namesOf_(parsed) {
  if (parsed && Array.isArray(parsed.order)) return parsed.order;
  return parsed && parsed.fields ? Object.keys(parsed.fields) : [];
}

/**
 * parsed は parse.js の { fields, order }。
 * 返り値: { ok, reason: "" | "spam" | "invalid", message }
 */
export function validateSubmission(parsed, config) {
  const fields = parsed && parsed.fields ? parsed.fields : {};
  const names = namesOf_(parsed);

  if (config.honeypotField !== "" && fieldText_(fields, config.honeypotField).trim() !== "") {
    return { ok: false, reason: "spam", message: "" };
  }

  if (names.length > MAX_FIELD_COUNT) {
    return { ok: false, reason: "invalid", message: "項目が多すぎます（30 個までです）。" };
  }

  for (let i = 0; i < names.length; i += 1) {
    const name = names[i];
    if (lengthOf_(fieldText_(fields, name)) > MAX_FIELD_LENGTH) {
      return { ok: false, reason: "invalid", message: "「" + name + "」が長すぎます（2,000 字までです）。" };
    }
  }

  const missing = [];
  for (let i = 0; i < config.requiredFields.length; i += 1) {
    const name = config.requiredFields[i];
    if (fieldText_(fields, name).trim() === "") missing.push("「" + name + "」");
  }
  if (missing.length > 0) {
    return { ok: false, reason: "invalid", message: missing.join("") + "を入力してください。" };
  }

  const email = config.emailField === "" ? "" : fieldText_(fields, config.emailField).trim();
  if (email !== "" && !EMAIL_PATTERN.test(email)) {
    return { ok: false, reason: "invalid", message: "メールアドレスの形を確かめてください。" };
  }

  return { ok: true, reason: "", message: "" };
}

/**
 * 受付シートにも通知にも出さない項目を分ける。
 * ハニーポットの項目は捨て、送信元の項目は source に移す。
 * 返り値: { fields, order, source }
 */
export function stripInternal(parsed, config) {
  const fields = {};
  const order = [];
  let source = "";
  const names = namesOf_(parsed);
  const incoming = parsed && parsed.fields ? parsed.fields : {};
  for (let i = 0; i < names.length; i += 1) {
    const name = names[i];
    if (config.honeypotField !== "" && name === config.honeypotField) continue;
    if (config.pageField !== "" && name === config.pageField) {
      source = fieldText_(incoming, name);
      continue;
    }
    order.push(name);
    fields[name] = fieldText_(incoming, name);
  }
  return { fields: fields, order: order, source: source };
}
