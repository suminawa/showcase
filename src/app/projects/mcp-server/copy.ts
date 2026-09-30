/** 文中の `…` は等幅の字になる（shell.tsx の Rich） */
const ja = {
  meta: {
    title: "MCP サーバー キット",
    description: "業務アプリ・予約ページ・書類読み取りのスプレッドシートを、Claude や ChatGPT との会話から探したり登録したりできるようにする MCP サーバーのキット。記録したやり取りを再生する見本。",
  },
  title: "MCP サーバー キット",
  lede: "お使いのスプレッドシートの顧客・予約・書類を、Claude や ChatGPT との会話から探したり、登録したりできるようにします",
  replayHeading: "会話の再生",
  replay: "記録したやり取りを再生しています。データはすべて架空です。キットを見本のデータで動かし、AI のアプリと同じつなぎ方（stdio）で呼んだツールと、返った結果をそのまま載せています。答えの文は、結果をもとに書いた例です。",
  howHeading: "仕組み",
  how: [
    "AI はスプレッドシートを直接は開きません。このサーバーが用意した「探す」「読む」「登録する」などのツールを呼び、サーバーが Google の Sheets API で読み書きします。Google の鍵も AI の契約もお客さまのもので、データをスプレッドシートの外に置くことはありません。サーバーの月額もかかりません。",
    "書くツールは、設定で `MCP_WRITE=true` にしたときだけ AI に見えます。既定は読むだけです。書くときも 1 回に 1 行で、Claude Desktop などの AI のアプリは、実行の前に「許可しますか」と確かめます。",
  ],
  setupHeading: "使い始めるまで",
  steps: [
    {
      title: "見本のデータで試す",
      text: "Claude Desktop の設定に 1 行足すだけで、Google の準備をする前に、この見本と同じデータで動きを確かめられます（`MCP_DEMO=1`）。",
    },
    {
      title: "Google の準備（15 分ほど）",
      text: "サービス アカウントを作ってスプレッドシートを共有し、`.env` にスプレッドシートの ID を書きます。`npm run check` で、つながり方と見出しの形を確かめられます。",
    },
    {
      title: "AI のアプリにつなぐ",
      text: "Claude Desktop・Claude Code・Cursor はお手元のパソコンでそのまま。ChatGPT と claude.ai のコネクタには、HTTP の入口を Cloudflare Tunnel で外に出してつなぎます。HTTP の入口は、合い言葉なしでは受け付けません。",
    },
  ],
  notHeading: "しないこと",
  not: [
    "行は消しません。消す代わりに、状況や状態の列を更新します。",
    "予約の新規作成と、空き枠の案内はしません（見るのとキャンセルだけです）。",
    "AI からの変更では、キット側の通知・メール・Google カレンダーは動きません。予約をキャンセルにしたときは、お客さまへのご連絡と予定の削除を別に行ってください。",
    "LINE のユーザー ID・更新した人のメールアドレス・予約のキャンセル用の鍵は、AI に渡しません。",
    "書き込みは 1 分に 20 回までで、それを超える呼び出しは止めます。",
  ],
  buyHeading: "受け取りと導入代行",
  buy: "MCP サーバー キットは、無料の見本としてお配りしています。TypeScript のソース・ビルド済みのファイル・説明書・設定の見本を zip 1 本でお渡しします。業務アプリ・予約ページ・書類読み取りのキットと組むと、画面と会話の両方から同じ台帳を使えます。",
  service: "サービス アカウントの準備から、Claude Desktop や ChatGPT へのつなぎ込み、Cloudflare の名前つきトンネルの設定までを、こちらで行うこともできます。 ──",
  contact: "制作のご相談",
};

