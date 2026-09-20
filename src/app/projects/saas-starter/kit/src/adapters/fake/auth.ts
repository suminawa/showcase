// このファイルは、SaaS スターター キットからの写しです。
// 直すときはキットの側を直してから、scripts/sync-saas-starter.mjs を走らせてください。
import type { AuthPort, AuthResult, OAuthProvider, SessionUser } from "../../ports/auth";
import type { FakeStore } from "./store";

/**
 * ログインは「見本の人を選ぶ」だけです（owner・admin・member の 3 人）。
 * セッションは store.sessionUserId 1 つだけで持ちます。
 */
export class FakeAuth implements AuthPort {
  constructor(private readonly store: FakeStore) {}

  /** テストと fake の画面が使う、「見本の人を選ぶ」ための入り口 */
  signInAs(userId: string): void {
    this.store.sessionUserId = userId;
  }

  async getUser(): Promise<SessionUser | null> {
    const userId = this.store.sessionUserId;
    if (userId === null) return null;

    const profile = this.store.profiles.get(userId);
    if (profile !== undefined) {
      return { id: profile.id, email: profile.email, name: profile.name, lang: profile.lang };
    }

    const authUser = [...this.store.authUsers.values()].find((u) => u.id === userId);
    if (authUser !== undefined) {
      return { id: authUser.id, email: authUser.email, name: authUser.email.split("@")[0] ?? "", lang: "ja" };
    }

    return null;
  }

  async sendMagicLink(email: string, redirectTo: string): Promise<AuthResult> {
    this.store.magicLinks.push({ email, redirectTo, sentAt: this.store.nowIso() });
    return { ok: true };
  }

  async signInWithPassword(email: string, password: string): Promise<AuthResult> {
    const user = this.store.authUsers.get(email);
    if (user === undefined || user.password !== password) {
      return { ok: false, code: "bad_credentials" };
    }
    this.store.sessionUserId = user.id;
    return { ok: true };
  }

  async signUpWithPassword(email: string, password: string, _redirectTo: string): Promise<AuthResult> {
    if (this.store.authUsers.has(email)) {
      return { ok: false, code: "email_taken" };
    }
    const id = this.store.nextId("profiles");
    this.store.authUsers.set(email, { id, email, password });
    this.store.sessionUserId = id;
    return { ok: true };
  }

  async signOut(): Promise<void> {
    this.store.sessionUserId = null;
  }

  /** fake モードでは環境変数をそろえられないので、常に null（画面はボタンを出さない） */
  async oauthStartUrl(_provider: OAuthProvider, _redirectTo: string): Promise<string | null> {
    return null;
  }

  /**
   * fake モードでは、メールのリンク・OAuth の本物の行き来を再現しません。
   * すでに signInAs で見本の人を選んである（= セッションがある）ときだけ ok を返します。
   */
  async completeSignIn(_input: { code?: string; tokenHash?: string; type?: string }): Promise<AuthResult> {
    if (this.store.sessionUserId !== null) return { ok: true };
    return { ok: false, code: "unavailable" };
  }
}
