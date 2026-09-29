"use client";

/*
 * フォーム受付の見本。上（広い画面では左）に「キットがすること」── 受付シートの行・通知・自動返信、
 * その下（右）に送れるフォーム。送信はキットの doPost と同じ順の関数（./demo.ts → ./kit/）が
 * この画面の中で受け、どこにも送らない。ページを閉じると消える。
 */
import { useId, useRef, useState, type FormEvent } from "react";

import s from "@/components/kit-demo/kit-demo.module.css";

import { formValues, initialBook, receive, sampleOutcome, slotOptions, type Book, type Outcome } from "./demo";

const SAMPLE = sampleOutcome();

const KIND_TEXT: Record<Outcome["kind"], string> = {
  accepted: "受け付けました。受付シートに 1 行足し、通知と自動返信を作りました。",
  repeated: "10 分以内に同じ内容が届いたので、前回と同じ受付番号を返しました。行は増えず、通知も自動返信も出しません（二重送信の防止）。",
  spam: "見えない欄に字が入っていたので、迷惑投稿として捨てました。bot に気づかれないよう、フォームには「受け付けた」と返します。行も通知も自動返信もありません。",
  invalid: "受け付けませんでした。キットが返す文（フォームの下に出ています）を、そのまま画面に出せます。行も通知も自動返信もありません。",
  full: "選ばれた日時は定員に達しているので、受け付けませんでした。シートにも書かず、通知も出しません。",
};

