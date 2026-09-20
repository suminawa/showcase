// このファイルは、SaaS スターター キットからの写しです。
// 直すときはキットの側を直してから、scripts/sync-saas-starter.mjs を走らせてください。
import type { Lang } from "../core/i18n";
import type { Role } from "../core/permissions";
import type { PlanId } from "../core/plans";
import type { StripeStatus, SubscriptionRow } from "../core/billing-state";
import type { InvitationRow, InvitationStatus } from "../core/invitations";

export type Profile = { id: string; email: string; name: string; lang: Lang; createdAt: string };
export type Organization = { id: string; name: string; createdAt: string };
export type Membership = { organizationId: string; userId: string; role: Role; createdAt: string };
export type MemberView = { userId: string; email: string; name: string; role: Role; createdAt: string };
export type Project = {
  id: string;
  organizationId: string;
  name: string;
  note: string;
  /** お作りになった方。その方が退会されると null になります（行は残ります） */
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};
export type StripeCustomer = { organizationId: string; stripeCustomerId: string };
export type AdminOrgRow = {
  organization: Organization;
  memberCount: number;
  projectCount: number;
  planId: PlanId;
  status: string;
};

/**
 * 運営の画面（/admin）にお出しするご契約の行です。
 *
 * **決済の契約の番号（`stripeSubscriptionId`）の欄そのものがありません。**
 * 画面に出していなくても、行をそのまま部品へ渡した日に漏れてしまうためです。
 * 読む側も、その列を選ばずに読みます。
 *
 * 組織のお名前は、この行が自分で持ちます（同じページの組織の一覧に
 * その組織が並んでいるとはかぎらないためです）。
 */
export type AdminSubscriptionRow = {
  organizationId: string;
  organizationName: string;
  planId: PlanId;
  status: StripeStatus;
  /** ISO 8601。分からなければ null */
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  updatedAt: string;
};

export type { InvitationRow, InvitationStatus, SubscriptionRow };

export interface DataPort {
  // profiles
  getProfile(userId: string): Promise<Profile | null>;
  upsertProfile(input: { id: string; email: string; name: string; lang: Lang }): Promise<Profile>;
  updateProfile(userId: string, input: { name?: string; lang?: Lang }): Promise<Profile>;

  // organizations と memberships
  listOrganizationsForUser(userId: string): Promise<{ organization: Organization; role: Role }[]>;
  /**
   * **見本のしくみ（STARTER_FAKE=1）が、お見せするデータを作るためだけの口です。**
   * 本物のつなぎ役では使えません（呼ぶと例外になります）。
   * 組織をお作りになるときは createOrganizationGuarded をお使いください。
   */
  createOrganizationWithOwner(input: { name: string; userId: string }): Promise<Organization>;
  /**
   * 組織を作り、作った方をオーナーにします。
   * 「お一人が入れる組織の数」を数えるところから書き込みまでを 1 回の呼び出しの中で行い、
   * 上限を超えるときは "limit" を返します（同時に 2 つ届いても、片方だけが通ります）。
   */
  createOrganizationGuarded(
    input: { name: string; userId: string },
    maxPerUser: number,
  ): Promise<Organization | "limit">;
  getOrganization(organizationId: string): Promise<Organization | null>;
  renameOrganization(organizationId: string, name: string): Promise<Organization>;
  deleteOrganization(organizationId: string): Promise<void>;
  getMembership(organizationId: string, userId: string): Promise<Membership | null>;
  listMembers(organizationId: string): Promise<MemberView[]>;
  countOwners(organizationId: string): Promise<number>;
  /**
   * **見本のしくみ（STARTER_FAKE=1）が、お見せするデータを作るためだけの口です。**
   * 本物のつなぎ役では使えません（呼ぶと例外になります）。
   * メンバーに加わっていただくときは acceptInvitation をお使いください。
   */
  addMember(organizationId: string, userId: string, role: Role): Promise<void>;
  /** flow はこの呼び出しを使いません（changeMemberRole に替えました） */
  setMemberRole(organizationId: string, userId: string, role: Role): Promise<void>;
  /** flow はこの呼び出しを使いません（removeMemberGuarded に替えました） */
  removeMember(organizationId: string, userId: string): Promise<void>;
  /**
   * 役割を変えます。「オーナーを 0 人にしない」の数え直しと書き込みを 1 回の呼び出しの中で行い、
   * 最後のオーナーを降ろすことになるときは "last_owner"、その組織にいらっしゃらない方には
   * "not_found" を返します（同時に 2 つ届いても、片方だけが通ります）。
   */
  changeMemberRole(
    organizationId: string,
    userId: string,
    role: Role,
  ): Promise<"ok" | "last_owner" | "not_found">;
  /** メンバーを外します。数え直しと書き込みを 1 回の呼び出しの中で行うところは changeMemberRole と同じです */
  removeMemberGuarded(
    organizationId: string,
    userId: string,
  ): Promise<"ok" | "last_owner" | "not_found">;

