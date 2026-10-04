// このファイルは「フォーム受付 GAS キット」の src/ からの写しです（中身は書き換えていません）。
// 直すときはキットの側を直してから、scripts/sync-gas-kits.mjs を走らせてください。
/**
 * 通知の本文と、Slack / Discord / LINE それぞれの送信データを作る。
 * 本文は装飾を使わない。どの宛先でも同じ見た目になる。
 */

/** Slack の text は 40,000 字まで。余裕を見てここで切る */
const SLACK_LIMIT = 39000;

/** Discord の content は 2,000 字まで。余裕を見てここで切る */
const DISCORD_LIMIT = 1900;

/** LINE のテキストメッセージは 5,000 字まで */
const LINE_LIMIT = 5000;

/** 自動返信を送れなかったときに、通知の末尾へ足す 1 行 */
export const QUOTA_NOTICE = "※ 自動返信は本日の上限に達したため送っていません。";

function truncate_(text, limit) {
  if (text.length <= limit) return text;
  // Slack の文字参照（&amp; など）を途中で切らない
  return text.slice(0, limit - 8).replace(/&[a-z]{0,3}$/, "") + "\n…（以下省略）";
}

/** Slack の text では & < > が制御の字（<!channel> や <@U…> の呼び出し・リンク）なので、字のまま送る */
function escapeSlack_(text) {
  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** 「項目名: 値」を改行で並べたもの。値が空の項目は出さない */
export function buildFieldList(fields, order) {
  const names = Array.isArray(order) ? order : Object.keys(fields);
  const lines = [];
  for (let i = 0; i < names.length; i += 1) {
    const name = names[i];
    const value = fields[name] === null || fields[name] === undefined ? "" : String(fields[name]);
    if (value.trim() === "") continue;
    lines.push(name + ": " + value);
  }
  return lines.join("\n");
}

/**
 * テンプレの差し込みを 1 回の走査で置き換える。
 * {受付番号} {項目一覧} {送信元} と、項目名そのもの（{email} など）が使える。
 * 知らない差し込みは、そのままの字で残す（書き間違いに気づけるように）。
 * 値の中に {…} があっても、それは置き換えない。
 * context = { receipt, fields, order, source }
 */
export function renderTemplate(template, context) {
  const fields = context.fields === undefined || context.fields === null ? {} : context.fields;
  const reserved = {
    "受付番号": context.receipt === undefined ? "" : String(context.receipt),
    "項目一覧": buildFieldList(fields, context.order),
    "送信元": context.source === undefined ? "" : String(context.source),
  };
  return String(template).replace(/\{([^{}\n]{1,60})\}/g, function (whole, key) {
    if (Object.prototype.hasOwnProperty.call(reserved, key)) return reserved[key];
    if (Object.prototype.hasOwnProperty.call(fields, key)) return String(fields[key]);
    return whole;
  });
}

/** 1 件届いたことを知らせる本文 */
export function buildNotificationText(config, context) {
  const text = renderTemplate(config.notifyTemplate, context);
  return context.quotaExhausted === true ? text + "\n\n" + QUOTA_NOTICE : text;
}

/** 失敗したときに、同じ通知先へ流す本文 */
export function buildErrorText(error, stamp) {
  const detail = error && error.message ? error.message : String(error);
  return (
    "【フォーム受付｜エラー】" +
    stamp +
    "\n受け付けを処理できませんでした: " +
    detail +
    "\nスプレッドシートの「設定」シートと受付シートを確かめてください。"
  );
}

/**
 * Slack は text、Discord は content、LINE は push message の中身。
 * 本文にはフォームに書かれた字がそのまま入るので、@everyone や呼び出しとして働かせない:
 * Slack は & < > を文字参照にし、Discord は allowed_mentions を空にする
 */
export function buildPayload(text, target, options) {
  if (target === "discord") return { content: truncate_(text, DISCORD_LIMIT), allowed_mentions: { parse: [] } };
  if (target === "line") {
    const to = options === undefined || options === null || options.lineTo === undefined ? "" : String(options.lineTo);
    return { to: to, messages: [{ type: "text", text: truncate_(text, LINE_LIMIT) }] };
  }
  return { text: truncate_(escapeSlack_(text), SLACK_LIMIT) };
}
