/*
 * 1 画面目の結果の画面。スプレッドシートの中で動くキットなので、動く見本の代わりに、
 * キットに同梱の架空のクリニックの見本の回答と、API キーを入れる前に再生される「今週の 3 つ」を写す。
 * TRUTH: 文はキットの src/samples.js（SAMPLE_ROWS.clinic・SAMPLE_SUMMARY.clinic）の写し。言い換えない。
 *   回答の表は 12 件のうち、自由記述のある 5 件。英仏のページでも見本の画面は日本語のまま（DemoNote が断る）。
 */
import k from "@/components/kit-demo/kit-demo.module.css";
import type { Lang } from "@/i18n/routes";

/** 行番号（見本の回答シートの行）・満足度・気になった点とご要望 */
const ANSWERS: [number, number, string][] = [
  [3, 2, "予約していたのに 40 分待ちました。待ち時間の目安を教えてほしいです。"],
  [4, 3, "会計でお釣りの間違いがありました。"],
  [6, 3, "ネット予約で土曜が選べるとうれしいです。"],
  [8, 2, "待合室の椅子が少なく、立って待ちました。椅子を増やしてほしいです。"],
  [11, 1, "説明が早口で、薬の飲み方が分かりませんでした。紙でもほしいです。"],
];

const ACTIONS: { text: string; basis: string }[] = [
  { text: "待ち時間が長くなる日は、受付でおおよその待ち時間をお伝えしてみてください。", basis: "待ち時間の悪い 1 件、要望「待ち時間の目安の案内」1 件" },
  { text: "お薬の飲み方は、口でお伝えしたあとに紙でもお渡ししてみてください。", basis: "説明の悪い 1 件、要望「薬の飲み方の紙での説明」1 件" },
  { text: "近くのコインパーキングの場所を、受付とホームページでご案内してみてください。", basis: "要望「駐車場の案内」1 件" },
];

const T: Record<Lang, { answers: string; actions: string; scroll: string }> = {
  ja: {
    answers: "「見本の回答」シート（架空のクリニック・12 件のうち 5 件）",
    actions: "「まとめ」シートの「今週の 3 つ」",
    scroll: "見本の回答（横に送れます）",
  },
  en: {
    answers: "Sample answers sheet (fictional clinic, 5 of 12 rows)",
    actions: "“Three for this week” in the summary sheet",
    scroll: "Sample answers (scrolls sideways)",
  },
  fr: {
    answers: "Feuille des réponses d’exemple (clinique fictive, 5 lignes sur 12)",
    actions: "« Trois pour cette semaine » dans la feuille de synthèse",
    scroll: "Réponses d’exemple (défilement horizontal)",
  },
};

export function SurveyResult({ lang }: { lang: Lang }) {
  const t = T[lang];
  return (
    <div className={k.layout}>
      <section className={k.section} aria-labelledby="survey-answers">
        <h2 id="survey-answers" className={k.head}>
          {t.answers}
        </h2>
        <div className={k.scroll} role="region" aria-label={t.scroll} tabIndex={0}>
          <table className={k.table} lang="ja">
            <thead>
              <tr>
                <th scope="col" className={k.rowNo} aria-hidden="true" />
                <th scope="col">満足度</th>
                <th scope="col">気になった点とご要望</th>
              </tr>
            </thead>
            <tbody>
              {ANSWERS.map(([row, score, text]) => (
                <tr key={row}>
                  <td className={k.rowNo} aria-hidden="true">
                    {row}
                  </td>
                  <td className={k.nowrap}>{score}</td>
                  <td>{text}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className={k.section} aria-labelledby="survey-actions">
        <h2 id="survey-actions" className={k.head}>
          {t.actions}
        </h2>
        <ol className={k.post} lang="ja" style={{ margin: 0, listStyle: "none" }}>
          {ACTIONS.map((a, i) => (
            <li key={a.text} className={k.postText}>
              {`${i + 1}. ${a.text}`}
              <br />
              <span className={k.postMeta}>根拠: {a.basis}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
