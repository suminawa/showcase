import type { KitSales } from "../kit-parts";
import { STEP_IMAGES } from "../step-images";

const SOURCES = {
  driveOcr: "https://support.google.com/drive/answer/176692?hl=ja",
  mfOcr: "https://biz.moneyforward.com/support/account/guide/journal02/ai-ocr01.html",
  invox: "https://invox.jp/",
};

/** 比べる相手のページを読んだ日 */
const CHECKED_ON = "2026-10-20";

const jaSales: KitSales = {
  proof: [
    { figure: "206 件", label: "自動テストの数です。書類の受け取りから、上限・別のサイトからの呼び出しの断りまで通してからお届けしています（1.0.1）。" },
    { figure: "0 枚", label: "サーバーに残す書類の枚数です。書類も読み取った値も保存せず、残る記録は件数と信頼度などだけです。" },
    { figure: "3〜8 円", label: "1 ページの請求書 1 枚を読むときの、API の費用の目安です（claude-opus-5。100 枚で 300〜800 円ほど。手順書の費用の目安より）。" },
    { figure: "14 日", label: "ご購入から、不具合のご連絡にメールでお答えする期間です（3 営業日以内に返信）。" },
  ],
  audience: {
    fits: [
      "請求書・領収書を毎月数十〜数百枚、表や会計ソフトに手で打ち込んでいる会社の方",
      "お客さまの業務に書類の読み取りを組み込んで納品したい制作会社・フリーランス・社内の SE の方（改変して納品できます。Next.js・Vercel・Node に置けます）",
      "書類をクラウドのサービスに預けたくない方（書類も読み取った値もサーバーに保存しません）",
      "ご自身で置くのが難しい方（設置までお任せいただけます。下の「お値段」をご覧ください）",
    ],
    notFor: [
      "読み取りの正確さの保証が要る方（AI の読み取りです。確定の前に人が確かめる前提の道具です）",
      "読む書類が月に数枚の方（下の比較の無料の道具で足ります）",
      "1 つの PDF に何枚もの書類をまとめて読ませたい方（1 ファイルを 1 書類として読みます）",
      "置く場所（Vercel など）を用意できず、設置も頼まない方",
    ],
  },
  compare: {
    rows: [
      {
        kind: "無料の道具",
        name: "Google ドライブの文字の読み取り（Google ドキュメントで開く）",
        href: SOURCES.driveOcr,
        cost: "0 円（Google アカウントで使えます。ファイルは 2 MB 以下が目安）",
        note: "PDF や写真の文字を、Google ドキュメントの文に起こします。請求番号や金額のような項目には分けず、表は崩れることがあります。",
      },
      {
        kind: "標準の機能",
        name: "マネーフォワード クラウド会計「AI-OCR から入力」",
        href: SOURCES.mfOcr,
        cost: "会計の有料プランの機能。添付の件数に応じて上限か従量の課金があります",
        note: "読み取った書類から仕訳を作ります。会計ソフトがマネーフォワードの方は、まずこちらをお試しください。",
      },
      {
        kind: "似たサービス",
        name: "invox 受取請求書（ミニマム）",
        href: SOURCES.invox,
        cost: "月 980 円＋AI の読み取り 1 件 50 円（税別）",
        note: "届いた請求書を読み取り、支払いの業務までまとめて行うサービスです。人の確認つき（1 件 100 円・税別）も選べます。",
      },
    ],
    kit: "PDF や写真から項目を読み、自信の無い項目を「要確認」にし、直して確定した行だけを CSV かスプレッドシートに 1 行で出します。キットの月額はかからず、API の費用は 1 ページの請求書で 1 枚 3〜8 円ほどです（置く先の費用は別です）。",
    checkedOn: CHECKED_ON,
  },
  steps: [
    {
      heading: "Anthropic の API キーの取得とカードの登録",
      image: STEP_IMAGES.apiKey,
      intro: "書類を AI に読ませるための鍵です。費用は、読んだ枚数に応じてご自身の鍵にかかります。Anthropic Console の画面は英語です。",
      items: [
        "Anthropic Console（console.anthropic.com）でアカウントを作り、「Billing」で支払い方法（クレジットカード）を登録します。",
        "「Limits」の「Spend limit」で、月の上限額を決めます。キットの費用の上限は、ここで切るのがいちばん確かです。",
        "「API Keys」でキーを 1 つ作り、コピーします。キーが表示されるのは 1 度だけです。",
        "置く先（Vercel なら、プロジェクトの「Environment Variables」）に、名前 ANTHROPIC_API_KEY、値にコピーしたキーを入れます。",
      ],
      after: "キーは置く先の環境変数にだけ入れ、ファイルに書いて Git に上げないでください。公開の URL に置くと、URL を知った方は誰でも読み取りを使え、その費用はご自身の鍵にかかります。上限額を決めたうえで、URL は社内だけでお使いください。",
    },
    {
      heading: "同梱の Next.js テンプレを Vercel に置くまで",
      intro: "いちばん簡単な置き方です。GitHub と Vercel のアカウントが要ります。ここが難しいと感じる方は、設置をお任せください。",
      items: [
        "zip の中の templates/nextjs のフォルダを Git のリポジトリにして、GitHub に上げます（vendor の tgz と forms も含めてください）。",
        "Vercel で「Import」を押し、そのリポジトリを選びます。",
        "環境変数に ANTHROPIC_API_KEY と、TRUST_PROXY（値は 1）を入れて「Deploy」を押します。",
        "公開の URL を開き、同梱の見本の書類を 1 枚読ませてみます。",
      ],
      after: "全員がすぐ「少し時間をおいて」になるときは、TRUST_PROXY=1 が入っていません。Vercel では 4 MB を超える書類は届く前に断られます。大きな写真は小さく書き出してから読ませてください。",
    },
  ],
};

