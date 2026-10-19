/*
 * AI 案内窓口・LINE 窓口の答えを、Anthropic の API ではなく syn-or（持ち主の Mac の claude -p。Claude の利用枠）で作るための差し替え口。
 * キット（@suminawa/ai-concierge・line-concierge）の AnthropicClientLike に合わせ、messages.stream() と同じ出来事（text_delta・citations_delta）を流す。
 * 道: Vercel → https://syn-or.com/api/relay/answer（Cloudflare Access のサービストークン）。鍵は Vercel の環境変数だけから読む。
 *   RELAY_URL（例 https://syn-or.com）・CF_ACCESS_CLIENT_ID・CF_ACCESS_CLIENT_SECRET。3 つがそろわなければ null（キットは ANTHROPIC_API_KEY にもどる）。
 */
import type { AnthropicClientLike } from "@suminawa/ai-concierge";
import type { AnthropicClientLike as ReaderClientLike, MessageParams as ReaderParams } from "@suminawa/doc-reader";

type Block = { type: string; text?: string; title?: string; source?: { data?: string } };
type Params = { system: { text: string }[]; messages: { role: "user" | "assistant"; content: string | Block[] }[]; max_tokens: number; output_config?: { effort: string } };
type Ev = { type: string; index?: number; delta?: { type: string; text?: string; citation?: { type: string; document_index: number } } };

export function relayEnv(env: Record<string, string | undefined> = process.env): { url: string; id: string; secret: string } | null {
  const url = env.RELAY_URL, id = env.CF_ACCESS_CLIENT_ID, secret = env.CF_ACCESS_CLIENT_SECRET;
  return url && id && secret ? { url: url.replace(/\/$/, ""), id, secret } : null;
}

/** キットの params を中継の形に。資料の番号は document ブロックの出現順（1 始まり。citations の document_index + 1 と同じ） */
export function toRelayBody(params: Params) {
  const documents: { index: number; title: string; text: string }[] = [];
  const messages = params.messages.map((m) => {
    if (typeof m.content === "string") return { role: m.role, text: m.content };
    const texts: string[] = [];
    for (const b of m.content) {
      if (b.type === "document") documents.push({ index: documents.length + 1, title: b.title ?? "", text: b.source?.data ?? "" });
      else if (b.type === "text" && b.text) texts.push(b.text);
    }
    return { role: m.role, text: texts.join("\n") };
  }).filter((m) => m.text.trim());
  return { system: params.system.map((s) => s.text).join("\n\n"), messages, documents, effort: params.output_config?.effort };
}

/** SSE を 1 行ずつ出来事に（event: と data: の 2 行 1 組） */
export async function* sseEvents(body: ReadableStream<Uint8Array>): AsyncGenerator<{ event: string; data: unknown }> {
  const reader = body.getReader(), dec = new TextDecoder();
  let buf = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    for (let cut = buf.indexOf("\n\n"); cut >= 0; cut = buf.indexOf("\n\n")) {
      const block = buf.slice(0, cut); buf = buf.slice(cut + 2);
      const event = block.match(/^event: (.*)$/m)?.[1], raw = block.match(/^data: (.*)$/m)?.[1];
      if (event && raw) { try { yield { event, data: JSON.parse(raw) }; } catch { /* 壊れた行 */ } }
    }
  }
}

