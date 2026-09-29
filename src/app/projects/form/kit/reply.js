// このファイルは「フォーム受付 GAS キット」の src/ からの写しです（中身は書き換えていません）。
// 直すときはキットの側を直してから、scripts/sync-gas-kits.mjs を走らせてください。
/**
 * 自動返信の宛先・件名・本文。呼び出し側でそのままメール送信に渡せる形で返す。
 */
import { renderTemplate } from "./message.js";

/**
 * 送らないときは null（自動返信が FALSE、またはメールの項目が空）。
 * 返り値: { to, subject, body } に、差出人名があれば name、返信先があれば replyTo が付く。
 */
export function buildReply(config, context) {
  if (config.autoReply !== true) return null;
  if (config.emailField === "") return null;
  const fields = context.fields === undefined || context.fields === null ? {} : context.fields;
  const to = fields[config.emailField] === undefined ? "" : String(fields[config.emailField]).trim();
  if (to === "") return null;

  const options = {
    to: to,
    // 件名に改行は入れられない。テンプレに改行があれば空白にたたむ
    subject: renderTemplate(config.replySubject, context).replace(/\s*\n+\s*/g, " ").trim(),
    body: renderTemplate(config.replyBody, context),
  };
  if (config.senderName !== "") options.name = config.senderName;
  if (config.replyTo !== "") options.replyTo = config.replyTo;
  return options;
}
