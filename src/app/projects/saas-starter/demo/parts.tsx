"use client";

/**
 * 見本の中で使い回す小さな部品です。
 * キットの app/_components/ の Field・SubmitButton・RoleBadge・Banner・Toast・Nav が手本で、
 * 行き先（next/link）だけを、額の中で動く押しどころに置き換えています。
 */
import { useFormStatus } from "react-dom";
import { useId, useState, type ReactNode } from "react";

import type { BillingBanner } from "../kit/src/core/billing-state";
import { t, type Messages } from "../kit/src/core/i18n";
import type { Role } from "../kit/src/core/permissions";
import { errorsForField, useActionFormContext } from "./ActionForm";
import ui from "./ui.module.css";

/* ---- 入力の 1 欄 ---- */

export type FieldOption = { value: string; label: string };

export type FieldProps = {
  name: string;
  label: string;
  type?: "text" | "email" | "url";
  kind?: "input" | "textarea" | "select";
  options?: FieldOption[];
  required?: boolean;
  hint?: string;
  defaultValue?: string;
  maxLength?: number;
  rows?: number;
};

export function Field(props: FieldProps): ReactNode {
  const { state, messages } = useActionFormContext();
  const id = useId();

  const errors = errorsForField(state.status === "error" ? state.errors : undefined, props.name);
  const hasError = errors.length > 0;

  // 誤りでお戻りになったときは、お書きいただいた内容をそのままお出しします
  const kept = state.status === "error" ? state.values?.[props.name] : undefined;

  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [props.hint === undefined ? null : hintId, hasError ? errorId : null]
    .filter((value) => value !== null)
    .join(" ");

  const shared = {
    id,
    name: props.name,
    required: props.required,
    defaultValue: kept ?? props.defaultValue,
    "aria-invalid": hasError,
    "aria-describedby": describedBy === "" ? undefined : describedBy,
  };

  return (
    <div className={ui.field}>
      <label className={ui.label} htmlFor={id}>
        {props.label}
        {props.required === true ? (
          <span className={ui.required}>{t(messages, "common.required")}</span>
        ) : null}
      </label>

      {props.hint === undefined ? null : (
        <p className={ui.hint} id={hintId}>
          {props.hint}
        </p>
      )}

      {props.kind === "textarea" ? (
        <textarea
          {...shared}
          className={ui.textarea}
          rows={props.rows ?? 3}
          maxLength={props.maxLength}
        />
      ) : null}

      {props.kind === "select" ? (
        <select {...shared} className={ui.select}>
          {(props.options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : null}

      {props.kind === undefined || props.kind === "input" ? (
        <input
          {...shared}
          className={ui.input}
          type={props.type ?? "text"}
          maxLength={props.maxLength}
        />
      ) : null}

      {hasError ? (
        <p className={ui.fieldError} id={errorId}>
          {errors.map((error) => t(messages, `error.${error.code}`)).join(" ")}
        </p>
      ) : null}
    </div>
  );
}

/* ---- 送信のボタン ---- */

export type SubmitButtonProps = {
  children: ReactNode;
  tone?: "primary" | "plain" | "danger" | "quiet";
  size?: "medium" | "small";
  name?: string;
  value?: string;
  className?: string;
};

export function SubmitButton({
  children,
  tone = "plain",
  size = "medium",
  name,
  value,
  className,
}: SubmitButtonProps): ReactNode {
  const { pending } = useFormStatus();

  const toneClass = tone === "plain" ? "" : ui[tone];
  const sizeClass = size === "small" ? ui.small : "";

  return (
    <button
      type="submit"
      name={name}
      value={value}
      className={`${ui.button} ${toneClass} ${sizeClass} ${className ?? ""}`.trimEnd()}
      disabled={pending}
      aria-busy={pending}
    >
      {pending ? <span className={ui.spinner} aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

/* ---- 役割の札 ---- */

function roleLabel(role: Role, messages: Messages): string {
  switch (role) {
    case "owner":
      return t(messages, "role.owner");
    case "admin":
      return t(messages, "role.admin");
    default:
      return t(messages, "role.member");
  }
}

export function RoleBadge({ role, messages }: { role: Role; messages: Messages }): ReactNode {
  const toneClass = role === "owner" ? ui.badgeOwner : role === "admin" ? ui.badgeAdmin : "";

  return <span className={`${ui.badge} ${toneClass}`.trimEnd()}>{roleLabel(role, messages)}</span>;
}

/* ---- 文の中の行き先（額の中で動くので、リンクではなく押しどころ） ---- */

export function TextButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}): ReactNode {
  return (
    <button type="button" className={ui.textButton} onClick={onClick}>
      {children}
    </button>
  );
}

/* ---- お支払いの状態をお知らせする帯 ---- */

function bannerText(banner: BillingBanner, messages: Messages): string | null {
  switch (banner) {
    case "past_due":
      return t(messages, "banner.past_due");
    case "unpaid":
      return t(messages, "banner.unpaid");
    case "canceled":
      return t(messages, "banner.canceled");
    case "cancel_scheduled":
      return t(messages, "banner.cancel_scheduled");
    case "incomplete":
      return t(messages, "banner.incomplete");
    default:
      return null;
  }
}

/**
 * 色の濃さです。これからお手続きが進む見込みのあるものは控えめに、
 * いま止まっているものははっきりお出しします。
 */
function bannerTone(banner: BillingBanner): string {
  const soft = banner === "cancel_scheduled" || banner === "incomplete";
  return soft ? ui.noticeWarn : ui.noticeDanger;
}

export function Banner({
  banner,
  messages,
  onSeeBilling,
}: {
  banner: BillingBanner;
  messages: Messages;
  onSeeBilling: () => void;
}): ReactNode {
  const text = bannerText(banner, messages);
  if (text === null) return null;

  return (
    <div className={`${ui.notice} ${bannerTone(banner)}`} role="status">
      <span className={ui.noticeBody}>
        <span>{text}</span>
        <TextButton onClick={onSeeBilling}>{t(messages, "banner.action")}</TextButton>
      </span>
    </div>
  );
}

/* ---- 1 行のお知らせ（閉じるのはお客さま） ---- */

export function Toast({
  children,
  tone = "ok",
  closeLabel,
}: {
  children: ReactNode;
  tone?: "ok" | "warn" | "danger";
  closeLabel: string;
}): ReactNode {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  const toneClass =
    tone === "danger" ? ui.noticeDanger : tone === "warn" ? ui.noticeWarn : ui.noticeOk;

  return (
    <div className={`${ui.notice} ${toneClass}`} role="status">
      <span className={ui.noticeBody}>{children}</span>
      <button type="button" className={ui.noticeClose} onClick={() => setOpen(false)}>
        {closeLabel}
      </button>
    </div>
  );
}

/* ---- 画面の行き来 ---- */

export type NavItem<T extends string> = { id: T; label: string };

export function Nav<T extends string>({
  items,
  label,
  current,
  onSelect,
  tone = "main",
}: {
  items: NavItem<T>[];
  label: string;
  current: T;
  onSelect: (id: T) => void;
  tone?: "main" | "sub";
}): ReactNode {
  return (
    <nav className={tone === "sub" ? `${ui.nav} ${ui.navSub}` : ui.nav} aria-label={label}>
      {items.map((item) => {
        const here = item.id === current;
        return (
          <button
            key={item.id}
            type="button"
            className={here ? `${ui.navLink} ${ui.navCurrent}` : ui.navLink}
            aria-current={here ? "page" : undefined}
            onClick={() => onSelect(item.id)}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
