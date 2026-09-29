import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { parseConfig } from "./kit/config.js";
import { buildPayload } from "./kit/message.js";
import {
  SAMPLE_ROWS,
  SAMPLE_TODAY,
  SETTINGS_BROKEN,
  SETTINGS_OK,
  addDays,
  buildAlert,
  checkSettings,
  jstToday,
  readToday,
  rowMarks,
  shiftRows,
  type DeadlineRow,
} from "./demo";

/** キットの samples/*.csv と README の「届く文面」を、写しの関数で作り直せること */
describe("期限アラートの写し（キットの見本どおりに動く）", () => {
  // キットの samples/deadlines-sample.csv（見本の「今日」は 2026-09-13）
  const kitRows: DeadlineRow[] = [
    { subject: "事務所家賃の振込", due: "2026-09-11", assignee: "自分", status: "" },
    { subject: "A 社への請求書送付", due: "2026-09-13", assignee: "自分", status: "" },
    { subject: "サーバー費用の支払い", due: "2026-09-13", assignee: "自分", status: "完了" },
    { subject: "ドメイン更新", due: "2026-09-20", assignee: "自分", status: "" },
    { subject: "源泉所得税の納付", due: "2026-09-16", assignee: "自分", status: "着手" },
    { subject: "保険料の引き落とし確認", due: "2026-10-10", assignee: "自分", status: "" },
  ];

  it("README の「届く文面」と 1 字も違わない", () => {
    expect(buildAlert(kitRows, "2026-09-13").text).toBe(
      [
        "【期限アラート】9/13（日）",
        "",
        "■ 期限を過ぎています",
        "・事務所家賃の振込（9/11（金）・自分）",
        "",
        "■ 今日が期限",
        "・A 社への請求書送付（9/13（日）・自分）",
        "",
        "■ 3 日後が期限",
        "・源泉所得税の納付（9/16（水）・自分）",
      ].join("\n"),
    );
  });

  it("知らせるものが無い日は null（何も送らない）", () => {
    expect(buildAlert(kitRows, "2026-09-01").text).toBeNull();
  });

  it("読めない期限は、その行だけを末尾に知らせる", () => {
    const rows = [...kitRows, { subject: "契約の更新", due: "来週", assignee: "", status: "" }];
    const alert = buildAlert(rows, "2026-09-13");
    expect(alert.skipped).toBe(1);
    expect(alert.text?.endsWith("※ 期限が読めません: 1 件（8 行目）")).toBe(true);
  });

  it("見本の設定はキットの settings-sample.csv と同じ働き（URL だけ形の違う架空の値）", () => {
    const config = parseConfig(SETTINGS_OK);
    expect(config.target).toBe("slack");
    expect(config.thresholds).toEqual([0, 3]);
    expect(config.notifyOverdue).toBe(true);
    expect(config.doneValues).toEqual(["完了"]);
  });

  it("Slack へ送る形では <!channel> が呼び出しにならない", () => {
    expect(buildPayload("<!channel> 件名", "slack")).toEqual({ text: "&lt;!channel&gt; 件名" });
  });
});

describe("期限アラートの見本", () => {
  it("見本の台帳は 6〜8 行で、見本の今日に超過・今日・3 日後がそろう", () => {
    expect(SAMPLE_ROWS.length).toBeGreaterThanOrEqual(6);
    expect(SAMPLE_ROWS.length).toBeLessThanOrEqual(8);
    const alert = buildAlert(SAMPLE_ROWS, SAMPLE_TODAY);
    expect(alert.text).toContain("■ 期限を過ぎています");
    expect(alert.text).toContain("■ 今日が期限");
    expect(alert.text).toContain("■ 3 日後が期限");
    // 超過が先頭
    expect(alert.text!.indexOf("期限を過ぎています")).toBeLessThan(alert.text!.indexOf("今日が期限"));
    expect(alert.done).toBe(1);
    expect(alert.text).not.toContain("宅地建物取引士証");
  });

  it("行ごとの印は、キットの区分の見出しと飛ばした理由の言葉", () => {
    const marks = rowMarks(SAMPLE_ROWS, SAMPLE_TODAY);
    expect(marks).toEqual([
      "期限を過ぎています",
      "今日が期限",
      "今日が期限",
      "3 日後が期限",
      "3 日後が期限",
      "完了なので知らせません",
      "",
      "",
    ]);
    const odd = rowMarks([{ subject: "x", due: "来週", assignee: "", status: "" }], SAMPLE_TODAY);
    expect(odd).toEqual(["期限が読めません"]);
  });

  it("書き間違えた設定では、直すところを全部並べる", () => {
    const text = checkSettings(SETTINGS_BROKEN, SAMPLE_ROWS, SAMPLE_TODAY);
    expect(text.startsWith("直すところがあります。")).toBe(true);
    expect(text).toContain("「通知先」は slack か discord にしてください（いまは「slak」）");
    expect(text).toContain("見本の URL のまま");
    expect(text).toContain("「しきい値」は、0 以上の整数をカンマで区切って");
    expect(text).toContain("{期日} は置き換わりません");
  });

  it("正しい設定では「問題ありません。」と今日の分の件数", () => {
    const text = checkSettings(SETTINGS_OK, SAMPLE_ROWS, SAMPLE_TODAY);
    expect(text.startsWith("問題ありません。")).toBe(true);
    expect(text).toContain("今日の分: 期限切れ 1 件・今日 2 件・3 日後 2 件");
    expect(text).toContain("完了の 1 件は除きます");
  });

  it("期限を同じ日数だけずらすと、届く一通は日付だけが変わる", () => {
    const shifted = shiftRows(SAMPLE_ROWS, SAMPLE_TODAY, "2027-01-15");
    const before = buildAlert(SAMPLE_ROWS, SAMPLE_TODAY);
    const after = buildAlert(shifted, "2027-01-15");
    expect(after.notified).toBe(before.notified);
    expect(after.text!.split("\n").length).toBe(before.text!.split("\n").length);
    expect(shiftRows([{ subject: "a", due: "来週", assignee: "", status: "" }], "2026-10-01", "2026-10-05")[0].due).toBe("来週");
  });

  it("日付の小道具", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
    expect(readToday(" 2026/10/1 ")).toBe("2026-10-01");
    expect(readToday("あした")).toBeNull();
    // 日本時間で日付が変わるのは UTC の 15:00
    expect(jstToday(new Date("2026-09-30T14:59:59Z"))).toBe("2026-09-30");
    expect(jstToday(new Date("2026-09-30T15:00:00Z"))).toBe("2026-10-01");
  });
});

describe("写しはキットの src/ と同じ", () => {
  const kitSrc = path.resolve(__dirname, "../../../../../../suminawa-products/packages/deadline-alert-gas/src");
  it.skipIf(!safeExists(kitSrc))("中身が 1 字も違わない（キットが手元にあるときだけ確かめる）", () => {
    for (const file of ["buckets.js", "check.js", "config.js", "dates.js", "dedupe.js", "items.js", "message.js", "setup.js"]) {
      const copy = readFileSync(path.join(__dirname, "kit", file), "utf8").split("\n").slice(2).join("\n");
      expect(copy, file).toBe(readFileSync(path.join(kitSrc, file), "utf8"));
    }
  });
});

function safeExists(dir: string): boolean {
  try {
    readFileSync(path.join(dir, "dates.js"));
    return true;
  } catch {
    return false;
  }
}
