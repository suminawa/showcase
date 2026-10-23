import { money } from "@/i18n/ui";

import type { KitSales } from "../kit-parts";
import { STEP_IMAGES } from "../step-images";

const SOURCES = {
  formsNotify: "https://support.google.com/docs/answer/139706?hl=ja",
  emailNotifications: "https://workspace.google.com/marketplace/app/email_notifications_for_google_forms/984866591130",
  formrun: "https://form.run/home/pricing",
};

/** 比べる相手のページを読んだ日 */
const CHECKED_ON = "2026-10-20";

const jaSales: KitSales = {
  proof: [
    { figure: "185 件", label: "自動テストの数です。版を出すたびに、すべて通してからお届けしています（1.1.3）。" },
    { figure: "0 円", label: "月額の費用です。Google の無料の枠の中で動きます。" },
    { figure: "4 回", label: "発売からの更新の回数です（1.1〜1.1.3）。お求めの方には、どれも無料でお届けしています。" },
    { figure: "14 日", label: "ご購入から、不具合のご連絡にメールでお応えする期間です（3 営業日以内に返信します）。" },
  ],
  audience: {
    fits: [
      "自社のデザインの HTML フォームのまま、送信先だけを持ちたい方（Google フォームに置き換えずに済みます）",
      "お客さまのサイトのフォームに組み込んで納品したい制作会社・フリーランスの方（改変して納品できます）",
      "お問い合わせやお申し込みに受付番号つきの返信を自動で送り、社内にはメール・Slack・Discord・LINE で知らせたい方",
      "サイトを触れる方が社内にいない方（設置とフォームのつなぎ替えまでお任せいただけます。下の「お値段」をご覧ください）",
    ],
    notFor: [
      "フォームの見た目が Google フォームで構わない方（Google フォームの通知の機能や、無料のアドオンで足ります。下の比較をご覧ください）",
      "ファイルの添付や、画像を選ぶ形の CAPTCHA が必要な方（添付ファイルは受けられません。WordPress のサイトなら、無料の Contact Form 7 が向いています）",
      "社内の LINE グループに知らせたい方（LINE は、ご自身あての 1 対 1 にだけ送れます。グループへは送れません）",
    ],
  },
  compare: {
    rows: [
      {
        kind: "標準の機能",
        name: "Google フォームの回答のメール通知",
        href: SOURCES.formsNotify,
        cost: "0 円（Google フォームに最初からあります）",
        note: "新しい回答をメールで受け取れます。フォームの見た目は Google フォームのままで、受付番号や Slack・LINE への通知はありません。",
      },
      {
        kind: "無料の道具",
        name: "Email Notifications for Google Forms（アドオン）",
        href: SOURCES.emailNotifications,
        cost: "無料版は 1 日 20 回答まで",
        note: "Google フォームに、送った方への確認のメールと Slack・Discord への通知を足せます。Google フォームで足りる方は、これで十分です。",
      },
      {
        kind: "似たサービス",
        name: "formrun",
        href: SOURCES.formrun,
        cost: "無料のプランは 1 フォーム月 30 件まで。自動返信と Slack 連携は BEGINNER（月 3,880 円・税抜）から",
        note: "フォームの作成から受付の管理までそろったサービスです。自動返信と通知を使うと月額がかかります。",
      },
    ],
    kit: "自社のフォームのまま、受付シート・受付番号つきの自動返信・メール・Slack・Discord・LINE への通知・日時ごとの定員を 1 本で持てます。月額は 0 円で、改変して納品できます。",
    checkedOn: CHECKED_ON,
  },
  steps: [
    {
      heading: "「このアプリは Google で確認されていません」と出たとき",
      image: STEP_IMAGES.gasAuth,
      intro: "この画面は 2 回出ます。初めて「初期化」を押したときと、ウェブアプリとして公開するときです。ご自身で貼ったスクリプトなので、出るのが正常です。どちらも次の順に進めてください。",
      items: [
        "「承認が必要です」の画面で「権限を確認」を押します。",
        "ご自身の Google アカウントを選びます。",
        "「このアプリは Google で確認されていません」と出たら、画面の下にある小さな「詳細」を押します。",
        "下に出る「（プロジェクト名）（安全ではないページ）に移動」を押します。",
        "許可の一覧を確かめて「許可」を押します。初期化のときは、承認が済んだらもう一度「初期化」を押してください。",
      ],
      after: "許可するのは、このスプレッドシートだけの読み書きです。ほかのスプレッドシートは読みも書きもしません。会社の Google アカウントで「ブロックされました」と出るときは、管理者の方の許可が要ります。",
    },
    {
      heading: "ウェブアプリとして公開するとき",
      intro: "フォームから届かないときの原因の多くは、ここの選び方です。画面の言葉のとおりに選んでください。",
      items: [
        "Apps Script の右上の「デプロイ」→「新しいデプロイ」を押し、左上の歯車から「ウェブアプリ」を選びます。",
        "「次のユーザーとして実行」は「自分」、「アクセスできるユーザー」は「全員」にします。すぐ隣の「Google アカウントを持つ全員」は選ばないでください。選ぶと、エラーも出ないまま届かなくなります。",
        "「デプロイ」を押して出てくる URL（https://script.google.com/macros/s/…/exec）をコピーし、フォームの送信先に貼ります。",
        "あとでスクリプトを直したときは「デプロイを管理」→ 鉛筆 → バージョン「新バージョン」で公開し直します。「新しいデプロイ」は押さないでください。URL が変わり、いまのフォームから届かなくなります。",
      ],
      after: "最後に、同梱の見本のフォーム（form-sample.html）に URL を貼ってブラウザで開き、1 件送って、受付シートに 1 行入り、通知が届くことを確かめてください。メールで通知を受けるなら 20 分ほど、Slack や LINE の準備を含めると、初めての方は 40 分ほどを見てください。",
    },
  ],
};

