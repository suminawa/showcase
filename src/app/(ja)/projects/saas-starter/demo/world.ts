/**
 * 見本の「世界」です。キットの本物のしくみを、ブラウザの中だけで動かします。
 *
 * 持ち物は 2 つだけ ── キットの見本用のつなぎ役（メモリの中の 8 つの表）と、
 * ご招待の回数を数える入れ物です。どちらもこのタブの中にしかなく、
 * 読み込み直せば、はじめの見本に戻ります。外へは何も送りません。
 *
 * ここにあるのは、キットでいう「合成の場所」（src/server/ports.ts）にあたるものです。
 * キットの側はそこで Next.js の cookie とヘッダを読みますが、見本はどちらも使わないので、
 * 同じ役目のものをこの 1 枚で持ちます。**役割ごとの可否は 1 つも書きません** ──
 * できる・できないは、すべてキットの flows と permissions がお決めになります。
 */
import { DEMO_USER_IDS, createFakePorts, type FakePorts } from "../kit/src/adapters/fake";
import type { Lang } from "../kit/src/core/i18n";
import type { Role } from "../kit/src/core/permissions";
import type { PlanId } from "../kit/src/core/plans";
import { validateChoice } from "../kit/src/core/validation";
import type { MailPort, MailResult, Organization, SessionUser } from "../kit/src/ports";
import { buildCtx, type Ctx } from "../kit/src/server/context";
import { applyWebhookFlow } from "../kit/src/server/flows/billing";
import { landingPathFlow } from "../kit/src/server/flows/auth";
import {
  INVITE_LIMIT,
  createMemoryRateLimiter,
  type RateLimiter,
} from "../kit/src/server/ratelimit";

/**
 * 見本のリンクに使う、このサイトの土台です。
 * example.com は、説明のために取ってある宛先なので、どこへもつながりません
 * （ご招待のリンクは、押してお確かめいただくものではなく、形をご覧いただくものです）。
 */
export const DEMO_SITE_ORIGIN = "https://example.com";

/** 見本のご契約の期間（日）です。キットの見本のしくみと同じ値です */
const FAKE_PERIOD_DAYS = 30;

/** ご招待の宛先の候補です。入力の欄は置かず、この中からお選びいただきます */
export const DEMO_INVITE_EMAILS: readonly string[] = [
  "sekkei@example.com",
  "eigyou@example.com",
  "keiri@example.com",
] as const;

export type DemoUser = { id: string; name: string; email: string; role: Role | null };

/**
 * メールの口です。**見本では、1 通もお送りしません。**
 *
 * キットの見本用の口は「送ったことにして、控えを積む」形ですが、それをそのまま
 * 公開の見本で動かすと、画面に「ご招待のメールをお送りしました」と出てしまいます。
 * お送りしていないのに、お送りしたとお伝えすることになるので、
 * 鍵をまだ頂戴していないときと同じお返事にしています
 * （画面は「ご招待のリンクをお作りしました」に変わります。文も分かれ道も、キットのものです）。
 */
const DEMO_MAIL: MailPort = {
  async send(): Promise<MailResult> {
    return { ok: false, code: "not_configured" };
  },
};

export class DemoWorld {
  readonly ports: FakePorts;
  readonly inviteLimiter: RateLimiter;

  /** いまお使いの組織です。使う前に必ず memberships を引き直します（buildCtx の役目です） */
  private organizationId: string | null = null;

  constructor() {
    this.ports = { ...createFakePorts({ now: () => new Date() }), mail: DEMO_MAIL };
    this.inviteLimiter = createMemoryRateLimiter(INVITE_LIMIT);
  }

  /** ログインの画面にお出しする「見本の方」の一覧です */
  async demoUsers(): Promise<DemoUser[]> {
    const rows: DemoUser[] = [];
    for (const id of DEMO_USER_IDS) {
      const profile = await this.ports.data.getProfile(id);
      if (profile === null) continue;

      const organizations = await this.ports.data.listOrganizationsForUser(id);
      rows.push({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: organizations[0]?.role ?? null,
      });
    }
    return rows;
  }

