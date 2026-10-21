import type { KitSales } from "../kit-parts";

/*
 * 数字の出どころ: suminawa-products/packages/order-report-template の README.ja.md と BUILD-REPORT.md（1.0.0）。
 * 比べる相手: suminawa-ops/30days/research/2026-10-19-order-report-template.md。
 * Excel 2019 と Google スプレッドシートでは確かめていない（BUILD-REPORT「やっていないこと」）ので、そう書かない。
 */
const SOURCES = {
  shopify: "https://www.shopify.com/jp/analytics",
  base: "https://ecnomikata.com/ecnews/ec_construction/32254/",
};

/** 比べる相手のページを読んだ日 */
const CHECKED_ON = "2026-10-21";

const jaSales: KitSales = {
  proof: [
    { figure: "17,144 セル", label: "Microsoft 365 の Excel で 10 通りの設定を計算し、別に組んだ Python の計算と照らしたセルの数です。差は 0 でした。" },
    { figure: "約 2,000 行", label: "同梱の見本データ（架空のお店の 3 か月分）の受注の行数です。貼ると、そのまま数字が出ます。" },
    { figure: "10〜15 秒", label: "標準版（受注 1 万行まで）を開くまでの目安です。Microsoft 365 の Excel（Mac）で測りました。大容量版は 30 秒ほどです。" },
    { figure: "0 本", label: "マクロとスクリプトの数です。関数だけで組んであり、式はすべて見えます。許可を求める画面も出ません。" },
  ],
  audience: {
    fits: [
      "定期通販（サブスク EC）で、月初にカートの受注 CSV と定期の CSV を落とし、Excel で手で集計している事務担当の方",
      "有効な定期の件数・解約率・初回 → 2 回目の継続率・来月の定期売上の見込みを、毎月同じ形で報告したい方",
      "会社のパソコンでマクロやスクリプトを動かせない方（関数だけで組んであります）",
      "自社の CSV に合わせるのが不安な方（差し込みまでお任せいただけます。下の「お値段」をご覧ください）",
    ],
    notFor: [
      "定期の無い、単品だけのネットショップの方（受注数・売上・送料を月ごとに出す無料版で足ります）",
      "店舗やハンドメイドの販売で、カートの受注 CSV が無い方",
      "Google スプレッドシートで使いたい方（いまは Excel 向けです。スプレッドシートでの動きは確かめていません）",
      "1 件の受注に商品が 2 つ以上ある Shopify の CSV が多いお店（1 行を 1 件の受注として数えます）",
    ],
  },
  compare: {
    rows: [
      {
        kind: "標準の機能",
        name: "Shopify の分析",
        href: SOURCES.shopify,
        cost: "Shopify のプランに含まれます（コホートと予測は Advanced 以上）",
        note: "売上や顧客の数は管理画面で見られます。解約率や、次回配送日から出す来月の定期売上の見込みは、標準の画面にはありません。",
      },
      {
        kind: "カートの管理画面",
        name: "BASE の顧客管理など",
        href: SOURCES.base,
        cost: "0 円（カートの機能）",
        note: "購入回数や最終購入日で顧客を絞り込めます。解約率や来月の定期売上の見込みを 1 枚で出す機能は、カートの標準にはありません。",
      },
      {
        kind: "自分で組む",
        name: "Excel のピボット・ChatGPT",
        cost: "0 円（組む手間はかかります）",
        note: "ピボットを組める方は自作できます。受注日と発送日のどちらで数えるか、税と丸めの決め、検算はご自身で行います。ChatGPT には 1 万行の CSV を貼れません。",
      },
    ],
    kit: "受注 CSV と定期 CSV を貼ると、有効な定期・解約率・新規・継続率・来月の定期売上の見込みまで、12 か月分が 1 枚にそろいます。受注日と発送日・税・丸めは設定で選び、「確かめる」シートが貼り間違いを知らせます。",
    checkedOn: CHECKED_ON,
  },
  steps: [
    {
      heading: "5 つの手順（10 分ほど）",
      intro: "初めての方も、次の 5 つで使い始められます。毎月は、CSV を貼り替えて「報告する月」を変えるだけです。",
      items: [
        "受注 CSV を「受注」シートの A1 に、定期 CSV を「定期」シートの A1 に貼ります。「商品」シートには、商品名・袋数・定期の単価を書きます。",
        "「設定」シートで、項目ごとに貼った CSV の見出しをプルダウンから選びます。状態がすべて「OK」になれば完了です。",
        "受注と定期のステータスの文言（「発送済み」「解約」など）に区分を選び、決済手数料の表をご契約の料率に直します。",
        "「集計の開始月」と「報告する月」に、その月の 1 日を書きます。日付の基準・税・丸めもここで選びます。",
        "「確かめる」シートの上に「すべて OK です」と出れば終わりです。「要確認」の行は、その行の「直し方」のとおりに直します。",
      ],
      after: "見本データを貼ると、手順 2〜4 を飛ばしてそのまま数字が出ます。まず見本で動きを確かめてから、自社の CSV に替えるのがおすすめです。",
    },
    {
      heading: "数字が全部 0 になったとき",
      intro: "次の 3 つのどれかがほとんどです。「確かめる」シートに件数が出るので、上から見てください。",
      items: [
        "「設定」の開始月・報告する月が、CSV の期間と合っていない（「期間外の受注」が大きな数になります）。",
        "見出しの対応が「見つかりません」になっている（CSV を貼り直すと見出しが変わることがあります）。",
        "日付が字になっている。日付の列を選び、データ → 区切り位置 → 完了 を押すと日付になります。",
      ],
      after: "どれでもないときは、「確かめる」シートの画面をお送りください。どの見出しを選べばよいか分からないときのご相談は、無料でお受けしています。",
    },
  ],
};

