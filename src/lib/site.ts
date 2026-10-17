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
  "Google スプレッドシートで動く、買い切りの事務の道具（期限の通知・問い合わせの受付・予約ページほか）を、見本をその場で触ってから選べるサイトです。月額のサービス料はかかりません。設置や個別の自動化のご依頼もお受けします。運営は墨縄（suminawa）。";
