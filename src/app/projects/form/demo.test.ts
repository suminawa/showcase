import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { DEFAULT_ROWS, parseConfig } from "./kit/config.js";
import { buildNotificationText } from "./kit/message.js";
import { buildReply } from "./kit/reply.js";
import { buildHeader, buildRow } from "./kit/rows.js";
import { FULL_MESSAGE } from "./kit/slots.js";
import {
  CONFIG,
  DUPLICATE_SECONDS,
  PAGE_URL,
  SAMPLE_AT,
  SAMPLE_INPUT,
  formValues,
  initialBook,
  payloads,
  receive,
  sampleOutcome,
  shortDate,
  slotOptions,
} from "./demo";

/** README の「届くもの」（見本 太郎 さんの 1 件）を、写しの関数で作り直せること */
describe("フォーム受付の写し（キットの README どおりに動く）", () => {
  const config = parseConfig([["項目", "値"], ...DEFAULT_ROWS.map(([k, v]) => [k, k === "Slack Webhook URL" ? "https://hooks.slack.com/services/T0/B0/x" : v])]);
  const fields = { name: "見本 太郎", email: "taro@example.com", message: "料金と納期を知りたいです。" };
  const order = ["name", "email", "message"];
  const context = { receipt: "20260914-001", fields, order, source: "https://example.com/contact" };

  it("受付シートの 1 行", () => {
    const header = buildHeader(config, order);
    expect(header).toEqual(["受付日時", "受付番号", "name", "email", "message", "送信元"]);
    const built = buildRow(header, { stamp: "2026-09-14 10:32:05", receipt: "20260914-001", fields, order, source: context.source });
    expect(built.row).toEqual(["2026-09-14 10:32:05", "20260914-001", "見本 太郎", "taro@example.com", "料金と納期を知りたいです。", "https://example.com/contact"]);
  });

  it("通知の 1 通", () => {
    expect(buildNotificationText(config, context)).toBe(
      "【受付】20260914-001\nname: 見本 太郎\nemail: taro@example.com\nmessage: 料金と納期を知りたいです。",
    );
  });

  it("自動返信", () => {
    const reply = buildReply(config, context)!;
    expect(reply.to).toBe("taro@example.com");
    expect(reply.subject).toBe("お問い合わせを受け付けました（受付番号 20260914-001）");
    expect(reply.body).toBe(
      [
        "お問い合わせいただきありがとうございます。",
        "次の内容で受け付けました。あらためてご連絡します。",
        "",
        "受付番号: 20260914-001",
        "",
        "name: 見本 太郎",
        "email: taro@example.com",
        "message: 料金と納期を知りたいです。",
        "",
        "※ このメールは自動でお送りしています。",
      ].join("\n"),
    );
  });
});

