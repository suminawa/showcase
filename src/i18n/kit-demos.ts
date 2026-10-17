/*
 * GAS キット 3 本の見本ページの結び（src/lib/kit-demos.ts）の英仏。
 * 比べる相手・出どころの URL・数字は日本語と同じもので、ここで新しい数字を作らない。
 * 値段は同じ表（prices.ts）を要求の時刻で引く。
 */
import { STORES_CHECKED_ON, STORES_PRICING, kitDemo, type KitDemo, type KitDemoSlug } from "@/lib/kit-demos";
import { nextDate, priceNow } from "@/lib/prices";
import { projects } from "@/lib/projects";

import type { ForeignLang, Lang } from "./routes";
import { dateLabel, money } from "./ui";

type KitDemoBase = Omit<KitDemo, "price" | "priceNote">;

const LICENSE = {
  en: "LICENSE.md (use it freely in your own business; you may also deliver modified versions built into your clients’ spreadsheets. No redistribution or resale)",
  fr: "LICENSE.md (utilisation libre dans votre activité ; vous pouvez aussi livrer une version modifiée intégrée au tableur de vos clients. Ni redistribution ni revente)",
};

const GAS_BUNDLE = {
  en: "dist/Code.gs (a single file to paste into Apps Script) and appsscript.json",
  fr: "dist/Code.gs (un seul fichier à coller dans Apps Script) et appsscript.json",
};

const SOURCE = {
  en: "The full src/ source code and tests",
  fr: "Le code source complet (src/) et les tests",
};

const NO_MONTHLY = { en: " No monthly fees.", fr: " Aucun abonnement." };

const LICENSE_WEB = {
  en: "LICENSE.md (modify it and deliver it to clients freely; no redistribution, resale, or selling it as a similar product)",
  fr: "LICENSE.md (modification et livraison libres ; ni redistribution, ni revente, ni produit concurrent)",
};

const GAS_SETUP = {
  en: "About 15–20 minutes to paste the code into a spreadsheet and initialize it from the menu. Along the way, Google shows a warning screen (“Google hasn’t verified this app”). That’s expected for a script you pasted yourself, and the guide walks you through it using the exact on-screen wording.",
  fr: "Environ 15 à 20 minutes pour coller le code dans un tableur et l’initialiser depuis le menu. En cours de route, Google affiche un écran d’avertissement (« Google n’a pas validé cette application »). C’est normal pour un script que vous avez collé vous-même, et le guide explique la marche à suivre avec les mots exacts de l’écran.",
};

