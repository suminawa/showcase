// このファイルは「AI 問い合わせ整理キット」の src/ からの写しです（中身は書き換えていません）。
// 直すときはキットの側を直してから、scripts/sync-gas-kits.mjs を走らせてください。
/**
 * 通知の本文と、Slack / Discord / LINE それぞれの送信データを作る。
 * 本文（メールの中身）は載せない。載せるのは分類・緊急度・要約・差出人名・会社・シートの行だけ。
 */

const SLACK_LIMIT = 39000;
const DISCORD_LIMIT = 1900;
const LINE_LIMIT = 5000;

export const ATTENTION = "⚠ 要対応";

function truncate_(text, limit) {
  if (text.length <= limit) return text;
  return text.slice(0, limit - 8) + "\n…（以下省略）";
}

/** Slack の text では & < > が制御の字（<!channel> や <@U…> の呼び出し・リンク）なので、字のまま送る */
function escapeSlack_(text) {
  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Slack の文（& < > を文字参照にし、リンクだけ <URL|行 N> で書いたもの）を切る。
 * 切り口で文字参照（&amp; など）と行へのリンクを途中で切らない（どちらも途中で切ると字が崩れて見える）
 */
function truncateSlack_(text) {
  if (text.length <= SLACK_LIMIT) return text;
  return text.slice(0, SLACK_LIMIT - 8).replace(/&[a-z]{0,3}$/, "").replace(/<[^<>]*$/, "") + "\n…（以下省略）";
}

export function isAttention(answer) {
  return answer.urgency === "高" || answer.needsHuman === true;
}

/**
 * シートの行の書き方。rowUrl があればリンクにする。
 * Slack だけはリンクの書き方が違う（`<URL|見せる字>`。URL の & は文字参照にする）。Discord と LINE は URL をそのまま置く。
 */
function rowLabel_(item, target) {
  const label = "行 " + item.rowNumber;
  const url = item.rowUrl === undefined || item.rowUrl === null ? "" : String(item.rowUrl);
  if (url === "") return label;
  if (target === "slack") return "<" + escapeSlack_(url) + "|" + label + ">";
  return label + " " + url;
}

/**
 * item = { answer, input, receipt, rowNumber, rowUrl }。target は "slack" / "discord" / "line"。
 * 差出人名・会社・要約はメールから来た字なので、Slack では & < > を文字参照にする（<!channel> などが呼び出しとして働かないように）
 */
export function buildItemLine(item, target) {
  const a = item.answer;
  const name = a.person.name === null || a.person.name === "" ? item.input.from.name : a.person.name;
  const who = (name === "" ? "（名前なし）" : name) + (a.person.company === null || a.person.company === "" ? "" : "（" + a.person.company + "）");
  const body = "[" + a.urgency + "] " + a.category + "｜" + a.summary + " — " + who;
  const line = (target === "slack" ? escapeSlack_(body) : body) + " → " + rowLabel_(item, target);
  return isAttention(a) ? ATTENTION + " " + line : line;
}

/** 要対応を先頭に（順は保つ）、残りを続ける */
function sorted_(items) {
  const first = [];
  const rest = [];
  for (let i = 0; i < items.length; i += 1) (isAttention(items[i].answer) ? first : rest).push(items[i]);
  return first.concat(rest);
}

/**
 * target は宛先の名前（省略可）。リンクの書き方だけが宛先で変わる。
 * Slack の文は組み立て済み（& < > を文字参照にし、行へのリンクを <URL|行 N> で書いたもの）なので、
 * buildPayload(text, "slack", { formatted: true }) で送る
 */
export function buildNotificationText(config, items, target) {
  const lines = [];
  const ordered = sorted_(items);
  for (let i = 0; i < ordered.length; i += 1) lines.push(buildItemLine(ordered[i], target));
  const template = target === "slack" ? escapeSlack_(config.notifyTemplate) : String(config.notifyTemplate);
  return template.replace(/\{(件数|一覧)\}/g, function (whole, key) {
    return key === "件数" ? String(items.length) : lines.join("\n");
  });
}

export function buildErrorText(error, stamp) {
  const detail = error && error.message ? error.message : String(error);
  return "【問い合わせ整理｜エラー】" + stamp + "\n整理を実行できませんでした: " + detail + "\nスプレッドシートの「設定」シートと、スクリプト プロパティの ANTHROPIC_API_KEY を確かめてください。";
}

/**
 * Slack は text、Discord は content、LINE は push message の中身。
 * 差出人名・会社・要約はメールから来た字なので、@everyone や呼び出しとして働かせない:
 * Discord は allowed_mentions を空にし、Slack は & < > を文字参照にする。
 * buildNotificationText(config, items, "slack") の文は文字参照とリンクがもう入っているので、options.formatted を true にして渡す（重ねて変えない）
 */
export function buildPayload(text, target, options) {
  if (target === "discord") return { content: truncate_(text, DISCORD_LIMIT), allowed_mentions: { parse: [] } };
  if (target === "line") {
    const to = options === undefined || options === null || options.lineTo === undefined ? "" : String(options.lineTo);
    return { to: to, messages: [{ type: "text", text: truncate_(text, LINE_LIMIT) }] };
  }
  const formatted = options !== undefined && options !== null && options.formatted === true;
  return { text: truncateSlack_(formatted ? String(text) : escapeSlack_(text)) };
}
