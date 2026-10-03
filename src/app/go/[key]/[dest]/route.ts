/*
 * 売り場（note・BOOTH）への渡し口。/go/<key>/<dest>?from=<紙の道>
 *
 * - 渡し先は links.json にある URL だけ。知らない key・空の URL は 404（開いた転送にしない）
 * - 押された回数は Vercel Web Analytics のカスタムイベント「go」で数える（Cookie を使わない計測。
 *   こちらが添える値は target（key/dest）と from の 2 つだけ。Pro の枠が 2 つまでのため）。
 *   実行ログには key・dest・from を 1 行の JSON で残す。
 *   from は既知の紙の道と照らし、知らない値は "unknown"。こちらのコードは IP・Cookie・UA を読まず、保存もしない
 * - イベントの送信に失敗しても転送は止めない
 * - 英仏の紙から BOOTH へは、BOOTH の英語の画面へ渡す（localizeBooth）
 */
import { track } from "@vercel/analytics/server";
import { localizeBooth, resolveGo } from "@/lib/go";
import { sitemapPaths } from "@/lib/sitemap";

export const dynamic = "force-dynamic";

// track() の送り先の既定は VERCEL_URL（デプロイごとの *.vercel.app）。そこは保護がかかっていて届かないので、
// 本番では公開ドメインの受け口へ送る。
if (process.env.VERCEL_ENV === "production") {
  process.env.VERCEL_WEB_ANALYTICS_ENDPOINT ??= "https://suminawa.dev/_vercel/insights/event";
}

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
  try {
    await track("go", { target: `${key}/${dest}`, from }, { request });
  } catch {
    // 計測の失敗で売り場への案内を止めない
  }

  return new Response(null, {
    status: 302,
    headers: {
      ...COMMON,
      Location: dest === "booth" ? localizeBooth(url, from) : url,
      // 売り場には suminawa.dev という出どころ（origin）だけを渡し、道や from は渡さない
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
  });
}
