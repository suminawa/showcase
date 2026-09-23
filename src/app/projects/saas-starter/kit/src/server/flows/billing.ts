// このファイルは、SaaS スターター キットからの写しです。
// 直すときはキットの側を直してから、scripts/sync-saas-starter.mjs を走らせてください。
/**
 * お支払いの流れ（ご契約の状態・お申し込み・お手続きの画面・Webhook）です。
 *
 * 画面は subscriptions の表だけを見ます（Stripe を毎回呼びません）。
 * 表を書き換えるのは、この中の applyWebhookFlow 1 か所だけです。
 */
import { hasOpenSubscription, isStripeStatus, type BillingState } from "../../core/billing-state";
import { can } from "../../core/permissions";
import {
  isPlanId,
  projectQuota,
  publicPlans,
  type PublicPlan,
  type Quota,
} from "../../core/plans";
import type { BillingErrorCode, Ports, SubscriptionChange } from "../../ports";
import { flowFail, flowOk, type Ctx, type FlowErrorCode, type FlowResult } from "../context";
import { checkoutCancelUrl, checkoutSuccessUrl, portalReturnUrl } from "../urls";

/** ports の課金の口が返す符号を、画面に出せる符号に写します */
const BILLING_CODES: Readonly<Record<BillingErrorCode, FlowErrorCode>> = {
  not_configured: "billing_not_configured",
  no_customer: "billing_no_customer",
  unavailable: "unavailable",
};

export async function billingOverviewFlow(input: {
  ctx: Ctx;
}): Promise<
  FlowResult<{
    state: BillingState;
    quota: Quota;
    plans: PublicPlan[];
    canManage: boolean;
    canStartCheckout: boolean;
  }>
> {
  const count = await input.ctx.ports.data.countProjects(input.ctx.organization.id);

  // お支払いの操作を行えるのはオーナーだけです（表の billing:manage の行）
  const canManage = can("billing:manage", { role: input.ctx.role });

  return flowOk({
    state: input.ctx.billing,
    quota: projectQuota(input.ctx.billing.plan, count),
    // 料金表は、お客さまにお見せしてよい中身だけをお渡しします
    plans: publicPlans(),
    canManage,
    /**
     * お申し込みのボタンをお出ししてよいかどうかです。
     *
     * ご契約の実体が残っているあいだにお申し込みをお通しすると、ご契約が 2 本になり、
     * 二重にご請求してしまいます（startCheckoutFlow が already_subscribed で止めます）。
     * 押してから止めるのではなく、**はじめからお出ししない**ための答えです。
     * 見るのは hasOpenSubscription です。はじめのお支払いの確認待ち（incomplete）や
     * 一時停止中（paused）も、決済のしくみの側にはご契約が残っているためです。
     * プランの変更は、お手続きの画面（Customer Portal）で承ります。
     */
    canStartCheckout: canManage && !hasOpenSubscription(input.ctx.billing.status),
  });
}

export async function startCheckoutFlow(input: {
  ctx: Ctx;
  raw: { planId: unknown };
}): Promise<FlowResult<{ url: string }>> {
  if (!can("billing:manage", { role: input.ctx.role })) return flowFail("forbidden");

  const planId = input.raw.planId;
  if (!isPlanId(planId)) return flowFail("invalid", [{ field: "planId", code: "bad_choice" }]);
  // 無料のプランには Stripe の Price がないため、お申し込みに進めません
  if (planId === "free") return flowFail("invalid", [{ field: "planId", code: "bad_choice" }]);

  // ご契約の実体が残っているあいだに Checkout をもう一度お通しすると、
  // ご契約が 2 本になり、二重にご請求してしまいます
  // （はじめのお支払いの確認待ちと一時停止中も、実体は残っています）。
  // プランの変更とお支払い方法の変更は、お手続きの画面（Customer Portal）で承ります。
  if (hasOpenSubscription(input.ctx.billing.status)) return flowFail("already_subscribed");

  const result = await input.ctx.ports.billing.createCheckoutUrl({
    organizationId: input.ctx.organization.id,
    // 決済のしくみにお控えいただくのは組織のお名前です
    // （お客さまの控えは組織ごとに 1 つで、押した方によって変わりません）
    organizationName: input.ctx.organization.name,
    planId,
    // 戻り先は、組み立ての場所で作った土台からだけ組みます（呼び出し側の値は使いません）
    successUrl: checkoutSuccessUrl(input.ctx.siteOrigin),
    cancelUrl: checkoutCancelUrl(input.ctx.siteOrigin),
    lang: input.ctx.lang,
  });
  if (!result.ok) return flowFail(BILLING_CODES[result.code]);

  return flowOk({ url: result.url });
}

export async function openPortalFlow(input: {
  ctx: Ctx;
}): Promise<FlowResult<{ url: string }>> {
  if (!can("billing:manage", { role: input.ctx.role })) return flowFail("forbidden");

  // まだ一度もお支払いに進んでいない組織には、お手続きの画面がありません
  const customer = await input.ctx.ports.data.getStripeCustomer(input.ctx.organization.id);
  if (customer === null) return flowFail("billing_no_customer");

  const result = await input.ctx.ports.billing.createPortalUrl({
    organizationId: input.ctx.organization.id,
    returnUrl: portalReturnUrl(input.ctx.siteOrigin),
    lang: input.ctx.lang,
  });
  if (!result.ok) return flowFail(BILLING_CODES[result.code]);

  return flowOk({ url: result.url });
}

