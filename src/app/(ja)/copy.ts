import { SITE_DESCRIPTION } from "@/lib/site";

/** トップの紙の言葉（src/app/content.tsx）。品物の題・入口・品書きは src/i18n/catalog.ts */
const ja = {
  description: SITE_DESCRIPTION,
  /* 名乗りの一行。誰の・何を・どうするかを言う（2026-10-15 監査 改善 1。提案文から来る発注者に、何の店かを 5 秒で） */
  tagline: "スプレッドシートと Gmail・LINE の手作業を、動く仕組みにします。",
  pitchText:
    "小さな会社やお店の事務を、Google Apps Script と AI で自動化します。買い切りのキット（¥2,980〜）でご自身で入れることも、設置ごとお任せいただくこと（30,000 円〜）もできます。",
  ctaPrimary: "困りごとから選ぶ",
  ctaSecondary: "設置を相談する（3 営業日以内に返信）",
  /* 困りごとの入口 3 枚。並びは content.tsx の TROUBLE_KITS と同じ */
  troubles: ["期限や更新を見落とす", "問い合わせ・予約の受付が回らない", "表の管理が崩れる"],
  trust: ["このサイトの見本は全部その場で動きます", "月額のサービス料はかかりません"],
  about: "運営者について →",
  categories: "分類",
  picks: "いま見てほしいもの",
  closeHead: "制作のご相談",
  closeText: "料金は税別の目安です。ほかの内容もご相談いただけます。",
  closeCta: "料金の目安と進め方を見る",
  closeLine: "すべての作品は、その場で実際に動きます。",
  skip: "本文へ",
};

export const copy: Record<"ja" | "en" | "fr", typeof ja> = {
  ja,
  en: {
    description:
      "suminawa builds small tools for business automation and the web: kits and live demos made with Google Apps Script (GAS) and AI, ready to try in your browser.",
    /* 英語版は受託の窓（Contra・Fiverr から来る人）に絞る。仏語は凍結（2026-10-15 監査 改善 8） */
    tagline: "I build Google Apps Script automations, AI help desks and landing pages for small businesses.",
    pitchText:
      "I automate office work for small companies and shops with Google Apps Script and AI. Buy a one-time kit (from ¥2,980) and set it up yourself, or have me install it for you (from ¥30,000).",
    ctaPrimary: "Start from your problem",
    ctaSecondary: "Start a project (reply within 3 business days)",
    troubles: ["Deadlines and renewals slip through", "Too many inquiries and bookings to keep up with", "Spreadsheets keep falling apart"],
    trust: ["Every demo on this site runs live", "No monthly service fees"],
    about: "About the maker (Japanese) →",
    categories: "Categories",
    picks: "Start here",
    closeHead: "Project inquiries",
    closeText: "Prices are estimates, excluding tax. Other kinds of work are welcome too.",
    closeCta: "See pricing and how it works",
    closeLine: "Everything here runs live, right on the page.",
    skip: "Skip to content",
  },
  fr: {
    description:
      "suminawa conçoit de petits outils pour automatiser le travail et pour le web : des kits et des démos en Google Apps Script (GAS) et IA, à essayer directement dans le navigateur.",
    tagline: "Ce que j’ai réalisé.",
    pitchText:
      "J’automatise le travail administratif des petites entreprises et des commerces avec Google Apps Script et l’IA. Achetez un kit (dès 2 980 ¥) pour l’installer vous-même, ou confiez-moi l’installation (dès 30 000 ¥).",
    ctaPrimary: "Partir de votre besoin",
    ctaSecondary: "Demander une installation (réponse sous 3 jours ouvrés)",
    troubles: ["Des échéances qui passent inaperçues", "Trop de demandes et de réservations à suivre", "Des tableaux qui deviennent ingérables"],
    trust: ["Toutes les démos du site fonctionnent en direct", "Aucun abonnement mensuel"],
    about: "À propos (en japonais) →",
    categories: "Catégories",
    picks: "Pour commencer",
    closeHead: "Confier un projet",
    closeText: "Tarifs indicatifs, hors taxes. D’autres demandes sont les bienvenues.",
    closeCta: "Voir les tarifs et le déroulement",
    closeLine: "Tout ici fonctionne en direct, sur la page.",
    skip: "Aller au contenu",
  },
};
