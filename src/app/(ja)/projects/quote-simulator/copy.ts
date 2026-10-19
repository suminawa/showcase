import type { KitSales } from "../kit-parts";

/** 比べる相手のページ（内容と費用の出どころ） */
const SOURCES = {
  cff: "https://ja.wordpress.org/plugins/calculated-fields-form/",
  jotform: "https://www.jotform.com/ja/pricing/",
  myMitsu: "https://itreview.jp/products/my-mitsu/price",
};

/** 比べる相手のページを読んだ日 */
const CHECKED_ON = "2026-10-20";

type QuoteCopy = {
  meta: { title: string; description: string };
  name: string;
  title: string;
  lede: string;
  /** お求めいただく版で増えるもの。figures は content.tsx の FIGURES と同じ順（計算の画面・見積書） */
  paid: { heading: string; intro: string; list: string[]; figures: { alt: string; caption: string }[] };
  sales: KitSales;
  closeHeading: string;
  close: string;
};

const ja: QuoteCopy = {
  meta: {
    title: "料金シミュレーターをホームページに｜お客さまが自分で概算、見積書 PDF もその場で（見積もり電卓テンプレ）",
    description:
      "「だいたいいくら？」に、お客さまが自分で答えを出せる料金シミュレーターです。単価 × 数量・オプション・値引き・消費税から内訳と合計をその場で出し、見積書を A4 で印刷（PDF 保存）できます。HTML に 4 行で置け、WordPress にも、iframe で STUDIO・Wix にも置けます。買い切りで月額はかかりません。",
  },
  name: "見積もり電卓テンプレ",
  title: "料金シミュレーターを、自社のホームページに",
  lede: "「だいたいいくら？」に、お客さまが自分で答えを出せます。単価 × 数量とオプションから内訳と合計をその場で出し、見積書を A4 で印刷（PDF 保存）できます。HTML に 4 行で置けて、月額はかかりません。",
  paid: {
    heading: "お求めいただく版で増えるもの",
    intro: "上の電卓は、時間単価・一式・オプション・消費税の計算だけの見本です。お求めいただく版には、次のものが入っています。",
    list: [
      "明細: 「足場 150 ㎡ × 900 円」のように、項目 × 数量 × 単価で積み上げられます",
      "見積書: 宛名・件名・発行日・有効期限・発行者の入った A4 1 枚を、印刷から PDF に保存できます",
      "この内容で問い合わせる: お客さまが、内訳を本文に入れたメールをそのまま送れます",
      "値引き: 円でも % でも入れられ、内訳に 1 行で載ります",
      "税込から逆算: 「税込 11 万円で」と言われたときに、税抜と消費税を出します。合計は入力した額と 1 円もずれません",
      "税率の切替（10% と 8%）と、源泉徴収のある仕事の差引お支払額",
      "内訳のコピー: メールやチャットにそのまま貼れる文章になります",
      "スマホでは合計を画面の下に出し続けます。設定を書き間違えたときは、直す項目を画面に出します",
    ],
    figures: [
      {
        alt: "お求めいただく版の画面。外壁・屋根塗装の明細 4 行と「遮熱塗料に変更」のオプションから、合計 758,670 円（税込）が出ている",
        caption: "お求めいただく版の画面です（設定の例: 外壁・屋根塗装。項目と単価は設定で書き換えます。金額は例です）。",
      },
      {
        alt: "印刷した見積書。件名・宛名・発行日・有効期限・発行者・明細の表・合計が A4 1 枚に入っている",
        caption: "「見積書を印刷（PDF 保存）」で開く見積書です。ブラウザの印刷の画面から PDF に保存できます。",
      },
    ],
  },
  sales: {
    proof: [
      { figure: "141 件", label: "自動テストの数です。計算・設定の確かめ・見積書まで、版を出すたびにすべて通しています（1.1.1）。" },
      { figure: "0 円", label: "月額の費用です。ご自身のサイトに置いたファイルだけで動きます。" },
      { figure: "0 件", label: "電卓が外へ送る通信です。入力した内容をサーバーに送らず、Cookie も使いません。" },
      { figure: "4 行", label: "サイトに貼るコードの行数です。JS と CSS の 2 ファイルと一緒に置きます。" },
    ],
    audience: {
      fits: [
        "塗装・清掃・撮影・教室・士業など、料金が「単価 × 数量 ＋ オプション」で決まるご商売の方",
        "「だいたいいくら？」の電話やメールに、毎回同じ計算でお答えしている方",
        "お客さまのサイトに置いて納品したい制作会社・フリーランスの方（クライアントのサイトに組み込んで納品できます）",
        "ご自身で置くのが不安な方（設置までお任せいただけます。下の「お値段」をご覧ください）",
      ],
      notFor: [
        "現地を見ないと金額の見当もつかないお仕事の方（概算の材料が無いため、合計がかえって誤解のもとになります）",
        "見積もりの履歴・お客さまの管理・送った記録まで残したい方（電卓は何も保存しません。下の比較の見積もりサービスが向いています）",
        "料金表を管理画面から書き換えたい方（料金は、貼ったコードの設定に書きます）",
        "ドル・ユーロなど、小数点のある通貨で使いたい方（金額は整数に丸めます）",
      ],
    },
    compare: {
      rows: [
        {
          kind: "無料の道具",
          name: "Calculated Fields Form（WordPress のプラグイン）",
          href: SOURCES.cff,
          cost: "0 円（PDF の書き出しは有料版）",
          note: "WordPress の中で、入力に応じて合計を出すフォームを作れます。WordPress 以外のサイトには置けません。",
        },
        {
          kind: "無料枠のあるフォーム",
          name: "Jotform（Starter プラン）",
          href: SOURCES.jotform,
          cost: "0 円（フォーム 5 本・月 100 件まで。有料は月 $39 から）",
          note: "フォームの中で計算できます。無料のプランでは、フォームに Jotform の表示が入ります。",
        },
        {
          kind: "似たサービス",
          name: "マイ見積",
          href: SOURCES.myMitsu,
          cost: "0 円（フォームにクレジットの表示）。スタンダードは月 2,980 円",
          note: "見積もりのフォームと PDF の発行ができます。自動返信などは有料のプランからです。",
        },
      ],
      kit: "単価 × 数量・オプション・値引き・消費税から内訳を出し、A4 の見積書まで作れます。自社のサイトの中で動き、ほかの会社の表示も月額もありません。",
      checkedOn: CHECKED_ON,
    },
    steps: [
      {
        heading: "WordPress に置くまで",
        intro: "WordPress のメディアライブラリは、.js と .css のファイルを受け付けません。次の順に置いてください。",
        items: [
          "zip の「embed」フォルダから、quote-calculator.global.js と quote-calculator.css を取り出します。",
          "FTP かレンタルサーバーのファイルマネージャーで、wp-content/uploads/quote-calculator/ などに 2 つを置きます。",
          "固定ページの編集画面で「カスタム HTML」のブロックを足し、embed-snippet.html の 4 行を貼ります。2 つのファイルの場所は https:// から書きます。",
          "管理者のアカウントで保存します（編集者などの権限では、script のタグが消えることがあります）。",
        ],
        after: "STUDIO・Wix・ペライチのように JS のファイルを置けないサイトでは、同梱の standalone.html をご自身のサーバーなどに置き、iframe の 1 行で埋め込みます（手順書の「STUDIO・Wix・ペライチに置く」をご覧ください）。",
      },
      {
        heading: "電卓の場所に赤い文が出たとき・何も出ないとき",
        intro: "設定の値が正しくないときは、電卓の代わりに、直す項目と書き方が赤い文で出ます。",
        items: [
          "赤い文の「設定の ○○ が正しくありません」にある項目の名前（例: tax.rate）を、貼ったコードの中で探します。",
          "赤い文の書き方のとおりに直します（例: 税率の 10% は、10 ではなく 0.1 と書きます）。",
          "ページを読み込み直し、電卓が出ることを確かめます。",
          "何も出ないときは、「,」の付け忘れ・「\"」の閉じ忘れ・JS と CSS の場所の書き間違いを確かめます。",
        ],
        after: "それでも出ないときは、貼ったコードを添えて hello@suminawa.dev へお送りください。3 営業日以内にお返事します。",
      },
    ],
  },
  closeHeading: "更新とご利用の範囲",
  close: "お求めの方は、その後の 1.x の更新も無料で受け取れます（差し替えるのは embed の 2 ファイルだけです）。クライアントのサイトに組み込んで納品できます。再配布・転売・同種の商品としての販売はできません。",
};

