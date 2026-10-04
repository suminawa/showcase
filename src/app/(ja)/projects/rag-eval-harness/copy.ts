import type { KitCopy } from "../kit-sheet";

/** 見本の節（記録の再生のレポートの写し 3 枚）を足した形 */
type RagCopy = KitCopy & {
  demoHeading: string;
  demo: string[];
  /** 写しの順は content.tsx の SHOTS と同じ */
  figures: { alt: string; caption: string }[];
};

const ja: RagCopy = {
  meta: {
    title: "RAG 評価ハーネス",
    description: "AI 窓口のプロンプト・モデル・文書を更新したあと、同じ質問表で答えを確かめ、前回より悪くなった質問を日本語のレポートの先頭に出す評価ツールです。",
  },
  title: "RAG 評価ハーネス",
  lede: "AI 窓口の更新で答えが悪くなっていないかを、同じ質問表で確かめます",
  intro:
    "質問と期待する答えを CSV にまとめておき、更新の前と後で同じように窓口に答えさせます。前回より悪くなった質問は、日本語のレポートの先頭に出ます。手元の端末で動く Node.js のプログラムなので、このページに動く見本は置いていません。下の画面は、購入後に API キーを入れる前に開ける見本（npm run demo:diff）のレポートです。",
  demoHeading: "見本: 更新のあとに悪くなった問いが先頭に出るところ",
  demo: [
    "これは記録した答えと採点を再生するデモで、同梱の記録をそのまま開いた画面です。架空の工務店の文書を入れた AI 案内窓口キットに見本の 20 問を答えさせ、その答えと採点を記録しました。「あと」の記録は、見本の文書の価格表 1 行（キッチンの入れ替え 80 万円〜150 万円）をわざと 100 万円〜190 万円に書き換えて取ったものです。お客さまの実際の窓口で取った結果ではありません。",
    "書き換えた 1 行のとおり、「キッチンの入れ替えはいくらくらいですか」（q05）だけが正解から誤りに変わり、正答率は 100% から 95% に下がります。再生なので、その場で AI に答えさせることはなく、API の費用もかかりません。",
  ],
  figures: [
    {
      alt: "レポートの上の部分。正答率 95%（前回から 5 ポイント下がった）、期待した出典との一致・断りの正しさ・禁止事項の違反・1 問あたりの時間の札と、前回から悪くなった問い q05",
      caption: "レポートの上の部分。正答率が前回から 5 ポイント下がり、悪くなった問い（q05）が先頭に出ています（同梱の記録の再生）",
    },
    {
      alt: "問いごとの結果の表。ID・タグ・質問・判定・要点の印・出典・違反・時間・円が 1 問 1 行で並び、q05 だけが誤り",
      caption: "問いごとの結果の表。要点の印（● 述べている・× 食い違う）と判定が並び、判定とタグで絞り込めます（同梱の記録の再生）",
    },
    {
      alt: "q05 の「答えと採点」を開いたところ。答えの全文、出典、採点の理由、前回の判定（正解）",
      caption: "q05 の「答えと採点」を開いたところ。答えの全文・出典・採点の理由・前回の判定が並びます（同梱の記録の再生）",
    },
  ],
  sections: [
    {
      heading: "誰が使うか",
      list: [
        "AI の窓口を作ってお客さまに納める方で、納める前と更新のたびに、確かめた結果を表と文で残したい方",
        "AI 案内窓口キット・LINE 案内窓口キット・AI 書類読み取りキットを使っていて、文書や設定を変えるたびに答えを確かめたい方",
        "HTTP で呼べる自前の RAG の窓口を、同じ質問表でくり返し測りたい方",
      ],
    },
    {
      heading: "いつ使うか",
      list: [
        "プロンプトや、答え方の設定を直したとき",
        "答えるモデルを替えたとき",
        "窓口に読ませる文書を書き足したり、書き換えたりしたとき",
        "お客さまに納める前と、納めたあとの更新のとき",
        "GitHub Actions で、変更のたびに自動で回したいとき（正答率が下がったら失敗にできます）",
      ],
    },
    {
      heading: "1 回ごとに数えるもの",
      list: [
        "正答率（正解を 1、部分を 0.5 として数えます）",
        "期待した出典との一致（質問表に書いた文書が、答えの出典に入っているか）",
        "検索の当たり（検索の結果を返す窓口のときだけ）",
        "断りの正しさ（資料に無い問いを断ったか、答えるべき問いで断りすぎていないか）",
        "禁止事項の違反（答えてはいけないことを答えていないか）",
        "1 問あたりの時間と費用（円）。窓口の分と採点の分を分けて出します",
      ],
    },
    {
      heading: "しくみ",
      text: [
        "質問表は CSV です。Google スプレッドシートや Excel で開いて、1 行に 1 問ずつ書き足せます。要点は「80 万円｜150 万円」のように短い語で書き、資料に無いので断るのが正しい問いには「（答えない）」と書きます。",
        "採点は Claude、判定はプログラムが決めます。Claude には要点ごとに「述べている・触れていない・食い違う」の印を付けさせ、正解・部分・誤り・無回答の判定は、その印からプログラムが決めます。同梱の 30 件（人が判定を付けた答え）では、人の判定との一致は 29/30 でした。採点は目安なので、悪くなった問いは答えを読んでお確かめください。",
        "結果は日本語の HTML 1 枚で、ほかのファイルを読み込まないので、メールに添付してもそのまま開けます。日本語と英語の要約（Markdown）、表計算ソフト用の CSV、CI 用の JSON も書き出します。",
      ],
    },
    {
      heading: "つなげる窓口",
      list: [
        "AI 案内窓口キット（手元のキットのフォルダを呼ぶ形と、置いた先の URL を呼ぶ形）",
        "LINE 案内窓口キット（手元のキットのフォルダで答えを作ります。LINE には何も送りません）",
        "AI 書類読み取りキット（手元のキットのフォルダで書類を読み取り、項目ごとに確かめます）",
        "任意の HTTP の窓口（質問を送って答えと出典を受け取る形。応答の形が違うときは、対応表の JSON で指定します）",
      ],
    },
    {
      heading: "できないこと",
      list: [
        "答えを良くする直しは行いません。直すのは人です",
        "文書から質問表を自動で作ることはできません",
        "画面のあるサーバー、複数の利用者、結果の履歴の保管先はありません（結果は手元の runs/ のフォルダに残ります）",
        "採点に使えるのは Claude だけです",
        "文書の本文に照らして、答えが裏づけられているかの採点は行いません",
        "読める質問表は CSV だけです（xlsx は読めません）",
      ],
    },
    {
      heading: "AI の利用料の目安",
      text: [
        "AI の利用料は、ご自身の Anthropic のアカウントから別途お支払いいただきます。2026 年 10 月 3 日に見本の 20 問を記録したときの額（概算）は、AI 案内窓口キットでキットの分 42 円と採点の分 7 円、LINE 案内窓口キットでキットの分 37 円と採点の分 5 円、AI 書類読み取りキットで 125 円でした。円は 1 ドル 150 円で換算しています。実際の額は、文書の量や質問の数によって変わります。",
      ],
    },
    {
      heading: "送られるもの",
      list: [
        "採点のために Anthropic へ送るのは、質問・期待する要点・答えてはいけないこと・答え・出典の題と URL だけです。文書の本文と書類そのものは送りません",
        "発行者のもとには何も送られません",
        "API キーは環境変数からだけ読み、ログやレポートには書きません",
        "レポートと要約では、答えの中のメールアドレス・電話番号・9 桁以上の数字を伏せ字にします",
      ],
    },
    {
      heading: "入っているもの",
      list: [
        "プログラムと、日本語の手順書（README）",
        "3 つのキットと HTTP の窓口に向けた見本の質問表",
        "見本の再生の記録（更新の前と後）",
        "採点の確かめに使う 30 件",
        "GitHub Actions の例",
      ],
    },
    {
      heading: "必要なもの",
      list: [
        "Node.js 20 以上",
        "Anthropic のアカウントと API キー（採点と、手元で呼ぶキットの両方に使います）",
        "測るキットのフォルダ（展開して npm install を済ませたもの）か、HTTP で呼べる窓口",
        "コマンドを打つ画面（ターミナル）の基本的な操作",
      ],
    },
  ],
  buyHeading: "価格と購入",
  buy: "月額料金はありません。改変と、お客さまの環境への組み込み納品は自由で、再配布・転売・同種の商品としての販売はできません",
};

