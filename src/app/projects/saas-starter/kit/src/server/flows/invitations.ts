// このファイルは、SaaS スターター キットからの写しです。
// 直すときはキットの側を直してから、scripts/sync-saas-starter.mjs を走らせてください。
/**
 * 招待の流れ（一覧・お送りする・取り消す・お受けいただく）です。
 *
 * トークンは core/invitations で作った 32 バイトの乱数で、表に置くのは SHA-256 のハッシュだけです。
 * 照合も「お預かりした生のトークンをハッシュにして、ハッシュで行を探す」形で行います
 * （生のトークンを保存せず、文字列どうしを突き合わせることもしません）。
 */
import { t, type Messages } from "../../core/i18n";
import {
  INVITE_TTL_DAYS,
  checkInvite,
  createInviteToken,
  hashInviteToken,
  inviteExpiresAt,
  inviteUrl,
  type InviteCheck,
} from "../../core/invitations";
import { ROLES, can, type Role } from "../../core/permissions";
import { singleLine, validateChoice, validateEmail, validateText } from "../../core/validation";
import { LEGAL } from "../../../legal.config";
import type { MailFailureCode } from "../../ports/mail";
import type { InvitationRow, Ports, SessionUser } from "../../ports";
import { flowFail, flowOk, type Ctx, type FlowErrorCode, type FlowResult } from "../context";
import type { RateLimiter } from "../ratelimit";
import { MAX_ORGS_PER_USER } from "./organizations";

/** 招待の ID の長さの上限（UUID でも fake の id でも収まる長さです） */
const ID_MAX = 100;

/** お預かりするトークンの長さの上限（本来は 43 文字です） */
const TOKEN_MAX = 200;

/** core/invitations の判定を、画面に出せる符号に写します */
const INVITE_CODES: Readonly<Record<Extract<InviteCheck, { ok: false }>["code"], FlowErrorCode>> = {
  not_found: "invite_not_found",
  expired: "invite_expired",
  used: "invite_used",
  revoked: "invite_revoked",
};

/** 回数を数える鍵。組織ごとに数えます */
function inviteKey(organizationId: string): string {
  return `invite:${organizationId}`;
}

/** お受けいただくときの鍵。どなたのものか分からないので、IP ごとに数えます */
function inviteAcceptKey(ip: string): string {
  return `invite-accept:${ip}`;
}

/** お送りできたかどうかを、画面にお出しするお知らせの鍵に写します */
export function inviteNoticeKey(mail: {
  mailed: boolean;
  mailCode: MailFailureCode | null;
}): string {
  // お送りできました
  if (mail.mailed) return "invite.sentMail";
  // まだ鍵を頂戴していないので、そもそもお送りしていません（リンクをお渡しいただけます）
  if (mail.mailCode === "not_configured") return "invite.sentLink";
  // お送りしようとして、届けられませんでした（同じ文でお伝えすると、届いたと思われてしまいます）
  return "invite.mailFailed";
}

/** 招待の管理そのものができるか（できない方を弾く粗い関門です） */
function mayManageInvitations(role: Role): boolean {
  return can("member:invite", { role, targetRole: "member" });
}

export async function listInvitationsFlow(input: {
  ctx: Ctx;
}): Promise<FlowResult<InvitationRow[]>> {
  // メンバーの一覧はどの役割の方にもお見せしますが、招待の一覧には
  // まだ組織の外にいらっしゃる方のメールアドレスが並ぶため、オーナーと管理者だけにお見せします。
  if (!mayManageInvitations(input.ctx.role)) return flowFail("forbidden");
  const rows = await input.ctx.ports.data.listInvitations(input.ctx.organization.id);
  return flowOk(rows);
}

export async function createInvitationFlow(input: {
  ctx: Ctx;
  raw: { email: unknown; role: unknown };
  limiter: RateLimiter;
  messages: Messages;
}): Promise<
  FlowResult<{
    invitation: InvitationRow;
    url: string;
    mailed: boolean;
    mailCode: MailFailureCode | null;
  }>
