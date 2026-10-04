// このファイルは、SaaS スターター キットからの写しです。
// 直すときはキットの側を直してから、scripts/sync-saas-starter.mjs を走らせてください。
/**
 * 役割とできることの表。
 * この表が唯一の出どころで、画面・サーバーの処理・RLS の 3 か所がここから決まります。
 */

export type Role = "owner" | "admin" | "member";

export const ROLES: readonly Role[] = ["owner", "admin", "member"] as const;

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

export function roleRank(role: Role): number {
  return role === "owner" ? 3 : role === "admin" ? 2 : 1;
}

export type Action =
  | "project:read"
  | "project:create"
  | "project:update"
  | "project:delete"
  | "member:invite"
  | "member:remove"
  | "member:setRole"
  | "org:rename"
  | "billing:manage"
  | "org:delete";

export const ACTIONS: readonly Action[] = [
  "project:read",
  "project:create",
  "project:update",
  "project:delete",
  "member:invite",
  "member:remove",
  "member:setRole",
  "org:rename",
  "billing:manage",
  "org:delete",
] as const;

/**
 * yes      … いつでもできる
 * no       … できない
 * own      … 自分が作ったものだけできる（resourceOwnerId を見る）
 * notOwner … 相手が owner でなければできる（targetRole を見る）
 */
export type Grant = "yes" | "no" | "own" | "notOwner";

export const PERMISSION_MATRIX: Readonly<Record<Action, Readonly<Record<Role, Grant>>>> = {
  "project:read": { owner: "yes", admin: "yes", member: "yes" },
  "project:create": { owner: "yes", admin: "yes", member: "yes" },
  "project:update": { owner: "yes", admin: "yes", member: "yes" },
  "project:delete": { owner: "yes", admin: "yes", member: "own" },
  "member:invite": { owner: "yes", admin: "notOwner", member: "no" },
  "member:remove": { owner: "yes", admin: "notOwner", member: "no" },
  "member:setRole": { owner: "yes", admin: "notOwner", member: "no" },
  "org:rename": { owner: "yes", admin: "yes", member: "no" },
  "billing:manage": { owner: "yes", admin: "no", member: "no" },
  "org:delete": { owner: "yes", admin: "no", member: "no" },
};

export type PermissionContext = {
  /** いま操作している人の、その組織での役割 */
  role: Role;
  /** いま操作している人の id（own の判定に使う） */
  userId?: string;
  /** 対象の行を作った人の id（own の判定に使う） */
  resourceOwnerId?: string;
  /** 相手の役割、または招待する役割（notOwner の判定に使う） */
  targetRole?: Role;
};

export function can(action: Action, ctx: PermissionContext): boolean {
  const grant = PERMISSION_MATRIX[action][ctx.role];
  if (grant === "yes") return true;
  if (grant === "no") return false;
  if (grant === "own") {
    return ctx.userId !== undefined && ctx.userId === ctx.resourceOwnerId;
  }
  return ctx.targetRole !== undefined && ctx.targetRole !== "owner";
}

export type MembershipChange = {
  actorRole: Role;
  actorUserId: string;
  targetUserId: string;
  targetRole: Role;
  next: Role | "remove";
  /** その組織にいま何人 owner がいるか */
  ownerCount: number;
};

export type MembershipDenial =
  | "forbidden"
  | "cannot_touch_owner"
  | "cannot_promote_to_owner"
  | "last_owner"
  | "no_change";

/**
 * メンバーの役割を変える・外すときの判定。
 * 自分で退会するときだけは役割を問いません（ただし最後の owner は退会できません）。
 */
export function canChangeMembership(
  input: MembershipChange,
): { ok: true } | { ok: false; code: MembershipDenial } {
  const { actorRole, actorUserId, targetUserId, targetRole, next, ownerCount } = input;
  const selfLeave = actorUserId === targetUserId && next === "remove";

  if (!selfLeave) {
    if (actorRole === "member") return { ok: false, code: "forbidden" };
    if (actorRole === "admin") {
      if (targetRole === "owner") return { ok: false, code: "cannot_touch_owner" };
      if (next === "owner") return { ok: false, code: "cannot_promote_to_owner" };
    }
  }

  if (next !== "remove" && next === targetRole) return { ok: false, code: "no_change" };

  if (targetRole === "owner" && ownerCount <= 1 && next !== "owner") {
    return { ok: false, code: "last_owner" };
  }

  return { ok: true };
}
