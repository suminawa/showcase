import type { KitSales } from "../kit-parts";

const SOURCES = {
  nextjsStarter: "https://github.com/nextjs/saas-starter",
  withSupabase: "https://github.com/vercel/next.js/tree/canary/examples/with-supabase",
  makerkit: "https://makerkit.dev/pricing",
};

/** 比べる相手のページを読んだ日 */
const CHECKED_ON = "2026-10-20";

const jaSales: KitSales = {
  proof: [
    { figure: "681 件", label: "自動テストの数です。Docker も API キーも要らず、npm test で全部通ります（1.1.0）。" },
    { figure: "15 分", label: "API キーなしの見本モードで、ログインから課金まで全部の画面を一周する目安です。" },
    { figure: "8 テーブル", label: "データベースのテーブルの数です。すべてに RLS（行単位の権限）を付け、その検査も同梱しています。" },
    { figure: "7 つ", label: "依存パッケージの数です（next・react・react-dom・Supabase の 2 つ・stripe・resend）。" },
  ],
  audience: {
    fits: [
      "会員制サイト・SaaS の MVP を受託する制作会社・フリーランスの方。この上に作ったサービスを納品できます（複数人で使うときは制作会社用のライセンスを）",
      "日本向けに、日本語の画面・税込の円の月額・特定商取引法に基づく表記で、個人開発のサービスを出したい方",
      "オーナー・管理者・メンバーの 3 つの役割を、画面・Server Actions・RLS で同じ 1 か所の定義から決めたい方",
      "Next.js（App Router）と TypeScript を読み書きでき、Supabase と Stripe のアカウントを作れる方",
    ],
    notFor: [
      "プログラムを書かずに会員制サイトを作りたい方（コードを直して使うキットです）",
      "英語の画面で足り、役割も 2 つで足りる方（下の比較の無料の Next.js SaaS Starter をおすすめします）",
      "Stripe 以外の決済（銀行振込・コンビニ払い）や従量課金が、最初から要る方（入っていません）",
      "メールアドレスを変える画面や、E2E の検査と CI の設定が、最初から要る方（次の版で入れます。パスワードの再設定・退会・監査ログ・インボイスの登録番号の欄は 1.1 で入りました）",
    ],
  },
  compare: {
    rows: [
      {
        kind: "無料の道具",
        name: "Next.js SaaS Starter（GitHub）",
        href: SOURCES.nextjsStarter,
        cost: "0 円（MIT ライセンス）",
        note: "メールとパスワードのログイン、Stripe の課金、Owner と Member の 2 つの役割、Postgres（Drizzle）が入っています。画面は英語です。",
      },
      {
        kind: "公式のひな形",
        name: "Next.js の with-supabase（GitHub）",
        href: SOURCES.withSupabase,
        cost: "0 円",
        note: "Next.js と Supabase のログイン（パスワード）までが入ったひな形です。組織・役割・課金は、ご自身で作ります。",
      },
      {
        kind: "似たサービス",
        name: "Makerkit",
        href: SOURCES.makerkit,
        cost: "$349 から（買い切り。チーム向けは $649）",
        note: "認証・Stripe の課金・チームの管理が入った、英語で書かれた有料のキットです。",
      },
    ],
    kit: "日本語と英語の画面、税込の円の月額、特定商取引法の表記・利用規約・プライバシーポリシーのひな形（日英 6 枚）、3 つの役割と RLS、ご招待、Stripe の月額課金とお支払いの管理の画面が入っています。",
    checkedOn: CHECKED_ON,
  },
  steps: [
    {
      heading: "見本モードで立ち上げるまで",
      intro: "API キーが無くても、Supabase にも Stripe にも通信しない見本モードで全部の画面を触れます。Node.js は 20.9 以上をお使いください。",
      items: [
        "zip を展開したフォルダで npm ci を実行します（npm install ではなく、同梱の package-lock.json のとおりに入れます）。",
        "cp .env.example .env.local で設定のファイルを作ります。STARTER_FAKE=1 のままで見本モードです。",
        "npm run dev を実行し、http://localhost:3020 を開きます。",
        "「ログイン」を押し、見本の方（オーナー・管理者・メンバー）から 1 人を選んで入ります。",
      ],
      after: "Node.js のバージョンは node -v で確かめられます。20.9 より古いときは、nvm などで新しい版を入れてください。",
    },
    {
      heading: "Stripe でプランを変えられない・通知が届かないとき",
      intro: "テストモードで一周するときに、つまずきやすいところです。",
      items: [
        "Stripe の「設定 → 請求 → カスタマーポータル」で、画面を有効にします。",
        "同じ画面で「プランの切り替え」を許可し、商品カタログで作った月額の価格（Price）を 2 つとも登録します。",
        "お手元では stripe listen を実行し、決済のたびに --> と <-- [200] の行が並ぶことを確かめます。並ばないときは --forward-to の付け忘れです。",
        "stripe trigger でテーブルが変わらないのは正しい動きです（毎回、新しいお客さまを作るためです）。",
      ],
      after: "確認メールのリンクを開くとログインの画面に戻る（error=wrong_browser）ときは、登録したときと同じブラウザでリンクを開き直してください。",
    },
  ],
};

