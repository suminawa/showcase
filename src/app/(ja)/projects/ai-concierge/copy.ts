import type { KitSales } from "../kit-parts";

const SOURCES = {
  tidio: "https://www.tidio.com/pricing/",
  gem: "https://support.google.com/gemini/answer/16504957",
  chatbase: "https://www.chatbase.co/pricing",
};

/** 比べる相手のページを読んだ日 */
const CHECKED_ON = "2026-10-20";

const jaSales: KitSales = {
  proof: [
    { figure: "364 件", label: "自動テストの数です。版を出すたびに、すべて通してからお届けしています（1.0.2）。" },
    { figure: "0 円", label: "サービスの月額です。かかるのは答えを作る Claude API の利用料だけです（1 日 100 件で月 4,600 円ほどから。手順書の目安）。" },
    { figure: "2 行", label: "サイトに貼る行の数です。WordPress など Next.js 以外のサイトにも貼れます。" },
    { figure: "14 日", label: "ご購入から、不具合のご連絡にメールで対応する期間です。" },
  ],
  audience: {
    fits: [
      "お客さまのサイトに、資料だけで答える窓を納めたい制作会社・フリーランスの方（改変して納品でき、納品先の数に制限はありません）",
      "Next.js か Vercel を触れて、自社のサイトに案内窓口を置きたい方",
      "月額のサービスではなく、使った分の API の利用料だけにしたい方",
      "ご自身で置くのが難しい方（設置までお任せいただけます。下の「お値段」をご覧ください）",
    ],
    notFor: [
      "サーバーを持たずに、管理画面だけで窓を作りたい方（下の比較の月額のサービスが向いています）",
      "会話の長期の記憶・ユーザー登録・決済・音声が要る方（このキットには入っていません）",
      "Word や PDF をそのまま読ませたい方（文書は Markdown か、公開しているページの URL でご用意いただきます）",
      "クレジットカードを登録できない方（Claude API の鍵を作るには、カードの登録が要ります）",
    ],
  },
  compare: {
    rows: [
      {
        kind: "無料の道具",
        name: "Tidio の無料プラン",
        href: SOURCES.tidio,
        cost: "0 円",
        note: "チャットの窓を無料で置けます。AI の応答は、最初の 50 会話までです（使い切り）。",
      },
      {
        kind: "標準の機能",
        name: "Gemini の Gem",
        href: SOURCES.gem,
        cost: "0 円から（Google アカウントで使えます）",
        note: "自分の資料を読ませた AI を作れます。共有は相手のメールアドレスかリンクで行い、相手も Gemini にログインして使います。",
      },
      {
        kind: "似たサービス",
        name: "Chatbase",
        href: SOURCES.chatbase,
        cost: "無料のプランなし。Hobby が年払いで月 $32 から",
        note: "資料を読ませて答える窓を、サイトに置ける月額のサービスです。",
      },
    ],
    kit: "自社の資料だけで答え、根拠のページへのリンクを添えます。資料に無いことは問い合わせへご案内します。月額は 0 円で、かかるのは API の利用料だけです。プログラムはお手元に残ります。",
    checkedOn: CHECKED_ON,
  },
  steps: [
    {
      heading: "Claude の API キーを作り、カードを登録するまで",
      intro: "答えを作るのは Anthropic の Claude です。鍵（API キー）はお客さまご自身で作り、利用料はお客さまの Anthropic のアカウントにかかります。次の順に進めてください。",
      items: [
        "Claude Console（platform.claude.com。以前の Anthropic Console）を開き、アカウントを作ります。",
        "「Billing」の画面でクレジットカードを登録し、利用料に充てるクレジットを購入します。",
        "同じ「Billing」の「Spend limits」で「Set limit」を押し、1 か月に使ってよい額の上限を決めます。上限に届くと、その月は答えが止まります。",
        "「API keys」の画面で「Create key」を押し、名前を付けて鍵を作ります。鍵（sk-ant- で始まる文字列）は作ったときに一度しか表示されないので、その場で控えます。",
        "Vercel のプロジェクトの「Settings」→「Environment Variables」に、名前を ANTHROPIC_API_KEY として鍵を入れ、デプロイし直します。",
      ],
      after: "鍵はサーバーの環境変数にだけ置き、サイトの窓には出ません。1 日 100 件を 30 日続けたときの目安は、claude-sonnet-5 で月 4,600〜9,300 円ほど、claude-opus-5 で月 12,000〜23,000 円ほどです（1 ドル 150 円で換算。手順書の「費用の目安」）。",
    },
    {
      heading: "置いたあと、窓が答えないとき",
      intro: "窓に出る文から、どこを直せばよいかが分かります。手順書の「よくあるつまずき」から、多いものを並べました。",
      items: [
        "窓は出るのに答えが返らない: サーバーの環境変数に ANTHROPIC_API_KEY が入っているかを確かめ、入れたあとはデプロイし直します。",
        "「このページからのご利用は受け付けておりません」と出る: 環境変数 ALLOWED_ORIGINS に、窓を貼ったサイトの URL を足します。",
        "「data/index.json が見つかりません」と出る: npx ai-concierge index を実行し、できたファイルをコミットします。",
        "答えが「資料に載っていません」ばかり: /admin の未回答の一覧を見て、お客さまの言い方で文書を書き足します。",
      ],
      after: "WordPress など Next.js 以外のサイトに置くときは、答えを作るサーバー（同梱のテンプレートを Vercel に置いたものなど）を別に用意し、そのサイトの URL を ALLOWED_ORIGINS に足してから 2 行を貼ります。",
    },
  ],
};

