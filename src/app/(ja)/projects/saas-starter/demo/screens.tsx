"use client";

/**
 * 額の中の画面です。手本はキットの app/ の各ページで、同じ文（messages の鍵）と
 * 同じ流れ（flows）で組んでいます。
 *
 * **役割ごとの違いを、この中で if で分けることはしません。**
 * 出す・出さないは core/permissions の表（can）に尋ね、押されたあとの可否は flow が決めます。
 * 見本とサーバーが同じ表を見ているので、答えが食い違うことはありません。
 */
import { useId, type ReactNode } from "react";

import { formatDate, formatYen, t, type Lang, type Messages } from "../kit/src/core/i18n";
import { can, type Role } from "../kit/src/core/permissions";
import { findPlan, isPlanId, projectLimitOf, type PlanId } from "../kit/src/core/plans";
import type { StripeStatus } from "../kit/src/core/billing-state";
import { toActionState, type ActionState } from "../kit/src/server/context";
import {
  openPortalFlow,
  startCheckoutFlow,
} from "../kit/src/server/flows/billing";
import {
  createInvitationFlow,
  inviteNoticeKey,
  revokeInvitationFlow,
} from "../kit/src/server/flows/invitations";
import { removeMemberFlow, setMemberRoleFlow } from "../kit/src/server/flows/members";
import { ORG_NAME_MAX, renameOrganizationFlow } from "../kit/src/server/flows/organizations";
import {
  PROJECT_NAME_MAX,
  PROJECT_NOTE_MAX,
  createProjectFlow,
  deleteProjectFlow,
  updateProjectFlow,
} from "../kit/src/server/flows/projects";
import { ActionForm, type DemoAction } from "./ActionForm";
import {
  Banner,
  Field,
  Nav,
  RoleBadge,
  SubmitButton,
  TextButton,
  Toast,
  type FieldOption,
} from "./parts";
import { mainTabOf, settingsTabOf, type Route } from "./paths";
import type { View } from "./view";
import { DEMO_INVITE_EMAILS, type DemoWorld } from "./world";
import app from "./app.module.css";
import auth from "./auth.module.css";
import ui from "./ui.module.css";

export type ScreenProps = {
  view: View;
  messages: Messages;
  lang: Lang;
  world: DemoWorld;
  route: Route;
  /** 読み直しをお願いします（お申し付けが表を変えたあとに呼びます） */
  refresh: () => void;
  go: (route: Route) => void;
};

/** 入っていらっしゃらないときのお返事です（flow と同じ符号でお伝えします） */
const NOT_SIGNED_IN: ActionState = { status: "error", messageKey: "error.unauthenticated" };

/* ========================================================================== */
/* ログイン                                                                    */
/* ========================================================================== */

export function LoginScreen({ view, messages, world, refresh, go }: ScreenProps): ReactNode {
  const signIn: DemoAction = async (form) => {
    const entered = await world.signInAs(form.get("userId"));
    if (!entered) return { status: "error", messageKey: "error.invalid" };

    refresh();
    go({ name: "overview" });
    return { status: "ok" };
  };

  return (
    <main className={ui.centered}>
      <div className={ui.centeredWrap}>
        <span className={auth.brand}>{t(messages, "common.appName")}</span>

        <div className={ui.panel}>
          <h1 className={auth.title}>{t(messages, "auth.login.title")}</h1>
          <p className={auth.lead}>{t(messages, "auth.demo.hint")}</p>

          <section className={`${auth.demo} ${auth.form}`}>
            <h2 className={ui.sectionTitle}>{t(messages, "auth.demo.title")}</h2>
            <ActionForm
              action={signIn}
              messages={messages}
              className={auth.demoList}
              label={t(messages, "auth.demo.title")}
            >
              {view.demoUsers.map((demoUser) => (
                <SubmitButton
                  key={demoUser.id}
                  name="userId"
                  value={demoUser.id}
                  className={auth.demoButton}
                >
                  <span className={auth.demoName}>
                    {demoUser.name}
                    <span className={auth.demoMail}>{demoUser.email}</span>
                  </span>
                  {demoUser.role === null ? null : (
                    <RoleBadge role={demoUser.role} messages={messages} />
                  )}
                </SubmitButton>
              ))}
            </ActionForm>
          </section>
        </div>

        <p className={auth.omitted}>{t(messages, "demo.login.omitted")}</p>
      </div>
    </main>
  );
}

/* ========================================================================== */
/* ログインしてお使いいただく画面の枠                                            */
/* ========================================================================== */

