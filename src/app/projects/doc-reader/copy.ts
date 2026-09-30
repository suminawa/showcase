const ja = {
  meta: {
    title: "AI 書類読み取り",
    description: "請求書・領収書・申込書を読み取り、確認してから表に出す道具です。同梱の見本と、お手元の書類でその場から試せます。",
  },
  title: "AI 書類読み取り",
  lede: "請求書・領収書・申込書を読み取り、確認してから表に出す道具です",
  privacy: "読み取った結果はこのブラウザの中にだけ残り、サーバーには保存しません。1 日の枚数には上限があります。",
  kit: "この道具は「AI 書類読み取りキット」（定価 ¥16,800 の買い切り）の実物です。帳票の型を JSON で書き、確認画面つきの Next.js テンプレを Vercel に置くと、自社の鍵で動きます。",
};

export const copy: Record<"ja" | "en" | "fr", typeof ja> = {
  ja,
  en: {
    meta: {
      title: "AI Document Reader",
      description: "Reads invoices, receipts, and application forms, and puts the data in a table after you review it. Try it right away with the bundled samples or your own documents.",
    },
    title: "AI Document Reader",
    lede: "Reads invoices, receipts, and application forms, and puts the data in a table after you review it",
    privacy: "Results stay in this browser only and are not stored on the server. The number of pages per day is limited.",
    kit: "This tool is the actual AI Document Reader Kit (regular price ¥16,800, one-time purchase). Describe your document layouts in JSON, deploy the Next.js template with its review screen to Vercel, and it runs on your own API key.",
  },
  fr: {
    meta: {
      title: "Lecture de documents IA",
      description: "Lit factures, reçus et formulaires, puis place les données dans un tableau après votre vérification. Essayez tout de suite avec les exemples fournis ou vos propres documents.",
    },
    title: "Lecture de documents IA",
    lede: "Lit factures, reçus et formulaires, puis place les données dans un tableau après votre vérification",
    privacy: "Les résultats restent uniquement dans ce navigateur et ne sont pas enregistrés sur le serveur. Le nombre de pages par jour est limité.",
    kit: "Cet outil est le véritable Kit de lecture de documents IA (prix normal 16 800 ¥, achat unique). Décrivez vos modèles de documents en JSON, déployez le modèle Next.js avec son écran de vérification sur Vercel : il fonctionne avec votre propre clé.",
  },
};
