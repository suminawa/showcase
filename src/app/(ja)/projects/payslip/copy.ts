import type { KitSales } from "../kit-parts";

/*
 * 数字の出どころ: suminawa-products/packages/payslip-delivery-gas の README.ja.md・CHANGELOG.md（1.0.0）と npm test（132 件）。
 * 文の正本: suminawa-ops/30days/products/payslip-delivery-gas の sales-page.md と booth-description.md。
 * 比べる相手: suminawa-ops/30days/research/2026-10-23-payslip-delivery.md（料金は 2026-10-23 に下の出どころで確かめた）。
 * 有料エリア（zip の中の置き方の細部）は書かない。
 */
const SOURCES = {
  freee: "https://www.freee.co.jp/hr/features/payslip/",
  icompass: "https://it-trend.jp/electronic_pay_slip_system/6785/price",
};

/** 比べる相手のページを読んだ日 */
const CHECKED_ON = "2026-10-23";

const jaSales: KitSales = {
  proof: [
    { figure: "11 の点", label: "送る前に「確かめる」が見る点の数です。社員番号と氏名の照合、同じ受信箱のアドレス、共有の範囲などで、要確認が 1 つでもあると送れません。" },
    { figure: "132 件", label: "取り込み・確かめ・二重送信の防止などを、偽物の GAS で通しの流れまで確かめるテストの数です。すべて通っています。" },
    { figure: "2 分ほど", label: "見本の 8 人分で、全員分の PDF を作ってご自身あてに試し送りするまでの時間です（PDF は 1 人 10〜15 秒ほど）。" },
    { figure: "0 円", label: "月額の費用です。Google スプレッドシートと Apps Script だけで動き、作者のサーバーなど、ほかの所へは何も送りません。" },
  ],
  audience: {
    fits: [
      "給与計算を社労士に頼んでいるか Excel で済ませていて、明細だけを紙で配っている方（従業員 5〜30 人ほど）",
      "Google Workspace か Gmail を使っている方",
      "Web 給与明細のサービスの月額や初期費用をかけずに、明細を電子で渡したい方",
      "顧問先の明細の配布を手伝っている社労士事務所の方（社労士・制作会社用をご覧ください）",
    ],
    notFor: [
      "freee人事労務・マネーフォワード クラウド給与など、Web 明細の付いた給与ソフトをすでに使っている方（そちらで足ります）",
      "給与や税・社会保険の計算までしたい方（計算はしません。計算済みの一覧を明細の形に並べます）",
      "Excel だけで使いたい方（Google スプレッドシートと Google ドライブを使います）",
      "1 つの会社で 150 人を超えて配る方",
    ],
  },
  compare: {
    rows: [
      {
        kind: "給与ソフトの機能",
        name: "freee人事労務などの Web 明細",
        href: SOURCES.freee,
        cost: "給与ソフトの契約に含まれます",
        note: "給与計算から明細の配布まで 1 つで済みます。給与ソフトをお使いの方は、そちらで足ります。",
      },
      {
        kind: "似たサービス",
        name: "i-Compass・Web給金帳Cloud などの Web 給与明細",
        href: SOURCES.icompass,
        cost: "1 人あたり月 40〜220 円ほど。初期費用が別にかかるものもあります",
        note: "社員の方のログインの画面や、明細の長い保存まで任せられます。10 人なら 1 年で 5,000〜26,000 円ほどです。",
      },
      {
        kind: "無料の道具",
        name: "Excel の差し込み印刷・無料の明細のテンプレート",
        cost: "0 円",
        note: "明細の形は作れます。配るのは、印刷か、1 人ずつ手で送るメールです。宛先の確かめは目で行います。",
      },
    ],
    kit: "社労士の一覧の形のまま取り込み、本人のアドレスだけに共有して知らせます。送る前の確かめ・試し送り・二重送信の防止・送信記録・電子交付の同意日の管理を、1 枚のスプレッドシートで行います。",
    checkedOn: CHECKED_ON,
  },
  steps: [
    {
      heading: "はじめの準備（20 分ほど）",
      intro: "最初の 1 回だけ、次の 4 つを行います。プログラムの知識は要りません。",
      items: [
        "スプレッドシートを新しく作り、同梱の Code.gs と appsscript.json を Apps Script に貼ります。",
        "メニューの「給与明細」→「初期化」を押し、Google の確認画面で許可します。ご自身で貼ったスクリプトなので、「Google で確認されていません」の画面が出るのが正常です。",
        "「社員」シートに、社員番号・氏名・メールアドレス・渡し方・電子交付の同意日を、1 人 1 行で書きます。",
        "「設定」シートに、会社名・対象月・支給日を書きます。",
      ],
      after: "毎月は、一覧を貼る → 取り込む → 確かめる → 試し送り → 配る の 5 つです。社員 10 人ほどで 5〜10 分です。同梱の見本データ（架空の会社の 8 人分・3 か月）で、先に流れを確かめられます。",
    },
    {
      heading: "社員の方が明細を開けないとき",
      intro: "共有で渡した明細は、メールが届いたアドレスの Google アカウントでだけ開けます。次の順に確かめてください。",
      items: [
        "メールが届いたアドレスの Google アカウントでログインしているか（会社と個人のアカウントを切り替えていないか）。",
        "同梱の「受け取る方への案内」（パソコンとスマートフォンでの開き方）をお渡ししたか。",
        "どうしても開けない方は、社員シートで渡し方を「添付」にして、その方だけ送り直します。",
      ],
      after: "Google アカウントの無いアドレスなど、共有できなかった方は、配るときに自動で添付に切り替わります。承認の画面で「管理者が制限しています」と出るときは、会社の Google Workspace の管理者に、このスクリプトの許可をご依頼ください。",
    },
  ],
};

