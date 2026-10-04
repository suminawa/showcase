// このファイルは、SaaS スターター キットからの写しです。
// 直すときはキットの側を直してから、scripts/sync-saas-starter.mjs を走らせてください。
import type { Ports } from "../../ports";
import { FakeAuth } from "./auth";
import { FakeBilling } from "./billing";
import { FakeData } from "./data";
import { FakeMail } from "./mail";
import { seedDemo } from "./seed";
import { FakeStore } from "./store";

export { FakeAuth } from "./auth";
export { FakeBilling } from "./billing";
export { FakeData } from "./data";
export { FakeMail } from "./mail";
export { DEMO_USER_IDS, seedDemo } from "./seed";
export { FakeStore } from "./store";

export type CreateFakePortsOptions = {
  /** 既定は 2026-09-20T00:00:00.000Z。テストは自分で時計を渡してください */
  now?: () => Date;
  /** 既定は true（しおさい設計室・なぎさ工房の見本データを入れる） */
  seeded?: boolean;
};

/**
 * メモリだけで動く 4 つの ports 一式です。
 *
 * auth と store は、偽物であることを知っている側（合成の場所と、テスト）だけが使う
 * 入り口（signInAs・表の中身）を持っているため、もとの型のままお返しします。
 */
export type FakePorts = Ports & { store: FakeStore; auth: FakeAuth };

/** STARTER_FAKE=1 のときに使う、メモリだけで動く 4 つの ports 一式 */
export function createFakePorts(options: CreateFakePortsOptions = {}): FakePorts {
  const store = new FakeStore({ now: options.now });
  if (options.seeded !== false) seedDemo(store);

  return {
    store,
    auth: new FakeAuth(store),
    data: new FakeData(store),
    billing: new FakeBilling(store),
    mail: new FakeMail(store),
  };
}
