import type { KitSales } from "../kit-parts";

/** 比べる相手のページ（内容と費用の出どころ） */
const SOURCES = {
  floorplanner: "https://floorplanner.com/pricing",
  sweethome3d: "https://www.sweethome3d.com/",
  roomsketcher: "https://www.roomsketcher.com/pricing/",
};

/** 比べる相手のページを読んだ日 */
const CHECKED_ON = "2026-10-20";

type FloorplanCopy = {
  meta: { title: string; description: string };
  name: string;
  title: string;
  lede: string;
  /** 見本の仕組みの一文（道具のすぐ下） */
  how: string;
  /** お求めいただく版で増えるものと、その実物の画面 1 枚 */
  paid: { heading: string; intro: string; list: string[]; alt: string; caption: string };
  sales: KitSales;
  closeHeading: string;
  close: string;
};

const ja: FloorplanCopy = {
  meta: {
    title: "自社サイトに置ける 3D 間取りシミュレーター｜工務店の相談席と物件ページに・買い切り",
    description:
      "お客さまが自分でマス目を塗って間取りを描き、ドア・窓・家具を置いて 3D で確かめられる部品です。工務店・設計事務所・不動産の相談の席と物件ページで使えます。描いた間取りはお客さまのブラウザの中だけに残ります。買い切りで月額はかかりません。",
  },
  name: "間取りシミュレーター",
  title: "自社サイトに置ける、3D\u00a0の間取りシミュレーター",
  lede: "工務店・設計事務所・不動産の相談の席や物件ページで、お客さまが自分でマス目を塗って間取りを描き、3D で確かめられる部品です。描いた間取りはお客さまのブラウザの中だけに残り、外へは送りません。",
  how: "3D のデータは読み込まず、間取りはマス目の表、家具は箱の一覧という 2 つの表から組み立てています。変更はお使いのブラウザにだけ保存し、サーバーには送りません。",
  paid: {
    heading: "お求めいただく版で増えるもの",
    intro: "上の見本は、部屋を塗る・家具を置く・3D で見るまでの版です。お求めいただく版には、次のものが入っています。",
    list: [
      "建具: ドア・引き戸・腰窓・掃き出し窓。間取り図には記号が出て、3D では壁に開口が空きます",
      "寸法: 部屋の面積と帖、家具・建具の幅 × 奥行き × 高さを、その場で打ち替えられます",
      "外皮の寸法（間口・奥行きは 4〜16 m）、平屋と 2 階建て、設備（クローゼット・押入・玄関収納・階段）と外周（バルコニー・テラス・玄関ポーチ）",
      "家具 18 種の実寸。テレビはインチを入れると画面の大きさになります",
      "取り消し・やり直し（100 手まで）と、拡大したままの移動",
      "案を 10 件まで持てる複数案、PNG の書き出し、印刷（PDF 保存）",
      "物件ページ向けの「見せるだけ」の設定と、自社のプランを最初から出す設定",
      "単体のページ（page/index.html）: ノート PC で開くだけで、相談の席で使えます",
    ],
    alt: "お求めいただく版の画面。左に 1 階の 3D、右に間取り図。間取り図には LDK・和室・玄関ホールなどの面積と帖、ドアの記号が出ている",
    caption: "お求めいただく版（1.0.2）の画面です。同梱の見本の間取り（9 × 8 m・2 階建て）の 1 階を開いたところです。",
  },
  sales: {
    proof: [
      { figure: "397 件", label: "自動テストの数です。版を出すたびに、すべて通してからお届けしています（1.0.1）。" },
      { figure: "0 円", label: "月額の費用です。ご自身のサイトに置いたファイルだけで動きます。" },
      { figure: "0 件", label: "描いた間取りをサーバーへ送る通信です。保存はお使いのブラウザの中だけです。" },
      { figure: "18 種", label: "実寸の家具の数です。幅・奥行き・高さを直に入れることもできます。" },
    ],
    audience: {
      fits: [
        "地域の工務店・設計事務所・リフォーム店で、相談の席や見学会でお客さまと一緒に間取りを描きたい方",
        "物件ページに、触って 3D で確かめられる間取りを載せたい不動産・工務店の方（見せるだけの設定があります）",
        "工務店のサイトを作る制作会社・フリーランスの方（クライアントのサイトに組み込んで納品できます）",
        "ご自身で置くのが不安な方（設置までお任せいただけます。下の「お値段」をご覧ください）",
      ],
      notFor: [
        "施主として、ご自身の家の間取りを考えたい方（無料の間取りのサービスで足ります。下の比較をご覧ください）",
        "斜めの壁・3 階以上・屋根の形・日当たりまで確かめたい方（作っていません）",
        "描いた間取りを、お客さまから問い合わせで受け取りたい方（送る機能は入っていません。PNG か印刷で書き出していただく形です）",
        "Internet Explorer や古い iPad で使いたい方（Safari は 15.4 以降。3D には WebGL2 が要ります）",
      ],
    },
    compare: {
      rows: [
        {
          kind: "無料の道具",
          name: "Floorplanner（Basic プラン）",
          href: SOURCES.floorplanner,
          cost: "0 円（5 件まで。書き出しには透かし）",
          note: "ブラウザで間取りと 3D を作れる英語のサービスです。お客さまは、そのサービスの画面で作ります。",
        },
        {
          kind: "無料のソフト",
          name: "Sweet Home 3D",
          href: SOURCES.sweethome3d,
          cost: "0 円",
          note: "家具を置いて 3D で確かめられる、パソコン・スマホ向けの無料のソフトです。",
        },
        {
          kind: "似たサービス",
          name: "RoomSketcher",
          href: SOURCES.roomsketcher,
          cost: "無料プランあり。Pro は年 $144",
          note: "英語のサービスです。無料プランには面積の計算が無く、3D の画像に透かしが入ります。",
        },
      ],
      kit: "自社のサイトの中で動き、描いた間取りはお客さまのブラウザの中だけに残ります。ほかのサービスの画面へ移らずに、自社のページで相談が続きます。月額はかかりません。",
      checkedOn: CHECKED_ON,
    },
    steps: [
      {
        heading: "サイトに置くまで（Web の担当の方への手順）",
        intro: "zip には embed・page・dist・src などのフォルダがありますが、サイトに置くのは「embed」の中のファイルだけです。",
        items: [
          "zip を展開し、「embed」フォルダから floorplan.global.js・floorplan-3d.global.js・floorplan-simulator.css の 3 つを取り出します。",
          "3 つを、サイトの同じフォルダに置きます。",
          "載せたいページに、embed-snippet.html の 5 行を貼ります（WordPress なら「カスタム HTML」のブロックに貼ります）。",
          "ページを開き、マス目を塗れることと、3D が出ることを確かめます。",
        ],
        after: "サイトに置く前に試したいときは、「page」フォルダの index.html をブラウザで開くだけで使えます。サーバーは要りません。",
      },
      {
        heading: "3D の枠に断りが出たとき",
        intro: "3D を出せない端末やブラウザでは、断りを出して間取り図だけで動きます。",
        items: [
          "ブラウザを最新にします（Chrome・Edge・Firefox の最新版か、Safari 15.4 以降）。",
          "iPhone・iPad は、iOS 15.4 以降に更新します。",
          "「3D の部品を読み込めませんでした」と出るときは、floorplan-3d.global.js がほかのファイルと同じフォルダにあるかを確かめます。",
        ],
        after: "3D が出ない端末でも、部屋を塗る・家具を置く・印刷するところまでは、そのままお使いいただけます。",
      },
    ],
  },
  closeHeading: "更新とご利用の範囲",
  close: "お求めの方は、その後の 1.x の更新も無料で受け取れます（差し替えるのは embed の 3 ファイルか page フォルダで、保存してある間取りはそのまま使えます）。クライアントのサイトに組み込んで納品できます。再配布・転売・同種の商品としての販売はできません。",
};