export function AppShell({
  view,
  messages,
  world,
  route,
  refresh,
  go,
  children,
}: ScreenProps & { children: ReactNode }): ReactNode {
  const switchId = useId();
  const ctx = view.ctx;
  if (ctx === null) return null;

  const signOut: DemoAction = async () => {
    await world.signOut();
    refresh();
    go({ name: "login" });
    return { status: "ok" };
  };

  const switchOrganization: DemoAction = async (form) => {
    const chosen = form.get("organizationId");
    const moved = typeof chosen === "string" && (await world.useOrganization(chosen));
    if (!moved) return { status: "error", messageKey: "error.not_found" };

    refresh();
    go({ name: "overview" });
    return { status: "ok" };
  };

  return (
    <div className={app.shell}>
      <header className={app.topbar}>
        <div className={`${app.topbarInner} ${app.topbarRow}`}>
          <button type="button" className={app.brand} onClick={() => go({ name: "overview" })}>
            {t(messages, "common.appName")}
          </button>
          <div className={app.account}>
            <span className={app.accountName}>{ctx.user.name}</span>
            <ActionForm action={signOut} messages={messages}>
              <SubmitButton tone="quiet" size="small">
                {t(messages, "nav.signout")}
              </SubmitButton>
            </ActionForm>
          </div>
        </div>

        <div className={`${app.topbarInner} ${app.topbarRow}`}>
          <Nav
            label={t(messages, "nav.label")}
            current={mainTabOf(route)}
            onSelect={(id) =>
              go(
                id === "projects"
                  ? { name: "projects" }
                  : id === "settings"
                    ? { name: "organization" }
                    : { name: "overview" },
              )
            }
            items={[
              { id: "overview", label: t(messages, "nav.overview") },
              { id: "projects", label: t(messages, "nav.projects") },
              { id: "settings", label: t(messages, "nav.settings") },
            ]}
          />

          {view.organizations.length <= 1 ? (
            <span className={app.orgName}>{ctx.organization.name}</span>
          ) : (
            <ActionForm
              action={switchOrganization}
              messages={messages}
              className={app.orgSwitch}
              label={t(messages, "organization.switch")}
            >
              <label className={ui.visuallyHidden} htmlFor={switchId}>
                {t(messages, "organization.switch")}
              </label>
              <select
                id={switchId}
                name="organizationId"
                className={app.orgSelect}
                defaultValue={ctx.organization.id}
              >
                {view.organizations.map((row) => (
                  <option key={row.organization.id} value={row.organization.id}>
                    {row.organization.name}
                  </option>
                ))}
              </select>
              <SubmitButton size="small">{t(messages, "organization.switchSubmit")}</SubmitButton>
            </ActionForm>
          )}
        </div>
      </header>

      <main className={app.main}>
        <Banner
          banner={ctx.billing.banner}
          messages={messages}
          onSeeBilling={() => go({ name: "billing" })}
        />
        {children}
      </main>
    </div>
  );
}

/* ========================================================================== */
/* 見渡し                                                                      */
/* ========================================================================== */

/** 何件お使いかの帯です（残りが無いときだけ、色が変わります） */
function usageWidth(used: number, limit: number): string {
  if (limit <= 0) return "100%";
  return `${Math.min(100, Math.round((used / limit) * 100))}%`;
}

