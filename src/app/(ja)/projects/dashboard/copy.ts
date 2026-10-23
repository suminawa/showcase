import type { KitSales } from "../kit-parts";
import { STEP_IMAGES } from "../step-images";

const SOURCES = {
  looker: "https://cloud.google.com/looker-studio",
  sheetsChart: "https://support.google.com/docs/answer/63824",
  geckoboard: "https://www.geckoboard.com/pricing/",
};

/** 比べる相手のページを読んだ日 */
const CHECKED_ON = "2026-10-20";

const jaSales: KitSales = {
  proof: [
    { figure: "736 件", label: "自動テストの数です。版を出すたびに、すべて通してからお届けしています（1.0.1）。" },
    { figure: "0 円", label: "月額の費用です。グラフのライブラリも BI ツールの契約も要りません。" },
    { figure: "0 件", label: "作者のサーバーへの送信です。数字は、お客さまの置き場所と見る方のブラウザの間だけを行き来します。" },
    { figure: "3 通り", label: "置き方です。サイトに埋め込む（5 分ほど）・Next.js（15 分ほど）・スプレッドシートから公開（15 分ほど）。どれも同じ画面です。" },
  ],
  audience: {
    fits: [
      "お客さまのサイトやスプレッドシートに、数字の画面を組み込んで納めたい制作会社・フリーランスの方（組み込んだものは納品できます）",
      "毎月、スプレッドシートからグラフを作り直している方（スプレッドシート版なら、いまのシートがそのまま画面になります）",
      "見る方に Google アカウントを求めずに、自社のサイトで数字を見せたい方（埋め込み・Next.js の置き方）",
      "ご自身で置くのが不安な方（設置までお任せいただけます。下の「お値段」をご覧ください）",
    ],
    notFor: [
      "社内の数人で見るだけで、全員が Google アカウントをお持ちの方（下の比較の無料の Looker Studio で足ります）",
      "円グラフ・2 軸のグラフ・地図・掘り下げ（ドリルダウン）が要る方（入っていません）",
      "データベースに直接つなぎたい方、画面の上で設定を書き換えたい方（入っていません）",
      "日付が「10/1」や「R8.10.1」のままの表を読ませたい方（2026-10-01 のように、年の 4 桁から始まる形に直す必要があります）",
    ],
  },
  compare: {
    rows: [
      {
        kind: "無料の道具",
        name: "Looker Studio",
        href: SOURCES.looker,
        cost: "0 円（Pro 版は有料）",
        note: "スプレッドシートなどをつないで、グラフの画面を作れる Google の道具です。レポートは Google アカウントで作り、共有の設定で見る方を決めます。",
      },
      {
        kind: "標準の機能",
        name: "Google スプレッドシートのグラフ",
        href: SOURCES.sheetsChart,
        cost: "0 円（スプレッドシートにあります）",
        note: "表からグラフを作れます。期間や店で切り替える画面は、フィルタやピボットテーブルを組み合わせてご自身で作ります。",
      },
      {
        kind: "似たサービス",
        name: "Geckoboard",
        href: SOURCES.geckoboard,
        cost: "無料のプランなし。Essentials が年払いで月 $79 から（14 日の無料体験あり）",
        note: "数字の画面を作る月額のサービスです。",
      },
    ],
    kit: "設定を書くだけで、KPI・折れ線・棒・目標・表が 1 枚にそろい、期間と区分の絞り込みで全部が同時に変わります。お客さまのサイトにも埋め込めます。月額は 0 円で、プログラムはお手元に残ります。",
    checkedOn: CHECKED_ON,
  },
  steps: [
    {
      heading: "スプレッドシート版で「このアプリは Google で確認されていません」と出たとき",
      image: STEP_IMAGES.gasAuth,
      intro: "はじめて実行したときと、見る方がはじめて開いたときに、Google の承認の画面が出ます。ご自身で貼ったスクリプトなので、この画面が出るのが正常です。次の順に進めてください。",
      items: [
        "「承認が必要です」の画面で「権限を確認」を押し、ご自身の Google アカウントを選びます。",
        "「このアプリは Google で確認されていません」と出たら、画面の下にある小さな「詳細」を押します。",
        "下に出る「（プロジェクト名）（安全ではないページ）に移動」を押します。",
        "許可の一覧（スプレッドシート・メニュー・メールアドレスの 3 つ）を確かめて「許可」を押します。",
      ],
      after: "承認の画面には「すべてのスプレッドシートの参照、編集、作成、削除」と出ますが、このキットが触れるのはスクリプトを入れたスプレッドシートだけです。見る方にも、はじめの 1 回だけ同じ画面が出るので、URL と一緒にこの順をお伝えください。",
    },
    {
      heading: "ご自分の表に入れ替えて、数字が出ないとき",
      intro: "見本からご自分のデータに入れ替えたときに多いつまずきです。画面のいちばん上の帯か、部品のところの赤い一文に理由が出ます。",
      items: [
        "「日付として読めない値が N 件あります」と出る: 日付を 2026-10-01 や 2026/10/01 のように、年の 4 桁から始まる形にします。",
        "「データ「○○」に列「××」が見つかりません」と出る: 1 行目が見出しになっているか、列の名前の前後に空白が無いかを確かめます。",
        "「「○○」は知らない項目です。「××」のことですか」と出る: 設定の項目名の打ち間違いです。示された名前に直します。",
        "スプレッドシート版で「公開の設定が違うため、表示を止めています。」と出る: 「デプロイ」→「デプロイを管理」→ 鉛筆と進み、「次のユーザーとして実行」を「ウェブアプリにアクセスしているユーザー」、「アクセスできるユーザー」を「Google アカウントを持つ全員」にして、「新バージョン」でデプロイします。",
      ],
      after: "金額の列に「-」や空欄が混ざっていても、読めない値をのぞいて計算し、のぞいた件数を札の下にお知らせします。黙って 0 にはしません。",
    },
  ],
};