  /** 見本の方でお入りいただきます。お受けするのは、見本の 3 人の id だけです */
  async signInAs(userId: unknown): Promise<boolean> {
    const chosen = validateChoice(userId, DEMO_USER_IDS, "userId");
    if (!chosen.ok) return false;

    this.ports.auth.signInAs(chosen.value);

    const user = await this.ports.auth.getUser();
    if (user === null) return false;

    const landing = await landingPathFlow({ ports: this.ports, user });
    this.organizationId = landing.ok ? landing.value.organizationId : null;
    return true;
  }

  async signOut(): Promise<void> {
    await this.ports.auth.signOut();
    this.organizationId = null;
  }

  async user(): Promise<SessionUser | null> {
    return this.ports.auth.getUser();
  }

  /** お使いいただける組織の一覧です */
  async organizations(): Promise<{ organization: Organization; role: Role }[]> {
    const user = await this.ports.auth.getUser();
    if (user === null) return [];
    return this.ports.data.listOrganizationsForUser(user.id);
  }

  /** 組織を切り替えます。控えを信用せず、memberships を引き直します */
  async useOrganization(organizationId: string): Promise<boolean> {
    const user = await this.ports.auth.getUser();
    if (user === null) return false;

    const membership = await this.ports.data.getMembership(organizationId, user.id);
    if (membership === null) return false;

    this.organizationId = membership.organizationId;
    return true;
  }

  /**
   * いまの方・いまの組織・いまの言語の束です。
   * 組織の控えが古くなっていたら、その方が入っていらっしゃる組織に戻します。
   */
  async ctx(lang: Lang): Promise<Ctx | null> {
    const user = await this.ports.auth.getUser();
    if (user === null) return null;

    const deps = { ports: this.ports, siteOrigin: DEMO_SITE_ORIGIN };
    const now = new Date();

    if (this.organizationId !== null) {
      const built = await buildCtx({ ...deps, user, organizationId: this.organizationId, lang, now });
      if (built.ok) return built.value;
    }

    const landing = await landingPathFlow({ ports: this.ports, user });
    const organizationId = landing.ok ? landing.value.organizationId : null;
    if (organizationId === null) return null;

    const built = await buildCtx({ ...deps, user, organizationId, lang, now });
    if (!built.ok) return null;

    this.organizationId = organizationId;
    return built.value;
  }

  private customerId(organizationId: string): string {
    return `cus_fake_${organizationId}`;
  }

  /**
   * 偽のお支払いです。本物の Stripe が行うことを、そのままなぞります。
   *   1. お客さま（customer）をひもづける 2. ご契約の通知をこちらへ届ける
   * 表に書くのは、本物と同じく applyWebhookFlow だけです。
   */
  async completeCheckout(organizationId: string, planId: PlanId, now: Date): Promise<void> {
    const stripeCustomerId = this.customerId(organizationId);
    await this.ports.data.setStripeCustomer(organizationId, stripeCustomerId);

    const periodEnd = new Date(now.getTime() + FAKE_PERIOD_DAYS * 24 * 60 * 60 * 1000);
    await applyWebhookFlow({
      ports: this.ports,
      payload: JSON.stringify({
        eventId: `evt_fake_${now.getTime()}`,
        eventType: "checkout.session.completed",
        change: {
          stripeCustomerId,
          row: {
            planId,
            status: "active",
            stripeSubscriptionId: `sub_fake_${organizationId}`,
            currentPeriodEnd: periodEnd.toISOString(),
            cancelAtPeriodEnd: false,
            updatedAt: now.toISOString(),
          },
        },
      }),
      signature: "fake",
      now,
    });
  }

  /** 偽のお手続きの画面での、ご解約です */
  async cancelSubscription(organizationId: string, now: Date): Promise<void> {
    await applyWebhookFlow({
      ports: this.ports,
      payload: JSON.stringify({
        eventId: `evt_fake_cancel_${now.getTime()}`,
        eventType: "customer.subscription.deleted",
        change: { stripeCustomerId: this.customerId(organizationId), row: null },
      }),
      signature: "fake",
      now,
    });
  }
}
