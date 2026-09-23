// このファイルは、SaaS スターター キットからの写しです。
// 直すときはキットの側を直してから、scripts/sync-saas-starter.mjs を走らせてください。
/**
 * サーバーの処理（flow）が共通で使う、結果の形と「その方がこの組織で何をできるか」の束です。
 *
 * flow は Next.js にも Supabase にも Stripe にも触れません。
 * 必要なものはすべて引数（ports・siteOrigin・now など）で受け取ります。
 */
import { billingStateFrom, type BillingState } from "../core/billing-state";
import type { Lang } from "../core/i18n";
import type { Role } from "../core/permissions";
import type { FieldError } from "../core/validation";
import type { Organization, Ports, SessionUser } from "../ports";

/** 画面にそのまま出せる符号です。内部の文（SQL・スタック）は混ぜません */
export type FlowErrorCode =
  | "unauthenticated" | "forbidden" | "not_found" | "invalid" | "rate_limited"
  | "plan_limit" | "last_owner" | "cannot_touch_owner" | "cannot_promote_to_owner"
  | "no_change" | "invite_expired" | "invite_used" | "invite_revoked" | "invite_not_found"
  | "email_taken" | "bad_credentials" | "not_confirmed"
  | "has_subscription" | "already_subscribed"
  | "billing_not_configured" | "billing_no_customer" | "unavailable";

/** 画面が符号から文を引くための一覧です（messages の error.<符号> と対になります） */
export const FLOW_ERROR_CODES: readonly FlowErrorCode[] = [
  "unauthenticated", "forbidden", "not_found", "invalid", "rate_limited",
  "plan_limit", "last_owner", "cannot_touch_owner", "cannot_promote_to_owner",
  "no_change", "invite_expired", "invite_used", "invite_revoked", "invite_not_found",
  "email_taken", "bad_credentials", "not_confirmed",
  "has_subscription", "already_subscribed",
  "billing_not_configured", "billing_no_customer", "unavailable",
];

export type FlowResult<T> =
  | { ok: true; value: T }
  | { ok: false; code: FlowErrorCode; errors?: FieldError[] };

/**
 * flow に渡す依存の束です。組み立ての場所（src/server/ports.ts）で 1 回だけ作り、
 * そのまま flow にお渡しします。
 */
export type Deps = {
  ports: Ports;
  /**
   * メールのリンクと、お支払いの戻り先に使う、このサイトの土台の URL です。
   * NEXT_PUBLIC_SITE_URL から作ります。
   * **リクエストのヘッダ（Host・Origin・X-Forwarded-Host）からは作りません**
   * ― ヘッダは差し替えられることがあり、お客さまを知らないサイトへお送りしてしまうためです。
   */
  siteOrigin: string;
};

export type Ctx = Deps & {
  user: SessionUser;
  organization: Organization;
  role: Role;
  billing: BillingState;
  lang: Lang;
  now: Date;
};

/** ログインだけを確かめます（組織はまだ無くてかまいません。/onboarding が使います） */
export type UserCtx = Deps & { user: SessionUser; lang: Lang; now: Date };

/**
 * Server Action が画面にお返しする形です。
 *
 * 文そのものではなく **鍵**（messages のどの文を出すか）をお返しします。
 * 内部の文（例外の message・SQL・スタック）は、ここから先へ出しません。
 */
export type ActionState =
  | { status: "idle" }
  | {
      status: "ok";
      messageKey?: string;
      /** 1 回だけお見せする文字（お作りした招待のリンクなど）です */
      value?: string;
    }
  | {
      status: "error";
      messageKey: string;
      errors?: FieldError[];
      /**
       * お預かりした欄の値です（入力の欄の初めの値に使います）。
       *
       * React は、送信が終わると入力の欄を初めの値に戻します。誤りでお戻しするときも
       * 戻ってしまうと、お書きいただいた内容を書き直していただくことになるため、
       * そのままお返しします。**合言葉とトークンは入れません**。
       */
      values?: Record<string, string>;
    };

/** 誤りのときの形です（値を組み立てるあいだだけ使います） */
type ErrorState = Extract<ActionState, { status: "error" }>;

/** useActionState にお渡しする、はじめの状態です */
export const IDLE: ActionState = { status: "idle" };

/**
 * 画面にお戻ししない欄の名前です。
 * 合言葉と、1 回きりの合い札（招待のトークンなど）は、お返事に載せません。
 */
const SECRET_FIELD = /password|token|secret/i;

/**
 * お預かりした欄のうち、そのままお返ししてよいものだけを写します。
 * ファイルはお預かりしません（大きさがそのままお返事に載ってしまうためです）。
 */
export function keptValues(form: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [name, value] of form.entries()) {
    if (typeof value !== "string") continue;
    if (SECRET_FIELD.test(name)) continue;
    values[name] = value;
  }
  return values;
}

/**
 * flow のお返事を、そのまま画面に出せる形に写します。
 *
 * form をお渡しいただくと、誤りのときにお預かりした値を添えます
 * （入力の欄が、お書きいただいた内容のままお戻りします）。
 */
export function toActionState(
  result: FlowResult<unknown>,
  okKey?: string,
  form?: FormData,
): ActionState {
  if (result.ok) return okKey === undefined ? { status: "ok" } : { status: "ok", messageKey: okKey };

  const state: ErrorState = { status: "error", messageKey: `error.${result.code}` };
  if (result.errors !== undefined) state.errors = result.errors;

  const values = form === undefined ? {} : keptValues(form);
  if (Object.keys(values).length > 0) state.values = values;

  return state;
}

export function flowOk<T>(value: T): FlowResult<T> {
  return { ok: true, value };
}

export function flowFail(code: FlowErrorCode, errors?: FieldError[]): FlowResult<never> {
  return errors === undefined ? { ok: false, code } : { ok: false, code, errors };
}

/**
 * 組織の ID を、呼び出し側の値のまま信用しません。
 * 必ず memberships を引き直し、一員でなければ not_found を返します
 * （forbidden ではなく not_found なのは、その組織があること自体をお知らせしないためです）。
 */
export async function buildCtx(
  input: Deps & {
    user: SessionUser;
    organizationId: string;
    lang: Lang;
    now: Date;
  },
): Promise<FlowResult<Ctx>> {
  const membership = await input.ports.data.getMembership(input.organizationId, input.user.id);
  if (membership === null) return flowFail("not_found");

  const organization = await input.ports.data.getOrganization(membership.organizationId);
  if (organization === null) return flowFail("not_found");

  // 画面がご覧になる口（利用者の鍵）です。決済の契約の番号は入りません
  // （その番号を使うのは、署名の検証を通った決済の通知の流れだけです）。
  const subscription = await input.ports.data.getSubscription(organization.id);

  return flowOk({
    ports: input.ports,
    siteOrigin: input.siteOrigin,
    user: input.user,
    organization,
    role: membership.role,
    billing: billingStateFrom(subscription),
    lang: input.lang,
    now: input.now,
  });
}
