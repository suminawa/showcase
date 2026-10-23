/*
 * 頼み方と目安の階段（PRICE_LADDER）。トップと /contact が同じ表を置く。
 * PC は 3 列の表、スマホは行ごとの札（横に送らない）。
 */
import { PRICE_LADDER, PRICE_LADDER_NOTE } from "@/lib/projects";

import s from "./price-ladder.module.css";

export function PriceLadder({ caption }: { caption?: string }) {
  return (
    <div className={s.wrap}>
    <table className={s.ladder}>
      {caption && <caption className={s.caption}>{caption}</caption>}
      <thead>
        <tr>
          <th scope="col">頼み方</th>
          <th scope="col">目安</th>
          <th scope="col">向く方</th>
        </tr>
      </thead>
      <tbody>
        {PRICE_LADDER.map((row) => (
          <tr key={row.how}>
            <th scope="row">{row.how}</th>
            <td className={s.price}>{row.price}</td>
            <td className={s.who}>{row.who}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <p className={s.note}>{PRICE_LADDER_NOTE}</p>
    </div>
  );
}
