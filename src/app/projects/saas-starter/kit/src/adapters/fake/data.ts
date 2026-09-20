// このファイルは、SaaS スターター キットからの写しです。
// 直すときはキットの側を直してから、scripts/sync-saas-starter.mjs を走らせてください。
import { billingStateFrom } from "../../core/billing-state";
import type { Lang } from "../../core/i18n";
import type { Role } from "../../core/permissions";
import type {
  AdminOrgRow,
  AdminSubscriptionRow,
  DataPort,
  InvitationRow,
  MemberView,
  Membership,
  Organization,
  Profile,
  Project,
  StripeCustomer,
  SubscriptionRow,
} from "../../ports/data";
import type { FakeStore } from "./store";

/** 役割の名前です（本物の check 制約と同じ 3 つです） */
const ROLES: readonly Role[] = ["owner", "admin", "member"];

function clone<T>(value: T): T {
  return structuredClone(value);
}

/** createdAt（や updatedAt）の古い順に並べる。desc なら新しい順（同じ時刻の中では逆順になる） */
function sortByTime<T>(rows: T[], time: (row: T) => string, order: "asc" | "desc" = "asc"): T[] {
  const sorted = [...rows].sort((a, b) => Date.parse(time(a)) - Date.parse(time(b)));
  return order === "desc" ? sorted.reverse() : sorted;
}

function notFound(what: string): never {
  throw new Error(`${what}が見つかりません。`);
}

function duplicate(what: string): never {
  throw new Error(`${what}はすでにあります。`);
}

/**
 * DataPort のメモリ実装です。organizationId を受け取るメソッドは、
 * 必ずその組織の行だけに絞ります（組織をまたいで読み書きできません）。
 * 返す行はすべて写し（structuredClone）で、呼んだ側が書き換えても中の表は変わりません。
 */
export class FakeData implements DataPort {
  constructor(private readonly store: FakeStore) {}

  // ---- profiles ----

  async getProfile(userId: string): Promise<Profile | null> {
    const row = this.store.profiles.get(userId);
    return row === undefined ? null : clone(row);
  }

  async upsertProfile(input: { id: string; email: string; name: string; lang: Lang }): Promise<Profile> {
    const existing = this.store.profiles.get(input.id);
    const row: Profile = {
      id: input.id,
      email: input.email,
      name: input.name,
      lang: input.lang,
      createdAt: existing?.createdAt ?? this.store.nowIso(),
    };
    this.store.profiles.set(input.id, row);
    return clone(row);
  }

  async updateProfile(userId: string, input: { name?: string; lang?: Lang }): Promise<Profile> {
    const existing = this.store.profiles.get(userId);
    if (existing === undefined) return notFound("プロフィール");
    const row: Profile = {
      ...existing,
      name: input.name ?? existing.name,
      lang: input.lang ?? existing.lang,
    };
    this.store.profiles.set(userId, row);
    return clone(row);
  }

  // ---- organizations と memberships ----

  async listOrganizationsForUser(userId: string): Promise<{ organization: Organization; role: Role }[]> {
    const rows = sortByTime(
      [...this.store.memberships.values()].filter((m) => m.userId === userId),
      (m) => m.createdAt,
    );
    return rows.map((m) => {
      const organization = this.store.organizations.get(m.organizationId);
      if (organization === undefined) return notFound("組織");
      return { organization: clone(organization), role: m.role };
    });
  }

  async createOrganizationWithOwner(input: { name: string; userId: string }): Promise<Organization> {
    const id = this.store.nextId("organizations");
    const createdAt = this.store.nowIso();
    const organization: Organization = { id, name: input.name, createdAt };
    this.store.organizations.set(id, organization);

    const membership: Membership = { organizationId: id, userId: input.userId, role: "owner", createdAt };
    this.store.memberships.set(this.store.membershipKey(id, input.userId), membership);

    return clone(organization);
  }

  /**
   * 数えるところから書き込みまでを、await をはさまずに 1 つの関数の中で行います。
   * JavaScript は 1 つずつしか進まないので、この形が「原子的」にあたります
   * （本物の Supabase では、同じことを SQL の関数 1 つで行います）。
   */
  async createOrganizationGuarded(
    input: { name: string; userId: string },
    maxPerUser: number,
  ): Promise<Organization | "limit"> {
    let mine = 0;
    for (const m of this.store.memberships.values()) {
      if (m.userId === input.userId) mine += 1;
    }
    if (mine >= maxPerUser) return "limit";

    const id = this.store.nextId("organizations");
    const createdAt = this.store.nowIso();
    const organization: Organization = { id, name: input.name, createdAt };
    this.store.organizations.set(id, organization);

    const membership: Membership = { organizationId: id, userId: input.userId, role: "owner", createdAt };
    this.store.memberships.set(this.store.membershipKey(id, input.userId), membership);

    return clone(organization);
  }

