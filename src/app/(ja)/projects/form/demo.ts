/*
 * フォーム受付の見本の中身（純粋な処理だけ）。
 *
 * 受付番号・シートの 1 行・通知の文・自動返信は、ここでは作らない ── キットの実物の
 * 関数（./kit/ は scripts/sync-gas-kits.mjs が写した src/ そのもの）に渡すだけにする。
 * receive() はキットの doPost（src/gas_main.js）と同じ順で関数を呼ぶ:
 *   parseBody → validateSubmission（ハニーポット・必須・字数・メールの形）
 *   → stripInternal → 10 分以内の同じ送信 → 予約枠の残り（checkAvailability）
 *   → nextReceipt → buildRow → buildReply → buildNotificationText
 * 違うのは、シートとスクリプトの記録の代わりに Book（この画面の中の帳面）を読み書きし、
 * メールと通知を送る代わりに画面に出すことだけ。どこにも送らず、何も保存しない。
 */
import { parseConfig } from "./kit/config.js";
import { formatStamp, toDateKey } from "./kit/dates.js";
import { buildNotificationText, buildPayload } from "./kit/message.js";
import { parseBody } from "./kit/parse.js";
import { dedupeSourceOf, nextReceipt } from "./kit/receipt.js";
import { buildReply } from "./kit/reply.js";
import { buildHeader, buildRow } from "./kit/rows.js";
import { availabilityOf, checkAvailability, countReservations, parseSlots } from "./kit/slots.js";
import { stripInternal, validateSubmission } from "./kit/validate.js";

/** 同じ中身の送信を二重送信とみなす間（キットの src/gas_store.js と同じ 10 分） */
export const DUPLICATE_SECONDS = 600;

/** この見本の送信元（フォームの見本が page に入れる値） */
export const PAGE_URL = "https://suminawa.dev/projects/form";

/**
 * 見本の設定シート。入力欄の名前を日本語にしてある（キットは欄の名前をそのまま見出しと
 * 差し込みに使うので、日本語のフォームなら日本語の名前にしておくと、通知もメールも読みやすい）。
 * ほかの行はキットの settings-sample.csv と同じ。
 */
export const SETTINGS: string[][] = [
  ["項目", "値"],
  ["通知先", "slack"],
  ["Slack Webhook URL", "https://hooks.slack.com/services/T00000000/B00000000/demo0000000000000000"],
  ["通知の文面", "【受付】{受付番号}\n{項目一覧}"],
  ["必須項目", "お名前,メール,内容"],
  ["項目の並び", "お名前,メール,内容,希望日,時間帯"],
  ["メールの項目名", "メール"],
  ["自動返信", "TRUE"],
  ["自動返信の件名", "お問い合わせを受け付けました（受付番号 {受付番号}）"],
  [
    "自動返信の本文",
    [
      "{お名前} 様",
      "",
      "お問い合わせいただきありがとうございます。",
      "次の内容で受け付けました。あらためてご連絡します。",
      "",
      "受付番号: {受付番号}",
      "",
      "{項目一覧}",
      "",
      "※ このメールは自動でお送りしています。",
    ].join("\n"),
  ],
  ["差出人名", "みなと工房"],
  ["返信先", "info@example.com"],
  ["受付シート名", "受付"],
  ["枠シート名", "枠"],
  ["日付の項目名", "希望日"],
  ["時間帯の項目名", "時間帯"],
  ["ハニーポットの項目名", "homepage"],
  ["送信元の項目名", "page"],
];

export const CONFIG = parseConfig(SETTINGS);

/** 枠シート（日付・時間帯・定員）。見本の日付は固定 */
export const SLOTS_SHEET: string[][] = [
  ["日付", "時間帯", "定員"],
  ["2026-10-05", "10:00", "2"],
  ["2026-10-05", "13:00", "2"],
  ["2026-10-05", "15:00", "1"],
  ["2026-10-06", "10:00", "2"],
  ["2026-10-06", "13:00", "1"],
];

export const SLOTS = parseSlots(SLOTS_SHEET);

/** この画面の中の帳面。受付シートの値と、スクリプトが覚えている 2 つ（前回の受付番号・10 分の記録） */
export type Book = {
  intake: string[][];
  lastReceipt: string;
  recent: { source: string; receipt: string; at: number }[];
};

/** 見本の受付シートに、先に入っている 2 件（架空）。10/5 15:00 はこれで満席 */
export function initialBook(): Book {
  const header = buildHeader(CONFIG, ["お名前", "メール", "内容", "希望日", "時間帯"]);
  const earlier = [
    ["2026-10-01 09:12:40", "20261001-001", "みなと 一郎", "ichiro@example.com", "見学の予約をお願いします。", "2026-10-05", "15:00", PAGE_URL],
    ["2026-10-01 09:48:03", "20261001-002", "さくら 花子", "hanako@example.com", "料金表をいただけますか。", "2026-10-05", "10:00", PAGE_URL],
  ];
  return { intake: [header, ...earlier], lastReceipt: "20261001-002", recent: [] };
}

/** フォームが受け取る返事（キットの doPost が返す JSON と同じ形） */
export type Answer =
  | { ok: true; id?: string }
  | { ok: false; reason: string; message: string };

