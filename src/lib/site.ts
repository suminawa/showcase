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
