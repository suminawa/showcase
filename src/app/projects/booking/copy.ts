const ja = {
  meta: {
    title: "予約ページ キット",
    description: "スプレッドシートに枠を書くだけで、公開した URL がそのまま予約ページになる Apps Script のキットの見本。",
  },
  title: "予約ページ キット",
  lede: "スプレッドシートに枠を書くだけで、公開した URL がそのまま予約ページになります",
  intro: "この見本は、架空のお店「ひだまり整体院」の見本データをブラウザの中で動かしています。ご予約はページを閉じると消えます。",
  flow: "お客さまは空きカレンダーから日を選び、時間を選び、お名前と連絡先を入れて、確認をはさんでご予約いただけます。Google アカウントもログインも要りません。受け付けたご予約は「予約」シートに 1 行たまり、お客さまへ確認メール、お店へお知らせのメールが届きます。前日のリマインドも自動で送れます。",
  options: "Google カレンダーへの登録は任意で、設定を空にしておけば登録しません。キャンセルは確認メールに書かれた URL からお客さまご自身で手続きでき、締切は設定で決められます。Slack・Discord・LINE への通知も、設定に URL を入れれば届きます。所要時間の違うサービスを並べて選んでいただくこともでき、画面はスマートフォンを先に考えた作りです。",
  setup: "置き方は、スプレッドシートを作り、dist/ の 3 つのファイル（Code.gs・App.html・appsscript.json）を貼って、ウェブアプリとして公開（全員・自分として実行）するだけです。メニューの「初期化」→「見本を入れる」→「予約ページの URL」で動きます（Google の許可の画面を含めて 15 分ほど）。",
  kit: "この見本は「予約ページ キット」（¥7,980 の買い切り）の実物です。サーバーも月額の費用もかかりません",
};

export const copy: Record<"ja" | "en" | "fr", typeof ja> = {
  ja,
  en: {
    meta: {
      title: "Booking Page Kit",
      description: "Demo of an Apps Script kit: write time slots in a spreadsheet, and the published URL becomes your booking page.",
    },
    title: "Booking Page Kit",
    lede: "Write your time slots in a spreadsheet, and the published URL becomes your booking page",
    intro: "This demo runs sample data for a fictional bodywork clinic, entirely in your browser, and is in Japanese. Bookings disappear when you close the page.",
    flow: "Customers pick a day on the availability calendar, choose a time, enter their name and contact details, and confirm. No Google account or login needed. Each booking is added as a row to the bookings sheet; the customer gets a confirmation email and the business gets a notification. Day-before reminders can go out automatically.",
    options: "Adding bookings to Google Calendar is optional; leave the setting empty to skip it. Customers can cancel on their own from the link in the confirmation email, with a cutoff you set. Slack, Discord, and LINE notifications work once you add a URL in the settings. You can offer several services with different durations, and the screens are designed mobile-first.",
    setup: "To set it up, create a spreadsheet, paste in the three files from dist/ (Code.gs, App.html, appsscript.json), and deploy it as a web app (access: anyone, execute as: me). Then use the menu to initialize, add the samples, and get the booking page URL (about 15 minutes, including Google’s permission screens).",
    kit: "This demo is the actual Booking Page Kit (¥7,980, one-time purchase). No server and no monthly fees",
  },
  fr: {
    meta: {
      title: "Kit de page de réservation",
      description: "Démo d’un kit Apps Script : inscrivez vos créneaux dans un tableur, et l’URL publiée devient votre page de réservation.",
    },
    title: "Kit de page de réservation",
    lede: "Inscrivez vos créneaux dans un tableur : l’URL publiée devient votre page de réservation",
    intro: "Cette démo fait tourner, entièrement dans votre navigateur, les données d’un cabinet de soins fictif ; elle est en japonais. Les réservations disparaissent à la fermeture de la page.",
    flow: "Le client choisit un jour dans le calendrier des disponibilités, puis une heure, saisit son nom et ses coordonnées et confirme. Ni compte Google ni connexion. Chaque réservation s’ajoute en ligne dans la feuille des réservations ; le client reçoit un e-mail de confirmation et l’établissement une notification. Des rappels la veille peuvent partir automatiquement.",
    options: "L’ajout à Google Agenda est facultatif : laissez le réglage vide pour ne pas l’utiliser. Le client peut annuler lui-même depuis le lien de l’e-mail de confirmation, avec une date limite que vous fixez. Les notifications Slack, Discord et LINE fonctionnent dès que vous indiquez une URL dans les réglages. Vous pouvez proposer plusieurs prestations de durées différentes, et les écrans sont pensés d’abord pour le mobile.",
    setup: "Pour l’installer : créez un tableur, collez les trois fichiers de dist/ (Code.gs, App.html, appsscript.json) et déployez-le comme application web (accès : tout le monde, exécution : moi). Le menu permet ensuite d’initialiser, d’ajouter les exemples et d’obtenir l’URL de la page de réservation (environ 15 minutes, écrans d’autorisation Google compris).",
    kit: "Cette démo est le véritable Kit de page de réservation (7 980 ¥, achat unique). Ni serveur ni abonnement",
  },
};
