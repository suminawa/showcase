import type { KitCopy } from "../kit-sheet";

/** 見本の節（3D 商品コンフィギュレーターの紙と同じ、同梱の見本の商品ページ）を足した形 */
type ShopifyCopy = KitCopy & { demoHeading: string; demo: string[]; samePage: string; open: string };

const ja: ShopifyCopy = {
  meta: {
    title: "Shopify 用 3D コンフィギュレーター",
    description: "Shopify の商品ページに、3D で回して色・素材・パーツ・刻印を選べるコンフィギュレーターを置くテーマ部品です。選んだ内容はカートと注文に残ります。アプリの審査も月額も要りません。",
  },
  title: "Shopify 用 3D コンフィギュレーター",
  lede: "Shopify の商品ページに、3D で回して色・素材・パーツ・刻印を選べるコンフィギュレーターを置きます",
  intro:
    "アプリではなくテーマ部品なので、Shopify の審査も月額料金も要りません。テーマのコードの編集画面で section 1 つと assets 5 つを足し、商品メタフィールドに設定の JSON を 1 つ入れれば動きます。",
  demoHeading: "見本",
  demo: [
    "架空の店「みなと工房 オンラインストア」のステンレスタンブラーの商品ページです。本体の色 2 つ × 容量 2 つ × 刻印の有無で 8 つのバリエーションを持つ商品で、選ぶたびに価格が ¥3,800〜¥4,700 の間で変わります。",
    "見本のカートは本物のカートにつながっていません。「カートに入れる」を押すと、カートに届く内容を画面の下に出します。同じ見本の商品ページは zip にも入っていて、Shopify が無くても手元で動きを確かめられます。",
  ],
  samePage: "3D 商品コンフィギュレーターのページでも見る",
  open: "見本を別の画面で開く",
  sections: [
    {
      heading: "できること",
      list: [
        "色や容量を押すたびに、3D の商品と価格がその場で変わります。価格は、選んだ組み合わせに当たるバリエーションの価格です",
        "選んだ内容はカートの行に載ります。カートとチェックアウトには「刻印の文字: MINATO」のような行が出て、管理画面の注文詳細には選択の控えと、開くと同じ 3D が出る URL が残ります",
        "選択肢は色・素材・パーツの出し分け（容量違いなど）・刻印・ロゴの 5 種類です。組み合わせは JSON に書くだけで、プログラムは書きません",
        "設定は商品ごとのメタフィールドに、3D モデル（GLB）は Shopify の「ファイル」に置きます。サーバー・外部サービス・API キーは要りません",
        "選択肢の下に「PNG で保存」「共有 URL をコピー」「最初に戻す」のボタンが出ます",
        "お客さまの画面の文言は日本語と英語です。ストアの表示の言語に合わせて切り替わります",
        "設定に誤りがあるとき、お客さまの画面には一言だけを出し、直すところの一覧はテーマエディタの中に出します",
        "メタフィールドが空の商品では何も表示しないので、3D の無い商品と同じ商品テンプレートを使えます",
      ],
    },
    {
      heading: "こんな方に",
      list: [
        "タンブラー・家具・看板・アパレル・ノベルティのように、色や素材を選ぶ商品を Shopify で売っているお店・メーカーの方",
        "3D のアプリの月額が重い方、アプリを増やさずテーマだけで済ませたい方",
        "名入れや組み合わせの内容を、注文にきちんと残したい方",
        "Shopify の構築を請け負う制作会社・フリーランスの方。お客さまのストアに納める部品として使えます",
      ],
    },
    {
      heading: "請求の仕組み",
      text: [
        "Shopify で実際に請求される金額は、カートに入ったバリエーションの価格だけです。テーマに足すファイルからは価格を書き換えられないので、価格の出し方を 2 つ用意しています。商品ごとに選べます。",
        "バリエーション方式（おすすめ）は、色・容量・刻印の有無といった群を商品のオプションに結びつけ、選んだ組み合わせに当たるバリエーションの価格を出して、そのバリエーションをカートに入れます。表示と請求が必ず一致します。結べる群は、Shopify の商品のオプションと同じく 3 つまでです。",
        "参考価格方式は、バリエーションの価格に群ごとの差額を足した額を「参考価格」として出し、注記を必ず添えます。カートとお支払いの画面に出る金額はバリエーションの価格だけで、差額はお店がご注文のあとに別に受け取ります。差額が小さい商品や受注生産のお店に向いています。",
      ],
    },
    {
      heading: "守り",
      list: [
        "選んだ内容を送る先は、同じストアのカートだけです。外部のサービスには何も送りません",
        "お客さまがロゴに選んだ画像は、ブラウザの中で 3D に貼るだけで、どこにも送りません",
        "刻印の文字は、設定で決めた字の種類と字数を、入力のときに画面で確かめます。注文に残る値はお客さまのブラウザから送られた値なので、作る前にお店で確かめてください",
        "設定の JSON は、お店の管理者しか書けないメタフィールドに置きます。ページでは JSON として読むだけで、プログラムとしては動かしません",
        "テーマの script を書き換えるアプリが入っていると動きません。その場合は、キットのファイルを書き換えの対象から外してください",
      ],
    },
    {
      heading: "費用",
      text: [
        "部品は買い切りです。アプリの月額はかかりません。サーバーも外部の API も使わないので、使うほど増える費用もありません。設定も 3D モデルも、お使いの Shopify のストアの中に置きます。",
      ],
    },
    {
      heading: "入っているもの",
      list: [
        "theme/（テーマに足す 7 ファイル。section 1 つ、テーマの購入ボタンに載せるときの snippet 1 つ、assets 5 つ）",
        "samples/（設定の見本 2 本と、見本の 3D モデル）",
        "page/mock-product.html（Shopify 無しで動きを確かめられる見本の商品ページ）",
        "src/（Shopify とのつなぎの部分の元のコード。改変は自由です）",
        "README.ja.md・README.en.md・LICENSE.md・CHANGELOG.md・THIRD-PARTY-NOTICES.md",
      ],
    },
    {
      heading: "動作環境",
      text: [
        "Online Store 2.0 のテーマ。Shopify の開発ストアで、Dawn 16.0.0・Horizon 4.2.0・開発ストアの既定テーマの 3 つに入れて確かめています。参考価格方式でのテスト注文、日本円のほかの通貨、テーマの購入ボタンに載せる方式は、まだ確かめていません。確かめたことと、まだ確かめていないことの一覧は、同梱の README にあります。",
        "3D モデル（.glb）はお店でご用意ください。3D モデルの制作そのものは含みません。お客さまのブラウザは、WebGL の使える現行のブラウザです。",
      ],
    },
  ],
  buyHeading: "価格と購入",
  buy: "買った方は、その後の 1.x のアップデートも無料で受け取れます。改変と、お客さまのストアへの組み込み納品は自由です。再配布・転売・同種商品化と、Shopify のアプリやテーマとしての公開・販売はできません。Shopify 以外のサイトに置く場合は、別の商品の「3D 商品コンフィギュレーター」をお使いください",
  service:
    "設置を任せたい方には、導入の代行（¥100,000）があります。GLB のパーツの名前の確認、メタフィールドの設定、商品のオプションとバリエーションの対応づけ、テーマへの設置、テスト注文での確認までを、商品 3 点まで・14 日・修正 2 回で行います（GLB の制作とテーマの改修は含みません）。ココナラ・ランサーズでお受けしています。",
};

