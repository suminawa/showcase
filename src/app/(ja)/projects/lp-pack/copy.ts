import type { KitSales } from "../kit-parts";
import type { KitSection } from "../kit-sheet";

/** 比べる相手のページ（内容と費用の出どころ） */
const SOURCES = {
  vercel: "https://vercel.com/templates?type=landing-page",
  studio: "https://studio.design/ja/pricing",
  peraichi: "https://peraichi.com/pages/pricing",
};

/** 比べる相手のページを読んだ日 */
const CHECKED_ON = "2026-10-20";

type LpCopy = {
  meta: { title: string; description: string };
  name: string;
  title: string;
  lede: string;
  /** 見本 6 本の帯の名（読み上げ用） */
  samples: string;
  allSamples: string;
  sales: KitSales;
  sections: KitSection[];
  closeHeading: string;
  close: string;
};

const ja: LpCopy = {
  meta: {
    title: "業種別 LP テンプレ 6 本｜日本語の文言入り・写真なしで納品できる HTML と Next.js（業種別 LP テンプレ パック）",
    description:
      "店舗・クリニック・建設・士業・SaaS の LP 5 本と、会社案内サイト 1 式のテンプレートです。業種ごとの日本語の文言、電話ボタン、料金の切替、診療時間の表まで入っています。写真がなくても公開でき、書き出し済みの HTML も同梱しています。お客さまのサイトに組み込んで納品できます。",
  },
  name: "業種別 LP テンプレ パック",
  title: "業種別の LP テンプレ 6\u00a0本、日本語の文言入り",
  lede: "納期が近いのに、写真がまだ届かない。そんな案件でも、業種ごとの日本語の下地から組んで、その日のうちに公開できるテンプレートです。LP 5 本と会社案内サイト 1 式に、電話ボタン・料金の切替・診療時間の表まで入っています。",
  samples: "見本 6 本（押すと、その見本が開きます）",
  allSamples: "見本サイトの一覧で、説明つきで見る",
  sales: {
    proof: [
      { figure: "130 件", label: "自動テストの数です。文言の抜け・営業時間の形・料金の計算・フォームの送信の筋道を、版を出すたびに確かめています（1.0.2）。" },
      { figure: "10 ページ", label: "書き出し済みの HTML の数です。Node.js を使わずに、サーバーへ上げるだけでも公開できます。" },
      { figure: "0 枚", label: "使っている写真の数です。素材がそろう前でも、色と余白と図形だけで公開できます。" },
      { figure: "4.5:1 以上", label: "字と地の色の比です。色を変えたときも、読みにくい組み合わせをテストで見つけられます。" },
    ],
    audience: {
      fits: [
        "お客さまの LP を、業種に合った日本語の下地から短い納期で組みたい制作会社・フリーランスの方（お客さまのサイトに組み込んで納品できます。組織でお使いの場合は、BOOTH で組織向けのライセンスをお選びください）",
        "社内でサイトを担当していて、npm のコマンドか、HTML の書き換えができる方",
        "写真や素材がそろう前に、まず公開しておきたい方",
        "ご自身で組むのが難しい方（文言と構成からの制作をお任せいただけます。下の「お値段」をご覧ください）",
      ],
      notFor: [
        "管理画面から文言や写真をご自身で更新したい方（STUDIO・ペライチなどのノーコードの道具が向いています。下の比較をご覧ください）",
        "お知らせ・ブログ・施工事例を増やしていくサイトが要る方（記事を足す仕組みは入っていません）",
        "予約の空き枠の管理や、お支払いまで受けたい方（フォームは内容を送るだけです）",
        "WordPress のテーマとして使いたい方（WordPress には対応していません）",
      ],
    },
    compare: {
      rows: [
        {
          kind: "無料の道具",
          name: "Vercel のテンプレート（Next.js の LP）",
          href: SOURCES.vercel,
          cost: "0 円",
          note: "英語の LP の見本が中心です。業種別の日本語の文言が入ったものは、一覧に見当たりませんでした。",
        },
        {
          kind: "ノーコードの無料枠",
          name: "STUDIO（Free プラン）",
          href: SOURCES.studio,
          cost: "0 円（有料の Mini は年払いで月 590 円）",
          note: "画面の上で組み、管理画面から更新できます。Free プランの機能には、独自ドメインでの公開が含まれていません。",
        },
        {
          kind: "似たサービス",
          name: "ペライチ",
          href: SOURCES.peraichi,
          cost: "無料プランあり（有料プランは月額）",
          note: "テンプレートを選んで画面の上で作れます。無料プランは、ドメインやページ数に制限があり、公開ページに広告が出ることがあります。",
        },
      ],
      kit: "業種ごとの日本語の文言・電話ボタン・料金の切替・営業中の表示まで入った 6 本を、買い切りでお手元に残せます。書き出した HTML はどのサーバーにも置けて、月額はかかりません。",
      checkedOn: CHECKED_ON,
    },
    steps: [
      {
        heading: "HTML だけで公開するまで（Node.js を使わない場合）",
        intro: "zip には、見本の文言のまま書き出した HTML（out フォルダ）が入っています。",
        items: [
          "zip を展開し、「out」フォルダを開きます。",
          "使うページの「index.html」（例: 店舗・サロンなら out/shop/index.html）をメモ帳などで開き、社名・連絡先・営業時間を書き換えて保存します。",
          "「out」フォルダの中身を、FTP かレンタルサーバーのファイルマネージャーで公開フォルダに上げます。「_next」フォルダも一緒に上げてください。",
          "公開した URL をスマホとパソコンで開き、見本の架空の社名（粉とゆげ など）が残っていないかを確かめます。",
        ],
        after: "フォームの送信先と公開する URL は HTML の中に埋め込まれています。ここまで直すときは、content のファイルを書き換えて書き出し直すほうが確実です（手順書の「置き方」をご覧ください）。",
      },
      {
        heading: "フォームを送ると「送信できませんでした」と出るとき",
        intro: "フォームの送信先（form.endpoint）が空のまま公開すると、来た方に「送れた」と見せないよう、失敗の文言を出します。",
        items: [
          "使うテンプレの content のファイル（例: content/shop.ts）を開き、form.endpoint を探します。",
          "受け口の URL を書きます。Formspree なら https://formspree.io/f/… をそのまま書きます。Google Apps Script のウェブアプリなら、その URL を書き、contentType を \"text\" にします。",
          "npm run build で書き出し直し、out フォルダを上げ直します。",
          "公開したページから 1 度送ってみて、届くことを確かめます。",
        ],
        after: "手元（npm run dev や、out の HTML を直接開いたとき）では、送信先が空でも見本の文言が出ます。届くかどうかは、公開したページで確かめてください。",
      },
    ],
  },
  sections: [
    {
      heading: "テンプレごとにできること",
      list: [
        "BtoB・SaaS の LP。料金は月額と年額をボタンで切り替えます。課題・機能・導入の流れ・FAQ・問い合わせフォームまで入っています",
        "店舗・サロンの LP。営業時間から「いまは開いています」を出します。お品書き、席の案内、予約フォームつき",
        "建設・工事の LP。電話ボタンは押すとそのまま電話がかかります。料金の目安は平日と夜間・休日で切り替わり、対応エリアは図で出します",
        "士業・研修の LP。顧問料はプランをボタンで切り替え、年間の目安を月々の額と年 1 回の額から計算して出します",
        "クリニック・医院の LP。曜日ごとの診療時間を表で出し、「いまは診療中です」を添えます。Web 予約は時間帯を選べます",
        "会社案内サイト。TOP・事業内容・会社概要・お問い合わせの 4 ページ。波の背景、数字のカウントアップ、ヘッダーの現在地が動きます",
      ],
    },
    {
      heading: "どのテンプレにも共通すること",
      list: [
        "写真を 1 枚も使っていません。色と余白と書体、それに canvas の粒と SVG だけで作ってあります",
        "文言と色は設定ファイルだけで差し替えられます。ページの .tsx を触る必要はありません",
        "フォームの送信先を設定できます。Formspree、Google Apps Script のウェブアプリ、自前の API のどれでも受けられます",
        "書き出し済みの静的 HTML を同梱しています（全部で 10 ページ）。Next.js を動かさなくても、サーバーに上げるだけで置けます",
        "フォームには迷惑投稿よけの見えない欄が入っています。人には見えず、bot が埋めると送らずに成功表示だけを出します",
      ],
    },
    {
      heading: "写真と、いまお使いのドメイン",
      text: [
        "写真は載せられます。ただし写真を置く枠は入っていないため、施工事例などを載せるには HTML と CSS の編集が要ります。",
        "いまお使いのドメインでも公開できます。書き出した HTML を、そのドメインのサーバーの公開フォルダに上げます。サブディレクトリ（例: /lp/）に置く手順も手順書にあります。",
      ],
    },
    {
      heading: "使い方",
      list: [
        "使うテンプレの content を書き換えます。ブランド名、キャッチ、料金、営業時間や診療時間、FAQ、フッターの連絡先まで、ページの文言はここに集めてあります",
        "npm run build で out/ に静的 HTML を書き出します。Next.js のまま Vercel に置くなら、この手順は要りません",
        "できたものを置きます。Vercel なら GitHub のリポジトリをつなぐだけ、静的サーバーなら out/ の中身をそのまま公開フォルダに上げます",
      ],
      text: [
        "色を変えるときは styles/tokens.css の 1 ファイルだけを触ります。受け口をこれから用意するなら、フォーム受付 GAS キットのウェブアプリの URL をそのまま form.endpoint に書けます。",
      ],
    },
    {
      heading: "入っているもの",
      list: [
        "Next.js のプロジェクト一式（app・components・content・lib・styles）",
        "書き出し済みの静的 HTML（out/）",
        "README 全文と、テンプレごとの設定項目の一覧",
        "ライセンス全文",
      ],
    },
  ],
  closeHeading: "更新とご利用の範囲",
  close: "お求めの方は、その後の 1.x の更新も無料で受け取れます。お客さまのサイトに組み込んで納品できます。再配布・転売・同種の商品としての販売はできません。",
};

