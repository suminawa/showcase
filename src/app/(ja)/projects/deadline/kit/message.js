// このファイルは「期限アラート GAS キット」の src/ からの写しです（中身は書き換えていません）。
// 直すときはキットの側を直してから、scripts/sync-gas-kits.mjs を走らせてください。
/**
 * 通知の本文と、Slack / Discord それぞれの送信データ、メールの件名を作る。
 * 本文は装飾をほとんど使わない。Slack の mrkdwn でも Discord でもメールでも同じ見た目になる。
 */
import { formatDisplay } from "./dates.js";

/** Slack の text は 40,000 字まで。余裕を見てここで切る */
const SLACK_LIMIT = 39000;

/** Discord の content は 2000 字まで。余裕を見てここで切る */
const DISCORD_LIMIT = 1900;

/** Google Chat の text は 4,096 字まで。余裕を見てここで切る */
const CHAT_LIMIT = 4000;

/** 担当の列が空のときに出す文字 */
const NO_ASSIGNEE = "担当なし";

function remainingText_(daysLeft) {
  if (daysLeft < 0) return -daysLeft + " 日超過";
  if (daysLeft === 0) return "今日";
  return "あと " + daysLeft + " 日";
}

function truncate_(text, limit) {
  if (text.length <= limit) return text;
  // Slack の文字参照（&amp; など）を途中で切らない
  return text.slice(0, limit - 8).replace(/&[a-z]{0,3}$/, "") + "\n…（以下省略）";
}

