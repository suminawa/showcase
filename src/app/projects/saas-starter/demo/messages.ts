/**
 * 文は、キットの messages/ja.json と en.json から引きます。
 * 見本にしかない言い回し（額の操作・見本に入れていないものの断り）だけを、
 * ここで同じ形に足します。**キットにある文は、ここで書き換えません。**
 */
import en from "../kit/messages/en.json";
import ja from "../kit/messages/ja.json";
import type { Lang, Messages } from "../kit/src/core/i18n";

const EXTRA: Readonly<Record<Lang, Record<string, string>>> = {
  ja: {
    "demo.chrome.person": "見本の方",
    "demo.chrome.personNone": "ログインの画面から",
    "demo.chrome.lang": "表示する言語",
    "demo.chrome.reset": "はじめに戻す",
    "demo.chrome.address": "見本の中の、いまの場所",
    "demo.login.omitted":
      "この見本には、ご登録の画面とご招待をお受けになる画面は入っておりません。上の 3 名から選んで、お入りください。",
    "demo.invite.emailHint": "見本では、お招きする方を候補からお選びいただきます。",
    "demo.legal.note":
      "見本では、2 つの項目をわざと空にしてあります。お書き忘れの項目は「（未記入）」と出て、ページの上に帯が立ちます。",
    "demo.legal.back": "お支払いの画面へ戻る",
    "demo.legal.only": "見本でお見せしているのは、この 1 枚だけです。",
  },
  en: {
    "demo.chrome.person": "Demo user",
    "demo.chrome.personNone": "Start at the sign-in screen",
    "demo.chrome.lang": "Language",
    "demo.chrome.reset": "Reset the demo",
    "demo.chrome.address": "Where you are in the demo",
    "demo.login.omitted":
      "Sign-up and invitation acceptance are not part of this demo. Please choose one of the three people above to go in.",
    "demo.invite.emailHint": "In this demo, please choose one of the sample addresses.",
    "demo.legal.note":
      "Two entries are left blank on purpose. Anything you have not filled in shows as a blank marker, and a notice appears at the top of the page.",
    "demo.legal.back": "Back to billing",
    "demo.legal.only": "This is the only legal page shown in the demo.",
  },
};

const TABLE: Readonly<Record<Lang, Messages>> = {
  ja: { ...(ja as Messages), ...EXTRA.ja },
  en: { ...(en as Messages), ...EXTRA.en },
};

/** その言語の文の一覧です。読むだけで、書き換えられません */
export function messagesFor(lang: Lang): Messages {
  return TABLE[lang];
}