export type Outcome = {
  answer: Answer;
  /** 何が起きたか（画面の見出しに使う） */
  kind: "accepted" | "repeated" | "spam" | "invalid" | "full";
  book: Book;
  /** 受け付けたときだけ: シートに足した 1 行（見出しと同じ並び）と、その行が何行目か */
  row?: { header: string[]; values: string[]; rowNumber: number };
  notification?: string;
  reply?: { to: string; subject: string; body: string; name?: string; replyTo?: string };
};

/** フォームの欄の値（honeypot と page を含む）を、キットの doPost と同じ順で処理する */
export function receive(book: Book, values: Record<string, string>, now: Date): Outcome {
  const stamp = formatStamp(now);
  const parsed = parseBody({ postData: { type: "text/plain;charset=utf-8", contents: JSON.stringify(values) }, parameter: {} });

  const checked = validateSubmission(parsed, CONFIG);
  if (checked.ok !== true) {
    // 迷惑投稿には成功したふりをする（キットと同じ）。帳面には何も書かない
    if (checked.reason === "spam") return { answer: { ok: true }, kind: "spam", book };
    return { answer: { ok: false, reason: checked.reason, message: checked.message }, kind: "invalid", book };
  }

  const clean = stripInternal(parsed, CONFIG) as { fields: Record<string, string>; order: string[]; source: string };
  const source: string = dedupeSourceOf(clean.fields, clean.order);
  const at = now.getTime();
  const recent = book.recent.filter((entry) => at - entry.at < DUPLICATE_SECONDS * 1000);
  const seen = recent.find((entry) => entry.source === source);
  if (seen) return { answer: { ok: true, id: seen.receipt }, kind: "repeated", book: { ...book, recent } };

  const availability = checkAvailability(
    SLOTS,
    countReservations(book.intake, CONFIG),
    CONFIG.dateField === "" ? "" : clean.fields[CONFIG.dateField],
    CONFIG.slotField === "" ? "" : clean.fields[CONFIG.slotField],
  );
  if (availability.ok !== true) {
    return {
      answer: { ok: false, reason: availability.reason, message: availability.message },
      kind: availability.reason === "full" ? "full" : "invalid",
      book: { ...book, recent },
    };
  }

  const receipt: string = nextReceipt(book.lastReceipt, toDateKey(now));
  const header = book.intake.length === 0 ? buildHeader(CONFIG, clean.order) : book.intake[0];
  const built = buildRow(header, { stamp, receipt, fields: clean.fields, order: clean.order, source: clean.source });
  const intake = [built.header, ...book.intake.slice(1), built.row];
  const context = { receipt, fields: clean.fields, order: clean.order, source: clean.source, quotaExhausted: false };
  const reply = buildReply(CONFIG, context);
  return {
    answer: { ok: true, id: receipt },
    kind: "accepted",
    book: { intake, lastReceipt: receipt, recent: [...recent, { source, receipt, at }] },
    row: { header: built.header, values: built.row, rowNumber: intake.length },
    notification: buildNotificationText(CONFIG, context),
    reply: reply === null ? undefined : reply,
  };
}

/** 宛先ごとの送信データ（Slack・Discord・LINE）。どれも同じ本文から作る */
export function payloads(text: string) {
  return {
    slack: buildPayload(text, "slack"),
    discord: buildPayload(text, "discord"),
    line: buildPayload(text, "line", { lineTo: "U00000000000000000000000000000000" }),
  };
}

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

/** "2026-10-05" → "10/5（月）" */
export function shortDate(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return `${m}/${d}（${WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]}）`;
}

export type SlotOption = { value: string; label: string; date: string; slot: string; remaining: number };

/** 希望枠の選択肢。キットの doGet と同じ availabilityOf で残りを数える（満席も選べるように残す） */
export function slotOptions(book: Book): SlotOption[] {
  const counts = countReservations(book.intake, CONFIG);
  const dates: string[] = [];
  for (const slot of SLOTS) if (!dates.includes(slot.dateKey)) dates.push(slot.dateKey);
  const options: SlotOption[] = [];
  for (const date of dates) {
    for (const entry of availabilityOf(SLOTS, counts, date)) {
      options.push({
        value: `${date} ${entry.slot}`,
        date,
        slot: entry.slot,
        remaining: entry.remaining,
        label: `${shortDate(date)} ${entry.slot}　${entry.remaining === 0 ? "満席" : `残り ${entry.remaining}`}`,
      });
    }
  }
  return options;
}

/** フォームの入力 → キットへ送る値（見本のフォームと同じく page を足す） */
export function formValues(input: {
  name: string;
  email: string;
  message: string;
  slot: string;
  honeypot: string;
}): Record<string, string> {
  const [date = "", time = ""] = input.slot === "" ? [] : input.slot.split(" ");
  return {
    お名前: input.name,
    メール: input.email,
    内容: input.message,
    希望日: date,
    時間帯: time,
    homepage: input.honeypot,
    page: PAGE_URL,
  };
}

/** 最初の画面に出す見本の 1 件（固定の日時で、キットの関数に通したもの） */
export const SAMPLE_INPUT = {
  name: "見本 太郎",
  email: "taro@example.com",
  message: "10 月の見学を希望します。駐車場はありますか。",
  slot: "2026-10-05 13:00",
  honeypot: "",
};
export const SAMPLE_AT = new Date("2026-10-01T01:32:05Z");

export function sampleOutcome(): Outcome {
  return receive(initialBook(), formValues(SAMPLE_INPUT), SAMPLE_AT);
}