const ja = {
  meta: {
    title: "日本向け SaaS の土台｜Next.js + Supabase + Stripe（SaaS スターター キット）",
    description: "ログイン・組織とご招待・3 つの役割の権限・Stripe の月額課金・特定商取引法の表記のひな形まで、買ったその日に動く日本向けの SaaS の土台です。Next.js + Supabase + Stripe。API キーなしの見本をその場で触れます。",
  },
  name: "SaaS スターター キット",
  title: "ログインから月額課金まで動く、日本向け SaaS の土台",
  lede: "組織とご招待・3 つの役割の権限・Stripe の月額課金・特定商取引法の表記のひな形まで、買ったその日に動く Next.js + Supabase + Stripe のキットです。土台づくりの 1 か月を、作りたい中身に回せます。",
  try: "上の見本は、架空の会社「しおさい設計室」のデータを、ブラウザの中だけで動かしています。いまはログインの画面です。見本の方は 3 名で、枠の上の「見本の方」のメニューでも切り替えられます。プロジェクトを足す・直す・消す、組織の名前を変える、メンバーの役割を変える、招待のリンクを発行する、プランを選んで見本のお支払いを終える、までをひととおりお試しいただけます。メンバーで入ると、ほかの方が作ったプロジェクトは消せず、招待の欄そのものが出ません。",
  table: "誰に何ができるかは、キットの中の 1 か所の定義（src/core/permissions.ts）だけで決まります。画面も Server Actions も RLS も同じ定義から決まるので、押せてしまったのに断られる、という食い違いが起きません。この見本で動いているのは、その定義と処理そのもので、見本のために書き直したものではありません。",
  billing: "プロジェクトは無料のプランで 3 件までです。上限に当たると案内に変わり、プランを選ぶと見本のお支払いの画面へ進みます。お支払いを終えると、本物と同じ道（Stripe の Webhook）を通ってご契約が入り、上限が 50 件に変わります。",
  offline: "本物では、ここに Supabase と Stripe がつながります。この見本はブラウザの中だけで動くので、通信は 1 本も行いません。選んだ内容はどこにも送らず、読み込み直すと、はじめの見本に戻ります。登録の画面、招待を受ける流れ、運営の画面は、見本には入れていません。",
  contents: "画面とサーバーの処理は、src/ports の 4 つのポート（認証・データ・課金・メール）だけを見る作りです。つなぎ先（adapters）を入れ替えても、画面はそのままお使いいただけます。",
  made: "上の見本は、キットの src/core と src/server/flows を、ブラウザの中でそのまま動かしています。Supabase と Stripe の代わりに、キットに入っている見本モードのつなぎ先（adapters/fake）を使っています。",
  sales: jaSales,
};

