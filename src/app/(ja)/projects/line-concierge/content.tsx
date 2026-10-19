/*
 * LINE の中で動くので、紙の上に動く見本は置かない。1 画面目にはトークの流れの写し（talk.tsx。設定の文そのまま）を置き、
 * そのあと中身・置き方・守り・費用を節で並べる。売り物のページの型（KitCopy の name・sales。kit-sheet.tsx の頭のコメント）。
 * 実際に動いている LINE 公式アカウント（@542vseyl。友だち追加の道）は、環境変数 LINE_DEMO_ADD_URL が入っているときだけ出す（受け口は /api/line）。
 * FORM: 料紙（作品ページ）— 文法は DESIGN.md。組み方は ../kit-sheet.tsx
 */
import u from "@/components/site/ui.module.css";
import type { Lang } from "@/i18n/routes";

import g from "../../guides/guides.module.css";
import { KitSheet, kitMetadata } from "../kit-sheet";
import { copy } from "./copy";
import { LineTalk } from "./talk";

export const metadataFor = (lang: Lang) => kitMetadata(lang, "line-concierge", copy[lang]);

/** 見本のアカウントの上限はサイトの設定（concierge/concierge.config.json の line.limits.perUserDaily）。キットの既定は 30 問 */
const demoCopy: Record<Lang, { heading: string; text: string; link: string; note: string }> = {
  ja: {
    heading: "実際に話しかける",
    text: "suminawa の LINE 公式アカウント（@542vseyl）では、このキットがそのまま動いています。友だち追加して、キットや設置のご依頼についてご質問ください。サイトの AI 案内窓口と同じ文書を根拠に敬体でお答えし、資料に無いことは「載っていません」とお答えします。「担当者」と送ると人に引き継ぎ、24 時間以内にお返事します。",
    link: "LINE で友だち追加して試す（新しいタブ）",
    note: "この見本のアカウントは、費用を抑えるため AI の返事を 1 人 1 日 20 問までにしています（キットの既定は 30 問で、設定で変えられます）。会話は 1 時間で消えます。",
  },
  en: {
    heading: "Talk to it",
    text: "This kit runs as is on suminawa's LINE Official Account (@542vseyl). Add it as a friend and ask about the kits or services. This kit answers politely from the same documents as the site's AI help desk, says so when something is not in the documents, and hands over to a person when you send “担当者”.",
    link: "Add on LINE and try it (new tab)",
    note: "To keep costs down, this sample account limits AI replies to 20 questions per person per day (the kit’s default is 30, and it can be changed). Conversations are kept for one hour.",
  },
  fr: {
    heading: "Lui parler",
    text: "Ce kit tourne tel quel sur le compte officiel LINE de suminawa (@542vseyl). Ajoutez-le et posez vos questions sur les kits ou les prestations. Le kit répond poliment à partir des mêmes documents que l’assistant du site, dit quand une information n’y figure pas, et passe la main à une personne si vous envoyez « 担当者 ».",
    link: "Ajouter sur LINE et essayer (nouvel onglet)",
    note: "Pour limiter les coûts, ce compte d’exemple limite les réponses de l’IA à 20 questions par personne et par jour (30 par défaut dans le kit, réglable). Les conversations sont conservées une heure.",
  },
};

function LineDemo({ lang, url }: { lang: Lang; url: string }) {
  const t = demoCopy[lang];
  return (
    <section className={g.section}>
      <h2 className={g.heading}>{t.heading}</h2>
      <p className={g.text}>{t.text}</p>
      <p className={g.text}>
        <a href={url} rel="noopener noreferrer" target="_blank" className={u.btnGhost}>
          {t.link}
        </a>
      </p>
      <p className={g.text}>{t.note}</p>
    </section>
  );
}

export function Content({ lang }: { lang: Lang }) {
  const demoUrl = process.env.LINE_DEMO_ADD_URL;
  return (
    <KitSheet lang={lang} slug="line-concierge" latin="LINE Concierge" linkKey="line-concierge" copy={copy[lang]}>
      <LineTalk lang={lang} />
      {demoUrl ? <LineDemo lang={lang} url={demoUrl} /> : null}
    </KitSheet>
  );
}
