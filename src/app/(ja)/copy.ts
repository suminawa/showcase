import { SITE_DESCRIPTION } from "@/lib/site";

/**
 * トップ（src/app/(ja)/top/TopPage.tsx）の言葉。日本語・英語・仏語が同じ形を持つ（copy.test.ts が照らす）。
 * 品物の題・一行・柱の言葉は src/i18n/catalog.ts。数字（本数・値段）はレジストリから数えて関数に渡す。
 */
const ja = {
  description: SITE_DESCRIPTION,
  /* 名乗りの一行。三つの柱を名で言う（2026-10-17、持ち主の指示。トップの方眼の見出しと同じ字） */
  tagline: "業務自動化、AI活用、Web制作。",
  /* 方眼の見出しの 3 段（柱ごとに 1 段）。日本語は TopPage が一字一マスで組むので使わない（英仏だけ） */
  taglineLines: ["業務自動化、", "AI活用、", "Web制作。"],
  pitchText:
    "期限の通知や予約の受付を自動にする道具、自社の文書だけを根拠に答える AI の窓口と書類の読み取り、LP・サイト・Webアプリの制作。買い切りのキット（税込 ¥2,980〜）をご自身で入れることも、設置や制作ごとお任せいただくこともできます。",
  kicker: "従業員 1〜30 人の会社・事務所・教室に",
  seeKits: (n: number) => `${n} 本のキットを見る`,
  pricing: "頼み方と料金",
  picksHead: "代表のキット",
  picksTax: "税込・買い切り",
  linkAll: "一覧",
  linkAllText: (n: number) => `${n} 本をすべて見る`,
  linkDemo: "動く見本",
  linkService: "受託",
  taxExcluded: "（税別）",
  demoHead: "動く見本",
  demoLede:
    "見本は実物で動きます。期限アラートの見本は、キットの関数がこの画面の中で毎朝の 1 通を作ります。日付を進めたり、期限や状態を書き換えたりすると、届く 1 通が変わります。",
  factsHead: "買う前に確かめられること",
  facts: [
    { fig: "0 円", label: "月額のサービス料", text: "キットは買い切りです。AI を使うキットは、ご自身の API キーの利用料がかかります。" },
    {
      fig: "実物",
      label: "見本の中身",
      text: "期限アラートとフォーム受付の見本は、キットの関数をこのサイトの中で動かしています。予約ページは、キットの見本の画面そのものです。",
    },
    { fig: "3 営業日", label: "ご相談への返信", text: "ご相談とご質問には、3 営業日以内にお返事します。" },
    { fig: "14 日", label: "ご購入後のサポート", text: "ご購入から 14 日は、手順書どおりに動かないとき、メールで設置まで一緒に確かめます。" },
  ],
  threeHead: "はじめての方におすすめの 3 本",
  threeLede: "業務自動化の柱の先頭の 3 本です。どれも Google スプレッドシートで動きます。手順書どおりに 15〜20 分ほどで使い始められ、月額の費用はかかりません。",
  setLine: (label: string, price: string, total: string) =>
    `${label}の 4 本は、まとめて ${price}（税込。単品の合計 ${total}）でもお求めいただけます。セットは、BOOTH の各キットのページで選べます。`,
  moreKits: (n: number) => `${n} 本すべてを、写真つきで見る`,
  ladderHead: "頼み方と料金",
  ladderLede: "キットをご自身で入れることも、設置・AI の組み込み・LP やサイトの制作をお任せいただくこともできます。1 か所の修正からお受けします。",
  ladderCta: "相談する（3 営業日以内に返信）",
  mailBefore: "メールでのご相談は ",
  mailAfter: " へ。",
  makerHead: "作っている人",
  maker1:
    "キットとサイトは、suminawa（墨縄）が個人で作っています。仕事では、Web システムの開発・保守、発注者側の SE、受託システムの品質保証、業務の自動化ツールの開発を、あわせて 3 年以上担当してきました。",
  maker2: "作るときは AI エージェントを使い、動作は自分で確かめてから出しています。",
  aboutLink: "運営者について（お取引の決まり・プライバシー方針）",
  readsHead: "悩みから読む",
  readsAll: "悩みから読むの一覧へ",
};

