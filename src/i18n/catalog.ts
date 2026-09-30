/*
 * 目録（src/lib/projects.ts）の英仏。日本語は projects.ts のまま持ち、ここは en・fr だけ。
 * 数字（料金の目安・値段）は projects.ts と同じ出どころで、ここで新しい額を作らない。
 * 値札は src/lib/prices.ts の表を同じように引く（要求のたびに組む紙から呼ぶ）。
 */
import { guides, type Guide } from "@/lib/guides";
import { priceNow } from "@/lib/prices";
import {
  CONTACT_PAGE,
  GATES,
  INDEX_PAGES,
  SERVICES,
  SERVICES_BRIEF,
  SERVICES_NOTE,
  STEPS,
  categoryCount,
  type Category,
  type Gate,
  type IndexPage,
  type Project,
  type Sale,
} from "@/lib/projects";

import type { ForeignLang, Lang } from "./routes";
import { UI, dateLabel, money } from "./ui";

type Line = { title: string; description: string };
type Menu = { title: string; price: string }[];

type Catalog = {
  gates: Record<Category, string>;
  index: Record<Category, Omit<IndexPage, "latin">>;
  contact: Omit<IndexPage, "latin">;
  services: Menu;
  servicesBrief: Menu;
  steps: { title: string; detail: string }[];
  servicesNote: { before: string; after: string };
  /** slug → 題と一行。projects.ts の全行 */
  projects: Record<string, Line>;
  tags: Record<string, string>;
  /** 見本の行に添える「日本語です」の札 */
  japaneseTag: string;
  guides: { heading: string; lede: string; marker: string; titles: Record<string, string> };
};

