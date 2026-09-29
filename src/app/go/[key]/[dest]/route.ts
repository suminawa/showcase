/*
 * 売り場（note・BOOTH）への渡し口。/go/<key>/<dest>?from=<紙の道>
 *
 * - 渡し先は links.json にある URL だけ。知らない key・空の URL は 404（開いた転送にしない）
 * - 押された回数は Vercel の実行ログに 1 行の JSON で残す。残すのは key・dest・from の 3 つだけで、
 *   IP・Cookie・UA・Referer は読まない。from は既知の紙の道と照らし、知らない値は "unknown"
 *   （Vercel Web Analytics のサーバー側カスタムイベントは Pro 以上なので、ここではログに書く）
 */
import { resolveGo } from "@/lib/go";
import { sitemapPaths } from "@/lib/sitemap";

export const dynamic = "force-dynamic";

/** from として受け付ける道。suminawa.dev の紙の道（sitemap と同じ一覧）に限る */
const KNOWN_FROM = new Set(sitemapPaths());

function recordFrom(raw: string | null): string {
  return raw !== null && KNOWN_FROM.has(raw) ? raw : "unknown";
}

const COMMON = {
  "X-Robots-Tag": "noindex, nofollow",
  "Cache-Control": "no-store",
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string; dest: string }> },
): Promise<Response> {
  const { key, dest } = await params;
  const url = resolveGo(key, dest);
  if (url === null) {
    return new Response("Not Found", { status: 404, headers: { ...COMMON, "Content-Type": "text/plain; charset=utf-8" } });
  }

  const from = recordFrom(new URL(request.url).searchParams.get("from"));
  console.log(JSON.stringify({ event: "go", key, dest, from }));

  return new Response(null, {
    status: 302,
    headers: {
      ...COMMON,
      Location: url,
      // 売り場には suminawa.dev という出どころ（origin）だけを渡し、道や from は渡さない
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
  });
}
