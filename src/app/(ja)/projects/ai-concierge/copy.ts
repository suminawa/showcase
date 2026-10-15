const ja = {
  meta: {
    title: "AI 案内窓口",
    description: "自社の文書だけを根拠に、サイトの上でお客さまの質問に答える窓口。出典つきで答え、分からないことは問い合わせへ回します",
  },
  title: "AI 案内窓口",
  lede: "自社の文書だけを根拠に答える窓口です。ここでは suminawa 自身の案内（売り物・受託の料金・進め方）を読んで答えます",
  sources: "答えの末尾の番号は出典です。文書に無いことは「資料に載っていません」と答え、問い合わせへ回します。1 日の質問数には上限があります。",
};

export const copy: Record<"ja" | "en" | "fr", typeof ja> = {
  ja,
  en: {
    meta: {
      title: "AI Help Desk",
      description: "A help desk on your website that answers customer questions using only your own documents. It cites its sources and refers anything it can’t answer to your contact channel.",
    },
    title: "AI Help Desk",
    lede: "A help desk that answers only from your own documents. Here it reads this site’s own information (products, service pricing, how projects work)",
    sources: "The numbers at the end of each answer are its sources. When something isn’t in the documents, it says so and points you to the contact details. There is a daily limit on questions.",
  },
  fr: {
    meta: {
      title: "Assistant IA",
      description: "Un assistant sur votre site qui répond aux questions des clients à partir de vos seuls documents. Il cite ses sources et renvoie vers le contact ce à quoi il ne peut pas répondre.",
    },
    title: "Assistant IA",
    lede: "Un assistant qui répond uniquement à partir de vos propres documents. Ici, il s’appuie sur les informations de ce site (produits, tarifs des prestations, déroulement)",
    sources: "Les numéros en fin de réponse renvoient aux sources. Si l’information n’est pas dans les documents, il le dit et vous oriente vers le contact. Le nombre de questions par jour est limité.",
  },
};