  // projects
  listProjects(organizationId: string): Promise<Project[]>;
  countProjects(organizationId: string): Promise<number>;
  getProject(organizationId: string, projectId: string): Promise<Project | null>;
  /** flow はこの呼び出しを使いません（createProjectGuarded に替えました）。見本のデータづくりのために残しています */
  createProject(input: {
    organizationId: string;
    name: string;
    note: string;
    createdBy: string;
  }): Promise<Project>;
  /**
   * プロジェクトを 1 件お作りします。
   * 「いまの件数」を数えるところから書き込みまでを 1 回の呼び出しの中で行い、
   * 上限に達しているときは "limit" を返します（同時に 2 つ届いても、片方だけが通ります）。
   * limit が null のときは、件数の上限がありません。
   */
  createProjectGuarded(
    input: { organizationId: string; name: string; note: string; createdBy: string },
    limit: number | null,
  ): Promise<Project | "limit">;
  updateProject(
    organizationId: string,
    projectId: string,
    input: { name: string; note: string },
  ): Promise<Project>;
  deleteProject(organizationId: string, projectId: string): Promise<void>;

  // invitations
  listInvitations(organizationId: string): Promise<InvitationRow[]>;
  createInvitation(input: {
    organizationId: string;
    email: string;
    role: Role;
    tokenHash: string;
    expiresAt: string;
    invitedBy: string;
  }): Promise<InvitationRow>;
  findInvitationByHash(tokenHash: string): Promise<InvitationRow | null>;
  /** 同じメールへの pending の招待をすべて revoked にする。戻り値は取り消した件数 */
  revokePendingInvitations(organizationId: string, email: string): Promise<number>;
  revokeInvitation(organizationId: string, invitationId: string): Promise<void>;
  /** flow はこの呼び出しを使いません（acceptInvitation に替えました） */
  markInvitationAccepted(invitationId: string, userId: string): Promise<void>;
  /**
   * 招待をお受けいただきます。「招待を accepted にする」と「メンバーに加える」を
   * 1 回の呼び出しの中で行います。
   * すでにその組織の一員の方には、招待だけを accepted にして "already_member" を返します。
   * 招待が pending でなければ何も書かずに "not_pending" を返します
   * （同時に 2 回お受けになっても、メンバーは 1 回しか入りません）。
   */
  acceptInvitation(
    invitationId: string,
    userId: string,
    role: Role,
  ): Promise<"ok" | "already_member" | "not_pending">;

  // 課金（書けるのはサーバーだけ）
  /**
   * 画面にお出しするご契約の行です。**その方のセッションで読みます。**
   *
   * 決済の契約の番号（stripeSubscriptionId）は、一員の方にはお見せしないため
   * **必ず null で返ります**。プランと状態と期間の 4 つだけが入ります。
   * 一員でない組織の ID をお渡しになったときは null です。
   */
  getSubscription(organizationId: string): Promise<SubscriptionRow | null>;
  /**
   * 決済の通知のためのご契約の行です。**service role で読みます**
   * （決済の契約の番号まで入ります）。
   *
   * **署名の検証を通った Webhook の流れだけが呼びます。**
   * 通知にはログインしている方がいないため、画面の口では 0 行になり、
   * ご解約の通知を取りこぼします。画面と Server Action からは呼ばないでください。
   */
  getBillingSubscription(organizationId: string): Promise<SubscriptionRow | null>;
  upsertSubscription(row: SubscriptionRow): Promise<void>;
  getStripeCustomer(organizationId: string): Promise<StripeCustomer | null>;
  setStripeCustomer(organizationId: string, stripeCustomerId: string): Promise<void>;
  findOrganizationByStripeCustomer(stripeCustomerId: string): Promise<string | null>;
  /**
   * すでに処理し終えた event.id かどうかを確かめます（書き込む前に見ます）。
   * 記録そのものは recordStripeEvent で、書き込みが終わったあとに行います。
   */
  hasStripeEvent(eventId: string): Promise<boolean>;
  /** 入れられたら true、すでに同じ id があれば false（二重処理を止める） */
  recordStripeEvent(input: { id: string; type: string; receivedAt: string }): Promise<boolean>;

  // /admin（読むだけ）
  adminListOrganizations(limit: number, offset: number): Promise<AdminOrgRow[]>;
  adminListProfiles(limit: number, offset: number): Promise<Profile[]>;
  /**
   * ご契約の一覧です。**組織のお名前まで入り、決済の契約の番号は入りません。**
   * お名前の引けない行（組織の無いご契約）は、一覧からお外しします。
   */
  adminListSubscriptions(limit: number, offset: number): Promise<AdminSubscriptionRow[]>;
}
