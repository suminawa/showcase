import type { PriceNow } from "@/lib/prices";
import { listOf, longDate, money } from "@/i18n/ui";

const ja = {
  meta: {
    title: "SaaS スターター キット",
    description: "ログイン・組織・役割ごとの権限・プロジェクト・定期課金・法務のひな形まで入った、会員制サービスの土台。Next.js と Supabase と Stripe で始めるキットの見本。",
  },
  title: "SaaS スターター キット",
  lede: "会員制サービスに要るもの（ログイン・組織・権限・課金・法務）を、一式でお渡しします",
  intro: "この見本は、架空の会社「しおさい設計室」のデータを、ブラウザの中だけで動かしています。額の上で見本の方を切り替えると、その役割のままで画面が変わります。English を押すと、英語の画面に切り替わります。",
  try: "見本の方は 3 名です。プロジェクトを足す・直す・消す、組織のお名前を変える、ご一緒に使う方の役割を変える、ご招待のリンクを発行する、プランを選んで偽のお支払いを終える、までをひととおりお試しいただけます。メンバーでお入りになると、ほかの方がお作りになったプロジェクトは消せず、ご招待の欄そのものが出ません。",
  table: "どなたに何ができるかは、キットの中にある 1 枚の表だけで決まります。画面もサーバーの処理も同じ表を読んでいるので、押せてしまったのに断られる、という食い違いが起きません。この見本で動いているのは、その表と処理そのもので、見本のために書き直したものではありません。",
  billing: "プロジェクトは無料のプランで 3 件までです。上限に当たると案内に変わり、プランをお選びいただくと偽のお支払いの画面へ進みます。お支払いを終えると、本物と同じ道（決済の通知）を通ってご契約が入り、上限が 50 件に変わります。",
  offline: "本物では、ここに Supabase と Stripe がつながります。この見本はブラウザの中だけで動くので、通信は 1 本も行いません。お選びいただいた内容はどこにも送らず、読み込み直すと、はじめの見本に戻ります。ご登録の画面、ご招待をお受けになる流れ、運営の画面は、見本には入れておりません。",
  contents: "キットは Next.js（App Router）と TypeScript で、ログイン、組織とご招待、役割ごとの権限、プロジェクトの管理、Stripe の定期課金、法務の 3 種（日本語と英語で 6 枚）のひな形、日本語と英語の切り替えが入っています。画面とサーバーの処理は 4 つの口だけを見る作りなので、つなぎ先を入れ替えても、画面はそのままお使いいただけます。",
  kit: (p: PriceNow) =>
    `この見本は「SaaS スターター キット」（定価 ${money("ja", listOf(p))} の買い切り${p.intro ? `。${longDate("ja", p.intro.until)}までは発売記念 ${money("ja", p.price)}` : ""}）の実物です`,
};

