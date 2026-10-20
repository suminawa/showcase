import type { KitSales } from "../kit-parts";
import { STEP_IMAGES } from "../step-images";

const SOURCES = {
  qiita: "https://qiita.com/rira__/items/c336673b3bbcaebdf3f8",
  gmailFilter: "https://support.google.com/mail/answer/6579?hl=ja",
  yaritori: "https://yaritori.jp/plan/",
};

/** 比べる相手のページを読んだ日 */
const CHECKED_ON = "2026-10-20";

const jaSales: KitSales = {
  proof: [
    { figure: "125 件", label: "自動テストの数です。Google の動きをまねた環境でプログラム全体を動かし、メールを送る命令と消す命令が無いことも検査しています（1.0.2）。" },
    { figure: "0 通", label: "キットが送るメールの数です。返信の案は Gmail の下書きに置くだけで、送るのは人です。" },
    { figure: "8 通", label: "API キーを入れる前に試せる見本のメールです。鍵も Gmail も使わずに、シートと通知の形を確かめられます。" },
    { figure: "14 日", label: "ご購入から、不具合のご連絡にメールでお答えする期間です（3 営業日以内に返信）。" },
  ],
  audience: {
    fits: [
      "info@ などの窓口の Gmail を 1〜2 人で見ていて、クレームや急ぎの問い合わせの見落としが心配な会社の方",
      "問い合わせの一覧（受付番号・分類・要約・期限・状態・担当）をスプレッドシートで持ちたい方。Slack などが無くても、シートと Gmail の下書きだけで使えます（通知先は任意です）",
      "お客さまの Gmail とスプレッドシートに組み込んで納品したい制作会社・フリーランスの方（改変して納品できます）",
      "ご自身で貼るのが不安な方（設置までお任せいただけます。下の「お値段」をご覧ください）",
    ],
    notFor: [
      "返信まで自動で送りたい方（このキットはメールを送りません）",
      "Gmail 以外のメール（Outlook など）で問い合わせを受けている方",
      "同じスレッドの続きのメールも整理したい方（1.0 では、スレッドの最初のメールだけを整理します）",
      "お客さまのメールを社外の AI に送れない決まりのある方（本文を Anthropic に送ります。既定の契約では学習に使われません）",
    ],
  },
  compare: {
    rows: [
      {
        kind: "無料の道具",
        name: "Qiita「GAS × Gemini で問い合わせを分類」",
        href: SOURCES.qiita,
        cost: "0 円（コードの全文が公開されています）",
        note: "Gmail のメールを Gemini で分類し、要約とともにシートへ 1 行ずつ書きます。返信の下書きと通知はありません。分類と要約で足りる方は、これで十分です。",
      },
      {
        kind: "標準の機能",
        name: "Gmail のフィルタ",
        href: SOURCES.gmailFilter,
        cost: "0 円（Gmail に最初からあります）",
        note: "差出人や言葉の条件で、ラベル付け・スター付け・転送などを自動で行います。中身を読んで急ぎを見分けることや、要約・返信の案はありません。",
      },
      {
        kind: "似たサービス",
        name: "yaritori",
        href: SOURCES.yaritori,
        cost: "1 人 1,980 円/月から（2 人から）",
        note: "共有の受信箱で、担当と状態を分けて問い合わせを管理するサービスです。AI による返信文の作成もあります（どのプランに入るかは料金表で確かめてください）。",
      },
    ],
    kit: "15 分ごとに Gmail を読み、8 分類・緊急度・要約・期限をシートに 1 行ずつ、返信の案を下書きに置き、要対応を先頭にした 1 通で知らせます。キットの月額はかかりません。API の費用は 1 通 2〜4 円ほどです（claude-opus-5。claude-sonnet-5 ならその半分以下）。",
    checkedOn: CHECKED_ON,
  },
  steps: [
    {
      heading: "「このアプリは Google で確認されていません」と出たとき",
      image: STEP_IMAGES.gasAuth,
      intro: "メニューの「問い合わせ整理」→「設定を確かめる」を初めて押すと、Google の承認の画面が出ます。ご自身で貼ったスクリプトなので、この画面が出るのが正常です。次の順に進めてください。",
      items: [
        "「承認が必要です」の画面で「権限を確認」を押し、ご自身の Google アカウントを選びます。",
        "「このアプリは Google で確認されていません」と出たら、画面の下にある小さな「詳細」を押します。",
        "下に出る「（プロジェクト名）に移動（安全ではないページ）」を押します。",
        "Gmail の欄に「Gmail のすべてのメールの閲覧、作成、送信、完全な削除」と出ます。Google が Apps Script に用意している Gmail の許可はこの 1 つだけで、キットが行うのは検索・下書きの作成・ラベル付けの 3 つだけです。確かめて「許可」を押します。",
        "いまの設定の一覧が出て、「API キー: 設定済み」となっていれば、承認と鍵の登録は済んでいます。",
      ],
      after: "会社の Google アカウントで「ブロックされました」「管理者が制限しています」と出るときは、管理者の方の許可が要ります。",
    },
    {
      heading: "Anthropic の API キーの取得とカードの登録",
      image: STEP_IMAGES.apiKey,
      intro: "メールを AI に読ませるための鍵です。費用は、読んだ通数に応じてご自身の鍵にかかります。Anthropic Console の画面は英語です。会社のカードで登録するときは、先に上限額と一緒に決裁を取っておくと進めやすくなります。",
      items: [
        "Anthropic Console（console.anthropic.com）でアカウントを作り、「Billing」で支払い方法（クレジットカード）を登録します。",
        "「Limits」の「Spend limit」で、月の上限を決めておきます（たとえば 3,000 円相当）。想定外の請求を防げます。",
        "「API Keys」でキーを 1 つ作り、コピーします。キーが表示されるのは 1 度だけです。",
        "スプレッドシートの「拡張機能」→「Apps Script」を開き、左の歯車（プロジェクトの設定）→「スクリプト プロパティ」→「プロパティを追加」で、プロパティに ANTHROPIC_API_KEY、値にコピーしたキーを入れて保存します。",
      ],
      after: "キーは設定シートには書かないでください。スプレッドシートを編集できる方は、Apps Script の画面からキーとコードを読めます。同僚とは閲覧の権限で共有してください。",
    },
  ],
};

