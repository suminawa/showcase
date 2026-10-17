/*
 * 見本の頭に置く札。「ここから下は動く見本」と言い、何がその場で動いているかを一行で添える。
 * 見出しにはしない（見本の中の見出しの並びを崩さない）。
 */
import type { Lang } from "@/i18n/routes";

import sh from "./shell.module.css";

const T: Record<Lang, { label: string; text: string }> = {
  ja: { label: "動く見本", text: "触ると、その場で結果が変わります。入力した内容はこの画面の中だけで扱い、外へ送ったり保存したりしません。" },
  en: { label: "Live demo", text: "Try it and the result changes on the spot. What you enter stays on this page; nothing is sent or saved." },
  fr: { label: "Démo en direct", text: "Essayez : le résultat change aussitôt. Ce que vous saisissez reste sur cette page ; rien n’est envoyé ni enregistré." },
};

export function DemoLabel({ lang }: { lang: Lang }) {
  const t = T[lang];
  return (
    <p className={sh.demoLabel}>
      <span className={sh.demoTag}>{t.label}</span>
      <span>{t.text}</span>
    </p>
  );
}