export const copy: Record<"ja" | "en" | "fr", typeof ja> = {
  ja,
  en: {
    meta: {
      title: "A SaaS foundation for Japan | Login, organizations, roles, and monthly billing on Next.js + Supabase + Stripe (SaaS Starter Kit)",
      description: "A SaaS foundation for the Japanese market that works on day one: login, organizations and invitations, three-role permissions, Stripe monthly billing, and templates for the legally required Japanese seller notice. Next.js + Supabase + Stripe. Try the key-free demo right here.",
    },
    name: "SaaS Starter Kit",
    title: "A SaaS foundation for Japan, working from login to billing",
    lede: "Organizations and invitations, three-role permissions, Stripe monthly billing, and a template for the Japanese seller notice, all working on day one in a Next.js + Supabase + Stripe kit. Spend the month you’d lose on the foundation on your product instead.",
    try: "The demo above runs data for a fictional design studio, entirely in your browser. It opens on the login screen. There are three sample users, and you can also switch them from the sample user menu above the frame. You can add, edit, and delete projects, rename the organization, change members’ roles, create an invitation link, and choose a plan and complete a sample checkout. Signed in as a member, you can’t delete projects others created, and the invitation section doesn’t appear at all.",
    table: "Who can do what is decided in a single place in the kit (src/core/permissions.ts). The screens, the Server Actions, and RLS all follow that same definition, so you never see a button that looks usable only to be refused. This demo runs that definition and logic as they are, not a rewrite for the demo.",
    billing: "The free plan allows up to 3 projects. At the limit you see an upgrade prompt, and choosing a plan takes you to a sample checkout. Once paid, the subscription comes in through the same path as the real thing (the Stripe webhook), and the limit rises to 50.",
    offline: "In production, Supabase and Stripe connect here. This demo runs only in your browser and makes no network requests at all. Nothing you choose is sent anywhere, and reloading resets the demo. The sign-up screen, the invitation acceptance flow, and the admin screens are not part of the demo.",
    contents: "The screens and server logic go through only the four ports in src/ports (auth, data, billing, mail). You can swap the adapters behind them and keep the screens as they are.",
    made: "The demo above runs the kit’s src/core and src/server/flows in your browser as they are, using the kit’s demo-mode adapters (adapters/fake) in place of Supabase and Stripe.",
    sales: {
      proof: [
        { figure: "681", label: "Automated tests. No Docker and no API keys needed; npm test runs them all (1.1.0)." },
        { figure: "15 min", label: "To go through every screen, from login to billing, in the key-free demo mode." },
        { figure: "8 tables", label: "In the database, all with RLS (row-level security), and the RLS tests are included." },
        { figure: "7", label: "Dependencies (next, react, react-dom, two Supabase packages, stripe, resend)." },
      ],
      audience: {
        fits: [
          "Are an agency or freelancer building membership sites or SaaS MVPs for clients: you may deliver services built on it (choose the agency license when a team uses it)",
          "Want to launch an indie service for Japan with Japanese screens, tax-inclusive monthly prices in yen, and the Japanese seller notice",
          "Want owner, admin, and member roles decided from one definition that drives the screens, the Server Actions, and RLS",
          "Can read and write Next.js (App Router) and TypeScript, and can create Supabase and Stripe accounts",
        ],
        notFor: [
          "Want to build a membership site without writing code (this kit is code you modify)",
          "Are fine with English screens and two roles (we recommend the free Next.js SaaS Starter compared below)",
          "Need payments other than Stripe (bank transfer, convenience store) or usage-based billing from the start (not included)",
          "Need an email-change screen or end-to-end tests and CI set up from the start (planned for the next version; password reset, account deletion, audit logs and the invoice registration number field arrived in 1.1)",
        ],
      },
      compare: {
        rows: [
          {
            kind: "Free tool",
            name: "Next.js SaaS Starter (GitHub)",
            href: SOURCES.nextjsStarter,
            cost: "¥0 (MIT license)",
            note: "Includes email and password login, Stripe billing, Owner and Member roles, and Postgres (Drizzle). English screens.",
          },
          {
            kind: "Official template",
            name: "Next.js with-supabase example (GitHub)",
            href: SOURCES.withSupabase,
            cost: "¥0",
            note: "A template with Next.js and Supabase login (password). Organizations, roles, and billing are up to you.",
          },
          {
            kind: "Similar service",
            name: "Makerkit",
            href: SOURCES.makerkit,
            cost: "From $349 (one-time; $649 for teams)",
            note: "A paid kit written in English with authentication, Stripe billing, and team management.",
          },
        ],
        kit: "Japanese and English screens, tax-inclusive monthly prices in yen, templates for the Japanese seller notice, terms, and privacy policy (6 documents in Japanese and English), three roles with RLS, invitations, and Stripe monthly billing with the billing portal.",
        checkedOn: CHECKED_ON,
      },
      steps: [
        {
          heading: "Starting the demo mode",
          intro: "Without any API keys, you can use every screen in a demo mode that talks to neither Supabase nor Stripe. Use Node.js 20.9 or later.",
          items: [
            "In the unzipped folder, run npm ci (not npm install, so the bundled package-lock.json is followed).",
            "Create the settings file with cp .env.example .env.local. With STARTER_FAKE=1 left as is, it runs in demo mode.",
            "Run npm run dev and open http://localhost:3020.",
            "Press Log in and choose one of the sample users (owner, admin, member).",
          ],
          after: "Check your Node.js version with node -v. If it’s older than 20.9, install a newer one with nvm or a similar tool.",
        },
        {
          heading: "When plans can’t be changed in Stripe or webhooks don’t arrive",
          intro: "The usual sticking points when going through it in test mode.",
          items: [
            "In Stripe, go to Settings → Billing → Customer portal and activate it.",
            "On the same screen, allow switching plans and add both monthly prices (Prices) you created in the product catalog.",
            "Locally, run stripe listen and check that a --> and <-- [200] line appears for each payment. If not, --forward-to is missing.",
            "Tables not changing after stripe trigger is expected (it creates a new customer every time).",
          ],
          after: "If opening the confirmation email link sends you back to the login screen (error=wrong_browser), open the link in the same browser you signed up with.",
        },
      ],
    },
  },
  fr: {
    meta: {
      title: "Base SaaS pour le Japon | Connexion, organisations, rôles et abonnements sur Next.js + Supabase + Stripe (Kit de démarrage SaaS)",
      description: "Une base SaaS pour le marché japonais, opérationnelle dès le premier jour : connexion, organisations et invitations, droits à trois rôles, abonnements Stripe et modèles de mentions légales japonaises. Next.js + Supabase + Stripe. Essayez la démo sans clé sur cette page.",
    },
    name: "Kit de démarrage SaaS",
    title: "Une base SaaS pour le Japon, de la connexion à l’abonnement",
    lede: "Organisations et invitations, droits à trois rôles, abonnements Stripe et modèle de mentions légales japonaises, opérationnels dès le premier jour dans un kit Next.js + Supabase + Stripe. Le mois passé sur les fondations va à votre produit.",
    try: "La démo ci-dessus fait tourner, uniquement dans votre navigateur, les données d’un bureau d’études fictif. Elle s’ouvre sur l’écran de connexion. Trois utilisateurs d’exemple, que vous pouvez aussi changer avec le menu au-dessus du cadre. Vous pouvez ajouter, modifier et supprimer des projets, renommer l’organisation, changer le rôle des membres, créer un lien d’invitation, puis choisir une formule et finir un paiement d’exemple. Connecté en tant que membre, vous ne pouvez pas supprimer les projets créés par d’autres, et la section des invitations n’apparaît pas.",
    table: "Qui peut faire quoi est défini à un seul endroit du kit (src/core/permissions.ts). Les écrans, les Server Actions et le RLS suivent cette même définition : pas de bouton cliquable suivi d’un refus. La démo exécute cette définition et ce traitement tels quels, sans réécriture pour l’occasion.",
    billing: "La formule gratuite permet jusqu’à 3 projets. À la limite, une invitation à changer de formule s’affiche ; en choisir une mène à un paiement d’exemple. Une fois le paiement effectué, l’abonnement arrive par le même chemin qu’en production (le webhook Stripe) et la limite passe à 50.",
    offline: "En production, Supabase et Stripe se branchent ici. Cette démo tourne uniquement dans votre navigateur et n’effectue aucune requête réseau. Rien de ce que vous choisissez n’est envoyé, et un rechargement remet la démo à zéro. L’écran d’inscription, l’acceptation d’une invitation et les écrans d’administration ne font pas partie de la démo.",
    contents: "Écrans et traitement serveur ne passent que par les quatre ports de src/ports (authentification, données, facturation, e-mail). Vous pouvez changer les adaptateurs derrière sans toucher aux écrans.",
    made: "La démo ci-dessus exécute dans votre navigateur src/core et src/server/flows du kit tels quels, avec les adaptateurs du mode démo du kit (adapters/fake) à la place de Supabase et Stripe.",
    sales: {
      proof: [
        { figure: "681", label: "Tests automatisés. Sans Docker ni clé d’API ; npm test les lance tous (1.1.0)." },
        { figure: "15 min", label: "Pour parcourir tous les écrans, de la connexion à la facturation, en mode démo sans clé." },
        { figure: "8 tables", label: "Dans la base, toutes avec RLS (droits par ligne), tests du RLS inclus." },
        { figure: "7", label: "Dépendances (next, react, react-dom, deux paquets Supabase, stripe, resend)." },
      ],
      audience: {
        fits: [
          "Êtes une agence ou un indépendant qui réalise des sites à abonnement ou des MVP SaaS : vous pouvez livrer les services construits dessus (licence agence si une équipe l’utilise)",
          "Voulez lancer un service pour le Japon avec écrans en japonais, prix mensuels TTC en yens et mentions légales japonaises",
          "Voulez des rôles propriétaire, administrateur et membre définis à un seul endroit, suivi par les écrans, les Server Actions et le RLS",
          "Lisez et écrivez Next.js (App Router) et TypeScript, et savez créer des comptes Supabase et Stripe",
        ],
        notFor: [
          "Voulez un site à abonnement sans écrire de code (ce kit est du code à modifier)",
          "Vous contentez d’écrans en anglais et de deux rôles (nous recommandons le Next.js SaaS Starter gratuit comparé ci-dessous)",
          "Avez besoin dès le départ d’autres paiements que Stripe (virement, paiement en supérette) ou de facturation à l’usage (non inclus)",
          "Avez besoin dès le départ d’un écran de changement d’adresse e-mail, ou de tests de bout en bout et d’une CI (prévus pour la prochaine version ; réinitialisation du mot de passe, suppression du compte, journal d’audit et numéro de facture qualifiée sont arrivés en 1.1)",
        ],
      },
      compare: {
        rows: [
          {
            kind: "Outil gratuit",
            name: "Next.js SaaS Starter (GitHub)",
            href: SOURCES.nextjsStarter,
            cost: "0 ¥ (licence MIT)",
            note: "Connexion par e-mail et mot de passe, facturation Stripe, rôles Owner et Member, Postgres (Drizzle). Écrans en anglais.",
          },
          {
            kind: "Modèle officiel",
            name: "Exemple with-supabase de Next.js (GitHub)",
            href: SOURCES.withSupabase,
            cost: "0 ¥",
            note: "Un modèle avec Next.js et la connexion Supabase (mot de passe). Organisations, rôles et facturation sont à construire vous-même.",
          },
          {
            kind: "Service similaire",
            name: "Makerkit",
            href: SOURCES.makerkit,
            cost: "À partir de 349 $ (achat unique ; 649 $ pour les équipes)",
            note: "Un kit payant rédigé en anglais, avec authentification, facturation Stripe et gestion d’équipe.",
          },
        ],
        kit: "Écrans en japonais et en anglais, prix mensuels TTC en yens, modèles de mentions légales, CGU et politique de confidentialité (6 documents en japonais et en anglais), trois rôles avec RLS, invitations, abonnements Stripe avec portail de facturation.",
        checkedOn: CHECKED_ON,
      },
      steps: [
        {
          heading: "Lancer le mode démo",
          intro: "Sans aucune clé d’API, tous les écrans fonctionnent dans un mode démo qui ne contacte ni Supabase ni Stripe. Utilisez Node.js 20.9 ou plus récent.",
          items: [
            "Dans le dossier décompressé, lancez npm ci (et non npm install, pour suivre le package-lock.json fourni).",
            "Créez le fichier de réglages avec cp .env.example .env.local. Avec STARTER_FAKE=1 tel quel, c’est le mode démo.",
            "Lancez npm run dev et ouvrez http://localhost:3020.",
            "Cliquez sur Connexion et choisissez un des utilisateurs d’exemple (propriétaire, administrateur, membre).",
          ],
          after: "Vérifiez votre version de Node.js avec node -v. Si elle est antérieure à 20.9, installez-en une plus récente avec nvm ou un outil similaire.",
        },
        {
          heading: "Quand on ne peut pas changer de formule dans Stripe ou que les webhooks n’arrivent pas",
          intro: "Les points de blocage habituels en mode test.",
          items: [
            "Dans Stripe, ouvrez Paramètres → Facturation → Portail client et activez-le.",
            "Sur le même écran, autorisez le changement de formule et ajoutez les deux prix mensuels (Prices) créés dans le catalogue.",
            "En local, lancez stripe listen et vérifiez qu’une ligne --> et <-- [200] apparaît à chaque paiement. Sinon, --forward-to manque.",
            "Que les tables ne changent pas après stripe trigger est normal (il crée un nouveau client à chaque fois).",
          ],
          after: "Si le lien de l’e-mail de confirmation vous renvoie à l’écran de connexion (error=wrong_browser), ouvrez-le dans le navigateur utilisé pour l’inscription.",
        },
      ],
    },
  },
};
