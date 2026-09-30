/** トップの紙の言葉（src/app/content.tsx）。品物の題・入口・品書きは src/i18n/catalog.ts */
const ja = {
  description: "Things I've built — 動くもので見せるポートフォリオ",
  tagline: "Things I've built.",
  categories: "分類",
  picks: "いま見てほしいもの",
  closeHead: "制作のご相談",
  closeText: "料金は税別の目安です。ほかの内容もご相談いただけます。",
  closeCta: "料金の目安と進め方を見る",
  closeLine: "すべての作品は、その場で実際に動きます。",
};

export const copy: Record<"ja" | "en" | "fr", typeof ja> = {
  ja,
  en: {
    description: "Things I’ve built — a portfolio of work that runs live in the browser.",
    tagline: "Things I've built.",
    categories: "Categories",
    picks: "Start here",
    closeHead: "Project inquiries",
    closeText: "Prices are estimates, excluding tax. Other kinds of work are welcome too.",
    closeCta: "See pricing and how it works",
    closeLine: "Everything here runs live, right on the page.",
  },
  fr: {
    description: "Ce que j’ai réalisé — un portfolio de projets qui fonctionnent en direct dans le navigateur.",
    tagline: "Ce que j’ai réalisé.",
    categories: "Catégories",
    picks: "Pour commencer",
    closeHead: "Confier un projet",
    closeText: "Tarifs indicatifs, hors taxes. D’autres demandes sont les bienvenues.",
    closeCta: "Voir les tarifs et le déroulement",
    closeLine: "Tout ici fonctionne en direct, sur la page.",
  },
};
