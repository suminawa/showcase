// このファイルは、SaaS スターター キットからの写しです。
// 直すときはキットの側を直してから、scripts/sync-saas-starter.mjs を走らせてください。
export type ValidationCode =
  | "required"
  | "too_long"
  | "too_short"
  | "bad_email"
  | "bad_choice"
  | "bad_id";

export type FieldError = { field: string; code: ValidationCode };

export type Validated<T> = { ok: true; value: T } | { ok: false; errors: FieldError[] };

// C0 の制御文字と DEL を外す。タブ・改行（LF）・復帰（CR）は残す（表からの貼りつけや CRLF の文を黙って変えないため）。
const CONTROL = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;
const EMAIL = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function trimText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(CONTROL, "").replace(/^[\s　]+|[\s　]+$/g, "");
}

/**
 * メールの件名や本文に差し込む値を、1 行に均します。
 *
 * 組織の名前やお名前は、お客さまがお書きになったとおりに保存しています。
 * 途中で行が変わる値をそのまま差し込むと、メールの件名が 2 行になったり、
 * 本文に身に覚えのない 1 行を足されたりします。差し込む直前に、ここを通します。
 */
export function singleLine(value: string): string {
  return value.replace(CONTROL, "").replace(/[\r\n\t\v\f]+/g, " ").replace(/ {2,}/g, " ").trim();
}

function fail(field: string, code: ValidationCode): Validated<never> {
  return { ok: false, errors: [{ field, code }] };
}

export function validateEmail(value: unknown, field = "email"): Validated<string> {
  const text = trimText(value).toLowerCase();
  if (text === "") return fail(field, "required");
  if (text.length > 254) return fail(field, "too_long");
  if (!EMAIL.test(text)) return fail(field, "bad_email");
  return { ok: true, value: text };
}

export function validatePassword(value: unknown, field = "password"): Validated<string> {
  if (typeof value !== "string" || value === "") return fail(field, "required");
  const size = [...value].length;
  if (size < 8) return fail(field, "too_short");
  if (size > 72) return fail(field, "too_long");
  return { ok: true, value };
}

export function validateText(
  value: unknown,
  opts: { field: string; min: number; max: number },
): Validated<string> {
  const text = trimText(value);
  const size = [...text].length;
  if (size === 0) return opts.min === 0 ? { ok: true, value: "" } : fail(opts.field, "required");
  if (size < opts.min) return fail(opts.field, "too_short");
  if (size > opts.max) return fail(opts.field, "too_long");
  return { ok: true, value: text };
}

export function validateChoice<T extends string>(
  value: unknown,
  allowed: readonly T[],
  field: string,
): Validated<T> {
  const text = trimText(value);
  if (text === "") return fail(field, "required");
  if (!(allowed as readonly string[]).includes(text)) return fail(field, "bad_choice");
  return { ok: true, value: text as T };
}

export function validateId(value: unknown, field: string): Validated<string> {
  const text = trimText(value);
  if (text === "") return fail(field, "required");
  if (!UUID.test(text)) return fail(field, "bad_id");
  return { ok: true, value: text };
}

/** すべての検査を通してから、落ちたものをまとめて返す（最初の 1 つで止めない） */
export function collect(
  entries: Record<string, Validated<string>>,
): Validated<Record<string, string>> {
  const value: Record<string, string> = {};
  const errors: FieldError[] = [];
  for (const [key, result] of Object.entries(entries)) {
    if (result.ok) value[key] = result.value;
    else errors.push(...result.errors);
  }
  return errors.length > 0 ? { ok: false, errors } : { ok: true, value };
}
