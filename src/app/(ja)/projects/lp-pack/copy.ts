import type { KitCopy } from "../kit-sheet";

/** 見本の節（このサイトの見本 6 本への道）を足した形 */
type LpCopy = KitCopy & { demoHeading: string; demo: string; allSamples: string };

const ja: LpCopy = {
  meta: {
    title: "業種別 LP テンプレ パック",
    description: "写真がなくても公開できる LP 5 本と会社案内サイト 1 式のテンプレートです。文言は content のファイル、色は styles/tokens.css の 1 ファイルで差し替えられます。",
  },
  title: "業種別 LP テンプレ パック",
  lede: "写真がなくても今日公開できる LP 5 本と、会社案内サイト 1 式のテンプレートです",
  intro:
    "このサイトで見本として公開している 1 ページの LP 5 本と、4 ページの会社案内サイト 1 式を、そのままソースコードにしたパックです。見本と同じ画面が手に入ります。",
  demoHeading: "見本（6 本）",
  demo: "どれも架空の会社で作った見本で、このサイトの上でそのまま開けます。",
  allSamples: "見本サイトの一覧で見る",
  sections: [
    {
      heading: "テンプレごとにできること",
      list: [
        "BtoB・SaaS の LP。料金は月額と年額をボタンで切り替えます。課題・機能・導入の流れ・FAQ・問い合わせフォームまで入っています",
        "店舗・サロンの LP。営業時間から「いまは開いています」を出します。お品書き、席の案内、予約フォームつき",
        "建設・工事の LP。電話ボタンは本物の tel: リンクです。料金の目安は平日と夜間・休日で切り替わり、対応エリアは図で出します",
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
      heading: "使い方",
      list: [
        "使うテンプレの content を書き換えます。ブランド名、キャッチ、料金、営業時間や診療時間、FAQ、フッターの連絡先まで、ページの文言はここに集めてあります",
        "npm run build で out/ に静的 HTML を書き出します。Next.js のまま Vercel に置くなら、この手順は要りません",
        "できたものを置きます。Vercel なら GitHub のリポジトリをつなぐだけ、静的サーバーなら out/ の中身をそのまま公開フォルダに上げます",
      ],
      text: [
        "色を変えるときは styles/tokens.css の 1 ファイルだけを触ります。フォームの送信先は form.endpoint に URL を書き、空のままなら送信せず見本の文言だけを出します。受け口をこれから用意するなら、フォーム受付 GAS キットのウェブアプリの URL をそのまま書けます。",
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
  buyHeading: "価格と購入",
  buy: "買った方は、その後の 1.x のアップデートも無料で受け取れます。再配布・転売・同種商品化はできません",
};

export const copy: Record<"ja" | "en" | "fr", LpCopy> = {
  ja,
  en: {
    meta: {
      title: "Industry Landing Page Template Pack",
      description: "Templates for five landing pages and one company website that you can publish without photos. Swap the copy in the content files and the colors in a single styles/tokens.css file.",
    },
    title: "Industry Landing Page Template Pack",
    lede: "Five landing pages and one company website you can publish today, even without photos",
    intro:
      "This pack is the source code of the five one-page landing pages and the four-page company website published as samples on this site. You get the same screens as the samples.",
    demoHeading: "Samples (6)",
    demo: "All are samples built for fictional companies, and open right here on this site (in Japanese).",
    allSamples: "See the list of sample sites",
    sections: [
      {
        heading: "What each template does",
        list: [
          "BtoB / SaaS landing page: a button switches prices between monthly and yearly. Includes problems, features, onboarding steps, FAQ, and a contact form",
          "Shop / salon landing page: shows “open now” from the business hours. Includes a menu, seating information, and a booking form",
          "Construction landing page: the call button is a real tel: link. Price estimates switch between weekdays and nights/holidays, and the service area is shown in a diagram",
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
        heading: "How to use it",
        list: [
          "Rewrite the content file of the template you use. Brand name, tagline, prices, business or consultation hours, FAQ, and footer contact details are all gathered there",
          "Run npm run build to export static HTML to out/. Not needed if you deploy as Next.js on Vercel",
          "Deploy it. On Vercel, just connect the GitHub repository; on a static server, upload the contents of out/ to the public folder",
        ],
        text: [
          "To change colors, edit only styles/tokens.css. For the form, put a URL in form.endpoint; left empty, it sends nothing and shows only the sample message. If you still need a receiver, the web app URL of the Form Intake GAS Kit works as is.",
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
    buyHeading: "Price and purchase",
    buy: " Buyers receive later 1.x updates free. Redistribution, resale, and selling it as a similar product are not allowed",
  },
  fr: {
    meta: {
      title: "Pack de modèles de landing pages par secteur",
      description: "Modèles de cinq landing pages et d’un site d’entreprise publiables sans photos. Les textes se changent dans les fichiers content, les couleurs dans un seul fichier styles/tokens.css.",
    },
    title: "Pack de modèles de landing pages par secteur",
    lede: "Cinq landing pages et un site d’entreprise à publier dès aujourd’hui, même sans photos",
    intro:
      "Ce pack est le code source des cinq landing pages d’une page et du site d’entreprise de quatre pages publiés en exemple sur ce site. Vous obtenez les mêmes écrans que les exemples.",
    demoHeading: "Exemples (6)",
    demo: "Tous sont des exemples réalisés pour des entreprises fictives, consultables ici même (en japonais).",
    allSamples: "Voir la liste des sites d’exemple",
    sections: [
      {
        heading: "Ce que fait chaque modèle",
        list: [
          "Landing page BtoB / SaaS : un bouton bascule les prix entre mensuel et annuel. Problèmes, fonctionnalités, mise en route, FAQ et formulaire de contact inclus",
          "Landing page boutique / salon : affiche « ouvert en ce moment » d’après les horaires. Carte, informations sur les places et formulaire de réservation",
          "Landing page travaux : le bouton d’appel est un vrai lien tel:. Les tarifs indicatifs changent entre semaine et soirs/jours fériés, et la zone d’intervention s’affiche sur un schéma",
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
        heading: "Utilisation",
        list: [
          "Modifiez le fichier content du modèle choisi. Nom, accroche, tarifs, horaires, FAQ et coordonnées du pied de page y sont regroupés",
          "Lancez npm run build pour exporter le HTML statique dans out/. Inutile si vous déployez en Next.js sur Vercel",
          "Mettez en ligne. Sur Vercel, connectez simplement le dépôt GitHub ; sur un serveur statique, déposez le contenu de out/ dans le dossier public",
        ],
        text: [
          "Pour changer les couleurs, modifiez seulement styles/tokens.css. Pour le formulaire, indiquez une URL dans form.endpoint ; vide, rien n’est envoyé et seul le message d’exemple s’affiche. S’il vous faut encore un récepteur, l’URL de l’application web du Kit GAS de réception de formulaires fonctionne telle quelle.",
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
    buyHeading: "Prix et achat",
    buy: " Les acheteurs reçoivent gratuitement les mises à jour 1.x. Redistribution, revente et vente comme produit similaire interdites",
  },
};
