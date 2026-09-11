/**
 * 英数字で始まる語の前後に半角スペースを置く（この LP は）。
 * 仮名や漢字の語はそのまま返す（このページは / 粉とゆげは）。
 */
export function spacedWord(word: string): string {
  return /^[A-Za-z0-9]/.test(word) ? ` ${word} ` : word;
}

/**
 * 文頭・句点の直後など、前に空白を置けない位置に来る語。
 * 英数字で始まる語は後ろにだけ半角スペースを置く（。Tabane Works は）。
 * 仮名や漢字の語はそのまま返す（粉とゆげは）。
 */
export function trailingSpacedWord(word: string): string {
  return /^[A-Za-z0-9]/.test(word) ? `${word} ` : word;
}
