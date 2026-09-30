const ja = {
  meta: {
    title: "AI 問い合わせ整理キット",
    description: "Gmail に届く問い合わせを AI が読み、分類・緊急度・要約をスプレッドシートに、返信案を下書きに置く Apps Script のキットの見本です。見本のメール 5 通の整理の結果を読めます。",
  },
  title: "AI 問い合わせ整理キット",
  lede: "Gmail に届いた問い合わせを AI が読み、分類・緊急度・要約をスプレッドシートに、返信の下書きを Gmail に置きます。送るのは人で、自動では送りません。",
  made: "通知の 1 通・シートの行・下書きの本文・ラベル・Claude に渡す文は、キットに入っている src/ の関数をこのページの中でそのまま動かして作っています。AI の答えだけは見本の記録で、このページから AI は呼びません。キットでは、同じ関数が 15 分ごとに Gmail を読み、ご自身の API キーで Claude に尋ねます。",
};

export const copy: Record<"ja" | "en" | "fr", typeof ja> = {
  ja,
  en: {
    meta: {
      title: "AI Inquiry Triage Kit",
      description: "Demo of an Apps Script kit where AI reads the inquiries arriving in Gmail, logs category, urgency, and summary to a spreadsheet, and saves reply drafts. Read the results of triaging five sample emails.",
    },
    title: "AI Inquiry Triage Kit",
    lede: "AI reads the inquiries that arrive in Gmail, logs category, urgency, and summary to a spreadsheet, and leaves reply drafts in Gmail. A person sends them; nothing goes out automatically.",
    made: "The notification, sheet rows, draft text, labels, and the prompt sent to Claude are produced by running the kit’s own src/ functions right on this page. Only the AI’s answers are recorded samples; this page never calls the AI. In the kit, the same functions read Gmail every 15 minutes and ask Claude using your own API key.",
  },
  fr: {
    meta: {
      title: "Kit de tri des demandes par IA",
      description: "Démo d’un kit Apps Script : l’IA lit les demandes arrivées dans Gmail, note catégorie, urgence et résumé dans un tableur et prépare des brouillons de réponse. Consultez le résultat du tri de cinq e-mails d’exemple.",
    },
    title: "Kit de tri des demandes par IA",
    lede: "L’IA lit les demandes arrivées dans Gmail, note catégorie, urgence et résumé dans un tableur et laisse des brouillons de réponse dans Gmail. C’est une personne qui envoie ; rien ne part automatiquement.",
    made: "La notification, les lignes du tableur, le texte des brouillons, les libellés et le texte envoyé à Claude sont produits en exécutant directement sur cette page les fonctions src/ du kit. Seules les réponses de l’IA sont des enregistrements d’exemple ; cette page n’appelle jamais l’IA. Dans le kit, les mêmes fonctions lisent Gmail toutes les 15 minutes et interrogent Claude avec votre propre clé API.",
  },
};
