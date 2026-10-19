import type { KitSales } from "../kit-parts";
import type { KitCopy } from "../kit-sheet";

const SOURCES = {
  dify: "https://dify.ai/pricing",
  lineAi: "https://www.lycbiz.com/jp/column/line-official-account/service-information/ai-chatbot/",
  coconala: "https://coconala.com/services/2765644",
};

/** 比べる相手のページを読んだ日 */
const CHECKED_ON = "2026-10-20";

const jaSales: KitSales = {
  proof: [
    { figure: "134 件", label: "自動テストの数です。版を出すたびに、すべて通してからお届けしています（1.0.1）。" },
    { figure: "0 円", label: "LINE 側の費用です。返信は月の無料通数を使わないので、LINE 公式アカウントは無料プランのままで動きます。" },
    { figure: "24 時間", label: "担当者に引き継いだあと、AI が返事を止める時間です（設定で変えられます）。" },
    { figure: "14 日", label: "ご購入から、不具合のご連絡にメールで対応する期間です。" },
  ],
  audience: {
    fits: [
      "お客さまの LINE 公式アカウントに、資料だけで答える窓口を納めたい制作会社・フリーランスの方（改変して納品でき、納品先の数に制限はありません）",
      "LINE で届く料金・対応エリア・流れなどのご質問に、営業時間の外でも先に答えておきたい会社・お店の方",
      "Vercel か、公開 URL のある Node のサーバーを用意できる方",
      "ご自身で置くのが難しい方（設置までお任せいただけます。下の「お値段」をご覧ください）",
    ],
    notFor: [
      "予約の空きや在庫など、日々変わる数を答えさせたい方（文書に書いたことだけを答えます）",
      "症状の判断など、人が見るべきご相談まで AI に答えさせたい方（資料に無いことは担当者へ回します）",
      "登録した Q&A から選んで返すだけで足りる方（下の比較の LINE 公式の機能が向いています）",
      "クレジットカードを登録できない方（Claude API の鍵を作るには、カードの登録が要ります）",
    ],
  },
  compare: {
    rows: [
      {
        kind: "無料の道具",
        name: "Dify（Sandbox・自前のサーバー）",
        href: SOURCES.dify,
        cost: "0 円（Sandbox はメッセージ 200 回分まで）",
        note: "資料を読ませた AI の応答を、画面の上で組み立てられます。LINE につなぐ部分と、その後の保守はご自身で行います。",
      },
      {
        kind: "標準の機能",
        name: "LINE 公式アカウントの AI チャットボット（β）",
        href: SOURCES.lineAi,
        cost: "チャット Pro オプション 月 3,000 円（税別）",
        note: "登録した Q&A の中から合う答えを選んで返します。業種によっては使えません。",
      },
      {
        kind: "似たサービス",
        name: "ココナラの LINE Bot の構築（出品の一例）",
        href: SOURCES.coconala,
        cost: "35,000 円から（会話の記憶は追加の料金）",
        note: "出品者が組み立てて納めます。AI の API キーはお客さまのものを使います。",
      },
    ],
    kit: "自社の資料だけで答え、根拠の URL を添えます。資料に無いことは担当者へ引き継ぎ、そのあいだ AI は黙ります。月額は 0 円で、プログラムはお手元に残ります。",
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
      after: "医院・お店のカードで登録するときは、誰が鍵を控え、誰が上限を決めるかを先にお決めください。鍵はサーバーの環境変数にだけ置き、LINE のトークや記録には出ません。",
    },
    {
      heading: "LINE につないだあと、返事が来ないとき",
      intro: "手順書の「よくあるつまずき」から、多いものを並べました。LINE の管理画面の言葉のままです。",
      items: [
        "「検証」が失敗する: 環境変数 LINE_CHANNEL_SECRET が正しいかを確かめます。デプロイのあとに環境変数を足したときは、デプロイし直します。",
        "返信が来ない: LINE Official Account Manager の「設定」→「応答設定」で、「応答メッセージ」がオフ、「Webhook」がオンになっているかを確かめます。",
        "あいさつが 2 回届く: 同じ「応答設定」の「あいさつメッセージ」をオフにします（あいさつはキットが送ります）。",
        "担当者が返信できない: 同じ「応答設定」の「チャット」をオンにします。「Webhook」と「チャット」は両方オンにできます。",
        "「いまはお答えできません」ばかり: ANTHROPIC_API_KEY が入っているか、line-concierge check で確かめます。",
      ],
      after: "line-concierge check は、鍵・トークン・設定ファイル・索引がそろっているか、指定のモデルがいまも使えるかを、費用をかけずに確かめます。",
    },
  ],
};

