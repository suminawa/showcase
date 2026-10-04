// このファイルは、SaaS スターター キットからの写しです。
// 直すときはキットの側を直してから、scripts/sync-saas-starter.mjs を走らせてください。
/**
 * ご登録・ログイン・プロフィールの流れです。
 * 画面（Server Actions）はこの関数だけを呼び、ports の中身を知りません。
 */
import { LANGS, type Lang } from "../../core/i18n";
import {
  collect,
  validateChoice,
  validateEmail,
  validatePassword,
  validateText,
} from "../../core/validation";
import type { Ports, Profile, SessionUser } from "../../ports";
import { flowFail, flowOk, type Deps, type FlowResult, type UserCtx } from "../context";
import type { RateLimiter } from "../ratelimit";
import { authCallbackUrl } from "../urls";

/** お名前の長さの上限 */
export const PROFILE_NAME_MAX = 60;

/** 組織がまだ無い方の行き先 */
export const ONBOARDING_PATH = "/onboarding";
/** 組織がある方の行き先 */
export const APP_PATH = "/app";

/** 回数を数える鍵。IP とメールアドレスの組ごとに数えます */
function loginKey(ip: string, email: string): string {
  return `login:${ip}:${email}`;
}

/** 2 本目の鍵。メールアドレスを変えながら試す形を止めるため、IP だけで数えます */
function loginIpKey(ip: string): string {
  return `login-ip:${ip}`;
}

/**
 * 2 本の窓（IP だけ・IP とメールアドレスの組）を数えます。
 * どちらかが尽きていれば、そこでお止めします。
 */
async function withinLoginLimits(input: {
  limiter: RateLimiter;
  ipLimiter: RateLimiter;
  ip: string;
  email: string;
  now: Date;
}): Promise<boolean> {
  const byIp = await input.ipLimiter.hit(loginIpKey(input.ip), input.now);
  if (!byIp.allowed) return false;

  const byEmail = await input.limiter.hit(loginKey(input.ip, input.email), input.now);
  return byEmail.allowed;
}

/** 表示のお名前が空のときは、メールアドレスの @ より前を仮のお名前にします */
function displayNameFor(user: SessionUser, email: string): string {
  const name = validateText(user.name, { field: "name", min: 0, max: PROFILE_NAME_MAX });
  if (name.ok && name.value !== "") return name.value;
  return email.split("@")[0];
}

export async function signUpFlow(
  input: Deps & {
    raw: { email: unknown; password: unknown };
    limiter: RateLimiter;
    ipLimiter: RateLimiter;
    ip: string;
    now: Date;
  },
): Promise<FlowResult<{ sent: boolean }>> {
  const checked = collect({
    email: validateEmail(input.raw.email),
    password: validatePassword(input.raw.password),
  });
  if (!checked.ok) return flowFail("invalid", checked.errors);

  const allowed = await withinLoginLimits({
    limiter: input.limiter,
    ipLimiter: input.ipLimiter,
    ip: input.ip,
    email: checked.value.email,
    now: input.now,
  });
  if (!allowed) return flowFail("rate_limited");

  // 受け口の URL も、組み立ての場所で作った土台からだけ組みます
  const result = await input.ports.auth.signUpWithPassword(
    checked.value.email,
    checked.value.password,
    authCallbackUrl(input.siteOrigin),
  );

  // 隠すのは「すでにご登録のメールアドレスです」だけです。
  // これをお伝えすると、ご登録の有無を外から確かめられてしまうためです
  // （画面には「確認のメールをお送りしました」とだけお出しします）。
  // ほかの符号は、どのメールアドレスでも同じように起きるもの（混み合っているとき・
  // 一時的にお使いいただけないとき）なので、そのままお返しします。
  if (!result.ok && result.code !== "email_taken") return flowFail(result.code);

  return flowOk({ sent: true });
}

export async function signInPasswordFlow(input: {
  ports: Ports;
  raw: { email: unknown; password: unknown };
  limiter: RateLimiter;
  ipLimiter: RateLimiter;
  ip: string;
  now: Date;
}): Promise<FlowResult<{ userId: string }>> {
  const checked = collect({
    email: validateEmail(input.raw.email),
    password: validatePassword(input.raw.password),
  });
  if (!checked.ok) return flowFail("invalid", checked.errors);

  const allowed = await withinLoginLimits({
    limiter: input.limiter,
    ipLimiter: input.ipLimiter,
    ip: input.ip,
    email: checked.value.email,
    now: input.now,
  });
  if (!allowed) return flowFail("rate_limited");

  const result = await input.ports.auth.signInWithPassword(
    checked.value.email,
    checked.value.password,
  );
  if (!result.ok) return flowFail(result.code);

  const user = await input.ports.auth.getUser();
  if (user === null) return flowFail("unavailable");

  return flowOk({ userId: user.id });
}

