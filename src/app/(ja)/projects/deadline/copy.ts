import { money } from "@/i18n/ui";

import type { KitSales } from "../kit-parts";
import { STEP_IMAGES } from "../step-images";

const SOURCES = {
  addReminders: "https://workspace.google.com/marketplace/app/add_reminders/404177452106",
  slackRemind: "https://slack.com/intl/ja-jp/help/articles/208423427",
  checkSheet: "https://workspace.google.com/marketplace/app/check_sheet_notifications/239755856136",
};

/** 比べる相手のページを読んだ日（kit-demos.ts の CHECKED_ON と同じ日） */
const CHECKED_ON = "2026-09-29";

const jaSales: KitSales = {
  proof: [
    { figure: "158 件", label: "自動テストの数です。版を出すたびに、すべて通してからお届けしています（1.2.1）。" },
    { figure: "0 円", label: "月額の費用です。Google の無料の枠の中で動きます。" },
    { figure: "0 件", label: "作者への送信です。送り先は、お客さまが決めた通知先だけです。" },
    { figure: "14 日", label: "ご購入から、届くまでメールで一緒に確かめる期間です。" },
  ],
  audience: {
    fits: [
      "契約の更新・車検・支払いなどの期限を、Google スプレッドシートで管理している方",
      "期限切れ・今日・3 日前のものを、毎朝メール・Google Chat・Slack・Discord のどれかでまとめて受け取りたい方",
      "お客さまのスプレッドシートに組み込んで納品したい制作会社・フリーランスの方（改変して納品できます）",
      "ご自身で貼るのが不安な方（設置までお任せいただけます。下の「お値段」をご覧ください）",
    ],
    notFor: [
      "LINE で受け取りたい方（LINE には送れません）",
      "「毎月 10 日」のようなくり返しの期限を 1 行で回したい方（1 行に 1 つの日付です。くり返す分は行を足してお書きください）",
      "期限を Excel や手帳だけで管理していて、Google スプレッドシートに移せない方",
      "期限が数件だけで、カレンダーの通知で足りる方（下の比較の無料の道具をおすすめします）",
    ],
  },
  compare: {
    rows: [
      {
        kind: "無料の道具",
        name: "Add Reminders（Google Workspace Marketplace）",
        href: SOURCES.addReminders,
        cost: "0 円",
        note: "列の日付の前後に、メールで知らせる無料のアドオンです。メールで足りる方は、これで十分です。",
      },
      {
        kind: "標準の機能",
        name: "Slack のリマインダー（/remind）",
        href: SOURCES.slackRemind,
        cost: "0 円（Slack に最初からあります）",
        note: "決まった日に 1 行を知らせます。スプレッドシートの表は読みません。",
      },
      {
        kind: "似たサービス",
        name: "Check Sheet Notifications",
        href: SOURCES.checkSheet,
        cost: "無料の枠はチェック 1 本・月 500 通まで。超えると $9.99/月",
        note: "メール・Slack・Teams・Discord・Google Chat に送れます。2 本目のチェックから月額がかかります。",
      },
    ],
    kit: "期限切れ・今日・N 日前を毎朝 1 通にまとめ、完了にした行は外します。同じ日に二度は届きません。月額は 0 円で、プログラムはお手元に残ります。",
    checkedOn: CHECKED_ON,
  },
  steps: [
    {
      heading: "「このアプリは Google で確認されていません」と出たとき",
      image: STEP_IMAGES.gasAuth,
      intro: "初めて「初期化」を押すと、Google の確認画面が出ます。ご自身で貼ったスクリプトなので、この画面が出るのが正常です。次の順に進めてください。",
      items: [
        "「承認が必要です」の画面で「権限を確認」を押します。",
        "ご自身の Google アカウントを選びます。",
        "「このアプリは Google で確認されていません」と出たら、画面の下にある小さな「詳細」を押します。",
        "下に出る「（プロジェクト名）（安全ではないページ）に移動」を押します。",
        "許可の一覧を確かめて「許可」を押します。承認が済んだら、もう一度「初期化」を押してください。",
      ],
      after: "会社の Google アカウントで「ブロックされました」「管理者が制限しています」と出るときは、管理者の方の許可が要ります。すぐに許可が出ないときは、個人の Google アカウントでスプレッドシートを作ると動きます。",
    },
    {
      heading: "Windows で、Code.gs を貼るまで",
      intro: "ダウンロードした zip の中から、貼るファイルを 1 本だけ取り出します。",
      items: [
        "ダウンロードした zip を右クリックし、「すべて展開」を押します。",
        "展開したフォルダの「dist」を開き、「Code.gs」を右クリックして「プログラムから開く」→「メモ帳」を選びます。",
        "メモ帳で Ctrl + A を押して全部を選び、Ctrl + C でコピーします。",
        "スプレッドシートの「拡張機能」→「Apps Script」を開き、最初からある「コード.gs」の中身を全部消してから Ctrl + V で貼り、Ctrl + S で保存します。",
      ],
      after: "ほかのフォルダ（src・test など）は、中を直したい方向けです。貼る必要はありません。",
    },
  ],
};

