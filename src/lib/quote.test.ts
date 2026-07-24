import { describe, expect, it } from "vitest";
import { calculateQuote, type QuoteInput } from "./quote";

const base: QuoteInput = {
  mode: "hourly",
  hourlyRate: 5000,
  effort: 10,
  effortUnit: "hours",
  fixedPrice: 0,
  selectedOptionIds: [],
  includeTax: false,
};

describe("calculateQuote", () => {
  it("時間単価 × 時間で小計を出す", () => {
    const result = calculateQuote(base);
    expect(result.subtotal).toBe(50000);
    expect(result.total).toBe(50000);
  });

  it("日数入力は 1 日 = 8 時間で換算する", () => {
    const result = calculateQuote({ ...base, effort: 2, effortUnit: "days" });
    expect(result.subtotal).toBe(80000);
  });

  it("固定単価モードは一式金額をそのまま小計にする", () => {
    const result = calculateQuote({ ...base, mode: "fixed", fixedPrice: 120000 });
    expect(result.subtotal).toBe(120000);
  });

  it("固定単価モードでは工数入力を無視する", () => {
    const result = calculateQuote({
      ...base,
      mode: "fixed",
      fixedPrice: 120000,
      hourlyRate: 99999,
      effort: 99,
    });
    expect(result.subtotal).toBe(120000);
  });

  it("オプションは小計への割合で加算される", () => {
    const result = calculateQuote({
      ...base,
      hourlyRate: 10000,
      effort: 10,
      selectedOptionIds: ["rush", "unlimited-revisions"],
    });
    expect(result.subtotal).toBe(100000);
    expect(result.optionLines).toEqual([
      { id: "rush", label: "急ぎ対応", amount: 20000 },
      { id: "unlimited-revisions", label: "修正回数無制限", amount: 15000 },
    ]);
    expect(result.optionsTotal).toBe(35000);
    expect(result.taxableTotal).toBe(135000);
  });

  it("存在しないオプション ID は無視する", () => {
    const result = calculateQuote({ ...base, selectedOptionIds: ["nope"] });
    expect(result.optionLines).toEqual([]);
    expect(result.total).toBe(50000);
  });

  it("消費税は税抜合計の 10% を切り捨てで加算する", () => {
    const result = calculateQuote({
      ...base,
      hourlyRate: 3333,
      effort: 1,
      includeTax: true,
    });
    expect(result.tax).toBe(333); // 333.3 -> 333
    expect(result.total).toBe(3666);
  });

  it("includeTax が false なら税額 0", () => {
    const withTax = calculateQuote({ ...base, includeTax: true });
    expect(withTax.tax).toBe(5000);
    const noTax = calculateQuote({ ...base, includeTax: false });
    expect(noTax.tax).toBe(0);
    expect(noTax.total).toBe(noTax.taxableTotal);
  });

  it("負数・NaN は 0 として扱う（未入力時は 0 円）", () => {
    const result = calculateQuote({ ...base, hourlyRate: NaN, effort: -5 });
    expect(result.subtotal).toBe(0);
    expect(result.total).toBe(0);
  });

  it("オプション 3 種と税を併用しても、税は税抜合計（小計+オプション）に対する切り捨て", () => {
    const result = calculateQuote({
      ...base,
      hourlyRate: 3333,
      effort: 3,
      selectedOptionIds: ["rush", "unlimited-revisions", "weekend"],
      includeTax: true,
    });
    // 小計 9,999 / 急ぎ +2,000 / 修正無制限 +1,500 / 土日祝 +1,000
    expect(result.subtotal).toBe(9999);
    expect(result.optionLines).toEqual([
      { id: "rush", label: "急ぎ対応", amount: 2000 },
      { id: "unlimited-revisions", label: "修正回数無制限", amount: 1500 },
      { id: "weekend", label: "土日祝対応", amount: 1000 },
    ]);
    expect(result.optionsTotal).toBe(4500);
    expect(result.taxableTotal).toBe(14499);
    expect(result.tax).toBe(1449); // floor(14499 × 0.1) — 小計だけを税基準にすると 999 になり検出できる
    expect(result.total).toBe(15948);
  });
});
