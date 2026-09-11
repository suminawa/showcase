/**
 * 英数字で始まる語の前後に半角スペースを置く（この LP は）。
 * 仮名や漢字の語はそのまま返す（このページは / 粉とゆげは）。
 */
export function spacedWord(word: string): string {
  return /^[A-Za-z0-9]/.test(word) ? ` ${word} ` : word;
}
