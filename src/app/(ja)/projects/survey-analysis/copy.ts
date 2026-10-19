import type { KitSales } from "../kit-parts";
import type { KitCopy } from "../kit-sheet";

const SOURCES = {
  userlocal: "https://textmining.userlocal.jp/",
  formsGemini: "https://workspaceupdates.googleblog.com/2025/09/proactive-summaries-forms-gemini.html",
  surveyMonkey: "https://jp.surveymonkey.com/pricing/",
};

/** 比べる相手のページを読んだ日 */
const CHECKED_ON = "2026-10-20";

const jaSales: KitSales = {
  proof: [
    { figure: "176 件", label: "自動テストの数です。Google の動きをまねた環境で、実行時間の上限や API の誤りの場面まで通してからお届けしています（1.0.0）。" },
    { figure: "0 円", label: "API キーを入れる前に見本で試すときの費用です。見本は同梱の答えを再生するので、AI を呼びません。" },
    { figure: "約 90 円", label: "月 300 件・週 1 回のまとめでの、AI の利用料の目安です（手順書の費用の目安より）。" },
    { figure: "14 日", label: "ご購入から、不具合のご連絡と使い方のご質問にメールでお答えする期間です（3 営業日以内に返信）。" },
  ],
  audience: {
    fits: [
      "患者満足度・セミナー後・社内のアンケートの自由記述を、毎週・毎月読んで、似た声を数えている事務担当の方",
      "回答を Google フォームで集めている方、紙のアンケートを QR コードのフォームに替えたい方（クリニック・サロン・飲食の質問の見本つき）",
      "お客さまのスプレッドシートに組み込んで納品したい制作会社・フリーランスの方（改変して納品できます）",
      "API キーの取得や貼り付けが不安な方（設置までお任せいただけます。下の「お値段」をご覧ください）",
    ],
    notFor: [
      "グラフつきの報告書を自動で作りたい方（まとめは表と文です。グラフはスプレッドシートの機能で作れます）",
      "回答の本文を社外の AI に送れない決まりのある方（回答の本文と評価を Anthropic に送ります）",
      "Google Workspace の有料プランをお使いで、フォームの画面の要約で足りる方（下の比較をご覧ください）",
      "回答が月に数件で、読めば足りる方（下の比較の無料の道具をおすすめします）",
    ],
  },
  compare: {
    rows: [
      {
        kind: "無料の道具",
        name: "ユーザーローカル AI テキストマイニング",
        href: SOURCES.userlocal,
        cost: "0 円（ユーザー登録のうえ、1 回 1 万字まで）",
        note: "貼った文からワードクラウドなどを作り、よく出る言葉を眺められます。分類ごとの件数や改善案は出ません。",
      },
      {
        kind: "標準の機能",
        name: "Google フォームの Gemini による回答の要約",
        href: SOURCES.formsGemini,
        cost: "Google Workspace の Business Standard 以上（1 人 1,600 円/月・税別から）",
        note: "フォームの回答の画面で、自由記述の要約を出します。席ごとに月額がかかります。",
      },
      {
        kind: "似たサービス",
        name: "SurveyMonkey チームアドバンテージ",
        href: SOURCES.surveyMonkey,
        cost: "1 人 4,370 円/月（3 人から・年払い）",
        note: "アンケートの作成から、AI 自動分析・主題分析まで一つのサービスで行えます。回答はサービスの中に貯まります。",
      },
    ],
    kit: "回答 1 件ずつを AI が分類し、分類ごとの件数・多い要望・「今週の 3 つ」をご自身のスプレッドシートにまとめます。週 1 回の自動のまとめとお知らせもできます。キットの月額はかかりません。",
    checkedOn: CHECKED_ON,
  },
  steps: [
    {
      heading: "「このアプリは Google で確認されていません」と出たとき",
      intro: "初めてメニューの「初期化」を押すと、Google の承認の画面が出ます。ご自身で貼ったスクリプトなので、この画面が出るのが正常です。次の順に進めてください。",
      items: [
        "「承認が必要です」の画面で「権限を確認」を押し、ご自身の Google アカウントを選びます。",
        "「このアプリは Google で確認されていません」と出たら、画面の下にある小さな「詳細」を押します。",
        "下に出る「（プロジェクト名）に移動（安全ではないページ）」を押します。",
        "許可の一覧（7 つ。何に使うかは手順書の表にあります）を確かめて「許可」を押します。",
        "「設定」「分析結果」「質問」のシートができ、API キーを貼る欄が出ます。キーをまだ作っていなければ［キャンセル］を押し、あとで「初期化」をもう一度押すと欄がまた出ます。",
      ],
      after: "会社の Google アカウントで「ブロックされました」「管理者が制限しています」と出るときは、管理者の方の許可が要ります。フォームの作成を止めている組織でも、管理者の方にご確認ください。",
    },
    {
      heading: "Anthropic の API キーの取得とカードの登録",
      intro: "実際の回答を AI で分析するときに要る鍵です。フォームを作って回答を集めるだけなら、まだ要りません。Anthropic Console の画面は英語です。",
      items: [
        "Anthropic Console（console.anthropic.com）でアカウントを作ります。",
        "「Billing」で支払い方法（クレジットカード）を登録し、クレジットを入れます。最初は $5 で数千件を分析できます。",
        "先に「Limits」の「Spend limit」で、月の上限額を決めます（たとえば 1,000 円相当）。思いがけない請求を防げます。",
        "「API Keys」でキーを 1 つ作り、コピーします。キーが表示されるのは 1 度だけです。",
        "スプレッドシートに戻り、メニューの「初期化」を押して出る欄に貼り、［OK］を押します。",
      ],
      after: "キーはスプレッドシートのシートには書かず、スクリプトの中（スクリプト プロパティ）にだけ置きます。閲覧の権限で共有した方には見えませんが、編集の権限がある方は Apps Script の画面から読めます。スタッフとは閲覧の権限で共有してください。",
    },
  ],
};

