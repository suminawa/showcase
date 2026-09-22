/**
 * 公開 URL の起点。共有カードの絶対 URL と sitemap に要る。
 * 明示指定 → Vercel の割り当て → ローカル の順で解決する。
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3010");
