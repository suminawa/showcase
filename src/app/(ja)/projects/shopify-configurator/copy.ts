import type { KitSales } from "../kit-parts";
import type { KitSection } from "../kit-sheet";

const SOURCES = {
  easify: "https://apps.shopify.com/easify-product-options",
  shopify3d: "https://help.shopify.com/en/manual/products/product-media/product-media-types",
  bits: "https://apps.shopify.com/3d-bits-1",
};

/** 比べる相手のページを読んだ日 */
const CHECKED_ON = "2026-10-20";

const jaSales: KitSales = {
  proof: [
    { figure: "220 件", label: "自動テストの数です。版を出すたびに、すべて通してからお届けしています（1.1.0）。" },
    { figure: "0 円", label: "アプリの月額と売上の手数料です。テーマにファイルを足すだけで、サーバーも外部のサービスも使いません。" },
    { figure: "3 つ", label: "Shopify の開発ストアに入れて確かめたテーマです（Dawn 16.0.0・Horizon 4.2.0・開発ストアの既定のテーマ）。" },
    { figure: "14 日", label: "ご購入から、不具合と使い方のご質問にメールでお答えする期間です。" },
  ],
  audience: {
    fits: [
      "Shopify の構築・運用を請け負う制作会社・フリーランスの方。お客さまのストアに組み込んで納品できます（ストアの数に制限はありません）",
      "名入れのタンブラー・革小物・ギフトなど、色・容量・刻印を選ぶ商品を Shopify で売っているお店・メーカーの方",
      "刻印の文字や組み合わせを、注文詳細にきちんと残したい方（漢字・ひらがな・カタカナも入ります）",
      "ご自身で貼るのが不安な方（設置までお任せいただけます。下の「お値段」をご覧ください）",
    ],
    notFor: [
      "3D モデル（.glb）が無く、ご自身でも用意しない方（モデルの制作は含みません。用意の道は下の「つまずきやすいところ」に）",
      "3D は要らず、刻印の文字の欄だけを足したい方（下の比較の無料のアプリで足ります）",
      "AR（スマホのカメラで部屋に置いて見る機能）が要る方（ありません。Shopify 標準の 3D には AR があります）",
      "Shopify 以外のサイトに置きたい方（3D 商品コンフィギュレーターをお選びください）",
    ],
  },
  compare: {
    rows: [
      {
        kind: "無料の道具",
        name: "Easify Product Options（Shopify アプリ）",
        href: SOURCES.easify,
        cost: "無料のプランあり（有料は月 $9.99 から）",
        note: "商品ページに刻印の文字などの入力欄を足せるアプリです。3D はありません。3D が要らないお店は、これで足ります。",
      },
      {
        kind: "標準の機能",
        name: "Shopify の 3D モデル（商品のメディア）",
        href: SOURCES.shopify3d,
        cost: "0 円（Shopify の料金に含まれます）",
        note: "回して見せられ、AR にも対応します。色を変えても刻印を入れても、3D も価格も動きません。",
      },
      {
        kind: "似たサービス",
        name: "3D Bits（Shopify アプリ）",
        href: SOURCES.bits,
        cost: "月 $25 から（名入れなどは月 $120 のプラン）",
        note: "3D で見せて選ばせる、月額のアプリです。",
      },
    ],
    kit: "色・容量・刻印を選ぶと 3D とバリエーションの価格が変わり、選んだ内容がカートと注文詳細に残ります。買い切りで、月額も手数料もかかりません。AR はありません。",
    checkedOn: CHECKED_ON,
  },
  steps: [
    {
      heading: "商品の 3D モデル（GLB）を用意するとき",
      intro: "設定は、モデルの中のパーツの名前で、色・材質・出し分け・刻印を結びつけます。Blender で書き出すときは、次の順に進めてください。",
      items: [
        "色や材質を変えるパーツ、出し分けるパーツ、刻印やロゴを貼る面を、それぞれ別のオブジェクトにして名前を付けます。",
        "刻印を貼る面に UV を付けます。曲面に貼るときは、正面から見える範囲に収まる幅にします。",
        "「ファイル → エクスポート → glTF 2.0」で「glTF バイナリ（.glb）」を選び、圧縮（Draco）はオフにして書き出します。",
        "管理画面の「コンテンツ → ファイル」に .glb を上げ、ファイルの URL を設定の model.src に書きます。",
        "商品ページの 3D の下に「モデルに無い名前」が出たら、その名前を設定かモデルの側で合わせます。",
      ],
      after: "大きさは 5 MB 以下、できれば 2 MB 以下が目安です。お手元に 3D モデルが無いときは、写真から 3D モデルを作る制作会社に頼めます。まずは同梱の見本の GLB で、動きを確かめてから進めてください。",
    },
    {
      heading: "テーマに足すとき（テーマのコードの編集画面）",
      intro: "テーマの元のファイルは触りません。足す順番だけ、お守りください。",
      items: [
        "「オンラインストア → テーマ」で、テーマのコードの編集画面を開きます。",
        "先に assets フォルダへ theme/assets の 5 ファイルを足します（section を先に足すと「assets のファイルがありません」と出ます）。",
        "次に sections フォルダへ suminawa-configurator.liquid を足します。",
        "テーマエディタで商品テンプレートを開き、セクションの追加から「3D Configurator」を選びます。",
        "テーマが元から出している価格・バリエーションの選択・数量の欄・購入ボタンのブロックを、目のアイコンで非表示にします。",
      ],
      after: "商品ページに「3D のカスタマイズ画面を表示できません」と出るときは、メタフィールド custom.configurator が空か、設定に誤りがあります。テーマエディタで開くと、直すところが一覧で出ます。その間も、標準の購入フォームで買えます。",
    },
  ],
};

