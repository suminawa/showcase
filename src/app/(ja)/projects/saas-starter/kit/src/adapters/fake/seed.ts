// このファイルは、SaaS スターター キットからの写しです。
// 直すときはキットの側を直してから、scripts/sync-saas-starter.mjs を走らせてください。
import type { FakeStore } from "./store";

/**
 * 見本の方の id です（ログインの画面に並べる 3 人）。
 * 「見本の方を選ぶ」画面は、この一覧にある id しかお受けしません。
 */
export const DEMO_USER_IDS: readonly string[] = ["u-owner", "u-admin", "u-member"] as const;

/**
 * 見本のデータを入れます。STARTER_FAKE=1 の起動時と、flow のテストの土台に使います。
 *
 * しおさい設計室（org-1）: owner みなと 太郎（u-owner）・admin いその 花子（u-admin）・
 *   member なぎさ 健（u-member）。プロジェクトを 2 件持っています。
 * なぎさ工房（org-2）: owner いその 花子（u-admin）。いその 花子は 2 つの組織にまたがります。
 */
export function seedDemo(store: FakeStore): void {
  store.profiles.set("u-owner", {
    id: "u-owner",
    email: "owner@example.com",
    name: "みなと 太郎",
    lang: "ja",
    createdAt: "2026-08-01T00:00:00.000Z",
  });
  store.profiles.set("u-admin", {
    id: "u-admin",
    email: "admin@example.com",
    name: "いその 花子",
    lang: "ja",
    createdAt: "2026-08-02T00:00:00.000Z",
  });
  store.profiles.set("u-member", {
    id: "u-member",
    email: "member@example.com",
    name: "なぎさ 健",
    lang: "ja",
    createdAt: "2026-08-03T00:00:00.000Z",
  });

  store.organizations.set("org-1", {
    id: "org-1",
    name: "しおさい設計室",
    createdAt: "2026-08-01T00:00:00.000Z",
  });
  store.organizations.set("org-2", {
    id: "org-2",
    name: "なぎさ工房",
    createdAt: "2026-08-10T00:00:00.000Z",
  });

  store.memberships.set(store.membershipKey("org-1", "u-owner"), {
    organizationId: "org-1",
    userId: "u-owner",
    role: "owner",
    createdAt: "2026-08-01T00:00:00.000Z",
  });
  store.memberships.set(store.membershipKey("org-1", "u-admin"), {
    organizationId: "org-1",
    userId: "u-admin",
    role: "admin",
    createdAt: "2026-08-02T00:00:00.000Z",
  });
  store.memberships.set(store.membershipKey("org-1", "u-member"), {
    organizationId: "org-1",
    userId: "u-member",
    role: "member",
    createdAt: "2026-08-03T00:00:00.000Z",
  });
  store.memberships.set(store.membershipKey("org-2", "u-admin"), {
    organizationId: "org-2",
    userId: "u-admin",
    role: "owner",
    createdAt: "2026-08-10T00:00:00.000Z",
  });

  const project1Id = store.nextId("projects");
  store.projects.set(project1Id, {
    id: project1Id,
    organizationId: "org-1",
    name: "コーポレートサイト刷新",
    note: "初回ヒアリングを踏まえて構成案を作成しています。",
    createdBy: "u-owner",
    createdAt: "2026-08-05T00:00:00.000Z",
    updatedAt: "2026-08-05T00:00:00.000Z",
  });

  const project2Id = store.nextId("projects");
  store.projects.set(project2Id, {
    id: project2Id,
    organizationId: "org-1",
    name: "パンフレット制作",
    note: "秋号の掲載内容を確認しています。",
    createdBy: "u-admin",
    createdAt: "2026-08-06T00:00:00.000Z",
    updatedAt: "2026-08-06T00:00:00.000Z",
  });
}
