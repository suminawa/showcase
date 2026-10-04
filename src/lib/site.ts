/**
 * 紙の住所。共有カードの絶対 URL と sitemap が同じものを読む。
 *
 * 明示指定 → Vercel の割り当て → 手元、の順で解決する。手元の既定が 3010 なのは
 * package.json の dev がその番号で立つからで、ほかの番号で立てたときは
 * NEXT_PUBLIC_SITE_URL を渡す。
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3010");

/** サイトの名乗り。title の接尾辞・og:site_name・構造化データが同じ字を読む */
export const SITE_NAME = "墨縄 suminawa";

/** トップと根の description（日本語） */
export const SITE_DESCRIPTION =
  "業務の自動化と Web の小さな道具をつくる墨縄（suminawa）のサイトです。Google Apps Script（GAS）や AI を使ったキットと見本を、ブラウザでそのまま試せる形で置いています。";
