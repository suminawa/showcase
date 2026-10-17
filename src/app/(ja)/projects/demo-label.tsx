/*
 * 見本の頭に置く札。「ここから下は動く見本」と言い、何がその場で動いているかを一行で添える。
 * 見出しにはしない（見本の中の見出しの並びを崩さない）。
 */
import type { Lang } from "@/i18n/routes";

import sh from "./shell.module.css";

const T: Record<Lang, { label: string; text: string }> = {
  ja: { label: "動く見本", text: "書き換えたり送ったりすると、その場で結果が変わります。どこにも送らず、何も保存しません。" },
  en: { label: "Live demo", text: "Edit or submit and the result changes on the spot. Nothing is sent or saved." },
  fr: { label: "Démo en direct", text: "Modifiez ou envoyez : le résultat change aussitôt. Rien n’est envoyé ni enregistré." },
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
