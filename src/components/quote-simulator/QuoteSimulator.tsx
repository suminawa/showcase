"use client";

import { useRef, useState } from "react";
import {
  QUOTE_OPTIONS,
  calculateQuote,
  type EffortUnit,
  type PricingMode,
  type QuoteInput,
} from "@/lib/quote";
import { QuoteSummary } from "./QuoteSummary";
import c from "./quote.module.css";

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
    <div className={c.layout}>
      <form className={c.form} onSubmit={(event) => event.preventDefault()}>
        <fieldset className={c.group}>
          <legend className={c.legend}>単価方式</legend>
          <SegmentedControl
            label="単価方式"
            choices={MODE_CHOICES}
            value={input.mode}
            onChange={(mode) => update({ mode })}
          />
        </fieldset>

        {input.mode === "hourly" ? (
          <div
            className={c.group}
            style={{ display: "grid", gap: "calc(1.2 * var(--rp-pitch))" }}
          >
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
              <div style={{ marginTop: "calc(0.5 * var(--rp-pitch))" }}>
                <SegmentedControl
                  label="工数の単位"
                  choices={UNIT_CHOICES}
                  value={input.effortUnit}
                  onChange={(effortUnit) => update({ effortUnit })}
                />
              </div>
              {input.effortUnit === "days" && (
                <p
                  className={c.note}
                  style={{ marginTop: "calc(0.3 * var(--rp-pitch))" }}
                >
                  1 日 = 8 時間で換算します
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className={c.group}>
            <NumberField
              id="fixed-price"
              label="一式金額"
              suffix="円"
              value={input.fixedPrice}
              onChange={(value) => update({ fixedPrice: value })}
            />
          </div>
        )}

        <fieldset className={c.group}>
          <legend className={c.legend}>追加オプション</legend>
          <ul className={c.options}>
            {QUOTE_OPTIONS.map((option) => (
              <li key={option.id}>
                <CheckRow
                  checked={input.selectedOptionIds.includes(option.id)}
                  onChange={() => toggleOption(option.id)}
                  trailing={`+${Math.round(option.rate * 100)}%`}
                >
                  {option.label}
                </CheckRow>
              </li>
            ))}
          </ul>
        </fieldset>

        <div className={c.group}>
          <CheckRow
            checked={input.includeTax}
            onChange={(checked) => update({ includeTax: checked })}
          >
            消費税（10%）を含める
          </CheckRow>
        </div>
      </form>

      <QuoteSummary breakdown={breakdown} includeTax={input.includeTax} />
    </div>
  );
}

/** ミニ壁のセグメント。選択は矢印キーでも移動できる（roving tabindex）。 */
function SegmentedControl<T extends string>({
  label,
  choices,
  value,
  onChange,
}: {
  label: string;
  choices: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (index: number) => {
    onChange(choices[index].value);
    refs.current[index]?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    const last = choices.length - 1;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        select(index === last ? 0 : index + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        select(index === 0 ? last : index - 1);
        break;
      case "Home":
        event.preventDefault();
        select(0);
        break;
      case "End":
        event.preventDefault();
        select(last);
        break;
    }
  };

  return (
    <div role="radiogroup" aria-label={label} className={c.segments}>
      {choices.map((choice, index) => {
        const checked = choice.value === value;
        return (
          <button
            key={choice.value}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={() => onChange(choice.value)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={`${c.segment} ${checked ? c.segmentOn : ""}`}
          >
            <span
              aria-hidden="true"
              className={`${c.mark} ${checked ? c.markOn : ""}`}
            />
            {choice.label}
          </button>
        );
      })}
    </div>
  );
}

/** 框で縁取られた行。チェックすると行全体がコバルトに染まる。 */
function CheckRow({
  checked,
  onChange,
  trailing,
  children,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  trailing?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`${c.option} ${checked ? c.optionOn : ""}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className={c.srOnly}
      />
      {/* 朱が点いていれば選ばれている。この面で朱はそれ以外の意味を持たない */}
      <span
        aria-hidden="true"
        className={`${c.mark} ${checked ? c.markOn : ""}`}
      />
      <span className={c.optionLabel}>{children}</span>
      {trailing && <span className={c.trailing}>{trailing}</span>}
    </label>
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
    <div className={c.field}>
      <label htmlFor={id} className={c.fieldLabel}>
        {label}
      </label>
      <div className={c.fieldRow}>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={0}
          value={value > 0 ? value : ""}
          onChange={(event) =>
            onChange(event.target.value === "" ? 0 : Number(event.target.value))
          }
          className={c.input}
        />
        <span className={c.suffix}>{suffix}</span>
      </div>
    </div>
  );
}
