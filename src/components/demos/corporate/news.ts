/**
 * 見本「潮見計測」のお知らせ。架空の日付と題名。
 * 配列は新しい順に並べる ── 表示もこの順で、並べ替えはしない。
 */
export type NewsTag = "お知らせ" | "実績";

export type NewsItem = {
  id: string;
  /** YYYY-MM-DD。<time datetime> にそのまま入れる */
  date: string;
  tag: NewsTag;
  title: string;
};

export const NEWS: readonly NewsItem[] = [
  {
    id: "inspection",
    date: "2026-08-27",
    tag: "お知らせ",
    title: "夏季の観測機器の点検について",
  },
  {
    id: "coastal-survey",
    date: "2026-07-15",
    tag: "実績",
    title: "沿岸部の底質調査を 3 件受託しました",
  },
  {
    id: "report-format",
    date: "2026-06-02",
    tag: "お知らせ",
    title: "解析レポートの様式を改めました",
  },
];

/** "2026-08-27" -> "2026.08.27" */
export function formatNewsDate(date: string): string {
  return date.split("-").join(".");
}
