import { formatYen } from "@/lib/format";
import { cumulativeRevenue, sparklinePath, totals, type Board as BoardData } from "@/lib/thirtydays";
import c from "./board.module.css";

const WIDTH = 300;
const HEIGHT = 40;

/**
 * 帳面。合計だけが「大」で、他はすべて「小」。枠を持たず、罫は墨の一本だけ。
 * 折れ線は累計売上。色は墨の一色で、軸も凡例も持たない（数字は表が持つ）。
 */
export function Board({ board }: { board: BoardData }) {
  const t = totals(board.days);
  const cumulative = cumulativeRevenue(board.days);
  const latest = board.days[board.days.length - 1];

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

      <div className={c.tableWrap}>
        <table className={c.table}>
          <caption className={c.srOnly}>日ごとの記録</caption>
          <thead>
            <tr>
              <th scope="col">Day</th>
              <th scope="col">売上</th>
              <th scope="col">提案</th>
              <th scope="col">返信</th>
              <th scope="col">商談</th>
              <th scope="col">人間（分）</th>
              <th scope="col" className={c.textCol}>出したもの</th>
              <th scope="col" className={c.textCol}>AI がやったこと</th>
            </tr>
          </thead>
          <tbody>
            {[...board.days].reverse().map((d) => (
              <tr key={d.day}>
                <th scope="row">{d.day}</th>
                <td>{formatYen(d.revenue)}</td>
                <td>{d.proposals}</td>
                <td>{d.replies}</td>
                <td>{d.meetings}</td>
                <td>{d.humanMinutes}</td>
                <td className={c.textCol}>{d.release || "—"}</td>
                <td className={c.textCol}>{d.ai || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
