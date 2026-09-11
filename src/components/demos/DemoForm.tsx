"use client";

import { useId, useState, type FormEvent } from "react";

import s from "./demo-shared.module.css";

export type DemoField = {
  name: string;
  label: string;
  type?: "text" | "email" | "textarea" | "date" | "number";
  placeholder?: string;
  required?: boolean;
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
