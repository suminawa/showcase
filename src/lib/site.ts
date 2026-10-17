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

/** トップと根の description（日本語）。三つの柱（業務自動化・AI活用・Web制作）を必ず言う */
export const SITE_DESCRIPTION =
  "業務自動化・AI活用・Web制作。従業員 1〜30 人の会社・事務所・教室に向けて、Google スプレッドシートで動く期限の通知や予約の受付、自社の文書だけを根拠に答える AI 窓口や書類の読み取り、LP・サイト・Webアプリの制作を、買い切りのキット（税込 ¥2,980〜）と受託でお届けします。見本はその場で触れます。運営は墨縄（suminawa）。";
