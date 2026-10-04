"use client";

/*
 * 期限アラートの見本。上に「届く 1 通」、その下（広い画面では右）に期限の表と「今日の日付」。
 * 通知の文はキットの実物の関数が作る（./demo.ts → ./kit/）。どこにも送らず、何も保存しない。
 */
import { useId, useRef, useState } from "react";

import s from "@/components/kit-demo/kit-demo.module.css";

import {
  SAMPLE_ROWS,
  SAMPLE_TODAY,
  SETTINGS_BROKEN,
  SETTINGS_OK,
  buildAlert,
  checkSettings,
  displayDate,
  jstToday,
  readToday,
  rowMarks,
  shiftRows,
  type DeadlineRow,
} from "./demo";

const STATUSES = ["", "着手", "完了"];
const MAX_ROWS = 12;

type Built = { rows: DeadlineRow[]; today: string };

export function DeadlineDemo() {
  const [rows, setRows] = useState<DeadlineRow[]>(SAMPLE_ROWS);
  const [todayText, setTodayText] = useState(SAMPLE_TODAY);
  const [built, setBuilt] = useState<Built>({ rows: SAMPLE_ROWS, today: SAMPLE_TODAY });
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"broken" | "ok">("broken");
  const resultHead = useRef<HTMLHeadingElement>(null);
  const id = useId();

  const alert = buildAlert(built.rows, built.today);
  const today = readToday(todayText);
  const marks = rowMarks(rows, today ?? built.today);
  const stale = built.rows !== rows || built.today !== today;

  function show(next: Built) {
    setBuilt(next);
    setError("");
    const head = resultHead.current;
    if (!head) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    head.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    head.focus({ preventScroll: true });
  }

  function build() {
    if (today === null) {
      setError("「今日の日付」を 2026-10-01 の形で入れてください。");
      return;
    }
    show({ rows, today });
  }

  function alignToRealToday() {
    const from = today ?? built.today;
    const real = jstToday(new Date());
    const shifted = shiftRows(rows, from, real);
    setRows(shifted);
    setTodayText(real);
    show({ rows: shifted, today: real });
  }

  function reset() {
    setRows(SAMPLE_ROWS);
    setTodayText(SAMPLE_TODAY);
    show({ rows: SAMPLE_ROWS, today: SAMPLE_TODAY });
  }

  function edit(index: number, key: keyof DeadlineRow, value: string) {
    setRows((current) => current.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  }

  const settings = mode === "broken" ? SETTINGS_BROKEN : SETTINGS_OK;
  const report = checkSettings(settings, built.rows, built.today);

  return (
    <>
      <div className={`${s.layout} ${s.layoutWideRight}`}>
        {/* ---- 届く 1 通 ---- */}
        <section className={`${s.section} ${s.sticky}`} aria-labelledby={`${id}-result`}>
          <h2 id={`${id}-result`} ref={resultHead} tabIndex={-1} className={s.head}>
            {displayDate(built.today)} の朝に届く 1 通
          </h2>
          <div className={s.post}>
            <p className={s.postMeta}>
              <span>期限アラート</span>
              <span>8:00 ごろ</span>
              <span>Slack か Discord へ</span>
            </p>
            {alert.text === null ? (
              <p className={s.empty}>この日に知らせるものはありません。キットは何も送りません。</p>
            ) : (
              <pre className={s.postText} data-stale={stale}>
                {alert.text}
              </pre>
            )}
          </div>
          <p className={s.small} aria-live="polite">
            {stale
              ? "表か日付を書き換えました。「通知を作る」を押すと、この 1 通を作り直します。"
              : `知らせたのは ${alert.notified} 件です。${alert.done > 0 ? `完了の ${alert.done} 件は知らせていません。` : ""}${alert.skipped > 0 ? `読めない行が ${alert.skipped} 件あり、末尾でお知らせしています。` : ""}`}
          </p>
        </section>

        {/* ---- 期限の表と今日の日付 ---- */}
        <section className={s.section} aria-labelledby={`${id}-sheet`}>
          <h2 id={`${id}-sheet`} className={s.head}>
            「期限」シート（書き換えられます）
          </h2>
          <div className={s.scroll} tabIndex={0} role="region" aria-label="期限の表">
            <table className={s.table}>
              <thead>
                <tr>
                  <th scope="col" className={s.rowNo}>
                    行
                  </th>
                  <th scope="col">件名</th>
                  <th scope="col">期限</th>
                  <th scope="col">担当</th>
                  <th scope="col">状態</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const n = i + 2;
                  return (
                    <tr key={i}>
                      <th scope="row" className={s.rowNo}>
                        {n}
                      </th>
                      <td style={{ minWidth: "12em" }}>
                        <textarea
                          className={`${s.input} ${s.cellText}`}
                          rows={1}
                          value={row.subject}
                          onChange={(e) => edit(i, "subject", e.target.value.replace(/\n/g, " "))}
                          aria-label={`${n} 行目の件名`}
                        />
                        {marks[i] !== "" && <span className={s.small} style={{ display: "block" }}>{marks[i]}</span>}
                      </td>
                      <td style={{ minWidth: "7.5em" }}>
                        <input
                          className={s.input}
                          value={row.due}
                          onChange={(e) => edit(i, "due", e.target.value)}
                          aria-label={`${n} 行目の期限`}
                          placeholder="2026-10-01"
                          inputMode="numeric"
                        />
                      </td>
                      <td style={{ minWidth: "4.5em" }}>
                        <input
                          className={s.input}
                          value={row.assignee}
                          onChange={(e) => edit(i, "assignee", e.target.value)}
                          aria-label={`${n} 行目の担当`}
                        />
                      </td>
                      <td style={{ minWidth: "4.5em" }}>
                        <select
                          className={s.input}
                          value={row.status}
                          onChange={(e) => edit(i, "status", e.target.value)}
                          aria-label={`${n} 行目の状態`}
                        >
                          {STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status === "" ? "（空）" : status}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className={s.small}>
            期限は 2026-10-01・2026/10/1・2026年10月1日 のどれでも読めます。「来週」のような字を入れると、キットがその行だけを知らせます。
          </p>

          <label className={s.field} style={{ maxWidth: "14em" }}>
            今日の日付
            <input
              type="date"
              className={s.input}
              value={todayText}
              onChange={(e) => setTodayText(e.target.value)}
            />
          </label>

          <div className={s.verbs}>
            <button type="button" className={`${s.verb} ${s.verbMain}`} onClick={build}>
              通知を作る
            </button>
            {rows.length < MAX_ROWS && (
              <button
                type="button"
                className={s.verb}
                onClick={() => setRows((current) => [...current, { subject: "", due: "", assignee: "", status: "" }])}
              >
                行を足す
              </button>
            )}
            <button type="button" className={s.verb} onClick={alignToRealToday}>
              実際の今日に合わせる
            </button>
            <button type="button" className={s.verb} onClick={reset}>
              見本に戻す
            </button>
          </div>
          <p className={s.small} role="alert">
            {error}
          </p>
          <p className={s.small}>
            設定はキットの見本と同じです（3 日前と当日に知らせ、期限を過ぎたものも知らせる。「完了」の行は知らせない）。書き換えた内容はこの画面の中だけで計算し、どこにも送りません。
          </p>
        </section>
      </div>

      {/* ---- 設定を確かめる ---- */}
      <section className={s.section} aria-labelledby={`${id}-check`} style={{ marginTop: "calc(2 * var(--rp-pitch))" }}>
        <h2 id={`${id}-check`} className={s.head}>
          メニュー「設定を確かめる」を押したとき
        </h2>
        <p className={s.body}>
          設定シートを書き間違えても、黙って止まることはありません。直すところを、どの行に何を書けばよいかまで全部お知らせします。
        </p>
        <fieldset className={s.choices}>
          <legend className={s.visuallyHidden}>設定シートの中身</legend>
          <label className={s.choice}>
            <input type="radio" name={`${id}-mode`} checked={mode === "broken"} onChange={() => setMode("broken")} />
            <span className={s.dot} aria-hidden="true" />
            書き間違えた設定
          </label>
          <label className={s.choice}>
            <input type="radio" name={`${id}-mode`} checked={mode === "ok"} onChange={() => setMode("ok")} />
            <span className={s.dot} aria-hidden="true" />
            正しい設定
          </label>
        </fieldset>
        <div className={s.layout}>
          <div className={s.scroll} tabIndex={0} role="region" aria-label="設定シート">
            <table className={s.table}>
              <caption className={s.visuallyHidden}>「設定」シート</caption>
              <thead>
                <tr>
                  <th scope="col">項目</th>
                  <th scope="col">値</th>
                </tr>
              </thead>
              <tbody>
                {settings.slice(1).map(([key, value], i) => {
                  const differs = value !== SETTINGS_OK[i + 1][1];
                  return (
                    <tr key={key} data-new={differs}>
                      <th scope="row" className={s.nowrap}>
                        {key}
                      </th>
                      <td style={{ overflowWrap: "anywhere" }}>
                        {key === "Webhook URL" && !differs ? "https://hooks.slack.com/services/…（ご自身の URL）" : value}
                        {differs && <span className={s.visuallyHidden}>（書き間違い）</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className={s.post} aria-live="polite">
            <p className={s.postMeta}>
              <span>スプレッドシートに出る確認の画面</span>
            </p>
            <pre className={s.postText}>{report}</pre>
          </div>
        </div>
      </section>
    </>
  );
}
