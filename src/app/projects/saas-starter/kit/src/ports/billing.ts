// このファイルは、SaaS スターター キットからの写しです。
// 直すときはキットの側を直してから、scripts/sync-saas-starter.mjs を走らせてください。
import type { SubscriptionRow } from "../core/billing-state";
import type { PlanId } from "../core/plans";

export type BillingErrorCode = "not_configured" | "no_customer" | "unavailable";

/**
 * 決済の通知の本文の上限です（1 MiB）。
 *
 * 署名を確かめる前に、いくらでも読み込んでしまわないための上限です。
 * 本物の通知は、大きいものでも数十 KiB で収まります。
 *
 * 受け口（src/server/）とつなぎ役（src/adapters/）の両方が使うので、
 * どちらからも見えるこの場所に置いています
 * （src/server/ が src/adapters/ を読むのは、合成の場所だけという約束のためです）。
 */
export const WEBHOOK_MAX_BYTES = 1024 * 1024;

/**
 * 決済の誤りを、**サーバーの記録に残してよい短い文**にします。
 *
 * 決済のしくみがお返しになる文（message）には、メールアドレス・お客さまの id・
 * ご契約の id がそのまま入ることがあります。記録に残すのは、誤りの種類と符号だけです。
 * それ以外の誤り（表への書き込みなど）は、直すための手がかりになるので、
 * これまでどおりその文を残します。
 *
 * 決済のしくみの誤りかどうかは、形で見分けます
 * （SDK の型を ports の外に持ち出さないためです）。
 */
export function billingErrorText(error: unknown): string {
  if (typeof error === "object" && error !== null) {
    const found = error as { type?: unknown; rawType?: unknown; code?: unknown };
    const type = typeof found.type === "string" ? found.type : "";
    const raw = typeof found.rawType === "string" ? found.rawType : "";

    if (type.startsWith("Stripe") || raw !== "") {
      const name = type === "" ? raw : type;
      const code = typeof found.code === "string" && found.code !== "" ? found.code : null;
      return code === null ? name : `${name} / ${code}`;
    }
  }

  return error instanceof Error ? error.message : "";
}

export type SubscriptionChange = {
  stripeCustomerId: string;
  /**
   * null は「この組織の契約を消す（無料に戻す）」。
   *
   * row.updatedAt は **adapter が Stripe から状態を取り直した時刻**（`subscriptions.retrieve()`
   * を呼んだ時刻）を入れる。通知が届いた順や、Stripe のイベントが作られた時刻ではない。
   * flow はこの時刻を見て、いま表に入っている行より前の状態を書かないようにしている。
   */
  row: Omit<SubscriptionRow, "organizationId"> | null;
};

export type WebhookResult =
  | { ok: true; eventId: string; eventType: string; change: SubscriptionChange | null }
  | { ok: false; code: "bad_signature" | "too_large" };

export interface BillingPort {
  createCheckoutUrl(input: {
    organizationId: string;
    /**
     * 決済のしくみにお控えいただく、組織のお名前。
     *
     * ご契約は組織ごとなので、お客さまの控えも組織ごとに 1 つです。
     * **どなたのメールアドレスも渡さない**のは、同じ組織で押した方によって
     * 引数が変わると、組織ごとに決まる冪等性キーと食い違ってしまうためです
     * （メールアドレスは、お支払いの画面がその場でお伺いします）。
     */
    organizationName: string;
    planId: PlanId;
    successUrl: string;
    cancelUrl: string;
    lang: "ja" | "en";
  }): Promise<{ ok: true; url: string } | { ok: false; code: BillingErrorCode }>;

  createPortalUrl(input: {
    organizationId: string;
    returnUrl: string;
    lang: "ja" | "en";
  }): Promise<{ ok: true; url: string } | { ok: false; code: BillingErrorCode }>;

  /**
   * Webhook の本文から、表に書く形を作る。
   * 署名の検証・大きさの上限・Stripe からの取り直しは、この中で行う。
   * 扱わない種類のイベントは { ok: true, change: null } を返す。
   */
  readWebhook(input: { payload: string; signature: string | null }): Promise<WebhookResult>;
}