export const copy: Record<"ja" | "en" | "fr", typeof ja> = {
  ja,
  en: {
    description:
      "suminawa: business automation, AI tools and web production for small businesses. One-time-purchase kits built with Google Apps Script and the Claude API, sample sites, and live demos you can try in your browser.",
    /* 英語版は受託の窓（Contra・Fiverr から来る人）に絞る。仏語は凍結（2026-10-15 監査 改善 8）。名乗りは三つの柱で（2026-10-17） */
    tagline: "Business automation, AI tools and web production for small businesses.",
    taglineLines: ["Business automation,", "AI tools,", "web production."],
    pitchText:
      "I build Google Apps Script automations, AI help desks and document readers on the Claude API, and landing pages and web apps. Buy a one-time kit (from ¥2,980) and set it up yourself, or have me install or build it for you (from ¥30,000).",
    kicker: "For companies, offices and schools with 1–30 staff",
    seeKits: (n: number) => `See all ${n} kits`,
    pricing: "Pricing and how it works",
    picksHead: "Featured kits",
    picksTax: "Tax included · one-time purchase",
    linkAll: "All",
    linkAllText: (n: number) => `See all ${n} kits on this shelf`,
    linkDemo: "Live demo",
    linkService: "Hire me",
    taxExcluded: " (excl. tax)",
    demoHead: "Live demo",
    demoLede:
      "Every demo runs for real. In the Deadline Alert demo, the kit's own code builds the morning message right on this page. Change the date, a deadline or a status, and the message changes. The demo is in Japanese.",
    factsHead: "What you can check before buying",
    facts: [
      { fig: "¥0", label: "Monthly fee", text: "Kits are a one-time purchase. AI kits use your own API key, billed by the provider." },
      {
        fig: "Real",
        label: "What the demos are",
        text: "The Deadline Alert and Form Intake demos run the kits' own code on this site. The Booking Page demo is the kit's actual screen.",
      },
      { fig: "3 days", label: "Reply time", text: "Questions and project inquiries get a reply within 3 business days." },
      { fig: "14 days", label: "Support after purchase", text: "For 14 days after purchase, if a kit does not work by following the guide, we check the setup together by email." },
    ],
    threeHead: "Start here: three kits",
    threeLede: "The first three kits on the automation shelf. All run on Google Sheets, take about 15–20 minutes to set up by following the guide, and have no monthly fee.",
    setLine: (label: string, price: string, total: string) =>
      `${label} are also available as a set for ${price} (tax included; ${total} bought separately). Choose the set on each kit's BOOTH page.`,
    moreKits: (n: number) => `See all ${n} kits, with screenshots`,
    ladderHead: "Pricing and how it works",
    ladderLede: "Install a kit yourself, or have me handle the setup, an AI integration, or a landing page or website. Single fixes are welcome too.",
    ladderCta: "Get in touch (reply within 3 business days)",
    mailBefore: "Or write to ",
    mailAfter: ".",
    makerHead: "Who makes this",
    maker1:
      "The kits and this site are made by suminawa, working independently. Over 3 years in web system development and maintenance, client-side systems engineering, QA for contracted systems, and business automation tools.",
    maker2: "I build with AI agents and verify everything myself before release.",
    aboutLink: "About the maker (Japanese)",
    readsHead: "Guides (Japanese)",
    readsAll: "All guides",
  },
  fr: {
    description:
      "suminawa : automatisation, outils IA et création web pour les petites entreprises. Des kits en achat unique (Google Apps Script, API Claude), des sites d’exemple et des démos à essayer directement dans le navigateur.",
    tagline: "Automatisation, outils IA et création web pour les petites entreprises.",
    taglineLines: ["Automatisation,", "outils IA,", "création web."],
    pitchText:
      "Je conçois des automatisations Google Apps Script, des assistants IA et des lecteurs de documents sur l’API Claude, ainsi que des landing pages et des applications web. Achetez un kit (dès 2 980 ¥) pour l’installer vous-même, ou confiez-moi l’installation ou la réalisation (dès 30 000 ¥).",
    kicker: "Pour les entreprises, cabinets et écoles de 1 à 30 personnes",
    seeKits: (n: number) => `Voir les ${n} kits`,
    pricing: "Tarifs et déroulement",
    picksHead: "Kits représentatifs",
    picksTax: "TTC · achat unique",
    linkAll: "Tous",
    linkAllText: (n: number) => `Voir les ${n} kits de ce rayon`,
    linkDemo: "Démo",
    linkService: "Sur mesure",
    taxExcluded: " (HT)",
    demoHead: "Démo en direct",
    demoLede:
      "Toutes les démos fonctionnent pour de vrai. Dans la démo Alerte d’échéances, le code du kit compose le message du matin directement sur cette page. Changez la date, une échéance ou un statut, et le message change. La démo est en japonais.",
    factsHead: "Ce que vous pouvez vérifier avant d’acheter",
    facts: [
      { fig: "0 ¥", label: "Abonnement mensuel", text: "Les kits s’achètent une seule fois. Les kits IA utilisent votre propre clé API, facturée par le fournisseur." },
      {
        fig: "Réel",
        label: "Ce que sont les démos",
        text: "Les démos Alerte d’échéances et Réception de formulaires exécutent le code des kits sur ce site. La démo Page de réservation est l’écran réel du kit.",
      },
      { fig: "3 jours", label: "Délai de réponse", text: "Les questions et demandes de projet reçoivent une réponse sous 3 jours ouvrés." },
      { fig: "14 jours", label: "Assistance après l’achat", text: "Pendant 14 jours après l’achat, si un kit ne fonctionne pas en suivant le guide, nous vérifions l’installation ensemble par e-mail." },
    ],
    threeHead: "Pour commencer : trois kits",
    threeLede: "Les trois premiers kits du rayon automatisation. Tous fonctionnent dans Google Sheets, s’installent en 15 à 20 minutes environ en suivant le guide, et n’ont aucun abonnement mensuel.",
    setLine: (label: string, price: string, total: string) =>
      `${label} sont aussi proposés en lot pour ${price} (TTC ; ${total} achetés séparément). Le lot se choisit sur la page BOOTH de chaque kit.`,
    moreKits: (n: number) => `Voir les ${n} kits, avec captures d’écran`,
    ladderHead: "Tarifs et déroulement",
    ladderLede: "Installez un kit vous-même, ou confiez-moi l’installation, une intégration d’IA, ou la création d’une landing page ou d’un site. Les petites corrections sont aussi bienvenues.",
    ladderCta: "Me contacter (réponse sous 3 jours ouvrés)",
    mailBefore: "Ou écrivez à ",
    mailAfter: ".",
    makerHead: "Qui fabrique tout cela",
    maker1:
      "Les kits et ce site sont réalisés par suminawa, en indépendant. Plus de 3 ans en développement et maintenance de systèmes web, ingénierie système côté client, assurance qualité de systèmes sous contrat, et outils d’automatisation.",
    maker2: "Je construis avec des agents IA et je vérifie tout moi-même avant la publication.",
    aboutLink: "À propos (en japonais)",
    readsHead: "Guides (en japonais)",
    readsAll: "Tous les guides",
  },
};