const ja = {
  meta: {
    title: "売上のスプレッドシートや CSV を 1 枚のダッシュボードに（ダッシュボード キット）",
    description: "今あるスプレッドシートや CSV の数字を、期間と区分で切り替えられる KPI・グラフ・目標・表の 1 枚の画面にするキットです。設定を書くだけで、グラフのライブラリも BI ツールの月額も要りません。サイトへの埋め込み・Next.js・スプレッドシートからの公開の 3 通りで置けます。このページで実物を触れます。",
  },
  name: "ダッシュボード キット",
  // 「1」と「枚」を離さない（行末に 1 だけ残らないように）
  title: "スプレッドシートの売上を、1\u00a0枚のダッシュボードに",
  lede: "毎月スプレッドシートからグラフを作り直す手間をなくします。今あるシートや CSV を、期間と区分で切り替えられる KPI・グラフ・目標・表の 1 枚にします。設定を書くだけで、グラフのライブラリも BI ツールの月額も要りません。",
  intro: "上の見本は、架空のお店「しおかぜ珈琲店」の見本データをブラウザの中で動かしています。右上の English を押すと、英語の画面に切り替わります。",
  use: "期間と区分で絞り込むと、数字・折れ線・棒・目標・表がいっしょに変わります。折れ線に触れると縦の線が付いてきて、その日の値をまとめて読めます。どのグラフも「表で見る」に切り替えられ、表は見出しを押して並べ替え、CSV でダウンロードできます。絞り込みは URL に残るので、同じ画面をそのまま人に渡せます。",
  partsHeading: "できること",
  parts: "部品は 5 つ（数字・折れ線・棒・目標・表）で、どこに何を出すかは設定に書くだけです。グラフのライブラリにも BI の月額にも頼らず、色は色覚の差があっても見分けられる 8 色の並びにしてあります。キーボードだけでも操作でき、スマートフォンの幅にも暗い配色にも対応しています。",
  deployHeading: "置き方は 3 通り",
  deploy: "いまのサイトに数行の HTML で埋め込む形、Next.js のテンプレ（データの置き場所はブラウザに出しません）、Google スプレッドシートからそのまま公開する形（見られるのは、そのスプレッドシートを見られる方だけ）から選べます。どれも同じ画面が出ます。",
  buyHeading: "中身を詳しく読む",
  kit: "この見本は「ダッシュボード キット」の実物です。置き方ごとの手順や設定の書き方は、note の記事でお読みいただけます",
  sales: jaSales,
};

