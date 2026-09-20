// このファイルは、SaaS スターター キットからの写しです。
// 直すときはキットの側を直してから、scripts/sync-saas-starter.mjs を走らせてください。
/**
 * プロジェクトの流れ（一覧・作る・直す・消す）です。
 *
 * 読み書きはすべて「いまの組織」に絞って行います（ports の第 1 引数に組織の ID を渡します）。
 * その組織の一員かどうかは buildCtx が memberships を引き直して確かめており、
 * ここではそのうえで、役割ごとの可否を core/permissions の表 1 か所から決めます。
 */
import { can } from "../../core/permissions";
import { canCreateProject, projectLimitOf, projectQuota, type Quota } from "../../core/plans";
import { collect, validateText } from "../../core/validation";
import type { Project } from "../../ports";
import { flowFail, flowOk, type Ctx, type FlowResult } from "../context";

/** プロジェクトのお名前の長さの上限 */
export const PROJECT_NAME_MAX = 80;

/** メモの長さの上限（空でもかまいません） */
export const PROJECT_NOTE_MAX = 2000;

/** プロジェクトの ID の長さの上限（UUID でも fake の id でも収まる長さです） */
const ID_MAX = 100;

function validateProjectId(value: unknown) {
  return validateText(value, { field: "projectId", min: 1, max: ID_MAX });
}

function validateFields(raw: { name: unknown; note: unknown }) {
  return collect({
    name: validateText(raw.name, { field: "name", min: 1, max: PROJECT_NAME_MAX }),
    note: validateText(raw.note, { field: "note", min: 0, max: PROJECT_NOTE_MAX }),
  });
}

export async function listProjectsFlow(input: {
  ctx: Ctx;
}): Promise<FlowResult<{ projects: Project[]; quota: Quota }>> {
  if (!can("project:read", { role: input.ctx.role })) return flowFail("forbidden");

  const projects = await input.ctx.ports.data.listProjects(input.ctx.organization.id);

  // 一覧はこの組織の行だけなので、その件数がそのまま使用中の件数です。
  // 残り件数は、契約が止まっているときに無料へ落としたあとのプランで数えます。
  const quota = projectQuota(input.ctx.billing.plan, projects.length);
  return flowOk({ projects, quota });
}

export async function createProjectFlow(input: {
  ctx: Ctx;
  raw: { name: unknown; note: unknown };
}): Promise<FlowResult<Project>> {
  if (!can("project:create", { role: input.ctx.role })) return flowFail("forbidden");

  const checked = validateFields(input.raw);
  if (!checked.ok) return flowFail("invalid", checked.errors);

  const count = await input.ctx.ports.data.countProjects(input.ctx.organization.id);

  // 上限の判定は core/plans の 1 か所だけで行います。
  // ctx.billing.plan は、ご契約が止まっているときには無料のプランに落ちています
  // （すでにお作りいただいた分は消えず、新しくお作りになるときだけお止めします）。
  if (!canCreateProject(input.ctx.billing.plan, count)) return flowFail("plan_limit");

  // 数え直しと書き込みは 1 回の呼び出しにまとめています。
  // 上のご案内（残り何件か）はいまの件数で決めますが、実際に入るかどうかは
  // この呼び出しの中でもう一度数えて決めます
  // （2 件同時にお申し込みいただいても、上限を超えて入ることはありません）。
  const project = await input.ctx.ports.data.createProjectGuarded(
    {
      organizationId: input.ctx.organization.id,
      name: checked.value.name,
      note: checked.value.note,
      createdBy: input.ctx.user.id,
    },
    projectLimitOf(input.ctx.billing.plan),
  );
  if (project === "limit") return flowFail("plan_limit");

  return flowOk(project);
}

/** 直すのはどの役割の方でも行えます（表の project:update の行） */
export async function updateProjectFlow(input: {
  ctx: Ctx;
  raw: { projectId: unknown; name: unknown; note: unknown };
}): Promise<FlowResult<Project>> {
  if (!can("project:update", { role: input.ctx.role })) return flowFail("forbidden");

  const projectId = validateProjectId(input.raw.projectId);
  const checked = validateFields(input.raw);
  if (!projectId.ok || !checked.ok) {
    return flowFail("invalid", [
      ...(projectId.ok ? [] : projectId.errors),
      ...(checked.ok ? [] : checked.errors),
    ]);
  }

  // 別の組織の ID を渡されても、この組織の行しか引きません
  const existing = await input.ctx.ports.data.getProject(
    input.ctx.organization.id,
    projectId.value,
  );
  if (existing === null) return flowFail("not_found");

  const project = await input.ctx.ports.data.updateProject(
    input.ctx.organization.id,
    existing.id,
    { name: checked.value.name, note: checked.value.note },
  );
  return flowOk(project);
}

/** 消せるのはオーナーと管理者、メンバーはご自身がお作りになったものだけです */
export async function deleteProjectFlow(input: {
  ctx: Ctx;
  raw: { projectId: unknown };
}): Promise<FlowResult<{ projectId: string }>> {
  const projectId = validateProjectId(input.raw.projectId);
  if (!projectId.ok) return flowFail("invalid", projectId.errors);

  // 「どなたがお作りになったか」を知らないと判定できないため、先に行を引きます
  const existing = await input.ctx.ports.data.getProject(
    input.ctx.organization.id,
    projectId.value,
  );
  if (existing === null) return flowFail("not_found");

  // お作りになった方が退会されていると created_by は空です。
  // その行は「ご自身がお作りになったもの」には当たりません（メンバーの方は消せません）。
  const allowed = can("project:delete", {
    role: input.ctx.role,
    userId: input.ctx.user.id,
    resourceOwnerId: existing.createdBy ?? undefined,
  });
  if (!allowed) return flowFail("forbidden");

  await input.ctx.ports.data.deleteProject(input.ctx.organization.id, existing.id);
  return flowOk({ projectId: existing.id });
}