const ja = {
  meta: {
    title: "契約・車検・支払いの期限を毎朝 1 通で｜スプレッドシートに貼るだけ（期限アラート GAS キット）",
    description: "契約の更新・車検・支払いなど、Google スプレッドシートに書いた期限を毎朝 8 時台に 1 通にまとめて、メール・Google Chat・Slack・Discord へお知らせするキットです。買い切りで月額はかかりません。表を書き換えて、届く 1 通をその場で確かめられます。",
  },
  name: "期限アラート GAS キット",
  title: "契約・車検・支払いの期限を、毎朝 1 通で",
  lede: "期限は表にあっても、毎日は見返せません。Google スプレッドシートの期限を毎朝 8 時台に読み、期限切れ・今日・3 日前のものを 1 通にまとめて、メール・Google Chat・Slack・Discord へお知らせします。",
  made: "上の 1 通と「設定を確かめる」の文は、キットに入っているプログラムをこのページの中でそのまま動かして作っています。文面をまねて書いたものではありません。キットでは、同じプログラムが毎朝 8 時台にスプレッドシートを読み、選んだ通知先（メール・Google Chat・Slack・Discord）へ送ります。",
  service: {
    before: "いまお使いの表の列に合わせたスクリプトだけがほしい方は、ココナラの「",
    after: "」（3,000 円から・3 日）をご利用ください。スクリプトと手順書をお送りし、貼り付けと Google の承認はお客さまに行っていただきます。貼り付けと設定まで任せたい方は、上の「お値段」の「設置まで頼む」からご相談ください。",
  },
  free: {
    before: "買う前に通知の届き方を確かめたい方には、3 日前と当日の期限だけを毎朝 Slack にお知らせする無料版「",
    after: "」を BOOTH でお配りしています。",
  },
  sales: jaSales,
};

