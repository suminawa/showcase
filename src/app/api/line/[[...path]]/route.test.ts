/*
 * /api/line（LINE の Webhook）の失敗のときの振る舞い。キットの入口をそのまま使うので、ここでは
 * 「鍵が無い・署名が違う・本文が大きい・上流が落ちた・設定が読めない」で何を返すかだけを確かめる。
 * LINE と Anthropic には出ない: fetch を差し替える。after() は受け取った仕事を手元に貯める。
 */
import { createHmac } from "node:crypto";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const works: Promise<unknown>[] = [];
vi.mock("next/server", () => ({
  after: (task: () => Promise<unknown>) => {
    works.push(Promise.resolve().then(task));
  },
}));

type Route = typeof import("./route");

const SECRET = "test-channel-secret";

/** route.ts は組み立てた窓口を持ち続けるので、場面ごとに読み直す */
async function load(): Promise<Route> {
  vi.resetModules();
  return import("./route");
}

function webhook(route: Route, body: string, signature: string | null = sign(body)) {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (signature !== null) headers["x-line-signature"] = signature;
  return route.POST(new Request("https://suminawa.dev/api/line", { method: "POST", headers, body }));
}

function sign(body: string): string {
  return createHmac("sha256", SECRET).update(body).digest("base64");
}

function textEvent(text: string): string {
  return JSON.stringify({
    destination: "U0",
    events: [
      {
        type: "message",
        mode: "active",
        timestamp: Date.now(),
        webhookEventId: `ev-${Math.random()}`,
        replyToken: "reply-token-1",
        source: { type: "user", userId: "U1234567890" },
        message: { id: "1", type: "text", text },
      },
    ],
  });
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  works.length = 0;
  vi.stubEnv("LINE_CHANNEL_SECRET", SECRET);
  vi.stubEnv("LINE_CHANNEL_ACCESS_TOKEN", "test-access-token");
  vi.stubEnv("ANTHROPIC_API_KEY", "");
  vi.stubEnv("ANTHROPIC_BASE_URL", "https://api.anthropic.com");
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
  vi.stubEnv("HANDOFF_WEBHOOK_URL", "");
  vi.stubEnv("LOG_WEBHOOK_URL", "");
  // LINE への返信は 200、それ以外（Anthropic）は落ちている
  fetchMock = vi.fn(async (input: string | URL | Request) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    return url.startsWith("https://api.line.me/") ? new Response("{}", { status: 200 }) : new Response("down", { status: 500 });
  });
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

/** LINE の返信 API へ送られた本文 */
function replies(): { replyToken: string; messages: { text: string }[] }[] {
  return fetchMock.mock.calls
    .filter(([input]) => String(input).includes("/v2/bot/message/reply"))
    .map(([, init]) => JSON.parse(String((init as RequestInit).body)));
}

describe("/api/line", () => {
  it("署名が無い・違うと 401 で、何もしない", async () => {
    const route = await load();
    const body = textEvent("こんにちは");
    expect((await webhook(route, body, null)).status).toBe(401);
    expect((await webhook(route, body, sign(body + " "))).status).toBe(401);
    await Promise.all(works);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("本文が 64KB を超えると 413、署名が合っても形が違うと 400", async () => {
    const route = await load();
    expect((await webhook(route, "x".repeat(65 * 1024))).status).toBe(413);
    expect((await webhook(route, "{}")).status).toBe(400);
  });

  it("LINE_CHANNEL_SECRET が無いと受け付けない（500）", async () => {
    vi.stubEnv("LINE_CHANNEL_SECRET", "");
    const route = await load();
    const res = await webhook(route, textEvent("こんにちは"), "anything");
    expect(res.status).toBe(500);
    await Promise.all(works);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("Anthropic の鍵が無いときは、先に 200 を返し、決まった断りの文を返信する", async () => {
    const route = await load();
    const res = await webhook(route, textEvent("期限アラートは何ができますか"));
    expect(res.status).toBe(200);
    await Promise.all(works);
    expect(replies()).toHaveLength(1);
    expect(replies()[0].messages[0].text).toContain("いまはお答えできません");
  });

  it("上流（Anthropic）が落ちていても 200 で、返信は内部の文言を含まない断りの文", { timeout: 20_000 }, async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "sk-ant-test-not-a-real-key");
    const route = await load();
    const res = await webhook(route, textEvent("期限アラートは何ができますか"));
    expect(res.status).toBe(200);
    await Promise.all(works);
    const [reply] = replies();
    expect(reply.messages[0].text).toContain("いまはお答えできません");
    expect(JSON.stringify(reply)).not.toMatch(/sk-ant|500|down/);
  });

  it("上限の字数を超えた質問は、AI に回さず断りの文を返す", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "sk-ant-test-not-a-real-key");
    const route = await load();
    await webhook(route, textEvent("あ".repeat(301)));
    await Promise.all(works);
    expect(fetchMock.mock.calls.some(([input]) => String(input).includes("anthropic"))).toBe(false);
    expect(replies()).toHaveLength(1);
  });

  it("設定が読めなかったら次の要求で組み直す（失敗を持ち続けない）", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://example.upstash.io");
    const route = await load();
    await expect(webhook(route, textEvent("こんにちは"))).rejects.toThrow(/UPSTASH/);
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    expect((await webhook(route, textEvent("こんにちは"))).status).toBe(200);
  });
});
