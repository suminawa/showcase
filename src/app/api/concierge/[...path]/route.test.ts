/*
 * /api/concierge の失敗のときの振る舞い。キットの入口をそのまま使うので、ここでは
 * 「鍵が無い・上限を超えた・上流が落ちた・設定が読めない」で何を返すかだけを確かめる。
 * 上流（Anthropic）には出ない: fetch を差し替える。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type Route = typeof import("./route");

/** route.ts は組み立てた窓口を持ち続けるので、場面ごとに読み直す */
async function load(): Promise<Route> {
  vi.resetModules();
  return import("./route");
}

function chat(route: Route, body: unknown, headers: Record<string, string> = {}) {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  return route.POST(
    new Request("https://suminawa.dev/api/concierge/chat", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "198.51.100.1", ...headers },
      body: text,
    }),
  );
}

beforeEach(() => {
  vi.stubEnv("ANTHROPIC_API_KEY", "");
  vi.stubEnv("ANTHROPIC_BASE_URL", "https://api.anthropic.com");
  vi.stubEnv("ADMIN_TOKEN", "");
  vi.stubEnv("LOG_WEBHOOK_URL", "");
  vi.stubGlobal("fetch", vi.fn(async () => new Response("down", { status: 500 })));
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("/api/concierge", () => {
  it("鍵が無いときは 200 の SSE で「いまはお答えできません」を返し、上流には出ない", async () => {
    const route = await load();
    const res = await chat(route, { question: "期限アラートは何ができますか" });
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain('"code":"unavailable"');
    expect(text).toContain('"answered":false');
    expect(fetch).not.toHaveBeenCalled();
  });

  it("上限を超えた質問・本文は 413、壊れた本文は 400、よその origin は 403", async () => {
    const route = await load();
    expect((await chat(route, { question: "あ".repeat(301) })).status).toBe(413);
    expect((await chat(route, { question: "x".repeat(70 * 1024) })).status).toBe(413);
    expect((await chat(route, "{not json")).status).toBe(400);
    expect((await chat(route, { question: "" })).status).toBe(400);
    expect((await chat(route, { question: "こんにちは" }, { origin: "https://evil.example" })).status).toBe(403);
  });

  it("同じ人の 1 分 7 回目は 429。別の人は通る", async () => {
    const route = await load();
    for (let i = 0; i < 6; i += 1) expect((await chat(route, { question: "こんにちは" })).status).toBe(200);
    const limited = await chat(route, { question: "こんにちは" });
    expect(limited.status).toBe(429);
    expect(await limited.json()).toMatchObject({ ok: false, code: "rate_limited" });
    expect((await chat(route, { question: "こんにちは" }, { "x-forwarded-for": "198.51.100.2" })).status).toBe(200);
  });

  it("上流が落ちていても、内部の文言を出さずに unavailable で閉じる", { timeout: 20_000 }, async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "sk-ant-test-not-a-real-key");
    const route = await load();
    const res = await chat(route, { question: "期限アラートは何ができますか" });
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain('"code":"unavailable"');
    expect(text).not.toContain("sk-ant");
    expect(text).not.toMatch(/500|down|anthropic/i);
    expect(fetch).toHaveBeenCalled();
  });

  it("設定が読めなかったら次の要求で組み直す（失敗を持ち続けない）", async () => {
    vi.stubEnv("CONCIERGE_INDEX", "concierge/data/no-such-index.json");
    const route = await load();
    await expect(chat(route, { question: "こんにちは" })).rejects.toThrow();
    vi.stubEnv("CONCIERGE_INDEX", "concierge/data/index.json");
    expect((await chat(route, { question: "こんにちは" })).status).toBe(200);
  });
});
