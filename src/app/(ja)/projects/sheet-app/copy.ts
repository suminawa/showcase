import type { KitSales } from "../kit-parts";
import { STEP_IMAGES } from "../step-images";

const SOURCES = {
  googleForms: "https://support.google.com/docs/answer/2917686?hl=ja",
  appsheet: "https://about.appsheet.com/pricing/",
  kintone: "https://kintone.cybozu.co.jp/price/",
};

/** 比べる相手のページを読んだ日 */
const CHECKED_ON = "2026-10-20";

const jaSales: KitSales = {
  proof: [
    { figure: "234 件", label: "自動テストの数です。版を出すたびに、すべて通してからお届けしています（1.1.4）。" },
    { figure: "0 円", label: "月額の費用です。使う人が何人でも変わりません（AI を使うときだけ、Anthropic の利用料がかかります）。" },
    { figure: "5 回", label: "発売からの更新の回数です（1.1〜1.1.4）。お求めの方には、どれも無料でお届けしています。" },
    { figure: "14 日", label: "ご購入から、不具合のご連絡にメールでお応えする期間です（3 営業日以内に返信します）。" },
  ],
  audience: {
    fits: [
      "顧客・案件・在庫の台帳を、すでに Google スプレッドシートで管理している会社の方",
      "現場の方にスマートフォンで台帳を見ていただき、必要な方だけに登録や編集をお願いしたい方（閲覧だけの方の画面には、編集のボタンが出ません）",
      "使う人が 10 人を超えても、1 人ごとの月額をかけたくない方",
      "お客さまの台帳に組み込んで納品したい制作会社・フリーランスの方（改変して納品できます）。ご自身で置くのが不安な方は、設置までお任せいただけます",
    ],
    notFor: [
      "画面から編集する方に、シートそのものは触らせたくない方（画面で編集できるのはスプレッドシートの編集者です。編集者はシートや Apps Script も開けます）",
      "Google アカウントを持たない方にも使っていただきたい方（開けるのは、Google アカウントでログインし、スプレッドシートを共有された方だけです）",
      "1 つの表が数千行を超える方（1 つの表で 5,000 行ほどが目安です）",
      "お客さまへの LINE 送信を、手軽に始めたい方（友だちの受け取りに Cloudflare と Node.js の設定が要ります。社内の LINE・Slack への通知だけなら要りません）",
    ],
  },
  compare: {
    rows: [
      {
        kind: "標準の機能",
        name: "Google フォーム（回答をスプレッドシートに保存）",
        href: SOURCES.googleForms,
        cost: "0 円",
        note: "スマートフォンから台帳に登録できます。登録した記録を探す画面や、直す画面はありません。",
      },
      {
        kind: "無料の道具",
        name: "AppSheet（Google）",
        href: SOURCES.appsheet,
        cost: "作成と 10 人までの試用は無料。本番は 1 人あたり月 $5（Starter）から",
        note: "スプレッドシートからアプリを作れる Google のサービスです。試作や少人数の試用なら、これで十分です。",
      },
      {
        kind: "似たサービス",
        name: "kintone",
        href: SOURCES.kintone,
        cost: "ライトコースで 1 人あたり月 1,000 円（税抜）、10 人から",
        note: "業務アプリを作れるサービスです。台帳はスプレッドシートから kintone へ移して使います。",
      },
    ],
    kit: "いまのスプレッドシートを台帳のまま、一覧・検索・登録・編集・CSV の画面をスマートフォンでも使えます。登録や更新を LINE・Slack・Discord に知らせられます。使う人が何人でも月額は 0 円です。",
    checkedOn: CHECKED_ON,
  },
  steps: [
    {
      heading: "「このアプリは Google で確認されていません」と出たとき",
      image: STEP_IMAGES.gasAuth,
      intro: "初めてメニューの「見本を読み込む」や「初期化」を押すと、Google の確認画面が出ます。ご自身のスプレッドシートに貼ったスクリプトなので、出るのが正常です。",
      items: [
        "「承認が必要です」の画面で「権限を確認」を押し、ご自身の Google アカウントを選びます。",
        "「このアプリは Google で確認されていません」と出たら、画面の左下の「詳細」を押します。",
        "下に出る「（プロジェクト名）（安全ではないページ）に移動」を押します。",
        "許可の一覧を確かめて「許可」を押します。承認が済んだら、もう一度メニューの「初期化」を押してください。",
      ],
      after: "画面を使うスタッフの方にも、初めて URL を開いたときに同じ画面が出ることがあります。配るときにお伝えください。一度許可すると、以後は URL を開くだけで使えます。",
    },
    {
      heading: "ウェブアプリとして公開するとき",
      intro: "このキットは、ログインした方がご自身の権限で使う設定です。予約ページやフォーム受付のキットとは、選ぶものが逆になります。",
      items: [
        "Apps Script に HTML のファイルを足すときは、名前を「App」にします。ファイルの一覧に「App.html」と出ていれば合っています。",
        "右上の「デプロイ」→「新しいデプロイ」と進み、種類で「ウェブアプリ」を選びます。",
        "「次のユーザーとして実行」は「ウェブアプリにアクセスしているユーザー」、「アクセスできるユーザー」は「Google アカウントを持つ全員」にして「デプロイ」を押します。",
        "スプレッドシートのメニュー「業務アプリ」→「Web アプリの URL」で URL を確かめ、まずご自身で見本の記録の登録・編集・検索を試します。",
      ],
      after: "URL を開いて「No HTML file named App was found」と出たときは、共有の設定ではなく、HTML のファイル名を「App」に直して保存し、デプロイを新しいバージョンで更新してください。",
    },
  ],
};