export const KIT_DEMOS_I18N: Record<ForeignLang, Record<KitDemoSlug, KitDemoBase>> = {
  en: {
    deadline: {
      slug: "deadline",
      linkKey: "s2",
      name: "Deadline Alert GAS Kit",
      box: [
        GAS_BUNDLE.en,
        "Sample deadline and settings sheets (CSV)",
        "A setup guide in Japanese (README.ja.md), covering the warning screens and common pitfalls",
        SOURCE.en,
        LICENSE.en,
      ],
      setup: GAS_SETUP.en + NO_MONTHLY.en,
      freeEnough: [
        {
          who: "If email alerts are all you need",
          alt: {
            name: "Add Reminders (Google Workspace Marketplace)",
            href: "https://workspace.google.com/marketplace/app/add_reminders/404177452106",
            note: "A free add-on. Sends email reminders before or after the dates in a column.",
          },
        },
        {
          who: "If you only need Slack alerts for a single sheet",
          alt: {
            name: "Check Sheet Notifications (Google Workspace Marketplace)",
            href: "https://workspace.google.com/marketplace/app/check_sheet_notifications/239755856136",
            note: "The free tier covers one check and up to 500 messages a month. Sends to email, Slack, Teams, Discord, and Google Chat.",
          },
        },
        {
          who: "If you just need a one-line reminder on set dates, with no ledger",
          alt: {
            name: "Slack reminders (/remind)",
            href: "https://slack.com/intl/ja-jp/help/articles/208423427",
            note: "Built into Slack. It doesn’t read spreadsheets.",
          },
        },
      ],
      fits: [
        { who: "You want overdue items, today’s items, and items due in N days gathered into one morning message on Slack or Discord" },
        { who: "You want completed rows skipped, and no second alert on the same day" },
        {
          who: "You want to keep the code yourself, with no monthly fee. Check Sheet Notifications is billed monthly from the second check",
          alts: [
            {
              name: "Check Sheet Notifications pricing",
              href: "https://workspace.google.com/marketplace/app/check_sheet_notifications/239755856136",
              note: "$9.99/month beyond the free tier.",
            },
          ],
        },
      ],
    },
    form: {
      slug: "form",
      linkKey: "s3",
      name: "Form Intake GAS Kit",
      box: [
        GAS_BUNDLE.en,
        "A ready-to-use sample form (form-sample.html)",
        "Sample settings, intake, and time-slot sheets (CSV)",
        "A setup guide in Japanese (README.ja.md), covering how to publish it as a web app and common pitfalls",
        SOURCE.en,
        LICENSE.en,
      ],
      setup:
        "About 20 minutes to paste the code into a spreadsheet, initialize it, and publish it as a web app. Google shows a warning screen (“Google hasn’t verified this app”) twice along the way. That’s expected for a script you pasted yourself, and the guide walks you through it using the exact on-screen wording." +
        NO_MONTHLY.en,
      freeEnough: [
        {
          who: "If the Google Forms look is fine for your form",
          alt: {
            name: "Google Forms + Email Notifications for Google Forms",
            href: "https://workspace.google.com/marketplace/app/email_notifications_for_google_forms/984866591130",
            note: "Adds confirmation emails and Slack or Discord notifications. The add-on’s free version is limited to 20 responses a day.",
          },
        },
        {
          who: "If you need file attachments or CAPTCHA and use WordPress",
          alt: {
            name: "Contact Form 7 (WordPress plugin)",
            href: "https://ja.wordpress.org/plugins/contact-form-7/",
            note: "Free. Supports auto-replies, reCAPTCHA, and file attachments. This kit can’t accept file attachments.",
          },
        },
      ],
      fits: [
        { who: "You want to keep your own HTML form design and simply own where it submits" },
        {
          who: "You want auto-replies and Slack, Discord, or LINE notifications with no monthly fee. Form services put both on paid plans",
          alts: [
            {
              name: "formrun pricing",
              href: "https://form.run/home/pricing",
              note: "The free plan doesn’t include auto-replies or Slack notifications.",
            },
            {
              name: "Formspree pricing",
              href: "https://formspree.io/plans",
              note: "The free plan is limited to 50 submissions a month, and auto-replies need a paid plan.",
            },
          ],
        },
        { who: "You want reference numbers and a capacity limit per date and time (booking slots)" },
      ],
    },
    "inbox-triage": {
      slug: "inbox-triage",
      linkKey: "inbox-triage",
      name: "AI Inquiry Triage Kit",
      box: [
        GAS_BUNDLE.en,
        "8 sample emails with their expected results, and a sample settings sheet (CSV)",
        "The exact prompt sent to the AI (prompt-sample.md)",
        "A setup guide in Japanese (README.ja.md), covering what the authorization screen means, cost estimates, and whose account it runs under",
        "The full src/ source code and tests (including checks that it contains no commands to send or delete email)",
        LICENSE.en,
      ],
      setup:
        "About 20 minutes to paste the code into a spreadsheet, authorize it, and try it on the sample emails. Google shows a warning screen along the way. You also need an Anthropic API key, which requires registering a payment method. API costs are charged to your own key, based on how many emails are read.",
      freeEnough: [
        {
          who: "If logging categories and summaries to a sheet is enough, without drafts or notifications",
          alt: {
            name: "Qiita article “Classifying inquiries with GAS × Gemini” (Japanese)",
            href: "https://qiita.com/rira__/items/c336673b3bbcaebdf3f8",
            note: "The full code is published for free. No reply drafts or notifications.",
          },
        },
        {
          who: "If you already use n8n",
          alt: {
            name: "n8n template #14852",
            href: "https://n8n.io/workflows/14852-triage-gmail-inbox-draft-replies-and-alert-urgent-emails-with-claude-and-slack/",
            note: "Very close in scope: it classifies with Claude, drafts replies, sends urgent Slack alerts, and logs to a sheet. The template is free; running it needs n8n Cloud or your own server.",
          },
        },
        {
          who: "If you’re on a paid Google Workspace plan and Gemini plus Google Chat is enough",
          alt: {
            name: "Google Workspace Studio",
            href: "https://support.google.com/workspace-studio/answer/16444479?hl=en",
            note: "Build flows that start from Gmail, let Gemini decide, and create drafts or post to Chat, all from the interface.",
          },
        },
      ],
      fits: [
        {
          who: "You want everything to stay inside Gmail and Sheets, with no server and no monthly service fee. n8n Cloud is billed monthly",
          alts: [{ name: "n8n pricing", href: "https://n8n.io/pricing/", note: "n8n Cloud starts at €20/month." }],
        },
        { who: "You want 8 categories, urgency, and summaries in Japanese, plus polite reply drafts. A person sends them; nothing is sent automatically" },
        { who: "You want a single message, action items first, on Slack, Discord, or LINE" },
      ],
    },

    "ai-concierge": {
      slug: "ai-concierge",
      linkKey: "ai-concierge",
      name: "AI Help Desk Kit",
      checkedOn: "2026-10-15",
      box: [
        "dist/ (server parts, the chat window for your site, the indexer, and a Node adapter)",
        "templates/nextjs (a Next.js template you can deploy on Vercel)",
        "samples/ (8 documents and settings for a fictional builder) and a 31-question evaluation (eval/)",
        "A setup guide in Japanese (README.ja.md), including how to try the window without an API key",
        SOURCE.en,
        LICENSE_WEB.en,
      ],
      setup:
        "Three ways to host it (deploy the bundled template on Vercel, add it to your Next.js app, or run it on your own server); in every case you add just two lines to your site. Write your documents in Markdown and build the index with one command. Claude API costs are charged to your own key: at 100 questions a day for 30 days, expect roughly ¥4,600–23,000 a month, depending on the model and how the questions are spaced.",
      freeEnough: [
        {
          who: "If only a few questions need AI answers and you want to try first",
          alt: {
            name: "Tidio free plan",
            href: "https://www.tidio.com/pricing/",
            note: "There is a free plan. AI replies (Lyro) are limited to your first 50 conversations.",
          },
        },
      ],
      fits: [
        { who: "You want a window on your site that answers only from your own documents, with source links, and hands off anything not covered to your contact form" },
        {
          who: "You want to pay only for API usage, with no monthly service fee. Chatbase has paid plans only, billed monthly",
          alts: [
            {
              name: "Chatbase pricing",
              href: "https://www.chatbase.co/pricing",
              note: "The entry Hobby plan starts at $32/month, billed yearly.",
            },
          ],
        },
        { who: "You want to see unanswered questions in a list and keep improving your documents" },
      ],
    },
    "sheet-app": {
      slug: "sheet-app",
      linkKey: "sheet-app",
      name: "Spreadsheet Business App Kit",
      checkedOn: "2026-10-15",
      box: [
        "dist/ (Code.gs, App.html and appsscript.json to paste into Apps Script)",
        "Definitions and tables for 3 sample ledgers: customers, deals and inventory (CSV)",
        "A demo page that runs in the browser (demo/)",
        "A setup guide in Japanese (README.ja.md)",
        SOURCE.en,
        LICENSE.en,
      ],
      setup:
        "About 10 minutes to create a spreadsheet, paste the 3 files, load the samples and publish it as a web app. Google shows a warning screen along the way, and the guide walks you through it." + NO_MONTHLY.en + " Only if you turn on the optional AI features do API costs apply, to your own Anthropic key.",
      freeEnough: [
        {
          who: "If a prototype or a trial with up to 10 users is enough",
          alt: {
            name: "AppSheet (Google)",
            href: "https://about.appsheet.com/pricing/",
            note: "Building apps and testing them with up to 10 users is free.",
          },
        },
      ],
      fits: [
        {
          who: "You don’t want a per-user monthly fee once more than 10 people use it. AppSheet charges per user, per month in production",
          alts: [
            {
              name: "AppSheet pricing",
              href: "https://about.appsheet.com/pricing/",
              note: "Starter begins at $5 per user, per month.",
            },
          ],
        },
        { who: "You want to list, search, add and edit records from a phone while the ledger stays a spreadsheet" },
        { who: "You want LINE, Slack or Discord notifications on changes, or to send template messages over LINE" },
      ],
    },
    booking: {
      slug: "booking",
      linkKey: "booking",
      name: "Booking Page Kit",
      checkedOn: "2026-10-15",
      box: [
        "dist/ (Code.gs, App.html and appsscript.json to paste into Apps Script)",
        "Settings, slots, closed days, services and bookings sheets for a fictional clinic (CSV)",
        "A demo page that runs in the browser (demo/)",
        "A setup guide in Japanese (README.ja.md)",
        SOURCE.en,
        LICENSE.en,
      ],
      setup:
        "About 15 minutes to create a spreadsheet, paste the 3 files and publish it as a web app. Google shows a warning screen along the way." + NO_MONTHLY.en + " There is no extra cost however many bookings come in; emails go out within Google’s quota (100 a day on a personal Gmail account).",
      freeEnough: [
        {
          who: "If taking bookings on one person’s Google Calendar is enough",
          alt: {
            name: "Google Calendar appointment schedules",
            href: "https://support.google.com/calendar/answer/10729749?hl=ja",
            note: "Personal Google accounts can create them too. Some features need a paid Google Workspace or Google One subscription.",
          },
        },
        {
          who: "If your bookings stay within 50 a month",
          alt: {
            name: "STORES booking service (free plan)",
            href: STORES_PRICING,
            note: "The free plan takes up to 50 bookings a month.",
            checkedOn: STORES_CHECKED_ON,
          },
        },
      ],
      fits: [
        {
          who: "You want to take more than 50 bookings a month without paying a booking service a monthly fee. This kit costs the same however many bookings come in",
          alts: [
            {
              name: "STORES booking service pricing",
              href: STORES_PRICING,
              note: "The free plan is limited to 50 bookings a month.",
              checkedOn: STORES_CHECKED_ON,
            },
          ],
        },
        { who: "You want slots with room for 2 or more people at the same time, or a choice of services with different durations" },
        {
          who: "You want confirmation emails, day-before reminders and self-service cancellation with no monthly fee. In Google Calendar, reminder emails are a paid feature",
          alts: [
            {
              name: "About Google Calendar appointment schedules",
              href: "https://support.google.com/calendar/answer/190998?hl=ja",
              note: "A paid subscription unlocks features such as reminder emails and paid appointments.",
            },
          ],
        },
        { who: "You want every booking kept as a row in a spreadsheet, with alerts on Slack, Discord or LINE" },
      ],
    },
    "saas-starter": {
      slug: "saas-starter",
      linkKey: "saas-starter",
      name: "SaaS Starter Kit",
      checkedOn: "2026-10-15",
      box: [
        "app/ (screens) and src/ (core, ports, adapters, server)",
        "supabase/ (migration SQL, RLS checks, auth email templates)",
        "legal/ (templates for the Japanese commercial transactions notice, terms of service and privacy policy, 6 files in Japanese and English)",
        "messages/ (Japanese and English strings) plus scripts/ and test/ (checks that need neither Docker nor keys)",
        "README in Japanese and English",
        LICENSE_WEB.en,
      ],
      setup:
        "Three commands (npm ci, cp .env.example .env.local, npm run dev) start a demo mode that talks to neither Supabase nor Stripe, and you can tour every screen in 15 minutes. In production it connects to your own Supabase and Stripe accounts. Once you launch commercially, Vercel Pro and Supabase Pro start at about $45 a month (based on each provider’s prices in September 2026).",
      freeEnough: [
        {
          who: "If English screens and two roles (owner and member) are enough",
          alt: {
            name: "Next.js SaaS Starter (GitHub)",
            href: "https://github.com/nextjs/saas-starter",
            note: "Free under the MIT license. It includes email and password login, Stripe billing, Owner and Member roles, and Postgres (Drizzle).",
          },
        },
      ],
      fits: [
        { who: "You want the Japanese commercial transactions notice and monthly billing in yen set up the Japanese way from day one" },
        { who: "You want three roles (owner, admin, member) decided by one table that drives the screens, the server and the database rules (RLS)" },
        { who: "You want organizations, invitations, and three ways to sign in (email link, password, Google) ready and tested from the start" },
      ],
    },
  },

  fr: {
    deadline: {
      slug: "deadline",
      linkKey: "s2",
      name: "Kit GAS d’alertes d’échéances",
      box: [
        GAS_BUNDLE.fr,
        "Des feuilles d’exemple pour les échéances et les réglages (CSV)",
        "Un guide d’installation en japonais (README.ja.md), avec les écrans d’avertissement et les pièges courants",
        SOURCE.fr,
        LICENSE.fr,
      ],
      setup: GAS_SETUP.fr + NO_MONTHLY.fr,
      freeEnough: [
        {
          who: "Si des alertes par e-mail vous suffisent",
          alt: {
            name: "Add Reminders (Google Workspace Marketplace)",
            href: "https://workspace.google.com/marketplace/app/add_reminders/404177452106",
            note: "Module complémentaire gratuit. Envoie un rappel par e-mail avant ou après les dates d’une colonne.",
          },
        },
        {
          who: "Si vous n’avez besoin d’alertes Slack que pour une seule feuille",
          alt: {
            name: "Check Sheet Notifications (Google Workspace Marketplace)",
            href: "https://workspace.google.com/marketplace/app/check_sheet_notifications/239755856136",
            note: "L’offre gratuite couvre une vérification et jusqu’à 500 messages par mois. Envoi vers e-mail, Slack, Teams, Discord et Google Chat.",
          },
        },
        {
          who: "Si un rappel d’une ligne à date fixe suffit, sans registre",
          alt: {
            name: "Rappels Slack (/remind)",
            href: "https://slack.com/intl/ja-jp/help/articles/208423427",
            note: "Intégré à Slack. Ne lit pas les tableurs.",
          },
        },
      ],
      fits: [
        { who: "Vous voulez recevoir chaque matin, en un seul message sur Slack ou Discord, les échéances dépassées, celles du jour et celles à N jours" },
        { who: "Vous voulez ignorer les lignes terminées et ne jamais recevoir deux alertes le même jour" },
        {
          who: "Vous voulez garder le code chez vous, sans abonnement. Check Sheet Notifications devient payant au mois dès la deuxième vérification",
          alts: [
            {
              name: "Tarifs de Check Sheet Notifications",
              href: "https://workspace.google.com/marketplace/app/check_sheet_notifications/239755856136",
              note: "9,99 $ par mois au-delà de l’offre gratuite.",
            },
          ],
        },
      ],
    },
    form: {
      slug: "form",
      linkKey: "s3",
      name: "Kit GAS de réception de formulaires",
      box: [
        GAS_BUNDLE.fr,
        "Un formulaire d’exemple prêt à l’emploi (form-sample.html)",
        "Des feuilles d’exemple pour les réglages, les demandes et les créneaux (CSV)",
        "Un guide d’installation en japonais (README.ja.md), avec la publication en application web et les pièges courants",
        SOURCE.fr,
        LICENSE.fr,
      ],
      setup:
        "Environ 20 minutes pour coller le code dans un tableur, l’initialiser et le publier comme application web. Google affiche deux fois un écran d’avertissement (« Google n’a pas validé cette application »). C’est normal pour un script que vous avez collé vous-même, et le guide explique la marche à suivre avec les mots exacts de l’écran." +
        NO_MONTHLY.fr,
      freeEnough: [
        {
          who: "Si l’apparence de Google Forms vous convient",
          alt: {
            name: "Google Forms + Email Notifications for Google Forms",
            href: "https://workspace.google.com/marketplace/app/email_notifications_for_google_forms/984866591130",
            note: "Ajoute des e-mails de confirmation et des notifications Slack ou Discord. La version gratuite du module est limitée à 20 réponses par jour.",
          },
        },
        {
          who: "Si vous avez besoin de pièces jointes ou d’un CAPTCHA et utilisez WordPress",
          alt: {
            name: "Contact Form 7 (extension WordPress)",
            href: "https://ja.wordpress.org/plugins/contact-form-7/",
            note: "Gratuit. Réponses automatiques, reCAPTCHA et pièces jointes. Ce kit n’accepte pas les pièces jointes.",
          },
        },
      ],
      fits: [
        { who: "Vous voulez garder votre propre formulaire HTML et maîtriser simplement sa destination" },
        {
          who: "Vous voulez des réponses automatiques et des notifications Slack, Discord ou LINE sans abonnement. Les services de formulaires les réservent aux offres payantes",
          alts: [
            {
              name: "Tarifs de formrun",
              href: "https://form.run/home/pricing",
              note: "L’offre gratuite n’inclut ni réponse automatique ni notification Slack.",
            },
            {
              name: "Tarifs de Formspree",
              href: "https://formspree.io/plans",
              note: "L’offre gratuite est limitée à 50 envois par mois, et les réponses automatiques demandent une offre payante.",
            },
          ],
        },
        { who: "Vous voulez des numéros de référence et une capacité par date et heure (créneaux de réservation)" },
      ],
    },
    "inbox-triage": {
      slug: "inbox-triage",
      linkKey: "inbox-triage",
      name: "Kit de tri des demandes par IA",
      box: [
        GAS_BUNDLE.fr,
        "8 e-mails d’exemple avec les résultats attendus, et une feuille de réglages d’exemple (CSV)",
        "Le texte exact envoyé à l’IA (prompt-sample.md)",
        "Un guide d’installation en japonais (README.ja.md) : sens de l’écran d’autorisation, estimation des coûts, compte sous lequel il tourne",
        "Le code source complet (src/) et les tests (qui vérifient aussi l’absence de toute commande d’envoi ou de suppression d’e-mail)",
        LICENSE.fr,
      ],
      setup:
        "Environ 20 minutes pour coller le code dans un tableur, l’autoriser et l’essayer sur les e-mails d’exemple. Google affiche un écran d’avertissement en cours de route. Il faut aussi une clé API Anthropic, qui demande l’enregistrement d’un moyen de paiement. Les coûts d’API sont facturés sur votre propre clé, selon le nombre d’e-mails lus.",
      freeEnough: [
        {
          who: "Si noter catégorie et résumé dans un tableur suffit, sans brouillons ni notifications",
          alt: {
            name: "Article Qiita « Classer les demandes avec GAS × Gemini » (en japonais)",
            href: "https://qiita.com/rira__/items/c336673b3bbcaebdf3f8",
            note: "Le code complet est publié gratuitement. Ni brouillons de réponse ni notifications.",
          },
        },
        {
          who: "Si vous utilisez déjà n8n",
          alt: {
            name: "Modèle n8n n° 14852",
            href: "https://n8n.io/workflows/14852-triage-gmail-inbox-draft-replies-and-alert-urgent-emails-with-claude-and-slack/",
            note: "Très proche : classement avec Claude, brouillons, alertes Slack pour l’urgent et journal dans un tableur. Le modèle est gratuit ; il faut n8n Cloud ou votre propre serveur pour le faire tourner.",
          },
        },
        {
          who: "Si vous avez une offre Google Workspace payante et que Gemini et Google Chat suffisent",
          alt: {
            name: "Google Workspace Studio",
            href: "https://support.google.com/workspace-studio/answer/16444479?hl=en",
            note: "Créez depuis l’interface des flux déclenchés par Gmail, où Gemini décide, prépare des brouillons ou publie dans Chat.",
          },
        },
      ],
      fits: [
        {
          who: "Vous voulez tout garder dans Gmail et le tableur, sans serveur ni abonnement. n8n Cloud est payant au mois",
          alts: [{ name: "Tarifs de n8n", href: "https://n8n.io/pricing/", note: "n8n Cloud à partir de 20 € par mois." }],
        },
        { who: "Vous voulez 8 catégories, l’urgence et un résumé en japonais, avec des brouillons de réponse polis. C’est une personne qui envoie ; rien ne part automatiquement" },
        { who: "Vous voulez un seul message, les actions à faire en tête, sur Slack, Discord ou LINE" },
      ],
    },

    "ai-concierge": {
      slug: "ai-concierge",
      linkKey: "ai-concierge",
      name: "Kit d’assistant IA",
      checkedOn: "2026-10-15",
      box: [
        "dist/ (composants serveur, la fenêtre à placer sur votre site, l’indexeur et un adaptateur Node)",
        "templates/nextjs (un modèle Next.js à déployer sur Vercel)",
        "samples/ (8 documents et réglages pour une entreprise de construction fictive) et une évaluation de 31 questions (eval/)",
        "Un guide d’installation en japonais (README.ja.md), y compris pour essayer la fenêtre sans clé API",
        SOURCE.fr,
        LICENSE_WEB.fr,
      ],
      setup:
        "Trois façons de l’héberger (déployer le modèle fourni sur Vercel, l’ajouter à votre application Next.js ou le faire tourner sur votre serveur) ; dans tous les cas, deux lignes suffisent sur votre site. Rédigez vos documents en Markdown et créez l’index en une commande. Les frais de l’API Claude sont facturés à votre propre clé : pour 100 questions par jour pendant 30 jours, comptez environ 4 600 à 23 000 ¥ par mois selon le modèle et l’espacement des questions.",
      freeEnough: [
        {
          who: "Si l’IA n’a que peu de questions à traiter et que vous voulez d’abord essayer",
          alt: {
            name: "Offre gratuite de Tidio",
            href: "https://www.tidio.com/pricing/",
            note: "Il existe une offre gratuite. Les réponses de l’IA (Lyro) sont limitées aux 50 premières conversations.",
          },
        },
      ],
      fits: [
        { who: "Vous voulez sur votre site une fenêtre qui répond uniquement à partir de vos documents, avec les sources, et qui renvoie le reste vers votre formulaire de contact" },
        {
          who: "Vous voulez payer seulement l’usage de l’API, sans abonnement. Chatbase n’a que des offres payantes, facturées au mois",
          alts: [
            {
              name: "Tarifs de Chatbase",
              href: "https://www.chatbase.co/pricing",
              note: "L’offre Hobby, la moins chère, commence à 32 $/mois en paiement annuel.",
            },
          ],
        },
        { who: "Vous voulez voir la liste des questions restées sans réponse et compléter vos documents au fil du temps" },
      ],
    },
    "sheet-app": {
      slug: "sheet-app",
      linkKey: "sheet-app",
      name: "Kit d’application métier sur tableur",
      checkedOn: "2026-10-15",
      box: [
        "dist/ (Code.gs, App.html et appsscript.json à coller dans Apps Script)",
        "Définitions et tables de 3 registres d’exemple : clients, affaires et stocks (CSV)",
        "Une page de démo qui tourne dans le navigateur (demo/)",
        "Un guide d’installation en japonais (README.ja.md)",
        SOURCE.fr,
        LICENSE.fr,
      ],
      setup:
        "Environ 10 minutes pour créer un tableur, coller les 3 fichiers, charger les exemples et publier l’application web. Google affiche un écran d’avertissement en cours de route, et le guide explique la marche à suivre." + NO_MONTHLY.fr + " Seule l’IA, facultative, entraîne des frais d’API sur votre propre clé Anthropic.",
      freeEnough: [
        {
          who: "Si un prototype ou un essai avec 10 utilisateurs au plus vous suffit",
          alt: {
            name: "AppSheet (Google)",
            href: "https://about.appsheet.com/pricing/",
            note: "La création d’applications et les tests avec 10 utilisateurs au plus sont gratuits.",
          },
        },
      ],
      fits: [
        {
          who: "Vous ne voulez pas payer par utilisateur et par mois au-delà de 10 personnes. AppSheet facture chaque utilisateur au mois en production",
          alts: [
            {
              name: "Tarifs d’AppSheet",
              href: "https://about.appsheet.com/pricing/",
              note: "L’offre Starter commence à 5 $ par utilisateur et par mois.",
            },
          ],
        },
        { who: "Vous voulez consulter, chercher, ajouter et modifier depuis un téléphone, tout en gardant le registre dans un tableur" },
        { who: "Vous voulez être prévenu sur LINE, Slack ou Discord, ou envoyer des messages types par LINE" },
      ],
    },
    booking: {
      slug: "booking",
      linkKey: "booking",
      name: "Kit de page de réservation",
      checkedOn: "2026-10-15",
      box: [
        "dist/ (Code.gs, App.html et appsscript.json à coller dans Apps Script)",
        "Feuilles de réglages, créneaux, jours de fermeture, prestations et réservations d’un cabinet fictif (CSV)",
        "Une page de démo qui tourne dans le navigateur (demo/)",
        "Un guide d’installation en japonais (README.ja.md)",
        SOURCE.fr,
        LICENSE.fr,
      ],
      setup:
        "Environ 15 minutes pour créer un tableur, coller les 3 fichiers et publier l’application web. Google affiche un écran d’avertissement en cours de route." + NO_MONTHLY.fr + " Aucun coût supplémentaire quel que soit le nombre de réservations ; les e-mails partent dans la limite de Google (100 par jour avec un compte Gmail personnel).",
      freeEnough: [
        {
          who: "S’il suffit de prendre des rendez-vous sur l’agenda Google d’une seule personne",
          alt: {
            name: "Agendas de réservation de Google Agenda",
            href: "https://support.google.com/calendar/answer/10729749?hl=ja",
            note: "Un compte Google personnel suffit pour en créer. Certaines fonctions demandent un abonnement payant Google Workspace ou Google One.",
          },
        },
        {
          who: "Si vos réservations restent sous 50 par mois",
          alt: {
            name: "STORES, service de réservation (offre gratuite)",
            href: STORES_PRICING,
            note: "L’offre gratuite accepte jusqu’à 50 réservations par mois.",
            checkedOn: STORES_CHECKED_ON,
          },
        },
      ],
      fits: [
        {
          who: "Vous voulez dépasser 50 réservations par mois sans payer d’abonnement à un service de réservation. Ce kit coûte la même chose quel que soit le nombre de réservations",
          alts: [
            {
              name: "Tarifs du service de réservation STORES",
              href: STORES_PRICING,
              note: "L’offre gratuite est limitée à 50 réservations par mois.",
              checkedOn: STORES_CHECKED_ON,
            },
          ],
        },
        { who: "Vous voulez des créneaux ouverts à 2 personnes ou plus en même temps, ou un choix de prestations de durées différentes" },
        {
          who: "Vous voulez l’e-mail de confirmation, le rappel de la veille et l’annulation en libre-service, sans abonnement. Dans Google Agenda, les rappels par e-mail sont payants",
          alts: [
            {
              name: "À propos des agendas de réservation de Google Agenda",
              href: "https://support.google.com/calendar/answer/190998?hl=ja",
              note: "Un abonnement payant donne accès aux rappels par e-mail et aux réservations payantes, entre autres.",
            },
          ],
        },
        { who: "Vous voulez garder chaque réservation sur une ligne de tableur, avec une alerte sur Slack, Discord ou LINE" },
      ],
    },
    "saas-starter": {
      slug: "saas-starter",
      linkKey: "saas-starter",
      name: "Kit de démarrage SaaS",
      checkedOn: "2026-10-15",
      box: [
        "app/ (écrans) et src/ (core, ports, adapters, server)",
        "supabase/ (SQL de migration, vérifications RLS, modèles d’e-mails d’authentification)",
        "legal/ (modèles de mentions légales japonaises, conditions d’utilisation et politique de confidentialité : 6 fichiers en japonais et en anglais)",
        "messages/ (textes japonais et anglais) ainsi que scripts/ et test/ (tests sans Docker ni clés)",
        "README en japonais et en anglais",
        LICENSE_WEB.fr,
      ],
      setup:
        "Trois commandes (npm ci, cp .env.example .env.local, npm run dev) lancent un mode démo qui ne contacte ni Supabase ni Stripe, et vous faites le tour de tous les écrans en 15 minutes. En production, il se connecte à vos propres comptes Supabase et Stripe. Une fois lancé commercialement, comptez environ 45 $ par mois à partir de Vercel Pro et Supabase Pro (d’après les tarifs de septembre 2026).",
      freeEnough: [
        {
          who: "Si des écrans en anglais et deux rôles (propriétaire et membre) vous suffisent",
          alt: {
            name: "Next.js SaaS Starter (GitHub)",
            href: "https://github.com/nextjs/saas-starter",
            note: "Gratuit sous licence MIT. Il comprend la connexion par e-mail et mot de passe, la facturation Stripe, les rôles Owner et Member et Postgres (Drizzle).",
          },
        },
      ],
      fits: [
        { who: "Vous voulez les mentions légales japonaises et la facturation mensuelle en yens prêtes à la japonaise dès le départ" },
        { who: "Vous voulez trois rôles (propriétaire, administrateur, membre) définis par une seule table qui pilote les écrans, le serveur et les règles de la base (RLS)" },
        { who: "Vous voulez les organisations, les invitations et trois modes de connexion (lien par e-mail, mot de passe, Google) prêts et testés dès le départ" },
      ],
    },
  },
};