export function createRelayClient(o: { url: string; id: string; secret: string; fetch?: typeof fetch }): AnthropicClientLike {
  const f = o.fetch ?? fetch;
  return {
    messages: {
      stream(params) {
        const ctl = new AbortController();
        let text = "";
        let sources: number[] = [];
        let finished: Promise<void> | null = null;
        const events: Ev[] = [];
        let notify: (() => void) | null = null;
        let ended = false;
        const push = (e?: Ev) => { if (e) events.push(e); else ended = true; notify?.(); };
        const run = async () => {
          const res = await f(`${o.url}/api/relay/answer`, {
            method: "POST", signal: ctl.signal,
            headers: { "content-type": "application/json", "CF-Access-Client-Id": o.id, "CF-Access-Client-Secret": o.secret },
            body: JSON.stringify(toRelayBody(params as Params)),
          });
          if (!res.ok || !res.body) throw new Error(`relay ${res.status}`);
          for await (const ev of sseEvents(res.body)) {
            if (ev.event === "text") { const t = String((ev.data as { text?: string }).text ?? ""); text += t; push({ type: "content_block_delta", index: 0, delta: { type: "text_delta", text: t } }); }
            else if (ev.event === "done") { const d = ev.data as { text?: string; sources?: number[] }; text = d.text ?? text; sources = d.sources ?? []; for (const n of sources) push({ type: "content_block_delta", index: 0, delta: { type: "citations_delta", citation: { type: "char_location", document_index: n - 1 } } }); }
            else if (ev.event === "error") throw new Error(`relay: ${(ev.data as { reason?: string }).reason ?? "failed"}`);
          }
        };
        const start = () => (finished ??= run().finally(() => push()));
        const iterator: AsyncIterator<Ev> = {
          async next() {
            void start();
            for (;;) {
              if (events.length) return { value: events.shift()!, done: false };
              if (ended) { await finished; return { value: undefined as unknown as Ev, done: true }; }
              await new Promise<void>((r) => { notify = r; });
              notify = null;
            }
          },
        };
        return {
          [Symbol.asyncIterator]: () => iterator,
          async finalMessage() {
            await start();
            return { stop_reason: "end_turn", usage: {}, content: [{ type: "text", text, citations: sources.map((n) => ({ type: "char_location", document_index: n - 1 })) }] };
          },
          abort() { ctl.abort(); },
        };
      },
    },
  };
}

/** 環境変数がそろっていれば中継の client、無ければ null（キットは API キーで動く） */
export function relayClient(): AnthropicClientLike | null {
  const env = relayEnv();
  return env ? createRelayClient(env) : null;
}

/*
 * AI 書類読み取り（@suminawa/doc-reader）の差し替え口。書類（PDF・画像の base64）と帳票の型の JSON Schema を同じ中継に送り、
 * 中継は Mac の claude -p に書類を Read させて構造化出力で返す。messages.create() の形に戻す。
 */
type FileBlock = { type: string; title?: string; source: { media_type: string; data: string } };

/** キットの params を中継の形に（書類 1 枚 + 文 + schema）。書類が無ければ null */
export function toExtractBody(params: ReaderParams) {
  const content = params.messages[0]?.content;
  if (!Array.isArray(content)) return null;
  const file = content.find((b) => b.type === "document" || b.type === "image") as FileBlock | undefined;
  if (!file) return null;
  const user = content.flatMap((b) => (b.type === "text" && "text" in b && typeof b.text === "string" ? [b.text] : [])).join("\n");
  return {
    system: params.system.map((s) => s.text).join("\n\n"), user,
    file: { name: file.title ?? "document", mediaType: file.source.media_type, data: file.source.data },
    schema: params.output_config?.format?.schema ?? {}, effort: params.output_config?.effort,
  };
}

export function createRelayReaderClient(o: { url: string; id: string; secret: string; fetch?: typeof fetch; timeoutMs?: number }): ReaderClientLike {
  const f = o.fetch ?? fetch;
  return {
    messages: {
      async create(params) {
        const body = toExtractBody(params);
        if (!body) throw Object.assign(new Error("relay: no document"), { status: 400 });
        const res = await f(`${o.url}/api/relay/answer`, {
          method: "POST", signal: AbortSignal.timeout(o.timeoutMs ?? 58_000),
          headers: { "content-type": "application/json", "CF-Access-Client-Id": o.id, "CF-Access-Client-Secret": o.secret },
          body: JSON.stringify(body),
        });
        const data = (await res.json().catch(() => ({}))) as { text?: string; error?: string };
        // 中継の状態をそのまま status に（キットは 429 → 混雑、他 → いまは読み取れません、に直す）。鍵や書類は出さない
        if (!res.ok || typeof data.text !== "string") throw Object.assign(new Error(`relay ${res.status}: ${data.error ?? "no-text"}`), { status: res.ok ? 502 : res.status });
        return { stop_reason: "end_turn", content: [{ type: "text", text: data.text }], usage: { input_tokens: 0, output_tokens: 0 } };
      },
    },
  };
}

/** 環境変数がそろっていれば書類読み取りの中継 client、無ければ null */
export function relayReaderClient(): ReaderClientLike | null {
  const env = relayEnv();
  return env ? createRelayReaderClient(env) : null;
}