/** Slack の text では & < > が制御の字（<!channel> や <@U…> の呼び出し・リンク）なので、字のまま送る */
function escapeSlack_(text) {
  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Google Chat の text では <users/all>（全員への呼び出し）や <https://…|字>（リンク）が働く。
 * 文字参照は字のまま出てしまうので、< > を全角の ＜ ＞ に置き換えて、働かないようにする
 */
function quietChat_(text) {
  return String(text).replace(/</g, "＜").replace(/>/g, "＞");
}

/** 1 行分の文面。{件名} {期限} {担当} {残日数} を置き換える */
export function renderItem(template, item) {
  const values = {
    "件名": item.subject,
    "期限": formatDisplay(item.dueKey),
    "担当": item.assignee === "" ? NO_ASSIGNEE : item.assignee,
    "残日数": remainingText_(item.daysLeft),
  };
  return String(template).replace(/\{(件名|期限|担当|残日数)\}/g, function (whole, key) {
    return values[key];
  });
}

/**
 * 飛ばした行を理由ごとにまとめた 1 行。理由の文言は items.js が付けたものをそのまま使う。
 * 例: ※ 期限が読めません: 2 件（5 行目、8 行目）、「件名」が空です: 1 件（7 行目）
 */
function skippedNotice_(skipped) {
  if (skipped.length === 0) return "";
  const reasons = [];
  const placesOf = {};
  for (let i = 0; i < skipped.length; i += 1) {
    const reason = String(skipped[i].reason);
    if (reasons.indexOf(reason) < 0) {
      reasons.push(reason);
      placesOf[reason] = [];
    }
    placesOf[reason].push(skipped[i].rowNumber + " 行目");
  }
  const clauses = [];
  for (let i = 0; i < reasons.length; i += 1) {
    const places = placesOf[reasons[i]];
    clauses.push(reasons[i] + ": " + places.length + " 件（" + places.join("、") + "）");
  }
  return "※ " + clauses.join("、");
}

/** 知らせる行も飛ばした行も無ければ null を返す（その日は何も送らない） */
export function buildMessage(sections, options) {
  const skipped = options.skipped === undefined || options.skipped === null ? [] : options.skipped;
  const rows = sections === undefined || sections === null ? [] : sections;
  const notice = skippedNotice_(skipped);
  if (rows.length === 0) {
    // 全部の行が読めなかった日に黙り込まないよう、飛ばした行だけは知らせる
    if (notice === "") return null;
    return "【期限アラート】" + formatDisplay(options.todayKey) + "\n今日の通知はありません。\n" + notice;
  }

  const blocks = [];
  for (let i = 0; i < rows.length; i += 1) {
    const section = rows[i];
    const lines = [section.heading];
    for (let j = 0; j < section.items.length; j += 1) {
      lines.push(renderItem(options.itemTemplate, section.items[j]));
    }
    blocks.push(lines.join("\n"));
  }
  const text = "【期限アラート】" + formatDisplay(options.todayKey) + "\n\n" + blocks.join("\n\n");
  return notice === "" ? text : text + "\n\n" + notice;
}

/** 節に並んだ行の数 */
function itemCount_(sections) {
  let count = 0;
  const rows = Array.isArray(sections) ? sections : [];
  for (let i = 0; i < rows.length; i += 1) count += rows[i].items.length;
  return count;
}

/**
 * メール（gmail）の件名。短く、日付と件数だけ。例: 【期限】9/13 の通知（3 件）
 * 知らせる行が無く、読めない行だけの日は「確認が必要な行 N 件」
 */
export function buildMailSubject(todayKey, sections, skipped) {
  const parts = String(todayKey).split("-");
  const day = Number(parts[1]) + "/" + Number(parts[2]);
  const count = itemCount_(sections);
  if (count > 0) return "【期限】" + day + " の通知（" + count + " 件）";
  const rest = Array.isArray(skipped) ? skipped.length : 0;
  return "【期限】" + day + " の通知（確認が必要な行 " + rest + " 件）";
}

/** エラーの 1 通の件名（メール） */
export function buildErrorSubject(todayKey) {
  return "【期限アラート｜エラー】" + formatDisplay(todayKey);
}

const TARGET_LABELS = { slack: "Slack", discord: "Discord", gmail: "Gmail", googlechat: "Google Chat" };

/** 通知先の、人に見せる名前 */
export function targetLabel(target) {
  return Object.prototype.hasOwnProperty.call(TARGET_LABELS, target) ? TARGET_LABELS[target] : String(target);
}

/**
 * 送れなかった通知先ごとの 1 行。返ってきた番号から、設定シートのどこを直すかを添える。
 * failure = { target, message }（message は gas_notify.js の「Webhook が 404 を返しました: …」など）
 */
export function failureLine(failure) {
  const message = String(failure.message);
  const matched = message.match(/(\d{3}) を返しました/);
  const status = matched ? Number(matched[1]) : 0;
  let hint = "設定シートの値と、実行ログの文をご確認ください。";
  if (failure.target === "gmail") {
    hint = /上限|too many/i.test(message)
      ? "今日送れるメールの数の上限に達しています。明日には戻ります。"
      : "「メールの宛先」のアドレスをご確認ください。";
  } else if ([400, 401, 403, 404, 410].indexOf(status) >= 0) {
    const rows = { googlechat: "「Google Chat の Webhook URL」", discord: "「Discord の Webhook URL」（1.2.0 までの書き方なら「Webhook URL」）" };
    hint = (rows[failure.target] || "「Webhook URL」") + "が違うか、Webhook が消されています。URL を作り直して貼ってください。";
  }
  return "・" + targetLabel(failure.target) + ": 送れませんでした（" + message.slice(0, 80) + "）。" + hint;
}

/** 一部（または全部）の通知先に送れなかったときの文。エラーの 1 通の本文に入る */
export function sendFailureText(failures) {
  return "送れなかった通知先があります。\n" + failures.map(failureLine).join("\n");
}

/** 失敗したときに、同じ通知先へ流す本文 */
export function buildErrorMessage(error, todayKey) {
  const detail = error && error.message ? error.message : String(error);
  return (
    "【期限アラート｜エラー】" +
    formatDisplay(todayKey) +
    "\n通知の途中で止まりました: " +
    detail +
    "\nスプレッドシートの「設定」シートと期限のシートを確認してください。"
  );
}

/**
 * Slack と Google Chat は text、Discord は content。
 * 件名や担当はシートに書かれた字がそのまま入るので、@everyone や呼び出しとして働かせない:
 * Slack は & < > を文字参照にし、Discord は allowed_mentions を空にし、Google Chat は < > を全角にする
 */
export function buildPayload(text, target) {
  if (target === "discord") return { content: truncate_(text, DISCORD_LIMIT), allowed_mentions: { parse: [] } };
  if (target === "googlechat") return { text: truncate_(quietChat_(text), CHAT_LIMIT) };
  return { text: truncate_(escapeSlack_(text), SLACK_LIMIT) };
}