const jaSections: KitSection[] = [
  {
    heading: "できること",
    list: [
      "色や容量を押すたびに、3D の商品と価格がその場で変わります。価格は、選んだ組み合わせに当たるバリエーションの価格です",
      "選んだ内容はカートの行に載ります。カートとチェックアウトには「刻印の文字: MINATO」のような行が出て、管理画面の注文詳細には選択の控えと、開くと同じ 3D が出る URL が残ります",
      "選択肢は色・素材・パーツの出し分け（容量違いなど）・刻印・ロゴの 5 種類です。組み合わせは JSON に書くだけで、プログラムは書きません",
      "刻印には漢字・ひらがな・カタカナも入ります。使える文字は設定で変えられます",
      "選ぶと在庫切れになる選択肢には印が付き、いまの組み合わせが買えないときは、変えれば買える選択肢をご案内します",
      "設定は商品ごとのメタフィールドに、3D モデル（GLB）は Shopify の「ファイル」に置きます。サーバー・外部サービス・API キーは要りません",
      "お客さまの画面の文言は日本語と英語です。ストアの表示の言語に合わせて切り替わります",
      "設定に誤りがあるときも販売は止まりません。お客さまの画面には一言と標準の購入フォームを出し、直すところの一覧はテーマエディタの中に出します",
      "メタフィールドが空の商品では何も表示しないので、3D の無い商品と同じ商品テンプレートを使えます",
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
    heading: "入っているもの",
    list: [
      "theme/（テーマに足す 7 ファイル。section 1 つ、テーマの購入ボタンに載せるときの snippet 1 つ、assets 5 つ）",
      "samples/（設定の見本 2 本と、見本の 3D モデル）",
      "page/mock-product.html（Shopify 無しで動きを確かめられる見本の商品ページ。このページの見本と同じものです）",
      "src/（Shopify とのつなぎの部分の元のコード。改変は自由です）",
      "README.ja.md・README.en.md・VERIFIED-THEMES.ja.md・VERIFIED-THEMES.en.md・LICENSE.md・CHANGELOG.md・THIRD-PARTY-NOTICES.md",
    ],
  },
  {
    heading: "動作環境",
    text: [
      "Online Store 2.0 のテーマ。Shopify の開発ストアで、Dawn 16.0.0・Horizon 4.2.0・開発ストアの既定のテーマの 3 つに入れて確かめています（2026-09-29）。1.1.0 で変えたところは見本の商品ページで確かめていて、実際のストアではまだ確かめていません。参考価格方式でのテスト注文、日本円のほかの通貨、テーマの購入ボタンに載せる方式も、まだ確かめていません。確かめたことと、まだ確かめていないことの一覧は、同梱の VERIFIED-THEMES.ja.md にあります。",
      "3D モデル（.glb）はお店でご用意ください。3D モデルの制作そのものは含みません。お客さまのブラウザは、WebGL の使える現行のブラウザです。",
    ],
  },
  {
    heading: "ライセンス",
    text: [
      "買った方は、その後の 1.x のアップデートも無料で受け取れます。改変と、お客さまのストアへの組み込み納品は自由です。再配布・転売・同種商品化と、Shopify のアプリやテーマとしての公開・販売はできません。",
    ],
  },
];

const ja = {
  meta: {
    title: "Shopify で名入れ商品を 3D で見せて売る｜色・刻印で価格が変わり、注文に残る（Shopify 用 3D コンフィギュレーター）",
    description: "Shopify 標準の 3D は回せるだけです。このテーマ部品を足すと、色・容量・刻印を選ぶたびに 3D と価格が変わり、選んだ内容がカートと注文に残ります。アプリではないので審査も月額もありません。見本の商品ページをその場で触れます。",
  },
  name: "Shopify 用 3D コンフィギュレーター",
  title: "Shopify で名入れ商品を 3D で見せて売る",
  lede: "Shopify 標準の 3D は回せるだけです。この部品を足すと、色・容量・刻印を選ぶたびに 3D と価格が変わり、選んだ内容が注文に残ります。アプリではないので月額はかかりません。",
  /** 見本の上の一行（見本の店の頭は枠の外に出すので、ここで見本であることを言う） */
  demoNote: "架空の店の商品ページの見本です（カートは本物ではありません）。",
  /** 2 択の一行（Shopify を使わない方は 3D 商品コンフィギュレーターへ）。値段は部品が projects.ts から組む */
  choice: {
    before: "Shopify を使わず、ご自身のサイトに置く方は ",
    link: "3D 商品コンフィギュレーター",
    after: (price: string) => `（${price}）をお選びください。`,
  },
  samePage: "3D 商品コンフィギュレーターのページでも見る",
  open: "見本を別の画面で開く（店の頭と英語の表示つき）",
  sections: jaSections,
  serviceHeading: "設置の代行",
  service:
    "設置を任せたい方には、導入の代行があります（お値段は上の「お値段」の「設置まで頼む」）。GLB のパーツの名前の確認、メタフィールドの設定、商品のオプションとバリエーションの対応づけ、テーマへの設置、テスト注文での確認までを、商品 3 点まで・14 日・修正 2 回で行います（GLB の制作とテーマの改修は含みません）。ココナラ・ランサーズからもお受けしています。",
  sales: jaSales,
};

export const copy: Record<"ja" | "en" | "fr", typeof ja> = {
  ja,
  en: {
    meta: {
      title: "Show engraved products in 3D on Shopify | Color and engraving change the price and stay on the order (3D Configurator for Shopify)",
      description: "Shopify’s built-in 3D only rotates. Add this theme component and every choice of color, size, or engraving updates the 3D view and the price, and the choices stay with the cart and the order. It isn’t an app: no review, no monthly fee. Try the sample product page here.",
    },
    name: "3D Configurator for Shopify",
    title: "Show engraved products in 3D on Shopify",
    lede: "Shopify’s built-in 3D only rotates. Add this component and every choice of color, size, or engraving updates the 3D view and the price, and the choices stay on the order. It isn’t an app, so there’s no monthly fee.",
    demoNote: "A sample product page for a fictional shop (the cart isn’t real).",
    choice: {
      before: "Not on Shopify? For your own site, choose the ",
      link: "3D Product Configurator",
      after: (price: string) => ` (${price}).`,
    },
    samePage: "See it on the 3D Product Configurator page",
    open: "Open the sample in a new window (with the store header)",
    sections: [
      {
        heading: "What it does",
        list: [
          "Each time a color or capacity is pressed, the 3D product and the price change on the spot. The price is that of the variant matching the chosen combination",
          "Choices go onto the cart line. Cart and checkout show lines such as the engraving text, and the order details in the admin keep a record of the choices and a URL that opens the same 3D view",
          "Five kinds of options: color, material, part switching (such as capacity), engraving, and logo. Combinations are written in JSON, with no programming",
          "Engraving accepts Japanese characters (kanji, hiragana, katakana) as well. The allowed characters can be changed in the settings",
          "Options that would be out of stock are marked, and when the current combination can’t be bought, it suggests which choice to change",
          "Settings live in each product’s metafield and the 3D model (GLB) in Shopify Files. No server, external service, or API key needed",
          "Customer-facing text is in Japanese and English, following the store’s display language",
          "Errors in the settings don’t stop sales: customers see a short message and the standard purchase form, and the list of fixes appears in the theme editor",
          "Products with an empty metafield show nothing, so they can share the same product template as products without 3D",
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
        heading: "What’s included",
        list: [
          "theme/ (7 files to add to the theme: 1 section, 1 snippet for using the theme’s buy button, 5 assets)",
          "samples/ (2 sample settings and a sample 3D model)",
          "page/mock-product.html (a sample product page to try without Shopify; the same one as the sample on this page)",
          "src/ (source code of the Shopify integration; you may modify it)",
          "README.ja.md, README.en.md, VERIFIED-THEMES.ja.md, VERIFIED-THEMES.en.md, LICENSE.md, CHANGELOG.md, THIRD-PARTY-NOTICES.md",
        ],
      },
      {
        heading: "Requirements",
        text: [
          "An Online Store 2.0 theme. Tested on a Shopify development store with Dawn 16.0.0, Horizon 4.2.0, and the development store’s default theme (September 29, 2026). The changes in 1.1.0 were checked on the sample product page, not yet on a real store. A test order in reference price mode, currencies other than Japanese yen, and the theme buy button method have not been tested yet either. The bundled VERIFIED-THEMES.en.md lists what has and hasn’t been tested.",
          "Please provide your own 3D model (.glb); creating 3D models isn’t included. Customers need a current browser with WebGL.",
        ],
      },
      {
        heading: "License",
        text: [
          "Buyers receive later 1.x updates free. Modifying it and delivering it built into a client’s store are allowed; redistribution, resale, selling it as a similar product, and publishing or selling it as a Shopify app or theme are not.",
        ],
      },
    ],
    serviceHeading: "Setup service",
    service:
      "If you’d like the setup done for you, a setup service is available (see “Setup done for you” under Price above): checking GLB part names, metafield settings, mapping options to variants, theme installation, and a test order, for up to 3 products, in 14 days with 2 revisions (GLB creation and theme customization not included). It is also offered through Coconala and Lancers (in Japanese).",
    sales: {
      proof: [
        { figure: "220", label: "Automated tests. Every release passes all of them before it ships (1.1.0)." },
        { figure: "¥0", label: "App subscription and sales commission. You add files to the theme; no server and no external service." },
        { figure: "3", label: "Themes tested on a Shopify development store (Dawn 16.0.0, Horizon 4.2.0, and the development store’s default theme)." },
        { figure: "14 days", label: "After purchase, we answer bug reports and usage questions by email." },
      ],
      audience: {
        fits: [
          "Are an agency or freelancer building and running Shopify stores: you may build it into a client’s store and deliver it (no limit on the number of stores)",
          "Sell products with color, size, or engraving choices on Shopify, such as engraved tumblers, leather goods, or gifts",
          "Want the engraving text and the combination recorded properly in the order details (Japanese characters work too)",
          "Would rather not install it yourself (setup can be done for you; see Price below)",
        ],
        notFor: [
          "Have no 3D model (.glb) and won’t prepare one (modeling isn’t included; ways to get one are under “Where people usually get stuck” below)",
          "Only need an engraving text field, without 3D (the free app compared below is enough)",
          "Need AR (placing the product in a room through the phone camera); it isn’t included, while Shopify’s built-in 3D has it",
          "Want it on a site other than Shopify (choose the 3D Product Configurator)",
        ],
      },
      compare: {
        rows: [
          {
            kind: "Free tool",
            name: "Easify Product Options (Shopify app)",
            href: SOURCES.easify,
            cost: "Free plan available (paid from $9.99/month)",
            note: "Adds input fields such as engraving text to product pages. No 3D. Shops that don’t need 3D can stop here.",
          },
          {
            kind: "Built-in feature",
            name: "Shopify 3D models (product media)",
            href: SOURCES.shopify3d,
            cost: "¥0 (included in Shopify)",
            note: "Rotates the model, with AR. Changing the color or adding engraving moves neither the 3D view nor the price.",
          },
          {
            kind: "Similar service",
            name: "3D Bits (Shopify app)",
            href: SOURCES.bits,
            cost: "From $25/month (personalization on the $120/month plan)",
            note: "A monthly app for showing and configuring products in 3D.",
          },
        ],
        kit: "Choosing a color, size, or engraving changes the 3D view and the variant price, and the choices stay on the cart and in the order details. One-time purchase, no monthly fee or commission. No AR.",
        checkedOn: CHECKED_ON,
      },
      steps: [
        {
          heading: "Preparing your product’s 3D model (GLB)",
          intro: "The settings tie colors, materials, part switching, and engraving to the names of parts inside the model. When exporting from Blender, go in this order.",
          items: [
            "Make each part that changes color or material, each part that is shown or hidden, and each surface for engraving or a logo a separate object, and name it.",
            "Give the engraving surface UVs. On a curved surface, keep it within the width visible from the front.",
            "Choose File → Export → glTF 2.0, pick “glTF Binary (.glb)”, and turn compression (Draco) off.",
            "Upload the .glb under Content → Files in the admin and write its URL into model.src in the settings.",
            "If “Not in the model” appears under the 3D view on the product page, match those names in the settings or in the model.",
          ],
          after: "Aim for 5 MB or less, ideally 2 MB or less. If you don’t have a 3D model, a studio that builds models from photos can make one. Try the sample GLB included in the kit first to see how it works.",
        },
        {
          heading: "Adding it to the theme (theme code editor)",
          intro: "The theme’s own files stay untouched. Just follow the order.",
          items: [
            "Under Online Store → Themes, open the theme code editor.",
            "First add the 5 files from theme/assets to the assets folder (adding the section first shows an error about missing assets).",
            "Then add suminawa-configurator.liquid to the sections folder.",
            "In the theme editor, open the product template and choose “3D Configurator” from Add section.",
            "Hide the theme’s own price, variant picker, quantity, and buy button blocks with the eye icon.",
          ],
          after: "If the product page says the 3D customization screen can’t be shown, the metafield custom.configurator is empty or the settings contain an error. Open it in the theme editor to see the list of fixes. Meanwhile, customers can still buy through the standard purchase form.",
        },
      ],
    },
  },
  fr: {
    meta: {
      title: "Vendre des produits gravés en 3D sur Shopify | Couleur et gravure changent le prix et restent dans la commande (Configurateur 3D pour Shopify)",
      description: "La 3D standard de Shopify ne fait que tourner. Avec ce composant de thème, chaque choix de couleur, de contenance ou de gravure met à jour la 3D et le prix, et les choix restent dans le panier et la commande. Ce n’est pas une application : ni validation ni abonnement. Essayez la page produit d’exemple ici.",
    },
    name: "Configurateur 3D pour Shopify",
    title: "Vendre des produits gravés en 3D sur Shopify",
    lede: "La 3D standard de Shopify ne fait que tourner. Avec ce composant, chaque choix de couleur, de contenance ou de gravure met à jour la 3D et le prix, et les choix restent dans la commande. Ce n’est pas une application : pas d’abonnement.",
    demoNote: "Page produit d’exemple d’une boutique fictive (le panier n’est pas réel).",
    choice: {
      before: "Pas sur Shopify ? Pour votre propre site, choisissez le ",
      link: "Configurateur de produit 3D",
      after: (price: string) => ` (${price}).`,
    },
    samePage: "Voir aussi sur la page du Configurateur de produit 3D",
    open: "Ouvrir l’exemple dans une nouvelle fenêtre (avec l’en-tête de la boutique)",
    sections: [
      {
        heading: "Ce qu’il fait",
        list: [
          "À chaque choix de couleur ou de contenance, le produit 3D et le prix changent aussitôt. Le prix est celui de la variante correspondant à la combinaison",
          "Les choix sont ajoutés à la ligne du panier. Panier et paiement affichent des lignes comme le texte gravé, et le détail de commande dans l’admin garde le récapitulatif des choix et une URL qui rouvre la même vue 3D",
          "Cinq types d’options : couleur, matière, pièces interchangeables (contenance, par exemple), gravure et logo. Les combinaisons s’écrivent en JSON, sans programmation",
          "La gravure accepte aussi les caractères japonais (kanji, hiragana, katakana). Les caractères permis se règlent dans les réglages",
          "Les options qui mèneraient à une rupture de stock sont signalées, et si la combinaison actuelle n’est pas disponible, il indique quel choix changer",
          "Les réglages sont dans le métachamp de chaque produit et le modèle 3D (GLB) dans les fichiers Shopify. Ni serveur, ni service externe, ni clé d’API",
          "Les textes côté client sont en japonais et en anglais, selon la langue d’affichage de la boutique",
          "Une erreur de réglage n’arrête pas les ventes : le client voit un court message et le formulaire d’achat standard, et la liste des corrections s’affiche dans l’éditeur de thème",
          "Les produits au métachamp vide n’affichent rien : ils peuvent partager le même modèle de page que les produits sans 3D",
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
        heading: "Contenu",
        list: [
          "theme/ (7 fichiers à ajouter au thème : 1 section, 1 snippet pour utiliser le bouton d’achat du thème, 5 assets)",
          "samples/ (2 réglages d’exemple et un modèle 3D d’exemple)",
          "page/mock-product.html (une page produit d’exemple à essayer sans Shopify ; la même que l’exemple de cette page)",
          "src/ (code source de l’intégration Shopify ; modification libre)",
          "README.ja.md, README.en.md, VERIFIED-THEMES.ja.md, VERIFIED-THEMES.en.md, LICENSE.md, CHANGELOG.md, THIRD-PARTY-NOTICES.md",
        ],
      },
      {
        heading: "Prérequis",
        text: [
          "Un thème Online Store 2.0. Testé sur une boutique de développement Shopify avec Dawn 16.0.0, Horizon 4.2.0 et le thème par défaut de la boutique de développement (29 septembre 2026). Les changements de la 1.1.0 ont été vérifiés sur la page produit d’exemple, pas encore sur une vraie boutique. Une commande test en mode prix de référence, les devises autres que le yen et la méthode du bouton d’achat du thème n’ont pas encore été testées non plus. Le fichier VERIFIED-THEMES.en.md fourni liste ce qui a été testé ou non.",
          "Fournissez votre propre modèle 3D (.glb) ; sa création n’est pas incluse. Côté client, un navigateur récent compatible WebGL.",
        ],
      },
      {
        heading: "Licence",
        text: [
          "Les acheteurs reçoivent gratuitement les mises à jour 1.x. Modification et livraison intégrée à la boutique d’un client autorisées ; redistribution, revente, vente comme produit similaire et publication ou vente comme application ou thème Shopify interdites.",
        ],
      },
    ],
    serviceHeading: "Service d’installation",
    service:
      "Pour confier l’installation, un service existe (voir « Installation comprise » dans la section Prix ci-dessus) : vérification des noms de pièces du GLB, réglage des métachamps, correspondance options–variantes, installation dans le thème et commande test, jusqu’à 3 produits, en 14 jours avec 2 révisions (création du GLB et modification du thème non incluses). Il est aussi proposé via Coconala et Lancers (en japonais).",
    sales: {
      proof: [
        { figure: "220", label: "Tests automatisés. Chaque version les passe tous avant d’être livrée (1.1.0)." },
        { figure: "0 ¥", label: "D’abonnement d’application et de commission. On ajoute des fichiers au thème ; ni serveur ni service externe." },
        { figure: "3", label: "Thèmes testés sur une boutique de développement Shopify (Dawn 16.0.0, Horizon 4.2.0 et le thème par défaut)." },
        { figure: "14 jours", label: "Après l’achat, nous répondons par e-mail aux signalements de bugs et aux questions d’utilisation." },
      ],
      audience: {
        fits: [
          "Êtes une agence ou un indépendant qui crée et gère des boutiques Shopify : vous pouvez l’intégrer à la boutique d’un client et la livrer (sans limite de boutiques)",
          "Vendez sur Shopify des produits à choix de couleur, de contenance ou de gravure : gobelets gravés, maroquinerie, cadeaux",
          "Voulez que le texte gravé et la combinaison soient bien enregistrés dans le détail de commande (les caractères japonais fonctionnent aussi)",
          "Préférez ne pas l’installer vous-même (l’installation peut être faite pour vous ; voir Prix ci-dessous)",
        ],
        notFor: [
          "N’avez pas de modèle 3D (.glb) et ne comptez pas en préparer un (la modélisation n’est pas comprise ; les pistes sont dans « Là où l’on bloque » ci-dessous)",
          "Voulez seulement un champ de gravure, sans 3D (l’application gratuite comparée ci-dessous suffit)",
          "Avez besoin de la RA (poser le produit dans une pièce via l’appareil photo) ; elle n’y est pas, alors que la 3D standard de Shopify l’a",
          "Voulez l’installer sur un site hors Shopify (choisissez le Configurateur de produit 3D)",
        ],
      },
      compare: {
        rows: [
          {
            kind: "Outil gratuit",
            name: "Easify Product Options (application Shopify)",
            href: SOURCES.easify,
            cost: "Offre gratuite (payant dès 9,99 $/mois)",
            note: "Ajoute aux pages produit des champs comme le texte de gravure. Pas de 3D. Suffit aux boutiques qui n’ont pas besoin de 3D.",
          },
          {
            kind: "Fonction intégrée",
            name: "Modèles 3D de Shopify (médias produit)",
            href: SOURCES.shopify3d,
            cost: "0 ¥ (inclus dans Shopify)",
            note: "Fait tourner le modèle, avec la RA. Changer la couleur ou graver ne modifie ni la 3D ni le prix.",
          },
          {
            kind: "Service similaire",
            name: "3D Bits (application Shopify)",
            href: SOURCES.bits,
            cost: "À partir de 25 $/mois (personnalisation avec l’offre à 120 $/mois)",
            note: "Une application par abonnement pour montrer et configurer les produits en 3D.",
          },
        ],
        kit: "Choisir couleur, contenance ou gravure change la 3D et le prix de la variante, et les choix restent dans le panier et le détail de commande. Achat unique, sans abonnement ni commission. Pas de RA.",
        checkedOn: CHECKED_ON,
      },
      steps: [
        {
          heading: "Préparer le modèle 3D (GLB) du produit",
          intro: "Les réglages relient couleurs, matières, pièces et gravure aux noms des pièces du modèle. Pour exporter depuis Blender, procédez dans cet ordre.",
          items: [
            "Faites de chaque pièce qui change de couleur ou de matière, de chaque pièce affichée ou masquée et de chaque surface de gravure ou de logo un objet séparé, et nommez-le.",
            "Donnez des UV à la surface de gravure. Sur une surface courbe, restez dans la largeur visible de face.",
            "Choisissez Fichier → Exporter → glTF 2.0, le format « glTF binaire (.glb) », et désactivez la compression (Draco).",
            "Téléversez le .glb dans Contenu → Fichiers de l’admin et écrivez son URL dans model.src.",
            "Si « absent du modèle » s’affiche sous la 3D de la page produit, accordez ces noms dans les réglages ou dans le modèle.",
          ],
          after: "Visez 5 Mo maximum, idéalement 2 Mo. Sans modèle 3D, un studio qui modélise à partir de photos peut en créer un. Essayez d’abord le GLB d’exemple fourni pour voir le fonctionnement.",
        },
        {
          heading: "L’ajouter au thème (éditeur de code du thème)",
          intro: "Les fichiers d’origine du thème restent intacts. Respectez seulement l’ordre.",
          items: [
            "Dans Boutique en ligne → Thèmes, ouvrez l’éditeur de code du thème.",
            "Ajoutez d’abord les 5 fichiers de theme/assets au dossier assets (ajouter la section en premier affiche une erreur d’assets manquants).",
            "Ajoutez ensuite suminawa-configurator.liquid au dossier sections.",
            "Dans l’éditeur de thème, ouvrez le modèle de produit et choisissez « 3D Configurator » dans Ajouter une section.",
            "Masquez avec l’icône d’œil les blocs prix, sélecteur de variantes, quantité et bouton d’achat du thème.",
          ],
          after: "Si la page produit indique que l’écran de personnalisation 3D ne peut pas s’afficher, le métachamp custom.configurator est vide ou les réglages contiennent une erreur. Ouvrez-la dans l’éditeur de thème pour voir la liste des corrections. En attendant, le formulaire d’achat standard permet toujours d’acheter.",
        },
      ],
    },
  },
};
