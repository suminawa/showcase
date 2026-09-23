import { describe, expect, it } from "vitest";

import ja from "../kit/messages/ja.json";
import { hashInviteToken } from "../kit/src/core/invitations";
import type { Messages } from "../kit/src/core/i18n";
import { billingOverviewFlow, startCheckoutFlow } from "../kit/src/server/flows/billing";
import {
  createInvitationFlow,
  listInvitationsFlow,
} from "../kit/src/server/flows/invitations";
import {
  createProjectFlow,
  deleteProjectFlow,
  listProjectsFlow,
} from "../kit/src/server/flows/projects";
import { DEMO_SITE_ORIGIN, DemoWorld } from "./world";

const messages = ja as Messages;

async function signedIn(userId: string): Promise<DemoWorld> {
  const world = new DemoWorld();
  expect(await world.signInAs(userId)).toBe(true);
  return world;
}

/** その方の ctx。見つからないときはテストをそこで落とす */
async function ctxOf(world: DemoWorld) {
  const ctx = await world.ctx("ja");
  if (ctx === null) throw new Error("ctx が作れませんでした");
  return ctx;
}

describe("見本の入り口", () => {
  it("見本の 3 人だけがお入りになれる", async () => {
    const world = new DemoWorld();
    expect(await world.signInAs("u-owner")).toBe(true);
    expect(await world.signInAs("u-nobody")).toBe(false);
    expect(await world.signInAs(null)).toBe(false);
  });

  it("入られた方の役割が、その組織のものになる", async () => {
    expect((await ctxOf(await signedIn("u-owner"))).role).toBe("owner");
    expect((await ctxOf(await signedIn("u-admin"))).role).toBe("admin");
    expect((await ctxOf(await signedIn("u-member"))).role).toBe("member");
  });

  it("はじめの組織は「しおさい設計室」で、プロジェクトは 2 件", async () => {
    const ctx = await ctxOf(await signedIn("u-owner"));
    expect(ctx.organization.name).toBe("しおさい設計室");

    const listed = await listProjectsFlow({ ctx });
    expect(listed.ok && listed.value.projects).toHaveLength(2);
  });
});

describe("プランの上限", () => {
  it("無料のプランは 3 件で止まる", async () => {
    const world = await signedIn("u-owner");

    const third = await createProjectFlow({
      ctx: await ctxOf(world),
      raw: { name: "パンフレットの増刷", note: "" },
    });
    expect(third.ok).toBe(true);

    const fourth = await createProjectFlow({
      ctx: await ctxOf(world),
      raw: { name: "4 件目", note: "" },
    });
    expect(fourth.ok).toBe(false);
    expect(fourth.ok === false && fourth.code).toBe("plan_limit");

    const listed = await listProjectsFlow({ ctx: await ctxOf(world) });
    expect(listed.ok && listed.value.quota.atLimit).toBe(true);
    expect(listed.ok && listed.value.quota.limit).toBe(3);
  });

  it("偽のお支払いのあとは、上限が 50 件になる", async () => {
    const world = await signedIn("u-owner");

    const before = await billingOverviewFlow({ ctx: await ctxOf(world) });
    expect(before.ok && before.value.quota.limit).toBe(3);
    expect(before.ok && before.value.canStartCheckout).toBe(true);

    // 画面の押しどころと同じ順です（flow が通してから、偽のお支払いに進みます）
    const allowed = await startCheckoutFlow({
      ctx: await ctxOf(world),
      raw: { planId: "standard" },
    });
    expect(allowed.ok).toBe(true);

    const ctx = await ctxOf(world);
    await world.completeCheckout(ctx.organization.id, "standard", new Date());

    const after = await billingOverviewFlow({ ctx: await ctxOf(world) });
    expect(after.ok && after.value.quota.limit).toBe(50);
    expect(after.ok && after.value.state.planId).toBe("standard");
    // ご契約が続いているあいだは、お申し込みのボタンをお出ししません
    expect(after.ok && after.value.canStartCheckout).toBe(false);

    const fourth = await createProjectFlow({
      ctx: await ctxOf(world),
      raw: { name: "4 件目", note: "" },
    });
    expect(fourth.ok).toBe(true);
  });

  it("ご解約のあとは、無料のプランの上限に戻る", async () => {
    const world = await signedIn("u-owner");
    const organizationId = (await ctxOf(world)).organization.id;

    await world.completeCheckout(organizationId, "standard", new Date());
    await world.cancelSubscription(organizationId, new Date());

    const after = await billingOverviewFlow({ ctx: await ctxOf(world) });
    expect(after.ok && after.value.quota.limit).toBe(3);
    expect(after.ok && after.value.state.planId).toBe("free");
  });

  it("お支払いのお手続きは、オーナー以外にはお出ししない", async () => {
    const member = await billingOverviewFlow({ ctx: await ctxOf(await signedIn("u-member")) });
    expect(member.ok && member.value.canManage).toBe(false);
    expect(member.ok && member.value.canStartCheckout).toBe(false);

    const blocked = await startCheckoutFlow({
      ctx: await ctxOf(await signedIn("u-admin")),
      raw: { planId: "standard" },
    });
    expect(blocked.ok === false && blocked.code).toBe("forbidden");
  });
});

