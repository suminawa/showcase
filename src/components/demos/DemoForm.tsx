"use client";

import { useId, useState, type FormEvent } from "react";

import s from "./demo-shared.module.css";

export type DemoField = {
  name: string;
  label: string;
  type?:
    | "text"
    | "email"
    | "tel"
    | "textarea"
    | "date"
    | "number"
    | "select";
  placeholder?: string;
  required?: boolean;
  /** type: "select" のときの選択肢。先頭に placeholder の行が入る */
  options?: string[];
};

/**
 * 見本のため送信しないフォーム。押すと理由を出すだけで、どこにも送らない。
 * <form> は action を持たず、submit は preventDefault で止める。
 */
export function DemoForm({
  fields,
  submitLabel,
}: {
  fields: DemoField[];
  submitLabel: string;
}) {
  const id = useId();
  const [status, setStatus] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("見本のため送信されません。実際の LP ではここから送信できます。");
  }

  return (
    <form className={s.form} onSubmit={onSubmit}>
      {fields.map((field) => {
        const fieldId = `${id}-${field.name}`;
        return (
          <div key={field.name} className={s.field}>
            <label htmlFor={fieldId}>
              {field.label}
              {field.required ? <span aria-hidden="true">＊</span> : null}
            </label>
            {field.type === "textarea" ? (
              <textarea
                id={fieldId}
                name={field.name}
                placeholder={field.placeholder}
                required={field.required}
                rows={4}
              />
            ) : field.type === "select" ? (
              <select
                id={fieldId}
                name={field.name}
                required={field.required}
                defaultValue=""
              >
                <option value="" disabled>
                  {field.placeholder ?? "選んでください"}
                </option>
                {(field.options ?? []).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={fieldId}
                name={field.name}
                type={field.type ?? "text"}
                placeholder={field.placeholder}
                required={field.required}
              />
            )}
          </div>
        );
      })}
      <button type="submit" className={s.submit}>
        {submitLabel}
      </button>
      <p className={s.status} role="status" aria-live="polite">
        {status}
      </p>
    </form>
  );
}