export const copy: Record<"ja" | "en" | "fr", typeof ja> = {
  ja,
  en: {
    meta: {
      title: "SaaS Starter Kit",
      description: "The foundation of a membership service, with login, organizations, role-based permissions, projects, subscription billing, and legal templates. Demo of a starter kit built on Next.js, Supabase, and Stripe.",
    },
    title: "SaaS Starter Kit",
    lede: "Everything a membership service needs (login, organizations, permissions, billing, legal) in one package",
    intro: "This demo runs data for a fictional design studio, entirely in your browser. Switch the sample user above the frame and the screens change to match that role. It opens in English here; press 日本語 to switch to Japanese.",
    try: "There are three sample users. You can add, edit, and delete projects, rename the organization, change teammates’ roles, create an invitation link, and pick a plan and complete a fake payment. Signed in as a member, you can’t delete projects others created, and the invitation section doesn’t appear at all.",
    table: "Who can do what is decided by a single table in the kit. The screens and the server logic read the same table, so you never get a button that works only to be refused. This demo runs that table and logic as they are, not a rewrite for the demo.",
    billing: "The free plan allows up to 3 projects. At the limit you see an upgrade prompt, and choosing a plan takes you to a fake checkout. Once paid, the subscription comes in through the same path as the real thing (the payment webhook), and the limit rises to 50.",
    offline: "In production, Supabase and Stripe connect here. This demo runs only in your browser and makes no network requests at all. Nothing you choose is sent anywhere, and reloading resets the demo. The sign-up screen, the invitation acceptance flow, and the admin screens are not part of the demo.",
    contents: "The kit is built with Next.js (App Router) and TypeScript and includes login, organizations and invitations, role-based permissions, project management, Stripe subscription billing, three legal templates (six documents in Japanese and English), and a Japanese/English switch. The screens and server logic go through just four interfaces, so you can swap the services behind them and keep the screens as they are.",
    kit: (p: PriceNow) =>
      `This demo is the actual SaaS Starter Kit (regular price ${money("en", listOf(p))}, one-time purchase${p.intro ? `; launch price ${money("en", p.price)} until ${longDate("en", p.intro.until)}` : ""})`,
  },
  fr: {
    meta: {
      title: "Kit de démarrage SaaS",
      description: "La base d’un service avec comptes membres : connexion, organisations, droits par rôle, projets, abonnements et modèles juridiques. Démo d’un kit de démarrage sur Next.js, Supabase et Stripe.",
    },
    title: "Kit de démarrage SaaS",
    lede: "Tout ce qu’il faut à un service avec comptes membres (connexion, organisations, droits, facturation, mentions légales), en un seul kit",
    intro: "Cette démo fait tourner, uniquement dans votre navigateur, les données d’un bureau d’études fictif. Changez d’utilisateur au-dessus du cadre : les écrans s’adaptent à son rôle. Elle s’ouvre ici en anglais (il n’y a pas de version française) ; 日本語 passe en japonais.",
    try: "Trois utilisateurs d’exemple. Vous pouvez ajouter, modifier et supprimer des projets, renommer l’organisation, changer le rôle des collègues, créer un lien d’invitation, puis choisir une formule et terminer un faux paiement. Connecté en tant que membre, vous ne pouvez pas supprimer les projets créés par d’autres, et la section des invitations n’apparaît pas.",
    table: "Qui peut faire quoi est défini par un seul tableau dans le kit. Les écrans et le traitement serveur lisent le même tableau : pas de bouton cliquable suivi d’un refus. La démo exécute ce tableau et ce traitement tels quels, sans réécriture pour l’occasion.",
    billing: "La formule gratuite permet jusqu’à 3 projets. À la limite, une invitation à changer de formule s’affiche ; en choisir une mène à un faux paiement. Une fois le paiement fait, l’abonnement arrive par le même chemin qu’en production (la notification de paiement) et la limite passe à 50.",
    offline: "En production, Supabase et Stripe se branchent ici. Cette démo tourne uniquement dans votre navigateur et n’effectue aucune requête réseau. Rien de ce que vous choisissez n’est envoyé, et un rechargement remet la démo à zéro. L’écran d’inscription, l’acceptation d’une invitation et les écrans d’administration ne font pas partie de la démo.",
    contents: "Le kit est construit avec Next.js (App Router) et TypeScript et comprend : connexion, organisations et invitations, droits par rôle, gestion de projets, abonnements Stripe, trois modèles juridiques (six documents en japonais et en anglais) et un sélecteur japonais/anglais. Écrans et traitement serveur ne passent que par quatre interfaces : vous pouvez changer les services branchés derrière sans toucher aux écrans.",
    kit: (p: PriceNow) =>
      `Cette démo est le véritable Kit de démarrage SaaS (prix normal ${money("fr", listOf(p))}, achat unique${p.intro ? ` ; prix de lancement ${money("fr", p.price)} jusqu’au ${longDate("fr", p.intro.until)}` : ""})`,
  },
};