const ja: KitCopy = {
  meta: {
    title: "Google フォームの自由記述を AI が分類・集計｜毎週「今週の 3 つ」に（お客さまアンケート キット）",
    description: "Google フォームに集まった自由記述を AI（Claude）が 1 件ずつ分類し、分類ごとの件数・多い要望・今週取り組める改善案 3 つを Google スプレッドシートにまとめるキットです。買い切りで月額はかかりません。クリニック・サロン・飲食の質問の見本つき。",
  },
  name: "お客さまアンケート キット",
  title: "Google フォームの自由記述を、AI が分類して改善案 3 つに",
  lede: "Google フォームの自由記述を毎週読んで、似た声を数えている方へ。回答 1 件ずつを AI（Anthropic の Claude）が分類し、件数と「今週の 3 つ」をスプレッドシートにまとめます。キットの月額はかかりません。",
  intro:
    "下は、キットに同梱の架空のクリニックの見本の回答と、そこから再生される「今週の 3 つ」の写しです。",
  sections: [
    {
      heading: "できること",
      list: [
        "クリニック・サロンや美容・飲食の質問の見本を読み込み、お店や会社に合わせて直して、Google フォームを作れます",
        "回答ごとに、AI（Anthropic の Claude）が分類・感情・要望・短い要約を付けます",
        "「まとめ」シートに、分類ごとの件数、よく出る要望、この 1 週間で取り組める改善案「今週の 3 つ」が並びます。改善案には、AI が書いた根拠（もとになった声と件数）が添えられます。分類ごとの件数はキットが数えた値なので、見比べて確かめられます",
        "AI の分類が違っていたら、シート上で直せます。まとめの件数には、直したあとの内容が反映されます",
        "週 1 回の分析とまとめを自動で行い、メールや Slack・Discord・LINE に送れます（回答の本文と要約は載せません）",
        "すでに Google フォームで集めた回答や、シートに貼り付けた口コミも整理できます",
      ],
    },
    {
      heading: "初期設定",
      text: [
        "初期設定は、手順書に沿ってご自身で行っていただく商品です。プログラムを貼り付け、Google の承認操作を行います。実際の回答を AI で分析するには、Anthropic のアカウントと支払い設定、API キーの登録も必要です（下の「つまずきやすいところ」に手順があります）。",
        "実際の回答を分析するときは、回答本文と評価を Anthropic の AI へ送信します。名前や連絡先は送らず、メールアドレスと電話番号は伏せ字にしてから送ります。フォームには、AI を使って集計することと、名前や連絡先を書かないことを案内する説明文を用意しています。",
      ],
    },
    {
      heading: "費用",
      text: [
        "キットは買い切りで、キット自体の月額料金はありません。AI で分析するときの Anthropic API の利用料は、ご自身のアカウントから別途お支払いいただきます。利用額は回答の件数や文章の長さで変わり、月 300 件・週 1 回のまとめで約 90 円が目安です。メニューの「今月の AI 利用」で、今月の目安の額を確かめられます。",
      ],
    },
    {
      heading: "できないこと",
      list: [
        "グラフは作りません。まとめは表と文です。件数の表を選んで「挿入」→「グラフ」で、スプレッドシートのグラフにできます",
        "QR コードの画像は、キットでは作りません。Chrome の機能で作ります",
        "回答 1 件ごとの通知はしません。お知らせは週 1 回のまとめです",
        "お客さまへの返信の文は作りません",
        "口コミサイトからの自動取り込みには対応していません",
      ],
    },
    {
      heading: "入っているもの",
      list: ["プログラム（Google Apps Script）", "設定の手順書", "業種別の質問の見本と、架空の回答の見本"],
    },
    {
      heading: "必要なもの",
      list: [
        "Google アカウント（スプレッドシート、Apps Script、Google フォームを使います）",
        "Anthropic のアカウントと支払い設定（実際の回答を AI で分析するとき）",
        "QR コードを作るときは Chrome",
      ],
    },
  ],
  buyHeading: "価格と購入",
  buy: "1.x のアップデートは無料で受け取れます。改変と、お客さまのスプレッドシートへの組み込み納品は自由で、再配布・転売・同種の商品としての販売はできません",
  service:
    "貼り付けと承認・API キーの登録までを任せたい方は、上の「お値段」の「設置まで頼む」からご相談ください。質問と分類の設計、初回の分析、まとめの読み方の説明まで含めた導入の代行（40,000 円・7 日・修正 1 回。キット一式を含みます）は、ココナラ・ランサーズでお受けしています。",
  sales: jaSales,
};

