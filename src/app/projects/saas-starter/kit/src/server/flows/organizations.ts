// このファイルは、SaaS スターター キットからの写しです。
// 直すときはキットの側を直してから、scripts/sync-saas-starter.mjs を走らせてください。
/**
 * 組織の流れ（作る・名前を変える・消す・切り替える）です。
 * 役割ごとの可否は core/permissions の表 1 か所から決めます。
 */
import { isLiveSubscription } from "../../core/billing-state";
import { can, type Role } from "../../core/permissions";
import { validateText } from "../../core/validation";
import type { Organization, Ports, SessionUser } from "../../ports";
import { flowFail, flowOk, type Ctx, type FlowResult, type UserCtx } from "../context";

/** お一人が入れる組織の数の上限（作りすぎを防ぐためです） */
export const MAX_ORGS_PER_USER = 10;

/** 組織のお名前の長さの上限 */
export const ORG_NAME_MAX = 60;

/** 組織の ID の長さの上限（UUID でも fake の id でも収まる長さです） */
const ID_MAX = 100;

/**
 * 組織のお名前を変えられるのは、権限の表の org:rename の行にあたる方
 * ＝オーナーと管理者です（この flow の中で役割の名前を見分けることはしません）。
 */
function mayRenameOrganization(role: Role): boolean {
  return can("org:rename", { role });
}

export async function createOrganizationFlow(input: {
  ctx: UserCtx;
  raw: { name: unknown };
}): Promise<FlowResult<Organization>> {
  const name = validateText(input.raw.name, { field: "name", min: 1, max: ORG_NAME_MAX });
  if (!name.ok) return flowFail("invalid", name.errors);

  // 数えるところと作るところを 1 回の呼び出しにまとめています
  // （2 つ同時にお作りになっても、上限を超えて入ることはありません）。
  const created = await input.ctx.ports.data.createOrganizationGuarded(
    { name: name.value, userId: input.ctx.user.id },
    MAX_ORGS_PER_USER,
  );
  if (created === "limit") return flowFail("forbidden");

  return flowOk(created);
}

export async function renameOrganizationFlow(input: {
  ctx: Ctx;
  raw: { name: unknown };
}): Promise<FlowResult<Organization>> {
  if (!mayRenameOrganization(input.ctx.role)) return flowFail("forbidden");

  const name = validateText(input.raw.name, { field: "name", min: 1, max: ORG_NAME_MAX });
  if (!name.ok) return flowFail("invalid", name.errors);

  const organization = await input.ctx.ports.data.renameOrganization(
    input.ctx.organization.id,
    name.value,
  );
  return flowOk(organization);
}

export async function deleteOrganizationFlow(input: {
  ctx: Ctx;
  raw: { confirmName: unknown };
}): Promise<FlowResult<{ deleted: true }>> {
  if (!can("org:delete", { role: input.ctx.role })) return flowFail("forbidden");

  // お名前を一字一句そのままご入力いただいたときだけ消します
  const confirmName = validateText(input.raw.confirmName, {
    field: "confirmName",
    min: 1,
    max: ORG_NAME_MAX,
  });
  if (!confirmName.ok || confirmName.value !== input.ctx.organization.name) {
    return flowFail("invalid", [{ field: "confirmName", code: "bad_choice" }]);
  }

  // ご契約が残ったまま組織を消すと、お支払いだけが続いてしまいます。
  // 先にプランのご解約をお済ませいただくようお願いします。
  if (isLiveSubscription(input.ctx.billing.status)) return flowFail("has_subscription");

  await input.ctx.ports.data.deleteOrganization(input.ctx.organization.id);
  return flowOk({ deleted: true } as const);
}

export async function listOrganizationsFlow(input: {
  ports: Ports;
  user: SessionUser;
}): Promise<FlowResult<{ organization: Organization; role: Role }[]>> {
  const rows = await input.ports.data.listOrganizationsForUser(input.user.id);
  return flowOk(rows);
}

export async function switchOrganizationFlow(input: {
  ports: Ports;
  user: SessionUser;
  raw: { organizationId: unknown };
}): Promise<FlowResult<{ organizationId: string }>> {
  const organizationId = validateText(input.raw.organizationId, {
    field: "organizationId",
    min: 1,
    max: ID_MAX,
  });
  if (!organizationId.ok) return flowFail("invalid", organizationId.errors);

  // 送られてきた組織の ID を信用せず、memberships を引き直します
  const membership = await input.ports.data.getMembership(organizationId.value, input.user.id);
  if (membership === null) return flowFail("not_found");

  return flowOk({ organizationId: membership.organizationId });
}
