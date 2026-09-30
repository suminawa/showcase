const ja = {
  meta: {
    title: "スプレッドシート業務アプリ",
    description: "スプレッドシートを台帳のまま、定義シートに列を書くだけで、一覧・検索・登録・編集の画面をスマートフォンでも。Apps Script の Web アプリとして公開するキットの見本。",
  },
  title: "スプレッドシート業務アプリ",
  lede: "スプレッドシートの『定義』に列を書くだけで、顧客・案件・在庫の一覧・検索・登録・編集の画面になります",
  demo: "この見本は、キットに同梱の顧客管理のテンプレ（顧客 20 件・対応履歴 30 件）をブラウザの中で動かしています。登録や編集はページを閉じると消えます。実物は Google スプレッドシートを台帳にして、Apps Script の Web アプリとして公開します。",
  access: "権限はスプレッドシートの共有設定がそのまま効き、サーバーも月額の利用料も要りません。AI（任意）を入れると、言葉での絞り込みと 1 件の要約ができます。",
  kit: "この見本は「スプレッドシート業務アプリ キット」（定価 ¥12,800 の買い切り。10 月 2 日までは 1.1 の発売記念 ¥9,800）の実物です。定義シートからの画面生成・CSV・AI の絞り込みと要約・見本 3 種に加え、1.1 で登録・更新の LINE・Slack 通知と、記録からの LINE 送信（この見本でも「LINE で送る」を試せます）",
};

export const copy: Record<"ja" | "en" | "fr", typeof ja> = {
  ja,
  en: {
    meta: {
      title: "Spreadsheet Business App",
      description: "Keep your spreadsheet as the ledger: list columns in a definition sheet and get list, search, entry, and edit screens that work on phones too. Demo of a kit published as an Apps Script web app.",
    },
    title: "Spreadsheet Business App",
    lede: "List columns in the spreadsheet’s definition sheet, and you get list, search, entry, and edit screens for customers, deals, or inventory",
    demo: "This demo runs the kit’s bundled customer-management template (20 customers, 30 activity records) in your browser. Entries and edits disappear when you close the page. The real thing uses a Google spreadsheet as the ledger and is published as an Apps Script web app.",
    access: "Access follows the spreadsheet’s sharing settings, with no server and no monthly fees. Add AI (optional) to filter in plain language and summarize a record.",
    kit: "This demo is the actual Spreadsheet Business App Kit (regular price ¥12,800, one-time purchase; 1.1 launch price ¥9,800 until October 2). Screens generated from the definition sheet, CSV, AI filtering and summaries, and three sample templates, plus in 1.1: LINE and Slack notifications for new and updated records, and sending LINE messages from a record (you can try the LINE send button in this demo too)",
  },
  fr: {
    meta: {
      title: "Application métier sur tableur",
      description: "Gardez votre tableur comme registre : décrivez les colonnes dans une feuille de définition et obtenez des écrans de liste, recherche, saisie et modification, y compris sur mobile. Démo d’un kit publié comme application web Apps Script.",
    },
    title: "Application métier sur tableur",
    lede: "Décrivez les colonnes dans la feuille de définition du tableur : vous obtenez les écrans de liste, recherche, saisie et modification pour vos clients, affaires ou stocks",
    demo: "Cette démo fait tourner dans votre navigateur le modèle de gestion clients fourni avec le kit (20 clients, 30 suivis). Les saisies et modifications disparaissent à la fermeture de la page. La version réelle utilise un tableur Google comme registre et se publie comme application web Apps Script.",
    access: "Les droits suivent les paramètres de partage du tableur, sans serveur ni abonnement. Avec l’IA (facultative), filtrez en langage naturel et résumez une fiche.",
    kit: "Cette démo est le véritable Kit d’application métier sur tableur (prix normal 12 800 ¥, achat unique ; prix de lancement de la 1.1 : 9 800 ¥ jusqu’au 2 octobre). Écrans générés depuis la feuille de définition, CSV, filtrage et résumés par IA, trois modèles d’exemple, et avec la 1.1 : notifications LINE et Slack à l’ajout et à la mise à jour, et envoi de messages LINE depuis une fiche (le bouton d’envoi LINE s’essaie aussi dans cette démo)",
  },
};
