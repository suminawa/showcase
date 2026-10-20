import type { KitSales } from "../kit-parts";
import { STEP_IMAGES } from "../step-images";

const SOURCES = {
  googleCalendar: "https://support.google.com/calendar/answer/190998?hl=ja",
  stores: "https://stores.fun/reserve/pricing",
  simplybook: "https://simplybook.me/en/pricing",
};

/** 比べる相手のページを読んだ日 */
const CHECKED_ON = "2026-10-20";

const jaSales: KitSales = {
  proof: [
    { figure: "324 件", label: "自動テストの数です。版を出すたびに、すべて通してからお届けしています（1.1.2）。" },
    { figure: "0 円", label: "月額の費用です。ご予約が何件入っても変わりません。" },
    { figure: "3 回", label: "発売からの更新の回数です（1.1〜1.1.2）。お求めの方には、どれも無料でお届けしています。" },
    { figure: "14 日", label: "ご購入から、不具合のご連絡にメールでお応えする期間です（3 営業日以内に返信します）。" },
  ],
  audience: {
    fits: [
      "体験会・説明会・グループレッスンなど、同じ時間に 2 人以上の定員がある枠を受け付けたい方",
      "教室・相談枠・社内の会議室や設備など、曜日と時間の決まった枠をスマートフォンから予約していただきたい方（振替は、お客さまがキャンセルして空いている枠を取り直す形です）",
      "確認メール・前日のリマインド・お客さまご自身でのキャンセルを、月額なしで付けたい方",
      "お客さまのサイトに組み込んで納品したい制作会社・フリーランスの方（改変して納品できます）。ご自身で置くのが不安な方は、設置までお任せいただけます",
    ],
    notFor: [
      "前日のリマインドを LINE でお客さまに届けたい方（お客さまへの確認とリマインドはメールです。LINE に届くのは、お店へのお知らせだけです）",
      "予約と同時にお支払いを受けたい方、複数の店舗やスタッフの指名を切り替えたい方（オンライン決済・複数店舗・スタッフの指名はできません）",
      "ご予約が月 50 件までに収まり、定員のある枠も要らない方（無料の予約サービスで足ります。下の比較をご覧ください）",
      "会社の Google アカウントでしか作れず、管理者が外部への公開を止めている方（「全員」に公開できないと、社外のお客さまが予約ページを開けません）",
    ],
  },
  compare: {
    rows: [
      {
        kind: "標準の機能",
        name: "Google カレンダーの予約スケジュール",
        href: SOURCES.googleCalendar,
        cost: "0 円（個人の Google アカウントで作れます）",
        note: "ご自身の予定に予約を受けられます。リマインダーのメールは、有料の契約の機能です。",
      },
      {
        kind: "無料の道具",
        name: "STORES 予約（フリープラン）",
        href: SOURCES.stores,
        cost: "0 円（月 50 件まで）",
        note: "自動のリマインドメールは、有料のプラン（月 9,790 円・税込から）の機能です。月 50 件までで、リマインドも要らない方は、これで十分です。",
      },
      {
        kind: "似たサービス",
        name: "SimplyBook.me",
        href: SOURCES.simplybook,
        cost: "無料のプランは月 50 件まで。超えると月 €13.9（100 件まで）から",
        note: "定員つきの枠とメールのリマインドも、無料のプランで使えます。ご予約の件数に応じて月額が上がります。",
      },
    ],
    kit: "定員つきの枠・所要時間の違うサービス・確認メール・前日のリマインド・締切つきのセルフキャンセルを、月額 0 円で持てます。ご予約はご自身のスプレッドシートに残り、件数が増えても費用は変わりません。",
    checkedOn: CHECKED_ON,
  },
  steps: [
    {
      heading: "公開するときの「自分」と「全員」",
      intro: "予約ページが開けないときの原因の多くは、ここの選び方です。画面の言葉のとおりに選んでください。",
      items: [
        "Apps Script の右上の「デプロイ」→「新しいデプロイ」と進み、種類の歯車で「ウェブアプリ」を選びます。",
        "「次のユーザーとして実行」は「自分」、「アクセスできるユーザー」は「全員」にします。並んでいる「Google アカウントを持つ全員」は選ばないでください。選ぶと、予約ページを開いたお客さま全員に Google の承認画面が出て、予約できなくなります。",
        "「デプロイ」を押したら、スプレッドシートのメニュー「予約ページ」→「予約ページの URL」で URL を確かめます。",
        "あとでスクリプトを直したときは「デプロイを管理」→ 鉛筆のしるし → バージョン「新バージョン」で更新します。「新しいデプロイ」で作り直すと、URL が変わります。",
      ],
      after: "「全員」で公開しても、開けるのは予約ページだけです。スプレッドシートそのものを開けるのは、所有者と共有した方だけです。会社の Google アカウントで「全員」が出ないときは、個人の Google アカウントで作り直すと動きます。",
    },
    {
      heading: "承認の画面と、前日のリマインドを動かすまで",
      image: STEP_IMAGES.gasAuth,
      intro: "初めて公開するときに、Google の承認の画面が出ます。ご自身で作ったスクリプトなので、出るのが正常です。",
      items: [
        "「承認が必要です」の画面で「権限を確認」を押し、ご自身の Google アカウントを選びます。",
        "「このアプリは Google で確認されていません」と出たら、画面の下にある小さな「詳細」を押し、「（プロジェクト名）（安全ではないページ）に移動」を押します。",
        "6 つの権限（このスプレッドシート・メールの送信・カレンダーなど）を確かめて「許可」を押します。",
        "スプレッドシートを再読み込みし、メニュー「予約ページ」→「初期化」→「設定を確かめる」の順に押します。「問題ありません。」と出れば準備は済みです。",
        "最後に「予約ページ」→「リマインドのトリガーを作る」を押します。これを押すまで、前日のリマインドは送られません。押すのは、予約ページを公開した方です。",
      ],
      after: "設置のあと、受け付ける時間や休みを変えるときは、「枠」と「休み」のシートを書き直すだけです。スマートフォンの Google スプレッドシートのアプリからも直せます。",
    },
  ],
};