  async getOrganization(organizationId: string): Promise<Organization | null> {
    const row = this.store.organizations.get(organizationId);
    return row === undefined ? null : clone(row);
  }

  async renameOrganization(organizationId: string, name: string): Promise<Organization> {
    const existing = this.store.organizations.get(organizationId);
    if (existing === undefined) return notFound("組織");
    const row: Organization = { ...existing, name };
    this.store.organizations.set(organizationId, row);
    return clone(row);
  }

  async deleteOrganization(organizationId: string): Promise<void> {
    this.store.organizations.delete(organizationId);

    for (const [key, membership] of this.store.memberships) {
      if (membership.organizationId === organizationId) this.store.memberships.delete(key);
    }
    for (const [id, project] of this.store.projects) {
      if (project.organizationId === organizationId) this.store.projects.delete(id);
    }
    for (const [id, invitation] of this.store.invitations) {
      if (invitation.organizationId === organizationId) this.store.invitations.delete(id);
    }
    this.store.subscriptions.delete(organizationId);
    this.store.stripeCustomers.delete(organizationId);
  }

  async getMembership(organizationId: string, userId: string): Promise<Membership | null> {
    const row = this.store.memberships.get(this.store.membershipKey(organizationId, userId));
    return row === undefined ? null : clone(row);
  }

  async listMembers(organizationId: string): Promise<MemberView[]> {
    const rows = sortByTime(
      [...this.store.memberships.values()].filter((m) => m.organizationId === organizationId),
      (m) => m.createdAt,
    );
    return rows.map((m) => {
      const profile = this.store.profiles.get(m.userId);
      return {
        userId: m.userId,
        email: profile?.email ?? "",
        name: profile?.name ?? "",
        role: m.role,
        createdAt: m.createdAt,
      };
    });
  }

  async countOwners(organizationId: string): Promise<number> {
    let count = 0;
    for (const m of this.store.memberships.values()) {
      if (m.organizationId === organizationId && m.role === "owner") count += 1;
    }
    return count;
  }

  async addMember(organizationId: string, userId: string, role: Role): Promise<void> {
    const key = this.store.membershipKey(organizationId, userId);
    if (this.store.memberships.has(key)) return duplicate("メンバー");
    this.store.memberships.set(key, { organizationId, userId, role, createdAt: this.store.nowIso() });
  }

  async setMemberRole(organizationId: string, userId: string, role: Role): Promise<void> {
    const key = this.store.membershipKey(organizationId, userId);
    const existing = this.store.memberships.get(key);
    if (existing === undefined) return notFound("メンバー");
    this.store.memberships.set(key, { ...existing, role });
  }

  async removeMember(organizationId: string, userId: string): Promise<void> {
    this.store.memberships.delete(this.store.membershipKey(organizationId, userId));
  }

  /** その組織のオーナーの人数を数えます（await をはさまない、店の中だけの数え方です） */
  private ownerCountOf(organizationId: string): number {
    let count = 0;
    for (const m of this.store.memberships.values()) {
      if (m.organizationId === organizationId && m.role === "owner") count += 1;
    }
    return count;
  }

  /**
   * 数え直しと書き込みを、await をはさまずに 1 つの関数の中で行います。
   *
   * 呼び手の役割（ST001・ST002）は、ここでは確かめていません。
   * `DataPort` はお申し付けごとの「どなたが呼んだか」を持たず、見本のしくみの
   * ログインの状態はサーバーに 1 つだけだからです（別の 2 人が同時に、を表せません）。
   * 役割の確かめは flow（`src/server/flows/members.ts`）と、
   * 本物の `change_member_role` が行います。
   */
  async changeMemberRole(
    organizationId: string,
    userId: string,
    role: Role,
  ): Promise<"ok" | "last_owner" | "not_found"> {
    // 知らない役割の名前は、行に入れません（本物は 22023 で止めます）
    if (!ROLES.includes(role)) throw new Error("data: changeMemberRole");

    const key = this.store.membershipKey(organizationId, userId);
    const existing = this.store.memberships.get(key);
    if (existing === undefined) return "not_found";

    if (existing.role === "owner" && role !== "owner" && this.ownerCountOf(organizationId) <= 1) {
      return "last_owner";
    }

    this.store.memberships.set(key, { ...existing, role });
    return "ok";
  }