export function OverviewScreen({ view, messages, go }: ScreenProps): ReactNode {
  const ctx = view.ctx;
  if (ctx === null || view.billing === null) return null;

  const quota = view.quota;
  const recent = view.projects.slice(0, 3);
  const planName = t(messages, view.billing.state.plan.nameKey);
  const periodEnd = ctx.billing.currentPeriodEnd;

  return (
    <>
      <div className={app.head}>
        <div className={app.headRow}>
          <h1 className={app.title}>{ctx.organization.name}</h1>
          <RoleBadge role={ctx.role} messages={messages} />
        </div>
        <p className={app.lead}>{t(messages, "overview.lead")}</p>
      </div>

      <div className={app.sections}>
        <section className={`${ui.card} ${ui.stack}`}>
          <div className={ui.rowBetween}>
            <h2 className={ui.cardTitle}>{t(messages, "overview.usageTitle")}</h2>
            <TextButton onClick={() => go({ name: "projects" })}>
              {t(messages, "overview.toProjects")}
            </TextButton>
          </div>

          <div>
            <div className={app.usage}>
              <p className={app.usageFigure}>
                {quota === null ? 0 : quota.used}
                <span className={app.usageOf}>
                  {quota === null || quota.unlimited
                    ? t(messages, "plan.limitNone")
                    : t(messages, "overview.ofLimit", { limit: quota.limit })}
                </span>
              </p>
              <p className={ui.muted}>{t(messages, "overview.planNow", { plan: planName })}</p>
            </div>

            <div className={app.meter}>
              <span
                className={
                  quota !== null && quota.atLimit
                    ? `${app.meterFill} ${app.meterFillFull}`
                    : app.meterFill
                }
                style={{
                  width:
                    quota === null || quota.unlimited
                      ? "100%"
                      : usageWidth(quota.used, quota.limit),
                }}
              />
            </div>
          </div>

          {quota !== null && quota.atLimit ? (
            <p className={`${ui.notice} ${ui.noticeWarn}`}>
              <span className={ui.noticeBody}>
                <span>{t(messages, "project.limitReached")}</span>
                <TextButton onClick={() => go({ name: "billing" })}>
                  {t(messages, "project.seePlans")}
                </TextButton>
              </span>
            </p>
          ) : null}
        </section>

        <section className={`${ui.card} ${ui.stack}`}>
          <h2 className={ui.cardTitle}>{t(messages, "overview.factsTitle")}</h2>
          <dl className={app.facts}>
            <div className={app.fact}>
              <dt className={app.factTerm}>{t(messages, "overview.factPlan")}</dt>
              <dd className={app.factValue}>{planName}</dd>
            </div>
            <div className={app.fact}>
              <dt className={app.factTerm}>{t(messages, "overview.factMembers")}</dt>
              <dd className={app.factValue}>
                {t(messages, "overview.memberCount", { count: view.members.length })}
              </dd>
            </div>
            <div className={app.fact}>
              <dt className={app.factTerm}>{t(messages, "overview.factPeriodEnd")}</dt>
              <dd className={app.factValue}>
                {periodEnd === null ? t(messages, "common.none") : formatDate(periodEnd, ctx.lang)}
              </dd>
            </div>
          </dl>
        </section>

        <section className={`${ui.card} ${ui.stack}`}>
          <div className={ui.rowBetween}>
            <h2 className={ui.cardTitle}>{t(messages, "overview.recentTitle")}</h2>
            <TextButton onClick={() => go({ name: "projects" })}>
              {t(messages, "overview.toProjects")}
            </TextButton>
          </div>

          {recent.length === 0 ? (
            <div className={ui.empty}>
              <p className={ui.emptyTitle}>{t(messages, "project.emptyTitle")}</p>
              <p className={ui.emptyHint}>{t(messages, "project.emptyHint")}</p>
              <p>
                <button
                  type="button"
                  className={`${ui.button} ${ui.small} ${ui.linkButton}`}
                  onClick={() => go({ name: "projects" })}
                >
                  {t(messages, "project.createFirst")}
                </button>
              </p>
            </div>
          ) : (
            <ul className={ui.rows}>
              {recent.map((project) => (
                <li className={ui.rowItem} key={project.id}>
                  <span className={ui.rowMain}>
                    <span className={ui.rowName}>{project.name}</span>
                    <span className={ui.rowMeta}>
                      {t(messages, "project.updatedAt", {
                        date: formatDate(project.updatedAt, ctx.lang),
                      })}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

/* ========================================================================== */
/* プロジェクト                                                                */
/* ========================================================================== */

export function ProjectsScreen({ view, messages, world, refresh, go }: ScreenProps): ReactNode {
  const ctx = view.ctx;
  const quota = view.quota;
  if (ctx === null || quota === null) return null;

  const nameOf = new Map(view.members.map((member) => [member.userId, member.name]));

  const create: DemoAction = async (form) => {
    const current = await world.ctx(ctx.lang);
    if (current === null) return NOT_SIGNED_IN;

    const result = await createProjectFlow({
      ctx: current,
      raw: { name: form.get("name"), note: form.get("note") },
    });
    if (result.ok) refresh();

    return toActionState(result, "project.created", form);
  };

  const update: DemoAction = async (form) => {
    const current = await world.ctx(ctx.lang);
    if (current === null) return NOT_SIGNED_IN;

    const result = await updateProjectFlow({
      ctx: current,
      raw: {
        projectId: form.get("projectId"),
        name: form.get("name"),
        note: form.get("note"),
      },
    });
    if (result.ok) refresh();

    return toActionState(result, "project.saved", form);
  };

  const remove: DemoAction = async (form) => {
    const current = await world.ctx(ctx.lang);
    if (current === null) return NOT_SIGNED_IN;

    const result = await deleteProjectFlow({
      ctx: current,
      raw: { projectId: form.get("projectId") },
    });
    if (result.ok) refresh();

    return toActionState(result, "project.deleted", form);
  };

  return (
    <>
      <div className={app.head}>
        <h1 className={app.title}>{t(messages, "project.title")}</h1>
        <p className={app.lead}>
          {quota.unlimited
            ? t(messages, "project.countUnlimited", { used: quota.used })
            : t(messages, "project.count", { used: quota.used, limit: quota.limit })}
        </p>
      </div>

      <div className={app.sections}>
        <section className={`${ui.card} ${ui.stack}`}>
          <h2 className={ui.cardTitle}>{t(messages, "project.createTitle")}</h2>
          {quota.atLimit ? (
            <p className={`${ui.notice} ${ui.noticeWarn}`}>
              <span className={ui.noticeBody}>
                <span>{t(messages, "project.limitReached")}</span>
                <TextButton onClick={() => go({ name: "billing" })}>
                  {t(messages, "project.seePlans")}
                </TextButton>
              </span>
            </p>
          ) : (
            <ActionForm
              action={create}
              messages={messages}
              className={ui.stack}
              label={t(messages, "project.createTitle")}
            >
              <Field
                name="name"
                label={t(messages, "field.projectName")}
                maxLength={PROJECT_NAME_MAX}
                required
              />
              <Field
                name="note"
                kind="textarea"
                label={t(messages, "field.note")}
                hint={t(messages, "project.noteHint")}
                maxLength={PROJECT_NOTE_MAX}
              />
              <div className={ui.row}>
                <SubmitButton tone="primary">{t(messages, "project.createSubmit")}</SubmitButton>
              </div>
            </ActionForm>
          )}
        </section>

        {view.projects.length === 0 ? (
          <div className={ui.empty}>
            <p className={ui.emptyTitle}>{t(messages, "project.emptyTitle")}</p>
            <p className={ui.emptyHint}>{t(messages, "project.emptyHint")}</p>
          </div>
        ) : (
          <ul className={ui.rows}>
            {view.projects.map((project) => {
              // お作りになった方が退会されていると、作成者の欄は空です。
              // その行は「ご自身がお作りになったもの」には当たりません。
              const mayDelete = can("project:delete", {
                role: ctx.role,
                userId: ctx.user.id,
                resourceOwnerId: project.createdBy ?? undefined,
              });
              const creatorName =
                project.createdBy === null
                  ? t(messages, "project.creatorLeft")
                  : (nameOf.get(project.createdBy) ?? "");

              return (
                <li key={project.id}>
                  <div className={ui.rowItem}>
                    <span className={ui.rowMain}>
                      <span className={ui.rowName}>{project.name}</span>
                      {project.note === "" ? null : (
                        <span className={ui.rowMeta}>{project.note}</span>
                      )}
                      <span className={ui.rowMeta}>
                        {t(messages, "project.meta", {
                          name: creatorName,
                          date: formatDate(project.updatedAt, ctx.lang),
                        })}
                      </span>
                    </span>
                  </div>

                  <details className={ui.disclosure}>
                    <summary className={ui.summary}>{t(messages, "project.edit")}</summary>
                    <div className={`${ui.disclosureBody} ${ui.stack}`}>
                      <ActionForm
                        action={update}
                        messages={messages}
                        className={ui.stack}
                        label={t(messages, "project.edit")}
                      >
                        <input type="hidden" name="projectId" value={project.id} />
                        <Field
                          name="name"
                          label={t(messages, "field.projectName")}
                          defaultValue={project.name}
                          maxLength={PROJECT_NAME_MAX}
                          required
                        />
                        <Field
                          name="note"
                          kind="textarea"
                          label={t(messages, "field.note")}
                          defaultValue={project.note}
                          maxLength={PROJECT_NOTE_MAX}
                        />
                        <div className={ui.row}>
                          <SubmitButton tone="primary" size="small">
                            {t(messages, "common.save")}
                          </SubmitButton>
                        </div>
                      </ActionForm>

                      {mayDelete ? (
                        <ActionForm
                          action={remove}
                          messages={messages}
                          className={ui.stackTight}
                          label={t(messages, "project.delete")}
                        >
                          <input type="hidden" name="projectId" value={project.id} />
                          <p className={ui.hint}>{t(messages, "project.deleteHint")}</p>
                          <div className={ui.row}>
                            <SubmitButton tone="danger" size="small">
                              {t(messages, "project.delete")}
                            </SubmitButton>
                          </div>
                        </ActionForm>
                      ) : (
                        <p className={ui.hint}>{t(messages, "project.deleteForbidden")}</p>
                      )}
                    </div>
                  </details>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}

/* ========================================================================== */
/* 設定の行き来                                                                */
/* ========================================================================== */

export function SettingsNav({ messages, route, go }: ScreenProps): ReactNode {
  return (
    <Nav
      tone="sub"
      label={t(messages, "settings.navLabel")}
      current={settingsTabOf(route)}
      onSelect={(id) => go(id === "billing" ? { name: "billing" } : { name: "organization" })}
      items={[
        { id: "organization", label: t(messages, "settings.organization") },
        { id: "billing", label: t(messages, "settings.billing") },
      ]}
    />
  );
}

/* ========================================================================== */
/* 組織の設定                                                                  */
/* ========================================================================== */

export function OrganizationScreen({ view, messages, world, refresh }: ScreenProps): ReactNode {
  const ctx = view.ctx;
  if (ctx === null) return null;

  const mayRename = can("org:rename", { role: ctx.role });
  const mayInvite = can("member:invite", { role: ctx.role, targetRole: "member" });

  // お選びいただける役割も、表に尋ねます（管理者の方には「オーナー」が並びません）
  const allRoles: { value: Role; label: string }[] = [
    { value: "member", label: t(messages, "role.member") },
    { value: "admin", label: t(messages, "role.admin") },
    { value: "owner", label: t(messages, "role.owner") },
  ];
  const roleOptions: FieldOption[] = allRoles.filter((option) =>
    can("member:setRole", { role: ctx.role, targetRole: option.value }),
  );
  const inviteRoleOptions: FieldOption[] = allRoles.filter((option) =>
    can("member:invite", { role: ctx.role, targetRole: option.value }),
  );

  const emailOptions: FieldOption[] = DEMO_INVITE_EMAILS.map((email) => ({
    value: email,
    label: email,
  }));

  const pending = (view.invitations ?? []).filter(
    (invitation) => invitation.status === "pending",
  );

  const rename: DemoAction = async (form) => {
    const current = await world.ctx(ctx.lang);
    if (current === null) return NOT_SIGNED_IN;

    const result = await renameOrganizationFlow({ ctx: current, raw: { name: form.get("name") } });
    if (result.ok) refresh();

    return toActionState(result, "organization.saved", form);
  };

  const setRole: DemoAction = async (form) => {
    const current = await world.ctx(ctx.lang);
    if (current === null) return NOT_SIGNED_IN;

    const result = await setMemberRoleFlow({
      ctx: current,
      raw: { userId: form.get("userId"), role: form.get("role") },
    });
    if (result.ok) refresh();

    return toActionState(result, "member.roleChanged", form);
  };

  const removeMember: DemoAction = async (form) => {
    const current = await world.ctx(ctx.lang);
    if (current === null) return NOT_SIGNED_IN;

    const result = await removeMemberFlow({ ctx: current, raw: { userId: form.get("userId") } });
    if (result.ok) refresh();

    return toActionState(result, "member.removed", form);
  };

  const invite: DemoAction = async (form) => {
    const current = await world.ctx(ctx.lang);
    if (current === null) return NOT_SIGNED_IN;

    const result = await createInvitationFlow({
      ctx: current,
      raw: { email: form.get("email"), role: form.get("role") },
      limiter: world.inviteLimiter,
      messages,
    });
    if (!result.ok) return toActionState(result, undefined, form);

    refresh();

    // お作りしたリンクは、この 1 回だけお出しします
    // （表に残るのはハッシュだけで、あとからお出しすることはできません）。
    return {
      status: "ok",
      messageKey: inviteNoticeKey(result.value),
      value: result.value.url,
    };
  };

  const revoke: DemoAction = async (form) => {
    const current = await world.ctx(ctx.lang);
    if (current === null) return NOT_SIGNED_IN;

    const result = await revokeInvitationFlow({
      ctx: current,
      raw: { invitationId: form.get("invitationId") },
    });
    if (result.ok) refresh();

    return toActionState(result, "invite.revoked", form);
  };

  return (
    <>
      <div className={app.head}>
        <h1 className={app.title}>{t(messages, "settings.organizationTitle")}</h1>
        <p className={app.lead}>{t(messages, "settings.organizationLead")}</p>
      </div>

      <div className={app.sections}>
        <section className={`${ui.card} ${ui.stack}`}>
          <h2 className={ui.cardTitle}>{t(messages, "organization.basicsTitle")}</h2>
          {mayRename ? (
            <ActionForm
              action={rename}
              messages={messages}
              className={ui.stack}
              label={t(messages, "organization.basicsTitle")}
            >
              <Field
                name="name"
                label={t(messages, "field.organizationName")}
                defaultValue={ctx.organization.name}
                maxLength={ORG_NAME_MAX}
                required
              />
              <div className={ui.row}>
                <SubmitButton tone="primary">{t(messages, "common.save")}</SubmitButton>
              </div>
            </ActionForm>
          ) : (
            <>
              <p className={app.factValue}>{ctx.organization.name}</p>
              <p className={ui.hint}>{t(messages, "organization.renameForbidden")}</p>
            </>
          )}
        </section>

        <section className={ui.stack}>
          <div className={ui.rowBetween}>
            <h2 className={ui.cardTitle}>{t(messages, "member.title")}</h2>
            <span className={ui.muted}>
              {t(messages, "overview.memberCount", { count: view.members.length })}
            </span>
          </div>

          <ul className={ui.rows}>
            {view.members.map((member) => {
              const isMe = member.userId === ctx.user.id;
              const mayChange =
                !isMe && can("member:setRole", { role: ctx.role, targetRole: member.role });

              return (
                <li key={member.userId}>
                  <div className={ui.rowItem}>
                    <span className={ui.rowMain}>
                      <span className={ui.rowName}>{member.name}</span>
                      <span className={ui.rowMeta}>{member.email}</span>
                    </span>
                    <span className={ui.rowActions}>
                      <RoleBadge role={member.role} messages={messages} />
                    </span>
                  </div>

                  {mayChange ? (
                    <details className={ui.disclosure}>
                      <summary className={ui.summary}>{t(messages, "member.manage")}</summary>
                      <div className={`${ui.disclosureBody} ${ui.stack}`}>
                        <ActionForm
                          action={setRole}
                          messages={messages}
                          className={ui.stack}
                          label={t(messages, "member.roleTitle")}
                        >
                          <input type="hidden" name="userId" value={member.userId} />
                          <Field
                            name="role"
                            kind="select"
                            label={t(messages, "member.roleTitle")}
                            defaultValue={member.role}
                            options={roleOptions}
                            required
                          />
                          <div className={ui.row}>
                            <SubmitButton size="small">{t(messages, "common.save")}</SubmitButton>
                          </div>
                        </ActionForm>

                        <ActionForm
                          action={removeMember}
                          messages={messages}
                          className={ui.stackTight}
                          label={t(messages, "member.remove")}
                        >
                          <input type="hidden" name="userId" value={member.userId} />
                          <p className={ui.hint}>{t(messages, "member.removeHint")}</p>
                          <div className={ui.row}>
                            <SubmitButton tone="danger" size="small">
                              {t(messages, "member.remove")}
                            </SubmitButton>
                          </div>
                        </ActionForm>
                      </div>
                    </details>
                  ) : null}
                </li>
              );
            })}
          </ul>

          {view.members.length === 1 ? (
            <div className={ui.empty}>
              <p className={ui.emptyTitle}>{t(messages, "member.aloneTitle")}</p>
              <p className={ui.emptyHint}>{t(messages, "member.aloneHint")}</p>
            </div>
          ) : null}
        </section>

        {mayInvite ? (
          <section className={ui.stack}>
            <h2 className={ui.cardTitle}>{t(messages, "invite.title")}</h2>

            <div className={`${ui.card} ${ui.stack}`}>
              <ActionForm
                action={invite}
                messages={messages}
                className={ui.stack}
                label={t(messages, "invite.title")}
              >
                <Field
                  name="email"
                  kind="select"
                  label={t(messages, "field.email")}
                  hint={t(messages, "demo.invite.emailHint")}
                  defaultValue={emailOptions[0]?.value}
                  options={emailOptions}
                  required
                />
                <Field
                  name="role"
                  kind="select"
                  label={t(messages, "invite.role")}
                  defaultValue="member"
                  options={inviteRoleOptions}
                  required
                />
                <div className={ui.row}>
                  <SubmitButton tone="primary">{t(messages, "invite.submit")}</SubmitButton>
                </div>
              </ActionForm>
            </div>

            {pending.length === 0 ? (
              <div className={ui.empty}>
                <p className={ui.emptyTitle}>{t(messages, "invite.emptyTitle")}</p>
                <p className={ui.emptyHint}>{t(messages, "invite.emptyHint")}</p>
              </div>
            ) : (
              <ul className={ui.rows}>
                {pending.map((invitation) => (
                  <li className={ui.rowItem} key={invitation.id}>
                    <span className={ui.rowMain}>
                      <span className={ui.rowName}>{invitation.email}</span>
                      <span className={ui.rowMeta}>
                        {t(messages, "invite.expiresAt", {
                          date: formatDate(invitation.expiresAt, ctx.lang),
                        })}
                      </span>
                    </span>
                    <span className={ui.rowActions}>
                      <RoleBadge role={invitation.role} messages={messages} />
                      <ActionForm
                        action={revoke}
                        messages={messages}
                        label={t(messages, "invite.revoke")}
                      >
                        <input type="hidden" name="invitationId" value={invitation.id} />
                        <SubmitButton size="small">{t(messages, "invite.revoke")}</SubmitButton>
                      </ActionForm>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}
      </div>
    </>
  );
}

/* ========================================================================== */
/* お支払い                                                                    */
/* ========================================================================== */

/** ご契約の状態を、そのままお読みいただける文にします */
function statusText(status: StripeStatus | "none", messages: Messages): string {
  switch (status) {
    case "active":
      return t(messages, "billing.status.active");
    case "trialing":
      return t(messages, "billing.status.trialing");
    case "past_due":
      return t(messages, "billing.status.past_due");
    case "unpaid":
      return t(messages, "billing.status.unpaid");
    case "canceled":
      return t(messages, "billing.status.canceled");
    case "incomplete":
      return t(messages, "billing.status.incomplete");
    case "incomplete_expired":
      return t(messages, "billing.status.incomplete_expired");
    case "paused":
      return t(messages, "billing.status.paused");
    default:
      return t(messages, "billing.status.none");
  }
}

export function BillingScreen({ view, messages, world, route, go }: ScreenProps): ReactNode {
  const ctx = view.ctx;
  if (ctx === null || view.billing === null) return null;

  const { state, quota, plans, canManage, canStartCheckout } = view.billing;
  const toast = route.name === "billing" ? route.toast : undefined;

  const openPortal: DemoAction = async () => {
    const current = await world.ctx(ctx.lang);
    if (current === null) return NOT_SIGNED_IN;

    const result = await openPortalFlow({ ctx: current });
    if (!result.ok) return toActionState(result);

    go({ name: "portal" });
    return { status: "ok" };
  };

  const startCheckout: DemoAction = async (form) => {
    const current = await world.ctx(ctx.lang);
    if (current === null) return NOT_SIGNED_IN;

    const planId = form.get("planId");
    const result = await startCheckoutFlow({ ctx: current, raw: { planId } });
    if (!result.ok) return toActionState(result, undefined, form);

    // お進みいただけるかどうかは flow が決めました。行き先だけを、額の中で動かします
    if (isPlanId(planId)) go({ name: "checkout", planId });
    return { status: "ok" };
  };

  return (
    <>
      <div className={app.head}>
        <h1 className={app.title}>{t(messages, "settings.billingTitle")}</h1>
        <p className={app.lead}>{t(messages, "settings.billingLead")}</p>
      </div>

      {toast === "checkoutDone" ? (
        <Toast closeLabel={t(messages, "common.close")}>{t(messages, "billing.doneToast")}</Toast>
      ) : null}
      {toast === "checkoutCanceled" ? (
        <Toast tone="warn" closeLabel={t(messages, "common.close")}>
          {t(messages, "billing.canceledToast")}
        </Toast>
      ) : null}
      {toast === "planCanceled" ? (
        <Toast tone="warn" closeLabel={t(messages, "common.close")}>
          {t(messages, "billing.planCanceledToast")}
        </Toast>
      ) : null}

      <div className={app.sections}>
        <section className={`${ui.card} ${ui.stack}`}>
          <h2 className={ui.cardTitle}>{t(messages, "billing.currentTitle")}</h2>
          <dl className={app.facts}>
            <div className={app.fact}>
              <dt className={app.factTerm}>{t(messages, "overview.factPlan")}</dt>
              <dd className={app.factValue}>{t(messages, state.plan.nameKey)}</dd>
            </div>
            <div className={app.fact}>
              <dt className={app.factTerm}>{t(messages, "billing.statusTitle")}</dt>
              <dd className={app.factValue}>{statusText(state.status, messages)}</dd>
            </div>
            <div className={app.fact}>
              <dt className={app.factTerm}>{t(messages, "overview.factPeriodEnd")}</dt>
              <dd className={app.factValue}>
                {state.currentPeriodEnd === null
                  ? t(messages, "common.none")
                  : formatDate(state.currentPeriodEnd, ctx.lang)}
              </dd>
            </div>
            <div className={app.fact}>
              <dt className={app.factTerm}>{t(messages, "billing.usageTitle")}</dt>
              <dd className={app.factValue}>
                {quota.unlimited
                  ? t(messages, "project.countUnlimited", { used: quota.used })
                  : t(messages, "project.count", { used: quota.used, limit: quota.limit })}
              </dd>
            </div>
          </dl>

          {state.cancelAtPeriodEnd ? (
            <p className={`${ui.notice} ${ui.noticeWarn}`}>
              {t(messages, "billing.cancelScheduled")}
            </p>
          ) : null}

          {canManage ? (
            <ActionForm
              action={openPortal}
              messages={messages}
              className={ui.row}
              label={t(messages, "billing.portal")}
            >
              <SubmitButton>{t(messages, "billing.portal")}</SubmitButton>
              <span className={ui.hint}>{t(messages, "billing.portalHint")}</span>
            </ActionForm>
          ) : (
            <p className={ui.hint}>{t(messages, "billing.ownerOnly")}</p>
          )}
        </section>

        <section className={ui.stack}>
          <h2 className={ui.cardTitle}>{t(messages, "billing.plansTitle")}</h2>
          <div className={app.planList}>
            {plans.map((entry) => {
              const limit = projectLimitOf(entry);
              const isCurrent = entry.id === state.planId;

              return (
                <article
                  className={
                    isCurrent ? `${app.planCard} ${app.planCardCurrent}` : app.planCard
                  }
                  key={entry.id}
                >
                  <div className={app.planCardHead}>
                    <h3 className={app.planCardName}>{t(messages, entry.nameKey)}</h3>
                    <p className={app.planCardPrice}>{formatYen(entry.monthlyYen, ctx.lang)}</p>
                  </div>
                  <p className={ui.muted}>
                    {limit === null
                      ? t(messages, "plan.limitNone")
                      : t(messages, "plan.limitCount", { count: limit })}
                  </p>
                  <p className={ui.muted}>{t(messages, entry.descriptionKey)}</p>

                  <div className={app.planCardFoot}>
                    {isCurrent ? (
                      <span className={ui.badge}>{t(messages, "billing.currentPlan")}</span>
                    ) : entry.id === "free" ? null : canStartCheckout ? (
                      <ActionForm
                        action={startCheckout}
                        messages={messages}
                        label={t(messages, "billing.choose")}
                      >
                        <input type="hidden" name="planId" value={entry.id} />
                        <SubmitButton tone="primary" size="small">
                          {t(messages, "billing.choose")}
                        </SubmitButton>
                      </ActionForm>
                    ) : canManage ? (
                      // ご契約が続いているあいだは、プランの変更をお手続きの画面で承ります
                      <p className={ui.hint}>{t(messages, "billing.changeFromPortal")}</p>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
          <p className={ui.hint}>{t(messages, "billing.taxNote")}</p>
          <nav className={app.planLegal} aria-label={t(messages, "legal.navLabel")}>
            <TextButton onClick={() => go({ name: "legal" })}>
              {t(messages, "legal.tokushoho.title")}
            </TextButton>
          </nav>
        </section>
      </div>
    </>
  );
}

/* ========================================================================== */
/* 偽のお支払いの画面                                                          */
/* ========================================================================== */

export function CheckoutScreen({
  view,
  messages,
  world,
  refresh,
  go,
  planId,
}: ScreenProps & { planId: PlanId }): ReactNode {
  const ctx = view.ctx;
  const plan = findPlan(planId);
  if (ctx === null || plan === null || plan.id === "free") return null;

  const complete: DemoAction = async (form) => {
    const current = await world.ctx(ctx.lang);
    if (current === null) return NOT_SIGNED_IN;

    // どなたが押せるか・すでにご契約中でないかは、本物と同じ flow が決めます
    const allowed = await startCheckoutFlow({ ctx: current, raw: { planId } });
    if (!allowed.ok) return toActionState(allowed, undefined, form);

    await world.completeCheckout(current.organization.id, planId, new Date());
    refresh();
    go({ name: "billing", toast: "checkoutDone" });
    return { status: "ok" };
  };

  return (
    <main className={ui.centered}>
      <div className={ui.centeredWrap}>
        <div className={`${ui.panel} ${ui.stack}`}>
          <div className={ui.stackTight}>
            <h1 className={ui.cardTitle}>{t(messages, "fake.checkoutTitle")}</h1>
            <p className={ui.cardHint}>
              {t(messages, "fake.checkoutLead", { organization: ctx.organization.name })}
            </p>
          </div>

          <dl className={ui.rows}>
            <div className={ui.rowItem}>
              <dt className={ui.rowMain}>
                <span className={ui.rowName}>{t(messages, plan.nameKey)}</span>
                <span className={ui.rowMeta}>{t(messages, plan.descriptionKey)}</span>
              </dt>
              <dd className={ui.strong}>
                {formatYen(plan.monthlyYen, ctx.lang)}
                {t(messages, "plan.perMonth")}
              </dd>
            </div>
          </dl>

          <p className={`${ui.notice} ${ui.noticeWarn}`}>{t(messages, "fake.notice")}</p>

          <ActionForm
            action={complete}
            messages={messages}
            className={ui.stack}
            label={t(messages, "fake.checkoutSubmit")}
          >
            <div className={ui.row}>
              <SubmitButton tone="primary">{t(messages, "fake.checkoutSubmit")}</SubmitButton>
              <button
                type="button"
                className={`${ui.button} ${ui.quiet}`}
                onClick={() => go({ name: "billing", toast: "checkoutCanceled" })}
              >
                {t(messages, "common.cancel")}
              </button>
            </div>
          </ActionForm>
        </div>
      </div>
    </main>
  );
}

export function PortalScreen({ view, messages, world, refresh, go }: ScreenProps): ReactNode {
  const ctx = view.ctx;
  if (ctx === null) return null;

  const cancel: DemoAction = async () => {
    const current = await world.ctx(ctx.lang);
    if (current === null) return NOT_SIGNED_IN;

    // 押せるのは、本物と同じ flow が通した方だけです
    const allowed = await openPortalFlow({ ctx: current });
    if (!allowed.ok) return toActionState(allowed);

    await world.cancelSubscription(current.organization.id, new Date());
    refresh();
    go({ name: "billing", toast: "planCanceled" });
    return { status: "ok" };
  };

  return (
    <main className={ui.centered}>
      <div className={ui.centeredWrap}>
        <div className={`${ui.panel} ${ui.stack}`}>
          <div className={ui.stackTight}>
            <h1 className={ui.cardTitle}>{t(messages, "fake.portalTitle")}</h1>
            <p className={ui.cardHint}>{t(messages, "fake.portalLead")}</p>
          </div>

          <p className={`${ui.notice} ${ui.noticeWarn}`}>{t(messages, "fake.notice")}</p>

          <ActionForm
            action={cancel}
            messages={messages}
            className={ui.row}
            label={t(messages, "fake.cancelSubmit")}
          >
            <SubmitButton tone="danger">{t(messages, "fake.cancelSubmit")}</SubmitButton>
            <button
              type="button"
              className={`${ui.button} ${ui.quiet}`}
              onClick={() => go({ name: "billing" })}
            >
              {t(messages, "common.back")}
            </button>
          </ActionForm>
        </div>
      </div>
    </main>
  );
}