const ja = {
  meta: {
    title: "定期通販の受注 CSV を貼るだけで、新規・解約・来月の定期売上まで｜Excel の関数だけ（定期通販 受注集計テンプレート）",
    description: "カートの受注 CSV と定期 CSV を貼ると、有効な定期の件数・解約率・新規顧客・初回 → 2 回目の継続率・客単価・来月の定期売上の見込みまで、12 か月分が 1 枚にそろう Excel のテンプレートです。マクロなし。無料版つき。",
  },
  name: "定期通販 受注集計テンプレート",
  title: "定期通販の受注 CSV を貼るだけで、新規・解約・来月の定期売上まで",
  lede: "月初の報告の数字を、CSV を貼るだけでそろえる Excel のテンプレートです。カートの受注 CSV と定期 CSV を貼ると、有効な定期・解約率・新規・継続率・来月の定期売上の見込みまで、12 か月分が 1 枚に並びます。マクロもスクリプトも使っていません。",
  shot: {
    alt: "左に貼り付けた受注 CSV、右に月ごとの数字が埋まった「集計」シート",
    caption: "受注 CSV を貼ったあとの画面です（見本データ）。押すと原寸で開きます。",
  },
  numbers: {
    heading: "出る数字",
    text: "「集計」シートに、次の数字が月ごとに 12 か月分並びます。上には、報告する月の数字と前月との増減が出ます。日ごとの受注数・発送完了数・新規顧客数・売上は「日次」シートにあります。",
    list: [
      "有効な定期の件数（月初・月末）",
      "解約数と解約率（解約数 ÷ 月初の有効な件数）",
      "新規顧客数と、初回 → 2 回目の継続率",
      "受注数・発送完了数・平均購入数・客単価",
      "売上・送料・手数料（税抜）と決済手数料",
      "来月の定期売上の見込み（次回配送日が来月の、有効な定期の合計）",
    ],
    editions: "標準版は受注 1 万行・定期 3,000 行まで、大容量版は受注 3 万行・定期 8,000 行まで集計します。どちらも同じ zip に入っています。顧客の CSV は要りません。Excel 2019 以降で使える関数だけで組んであり、検算は Microsoft 365 の Excel で行いました。",
  },
  close: {
    heading: "試す・頼む",
    free: {
      before: "買う前に、お手元の CSV で列が合うかを確かめられます。受注数・売上・送料を月ごとに出す無料版「",
      after: "」を BOOTH でお配りしています。見出しの選び方は有料版と同じです。",
    },
    service: "自社の CSV への差し込みもお受けします。上の「お値段」の「設置まで頼む」が、その値段です。",
    consult: {
      before: "どの見出しを選べばよいか分からないときは、CSV の 1 行目（見出し）と 2〜3 行目を ",
      after: " へお送りください。無料でお返しします。氏名・住所・電話番号・メールアドレスの列は、消すか「●●」に置き換えてからお送りください。",
    },
  },
  sales: jaSales,
};

