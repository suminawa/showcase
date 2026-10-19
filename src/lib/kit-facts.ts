/*
 * 看板 3 本の帳票（品物のページの頭と、トップ・/kits のカードに出す欄）。
 * どの品物も同じ順で書く: 月額 → 使い始めるまで → 知らせる先などの要点 2 つ。
 * 値はすべて kit-demos.ts（設定にかかる時間・月額）と各ページの copy.ts（知らせる先・無料版）に書いてあることだけ。
 */
import type { Lang } from "@/i18n/routes";

import type { LinkKey } from "./go";

export type KitFact = { label: string; value: string };
export type FlagshipSlug = "deadline" | "form" | "booking";

export const FLAGSHIPS: readonly FlagshipSlug[] = ["deadline", "form", "booking"];

export const KIT_FACTS: Record<FlagshipSlug, Record<Lang, KitFact[]>> = {
  deadline: {
    ja: [
      { label: "月額", value: "0 円（買い切り）" },
      { label: "使い始めるまで", value: "15〜20 分ほど" },
      { label: "知らせる先", value: "Slack・Discord・メール・Google Chat" },
      { label: "無料版", value: "あり（3 日前と当日だけを知らせる版）" },
    ],
    en: [
      { label: "Monthly fee", value: "¥0 (one-time purchase)" },
      { label: "Setup", value: "About 15–20 minutes" },
      { label: "Sends to", value: "Slack, Discord, email, Google Chat" },
      { label: "Free version", value: "Yes (3 days before and same day only)" },
    ],
    fr: [
      { label: "Abonnement", value: "0 ¥ (achat unique)" },
      { label: "Installation", value: "15 à 20 minutes environ" },
      { label: "Envoi vers", value: "Slack, Discord, e-mail, Google Chat" },
      { label: "Version gratuite", value: "Oui (J-3 et jour même seulement)" },
    ],
  },
  form: {
    ja: [
      { label: "月額", value: "0 円（買い切り）" },
      { label: "使い始めるまで", value: "20 分ほど" },
      { label: "知らせる先", value: "メール・Slack・Discord・LINE" },
      { label: "自動返信", value: "受付番号つきのメール" },
    ],
    en: [
      { label: "Monthly fee", value: "¥0 (one-time purchase)" },
      { label: "Setup", value: "About 20 minutes" },
      { label: "Sends to", value: "Email, Slack, Discord, LINE" },
      { label: "Auto-reply", value: "Email with a reference number" },
    ],
    fr: [
      { label: "Abonnement", value: "0 ¥ (achat unique)" },
      { label: "Installation", value: "20 minutes environ" },
      { label: "Envoi vers", value: "E-mail, Slack, Discord, LINE" },
      { label: "Réponse auto", value: "E-mail avec numéro de référence" },
    ],
  },
  booking: {
    ja: [
      { label: "月額", value: "0 円（予約が月 50 件を超えても）" },
      { label: "使い始めるまで", value: "15 分ほど" },
      { label: "お客さま", value: "Google アカウントは要りません" },
      { label: "メール", value: "予約の確認と前日のリマインド" },
    ],
    en: [
      { label: "Monthly fee", value: "¥0 (even past 50 bookings a month)" },
      { label: "Setup", value: "About 15 minutes" },
      { label: "Customers", value: "No Google account needed" },
      { label: "Emails", value: "Confirmation and day-before reminder" },
    ],
    fr: [
      { label: "Abonnement", value: "0 ¥ (même au-delà de 50 réservations par mois)" },
      { label: "Installation", value: "15 minutes environ" },
      { label: "Clients", value: "Aucun compte Google requis" },
      { label: "E-mails", value: "Confirmation et rappel de la veille" },
    ],
  },
};

export function isFlagship(slug: string): slug is FlagshipSlug {
  return (FLAGSHIPS as readonly string[]).includes(slug);
}

/** 無料版のある品物と、その売り場への道の鍵（links.json）。いまは期限アラートだけ */
export const FREE_EDITION: Readonly<Partial<Record<string, LinkKey>>> = { deadline: "deadline-lite" };