const ja = {
  meta: {
    title: "給与明細を PDF で本人だけに配る｜確かめてから送る（給与明細 配布キット）",
    description: "社労士や給与ソフトから届いた給与の一覧を Google スプレッドシートに貼ると、社員ごとの明細 PDF を作り、本人のメールアドレスにだけ渡すキットです。送る前の 11 の確かめ・自分あての試し送り・二重送信の防止・電子交付の同意日の管理つき。月額 0 円。無料版つき。",
  },
  name: "給与明細 配布キット",
  title: "給与明細を PDF にして、本人だけに配る",
  lede: "社労士や給与ソフトから届いた給与の一覧を Google スプレッドシートに貼ると、社員ごとの明細 PDF を作り、本人のメールアドレスにだけ渡します。送る前に宛先と金額を確かめ、ご自身あてに試し送りしてから配ります。税と社会保険の計算はしません。",
  shot: {
    alt: "左に社労士の一覧をそのまま貼った「貼り付け」シート、右に 1 人 1 行に整った「明細」シート",
    caption: "社労士の一覧を貼って「取り込む」を押したところです（見本データ）。押すと原寸で開きます。",
  },
  flow: {
    heading: "毎月の流れ",
    text: "メニューの 5 つのボタンを、上から順に押していきます。",
    list: [
      "社労士の一覧を「貼り付け」シートに貼る",
      "「取り込む」を押す（1 人 1 行に整います）",
      "「確かめる」を押す（送る前の 11 の点）",
      "「試し送り」を押す（全員分の PDF のリンクが、ご自身あてに 1 通で届きます）",
      "「配る」を押す（人数を確かめてから送ります）",
    ],
    import: "社労士の一覧は、見出しが 2 段で結合されていたり、下に合計の行があったり、金額が「２８０，０００円」のような全角の字だったりします。このキットは、その形のまま貼って読みます。「△」「▲」はマイナスとして扱い、見出しごとに勤怠・支給・控除・合計を語から振り分けます。直した区分は、次の月からも残ります。",
  },
  guard: {
    heading: "送り間違いを防ぐ 4 つの段",
    text: "給与明細の配布で一番避けたいのは、ほかの人に届くことです。そこで、送るまでに 4 つの段を置きました。",
    list: [
      "確かめる: 社員番号と氏名が名簿と合うか、メールの形、同じアドレスが 2 人に入っていないか（taro+pay@ のような + 付きのアドレスも同じ受信箱として止めます）、差引支給額、退職の方、スプレッドシートの共有の範囲など、11 の点を件数と直し方で示します。",
      "試し送り: 全員分の PDF を作り、ご自身あてに 1 通だけ送ります。試し送りを済ませるまで、その月の「配る」は押せません。",
      "人数の確認: 「配る」を押すと、送る人数（共有と添付の内訳）と紙で渡す人数が出て、「はい」を押してから送ります。",
      "二重送信の防止と送信記録: 同じ月・同じ題の明細は、同じ方に 2 回送りません。いつ・誰に・どのアドレスへ・どの渡し方で送ったかが残ります。",
    ],
  },
  receive: {
    heading: "受け取る方の見え方",
    text: "明細は A4 の PDF です。既定では、PDF をドライブに置き、本人の Google アカウントだけが開けるように共有して、リンクをメールで知らせます。リンクが転送されても、本人以外は開けません。知らせのメールに金額は書きません。共有で開けない方には、PDF を添付して送れます。スマートフォンのブラウザでも開けます。",
    consent: "給与明細を電子で渡すには、所得税法第 231 条第 2 項などで、受け取る方の承諾を得ることとされています。名簿に「電子交付の同意日」の列を持ち、同意日が空の方には送らず、「紙で渡す人」としてお名前を出します。同意のお願いの文例も同梱しています。文例は手続きの一例で、同意の取り方の最終の判断は、顧問の税理士・社労士にご相談ください。",
  },
  shot2: {
    alt: "A4 の明細 PDF、スマートフォンで開いたところ、金額を書いていない知らせのメール",
    caption: "明細 PDF と、スマートフォンで開いたところ、知らせのメールです（見本データ）。",
  },
  close: {
    heading: "試す・頼む",
    free: {
      before: "買う前に、お手元の給与の一覧が取り込めるかを確かめられます。社員 3 人まで・ご自身あての試し送りまでの無料版「",
      after: "」を BOOTH でお配りしています。取り込み方は有料版と同じです。",
    },
    service: "スプレッドシートへの設置もお受けします。上の「お値段」の「設置まで頼む」が、その値段です。",
    coconala: { before: "ココナラの「", after: "」（キット込み 15,000 円）からも、ご依頼いただけます。御社の一覧に合わせて項目と文面を設定し、置き方の手順書をお届けします。" },
    consult: {
      before: "お手元の一覧が取り込めるか分からないときは、見出しの行と 1〜2 行目を ",
      after: " へお送りください。無料でお返しします。氏名・金額・メールアドレスは、消すか「●●」に置き換えてからお送りください。",
    },
  },
  sales: jaSales,
};