const ja = {
  meta: {
    title: "今の台帳を、スマホで検索・登録できる画面に｜月額 0 円（スプレッドシート業務アプリ キット）",
    description: "いまの Google スプレッドシートを作り直さずに、スマートフォンで一覧・検索・登録・編集ができる画面を付けるキットです。登録や更新を LINE・Slack・Discord に知らせられ、使う人が何人でも月額はかかりません。見本で顧客管理の画面を触れます。",
  },
  name: "スプレッドシート業務アプリ キット",
  title: "今の台帳を、スマホで検索・登録できる画面に",
  lede: "顧客の名前を探すたびに、横に長い表をスクロールしていませんか。いまの Google スプレッドシートを作り直さずに、スマートフォンで一覧・検索・登録・編集ができる画面を付けます。使う人が何人でも、月額はかかりません。",
  demo: "この見本は、キットに同梱の顧客管理のテンプレ（顧客 20 件・対応履歴 30 件）をブラウザの中で動かしています。登録や編集はページを閉じると消えます。実物は Google スプレッドシートを台帳にして、Apps Script の Web アプリとして公開します。",
  access: "権限はスプレッドシートの共有設定がそのまま効き、サーバーも月額の利用料も要りません。画面の列は「定義」シートに 1 列 1 行で書きます。AI（任意）を入れると、言葉での絞り込みと 1 件の要約ができます。",
  made: "定義シートからの画面生成・CSV・AI の絞り込みと要約・見本 3 種に加え、1.1 で登録・更新の LINE・Slack 通知と、記録からの LINE 送信が入っています（この見本でも「LINE で送る」を試せます）。",
  sales: jaSales,
};

