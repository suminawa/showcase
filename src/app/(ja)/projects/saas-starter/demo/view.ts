/**
 * 画面にお出しする一式を、flow から読み直します。
 *
 * キットでは、画面ごとにサーバー部品がそれぞれ flow を呼びますが、
 * 見本は中身がすべてこのタブの中にあるので、1 回でまとめて読み直します。
 * **読む先は flow だけです。**つなぎ役（表）を直に覗くことはしません。
 */
import type { BillingState } from "../kit/src/core/billing-state";
import type { Lang } from "../kit/src/core/i18n";
import type { Role } from "../kit/src/core/permissions";
import type { PublicPlan, Quota } from "../kit/src/core/plans";
import type {
  InvitationRow,
  MemberView,
  Organization,
  Project,
  SessionUser,
} from "../kit/src/ports";
import type { Ctx } from "../kit/src/server/context";
import { billingOverviewFlow } from "../kit/src/server/flows/billing";
import { listInvitationsFlow } from "../kit/src/server/flows/invitations";
import { listMembersFlow } from "../kit/src/server/flows/members";
import { listOrganizationsFlow } from "../kit/src/server/flows/organizations";
import { listProjectsFlow } from "../kit/src/server/flows/projects";
import type { DemoUser, DemoWorld } from "./world";

export type Billing = {
  state: BillingState;
  quota: Quota;
  plans: PublicPlan[];
  canManage: boolean;
  canStartCheckout: boolean;
};

export type View = {
  demoUsers: DemoUser[];
  user: SessionUser | null;
  ctx: Ctx | null;
  organizations: { organization: Organization; role: Role }[];
  projects: Project[];
  quota: Quota | null;
  members: MemberView[];
  /** 招待の一覧をご覧になれない役割のときは null です（flow がそう答えます） */
  invitations: InvitationRow[] | null;
  billing: Billing | null;
};

export async function loadView(world: DemoWorld, lang: Lang): Promise<View> {
  const demoUsers = await world.demoUsers();
  const user = await world.user();
  const ctx = user === null ? null : await world.ctx(lang);

  if (ctx === null) {
    return {
      demoUsers,
      user,
      ctx: null,
      organizations: [],
      projects: [],
      quota: null,
      members: [],
      invitations: null,
      billing: null,
    };
  }

  const [organizations, projects, members, invitations, billing] = await Promise.all([
    listOrganizationsFlow({ ports: ctx.ports, user: ctx.user }),
    listProjectsFlow({ ctx }),
    listMembersFlow({ ctx }),
    listInvitationsFlow({ ctx }),
    billingOverviewFlow({ ctx }),
  ]);

  return {
    demoUsers,
    user,
    ctx,
    organizations: organizations.ok ? organizations.value : [],
    projects: projects.ok ? projects.value.projects : [],
    quota: projects.ok ? projects.value.quota : null,
    members: members.ok ? members.value : [],
    invitations: invitations.ok ? invitations.value : null,
    billing: billing.ok ? billing.value : null,
  };
}
