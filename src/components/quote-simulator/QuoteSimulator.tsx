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

const PANE_PAD = "p-[clamp(20px,3vw,36px)]";

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
    <div className="contents">
      <form
        className="flex flex-col gap-1 sm:gap-1.5 lg:[grid-column:1/8]"
        onSubmit={(event) => event.preventDefault()}
      >
        <fieldset className={`pane ${PANE_PAD}`}>
          <legend className="float-left mb-4 text-sm font-bold">
            単価方式
          </legend>
          <div className="clear-left">
            <SegmentedControl
              label="単価方式"
              choices={MODE_CHOICES}
              value={input.mode}
              onChange={(mode) => update({ mode })}
            />
          </div>
        </fieldset>

        {input.mode === "hourly" ? (
          <div className={`pane ${PANE_PAD} space-y-7`}>
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
              <div className="mt-3">
                <SegmentedControl
                  label="工数の単位"
                  choices={UNIT_CHOICES}
                  value={input.effortUnit}
                  onChange={(effortUnit) => update({ effortUnit })}
                  size="sm"
                />
              </div>
              {input.effortUnit === "days" && (
                <p className="mt-3 text-[0.8125rem] text-ink-soft">
                  1 日 = 8 時間で換算します
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className={`pane ${PANE_PAD}`}>
            <NumberField
              id="fixed-price"
              label="一式金額"
              suffix="円"
              value={input.fixedPrice}
              onChange={(value) => update({ fixedPrice: value })}
            />
          </div>
        )}

        <fieldset className={`pane ${PANE_PAD}`}>
          <legend className="float-left mb-4 text-sm font-bold">
            追加オプション
          </legend>
          <ul className="clear-left grid gap-[3px] bg-bar p-[3px]">
            {QUOTE_OPTIONS.map((option) => (
              <li key={option.id} className="grid">
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

        <div className={`pane ${PANE_PAD}`}>
          <div className="grid bg-bar p-[3px]">
            <CheckRow
              checked={input.includeTax}
              onChange={(checked) => update({ includeTax: checked })}
            >
              消費税（10%）を含める
            </CheckRow>
          </div>
        </div>

        <div aria-hidden="true" className="pane hidden min-h-6 flex-1 lg:block" />
      </form>

      <div className="flex flex-col gap-1 sm:gap-1.5 lg:[grid-column:8/13]">
        <QuoteSummary breakdown={breakdown} includeTax={input.includeTax} />
        <div
          aria-hidden="true"
          className="pane-frost hidden min-h-6 flex-1 lg:block"
        />
      </div>
    </div>
  );
}

/** ミニ壁のセグメント。選択は矢印キーでも移動できる（roving tabindex）。 */
function SegmentedControl<T extends string>({
  label,
  choices,
  value,
  onChange,
  size = "md",
}: {
  label: string;
  choices: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  size?: "md" | "sm";
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
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-grid grid-flow-col gap-[3px] bg-bar p-[3px]"
    >
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
            className={`${
              checked ? "pane-cobalt on-color text-white" : "pane pane-lit"
            } font-medium transition-[background-color,box-shadow] duration-500 ease-[var(--ease-glass)] motion-reduce:transition-none ${
              size === "md"
                ? "px-6 py-2.5 text-sm"
                : "px-4 py-1.5 text-[0.8125rem]"
            }`}
          >
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
    <label
      className={`${
        checked
          ? "pane-cobalt on-color text-white"
          : "pane pane-lit cursor-pointer"
      } flex items-center gap-4 px-4 py-3.5 transition-[background-color,box-shadow] duration-500 ease-[var(--ease-glass)] has-focus-visible:outline-3 has-focus-visible:-outline-offset-3 has-focus-visible:outline-cobalt has-checked:has-focus-visible:outline-white motion-reduce:transition-none cursor-pointer`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className={`grid size-5 shrink-0 place-items-center border-2 ${
          checked ? "border-white bg-white" : "border-bar bg-glass-bright"
        }`}
      >
        {checked && (
          <svg viewBox="0 0 12 12" className="size-3 fill-none stroke-cobalt-deep stroke-[2.5]">
            <path d="M2 6.5 5 9.5 10 3" />
          </svg>
        )}
      </span>
      <span className="flex-1 text-sm font-medium">{children}</span>
      {trailing && (
        <span
          className={`font-display text-[0.8125rem] font-semibold tracking-[0.1em] ${
            checked ? "text-white" : "text-ink-soft"
          }`}
        >
          {trailing}
        </span>
      )}
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
    <div>
      <label htmlFor={id} className="text-sm font-bold">
        {label}
      </label>
      <div className="mt-2.5 flex items-center gap-3">
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={0}
          value={value > 0 ? value : ""}
          onChange={(event) =>
            onChange(event.target.value === "" ? 0 : Number(event.target.value))
          }
          className="w-44 appearance-none border-2 border-bar bg-glass-bright px-3.5 py-2.5 text-right text-[1.0625rem] font-medium tabular-nums [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <span className="text-sm text-ink-soft">{suffix}</span>
      </div>
    </div>
  );
}
