// このファイルは「AI 問い合わせ整理キット」の src/ からの写しです（中身は書き換えていません）。
// 直すときはキットの側を直してから、scripts/sync-gas-kits.mjs を走らせてください。
/**
 * 返信案 → Gmail の下書きの本文。署名を足し、長すぎる案は「。」で切る。
 * 下書きを作るかどうかの判定もここ（設定 OFF・作らない分類・案が空）。
 */

export const DRAFT_LIMIT = 300;

export function shouldDraft(answer, config) {
  if (config.makeDrafts !== true) return false;
  if (config.noDraftCategories.indexOf(answer.category) >= 0) return false;
  return String(answer.replyDraft === undefined || answer.replyDraft === null ? "" : answer.replyDraft).trim() !== "";
}

/** 上限を超えたら、上限の手前にある最後の「。」で切る。無ければ字数で切る */
function cut_(text, limit) {
  if (text.length <= limit) return text;
  const head = text.slice(0, limit);
  const period = head.lastIndexOf("。");
  return period >= 0 ? head.slice(0, period + 1) : head;
}

export function buildDraftBody(answer, config) {
  const body = cut_(String(answer.replyDraft).trim(), DRAFT_LIMIT);
  const signature = String(config.signature === undefined ? "" : config.signature).trim();
  return signature === "" ? body : body + "\n\n" + signature;
}
