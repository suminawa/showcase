import type { KitCopy } from "../kit-sheet";

const ja: KitCopy = {
  meta: {
    title: "お客さまアンケート キット",
    description: "Google フォームに集まった回答を AI が分類し、件数・多い要望・改善案を Google スプレッドシートにまとめるキットです。業種別の質問の見本つき。",
  },
  title: "お客さまアンケート キット",
  lede: "Google フォームに集まった回答を AI が分類し、件数・多い要望・改善案をスプレッドシートにまとめます",
  intro:
    "Google スプレッドシートの中で動くキットなので、このページに動く見本は置いていません。購入後は、API キーを登録する前に、同梱の架空のサロンの回答で表示と操作を確かめられます。このときは同梱の結果を再生するので、AI の利用料はかかりません。",
  sections: [
    {
      heading: "できること",
      list: [
        "飲食・サロンや美容・クリニックの質問の見本を読み込み、お店に合わせて直して、Google フォームを作れます",
        "回答ごとに、AI（Anthropic の Claude）が分類・感情・要望・短い要約を付けます",
        "「まとめ」シートに、分類ごとの件数、よく出る要望、この 1 週間で取り組める改善案「今週の 3 つ」が並びます。改善案には、もとになった回答の件数も添えられます",
        "AI の分類が違っていたら、シート上で直せます。まとめの件数には、直したあとの内容が反映されます",
        "週 1 回の分析とまとめを自動で行い、メールや Slack・Discord・LINE に送れます（回答の本文と要約は載せません）",
        "すでに Google フォームで集めた回答や、シートに貼り付けた口コミも整理できます",
      ],
    },
    {
      heading: "こんな方に",
      list: [
        "Google フォームの自由記述を読み、似た声をまとめ、件数を数える作業を、毎週・毎月繰り返している方",
        "これからアンケートを始める飲食店・サロン・クリニックの方",
        "元の声と見比べながら、お店で取り組むことを決めたい方。改善案は、お店の状況に合わせて選ぶための材料です",
      ],
    },
    {
      heading: "初期設定",
      text: [
        "初期設定は、ご自身で行っていただく商品です。手順書に沿ってプログラムを貼り付け、Google の承認操作を行います。実際の回答を AI で分析するには、Anthropic のアカウントと支払い設定、API キーの登録も必要です。",
        "実際の回答を分析するときは、回答本文と評価を Anthropic の AI へ送信します。フォームには、AI を使って集計することと、名前や連絡先を書かないことを案内する説明文を用意しています。",
      ],
    },
    {
      heading: "費用",
      text: [
        "キットは買い切りで、キット自体の月額料金はありません。AI で分析するときの Anthropic API の利用料は、ご自身のアカウントから別途お支払いいただきます。利用額は回答の件数や文章の長さで変わり、月 300 件・週 1 回のまとめで約 90 円が目安です。",
      ],
    },
    {
      heading: "できないこと",
      list: [
        "グラフは作りません。まとめは表と文です",
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
    "設定を任せたい方には、導入の代行（40,000 円・7 日・修正 1 回）があります。料金にはキット一式が含まれ、質問と分類の設計、設定の手順書、初回の分析、まとめの読み方の説明までを行います。ココナラ・ランサーズでお受けしています。",
};

export const copy: Record<"ja" | "en" | "fr", KitCopy> = {
  ja,
  en: {
    meta: {
      title: "Customer Survey Kit",
      description: "A kit where AI sorts the answers collected in Google Forms and summarizes counts, frequent requests, and improvement ideas in Google Sheets. Includes sample questions by industry.",
    },
    title: "Customer Survey Kit",
    lede: "AI sorts the answers collected in Google Forms and summarizes counts, frequent requests, and improvement ideas in a spreadsheet",
    intro:
      "This kit runs inside Google Sheets, so there is no live demo on this page. After purchase, before registering an API key, you can check the screens with the included answers from a fictional salon. This replays bundled results, so there are no AI usage fees.",
    sections: [
      {
        heading: "What it does",
        list: [
          "Load sample questions for restaurants, salons and beauty, or clinics, adapt them to your business, and create a Google Form",
          "For each answer, AI (Anthropic’s Claude) adds a category, sentiment, request, and short summary",
          "A summary sheet lists counts by category, frequent requests, and three improvement ideas you can act on this week. Each idea shows how many answers it came from",
          "If the AI’s category is wrong, you can fix it in the sheet. The summary counts reflect your corrections",
          "A weekly analysis and summary run automatically and can be sent by email, Slack, Discord, or LINE (without the answer text or summaries)",
          "It can also organize answers you already collected in Google Forms and reviews pasted into a sheet",
        ],
      },
      {
        heading: "Who it’s for",
        list: [
          "People who read free-text answers in Google Forms, group similar comments, and count them every week or month",
          "Restaurants, salons, and clinics about to start a survey",
          "People who want to decide what to change while comparing with the original comments. The ideas are material for choosing, based on your situation",
        ],
      },
      {
        heading: "Initial setup",
        text: [
          "You do the initial setup yourself. Following the guide, you paste in the program and go through Google’s authorization. To analyze real answers with AI, you also need an Anthropic account with billing set up and an API key.",
          "When analyzing real answers, the answer text and ratings are sent to Anthropic’s AI. A description is provided for the form, telling respondents that AI is used for tallying and not to write names or contact details.",
        ],
      },
      {
        heading: "Costs",
        text: [
          "The kit is a one-time purchase with no monthly fee of its own. Anthropic API usage for the AI analysis is paid separately from your own account. It varies with the number and length of answers; about ¥90 for 300 answers a month with a weekly summary is a guide.",
        ],
      },
      {
        heading: "What it doesn’t do",
        list: [
          "No charts. The summary is tables and text",
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
      "If you’d like the setup done for you, a setup service is available (¥40,000, 7 days, 1 revision). It includes the full kit and covers question and category design, a setup guide, the first analysis, and an explanation of how to read the summary, through Coconala and Lancers (in Japanese).",
  },
  fr: {
    meta: {
      title: "Kit d’enquête client",
      description: "Un kit où l’IA classe les réponses recueillies dans Google Forms et résume dans Google Sheets les comptes, les demandes fréquentes et les pistes d’amélioration. Questions d’exemple par secteur incluses.",
    },
    title: "Kit d’enquête client",
    lede: "L’IA classe les réponses recueillies dans Google Forms et résume dans un tableur les comptes, les demandes fréquentes et les pistes d’amélioration",
    intro:
      "Ce kit fonctionne dans Google Sheets : il n’y a donc pas de démo interactive sur cette page. Après l’achat, avant d’enregistrer une clé d’API, vous pouvez vérifier les écrans avec les réponses fournies d’un salon fictif. Il s’agit d’une relecture de résultats fournis : aucun frais d’IA.",
    sections: [
      {
        heading: "Ce qu’il fait",
        list: [
          "Chargez des questions d’exemple pour la restauration, les salons et l’esthétique ou les cliniques, adaptez-les et créez un formulaire Google",
          "Pour chaque réponse, l’IA (Claude, d’Anthropic) ajoute une catégorie, un sentiment, une demande et un court résumé",
          "Une feuille de synthèse liste les comptes par catégorie, les demandes fréquentes et trois pistes d’amélioration pour la semaine. Chaque piste indique le nombre de réponses dont elle vient",
          "Si la catégorie de l’IA est fausse, vous la corrigez dans la feuille. Les comptes de la synthèse en tiennent compte",
          "Une analyse et une synthèse hebdomadaires tournent automatiquement et peuvent être envoyées par e-mail, Slack, Discord ou LINE (sans le texte des réponses ni les résumés)",
          "Il organise aussi les réponses déjà recueillies dans Google Forms et les avis collés dans une feuille",
        ],
      },
      {
        heading: "Pour qui",
        list: [
          "Ceux qui lisent les réponses libres de Google Forms, regroupent les avis semblables et les comptent chaque semaine ou chaque mois",
          "Restaurants, salons et cliniques qui lancent une enquête",
          "Ceux qui veulent décider quoi changer en comparant avec les avis d’origine. Les pistes sont des éléments pour choisir selon votre situation",
        ],
      },
      {
        heading: "Installation",
        text: [
          "L’installation est à faire vous-même. En suivant le guide, vous collez le programme et passez l’autorisation Google. Pour analyser de vraies réponses avec l’IA, il faut aussi un compte Anthropic avec paiement configuré et une clé d’API.",
          "Lors de l’analyse de vraies réponses, le texte et les notes sont envoyés à l’IA d’Anthropic. Un texte d’explication est fourni pour le formulaire : il indique que l’IA sert au comptage et qu’il ne faut pas écrire de nom ni de coordonnées.",
        ],
      },
      {
        heading: "Coûts",
        text: [
          "Le kit est un achat unique, sans abonnement propre. L’usage de l’API Anthropic pour l’analyse est payé à part depuis votre compte. Il varie selon le nombre et la longueur des réponses ; environ 90 ¥ pour 300 réponses par mois avec une synthèse hebdomadaire, à titre indicatif.",
        ],
      },
      {
        heading: "Ce qu’il ne fait pas",
        list: [
          "Pas de graphiques. La synthèse est faite de tableaux et de texte",
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
      "Pour confier l’installation, un service existe (40 000 ¥, 7 jours, 1 révision). Il comprend le kit complet, la conception des questions et des catégories, un guide d’installation, la première analyse et l’explication de la synthèse, via Coconala et Lancers (en japonais).",
  },
};