> {
  // 1. 権限。どの役割でお招きするかで答えが変わるため、役割だけ先に読み取ります
  const role = validateChoice<Role>(input.raw.role, ROLES, "role");
  if (!role.ok) return flowFail("invalid", role.errors);
  if (!can("member:invite", { role: input.ctx.role, targetRole: role.value })) {
    return flowFail("forbidden");
  }

  // 2. 検査（小文字にそろえた値だけを、このあと保存と照合に使います）
  const email = validateEmail(input.raw.email);
  if (!email.ok) return flowFail("invalid", email.errors);

  // 3. 回数の上限。形の悪い入力で回数が減ってしまわないよう、検査を通ってから数えます
  const verdict = await input.limiter.hit(inviteKey(input.ctx.organization.id), input.ctx.now);
  if (!verdict.allowed) return flowFail("rate_limited");

  // 4. すでにご一緒いただいている方は、お招きする必要がありません
  const members = await input.ctx.ports.data.listMembers(input.ctx.organization.id);
  if (members.some((member) => member.email.toLowerCase() === email.value)) {
    return flowFail("no_change");
  }

  // 5. 同じメールアドレスへの前の招待は、すべて取り消してから作ります
  await input.ctx.ports.data.revokePendingInvitations(input.ctx.organization.id, email.value);

  const { token, tokenHash } = createInviteToken();
  const invitation = await input.ctx.ports.data.createInvitation({
    organizationId: input.ctx.organization.id,
    email: email.value,
    role: role.value,
    tokenHash,
    expiresAt: inviteExpiresAt(input.ctx.now),
    invitedBy: input.ctx.user.id,
  });

  // リンクの土台は、組み立ての場所で作ったものだけを使います
  // （リクエストのヘッダから作ると、差し替えられた URL をお送りしてしまいます）。
  const url = inviteUrl(input.ctx.siteOrigin, token);

  // お客さまがお書きになった値（組織の名前・お名前）は、差し込む前に 1 行に均します
  const organization = singleLine(input.ctx.organization.name);
  const inviterName = singleLine(
    input.ctx.user.name === "" ? input.ctx.user.email : input.ctx.user.name,
  );

  const mail = await input.ctx.ports.mail.send({
    to: email.value,
    subject: t(input.messages, "mail.invite.subject", { organization }),
    text: t(input.messages, "mail.invite.body", {
      inviterName,
      organization,
      roleName: t(input.messages, `role.${role.value}`),
      url,
      days: INVITE_TTL_DAYS,
      serviceName: LEGAL.serviceName,
    }),
    lang: input.ctx.lang,
  });

  // メールをお送りできない設定でも、招待そのものは成り立ちます（画面にリンクをお出しします）。
  // 「送っていない」のか「送ろうとして届かなかった」のかは、画面の文が変わるのでお返しします。
  return flowOk({ invitation, url, mailed: mail.ok, mailCode: mail.ok ? null : mail.code });
}

export async function revokeInvitationFlow(input: {
  ctx: Ctx;
  raw: { invitationId: unknown };
}): Promise<FlowResult<{ invitationId: string }>> {
  const invitationId = validateText(input.raw.invitationId, {
    field: "invitationId",
    min: 1,
    max: ID_MAX,
  });
  if (!invitationId.ok) return flowFail("invalid", invitationId.errors);

  if (!mayManageInvitations(input.ctx.role)) return flowFail("forbidden");

  const rows = await input.ctx.ports.data.listInvitations(input.ctx.organization.id);
  const found = rows.find((row) => row.id === invitationId.value);
  if (found === undefined) return flowFail("not_found");

  // オーナーとしてお招きしている招待に触れられるのは、オーナーだけです
  if (!can("member:invite", { role: input.ctx.role, targetRole: found.role })) {
    return flowFail("forbidden");
  }

  // 取り消せるのは、まだお受けいただいていない招待だけです。
  // すでにお受けいただいた方を組織から外すのは、メンバーの画面のお仕事です
  // （ここで黙って「取り消しました」とお返しすると、外れたものと思われてしまいます）。
  if (found.status !== "pending") return flowFail("no_change");

  await input.ctx.ports.data.revokeInvitation(input.ctx.organization.id, found.id);
  return flowOk({ invitationId: found.id });
}

/** ログインした方が /invite/<token> をお開きになったときの流れです */
export async function acceptInvitationFlow(input: {
  ports: Ports;
  user: SessionUser;
  token: string;
  limiter: RateLimiter;
  ip: string;
  now: Date;
}): Promise<FlowResult<{ organizationId: string; role: Role }>> {
  // 当てずっぽうのトークンを続けてお試しになる形を止めます（数えるのは IP ごとです）
  const verdict = await input.limiter.hit(inviteAcceptKey(input.ip), input.now);
  if (!verdict.allowed) return flowFail("rate_limited");

  if (input.token === "" || input.token.length > TOKEN_MAX) {
    return flowFail("invite_not_found");
  }

  const row = await input.ports.data.findInvitationByHash(hashInviteToken(input.token));
  const checked = checkInvite(row, input.now);
  if (!checked.ok) return flowFail(INVITE_CODES[checked.code]);

  const invitation = checked.invitation;
  if (invitation.email.toLowerCase() !== input.user.email.toLowerCase()) {
    return flowFail("forbidden");
  }

  // 組織をお作りになるときと同じ上限です（お一人が入れる組織の数）
  const mine = await input.ports.data.listOrganizationsForUser(input.user.id);
  const alreadyIn = mine.some((entry) => entry.organization.id === invitation.organizationId);
  if (!alreadyIn && mine.length >= MAX_ORGS_PER_USER) return flowFail("forbidden");

  // メンバーに加えるところと招待を accepted にするところは、1 回の呼び出しにまとめています
  // （同じリンクを二重にお開きになっても、メンバーは 1 回しか入りません）。
  const outcome = await input.ports.data.acceptInvitation(
    invitation.id,
    input.user.id,
    invitation.role,
  );
  if (outcome === "not_pending") return flowFail("invite_used");

  // すでにご一緒いただいている方は、もとからの役割のままです
  const membership = await input.ports.data.getMembership(invitation.organizationId, input.user.id);
  if (membership === null) return flowFail("unavailable");

  return flowOk({ organizationId: membership.organizationId, role: membership.role });
}