const ja = {
  meta: {
    title: "Gmail の問い合わせを AI が分類・要約・返信案に｜送るのは人（AI 問い合わせ整理キット）",
    description: "Gmail に届く問い合わせを 15 分ごとに AI（Claude）が読み、分類・緊急度・要約をスプレッドシートに 1 行ずつ、返信の案を Gmail の下書きに置くキットです。メールは自動では送りません。買い切りで月額はかかりません。見本のメール 5 通の整理の結果を、このページで読めます。",
  },
  name: "AI 問い合わせ整理キット",
  title: "Gmail の問い合わせを、AI が分類・要約・返信案に",
  lede: "窓口の Gmail に届いた問い合わせを 15 分ごとに AI（Anthropic の Claude）が読み、分類・緊急度・要約をスプレッドシートに 1 行ずつ、返信の案を Gmail の下書きに置きます。急ぎを先頭にした 1 通でもお知らせします。送るのは人で、自動では送りません。",
  made: "通知の 1 通・シートの行・下書きの本文・ラベル・Claude に渡す文は、キットに入っている src/ の関数をこのページの中でそのまま動かして作っています。AI の答えだけは見本の記録で、このページから AI は呼びません。キットでは、同じ関数が 15 分ごとに Gmail を読み、ご自身の API キーで Claude に尋ねます。",
  sales: jaSales,
};

