/*
 * LINE の中で動くので、紙の上に動く見本は置かない。中身・置き方・守り・費用を節で並べる。
 * 見本の LINE 公式アカウント（友だち追加の道）は、環境変数 LINE_DEMO_ADD_URL が入っているときだけ出す（受け口は /api/line）。
 * FORM: 料紙（作品ページ）— 文法は DESIGN.md。組み方は ../kit-sheet.tsx
 */
import type { Lang } from "@/i18n/routes";

import g from "../../guides/guides.module.css";
import { KitSheet, kitMetadata } from "../kit-sheet";
import { copy } from "./copy";

export const metadataFor = (lang: Lang) => kitMetadata(lang, "line-concierge", copy[lang]);

const demoCopy: Record<Lang, { heading: string; text: string; link: string; note: string }> = {
  ja: {
    heading: "見本を試す",
    text: "suminawa の LINE 公式アカウント（見本）に友だち追加して、売り物や受託についてご質問ください。このキットが、サイトの AI 案内窓口と同じ文書を根拠に敬体でお答えします。資料に無いことは「載っていません」とお答えし、「担当者」と送ると人に引き継ぎます。",
    link: "LINE で友だち追加して試す",
    note: "見本のため、1 人 1 日 20 問までです。会話は 1 時間で消えます。",
  },
  en: {
    heading: "Try the demo",
    text: "Add suminawa's demo LINE Official Account as a friend and ask about the kits or services. This kit answers politely from the same documents as the site's AI help desk, says so when something is not in the documents, and hands over to a person when you send “担当者”.",
    link: "Add on LINE and try it",
    note: "Demo limits: 20 questions per person per day. Conversations are kept for one hour.",
  },
  fr: {
    heading: "Essayer la démo",
    text: "Ajoutez le compte officiel LINE de démonstration de suminawa et posez vos questions sur les kits ou les prestations. Le kit répond poliment à partir des mêmes documents que l’assistant du site, dit quand une information n’y figure pas, et passe la main à une personne si vous envoyez « 担当者 ».",
    link: "Ajouter sur LINE et essayer",
    note: "Limites de la démo : 20 questions par personne et par jour. Les conversations sont conservées une heure.",
  },
};

function LineDemo({ lang, url }: { lang: Lang; url: string }) {
  const t = demoCopy[lang];
  return (
    <section className={g.section}>
      <h2 className={g.heading}>{t.heading}</h2>
      <p className={g.text}>{t.text}</p>
      <p className={g.text}>
        <a href={url} rel="noopener noreferrer" target="_blank">
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
      {demoUrl ? <LineDemo lang={lang} url={demoUrl} /> : null}
    </KitSheet>
  );
}
