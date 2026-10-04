// このファイルは「AI 問い合わせ整理キット」の src/ からの写しです（中身は書き換えていません）。
// 直すときはキットの側を直してから、scripts/sync-gas-kits.mjs を走らせてください。
/**
 * Gmail のメール 1 通を、Claude に渡す入力（差出人・件名・受信日時・添付の名前・本文）に整える。
 * 引用と HTML のタグを落とし、上限で切る。除外する差出人と配信メールの見分けもここ。
 * GAS のグローバルには触らない（gas_gmail.js が GmailMessage から素の値を取り出してここへ渡す）。
 */
import { formatStamp } from "./dates.js";

const OMITTED = "\n…（以下省略）";

/** "名前 <addr>" / "\"名前\" <addr>" / "addr" を名前とアドレスに分ける */
export function parseFrom(text) {
  const source = String(text === null || text === undefined ? "" : text).trim();
  if (source === "") return { name: "", address: "" };
  const matched = source.match(/^(.*?)\s*<([^<>]+)>\s*$/);
  if (!matched) return { name: "", address: source };
  const name = matched[1].trim().replace(/^"(.*)"$/, "$1").trim();
  return { name: name, address: matched[2].trim() };
}

/** 引用の始まりの行か */
function isQuoteHeader_(line) {
  const text = line.trim();
  if (/^On .+ wrote:$/.test(text)) return true;
  if (/^-{2,}\s*Original Message\s*-{2,}$/i.test(text)) return true;
  if (/^-{2,}\s*元のメッセージ\s*-{2,}$/.test(text)) return true;
  // "2026年9月13日(土) 10:00 みなと商会 <info@example.com>:" のような Gmail の日本語の引用の見出し
  if (/^\d{4}年\d{1,2}月\d{1,2}日.*<[^<>]+>:$/.test(text)) return true;
  if (/^\d{4}\/\d{1,2}\/\d{1,2}.*<[^<>]+>:$/.test(text)) return true;
  return false;
}

/** > で始まる行と、引用の見出しから後ろを落とす */
export function stripQuotes(text) {
  const lines = String(text === null || text === undefined ? "" : text).replace(/\r\n/g, "\n").split("\n");
  const kept = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (isQuoteHeader_(line)) break;
    if (/^\s*>/.test(line)) continue;
    kept.push(line);
  }
  return kept.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

/** HTML のタグを落として文にする。改行と箇条書きの形は残す */
export function htmlToText(html) {
  let text = String(html === null || html === undefined ? "" : html);
  text = text.replace(/<(script|style)[\s\S]*?<\/\1>/gi, "");
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<li[^>]*>/gi, "- ");
  text = text.replace(/<\/(p|div|tr|li|h[1-6]|table)>/gi, "\n");
  text = text.replace(/<[^>]+>/g, "");
  text = text.replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, function (whole, entity) {
    const key = entity.toLowerCase();
    if (key.charAt(0) === "#") {
      const code = key.charAt(1) === "x" ? parseInt(key.slice(2), 16) : parseInt(key.slice(1), 10);
      return Number.isNaN(code) ? whole : String.fromCharCode(code);
    }
    return Object.prototype.hasOwnProperty.call(ENTITIES, key) ? ENTITIES[key] : whole;
  });
  return text
    .split("\n")
    .map(function (line) {
      return line.replace(/[ \t]+/g, " ").trim();
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** 上限で切り、切ったことが分かる印を足す */
export function truncateBody(text, limit) {
  const source = String(text === null || text === undefined ? "" : text);
  if (source.length <= limit) return source;
  return source.slice(0, limit) + OMITTED;
}

/** 除外の差出人（部分一致・大文字小文字を見ない） */
export function isExcludedSender(address, excludedSenders) {
  const target = String(address === null || address === undefined ? "" : address).toLowerCase();
  const list = Array.isArray(excludedSenders) ? excludedSenders : [];
  for (let i = 0; i < list.length; i += 1) {
    const needle = String(list[i]).trim().toLowerCase();
    if (needle !== "" && target.indexOf(needle) >= 0) return true;
  }
  return false;
}

/** 配信メール・自動送信（List-Unsubscribe / Precedence: bulk|list|junk / Auto-Submitted: auto-*） */
export function isBulk(headers) {
  const h = headers === null || headers === undefined ? {} : headers;
  const text = function (value) {
    return value === null || value === undefined ? "" : String(value).trim();
  };
  if (text(h.listUnsubscribe) !== "") return true;
  const precedence = text(h.precedence).toLowerCase();
  if (precedence === "bulk" || precedence === "list" || precedence === "junk") return true;
  const auto = text(h.autoSubmitted).toLowerCase();
  if (auto !== "" && auto !== "no") return true;
  return false;
}

/**
 * message = { from, subject, date, plainBody, htmlBody, attachmentNames }（gas_gmail.js が GmailMessage から取り出す）
 * config は bodyLimit だけ使う
 */
export function buildInput(message, config) {
  const plain = stripQuotes(message.plainBody);
  const body = plain !== "" ? plain : stripQuotes(htmlToText(message.htmlBody));
  return {
    from: parseFrom(message.from),
    subject: String(message.subject === null || message.subject === undefined ? "" : message.subject).trim(),
    receivedAt: formatStamp(message.date).slice(0, 16),
    attachments: Array.isArray(message.attachmentNames) ? message.attachmentNames.slice() : [],
    body: truncateBody(body, config.bodyLimit),
  };
}