const ja = {
  meta: {
    title: "自社の資料だけで答える、サイトの AI 案内窓口｜出典つき・月額なし（AI 案内窓口キット）",
    description: "会社案内・料金・よくあるご質問を読み込ませると、サイトを訪れた方のご質問に、根拠のページへのリンクを添えてお答えします。資料に無いことは推測で答えず、問い合わせへご案内します。買い切りで、月額のサービス料はかかりません（Next.js・Claude API）。このページで実物を試せます。",
  },
  name: "AI 案内窓口キット",
  title: "自社の資料だけで答える、サイトの AI 案内窓口",
  lede: "会社案内・料金・よくあるご質問を読み込ませると、サイトを訪れた方のご質問に敬体でお答えし、根拠のページへのリンクを添えます。資料に無いことは推測で答えず、問い合わせへご案内します。",
  demo: {
    label: "動く見本",
    text: "このサイトの案内を読んで、実際に答えます。ご質問は、答えを作るために Claude の API へ送られます。",
  },
  sources: "答えの末尾の番号は出典です。文書に無いことは「資料に載っていません」と答え、問い合わせへ回します。1 日の質問数には上限があります。",
  made: "上の窓は、キットに入っている窓とサーバーの部品を、このサイトの文書で動かしています。お手元では、同じ部品が御社の文書を読んで答えます。",
  sales: jaSales,
};

