import { describe, it, expect } from "vitest";
import { createRelayClient, toRelayBody, relayEnv } from "./relay-client";

const params = {
  system: [{ text: "敬体で。" }], max_tokens: 700, output_config: { effort: "low" },
  messages: [
    { role: "user" as const, content: [{ type: "document", title: "料金", source: { type: "text", media_type: "text/plain", data: "キットは 2,980 円から" } }, { type: "document", title: "納期", source: { type: "text", media_type: "text/plain", data: "3 日ほど" } }, { type: "text", text: "納期はどれくらい？" }] },
  ],
};
const sse = (lines: string[]) => new ReadableStream<Uint8Array>({ start(c) { c.enqueue(new TextEncoder().encode(lines.join(""))); c.close(); } });

describe("toRelayBody", () => {
  it("資料は出現順に 1 から番号を付け、文は質問だけにする", () => {
    const b = toRelayBody(params);
    expect(b.documents.map((d) => [d.index, d.title])).toEqual([[1, "料金"], [2, "納期"]]);
    expect(b.messages).toEqual([{ role: "user", text: "納期はどれくらい？" }]);
    expect(b.system).toBe("敬体で。"); expect(b.effort).toBe("low");
  });
});

describe("createRelayClient", () => {
  it("中継の SSE を text_delta と citations_delta に直し、finalMessage に出典を付ける", async () => {
    let seen: { url: string; headers: Record<string, string> } | null = null;
    const f = (async (url: string | URL | Request, init?: RequestInit) => {
      seen = { url: String(url), headers: init?.headers as Record<string, string> };
      return new Response(sse(["event: text\ndata: {\"text\":\"3 日\"}\n\n", "event: text\ndata: {\"text\":\"ほどです。\"}\n\n", "event: done\ndata: {\"text\":\"3 日ほどです。\",\"sources\":[2]}\n\n"]), { status: 200 });
    }) as unknown as typeof fetch;
    const c = createRelayClient({ url: "https://syn-or.com", id: "ID", secret: "SECRET", fetch: f });
    const s = c.messages.stream(params as never);
    const got: string[] = []; const cites: number[] = [];
    for await (const e of s) { if (e.delta?.type === "text_delta") got.push(e.delta.text!); if (e.delta?.type === "citations_delta") cites.push(e.delta.citation!.document_index); }
    const fin = await s.finalMessage();
    expect(got.join("")).toBe("3 日ほどです。"); expect(cites).toEqual([1]);
    expect(fin.content?.[0]).toMatchObject({ type: "text", text: "3 日ほどです。", citations: [{ document_index: 1 }] });
    expect(seen!.url).toBe("https://syn-or.com/api/relay/answer");
    expect(seen!.headers["CF-Access-Client-Id"]).toBe("ID");
  });
  it("中継が error を返したら投げる（キットは『いまはお答えできません』にする）", async () => {
    const f = (async () => new Response(sse(["event: error\ndata: {\"reason\":\"timeout\"}\n\n"]), { status: 200 })) as unknown as typeof fetch;
    const s = createRelayClient({ url: "https://x", id: "a", secret: "b", fetch: f }).messages.stream(params as never);
    await expect((async () => { for await (const _ of s) { void _; } })()).rejects.toThrow("relay: timeout");
  });
  it("環境変数が 3 つそろったときだけ中継を使う", () => {
    expect(relayEnv({})).toBeNull();
    expect(relayEnv({ RELAY_URL: "https://syn-or.com/", CF_ACCESS_CLIENT_ID: "a", CF_ACCESS_CLIENT_SECRET: "b" })).toEqual({ url: "https://syn-or.com", id: "a", secret: "b" });
  });
});