export const copy: Record<"ja" | "en" | "fr", QuoteCopy> = {
  ja,
  en: {
    meta: {
      title: "A price simulator for your website | Visitors get their own estimate and a PDF quote on the spot (Quote Calculator Template)",
      description:
        "A price simulator that lets visitors answer “roughly how much?” themselves. It shows the breakdown and total from unit price × quantity, options, discounts, and consumption tax, and prints an A4 quote (save as PDF). Four lines of HTML; also works on WordPress, and on STUDIO or Wix via an iframe. One-time purchase, no monthly fee.",
    },
    name: "Quote Calculator Template",
    title: "A price simulator for your own website",
    lede: "Visitors answer “roughly how much?” themselves. The breakdown and total come from unit price × quantity and options, and an A4 quote prints on the spot (save as PDF). Four lines of HTML, no monthly fee.",
    paid: {
      heading: "What the version you buy adds",
      intro: "The calculator above is a sample with only hourly rates, flat fees, options, and consumption tax. The version you buy also includes the following.",
      list: [
        "Line items: build up totals as item × quantity × unit price, such as “scaffolding, 150 m² × ¥900”",
        "Quote sheet: an A4 page with recipient, subject, issue date, expiry date, and issuer, saved as PDF from the print dialog",
        "Contact with this quote: visitors send an email with the breakdown already in the body",
        "Discounts: in yen or percent, shown as one line of the breakdown",
        "Back-calculation from a tax-inclusive amount: when asked for “¥110,000 including tax”, it shows the pre-tax amount and the tax. The total never differs from the amount entered by even one yen",
        "Tax rate switching (10% and 8%), and the net payment for work subject to withholding tax",
        "Copy the breakdown: text ready to paste into email or chat",
        "On phones, the total stays at the bottom of the screen. If a setting is mistyped, the calculator shows which item to fix",
      ],
      figures: [
        {
          alt: "The version you buy. Four line items for exterior wall and roof painting plus a heat-shield paint option give a total of ¥758,670 including tax",
          caption: "The version you buy (example settings for exterior painting; items and unit prices are set in the configuration, and the amounts are examples).",
        },
        {
          alt: "A printed quote sheet with subject, recipient, issue date, expiry date, issuer, line-item table, and totals on one A4 page",
          caption: "The quote sheet opened by the print button. Save it as PDF from the browser’s print dialog.",
        },
      ],
    },
    sales: {
      proof: [
        { figure: "141", label: "Automated tests covering calculations, settings checks, and the quote sheet, all passed for every release (1.1.1)." },
        { figure: "¥0", label: "Monthly cost. It runs only from the files you place on your own site." },
        { figure: "0", label: "Requests the calculator sends out. Nothing entered goes to a server, and no cookies are used." },
        { figure: "4 lines", label: "Lines of code to paste into your site, placed together with one JS and one CSS file." },
      ],
      audience: {
        fits: [
          "Run a business priced as “unit price × quantity + options”, such as painting, cleaning, photography, classes, or professional services",
          "Answer “roughly how much?” calls and emails with the same calculation every time",
          "Are an agency or freelancer who wants to deliver it on client sites (you may build it into client sites)",
          "Would rather not install it yourself (setup can be done for you; see Price below)",
        ],
        notFor: [
          "Do work you can’t price at all without a site visit (with nothing to estimate from, a total would mislead)",
          "Need quote history, customer management, or a record of what was sent (the calculator saves nothing; the quoting services compared below suit you better)",
          "Want to edit your price list from an admin screen (prices are written in the settings of the pasted code)",
          "Need a currency with decimals such as dollars or euros (amounts are rounded to whole numbers)",
        ],
      },
      compare: {
        rows: [
          {
            kind: "Free tool",
            name: "Calculated Fields Form (WordPress plugin)",
            href: SOURCES.cff,
            cost: "¥0 (PDF export in the paid version)",
            note: "Builds forms in WordPress that calculate totals from inputs. It cannot be used outside WordPress.",
          },
          {
            kind: "Form with a free tier",
            name: "Jotform (Starter plan)",
            href: SOURCES.jotform,
            cost: "¥0 (5 forms, 100 submissions a month; paid from $39/month)",
            note: "Calculates inside forms. On the free plan, forms carry Jotform branding.",
          },
          {
            kind: "Similar service",
            name: "My Mitsu (quote forms)",
            href: SOURCES.myMitsu,
            cost: "¥0 (with a credit line on the form); Standard is ¥2,980/month",
            note: "Creates quote forms and issues PDFs. Auto-reply emails and similar features start with the paid plans.",
          },
        ],
        kit: "Breakdowns from unit price × quantity, options, discounts, and tax, through to an A4 quote. It runs inside your own site, with no third-party branding and no monthly fee.",
        checkedOn: CHECKED_ON,
      },
      steps: [
        {
          heading: "Placing it on WordPress",
          intro: "The WordPress media library does not accept .js and .css files. Place them in this order.",
          items: [
            "From the zip’s “embed” folder, take out quote-calculator.global.js and quote-calculator.css.",
            "Using FTP or your host’s file manager, put both files in a folder such as wp-content/uploads/quote-calculator/.",
            "On the page editor, add a “Custom HTML” block and paste the 4 lines from embed-snippet.html. Write the two file locations starting with https://.",
            "Save with an administrator account (with editor or lower permissions, script tags may be removed).",
          ],
          after: "On sites that cannot host JS files, such as STUDIO, Wix, or Peraichi, place the included standalone.html on your own server and embed it with one iframe line (see the guide’s section on STUDIO, Wix, and Peraichi).",
        },
        {
          heading: "When red text appears instead of the calculator, or nothing appears",
          intro: "If a setting is invalid, red text appears in place of the calculator, naming the item to fix and how to write it.",
          items: [
            "Find the item name in the red text (for example tax.rate) in the code you pasted.",
            "Fix it as the red text describes (for example, a 10% tax rate is written 0.1, not 10).",
            "Reload the page and check that the calculator appears.",
            "If nothing appears at all, check for a missing “,”, an unclosed “\"”, or mistyped JS and CSS locations.",
          ],
          after: "If it still doesn’t appear, send the code you pasted to hello@suminawa.dev. We reply within 3 business days.",
        },
      ],
    },
    closeHeading: "Updates and permitted use",
    close: "Buyers receive later 1.x updates free (only the two files in embed are replaced). You may build it into client sites. Redistribution, resale, and selling it as a similar product are not allowed.",
  },
  fr: {
    meta: {
      title: "Un simulateur de tarifs pour votre site | Vos visiteurs estiment eux-mêmes, devis PDF sur-le-champ (Modèle de calculateur de devis)",
      description:
        "Un simulateur de tarifs qui permet à vos visiteurs de répondre eux-mêmes à « combien environ ? ». Il affiche le détail et le total à partir du prix unitaire × quantité, des options, des remises et de la taxe, et imprime un devis A4 (enregistrable en PDF). Quatre lignes de HTML ; fonctionne aussi sur WordPress, et sur STUDIO ou Wix via un iframe. Achat unique, sans abonnement.",
    },
    name: "Modèle de calculateur de devis",
    title: "Un simulateur de tarifs pour votre propre site",
    lede: "Vos visiteurs répondent eux-mêmes à « combien environ ? ». Le détail et le total se calculent à partir du prix unitaire × quantité et des options, et un devis A4 s’imprime aussitôt (enregistrable en PDF). Quatre lignes de HTML, sans abonnement.",
    paid: {
      heading: "Ce qu’ajoute la version achetée",
      intro: "Le calculateur ci-dessus est un exemple limité au taux horaire, au forfait, aux options et à la taxe. La version achetée contient en plus les éléments suivants.",
      list: [
        "Lignes détaillées : cumul article × quantité × prix unitaire, par exemple « échafaudage, 150 m² × 900 ¥ »",
        "Devis : une page A4 avec destinataire, objet, date d’émission, date de validité et émetteur, enregistrable en PDF depuis l’impression",
        "Contacter avec ce devis : le visiteur envoie un e-mail dont le corps contient déjà le détail",
        "Remises : en yens ou en pourcentage, sur une ligne du détail",
        "Calcul à rebours depuis un montant TTC : pour « 110 000 ¥ TTC », il affiche le montant HT et la taxe. Le total ne diffère jamais du montant saisi, pas même d’un yen",
        "Choix du taux de taxe (10 % et 8 %), et montant net pour les prestations soumises à retenue à la source",
        "Copie du détail : un texte prêt à coller dans un e-mail ou une messagerie",
        "Sur téléphone, le total reste en bas de l’écran. En cas d’erreur de réglage, le calculateur indique l’élément à corriger",
      ],
      figures: [
        {
          alt: "La version achetée. Quatre lignes pour la peinture des murs extérieurs et du toit, plus une option de peinture thermique, donnent un total de 758 670 ¥ TTC",
          caption: "La version achetée (réglages d’exemple pour des travaux de peinture ; articles et prix unitaires se règlent dans la configuration, les montants sont des exemples).",
        },
        {
          alt: "Un devis imprimé avec objet, destinataire, dates d’émission et de validité, émetteur, tableau des lignes et totaux sur une page A4",
          caption: "Le devis ouvert par le bouton d’impression. Enregistrez-le en PDF depuis la fenêtre d’impression du navigateur.",
        },
      ],
    },
    sales: {
      proof: [
        { figure: "141", label: "Tests automatisés couvrant calculs, vérification des réglages et devis, tous passés à chaque version (1.1.1)." },
        { figure: "0 ¥", label: "Coût mensuel. Il fonctionne uniquement avec les fichiers déposés sur votre site." },
        { figure: "0", label: "Requête envoyée par le calculateur. Rien de ce qui est saisi ne part vers un serveur, et aucun cookie n’est utilisé." },
        { figure: "4 lignes", label: "Lignes de code à coller dans votre site, avec un fichier JS et un fichier CSS." },
      ],
      audience: {
        fits: [
          "Avez une activité tarifée en « prix unitaire × quantité + options » : peinture, nettoyage, photo, cours, professions libérales…",
          "Répondez à chaque appel ou e-mail « combien environ ? » avec le même calcul",
          "Êtes une agence ou un indépendant qui veut le livrer sur les sites de ses clients (intégration dans les sites clients permise)",
          "Préférez ne pas l’installer vous-même (l’installation peut être faite pour vous ; voir Prix ci-dessous)",
        ],
        notFor: [
          "Exercez un métier impossible à chiffrer sans visite sur place (sans base d’estimation, un total induirait en erreur)",
          "Voulez un historique des devis, une gestion des clients ou une trace des envois (le calculateur n’enregistre rien ; les services de devis comparés ci-dessous conviennent mieux)",
          "Voulez modifier vos tarifs depuis une interface d’administration (les tarifs s’écrivent dans les réglages du code collé)",
          "Avez besoin d’une devise à décimales comme le dollar ou l’euro (les montants sont arrondis à l’unité)",
        ],
      },
      compare: {
        rows: [
          {
            kind: "Outil gratuit",
            name: "Calculated Fields Form (extension WordPress)",
            href: SOURCES.cff,
            cost: "0 ¥ (export PDF dans la version payante)",
            note: "Crée dans WordPress des formulaires qui calculent un total à partir des saisies. Inutilisable hors de WordPress.",
          },
          {
            kind: "Formulaire avec offre gratuite",
            name: "Jotform (offre Starter)",
            href: SOURCES.jotform,
            cost: "0 ¥ (5 formulaires, 100 envois par mois ; payant dès 39 $/mois)",
            note: "Calcule dans les formulaires. Avec l’offre gratuite, les formulaires portent la marque Jotform.",
          },
          {
            kind: "Service similaire",
            name: "My Mitsu (formulaires de devis)",
            href: SOURCES.myMitsu,
            cost: "0 ¥ (mention de crédit sur le formulaire) ; offre Standard à 2 980 ¥/mois",
            note: "Crée des formulaires de devis et émet des PDF. Les réponses automatiques et autres fonctions commencent avec les offres payantes.",
          },
        ],
        kit: "Détail calculé à partir du prix unitaire × quantité, des options, des remises et de la taxe, jusqu’au devis A4. Il fonctionne dans votre propre site, sans marque tierce ni abonnement.",
        checkedOn: CHECKED_ON,
      },
      steps: [
        {
          heading: "Installer sur WordPress",
          intro: "La médiathèque WordPress n’accepte pas les fichiers .js et .css. Procédez dans cet ordre.",
          items: [
            "Dans le dossier « embed » du zip, prenez quote-calculator.global.js et quote-calculator.css.",
            "Par FTP ou avec le gestionnaire de fichiers de l’hébergeur, déposez-les dans un dossier tel que wp-content/uploads/quote-calculator/.",
            "Dans l’éditeur de page, ajoutez un bloc « HTML personnalisé » et collez les 4 lignes de embed-snippet.html. Indiquez l’emplacement des deux fichiers en commençant par https://.",
            "Enregistrez avec un compte administrateur (avec des droits d’éditeur ou inférieurs, les balises script peuvent être supprimées).",
          ],
          after: "Sur les sites qui ne peuvent pas héberger de fichiers JS, comme STUDIO, Wix ou Peraichi, déposez le standalone.html fourni sur votre propre serveur et intégrez-le avec une ligne iframe (voir la section STUDIO, Wix et Peraichi du guide).",
        },
        {
          heading: "Quand un texte rouge remplace le calculateur, ou que rien ne s’affiche",
          intro: "Si un réglage est invalide, un texte rouge remplace le calculateur et indique l’élément à corriger et la façon de l’écrire.",
          items: [
            "Repérez dans le code collé le nom de l’élément cité dans le texte rouge (par exemple tax.rate).",
            "Corrigez-le comme indiqué (par exemple, un taux de 10 % s’écrit 0.1 et non 10).",
            "Rechargez la page et vérifiez que le calculateur s’affiche.",
            "Si rien ne s’affiche, cherchez une « , » oubliée, un « \" » non fermé ou une erreur dans l’emplacement des fichiers JS et CSS.",
          ],
          after: "Si cela ne s’affiche toujours pas, envoyez le code collé à hello@suminawa.dev. Réponse sous 3 jours ouvrés.",
        },
      ],
    },
    closeHeading: "Mises à jour et conditions d’utilisation",
    close: "Les acheteurs reçoivent gratuitement les mises à jour 1.x (seuls les deux fichiers de embed sont remplacés). Vous pouvez l’intégrer aux sites de vos clients. Redistribution, revente et vente comme produit similaire interdites.",
  },
};
