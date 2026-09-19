/*
 * AI 案内窓口（suminawa.dev の実物）。
 * キット（@suminawa/ai-concierge、vendor/ の tgz）の入口をそのまま使う。
 * 設定は concierge/concierge.config.json、索引は concierge/data/index.json（npx ai-concierge index で作る）。
 * API キーは Vercel の環境変数 ANTHROPIC_API_KEY だけから読む。鍵が無いあいだは「いまはお答えできません」を返す。
 */
import { createConcierge, loadConfigFile, loadIndex, resolveConfig, type Concierge } from "@suminawa/ai-concierge";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

let ready: Promise<Concierge> | null = null;

function concierge(): Promise<Concierge> {
  if (ready === null) {
    ready = (async () => {
      // Vercel は proxy の後ろなので、訪問者のアドレスは x-forwarded-for から取る（無いと全員が同じ回数制限を分け合う）
      const env = {
        ...process.env,
        CONCIERGE_INDEX: process.env.CONCIERGE_INDEX ?? "concierge/data/index.json",
        TRUST_PROXY: process.env.TRUST_PROXY ?? "1",
      };
      const config = resolveConfig({ file: await loadConfigFile("concierge/concierge.config.json"), env });
      const index = await loadIndex(config.indexPath);
      return createConcierge(config, { index });
    })();
  }
  return ready;
}

export async function POST(request: Request): Promise<Response> {
  return (await concierge()).fetch(request);
}

export async function GET(request: Request): Promise<Response> {
  return (await concierge()).fetch(request);
}

export async function OPTIONS(request: Request): Promise<Response> {
  return (await concierge()).fetch(request);
}
