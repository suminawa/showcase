const ja = {
  meta: {
    title: "30日 — Thirty Days",
    description: "AIエージェントに全部やらせて、30日で1から稼げるだけ稼ぐ。売上・提案数・人間の介在時間を毎日足していく公開の帳面。",
  },
  title: "30日",
  lede: "AIエージェントに全部やらせて、30日で1から稼げるだけ稼ぐ。",
  daily: "数字はここに毎日足す",
  posts: "毎日の記事",
  /** 英仏の紙でだけ出す（帳面の中は日本語） */
  demoNote: "",
};

export const copy: Record<"ja" | "en" | "fr", typeof ja> = {
  ja,
  en: {
    meta: {
      title: "Thirty Days",
      description: "Let AI agents do all the work and earn as much as possible from zero in 30 days. A public log that adds sales, proposals sent, and human hours every day.",
    },
    title: "30 Days",
    lede: "Let AI agents do all the work, and earn as much as possible from zero in 30 days.",
    daily: "The numbers are added here every day",
    posts: "Daily posts (in Japanese)",
    demoNote: "The log below is in Japanese.",
  },
  fr: {
    meta: {
      title: "Trente jours",
      description: "Confier tout le travail à des agents IA et gagner le plus possible en 30 jours, en partant de zéro. Un journal public qui ajoute chaque jour les ventes, les propositions envoyées et le temps humain passé.",
    },
    title: "30 jours",
    lede: "Confier tout le travail à des agents IA et gagner le plus possible en 30 jours, en partant de zéro.",
    daily: "Les chiffres sont ajoutés ici chaque jour",
    posts: "Articles quotidiens (en japonais)",
    demoNote: "Le journal ci-dessous est en japonais.",
  },
};