export const copy: Record<"ja" | "en" | "fr", typeof ja> = {
  ja,
  en: {
    meta: {
      title: "AI sorts, summarizes, and drafts replies to Gmail inquiries | A person sends them (AI Inquiry Triage Kit)",
      description: "A kit where AI (Claude) reads inquiries arriving in Gmail every 15 minutes, logs category, urgency, and summary to a spreadsheet row by row, and leaves reply drafts in Gmail. It never sends email automatically. One-time purchase, no monthly fee. Read the results of triaging five sample emails on this page.",
    },
    name: "AI Inquiry Triage Kit",
    title: "AI sorts Gmail inquiries, sums them up, and drafts replies",
    lede: "Every 15 minutes, AI (Anthropic’s Claude) reads the inquiries in your shared Gmail inbox, logs category, urgency, and summary to a spreadsheet row by row, and leaves reply drafts in Gmail. It also sends one notice with urgent items first. A person sends the replies; nothing goes out automatically.",
    made: "The notification, sheet rows, draft text, labels, and the prompt sent to Claude are produced by running the kit’s own src/ functions right on this page. Only the AI’s answers are recorded samples; this page never calls the AI. In the kit, the same functions read Gmail every 15 minutes and ask Claude using your own API key.",
    sales: {
      proof: [
        { figure: "125", label: "Automated tests. The whole program runs in an environment that mimics Google, and the tests check it contains no command to send or delete email (1.0.2)." },
        { figure: "0", label: "Emails the kit sends. Reply drafts are only saved in Gmail; a person sends them." },
        { figure: "8", label: "Sample emails you can try before entering an API key. Check the sheet and notice without using the key or Gmail." },
        { figure: "14 days", label: "After purchase, we answer bug reports by email (reply within 3 business days)." },
      ],
      audience: {
        fits: [
          "Handle a shared inbox such as info@ with one or two people and worry about missing complaints or urgent inquiries",
          "Want a list of inquiries (reference number, category, summary, deadline, status, owner) in a spreadsheet. It works with just the sheet and Gmail drafts, without Slack or similar (notifications are optional)",
          "Are an agency or freelancer who wants to build it into a client’s Gmail and spreadsheet (modified versions may be delivered)",
          "Would rather not install it yourself (setup can be done for you; see Price below)",
        ],
        notFor: [
          "Want replies sent automatically too (this kit never sends email)",
          "Receive inquiries in an email service other than Gmail, such as Outlook",
          "Need follow-up emails in the same thread triaged too (version 1.0 triages only the first email of a thread)",
          "Have rules against sending customer emails to an outside AI (the text is sent to Anthropic; under the default terms it is not used for training)",
        ],
      },
      compare: {
        rows: [
          {
            kind: "Free tool",
            name: "Qiita article “Classify inquiries with GAS × Gemini”",
            href: SOURCES.qiita,
            cost: "¥0 (full code published)",
            note: "Classifies Gmail messages with Gemini and writes one row per email with a summary to a sheet. No reply drafts or notifications. If categories and summaries are enough, this will do.",
          },
          {
            kind: "Built-in feature",
            name: "Gmail filters",
            href: SOURCES.gmailFilter,
            cost: "¥0 (built into Gmail)",
            note: "Labels, stars, forwards, and so on, based on sender or keywords. It doesn’t read the content to spot urgent items, and makes no summaries or reply drafts.",
          },
          {
            kind: "Similar service",
            name: "yaritori",
            href: SOURCES.yaritori,
            cost: "From ¥1,980 per user/month (2 users minimum)",
            note: "A shared inbox service for managing inquiries by owner and status. It also offers AI-written replies (check the price table for which plans include it).",
          },
        ],
        kit: "Reads Gmail every 15 minutes, logs 8 categories, urgency, summary, and deadline to one sheet row each, leaves reply drafts, and sends one notice with items needing action first. No monthly fee for the kit. API usage is about ¥2–4 per email (claude-opus-5; under half that with claude-sonnet-5).",
        checkedOn: CHECKED_ON,
      },
      steps: [
        {
          heading: "When you see “Google hasn’t verified this app”",
          intro: "The first time you press Inquiry Triage → Check settings in the menu, Google shows an authorization screen. Because you pasted the script yourself, this screen is expected. Proceed in this order.",
          items: [
            "On the “Authorization required” screen, press “Review permissions” and choose your Google account.",
            "When “Google hasn’t verified this app” appears, press the small “Advanced” link at the bottom of the screen.",
            "Press “Go to (project name) (unsafe)”, which appears below.",
            "The Gmail entry reads “Read, compose, send, and permanently delete all your email from Gmail”. It is the only Gmail permission Google offers Apps Script; the kit only searches, creates drafts, and adds labels. Review it and press “Allow”.",
            "The current settings are listed. If it shows the API key as set, authorization and key registration are done.",
          ],
          after: "If a company Google account shows “blocked” or “restricted by your administrator”, your administrator needs to allow the script.",
        },
        {
          heading: "Getting an Anthropic API key and registering a card",
          intro: "This key lets the AI read your email. Costs are charged to your own key according to how many emails it reads. The Anthropic Console is in English. If you register a company card, getting approval together with a spending cap first makes things smoother.",
          items: [
            "Create an account in the Anthropic Console (console.anthropic.com) and register a payment method (credit card) under “Billing”.",
            "Set a monthly cap under “Limits” → “Spend limit” (for example, the equivalent of ¥3,000). This prevents unexpected charges.",
            "Under “API Keys”, create one key and copy it. The key is shown only once.",
            "In the spreadsheet, open Extensions → Apps Script, then the gear (Project settings) → Script properties → Add property. Enter ANTHROPIC_API_KEY as the property and the copied key as the value, and save.",
          ],
          after: "Don’t write the key in the settings sheet. Anyone who can edit the spreadsheet can read the key and the code from the Apps Script screen, so share with colleagues as viewers.",
        },
      ],
    },
  },
  fr: {
    meta: {
      title: "L’IA classe, résume et prépare les réponses aux demandes Gmail | C’est vous qui envoyez (Kit de tri des demandes par IA)",
      description: "Un kit où l’IA (Claude) lit toutes les 15 minutes les demandes arrivées dans Gmail, note catégorie, urgence et résumé ligne par ligne dans un tableur et laisse des brouillons de réponse dans Gmail. Aucun e-mail n’est envoyé automatiquement. Achat unique, sans abonnement. Consultez sur cette page le tri de cinq e-mails d’exemple.",
    },
    name: "Kit de tri des demandes par IA",
    title: "L’IA classe et résume les demandes Gmail et prépare les réponses",
    lede: "Toutes les 15 minutes, l’IA (Claude, d’Anthropic) lit les demandes de votre boîte Gmail de contact, note catégorie, urgence et résumé ligne par ligne dans un tableur et laisse des brouillons de réponse dans Gmail. Elle envoie aussi un avis avec les urgences en tête. C’est une personne qui envoie ; rien ne part automatiquement.",
    made: "La notification, les lignes du tableur, le texte des brouillons, les libellés et le texte envoyé à Claude sont produits en exécutant directement sur cette page les fonctions src/ du kit. Seules les réponses de l’IA sont des enregistrements d’exemple ; cette page n’appelle jamais l’IA. Dans le kit, les mêmes fonctions lisent Gmail toutes les 15 minutes et interrogent Claude avec votre propre clé API.",
    sales: {
      proof: [
        { figure: "125", label: "Tests automatisés. Le programme entier tourne dans un environnement qui imite Google, et les tests vérifient qu’il ne contient aucune commande d’envoi ni de suppression d’e-mail (1.0.2)." },
        { figure: "0", label: "E-mail envoyé par le kit. Les brouillons restent dans Gmail ; c’est une personne qui envoie." },
        { figure: "8", label: "E-mails d’exemple à essayer avant de saisir une clé d’API. Vérifiez la feuille et l’avis sans clé ni Gmail." },
        { figure: "14 jours", label: "Après l’achat, nous répondons par e-mail aux signalements de bugs (réponse sous 3 jours ouvrés)." },
      ],
      audience: {
        fits: [
          "Gérez à une ou deux personnes une boîte de contact comme info@ et craignez de manquer une réclamation ou une demande urgente",
          "Voulez la liste des demandes (numéro, catégorie, résumé, échéance, statut, responsable) dans un tableur. Il fonctionne avec la seule feuille et les brouillons Gmail, sans Slack ni autre (les notifications sont facultatives)",
          "Êtes une agence ou un indépendant qui veut l’intégrer au Gmail et au tableur d’un client (la livraison d’une version modifiée est permise)",
          "Préférez ne pas l’installer vous-même (l’installation peut être faite pour vous ; voir Prix ci-dessous)",
        ],
        notFor: [
          "Voulez aussi l’envoi automatique des réponses (ce kit n’envoie jamais d’e-mail)",
          "Recevez les demandes dans une messagerie autre que Gmail, comme Outlook",
          "Voulez aussi trier les e-mails suivants d’un même fil (la version 1.0 ne trie que le premier e-mail d’un fil)",
          "Avez des règles interdisant d’envoyer les e-mails clients à une IA externe (le texte est envoyé à Anthropic ; selon les conditions par défaut, il ne sert pas à l’entraînement)",
        ],
      },
      compare: {
        rows: [
          {
            kind: "Outil gratuit",
            name: "Article Qiita « Classer les demandes avec GAS × Gemini »",
            href: SOURCES.qiita,
            cost: "0 ¥ (code complet publié)",
            note: "Classe les e-mails Gmail avec Gemini et écrit une ligne par e-mail avec un résumé dans une feuille. Ni brouillons de réponse ni notifications. Si catégories et résumés vous suffisent, il convient.",
          },
          {
            kind: "Fonction intégrée",
            name: "Filtres Gmail",
            href: SOURCES.gmailFilter,
            cost: "0 ¥ (intégré à Gmail)",
            note: "Applique libellés, étoiles, transferts, etc. selon l’expéditeur ou des mots-clés. Il ne lit pas le contenu pour repérer l’urgent et ne produit ni résumé ni brouillon.",
          },
          {
            kind: "Service similaire",
            name: "yaritori",
            href: SOURCES.yaritori,
            cost: "À partir de 1 980 ¥ par utilisateur et par mois (2 utilisateurs minimum)",
            note: "Une boîte de réception partagée pour gérer les demandes par responsable et statut. Propose aussi la rédaction de réponses par IA (vérifiez dans la grille tarifaire les offres concernées).",
          },
        ],
        kit: "Lit Gmail toutes les 15 minutes, note 8 catégories, urgence, résumé et échéance sur une ligne chacune, laisse des brouillons et envoie un avis avec les demandes à traiter en tête. Pas d’abonnement pour le kit. L’API coûte environ 2 à 4 ¥ par e-mail (claude-opus-5 ; moins de la moitié avec claude-sonnet-5).",
        checkedOn: CHECKED_ON,
      },
      steps: [
        {
          heading: "Quand s’affiche « Google n’a pas validé cette application »",
          intro: "La première fois que vous cliquez sur Tri des demandes → Vérifier les réglages dans le menu, Google affiche un écran d’autorisation. Comme vous avez collé le script vous-même, c’est normal. Procédez dans cet ordre.",
          items: [
            "Sur l’écran « Autorisation requise », cliquez sur « Examiner les autorisations » et choisissez votre compte Google.",
            "Quand « Google n’a pas validé cette application » apparaît, cliquez sur le petit lien « Paramètres avancés » en bas de l’écran.",
            "Cliquez sur « Accéder à (nom du projet) (non sécurisé) », qui apparaît en dessous.",
            "La ligne Gmail indique « Lire, rédiger, envoyer et supprimer définitivement tous vos e-mails Gmail ». C’est la seule autorisation Gmail que Google propose à Apps Script ; le kit se contente de rechercher, de créer des brouillons et d’ajouter des libellés. Vérifiez puis cliquez sur « Autoriser ».",
            "La liste des réglages s’affiche. Si la clé d’API y apparaît comme configurée, l’autorisation et l’enregistrement de la clé sont faits.",
          ],
          after: "Si un compte Google d’entreprise affiche « bloqué » ou « restreint par votre administrateur », l’administrateur doit autoriser le script.",
        },
        {
          heading: "Obtenir une clé d’API Anthropic et enregistrer une carte",
          intro: "Cette clé permet à l’IA de lire vos e-mails. Le coût est imputé à votre propre clé selon le nombre d’e-mails lus. La console Anthropic est en anglais. Si vous enregistrez une carte d’entreprise, obtenir l’accord en même temps qu’un plafond de dépenses facilite les choses.",
          items: [
            "Créez un compte dans la console Anthropic (console.anthropic.com) et enregistrez un moyen de paiement (carte bancaire) dans « Billing ».",
            "Fixez un plafond mensuel dans « Limits » → « Spend limit » (par exemple l’équivalent de 3 000 ¥). Cela évite les factures imprévues.",
            "Dans « API Keys », créez une clé et copiez-la. Elle ne s’affiche qu’une fois.",
            "Dans le tableur, ouvrez Extensions → Apps Script, puis l’engrenage (Paramètres du projet) → Propriétés du script → Ajouter une propriété. Saisissez ANTHROPIC_API_KEY comme propriété et la clé copiée comme valeur, puis enregistrez.",
          ],
          after: "N’écrivez pas la clé dans la feuille de réglages. Toute personne pouvant modifier le tableur peut lire la clé et le code depuis l’écran Apps Script : partagez avec vos collègues en lecture seule.",
        },
      ],
    },
  },
};
