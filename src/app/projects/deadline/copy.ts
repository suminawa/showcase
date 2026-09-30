const ja = {
  meta: {
    title: "期限アラート GAS キット",
    description: "スプレッドシートに書いた期限を、毎朝 1 通にまとめて Slack か Discord へ知らせる Apps Script のキットの見本です。表を書き換えて、届く 1 通をその場で確かめられます。",
  },
  title: "期限アラート GAS キット",
  lede: "スプレッドシートに書いた期限を、毎朝 8 時に 1 通にまとめてお知らせします。期限を過ぎたものが先頭に並びます。",
  made: "上の 1 通と「設定を確かめる」の文は、キットに入っている src/ の関数をこのページの中でそのまま動かして作っています。文面をまねて書いたものではありません。キットでは、同じ関数が毎朝 8 時にスプレッドシートを読み、Slack か Discord へ送ります。",
};

export const copy: Record<"ja" | "en" | "fr", typeof ja> = {
  ja,
  en: {
    meta: {
      title: "Deadline Alert GAS Kit",
      description: "Demo of an Apps Script kit that gathers the deadlines in a spreadsheet into one message every morning on Slack or Discord. Edit the table and see the resulting message right away.",
    },
    title: "Deadline Alert GAS Kit",
    lede: "Gathers the deadlines in your spreadsheet into one message at 8 a.m. every morning, with overdue items listed first.",
    made: "The message above and the settings-check text are produced by running the kit’s own src/ functions right on this page. They aren’t mock-ups written to look similar. In the kit, the same functions read the spreadsheet at 8 a.m. every morning and send to Slack or Discord.",
  },
  fr: {
    meta: {
      title: "Kit GAS d’alertes d’échéances",
      description: "Démo d’un kit Apps Script qui regroupe chaque matin les échéances d’un tableur en un seul message sur Slack ou Discord. Modifiez le tableau et voyez aussitôt le message obtenu.",
    },
    title: "Kit GAS d’alertes d’échéances",
    lede: "Regroupe chaque matin à 8 h les échéances de votre tableur en un seul message, les échéances dépassées en tête.",
    made: "Le message ci-dessus et le texte de vérification des réglages sont produits en exécutant directement sur cette page les fonctions src/ du kit. Ce ne sont pas des imitations. Dans le kit, les mêmes fonctions lisent le tableur chaque matin à 8 h et envoient le message sur Slack ou Discord.",
  },
};
