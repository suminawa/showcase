// このファイルは、SaaS スターター キットからの写しです。
// 直すときはキットの側を直してから、scripts/sync-saas-starter.mjs を走らせてください。
/**
 * メモリだけで動く「本物のふり」の置き場。
 * Supabase と Stripe の代わりに、8 つの表を Map で持ちます（STARTER_FAKE=1 のとき使われます）。
 *
 * id は `st-<表>-<連番>`（乱数を使わないので、テストのたびに同じ値になります）。
 * 招待のトークンだけは、この店の外（core の createInviteToken）で作った本物の乱数を使います。
 */
import type {
  InvitationRow,
  Membership,
  Organization,
  Profile,
  Project,
  StripeCustomer,
  SubscriptionRow,
} from "../../ports/data";
import type { MailMessage } from "../../ports/mail";

export type FakeTableName =
  | "profiles"
  | "organizations"
  | "memberships"
  | "invitations"
  | "projects"
  | "subscriptions"
  | "stripe_customers"
  | "stripe_events";

export type FakeStripeEvent = { id: string; type: string; receivedAt: string };

export type FakeMagicLink = { email: string; redirectTo: string; sentAt: string };

/** signUpWithPassword で作った、まだ profiles に無いかもしれない認証だけの方 */
export type FakeAuthUser = { id: string; email: string; password: string };

export type FakeStoreOptions = {
  /** 既定は 2026-09-20T00:00:00.000Z。テストは自分で時計を渡してください */
  now?: () => Date;
};

export class FakeStore {
  readonly now: () => Date;

  /** いまログインしている方の id。いなければ null */
  sessionUserId: string | null = null;

  /** sendMagicLink が積む送信履歴（テストが読めるように公開） */
  readonly magicLinks: FakeMagicLink[] = [];

  /** FakeMail.send が積む送信履歴 */
  readonly mails: MailMessage[] = [];

  /** signUpWithPassword / signInWithPassword が使う、メール→認証情報 */
  readonly authUsers = new Map<string, FakeAuthUser>();

  // 8 つの表
  readonly profiles = new Map<string, Profile>();
  readonly organizations = new Map<string, Organization>();
  /** キーは `${organizationId}:${userId}` */
  readonly memberships = new Map<string, Membership>();
  readonly invitations = new Map<string, InvitationRow>();
  readonly projects = new Map<string, Project>();
  /** キーは organizationId（組織ごとに 1 行） */
  readonly subscriptions = new Map<string, SubscriptionRow>();
  /** キーは organizationId（組織ごとに 1 行） */
  readonly stripeCustomers = new Map<string, StripeCustomer>();
  readonly stripeEvents = new Map<string, FakeStripeEvent>();

  private readonly counters: Record<FakeTableName, number> = {
    profiles: 0,
    organizations: 0,
    memberships: 0,
    invitations: 0,
    projects: 0,
    subscriptions: 0,
    stripe_customers: 0,
    stripe_events: 0,
  };

  constructor(options: FakeStoreOptions = {}) {
    this.now = options.now ?? (() => new Date("2026-09-20T00:00:00.000Z"));
  }

  /** `st-<表>-<連番>` を発行する（乱数は使わない） */
  nextId(table: FakeTableName): string {
    this.counters[table] += 1;
    return `st-${table}-${this.counters[table]}`;
  }

  nowIso(): string {
    return this.now().toISOString();
  }

  membershipKey(organizationId: string, userId: string): string {
    return `${organizationId}:${userId}`;
  }
}