  /** 数え直しと書き込みを、await をはさまずに 1 つの関数の中で行います */
  async removeMemberGuarded(
    organizationId: string,
    userId: string,
  ): Promise<"ok" | "last_owner" | "not_found"> {
    const key = this.store.membershipKey(organizationId, userId);
    const existing = this.store.memberships.get(key);
    if (existing === undefined) return "not_found";

    if (existing.role === "owner" && this.ownerCountOf(organizationId) <= 1) return "last_owner";

    this.store.memberships.delete(key);
    return "ok";
  }

  // ---- projects ----

  async listProjects(organizationId: string): Promise<Project[]> {
    const rows = sortByTime(
      [...this.store.projects.values()].filter((p) => p.organizationId === organizationId),
      (p) => p.createdAt,
      "desc",
    );
    return clone(rows);
  }

  async countProjects(organizationId: string): Promise<number> {
    let count = 0;
    for (const p of this.store.projects.values()) if (p.organizationId === organizationId) count += 1;
    return count;
  }

  async getProject(organizationId: string, projectId: string): Promise<Project | null> {
    const row = this.store.projects.get(projectId);
    if (row === undefined || row.organizationId !== organizationId) return null;
    return clone(row);
  }

  async createProject(input: {
    organizationId: string;
    name: string;
    note: string;
    createdBy: string;
  }): Promise<Project> {
    const id = this.store.nextId("projects");
    const createdAt = this.store.nowIso();
    const row: Project = {
      id,
      organizationId: input.organizationId,
      name: input.name,
      note: input.note,
      createdBy: input.createdBy,
      createdAt,
      updatedAt: createdAt,
    };
    this.store.projects.set(id, row);
    return clone(row);
  }

  /**
   * 数えるところから書き込みまでを、await をはさまずに 1 つの関数の中で行います
   * （本物の Supabase では、同じことを SQL の関数 1 つで行います）。
   */
  async createProjectGuarded(
    input: { organizationId: string; name: string; note: string; createdBy: string },
    limit: number | null,
  ): Promise<Project | "limit"> {
    if (limit !== null) {
      let count = 0;
      for (const p of this.store.projects.values()) {
        if (p.organizationId === input.organizationId) count += 1;
      }
      if (count >= limit) return "limit";
    }

    const id = this.store.nextId("projects");
    const createdAt = this.store.nowIso();
    const row: Project = {
      id,
      organizationId: input.organizationId,
      name: input.name,
      note: input.note,
      createdBy: input.createdBy,
      createdAt,
      updatedAt: createdAt,
    };
    this.store.projects.set(id, row);
    return clone(row);
  }

  async updateProject(
    organizationId: string,
    projectId: string,
    input: { name: string; note: string },
  ): Promise<Project> {
    const existing = this.store.projects.get(projectId);
    if (existing === undefined || existing.organizationId !== organizationId) return notFound("プロジェクト");
    const row: Project = { ...existing, name: input.name, note: input.note, updatedAt: this.store.nowIso() };
    this.store.projects.set(projectId, row);
    return clone(row);
  }

  async deleteProject(organizationId: string, projectId: string): Promise<void> {
    const existing = this.store.projects.get(projectId);
    if (existing === undefined || existing.organizationId !== organizationId) return;
    this.store.projects.delete(projectId);
  }

  // ---- invitations ----

  async listInvitations(organizationId: string): Promise<InvitationRow[]> {
    const rows = sortByTime(
      [...this.store.invitations.values()].filter((i) => i.organizationId === organizationId),
      (i) => i.createdAt,
    );
    return clone(rows);
  }

  async createInvitation(input: {
    organizationId: string;
    email: string;
    role: Role;
    tokenHash: string;
    expiresAt: string;
    invitedBy: string;
  }): Promise<InvitationRow> {
    const id = this.store.nextId("invitations");
    const row: InvitationRow = {
      id,
      organizationId: input.organizationId,
      email: input.email,
      role: input.role,
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt,
      status: "pending",
      invitedBy: input.invitedBy,
      acceptedBy: null,
      createdAt: this.store.nowIso(),
    };
    this.store.invitations.set(id, row);
    return clone(row);
  }

