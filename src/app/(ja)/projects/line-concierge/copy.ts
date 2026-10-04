import type { KitCopy } from "../kit-sheet";

const ja: KitCopy = {
  meta: {
    title: "LINE 案内窓口キット",
    description: "LINE 公式アカウントに届いたご質問に、自社の文書だけを根拠に AI が敬体でお答えし、答えられないことは担当者へ引き継ぐキットです。",
  },
  title: "LINE 案内窓口キット",
  lede: "LINE 公式アカウントに届いたご質問に、自社の文書だけを根拠に AI が敬体でお答えします",
  intro:
    "LINE の中で動くキットなので、このページに動く見本は置いていません。見本の会社の文書と設定を同梱しているので、LINE をつなぐ前に、手元で答え方を確かめられます。AI 案内窓口キット（サイトに置く窓）と同じ「答える部品」を使っていますが、このキットだけで動きます。",
  sections: [
    {
      heading: "できること",
      list: [
        "会社案内・料金・よくあるご質問などの文書を読み込ませると、届いたご質問に AI（Anthropic の Claude）が敬体でお答えします。書いていないことを推測で答えません",
        "答えの下に「参考:」として、根拠にした文書のタイトルと URL が最大 3 つ並びます",
        "友だち追加のあいさつと答えの下に、よくあるご質問の候補がボタンで並びます（最大 13 個）",
        "資料に無いことは「載っていません」とお伝えして、「担当者に相談する」ボタンを出します。引き継ぐと 24 時間 AI が黙り、担当者が LINE の管理画面のチャットから直接お返事します。Slack への通知もできます",
        "直近 6 往復を 1 時間覚えていて、「それはいくらですか」のような続きの質問にも答えます",
        "上限は 1 人 1 日 30 問、全体で 1 日 500 問、1 問 400 字です。数字はすべて設定で変えられます",
      ],
    },
    {
      heading: "こんな方に",
      list: [
        "工務店・リフォーム会社の方。対応エリア、費用の目安、工事の流れなど、見積もりの前に知りたいことが決まっています",
        "サロン・教室・クリニックの方。一般的な案内は AI が返し、判断が要ることは担当者へ渡します",
        "不動産・士業の方。物件や手続きの前提を、資料の範囲でお答えします",
        "制作会社・受託の方。お客さまの LINE 公式アカウントに納める部品として使えます。改変と納品は自由です",
      ],
    },
    {
      heading: "置き方",
      text: [
        "同梱の Next.js のテンプレを Vercel に置くか、公開 URL のある Node のサーバーで動かします。どちらも、LINE Developers の Webhook URL に置いた先の /api/line を入れ、LINE 公式アカウントの管理画面で「応答メッセージ」と「あいさつメッセージ」をオフにすれば、友だち追加からあいさつが届きます。手順は README に画面の名前つきで書いてあります。",
        "Vercel は Hobby プランでも動きますが、Hobby は個人の非商用に限られるので、事業でお使いの場合は Pro です。",
      ],
    },
    {
      heading: "守り",
      list: [
        "LINE から届いた本文は、署名とチャネルシークレットで確かめます。合わなければ中身を読みません",
        "鍵とトークンはサーバーの環境変数にだけ置きます",
        "記録に残すご質問は、メールアドレス・電話番号・9 桁以上の数字を伏せ字にします",
        "文書や届いた文の中に AI への指示が書かれていても従わず、質問として扱います",
        "1 対 1 のトークにだけ答えます。グループや複数人のトークでは何もしません",
      ],
    },
    {
      heading: "費用",
      text: [
        "キットは買い切りです。答えを作る API の利用料はお客さまのご負担で、鍵は Anthropic Console でご自身で発行したものをお使いいただきます。LINE 公式アカウントは無料で作れ、返信は月の無料通数を使わないので、無料プランのままで運用できます。",
        "文書が 30,000 トークンのとき、1 日 100 件を 30 日続けた場合の目安は、既定のモデル（claude-opus-5）で月 12,000〜23,000 円ほど、claude-sonnet-5 で月 4,600〜9,300 円ほどです（ご質問の間隔のあき方で変わります。1 ドル 150 円で換算）。",
      ],
    },
    {
      heading: "入っているもの",
      list: [
        "dist/（サーバー部品と Node サーバー、line-concierge コマンド）と、TypeScript のソースとテスト",
        "templates/nextjs/（Vercel に置く Next.js のテンプレ）",
        "samples/（見本の会社の文書 8 本と設定ファイル）",
        "vendor/（AI 案内窓口キットの本体）",
        "README.ja.md（LINE 公式アカウントの用意から Webhook の接続、設定の表、つまずきの一覧まで）・LICENSE.md・CHANGELOG.md",
      ],
    },
    {
      heading: "動作環境",
      text: [
        "Node 22 以上。Vercel か、HTTPS の公開 URL を持つ Node のサーバー。LINE 公式アカウント（無料）と Anthropic の API キー（クレジットカードが必要です）。会話を Vercel でも続けたい場合は Upstash Redis（無料枠で足ります）、担当者への通知は Slack の Incoming Webhook（任意）です。",
      ],
    },
  ],
  buyHeading: "価格と購入",
  buy: "買った方は、その後の 1.x のアップデートも無料で受け取れます。改変と納品は自由で、再配布・転売・同種商品化はできません",
  service:
    "文書の整理と索引づくり、Vercel への設置、LINE 公式アカウントの設定、引き継ぎ先と質問の候補の作り込みまでを任せたい方には、導入の代行（¥80,000・14 日・修正 2 回）があります。ココナラ・ランサーズでお受けしています。",
};