export const copy: Record<"ja" | "en" | "fr", ShopifyCopy> = {
  ja,
  en: {
    meta: {
      title: "3D Configurator for Shopify",
      description: "A theme component that adds a 3D configurator to Shopify product pages, where customers rotate the product and choose colors, materials, parts, and engraving. Choices stay with the cart and order. No app review, no monthly fee.",
    },
    title: "3D Configurator for Shopify",
    lede: "Adds a configurator to Shopify product pages where customers rotate the product in 3D and choose colors, materials, parts, and engraving",
    intro:
      "It is a theme component, not an app, so there is no Shopify app review and no monthly fee. Add one section and five assets in the theme code editor, put one settings JSON in a product metafield, and it works.",
    demoHeading: "Sample",
    demo: [
      "A product page for a stainless tumbler from a fictional workshop’s online store. The product has 8 variants (2 body colors × 2 capacities × with or without engraving), and the price changes between ¥3,800 and ¥4,700 as you choose.",
      "The sample cart isn’t connected to a real cart: pressing add to cart shows, at the bottom of the screen, what would reach the cart. The same sample product page is in the zip, so you can try it locally without Shopify.",
    ],
    samePage: "See it on the 3D Product Configurator page",
    open: "Open the sample in a new window",
    sections: [
      {
        heading: "What it does",
        list: [
          "Each time a color or capacity is pressed, the 3D product and the price change on the spot. The price is that of the variant matching the chosen combination",
          "Choices go onto the cart line. Cart and checkout show lines such as the engraving text, and the order details in the admin keep a record of the choices and a URL that opens the same 3D view",
          "Five kinds of options: color, material, part switching (such as capacity), engraving, and logo. Combinations are written in JSON, with no programming",
          "Settings live in each product’s metafield and the 3D model (GLB) in Shopify Files. No server, external service, or API key needed",
          "Buttons under the options save a PNG, copy a share URL, and reset",
          "Customer-facing text is in Japanese and English, following the store’s display language",
          "If the settings contain an error, customers see a single short message, and the list of fixes appears in the theme editor",
          "Products with an empty metafield show nothing, so they can share the same product template as products without 3D",
        ],
      },
      {
        heading: "Who it’s for",
        list: [
          "Shops and makers selling products with color or material choices on Shopify, such as tumblers, furniture, signs, apparel, and promotional goods",
          "Those for whom a 3D app’s monthly fee is heavy, or who want to stay with the theme without adding apps",
          "Those who want engraving and combinations recorded properly in the order",
          "Agencies and freelancers who build Shopify stores, as a component to deliver to clients",
        ],
      },
      {
        heading: "How billing works",
        text: [
          "The amount Shopify actually charges is only the price of the variant in the cart. Files added to a theme can’t rewrite prices, so there are two pricing modes, chosen per product.",
          "Variant mode (recommended) ties groups such as color, capacity, and engraving to product options, shows the price of the matching variant, and adds that variant to the cart. Display and charge always match. Up to 3 groups can be tied, as Shopify products allow up to 3 options.",
          "Reference price mode shows the variant price plus each group’s surcharge as a “reference price”, always with a notice. Cart and checkout show only the variant price, and the shop collects the difference separately after the order. It suits products with small differences or made-to-order shops.",
        ],
      },
      {
        heading: "Safeguards",
        list: [
          "Choices are sent only to the same store’s cart. Nothing goes to external services",
          "A logo image chosen by the customer is only applied to the 3D model in the browser and sent nowhere",
          "Engraving text is checked on screen against the allowed characters and length you set. Values in the order come from the customer’s browser, so check them before production",
          "The settings JSON lives in a metafield only store admins can write. The page reads it as JSON and never runs it as a program",
          "Apps that rewrite theme scripts stop it from working; exclude the kit’s files from such rewriting",
        ],
      },
      {
        heading: "Costs",
        text: [
          "The component is a one-time purchase. No app subscription. It uses no server or external API, so there are no usage-based costs. Settings and 3D models stay in your own Shopify store.",
        ],
      },
      {
        heading: "What’s included",
        list: [
          "theme/ (7 files to add to the theme: 1 section, 1 snippet for using the theme’s buy button, 5 assets)",
          "samples/ (2 sample settings and a sample 3D model)",
          "page/mock-product.html (a sample product page to try without Shopify)",
          "src/ (source code of the Shopify integration; you may modify it)",
          "README.ja.md, README.en.md, LICENSE.md, CHANGELOG.md, THIRD-PARTY-NOTICES.md",
        ],
      },
      {
        heading: "Requirements",
        text: [
          "An Online Store 2.0 theme. Tested on a Shopify development store with Dawn 16.0.0, Horizon 4.2.0, and the development store’s default theme. A test order in reference price mode, currencies other than Japanese yen, and the theme buy button method have not been tested yet. The bundled README lists what has and hasn’t been tested.",
          "Please provide your own 3D model (.glb); creating 3D models isn’t included. Customers need a current browser with WebGL.",
        ],
      },
    ],
    buyHeading: "Price and purchase",
    buy: " Buyers receive later 1.x updates free. Modifying it and delivering it built into a client’s store are allowed; redistribution, resale, selling it as a similar product, and publishing or selling it as a Shopify app or theme are not. For sites other than Shopify, use the separate 3D Product Configurator",
    service:
      "If you’d like the setup done for you, a setup service is available (¥100,000): checking GLB part names, metafield settings, mapping options to variants, theme installation, and a test order, for up to 3 products, in 14 days with 2 revisions (GLB creation and theme customization not included), through Coconala and Lancers (in Japanese).",
  },
  fr: {
    meta: {
      title: "Configurateur 3D pour Shopify",
      description: "Un composant de thème qui ajoute aux pages produit Shopify un configurateur 3D où l’on fait tourner le produit et choisit couleurs, matières, pièces et gravure. Les choix restent dans le panier et la commande. Sans validation d’application ni abonnement.",
    },
    title: "Configurateur 3D pour Shopify",
    lede: "Ajoute aux pages produit Shopify un configurateur où l’on fait tourner le produit en 3D et choisit couleurs, matières, pièces et gravure",
    intro:
      "C’est un composant de thème, pas une application : ni validation d’application Shopify ni abonnement. Ajoutez une section et cinq assets dans l’éditeur de code du thème, placez un JSON de réglages dans un métachamp produit, et c’est prêt.",
    demoHeading: "Exemple",
    demo: [
      "La page produit d’un gobelet inox d’une boutique en ligne d’atelier fictive. Le produit a 8 variantes (2 couleurs × 2 contenances × avec ou sans gravure), et le prix varie entre 3 800 ¥ et 4 700 ¥ selon les choix.",
      "Le panier de l’exemple n’est pas relié à un vrai panier : le bouton d’ajout affiche en bas de l’écran ce qui arriverait dans le panier. La même page produit d’exemple est dans le zip, pour essayer en local sans Shopify.",
    ],
    samePage: "Voir aussi sur la page du Configurateur de produit 3D",
    open: "Ouvrir l’exemple dans une nouvelle fenêtre",
    sections: [
      {
        heading: "Ce qu’il fait",
        list: [
          "À chaque choix de couleur ou de contenance, le produit 3D et le prix changent aussitôt. Le prix est celui de la variante correspondant à la combinaison",
          "Les choix sont ajoutés à la ligne du panier. Panier et paiement affichent des lignes comme le texte gravé, et le détail de commande dans l’admin garde le récapitulatif des choix et une URL qui rouvre la même vue 3D",
          "Cinq types d’options : couleur, matière, pièces interchangeables (contenance, par exemple), gravure et logo. Les combinaisons s’écrivent en JSON, sans programmation",
          "Les réglages sont dans le métachamp de chaque produit et le modèle 3D (GLB) dans les fichiers Shopify. Ni serveur, ni service externe, ni clé d’API",
          "Sous les options, des boutons enregistrent un PNG, copient une URL de partage et réinitialisent",
          "Les textes côté client sont en japonais et en anglais, selon la langue d’affichage de la boutique",
          "En cas d’erreur de réglage, le client ne voit qu’un court message, et la liste des corrections s’affiche dans l’éditeur de thème",
          "Les produits au métachamp vide n’affichent rien : ils peuvent partager le même modèle de page que les produits sans 3D",
        ],
      },
      {
        heading: "Pour qui",
        list: [
          "Boutiques et fabricants qui vendent sur Shopify des produits à choix de couleur ou de matière : gobelets, mobilier, enseignes, vêtements, objets promotionnels",
          "Ceux que l’abonnement d’une application 3D freine, ou qui veulent s’en tenir au thème sans ajouter d’application",
          "Ceux qui veulent que la gravure et les combinaisons soient bien enregistrées dans la commande",
          "Agences et indépendants qui montent des boutiques Shopify, comme composant à livrer aux clients",
        ],
      },
      {
        heading: "Facturation",
        text: [
          "Le montant réellement facturé par Shopify est uniquement le prix de la variante dans le panier. Les fichiers ajoutés au thème ne peuvent pas modifier les prix : deux modes de prix existent, au choix pour chaque produit.",
          "Le mode variantes (recommandé) relie des groupes comme la couleur, la contenance ou la gravure aux options du produit, affiche le prix de la variante correspondante et l’ajoute au panier. Affichage et facturation concordent toujours. On peut relier jusqu’à 3 groupes, comme les 3 options d’un produit Shopify.",
          "Le mode prix de référence affiche le prix de la variante augmenté des suppléments de chaque groupe comme « prix de référence », toujours avec une mention. Panier et paiement n’affichent que le prix de la variante, et la boutique encaisse la différence à part après la commande. Il convient aux petits écarts ou à la fabrication sur commande.",
        ],
      },
      {
        heading: "Protections",
        list: [
          "Les choix ne sont envoyés qu’au panier de la même boutique. Rien ne part vers des services externes",
          "L’image de logo choisie par le client est seulement appliquée au modèle 3D dans le navigateur, et envoyée nulle part",
          "Le texte de gravure est vérifié à l’écran selon les caractères et la longueur autorisés. Les valeurs de la commande viennent du navigateur du client : vérifiez-les avant fabrication",
          "Le JSON de réglages est dans un métachamp que seuls les administrateurs peuvent écrire. La page le lit comme du JSON, sans jamais l’exécuter",
          "Les applications qui réécrivent les scripts du thème l’empêchent de fonctionner ; excluez les fichiers du kit de ces réécritures",
        ],
      },
      {
        heading: "Coûts",
        text: [
          "Le composant est un achat unique. Pas d’abonnement d’application. Il n’utilise ni serveur ni API externe : aucun coût à l’usage. Réglages et modèles 3D restent dans votre boutique Shopify.",
        ],
      },
      {
        heading: "Contenu",
        list: [
          "theme/ (7 fichiers à ajouter au thème : 1 section, 1 snippet pour utiliser le bouton d’achat du thème, 5 assets)",
          "samples/ (2 réglages d’exemple et un modèle 3D d’exemple)",
          "page/mock-product.html (une page produit d’exemple à essayer sans Shopify)",
          "src/ (code source de l’intégration Shopify ; modification libre)",
          "README.ja.md, README.en.md, LICENSE.md, CHANGELOG.md, THIRD-PARTY-NOTICES.md",
        ],
      },
      {
        heading: "Prérequis",
        text: [
          "Un thème Online Store 2.0. Testé sur une boutique de développement Shopify avec Dawn 16.0.0, Horizon 4.2.0 et le thème par défaut de la boutique de développement. Une commande test en mode prix de référence, les devises autres que le yen et la méthode du bouton d’achat du thème n’ont pas encore été testées. Le README fourni liste ce qui a été testé ou non.",
          "Fournissez votre propre modèle 3D (.glb) ; sa création n’est pas incluse. Côté client, un navigateur récent compatible WebGL.",
        ],
      },
    ],
    buyHeading: "Prix et achat",
    buy: " Les acheteurs reçoivent gratuitement les mises à jour 1.x. Modification et livraison intégrée à la boutique d’un client autorisées ; redistribution, revente, vente comme produit similaire et publication ou vente comme application ou thème Shopify interdites. Pour un site hors Shopify, utilisez le Configurateur de produit 3D, vendu séparément",
    service:
      "Pour confier l’installation, un service existe (100 000 ¥) : vérification des noms de pièces du GLB, réglage des métachamps, correspondance options–variantes, installation dans le thème et commande test, jusqu’à 3 produits, en 14 jours avec 2 révisions (création du GLB et modification du thème non incluses), via Coconala et Lancers (en japonais).",
  },
};
