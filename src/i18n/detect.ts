/*
 * 最初の言語の判定。proxy.ts が呼ぶ純粋な関数で、要求の中身だけから決める。
 *
 *   1. ?hl=ja|en|fr     … 切り替えのリンク。Cookie に覚えて、その言語の道へ（クエリは外す）
 *   2. ボット            … 何もしない（地域で振り分けない。各言語は自分の URL で巡回される）
 *   3. Cookie lang       … 選んだ言語に従う
 *   4. 推定              … x-vercel-ip-country が JP なら日本語、ほかは英語（Accept-Language の先頭が fr なら仏語）。
 *                          国が分からなければ Accept-Language だけで決める。推定では Cookie を置かない
 *
 * 働くのは日本語の道（接頭辞なし）で訳のある紙だけ。英仏の道に来た人には、その言語をそのまま出す。
 */
import {
  LANG_QUERY,
  isLang,
  isTranslated,
  localePath,
  splitLang,
  type Lang,
} from "./routes";

const BOT =
  /bot|crawl|spider|slurp|facebookexternalhit|embedly|preview|lighthouse|headless|mediapartners|bingpreview|vercel-screenshot/i;

export function isBot(userAgent: string | null | undefined): boolean {
  return !!userAgent && BOT.test(userAgent);
}

/** Accept-Language の言語を q の高い順に（「fr-CA,fr;q=0.9,en;q=0.8」→ fr, fr, en） */
function preferred(acceptLanguage: string | null | undefined): string[] {
  if (!acceptLanguage) return [];
  return acceptLanguage
    .split(",")
    .map((part, i) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return { base: tag.trim().toLowerCase().split("-")[0], q: q ? Number(q.trim().slice(2)) : 1, i };
    })
    .filter((x) => x.base && x.base !== "*" && x.q > 0)
    .sort((a, b) => b.q - a.q || a.i - b.i)
    .map((x) => x.base);
}

/** Cookie の無い人の言語 */
export function guessLang(country: string | null | undefined, acceptLanguage: string | null | undefined): Lang {
  const langs = preferred(acceptLanguage);
  if (country) {
    if (country.toUpperCase() === "JP") return "ja";
    return langs[0] === "fr" ? "fr" : "en";
  }
  // 国が分からない（手元の開発など）。ヘッダーも無ければ日本語のまま
  const first = langs.find((l) => l === "ja" || l === "en" || l === "fr");
  if (first) return first as Lang;
  return langs.length > 0 ? "en" : "ja";
}

export type LangRequest = {
  pathname: string;
  search: string;
  cookie?: string | null;
  country?: string | null;
  acceptLanguage?: string | null;
  userAgent?: string | null;
};

/** 転送先（道 + クエリ）と、置く Cookie。何もしないときは null */
export type LangDecision = { redirect: string; setCookie?: Lang } | null;

export function decideLang(req: LangRequest): LangDecision {
  const { lang: urlLang, path } = splitLang(req.pathname);
  if (!isTranslated(path)) return null;

  const params = new URLSearchParams(req.search);
  const chosen = params.get(LANG_QUERY);
  if (isLang(chosen)) {
    params.delete(LANG_QUERY);
    const qs = params.toString();
    return { redirect: localePath(chosen, path) + (qs ? `?${qs}` : ""), setCookie: chosen };
  }

  // 英仏の道はその言語のまま出す。判定するのは日本語の道だけ
  if (urlLang !== "ja") return null;
  if (isBot(req.userAgent)) return null;

  const want = isLang(req.cookie) ? req.cookie : guessLang(req.country, req.acceptLanguage);
  if (want === "ja") return null;
  return { redirect: localePath(want, path) + req.search };
}