export const copy: Record<"ja" | "en" | "fr", typeof ja> = {
  ja,
  en: {
    meta: {
      title: "Turn spreadsheet or CSV sales into one dashboard | Embeddable, no monthly fee (Dashboard Kit)",
      description: "A kit that turns the numbers in your existing spreadsheets or CSV files into one screen of KPIs, charts, targets, and tables, filterable by period and category. Just write a configuration: no chart library, no BI subscription. Embed it in a site, use Next.js, or publish from Google Sheets. Try the real thing on this page.",
    },
    name: "Dashboard Kit",
    title: "Turn spreadsheet or CSV sales into one dashboard",
    lede: "Stop rebuilding charts from your spreadsheet every month. Your existing sheets or CSV files become one screen of KPIs, charts, targets, and tables that you can filter by period and category. Just write a configuration: no chart library and no BI subscription.",
    intro: "The demo above runs sample data for a fictional coffee shop in your browser. It opens in English here; press 日本語 at the top right to switch to Japanese.",
    use: "Filter by period and category, and the numbers, line chart, bar chart, target, and table all update together. Hover over the line chart and a vertical guide follows, showing that day’s values at once. Every chart can switch to a table view; tables sort when you click a header and download as CSV. Filters are kept in the URL, so you can share exactly the same view.",
    partsHeading: "What it does",
    parts: "There are five building blocks (numbers, line, bar, target, table), and the configuration decides what goes where. No chart library and no BI subscription; the colors are an 8-color palette that stays distinguishable for all types of color vision. It works with the keyboard alone, on phone-sized screens, and in dark mode.",
    deployHeading: "Three ways to deploy",
    deploy: "Embed it in your current site with a few lines of HTML, use the Next.js template (the data location is never exposed to the browser), or publish straight from Google Sheets (visible only to people who can view that spreadsheet). All three show the same screen.",
    buyHeading: "Read the details",
    kit: "This demo is the actual Dashboard Kit. Setup steps for each deployment and how to write the configuration are in the note article (in Japanese)",
    sales: {
      proof: [
        { figure: "736", label: "Automated tests. Every release passes all of them before it ships (1.0.1)." },
        { figure: "¥0", label: "Monthly cost. No chart library and no BI tool contract needed." },
        { figure: "0", label: "Data sent to the author’s servers. Numbers only travel between your data location and the viewer’s browser." },
        { figure: "3 ways", label: "To deploy: embed in a site (about 5 min), Next.js (about 15 min), or publish from Google Sheets (about 15 min). Same screen in each." },
      ],
      audience: {
        fits: [
          "Are an agency or freelancer who wants to build a numbers screen into a client’s site or spreadsheet (what you build with it may be delivered)",
          "Rebuild charts from a spreadsheet every month (with the Sheets edition, your current sheet becomes the screen)",
          "Want to show figures on your own site without asking viewers for a Google account (embed or Next.js)",
          "Would rather not install it yourself (setup can be done for you; see Price below)",
        ],
        notFor: [
          "Only need a few colleagues to view it and everyone has a Google account (the free Looker Studio compared below is enough)",
          "Need pie charts, dual-axis charts, maps, or drill-down (not included)",
          "Want a direct database connection or to edit the configuration on screen (not included)",
          "Want it to read dates written like 10/1 or Japanese era dates as they are (dates must start with a 4-digit year, such as 2026-10-01)",
        ],
      },
      compare: {
        rows: [
          {
            kind: "Free tool",
            name: "Looker Studio",
            href: SOURCES.looker,
            cost: "¥0 (Pro is paid)",
            note: "Google’s tool for building chart screens from spreadsheets and other sources. Reports are made with a Google account, and sharing settings decide who can view them.",
          },
          {
            kind: "Built-in feature",
            name: "Google Sheets charts",
            href: SOURCES.sheetsChart,
            cost: "¥0 (built into Sheets)",
            note: "Makes charts from a table. A screen that switches by period or store is something you assemble yourself with filters and pivot tables.",
          },
          {
            kind: "Similar service",
            name: "Geckoboard",
            href: SOURCES.geckoboard,
            cost: "No free plan. Essentials from $79/month billed yearly (14-day free trial)",
            note: "A subscription service for building numbers screens.",
          },
        ],
        kit: "Write a configuration and KPIs, line, bar, target, and table line up on one screen; filtering by period and category updates them all together. It embeds in client sites too. No monthly fee, and the code stays with you.",
        checkedOn: CHECKED_ON,
      },
      steps: [
        {
          heading: "Sheets edition: when you see “Google hasn’t verified this app”",
          intro: "Google shows an authorization screen the first time you run it and the first time each viewer opens it. Because you pasted the script yourself, this screen is expected. Proceed in this order.",
          items: [
            "On the “Authorization required” screen, press “Review permissions” and choose your Google account.",
            "When “Google hasn’t verified this app” appears, press the small “Advanced” link at the bottom of the screen.",
            "Press “Go to (project name) (unsafe)”, which appears below.",
            "Review the three permissions (spreadsheets, menu, email address) and press “Allow”.",
          ],
          after: "The screen says the script can see, edit, create, and delete all your spreadsheets, but the kit only touches the spreadsheet the script is in. Viewers see the same screen once, the first time, so send them these steps along with the URL.",
        },
        {
          heading: "When numbers don’t appear after switching to your own data",
          intro: "These are common when you replace the sample with your own data. The reason appears in the banner at the top of the screen or as a red line on the component.",
          items: [
            "It says N values can’t be read as dates: write dates starting with a 4-digit year, such as 2026-10-01 or 2026/10/01.",
            "It says a column was not found in a dataset: check that the first row holds the headings and that column names have no spaces before or after them.",
            "It says a setting name is unknown and suggests another: it’s a typo in the configuration; use the suggested name.",
            "Sheets edition says display is stopped because the publishing settings are wrong: go to Deploy → Manage deployments → pencil, set “Execute as” to the user accessing the web app and “Who has access” to anyone with a Google account, then deploy a new version.",
          ],
          after: "If the amount column contains “-” or blanks, unreadable values are left out of the calculation and the count of skipped values is shown under the card. It never silently shows 0.",
        },
      ],
    },
  },
  fr: {
    meta: {
      title: "Vos ventes de tableur ou CSV en un seul tableau de bord | Intégrable, sans abonnement (Kit de tableau de bord)",
      description: "Un kit qui transforme les chiffres de vos tableurs ou fichiers CSV en un seul écran d’indicateurs, de graphiques, d’objectifs et de tableaux, filtrable par période et par catégorie. Il suffit d’écrire une configuration : ni bibliothèque de graphiques ni abonnement BI. À intégrer à un site, avec Next.js, ou à publier depuis Google Sheets. Essayez la version réelle sur cette page.",
    },
    name: "Kit de tableau de bord",
    title: "Vos ventes de tableur ou CSV en un seul tableau de bord",
    lede: "Fini de refaire chaque mois les graphiques depuis le tableur. Vos feuilles ou fichiers CSV deviennent un seul écran d’indicateurs, de graphiques, d’objectifs et de tableaux, filtrable par période et par catégorie. Il suffit d’écrire une configuration : ni bibliothèque de graphiques ni abonnement BI.",
    intro: "La démo ci-dessus fait tourner dans votre navigateur les données d’un café fictif. Elle s’ouvre ici en anglais (il n’y a pas de version française) ; le bouton 日本語 en haut à droite passe en japonais.",
    use: "Filtrez par période et par catégorie : les chiffres, la courbe, les barres, l’objectif et le tableau changent ensemble. Au survol de la courbe, un repère vertical suit le pointeur et affiche les valeurs du jour. Chaque graphique peut passer en vue tableau ; les tableaux se trient d’un clic sur l’en-tête et se téléchargent en CSV. Les filtres restent dans l’URL : vous pouvez partager exactement la même vue.",
    partsHeading: "Ce qu’il fait",
    parts: "Cinq éléments (chiffres, courbe, barres, objectif, tableau) : la configuration dit quoi afficher et où. Sans bibliothèque de graphiques ni abonnement BI ; les couleurs forment une palette de 8 teintes qui restent distinguables quelle que soit la vision des couleurs. Utilisable au clavier seul, sur un écran de téléphone et en thème sombre.",
    deployHeading: "Trois façons de l’installer",
    deploy: "L’intégrer à votre site actuel en quelques lignes de HTML, utiliser le modèle Next.js (l’emplacement des données n’est jamais exposé au navigateur), ou publier directement depuis Google Sheets (visible uniquement par les personnes qui ont accès au tableur). Le même écran dans les trois cas.",
    buyHeading: "Lire le détail",
    kit: "Cette démo est le véritable Kit de tableau de bord. Les étapes d’installation et l’écriture de la configuration sont détaillées dans l’article note (en japonais)",
    sales: {
      proof: [
        { figure: "736", label: "Tests automatisés. Chaque version les passe tous avant d’être livrée (1.0.1)." },
        { figure: "0 ¥", label: "Coût mensuel. Ni bibliothèque de graphiques ni contrat d’outil BI." },
        { figure: "0", label: "Envoi vers les serveurs de l’auteur. Les chiffres ne circulent qu’entre votre emplacement de données et le navigateur du lecteur." },
        { figure: "3 façons", label: "De l’installer : intégré à un site (5 min environ), Next.js (15 min environ) ou publié depuis Google Sheets (15 min environ). Même écran partout." },
      ],
      audience: {
        fits: [
          "Êtes une agence ou un indépendant qui veut intégrer un écran de chiffres au site ou au tableur d’un client (ce que vous construisez avec peut être livré)",
          "Refaites chaque mois des graphiques depuis un tableur (avec la version Sheets, votre feuille actuelle devient l’écran)",
          "Voulez montrer des chiffres sur votre propre site sans demander de compte Google aux lecteurs (intégration ou Next.js)",
          "Préférez ne pas l’installer vous-même (l’installation peut être faite pour vous ; voir Prix ci-dessous)",
        ],
        notFor: [
          "N’avez que quelques collègues pour le consulter, tous avec un compte Google (le Looker Studio gratuit comparé ci-dessous suffit)",
          "Avez besoin de camemberts, de graphiques à deux axes, de cartes ou d’exploration détaillée (non inclus)",
          "Voulez une connexion directe à une base de données ou modifier la configuration à l’écran (non inclus)",
          "Voulez lui faire lire des dates écrites comme 10/1 ou selon l’ère japonaise (les dates doivent commencer par l’année sur 4 chiffres, comme 2026-10-01)",
        ],
      },
      compare: {
        rows: [
          {
            kind: "Outil gratuit",
            name: "Looker Studio",
            href: SOURCES.looker,
            cost: "0 ¥ (la version Pro est payante)",
            note: "L’outil de Google pour créer des écrans de graphiques à partir de tableurs et d’autres sources. Les rapports se créent avec un compte Google, et le partage décide qui peut les voir.",
          },
          {
            kind: "Fonction intégrée",
            name: "Graphiques de Google Sheets",
            href: SOURCES.sheetsChart,
            cost: "0 ¥ (intégré à Sheets)",
            note: "Crée des graphiques à partir d’un tableau. Un écran qui change selon la période ou le magasin est à assembler vous-même avec des filtres et des tableaux croisés.",
          },
          {
            kind: "Service similaire",
            name: "Geckoboard",
            href: SOURCES.geckoboard,
            cost: "Pas d’offre gratuite. Essentials à partir de 79 $/mois en annuel (essai gratuit de 14 jours)",
            note: "Un service par abonnement pour créer des écrans de chiffres.",
          },
        ],
        kit: "Écrivez une configuration : indicateurs, courbe, barres, objectif et tableau s’alignent sur un écran, et le filtre par période et catégorie les met tous à jour ensemble. Intégrable aussi aux sites clients. Sans abonnement, et le code reste chez vous.",
        checkedOn: CHECKED_ON,
      },
      steps: [
        {
          heading: "Version Sheets : quand s’affiche « Google n’a pas validé cette application »",
          intro: "Google affiche un écran d’autorisation à la première exécution, puis la première fois que chaque lecteur l’ouvre. Comme vous avez collé le script vous-même, c’est normal. Procédez dans cet ordre.",
          items: [
            "Sur l’écran « Autorisation requise », cliquez sur « Examiner les autorisations » et choisissez votre compte Google.",
            "Quand « Google n’a pas validé cette application » apparaît, cliquez sur le petit lien « Paramètres avancés » en bas de l’écran.",
            "Cliquez sur « Accéder à (nom du projet) (non sécurisé) », qui apparaît en dessous.",
            "Vérifiez les trois autorisations (feuilles de calcul, menu, adresse e-mail) et cliquez sur « Autoriser ».",
          ],
          after: "L’écran indique que le script peut consulter, modifier, créer et supprimer toutes vos feuilles de calcul, mais le kit ne touche que celle qui contient le script. Les lecteurs voient le même écran une fois, la première fois : envoyez-leur ces étapes avec l’URL.",
        },
        {
          heading: "Quand les chiffres n’apparaissent pas avec vos propres données",
          intro: "Cas fréquents quand on remplace l’exemple par ses données. La raison s’affiche dans le bandeau en haut de l’écran ou en rouge sur l’élément concerné.",
          items: [
            "Il indique que N valeurs ne se lisent pas comme des dates : écrivez les dates en commençant par l’année sur 4 chiffres, comme 2026-10-01 ou 2026/10/01.",
            "Il indique qu’une colonne est introuvable : vérifiez que la première ligne contient les en-têtes et que les noms de colonnes n’ont pas d’espace avant ou après.",
            "Il indique qu’un réglage est inconnu et en suggère un autre : c’est une faute de frappe dans la configuration ; utilisez le nom suggéré.",
            "La version Sheets indique que l’affichage est arrêté à cause des réglages de publication : allez dans Déployer → Gérer les déploiements → crayon, réglez « Exécuter en tant que » sur l’utilisateur qui accède à l’application et « Qui a accès » sur tout utilisateur disposant d’un compte Google, puis déployez une nouvelle version.",
          ],
          after: "Si la colonne des montants contient des « - » ou des cases vides, les valeurs illisibles sont écartées du calcul et leur nombre s’affiche sous la carte. Jamais de 0 silencieux.",
        },
      ],
    },
  },
};
