const ja = {
  meta: {
    title: "ダッシュボード キット",
    description: "スプレッドシートや CSV の数字を、設定を書くだけで KPI・グラフ・表の画面にするキットの見本。",
  },
  title: "ダッシュボード キット",
  lede: "スプレッドシートや CSV の数字を、設定を書くだけで KPI・グラフ・表の画面にします",
  intro: "この見本は、架空のお店「しおかぜ珈琲店」の見本データをブラウザの中で動かしています。右上の English を押すと、英語の画面に切り替わります。",
  use: "期間と区分で絞り込むと、下の数字・折れ線・棒・目標・表がいっしょに変わります。折れ線に触れると縦の線が付いてきて、その日の値をまとめて読めます。どのグラフも「表で見る」に切り替えられ、表は見出しを押して並べ替え、CSV でダウンロードできます。絞り込みは URL に残るので、同じ画面をそのまま人に渡せます。",
  parts: "部品は 5 つ（数字・折れ線・棒・目標・表）で、どこに何を出すかは設定に書くだけです。グラフのライブラリにも BI の月額にも頼らず、色は色覚の差があっても見分けられる 8 色の並びにしてあります。キーボードだけでも操作でき、スマートフォンの幅にも暗い配色にも対応しています。",
  deploy: "置き方は 3 つから選べます。いまのサイトに数行の HTML で埋め込む形、Next.js のテンプレ（データの置き場所はブラウザに出しません）、Google スプレッドシートからそのまま公開する形（見られるのは、そのスプレッドシートを見られる方だけ）。どれも同じ画面が出ます。",
  kit: "この見本は「ダッシュボード キット」（¥9,800 の買い切り）の実物です。サーバーも月額の費用もかかりません",
};

export const copy: Record<"ja" | "en" | "fr", typeof ja> = {
  ja,
  en: {
    meta: {
      title: "Dashboard Kit",
      description: "Demo of a kit that turns spreadsheet or CSV numbers into a screen of KPIs, charts, and tables, just by writing a configuration.",
    },
    title: "Dashboard Kit",
    lede: "Turns spreadsheet or CSV numbers into KPIs, charts, and tables, just by writing a configuration",
    intro: "This demo runs sample data for a fictional coffee shop in your browser. It opens in English here; press 日本語 at the top right to switch to Japanese.",
    use: "Filter by period and category, and the numbers, line chart, bar chart, target, and table below all update together. Hover over the line chart and a vertical guide follows, showing that day’s values at once. Every chart can switch to a table view; tables sort when you click a header and download as CSV. Filters are kept in the URL, so you can share exactly the same view.",
    parts: "There are five building blocks (numbers, line, bar, target, table), and the configuration decides what goes where. No chart library and no BI subscription; the colors are an 8-color palette that stays distinguishable for all types of color vision. It works with the keyboard alone, on phone-sized screens, and in dark mode.",
    deploy: "Three ways to deploy: embed it in your current site with a few lines of HTML, use the Next.js template (the data location is never exposed to the browser), or publish straight from Google Sheets (visible only to people who can view that spreadsheet). All three show the same screen.",
    kit: "This demo is the actual Dashboard Kit (¥9,800, one-time purchase). No server and no monthly fees",
  },
  fr: {
    meta: {
      title: "Kit de tableau de bord",
      description: "Démo d’un kit qui transforme les chiffres d’un tableur ou d’un CSV en un écran d’indicateurs, de graphiques et de tableaux, par simple configuration.",
    },
    title: "Kit de tableau de bord",
    lede: "Transforme les chiffres d’un tableur ou d’un CSV en indicateurs, graphiques et tableaux, par simple configuration",
    intro: "Cette démo fait tourner dans votre navigateur les données d’un café fictif. Elle s’ouvre ici en anglais (il n’y a pas de version française) ; le bouton 日本語 en haut à droite passe en japonais.",
    use: "Filtrez par période et par catégorie : les chiffres, la courbe, les barres, l’objectif et le tableau changent ensemble. Au survol de la courbe, un repère vertical suit le pointeur et affiche les valeurs du jour. Chaque graphique peut passer en vue tableau ; les tableaux se trient d’un clic sur l’en-tête et se téléchargent en CSV. Les filtres restent dans l’URL : vous pouvez partager exactement la même vue.",
    parts: "Cinq éléments (chiffres, courbe, barres, objectif, tableau) : la configuration dit quoi afficher et où. Sans bibliothèque de graphiques ni abonnement BI ; les couleurs forment une palette de 8 teintes qui restent distinguables quelle que soit la vision des couleurs. Utilisable au clavier seul, sur un écran de téléphone et en thème sombre.",
    deploy: "Trois façons de l’installer : l’intégrer à votre site actuel en quelques lignes de HTML, utiliser le modèle Next.js (l’emplacement des données n’est jamais exposé au navigateur), ou publier directement depuis Google Sheets (visible uniquement par les personnes qui ont accès au tableur). Le même écran dans les trois cas.",
    kit: "Cette démo est le véritable Kit de tableau de bord (9 800 ¥, achat unique). Ni serveur ni abonnement",
  },
};
