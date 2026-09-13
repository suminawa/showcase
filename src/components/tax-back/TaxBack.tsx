"use client";

import { useRef, useState } from "react";

import { formatYen } from "@/lib/format";
import {
  TAX_RATES,
  TAX_ROUNDINGS,
  nearestInclusives,
  solveExcluded,
  toInclusive,
  type TaxRounding,
} from "@/lib/tax";

import c from "../quote-simulator/quote.module.css";

type Direction = "fromInclusive" | "fromExcluded";

const DIRECTIONS: { value: Direction; label: string }[] = [
  { value: "fromInclusive", label: "税込 → 税抜" },
  { value: "fromExcluded", label: "税抜 → 税込" },
];

export function TaxBack() {
  const [direction, setDirection] = useState<Direction>("fromInclusive");
  const [rate, setRate] = useState<10 | 8>(10);
  const [amount, setAmount] = useState(30000);

  return (
    <div className={c.layout}>
      <form className={c.form} onSubmit={(event) => event.preventDefault()}>
        <fieldset className={c.group}>
          <legend className={c.legend}>向き</legend>
          <SegmentedControl label="向き" choices={DIRECTIONS} value={direction} onChange={setDirection} />
        </fieldset>
        <div className={c.group}>
          <NumberField
            id="amount"
            label={direction === "fromInclusive" ? "税込の金額" : "税抜の金額"}
            suffix="円"
            value={amount}
            onChange={setAmount}
          />
        </div>
        <fieldset className={c.group}>
          <legend className={c.legend}>税率</legend>
          <SegmentedControl label="税率" choices={TAX_RATES} value={rate} onChange={setRate} />
        </fieldset>
        <p className={c.note}>
          消費税の端数の扱いは請求書の側の決まりです。三通りそれぞれで、その税込にぴったり戻る税抜を探します。
        </p>
      </form>

      <aside aria-label="計算結果" className={c.summary}>
        <h2 className={c.summaryHead}>
          {direction === "fromInclusive" ? "請求書に書く税抜と消費税" : "税込の金額"}
        </h2>
        {TAX_ROUNDINGS.map((rounding) => (
          <ResultBlock key={rounding.value} direction={direction} rate={rate} amount={amount} rounding={rounding.value} label={rounding.label} />
        ))}
      </aside>
    </div>
  );
}

function ResultBlock({
  direction,
  rate,
  amount,
  rounding,
  label,
}: {
  direction: Direction;
  rate: 10 | 8;
  amount: number;
  rounding: TaxRounding;
  label: string;
}) {
  if (direction === "fromExcluded") {
    const { tax, inclusive } = toInclusive(amount, rate, rounding);
    return (
      <dl className={c.rows}>
        <div className={c.row}>
          <dt className={c.rowLabel}>{label}</dt>
          <dd className={c.rowValue}>
            税込 {formatYen(inclusive)}（消費税 {formatYen(tax)}）
          </dd>
        </div>
      </dl>
    );
  }
  const solved = solveExcluded(amount, rate, rounding);
  if (solved === null) {
    const near = nearestInclusives(amount, rate, rounding);
    const hint = [near.below, near.above].filter((v): v is number => v !== null).map(formatYen).join(" か ");
    return (
      <dl className={c.rows}>
        <div className={c.row}>
          <dt className={c.rowLabel}>{label}</dt>
          <dd className={c.rowValue}>この端数処理では作れません{hint ? `（近いのは税込 ${hint}）` : ""}</dd>
        </div>
      </dl>
    );
  }
  return (
    <dl className={c.rows}>
      <div className={c.row}>
        <dt className={c.rowLabel}>{label}</dt>
        <dd className={c.rowValue}>
          税抜 {formatYen(solved.excluded)}（消費税 {formatYen(solved.tax)}）
        </dd>
      </div>
    </dl>
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
          step={1}
          value={value > 0 ? value : ""}
          onChange={(event) => onChange(event.target.value === "" ? 0 : Math.max(0, Math.round(Number(event.target.value))))}
          className={c.input}
        />
        <span className={c.suffix}>{suffix}</span>
      </div>
    </div>
  );
}

function SegmentedControl<T extends string | number>({
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
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      select(index === last ? 0 : index + 1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      select(index === 0 ? last : index - 1);
    }
  };
  return (
    <div role="radiogroup" aria-label={label} className={c.segments}>
      {choices.map((choice, index) => {
        const checked = choice.value === value;
        return (
          <button
            key={String(choice.value)}
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
            <span aria-hidden="true" className={`${c.mark} ${checked ? c.markOn : ""}`} />
            {choice.label}
          </button>
        );
      })}
    </div>
  );
}