describe("プロジェクトを消せる方", () => {
  it("メンバーは、他の方がお作りになったものを消せない", async () => {
    const world = await signedIn("u-member");
    const ctx = await ctxOf(world);

    const listed = await listProjectsFlow({ ctx });
    if (!listed.ok) throw new Error("一覧が引けませんでした");

    // 見本の 2 件は、オーナーと管理者がお作りになったものです
    for (const project of listed.value.projects) {
      const result = await deleteProjectFlow({ ctx, raw: { projectId: project.id } });
      expect(result.ok === false && result.code).toBe("forbidden");
    }

    const after = await listProjectsFlow({ ctx: await ctxOf(world) });
    expect(after.ok && after.value.projects).toHaveLength(2);
  });

  it("メンバーは、ご自身がお作りになったものなら消せる", async () => {
    const world = await signedIn("u-member");

    const created = await createProjectFlow({
      ctx: await ctxOf(world),
      raw: { name: "打ち合わせの記録", note: "" },
    });
    if (!created.ok) throw new Error("作れませんでした");

    const result = await deleteProjectFlow({
      ctx: await ctxOf(world),
      raw: { projectId: created.value.id },
    });
    expect(result.ok).toBe(true);
  });

  it("オーナーは、他の方がお作りになったものも消せる", async () => {
    const world = await signedIn("u-owner");
    const listed = await listProjectsFlow({ ctx: await ctxOf(world) });
    if (!listed.ok) throw new Error("一覧が引けませんでした");

    const byAdmin = listed.value.projects.find((project) => project.createdBy === "u-admin");
    if (byAdmin === undefined) throw new Error("管理者がお作りになった行がありません");

    const result = await deleteProjectFlow({
      ctx: await ctxOf(world),
      raw: { projectId: byAdmin.id },
    });
    expect(result.ok).toBe(true);
  });
});

describe("ご招待", () => {
  it("リンクは、お作りしたその 1 回だけ出る", async () => {
    const world = await signedIn("u-owner");

    const created = await createInvitationFlow({
      ctx: await ctxOf(world),
      raw: { email: "sekkei@example.com", role: "member" },
      limiter: world.inviteLimiter,
      messages,
    });
    if (!created.ok) throw new Error("ご招待が作れませんでした");

    expect(created.value.url.startsWith(`${DEMO_SITE_ORIGIN}/invite/`)).toBe(true);

    // 表に入っているのはハッシュだけです。あとから一覧を引いても、リンクは出てきません
    const token = created.value.url.slice(`${DEMO_SITE_ORIGIN}/invite/`.length);
    expect(created.value.invitation.tokenHash).toBe(hashInviteToken(token));

    const listed = await listInvitationsFlow({ ctx: await ctxOf(world) });
    if (!listed.ok) throw new Error("一覧が引けませんでした");
    expect(listed.value).toHaveLength(1);

    const row = JSON.stringify(listed.value[0]);
    expect(row.includes(token)).toBe(false);
    expect(Object.keys(listed.value[0])).not.toContain("url");
  });

  it("メンバーには、ご招待の欄そのものが出ない", async () => {
    const world = await signedIn("u-member");

    const listed = await listInvitationsFlow({ ctx: await ctxOf(world) });
    expect(listed.ok === false && listed.code).toBe("forbidden");

    const created = await createInvitationFlow({
      ctx: await ctxOf(world),
      raw: { email: "sekkei@example.com", role: "member" },
      limiter: world.inviteLimiter,
      messages,
    });
    expect(created.ok === false && created.code).toBe("forbidden");
  });

  it("管理者は、オーナーとしてお招きできない", async () => {
    const world = await signedIn("u-admin");

    const created = await createInvitationFlow({
      ctx: await ctxOf(world),
      raw: { email: "sekkei@example.com", role: "owner" },
      limiter: world.inviteLimiter,
      messages,
    });
    expect(created.ok === false && created.code).toBe("forbidden");
  });

  it("宛先の候補は、どれも example.com あてになっている", async () => {
    const { DEMO_INVITE_EMAILS } = await import("./world");
    for (const email of DEMO_INVITE_EMAILS) {
      expect(email.endsWith("@example.com")).toBe(true);
    }
  });
});

describe("見本の世界は、タブの中だけで閉じている", () => {
  it("作り直せば、はじめの見本に戻る", async () => {
    const world = await signedIn("u-owner");
    await createProjectFlow({
      ctx: await ctxOf(world),
      raw: { name: "消えるはずの 1 件", note: "" },
    });

    const fresh = await signedIn("u-owner");
    const listed = await listProjectsFlow({ ctx: await ctxOf(fresh) });
    expect(listed.ok && listed.value.projects).toHaveLength(2);
  });
});