export const CATALOG: Record<ForeignLang, Catalog> = {
  en: {
    gates: {
      kits: "Kits and templates you can buy",
      sites: "Sample sites by industry",
      works: "Works and tools, plus a 30-day log",
    },
    index: {
      kits: {
        title: "Kits and templates",
        lede: "Ready-to-use kits and templates. Items on sale show today’s price (during a launch offer, also the end date and the regular price). Purchases are made in Japanese on BOOTH or note, and priced in Japanese yen.",
      },
      sites: {
        title: "Sample sites",
        lede: "Each one is a sample site for a fictional Japanese company, so the content is in Japanese. Together they make up the Industry Landing Page Template Pack.",
      },
      works: {
        title: "Works and tools",
        lede: "Works and tools you can try right here on the page.",
      },
    },
    contact: {
      title: "Project inquiries",
      lede: "Websites and landing pages, business automation, embedded components, and WebGL visuals, built to order.",
    },
    services: [
      { title: "Websites and landing pages", price: "A one-page landing page from ¥150,000" },
      {
        title: "Business automation (Google Apps Script)",
        price: "Setting up a ready-made kit: ¥30,000. Custom development from ¥40,000",
      },
      {
        title: "Embedded components (AI help desk, floor plan, 3D product page)",
        price: "From ¥60,000",
      },
      { title: "WebGL / GLSL visuals", price: "From ¥50,000" },
    ],
    servicesBrief: [
      { title: "Websites and landing pages", price: "A one-page landing page from ¥150,000" },
      { title: "Business automation (Google Apps Script)", price: "Ready-made kit setup from ¥30,000" },
      { title: "Embedded components", price: "From ¥60,000" },
    ],
    steps: [
      { title: "Inquiry", detail: "We start by email: your goals and where things stand today" },
      { title: "Quote", detail: "You receive a written quote covering scope, timeline, and price" },
      {
        title: "Build and delivery",
        detail: "You see progress on screen along the way, and delivery includes a user guide",
      },
    ],
    servicesNote: {
      before: "Prices are estimates, excluding tax. Replies in English or Japanese. For requests and questions, write to ",
      after: ".",
    },
    projects: {
      "quote-simulator": {
        title: "Quote Calculator Template",
        description: "Enter the job details and see the quote breakdown and total instantly.",
      },
      deadline: {
        title: "Deadline Alert GAS Kit",
        description: "Deadlines from a spreadsheet, gathered into one message every morning.",
      },
      form: {
        title: "Form Intake GAS Kit",
        description: "A home for inquiries: saved to a sheet, with notifications and auto-replies.",
      },
      floorplan: {
        title: "Floor Plan Simulator",
        description: "Paint a grid to draw a floor plan, add furniture, and view it in 3D.",
      },
      "lp-pack": {
        title: "Industry Landing Page Template Pack",
        description: "All six sample sites in one pack. Swap the copy and colors to make them yours.",
      },
      "ai-concierge": {
        title: "AI Help Desk Kit",
        description: "Answers questions on your site using only your own documents.",
      },
      "doc-reader": {
        title: "AI Document Reader Kit",
        description: "Reads invoices and receipts, and adds them to a table once you’ve checked them.",
      },
      "sheet-app": {
        title: "Spreadsheet Business App Kit",
        description: "List your columns in a definition sheet and get list and entry screens. Version 1.1 adds LINE notifications and sending.",
      },
      booking: {
        title: "Booking Page Kit",
        description: "Write your time slots in a sheet, and its URL becomes a booking page.",
      },
      "inbox-triage": {
        title: "AI Inquiry Triage Kit",
        description: "AI reads Gmail inquiries, logs categories and summaries to a sheet, and saves reply drafts.",
      },
      "line-concierge": {
        title: "LINE Help Desk Kit",
        description: "Adds a help desk to your LINE Official Account that answers politely, using only your own documents.",
      },
      dashboard: {
        title: "Dashboard Kit",
        description: "Turns spreadsheet or CSV numbers into KPIs and charts, with configuration alone.",
      },
      configurator: {
        title: "3D Product Configurator",
        description: "Rotate the product, pick colors and materials, and see the price as you go.",
      },
      "saas-starter": {
        title: "SaaS Starter Kit",
        description: "The foundation of a membership service: login, organizations, permissions, and billing.",
      },
      "shopify-configurator": {
        title: "3D Configurator for Shopify",
        description: "Adds 3D options to Shopify product pages. The chosen options stay on the order.",
      },
      "mcp-server": {
        title: "MCP Server Kit",
        description: "Search and add records in your business app, booking, and document sheets from a chat with Claude or ChatGPT.",
      },
      "corporate-site": {
        title: "Company Website",
        description: "Company site for a fictional measurement firm, with three inner pages.",
      },
      "saas-lp": {
        title: "B2B SaaS Landing Page",
        description: "A fictional time-tracking SaaS. The pricing toggle works.",
      },
      "shop-lp": {
        title: "Shop and Salon Landing Page",
        description: "A fictional bake shop. The menu and booking both work.",
      },
      "construction-lp": {
        title: "Construction Landing Page",
        description: "A fictional building-services contractor, with a call button and service areas.",
      },
      "professional-lp": {
        title: "Professional Services Landing Page",
        description: "A fictional accounting office, with a switch between three advisory plans.",
      },
      "clinic-lp": {
        title: "Clinic Landing Page",
        description: "A fictional dental clinic, with an opening-hours table and online booking.",
      },
      suminagashi: {
        title: "Suminagashi — Ink Marbling",
        description: "A GPU fluid basin where indigo and ink swirl. Stir it and save the pattern.",
      },
      "tax-back": {
        title: "Tax-Inclusive Price Breakdown",
        description: "From a tax-inclusive price, get the pre-tax amount and consumption tax for an invoice.",
      },
      "30days": {
        title: "Thirty Days",
        description: "30 days of letting AI do all the work. A public log of sales and hours, updated daily.",
      },
    },
    tags: { 公開ログ: "Public log", 見本サイト: "Sample site", "見本 LP": "Sample LP" },
    japaneseTag: "In Japanese",
    guides: {
      heading: "Guides (Japanese only)",
      lede: "Step-by-step articles on problems that come up again and again, each with a matching kit. Available in Japanese.",
      marker: "Japanese",
      titles: {
        "pdf-to-spreadsheet": "Stop retyping PDF invoices into a spreadsheet",
        "customer-sheet": "When a customer spreadsheet slowly falls apart",
        "line-auto-reply": "Answer LINE Official Account inquiries from your own documents only",
        "booking-page": "Let customers pick an open slot instead of booking by phone and LINE",
        "monthly-sales-report": "Stop rebuilding monthly sales totals and charts by hand",
        "inbox-triage": "When inquiry emails get buried and replies are late or missed",
      },
    },
  },

  fr: {
    gates: {
      kits: "Kits et modèles à acheter",
      sites: "Sites d’exemple par secteur",
      works: "Réalisations et outils, et un journal de 30 jours",
    },
    index: {
      kits: {
        title: "Kits et modèles",
        lede: "Des kits et des modèles prêts à l’emploi. Les articles en vente affichent le prix du jour (pendant une offre de lancement, aussi la date de fin et le prix normal). L’achat se fait en japonais sur BOOTH ou note, avec paiement en yens.",
      },
      sites: {
        title: "Sites d’exemple",
        lede: "Chaque site est un exemple réalisé pour une entreprise japonaise fictive ; le contenu est donc en japonais. Ensemble, ils forment le pack de modèles de landing pages par secteur.",
      },
      works: {
        title: "Réalisations et outils",
        lede: "Des réalisations et des outils à essayer directement sur la page.",
      },
    },
    contact: {
      title: "Demandes de projet",
      lede: "Sites et landing pages, automatisation des tâches, intégration de composants et effets WebGL, réalisés sur mesure.",
    },
    services: [
      { title: "Sites et landing pages", price: "Landing page d’une page à partir de 150 000 ¥" },
      {
        title: "Automatisation des tâches (Google Apps Script)",
        price: "Mise en place d’un kit existant : 30 000 ¥. Développement sur mesure à partir de 40 000 ¥",
      },
      {
        title: "Intégration de composants (accueil IA, plan, page produit 3D)",
        price: "À partir de 60 000 ¥",
      },
      { title: "Effets WebGL / GLSL", price: "À partir de 50 000 ¥" },
    ],
    servicesBrief: [
      { title: "Sites et landing pages", price: "Landing page d’une page à partir de 150 000 ¥" },
      { title: "Automatisation des tâches (Google Apps Script)", price: "Kit existant à partir de 30 000 ¥" },
      { title: "Intégration de composants", price: "À partir de 60 000 ¥" },
    ],
    steps: [
      { title: "Premier contact", detail: "Par e-mail : vos objectifs et la situation actuelle" },
      { title: "Devis", detail: "Un devis écrit précisant le périmètre, le délai et le prix" },
      {
        title: "Réalisation et livraison",
        detail: "L’avancement vous est montré à l’écran en cours de route ; la livraison comprend un guide d’utilisation",
      },
    ],
    servicesNote: {
      before: "Tarifs indicatifs, hors taxes. Réponses en anglais ou en japonais : écrivez en anglais ou en français simple. Pour toute demande : ",
      after: ".",
    },
    projects: {
      "quote-simulator": {
        title: "Modèle de calculateur de devis",
        description: "Saisissez les conditions : le détail du devis et le total s’affichent aussitôt.",
      },
      deadline: {
        title: "Kit GAS d’alertes d’échéances",
        description: "Les échéances d’un tableur, regroupées en un seul message chaque matin.",
      },
      form: {
        title: "Kit GAS de réception de formulaires",
        description: "Les demandes reçues vont dans un tableur, avec notification et réponse automatique.",
      },
      floorplan: {
        title: "Simulateur de plan",
        description: "Peignez une grille pour dessiner le plan, placez les meubles et voyez le tout en 3D.",
      },
      "lp-pack": {
        title: "Pack de modèles de landing pages par secteur",
        description: "Les six sites d’exemple en un seul pack. Changez les textes et les couleurs pour les adapter.",
      },
      "ai-concierge": {
        title: "Kit d’accueil IA",
        description: "Répond aux questions sur votre site, à partir de vos seuls documents.",
      },
      "doc-reader": {
        title: "Kit de lecture de documents IA",
        description: "Lit factures et reçus, puis les place dans un tableau après votre vérification.",
      },
      "sheet-app": {
        title: "Kit d’application métier sur tableur",
        description: "Décrivez vos colonnes dans une feuille de définition : les écrans de liste et de saisie sont prêts. La 1.1 ajoute les notifications et l’envoi LINE.",
      },
      booking: {
        title: "Kit de page de réservation",
        description: "Inscrivez vos créneaux dans un tableur : son URL devient une page de réservation.",
      },
      "inbox-triage": {
        title: "Kit de tri des demandes par IA",
        description: "L’IA lit les demandes reçues dans Gmail, note catégorie et résumé dans un tableur et prépare des brouillons de réponse.",
      },
      "line-concierge": {
        title: "Kit d’accueil LINE",
        description: "Ajoute à votre compte officiel LINE un accueil qui répond poliment, à partir de vos seuls documents.",
      },
      dashboard: {
        title: "Kit de tableau de bord",
        description: "Transforme les chiffres d’un tableur ou d’un CSV en indicateurs et graphiques, par simple configuration.",
      },
      configurator: {
        title: "Configurateur de produit 3D",
        description: "Faites tourner le produit, choisissez couleurs et matières, et voyez le prix en direct.",
      },
      "saas-starter": {
        title: "Kit de démarrage SaaS",
        description: "La base d’un service avec comptes membres : connexion, organisations, droits et facturation.",
      },
      "shopify-configurator": {
        title: "Configurateur 3D pour Shopify",
        description: "Ajoute des options en 3D aux pages produit Shopify. Les choix restent sur la commande.",
      },
      "mcp-server": {
        title: "Kit de serveur MCP",
        description: "Recherchez et ajoutez des lignes dans vos tableurs (application métier, réservations, documents) depuis une conversation avec Claude ou ChatGPT.",
      },
      "corporate-site": {
        title: "Site d’entreprise",
        description: "Le site d’une entreprise fictive de métrologie, avec trois pages internes.",
      },
      "saas-lp": {
        title: "Landing page SaaS B2B",
        description: "Un SaaS fictif de gestion des temps. Le sélecteur de tarifs fonctionne.",
      },
      "shop-lp": {
        title: "Landing page boutique et salon",
        description: "Une pâtisserie fictive. La carte et la réservation fonctionnent.",
      },
      "construction-lp": {
        title: "Landing page BTP",
        description: "Une entreprise fictive d’installations techniques, avec bouton d’appel et zones d’intervention.",
      },
      "professional-lp": {
        title: "Landing page professions libérales",
        description: "Un cabinet comptable fictif, avec un choix entre trois formules d’accompagnement.",
      },
      "clinic-lp": {
        title: "Landing page cabinet médical",
        description: "Un cabinet dentaire fictif, avec tableau des horaires et réservation en ligne.",
      },
      suminagashi: {
        title: "Suminagashi — marbrure à l’encre",
        description: "Un bassin de fluide sur GPU où l’indigo et l’encre tourbillonnent. Mélangez, puis enregistrez le motif.",
      },
      "tax-back": {
        title: "Du prix TTC au montant HT",
        description: "À partir d’un prix TTC, obtenez le montant HT et la taxe à la consommation pour la facture.",
      },
      "30days": {
        title: "Trente jours",
        description: "30 jours à tout confier à l’IA. Un journal public des ventes et du temps passé, mis à jour chaque jour.",
      },
    },
    tags: { 公開ログ: "Journal public", 見本サイト: "Site d’exemple", "見本 LP": "LP d’exemple" },
    japaneseTag: "En japonais",
    guides: {
      heading: "Guides (en japonais uniquement)",
      lede: "Des articles pas à pas sur des problèmes qui reviennent souvent, chacun associé à un kit. Disponibles en japonais.",
      marker: "Japonais",
      titles: {
        "pdf-to-spreadsheet": "Ne plus recopier à la main les factures PDF dans un tableur",
        "customer-sheet": "Quand le tableur clients se dégrade peu à peu",
        "line-auto-reply": "Répondre aux demandes LINE à partir de vos seuls documents",
        "booking-page": "Laisser les clients choisir un créneau libre plutôt que réserver par téléphone ou LINE",
        "monthly-sales-report": "Ne plus refaire chaque mois à la main les totaux et graphiques de ventes",
        "inbox-triage": "Quand les e-mails de demande se perdent et que les réponses tardent ou manquent",
      },
    },
  },
};