export const copy: Record<"ja" | "en" | "fr", typeof ja> = {
  ja,
  en: {
    meta: {
      title: "Send PDF payslips only to each employee | Import your payroll advisor’s list and check before sending (Payslip Delivery Kit, Google Sheets)",
      description: "Paste the payroll list from your payroll advisor or software into Google Sheets, and the kit creates a PDF payslip for each employee and shares it only with that person’s email address. Includes 11 pre-send checks, a test send to yourself, duplicate-send prevention, and consent dates for electronic delivery. No monthly fee. Free version available.",
    },
    name: "Payslip Delivery Kit",
    title: "Turn payslips into PDFs and deliver each one only to its employee",
    lede: "Paste the payroll list from your payroll advisor or payroll software into Google Sheets, and the kit creates a PDF payslip for each employee and delivers it only to that person’s email address. Before sending, it checks recipients and amounts, and you send a test to yourself first. It does not calculate tax or social insurance.",
    shot: {
      alt: "Left: the paste sheet with the advisor’s list pasted as is. Right: the payslip sheet, tidied to one row per employee",
      caption: "After pasting an advisor’s list and pressing Import (sample data). Click to open it at full size.",
    },
    flow: {
      heading: "Each month",
      text: "Press the five menu buttons from top to bottom.",
      list: [
        "Paste the advisor’s list into the paste sheet",
        "Press Import (it becomes one row per employee)",
        "Press Check (11 points before sending)",
        "Press Test send (links to everyone’s PDFs arrive in one email to you)",
        "Press Deliver (it confirms the number of people before sending)",
      ],
      import: "Lists from payroll advisors often have two-row merged headers, a totals row at the bottom, and amounts written in full-width characters with a yen mark. The kit reads them as pasted. “△” and “▲” are treated as minus signs, and each header is sorted into attendance, pay, deductions, or totals from its wording. Categories you correct are kept for the following months.",
    },
    guard: {
      heading: "Four stages against sending to the wrong person",
      text: "What you most want to avoid with payslips is one reaching someone else. So there are four stages before anything is sent.",
      list: [
        "Check: 11 points, with counts and how to fix them — employee numbers and names against the roster, email format, the same address for two people (addresses with + such as taro+pay@ count as the same inbox), net pay, employees who have left, and how the spreadsheet is shared.",
        "Test send: PDFs are created for everyone and a single email goes to you. Deliver cannot be pressed for that month until the test send is done.",
        "Head count: Deliver shows how many people will receive it (shared or attached) and how many get paper, and sends only after you press Yes.",
        "No duplicates, and a log: the same month and title is never sent twice to the same person. When, to whom, to which address, and how it was sent are all recorded.",
      ],
    },
    receive: {
      heading: "What employees see",
      text: "Each payslip is an A4 PDF. By default the PDF is placed in Drive, shared so that only the employee’s Google account can open it, and the link is sent by email. A forwarded link opens for no one else. The email never contains amounts. Employees who cannot open shared files can receive the PDF as an attachment instead. It opens in a smartphone browser too.",
      consent: "In Japan, giving payslips electronically requires the recipient’s prior consent (Income Tax Act, Article 231(2), among others). The roster has a consent-date column; people with no consent date are not emailed and are listed as receiving paper. A sample consent request is included. It is one example of the procedure — please consult your tax accountant or payroll advisor on how to obtain consent.",
    },
    shot2: {
      alt: "An A4 payslip PDF, the same PDF open on a smartphone, and the notice email with no amounts",
      caption: "The payslip PDF, the same PDF on a smartphone, and the notice email (sample data).",
    },
    close: {
      heading: "Try it, or have it done",
      free: {
        before: "Before buying, you can check that your own payroll list imports. A free version, “",
        after: "”, handles up to three employees and goes as far as a test send to yourself. It imports the same way as the paid version, and it’s on BOOTH (the page is in Japanese).",
      },
      service: "We can also install it in your spreadsheet. The price is shown as “Setup done for you” under Price above.",
      coconala: { before: "You can also order it on Coconala: “", after: "” (kit included, ¥15,000; the page is in Japanese). We set the items and wording to fit your payroll list and send setup instructions." },
      consult: {
        before: "If you’re not sure your list will import, send the header rows and the first one or two rows to ",
        after: ", free of charge. Please delete or mask names, amounts, and email addresses before sending.",
      },
    },
    sales: {
      proof: [
        { figure: "11 checks", label: "Points the Check step reviews before sending: employee numbers against names, addresses that reach the same inbox, sharing settings and more. If any needs attention, nothing can be sent." },
        { figure: "132 tests", label: "Tests covering import, checks, duplicate prevention and the full flow against a simulated Apps Script environment. All pass." },
        { figure: "~2 min", label: "Time to create PDFs for the eight sample employees and send the test to yourself (about 10–15 seconds per PDF)." },
        { figure: "¥0", label: "Monthly fee. It runs on Google Sheets and Apps Script only, and sends nothing to the author’s servers or anywhere else." },
      ],
      audience: {
        fits: [
          "Have payroll calculated by an advisor or in Excel, and only hand out payslips on paper (roughly 5–30 employees)",
          "Use Google Workspace or Gmail",
          "Want to deliver payslips electronically without a web payslip service’s monthly or setup fees",
          "Are a payroll advisor helping clients deliver payslips (see the advisor / agency license)",
        ],
        notFor: [
          "Already use payroll software with web payslips, such as freee HR or Money Forward Cloud Payroll (that is enough)",
          "Want payroll, tax, or social insurance calculated (it doesn’t calculate; it lays out an already-calculated list as payslips)",
          "Want to use Excel only (it uses Google Sheets and Google Drive)",
          "Deliver to more than 150 people in one company",
        ],
      },
      compare: {
        rows: [
          {
            kind: "Payroll software",
            name: "Web payslips in freee HR, etc.",
            href: SOURCES.freee,
            cost: "Included in the payroll software subscription",
            note: "One tool from payroll calculation to delivery. If you already use payroll software, that is enough.",
          },
          {
            kind: "Similar service",
            name: "Web payslip services such as i-Compass and Web Kyukincho Cloud",
            href: SOURCES.icompass,
            cost: "About ¥40–220 per person per month; some charge a setup fee",
            note: "Employee login screens and long-term payslip storage are handled for you. For 10 people, about ¥5,000–26,000 a year.",
          },
          {
            kind: "Free tool",
            name: "Excel mail merge, free payslip templates",
            cost: "¥0",
            note: "You can lay out payslips. Delivery is printing, or emailing each person by hand, checking recipients by eye.",
          },
        ],
        kit: "Imports the advisor’s list as is and shares each payslip only with its employee’s address. Pre-send checks, test send, duplicate prevention, a send log, and consent dates, all in one spreadsheet.",
        checkedOn: CHECKED_ON,
      },
      steps: [
        {
          heading: "First setup (about 20 minutes)",
          intro: "Do these four things once. No programming knowledge is needed.",
          items: [
            "Create a new spreadsheet and paste the included Code.gs and appsscript.json into Apps Script.",
            "Press Payslips → Initialize in the menu and allow access on Google’s screen. Since you pasted the script yourself, a “Google hasn’t verified this app” screen is expected.",
            "On the employees sheet, enter employee number, name, email, delivery method, and consent date, one person per row.",
            "On the settings sheet, enter company name, target month, and pay date.",
          ],
          after: "Each month it’s five steps: paste the list, Import, Check, Test send, Deliver — about 5–10 minutes for 10 employees. You can try the flow first with the included sample data (eight employees of a fictional company, three months).",
        },
        {
          heading: "When an employee can’t open their payslip",
          intro: "Shared payslips open only with the Google account of the address the email went to. Check in this order.",
          items: [
            "Is the employee signed in with the Google account for that address (not switched to another work or personal account)?",
            "Did you hand out the included guide for recipients (how to open it on a computer and a smartphone)?",
            "If it still won’t open, set that person’s delivery method to attachment on the employees sheet and resend to them only.",
          ],
          after: "People whose address can’t receive a share, such as one without a Google account, are switched to attachment automatically when you deliver. If the authorization screen says your administrator has restricted it, ask your Google Workspace administrator to allow the script.",
        },
      ],
    },
  },
  fr: {
    meta: {
      title: "Envoyer les bulletins de paie en PDF à chaque salarié uniquement | Importer la liste du gestionnaire de paie et vérifier avant l’envoi (Kit de distribution des bulletins de paie, Google Sheets)",
      description: "Collez dans Google Sheets la liste de paie de votre gestionnaire ou de votre logiciel : le kit crée un bulletin PDF par salarié et le partage uniquement avec sa propre adresse e-mail. 11 vérifications avant l’envoi, envoi d’essai à vous-même, protection contre les doubles envois et dates de consentement à la remise électronique. Aucun abonnement. Version gratuite disponible.",
    },
    name: "Kit de distribution des bulletins de paie",
    title: "Les bulletins de paie en PDF, remis à chaque salarié uniquement",
    lede: "Collez dans Google Sheets la liste de paie envoyée par votre gestionnaire de paie ou votre logiciel : le kit crée un bulletin PDF par salarié et le remet uniquement à sa propre adresse e-mail. Avant l’envoi, il vérifie destinataires et montants, et vous vous envoyez d’abord un essai. Il ne calcule ni impôts ni cotisations sociales.",
    shot: {
      alt: "À gauche, la feuille de collage avec la liste du gestionnaire telle quelle ; à droite, la feuille des bulletins, une ligne par salarié",
      caption: "Après avoir collé la liste du gestionnaire et appuyé sur Importer (données d’exemple). Cliquez pour l’ouvrir en taille réelle.",
    },
    flow: {
      heading: "Chaque mois",
      text: "Appuyez sur les cinq boutons du menu, de haut en bas.",
      list: [
        "Collez la liste du gestionnaire dans la feuille de collage",
        "Appuyez sur Importer (une ligne par salarié)",
        "Appuyez sur Vérifier (11 points avant l’envoi)",
        "Appuyez sur Envoi d’essai (les liens vers tous les PDF vous arrivent en un seul e-mail)",
        "Appuyez sur Distribuer (le nombre de personnes est confirmé avant l’envoi)",
      ],
      import: "Les listes des gestionnaires de paie ont souvent des en-têtes sur deux lignes fusionnées, une ligne de total en bas et des montants en caractères pleine chasse suivis du signe yen. Le kit les lit telles quelles. « △ » et « ▲ » sont lus comme des signes moins, et chaque en-tête est classé en temps de travail, rémunération, retenues ou totaux d’après son libellé. Les catégories corrigées sont conservées les mois suivants.",
    },
    guard: {
      heading: "Quatre étapes contre les erreurs de destinataire",
      text: "Ce qu’on veut éviter avant tout, c’est qu’un bulletin arrive chez quelqu’un d’autre. Il y a donc quatre étapes avant tout envoi.",
      list: [
        "Vérifier : 11 points, avec le nombre de cas et la correction — numéros et noms des salariés comparés au registre, format des adresses, même adresse pour deux personnes (les adresses avec +, comme taro+pay@, comptent comme la même boîte), net à payer, salariés partis, mode de partage du tableur.",
        "Envoi d’essai : les PDF de tous sont créés et un seul e-mail vous est envoyé. Tant que l’essai n’est pas fait, Distribuer est bloqué pour le mois.",
        "Nombre de personnes : Distribuer affiche combien recevront le bulletin (partage ou pièce jointe) et combien sur papier, et n’envoie qu’après Oui.",
        "Pas de double envoi, et un journal : le même mois et le même titre ne partent jamais deux fois à la même personne. Date, destinataire, adresse et mode d’envoi sont consignés.",
      ],
    },
    receive: {
      heading: "Ce que voient les salariés",
      text: "Chaque bulletin est un PDF A4. Par défaut, le PDF est placé dans Drive, partagé de sorte que seul le compte Google du salarié puisse l’ouvrir, et le lien est envoyé par e-mail. Un lien transféré ne s’ouvre pour personne d’autre. L’e-mail ne contient aucun montant. Pour qui ne peut pas ouvrir un partage, le PDF peut être envoyé en pièce jointe. Il s’ouvre aussi dans le navigateur d’un smartphone.",
      consent: "Au Japon, la remise électronique des bulletins suppose le consentement préalable du salarié (loi sur l’impôt sur le revenu, article 231, alinéa 2, notamment). Le registre a une colonne de date de consentement ; sans date, la personne ne reçoit pas d’e-mail et figure parmi celles à qui remettre un bulletin papier. Un modèle de demande de consentement est fourni. C’est un exemple de procédure : consultez votre expert-comptable ou votre gestionnaire de paie pour la manière d’obtenir le consentement.",
    },
    shot2: {
      alt: "Un bulletin PDF A4, le même PDF ouvert sur smartphone, et l’e-mail d’avis sans montant",
      caption: "Le bulletin PDF, le même PDF sur smartphone et l’e-mail d’avis (données d’exemple).",
    },
    close: {
      heading: "Essayer, ou nous confier le travail",
      free: {
        before: "Avant d’acheter, vous pouvez vérifier que votre liste de paie s’importe. Une version gratuite, « ",
        after: " », va jusqu’à trois salariés et jusqu’à l’envoi d’essai à vous-même. Elle importe de la même façon que la version payante et se trouve sur BOOTH (page en japonais).",
      },
      service: "Nous pouvons aussi l’installer dans votre tableur. Le prix figure sous « Installation comprise » dans la section Prix ci-dessus.",
      coconala: { before: "Vous pouvez aussi passer commande sur Coconala : « ", after: " » (kit inclus, 15 000 ¥ ; page en japonais). Nous réglons les rubriques et les textes selon votre liste de paie et vous envoyons un guide d’installation." },
      consult: {
        before: "Si vous ne savez pas si votre liste s’importera, envoyez les lignes d’en-tête et une ou deux premières lignes à ",
        after: " ; nous répondons gratuitement. Supprimez ou masquez au préalable noms, montants et adresses e-mail.",
      },
    },
    sales: {
      proof: [
        { figure: "11 points", label: "Points examinés par Vérifier avant l’envoi : numéros et noms, adresses menant à la même boîte, partage du tableur, etc. S’il reste un point à vérifier, rien ne peut partir." },
        { figure: "132 tests", label: "Tests couvrant l’import, les vérifications, la protection contre les doubles envois et le parcours complet dans un Apps Script simulé. Tous passent." },
        { figure: "~2 min", label: "Temps pour créer les PDF des huit salariés d’exemple et vous envoyer l’essai (10 à 15 secondes environ par PDF)." },
        { figure: "0 ¥", label: "Abonnement mensuel. Il fonctionne uniquement avec Google Sheets et Apps Script, et n’envoie rien aux serveurs de l’auteur ni ailleurs." },
      ],
      audience: {
        fits: [
          "Confiez la paie à un gestionnaire ou la faites dans Excel, et ne remettez que les bulletins sur papier (5 à 30 salariés environ)",
          "Utilisez Google Workspace ou Gmail",
          "Voulez remettre les bulletins par voie électronique sans abonnement ni frais d’installation d’un service de bulletins en ligne",
          "Êtes un cabinet de paie qui aide ses clients à distribuer les bulletins (voir la licence cabinet de paie / agence)",
        ],
        notFor: [
          "Utilisez déjà un logiciel de paie avec bulletins en ligne, comme freee RH ou Money Forward Cloud Paie (cela suffit)",
          "Voulez calculer la paie, l’impôt ou les cotisations (il ne calcule pas ; il met en forme une liste déjà calculée)",
          "Voulez utiliser Excel seul (il utilise Google Sheets et Google Drive)",
          "Distribuez à plus de 150 personnes dans une même entreprise",
        ],
      },
      compare: {
        rows: [
          {
            kind: "Logiciel de paie",
            name: "Bulletins en ligne de freee RH, etc.",
            href: SOURCES.freee,
            cost: "Inclus dans l’abonnement au logiciel de paie",
            note: "Un seul outil du calcul de la paie à la remise. Si vous utilisez déjà un logiciel de paie, cela suffit.",
          },
          {
            kind: "Service similaire",
            name: "Services de bulletins en ligne comme i-Compass ou Web Kyukincho Cloud",
            href: SOURCES.icompass,
            cost: "Environ 40 à 220 ¥ par personne et par mois ; frais d’installation pour certains",
            note: "Écran de connexion des salariés et conservation longue des bulletins pris en charge. Pour 10 personnes, environ 5 000 à 26 000 ¥ par an.",
          },
          {
            kind: "Outil gratuit",
            name: "Publipostage Excel, modèles de bulletin gratuits",
            cost: "0 ¥",
            note: "On peut mettre en forme les bulletins. La remise se fait par impression ou par e-mail envoyé à la main, destinataires vérifiés à l’œil.",
          },
        ],
        kit: "Importe la liste du gestionnaire telle quelle et partage chaque bulletin uniquement avec l’adresse du salarié. Vérifications avant l’envoi, envoi d’essai, protection contre les doubles envois, journal des envois et dates de consentement, dans un seul tableur.",
        checkedOn: CHECKED_ON,
      },
      steps: [
        {
          heading: "Première installation (20 minutes environ)",
          intro: "Ces quatre étapes ne se font qu’une fois. Aucune connaissance en programmation n’est nécessaire.",
          items: [
            "Créez un nouveau tableur et collez les fichiers fournis Code.gs et appsscript.json dans Apps Script.",
            "Dans le menu, choisissez Bulletins → Initialiser et autorisez l’accès sur l’écran de Google. Comme vous avez collé le script vous-même, l’écran « Google n’a pas validé cette application » est normal.",
            "Sur la feuille des salariés, indiquez numéro, nom, e-mail, mode de remise et date de consentement, une personne par ligne.",
            "Sur la feuille des réglages, indiquez le nom de l’entreprise, le mois concerné et la date de paie.",
          ],
          after: "Chaque mois, cinq gestes : coller la liste, Importer, Vérifier, Envoi d’essai, Distribuer — 5 à 10 minutes pour 10 salariés. Vous pouvez d’abord essayer avec les données d’exemple fournies (huit salariés d’une entreprise fictive, trois mois).",
        },
        {
          heading: "Quand un salarié n’arrive pas à ouvrir son bulletin",
          intro: "Un bulletin partagé ne s’ouvre qu’avec le compte Google de l’adresse qui a reçu l’e-mail. Vérifiez dans cet ordre.",
          items: [
            "Le salarié est-il connecté avec le compte Google de cette adresse (et non un autre compte, professionnel ou personnel) ?",
            "Lui avez-vous remis le guide fourni pour les destinataires (ouvrir le bulletin sur ordinateur et sur smartphone) ?",
            "Si cela ne s’ouvre toujours pas, passez son mode de remise en pièce jointe sur la feuille des salariés et renvoyez-lui seulement.",
          ],
          after: "Les adresses qui ne peuvent pas recevoir de partage, par exemple sans compte Google, passent automatiquement en pièce jointe lors de la distribution. Si l’écran d’autorisation indique une restriction de l’administrateur, demandez à l’administrateur de votre Google Workspace d’autoriser le script.",
        },
      ],
    },
  },
};
