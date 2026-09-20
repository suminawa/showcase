// このファイルは、SaaS スターター キットからの写しです。
// 直すときはキットの側を直してから、scripts/sync-saas-starter.mjs を走らせてください。
import type { Lang } from "../core/i18n";

export type MailMessage = {
  to: string;
  subject: string;
  /** 本文はテキストだけ。HTML は作らない（文字の取り違えと差し込みの事故を避けるため） */
  text: string;
  lang: Lang;
};

/**
 * お送りできたかどうかです。
 *   not_configured … メールの鍵をまだ頂戴していません（送っていません）
 *   rejected       … 宛先か件名に改行が混じっていました（お送りする前に止めました）
 *   unavailable    … お送りしようとして、届けられませんでした
 */
export type MailFailureCode = "not_configured" | "rejected" | "unavailable";

export type MailResult = { ok: true } | { ok: false; code: MailFailureCode };

export interface MailPort {
  send(message: MailMessage): Promise<MailResult>;
}
