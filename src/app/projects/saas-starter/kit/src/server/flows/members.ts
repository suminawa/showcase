// このファイルは、SaaS スターター キットからの写しです。
// 直すときはキットの側を直してから、scripts/sync-saas-starter.mjs を走らせてください。
/**
 * メンバーの流れ（一覧・役割の変更・外す・自分で退会する）です。
 *
 * 判定は 2 段構えです。
 *   1. core/permissions の表（can）で、メンバーの管理そのものができない方を弾きます。
 *   2. core/permissions の canChangeMembership で、1 件ごとの決まりを確かめます
 *      （オーナーの方に触れるか、最後のオーナーが残るか、変更になっているか）。
 * この flow の中で役割の名前を見分けることはしません。
 */
import { ROLES, can, canChangeMembership, type Action, type Role } from "../../core/permissions";
import { validateChoice, validateText } from "../../core/validation";
import type { MemberView } from "../../ports";
import { flowFail, flowOk, type Ctx, type FlowResult } from "../context";

/** 利用者の ID の長さの上限（UUID でも fake の id でも収まる長さです） */
const ID_MAX = 100;

/**
 * 粗い関門です。表で「できない」とされている方（メンバー）をここで弾きます。
 * オーナーが相手のとき・オーナーに上げるときの判定は canChangeMembership に任せ、
 * cannot_touch_owner・cannot_promote_to_owner という具体的な符号でお返しします。
 */
function mayManageMembers(role: Role, action: Action): boolean {
  return can(action, { role, targetRole: "member" });
}

export async function listMembersFlow(input: { ctx: Ctx }): Promise<FlowResult<MemberView[]>> {
  // 一員であることは buildCtx が確かめています。一覧はどの役割の方にもお見せします
  const members = await input.ctx.ports.data.listMembers(input.ctx.organization.id);
  return flowOk(members);
}

export async function setMemberRoleFlow(input: {
  ctx: Ctx;
  raw: { userId: unknown; role: unknown };
}): Promise<FlowResult<{ userId: string; role: Role }>> {
  const userId = validateText(input.raw.userId, { field: "userId", min: 1, max: ID_MAX });
  const role = validateChoice<Role>(input.raw.role, ROLES, "role");
  if (!userId.ok || !role.ok) {
    return flowFail("invalid", [
      ...(userId.ok ? [] : userId.errors),
      ...(role.ok ? [] : role.errors),
    ]);
  }

  if (!mayManageMembers(input.ctx.role, "member:setRole")) return flowFail("forbidden");

  const target = await input.ctx.ports.data.getMembership(input.ctx.organization.id, userId.value);
  if (target === null) return flowFail("not_found");

  const verdict = canChangeMembership({
    actorRole: input.ctx.role,
    actorUserId: input.ctx.user.id,
    targetUserId: target.userId,
    targetRole: target.role,
    next: role.value,
    ownerCount: await input.ctx.ports.data.countOwners(input.ctx.organization.id),
  });
  if (!verdict.ok) return flowFail(verdict.code);

  // 書き込みは原子的な呼び出しに任せます。ここまでの判定と書き込みのあいだに
  // ほかのお申し付けが割り込んでも、オーナーが 0 人になることはありません。
  const outcome = await input.ctx.ports.data.changeMemberRole(
    input.ctx.organization.id,
    target.userId,
    role.value,
  );
  if (outcome !== "ok") return flowFail(outcome === "last_owner" ? "last_owner" : "not_found");

  return flowOk({ userId: target.userId, role: role.value });
}

export async function removeMemberFlow(input: {
  ctx: Ctx;
  raw: { userId: unknown };
}): Promise<FlowResult<{ userId: string }>> {
  const userId = validateText(input.raw.userId, { field: "userId", min: 1, max: ID_MAX });
  if (!userId.ok) return flowFail("invalid", userId.errors);

  if (!mayManageMembers(input.ctx.role, "member:remove")) return flowFail("forbidden");

  const target = await input.ctx.ports.data.getMembership(input.ctx.organization.id, userId.value);
  if (target === null) return flowFail("not_found");

  const verdict = canChangeMembership({
    actorRole: input.ctx.role,
    actorUserId: input.ctx.user.id,
    targetUserId: target.userId,
    targetRole: target.role,
    next: "remove",
    ownerCount: await input.ctx.ports.data.countOwners(input.ctx.organization.id),
  });
  if (!verdict.ok) return flowFail(verdict.code);

  const outcome = await input.ctx.ports.data.removeMemberGuarded(
    input.ctx.organization.id,
    target.userId,
  );
  if (outcome !== "ok") return flowFail(outcome === "last_owner" ? "last_owner" : "not_found");

  return flowOk({ userId: target.userId });
}

/** 自分で退会します。最後のオーナーは退会できません */
export async function leaveOrganizationFlow(input: {
  ctx: Ctx;
}): Promise<FlowResult<{ left: true }>> {
  const verdict = canChangeMembership({
    actorRole: input.ctx.role,
    actorUserId: input.ctx.user.id,
    targetUserId: input.ctx.user.id,
    targetRole: input.ctx.role,
    next: "remove",
    ownerCount: await input.ctx.ports.data.countOwners(input.ctx.organization.id),
  });
  if (!verdict.ok) return flowFail(verdict.code);

  const outcome = await input.ctx.ports.data.removeMemberGuarded(
    input.ctx.organization.id,
    input.ctx.user.id,
  );
  if (outcome !== "ok") return flowFail(outcome === "last_owner" ? "last_owner" : "not_found");

  return flowOk({ left: true } as const);
}
