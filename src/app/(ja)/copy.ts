import { SITE_DESCRIPTION } from "@/lib/site";

/** トップの紙の言葉（src/app/content.tsx）。品物の題・入口・品書きは src/i18n/catalog.ts */
const ja = {
  description: SITE_DESCRIPTION,
  /* 名乗りの一行。三つの柱を名で言う（2026-10-17、持ち主の指示。トップの方眼の見出しと同じ字）。二文は TopPage の見出しの横に出す */
  tagline: "業務自動化、AI活用、Web制作。",
  pitchText:
    "期限の通知や予約の受付を自動にする道具、自社の文書だけを根拠に答える AI の窓口と書類の読み取り、LP・サイト・Webアプリの制作。買い切りのキット（税込 ¥2,980〜）をご自身で入れることも、設置や制作ごとお任せいただくこともできます。",
  ctaPrimary: "困りごとから選ぶ",
  ctaSecondary: "設置を相談する（3 営業日以内に返信）",
  /* 困りごとの入口 3 枚。並びは content.tsx の TROUBLE_KITS と同じ */
  troubles: ["期限や更新を見落とす", "問い合わせ・予約の受付が回らない", "表の管理が崩れる"],
  trust: ["このサイトの見本は全部その場で動きます", "月額のサービス料はかかりません"],
  about: "運営者について →",
  categories: "分類",
  picks: "はじめての方におすすめの 3 本",
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
      "suminawa: business automation, AI tools and web production for small businesses. One-time-purchase kits built with Google Apps Script and the Claude API, sample sites, and live demos you can try in your browser.",
    /* 英語版は受託の窓（Contra・Fiverr から来る人）に絞る。仏語は凍結（2026-10-15 監査 改善 8）。名乗りは三つの柱で（2026-10-17） */
    tagline: "Business automation, AI tools and web production for small businesses.",
    pitchText:
      "I build Google Apps Script automations, AI help desks and document readers on the Claude API, and landing pages and web apps. Buy a one-time kit (from ¥2,980) and set it up yourself, or have me install or build it for you (from ¥30,000).",
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
      "suminawa : automatisation, outils IA et création web pour les petites entreprises. Des kits en achat unique (Google Apps Script, API Claude), des sites d’exemple et des démos à essayer directement dans le navigateur.",
    tagline: "Automatisation, outils IA et création web pour les petites entreprises.",
    pitchText:
      "Je conçois des automatisations Google Apps Script, des assistants IA et des lecteurs de documents sur l’API Claude, ainsi que des landing pages et des applications web. Achetez un kit (dès 2 980 ¥) pour l’installer vous-même, ou confiez-moi l’installation ou la réalisation (dès 30 000 ¥).",
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
