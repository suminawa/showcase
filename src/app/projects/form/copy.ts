import { money } from "@/i18n/ui";

const ja = {
  meta: {
    title: "フォーム受付 GAS キット",
    description: "サイトのフォームの送信先になる Apps Script のキットの見本です。送ると、受付シートの 1 行・Slack などへの通知・自動返信がその場で見られます（どこにも送りません）。",
  },
  title: "フォーム受付 GAS キット",
  lede: "サイトのフォームから届いた内容をスプレッドシートに 1 行ずつ貯め、Slack・Discord・LINE にお知らせし、送った方へ自動で返信します。",
  made: "受付番号・シートの行・通知・自動返信・断るときの文は、キットに入っている src/ の関数をこのページの中でそのまま動かして作っています。見えない欄による迷惑投稿よけ、10 分以内の二重送信の防止、枠ごとの定員もキットと同じ働きです。キットでは、同じ関数が Google のウェブアプリとして送信を受けます。",
  service: {
    before: "いまお使いのフォームで「自動返信が届かない」「送信できない」といったお困りごとは、ココナラの「",
    after: "」（1 か所 5,000 円）で直すこともできます。",
  },
};

export const copy: Record<"ja" | "en" | "fr", typeof ja> = {
  ja,
  en: {
    meta: {
      title: "Form Intake GAS Kit",
      description: "Demo of an Apps Script kit that receives your website form’s submissions. Submit it and see the intake sheet row, the notification to Slack and others, and the auto-reply on the spot (nothing is actually sent).",
    },
    title: "Form Intake GAS Kit",
    lede: "Saves each submission from your website form as a row in a spreadsheet, notifies you on Slack, Discord, or LINE, and sends the sender an automatic reply.",
    made: "The reference number, sheet row, notification, auto-reply, and rejection messages are produced by running the kit’s own src/ functions right on this page. The hidden-field spam trap, blocking of duplicate submissions within 10 minutes, and per-slot capacity also work exactly as in the kit. In the kit, the same functions receive submissions as a Google web app.",
    service: {
      before: "If a form you already use has a problem, such as auto-replies not arriving or submissions failing, we can also fix it through our Coconala service “",
      after: `” (${money("en", 5000)} per issue; the service page is in Japanese).`,
    },
  },
  fr: {
    meta: {
      title: "Kit GAS de réception de formulaires",
      description: "Démo d’un kit Apps Script qui reçoit les envois du formulaire de votre site. Envoyez-le et voyez aussitôt la ligne ajoutée au tableur, la notification (Slack, etc.) et la réponse automatique (rien n’est réellement envoyé).",
    },
    title: "Kit GAS de réception de formulaires",
    lede: "Enregistre chaque envoi du formulaire de votre site comme une ligne de tableur, vous prévient sur Slack, Discord ou LINE et envoie une réponse automatique à l’expéditeur.",
    made: "Le numéro de référence, la ligne du tableur, la notification, la réponse automatique et les messages de refus sont produits en exécutant directement sur cette page les fonctions src/ du kit. Le champ caché anti-spam, le blocage des doublons dans les 10 minutes et la capacité par créneau fonctionnent aussi comme dans le kit. Dans le kit, les mêmes fonctions reçoivent les envois en tant qu’application web Google.",
    service: {
      before: "Si un formulaire que vous utilisez déjà pose problème (réponses automatiques qui n’arrivent pas, envois qui échouent), nous pouvons aussi le corriger via notre service Coconala «\u00a0",
      after: `\u00a0» (${money("fr", 5000)} par point à corriger\u00a0; la page du service est en japonais).`,
    },
  },
};