export function FormDemo() {
  const [book, setBook] = useState<Book>(initialBook);
  const [outcome, setOutcome] = useState<Outcome>(SAMPLE);
  const [isSample, setIsSample] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [slot, setSlot] = useState("");
  const [bot, setBot] = useState(false);
  const resultHead = useRef<HTMLHeadingElement>(null);
  const id = useId();

  const options = slotOptions(book);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // 帳面は見本の 1 件が入る前から始まる（見本の 1 件は見せるだけで、枠の数には入れない）
    const next = receive(book, formValues({ name, email, message, slot, honeypot: bot ? "https://spam.example/" : "" }), new Date());
    setBook(next.book);
    setOutcome(next);
    setIsSample(false);
    const head = resultHead.current;
    if (!head) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    head.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    head.focus({ preventScroll: true });
  }

  function reset() {
    setBook(initialBook());
    setOutcome(SAMPLE);
    setIsSample(true);
    setName("");
    setEmail("");
    setMessage("");
    setSlot("");
    setBot(false);
  }

  const shownBook = outcome.book;
  const header = shownBook.intake[0];
  const newRow = outcome.row?.rowNumber ?? -1;
  const answer = JSON.stringify(outcome.answer);

  return (
    <div className={s.layout}>
      {/* ---- キットがすること ---- */}
      <div className={s.col}>
        <h2 id={`${id}-result`} ref={resultHead} tabIndex={-1} className={s.head}>
          {isSample ? "見本の 1 件が届いたとき" : "いま送った 1 件が届いたとき"}
        </h2>
        <p className={s.body} aria-live="polite">
          {isSample ? "見本の 1 件をキットの関数に通した結果です。このページのフォームから送ると、ここがその 1 件の結果に替わります。" : KIND_TEXT[outcome.kind]}
        </p>

        <section className={s.section} aria-labelledby={`${id}-notify`}>
          <h3 id={`${id}-notify`} className={s.head}>
            Slack・Discord・LINE への通知
          </h3>
          <div className={s.post}>
            <p className={s.postMeta}>
              <span>フォーム受付</span>
              <span>設定した通知先のすべてへ同じ文</span>
            </p>
            {outcome.notification ? <pre className={s.postText}>{outcome.notification}</pre> : <p className={s.empty}>通知は出しません。</p>}
          </div>
        </section>

        <section className={s.section} aria-labelledby={`${id}-sheet`}>
          <h3 id={`${id}-sheet`} className={s.head}>
            「受付」シート
          </h3>
          <div className={s.scroll} tabIndex={0} role="region" aria-label="受付シート">
            <table className={s.table}>
              <thead>
                <tr>
                  <th scope="col" className={s.rowNo}>
                    行
                  </th>
                  {header.map((name) => (
                    <th scope="col" key={name}>
                      {name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shownBook.intake.slice(1).map((row, i) => {
                  const n = i + 2;
                  return (
                    <tr key={`${row[1]}-${n}`} data-new={n === newRow}>
                      <th scope="row" className={s.rowNo}>
                        {n}
                        {n === newRow && <span className={s.visuallyHidden}>（足した行）</span>}
                      </th>
                      {row.map((cell, j) => (
                        <td key={j} className={j === 4 ? undefined : s.nowrap} style={j === 4 ? { minWidth: "14em" } : undefined}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className={s.small}>
            {outcome.row ? `${outcome.row.rowNumber} 行目を足しました（太い字の行）。` : "行は増えていません。"}
            数式として働く字（先頭の = など）は、字のまま残します。
          </p>
        </section>

        <section className={s.section} aria-labelledby={`${id}-mail`}>
          <h3 id={`${id}-mail`} className={s.head}>
            送った方へ届く自動返信
          </h3>
          <div className={s.post}>
            {outcome.reply ? (
              <>
                <dl className={s.pairs}>
                  <dt>宛先</dt>
                  <dd>{outcome.reply.to}</dd>
                  <dt>差出人名</dt>
                  <dd>{outcome.reply.name ?? "（Google アカウントの名前）"}</dd>
                  <dt>件名</dt>
                  <dd>{outcome.reply.subject}</dd>
                </dl>
                <pre className={s.postText}>{outcome.reply.body}</pre>
              </>
            ) : (
              <p className={s.empty}>自動返信は出しません。</p>
            )}
          </div>
        </section>

        <section className={s.section} aria-labelledby={`${id}-answer`}>
          <h3 id={`${id}-answer`} className={s.head}>
            フォームが受け取る返事
          </h3>
          <pre className={s.json}>{answer}</pre>
        </section>
      </div>

      {/* ---- フォーム ---- */}
      <section className={`${s.section} ${s.sticky}`} aria-labelledby={`${id}-form`}>
        <h2 id={`${id}-form`} className={s.head}>
          送ってみる
        </h2>
        <p className={s.small}>
          入力した内容は、このページの中だけでキットの関数に通します。どこにも送らず、保存もしません。メールも通知も実際には届きません。
        </p>
        <form className={s.col} onSubmit={submit} noValidate>
          <label className={s.field} htmlFor={`${id}-name`}>
            お名前
            <input id={`${id}-name`} className={s.input} value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" placeholder="例: 見本 花子" />
          </label>
          <label className={s.field} htmlFor={`${id}-email`}>
            メール
            <input id={`${id}-email`} className={s.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" placeholder="例: hanako@example.com" />
          </label>
          <label className={s.field} htmlFor={`${id}-message`}>
            内容
            <textarea id={`${id}-message`} className={s.input} value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="例: 見学を希望します。" />
          </label>
          <label className={s.field} htmlFor={`${id}-slot`}>
            希望枠
            <select id={`${id}-slot`} className={s.input} value={slot} onChange={(e) => setSlot(e.target.value)}>
              <option value="">希望なし（お問い合わせだけ）</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          {/* 迷惑投稿よけの見えない欄。人には見えず、読み上げもされない。bot だけが埋める */}
          <div className={s.trap} aria-hidden="true">
            <label>
              homepage
              <input name="homepage" tabIndex={-1} autoComplete="off" value={bot ? "https://spam.example/" : ""} readOnly />
            </label>
          </div>
          <label className={s.choice}>
            <input type="checkbox" checked={bot} onChange={(e) => setBot(e.target.checked)} />
            <span className={s.dot} aria-hidden="true" />
            bot のふりをして、見えない欄に字を入れて送る
          </label>
          <div className={s.verbs}>
            <button type="submit" className={`${s.verb} ${s.verbMain}`}>
              送信する
            </button>
            <button type="button" className={s.verb} onClick={reset}>
              見本に戻す
            </button>
          </div>
          {!outcome.answer.ok && (
            <p className={s.body} role="alert">
              {outcome.answer.message}
            </p>
          )}
        </form>
        <p className={s.small}>
          「満席」の枠を選ぶと、定員で断る様子を確かめられます。同じ内容を 10 分以内にもう一度送ると、同じ受付番号が返ります。空のまま送ると、足りない欄をお知らせします。
        </p>
      </section>
    </div>
  );
}