const ja = {
  meta: {
    title: "自社サイトのフォームに受付シート・通知・自動返信を（フォーム受付 GAS キット）",
    description: "Google フォームではなく、自社のデザインの HTML フォームの送信先になるキットです。届いた内容をスプレッドシートに 1 行ずつ貯め、メール・Slack・Discord・LINE でお知らせし、送った方へ受付番号つきの返信を自動で送ります。買い切りで月額はかかりません。見本はその場で送って確かめられます（どこにも送りません）。",
  },
  name: "フォーム受付 GAS キット",
  title: "自社サイトのフォームに、受付シート・通知・自動返信を",
  lede: "Google フォームではなく、自社のデザインの HTML フォームのための送信先です。届いた内容をスプレッドシートに 1 行ずつ貯め、メール・Slack・Discord・LINE でお知らせし、送った方へ受付番号つきの返信を自動で送ります。",
  made: "受付番号・シートの行・通知・自動返信・断るときの文は、キットに入っているプログラムをこのページの中でそのまま動かして作っています。見えない欄による迷惑投稿よけ、10 分以内の二重送信の防止、枠ごとの定員もキットと同じ働きです。キットでは、同じプログラムが Google のウェブアプリとして送信を受けます。見本の「希望枠」は 1 つの欄ですが、キットでは日付（date）と時間帯（slot）の 2 つの項目で受けます。",
  setup: {
    before: "設定まで任せたい方は、ココナラの「",
    after: "」（30,000 円・7 日）で、フォームのつなぎ替えから動作確認・手順書までお受けします。",
  },
  service: {
    before: "いまお使いのフォームで「自動返信が届かない」「送信できない」といったお困りごとは、ココナラの「",
    after: "」（1 か所 5,000 円）で直すこともできます。",
  },
  sales: jaSales,
};

