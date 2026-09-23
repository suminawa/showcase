import { formatYen } from "@/lib/format";
import { cumulativeRevenue, sparklinePath, totals, type Board as BoardData, type DayRow } from "@/lib/thirtydays";
import c from "./board.module.css";

const WIDTH = 300;
const HEIGHT = 40;

export type Product = {
  name: string;
  date: string;
  links: { note?: string; booth?: string };
};

/** "2026-09-22" → "9/22" */
function shortDate(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${Number(m)}/${Number(d)}`;
}

/**
 * 帳面。合計だけが「大」で、他はすべて「小」。枠を持たず、罫は墨の一本だけ。
 * 折れ線は累計売上。色は墨の一色で、軸も凡例も持たない（数字は表が持つ）。
 *
 * 表には数字だけを置く。文（出したもの・AI がやったこと）は表の列に入れると
 * 一行が縦に伸びて読めなくなるので、表の下に「日々の記録」として普通の行幅で並べる。
 */
export function Board({ board, products }: { board: BoardData; products: Product[] }) {
  const t = totals(board.days);
  const cumulative = cumulativeRevenue(board.days);
  const latest = board.days[board.days.length - 1];
  const newestFirst: DayRow[] = [...board.days].reverse();

  return (
    <div className={c.board}>
      <div className={c.totalBlock}>
        <p className={c.totalLabel}>累計売上（Day {latest?.day ?? 0} まで）</p>
        <p className={c.total}>{formatYen(t.revenue)}</p>
      </div>

      <dl className={c.stats}>
        <div className={c.stat}><dt>提案送信</dt><dd>{t.proposals} 件</dd></div>
        <div className={c.stat}><dt>返信</dt><dd>{t.replies} 件</dd></div>
        <div className={c.stat}><dt>商談</dt><dd>{t.meetings} 件</dd></div>
        <div className={c.stat}><dt>人間の介在</dt><dd>平均 {t.avgHumanMinutes} 分 / 日</dd></div>
      </dl>

      {cumulative.length > 1 && (
        <svg
          className={c.sparkline}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={`累計売上の推移。現在 ${formatYen(t.revenue)}`}
        >
          <path d={sparklinePath(cumulative, WIDTH, HEIGHT)} />
        </svg>
      )}

      <section className={c.section} aria-labelledby="products-heading">
        <h2 id="products-heading" className={c.sectionTitle}>
          出したもの <span className={c.count}>{products.length} 本</span>
        </h2>
        <ol className={c.products}>
          {products.map((product) => (
            <li key={product.name} className={c.productRow}>
              <span className={c.productDate}>{product.date}</span>
              <span className={c.productName}>{product.name}</span>
              <span className={c.productLinks}>
                {product.links.note && (
                  <a href={product.links.note} className={c.link}>
                    note
                  </a>
                )}
                {product.links.note && product.links.booth && <span className={c.slash}>/</span>}
                {product.links.booth && (
                  <a href={product.links.booth} className={c.link}>
                    BOOTH
                  </a>
                )}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className={c.section} aria-labelledby="table-heading">
        <h2 id="table-heading" className={c.sectionTitle}>
          日ごとの数字
        </h2>
        <div className={c.tableWrap}>
          <table className={c.table}>
            <thead>
              <tr>
                <th scope="col">Day</th>
                <th scope="col">日付</th>
                <th scope="col">売上</th>
                <th scope="col">提案</th>
                <th scope="col">返信</th>
                <th scope="col">商談</th>
                <th scope="col">人間（分）</th>
              </tr>
            </thead>
            <tbody>
              {newestFirst.map((d) => (
                <tr key={d.day}>
                  <th scope="row">{d.day}</th>
                  <td>{shortDate(d.date)}</td>
                  <td>{formatYen(d.revenue)}</td>
                  <td>{d.proposals}</td>
                  <td>{d.replies}</td>
                  <td>{d.meetings}</td>
                  <td>{d.humanMinutes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={c.section} aria-labelledby="log-heading">
        <h2 id="log-heading" className={c.sectionTitle}>
          日々の記録
        </h2>
        <ol className={c.log}>
          {newestFirst.map((d) => (
            <li key={d.day} className={c.logEntry}>
              <h3 className={c.logHead}>
                Day {d.day}
                <span className={c.logDate}>{shortDate(d.date)}</span>
              </h3>
              {d.release && <p className={c.logRelease}>出したもの: {d.release}</p>}
              <p className={c.logBody}>{d.ai || "—"}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