const ja = {
  meta: {
    title: "定員つきの予約ページを月額 0 円で｜確認メール・前日リマインド・セルフキャンセル。教室・体験会・相談枠に（予約ページ キット）",
    description: "Google スプレッドシートに枠と定員を書くと、その URL が予約ページになるキットです。確認メール・前日のリマインド・お客さまご自身でのキャンセルまで、ご予約が何件入っても月額はかかりません。教室・体験会・相談枠・社内の設備に。見本はその場で予約まで試せます。",
  },
  name: "予約ページ キット",
  title: "定員つきの予約ページを、月額 0 円で",
  lede: "レッスン中や施術中は、電話に出られません。スプレッドシートに枠と定員を書くと、その URL が予約ページになり、確認メールと前日のリマインドまで自動で送ります。教室・体験会・相談枠に向いた作りで、ご予約が何件入っても月額はかかりません。",
  intro: "この見本は、架空のお店「ひだまり整体院」の見本データをブラウザの中で動かしています。ご予約はページを閉じると消えます。",
  flow: "お客さまは空きカレンダーから日を選び、時間を選び、お名前と連絡先を入れて、確認をはさんでご予約いただけます。Google アカウントもログインも要りません。受け付けたご予約は「予約」シートに 1 行たまり、お客さまへ確認メール、お店へお知らせのメールが届きます。前日のリマインドも自動で送れます。",
  options: "Google カレンダーへの登録は任意で、設定を空にしておけば登録しません。キャンセルは確認メールに書かれた URL からお客さまご自身で手続きでき、締切は設定で決められます。お店へのお知らせは、設定に URL を入れれば Slack・Discord・LINE にも届きます。所要時間の違うサービスを並べて選んでいただくこともでき、画面はスマートフォンを先に考えた作りです。",
  sales: jaSales,
};

