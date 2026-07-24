export type PricingMode = "hourly" | "fixed";
export type EffortUnit = "hours" | "days";

export const HOURS_PER_DAY = 8;
export const TAX_RATE = 0.1;

export type QuoteOption = {
  id: string;
  label: string;
  /** 小計に対する加算率（0.2 = +20%） */
  rate: number;
};

export const QUOTE_OPTIONS: QuoteOption[] = [
  { id: "rush", label: "急ぎ対応", rate: 0.2 },
  { id: "unlimited-revisions", label: "修正回数無制限", rate: 0.15 },
  { id: "weekend", label: "土日祝対応", rate: 0.1 },
];

export type QuoteInput = {
  mode: PricingMode;
  /** 時間単価（円/時）。hourly モードで使用 */
  hourlyRate: number;
  /** 想定工数。単位は effortUnit に従う。hourly モードで使用 */
  effort: number;
  effortUnit: EffortUnit;
  /** 一式金額（円）。fixed モードで使用 */
  fixedPrice: number;
  selectedOptionIds: string[];
  includeTax: boolean;
};

export type QuoteOptionLine = {
  id: string;
  label: string;
  amount: number;
};

export type QuoteBreakdown = {
  subtotal: number;
  optionLines: QuoteOptionLine[];
  optionsTotal: number;
  /** 小計 + オプション加算（税抜合計） */
  taxableTotal: number;
  tax: number;
  total: number;
};

/** 負数・NaN・Infinity は 0 として扱う（未入力時は 0 円表示の仕様） */
function sanitize(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export function calculateQuote(input: QuoteInput): QuoteBreakdown {
  const subtotal =
    input.mode === "hourly"
      ? Math.round(
          sanitize(input.hourlyRate) *
            sanitize(input.effort) *
            (input.effortUnit === "days" ? HOURS_PER_DAY : 1),
        )
      : Math.round(sanitize(input.fixedPrice));

  const optionLines: QuoteOptionLine[] = QUOTE_OPTIONS.filter((option) =>
    input.selectedOptionIds.includes(option.id),
  ).map((option) => ({
    id: option.id,
    label: option.label,
    amount: Math.round(subtotal * option.rate),
  }));

  const optionsTotal = optionLines.reduce((sum, line) => sum + line.amount, 0);
  const taxableTotal = subtotal + optionsTotal;
  const tax = input.includeTax ? Math.floor(taxableTotal * TAX_RATE) : 0;

  return {
    subtotal,
    optionLines,
    optionsTotal,
    taxableTotal,
    tax,
    total: taxableTotal + tax,
  };
}