export const copy: Record<"ja" | "en" | "fr", typeof ja> = {
  ja,
  en: {
    meta: {
      title: "MCP Server Kit",
      description: "An MCP server kit that lets you search and add records in your business app, booking page, and document reader spreadsheets from a conversation with Claude or ChatGPT. The demo replays a recorded session.",
    },
    title: "MCP Server Kit",
    lede: "Search and add customers, bookings, and documents in your spreadsheets from a conversation with Claude or ChatGPT",
    replayHeading: "Conversation replay",
    replay: "This replays a recorded session, in Japanese; all data is fictional. The kit ran on sample data; the tools it called over stdio (the same connection AI apps use) and the results they returned are shown exactly as they were. The answer text is an example written from those results.",
    howHeading: "How it works",
    how: [
      "The AI never opens the spreadsheet directly. It calls tools this server provides, such as search, read, and add, and the server reads and writes through Google’s Sheets API. The Google credentials and the AI subscription are yours, and your data never leaves the spreadsheet. No monthly server fees either.",
      "Write tools are visible to the AI only when you set `MCP_WRITE=true`. By default it’s read-only. Writes happen one row at a time, and AI apps such as Claude Desktop ask for your permission before each one runs.",
    ],
    setupHeading: "Getting started",
    steps: [
      {
        title: "Try it with sample data",
        text: "Add one line to your Claude Desktop settings to try it with the same data as this demo, before setting anything up on Google (`MCP_DEMO=1`).",
      },
      {
        title: "Google setup (about 15 minutes)",
        text: "Create a service account, share the spreadsheet with it, and put the spreadsheet ID in `.env`. `npm run check` verifies the connection and the header layout.",
      },
      {
        title: "Connect your AI app",
        text: "Claude Desktop, Claude Code, and Cursor work directly on your computer. For ChatGPT and claude.ai connectors, expose the HTTP endpoint through Cloudflare Tunnel. The HTTP endpoint refuses requests without a shared secret.",
      },
    ],
    notHeading: "What it doesn’t do",
    not: [
      "It never deletes rows. Instead, it updates a status column.",
      "It doesn’t create bookings or suggest open slots (it can only view and cancel).",
      "Changes made through the AI don’t trigger the kits’ notifications, emails, or Google Calendar updates. When you cancel a booking this way, contact the customer and remove the calendar event separately.",
      "LINE user IDs, the email address of whoever made an update, and booking cancellation keys are never passed to the AI.",
      "Writes are capped at 20 per minute; calls beyond that are blocked.",
    ],
    buyHeading: "Download and setup service",
    buy: "The MCP Server Kit is offered as a free sample: TypeScript source, built files, a guide, and sample settings in a single zip, available on BOOTH or note (in Japanese). Combined with the business app, booking page, and document reader kits, the same ledger works from both the screens and the conversation.",
    service: "Setup can also be done for you, from preparing the service account to connecting Claude Desktop or ChatGPT and configuring a named Cloudflare tunnel. —",
    contact: "Project inquiries",
  },
  fr: {
    meta: {
      title: "Kit de serveur MCP",
      description: "Un kit de serveur MCP pour rechercher et ajouter des lignes dans les tableurs de l’application métier, de la page de réservation et de la lecture de documents, depuis une conversation avec Claude ou ChatGPT. La démo rejoue un échange enregistré.",
    },
    title: "Kit de serveur MCP",
    lede: "Recherchez et ajoutez clients, réservations et documents dans vos tableurs depuis une conversation avec Claude ou ChatGPT",
    replayHeading: "Rejeu de la conversation",
    replay: "Voici le rejeu d’un échange enregistré, en japonais ; toutes les données sont fictives. Le kit a tourné sur des données d’exemple, et les outils appelés via la même connexion que les applications IA (stdio), ainsi que leurs résultats, sont affichés tels quels. Le texte des réponses est un exemple rédigé à partir de ces résultats.",
    howHeading: "Fonctionnement",
    how: [
      "L’IA n’ouvre jamais le tableur directement. Elle appelle les outils fournis par ce serveur (rechercher, lire, ajouter…), et le serveur lit et écrit via l’API Google Sheets. Les identifiants Google et l’abonnement IA sont les vôtres, et vos données ne quittent jamais le tableur. Pas de frais de serveur mensuels non plus.",
      "Les outils d’écriture ne sont visibles par l’IA que si vous réglez `MCP_WRITE=true`. Par défaut, tout est en lecture seule. L’écriture se fait une ligne à la fois, et les applications IA comme Claude Desktop demandent votre autorisation avant chaque exécution.",
    ],
    setupHeading: "Pour commencer",
    steps: [
      {
        title: "Essayer avec les données d’exemple",
        text: "Ajoutez une ligne aux réglages de Claude Desktop pour l’essayer avec les mêmes données que cette démo, avant toute préparation côté Google (`MCP_DEMO=1`).",
      },
      {
        title: "Configuration côté Google (environ 15 minutes)",
        text: "Créez un compte de service, partagez le tableur avec lui et indiquez l’identifiant du tableur dans `.env`. `npm run check` vérifie la connexion et la disposition des en-têtes.",
      },
      {
        title: "Connecter votre application IA",
        text: "Claude Desktop, Claude Code et Cursor fonctionnent directement sur votre ordinateur. Pour les connecteurs ChatGPT et claude.ai, exposez le point d’accès HTTP via Cloudflare Tunnel. Ce point d’accès refuse toute requête sans secret partagé.",
      },
    ],
    notHeading: "Ce qu’il ne fait pas",
    not: [
      "Il ne supprime jamais de ligne ; il met à jour une colonne de statut à la place.",
      "Il ne crée pas de réservation et ne propose pas de créneaux libres (il peut seulement consulter et annuler).",
      "Les modifications faites via l’IA ne déclenchent ni les notifications, ni les e-mails, ni la mise à jour de Google Agenda prévus par les kits. Si vous annulez une réservation ainsi, prévenez le client et supprimez vous-même l’événement de l’agenda.",
      "Les identifiants utilisateur LINE, l’adresse e-mail de l’auteur d’une modification et les clés d’annulation des réservations ne sont jamais transmis à l’IA.",
      "Les écritures sont limitées à 20 par minute ; au-delà, les appels sont bloqués.",
    ],
    buyHeading: "Téléchargement et installation",
    buy: "Le Kit de serveur MCP est proposé gratuitement, à titre d’exemple : sources TypeScript, fichiers compilés, guide et réglages d’exemple dans un seul zip, disponible sur BOOTH ou note (en japonais). Associé aux kits d’application métier, de réservation et de lecture de documents, le même registre s’utilise depuis les écrans comme depuis la conversation.",
    service: "L’installation peut aussi être faite pour vous : de la préparation du compte de service à la connexion à Claude Desktop ou ChatGPT et à la configuration d’un tunnel Cloudflare nommé. —",
    contact: "Confier un projet",
  },
};
