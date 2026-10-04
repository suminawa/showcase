// このファイルは、SaaS スターター キットからの写しです。
// 直すときはキットの側を直してから、scripts/sync-saas-starter.mjs を走らせてください。
import type { BillingPort, SubscriptionChange, WebhookResult } from "../../ports/billing";
import type { FakeStore } from "./store";

const MAX_PAYLOAD_BYTES = 1024 * 1024; // 1 MiB（本物と同じ上限）

type CreateCheckoutInput = Parameters<BillingPort["createCheckoutUrl"]>[0];
type CreateCheckoutResult = ReturnType<BillingPort["createCheckoutUrl"]>;
type CreatePortalInput = Parameters<BillingPort["createPortalUrl"]>[0];
type CreatePortalResult = ReturnType<BillingPort["createPortalUrl"]>;

/**
 * 偽の Checkout / Customer Portal です。1 回押すと契約が入る想定で、
 * 実際に契約の行を書き換えるのは（本物と同じく）flow の役目です。
 *
 * readWebhook は、署名が "fake" のときだけ、本文の JSON をそのまま
 * WebhookResult の中身（eventId・eventType・change）として読みます。
 * Stripe の署名は作りません（外部と通信しないため）。
 */
export class FakeBilling implements BillingPort {
  constructor(private readonly store: FakeStore) {}

  async createCheckoutUrl(input: CreateCheckoutInput): CreateCheckoutResult {
    return { ok: true, url: `/fake/checkout?org=${input.organizationId}&plan=${input.planId}` };
  }

  async createPortalUrl(input: CreatePortalInput): CreatePortalResult {
    // 本物の Customer Portal と同じく、まだ Stripe の顧客が無ければ入れません。
    const customer = this.store.stripeCustomers.get(input.organizationId);
    if (customer === undefined) return { ok: false, code: "no_customer" };
    return { ok: true, url: `/fake/checkout?org=${input.organizationId}&plan=portal` };
  }

  async readWebhook(input: { payload: string; signature: string | null }): Promise<WebhookResult> {
    if (input.signature !== "fake") {
      return { ok: false, code: "bad_signature" };
    }
    if (new TextEncoder().encode(input.payload).length > MAX_PAYLOAD_BYTES) {
      return { ok: false, code: "too_large" };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(input.payload);
    } catch {
      return { ok: false, code: "bad_signature" };
    }

    const body = parsed as { eventId?: unknown; eventType?: unknown; change?: unknown };
    const eventId = typeof body.eventId === "string" ? body.eventId : this.store.nextId("stripe_events");
    const eventType = typeof body.eventType === "string" ? body.eventType : "checkout.session.completed";
    const change = (body.change ?? null) as SubscriptionChange | null;

    return { ok: true, eventId, eventType, change };
  }
}