export async function magicLinkFlow(
  input: Deps & {
    raw: { email: unknown };
    limiter: RateLimiter;
    ipLimiter: RateLimiter;
    ip: string;
    now: Date;
  },
): Promise<FlowResult<{ sent: boolean }>> {
  const email = validateEmail(input.raw.email);
  if (!email.ok) return flowFail("invalid", email.errors);

  const allowed = await withinLoginLimits({
    limiter: input.limiter,
    ipLimiter: input.ipLimiter,
    ip: input.ip,
    email: email.value,
    now: input.now,
  });
  if (!allowed) return flowFail("rate_limited");

  const result = await input.ports.auth.sendMagicLink(
    email.value,
    authCallbackUrl(input.siteOrigin),
  );
  if (!result.ok) return flowFail(result.code);

  return flowOk({ sent: true });
}

/**
 * Google でのログインの入り口を作ります。
 *
 * ここでもログインと同じ IP の窓で数えます。メールアドレスと合言葉の道だけに
 * 上限を置いても、この入り口から何度でもお試しになれては、窓の意味がありません
 * （入り口を作るたびに、認証の口へのお申し付けも 1 回ずつ増えます）。
 * メールアドレスを頂戴しないので、窓は IP の 1 本だけです。
 */
export async function googleSignInFlow(
  input: Deps & {
    /** ログインのあとにお戻りいただく先（同じサイトの中の相対パス）です */
    next: string | null;
    ipLimiter: RateLimiter;
    ip: string;
    now: Date;
  },
): Promise<FlowResult<{ url: string }>> {
  const verdict = await input.ipLimiter.hit(loginIpKey(input.ip), input.now);
  if (!verdict.allowed) return flowFail("rate_limited");

  // お戻り先は、組み立ての場所で作った土台からだけ組みます
  const url = await input.ports.auth.oauthStartUrl(
    "google",
    authCallbackUrl(input.siteOrigin, input.next ?? undefined),
  );
  if (url === null) return flowFail("unavailable");

  return flowOk({ url });
}

/** ログインしたあとに 1 回呼びます。profiles の行が無ければ作ります */
export async function ensureProfileFlow(input: {
  ports: Ports;
  user: SessionUser;
  now: Date;
}): Promise<FlowResult<Profile>> {
  // profiles に入れるメールアドレスは、必ず検査を通した小文字の値にそろえます
  // （招待やメンバーの突き合わせが、この値どうしの比較で行われるためです）。
  const email = validateEmail(input.user.email);
  if (!email.ok) return flowFail("invalid", email.errors);

  const existing = await input.ports.data.getProfile(input.user.id);
  if (existing !== null) return flowOk(existing);

  const created = await input.ports.data.upsertProfile({
    id: input.user.id,
    email: email.value,
    name: displayNameFor(input.user, email.value),
    lang: input.user.lang,
  });
  return flowOk(created);
}

/** ログインしたあとの行き先を決めます。組織がまだ無ければ /onboarding です */
export async function landingPathFlow(input: {
  ports: Ports;
  user: SessionUser;
}): Promise<FlowResult<{ path: string; organizationId: string | null }>> {
  const rows = await input.ports.data.listOrganizationsForUser(input.user.id);
  const first = rows[0];
  if (first === undefined) return flowOk({ path: ONBOARDING_PATH, organizationId: null });
  return flowOk({ path: APP_PATH, organizationId: first.organization.id });
}

/**
 * いまログインしていらっしゃる方のプロフィールです。
 * 画面が、入力の欄にはじめの値をお出しするために使います。
 */
export async function myProfileFlow(input: { ctx: UserCtx }): Promise<FlowResult<Profile>> {
  const profile = await input.ctx.ports.data.getProfile(input.ctx.user.id);
  if (profile === null) return flowFail("not_found");
  return flowOk(profile);
}

export async function updateProfileFlow(input: {
  ctx: UserCtx;
  raw: { name: unknown; lang: unknown };
}): Promise<FlowResult<Profile>> {
  const name = validateText(input.raw.name, { field: "name", min: 1, max: PROFILE_NAME_MAX });
  const lang = validateChoice<Lang>(input.raw.lang, LANGS, "lang");
  if (!name.ok || !lang.ok) {
    return flowFail("invalid", [
      ...(name.ok ? [] : name.errors),
      ...(lang.ok ? [] : lang.errors),
    ]);
  }

  const existing = await input.ctx.ports.data.getProfile(input.ctx.user.id);
  if (existing === null) return flowFail("not_found");

  const updated = await input.ctx.ports.data.updateProfile(input.ctx.user.id, {
    name: name.value,
    lang: lang.value,
  });
  return flowOk(updated);
}