const ja = {
  meta: {
    title: "請求書・領収書を AI が読み取り、確認してからスプレッドシートへ（AI 書類読み取りキット）",
    description: "請求書・領収書の PDF や写真を AI（Claude）が読み取り、自信の無い項目を「要確認」にして、確かめて確定した行だけを CSV かスプレッドシートに出すキットです。書類はサーバーに残しません。お手元の書類で、このページからその場で試せます。",
  },
  name: "AI 書類読み取りキット",
  title: "請求書・領収書を AI が読み、確認してからスプレッドシートへ",
  lede: "請求書・領収書の PDF や写真を AI（Anthropic の Claude）が読み、自信の無い項目は「要確認」にします。直して確定した行だけを、CSV かスプレッドシートに 1 行で出します。下で、お手元の請求書を 1 枚そのまま読ませられます。",
  privacy: "読み取った結果はこのブラウザの中にだけ残り、サーバーには保存しません。1 日の枚数には上限があります。同梱の見本が読み取れないときは、こちらの不具合です。お手数ですが、下の連絡先からお知らせください。",
  kit: "上の読み取りは「AI 書類読み取りキット」の実物です。書類ごとの読み取り設定（帳票の型）を JSON で書き、確認画面つきの Next.js テンプレを Vercel に置くと、自社の鍵で動きます。キットの確認画面では、黄色の項目を直して確定した行だけを CSV かスプレッドシートに出せます。",
  sales: jaSales,
};

