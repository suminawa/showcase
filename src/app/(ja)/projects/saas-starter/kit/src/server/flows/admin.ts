// このファイルは、SaaS スターター キットからの写しです。
// 直すときはキットの側を直してから、scripts/sync-saas-starter.mjs を走らせてください。
/**
 * 運営の方だけがご覧になる画面（/admin）の流れです。読むだけで、何も書き換えません。
 *
 * ご覧になれるのは ADMIN_EMAILS に書かれたメールアドレスの方だけです。
 * 環境変数が未設定のときは、この画面があること自体をお知らせしません（画面が 404 を出します）。
 *
 * adminOverviewFlow は権限を確かめません。すべての組織の行をお返しするため、
 * 呼ぶ前に必ず isAdminEmail で確かめてください（画面の側の決まりです）。
 */
import type { AdminOrgRow, AdminSubscriptionRow, Ports, Profile } from "../../ports";
import { flowOk, type FlowResult } from "../context";

/** 1 ページに並べる件数の既定です */
export const ADMIN_PER_PAGE = 50;

const PER_PAGE_MIN = 1;
const PER_PAGE_MAX = 100;

/** ページ番号の上限です（とても大きな数をいただいても、読み飛ばす件数が膨らまないようにします） */
const PAGE_MAX = 10000;

/**
 * ADMIN_EMAILS（カンマ区切り）に、その方のメールアドレスがあるかどうかを確かめます。
 * 未設定・空のときは、どなたにも false をお返しします。
 */
export function isAdminEmail(email: string, adminEmails: string | undefined): boolean {
  if (adminEmails === undefined) return false;

  const target = email.trim().toLowerCase();
  if (target === "") return false;

  return adminEmails
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .some((entry) => entry !== "" && entry === target);
}

/** 1 以上の整数に丸めます（0 以下や数でない値は誤りにせず、いちばん小さい値にします） */
function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.floor(value)));
}

/**
 * ?page= にいただいた値を、ページ番号にします。
 *
 * 数でない値・0 以下・大きすぎる値は、誤りにせず安全な範囲に丸めます
 * （画面は、この答えを一覧の読み出しと、前後のご案内の両方に使います）。
 */
export function adminPageFrom(raw: string | null): number {
  if (raw === null) return 1;
  return clamp(Number.parseInt(raw, 10), 1, PAGE_MAX);
}

export async function adminOverviewFlow(input: {
  ports: Ports;
  page: number;
  perPage: number;
}): Promise<
  FlowResult<{
    organizations: AdminOrgRow[];
    profiles: Profile[];
    subscriptions: AdminSubscriptionRow[];
  }>
> {
  const perPage = clamp(input.perPage, PER_PAGE_MIN, PER_PAGE_MAX);
  const page = clamp(input.page, 1, PAGE_MAX);
  const offset = (page - 1) * perPage;

  const [organizations, profiles, subscriptions] = await Promise.all([
    input.ports.data.adminListOrganizations(perPage, offset),
    input.ports.data.adminListProfiles(perPage, offset),
    input.ports.data.adminListSubscriptions(perPage, offset),
  ]);

  return flowOk({ organizations, profiles, subscriptions });
}
