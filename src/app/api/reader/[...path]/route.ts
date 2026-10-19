/*
 * AI 書類読み取り（suminawa.dev の見本）。キット（@suminawa/doc-reader、vendor/ の tgz）の入口をそのまま使う。
 * 鍵は Vercel の ANTHROPIC_API_KEY だけから読む。鍵が無いあいだは、同梱の見本 5 枚だけ偽の答えで動く。
 */
import { createAnthropicClient, createFakeClient, createReader, loadConfigFile, loadFakeAnswers, loadForms, resolveConfig, type AnthropicClientLike, type Reader } from "@suminawa/doc-reader";

/** API の失敗を、鍵や書類を出さずに実行ログへ（Vercel のログで原因が追えるように。キットは失敗を「読み取れません」に丸めて返す） */
function loggingClient(apiKey: string): AnthropicClientLike {
  const real = createAnthropicClient(apiKey);
  return {
    messages: {
      async create(params) {
        try {
          return await real.messages.create(params);
        } catch (error: unknown) {
          const e = error as { status?: number; error?: { error?: { type?: string; message?: string } }; message?: string };
          console.error("reader: API error", e.status ?? "-", e.error?.error?.type ?? "-", String(e.error?.error?.message ?? e.message ?? "").slice(0, 300));
          throw error;
        }
      },
    },
  };
}

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

let ready: Promise<Reader> | null = null;

function reader(): Promise<Reader> {
  if (ready === null) {
    ready = (async () => {
      // Vercel は proxy の後ろなので、訪問者のアドレスは x-forwarded-for から取る（無いと全員が同じ回数制限を分け合う）
      const env = { ...process.env, TRUST_PROXY: process.env.TRUST_PROXY ?? "1" };
      const config = resolveConfig({ file: await loadConfigFile("reader/reader.config.json"), env });
      const forms = await loadForms(config.formsDir);
      const client = config.apiKey === null ? createFakeClient(await loadFakeAnswers("reader/samples")) : loggingClient(config.apiKey);
      return createReader(config, { forms, client });
    })().catch((error: unknown) => {
      // 読み込みに失敗した約束を持ち続けない（次のリクエストでやり直す）
      ready = null;
      throw error;
    });
  }
  return ready;
}

export async function POST(request: Request): Promise<Response> {
  return (await reader()).fetch(request);
}
export async function GET(request: Request): Promise<Response> {
  return (await reader()).fetch(request);
}
export async function OPTIONS(request: Request): Promise<Response> {
  return (await reader()).fetch(request);
}
