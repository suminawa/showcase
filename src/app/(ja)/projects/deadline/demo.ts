/*
 * 期限アラートの見本の中身（純粋な処理だけ）。
 *
 * 通知の文面も「設定を確かめる」の文も、ここでは作らない ── キットの実物の関数
 * （./kit/ は scripts/sync-gas-kits.mjs が写した src/ そのもの）に、見本の表と
 * 設定を渡すだけにする。キットが毎朝やっていることと同じ順で呼ぶ:
 *   parseConfig → parseItems → collectSections → buildMessage
 * 違うのは、シートの代わりに画面の表を読み、送る代わりに画面に出すことだけ。
 */
import { collectSections } from "./kit/buckets.js";
import { checkNotes, findProblems, summaryLines } from "./kit/check.js";
import { parseConfig } from "./kit/config.js";
import { diffDays, formatDisplay, toDateKey, todayKey } from "./kit/dates.js";
import { parseItems } from "./kit/items.js";
import { buildMessage } from "./kit/message.js";
import { checkReport } from "./kit/setup.js";

/** 画面の表の 1 行（期限シートの 1 行と同じ 4 列） */
export type DeadlineRow = {
  subject: string;
  due: string;
  assignee: string;
  status: string;
};

/** 期限シートの見出し（キットの初期化が書く 4 つ） */
export const HEADER = ["件名", "期限", "担当", "状態"];

/**
 * 見本の「今日」。表の期限はこの日から数えて置いてある。
 * 画面の「今日の日付」を動かせば、届く一通がその日の分に変わる。
 */
export const SAMPLE_TODAY = "2026-10-01";

/** 見本の台帳。会社も値もすべて架空。担当は人の名ではなく係の名にしてある */
export const SAMPLE_ROWS: DeadlineRow[] = [
  { subject: "事務所の賃貸契約の解約予告期限", due: "2026-09-30", assignee: "総務", status: "" },
  { subject: "複合機のリース契約の更新期限", due: "2026-10-01", assignee: "総務", status: "" },
  { subject: "営業車の運転免許証の更新", due: "2026-10-01", assignee: "営業", status: "着手" },
  { subject: "社用車（2 号車）の車検", due: "2026-10-04", assignee: "総務", status: "" },
  { subject: "会計ソフトの年間契約の自動更新日", due: "2026-10-04", assignee: "経理", status: "" },
  { subject: "宅地建物取引士証の更新", due: "2026-09-28", assignee: "営業", status: "完了" },
  { subject: "源泉所得税の納付", due: "2026-10-10", assignee: "経理", status: "" },
  { subject: "火災保険の更新", due: "2026-10-20", assignee: "総務", status: "" },
];

/** 形だけの Webhook URL（実在しない）。見本の設定はキットの settings-sample.csv と同じ値 */
const DEMO_WEBHOOK = "https://hooks.slack.com/services/T00000000/B00000000/demo0000000000000000";

/** 設定シート（正しく書いたもの）。キットの見本と同じ 11 行 */
export const SETTINGS_OK: string[][] = [
  ["項目", "値"],
  ["通知先", "slack"],
  ["Webhook URL", DEMO_WEBHOOK],
  ["しきい値", "3,0"],
  ["超過も通知する", "TRUE"],
  ["文面テンプレ", "・{件名}（{期限}・{担当}）"],
  ["対象シート名", "期限"],
  ["列名（件名）", "件名"],
  ["列名（期限）", "期限"],
  ["列名（担当）", "担当"],
  ["列名（状態）", "状態"],
  ["完了とみなす状態の値", "完了"],
];

/**
 * 設定シート（わざと書き間違えたもの）。よくあるつまずきを 4 つ入れてある:
 * 通知先の綴り・見本の URL のまま・しきい値に「日」・置き換わらない差し込み。
 */
export const SETTINGS_BROKEN: string[][] = [
  ["項目", "値"],
  ["通知先", "slak"],
  ["Webhook URL", "https://hooks.slack.com/services/XXXXXXXXX/YYYYYYYYY/ZZZZZZZZZZZZ"],
  ["しきい値", "3日,0"],
  ["超過も通知する", "TRUE"],
  ["文面テンプレ", "・{件名}（{期日}・{担当}）"],
  ["対象シート名", "期限"],
  ["列名（件名）", "件名"],
  ["列名（期限）", "期限"],
  ["列名（担当）", "担当"],
  ["列名（状態）", "状態"],
  ["完了とみなす状態の値", "完了"],
];

