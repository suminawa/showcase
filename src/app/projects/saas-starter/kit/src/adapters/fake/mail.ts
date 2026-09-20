// このファイルは、SaaS スターター キットからの写しです。
// 直すときはキットの側を直してから、scripts/sync-saas-starter.mjs を走らせてください。
import type { MailMessage, MailPort, MailResult } from "../../ports/mail";
import type { FakeStore } from "./store";

/** 送らずに store.mails に積むだけ（外部へは何も通信しません） */
export class FakeMail implements MailPort {
  constructor(private readonly store: FakeStore) {}

  async send(message: MailMessage): Promise<MailResult> {
    this.store.mails.push(structuredClone(message));
    return { ok: true };
  }
}
