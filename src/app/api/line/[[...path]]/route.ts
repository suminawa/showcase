/*
 * LINE 案内窓口（suminawa.dev の見本）。
 * キット（@suminawa/line-concierge、vendor/ の tgz）の入口をそのまま使い、答える部品と文書は /api/concierge と同じ
 * （concierge/concierge.config.json の line の節、索引は concierge/data/index.json）。
 * 鍵は Vercel の環境変数だけから読む（LINE_CHANNEL_SECRET・LINE_CHANNEL_ACCESS_TOKEN・ANTHROPIC_API_KEY）。
 * Webhook は /api/line、状態確認は /api/line/health。先に 200 を返し、答えは after() で作って返信する。
 */
import { loadConfigFile, loadIndex } from "@suminawa/ai-concierge";
import { createLineBot, createStoreFromEnv, resolveLineConfig, type LineBot } from "@suminawa/line-concierge";
import { after } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

let ready: Promise<LineBot> | null = null;

function bot(): Promise<LineBot> {
  if (ready === null) {
    ready = (async () => {
      const env = {
        ...process.env,
        CONCIERGE_INDEX: process.env.CONCIERGE_INDEX ?? "concierge/data/index.json",
        TRUST_PROXY: process.env.TRUST_PROXY ?? "1",
      };
      const config = resolveLineConfig({ file: await loadConfigFile("concierge/concierge.config.json"), env });
      const index = await loadIndex(config.concierge.indexPath);
      return createLineBot(config, { index, store: createStoreFromEnv(env) });
    })();
  }
  return ready;
}

export async function POST(request: Request): Promise<Response> {
  const { response, work } = await (await bot()).handle(request);
  after(() => work);
  return response;
}

export async function GET(request: Request): Promise<Response> {
  return (await (await bot()).handle(request)).response;
}
