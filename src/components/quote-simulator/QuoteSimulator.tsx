"use client";

import { useState } from "react";
import {
  QUOTE_OPTIONS,
  calculateQuote,
  type EffortUnit,
  type PricingMode,
  type QuoteInput,
} from "@/lib/quote";
import { QuoteSummary } from "./QuoteSummary";

const initialInput: QuoteInput = {
  mode: "hourly",
  hourlyRate: 5000,
  effort: 10,
  effortUnit: "hours",
  fixedPrice: 300000,
  selectedOptionIds: [],
  includeTax: true,
};

const MODE_CHOICES: { value: PricingMode; label: string }[] = [
  { value: "hourly", label: "時間単価" },
  { value: "fixed", label: "固定単価" },
];

const UNIT_CHOICES: { value: EffortUnit; label: string }[] = [
  { value: "hours", label: "時間" },
  { value: "days", label: "日" },
];

export function QuoteSimulator() {
  const [input, setInput] = useState<QuoteInput>(initialInput);
  const breakdown = calculateQuote(input);

  const update = (patch: Partial<QuoteInput>) =>
    setInput((current) => ({ ...current, ...patch }));

  const toggleOption = (id: string) =>
    setInput((current) => ({
      ...current,
      selectedOptionIds: current.selectedOptionIds.includes(id)
        ? current.selectedOptionIds.filter((value) => value !== id)
        : [...current.selectedOptionIds, id],
    }));

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <form className="space-y-8" onSubmit={(event) => event.preventDefault()}>
        <fieldset>
          <legend className="text-sm font-medium">単価方式</legend>
          <div
            role="radiogroup"
            aria-label="単価方式"
            className="mt-2 inline-flex rounded-xl border border-neutral-200 p-1"
          >
            {MODE_CHOICES.map((choice) => (
              <button
                key={choice.value}
                type="button"
                role="radio"
                aria-checked={input.mode === choice.value}
                onClick={() => update({ mode: choice.value })}
                className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                  input.mode === choice.value
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                {choice.label}
              </button>
            ))}
          </div>
        </fieldset>

        {input.mode === "hourly" ? (
          <div className="space-y-6">
            <NumberField
              id="hourly-rate"
              label="時間単価"
              suffix="円 / 時"
              value={input.hourlyRate}
              onChange={(value) => update({ hourlyRate: value })}
            />
            <div>
              <NumberField
                id="effort"
                label="想定工数"
                suffix={input.effortUnit === "hours" ? "時間" : "日"}
                value={input.effort}
                onChange={(value) => update({ effort: value })}
              />
              <div
                role="radiogroup"
                aria-label="工数の単位"
                className="mt-2 inline-flex rounded-lg border border-neutral-200 p-0.5"
              >
                {UNIT_CHOICES.map((choice) => (
                  <button
                    key={choice.value}
                    type="button"
                    role="radio"
                    aria-checked={input.effortUnit === choice.value}
                    onClick={() => update({ effortUnit: choice.value })}
                    className={`rounded-md px-3 py-1 text-xs transition-colors ${
                      input.effortUnit === choice.value
                        ? "bg-neutral-900 text-white"
                        : "text-neutral-600 hover:text-neutral-900"
                    }`}
                  >
                    {choice.label}
                  </button>
                ))}
              </div>
              {input.effortUnit === "days" && (
                <p className="mt-2 text-xs text-neutral-500">
                  1 日 = 8 時間で換算します
                </p>
              )}
            </div>
          </div>
        ) : (
          <NumberField
            id="fixed-price"
            label="一式金額"
            suffix="円"
            value={input.fixedPrice}
            onChange={(value) => update({ fixedPrice: value })}
          />
        )}

        <fieldset>
          <legend className="text-sm font-medium">追加オプション</legend>
          <ul className="mt-2 space-y-2">
            {QUOTE_OPTIONS.map((option) => (
              <li key={option.id}>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-200 px-4 py-3 transition-colors hover:border-neutral-400">
                  <input
                    type="checkbox"
                    checked={input.selectedOptionIds.includes(option.id)}
                    onChange={() => toggleOption(option.id)}
                    className="size-4 accent-neutral-900"
                  />
                  <span className="flex-1 text-sm">{option.label}</span>
                  <span className="text-xs text-neutral-500">
                    +{Math.round(option.rate * 100)}%
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>

        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={input.includeTax}
            onChange={(event) => update({ includeTax: event.target.checked })}
            className="size-4 accent-neutral-900"
          />
          <span className="text-sm">消費税（10%）を含める</span>
        </label>
      </form>

      <QuoteSummary breakdown={breakdown} includeTax={input.includeTax} />
    </div>
  );
}

function NumberField({
  id,
  label,
  suffix,
  value,
  onChange,
}: {
  id: string;
  label: string;
  suffix: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="mt-2 flex items-center gap-2">
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={0}
          value={value > 0 ? value : ""}
          onChange={(event) =>
            onChange(event.target.value === "" ? 0 : Number(event.target.value))
          }
          className="w-40 rounded-xl border border-neutral-300 px-3 py-2 text-right tabular-nums focus:outline-2 focus:outline-neutral-900"
        />
        <span className="text-sm text-neutral-500">{suffix}</span>
      </div>
    </div>
  );
}