/** 品物の行をその言語で。日本語はそのまま、英仏は題・一行・札を差し替える（見本サイトには「日本語です」を添える） */
export function localProject(lang: Lang, project: Project): Project {
  if (lang === "ja") return project;
  const c = CATALOG[lang];
  const line = c.projects[project.slug];
  if (!line) throw new Error(`訳の無い品物: ${lang} ${project.slug}`);
  const tags = project.tags.map((t) => c.tags[t] ?? t);
  if (project.category === "sites") tags.push(c.japaneseTag);
  return { ...project, ...line, tags };
}

export function localGates(lang: Lang): Gate[] {
  if (lang === "ja") return [...GATES];
  return GATES.map((g) => ({ ...g, lead: CATALOG[lang].gates[g.id] }));
}

export function localIndexPage(lang: Lang, category: Category): IndexPage {
  const ja = INDEX_PAGES[category];
  return lang === "ja" ? ja : { ...CATALOG[lang].index[category], latin: ja.latin };
}

export function localContact(lang: Lang) {
  if (lang === "ja") {
    return {
      page: CONTACT_PAGE,
      services: SERVICES,
      servicesBrief: SERVICES_BRIEF,
      steps: STEPS,
      note: SERVICES_NOTE,
    };
  }
  const c = CATALOG[lang];
  return {
    page: { ...c.contact, latin: CONTACT_PAGE.latin },
    services: c.services,
    servicesBrief: c.servicesBrief,
    steps: c.steps,
    note: { ...c.servicesNote, mail: SERVICES_NOTE.mail },
  };
}

