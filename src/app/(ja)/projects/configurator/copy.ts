import type { KitSales } from "../kit-parts";

const SOURCES = {
  modelViewer: "https://modelviewer.dev/examples/scenegraph/",
  shopify3d: "https://help.shopify.com/en/manual/products/product-media/product-media-types",
  zakeke: "https://admin.zakeke.com/en-US/pricing",
};

/** 比べる相手のページを読んだ日 */
const CHECKED_ON = "2026-10-20";

const jaSales: KitSales = {
  proof: [
    { figure: "132 件", label: "自動テストの数です。版を出すたびに、すべて通してからお届けしています（1.1.0）。" },
    { figure: "0 円", label: "月額と売上の手数料です。サーバーも外部のサービスも使いません。" },
    { figure: "3 通り", label: "置き方です。ファイルを置いて数行を貼る素の HTML のほか、npm と React / Next.js から選べます。" },
    { figure: "14 日", label: "ご購入から、不具合と使い方のご質問にメールでお答えする期間です。" },
  ],
  audience: {
    fits: [
      "Web 制作会社・フリーランスの方。お客さまの商品ページに組み込んで納品できます（複数人で使うときは制作会社用のライセンスをお選びください）",
      "名入れのギフト・オーダー家具・工房の品など、色や素材の組み合わせが多い商品を自社のサイトで売っている方",
      "社内に Web の担当の方がいて、サイトにファイルを置き、商品ページに数行を貼れる方",
      "月額のサービスを増やさず、買い切りで置きたい方",
    ],
    notFor: [
      "3D モデル（.glb）が無く、ご自身でも用意しない方（モデルの制作は含みません。用意から頼みたい方は、別にお見積もりします）",
      "AR（スマホのカメラで部屋に置いて見る機能）や、選択肢を画面で直す管理画面が要る方（どちらもありません。選択肢は設定の JSON に書きます）",
      "Shopify のストアに置いて、選んだ内容を注文に残したい方（Shopify 版をお選びください）",
      "ページに JavaScript のファイルを置けないネットショップのサービスをお使いの方（置けません。置けるかどうか分からないときは、ご購入の前にお問い合わせください）",
    ],
  },
  compare: {
    rows: [
      {
        kind: "無料の道具",
        name: "<model-viewer>（Google のオープンソース）",
        href: SOURCES.modelViewer,
        cost: "0 円",
        note: "3D を回して見せ、素材や色を差し替えられます。選ぶ画面と価格の計算は、ご自身で作ります。3D を見せるだけで足りる方は、これで十分です。",
      },
      {
        kind: "標準の機能",
        name: "Shopify の 3D モデル（商品のメディア）",
        href: SOURCES.shopify3d,
        cost: "0 円（Shopify の料金に含まれます）",
        note: "GLB を上げると、商品ページで回して見せられ、AR にも対応します。色の切り替え・刻印・価格の連動はありません。",
      },
      {
        kind: "似たサービス",
        name: "Zakeke",
        href: SOURCES.zakeke,
        cost: "月 $59 から（年払い。月払いは $69.90）と、販売ごとの手数料",
        note: "色・刻印・画像を選べる月額のサービスです。管理画面と AR があります。",
      },
    ],
    kit: "色・素材・パーツ・刻印・ロゴを選ぶと、3D と価格がその場で変わります。選んだ内容は JSON・PNG・共有 URL で取り出せます。月額も手数料もかかりません。AR と管理画面はありません。",
    checkedOn: CHECKED_ON,
  },
  steps: [
    {
      heading: "お手持ちの商品の 3D モデル（.glb）を用意するとき",
      intro: "見本のタンブラーの代わりに、商品の 3D モデルを置きます。Blender で書き出すときは、次の順に進めてください。",
      items: [
        "色を変えるパーツ、出し分けるパーツ（容量違いなど）、刻印やロゴを貼る面を、それぞれ別のオブジェクトにして名前を付けます（例: body、lid）。",
        "刻印やロゴを貼る面は、本体とは別のオブジェクトにして UV を付けます（刻印は、その面の画像を置き換えて貼るためです）。",
        "「ファイル → エクスポート → glTF 2.0」で、形式を「glTF バイナリ（.glb）」にして書き出します。Draco などの圧縮はオフにします。",
        "設定の model.src を、書き出した .glb の場所に替えてページを開きます。",
        "3D の左上に「モデルに無い名前」が出たら、その名前を設定かモデルの側で合わせます（Blender の Body.001 のような名前は、そのまま書けます）。",
      ],
      after: "3D モデルをお持ちでない方は、写真や文から 3D モデルを作る AI のサービス（Meshy など）や、3D モデルの制作を請け負う方に頼む道があります。モデルの用意から頼みたい方は、別にお見積もりしますので、ご相談ください。",
    },
    {
      heading: "3D が出ない・色が変わらないとき",
      intro: "画面に出る言葉から、原因が分かります。",
      items: [
        "「3D の部品が見つかりません」と出る ── product-configurator-3d.global.js の置き場所が、設定の scene.src と合っていません。",
        "色が変わらないパーツがある ── 設定の名前とモデルの名前が違います。3D の左上の「モデルに無い名前」をご覧ください。",
        "「知らない項目です」と出て止まる ── 設定の項目名の綴りをご確認ください。",
        "刻印を入れたら、元の模様が消えた ── 刻印専用の面を別に作り、そちらを target にしてください。",
        "スマホで重い ── モデルの頂点数を減らすか、画像を 1,024 px 以下にしてください。",
      ],
      after: "npm や React で入れるときは、React 19（19.0〜19.2）が必要です。React 18 のサイトには、素の HTML の置き方をお選びください。",
    },
  ],
};