describe("フォーム受付の見本（receive は doPost と同じ順）", () => {
  const at = new Date("2026-10-02T03:00:00Z"); // 日本時間 10/2 12:00

  it("最初の画面の見本の 1 件", () => {
    const outcome = sampleOutcome();
    expect(outcome.kind).toBe("accepted");
    expect(outcome.answer).toEqual({ ok: true, id: "20261001-003" });
    expect(outcome.row!.values).toEqual([
      "2026-10-01 10:32:05",
      "20261001-003",
      "見本 太郎",
      "taro@example.com",
      "10 月の見学を希望します。駐車場はありますか。",
      "2026-10-05",
      "13:00",
      PAGE_URL,
    ]);
    expect(outcome.row!.rowNumber).toBe(4);
    expect(outcome.notification).toBe(
      "【受付】20261001-003\nお名前: 見本 太郎\nメール: taro@example.com\n内容: 10 月の見学を希望します。駐車場はありますか。\n希望日: 2026-10-05\n時間帯: 13:00",
    );
    expect(outcome.reply!.subject).toBe("お問い合わせを受け付けました（受付番号 20261001-003）");
    expect(outcome.reply!.body.startsWith("見本 太郎 様\n")).toBe(true);
    expect(outcome.reply!.name).toBe("みなと工房");
    expect(SAMPLE_AT.toISOString()).toBe("2026-10-01T01:32:05.000Z");
  });

  it("受付番号はその日の連番。日が変われば 001 に戻る", () => {
    const first = receive(initialBook(), formValues({ ...SAMPLE_INPUT, slot: "" }), at);
    expect(first.answer).toEqual({ ok: true, id: "20261002-001" });
    const second = receive(first.book, formValues({ ...SAMPLE_INPUT, message: "別の件です。", slot: "" }), at);
    expect(second.answer).toEqual({ ok: true, id: "20261002-002" });
    expect(second.book.intake.length).toBe(5);
  });

  it("必須が足りない・メールの形が違うときは、キットの文を返し何も書かない", () => {
    const book = initialBook();
    const empty = receive(book, formValues({ name: "", email: "", message: "", slot: "", honeypot: "" }), at);
    expect(empty.answer).toEqual({ ok: false, reason: "invalid", message: "「お名前」「メール」「内容」を入力してください。" });
    expect(empty.book).toBe(book);
    const bad = receive(book, formValues({ ...SAMPLE_INPUT, email: "taro@example" }), at);
    expect(bad.answer).toEqual({ ok: false, reason: "invalid", message: "メールアドレスの形を確かめてください。" });
  });

  it("見えない欄に字が入った送信は、成功したふりをして何も残さない", () => {
    const book = initialBook();
    const spam = receive(book, formValues({ ...SAMPLE_INPUT, honeypot: "https://spam.example/" }), at);
    expect(spam.kind).toBe("spam");
    expect(spam.answer).toEqual({ ok: true });
    expect(spam.book).toBe(book);
    expect(spam.notification).toBeUndefined();
  });

  it("満席の枠は断る（10/5 15:00 は定員 1 で埋まっている）", () => {
    const full = receive(initialBook(), formValues({ ...SAMPLE_INPUT, slot: "2026-10-05 15:00" }), at);
    expect(full.kind).toBe("full");
    expect(full.answer).toEqual({ ok: false, reason: "full", message: FULL_MESSAGE });
    expect(full.book.intake.length).toBe(3);
  });

  it("残り 1 の枠は、1 件受けると満席になる", () => {
    const book = initialBook();
    expect(slotOptions(book).find((o) => o.value === "2026-10-05 10:00")!.remaining).toBe(1);
    const taken = receive(book, formValues({ ...SAMPLE_INPUT, slot: "2026-10-05 10:00" }), at);
    expect(taken.kind).toBe("accepted");
    const option = slotOptions(taken.book).find((o) => o.value === "2026-10-05 10:00")!;
    expect(option.remaining).toBe(0);
    expect(option.label).toBe("10/5（月） 10:00　満席");
    const next = receive(taken.book, formValues({ ...SAMPLE_INPUT, name: "別の人", slot: "2026-10-05 10:00" }), at);
    expect(next.kind).toBe("full");
  });

  it("10 分以内の同じ送信は、同じ受付番号を返して行を増やさない", () => {
    const first = receive(initialBook(), formValues(SAMPLE_INPUT), at);
    const again = receive(first.book, formValues(SAMPLE_INPUT), new Date(at.getTime() + 60_000));
    expect(again.kind).toBe("repeated");
    expect(again.answer).toEqual({ ok: true, id: first.answer.ok ? first.answer.id : "" });
    expect(again.book.intake.length).toBe(first.book.intake.length);
    const later = receive(first.book, formValues(SAMPLE_INPUT), new Date(at.getTime() + DUPLICATE_SECONDS * 1000));
    // 10 分を過ぎたら別の送信として受け付ける（13:00 は定員 2 なので、まだ 1 つ空いている）
    expect(later.kind).toBe("accepted");
  });

  it("送信の字は数式として働かない（先頭の = に ' が付く）", () => {
    const outcome = receive(initialBook(), formValues({ ...SAMPLE_INPUT, message: "=HYPERLINK(\"x\")", slot: "" }), at);
    expect(outcome.row!.values[4]).toBe("'=HYPERLINK(\"x\")");
  });

  it("通知の送信データは Slack・Discord・LINE で同じ本文から作り、呼び出しを働かせない", () => {
    const p = payloads("<!channel> @everyone");
    expect(p.slack).toEqual({ text: "&lt;!channel&gt; @everyone" });
    expect(p.discord).toEqual({ content: "<!channel> @everyone", allowed_mentions: { parse: [] } });
    expect(p.line.messages?.[0].text).toBe("<!channel> @everyone");
  });

  it("小道具", () => {
    expect(shortDate("2026-10-05")).toBe("10/5（月）");
    expect(formValues({ ...SAMPLE_INPUT, slot: "" })).toMatchObject({ 希望日: "", 時間帯: "" });
    expect(CONFIG.honeypotField).toBe("homepage");
    expect(slotOptions(initialBook()).map((o) => o.remaining)).toEqual([1, 2, 0, 2, 1]);
  });
});

describe("写しはキットの src/ と同じ", () => {
  const kitSrc = path.resolve(__dirname, "../../../../../../suminawa-products/packages/form-intake-gas/src");
  let present = true;
  try {
    readFileSync(path.join(kitSrc, "dates.js"));
  } catch {
    present = false;
  }
  it.skipIf(!present)("中身が 1 字も違わない（キットが手元にあるときだけ確かめる）", () => {
    for (const file of ["check.js", "config.js", "dates.js", "message.js", "parse.js", "receipt.js", "reply.js", "rows.js", "setup.js", "slots.js", "validate.js"]) {
      const copy = readFileSync(path.join(__dirname, "kit", file), "utf8").split("\n").slice(2).join("\n");
      expect(copy, file).toBe(readFileSync(path.join(kitSrc, file), "utf8"));
    }
  });
});
