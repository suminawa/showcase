// このファイルは「期限アラート GAS キット」の src/ からの写しです（中身は書き換えていません）。
// 直すときはキットの側を直してから、scripts/sync-gas-kits.mjs を走らせてください。
/**
 * 通知の本文と、Slack / Discord それぞれの送信データを作る。
 * 本文は装飾をほとんど使わない。Slack の mrkdwn でも Discord でも同じ見た目になる。
 */
import { formatDisplay } from "./dates.js";

/** Slack の text は 40,000 字まで。余裕を見てここで切る */
const SLACK_LIMIT = 39000;

/** Discord の content は 2000 字まで。余裕を見てここで切る */
const DISCORD_LIMIT = 1900;

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

/** 失敗したときに、同じ通知先へ流す本文 */
export function buildErrorMessage(error, todayKey) {
  const detail = error && error.message ? error.message : String(error);
  return (
    "【期限アラート｜エラー】" +
    formatDisplay(todayKey) +
    "\n通知を作れませんでした: " +
    detail +
    "\nスプレッドシートの「設定」シートと期限のシートを確認してください。"
  );
}

/**
 * Slack は text、Discord は content。
 * 件名や担当はシートに書かれた字がそのまま入るので、@everyone や呼び出しとして働かせない:
 * Slack は & < > を文字参照にし、Discord は allowed_mentions を空にする
 */
export function buildPayload(text, target) {
  if (target === "discord") return { content: truncate_(text, DISCORD_LIMIT), allowed_mentions: { parse: [] } };
  return { text: truncate_(escapeSlack_(text), SLACK_LIMIT) };
}