const ja = {
  meta: {
    title: "色・刻印を選ぶと 3D と価格が変わる商品ページ部品｜買い切り・月額なし（3D 商品コンフィギュレーター）",
    description: "お客さまが色・フタ・刻印を選ぶと、3D の商品と価格がその場で変わる商品ページの部品です。必要なものは 3D モデル（.glb）1 つと設定 1 つ。サーバーも月額も要りません。見本をその場で回して確かめられます。",
  },
  name: "3D 商品コンフィギュレーター",
  title: "色・刻印を選ぶと、3D と価格が変わる商品ページ部品",
  lede: "お客さまが色・フタ・刻印を選ぶと、3D の商品と価格がその場で変わります。必要なものは 3D モデル（.glb）1 つと設定 1 つ。サーバーも月額も要りません。",
  /** 頭の下の 2 択（Shopify 版への道）。値段は部品が projects.ts から組む */
  choice: {
    before: "Shopify のストアに置く方は、選んだ内容が注文に残る ",
    link: "Shopify 版",
    after: (price: string) => `（${price}）をお選びください。`,
  },
  how: "見本の商品は、架空の工房のステンレスタンブラーです。キットに入っている見本のモデルと設定を、そのまま動かしています。刻印には漢字・かなも入ります。ロゴの画像はお使いのブラウザの中だけで扱い、サーバーには送りません。",
  shopifyHeading: "Shopify 版",
  shopifyAbout: "同じコンフィギュレーターを、Shopify の商品ページに置ける形にした版です。アプリではなく、テーマにファイルを足して使うので、審査も月額の利用料も要りません。選んだ色・容量・刻印は、カートの商品と注文の詳細に残ります。",
  shopifyDemo: "下は架空の店「みなと工房」の商品ページの見本です。カートは本物ではなく、「カートに入れる」を押すと、カートに届く内容をページの下に表示します。ページの上の「English」を押すと、英語の表示に切り替わります。",
  shopifyStatus: (price: string) => `Shopify 版は ${price} の買い切りです`,
  shopifyOpen: "見本を別の画面で開く",
  shopifyPage: "Shopify 版の中身と請求の仕組み",
  sales: jaSales,
};