export const copy: Record<"ja" | "en" | "fr", typeof ja> = {
  ja,
  en: {
    meta: {
      title: "A booking page with capacity per slot, no monthly fee | Confirmation emails, day-before reminders, self-cancellation (Booking Page Kit)",
      description: "A kit that turns the time slots and capacities you write in Google Sheets into a booking page at its own URL. Confirmation emails, day-before reminders, and customer self-cancellation, with no monthly fee however many bookings come in. Suited to classes, trial sessions, consultations, and shared rooms. Try booking in the demo right here.",
    },
    name: "Booking Page Kit",
    title: "A booking page with capacity per slot, no monthly fee",
    lede: "You can’t answer the phone mid-lesson or mid-session. Write your slots and capacities in a spreadsheet, and its URL becomes a booking page that sends confirmation emails and day-before reminders on its own. Built for classes, trial sessions, and consultation slots, with no monthly fee however many bookings come in.",
    intro: "This demo runs on sample data for a fictional bodywork clinic, entirely in your browser (the demo is in Japanese). Bookings disappear when you close the page.",
    flow: "Customers pick a day on the availability calendar, choose a time, enter their name and contact details, and confirm. No Google account or login needed. Each booking is added as a row to the bookings sheet; the customer gets a confirmation email and the business gets a notification. Day-before reminders can go out automatically.",
    options: "Adding bookings to Google Calendar is optional; leave the setting empty to skip it. Customers can cancel on their own from the link in the confirmation email, with a cutoff you set. Notifications to the business can also go to Slack, Discord, or LINE once you add a URL in the settings. You can offer several services with different durations, and the screens are designed mobile-first.",
    sales: {
      proof: [
        { figure: "324", label: "Automated tests. Every release passes all of them before it ships (1.1.2)." },
        { figure: "¥0", label: "Monthly cost, however many bookings come in." },
        { figure: "3", label: "Updates since launch (1.1 to 1.1.2). Every one has been free for existing buyers." },
        { figure: "14 days", label: "After purchase, we answer bug reports by email (reply within 3 business days)." },
      ],
      audience: {
        fits: [
          "Want to take bookings for slots with two or more places at the same time, such as trial sessions, information sessions, or group lessons",
          "Want customers to book fixed weekday time slots from their phones, for classes, consultations, or shared rooms and equipment (rescheduling means cancelling and booking another open slot)",
          "Want confirmation emails, day-before reminders, and customer self-cancellation without a monthly fee",
          "Are an agency or freelancer who wants to build it into a client’s site (modified versions may be delivered). If you’d rather not install it yourself, setup can be done for you",
        ],
        notFor: [
          "Want day-before reminders to reach customers on LINE (confirmations and reminders to customers go by email; LINE only carries notifications to the business)",
          "Need payment at booking time, multiple locations, or choosing a staff member (online payment, multiple locations, and staff selection aren’t supported)",
          "Stay within 50 bookings a month and don’t need slots with capacity (a free booking service is enough; see the comparison below)",
          "Can only use a company Google account whose administrator blocks public sharing (without publishing to “Anyone”, customers outside the company can’t open the page)",
        ],
      },
      compare: {
        rows: [
          {
            kind: "Built-in feature",
            name: "Google Calendar appointment schedules",
            href: SOURCES.googleCalendar,
            cost: "¥0 (works with a personal Google account)",
            note: "Takes bookings on your own calendar. Reminder emails are a paid-subscription feature.",
          },
          {
            kind: "Free tool",
            name: "STORES Reserve (free plan)",
            href: SOURCES.stores,
            cost: "¥0 (up to 50 bookings a month)",
            note: `Automatic reminder emails come with the paid plans (from ¥9,790/month, tax incl.). If you stay under 50 bookings a month and don’t need reminders, this is enough.`,
          },
          {
            kind: "Similar service",
            name: "SimplyBook.me",
            href: SOURCES.simplybook,
            cost: "Free plan up to 50 bookings a month; beyond that from €13.9/month (up to 100)",
            note: "Capacity per slot and email reminders are included even on the free plan. The monthly fee rises with the number of bookings.",
          },
        ],
        kit: "Slots with capacity, services of different lengths, confirmation emails, day-before reminders, and self-cancellation with a cutoff, all with no monthly fee. Bookings stay in your own spreadsheet, and the cost doesn’t change as bookings grow.",
        checkedOn: CHECKED_ON,
      },
      steps: [
        {
          heading: "“Me” and “Anyone” when deploying",
          intro: "Most cases of “the booking page won’t open” come down to the choices on this screen. Pick exactly the options named below.",
          items: [
            "In Apps Script, press Deploy → New deployment at the top right, and choose “Web app” from the type gear.",
            "Set “Execute as” to “Me” and “Who has access” to “Anyone”. Do not pick the neighboring “Anyone with Google account”; with it, every customer who opens the page sees a Google authorization screen and can’t book.",
            "After pressing Deploy, check the URL from the spreadsheet menu: Booking page → Booking page URL.",
            "When you later change the script, update via Manage deployments → pencil → version “New version”. Creating a “New deployment” changes the URL.",
          ],
          after: "Publishing to “Anyone” only opens the booking page. The spreadsheet itself stays visible only to its owner and the people it is shared with. If a company Google account doesn’t offer “Anyone”, recreating it with a personal Google account works.",
        },
        {
          heading: "The authorization screen, and getting reminders running",
          intro: "The first time you deploy, Google shows an authorization screen. Because you created the script yourself, this is expected.",
          items: [
            "On the “Authorization required” screen, press “Review permissions” and choose your Google account.",
            "When “Google hasn’t verified this app” appears, press the small “Advanced” link at the bottom, then “Go to (project name) (unsafe)”.",
            "Review the six permissions (this spreadsheet, sending email, calendar, and so on) and press “Allow”.",
            "Reload the spreadsheet and run Booking page → Initialize → Check settings from the menu. When it says there are no problems, you’re ready.",
            "Finally, run Booking page → Create reminder trigger. Day-before reminders don’t go out until you do. The person who deployed the booking page should run it.",
          ],
          after: "After setup, changing your hours or days off only means editing the slots and days-off sheets, which you can also do from the Google Sheets app on a phone.",
        },
      ],
    },
  },
  fr: {
    meta: {
      title: "Une page de réservation avec places par créneau, sans abonnement | E-mails de confirmation, rappel la veille, annulation en ligne (Kit de page de réservation)",
      description: "Un kit qui transforme les créneaux et les places inscrits dans Google Sheets en page de réservation à son URL. E-mails de confirmation, rappel la veille et annulation par le client, sans abonnement quel que soit le nombre de réservations. Pour les cours, séances d’essai, consultations et salles partagées. Essayez la réservation dans la démo ici même.",
    },
    name: "Kit de page de réservation",
    title: "Une page de réservation avec places par créneau, sans abonnement",
    lede: "Pendant un cours ou une séance, impossible de répondre au téléphone. Inscrivez créneaux et places dans un tableur : son URL devient une page de réservation qui envoie elle-même la confirmation et le rappel de la veille. Pensée pour les cours, séances d’essai et consultations, sans abonnement quel que soit le nombre de réservations.",
    intro: "Cette démo, en japonais, fonctionne entièrement dans votre navigateur avec les données d’un cabinet de soins fictif. Les réservations disparaissent à la fermeture de la page.",
    flow: "Le client choisit un jour dans le calendrier des disponibilités, puis une heure, saisit son nom et ses coordonnées et confirme. Aucun compte Google ni connexion requis. Chaque réservation s’ajoute sous forme de ligne dans la feuille des réservations ; le client reçoit un e-mail de confirmation et l’établissement une notification. Un rappel peut aussi être envoyé automatiquement la veille.",
    options: "L’ajout à Google Agenda est facultatif : laissez le réglage vide pour ne pas l’utiliser. Le client peut annuler lui-même depuis le lien de l’e-mail de confirmation, avec une date limite que vous fixez. Les notifications à l’établissement peuvent aussi aller vers Slack, Discord ou LINE dès que vous indiquez une URL dans les réglages. Vous pouvez proposer plusieurs prestations de durées différentes, et les écrans sont pensés d’abord pour le mobile.",
    sales: {
      proof: [
        { figure: "324", label: "Tests automatisés. Chaque version les passe tous avant d’être livrée (1.1.2)." },
        { figure: "0 ¥", label: "Coût mensuel, quel que soit le nombre de réservations." },
        { figure: "3", label: "Mises à jour depuis la sortie (1.1 à 1.1.2). Toutes gratuites pour les acheteurs." },
        { figure: "14 jours", label: "Après l’achat, nous répondons par e-mail aux signalements de bugs (sous 3 jours ouvrés)." },
      ],
      audience: {
        fits: [
          "Voulez prendre des réservations sur des créneaux à plusieurs places, comme des séances d’essai, des réunions d’information ou des cours collectifs",
          "Voulez que vos clients réservent depuis leur téléphone des créneaux fixes par jour de la semaine, pour des cours, des consultations ou des salles et équipements partagés (un report se fait en annulant puis en réservant un autre créneau libre)",
          "Voulez l’e-mail de confirmation, le rappel de la veille et l’annulation par le client, sans abonnement",
          "Êtes une agence ou un indépendant qui veut l’intégrer au site d’un client (la livraison d’une version modifiée est permise). Si vous préférez ne pas l’installer vous-même, l’installation peut être faite pour vous",
        ],
        notFor: [
          "Voulez envoyer le rappel de la veille aux clients sur LINE (la confirmation et le rappel partent par e-mail ; LINE ne sert qu’aux notifications de l’établissement)",
          "Avez besoin du paiement à la réservation, de plusieurs établissements ou du choix d’un membre du personnel (non pris en charge)",
          "Restez sous 50 réservations par mois sans besoin de créneaux à plusieurs places (un service de réservation gratuit suffit ; voir la comparaison ci-dessous)",
          "Ne pouvez utiliser qu’un compte Google d’entreprise dont l’administrateur bloque la publication externe (sans publication pour « Tout le monde », les clients extérieurs ne peuvent pas ouvrir la page)",
        ],
      },
      compare: {
        rows: [
          {
            kind: "Fonction intégrée",
            name: "Agendas de réservation de Google Agenda",
            href: SOURCES.googleCalendar,
            cost: "0 ¥ (fonctionne avec un compte Google personnel)",
            note: "Prend des réservations sur votre propre agenda. Les e-mails de rappel font partie des abonnements payants.",
          },
          {
            kind: "Outil gratuit",
            name: "STORES Réservation (offre gratuite)",
            href: SOURCES.stores,
            cost: "0 ¥ (jusqu’à 50 réservations par mois)",
            note: "Les e-mails de rappel automatiques sont réservés aux offres payantes (à partir de 9 790 ¥/mois TTC). Sous 50 réservations par mois et sans besoin de rappels, il suffit.",
          },
          {
            kind: "Service similaire",
            name: "SimplyBook.me",
            href: SOURCES.simplybook,
            cost: "Offre gratuite jusqu’à 50 réservations par mois ; au-delà à partir de 13,9 €/mois (jusqu’à 100)",
            note: "Les places par créneau et les rappels par e-mail sont inclus même dans l’offre gratuite. L’abonnement augmente avec le nombre de réservations.",
          },
        ],
        kit: "Créneaux à plusieurs places, prestations de durées différentes, e-mail de confirmation, rappel la veille et annulation en ligne avec date limite, sans abonnement. Les réservations restent dans votre propre tableur, et le coût ne change pas quand elles augmentent.",
        checkedOn: CHECKED_ON,
      },
      steps: [
        {
          heading: "« Moi » et « Tout le monde » lors du déploiement",
          intro: "La plupart des cas où « la page de réservation ne s’ouvre pas » viennent des choix de cet écran. Choisissez exactement les options indiquées.",
          items: [
            "Dans Apps Script, cliquez sur Déployer → Nouveau déploiement en haut à droite, puis choisissez « Application Web » via l’engrenage du type.",
            "Réglez « Exécuter en tant que » sur « Moi » et « Qui a accès » sur « Tout le monde ». Ne choisissez pas l’option voisine « Tous les utilisateurs disposant d’un compte Google » : chaque client verrait un écran d’autorisation Google et ne pourrait pas réserver.",
            "Après avoir cliqué sur Déployer, vérifiez l’URL depuis le menu du tableur : Page de réservation → URL de la page de réservation.",
            "Si vous modifiez le script plus tard, mettez à jour via Gérer les déploiements → crayon → version « Nouvelle version ». Un « Nouveau déploiement » change l’URL.",
          ],
          after: "Publier pour « Tout le monde » n’ouvre que la page de réservation. Le tableur lui-même reste visible uniquement par son propriétaire et les personnes avec qui il est partagé. Si un compte Google d’entreprise ne propose pas « Tout le monde », le recréer avec un compte Google personnel fonctionne.",
        },
        {
          heading: "L’écran d’autorisation, puis la mise en route des rappels",
          intro: "Au premier déploiement, Google affiche un écran d’autorisation. Comme vous avez créé le script vous-même, c’est normal.",
          items: [
            "Sur l’écran « Autorisation requise », cliquez sur « Examiner les autorisations » et choisissez votre compte Google.",
            "Quand « Google n’a pas validé cette application » apparaît, cliquez sur le petit lien « Paramètres avancés » en bas, puis sur « Accéder à (nom du projet) (non sécurisé) ».",
            "Vérifiez les six autorisations (ce tableur, envoi d’e-mails, agenda, etc.) et cliquez sur « Autoriser ».",
            "Rechargez le tableur et lancez depuis le menu Page de réservation → Initialiser → Vérifier les réglages. Quand aucun problème n’est signalé, tout est prêt.",
            "Enfin, lancez Page de réservation → Créer le déclencheur des rappels. Aucun rappel ne part avant cela. C’est la personne qui a déployé la page qui doit le lancer.",
          ],
          after: "Après l’installation, changer vos horaires ou vos jours de fermeture revient à modifier les feuilles des créneaux et des jours de fermeture, ce qui se fait aussi depuis l’application Google Sheets sur téléphone.",
        },
      ],
    },
  },
};