export const copy: Record<"ja" | "en" | "fr", FloorplanCopy> = {
  ja,
  en: {
    meta: {
      title: "A 3D floor plan simulator for your own website | For builders’ consultations and listing pages, one-time purchase (Floor Plan Simulator)",
      description:
        "A component that lets customers paint grid squares to draw a floor plan, place doors, windows, and furniture, and check it in 3D. Use it at the consultation table and on listing pages of builders, architects, and real estate agents. Plans stay only in the customer’s browser. One-time purchase, no monthly fee.",
    },
    name: "Floor Plan Simulator",
    title: "A 3D floor plan simulator for your own website",
    lede: "At the consultation table or on a listing page, customers paint grid squares to draw a floor plan and check it in 3D themselves. The plans they draw stay in their own browser and are never sent anywhere.",
    how: "No 3D model files are loaded: the scene is built from two tables, a grid for the floor plan and a list of boxes for the furniture. Changes are saved only in your browser and never sent to a server.",
    paid: {
      heading: "What the version you buy adds",
      intro: "The sample above covers painting rooms, placing furniture, and viewing in 3D. The version you buy also includes the following.",
      list: [
        "Doors and windows: doors, sliding doors, standard windows, and floor-length windows. The plan shows symbols, and in 3D the walls get real openings",
        "Dimensions: room area in square meters and tatami mats, and width × depth × height of furniture and openings, editable on the spot",
        "Building size (4 to 16 m in width and depth), single- or two-story, fixtures (closets, storage, entrance storage, stairs), and exterior parts (balconies, terraces, porches)",
        "18 kinds of true-to-size furniture. Enter a TV’s size in inches and the screen matches it",
        "Undo and redo (up to 100 steps), and panning while zoomed in",
        "Up to 10 alternative plans, PNG export, and printing (save as PDF)",
        "A view-only setting for listing pages, and a setting to start from your own plans",
        "A standalone page (page/index.html): open it on a laptop and use it at the consultation table",
      ],
      alt: "The version you buy: on the left, the ground floor in 3D; on the right, the floor plan showing room areas, tatami-mat counts, and door symbols",
      caption: "The version you buy (1.0.2), showing the ground floor of the included sample plan (9 × 8 m, two stories).",
    },
    sales: {
      proof: [
        { figure: "397", label: "Automated tests. Every release passes all of them before it ships (1.0.1)." },
        { figure: "¥0", label: "Monthly cost. It runs only from the files you place on your own site." },
        { figure: "0", label: "Requests sending drawn plans to a server. Plans are saved only in the browser in use." },
        { figure: "18", label: "Kinds of true-to-size furniture. You can also enter width, depth, and height directly." },
      ],
      audience: {
        fits: [
          "Work at a local builder, architect, or renovation company and want to draw plans together with customers at consultations or open houses",
          "Want listing pages with floor plans customers can touch and check in 3D (a view-only setting is included)",
          "Are an agency or freelancer building sites for builders (you may build it into client sites)",
          "Would rather not install it yourself (setup can be done for you; see Price below)",
        ],
        notFor: [
          "Are a homeowner planning your own house (free floor plan services are enough; see the comparison below)",
          "Need angled walls, three or more stories, roof shapes, or sunlight studies (not built)",
          "Want customers to send you their plans through an inquiry (there is no sending feature; plans are exported as PNG or printed)",
          "Need Internet Explorer or older iPads (Safari 15.4 or later; 3D requires WebGL2)",
        ],
      },
      compare: {
        rows: [
          {
            kind: "Free tool",
            name: "Floorplanner (Basic plan)",
            href: SOURCES.floorplanner,
            cost: "¥0 (up to 5 projects; exports carry a watermark)",
            note: "An English-language service for drawing plans and 3D in the browser. Customers work on that service’s own screens.",
          },
          {
            kind: "Free software",
            name: "Sweet Home 3D",
            href: SOURCES.sweethome3d,
            cost: "¥0",
            note: "Free software for computers and phones to place furniture and check rooms in 3D.",
          },
          {
            kind: "Similar service",
            name: "RoomSketcher",
            href: SOURCES.roomsketcher,
            cost: "Free plan available; Pro is $144/year",
            note: "An English-language service. The free plan has no area calculation, and its 3D images carry a watermark.",
          },
        ],
        kit: "Runs inside your own site, and the plans customers draw stay in their browser. The conversation continues on your page instead of moving to another service. No monthly fee.",
        checkedOn: CHECKED_ON,
      },
      steps: [
        {
          heading: "Placing it on your site (steps for whoever manages the site)",
          intro: "The zip has folders such as embed, page, dist, and src, but only the files in “embed” go on your site.",
          items: [
            "Extract the zip and take floorplan.global.js, floorplan-3d.global.js, and floorplan-simulator.css out of the “embed” folder.",
            "Put the three files in the same folder on your site.",
            "Paste the 5 lines from embed-snippet.html into the page (on WordPress, into a “Custom HTML” block).",
            "Open the page and check that you can paint grid squares and that the 3D view appears.",
          ],
          after: "To try it before placing it on a site, just open index.html in the “page” folder in a browser. No server is needed.",
        },
        {
          heading: "When a notice appears in the 3D frame",
          intro: "On devices or browsers that cannot show 3D, a notice appears and the floor plan works on its own.",
          items: [
            "Update your browser (latest Chrome, Edge, or Firefox, or Safari 15.4 or later).",
            "Update iPhones and iPads to iOS 15.4 or later.",
            "If the notice says the 3D component could not be loaded, check that floorplan-3d.global.js is in the same folder as the other files.",
          ],
          after: "Even where 3D does not appear, painting rooms, placing furniture, and printing all keep working.",
        },
      ],
    },
    closeHeading: "Updates and permitted use",
    close: "Buyers receive later 1.x updates free (replace the three files in embed or the page folder; saved plans keep working). You may build it into client sites. Redistribution, resale, and selling it as a similar product are not allowed.",
  },
  fr: {
    meta: {
      title: "Un simulateur de plan en 3D pour votre propre site | Pour les rendez-vous des constructeurs et les annonces, achat unique (Simulateur de plan)",
      description:
        "Un composant qui permet aux clients de colorier des cases pour dessiner un plan, d’y placer portes, fenêtres et meubles, puis de le vérifier en 3D. Pour les rendez-vous et les pages d’annonces des constructeurs, architectes et agences immobilières. Les plans restent dans le navigateur du client. Achat unique, sans abonnement.",
    },
    name: "Simulateur de plan",
    title: "Un simulateur de plan en 3D pour votre propre site",
    lede: "En rendez-vous ou sur une page d’annonce, vos clients colorient des cases pour dessiner un plan et le vérifient eux-mêmes en 3D. Les plans restent dans leur navigateur et ne sont envoyés nulle part.",
    how: "Aucun fichier 3D n’est chargé : la scène est construite à partir de deux tableaux, une grille pour le plan et une liste de boîtes pour les meubles. Les modifications sont enregistrées uniquement dans votre navigateur, jamais envoyées à un serveur.",
    paid: {
      heading: "Ce qu’ajoute la version achetée",
      intro: "L’exemple ci-dessus permet de colorier les pièces, de placer des meubles et de voir en 3D. La version achetée contient en plus les éléments suivants.",
      list: [
        "Ouvertures : portes, portes coulissantes, fenêtres et portes-fenêtres. Le plan affiche leurs symboles, et en 3D les murs s’ouvrent réellement",
        "Cotes : surface des pièces en m² et en tatamis, largeur × profondeur × hauteur des meubles et ouvertures, modifiables sur place",
        "Dimensions du bâtiment (4 à 16 m en largeur et profondeur), plain-pied ou un étage, équipements (placards, rangements, rangement d’entrée, escalier) et extérieurs (balcon, terrasse, porche)",
        "18 types de meubles aux dimensions réelles. Indiquez la taille d’un téléviseur en pouces et l’écran s’y adapte",
        "Annuler et rétablir (jusqu’à 100 étapes), et déplacement de la vue en zoom",
        "Jusqu’à 10 variantes de plan, export PNG et impression (enregistrable en PDF)",
        "Un réglage « consultation seule » pour les annonces, et un réglage pour démarrer sur vos propres plans",
        "Une page autonome (page/index.html) : ouvrez-la sur un ordinateur portable et utilisez-la en rendez-vous",
      ],
      alt: "La version achetée : à gauche, le rez-de-chaussée en 3D ; à droite, le plan avec surfaces des pièces, nombre de tatamis et symboles des portes",
      caption: "La version achetée (1.0.2), avec le rez-de-chaussée du plan d’exemple fourni (9 × 8 m, un étage).",
    },
    sales: {
      proof: [
        { figure: "397", label: "Tests automatisés. Chaque version les passe tous avant d’être livrée (1.0.1)." },
        { figure: "0 ¥", label: "Coût mensuel. Il fonctionne uniquement avec les fichiers déposés sur votre site." },
        { figure: "0", label: "Requête envoyant les plans dessinés à un serveur. Les plans sont enregistrés uniquement dans le navigateur utilisé." },
        { figure: "18", label: "Types de meubles aux dimensions réelles. Largeur, profondeur et hauteur peuvent aussi être saisies directement." },
      ],
      audience: {
        fits: [
          "Travaillez chez un constructeur, un architecte ou une entreprise de rénovation et voulez dessiner les plans avec vos clients en rendez-vous ou en visite",
          "Voulez des pages d’annonces avec des plans que les clients manipulent et vérifient en 3D (un réglage « consultation seule » est inclus)",
          "Êtes une agence ou un indépendant qui crée des sites pour des constructeurs (intégration dans les sites clients permise)",
          "Préférez ne pas l’installer vous-même (l’installation peut être faite pour vous ; voir Prix ci-dessous)",
        ],
        notFor: [
          "Êtes un particulier qui conçoit sa propre maison (les services de plans gratuits suffisent ; voir la comparaison ci-dessous)",
          "Avez besoin de murs en biais, de trois niveaux ou plus, de formes de toit ou d’études d’ensoleillement (non prévus)",
          "Voulez recevoir les plans de vos clients via une demande de contact (pas de fonction d’envoi ; les plans s’exportent en PNG ou s’impriment)",
          "Devez utiliser Internet Explorer ou d’anciens iPad (Safari 15.4 ou plus récent ; la 3D nécessite WebGL2)",
        ],
      },
      compare: {
        rows: [
          {
            kind: "Outil gratuit",
            name: "Floorplanner (offre Basic)",
            href: SOURCES.floorplanner,
            cost: "0 ¥ (5 projets ; exports avec filigrane)",
            note: "Un service en anglais pour dessiner plans et 3D dans le navigateur. Les clients travaillent sur les écrans de ce service.",
          },
          {
            kind: "Logiciel gratuit",
            name: "Sweet Home 3D",
            href: SOURCES.sweethome3d,
            cost: "0 ¥",
            note: "Un logiciel gratuit pour ordinateur et téléphone, pour placer des meubles et vérifier en 3D.",
          },
          {
            kind: "Service similaire",
            name: "RoomSketcher",
            href: SOURCES.roomsketcher,
            cost: "Offre gratuite ; Pro à 144 $/an",
            note: "Un service en anglais. L’offre gratuite n’a pas de calcul de surface, et ses images 3D portent un filigrane.",
          },
        ],
        kit: "Fonctionne dans votre propre site, et les plans dessinés restent dans le navigateur du client. L’échange se poursuit sur votre page au lieu de passer à un autre service. Sans abonnement.",
        checkedOn: CHECKED_ON,
      },
      steps: [
        {
          heading: "Le placer sur votre site (étapes pour la personne qui gère le site)",
          intro: "Le zip contient des dossiers comme embed, page, dist et src, mais seuls les fichiers de « embed » vont sur votre site.",
          items: [
            "Décompressez le zip et prenez floorplan.global.js, floorplan-3d.global.js et floorplan-simulator.css dans le dossier « embed ».",
            "Déposez les trois fichiers dans un même dossier de votre site.",
            "Collez les 5 lignes de embed-snippet.html dans la page (sur WordPress, dans un bloc « HTML personnalisé »).",
            "Ouvrez la page et vérifiez que vous pouvez colorier les cases et que la vue 3D s’affiche.",
          ],
          after: "Pour l’essayer avant de le mettre sur un site, ouvrez simplement index.html du dossier « page » dans un navigateur. Aucun serveur n’est nécessaire.",
        },
        {
          heading: "Quand un avertissement apparaît dans le cadre 3D",
          intro: "Sur les appareils ou navigateurs incapables d’afficher la 3D, un avertissement apparaît et le plan fonctionne seul.",
          items: [
            "Mettez à jour votre navigateur (dernière version de Chrome, Edge ou Firefox, ou Safari 15.4 ou plus récent).",
            "Mettez à jour iPhone et iPad vers iOS 15.4 ou plus récent.",
            "Si l’avertissement indique que le composant 3D n’a pas pu être chargé, vérifiez que floorplan-3d.global.js se trouve dans le même dossier que les autres fichiers.",
          ],
          after: "Même sans 3D, colorier les pièces, placer les meubles et imprimer restent possibles.",
        },
      ],
    },
    closeHeading: "Mises à jour et conditions d’utilisation",
    close: "Les acheteurs reçoivent gratuitement les mises à jour 1.x (remplacez les trois fichiers de embed ou le dossier page ; les plans enregistrés restent utilisables). Vous pouvez l’intégrer aux sites de vos clients. Redistribution, revente et vente comme produit similaire interdites.",
  },
};