const ja: KitCopy = {
  meta: {
    title: "LINE のよくある質問に、自社の資料だけで AI が答える｜答えられないことは担当者へ・月額なし（LINE 案内窓口キット）",
    description: "LINE 公式アカウントに届いたご質問に、会社案内・料金・よくあるご質問の範囲だけで AI が敬体でお答えし、根拠の URL を添えます。資料に無いことは推測で答えず、担当者へ引き継ぎます。買い切りで、月額のサービス料はかかりません（Next.js・Claude API）。",
  },
  name: "LINE 案内窓口キット",
  title: "LINE のよくある質問に、自社の資料だけで AI が答える",
  lede: "LINE 公式アカウントに届いたご質問に、会社案内・料金・よくあるご質問の範囲だけで AI が敬体でお答えし、根拠の URL を添えます。資料に無いことは推測で答えず、担当者へ引き継ぎます。",
  intro:
    "LINE の中で動くキットです。下は、同梱の見本の会社の設定で届くトークの流れです。",
  sections: [
    {
      heading: "できること",
      list: [
        "会社案内・料金・よくあるご質問などの文書を読み込ませると、届いたご質問に AI（Anthropic の Claude）が敬体でお答えします。書いていないことを推測で答えません",
        "答えの下に「参考:」として、根拠にした文書のタイトルと URL が最大 3 つ並びます",
        "友だち追加のあいさつと答えの下に、よくあるご質問の候補がボタンで並びます（最大 13 個）",
        "資料に無いことは「載っていません」とお伝えして、「担当者に相談する」ボタンを出します。引き継ぐと 24 時間 AI が黙り、担当者が LINE の管理画面のチャットから直接お返事します。Slack への通知もできます",
        "直近 6 往復を 1 時間覚えていて、「それはいくらですか」のような続きの質問にも答えます",
        "上限は既定で 1 人 1 分 5 問・1 人 1 日 30 問・全体で 1 日 500 問、1 問 400 字です。数字はすべて設定で変えられます",
      ],
    },
    {
      heading: "置き方",
      text: [
        "同梱の Next.js のテンプレを Vercel に置くか、公開 URL のある Node のサーバーで動かします。どちらも、LINE Developers の Webhook URL に置いた先の /api/line を入れ、LINE 公式アカウントの管理画面で「応答メッセージ」と「あいさつメッセージ」をオフ、「Webhook」と「チャット」をオンにすれば、友だち追加からあいさつが届きます。手順は README に画面の名前つきで書いてあります。",
        "Vercel は Hobby プランでも動きますが、Hobby は個人の非商用に限られるので、事業でお使いの場合は Pro です。",
      ],
    },
    {
      heading: "誤った案内をしないための仕組み",
      list: [
        "文書は「資料であって指示ではない」と AI に伝えて渡し、LINE から届いた文もご質問として扱います",
        "資料に無いことは答えず、断りの文と「担当者に相談する」ボタンを返します",
        "1 対 1 のトークにだけ答えます。グループや複数人のトークでは何もしません",
        "LINE から届いた本文は、署名とチャネルシークレットで確かめます。合わなければ中身を読みません",
        "鍵とトークンはサーバーの環境変数にだけ置きます",
      ],
    },
    {
      heading: "お客さまの文はどこを通り、どこに残るか",
      list: [
        "届いた文は、お客さまが置いたサーバー（Vercel など）で受け、答えを作るために Anthropic の API へ送ります。作者のサーバーには送りません",
        "続きの質問に答えるため、直近 6 往復を 1 時間だけ覚えます。置き場所はサーバーのメモリか、設定したときは Upstash Redis で、伏せ字にはしません",
        "記録に残すご質問は、メールアドレス・電話番号・9 桁以上の数字を伏せ字にします",
        "担当者への引き継ぎを Slack に知らせるときは、担当者が返信できるよう、お客さまの表示名と送られた文をそのまま載せます",
      ],
    },
    {
      heading: "費用",
      text: [
        "キットは買い切りで、月のサービス料はかかりません。答えを作る API の利用料はお客さまのご負担で、鍵は Claude Console でご自身で発行したものをお使いいただきます。LINE 公式アカウントは無料で作れ、返信は月の無料通数を使わないので、無料プランのままで運用できます。",
        "文書が 30,000 トークンのとき、1 日 100 件を 30 日続けた場合の目安は、claude-sonnet-5 で月 4,600〜9,300 円ほど、同梱の設定の既定（claude-opus-5）で月 12,000〜23,000 円ほどです（ご質問の間隔のあき方で変わります。1 ドル 150 円で換算）。",
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
    "文書の整理と索引づくり、Vercel への設置、LINE 公式アカウントの設定、引き継ぎ先と質問の候補の作り込みまでを任せたい方は、上の「お値段」の「設置まで頼む」からご相談ください。範囲を伺ってお見積もりします。ココナラ・ランサーズからもご依頼いただけます。",
  sales: jaSales,
};

export const copy: Record<"ja" | "en" | "fr", KitCopy> = {
  ja,
  en: {
    meta: {
      title: "AI that answers common LINE questions from your own documents | Hands off to staff, no monthly fee (LINE Help Desk Kit)",
      description: "AI answers questions sent to your LINE Official Account politely, using only your company profile, prices, and FAQ, and adds the source URL. Anything not in your documents is handed to staff instead of guessed. One-time purchase, no monthly service fee (Next.js, Claude API).",
    },
    name: "LINE Help Desk Kit",
    title: "AI that answers common LINE questions from your own documents",
    lede: "AI answers questions sent to your LINE Official Account politely, within your company profile, prices, and FAQ, and adds the source URL. When the documents don’t cover a question, it doesn’t guess; it hands over to staff.",
    intro:
      "This kit runs inside LINE. Below is how a chat goes with the settings of the included sample company.",
    sections: [
      {
        heading: "What it does",
        list: [
          "Load documents such as your company profile, prices, and FAQ, and AI (Anthropic’s Claude) answers incoming questions politely. It doesn’t guess at things your documents don’t say",
          "Under each answer, up to three sources are listed with the document title and URL",
          "Suggested questions appear as buttons under the welcome message and under each answer (up to 13)",
          "When the documents don’t cover a question, it says so and shows a “talk to staff” button. After a handoff, the AI stays silent for 24 hours and staff reply directly from the LINE chat screen. Slack notifications are available",
          "It remembers the last 6 exchanges for 1 hour, so follow-up questions like “how much is that?” work",
          "Default limits are 5 questions per person per minute, 30 per person per day, 500 per day in total, and 400 characters per question. All of them can be changed in the settings",
        ],
      },
      {
        heading: "How to set it up",
        text: [
          "Deploy the included Next.js template to Vercel, or run it on a Node server with a public URL. Either way, enter /api/line on your deployment as the webhook URL in LINE Developers, and in the LINE Official Account manager turn off the automatic response and greeting messages and turn on Webhook and Chat; new friends then receive the greeting. The README walks through it with the names of each screen.",
          "Vercel’s Hobby plan works, but it is limited to personal, non-commercial use, so business use needs Pro.",
        ],
      },
      {
        heading: "How it avoids giving wrong information",
        list: [
          "Documents are passed to the AI as reference material, not instructions, and messages from LINE are treated as questions",
          "Anything not in the documents gets a refusal and a “talk to staff” button instead of an answer",
          "It only answers one-on-one chats and does nothing in groups or multi-person chats",
          "Messages from LINE are verified with the signature and channel secret. If they don’t match, the content isn’t read",
          "Keys and tokens live only in server environment variables",
        ],
      },
      {
        heading: "Where your customers’ messages go and stay",
        list: [
          "Messages are received by the server you deploy (Vercel or similar) and sent to the Anthropic API to write the answer. Nothing is sent to the author’s servers",
          "To answer follow-ups, the last 6 exchanges are kept for 1 hour, in server memory or, if configured, Upstash Redis, without masking",
          "Logged questions have email addresses, phone numbers, and numbers of 9 digits or more masked",
          "Slack handoff notifications include the customer’s display name and message as is, so staff can reply",
        ],
      },
      {
        heading: "Costs",
        text: [
          "The kit is a one-time purchase with no monthly service fee. API usage fees for generating answers are paid by you, with a key you issue yourself in the Claude Console. A LINE Official Account is free, and replies don’t count against the monthly free message quota, so the free plan is enough.",
          "With 30,000 tokens of documents and 100 questions a day for 30 days, the estimate is about ¥4,600–9,300 a month with claude-sonnet-5 and about ¥12,000–23,000 with the included settings’ default (claude-opus-5), depending on the gaps between questions; converted at ¥150 to the dollar.",
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
      "If you’d like document preparation and indexing, Vercel setup, LINE Official Account settings, and tuning of the handoff and suggested questions done for you, use “Setup done for you” under Price above; we quote after hearing the scope. Requests through Coconala and Lancers (in Japanese) are also welcome.",
    sales: {
      proof: [
        { figure: "134", label: "Automated tests. Every release passes all of them before it ships (1.0.1)." },
        { figure: "¥0", label: "Cost on the LINE side. Replies don’t use the monthly free message quota, so the free plan is enough." },
        { figure: "24 hours", label: "How long the AI stays silent after a handoff to staff (configurable)." },
        { figure: "14 days", label: "After purchase, we handle bug reports by email." },
      ],
      audience: {
        fits: [
          "Are an agency or freelancer who wants to deliver a documents-only help desk to clients’ LINE Official Accounts (modified versions may be delivered, to any number of clients)",
          "Run a business that gets questions about prices, service area, or process on LINE and want them answered even outside business hours",
          "Can prepare Vercel or a Node server with a public URL",
          "Would rather not install it yourself (setup can be done for you; see Price below)",
        ],
        notFor: [
          "Want it to answer figures that change daily, such as open booking slots or stock (it only answers what your documents say)",
          "Want the AI to handle consultations a person should review, such as judging symptoms (anything not in the documents goes to staff)",
          "Only need replies chosen from registered Q&A (LINE’s own feature compared below suits you better)",
          "Cannot register a credit card (creating a Claude API key requires one)",
        ],
      },
      compare: {
        rows: [
          {
            kind: "Free tool",
            name: "Dify (Sandbox or self-hosted)",
            href: SOURCES.dify,
            cost: "¥0 (Sandbox includes 200 message credits)",
            note: "Lets you assemble a document-based AI responder on screen. Connecting it to LINE and maintaining it are up to you.",
          },
          {
            kind: "Built-in feature",
            name: "LINE Official Account AI chatbot (beta)",
            href: SOURCES.lineAi,
            cost: "Chat Pro option, ¥3,000/month (excl. tax)",
            note: "Picks a matching answer from the Q&A you registered. Not available for some industries.",
          },
          {
            kind: "Similar service",
            name: "A LINE bot build listed on Coconala (one example)",
            href: SOURCES.coconala,
            cost: "From ¥35,000 (conversation memory costs extra)",
            note: "The seller builds and delivers it. It uses your own AI API key.",
          },
        ],
        kit: "Answers only from your documents and adds the source URL. Anything not covered is handed to staff, and the AI stays silent meanwhile. No monthly fee, and the code stays with you.",
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
          after: "If you register a company or clinic card, decide beforehand who keeps the key and who sets the limit. The key lives only in server environment variables and never appears in LINE chats or logs.",
        },
        {
          heading: "When no reply comes after connecting LINE",
          intro: "These are the most common cases from the guide’s troubleshooting table, using the names of the LINE screens.",
          items: [
            "“Verify” fails: check that LINE_CHANNEL_SECRET is correct. If you added environment variables after deploying, redeploy.",
            "No reply arrives: in LINE Official Account Manager, under Settings → Response settings, check that auto-response messages are off and Webhook is on.",
            "The greeting arrives twice: in the same Response settings, turn off the greeting message (the kit sends the greeting).",
            "Staff can’t reply: in the same Response settings, turn on Chat. Webhook and Chat can both be on.",
            "Every reply says it can’t answer right now: check that ANTHROPIC_API_KEY is set by running line-concierge check.",
          ],
          after: "line-concierge check verifies, at no cost, that the key, token, settings file, and index are in place and that the configured model is still available.",
        },
      ],
    },
  },
  fr: {
    meta: {
      title: "L’IA répond aux questions fréquentes sur LINE à partir de vos documents | Transfert à l’équipe, sans abonnement (Kit d’assistant LINE)",
      description: "L’IA répond poliment aux questions reçues sur votre compte officiel LINE, dans le cadre de votre présentation, de vos tarifs et de votre FAQ, et ajoute l’URL de la source. Ce qui ne figure pas dans vos documents est transmis à l’équipe, sans supposition. Achat unique, sans abonnement (Next.js, API Claude).",
    },
    name: "Kit d’assistant LINE",
    title: "L’IA répond aux questions LINE à partir de vos documents",
    lede: "L’IA répond poliment aux questions reçues sur votre compte officiel LINE, dans le cadre de votre présentation, de vos tarifs et de votre FAQ, et ajoute l’URL de la source. Quand vos documents ne couvrent pas la question, elle ne devine pas : elle passe la main à l’équipe.",
    intro:
      "Ce kit fonctionne dans LINE. Ci-dessous, le déroulement d’une discussion avec les réglages de l’entreprise d’exemple fournie.",
    sections: [
      {
        heading: "Ce qu’il fait",
        list: [
          "Chargez vos documents (présentation, tarifs, FAQ…) et l’IA (Claude, d’Anthropic) répond poliment aux questions reçues. Elle ne devine pas ce que vos documents ne disent pas",
          "Sous chaque réponse, jusqu’à trois sources sont listées avec le titre et l’URL du document",
          "Des questions suggérées s’affichent en boutons sous le message d’accueil et sous chaque réponse (jusqu’à 13)",
          "Quand les documents ne couvrent pas la question, elle le dit et affiche un bouton pour parler à un membre de l’équipe. Après le transfert, l’IA se tait pendant 24 heures et l’équipe répond directement depuis l’écran de discussion LINE. Une notification Slack est possible",
          "Elle garde en mémoire les 6 derniers échanges pendant 1 heure, pour suivre les questions de relance comme « combien ça coûte ? »",
          "Limites par défaut : 5 questions par personne et par minute, 30 par personne et par jour, 500 par jour au total et 400 caractères par question. Toutes se règlent",
        ],
      },
      {
        heading: "Installation",
        text: [
          "Déployez le modèle Next.js fourni sur Vercel, ou lancez-le sur un serveur Node avec une URL publique. Dans les deux cas, indiquez /api/line de votre déploiement comme URL de webhook dans LINE Developers, puis, dans le gestionnaire du compte officiel LINE, désactivez les réponses automatiques et le message d’accueil et activez Webhook et Discussion ; les nouveaux amis reçoivent alors l’accueil. Le README détaille chaque écran.",
          "Le plan Hobby de Vercel fonctionne, mais il est réservé à un usage personnel non commercial : pour une entreprise, il faut Pro.",
        ],
      },
      {
        heading: "Comment il évite les mauvaises informations",
        list: [
          "Les documents sont transmis à l’IA comme références, non comme instructions, et les messages LINE sont traités comme des questions",
          "Ce qui n’est pas dans les documents reçoit un refus et un bouton vers l’équipe, pas une réponse",
          "Elle ne répond qu’aux discussions individuelles, rien dans les groupes",
          "Les messages venant de LINE sont vérifiés avec la signature et le secret du canal. S’ils ne correspondent pas, le contenu n’est pas lu",
          "Les clés et jetons restent uniquement dans les variables d’environnement du serveur",
        ],
      },
      {
        heading: "Où passent et restent les messages de vos clients",
        list: [
          "Les messages sont reçus par le serveur que vous déployez (Vercel ou autre) et envoyés à l’API d’Anthropic pour rédiger la réponse. Rien n’est envoyé aux serveurs de l’auteur",
          "Pour suivre les relances, les 6 derniers échanges sont gardés 1 heure, en mémoire du serveur ou, si configuré, dans Upstash Redis, sans masquage",
          "Dans les questions journalisées, les e-mails, numéros de téléphone et nombres de 9 chiffres ou plus sont masqués",
          "Les notifications Slack de transfert reprennent tels quels le nom affiché et le message du client, pour que l’équipe puisse répondre",
        ],
      },
      {
        heading: "Coûts",
        text: [
          "Le kit est un achat unique, sans abonnement. Les frais d’API pour générer les réponses sont à votre charge, avec une clé que vous créez dans la Claude Console. Un compte officiel LINE est gratuit et les réponses ne comptent pas dans le quota mensuel de messages gratuits : le plan gratuit suffit.",
          "Avec 30 000 jetons de documents et 100 questions par jour pendant 30 jours, l’estimation est d’environ 4 600 à 9 300 ¥ par mois avec claude-sonnet-5 et d’environ 12 000 à 23 000 ¥ avec le modèle par défaut des réglages fournis (claude-opus-5), selon l’espacement des questions ; conversion à 150 ¥ le dollar.",
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
      "Pour confier la préparation des documents et l’index, l’installation sur Vercel, les réglages du compte officiel LINE et l’ajustement du transfert et des questions suggérées, utilisez « Installation comprise » dans la section Prix ci-dessus ; nous établissons un devis selon le périmètre. Les demandes via Coconala et Lancers (en japonais) sont aussi possibles.",
    sales: {
      proof: [
        { figure: "134", label: "Tests automatisés. Chaque version les passe tous avant d’être livrée (1.0.1)." },
        { figure: "0 ¥", label: "Coût côté LINE. Les réponses n’utilisent pas le quota mensuel de messages gratuits : le plan gratuit suffit." },
        { figure: "24 heures", label: "Durée pendant laquelle l’IA se tait après un transfert à l’équipe (réglable)." },
        { figure: "14 jours", label: "Après l’achat, nous traitons les signalements de bugs par e-mail." },
      ],
      audience: {
        fits: [
          "Êtes une agence ou un indépendant qui veut livrer un assistant fondé sur les documents aux comptes officiels LINE de vos clients (livraison d’une version modifiée permise, sans limite de clients)",
          "Recevez sur LINE des questions sur les tarifs, la zone d’intervention ou le déroulement, et voulez y répondre même hors des heures d’ouverture",
          "Pouvez préparer Vercel ou un serveur Node avec une URL publique",
          "Préférez ne pas l’installer vous-même (l’installation peut être faite pour vous ; voir Prix ci-dessous)",
        ],
        notFor: [
          "Voulez qu’elle donne des chiffres qui changent chaque jour, comme les créneaux libres ou le stock (elle ne répond qu’à partir de vos documents)",
          "Voulez confier à l’IA des demandes qu’une personne doit examiner, comme juger des symptômes (ce qui n’est pas dans les documents va à l’équipe)",
          "N’avez besoin que de réponses choisies parmi des questions-réponses enregistrées (la fonction de LINE comparée ci-dessous vous suffit)",
          "Ne pouvez pas enregistrer de carte bancaire (la création d’une clé d’API Claude en demande une)",
        ],
      },
      compare: {
        rows: [
          {
            kind: "Outil gratuit",
            name: "Dify (Sandbox ou auto-hébergé)",
            href: SOURCES.dify,
            cost: "0 ¥ (Sandbox : 200 crédits de messages)",
            note: "Permet d’assembler à l’écran une IA qui répond à partir de documents. La connexion à LINE et la maintenance sont à votre charge.",
          },
          {
            kind: "Fonction intégrée",
            name: "Chatbot IA (bêta) des comptes officiels LINE",
            href: SOURCES.lineAi,
            cost: "Option Chat Pro, 3 000 ¥/mois (HT)",
            note: "Choisit une réponse parmi les questions-réponses que vous avez enregistrées. Indisponible pour certains secteurs.",
          },
          {
            kind: "Service similaire",
            name: "Création d’un bot LINE sur Coconala (un exemple)",
            href: SOURCES.coconala,
            cost: "À partir de 35 000 ¥ (la mémoire des conversations est en supplément)",
            note: "Le vendeur le construit et le livre. Il utilise votre propre clé d’API d’IA.",
          },
        ],
        kit: "Répond uniquement à partir de vos documents et ajoute l’URL de la source. Le reste est transmis à l’équipe, et l’IA se tait pendant ce temps. Sans abonnement, et le code reste chez vous.",
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
          after: "Si vous enregistrez la carte d’une entreprise ou d’un cabinet, décidez d’abord qui conserve la clé et qui fixe la limite. La clé reste dans les variables d’environnement du serveur et n’apparaît jamais dans les discussions LINE ni dans les journaux.",
        },
        {
          heading: "Quand aucune réponse n’arrive après avoir connecté LINE",
          intro: "Voici les cas les plus fréquents du tableau de dépannage du guide, avec les noms des écrans LINE.",
          items: [
            "« Vérifier » échoue : vérifiez LINE_CHANNEL_SECRET. Si vous avez ajouté des variables d’environnement après le déploiement, redéployez.",
            "Aucune réponse n’arrive : dans LINE Official Account Manager, Paramètres → Réglages des réponses, vérifiez que les réponses automatiques sont désactivées et que Webhook est activé.",
            "L’accueil arrive deux fois : dans les mêmes réglages, désactivez le message d’accueil (le kit l’envoie lui-même).",
            "L’équipe ne peut pas répondre : dans les mêmes réglages, activez Discussion. Webhook et Discussion peuvent être activés ensemble.",
            "Toutes les réponses disent qu’elle ne peut pas répondre pour l’instant : vérifiez ANTHROPIC_API_KEY en lançant line-concierge check.",
          ],
          after: "line-concierge check vérifie, sans frais, que la clé, le jeton, le fichier de réglages et l’index sont en place et que le modèle configuré est toujours disponible.",
        },
      ],
    },
  },
};