const PRICE = {
  en: {
    price: (p: string) => `${p} (tax included), one-time purchase`,
    note: (until: string, next: string, list: string) =>
      `This is the launch price until ${until}; the regular price of ${list} applies from ${next}.`,
  },
  fr: {
    price: (p: string) => `${p} TTC, achat unique`,
    note: (until: string, next: string, list: string) =>
      `Prix de lancement jusqu’au ${until} ; le prix normal de ${list} s’applique à partir du ${next}.`,
  },
};

/** 見本ページ 1 本の結びをその言語で。日本語は kitDemo のまま。値段は要求の時刻で決まる */
export function localKitDemo(lang: Lang, slug: KitDemoSlug, now: Date = new Date()): KitDemo {
  if (lang === "ja") return kitDemo(slug, now);
  const list = projects.find((p) => p.slug === slug)?.sale?.price;
  if (list == null) throw new Error(`定価が無い: ${slug}`);
  const current = priceNow(slug, list, now);
  const t = PRICE[lang];
  const price = t.price(money(lang, current.price));
  const priceNote = current.intro
    ? t.note(
        dateLabel(lang, current.intro.until),
        dateLabel(lang, nextDate(current.intro.until)),
        money(lang, current.intro.list),
      )
    : undefined;
  return { ...KIT_DEMOS_I18N[lang][slug], price, ...(priceNote ? { priceNote } : {}) };
}