  async findInvitationByHash(tokenHash: string): Promise<InvitationRow | null> {
    for (const row of this.store.invitations.values()) {
      if (row.tokenHash === tokenHash) return clone(row);
    }
    return null;
  }

  async revokePendingInvitations(organizationId: string, email: string): Promise<number> {
    let count = 0;
    for (const [id, row] of this.store.invitations) {
      if (row.organizationId === organizationId && row.email === email && row.status === "pending") {
        this.store.invitations.set(id, { ...row, status: "revoked" });
        count += 1;
      }
    }
    return count;
  }

  /** 取り消せるのは、まだお受けいただいていない招待だけです（本物のつなぎ役と同じです） */
  async revokeInvitation(organizationId: string, invitationId: string): Promise<void> {
    const existing = this.store.invitations.get(invitationId);
    if (existing === undefined || existing.organizationId !== organizationId) {
      return notFound("招待");
    }
    if (existing.status !== "pending") return notFound("取り消せる招待");
    this.store.invitations.set(invitationId, { ...existing, status: "revoked" });
  }

  async markInvitationAccepted(invitationId: string, userId: string): Promise<void> {
    const existing = this.store.invitations.get(invitationId);
    if (existing === undefined || existing.status !== "pending") return notFound("招待");
    this.store.invitations.set(invitationId, { ...existing, status: "accepted", acceptedBy: userId });
  }

  /**
   * 招待を accepted にするところとメンバーに加えるところを、await をはさまずに行います。
   *
   * お受けになれない理由は、**分けずに not_pending** でお返しします
   * （無いご招待・期限切れ・すでにお受けのもの・宛先が違うもの・役割が合わないもの）。
   * id を当てずっぽうに試しても、ご招待があること自体が分からないようにするためです。
   * 本物の accept_invitation と同じ確かめを、同じ順で持ちます。
   */
  async acceptInvitation(
    invitationId: string,
    userId: string,
    role: Role,
  ): Promise<"ok" | "already_member" | "not_pending"> {
    const invitation = this.store.invitations.get(invitationId);
    if (invitation === undefined || invitation.status !== "pending") return "not_pending";

    // 期限の切れたご招待は、お受けになれません
    if (Date.parse(invitation.expiresAt) <= Date.parse(this.store.nowIso())) return "not_pending";

    // お招きしたメールアドレスの方だけがお受けになれます
    // （本物は auth.users.email を見ます。見本のしくみでは、プロフィールの行と
    // ご登録の控えのどちらかに、その方のメールアドレスが入っています）。
    const email = this.emailOf(userId);
    if (email === null || email !== invitation.email.toLowerCase()) return "not_pending";

    // 呼び出し側が渡した役割を、そのまま行に入れません（ご招待の行の役割が正です）
    if (role !== invitation.role) return "not_pending";

    this.store.invitations.set(invitationId, {
      ...invitation,
      status: "accepted",
      acceptedBy: userId,
    });

    const key = this.store.membershipKey(invitation.organizationId, userId);
    if (this.store.memberships.has(key)) return "already_member";

    this.store.memberships.set(key, {
      organizationId: invitation.organizationId,
      userId,
      role: invitation.role,
      createdAt: this.store.nowIso(),
    });
    return "ok";
  }

  /** その方のメールアドレスです（本物の auth.users.email にあたります） */
  private emailOf(userId: string): string | null {
    const profile = this.store.profiles.get(userId);
    if (profile !== undefined) return profile.email.toLowerCase();

    for (const user of this.store.authUsers.values()) {
      if (user.id === userId) return user.email.toLowerCase();
    }
    return null;
  }

  // ---- 課金 ----

  async getSubscription(organizationId: string): Promise<SubscriptionRow | null> {
    const row = this.store.subscriptions.get(organizationId);
    return row === undefined ? null : clone(row);
  }

  /** 見本のしくみでは、鍵の違いがないので同じ行をお返しします */
  async getBillingSubscription(organizationId: string): Promise<SubscriptionRow | null> {
    return this.getSubscription(organizationId);
  }