export const copy: Record<"ja" | "en" | "fr", typeof ja> = {
  ja,
  en: {
    meta: {
      title: "Paste your subscription store’s order CSV and get new customers, cancellations, and next month’s subscription sales | Excel formulas only (Subscription Order Report Template)",
      description: "An Excel template: paste your cart’s order CSV and subscription CSV to get active subscriptions, cancellation rate, new customers, first-to-second order retention, average order value, and next month’s expected subscription sales for 12 months on one sheet. No macros. Free version available.",
    },
    name: "Subscription Order Report Template",
    title: "Paste your order CSV and get new customers, cancellations, and next month’s subscription sales",
    lede: "An Excel template that puts your monthly report numbers together from pasted CSVs. Paste your cart’s order and subscription CSVs, and active subscriptions, cancellation rate, new customers, retention, and next month’s expected subscription sales line up for 12 months on one sheet. No macros or scripts.",
    shot: {
      alt: "A pasted order CSV on the left, and the summary sheet filled in month by month on the right",
      caption: "The screen after pasting an order CSV (sample data). Click to open it at full size.",
    },
    numbers: {
      heading: "The numbers you get",
      text: "The summary sheet lists the following numbers for each of 12 months. At the top are the figures for the reporting month and the change from the previous month. Daily orders, shipments, new customers, and sales are on a separate daily sheet.",
      list: [
        "Active subscriptions (start and end of month)",
        "Cancellations and cancellation rate (cancellations ÷ active at start of month)",
        "New customers and first-to-second order retention",
        "Orders, completed shipments, average items per order, average order value",
        "Sales, shipping, and fees (before tax), plus payment fees",
        "Next month’s expected subscription sales (active subscriptions whose next delivery falls next month)",
      ],
      editions: "The standard edition handles up to 10,000 order rows and 3,000 subscription rows; the large edition up to 30,000 and 8,000. Both are in the same zip. No customer CSV is needed. It uses only functions available in Excel 2019 and later, and was verified in Microsoft 365 Excel.",
    },
    close: {
      heading: "Try it, or have it done",
      free: {
        before: "Before buying, you can check that your own CSV columns fit. A free version, “",
        after: "”, gives orders, sales, and shipping by month and uses the same column selection as the paid version. It’s on BOOTH (the page is in Japanese).",
      },
      service: "We can also fit the template to your own CSV. The price is shown as “Setup done for you” under Price above.",
      consult: {
        before: "If you’re not sure which columns to pick, send the first row (headers) and rows 2–3 of your CSV to ",
        after: ", free of charge. Please delete or mask the name, address, phone, and email columns before sending.",
      },
    },
    sales: {
      proof: [
        { figure: "17,144 cells", label: "Calculated in Microsoft 365 Excel across 10 settings and checked against a separately written Python calculation. Zero differences." },
        { figure: "~2,000 rows", label: "Order rows in the included sample data (three months of a fictional shop). Paste it and the numbers appear." },
        { figure: "10–15 s", label: "Typical time to open the standard edition (up to 10,000 order rows), measured in Microsoft 365 Excel for Mac. The large edition takes about 30 seconds." },
        { figure: "0", label: "Macros and scripts. It is built from formulas only, and every formula is visible. No permission prompts." },
      ],
      audience: {
        fits: [
          "Handle the books for a subscription online store and build the monthly numbers by hand in Excel from your cart’s order and subscription CSVs",
          "Want to report active subscriptions, cancellation rate, first-to-second order retention, and next month’s expected subscription sales in the same format every month",
          "Cannot run macros or scripts on your work computer (it uses formulas only)",
          "Would rather not fit it to your CSV yourself (we can do it for you; see Price below)",
        ],
        notFor: [
          "Run a store that sells single items only, with no subscriptions (the free version, with orders, sales, and shipping by month, is enough)",
          "Sell in a shop or through handmade marketplaces without a cart order CSV",
          "Want to use it in Google Sheets (it is made for Excel for now; it has not been checked in Google Sheets)",
          "Have many Shopify orders with two or more products (it counts one row as one order)",
        ],
      },
      compare: {
        rows: [
          {
            kind: "Built-in feature",
            name: "Shopify Analytics",
            href: SOURCES.shopify,
            cost: "Included in Shopify plans (cohorts and forecasts from Advanced)",
            note: "Sales and customer counts are in the admin. Cancellation rate and next month’s expected subscription sales from next delivery dates are not on the standard screens.",
          },
          {
            kind: "Cart admin",
            name: "BASE customer management, etc.",
            href: SOURCES.base,
            cost: "¥0 (a cart feature)",
            note: "Filters customers by number of purchases and last purchase date. Carts do not offer cancellation rate and next month’s expected subscription sales on one sheet as standard.",
          },
          {
            kind: "Build it yourself",
            name: "Excel pivot tables, ChatGPT",
            cost: "¥0 (but you build it)",
            note: "If you can build pivot tables, you can make your own. You decide order date versus ship date, tax, and rounding, and check the results yourself. ChatGPT cannot take a 10,000-row CSV.",
          },
        ],
        kit: "Paste the order and subscription CSVs to get active subscriptions, cancellation rate, new customers, retention, and next month’s expected subscription sales for 12 months on one sheet. Order or ship date, tax, and rounding are settings, and a check sheet flags pasting mistakes.",
        checkedOn: CHECKED_ON,
      },
      steps: [
        {
          heading: "Five steps (about 10 minutes)",
          intro: "First-time users can start with these five steps. Each month after that, you just paste new CSVs and change the reporting month.",
          items: [
            "Paste the order CSV at A1 of the orders sheet and the subscription CSV at A1 of the subscriptions sheet. On the products sheet, enter product name, units per item, and subscription price.",
            "On the settings sheet, pick the matching header of your CSV for each field from the dropdown. You’re done when every status reads OK.",
            "Assign a category to each order and subscription status wording (such as “shipped” or “cancelled”), and set the payment fee table to your contracted rates.",
            "Enter the first day of the start month and of the reporting month. Date basis, tax, and rounding are chosen here too.",
            "You’re finished when the check sheet says everything is OK. For any row needing attention, follow the fix shown on that row.",
          ],
          after: "If you paste the sample data, steps 2–4 can be skipped and the numbers appear as is. We recommend trying the sample first, then switching to your own CSV.",
        },
        {
          heading: "When every number is 0",
          intro: "It is almost always one of these three. The check sheet shows counts, so look from the top.",
          items: [
            "The start month or reporting month in the settings doesn’t match the CSV’s period (the out-of-period order count will be large).",
            "A header mapping says “not found” (re-pasting a CSV can change its headers).",
            "Dates are stored as text. Select the date column and choose Data → Text to Columns → Finish to turn them into dates.",
          ],
          after: "If it is none of these, send us a screenshot of the check sheet. Help choosing which headers to pick is free.",
        },
      ],
    },
  },
  fr: {
    meta: {
      title: "Collez le CSV de commandes de votre boutique par abonnement : nouveaux clients, résiliations et ventes du mois prochain | Formules Excel uniquement (Modèle de rapport des commandes par abonnement)",
      description: "Un modèle Excel : collez le CSV de commandes et le CSV d’abonnements de votre boutique pour obtenir abonnements actifs, taux de résiliation, nouveaux clients, rétention de la 1re à la 2e commande, panier moyen et ventes d’abonnement prévues le mois prochain, sur 12 mois et une seule feuille. Sans macro. Version gratuite disponible.",
    },
    name: "Modèle de rapport des commandes par abonnement",
    title: "Collez le CSV de commandes : nouveaux clients, résiliations et ventes d’abonnement du mois prochain",
    lede: "Un modèle Excel qui réunit les chiffres du rapport mensuel à partir de CSV collés. Collez les CSV de commandes et d’abonnements de votre boutique : abonnements actifs, taux de résiliation, nouveaux clients, rétention et ventes d’abonnement prévues le mois prochain s’alignent sur 12 mois, sur une seule feuille. Ni macro ni script.",
    shot: {
      alt: "À gauche, un CSV de commandes collé ; à droite, la feuille de synthèse remplie mois par mois",
      caption: "L’écran après avoir collé un CSV de commandes (données d’exemple). Cliquez pour l’ouvrir en taille réelle.",
    },
    numbers: {
      heading: "Les chiffres obtenus",
      text: "La feuille de synthèse présente les chiffres suivants pour chacun des 12 mois. En haut figurent ceux du mois du rapport et l’écart avec le mois précédent. Commandes, expéditions, nouveaux clients et ventes au jour le jour sont sur une feuille quotidienne à part.",
      list: [
        "Abonnements actifs (début et fin de mois)",
        "Résiliations et taux de résiliation (résiliations ÷ actifs en début de mois)",
        "Nouveaux clients et rétention de la 1re à la 2e commande",
        "Commandes, expéditions terminées, articles moyens par commande, panier moyen",
        "Ventes, frais de port et frais (HT), et frais de paiement",
        "Ventes d’abonnement prévues le mois prochain (abonnements actifs dont la prochaine livraison tombe le mois prochain)",
      ],
      editions: "L’édition standard traite jusqu’à 10 000 lignes de commandes et 3 000 lignes d’abonnements ; l’édition grand volume jusqu’à 30 000 et 8 000. Les deux sont dans le même zip. Aucun CSV clients n’est nécessaire. Seules des fonctions disponibles à partir d’Excel 2019 sont utilisées, et la vérification a été faite dans Excel Microsoft 365.",
    },
    close: {
      heading: "Essayer, ou nous confier le travail",
      free: {
        before: "Avant d’acheter, vous pouvez vérifier que les colonnes de votre CSV conviennent. Une version gratuite, « ",
        after: " », donne commandes, ventes et frais de port par mois, avec le même choix des colonnes que la version payante. Elle est sur BOOTH (page en japonais).",
      },
      service: "Nous pouvons aussi adapter le modèle à votre propre CSV. Le prix figure sous « Installation comprise » dans la section Prix ci-dessus.",
      consult: {
        before: "Si vous ne savez pas quelles colonnes choisir, envoyez la première ligne (en-têtes) et les lignes 2 à 3 de votre CSV à ",
        after: " ; nous répondons gratuitement. Supprimez ou masquez au préalable les colonnes nom, adresse, téléphone et e-mail.",
      },
    },
    sales: {
      proof: [
        { figure: "17 144 cellules", label: "Calculées dans Excel Microsoft 365 avec 10 réglages et comparées à un calcul Python écrit à part. Aucun écart." },
        { figure: "~2 000 lignes", label: "Lignes de commandes des données d’exemple fournies (trois mois d’une boutique fictive). Collez-les et les chiffres apparaissent." },
        { figure: "10 à 15 s", label: "Temps d’ouverture habituel de l’édition standard (jusqu’à 10 000 commandes), mesuré dans Excel Microsoft 365 pour Mac. L’édition grand volume prend environ 30 secondes." },
        { figure: "0", label: "Macro ou script. Le modèle n’utilise que des formules, toutes visibles. Aucune demande d’autorisation." },
      ],
      audience: {
        fits: [
          "Tenez les chiffres d’une boutique en ligne par abonnement et les montez à la main dans Excel à partir des CSV de commandes et d’abonnements",
          "Voulez présenter chaque mois, sous la même forme, abonnements actifs, taux de résiliation, rétention de la 1re à la 2e commande et ventes d’abonnement prévues",
          "Ne pouvez pas exécuter de macros ou de scripts sur votre poste de travail (il n’utilise que des formules)",
          "Préférez ne pas l’adapter vous-même à votre CSV (nous pouvons le faire ; voir Prix ci-dessous)",
        ],
        notFor: [
          "Tenez une boutique sans abonnement, à la vente unitaire (la version gratuite, avec commandes, ventes et frais de port par mois, suffit)",
          "Vendez en magasin ou via l’artisanat sans CSV de commandes d’un panier",
          "Voulez l’utiliser dans Google Sheets (il est conçu pour Excel pour l’instant ; il n’a pas été vérifié dans Google Sheets)",
          "Avez beaucoup de commandes Shopify à plusieurs produits (une ligne est comptée comme une commande)",
        ],
      },
      compare: {
        rows: [
          {
            kind: "Fonction intégrée",
            name: "Analyses Shopify",
            href: SOURCES.shopify,
            cost: "Inclus dans les forfaits Shopify (cohortes et prévisions à partir d’Advanced)",
            note: "Ventes et nombre de clients sont visibles dans l’administration. Le taux de résiliation et les ventes d’abonnement prévues d’après les prochaines livraisons ne figurent pas dans les écrans standard.",
          },
          {
            kind: "Administration du panier",
            name: "Gestion des clients BASE, etc.",
            href: SOURCES.base,
            cost: "0 ¥ (fonction du panier)",
            note: "Filtre les clients par nombre d’achats et date du dernier achat. Les paniers n’offrent pas en standard le taux de résiliation et les ventes d’abonnement prévues le mois prochain sur une seule feuille.",
          },
          {
            kind: "Le faire soi-même",
            name: "Tableaux croisés Excel, ChatGPT",
            cost: "0 ¥ (mais à construire)",
            note: "Si vous maîtrisez les tableaux croisés, vous pouvez le faire vous-même. À vous de choisir date de commande ou d’expédition, taxe et arrondi, et de vérifier. ChatGPT n’accepte pas un CSV de 10 000 lignes.",
          },
        ],
        kit: "Collez les CSV de commandes et d’abonnements : abonnements actifs, taux de résiliation, nouveaux clients, rétention et ventes d’abonnement prévues s’affichent sur 12 mois et une seule feuille. Date de commande ou d’expédition, taxe et arrondi se règlent, et une feuille de contrôle signale les erreurs de collage.",
        checkedOn: CHECKED_ON,
      },
      steps: [
        {
          heading: "Cinq étapes (10 minutes environ)",
          intro: "Même la première fois, ces cinq étapes suffisent. Ensuite, chaque mois, il suffit de recoller les CSV et de changer le mois du rapport.",
          items: [
            "Collez le CSV de commandes en A1 de la feuille des commandes et le CSV d’abonnements en A1 de la feuille des abonnements. Sur la feuille des produits, indiquez nom, unités par article et prix d’abonnement.",
            "Sur la feuille des réglages, choisissez dans la liste l’en-tête de votre CSV pour chaque champ. C’est terminé quand chaque état indique OK.",
            "Attribuez une catégorie à chaque libellé de statut des commandes et abonnements (« expédié », « résilié »…) et ajustez le tableau des frais de paiement à vos taux.",
            "Indiquez le premier jour du mois de départ et du mois du rapport. La date de référence, la taxe et l’arrondi se choisissent aussi ici.",
            "C’est fini quand la feuille de contrôle indique que tout est OK. Pour une ligne à vérifier, suivez la correction indiquée sur cette ligne.",
          ],
          after: "Avec les données d’exemple, les étapes 2 à 4 peuvent être sautées et les chiffres apparaissent tels quels. Nous conseillons d’essayer d’abord l’exemple, puis de passer à votre CSV.",
        },
        {
          heading: "Quand tous les chiffres sont à 0",
          intro: "C’est presque toujours l’une de ces trois causes. La feuille de contrôle affiche les nombres : lisez-la depuis le haut.",
          items: [
            "Le mois de départ ou le mois du rapport ne correspond pas à la période du CSV (le nombre de commandes hors période est alors élevé).",
            "Une correspondance d’en-tête indique « introuvable » (recoller un CSV peut changer ses en-têtes).",
            "Les dates sont du texte. Sélectionnez la colonne des dates puis Données → Convertir → Terminer pour en faire des dates.",
          ],
          after: "Si ce n’est aucune des trois, envoyez-nous une capture de la feuille de contrôle. L’aide pour choisir les en-têtes est gratuite.",
        },
      ],
    },
  },
};