export const copy: Record<"ja" | "en" | "fr", LpCopy> = {
  ja,
  en: {
    meta: {
      title: "6 industry landing page templates | Japanese copy included, deliverable without photos as HTML and Next.js (LP Template Pack)",
      description:
        "Five landing pages for shops, clinics, construction, professional services, and SaaS, plus a company website. Industry-specific Japanese copy, call buttons, price toggles, and a consultation-hours table are included. Publish without photos; pre-exported HTML is included. You may build them into client sites.",
    },
    name: "Industry Landing Page Template Pack",
    title: "Six industry landing page templates, Japanese copy included",
    lede: "The deadline is close and the photos still haven’t arrived. Even then, start from industry-specific Japanese copy and publish the same day. Five landing pages and a company website, with call buttons, price toggles, and a consultation-hours table built in.",
    samples: "Six samples (each opens the live sample)",
    allSamples: "See the sample sites with descriptions",
    sales: {
      proof: [
        { figure: "130", label: "Automated tests. Missing copy, hours formats, price calculations, and form submission paths are checked for every release (1.0.2)." },
        { figure: "10 pages", label: "Pre-exported HTML pages. You can publish just by uploading them, without Node.js." },
        { figure: "0", label: "Photos used. Color, spacing, and shapes alone let you publish before any assets arrive." },
        { figure: "4.5:1+", label: "Text-to-background contrast. When you change colors, tests catch hard-to-read combinations." },
      ],
      audience: {
        fits: [
          "Are an agency or freelancer building client landing pages on a short deadline from industry-ready Japanese copy (you may build them into client sites; for organizations, choose the organization license on BOOTH)",
          "Look after your company’s site and can run npm commands or edit HTML",
          "Want to go live before photos and other assets are ready",
          "Would rather not build it yourself (production from copy and structure can be done for you; see Price below)",
        ],
        notFor: [
          "Want to update text and photos yourself from an admin screen (no-code tools such as STUDIO or Peraichi suit you better; see the comparison below)",
          "Need a site where you keep adding news, blog posts, or case studies (there is no way to add articles)",
          "Need to manage booking availability or take payments (forms only send their contents)",
          "Want a WordPress theme (WordPress is not supported)",
        ],
      },
      compare: {
        rows: [
          {
            kind: "Free tool",
            name: "Vercel templates (Next.js landing pages)",
            href: SOURCES.vercel,
            cost: "¥0",
            note: "Mostly English landing page samples. We found none with industry-specific Japanese copy in the list.",
          },
          {
            kind: "No-code free tier",
            name: "STUDIO (Free plan)",
            href: SOURCES.studio,
            cost: "¥0 (paid Mini plan: ¥590/month billed yearly)",
            note: "Build on screen and update from an admin panel. Publishing on your own domain is not among the Free plan’s features.",
          },
          {
            kind: "Similar service",
            name: "Peraichi",
            href: SOURCES.peraichi,
            cost: "Free plan available (paid plans are monthly)",
            note: "Pick a template and build on screen. The free plan limits domains and pages, and ads may appear on published pages.",
          },
        ],
        kit: "Six pages with industry-specific Japanese copy, call buttons, price toggles, and open-now indicators, yours to keep for a one-time price. The exported HTML runs on any server, with no monthly fee.",
        checkedOn: CHECKED_ON,
      },
      steps: [
        {
          heading: "Publishing with HTML only (without Node.js)",
          intro: "The zip includes HTML exported with the sample copy (the out folder).",
          items: [
            "Extract the zip and open the “out” folder.",
            "Open the “index.html” of the page you use (for example out/shop/index.html for the shop page) in a text editor, replace the company name, contact details, and hours, and save.",
            "Upload the contents of the “out” folder to your public folder by FTP or your host’s file manager. Upload the “_next” folder too.",
            "Open the published URL on a phone and a computer and check that no fictional sample names remain.",
          ],
          after: "The form destination and the site URL are embedded in the HTML. To change those, it is more reliable to edit the content files and export again (see “Deploying” in the guide).",
        },
        {
          heading: "When the form says it could not be sent",
          intro: "If you publish with the form destination (form.endpoint) left empty, visitors see the failure message instead of a false “sent”.",
          items: [
            "Open the content file of the template you use (for example content/shop.ts) and find form.endpoint.",
            "Enter your receiver’s URL. For Formspree, paste https://formspree.io/f/… as is. For a Google Apps Script web app, paste its URL and set contentType to \"text\".",
            "Export again with npm run build and upload the out folder again.",
            "Send one test message from the published page and confirm it arrives.",
          ],
          after: "Locally (npm run dev, or opening the out HTML directly), the sample message appears even with an empty destination. Check delivery on the published page.",
        },
      ],
    },
    sections: [
      {
        heading: "What each template does",
        list: [
          "BtoB / SaaS landing page: a button switches prices between monthly and yearly. Includes problems, features, onboarding steps, FAQ, and a contact form",
          "Shop / salon landing page: shows “open now” from the business hours. Includes a menu, seating information, and a booking form",
          "Construction landing page: the call button dials straight away. Price estimates switch between weekdays and nights/holidays, and the service area is shown in a diagram",
          "Professional services and training landing page: buttons switch retainer plans, and a yearly estimate is calculated from the monthly and annual amounts",
          "Clinic landing page: a table of consultation hours by weekday with “open now”. Online booking lets patients choose a time slot",
          "Company website: four pages (top, services, company profile, contact). A wave background, counting numbers, and a header that shows the current section",
        ],
      },
      {
        heading: "Common to every template",
        list: [
          "Not a single photo. Built only with color, spacing, type, canvas particles, and SVG",
          "Copy and colors change through settings files alone. No need to touch the page .tsx files",
          "The form destination is configurable: Formspree, a Google Apps Script web app, or your own API",
          "Pre-exported static HTML is included (10 pages in all). You can host it by uploading to a server, without running Next.js",
          "Forms include an invisible anti-spam field. People never see it; when a bot fills it, nothing is sent and only a success message is shown",
        ],
      },
      {
        heading: "Photos, and the domain you already use",
        text: [
          "You can add photos. There is no ready-made photo slot, though, so showing case studies and similar images requires editing the HTML and CSS.",
          "You can publish on the domain you already use: upload the exported HTML to that domain’s public folder. The guide also covers placing it in a subdirectory (such as /lp/).",
        ],
      },
      {
        heading: "How to use it",
        list: [
          "Rewrite the content file of the template you use. Brand name, tagline, prices, business or consultation hours, FAQ, and footer contact details are all gathered there",
          "Run npm run build to export static HTML to out/. Not needed if you deploy as Next.js on Vercel",
          "Deploy it. On Vercel, just connect the GitHub repository; on a static server, upload the contents of out/ to the public folder",
        ],
        text: [
          "To change colors, edit only styles/tokens.css. If you still need a form receiver, the web app URL of the Form Intake GAS Kit can go straight into form.endpoint.",
        ],
      },
      {
        heading: "What’s included",
        list: [
          "The full Next.js project (app, components, content, lib, styles)",
          "Pre-exported static HTML (out/)",
          "The full README and a list of settings for each template",
          "The full license",
        ],
      },
    ],
    closeHeading: "Updates and permitted use",
    close: "Buyers receive later 1.x updates free. You may build the templates into client sites. Redistribution, resale, and selling it as a similar product are not allowed.",
  },
  fr: {
    meta: {
      title: "6 modèles de landing pages par secteur | Textes japonais inclus, livrables sans photos en HTML et Next.js (Pack de modèles de landing pages)",
      description:
        "Cinq landing pages pour boutiques, cliniques, travaux, professions libérales et SaaS, plus un site d’entreprise. Textes japonais par secteur, bouton d’appel, bascule des tarifs et tableau des horaires inclus. Publiables sans photos ; HTML déjà exporté inclus. Intégrables dans les sites de vos clients.",
    },
    name: "Pack de modèles de landing pages par secteur",
    title: "Six modèles de landing pages par secteur, textes japonais inclus",
    lede: "L’échéance approche et les photos ne sont toujours pas là. Même dans ce cas, partez de textes japonais adaptés au secteur et publiez le jour même. Cinq landing pages et un site d’entreprise, avec bouton d’appel, bascule des tarifs et tableau des horaires de consultation.",
    samples: "Six exemples (chacun ouvre l’exemple en direct)",
    allSamples: "Voir les sites d’exemple avec leur description",
    sales: {
      proof: [
        { figure: "130", label: "Tests automatisés. Textes manquants, format des horaires, calcul des tarifs et envoi des formulaires sont vérifiés à chaque version (1.0.2)." },
        { figure: "10 pages", label: "Pages HTML déjà exportées. Il suffit de les déposer sur un serveur, sans Node.js." },
        { figure: "0", label: "Photo utilisée. Couleurs, espaces et formes suffisent pour publier avant d’avoir les visuels." },
        { figure: "4,5:1 et plus", label: "Contraste entre le texte et le fond. Si vous changez les couleurs, les tests repèrent les combinaisons peu lisibles." },
      ],
      audience: {
        fits: [
          "Êtes une agence ou un indépendant qui monte des landing pages clients dans des délais courts, à partir de textes japonais adaptés au secteur (intégration dans les sites clients permise ; pour une organisation, choisissez la licence organisation sur BOOTH)",
          "Gérez le site de votre entreprise et savez lancer des commandes npm ou modifier du HTML",
          "Voulez publier avant que les photos et autres visuels soient prêts",
          "Préférez ne pas le monter vous-même (la réalisation à partir des textes et de la structure peut être faite pour vous ; voir Prix ci-dessous)",
        ],
        notFor: [
          "Voulez modifier textes et photos vous-même depuis une interface d’administration (des outils sans code comme STUDIO ou Peraichi conviennent mieux ; voir la comparaison ci-dessous)",
          "Avez besoin d’un site où ajouter régulièrement actualités, articles ou réalisations (aucun moyen d’ajouter des articles)",
          "Devez gérer des créneaux de réservation ou encaisser des paiements (les formulaires ne font qu’envoyer leur contenu)",
          "Voulez un thème WordPress (WordPress n’est pas pris en charge)",
        ],
      },
      compare: {
        rows: [
          {
            kind: "Outil gratuit",
            name: "Modèles Vercel (landing pages Next.js)",
            href: SOURCES.vercel,
            cost: "0 ¥",
            note: "Surtout des exemples de landing pages en anglais. Nous n’en avons trouvé aucun avec des textes japonais par secteur dans la liste.",
          },
          {
            kind: "Offre gratuite sans code",
            name: "STUDIO (offre Free)",
            href: SOURCES.studio,
            cost: "0 ¥ (offre payante Mini : 590 ¥/mois en annuel)",
            note: "Construction à l’écran et mises à jour depuis une interface. La publication sur votre propre domaine ne fait pas partie des fonctions de l’offre Free.",
          },
          {
            kind: "Service similaire",
            name: "Peraichi",
            href: SOURCES.peraichi,
            cost: "Offre gratuite disponible (offres payantes au mois)",
            note: "Choisissez un modèle et construisez à l’écran. L’offre gratuite limite domaines et pages, et des publicités peuvent s’afficher sur les pages publiées.",
          },
        ],
        kit: "Six pages avec textes japonais par secteur, bouton d’appel, bascule des tarifs et indication « ouvert », à vous pour un achat unique. Le HTML exporté fonctionne sur tout serveur, sans abonnement.",
        checkedOn: CHECKED_ON,
      },
      steps: [
        {
          heading: "Publier avec le HTML seul (sans Node.js)",
          intro: "Le zip contient le HTML exporté avec les textes d’exemple (le dossier out).",
          items: [
            "Décompressez le zip et ouvrez le dossier « out ».",
            "Ouvrez dans un éditeur de texte l’« index.html » de la page choisie (par exemple out/shop/index.html pour la boutique), remplacez nom, coordonnées et horaires, puis enregistrez.",
            "Déposez le contenu du dossier « out » dans le dossier public par FTP ou via le gestionnaire de fichiers de votre hébergeur, y compris le dossier « _next ».",
            "Ouvrez l’URL publiée sur téléphone et sur ordinateur et vérifiez qu’aucun nom fictif d’exemple ne reste.",
          ],
          after: "La destination du formulaire et l’URL du site sont intégrées au HTML. Pour les modifier, il est plus sûr de corriger les fichiers content puis d’exporter à nouveau (voir « Mise en ligne » dans le guide).",
        },
        {
          heading: "Quand le formulaire indique que l’envoi a échoué",
          intro: "Si vous publiez avec la destination du formulaire (form.endpoint) vide, les visiteurs voient le message d’échec plutôt qu’un faux « envoyé ».",
          items: [
            "Ouvrez le fichier content du modèle utilisé (par exemple content/shop.ts) et repérez form.endpoint.",
            "Indiquez l’URL du récepteur. Pour Formspree, collez https://formspree.io/f/… tel quel. Pour une application web Google Apps Script, collez son URL et réglez contentType sur \"text\".",
            "Exportez à nouveau avec npm run build et redéposez le dossier out.",
            "Envoyez un message d’essai depuis la page publiée et vérifiez qu’il arrive.",
          ],
          after: "En local (npm run dev, ou en ouvrant directement le HTML de out), le message d’exemple s’affiche même sans destination. Vérifiez la réception sur la page publiée.",
        },
      ],
    },
    sections: [
      {
        heading: "Ce que fait chaque modèle",
        list: [
          "Landing page BtoB / SaaS : un bouton bascule les prix entre mensuel et annuel. Problèmes, fonctionnalités, mise en route, FAQ et formulaire de contact inclus",
          "Landing page boutique / salon : affiche « ouvert en ce moment » d’après les horaires. Carte, informations sur les places et formulaire de réservation",
          "Landing page travaux : le bouton d’appel compose directement le numéro. Les tarifs indicatifs changent entre semaine et soirs/jours fériés, et la zone d’intervention s’affiche sur un schéma",
          "Landing page professions libérales et formation : des boutons basculent les formules d’honoraires, et une estimation annuelle est calculée à partir des montants mensuels et annuels",
          "Landing page clinique : tableau des horaires de consultation par jour avec « en consultation ». La réservation en ligne permet de choisir un créneau",
          "Site d’entreprise : quatre pages (accueil, activités, présentation, contact). Fond en vagues, chiffres animés et en-tête indiquant la section en cours",
        ],
      },
      {
        heading: "Commun à tous les modèles",
        list: [
          "Aucune photo. Uniquement couleurs, espaces, typographie, particules canvas et SVG",
          "Textes et couleurs se changent uniquement dans des fichiers de réglages, sans toucher aux fichiers .tsx des pages",
          "La destination du formulaire est réglable : Formspree, une application web Google Apps Script ou votre propre API",
          "Le HTML statique déjà exporté est inclus (10 pages en tout). Il suffit de le déposer sur un serveur, sans faire tourner Next.js",
          "Les formulaires contiennent un champ invisible anti-spam. Invisible pour les humains ; si un robot le remplit, rien n’est envoyé et seul un message de succès s’affiche",
        ],
      },
      {
        heading: "Photos, et le domaine que vous utilisez déjà",
        text: [
          "Vous pouvez ajouter des photos. Aucun emplacement photo n’est prévu, cependant : afficher des réalisations demande de modifier le HTML et le CSS.",
          "Vous pouvez publier sur votre domaine actuel : déposez le HTML exporté dans le dossier public de ce domaine. Le guide explique aussi comment le placer dans un sous-dossier (par exemple /lp/).",
        ],
      },
      {
        heading: "Utilisation",
        list: [
          "Modifiez le fichier content du modèle choisi. Nom, accroche, tarifs, horaires, FAQ et coordonnées du pied de page y sont regroupés",
          "Lancez npm run build pour exporter le HTML statique dans out/. Inutile si vous déployez en Next.js sur Vercel",
          "Mettez en ligne. Sur Vercel, connectez simplement le dépôt GitHub ; sur un serveur statique, déposez le contenu de out/ dans le dossier public",
        ],
        text: [
          "Pour changer les couleurs, modifiez seulement styles/tokens.css. S’il vous faut encore un récepteur de formulaire, l’URL de l’application web du Kit GAS de réception de formulaires peut aller directement dans form.endpoint.",
        ],
      },
      {
        heading: "Contenu",
        list: [
          "Le projet Next.js complet (app, components, content, lib, styles)",
          "Le HTML statique exporté (out/)",
          "Le README complet et la liste des réglages de chaque modèle",
          "Le texte complet de la licence",
        ],
      },
    ],
    closeHeading: "Mises à jour et conditions d’utilisation",
    close: "Les acheteurs reçoivent gratuitement les mises à jour 1.x. Vous pouvez intégrer les modèles aux sites de vos clients. Redistribution, revente et vente comme produit similaire interdites.",
  },
};