/**
 * Webhook の Route Handler だけが呼びます。ログインしている方はいません。
 *
 * 署名の確かめと、Stripe からの取り直しは ports の課金の口（adapter）の役目です。
 * ここは「確かめ済みの変更」を受け取り、
 * ① 同じ event.id を済ませていないか ② subscriptions の表へ写す ③ 受け取った記録を残す
 * の順に行います。表と記録がずれないよう、記録は必ず最後です。
 */
export async function applyWebhookFlow(input: {
  ports: Ports;
  payload: string;
  signature: string | null;
  now: Date;
}): Promise<FlowResult<{ eventId: string; applied: boolean }>> {
  const read = await input.ports.billing.readWebhook({
    payload: input.payload,
    signature: input.signature,
  });
  if (!read.ok) return flowFail(read.code === "bad_signature" ? "forbidden" : "invalid");

  // 同じ event.id をもう一度いただいたときは、何もせずに正常終了します
  if (await input.ports.data.hasStripeEvent(read.eventId)) {
    return flowOk({ eventId: read.eventId, applied: false });
  }

  // 先に表へ写し、そのあとで「この通知は受け取りました」と記録します。
  // 逆にすると、表への書き込みが落ちたときに記録だけが残り、Stripe が送り直しても
  // 「処理済み」として捨ててしまうためです（ご契約と表がずれたままになります）。
  const applied = await applyChange(input.ports, read.change, input.now, read.eventType);

  await input.ports.data.recordStripeEvent({
    id: read.eventId,
    type: read.eventType,
    receivedAt: input.now.toISOString(),
  });

  return flowOk({ eventId: read.eventId, applied });
}

/** Webhook が持ってくる、subscriptions の表に書く行（組織の ID を除いたもの）です */
type SubscriptionChangeRow = NonNullable<SubscriptionChange["row"]>;

/**
 * 表に書ける形の行かどうかを確かめます。
 *
 * 本文は外から届くもので、知らないプランや状態がそのまま入ると、
 * 画面の表示も上限の判定も決まらなくなります。1 つでも合わなければ書きません。
 */
function isWritableRow(row: SubscriptionChangeRow): boolean {
  if (!isPlanId(row.planId)) return false;
  if (!isStripeStatus(row.status)) return false;
  // 順不同の並べ直しに使う時刻なので、読み取れる形であることまで確かめます
  return !Number.isNaN(Date.parse(row.updatedAt));
}

/**
 * 存じ上げないお客さまの通知を、記録に 1 行だけ残します。
 *
 * ダッシュボードから直にご契約をお作りになった場合や、
 * 別の場所の受け口の通知がこちらに届いている場合に出ます。
 * 何も残さないと、「通知が入らない」ときの手がかりがありません。
 * 残すのはお客さまの id の**先頭だけ**と、通知の種類です
 * （お名前・メールアドレスなど、個人の知らせは出しません）。
 */
function logUnknownCustomer(stripeCustomerId: string, eventType: string): void {
  const head = stripeCustomerId.slice(0, 8);
  console.warn(`決済の通知: 存じ上げないお客さまでした（customer: ${head}…, ${eventType}）`);
}

/** 届いた変更を subscriptions の表に写します。実際に書いたときだけ true を返します */
async function applyChange(
  ports: Ports,
  change: SubscriptionChange | null,
  now: Date,
  eventType: string,
): Promise<boolean> {
  // 扱わない種類のイベントです（200 をお返しして何もしません）
  if (change === null) return false;

  // 存じ上げないお客さまの通知は、表を触らずに捨てます（記録には 1 行残します）
  const organizationId = await ports.data.findOrganizationByStripeCustomer(
    change.stripeCustomerId,
  );
  if (organizationId === null) {
    logUnknownCustomer(change.stripeCustomerId, eventType);
    return false;
  }

  // 知らないプラン・知らない状態・読み取れない時刻は、書かずに捨てます
  if (change.row !== null && !isWritableRow(change.row)) return false;

  /**
   * 表へ写すところは、この 1 回の呼び出しにすべて入っています。
   *
   * 「いまの行を読む → 比べる → 書く」を、ここで 2 回に分けません。
   * 分けると、読んでから書くまでのあいだに別の通知がもっと新しい状態を書いていても
   * 気づけず、古い状態で上書きしてしまいます（ご解約のあとに past_due が入ると、
   * そのままずっと有料のプランの上限でお使いいただけてしまいます）。
   * 順不同の並べ直し（届いた時刻が前なら書かない）と、ご解約の枝
   * （決済の契約の番号を残したまま canceled・free にする）も、この中です。
   *
   * 組織の ID は、必ず stripe_customers から引き直したものをお渡しします
   * （届いた中身に organizationId が紛れていても、別の組織の行には書きません）。
   */
  return await ports.data.applySubscriptionChange({
    organizationId,
    row: change.row,
    now: now.toISOString(),
  });
}
