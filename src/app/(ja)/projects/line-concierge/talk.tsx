/*
 * 1 画面目に置く、LINE のトークの流れの写し（2026-10-20。見直し C8「見本の無いページは結果の画面を」）。
 * TRUTH: あいさつ・候補のボタン・断り・引き継ぎの文は、キットに同梱の見本の設定（samples/concierge.config.json）の文そのまま。
 *   答えの本文だけは AI が文書から作るので、ここでは見本の文書（samples/content/area.md）の該当の一文を置き、そう断る。
 *   「参考:」の行の形はキットの reply.ts（題名 URL）と同じ。
 * FORM: 方眼（DESIGN.md）。アプリの真似（アイコン・吹き出し）はせず、白いセルの行で「誰が・何を」を並べる。
 * トークの文は日本語のまま（キットの見本が日本語のため）。英仏は添え書きだけ訳す。
 */
import type { Lang } from "@/i18n/routes";

import c from "./talk.module.css";

/** 見本の設定の文（samples/concierge.config.json の line の節） */
const GREETING = "友だち追加ありがとうございます。みなと工務店の案内窓口です。料金や対応エリア、工事の流れなどを文字でご質問ください。公開している資料の範囲でお答えします。";
const SUGGESTIONS = ["対応エリアはどこまでですか", "見積もりは無料ですか", "工事中も住み続けられますか"];
const FALLBACK = "資料に載っていないため、お答えできません。担当者におつなぎしますか？";
const HANDOFF_LABEL = "担当者に相談する";
const HANDOFF_REPLY = "担当者におつなぎします。営業時間（平日 9:00〜18:00）内に順次お返事します。";
/** 答えの本文は見本の文書（area.md）の一文。参考の行はキットの形（題名 URL） */
const ANSWER = "みなと市を中心に、隣接するしおかぜ市・あおば市・ひかり市までお伺いしております。この 4 市であれば、出張費はいただきません。\n\n参考:\n対応エリア https://example.com/area";
const OFF_TOPIC = "社長の趣味は何ですか";

type Who = "bot" | "user";
type Turn = { who: Who; text: string; buttons?: string[]; note?: 0 | 1 | 2 | 3 };

const TURNS: Turn[] = [
  { who: "bot", text: GREETING, buttons: SUGGESTIONS, note: 0 },
  { who: "user", text: SUGGESTIONS[0] },
  { who: "bot", text: ANSWER, buttons: SUGGESTIONS, note: 1 },
  { who: "user", text: OFF_TOPIC },
  { who: "bot", text: FALLBACK, buttons: [HANDOFF_LABEL, ...SUGGESTIONS], note: 2 },
  { who: "user", text: HANDOFF_LABEL },
  { who: "bot", text: HANDOFF_REPLY, note: 3 },
];

const T: Record<Lang, { caption: string; who: Record<Who, string>; buttons: string; notes: [string, string, string, string]; foot: string }> = {
  ja: {
    caption: "LINE のトークの流れ（同梱の見本の会社「みなと工務店」の設定）",
    who: { bot: "窓口（AI）", user: "お客さま" },
    buttons: "候補のボタン",
    notes: [
      "友だち追加のあいさつと、よくあるご質問のボタンです。",
      "資料の範囲で答え、根拠にした文書の URL を添えます。",
      "資料に無いことは推測で答えず、担当者へのボタンを先頭に出します。",
      "ここから 24 時間、AI は返事をしません。担当者が LINE の管理画面の「チャット」から返信します。Slack にも知らせられます。",
    ],
    foot: "あいさつ・候補・断り・引き継ぎの文は、同梱の設定ファイルの文そのままです（設定で書き換えられます）。答えの文は AI が文書から作るもので、ここでは見本の文書の該当の一文を置いています。",
  },
  en: {
    caption: "How a LINE chat goes (settings for the included sample company, a fictional builder)",
    who: { bot: "Help desk (AI)", user: "Customer" },
    buttons: "Suggested buttons",
    notes: [
      "The welcome message for new friends, with buttons for common questions.",
      "Answers within your documents and adds the URL of the source document.",
      "Doesn’t guess at what the documents don’t cover; the button to reach staff comes first.",
      "For the next 24 hours the AI stays silent. Staff reply from the Chat screen of the LINE manager. Slack can be notified too.",
    ],
    foot: "The chat is in Japanese. The welcome, suggestions, refusal, and handoff texts are exactly those in the included settings file (you can change them). Answers are written by the AI from your documents; here the matching sentence of the sample document is shown.",
  },
  fr: {
    caption: "Le déroulement d’une discussion LINE (réglages de l’entreprise d’exemple fournie, un constructeur fictif)",
    who: { bot: "Assistant (IA)", user: "Client" },
    buttons: "Boutons suggérés",
    notes: [
      "Le message d’accueil des nouveaux amis, avec des boutons pour les questions fréquentes.",
      "Répond dans le cadre de vos documents et ajoute l’URL du document source.",
      "Ne devine pas ce que les documents ne disent pas ; le bouton vers l’équipe vient en premier.",
      "Pendant 24 heures, l’IA se tait. L’équipe répond depuis l’écran Discussion du gestionnaire LINE. Slack peut aussi être prévenu.",
    ],
    foot: "La discussion est en japonais. Les textes d’accueil, de suggestion, de refus et de transfert sont ceux du fichier de réglages fourni (modifiables). Les réponses sont rédigées par l’IA à partir de vos documents ; ici figure la phrase correspondante du document d’exemple.",
  },
};

export function LineTalk({ lang }: { lang: Lang }) {
  const t = T[lang];
  return (
    <figure className={c.talk}>
      <figcaption className={c.head}>{t.caption}</figcaption>
      <ol className={c.rows} lang="ja">
        {TURNS.map((turn, i) => (
          <li key={i} className={`${c.row} ${turn.who === "user" ? c.user : ""}`}>
            <span className={c.who} lang={lang}>
              {t.who[turn.who]}
            </span>
            <div className={c.body}>
              <p className={c.text}>{turn.text}</p>
              {turn.buttons && (
                <ul className={c.buttons} aria-label={t.buttons}>
                  {turn.buttons.map((b) => (
                    <li key={b} className={c.button}>
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {turn.note != null && (
              <p className={c.note} lang={lang}>
                {t.notes[turn.note]}
              </p>
            )}
          </li>
        ))}
      </ol>
      <p className={c.foot}>{t.foot}</p>
    </figure>
  );
}