/** 英仏の guides の行（題は訳、飛び先は日本語の紙） */
export function localGuides(lang: ForeignLang): (Guide & { localTitle: string })[] {
  return guides.map((g) => {
    const localTitle = CATALOG[lang].guides.titles[g.slug];
    if (!localTitle) throw new Error(`訳の無い guide: ${lang} ${g.slug}`);
    return { ...g, localTitle };
  });
}

/** 入口 3 行に添える件数（数えるのは projects.ts の categoryCount） */
export function localCountLabel(lang: Lang, category: Category): string {
  const { total, onsale } = categoryCount(category);
  return UI[lang].count(total, onsale);
}

/**
 * 値札（projects.ts の saleLabel の三言語版）。日本語は saleLabel と同じ字になる（テストで照らす）。
 * slug を渡すと発売記念の表を引く。now はテスト用。
 */
export function localSaleLabel(
  lang: Lang,
  sale: Sale,
  opts: { detail?: boolean; slug?: string; now?: Date } = {},
): string {
  const t = UI[lang];
  if (sale.status === "free") return t.free;
  if (sale.status === "onsale" && sale.price != null) {
    const now = opts.slug ? priceNow(opts.slug, sale.price, opts.now) : { price: sale.price };
    if (now.intro) {
      return t.intro(money(lang, now.price), dateLabel(lang, now.intro.until), money(lang, now.intro.list));
    }
    return t.onsale(money(lang, now.price));
  }
  if (opts.detail && sale.status === "upcoming" && sale.launch && sale.price != null) {
    // launch は「10/2」の形で持っている（年は持たない）
    const [m, d] = sale.launch.split("/").map(Number);
    const iso = `2000-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    return t.launch(dateLabel(lang, iso), money(lang, sale.price));
  }
  return t.upcoming;
}

export function localPriceLabel(lang: Lang, project: Project, now?: Date): string | null {
  if (!project.sale) return null;
  return localSaleLabel(lang, project.sale, { slug: project.slug, now });
}
