// このファイルは、SaaS スターター キットからの写しです。
// 直すときはキットの側を直してから、scripts/sync-saas-starter.mjs を走らせてください。
/**
 * 外からたどれる URL を組み立てます。
 * 環境変数はここでは読みません。読んだ値（env）を呼び出し側から受け取ります。
 */

/** NEXT_PUBLIC_SITE_URL が無いときの行き先です */
export const DEFAULT_SITE_ORIGIN = "http://localhost:3020";

/** 行き先をお預かりできなかったときに、代わりにお通しするページです */
export const DEFAULT_NEXT_PATH = "/app";

// 行き先に混じっていると、ブラウザの読み取り方が変わってしまう文字です
const CONTROL = /[\u0000-\u001f\u007f]/;

/**
 * ログインのあとの行き先として、そのままお通ししてよいかを確かめます。
 *
 * 通すのは、このサイトの中を指す相対パスだけです。
 * `//` と `/\` で始まる形は、ブラウザには外のサイトの URL として読まれるため通しません
 * （お預かりした行き先で、知らないサイトへお送りしてしまわないようにするためです）。
 */
export function isSafeNextPath(next: string): boolean {
  if (!next.startsWith("/")) return false;
  if (next.startsWith("//") || next.startsWith("/\\")) return false;
  if (CONTROL.test(next)) return false;
  return true;
}

/**
 * ?name=… の値を 1 つだけお預かりします。
 * 同じ名前を 2 つ以上いただいたときは、はじめの 1 つだけを見ます。
 */
export function firstParam(
  params: Record<string, string | string[] | undefined>,
  name: string,
): string | null {
  const found = params[name];
  if (typeof found === "string") return found === "" ? null : found;
  if (Array.isArray(found)) return found[0] ?? null;
  return null;
}

/**
 * ログインの画面への行き先です。
 * next は、ログインのあとにお戻りいただくページ（同じサイトの中の相対パス）です。
 * 外のサイトを指す形は、お預かりせずに落とします。
 */
export function loginPath(next?: string): string {
  if (next === undefined || next === "" || !isSafeNextPath(next)) return "/login";
  return `/login?next=${encodeURIComponent(next)}`;
}

function trimSlash(origin: string): string {
  return origin.trim().replace(/\/+$/, "");
}

/** NEXT_PUBLIC_SITE_URL（末尾の / は落とします）。無ければ http://localhost:3020 */
export function siteOrigin(env: Record<string, string | undefined>): string {
  const configured = env.NEXT_PUBLIC_SITE_URL;
  if (configured === undefined) return DEFAULT_SITE_ORIGIN;
  const origin = trimSlash(configured);
  return origin === "" ? DEFAULT_SITE_ORIGIN : origin;
}

/**
 * メールのリンク・OAuth から戻ってくる先。next はログイン後に開くページです。
 * 行き先をお伝えいただかないときは付けません（そのときの行き先はサーバーが決めます）。
 * 外のサイトを指す行き先は、既定の行き先に落としてからお渡しします。
 */
export function authCallbackUrl(origin: string, next?: string): string {
  const base = `${trimSlash(origin)}/auth/callback`;
  if (next === undefined || next === "") return base;

  const path = isSafeNextPath(next) ? next : DEFAULT_NEXT_PATH;
  return `${base}?next=${encodeURIComponent(path)}`;
}

export function checkoutSuccessUrl(origin: string): string {
  return `${trimSlash(origin)}/app/settings/billing?checkout=done`;
}

export function checkoutCancelUrl(origin: string): string {
  return `${trimSlash(origin)}/app/settings/billing?checkout=canceled`;
}

export function portalReturnUrl(origin: string): string {
  return `${trimSlash(origin)}/app/settings/billing`;
}