export const copy: Record<"ja" | "en" | "fr", typeof ja> = {
  ja,
  en: {
    meta: {
      title: "Product page part where color and engraving change the 3D view and price | One-time, no monthly fee (3D Product Configurator)",
      description: "A product page component: when customers choose a color, lid, or engraving, the 3D product and the price change on the spot. You need one 3D model (.glb) and one settings file. No server, no monthly fee. Rotate the demo right on this page.",
    },
    name: "3D Product Configurator",
    title: "Choose a color or engraving, and the 3D view and price change",
    lede: "When customers choose a color, lid, or engraving, the 3D product and its price change on the spot. All you need is one 3D model (.glb) and one settings file. No server, no monthly fee.",
    choice: {
      before: "Selling on Shopify? The ",
      link: "Shopify edition",
      after: (price: string) => ` (${price}) keeps the chosen options on the order.`,
    },
    how: "The demo product is a stainless tumbler from a fictional workshop, running the sample model and settings included in the kit as they are. Engraving accepts Japanese characters as well. Logo images are handled only in your browser and never sent to a server.",
    shopifyHeading: "Shopify edition",
    shopifyAbout: "The same configurator, packaged for Shopify product pages. It isn’t an app: you add files to your theme, so there’s no app review and no monthly fee. The chosen color, capacity, and engraving stay on the cart item and in the order details.",
    shopifyDemo: "Below is a sample product page for a fictional workshop. The cart isn’t real: the add-to-cart button shows, at the bottom of the page, what would reach the cart. Press “English” at the top of the page to switch it to English.",
    shopifyStatus: (price: string) => `The Shopify edition is ${price}, one-time purchase`,
    shopifyOpen: "Open the sample in a new window",
    shopifyPage: "What’s in the Shopify edition and how billing works",
    sales: {
      proof: [
        { figure: "132", label: "Automated tests. Every release passes all of them before it ships (1.1.0)." },
        { figure: "¥0", label: "Monthly fees and sales commission. No server and no external service." },
        { figure: "3 ways", label: "To install: plain HTML (upload the files and paste a few lines), npm, or React / Next.js." },
        { figure: "14 days", label: "After purchase, we answer bug reports and usage questions by email." },
      ],
      audience: {
        fits: [
          "Are a web agency or freelancer: you may build it into a client’s product page and deliver it (choose the agency license when a team uses it)",
          "Sell products with many color or material combinations on your own site, such as engraved gifts, made-to-order furniture, or workshop goods",
          "Have someone in-house who can upload files to the site and paste a few lines into a product page",
          "Want a one-time purchase instead of another monthly service",
        ],
        notFor: [
          "Have no 3D model (.glb) and won’t prepare one (modeling isn’t included; if you want the model made too, we quote it separately)",
          "Need AR (placing the product in a room through the phone camera) or an admin screen for editing options (neither is included; options are written in a JSON settings file)",
          "Want it on a Shopify store with the choices kept on the order (choose the Shopify edition)",
          "Use an online shop service that doesn’t let you add JavaScript files to pages (it can’t be installed there; ask us before buying if you aren’t sure)",
        ],
      },
      compare: {
        rows: [
          {
            kind: "Free tool",
            name: "<model-viewer> (open source by Google)",
            href: SOURCES.modelViewer,
            cost: "¥0",
            note: "Rotates a 3D model and can swap materials and colors. You build the option picker and the price logic yourself. If showing the 3D model is enough, this is all you need.",
          },
          {
            kind: "Built-in feature",
            name: "Shopify 3D models (product media)",
            href: SOURCES.shopify3d,
            cost: "¥0 (included in Shopify)",
            note: "Upload a GLB and the product page can rotate it, with AR. No color switching, engraving, or price changes.",
          },
          {
            kind: "Similar service",
            name: "Zakeke",
            href: SOURCES.zakeke,
            cost: "From $59/month billed yearly ($69.90 monthly), plus a fee per sale",
            note: "A monthly service for choosing colors, engraving, and images, with an admin screen and AR.",
          },
        ],
        kit: "Choosing colors, materials, parts, engraving, or a logo changes the 3D view and the price on the spot. Choices can be exported as JSON, PNG, or a share URL. No monthly fee or commission. No AR and no admin screen.",
        checkedOn: CHECKED_ON,
      },
      steps: [
        {
          heading: "Preparing a 3D model (.glb) of your own product",
          intro: "You replace the sample tumbler with a 3D model of your product. When exporting from Blender, go in this order.",
          items: [
            "Make each part that changes color, each part that is shown or hidden (such as sizes), and each surface for engraving or a logo a separate object, and name it (for example body, lid).",
            "Make the engraving or logo surface its own object, separate from the body, and give it UVs (engraving replaces that surface’s image).",
            "Choose File → Export → glTF 2.0 and set the format to “glTF Binary (.glb)”. Turn compression such as Draco off.",
            "Point model.src in the settings to the exported .glb and open the page.",
            "If “Not in the model” appears at the top left of the 3D view, match those names in the settings or in the model (names such as Blender’s Body.001 can be written as they are).",
          ],
          after: "If you don’t have a 3D model, you can use an AI service that builds models from photos or text (such as Meshy) or hire a 3D modeler. If you want the model made as well, we quote it separately; please ask.",
        },
        {
          heading: "When the 3D view doesn’t appear or a color doesn’t change",
          intro: "The message on screen tells you the cause.",
          items: [
            "“3D component not found” — the location of product-configurator-3d.global.js doesn’t match scene.src in the settings.",
            "A part doesn’t change color — the name in the settings differs from the name in the model. Check “Not in the model” at the top left of the 3D view.",
            "It stops with “unknown key” — check the spelling of the setting names.",
            "The original pattern disappeared after engraving — make a separate surface just for engraving and use it as the target.",
            "It’s heavy on phones — reduce the model’s vertex count, or keep images at 1,024 px or less.",
          ],
          after: "Installing through npm or React requires React 19 (19.0 to 19.2). For a React 18 site, choose the plain HTML installation.",
        },
      ],
    },
  },
  fr: {
    meta: {
      title: "Composant de page produit : couleur et gravure changent la 3D et le prix | Achat unique (Configurateur de produit 3D)",
      description: "Un composant de page produit : quand le client choisit une couleur, un couvercle ou une gravure, le produit en 3D et le prix changent aussitôt. Il suffit d’un modèle 3D (.glb) et d’un fichier de réglages. Ni serveur ni abonnement. Faites tourner la démo sur cette page.",
    },
    name: "Configurateur de produit 3D",
    title: "Couleur ou gravure choisie : la 3D et le prix changent aussitôt",
    lede: "Quand le client choisit une couleur, un couvercle ou une gravure, le produit en 3D et son prix changent aussitôt. Il suffit d’un modèle 3D (.glb) et d’un fichier de réglages. Ni serveur ni abonnement.",
    choice: {
      before: "Vous vendez sur Shopify ? La ",
      link: "version Shopify",
      after: (price: string) => ` (${price}) conserve les options choisies dans la commande.`,
    },
    how: "Le produit de la démo est un gobelet inox d’un atelier fictif : le modèle et les réglages d’exemple fournis dans le kit tournent tels quels. La gravure accepte aussi les caractères japonais. Les images de logo restent dans votre navigateur et ne sont jamais envoyées à un serveur.",
    shopifyHeading: "Version Shopify",
    shopifyAbout: "Le même configurateur, adapté aux pages produit Shopify. Ce n’est pas une application : on ajoute des fichiers au thème, donc pas de validation d’application ni d’abonnement. La couleur, la contenance et la gravure choisies restent sur l’article du panier et dans le détail de la commande.",
    shopifyDemo: "Ci-dessous, une page produit d’exemple pour un atelier fictif. Le panier n’est pas réel : le bouton d’ajout au panier affiche en bas de page ce qui arriverait dans le panier. Le bouton « English » en haut de la page passe l’affichage en anglais.",
    shopifyStatus: (price: string) => `La version Shopify est à ${price}, en achat unique`,
    shopifyOpen: "Ouvrir l’exemple dans une nouvelle fenêtre",
    shopifyPage: "Contenu de la version Shopify et facturation",
    sales: {
      proof: [
        { figure: "132", label: "Tests automatisés. Chaque version les passe tous avant d’être livrée (1.1.0)." },
        { figure: "0 ¥", label: "D’abonnement et de commission sur les ventes. Ni serveur ni service externe." },
        { figure: "3 façons", label: "De l’installer : HTML simple (déposer les fichiers et coller quelques lignes), npm, ou React / Next.js." },
        { figure: "14 jours", label: "Après l’achat, nous répondons par e-mail aux signalements de bugs et aux questions d’utilisation." },
      ],
      audience: {
        fits: [
          "Êtes une agence web ou un indépendant : vous pouvez l’intégrer à la page produit d’un client et le livrer (licence agence si une équipe l’utilise)",
          "Vendez sur votre propre site des produits aux nombreuses combinaisons de couleurs ou de matières : cadeaux gravés, meubles sur mesure, créations d’atelier",
          "Avez en interne une personne capable de déposer des fichiers sur le site et de coller quelques lignes dans une page produit",
          "Préférez un achat unique à un abonnement de plus",
        ],
        notFor: [
          "N’avez pas de modèle 3D (.glb) et ne comptez pas en préparer un (la modélisation n’est pas comprise ; si vous voulez aussi le modèle, nous faisons un devis à part)",
          "Avez besoin de la RA (poser le produit dans une pièce via l’appareil photo) ou d’un écran d’administration pour modifier les options (ni l’un ni l’autre ; les options s’écrivent dans un fichier JSON)",
          "Voulez l’installer sur une boutique Shopify en gardant les choix dans la commande (choisissez la version Shopify)",
          "Utilisez un service de boutique en ligne qui ne permet pas d’ajouter des fichiers JavaScript aux pages (impossible à installer ; en cas de doute, demandez-nous avant l’achat)",
        ],
      },
      compare: {
        rows: [
          {
            kind: "Outil gratuit",
            name: "<model-viewer> (open source, Google)",
            href: SOURCES.modelViewer,
            cost: "0 ¥",
            note: "Fait tourner un modèle 3D et permet de changer matières et couleurs. Le sélecteur d’options et le calcul du prix sont à construire vous-même. Si montrer la 3D suffit, il convient.",
          },
          {
            kind: "Fonction intégrée",
            name: "Modèles 3D de Shopify (médias produit)",
            href: SOURCES.shopify3d,
            cost: "0 ¥ (inclus dans Shopify)",
            note: "Un GLB téléversé tourne sur la page produit, avec la RA. Pas de changement de couleur, de gravure ni de prix.",
          },
          {
            kind: "Service similaire",
            name: "Zakeke",
            href: SOURCES.zakeke,
            cost: "À partir de 59 $/mois en annuel (69,90 $ en mensuel), plus des frais par vente",
            note: "Un service par abonnement pour choisir couleurs, gravure et images, avec écran d’administration et RA.",
          },
        ],
        kit: "Choisir couleur, matière, pièces, gravure ou logo change la 3D et le prix aussitôt. Les choix s’exportent en JSON, PNG ou URL de partage. Ni abonnement ni commission. Pas de RA ni d’écran d’administration.",
        checkedOn: CHECKED_ON,
      },
      steps: [
        {
          heading: "Préparer le modèle 3D (.glb) de votre produit",
          intro: "Vous remplacez le gobelet de la démo par le modèle 3D de votre produit. Pour l’exporter depuis Blender, procédez dans cet ordre.",
          items: [
            "Faites de chaque pièce qui change de couleur, de chaque pièce affichée ou masquée (tailles, etc.) et de chaque surface de gravure ou de logo un objet séparé, et nommez-le (par exemple body, lid).",
            "Faites de la surface de gravure ou de logo un objet distinct du corps, avec des UV (la gravure remplace l’image de cette surface).",
            "Choisissez Fichier → Exporter → glTF 2.0 et le format « glTF binaire (.glb) ». Désactivez la compression comme Draco.",
            "Indiquez dans model.src l’emplacement du .glb exporté, puis ouvrez la page.",
            "Si « absent du modèle » s’affiche en haut à gauche de la 3D, accordez ces noms dans les réglages ou dans le modèle (un nom comme Body.001 de Blender s’écrit tel quel).",
          ],
          after: "Sans modèle 3D, vous pouvez passer par un service d’IA qui crée des modèles à partir de photos ou de texte (Meshy, par exemple) ou par un modeleur 3D. Si vous voulez aussi le modèle, nous faisons un devis à part ; demandez-nous.",
        },
        {
          heading: "Quand la 3D n’apparaît pas ou qu’une couleur ne change pas",
          intro: "Le message affiché indique la cause.",
          items: [
            "« composant 3D introuvable » — l’emplacement de product-configurator-3d.global.js ne correspond pas à scene.src dans les réglages.",
            "Une pièce ne change pas de couleur — le nom dans les réglages diffère de celui du modèle. Voyez « absent du modèle » en haut à gauche de la 3D.",
            "Arrêt sur « clé inconnue » — vérifiez l’orthographe des noms de réglages.",
            "Le motif d’origine a disparu après la gravure — créez une surface dédiée à la gravure et prenez-la comme target.",
            "Lent sur téléphone — réduisez le nombre de sommets du modèle, ou gardez les images à 1 024 px maximum.",
          ],
          after: "L’installation par npm ou React demande React 19 (19.0 à 19.2). Pour un site en React 18, choisissez l’installation en HTML simple.",
        },
      ],
    },
  },
};