export const copy: Record<"ja" | "en" | "fr", typeof ja> = {
  ja,
  en: {
    meta: {
      title: "An AI help desk for your site that answers only from your documents | Cited, no monthly fee (AI Help Desk Kit)",
      description: "Load your company profile, prices, and FAQ, and it answers visitors’ questions on your site with links to the source pages. Anything not in your documents is referred to your contact form instead of guessed. One-time purchase, no monthly service fee (Next.js, Claude API). Try the real thing on this page.",
    },
    name: "AI Help Desk Kit",
    title: "An AI help desk that answers only from your documents",
    lede: "Load your company profile, prices, and FAQ, and it answers visitors’ questions politely, with links to the pages it relied on. When your documents don’t cover a question, it says so and points to your contact form instead of guessing.",
    demo: {
      label: "Live demo",
      text: "It reads this site’s own information and really answers. Questions are sent to the Claude API to write the answer.",
    },
    sources: "The numbers at the end of each answer are its sources. When something isn’t in the documents, it says so and points you to the contact details. There is a daily limit on questions.",
    made: "The window above runs the kit’s own window and server component on this site’s documents. On your site, the same component answers from your documents.",
    sales: {
      proof: [
        { figure: "364", label: "Automated tests. Every release passes all of them before it ships (1.0.2)." },
        { figure: "¥0", label: "Monthly service fee. You only pay Claude API usage (from about ¥4,600 a month at 100 questions a day, per the guide’s estimate)." },
        { figure: "2 lines", label: "That’s what you paste into your site. Works on WordPress and other non-Next.js sites too." },
        { figure: "14 days", label: "After purchase, we handle bug reports by email." },
      ],
      audience: {
        fits: [
          "Are an agency or freelancer who wants to deliver a documents-only help desk to clients (modified versions may be delivered, to any number of clients)",
          "Can work with Next.js or Vercel and want a help desk on your own site",
          "Prefer paying only for API usage rather than a monthly subscription",
          "Would rather not install it yourself (setup can be done for you; see Price below)",
        ],
        notFor: [
          "Want to build the window from an admin screen without any server (the subscription services compared below suit you better)",
          "Need long-term conversation memory, user sign-up, payments, or voice (not included)",
          "Want it to read Word or PDF files as they are (documents are prepared as Markdown or as URLs of public pages)",
          "Cannot register a credit card (creating a Claude API key requires one)",
        ],
      },
      compare: {
        rows: [
          {
            kind: "Free tool",
            name: "Tidio free plan",
            href: SOURCES.tidio,
            cost: "¥0",
            note: "Puts a chat window on your site for free. AI replies are limited to your first 50 conversations (one-time).",
          },
          {
            kind: "Built-in feature",
            name: "Gemini Gems",
            href: SOURCES.gem,
            cost: "From ¥0 (with a Google account)",
            note: "Lets you build an AI that reads your own files. Sharing is by email address or link, and the other person signs in to Gemini to use it.",
          },
          {
            kind: "Similar service",
            name: "Chatbase",
            href: SOURCES.chatbase,
            cost: "No free plan. Hobby from $32/month billed yearly",
            note: "A subscription service that puts a document-trained chat window on your site.",
          },
        ],
        kit: "Answers only from your documents and links the source pages. Anything not covered goes to your contact form. No monthly fee beyond API usage, and the code stays with you.",
        checkedOn: CHECKED_ON,
      },
      steps: [
        {
          heading: "Creating a Claude API key and registering a card",
          intro: "Answers are written by Anthropic’s Claude. You create the API key yourself, and usage is billed to your own Anthropic account. Proceed in this order.",
          items: [
            "Open the Claude Console (platform.claude.com, formerly the Anthropic Console) and create an account.",
            "On the Billing page, register a credit card and buy credits to cover usage.",
            "Still on Billing, under Spend limits, press “Set limit” and choose the most you are willing to spend per month. Once it is reached, answers stop for that month.",
            "On the API keys page, press “Create key” and name it. The key (starting with sk-ant-) is shown only once, so copy it right away.",
            "In your Vercel project, open Settings → Environment Variables, add the key as ANTHROPIC_API_KEY, and redeploy.",
          ],
          after: "The key lives only in server environment variables and never appears in the window. For 100 questions a day over 30 days, the estimate is about ¥4,600–9,300 a month with claude-sonnet-5 and about ¥12,000–23,000 with claude-opus-5 (at ¥150 to the dollar; see “Cost estimates” in the guide).",
        },
        {
          heading: "When the window doesn’t answer after setup",
          intro: "The message in the window tells you what to fix. These are the most common cases from the guide’s troubleshooting table.",
          items: [
            "The window appears but no answer comes back: check that ANTHROPIC_API_KEY is set on the server, then redeploy.",
            "A message says use from this page is not accepted: add the URL of the site where you pasted the window to ALLOWED_ORIGINS.",
            "A message says data/index.json was not found: run npx ai-concierge index and commit the generated file.",
            "Almost every answer says it isn’t in the documents: check the unanswered list at /admin and add text to your documents in your customers’ own words.",
          ],
          after: "To use it on WordPress or another non-Next.js site, run the answering server separately (for example, the included template deployed to Vercel), add that site’s URL to ALLOWED_ORIGINS, then paste the two lines.",
        },
      ],
    },
  },
  fr: {
    meta: {
      title: "Un assistant IA pour votre site qui ne répond qu’à partir de vos documents | Sources citées, sans abonnement (Kit d’assistant IA)",
      description: "Chargez votre présentation, vos tarifs et votre FAQ : il répond aux visiteurs de votre site avec un lien vers les pages sources. Ce qui ne figure pas dans vos documents est renvoyé vers votre formulaire de contact, sans supposition. Achat unique, sans abonnement (Next.js, API Claude). Essayez la version réelle sur cette page.",
    },
    name: "Kit d’assistant IA",
    title: "Un assistant IA qui ne répond qu’à partir de vos documents",
    lede: "Chargez votre présentation, vos tarifs et votre FAQ : il répond poliment aux visiteurs de votre site, avec un lien vers les pages utilisées. Quand vos documents ne couvrent pas la question, il le dit et renvoie vers votre formulaire de contact au lieu de deviner.",
    demo: {
      label: "Démo en direct",
      text: "Il lit les informations de ce site et répond pour de vrai. Les questions sont envoyées à l’API Claude pour rédiger la réponse.",
    },
    sources: "Les numéros en fin de réponse renvoient aux sources. Si l’information n’est pas dans les documents, il le dit et vous oriente vers le contact. Le nombre de questions par jour est limité.",
    made: "La fenêtre ci-dessus fait tourner la fenêtre et le composant serveur du kit sur les documents de ce site. Chez vous, le même composant répond à partir de vos documents.",
    sales: {
      proof: [
        { figure: "364", label: "Tests automatisés. Chaque version les passe tous avant d’être livrée (1.0.2)." },
        { figure: "0 ¥", label: "Abonnement mensuel. Vous ne payez que l’usage de l’API Claude (à partir d’environ 4 600 ¥ par mois pour 100 questions par jour, selon le guide)." },
        { figure: "2 lignes", label: "C’est tout ce que vous collez dans votre site. Fonctionne aussi sur WordPress et d’autres sites hors Next.js." },
        { figure: "14 jours", label: "Après l’achat, nous traitons les signalements de bugs par e-mail." },
      ],
      audience: {
        fits: [
          "Êtes une agence ou un indépendant qui veut livrer à ses clients un assistant fondé sur leurs seuls documents (livraison d’une version modifiée permise, sans limite de clients)",
          "Savez utiliser Next.js ou Vercel et voulez un assistant sur votre propre site",
          "Préférez payer l’usage de l’API plutôt qu’un abonnement",
          "Préférez ne pas l’installer vous-même (l’installation peut être faite pour vous ; voir Prix ci-dessous)",
        ],
        notFor: [
          "Voulez créer la fenêtre depuis une interface, sans aucun serveur (les services par abonnement comparés ci-dessous vous conviendront mieux)",
          "Avez besoin d’une mémoire longue des conversations, d’inscriptions, de paiements ou de la voix (non inclus)",
          "Voulez lui faire lire des fichiers Word ou PDF tels quels (les documents se préparent en Markdown ou via l’URL de pages publiques)",
          "Ne pouvez pas enregistrer de carte bancaire (la création d’une clé d’API Claude en demande une)",
        ],
      },
      compare: {
        rows: [
          {
            kind: "Outil gratuit",
            name: "Offre gratuite de Tidio",
            href: SOURCES.tidio,
            cost: "0 ¥",
            note: "Installe gratuitement une fenêtre de discussion. Les réponses de l’IA sont limitées à vos 50 premières conversations (une seule fois).",
          },
          {
            kind: "Fonction intégrée",
            name: "Gems de Gemini",
            href: SOURCES.gem,
            cost: "À partir de 0 ¥ (avec un compte Google)",
            note: "Permet de créer une IA qui lit vos fichiers. Le partage se fait par adresse e-mail ou par lien, et la personne doit se connecter à Gemini pour l’utiliser.",
          },
          {
            kind: "Service similaire",
            name: "Chatbase",
            href: SOURCES.chatbase,
            cost: "Pas d’offre gratuite. Hobby à partir de 32 $/mois en annuel",
            note: "Un service par abonnement qui installe sur votre site une fenêtre entraînée sur vos documents.",
          },
        ],
        kit: "Répond uniquement à partir de vos documents, avec un lien vers les pages sources. Le reste est renvoyé vers votre contact. Pas d’abonnement au-delà de l’usage de l’API, et le code reste chez vous.",
        checkedOn: CHECKED_ON,
      },
      steps: [
        {
          heading: "Créer une clé d’API Claude et enregistrer une carte",
          intro: "Les réponses sont rédigées par Claude, d’Anthropic. Vous créez vous-même la clé d’API, et l’usage est facturé sur votre propre compte Anthropic. Procédez dans cet ordre.",
          items: [
            "Ouvrez la Claude Console (platform.claude.com, anciennement Anthropic Console) et créez un compte.",
            "Sur la page Billing, enregistrez une carte bancaire et achetez des crédits pour couvrir l’usage.",
            "Toujours sur Billing, dans Spend limits, cliquez sur « Set limit » et fixez le montant maximal par mois. Une fois atteint, les réponses s’arrêtent pour le mois.",
            "Sur la page API keys, cliquez sur « Create key » et nommez-la. La clé (commençant par sk-ant-) ne s’affiche qu’une fois : copiez-la tout de suite.",
            "Dans votre projet Vercel, ouvrez Settings → Environment Variables, ajoutez la clé sous le nom ANTHROPIC_API_KEY, puis redéployez.",
          ],
          after: "La clé reste dans les variables d’environnement du serveur et n’apparaît jamais dans la fenêtre. Pour 100 questions par jour pendant 30 jours, l’estimation est d’environ 4 600 à 9 300 ¥ par mois avec claude-sonnet-5 et 12 000 à 23 000 ¥ avec claude-opus-5 (à 150 ¥ le dollar ; voir « Estimation des coûts » dans le guide).",
        },
        {
          heading: "Quand la fenêtre ne répond pas après l’installation",
          intro: "Le message affiché dans la fenêtre indique quoi corriger. Voici les cas les plus fréquents du tableau de dépannage du guide.",
          items: [
            "La fenêtre s’affiche mais aucune réponse n’arrive : vérifiez que ANTHROPIC_API_KEY est défini sur le serveur, puis redéployez.",
            "Un message indique que l’usage depuis cette page n’est pas accepté : ajoutez l’URL du site où vous avez collé la fenêtre à ALLOWED_ORIGINS.",
            "Un message indique que data/index.json est introuvable : lancez npx ai-concierge index et versionnez le fichier créé.",
            "Presque toutes les réponses disent que ce n’est pas dans les documents : consultez la liste des questions sans réponse sur /admin et complétez vos documents avec les mots de vos clients.",
          ],
          after: "Pour l’utiliser sur WordPress ou un autre site hors Next.js, faites tourner le serveur de réponses à part (par exemple le modèle fourni, déployé sur Vercel), ajoutez l’URL de ce site à ALLOWED_ORIGINS, puis collez les deux lignes.",
        },
      ],
    },
  },
};