/** 画面の表を、シートの値（2 次元配列）にする */
export function sheetValues(rows: readonly DeadlineRow[]): string[][] {
  return [HEADER, ...rows.map((row) => [row.subject, row.due, row.assignee, row.status])];
}

/** 「今日の日付」の欄の値を日付キーにする。読めなければ null */
export function readToday(value: string): string | null {
  return toDateKey(value.trim());
}

export type Alert = {
  /** その朝に届く 1 通。知らせるものが無い日は null（キットは何も送らない） */
  text: string | null;
  /** 通知に載った行の数 */
  notified: number;
  /** 期限が読めない・件名が空で飛ばした行の数 */
  skipped: number;
  /** 完了の行の数（知らせない） */
  done: number;
};

/** その朝に届く 1 通を、キットの関数だけで作る */
export function buildAlert(rows: readonly DeadlineRow[], today: string): Alert {
  const config = parseConfig(SETTINGS_OK);
  const parsed = parseItems(sheetValues(rows), config);
  const sections = collectSections(parsed.items, config, today);
  const text = buildMessage(sections, {
    todayKey: today,
    itemTemplate: config.itemTemplate,
    skipped: parsed.skipped,
  });
  let notified = 0;
  for (const section of sections) notified += section.items.length;
  const done = rows.filter((row) => config.doneValues.includes(row.status.trim())).length;
  return { text, notified, skipped: parsed.skipped.length, done };
}

/** メニュー「設定を確かめる」の 1 通。キットの findProblems → checkReport と同じ道を通す */
export function checkSettings(settings: string[][], rows: readonly DeadlineRow[], today: string): string {
  const snapshot = {
    timeZone: "Asia/Tokyo",
    today,
    sheets: { 設定: settings, 期限: sheetValues(rows) },
    hasTrigger: true,
  };
  const problems: string[] = findProblems(snapshot);
  const summary: string[] = problems.length === 0 ? summaryLines(snapshot) : [];
  return checkReport(problems, summary, "", checkNotes(snapshot));
}

/** 表の期限をすべて同じ日数だけずらす（見本の今日を、実際の今日に合わせるときに使う） */
export function shiftRows(rows: readonly DeadlineRow[], from: string, to: string): DeadlineRow[] {
  const days = diffDays(from, to);
  return rows.map((row) => {
    const key = toDateKey(row.due.trim());
    return key === null ? { ...row } : { ...row, due: addDays(key, days) };
  });
}

/** "2026-10-01" に日数を足す */
export function addDays(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const at = new Date(Date.UTC(y, m - 1, d + days));
  return at.toISOString().slice(0, 10);
}

/** 実行時点の日本の日付（キットの todayKey をそのまま使う） */
export function jstToday(now: Date): string {
  return todayKey(now);
}

/** "2026-10-01" → "10/1（木）"（キットの表示と同じ） */
export function displayDate(dateKey: string): string {
  return formatDisplay(dateKey);
}

/**
 * 表の各行が、その日の通知でどう扱われるか（表の右端に小さく添える言葉）。
 * 区分はキットの collectSections の見出し、飛ばした理由は parseItems の言葉をそのまま使う。
 */
export function rowMarks(rows: readonly DeadlineRow[], today: string): string[] {
  const config = parseConfig(SETTINGS_OK);
  const parsed = parseItems(sheetValues(rows), config);
  const sections = collectSections(parsed.items, config, today);
  const byRow = new Map<number, string>();
  for (const section of sections) {
    for (const item of section.items) byRow.set(item.rowNumber, String(section.heading).replace(/^■ /, ""));
  }
  for (const skipped of parsed.skipped) byRow.set(skipped.rowNumber, String(skipped.reason));
  return rows.map((row, i) => {
    const mark = byRow.get(i + 2);
    if (mark !== undefined) return mark;
    if (config.doneValues.includes(row.status.trim())) return "完了なので知らせません";
    return "";
  });
}
