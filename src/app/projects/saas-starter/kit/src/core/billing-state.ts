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
  /** 一時停止中です（機能はそのままお使いいただけます） */
  | "paused"
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

/** いまこの瞬間、お支払いが通っているご契約の状態です */
export const LIVE_STATUSES: readonly StripeStatus[] = ["active", "trialing", "past_due"];

/**
 * いま、お支払いが通っているご契約かどうか。
 *
 * **「ご契約の実体がまだあるか」とは別の問いです。** ご解約の通知が届いたときに
 * 「取り直したら、まだお支払いが続いていた」を見分けるために使います。
 */
export function isLiveSubscription(status: StripeStatus | "none"): boolean {
  return (LIVE_STATUSES as readonly string[]).includes(status);
}

/**
 * 決済のしくみの側に、まだご契約の実体が残っているか。
 *
 * **「機能をお使いいただけるか（isEntitled）」とは別の問いです。**
 *   - `incomplete` … はじめのお支払いがまだ確定していません。機能は止めますが、
 *     そのあと有効になってご請求が始まりえます。もう 1 本お申し込みを通すと、
 *     同じお客さまにご契約が 2 本立ってしまいます
 *   - `paused` … 一時停止中です。機能はお使いいただけますが、ご契約は残っています
 *   - `unpaid` … お支払いが滞っています。機能は止めますが、ご契約は残っています
 *
 * 残っているうちに新しいお申し込みをお通しすると二重のご請求になり、
 * 残っているうちに組織を消すと、お支払いだけが続いてしまいます。
 * お申し込みの可否・組織の削除・データベースの引き金の 3 か所は、この判定で決めます。
 */
export function hasOpenSubscription(status: StripeStatus | "none"): boolean {
  return status !== "none" && status !== "canceled" && status !== "incomplete_expired";
}

function bannerFor(status: StripeStatus, cancelAtPeriodEnd: boolean): BillingBanner {
  if (status === "unpaid") return "unpaid";
  if (status === "canceled" || status === "incomplete_expired") return "canceled";
  // はじめのお支払いの確認待ちは、「お支払いが確かめられません」とは事情が違います
  if (status === "incomplete") return "incomplete";
  // 一時停止中も、「お支払いが確かめられません」とは事情が違います
  // （同じ画面の状態の行は「一時停止中」と出ています。言うことをそろえます）
  if (status === "paused") return "paused";
  if (status === "past_due") return "past_due";
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