export const copy: Record<"ja" | "en" | "fr", RagCopy> = {
  ja,
  en: {
    meta: {
      title: "RAG Eval Harness",
      description: "An evaluation tool that, after you update an AI help desk’s prompt, model, or documents, checks the answers with the same question sheet and lists questions that got worse first in a Japanese report.",
    },
    title: "RAG Eval Harness",
    lede: "Check with the same question sheet whether an AI help desk update made its answers worse",
    intro:
      "Put questions and expected answers in a CSV, and have the help desk answer them the same way before and after an update. Questions that got worse since the last run come first in a Japanese report. It is a Node.js program that runs on your own machine, so there is no live demo on this page. The screens below are the report from the sample (npm run demo:diff) you can open after purchase, before entering an API key.",
    demoHeading: "Sample: questions that got worse after an update come first",
    demo: [
      "This demo replays recorded answers and grades; the screens show the bundled recording as is. The AI Help Desk Kit, loaded with documents for a fictional builder, answered the 20 sample questions, and the answers and grades were recorded. The “after” recording was made after deliberately changing one line of the sample price list (kitchen replacement from ¥800,000–1,500,000 to ¥1,000,000–1,900,000). These are not results from a real customer’s help desk.",
      "As the changed line suggests, only “How much does a kitchen replacement cost?” (q05) goes from correct to wrong, and accuracy drops from 100% to 95%. Because it is a replay, no AI is called on the spot and there are no API costs.",
    ],
    figures: [
      {
        alt: "Top of the report: 95% accuracy (down 5 points), cards for expected-source match, refusal accuracy, violations, and time per question, and the question that got worse, q05",
        caption: "Top of the report. Accuracy is down 5 points and the question that got worse (q05) is listed first (replay of the bundled recording; in Japanese)",
      },
      {
        alt: "Per-question results table: ID, tag, question, verdict, key-point marks, source, violations, time, and yen, one row per question; only q05 is wrong",
        caption: "Per-question results. Key-point marks and verdicts line up, and you can filter by verdict and tag (replay of the bundled recording; in Japanese)",
      },
      {
        alt: "q05 expanded: the full answer, sources, grading reason, and previous verdict (correct)",
        caption: "q05 expanded, showing the full answer, sources, grading reason, and previous verdict (replay of the bundled recording; in Japanese)",
      },
    ],
    sections: [
      {
        heading: "Who it’s for",
        list: [
          "People who build AI help desks for clients and want a table-and-text record of checks before delivery and after each update",
          "Users of the AI Help Desk Kit, LINE Help Desk Kit, or AI Document Reader Kit who want to check answers whenever documents or settings change",
          "Anyone who wants to measure their own HTTP-callable RAG help desk repeatedly with the same question sheet",
        ],
      },
      {
        heading: "When to use it",
        list: [
          "After changing the prompt or answer settings",
          "After switching the answering model",
          "After adding to or rewriting the documents the help desk reads",
          "Before delivering to a client, and for updates after delivery",
          "When you want it to run automatically on every change with GitHub Actions (it can fail when accuracy drops)",
        ],
      },
      {
        heading: "What each run counts",
        list: [
          "Accuracy (correct counts as 1, partial as 0.5)",
          "Expected-source match (whether the document named in the sheet is among the answer’s sources)",
          "Retrieval hits (only for help desks that return search results)",
          "Refusal accuracy (whether it declined questions the documents don’t cover, and didn’t over-refuse)",
          "Violations (whether it said something it must not)",
          "Time and cost (yen) per question, split between the help desk and grading",
        ],
      },
      {
        heading: "How it works",
        text: [
          "The question sheet is a CSV. Open it in Google Sheets or Excel and add one question per row. Key points are short terms, and questions that should be declined because the documents don’t cover them are marked as such.",
          "Claude grades and the program decides. Claude marks each key point as stated, not mentioned, or contradicted, and the program derives correct, partial, wrong, or no answer from those marks. On the 30 bundled human-graded answers, agreement with the human verdict was 29/30. Grades are a guide, so read the answers for questions that got worse.",
          "The result is a single Japanese HTML file that loads nothing else, so it opens as is from an email attachment. It also writes Japanese and English summaries (Markdown), a CSV for spreadsheets, and JSON for CI.",
        ],
      },
      {
        heading: "Help desks it connects to",
        list: [
          "AI Help Desk Kit (calling a local kit folder, or the URL where it’s deployed)",
          "LINE Help Desk Kit (answers come from a local kit folder; nothing is sent to LINE)",
          "AI Document Reader Kit (reads documents in a local kit folder and checks each field)",
          "Any HTTP help desk that takes a question and returns an answer and sources (a JSON mapping handles other response shapes)",
        ],
      },
      {
        heading: "What it doesn’t do",
        list: [
          "It doesn’t fix answers. People do",
          "It can’t generate a question sheet from documents",
          "No server with screens, no multiple users, no result history storage (results stay in a local runs/ folder)",
          "Only Claude can be used for grading",
          "It doesn’t grade whether answers are supported by the document text",
          "Question sheets must be CSV (no xlsx)",
        ],
      },
      {
        heading: "AI usage cost guide",
        text: [
          "AI usage is paid separately from your own Anthropic account. Recording the 20 sample questions on October 3, 2026 cost roughly ¥42 for the kit plus ¥7 for grading with the AI Help Desk Kit, ¥37 plus ¥5 with the LINE Help Desk Kit, and ¥125 with the AI Document Reader Kit, converted at ¥150 to the dollar. Actual costs vary with the amount of documents and number of questions.",
        ],
      },
      {
        heading: "What gets sent",
        list: [
          "For grading, only the question, expected key points, things not to say, the answer, and source titles and URLs go to Anthropic. Document text and the documents themselves are not sent",
          "Nothing is sent to the publisher",
          "The API key is read only from environment variables and never written to logs or reports",
          "Reports and summaries mask email addresses, phone numbers, and numbers of 9 digits or more in answers",
        ],
      },
      {
        heading: "What’s included",
        list: [
          "The program and a Japanese guide (README)",
          "Sample question sheets for the three kits and HTTP help desks",
          "Sample replay recordings (before and after an update)",
          "30 items for checking the grading",
          "A GitHub Actions example",
        ],
      },
      {
        heading: "Requirements",
        list: [
          "Node.js 20 or later",
          "An Anthropic account and API key (used for grading and for kits called locally)",
          "The folder of the kit to measure (unpacked, with npm install done), or an HTTP-callable help desk",
          "Basic use of a terminal",
        ],
      },
    ],
    buyHeading: "Price and purchase",
    buy: " No monthly fee. Modifying it and delivering it built into a client’s environment are allowed; redistribution, resale, and selling it as a similar product are not",
  },
  fr: {
    meta: {
      title: "Harnais d’évaluation RAG",
      description: "Un outil d’évaluation qui, après une mise à jour du prompt, du modèle ou des documents d’un assistant IA, vérifie les réponses avec le même jeu de questions et place en tête d’un rapport en japonais les questions qui se sont dégradées.",
    },
    title: "Harnais d’évaluation RAG",
    lede: "Vérifiez avec le même jeu de questions si une mise à jour de votre assistant IA a dégradé ses réponses",
    intro:
      "Rassemblez questions et réponses attendues dans un CSV, et faites répondre l’assistant de la même façon avant et après une mise à jour. Les questions dégradées depuis la dernière fois apparaissent en tête d’un rapport en japonais. C’est un programme Node.js qui tourne sur votre machine : il n’y a donc pas de démo interactive sur cette page. Les écrans ci-dessous sont le rapport de l’exemple (npm run demo:diff), consultable après l’achat avant même de saisir une clé d’API.",
    demoHeading: "Exemple : les questions dégradées après une mise à jour arrivent en tête",
    demo: [
      "Cette démo rejoue des réponses et des notes enregistrées ; les écrans montrent l’enregistrement fourni tel quel. Le Kit d’assistant IA, chargé des documents d’un constructeur fictif, a répondu aux 20 questions d’exemple, et réponses et notes ont été enregistrées. L’enregistrement « après » a été pris après avoir modifié exprès une ligne de la grille de prix d’exemple (remplacement de cuisine de 800 000–1 500 000 ¥ à 1 000 000–1 900 000 ¥). Ce ne sont pas les résultats d’un vrai assistant client.",
      "Comme la ligne modifiée le laisse prévoir, seule la question sur le prix d’un remplacement de cuisine (q05) passe de correcte à fausse, et le taux de bonnes réponses passe de 100 % à 95 %. C’est une relecture : aucune IA n’est appelée et il n’y a aucun frais d’API.",
    ],
    figures: [
      {
        alt: "Haut du rapport : 95 % de bonnes réponses (5 points de moins), indicateurs de sources attendues, refus, violations et temps par question, et la question dégradée q05",
        caption: "Haut du rapport. Le taux baisse de 5 points et la question dégradée (q05) apparaît en tête (relecture de l’enregistrement fourni ; en japonais)",
      },
      {
        alt: "Tableau des résultats par question : identifiant, étiquette, question, verdict, points clés, source, violations, temps et yens, une ligne par question ; seule q05 est fausse",
        caption: "Résultats par question. Points clés et verdicts s’alignent, avec filtres par verdict et par étiquette (relecture de l’enregistrement fourni ; en japonais)",
      },
      {
        alt: "q05 dépliée : la réponse complète, les sources, la raison de la note et le verdict précédent (correct)",
        caption: "q05 dépliée, avec la réponse complète, les sources, la raison de la note et le verdict précédent (relecture de l’enregistrement fourni ; en japonais)",
      },
    ],
    sections: [
      {
        heading: "Pour qui",
        list: [
          "Ceux qui livrent des assistants IA à des clients et veulent garder une trace en tableau et en texte des vérifications avant livraison et à chaque mise à jour",
          "Les utilisateurs du Kit d’assistant IA, du Kit d’assistant LINE ou du Kit de lecture de documents par IA qui veulent vérifier les réponses à chaque changement de documents ou de réglages",
          "Quiconque veut mesurer régulièrement son propre assistant RAG appelable en HTTP avec le même jeu de questions",
        ],
      },
      {
        heading: "Quand l’utiliser",
        list: [
          "Après avoir modifié le prompt ou les réglages de réponse",
          "Après avoir changé de modèle",
          "Après avoir ajouté ou réécrit des documents lus par l’assistant",
          "Avant de livrer un client, et lors des mises à jour après livraison",
          "Pour le lancer automatiquement à chaque changement avec GitHub Actions (échec possible si le taux baisse)",
        ],
      },
      {
        heading: "Ce que mesure chaque passage",
        list: [
          "Taux de bonnes réponses (correct = 1, partiel = 0,5)",
          "Concordance des sources attendues (le document indiqué figure-t-il parmi les sources de la réponse)",
          "Pertinence de la recherche (seulement pour les assistants qui renvoient leurs résultats de recherche)",
          "Justesse des refus (refuse-t-il ce que les documents ne couvrent pas, sans refuser à tort)",
          "Violations (a-t-il dit ce qu’il ne fallait pas)",
          "Temps et coût (en yens) par question, séparés entre l’assistant et la notation",
        ],
      },
      {
        heading: "Fonctionnement",
        text: [
          "Le jeu de questions est un CSV. Ouvrez-le dans Google Sheets ou Excel et ajoutez une question par ligne. Les points clés sont des termes courts, et les questions à refuser parce que les documents ne les couvrent pas sont marquées comme telles.",
          "Claude note, le programme tranche. Claude marque chaque point clé comme énoncé, absent ou contredit, et le programme en déduit correct, partiel, faux ou sans réponse. Sur les 30 réponses notées par des humains fournies, l’accord avec le verdict humain est de 29/30. La note est indicative : lisez les réponses des questions dégradées.",
          "Le résultat est un seul fichier HTML en japonais qui ne charge rien d’autre : il s’ouvre tel quel en pièce jointe d’un e-mail. Il produit aussi des résumés en japonais et en anglais (Markdown), un CSV pour tableur et du JSON pour la CI.",
        ],
      },
      {
        heading: "Assistants compatibles",
        list: [
          "Kit d’assistant IA (en appelant le dossier local du kit ou l’URL de déploiement)",
          "Kit d’assistant LINE (réponses produites depuis le dossier local du kit ; rien n’est envoyé à LINE)",
          "Kit de lecture de documents par IA (lit les documents dans le dossier local du kit et vérifie chaque champ)",
          "Tout assistant HTTP qui reçoit une question et renvoie une réponse et des sources (un fichier JSON de correspondance gère les autres formats)",
        ],
      },
      {
        heading: "Ce qu’il ne fait pas",
        list: [
          "Il ne corrige pas les réponses. Ce sont les humains qui corrigent",
          "Il ne génère pas de jeu de questions à partir des documents",
          "Pas de serveur avec interface, pas de multi-utilisateur, pas d’historique stocké (les résultats restent dans le dossier local runs/)",
          "Seul Claude peut servir à noter",
          "Il ne vérifie pas si les réponses sont étayées par le texte des documents",
          "Le jeu de questions doit être en CSV (pas de xlsx)",
        ],
      },
      {
        heading: "Coût indicatif de l’IA",
        text: [
          "L’usage de l’IA est payé à part depuis votre compte Anthropic. L’enregistrement des 20 questions d’exemple le 3 octobre 2026 a coûté environ 42 ¥ pour le kit et 7 ¥ pour la notation avec le Kit d’assistant IA, 37 ¥ et 5 ¥ avec le Kit d’assistant LINE, et 125 ¥ avec le Kit de lecture de documents par IA, avec une conversion à 150 ¥ le dollar. Le coût réel varie selon le volume de documents et le nombre de questions.",
        ],
      },
      {
        heading: "Ce qui est envoyé",
        list: [
          "Pour la notation, seuls la question, les points clés attendus, ce qu’il ne faut pas dire, la réponse et les titres et URL des sources vont chez Anthropic. Le texte des documents et les documents eux-mêmes ne sont pas envoyés",
          "Rien n’est envoyé à l’éditeur",
          "La clé d’API est lue uniquement depuis les variables d’environnement et n’est jamais écrite dans les journaux ni les rapports",
          "Rapports et résumés masquent les e-mails, numéros de téléphone et nombres de 9 chiffres ou plus présents dans les réponses",
        ],
      },
      {
        heading: "Contenu",
        list: [
          "Le programme et un guide en japonais (README)",
          "Des jeux de questions d’exemple pour les trois kits et les assistants HTTP",
          "Des enregistrements de relecture d’exemple (avant et après une mise à jour)",
          "30 éléments pour vérifier la notation",
          "Un exemple GitHub Actions",
        ],
      },
      {
        heading: "Prérequis",
        list: [
          "Node.js 20 ou plus",
          "Un compte et une clé d’API Anthropic (pour la notation et pour les kits appelés en local)",
          "Le dossier du kit à mesurer (décompressé, npm install effectué), ou un assistant appelable en HTTP",
          "L’usage de base d’un terminal",
        ],
      },
    ],
    buyHeading: "Prix et achat",
    buy: " Sans abonnement. Modification et livraison intégrée à l’environnement d’un client autorisées ; redistribution, revente et vente comme produit similaire interdites",
  },
};
