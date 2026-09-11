import { formatNewsDate, NEWS } from "./news";
import s from "./corporate-parts.module.css";

/** お知らせの一覧。日付は <time> が機械向けの形を持ち、表示は 2026.08.27 の形 */
export function NewsList() {
  return (
    <ul className={s.news}>
      {NEWS.map((item) => (
        <li key={item.id} className={s.newsItem}>
          <time className={s.newsDate} dateTime={item.date}>
            {formatNewsDate(item.date)}
          </time>
          <span className={s.newsTag}>{item.tag}</span>
          <span className={s.newsTitle}>{item.title}</span>
        </li>
      ))}
    </ul>
  );
}