export const copy: Record<"ja" | "en" | "fr", KitCopy> = {
  ja,
  en: {
    meta: {
      title: "AI sorts and counts Google Forms free-text answers | Three things to fix each week (Customer Survey Kit)",
      description: "A kit where AI (Claude) sorts each free-text answer in Google Forms and summarizes counts by category, frequent requests, and three improvements you can make this week in Google Sheets. One-time purchase, no monthly fee. Sample questions for clinics, salons, and restaurants included.",
    },
    name: "Customer Survey Kit",
    title: "AI sorts Google Forms comments into three things to fix",
    lede: "For people who read Google Forms comments every week and count similar ones by hand. AI (Anthropic’s Claude) sorts each answer and summarizes the counts and “three for this week” in a spreadsheet. The kit has no monthly fee.",
    intro:
      "Below is a copy of the kit’s bundled sample answers from a fictional clinic and the “three for this week” it replays from them (the screens are in Japanese).",
    sections: [
      {
        heading: "What it does",
        list: [
          "Load sample questions for clinics, salons and beauty, or restaurants, adapt them to your business, and create a Google Form",
          "For each answer, AI (Anthropic’s Claude) adds a category, sentiment, request, and short summary",
          "A summary sheet lists counts by category, frequent requests, and three improvement ideas you can act on this week. Each idea comes with the AI’s stated basis (the comments and counts behind it); the category counts are computed by the kit, so you can check one against the other",
          "If the AI’s category is wrong, you can fix it in the sheet. The summary counts reflect your corrections",
          "A weekly analysis and summary run automatically and can be sent by email, Slack, Discord, or LINE (without the answer text or summaries)",
          "It can also organize answers you already collected in Google Forms and reviews pasted into a sheet",
        ],
      },
      {
        heading: "Initial setup",
        text: [
          "You do the initial setup yourself, following the guide: paste in the program and go through Google’s authorization. To analyze real answers with AI, you also need an Anthropic account with billing set up and an API key (the steps are under “Where people usually get stuck” below).",
          "When analyzing real answers, the answer text and ratings are sent to Anthropic’s AI. Names and contact details are not sent, and email addresses and phone numbers are masked first. A description is provided for the form, telling respondents that AI is used for tallying and not to write names or contact details.",
        ],
      },
      {
        heading: "Costs",
        text: [
          "The kit is a one-time purchase with no monthly fee of its own. Anthropic API usage for the AI analysis is paid separately from your own account. It varies with the number and length of answers; about ¥90 for 300 answers a month with a weekly summary is a guide. The “AI usage this month” menu shows an estimate for the month.",
        ],
      },
      {
        heading: "What it doesn’t do",
        list: [
          "No charts. The summary is tables and text. Select the count table and use Insert → Chart to make a spreadsheet chart",
          "The kit doesn’t make QR code images. You make them with a Chrome feature",
          "No notification per answer. Notices are the weekly summary",
          "It doesn’t write replies to customers",
          "No automatic import from review sites",
        ],
      },
      {
        heading: "What’s included",
        list: ["The program (Google Apps Script)", "A setup guide", "Sample questions by industry and sample fictional answers"],
      },
      {
        heading: "Requirements",
        list: [
          "A Google account (uses Sheets, Apps Script, and Google Forms)",
          "An Anthropic account with billing set up (to analyze real answers with AI)",
          "Chrome, to make QR codes",
        ],
      },
    ],
    buyHeading: "Price and purchase",
    buy: " Buyers receive 1.x updates free. Modifying it and delivering it built into a client’s spreadsheet are allowed; redistribution, resale, and selling it as a similar product are not",
    service:
      "To have the pasting, authorization, and API key registration done for you, use “Setup done for you” under Price above. A fuller onboarding service that also covers question and category design, the first analysis, and how to read the summary (¥40,000, 7 days, 1 revision, kit included) is offered through Coconala and Lancers (in Japanese).",
    sales: {
      proof: [
        { figure: "176", label: "Automated tests. Each release passes them in an environment that mimics Google, including time limits and API errors (1.0.0)." },
        { figure: "¥0", label: "Cost of trying the sample before you enter an API key. The sample replays bundled answers and does not call the AI." },
        { figure: "~¥90", label: "Guide to AI usage fees for 300 answers a month with a weekly summary (from the cost guide in the manual)." },
        { figure: "14 days", label: "After purchase, we answer bug reports and how-to questions by email (reply within 3 business days)." },
      ],
      audience: {
        fits: [
          "Are an office administrator who reads free-text answers from patient satisfaction, post-seminar, or internal surveys every week or month and counts similar comments",
          "Collect answers with Google Forms, or want to replace a paper survey with a form behind a QR code (sample questions for clinics, salons, and restaurants)",
          "Are an agency or freelancer who wants to build it into a client’s spreadsheet (modified versions may be delivered)",
          "Would rather not get the API key or paste the code yourself (setup can be done for you; see Price below)",
        ],
        notFor: [
          "Want reports with charts generated automatically (the summary is tables and text; charts can be made with the spreadsheet’s own feature)",
          "Have rules against sending answer text to an outside AI (answer text and ratings are sent to Anthropic)",
          "Are on a paid Google Workspace plan and the summary in the Forms screen is enough (see the comparison below)",
          "Get only a few answers a month and can simply read them (we recommend the free tool compared below)",
        ],
      },
      compare: {
        rows: [
          {
            kind: "Free tool",
            name: "User Local AI Text Mining",
            href: SOURCES.userlocal,
            cost: "¥0 (free registration, up to 10,000 characters per run)",
            note: "Makes word clouds and similar views from pasted text so you can see frequent words. No per-category counts or improvement ideas.",
          },
          {
            kind: "Built-in feature",
            name: "Gemini response summaries in Google Forms",
            href: SOURCES.formsGemini,
            cost: "Google Workspace Business Standard or higher (from ¥1,600 per user/month, excl. tax)",
            note: "Shows summaries of free-text answers in the Forms responses screen. A monthly fee applies per seat.",
          },
          {
            kind: "Similar service",
            name: "SurveyMonkey Team Advantage",
            href: SOURCES.surveyMonkey,
            cost: "¥4,370 per user/month (3 users minimum, billed annually)",
            note: "Covers survey creation through AI auto-analysis and thematic analysis in one service. Answers stay inside the service.",
          },
        ],
        kit: "AI sorts each answer, and counts by category, frequent requests, and “three for this week” are summarized in your own spreadsheet. Weekly automatic summaries and notices are available. No monthly fee for the kit.",
        checkedOn: CHECKED_ON,
      },
      steps: [
        {
          heading: "When you see “Google hasn’t verified this app”",
          intro: "The first time you press Initialize in the menu, Google shows an authorization screen. Because you pasted the script yourself, this screen is expected. Proceed in this order.",
          items: [
            "On the “Authorization required” screen, press “Review permissions” and choose your Google account.",
            "When “Google hasn’t verified this app” appears, press the small “Advanced” link at the bottom of the screen.",
            "Press “Go to (project name) (unsafe)”, which appears below.",
            "Review the list of permissions (seven; the guide has a table of what each is for) and press “Allow”.",
            "The Settings, Analysis results, and Questions sheets are created and a box for the API key appears. If you haven’t made a key yet, press Cancel; pressing Initialize again later shows the box again.",
          ],
          after: "If a company Google account shows “blocked” or “restricted by your administrator”, your administrator needs to allow the script. The same applies if your organization restricts creating forms.",
        },
        {
          heading: "Getting an Anthropic API key and registering a card",
          intro: "This key is needed to analyze real answers with AI. You don’t need it yet just to create a form and collect answers. The Anthropic Console is in English.",
          items: [
            "Create an account in the Anthropic Console (console.anthropic.com).",
            "Under “Billing”, register a payment method (credit card) and add credit. $5 is enough to analyze several thousand answers at first.",
            "First set a monthly cap under “Limits” → “Spend limit” (for example, the equivalent of ¥1,000). This prevents unexpected charges.",
            "Under “API Keys”, create one key and copy it. The key is shown only once.",
            "Back in the spreadsheet, press Initialize in the menu, paste the key into the box, and press OK.",
          ],
          after: "The key is never written to a sheet; it is kept only inside the script (script properties). People you share the sheet with as viewers cannot see it, but editors can read it from the Apps Script screen. Share with staff as viewers.",
        },
      ],
    },
  },
  fr: {
    meta: {
      title: "L’IA classe et compte les réponses libres de Google Forms | Trois actions chaque semaine (Kit d’enquête client)",
      description: "Un kit où l’IA (Claude) classe chaque réponse libre de Google Forms et résume dans Google Sheets les comptes par catégorie, les demandes fréquentes et trois améliorations à mener cette semaine. Achat unique, sans abonnement. Questions d’exemple pour cliniques, salons et restaurants incluses.",
    },
    name: "Kit d’enquête client",
    title: "L’IA classe les réponses libres de Google Forms en trois actions",
    lede: "Pour ceux qui lisent chaque semaine les réponses libres de Google Forms et comptent à la main les avis semblables. L’IA (Claude, d’Anthropic) classe chaque réponse et résume dans un tableur les comptes et les « trois pour cette semaine ». Le kit n’a pas d’abonnement.",
    intro:
      "Ci-dessous, une copie des réponses d’exemple d’une clinique fictive fournies avec le kit et des « trois pour cette semaine » rejoués à partir d’elles (écrans en japonais).",
    sections: [
      {
        heading: "Ce qu’il fait",
        list: [
          "Chargez des questions d’exemple pour les cliniques, les salons et l’esthétique ou la restauration, adaptez-les et créez un formulaire Google",
          "Pour chaque réponse, l’IA (Claude, d’Anthropic) ajoute une catégorie, un sentiment, une demande et un court résumé",
          "Une feuille de synthèse liste les comptes par catégorie, les demandes fréquentes et trois pistes d’amélioration pour la semaine. Chaque piste est accompagnée de la justification rédigée par l’IA (avis et nombre) ; les comptes par catégorie sont calculés par le kit, ce qui permet de les comparer",
          "Si la catégorie de l’IA est fausse, vous la corrigez dans la feuille. Les comptes de la synthèse en tiennent compte",
          "Une analyse et une synthèse hebdomadaires tournent automatiquement et peuvent être envoyées par e-mail, Slack, Discord ou LINE (sans le texte des réponses ni les résumés)",
          "Il organise aussi les réponses déjà recueillies dans Google Forms et les avis collés dans une feuille",
        ],
      },
      {
        heading: "Installation",
        text: [
          "L’installation est à faire vous-même en suivant le guide : vous collez le programme et passez l’autorisation Google. Pour analyser de vraies réponses avec l’IA, il faut aussi un compte Anthropic avec paiement configuré et une clé d’API (les étapes figurent sous « Là où l’on bloque le plus souvent » ci-dessous).",
          "Lors de l’analyse de vraies réponses, le texte et les notes sont envoyés à l’IA d’Anthropic. Les noms et coordonnées ne sont pas envoyés, et les adresses e-mail et numéros de téléphone sont masqués avant l’envoi. Un texte d’explication est fourni pour le formulaire : il indique que l’IA sert au comptage et qu’il ne faut pas écrire de nom ni de coordonnées.",
        ],
      },
      {
        heading: "Coûts",
        text: [
          "Le kit est un achat unique, sans abonnement propre. L’usage de l’API Anthropic pour l’analyse est payé à part depuis votre compte. Il varie selon le nombre et la longueur des réponses ; environ 90 ¥ pour 300 réponses par mois avec une synthèse hebdomadaire, à titre indicatif. Le menu « Usage de l’IA ce mois-ci » affiche une estimation.",
        ],
      },
      {
        heading: "Ce qu’il ne fait pas",
        list: [
          "Pas de graphiques. La synthèse est faite de tableaux et de texte. Sélectionnez le tableau des comptes puis Insertion → Graphique pour en faire un graphique",
          "Le kit ne crée pas d’image de QR code. On la crée avec une fonction de Chrome",
          "Pas de notification par réponse. Les avis sont la synthèse hebdomadaire",
          "Il ne rédige pas de réponses aux clients",
          "Pas d’import automatique depuis les sites d’avis",
        ],
      },
      {
        heading: "Contenu",
        list: ["Le programme (Google Apps Script)", "Un guide d’installation", "Des questions d’exemple par secteur et des réponses fictives d’exemple"],
      },
      {
        heading: "Prérequis",
        list: [
          "Un compte Google (Sheets, Apps Script et Google Forms)",
          "Un compte Anthropic avec paiement configuré (pour analyser de vraies réponses avec l’IA)",
          "Chrome, pour créer des QR codes",
        ],
      },
    ],
    buyHeading: "Prix et achat",
    buy: " Les acheteurs reçoivent gratuitement les mises à jour 1.x. Modification et livraison intégrée au tableur d’un client autorisées ; redistribution, revente et vente comme produit similaire interdites",
    service:
      "Pour confier le collage, l’autorisation et l’enregistrement de la clé d’API, utilisez « Installation comprise » dans la section Prix ci-dessus. Un accompagnement plus complet, qui couvre aussi la conception des questions et des catégories, la première analyse et la lecture de la synthèse (40 000 ¥, 7 jours, 1 révision, kit inclus), est proposé via Coconala et Lancers (en japonais).",
    sales: {
      proof: [
        { figure: "176", label: "Tests automatisés. Chaque version les passe dans un environnement qui imite Google, y compris les limites de durée et les erreurs d’API (1.0.0)." },
        { figure: "0 ¥", label: "Coût de l’essai avec l’exemple avant de saisir une clé d’API. L’exemple rejoue des réponses fournies et n’appelle pas l’IA." },
        { figure: "~90 ¥", label: "Ordre de grandeur des frais d’IA pour 300 réponses par mois avec une synthèse hebdomadaire (d’après le guide des coûts)." },
        { figure: "14 jours", label: "Après l’achat, nous répondons par e-mail aux signalements de bugs et aux questions d’utilisation (réponse sous 3 jours ouvrés)." },
      ],
      audience: {
        fits: [
          "Êtes chargé·e d’administration et lisez chaque semaine ou chaque mois les réponses libres d’enquêtes de satisfaction patients, d’après-séminaire ou internes, en comptant les avis semblables",
          "Recueillez les réponses avec Google Forms, ou voulez remplacer un questionnaire papier par un formulaire derrière un QR code (questions d’exemple pour cliniques, salons et restaurants)",
          "Êtes une agence ou un indépendant qui veut l’intégrer au tableur d’un client (la livraison d’une version modifiée est permise)",
          "Préférez ne pas obtenir la clé d’API ni coller le code vous-même (l’installation peut être faite pour vous ; voir Prix ci-dessous)",
        ],
        notFor: [
          "Voulez des rapports avec graphiques générés automatiquement (la synthèse est faite de tableaux et de texte ; les graphiques se font avec la fonction du tableur)",
          "Avez des règles interdisant d’envoyer le texte des réponses à une IA externe (le texte et les notes sont envoyés à Anthropic)",
          "Utilisez une offre payante de Google Workspace et le résumé de l’écran Forms vous suffit (voir la comparaison ci-dessous)",
          "Recevez seulement quelques réponses par mois et pouvez simplement les lire (nous recommandons l’outil gratuit comparé ci-dessous)",
        ],
      },
      compare: {
        rows: [
          {
            kind: "Outil gratuit",
            name: "User Local AI Text Mining",
            href: SOURCES.userlocal,
            cost: "0 ¥ (inscription gratuite, 10 000 caractères par analyse)",
            note: "Crée des nuages de mots et des vues semblables à partir du texte collé pour repérer les mots fréquents. Ni comptes par catégorie ni pistes d’amélioration.",
          },
          {
            kind: "Fonction intégrée",
            name: "Résumés des réponses par Gemini dans Google Forms",
            href: SOURCES.formsGemini,
            cost: "Google Workspace Business Standard ou supérieur (à partir de 1 600 ¥ par utilisateur et par mois, HT)",
            note: "Affiche dans l’écran des réponses un résumé des réponses libres. Abonnement mensuel par utilisateur.",
          },
          {
            kind: "Service similaire",
            name: "SurveyMonkey Team Advantage",
            href: SOURCES.surveyMonkey,
            cost: "4 370 ¥ par utilisateur et par mois (3 utilisateurs minimum, facturation annuelle)",
            note: "Couvre la création d’enquêtes jusqu’à l’analyse automatique par IA et l’analyse thématique. Les réponses restent dans le service.",
          },
        ],
        kit: "L’IA classe chaque réponse ; comptes par catégorie, demandes fréquentes et « trois pour cette semaine » sont résumés dans votre propre tableur. Synthèse et avis hebdomadaires automatiques possibles. Pas d’abonnement pour le kit.",
        checkedOn: CHECKED_ON,
      },
      steps: [
        {
          heading: "Quand s’affiche « Google n’a pas validé cette application »",
          intro: "La première fois que vous lancez l’initialisation depuis le menu, Google affiche un écran d’autorisation. Comme vous avez collé le script vous-même, c’est normal. Procédez dans cet ordre.",
          items: [
            "Sur l’écran « Autorisation requise », cliquez sur « Examiner les autorisations » et choisissez votre compte Google.",
            "Quand « Google n’a pas validé cette application » apparaît, cliquez sur le petit lien « Paramètres avancés » en bas de l’écran.",
            "Cliquez sur « Accéder à (nom du projet) (non sécurisé) », qui apparaît en dessous.",
            "Vérifiez la liste des autorisations (sept ; le guide indique à quoi sert chacune) et cliquez sur « Autoriser ».",
            "Les feuilles Réglages, Résultats d’analyse et Questions sont créées et un champ pour la clé d’API apparaît. Si vous n’avez pas encore de clé, cliquez sur Annuler ; relancer l’initialisation plus tard fait réapparaître le champ.",
          ],
          after: "Si un compte Google d’entreprise affiche « bloqué » ou « restreint par votre administrateur », l’administrateur doit autoriser le script. De même si votre organisation limite la création de formulaires.",
        },
        {
          heading: "Obtenir une clé d’API Anthropic et enregistrer une carte",
          intro: "Cette clé sert à analyser de vraies réponses avec l’IA. Elle n’est pas encore nécessaire pour créer un formulaire et recueillir des réponses. La console Anthropic est en anglais.",
          items: [
            "Créez un compte dans la console Anthropic (console.anthropic.com).",
            "Dans « Billing », enregistrez un moyen de paiement (carte bancaire) et ajoutez du crédit. 5 $ suffisent d’abord à analyser plusieurs milliers de réponses.",
            "Fixez d’abord un plafond mensuel dans « Limits » → « Spend limit » (par exemple l’équivalent de 1 000 ¥). Cela évite les factures imprévues.",
            "Dans « API Keys », créez une clé et copiez-la. Elle ne s’affiche qu’une fois.",
            "De retour dans le tableur, lancez l’initialisation depuis le menu, collez la clé dans le champ et cliquez sur OK.",
          ],
          after: "La clé n’est jamais écrite dans une feuille ; elle est conservée uniquement dans le script (propriétés du script). Les personnes avec un accès en lecture ne la voient pas, mais celles qui peuvent modifier la feuille la lisent depuis l’écran Apps Script. Partagez avec l’équipe en lecture seule.",
        },
      ],
    },
  },
};
