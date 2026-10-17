"use client";
/*
 * トップの右半分の見本。期限アラートの「期限」シートと、その朝に届く 1 通。
 * 1 通はキットの実物の関数（projects/deadline/kit/）がこの画面の中で作る。どこにも送らず、何も保存しない。
 * 見本の今日を一日ずつ進める・表の期限や状態を書き換えると、1 通がその場で作り直される。
 * 最初の描画（サーバー）から中身を持つので、読み込みで何も跳ねない。
 */
import Link from "next/link";
import { useId, useState } from "react";

import {
  SAMPLE_ROWS,
  SAMPLE_TODAY,
  addDays,
  buildAlert,
  displayDate,
  type DeadlineRow,
} from "@/app/(ja)/projects/deadline/demo";

import s from "./hero-sheet.module.css";

/** 見本の台帳の頭の 5 行（期限を過ぎたもの・今日・3 日後がそろう） */
const ROWS: DeadlineRow[] = SAMPLE_ROWS.slice(0, 5);
const STATUSES = ["", "着手", "完了"];
const COLUMNS = ["A", "B", "C", "D"];

export function HeroSheet() {
  const [rows, setRows] = useState<DeadlineRow[]>(ROWS);
  const [today, setToday] = useState(SAMPLE_TODAY);
  const id = useId();

  const alert = buildAlert(rows, today);
  const changed = today !== SAMPLE_TODAY || rows !== ROWS;

  function edit(index: number, key: keyof DeadlineRow, value: string) {
    setRows((current) => current.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  }

  return (
    <figure className={s.demo} aria-labelledby={`${id}-cap`}>
      <figcaption className={s.cap} id={`${id}-cap`}>
        <span className={s.capLabel}>動く見本</span>
        <span className={s.capName}>期限アラート GAS キット</span>
      </figcaption>
      <p className={s.hint}>日付を進めたり、期限や状態を書き換えたりすると、毎朝届く 1 通がその場で変わります。</p>

      <div className={s.sheetWrap} role="region" aria-label="「期限」シート（書き換えられます）" tabIndex={0}>
        <table className={s.sheet}>
          <caption className={s.hidden}>「期限」シート。期限と状態は書き換えられます</caption>
          <colgroup>
            <col className={s.colNo} />
            <col className={s.colSubject} />
            <col className={s.colDue} />
            <col className={s.colWho} />
            <col className={s.colState} />
          </colgroup>
          <thead>
            <tr className={s.letters} aria-hidden="true">
              <td />
              {COLUMNS.map((c) => (
                <td key={c}>{c}</td>
              ))}
            </tr>
            <tr>
              <td className={s.rowNo} aria-hidden="true">
                1
              </td>
              <th scope="col">件名</th>
              <th scope="col">期限</th>
              <th scope="col">担当</th>
              <th scope="col">状態</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} data-done={row.status === "完了"}>
                <td className={s.rowNo} aria-hidden="true">
                  {i + 2}
                </td>
                <th scope="row" className={s.subject}>
                  {row.subject}
                </th>
                <td className={s.cell}>
                  <input
                    className={s.input}
                    value={row.due}
                    onChange={(e) => edit(i, "due", e.target.value)}
                    aria-label={`${row.subject}の期限`}
                    inputMode="numeric"
                    spellCheck={false}
                    autoComplete="off"
                  />
                </td>
                <td>{row.assignee}</td>
                <td className={s.cell}>
                  <select
                    className={s.input}
                    value={row.status}
                    onChange={(e) => edit(i, "status", e.target.value)}
                    aria-label={`${row.subject}の状態`}
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status === "" ? "—" : status}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={s.today}>
        <span className={s.todayLabel} id={`${id}-today`}>
          見本の今日
        </span>
        <button type="button" className={s.step} onClick={() => setToday((d) => addDays(d, -1))} aria-label="前の日にする">
          ‹
        </button>
        <output className={s.date} aria-labelledby={`${id}-today`} aria-live="polite">
          {displayDate(today)}
        </output>
        <button type="button" className={s.step} onClick={() => setToday((d) => addDays(d, 1))} aria-label="次の日にする">
          ›
        </button>
        {changed && (
          <button
            type="button"
            className={s.reset}
            onClick={() => {
              setRows(ROWS);
              setToday(SAMPLE_TODAY);
            }}
          >
            見本に戻す
          </button>
        )}
      </div>

      <div className={s.post}>
        {/* 作り直した直後だけ、1 通の内側の縁を一度だけ光らせる（変わったことを示す）。
            中身が変わるたびに key で置き直すので、CSS の animation が一度ずつ走る。reduced-motion では出さない */}
        {changed && <span key={`${today}|${alert.text}`} className={s.flash} aria-hidden="true" />}
        <p className={s.postHead}>{displayDate(today)}の朝、8 時台に届く 1 通</p>
        {alert.text === null ? (
          <p className={s.empty}>この日に知らせるものはありません。キットは何も送りません。</p>
        ) : (
          <pre className={s.postText}>{alert.text}</pre>
        )}
      </div>
      <p className={s.note}>
        この 1 通は、キットの関数がこの画面の中で作っています。どこにも送りません。{" "}
        <Link href="/projects/deadline" className={s.more}>
          表と設定をもっと触る
        </Link>
      </p>
    </figure>
  );
}
