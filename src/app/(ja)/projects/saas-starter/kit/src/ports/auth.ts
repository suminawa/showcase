// このファイルは、SaaS スターター キットからの写しです。
// 直すときはキットの側を直してから、scripts/sync-saas-starter.mjs を走らせてください。
import type { Lang } from "../core/i18n";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  lang: Lang;
};

export type AuthErrorCode =
  | "bad_credentials"
  | "email_taken"
  | "not_confirmed"
  | "rate_limited"
  | "unavailable";

export type AuthResult = { ok: true } | { ok: false; code: AuthErrorCode };

export type OAuthProvider = "google";

export interface AuthPort {
  /** いまログインしている方。いなければ null */
  getUser(): Promise<SessionUser | null>;
  /** メールのリンク（OTP）をお送りする */
  sendMagicLink(email: string, redirectTo: string): Promise<AuthResult>;
  signInWithPassword(email: string, password: string): Promise<AuthResult>;
  signUpWithPassword(email: string, password: string, redirectTo: string): Promise<AuthResult>;
  signOut(): Promise<void>;
  /** 環境変数がそろっていなければ null。画面はそのときボタンを出さない */
  oauthStartUrl(provider: OAuthProvider, redirectTo: string): Promise<string | null>;
  /** メールのリンク・OAuth から戻ってきたときに、この方のセッションを立てる */
  completeSignIn(input: { code?: string; tokenHash?: string; type?: string }): Promise<AuthResult>;
}