export const copy: Record<"ja" | "en" | "fr", typeof ja> = {
  ja,
  en: {
    meta: {
      title: "Intake sheet, notifications, and auto-replies for your own website form | Reference numbers, resale to clients allowed (Form Intake GAS Kit)",
      description: "A kit that receives submissions from your own HTML form instead of Google Forms. It saves each submission as a spreadsheet row, notifies you by email, Slack, Discord, or LINE, and sends the sender an auto-reply with a reference number. One-time purchase, no monthly fee. Try the demo right here (nothing is actually sent).",
    },
    name: "Form Intake GAS Kit",
    title: "Intake sheet, notifications, and auto-replies for your own form",
    lede: "A destination for your own HTML form, not Google Forms. Each submission is saved as a spreadsheet row, you are notified by email, Slack, Discord, or LINE, and the sender gets an automatic reply with a reference number.",
    made: "The reference number, sheet row, notification, auto-reply, and rejection messages are produced by running the kit’s own src/ functions right on this page. The hidden-field spam trap, blocking of duplicate submissions within 10 minutes, and per-slot capacity also work exactly as in the kit. In the kit, the same functions receive submissions as a Google web app. The demo has a single “preferred slot” field; the kit takes it as two fields, date and slot.",
    setup: {
      before: "If you’d rather have the setup done for you, our Coconala service “",
      after: `” (${money("en", 30000)}, 7 days) covers rewiring your form, testing, and a step-by-step guide (the service page is in Japanese).`,
    },
    service: {
      before: "If a form you already use has a problem, such as auto-replies not arriving or submissions failing, we can also fix it through our Coconala service “",
      after: `” (${money("en", 5000)} per issue; the service page is in Japanese).`,
    },
    sales: {
      proof: [
        { figure: "185", label: "Automated tests. Every release passes all of them before it ships (1.1.3)." },
        { figure: "¥0", label: "Monthly cost. It runs within Google’s free quota." },
        { figure: "4", label: "Updates since launch (1.1 to 1.1.3). Every one has been free for existing buyers." },
        { figure: "14 days", label: "After purchase, we answer bug reports by email (reply within 3 business days)." },
      ],
      audience: {
        fits: [
          "Want to keep your own HTML form design and just need somewhere for it to send to (no switch to Google Forms)",
          "Are an agency or freelancer who wants to build it into a client’s site form (modified versions may be delivered)",
          "Want to send an automatic reply with a reference number, and notify your team by email, Slack, Discord, or LINE",
          "Have nobody in-house who can edit your site (setup and form rewiring can be done for you; see Price below)",
        ],
        notFor: [
          "Are fine with how Google Forms looks (its built-in notifications or a free add-on are enough; see the comparison below)",
          "Need file uploads or an image-picking CAPTCHA (file attachments aren’t supported; on WordPress, the free Contact Form 7 fits better)",
          "Want notifications in a LINE group chat (LINE messages go one-to-one to your own account only, not to groups)",
        ],
      },
      compare: {
        rows: [
          {
            kind: "Built-in feature",
            name: "Google Forms email notifications for responses",
            href: SOURCES.formsNotify,
            cost: "¥0 (built into Google Forms)",
            note: "Emails you about new responses. The form keeps the Google Forms look, with no reference numbers and no Slack or LINE notifications.",
          },
          {
            kind: "Free tool",
            name: "Email Notifications for Google Forms (add-on)",
            href: SOURCES.emailNotifications,
            cost: "Free edition: up to 20 responses a day",
            note: "Adds confirmation emails to respondents and Slack or Discord notifications to Google Forms. If Google Forms is enough for you, this covers it.",
          },
          {
            kind: "Similar service",
            name: "formrun",
            href: SOURCES.formrun,
            cost: `Free plan: 30 responses a month per form. Auto-reply and Slack from BEGINNER (${money("en", 3880)}/month, excl. tax)`,
            note: "A full service from building forms to managing submissions. Auto-replies and notifications require a monthly plan.",
          },
        ],
        kit: "Keeps your own form and gives you an intake sheet, auto-replies with reference numbers, notifications by email, Slack, Discord, or LINE, and per-slot capacity in one kit. No monthly fee, and modified versions may be delivered to clients.",
        checkedOn: CHECKED_ON,
      },
      steps: [
        {
          heading: "When you see “Google hasn’t verified this app”",
          intro: "This screen appears twice: the first time you press Initialize, and when you deploy as a web app. Because you pasted the script yourself, it is expected. Both times, proceed in this order.",
          items: [
            "On the “Authorization required” screen, press “Review permissions”.",
            "Choose your Google account.",
            "When “Google hasn’t verified this app” appears, press the small “Advanced” link at the bottom of the screen.",
            "Press “Go to (project name) (unsafe)”, which appears below.",
            "Review the list of permissions and press “Allow”. If this was during Initialize, press Initialize again once approved.",
          ],
          after: "The permission covers reading and writing this spreadsheet only; no other spreadsheet is read or written. If a company Google account shows “blocked”, your administrator needs to allow the script.",
        },
        {
          heading: "When deploying as a web app",
          intro: "Most cases of “nothing arrives from the form” come down to the choices on this screen. Pick exactly the options named below.",
          items: [
            "In Apps Script, press Deploy → New deployment at the top right, and choose “Web app” from the gear at the top left.",
            "Set “Execute as” to “Me” and “Who has access” to “Anyone”. Do not pick the neighboring “Anyone with Google account”; with it, submissions silently stop arriving.",
            "Press Deploy, copy the URL shown (https://script.google.com/macros/s/…/exec), and paste it as your form’s destination.",
            "When you later change the script, redeploy via Manage deployments → pencil → version “New version”. Do not press “New deployment”: the URL would change and your current form would stop delivering.",
          ],
          after: "Finally, paste the URL into the bundled sample form (form-sample.html), open it in a browser, send one entry, and check that a row appears in the intake sheet and a notification arrives. Allow about 20 minutes if you receive notifications by email, or about 40 minutes the first time if you also set up Slack or LINE.",
        },
      ],
    },
  },
  fr: {
    meta: {
      title: "Feuille de réception, notifications et réponses automatiques pour le formulaire de votre site | Numéros de référence, livraison aux clients permise (Kit GAS de réception de formulaires)",
      description: "Un kit qui reçoit les envois de votre propre formulaire HTML, au lieu de Google Forms. Chaque envoi devient une ligne de tableur, vous êtes prévenu par e-mail, Slack, Discord ou LINE, et l’expéditeur reçoit une réponse automatique avec un numéro de référence. Achat unique, sans abonnement. Essayez la démo ici même (rien n’est réellement envoyé).",
    },
    name: "Kit GAS de réception de formulaires",
    title: "Réception, notifications et réponse automatique pour votre formulaire",
    lede: "Une destination pour votre propre formulaire HTML, et non Google Forms. Chaque envoi devient une ligne de tableur, vous êtes prévenu par e-mail, Slack, Discord ou LINE, et l’expéditeur reçoit une réponse automatique avec un numéro de référence.",
    made: "Le numéro de référence, la ligne du tableur, la notification, la réponse automatique et les messages de refus sont produits en exécutant directement sur cette page les fonctions src/ du kit. Le champ caché anti-spam, le blocage des doublons dans les 10 minutes et la capacité par créneau fonctionnent aussi comme dans le kit. Dans le kit, les mêmes fonctions reçoivent les envois en tant qu’application web Google. La démo a un seul champ « créneau souhaité » ; le kit le reçoit en deux champs, date et créneau.",
    setup: {
      before: "Si vous préférez nous confier l’installation, notre service Coconala « ",
      after: ` » (${money("fr", 30000)}, 7 jours) comprend le raccordement de votre formulaire, les tests et un guide pas à pas (la page du service est en japonais).`,
    },
    service: {
      before: "Si un formulaire que vous utilisez déjà pose problème (réponses automatiques qui n’arrivent pas, envois qui échouent), nous pouvons aussi le corriger via notre service Coconala « ",
      after: ` » (${money("fr", 5000)} par point à corriger ; la page du service est en japonais).`,
    },
    sales: {
      proof: [
        { figure: "185", label: "Tests automatisés. Chaque version les passe tous avant d’être livrée (1.1.3)." },
        { figure: "0 ¥", label: "Coût mensuel. Il fonctionne dans le quota gratuit de Google." },
        { figure: "4", label: "Mises à jour depuis la sortie (1.1 à 1.1.3). Toutes gratuites pour les acheteurs." },
        { figure: "14 jours", label: "Après l’achat, nous répondons par e-mail aux signalements de bugs (sous 3 jours ouvrés)." },
      ],
      audience: {
        fits: [
          "Voulez garder le design de votre propre formulaire HTML et n’avez besoin que d’une destination (sans passer à Google Forms)",
          "Êtes une agence ou un indépendant qui veut l’intégrer au formulaire d’un client (la livraison d’une version modifiée est permise)",
          "Voulez envoyer une réponse automatique avec numéro de référence et prévenir l’équipe par e-mail, Slack, Discord ou LINE",
          "N’avez personne en interne pour modifier le site (l’installation et le raccordement du formulaire peuvent être faits pour vous ; voir Prix ci-dessous)",
        ],
        notFor: [
          "Vous accommodez de l’apparence de Google Forms (ses notifications intégrées ou un module gratuit suffisent ; voir la comparaison ci-dessous)",
          "Avez besoin de pièces jointes ou d’un CAPTCHA à images (les pièces jointes ne sont pas prises en charge ; sous WordPress, le module gratuit Contact Form 7 convient mieux)",
          "Voulez prévenir un groupe LINE (LINE n’envoie qu’en tête-à-tête vers votre propre compte, pas vers un groupe)",
        ],
      },
      compare: {
        rows: [
          {
            kind: "Fonction intégrée",
            name: "Notifications e-mail des réponses Google Forms",
            href: SOURCES.formsNotify,
            cost: "0 ¥ (intégré à Google Forms)",
            note: "Vous prévient par e-mail des nouvelles réponses. Le formulaire garde l’apparence de Google Forms, sans numéro de référence ni notification Slack ou LINE.",
          },
          {
            kind: "Outil gratuit",
            name: "Email Notifications for Google Forms (module)",
            href: SOURCES.emailNotifications,
            cost: "Version gratuite : 20 réponses par jour",
            note: "Ajoute à Google Forms un e-mail de confirmation à l’expéditeur et des notifications Slack ou Discord. Si Google Forms vous suffit, il convient.",
          },
          {
            kind: "Service similaire",
            name: "formrun",
            href: SOURCES.formrun,
            cost: `Offre gratuite : 30 réponses par mois et par formulaire. Réponse automatique et Slack à partir de BEGINNER (${money("fr", 3880)}/mois HT)`,
            note: "Un service complet, de la création du formulaire à la gestion des envois. La réponse automatique et les notifications demandent un abonnement.",
          },
        ],
        kit: "Garde votre propre formulaire et réunit dans un seul kit la feuille de réception, la réponse automatique avec numéro de référence, les notifications par e-mail, Slack, Discord ou LINE et la capacité par créneau. Sans abonnement, et la livraison d’une version modifiée aux clients est permise.",
        checkedOn: CHECKED_ON,
      },
      steps: [
        {
          heading: "Quand s’affiche « Google n’a pas validé cette application »",
          intro: "Cet écran apparaît deux fois : à la première initialisation et lors du déploiement en application web. Comme vous avez collé le script vous-même, c’est normal. Les deux fois, procédez dans cet ordre.",
          items: [
            "Sur l’écran « Autorisation requise », cliquez sur « Examiner les autorisations ».",
            "Choisissez votre compte Google.",
            "Quand « Google n’a pas validé cette application » apparaît, cliquez sur le petit lien « Paramètres avancés » en bas de l’écran.",
            "Cliquez sur « Accéder à (nom du projet) (non sécurisé) », qui apparaît en dessous.",
            "Vérifiez la liste des autorisations et cliquez sur « Autoriser ». Lors de l’initialisation, relancez-la une fois l’autorisation donnée.",
          ],
          after: "L’autorisation ne porte que sur la lecture et l’écriture de ce tableur ; aucun autre tableur n’est lu ni modifié. Si un compte Google d’entreprise affiche « bloqué », l’administrateur doit autoriser le script.",
        },
        {
          heading: "Lors du déploiement en application web",
          intro: "La plupart des cas où « rien n’arrive du formulaire » viennent des choix de cet écran. Choisissez exactement les options indiquées.",
          items: [
            "Dans Apps Script, cliquez sur Déployer → Nouveau déploiement en haut à droite, puis choisissez « Application Web » via l’engrenage en haut à gauche.",
            "Réglez « Exécuter en tant que » sur « Moi » et « Qui a accès » sur « Tout le monde ». Ne choisissez pas l’option voisine « Tous les utilisateurs disposant d’un compte Google » : les envois cesseraient d’arriver, sans aucune erreur.",
            "Cliquez sur Déployer, copiez l’URL affichée (https://script.google.com/macros/s/…/exec) et collez-la comme destination de votre formulaire.",
            "Si vous modifiez le script plus tard, redéployez via Gérer les déploiements → crayon → version « Nouvelle version ». N’utilisez pas « Nouveau déploiement » : l’URL changerait et votre formulaire actuel n’enverrait plus rien.",
          ],
          after: "Enfin, collez l’URL dans le formulaire d’exemple fourni (form-sample.html), ouvrez-le dans un navigateur, envoyez une entrée et vérifiez qu’une ligne s’ajoute à la feuille de réception et qu’une notification arrive. Comptez environ 20 minutes avec des notifications par e-mail, ou environ 40 minutes la première fois si vous préparez aussi Slack ou LINE.",
        },
      ],
    },
  },
};