export const copy: Record<"ja" | "en" | "fr", typeof ja> = {
  ja,
  en: {
    meta: {
      title: "Search and add to your existing ledger from a phone | LINE and Slack notifications, no per-user monthly fee (Spreadsheet Business App Kit)",
      description: "A kit that adds list, search, entry, and edit screens that work on phones to your existing Google Sheets ledger, without rebuilding it. New and updated records can be announced on LINE, Slack, or Discord, and there is no monthly fee however many people use it. Try the customer-management screens in the demo.",
    },
    name: "Spreadsheet Business App Kit",
    title: "Search and add to your existing ledger from a phone",
    lede: "Scrolling sideways through a wide sheet every time you look up a customer? Without rebuilding your Google Sheets, this adds list, search, entry, and edit screens that work on phones. No monthly fee, however many people use it.",
    demo: "This demo runs the kit’s bundled customer-management template (20 customers, 30 activity records) in your browser. Entries and edits disappear when you close the page. The real thing uses a Google spreadsheet as the ledger and is published as an Apps Script web app.",
    access: "Access follows the spreadsheet’s sharing settings, with no server and no monthly fees. Screen columns are listed one per row in the definition sheet. Add AI (optional) to filter in plain language and summarize a record.",
    made: "Screens generated from the definition sheet, CSV, AI filtering and summaries, and three sample templates, plus in 1.1: LINE and Slack notifications for new and updated records, and sending LINE messages from a record (you can try the LINE send button in this demo too).",
    sales: {
      proof: [
        { figure: "234", label: "Automated tests. Every release passes all of them before it ships (1.1.4)." },
        { figure: "¥0", label: "Monthly cost, however many people use it (only the optional AI incurs Anthropic usage fees)." },
        { figure: "5", label: "Updates since launch (1.1 to 1.1.4). Every one has been free for existing buyers." },
        { figure: "14 days", label: "After purchase, we answer bug reports by email (reply within 3 business days)." },
      ],
      audience: {
        fits: [
          "Already manage a customer, project, or inventory ledger in Google Sheets",
          "Want field staff to view the ledger on their phones, and only some people to add or edit (view-only users see no edit buttons)",
          "Have more than 10 users and don’t want a per-user monthly fee",
          "Are an agency or freelancer who wants to build it into a client’s ledger (modified versions may be delivered). If you’d rather not install it yourself, setup can be done for you",
        ],
        notFor: [
          "Want people who edit through the screens kept away from the sheet itself (anyone who can edit on screen is a spreadsheet editor and can also open the sheet and Apps Script)",
          "Need people without a Google account to use it (only people signed in to Google whom the spreadsheet is shared with can open it)",
          "Have a single table well beyond a few thousand rows (about 5,000 rows per table is the guideline)",
          "Want to start sending LINE messages to customers with little setup (receiving friends needs Cloudflare and Node.js; internal LINE and Slack notifications don’t)",
        ],
      },
      compare: {
        rows: [
          {
            kind: "Built-in feature",
            name: "Google Forms (responses saved to a spreadsheet)",
            href: SOURCES.googleForms,
            cost: "¥0",
            note: "Lets people add records from a phone. There are no screens to find or edit what was entered.",
          },
          {
            kind: "Free tool",
            name: "AppSheet (Google)",
            href: SOURCES.appsheet,
            cost: "Free to build and to test with up to 10 users; production from $5 per user per month (Starter)",
            note: "Google’s service for building apps from spreadsheets. For prototypes and small trials, it is enough.",
          },
          {
            kind: "Similar service",
            name: "kintone",
            href: SOURCES.kintone,
            cost: "Light course ¥1,000 per user per month (excl. tax), minimum 10 users",
            note: "A service for building business apps. Your ledger moves from the spreadsheet into kintone.",
          },
        ],
        kit: "Keeps your current spreadsheet as the ledger and adds list, search, entry, edit, and CSV screens that work on phones. New and updated records can be announced on LINE, Slack, or Discord. No monthly fee however many people use it.",
        checkedOn: CHECKED_ON,
      },
      steps: [
        {
          heading: "When you see “Google hasn’t verified this app”",
          intro: "The first time you run Load sample or Initialize from the menu, Google shows a confirmation screen. Because you pasted the script into your own spreadsheet, this is expected.",
          items: [
            "On the “Authorization required” screen, press “Review permissions” and choose your Google account.",
            "When “Google hasn’t verified this app” appears, press “Advanced” at the bottom left.",
            "Press “Go to (project name) (unsafe)”, which appears below.",
            "Review the permissions and press “Allow”. Once approved, run Initialize from the menu again.",
          ],
          after: "Staff who use the screens may see the same screen the first time they open the URL; let them know when you share it. After allowing once, they just open the URL.",
        },
        {
          heading: "When deploying as a web app",
          intro: "This kit runs with the signed-in person’s own permissions, so the choices are the opposite of the Booking Page and Form Intake kits.",
          items: [
            "When adding the HTML file in Apps Script, name it “App”. It is right if the file list shows “App.html”.",
            "Press Deploy → New deployment at the top right and choose “Web app” as the type.",
            "Set “Execute as” to “User accessing the web app” and “Who has access” to “Anyone with Google account”, then press Deploy.",
            "Check the URL from the spreadsheet menu (Business app → Web app URL), and first try adding, editing, and searching the sample records yourself.",
          ],
          after: "If opening the URL shows “No HTML file named App was found”, the cause is not sharing: rename the HTML file to “App”, save, and update the deployment with a new version.",
        },
      ],
    },
  },
  fr: {
    meta: {
      title: "Chercher et saisir dans votre registre actuel depuis un téléphone | Notifications LINE et Slack, sans abonnement par utilisateur (Kit d’application métier sur tableur)",
      description: "Un kit qui ajoute à votre registre Google Sheets actuel, sans le refaire, des écrans de liste, recherche, saisie et modification utilisables sur téléphone. Les ajouts et mises à jour peuvent être annoncés sur LINE, Slack ou Discord, sans abonnement quel que soit le nombre d’utilisateurs. Essayez les écrans de gestion clients dans la démo.",
    },
    name: "Kit d’application métier sur tableur",
    title: "Chercher et saisir dans votre registre actuel, depuis un téléphone",
    lede: "Vous faites défiler un tableau trop large chaque fois que vous cherchez un client ? Sans refaire votre Google Sheets, ce kit ajoute des écrans de liste, recherche, saisie et modification utilisables sur téléphone. Sans abonnement, quel que soit le nombre d’utilisateurs.",
    demo: "Cette démo fait tourner dans votre navigateur le modèle de gestion clients fourni avec le kit (20 clients, 30 actions de suivi). Les saisies et modifications disparaissent à la fermeture de la page. La version réelle utilise un tableur Google comme registre et se publie comme application web Apps Script.",
    access: "Les droits suivent les paramètres de partage du tableur, sans serveur ni abonnement. Les colonnes des écrans se décrivent une par ligne dans la feuille de définition. Avec l’IA (facultative), filtrez en langage naturel et résumez une fiche.",
    made: "Écrans générés depuis la feuille de définition, CSV, filtrage et résumés par IA, trois modèles d’exemple, et avec la 1.1 : notifications LINE et Slack à l’ajout et à la mise à jour, et envoi de messages LINE depuis une fiche (le bouton d’envoi LINE s’essaie aussi dans cette démo).",
    sales: {
      proof: [
        { figure: "234", label: "Tests automatisés. Chaque version les passe tous avant d’être livrée (1.1.4)." },
        { figure: "0 ¥", label: "Coût mensuel, quel que soit le nombre d’utilisateurs (seule l’IA facultative entraîne des frais d’usage Anthropic)." },
        { figure: "5", label: "Mises à jour depuis la sortie (1.1 à 1.1.4). Toutes gratuites pour les acheteurs." },
        { figure: "14 jours", label: "Après l’achat, nous répondons par e-mail aux signalements de bugs (sous 3 jours ouvrés)." },
      ],
      audience: {
        fits: [
          "Gérez déjà un registre de clients, d’affaires ou de stock dans Google Sheets",
          "Voulez que le personnel de terrain consulte le registre sur téléphone, et que seules certaines personnes saisissent ou modifient (les lecteurs ne voient pas les boutons de modification)",
          "Avez plus de 10 utilisateurs sans vouloir d’abonnement par utilisateur",
          "Êtes une agence ou un indépendant qui veut l’intégrer au registre d’un client (la livraison d’une version modifiée est permise). Si vous préférez ne pas l’installer vous-même, l’installation peut être faite pour vous",
        ],
        notFor: [
          "Voulez tenir à l’écart du tableur lui-même les personnes qui modifient via les écrans (quiconque peut modifier à l’écran est éditeur du tableur et peut aussi ouvrir la feuille et Apps Script)",
          "Avez besoin que des personnes sans compte Google l’utilisent (seules les personnes connectées à Google avec qui le tableur est partagé peuvent l’ouvrir)",
          "Avez une seule table bien au-delà de quelques milliers de lignes (repère : environ 5 000 lignes par table)",
          "Voulez envoyer des messages LINE aux clients avec peu de réglages (la réception des amis demande Cloudflare et Node.js ; les notifications internes LINE et Slack, non)",
        ],
      },
      compare: {
        rows: [
          {
            kind: "Fonction intégrée",
            name: "Google Forms (réponses enregistrées dans un tableur)",
            href: SOURCES.googleForms,
            cost: "0 ¥",
            note: "Permet d’ajouter des fiches depuis un téléphone. Aucun écran pour retrouver ou modifier ce qui a été saisi.",
          },
          {
            kind: "Outil gratuit",
            name: "AppSheet (Google)",
            href: SOURCES.appsheet,
            cost: "Gratuit pour créer et tester jusqu’à 10 utilisateurs ; en production à partir de 5 $ par utilisateur et par mois (Starter)",
            note: "Le service de Google pour créer des applications à partir de tableurs. Pour un prototype ou un petit essai, il suffit.",
          },
          {
            kind: "Service similaire",
            name: "kintone",
            href: SOURCES.kintone,
            cost: "Formule Light : 1 000 ¥ par utilisateur et par mois (HT), 10 utilisateurs minimum",
            note: "Un service de création d’applications métier. Le registre passe du tableur à kintone.",
          },
        ],
        kit: "Garde votre tableur actuel comme registre et ajoute des écrans de liste, recherche, saisie, modification et CSV utilisables sur téléphone. Les ajouts et mises à jour peuvent être annoncés sur LINE, Slack ou Discord. Sans abonnement, quel que soit le nombre d’utilisateurs.",
        checkedOn: CHECKED_ON,
      },
      steps: [
        {
          heading: "Quand s’affiche « Google n’a pas validé cette application »",
          intro: "La première fois que vous lancez depuis le menu le chargement d’un exemple ou l’initialisation, Google affiche un écran de confirmation. Comme vous avez collé le script dans votre propre tableur, c’est normal.",
          items: [
            "Sur l’écran « Autorisation requise », cliquez sur « Examiner les autorisations » et choisissez votre compte Google.",
            "Quand « Google n’a pas validé cette application » apparaît, cliquez sur « Paramètres avancés » en bas à gauche.",
            "Cliquez sur « Accéder à (nom du projet) (non sécurisé) », qui apparaît en dessous.",
            "Vérifiez les autorisations et cliquez sur « Autoriser ». Une fois validé, relancez l’initialisation depuis le menu.",
          ],
          after: "Le personnel qui utilise les écrans peut voir le même écran à la première ouverture de l’URL ; prévenez-le en la partageant. Une fois l’autorisation donnée, il suffit d’ouvrir l’URL.",
        },
        {
          heading: "Lors du déploiement en application web",
          intro: "Ce kit fonctionne avec les droits de la personne connectée : les choix sont l’inverse de ceux des kits de page de réservation et de réception de formulaires.",
          items: [
            "En ajoutant le fichier HTML dans Apps Script, nommez-le « App ». C’est correct si la liste affiche « App.html ».",
            "Cliquez sur Déployer → Nouveau déploiement en haut à droite et choisissez « Application Web » comme type.",
            "Réglez « Exécuter en tant que » sur « Utilisateur accédant à l’application Web » et « Qui a accès » sur « Tous les utilisateurs disposant d’un compte Google », puis cliquez sur Déployer.",
            "Vérifiez l’URL depuis le menu du tableur (Application métier → URL de l’application Web), puis essayez d’abord vous-même l’ajout, la modification et la recherche sur les fiches d’exemple.",
          ],
          after: "Si l’ouverture de l’URL affiche « No HTML file named App was found », la cause n’est pas le partage : renommez le fichier HTML en « App », enregistrez et mettez à jour le déploiement avec une nouvelle version.",
        },
      ],
    },
  },
};
