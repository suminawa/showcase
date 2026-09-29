// このファイルは「AI 問い合わせ整理キット」の src/ からの写しです（中身は書き換えていません）。
// 直すときはキットの側を直してから、scripts/sync-gas-kits.mjs を走らせてください。
/**
 * 使ったトークン数の積み上げと、目安の円。
 * 単価は 100 万トークンあたりのドル。キャッシュから読んだ入力は 0.1 倍、キャッシュへ書いた入力は 2 倍。
 * 単価は変わるので、正しい額は Anthropic Console の使用量で見てもらう。
 */

export const PRICES = {
  "claude-opus-5": { input: 5, output: 25 },
  "claude-sonnet-5": { input: 2, output: 10 },
  "claude-haiku-4-5": { input: 1, output: 5 },
};

const CACHE_READ_RATE = 0.1;
/** 1 時間のキャッシュへの書き込みは 2 倍（5 分なら 1.25 倍。prompt.js は ttl: "1h" を使う） */
const CACHE_WRITE_RATE = 2.0;

export function emptyUsage() {
  return { count: 0, input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
}

function number_(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** usage は API の返す { input_tokens, output_tokens, cache_read_input_tokens, cache_creation_input_tokens } */
export function addUsage(total, usage) {
  const u = usage === null || usage === undefined ? {} : usage;
  return {
    count: total.count + 1,
    input: total.input + number_(u.input_tokens),
    output: total.output + number_(u.output_tokens),
    cacheRead: total.cacheRead + number_(u.cache_read_input_tokens),
    cacheWrite: total.cacheWrite + number_(u.cache_creation_input_tokens),
  };
}

/** 目安の円（整数）。単価の分からないモデルは null */
export function estimateYen(total, model, rate) {
  if (!Object.prototype.hasOwnProperty.call(PRICES, model)) return null;
  const price = PRICES[model];
  const dollars =
    (total.input / 1e6) * price.input +
    (total.output / 1e6) * price.output +
    (total.cacheRead / 1e6) * price.input * CACHE_READ_RATE +
    (total.cacheWrite / 1e6) * price.input * CACHE_WRITE_RATE;
  return Math.round(dollars * rate);
}

function withCommas_(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** メニュー「今月の利用」に出す文 */
export function formatUsage(total, model, monthKey) {
  const yen = estimateYen(total, model, 150);
  const lines = [
    monthKey + " の利用: " + withCommas_(total.count) + " 通",
    "入力 " + withCommas_(total.input) + " トークン（キャッシュから " + withCommas_(total.cacheRead) + "）、出力 " + withCommas_(total.output) + " トークン",
  ];
  if (yen === null) {
    lines.push("目安の円は、このモデルの単価が設定に無いため出せません。Anthropic Console の使用量をご覧ください");
  } else {
    lines.push("目安 " + withCommas_(yen) + " 円（1 ドル 150 円で換算。Anthropic Console の使用量が正です）");
  }
  return lines.join("\n");
}