  /**
   * 読むところと書くところを、await をはさまずに 1 つの関数の中で行います
   * （本物の Supabase では、同じことを SQL の関数 1 つで行います）。
   * 決まりは本物とそろえてあります。届いた状態がいまの行より前なら、何も書きません。
   */
  async applySubscriptionChange(input: {
    organizationId: string;
    row: Omit<SubscriptionRow, "organizationId"> | null;
    now: string;
  }): Promise<boolean> {
    const existing = this.store.subscriptions.get(input.organizationId) ?? null;

    // ご解約には取り直した行がないため、受け取った時刻で比べます
    const stamp = input.row === null ? input.now : input.row.updatedAt;
    if (existing !== null) {
      const incoming = Date.parse(stamp);
      const current = Date.parse(existing.updatedAt);
      // 同じ時刻のものは、あとから届いたほうで書き直します
      if (!Number.isNaN(incoming) && !Number.isNaN(current) && incoming < current) return false;
    }

    if (input.row === null) {
      // 一度もご契約のない組織には、ご解約の行を作りません
      if (existing === null) return false;

      // 決済の契約の番号と期間の終わりは、あとからお調べになれるように残します
      this.store.subscriptions.set(input.organizationId, {
        ...existing,
        planId: "free",
        status: "canceled",
        cancelAtPeriodEnd: false,
        updatedAt: input.now,
      });
      return true;
    }

    this.store.subscriptions.set(
      input.organizationId,
      clone({ ...input.row, organizationId: input.organizationId }),
    );
    return true;
  }

  async upsertSubscription(row: SubscriptionRow): Promise<void> {
    this.store.subscriptions.set(row.organizationId, clone(row));
  }

  async getStripeCustomer(organizationId: string): Promise<StripeCustomer | null> {
    const row = this.store.stripeCustomers.get(organizationId);
    return row === undefined ? null : clone(row);
  }

  async setStripeCustomer(organizationId: string, stripeCustomerId: string): Promise<void> {
    this.store.stripeCustomers.set(organizationId, { organizationId, stripeCustomerId });
  }

  async findOrganizationByStripeCustomer(stripeCustomerId: string): Promise<string | null> {
    for (const row of this.store.stripeCustomers.values()) {
      if (row.stripeCustomerId === stripeCustomerId) return row.organizationId;
    }
    return null;
  }

  async hasStripeEvent(eventId: string): Promise<boolean> {
    return this.store.stripeEvents.has(eventId);
  }

  async recordStripeEvent(input: { id: string; type: string; receivedAt: string }): Promise<boolean> {
    if (this.store.stripeEvents.has(input.id)) return false;
    this.store.stripeEvents.set(input.id, { ...input });
    return true;
  }

  // ---- /admin ----

  async adminListOrganizations(limit: number, offset: number): Promise<AdminOrgRow[]> {
    // 0 件以下は、何もお返ししません（負の数で「末尾を除いた全件」にならないためです）
    if (limit <= 0) return [];

    const rows = sortByTime([...this.store.organizations.values()], (o) => o.createdAt).slice(
      offset,
      offset + limit,
    );
    return rows.map((organization) => {
      let memberCount = 0;
      for (const m of this.store.memberships.values()) {
        if (m.organizationId === organization.id) memberCount += 1;
      }
      let projectCount = 0;
      for (const p of this.store.projects.values()) {
        if (p.organizationId === organization.id) projectCount += 1;
      }
      const subscription = this.store.subscriptions.get(organization.id) ?? null;
      const state = billingStateFrom(subscription);
      return {
        organization: clone(organization),
        memberCount,
        projectCount,
        planId: state.planId,
        status: state.status,
      };
    });
  }

  async adminListProfiles(limit: number, offset: number): Promise<Profile[]> {
    if (limit <= 0) return [];

    const rows = sortByTime([...this.store.profiles.values()], (p) => p.createdAt).slice(offset, offset + limit);
    return clone(rows);
  }

  /**
   * ご契約の一覧です。組織のお名前を添え、決済の契約の番号は写しません。
   * 組織の見つからない行は、データベース側（組織を消すとご契約も消えます）に
   * 合わせて一覧からお外しします。
   */
  async adminListSubscriptions(limit: number, offset: number): Promise<AdminSubscriptionRow[]> {
    if (limit <= 0) return [];

    const rows = sortByTime([...this.store.subscriptions.values()], (s) => s.updatedAt).slice(
      offset,
      offset + limit,
    );

    const out: AdminSubscriptionRow[] = [];
    for (const row of rows) {
      const organization = this.store.organizations.get(row.organizationId);
      if (organization === undefined) continue;
      out.push({
        organizationId: row.organizationId,
        organizationName: organization.name,
        planId: row.planId,
        status: row.status,
        currentPeriodEnd: row.currentPeriodEnd,
        cancelAtPeriodEnd: row.cancelAtPeriodEnd,
        updatedAt: row.updatedAt,
      });
    }
    return out;
  }
}
