// このファイルは、SaaS スターター キットからの写しです。
// 直すときはキットの側を直してから、scripts/sync-saas-starter.mjs を走らせてください。
// src/core/ で外の module を読んでよいのは、このファイルの node:crypto だけです。
import { createHash, randomBytes } from "./crypto-shim";
import type { Role } from "./permissions";

export const INVITE_TOKEN_BYTES = 32;
export const INVITE_TTL_DAYS = 7;

export type InvitationStatus = "pending" | "accepted" | "revoked";

export type InvitationRow = {
  id: string;
  organizationId: string;
  email: string;
  role: Role;
  /** 表に置くのはハッシュだけ。生のトークンは招待した方にお渡しするリンクの中にだけあります */
  tokenHash: string;
  expiresAt: string;
  status: InvitationStatus;
  invitedBy: string | null;
  acceptedBy: string | null;
  createdAt: string;
};

export function hashInviteToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function createInviteToken(): { token: string; tokenHash: string } {
  const token = randomBytes(INVITE_TOKEN_BYTES).toString("base64url");
  return { token, tokenHash: hashInviteToken(token) };
}

export function inviteExpiresAt(now: Date): string {
  return new Date(now.getTime() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
}

export type InviteCheck =
  | { ok: true; invitation: InvitationRow }
  | { ok: false; code: "not_found" | "expired" | "used" | "revoked" };

export function checkInvite(row: InvitationRow | null, now: Date): InviteCheck {
  if (row === null) return { ok: false, code: "not_found" };
  if (row.status === "accepted") return { ok: false, code: "used" };
  if (row.status === "revoked") return { ok: false, code: "revoked" };
  if (new Date(row.expiresAt).getTime() <= now.getTime()) return { ok: false, code: "expired" };
  return { ok: true, invitation: row };
}

export function inviteUrl(origin: string, token: string): string {
  return `${origin.replace(/\/+$/, "")}/invite/${token}`;
}
