/*
 * AI 書類読み取り（suminawa.dev の見本）。キット（@suminawa/doc-reader、vendor/ の tgz）の入口をそのまま使う。
 * 鍵は Vercel の ANTHROPIC_API_KEY だけから読む。鍵が無いあいだは、同梱の見本 5 枚だけ偽の答えで動く。
 */
import { createFakeClient, createReader, loadConfigFile, loadFakeAnswers, loadForms, resolveConfig, type Reader } from "@suminawa/doc-reader";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

let ready: Promise<Reader> | null = null;

function reader(): Promise<Reader> {
  if (ready === null) {
    ready = (async () => {
      const config = resolveConfig({ file: await loadConfigFile("reader/reader.config.json"), env: process.env });
      const forms = await loadForms(config.formsDir);
      const client = config.apiKey === null ? createFakeClient(await loadFakeAnswers("reader/samples")) : undefined;
      return createReader(config, { forms, client });
    })();
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
