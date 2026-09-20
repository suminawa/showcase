// このファイルは、SaaS スターター キットからの写しです。
// 直すときはキットの側を直してから、scripts/sync-saas-starter.mjs を走らせてください。
import { findPlan, freePlan, toPublicPlan, type PlanId, type PublicPlan } from "./plans";

export type StripeStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "incomplete"
  | "incomplete_expired"
  | "paused";

export const STRIPE_STATUSES: readonly StripeStatus[] = [
  "active", "trialing", "past_due", "canceled",
  "unpaid", "incomplete", "incomplete_expired", "paused",
] as const;

export function isStripeStatus(value: unknown): value is StripeStatus {
  return typeof value === "string" && (STRIPE_STATUSES as readonly string[]).includes(value);
}

export type SubscriptionRow = {
  organizationId: string;
  planId: PlanId;
  status: StripeStatus;
  stripeSubscriptionId: string | null;
  /** ISO 8601。分からなければ null */
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  /**
   * ISO 8601。**adapter が Stripe から状態を取り直した時刻**です
   * （順不同で届いた通知を並べ直すために使います。ports/billing.ts の約束）。
   */
  updatedAt: string;
};

export type BillingBanner =
  | "none"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "cancel_scheduled"
  /** はじめのお支払いの確認をお待ちしています（無料のプランの上限でのご利用です） */
  | "incomplete";

export type BillingState = {
  planId: PlanId;
  /**
   * いまのプランです。この束はそのまま画面に渡るため、
   * **お客さまにお見せしてよい中身だけ**（Stripe の Price を入れる環境変数の名前を除いたもの）にします。
   */
  plan: PublicPlan;
  status: StripeStatus | "none";
  /** 機能を使えるか。止めるのは canceled・unpaid・incomplete_expired・incomplete の 4 つ */
  entitled: boolean;
  banner: BillingBanner;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

/**
 * その状態のあいだ、機能をお使いいただけるかどうか。
 *
 * 知っている状態を 1 つずつ数え上げる形にしてあります。
 * Stripe に新しい状態が増えたときは、この switch で型の誤りが出ます
 * （どちら側に入れるかを決めてください）。
 * 知らない状態が実際に届いたときは、**使えない側**に倒します
 * （分からないまま機能をお使いいただくと、あとでお返しできなくなるためです）。
 */
export function isEntitled(status: StripeStatus): boolean {
  switch (status) {
    case "active":
    case "trialing":
    // past_due は、いちど通ったお支払いが今回だけ確かめられていない状態です。
    // 帯でお知らせし、機能は止めません。
    case "past_due":
    case "paused":
      return true;
    case "canceled":
    case "unpaid":
    case "incomplete_expired":
    // incomplete は、**はじめのお支払いがまだ確定していない**状態です。
    // ここでお使いいただけるようにすると、お支払いが通らないまま
    // 上のプランの上限でお使いいただけてしまいます。
    // 確定するまでは、無料のプランの上限でのご利用です。
    case "incomplete":
      return false;
    default: {
      const unknown: never = status;
      void unknown;
      return false;
    }
  }
}

/** お支払いが続いているご契約の状態です（この間は組織を消せません） */
export const LIVE_STATUSES: readonly StripeStatus[] = ["active", "trialing", "past_due"];

/**
 * ご契約が生きているか（Stripe 側にまだご契約が残っているか）。
 * 残っているうちに組織を消してしまうと、お支払いだけが続いてしまうため、
 * 組織を消すときはこの判定でお止めします。
 */
export function isLiveSubscription(status: StripeStatus | "none"): boolean {
  return (LIVE_STATUSES as readonly string[]).includes(status);
}

function bannerFor(status: StripeStatus, cancelAtPeriodEnd: boolean): BillingBanner {
  if (status === "unpaid") return "unpaid";
  if (status === "canceled" || status === "incomplete_expired") return "canceled";
  // はじめのお支払いの確認待ちは、「お支払いが確かめられません」とは事情が違います
  if (status === "incomplete") return "incomplete";
  if (status === "past_due" || status === "paused") return "past_due";
  return cancelAtPeriodEnd ? "cancel_scheduled" : "none";
}

export function billingStateFrom(row: SubscriptionRow | null): BillingState {
  if (row === null) {
    return {
      planId: "free",
      plan: toPublicPlan(freePlan()),
      status: "none",
      entitled: true,
      banner: "none",
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    };
  }

  const entitled = isEntitled(row.status);
  const planId: PlanId = entitled ? row.planId : "free";
  return {
    planId,
    plan: toPublicPlan(findPlan(planId) ?? freePlan()),
    status: row.status,
    entitled,
    banner: bannerFor(row.status, row.cancelAtPeriodEnd),
    currentPeriodEnd: row.currentPeriodEnd,
    cancelAtPeriodEnd: row.cancelAtPeriodEnd,
  };
}