export const copy: Record<"ja" | "en" | "fr", KitCopy> = {
  ja,
  en: {
    meta: {
      title: "LINE Help Desk Kit",
      description: "A kit that has AI answer questions sent to your LINE Official Account politely, using only your own documents, and hands off to a person when it can’t answer.",
    },
    title: "LINE Help Desk Kit",
    lede: "AI answers questions sent to your LINE Official Account politely, using only your own documents",
    intro:
      "This kit runs inside LINE, so there is no live demo on this page. Sample documents and settings for a fictional company are included, so you can check how it answers on your own machine before connecting LINE. It uses the same answering engine as the AI Help Desk Kit (the window on your website), but works on its own.",
    sections: [
      {
        heading: "What it does",
        list: [
          "Load documents such as your company profile, prices, and FAQ, and AI (Anthropic’s Claude) answers incoming questions politely. It doesn’t guess at things your documents don’t say",
          "Under each answer, up to three sources are listed with the document title and URL",
          "Suggested questions appear as buttons under the welcome message and under each answer (up to 13)",
          "When the documents don’t cover a question, it says so and shows a “talk to staff” button. After a handoff, the AI stays silent for 24 hours and staff reply directly from the LINE chat screen. Slack notifications are available",
          "It remembers the last 6 exchanges for 1 hour, so follow-up questions like “how much is that?” work",
          "Limits are 30 questions per person per day, 500 per day in total, and 400 characters per question. All of them can be changed in the settings",
        ],
      },
      {
        heading: "Who it’s for",
        list: [
          "Builders and renovation companies: service area, rough costs, and the work process are what people want to know before asking for a quote",
          "Salons, schools, and clinics: the AI handles general information and passes anything that needs judgment to staff",
          "Real estate and professional offices: answers about properties and procedures stay within your documents",
          "Agencies and freelancers: a component to deliver into a client’s LINE Official Account. Modifying and delivering it is allowed",
        ],
      },
      {
        heading: "How to set it up",
        text: [
          "Deploy the included Next.js template to Vercel, or run it on a Node server with a public URL. Either way, enter /api/line on your deployment as the webhook URL in LINE Developers and turn off the automatic response and greeting messages in the LINE Official Account manager; new friends then receive the greeting. The README walks through it with the names of each screen.",
          "Vercel’s Hobby plan works, but it is limited to personal, non-commercial use, so business use needs Pro.",
        ],
      },
      {
        heading: "Safeguards",
        list: [
          "Messages from LINE are verified with the signature and channel secret. If they don’t match, the content isn’t read",
          "Keys and tokens live only in server environment variables",
          "Logged questions have email addresses, phone numbers, and numbers of 9 digits or more masked",
          "Instructions to the AI written inside documents or messages are not followed; they are treated as questions",
          "It only answers one-on-one chats and does nothing in groups or multi-person chats",
        ],
      },
      {
        heading: "Costs",
        text: [
          "The kit is a one-time purchase. API usage fees for generating answers are paid by you, with a key you issue yourself in the Anthropic Console. A LINE Official Account is free, and replies don’t count against the monthly free message quota, so the free plan is enough.",
          "With 30,000 tokens of documents and 100 questions a day for 30 days, the estimate is about ¥12,000–23,000 a month with the default model (claude-opus-5) and about ¥4,600–9,300 with claude-sonnet-5 (depending on the gaps between questions; converted at ¥150 to the dollar).",
        ],
      },
      {
        heading: "What’s included",
        list: [
          "dist/ (the server component, a Node server, and the line-concierge command), plus TypeScript source and tests",
          "templates/nextjs/ (a Next.js template to deploy on Vercel)",
          "samples/ (8 documents for a fictional company and a settings file)",
          "vendor/ (the AI Help Desk Kit engine)",
          "README.ja.md (from preparing the LINE Official Account to connecting the webhook, a settings table, and troubleshooting), LICENSE.md, CHANGELOG.md",
        ],
      },
      {
        heading: "Requirements",
        text: [
          "Node 22 or later. Vercel, or a Node server with a public HTTPS URL. A LINE Official Account (free) and an Anthropic API key (requires a credit card). To keep conversations going on Vercel, Upstash Redis (the free tier is enough); for staff notifications, a Slack incoming webhook (optional).",
        ],
      },
    ],
    buyHeading: "Price and purchase",
    buy: " Buyers receive later 1.x updates free. Modifying and delivering it is allowed; redistribution, resale, and selling it as a similar product are not",
    service:
      "If you’d like document preparation and indexing, Vercel setup, LINE Official Account settings, and tuning of the handoff and suggested questions done for you, a setup service is available (¥80,000, 14 days, 2 revisions) through Coconala and Lancers (in Japanese).",
  },
  fr: {
    meta: {
      title: "Kit d’assistant LINE",
      description: "Un kit où l’IA répond poliment aux questions reçues sur votre compte officiel LINE, à partir de vos seuls documents, et passe la main à une personne quand elle ne peut pas répondre.",
    },
    title: "Kit d’assistant LINE",
    lede: "L’IA répond poliment aux questions reçues sur votre compte officiel LINE, à partir de vos seuls documents",
    intro:
      "Ce kit fonctionne dans LINE : il n’y a donc pas de démo interactive sur cette page. Des documents et réglages d’exemple pour une entreprise fictive sont fournis, pour vérifier les réponses sur votre machine avant de connecter LINE. Il utilise le même moteur de réponse que le Kit d’assistant IA (la fenêtre sur votre site), mais fonctionne seul.",
    sections: [
      {
        heading: "Ce qu’il fait",
        list: [
          "Chargez vos documents (présentation, tarifs, FAQ…) et l’IA (Claude, d’Anthropic) répond poliment aux questions reçues. Elle ne devine pas ce que vos documents ne disent pas",
          "Sous chaque réponse, jusqu’à trois sources sont listées avec le titre et l’URL du document",
          "Des questions suggérées s’affichent en boutons sous le message d’accueil et sous chaque réponse (jusqu’à 13)",
          "Quand les documents ne couvrent pas la question, elle le dit et affiche un bouton pour parler à un membre de l’équipe. Après le transfert, l’IA se tait pendant 24 heures et l’équipe répond directement depuis l’écran de discussion LINE. Une notification Slack est possible",
          "Elle garde en mémoire les 6 derniers échanges pendant 1 heure, pour suivre les questions de relance comme « combien ça coûte ? »",
          "Les limites sont de 30 questions par personne et par jour, 500 par jour au total et 400 caractères par question. Toutes se règlent",
        ],
      },
      {
        heading: "Pour qui",
        list: [
          "Entreprises de construction et de rénovation : zone d’intervention, coûts indicatifs et déroulement des travaux sont les questions d’avant devis",
          "Salons, écoles et cliniques : l’IA donne les informations générales et transmet à l’équipe ce qui demande un jugement",
          "Immobilier et professions libérales : les réponses sur les biens et les démarches restent dans le cadre de vos documents",
          "Agences et indépendants : un composant à livrer sur le compte officiel LINE d’un client. Modification et livraison autorisées",
        ],
      },
      {
        heading: "Installation",
        text: [
          "Déployez le modèle Next.js fourni sur Vercel, ou lancez-le sur un serveur Node avec une URL publique. Dans les deux cas, indiquez /api/line de votre déploiement comme URL de webhook dans LINE Developers et désactivez les réponses automatiques et le message d’accueil dans le gestionnaire du compte officiel LINE ; les nouveaux amis reçoivent alors l’accueil. Le README détaille chaque écran.",
          "Le plan Hobby de Vercel fonctionne, mais il est réservé à un usage personnel non commercial : pour une entreprise, il faut Pro.",
        ],
      },
      {
        heading: "Protections",
        list: [
          "Les messages venant de LINE sont vérifiés avec la signature et le secret du canal. S’ils ne correspondent pas, le contenu n’est pas lu",
          "Les clés et jetons restent uniquement dans les variables d’environnement du serveur",
          "Dans les questions journalisées, les e-mails, numéros de téléphone et nombres de 9 chiffres ou plus sont masqués",
          "Les instructions adressées à l’IA dans les documents ou les messages ne sont pas suivies : elles sont traitées comme des questions",
          "Elle ne répond qu’aux discussions individuelles, rien dans les groupes",
        ],
      },
      {
        heading: "Coûts",
        text: [
          "Le kit est un achat unique. Les frais d’API pour générer les réponses sont à votre charge, avec une clé que vous créez dans l’Anthropic Console. Un compte officiel LINE est gratuit et les réponses ne comptent pas dans le quota mensuel de messages gratuits : le plan gratuit suffit.",
          "Avec 30 000 jetons de documents et 100 questions par jour pendant 30 jours, l’estimation est d’environ 12 000 à 23 000 ¥ par mois avec le modèle par défaut (claude-opus-5) et d’environ 4 600 à 9 300 ¥ avec claude-sonnet-5 (selon l’espacement des questions ; conversion à 150 ¥ le dollar).",
        ],
      },
      {
        heading: "Contenu",
        list: [
          "dist/ (le composant serveur, un serveur Node et la commande line-concierge), avec les sources TypeScript et les tests",
          "templates/nextjs/ (un modèle Next.js à déployer sur Vercel)",
          "samples/ (8 documents d’une entreprise fictive et un fichier de réglages)",
          "vendor/ (le moteur du Kit d’assistant IA)",
          "README.ja.md (de la préparation du compte officiel LINE à la connexion du webhook, tableau des réglages et dépannage), LICENSE.md, CHANGELOG.md",
        ],
      },
      {
        heading: "Prérequis",
        text: [
          "Node 22 ou plus. Vercel, ou un serveur Node avec une URL publique en HTTPS. Un compte officiel LINE (gratuit) et une clé d’API Anthropic (carte bancaire requise). Pour garder les conversations sur Vercel, Upstash Redis (l’offre gratuite suffit) ; pour prévenir l’équipe, un webhook entrant Slack (facultatif).",
        ],
      },
    ],
    buyHeading: "Prix et achat",
    buy: " Les acheteurs reçoivent gratuitement les mises à jour 1.x. Modification et livraison autorisées ; redistribution, revente et vente comme produit similaire interdites",
    service:
      "Pour confier la préparation des documents et l’index, l’installation sur Vercel, les réglages du compte officiel LINE et l’ajustement du transfert et des questions suggérées, un service d’installation existe (80 000 ¥, 14 jours, 2 révisions) via Coconala et Lancers (en japonais).",
  },
};