export const copy: Record<"ja" | "en" | "fr", typeof ja> = {
  ja,
  en: {
    meta: {
      title: "AI reads invoices and receipts; you check before they go to a spreadsheet or CSV | One-time purchase, your own API key (AI Document Reader Kit)",
      description: "A kit where AI (Claude) reads PDFs and photos of invoices and receipts, flags uncertain fields for review, and exports only the rows you confirm to CSV or a spreadsheet. Documents are not stored on the server. Try it right now on this page with your own document.",
    },
    name: "AI Document Reader Kit",
    title: "AI reads invoices and receipts; you check before they reach the sheet",
    lede: "AI (Anthropic’s Claude) reads PDFs and photos of invoices and receipts and marks fields it isn’t sure of for review. Only rows you correct and confirm go to CSV or a spreadsheet, one line each. Below, you can have it read one of your own invoices right away.",
    privacy: "Results stay in this browser only and are not stored on the server. The number of pages per day is limited. If a bundled sample can’t be read, that’s a fault on our side; please let us know at the address below.",
    kit: "The reader above is the actual AI Document Reader Kit. Describe your document layouts in JSON, deploy the Next.js template with its review screen to Vercel, and it runs on your own API key. In the kit’s review screen, you fix the highlighted fields and export only confirmed rows to CSV or a spreadsheet.",
    sales: {
      proof: [
        { figure: "206", label: "Automated tests, from receiving a document through limits and rejecting calls from other sites, all passed before each release (1.0.1)." },
        { figure: "0", label: "Documents kept on the server. Neither documents nor extracted values are stored; only counts, confidence, and similar records remain." },
        { figure: "¥3–8", label: "Guide to the API cost of reading one single-page invoice (claude-opus-5; about ¥300–800 for 100; from the cost guide in the manual)." },
        { figure: "14 days", label: "After purchase, we answer bug reports by email (reply within 3 business days)." },
      ],
      audience: {
        fits: [
          "Type dozens to hundreds of invoices and receipts into a sheet or accounting software by hand every month",
          "Are an agency, freelancer, or in-house engineer who wants to build document reading into a client’s workflow (modified versions may be delivered; runs on Next.js, Vercel, or Node)",
          "Don’t want to leave documents with a cloud service (neither documents nor values are stored on the server)",
          "Find deploying it yourself difficult (setup can be done for you; see Price below)",
        ],
        notFor: [
          "Need guaranteed accuracy (it’s AI reading; a person is expected to check before confirming)",
          "Read only a few documents a month (the free tool compared below is enough)",
          "Want one PDF containing many documents read in one go (each file is read as one document)",
          "Can’t provide a place to host it (such as Vercel) and won’t have it set up for you",
        ],
      },
      compare: {
        rows: [
          {
            kind: "Free tool",
            name: "Google Drive text recognition (Open with Google Docs)",
            href: SOURCES.driveOcr,
            cost: "¥0 (with a Google account; files of 2 MB or less recommended)",
            note: "Turns the text of a PDF or photo into a Google Docs document. It doesn’t split it into fields such as invoice number or amount, and tables may break.",
          },
          {
            kind: "Built-in feature",
            name: "Money Forward Cloud Accounting “Input from AI-OCR”",
            href: SOURCES.mfOcr,
            cost: "Included in paid accounting plans; limits or usage fees apply by number of attachments",
            note: "Creates journal entries from scanned documents. If you use Money Forward for accounting, try this first.",
          },
          {
            kind: "Similar service",
            name: "invox Received Invoices (Minimum plan)",
            href: SOURCES.invox,
            cost: "¥980/month + ¥50 per AI-read document (excl. tax)",
            note: "Reads received invoices and handles the payment workflow as well. Human verification is also available (¥100 per document, excl. tax).",
          },
        ],
        kit: "Reads fields from PDFs and photos, flags uncertain ones for review, and exports only corrected, confirmed rows to CSV or a spreadsheet. No monthly fee for the kit; API costs run about ¥3–8 per single-page invoice (hosting costs are separate).",
        checkedOn: CHECKED_ON,
      },
      steps: [
        {
          heading: "Getting an Anthropic API key and registering a card",
          intro: "This key lets the AI read your documents. Costs are charged to your own key according to how many pages it reads. The Anthropic Console is in English.",
          items: [
            "Create an account in the Anthropic Console (console.anthropic.com) and register a payment method (credit card) under “Billing”.",
            "Set a monthly cap under “Limits” → “Spend limit”. This is the most reliable place to cap the kit’s costs.",
            "Under “API Keys”, create one key and copy it. The key is shown only once.",
            "Where you host it (on Vercel, the project’s “Environment Variables”), add ANTHROPIC_API_KEY with the copied key as its value.",
          ],
          after: "Put the key only in the host’s environment variables; never write it to a file and push it to Git. If you deploy to a public URL, anyone who knows it can use the reader at the cost of your key. Set a cap and keep the URL within your company.",
        },
        {
          heading: "Deploying the bundled Next.js template to Vercel",
          intro: "This is the easiest way to host it. You need GitHub and Vercel accounts. If this feels difficult, have the setup done for you.",
          items: [
            "Turn the templates/nextjs folder from the zip into a Git repository and push it to GitHub (include the tgz in vendor and the forms folder).",
            "In Vercel, press “Import” and choose that repository.",
            "Add ANTHROPIC_API_KEY and TRUST_PROXY (value 1) as environment variables and press “Deploy”.",
            "Open the public URL and have it read one of the bundled sample documents.",
          ],
          after: "If everyone immediately gets “please wait a moment”, TRUST_PROXY=1 is missing. On Vercel, documents over 4 MB are rejected before they arrive; export large photos smaller first.",
        },
      ],
    },
  },
  fr: {
    meta: {
      title: "L’IA lit factures et reçus ; vous vérifiez avant l’envoi vers un tableur ou un CSV | Achat unique, votre propre clé d’API (Kit de lecture de documents par IA)",
      description: "Un kit où l’IA (Claude) lit les PDF et photos de factures et de reçus, signale les champs incertains et n’exporte vers un CSV ou un tableur que les lignes que vous confirmez. Les documents ne sont pas conservés sur le serveur. Essayez-le tout de suite sur cette page avec votre propre document.",
    },
    name: "Kit de lecture de documents par IA",
    title: "L’IA lit factures et reçus ; vous vérifiez avant le tableur",
    lede: "L’IA (Claude, d’Anthropic) lit les PDF et photos de factures et de reçus et signale les champs dont elle n’est pas sûre. Seules les lignes corrigées et confirmées partent vers un CSV ou un tableur, une ligne chacune. Ci-dessous, faites-lui lire tout de suite une de vos factures.",
    privacy: "Les résultats restent uniquement dans ce navigateur et ne sont pas enregistrés sur le serveur. Le nombre de pages par jour est limité. Si un exemple fourni ne peut pas être lu, l’erreur vient de nous : merci de nous prévenir à l’adresse ci-dessous.",
    kit: "Le lecteur ci-dessus est le véritable Kit de lecture de documents par IA. Décrivez la structure de vos documents en JSON, déployez sur Vercel le modèle Next.js et son écran de vérification : il fonctionne avec votre propre clé API. Dans l’écran de vérification du kit, vous corrigez les champs signalés et n’exportez vers un CSV ou un tableur que les lignes confirmées.",
    sales: {
      proof: [
        { figure: "206", label: "Tests automatisés, de la réception d’un document jusqu’aux limites et au refus des appels d’autres sites, tous passés avant chaque version (1.0.1)." },
        { figure: "0", label: "Document conservé sur le serveur. Ni les documents ni les valeurs lues ne sont stockés ; seuls des comptes, des niveaux de confiance et des données semblables restent." },
        { figure: "3–8 ¥", label: "Ordre de grandeur du coût d’API pour lire une facture d’une page (claude-opus-5 ; environ 300 à 800 ¥ pour 100 ; d’après le guide des coûts)." },
        { figure: "14 jours", label: "Après l’achat, nous répondons par e-mail aux signalements de bugs (réponse sous 3 jours ouvrés)." },
      ],
      audience: {
        fits: [
          "Saisissez à la main chaque mois des dizaines à des centaines de factures et de reçus dans un tableur ou un logiciel comptable",
          "Êtes une agence, un indépendant ou un informaticien interne qui veut intégrer la lecture de documents chez un client (la livraison d’une version modifiée est permise ; fonctionne sur Next.js, Vercel ou Node)",
          "Ne voulez pas confier vos documents à un service en ligne (ni les documents ni les valeurs ne sont stockés sur le serveur)",
          "Trouvez difficile de le déployer vous-même (l’installation peut être faite pour vous ; voir Prix ci-dessous)",
        ],
        notFor: [
          "Avez besoin d’une précision garantie (c’est une lecture par IA ; une personne vérifie avant de confirmer)",
          "Ne lisez que quelques documents par mois (l’outil gratuit comparé ci-dessous suffit)",
          "Voulez faire lire d’un coup un PDF contenant plusieurs documents (chaque fichier est lu comme un seul document)",
          "Ne pouvez pas fournir d’hébergement (Vercel, etc.) et ne faites pas installer le kit",
        ],
      },
      compare: {
        rows: [
          {
            kind: "Outil gratuit",
            name: "Reconnaissance de texte de Google Drive (Ouvrir avec Google Docs)",
            href: SOURCES.driveOcr,
            cost: "0 ¥ (avec un compte Google ; fichiers de 2 Mo au plus conseillés)",
            note: "Transforme le texte d’un PDF ou d’une photo en document Google Docs. Il ne sépare pas les champs comme le numéro ou le montant de la facture, et les tableaux peuvent se défaire.",
          },
          {
            kind: "Fonction intégrée",
            name: "Money Forward Cloud Accounting « Saisie par AI-OCR »",
            href: SOURCES.mfOcr,
            cost: "Inclus dans les offres comptables payantes ; plafond ou frais à l’usage selon le nombre de pièces jointes",
            note: "Crée des écritures à partir des documents numérisés. Si votre comptabilité est sur Money Forward, essayez d’abord ceci.",
          },
          {
            kind: "Service similaire",
            name: "invox Factures reçues (offre Minimum)",
            href: SOURCES.invox,
            cost: "980 ¥/mois + 50 ¥ par document lu par IA (HT)",
            note: "Lit les factures reçues et gère aussi le processus de paiement. Une vérification humaine est possible (100 ¥ par document, HT).",
          },
        ],
        kit: "Lit les champs des PDF et photos, signale ceux qui sont incertains et n’exporte vers un CSV ou un tableur que les lignes corrigées et confirmées. Pas d’abonnement pour le kit ; l’API coûte environ 3 à 8 ¥ par facture d’une page (hébergement en sus).",
        checkedOn: CHECKED_ON,
      },
      steps: [
        {
          heading: "Obtenir une clé d’API Anthropic et enregistrer une carte",
          intro: "Cette clé permet à l’IA de lire vos documents. Le coût est imputé à votre propre clé selon le nombre de pages lues. La console Anthropic est en anglais.",
          items: [
            "Créez un compte dans la console Anthropic (console.anthropic.com) et enregistrez un moyen de paiement (carte bancaire) dans « Billing ».",
            "Fixez un plafond mensuel dans « Limits » → « Spend limit ». C’est l’endroit le plus sûr pour plafonner le coût du kit.",
            "Dans « API Keys », créez une clé et copiez-la. Elle ne s’affiche qu’une fois.",
            "Chez votre hébergeur (sur Vercel, les « Environment Variables » du projet), ajoutez ANTHROPIC_API_KEY avec la clé copiée comme valeur.",
          ],
          after: "Mettez la clé uniquement dans les variables d’environnement de l’hébergeur ; ne l’écrivez jamais dans un fichier poussé sur Git. Sur une URL publique, quiconque la connaît peut utiliser le lecteur aux frais de votre clé. Fixez un plafond et gardez l’URL en interne.",
        },
        {
          heading: "Déployer sur Vercel le modèle Next.js fourni",
          intro: "C’est la manière la plus simple de l’héberger. Il faut des comptes GitHub et Vercel. Si cela vous semble difficile, faites faire l’installation.",
          items: [
            "Faites du dossier templates/nextjs du zip un dépôt Git et poussez-le sur GitHub (avec le tgz de vendor et le dossier forms).",
            "Dans Vercel, cliquez sur « Import » et choisissez ce dépôt.",
            "Ajoutez les variables d’environnement ANTHROPIC_API_KEY et TRUST_PROXY (valeur 1), puis cliquez sur « Deploy ».",
            "Ouvrez l’URL publique et faites lire un des documents d’exemple fournis.",
          ],
          after: "Si tout le monde reçoit aussitôt « patientez un instant », TRUST_PROXY=1 manque. Sur Vercel, les documents de plus de 4 Mo sont refusés avant d’arriver ; exportez les grandes photos en plus petit.",
        },
      ],
    },
  },
};