export const copy: Record<"ja" | "en" | "fr", typeof ja> = {
  ja,
  en: {
    meta: {
      title: "Contract, inspection, and payment deadlines in one message every morning | Paste into your spreadsheet (Deadline Alert GAS Kit)",
      description: "A kit that reads the deadlines in your Google Sheets every morning around 8 a.m. and sends them as one message to email, Google Chat, Slack, or Discord. One-time purchase, no monthly fee. Edit the table and see the resulting message right away.",
    },
    name: "Deadline Alert GAS Kit",
    title: "Contract, inspection, and payment deadlines in one morning message",
    lede: "Deadlines may be in a spreadsheet, but nobody rereads it every day. Every morning around 8 a.m., this kit reads your Google Sheets and sends what is overdue, due today, and due in 3 days as one message to email, Google Chat, Slack, or Discord.",
    made: "The message above and the settings-check text are produced by running the kit’s own functions right on this page. They aren’t mock-ups written to look similar. In the kit, the same functions read the spreadsheet every morning around 8 a.m. and send to the destinations you choose (email, Google Chat, Slack, Discord).",
    service: {
      before: "If you only need a script adapted to the columns of your own sheet, our Coconala service “",
      after: `” covers it (from ${money("en", 3000)}, 3 days; the service page is in Japanese). We send the script and a guide; you paste it and approve Google’s permission prompt yourself. To have the pasting and settings done for you as well, use “Setup done for you” under Price above.`,
    },
    free: {
      before: "Want to see how notifications arrive before buying? A free version, “",
      after: "”, sends just the three-days-before and same-day reminders to Slack each morning. It’s on BOOTH (the page is in Japanese).",
    },
    sales: {
      proof: [
        { figure: "158", label: "Automated tests. Every release passes all of them before it ships (1.2.1)." },
        { figure: "¥0", label: "Monthly cost. It runs within Google’s free quota." },
        { figure: "0", label: "Messages sent to the author. It only sends to the destinations you choose." },
        { figure: "14 days", label: "After purchase, we check with you by email until messages arrive." },
      ],
      audience: {
        fits: [
          "Track contract renewals, vehicle inspections, payments, and similar deadlines in Google Sheets",
          "Want what is overdue, due today, and due in 3 days in one message each morning, by email, Google Chat, Slack, or Discord",
          "Are an agency or freelancer who wants to build it into a client’s spreadsheet (modified versions may be delivered)",
          "Would rather not install it yourself (setup can be done for you; see Price below)",
        ],
        notFor: [
          "Want to receive it on LINE (LINE is not supported)",
          "Need a recurring deadline such as “the 10th of every month” on a single row (one row holds one date; add a row for each occurrence)",
          "Keep deadlines only in Excel or a paper planner and cannot move them to Google Sheets",
          "Have only a few deadlines that calendar reminders already cover (we recommend the free tools compared below)",
        ],
      },
      compare: {
        rows: [
          {
            kind: "Free tool",
            name: "Add Reminders (Google Workspace Marketplace)",
            href: SOURCES.addReminders,
            cost: "¥0",
            note: "A free add-on that emails you around the dates in a column. If email is all you need, this is enough.",
          },
          {
            kind: "Built-in feature",
            name: "Slack reminders (/remind)",
            href: SOURCES.slackRemind,
            cost: "¥0 (built into Slack)",
            note: "Posts one line on a set date. It does not read your spreadsheet.",
          },
          {
            kind: "Similar service",
            name: "Check Sheet Notifications",
            href: SOURCES.checkSheet,
            cost: "Free tier: 1 check, 500 messages a month; $9.99/month beyond that",
            note: "Sends to email, Slack, Teams, Discord, and Google Chat. A monthly fee applies from the second check.",
          },
        ],
        kit: "Gathers overdue, today, and N-days-ahead items into one message each morning and leaves out rows marked done. The same item never arrives twice in a day. No monthly fee, and the code stays with you.",
        checkedOn: CHECKED_ON,
      },
      steps: [
        {
          heading: "When you see “Google hasn’t verified this app”",
          intro: "The first time you press Initialize, Google shows a confirmation screen. Because you pasted the script yourself, this screen is expected. Proceed in this order.",
          items: [
            "On the “Authorization required” screen, press “Review permissions”.",
            "Choose your Google account.",
            "When “Google hasn’t verified this app” appears, press the small “Advanced” link at the bottom of the screen.",
            "Press “Go to (project name) (unsafe)”, which appears below.",
            "Review the list of permissions and press “Allow”. Once approved, press Initialize again.",
          ],
          after: "If a company Google account shows “blocked” or “restricted by your administrator”, your administrator needs to allow the script. If that takes time, a spreadsheet created with a personal Google account will work.",
        },
        {
          heading: "On Windows, up to pasting Code.gs",
          intro: "From the downloaded zip, you take out just one file to paste.",
          items: [
            "Right-click the downloaded zip and choose “Extract All”.",
            "Open the “dist” folder inside, right-click “Code.gs”, and choose “Open with” → “Notepad”.",
            "In Notepad, press Ctrl + A to select everything, then Ctrl + C to copy.",
            "In the spreadsheet, open Extensions → Apps Script, delete everything in the existing “Code.gs”, paste with Ctrl + V, and save with Ctrl + S.",
          ],
          after: "The other folders (src, test, and so on) are for people who want to modify the code. You don’t need to paste them.",
        },
      ],
    },
  },
  fr: {
    meta: {
      title: "Échéances de contrats, contrôles techniques et paiements en un seul message chaque matin | À coller dans votre tableur (Kit GAS d’alertes d’échéances)",
      description: "Un kit qui lit chaque matin vers 8 h les échéances de votre Google Sheets et les envoie en un seul message par e-mail, Google Chat, Slack ou Discord. Achat unique, sans abonnement. Modifiez le tableau et voyez aussitôt le message obtenu.",
    },
    name: "Kit GAS d’alertes d’échéances",
    title: "Contrats, contrôles, paiements\u00a0: vos échéances en un message chaque matin",
    lede: "Les échéances ont beau être dans un tableur, personne ne le relit tous les jours. Chaque matin vers 8 h, ce kit lit votre Google Sheets et envoie en un seul message ce qui est dépassé, du jour et à J-3, par e-mail, Google Chat, Slack ou Discord.",
    made: "Le message ci-dessus et le texte de vérification des réglages sont produits en exécutant directement sur cette page les fonctions du kit. Ce ne sont pas des imitations. Dans le kit, les mêmes fonctions lisent le tableur chaque matin vers 8 h et envoient le message vers les destinations choisies (e-mail, Google Chat, Slack, Discord).",
    service: {
      before: "Si vous voulez seulement un script adapté aux colonnes de votre tableur, notre service Coconala « ",
      after: ` » s’en charge (à partir de ${money("fr", 3000)}, 3 jours ; la page du service est en japonais). Nous envoyons le script et un guide ; vous le collez et validez vous-même l’autorisation Google. Pour faire aussi le collage et les réglages à votre place, utilisez « Installation comprise » dans la section Prix ci-dessus.`,
    },
    free: {
      before: "Envie de voir comment arrivent les notifications avant d’acheter ? Une version gratuite, « ",
      after: " », envoie chaque matin sur Slack uniquement les rappels à J-3 et le jour même. Elle est disponible sur BOOTH (page en japonais).",
    },
    sales: {
      proof: [
        { figure: "158", label: "Tests automatisés. Chaque version les passe tous avant d’être livrée (1.2.1)." },
        { figure: "0 ¥", label: "Coût mensuel. Il fonctionne dans le quota gratuit de Google." },
        { figure: "0", label: "Envoi vers l’auteur. Il n’envoie qu’aux destinations que vous choisissez." },
        { figure: "14 jours", label: "Après l’achat, nous vérifions avec vous par e-mail jusqu’à ce que les messages arrivent." },
      ],
      audience: {
        fits: [
          "Suivez dans Google Sheets des échéances de renouvellement de contrats, de contrôles techniques, de paiements, etc.",
          "Voulez recevoir chaque matin en un seul message ce qui est dépassé, du jour et à J-3, par e-mail, Google Chat, Slack ou Discord",
          "Êtes une agence ou un indépendant qui veut l’intégrer au tableur d’un client (la livraison d’une version modifiée est permise)",
          "Préférez ne pas l’installer vous-même (l’installation peut être faite pour vous ; voir Prix ci-dessous)",
        ],
        notFor: [
          "Voulez le recevoir sur LINE (LINE n’est pas pris en charge)",
          "Avez une échéance récurrente comme « le 10 de chaque mois » à gérer sur une seule ligne (une ligne = une date ; ajoutez une ligne par occurrence)",
          "Gérez vos échéances uniquement dans Excel ou un agenda papier, sans pouvoir passer à Google Sheets",
          "N’avez que quelques échéances que les rappels d’agenda couvrent déjà (nous recommandons les outils gratuits comparés ci-dessous)",
        ],
      },
      compare: {
        rows: [
          {
            kind: "Outil gratuit",
            name: "Add Reminders (Google Workspace Marketplace)",
            href: SOURCES.addReminders,
            cost: "0 ¥",
            note: "Un module gratuit qui envoie un e-mail autour des dates d’une colonne. Si l’e-mail vous suffit, il convient.",
          },
          {
            kind: "Fonction intégrée",
            name: "Rappels Slack (/remind)",
            href: SOURCES.slackRemind,
            cost: "0 ¥ (intégré à Slack)",
            note: "Publie une ligne à une date fixée. Il ne lit pas votre tableur.",
          },
          {
            kind: "Service similaire",
            name: "Check Sheet Notifications",
            href: SOURCES.checkSheet,
            cost: "Offre gratuite : 1 vérification, 500 messages par mois ; au-delà 9,99 $/mois",
            note: "Envoie par e-mail, Slack, Teams, Discord et Google Chat. Abonnement à partir de la deuxième vérification.",
          },
        ],
        kit: "Regroupe chaque matin en un message ce qui est dépassé, du jour et à J-N, et ignore les lignes terminées. Le même élément n’arrive jamais deux fois le même jour. Sans abonnement, et le code reste chez vous.",
        checkedOn: CHECKED_ON,
      },
      steps: [
        {
          heading: "Quand s’affiche « Google n’a pas validé cette application »",
          intro: "La première fois que vous lancez l’initialisation, Google affiche un écran de confirmation. Comme vous avez collé le script vous-même, c’est normal. Procédez dans cet ordre.",
          items: [
            "Sur l’écran « Autorisation requise », cliquez sur « Examiner les autorisations ».",
            "Choisissez votre compte Google.",
            "Quand « Google n’a pas validé cette application » apparaît, cliquez sur le petit lien « Paramètres avancés » en bas de l’écran.",
            "Cliquez sur « Accéder à (nom du projet) (non sécurisé) », qui apparaît en dessous.",
            "Vérifiez la liste des autorisations et cliquez sur « Autoriser ». Une fois validé, relancez l’initialisation.",
          ],
          after: "Si un compte Google d’entreprise affiche « bloqué » ou « restreint par votre administrateur », l’administrateur doit autoriser le script. En attendant, un tableur créé avec un compte Google personnel fonctionne.",
        },
        {
          heading: "Sous Windows, jusqu’au collage de Code.gs",
          intro: "Du zip téléchargé, vous ne sortez qu’un seul fichier à coller.",
          items: [
            "Faites un clic droit sur le zip téléchargé et choisissez « Extraire tout ».",
            "Ouvrez le dossier « dist », faites un clic droit sur « Code.gs » et choisissez « Ouvrir avec » → « Bloc-notes ».",
            "Dans le Bloc-notes, appuyez sur Ctrl + A pour tout sélectionner, puis Ctrl + C pour copier.",
            "Dans le tableur, ouvrez Extensions → Apps Script, effacez tout le contenu du « Code.gs » existant, collez avec Ctrl + V et enregistrez avec Ctrl + S.",
          ],
          after: "Les autres dossiers (src, test, etc.) servent à ceux qui veulent modifier le code. Inutile de les coller.",
        },
      ],
    },
  },
};
