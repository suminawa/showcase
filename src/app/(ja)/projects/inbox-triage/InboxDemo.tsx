"use client";

/*
 * AI 問い合わせ整理の見本。上に「まとめて届く 1 通」、その下で 5 通から 1 通を選び、
 * 分類・要約・緊急度・返信の下書き・シートの 1 行・Claude に渡す文を読む。
 * このページは API を呼ばない。AI の答えは見本の記録で、それ以外はキットの関数が作る（./demo.ts）。
 */
import { useId, useState } from "react";

import s from "@/components/kit-demo/kit-demo.module.css";

import { DEMO_IDS, DEMO_NOTES, digestText, receivedLabel, rowPairs, systemPrompt, triageAll, type DemoId } from "./demo";

const ITEMS = triageAll();
const DIGEST = digestText(ITEMS);
const SYSTEM = systemPrompt();

function sender(from: string): string {
  const matched = from.match(/^(.*?)\s*<([^<>]+)>$/);
  return matched ? matched[1] : from;
}

export function InboxDemo() {
  const [selected, setSelected] = useState<DemoId>("complaint-01");
  const id = useId();
  const item = ITEMS.find((entry) => entry.id === selected) ?? ITEMS[0];
  const a = item.answer;
  const injection = item.id === "injection-01";

  return (
    <>
      {/* ---- まとめて届く 1 通 ---- */}
      <section className={s.section} aria-labelledby={`${id}-digest`}>
        <h2 id={`${id}-digest`} className={s.head}>
          5 通を整理した回に届く 1 通
        </h2>
        <div className={s.post} style={{ maxWidth: "52em" }}>
          <p className={s.postMeta}>
            <span>問い合わせ整理</span>
            <span>9/14 16:00</span>
            <span>Slack・Discord・LINE のうち設定した先へ</span>
          </p>
          <pre className={s.postText}>{DIGEST}</pre>
        </div>
        <p className={s.small}>
          要対応（緊急度が高いもの、AI が人の判断に回したもの）が先頭に並びます。実際の通知では、末尾の「行 3」などがその行を開くリンクになります。整理は 15 分ごとに動き、その回に整理した分を 1 通にまとめます。
        </p>
      </section>

      <div className={s.layout} style={{ marginTop: "calc(1.5 * var(--rp-pitch))" }}>
        {/* ---- 5 通から選ぶ ---- */}
        <section className={s.section} aria-labelledby={`${id}-inbox`}>
          <h2 id={`${id}-inbox`} className={s.head}>
            届いたメール（1 通選ぶと、その整理の結果が出ます）
          </h2>
          <fieldset className={s.col} style={{ border: 0, margin: 0, padding: 0, gap: "calc(0.25 * var(--rp-pitch))" }}>
            <legend className={s.visuallyHidden}>整理の結果を見るメール</legend>
            {DEMO_IDS.map((demoId) => {
              const entry = ITEMS.find((x) => x.id === demoId)!;
              return (
                <label key={demoId} className={s.choice} style={{ alignItems: "flex-start", paddingBlock: "calc(0.15 * var(--rp-pitch))" }}>
                  <input type="radio" name={`${id}-mail`} checked={selected === demoId} onChange={() => setSelected(demoId)} />
                  <span className={s.dot} aria-hidden="true" style={{ marginTop: "0.72em" }} />
                  <span style={{ display: "grid", lineHeight: 1.9 }}>
                    <span>{entry.email.subject}</span>
                    <span className={s.small}>
                      {receivedLabel(entry.email.date)}　{sender(entry.email.from)}　── {DEMO_NOTES[demoId]}
                    </span>
                  </span>
                </label>
              );
            })}
          </fieldset>

          <div className={s.post} style={{ marginTop: "calc(0.5 * var(--rp-pitch))" }}>
            <dl className={s.pairs}>
              <dt>差出人</dt>
              <dd>{item.email.from}</dd>
              <dt>件名</dt>
              <dd>{item.email.subject}</dd>
              <dt>添付</dt>
              <dd>{item.email.attachmentNames.length === 0 ? "なし" : item.email.attachmentNames.join("、")}</dd>
            </dl>
            <pre className={s.postText}>{item.email.plainBody}</pre>
          </div>
        </section>

        {/* ---- 整理の結果 ---- */}
        <section className={s.section} aria-labelledby={`${id}-answer`}>
          <p className={s.visuallyHidden} aria-live="polite">
            「{item.email.subject}」の整理の結果です。
          </p>
          <h2 id={`${id}-answer`} className={s.head}>
            AI の答え（見本の記録）
          </h2>
          <dl className={s.pairs}>
            <dt>分類</dt>
            <dd>{a.category}</dd>
            <dt>緊急度</dt>
            <dd>
              {a.urgency}
              {a.needsHuman ? "（人の判断に回す）" : ""}
            </dd>
            <dt>要約</dt>
            <dd>{a.summary}</dd>
            <dt>求められていること</dt>
            <dd>{a.request}</dd>
            <dt>期限</dt>
            <dd>{a.deadline ?? "本文に書かれていません"}</dd>
            {a.notes !== "" && (
              <>
                <dt>メモ</dt>
                <dd>{a.notes}</dd>
              </>
            )}
            <dt>ラベル</dt>
            <dd>{item.labels.join("　")}</dd>
          </dl>

          {injection && (
            <p className={s.body}>
              本文の「追加の指示」や偽の閉じ記号は、Claude に渡すときも囲みの中にあり、お客さまが書いたデータとして扱われます。答えは指示に従わず、中身どおりの分類と緊急度にして、値引きも送信もしていません。指示が混ざっていたことをメモに書き、人の判断に回しています。
            </p>
          )}

          <div className={s.post}>
            <p className={s.postMeta}>
              <span>Gmail の下書き（このスレッドへの返信）</span>
            </p>
            {item.draft === null ? (
              <p className={s.empty}>「営業や勧誘」には下書きを作りません（設定で変えられます）。</p>
            ) : (
              <pre className={s.postText}>{item.draft}</pre>
            )}
          </div>
          <p className={s.small}>下書きは送りません。読んで直してから、人が送ります。</p>

          <h3 className={s.head}>「問い合わせ」シートの {item.rowNumber} 行目</h3>
          <dl className={s.pairs}>
            {rowPairs(item).map(([name, value]) => (
              <div key={name} style={{ display: "contents" }}>
                <dt>{name}</dt>
                <dd>{value === "" ? "―" : value}</dd>
              </div>
            ))}
          </dl>
          <p className={s.small}>18 列のうちの 11 列です。ほかに受信日時・メールアドレス・件名・添付・状態・担当・スレッドの列があります。</p>

          <details className={s.details} open={injection}>
            <summary>Claude に渡す文（このメールの分）</summary>
            <pre className={s.code}>{item.userText}</pre>
          </details>
          <details className={s.details}>
            <summary>Claude に渡す決まり（設定から組む。どのメールでも同じ）</summary>
            <pre className={s.code}>{SYSTEM}</pre>
          </details>
          <p className={s.small}>
            AI の答えは、キットの「見本のメールで試す」が使う見本の記録です。このページは AI を呼びません。4 通はキットの見本のメールと答えそのものです。AI への指示が混ざった 1 通はキットの見本に無いため、キットの決まりどおりの答えを同じ形で用意し、キットの検査に通しています。答え以外（下書きの本文・シートの行・ラベル・通知の 1 通・Claude に渡す文）は、キットの関数がこのページの中で作っています。
          </p>
        </section>
      </div>
    </>
  );
}
