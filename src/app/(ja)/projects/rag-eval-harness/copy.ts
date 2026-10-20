/*
 * 値段の文は書かない（kit-parts.tsx の部品が projects.ts から組む）。
 * 札の数字（100% → 95%・q05）は、同梱の記録の再生（npm run demo:diff）のレポートと同じ。
 */
import type { KitSales } from "../kit-parts";
import { STEP_IMAGES } from "../step-images";
import type { KitSection } from "../kit-sheet";

const SOURCES = {
  ragas: "https://docs.ragas.io/",
  promptfoo: "https://www.promptfoo.dev/",
  langsmith: "https://www.langchain.com/langsmith",
};

/** 比べる相手のページを読んだ日 */
const CHECKED_ON = "2026-10-19";

type RagCopy = {
  meta: { title: string; description: string };
  name: string;
  title: string;
  lede: string;
  /** 見出しのすぐ下の札（レポートの頭の写し） */
  sign: {
    label: string;
    score: string;
    delta: string;
    regressedLabel: string;
    question: string;
    verdict: string;
    open: string;
    note: string;
  };
  intro: string;
  demoHeading: string;
  demo: string[];
  /** 写しの順は content.tsx の SHOTS と同じ */
  figures: { alt: string; caption: string }[];
  sales: KitSales;
  /** 必要なもの（誰向けのすぐ下に置く） */
  needs: KitSection;
  /** エンジニアでない方の入口 */
  roles: {
    heading: string;
    intro: string;
    cols: string[];
    rows: string[][];
    checkHeading: string;
    check: string[];
    requestHeading: string;
    request: string;
  };
  sections: KitSection[];
  buyHeading: string;
  buy: string;
};

const ja: RagCopy = {
  meta: {
    title: "RAG の評価と回帰テスト｜AI 窓口の更新で悪くなった答えを、日本語のレポートの先頭に（RAG 評価ハーネス）",
    description: "AI 窓口（RAG）のプロンプト・モデル・文書を変えたあと、同じ質問表で答えさせ、Claude が要点ごとに採点します。前回より悪くなった問いを日本語のレポートの先頭に出し、お客さまにそのまま渡せる報告書 1 枚にまとめます。Ragas・promptfoo との違いと、見本のレポートつき。",
  },
  name: "RAG 評価ハーネス",
  title: "RAG の答えを更新のたびに採点し、悪くなった問いを先頭に",
  lede: "プロンプト・モデル・文書を変えたら、同じ質問表で AI 窓口に答えさせ、Claude が要点ごとに採点します。前回より悪くなった問いは、日本語のレポートの先頭に赤い枠で出ます。お客さまや上司にそのまま渡せる報告書 1 枚です。",
  sign: {
    label: "正答率",
    score: "100% → 95%",
    delta: "前回から 5 ポイント下がりました",
    regressedLabel: "前回より悪くなった問い 1 問",
    question: "キッチンの入れ替えはいくらくらいですか",
    verdict: "前回 正解 → 今回 誤り",
    open: "レポートの実物を開く（見本の HTML）",
    note: "同梱の記録の再生（npm run demo:diff）のレポートの頭です。データは架空です。",
  },
  intro:
    "手元の端末で動く Node.js のプログラムです。上の札と下の画面は、購入後に API キーを入れる前に開ける見本（npm run demo:diff）のレポートで、レポートの実物（HTML 1 枚）もこのページから開けます。",
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
  sales: {
    proof: [
      { figure: "214 件", label: "自動テストの数です。版を出すたびに、すべて通してからお届けしています（1.0.1）。" },
      { figure: "29/30", label: "人が判定を付けた 30 件の答えで、採点が人の判定と一致した数です。同梱の npm run judge:check で確かめられます。" },
      { figure: "40〜150 円", label: "見本の 20 問を 1 回回したときの AI の利用料の目安です（AI 案内窓口キット。手順書の値）。" },
      { figure: "0 円", label: "月額の費用です。手元の端末で動き、AI の利用料はご自身の Anthropic のアカウントからお支払いいただきます。" },
    ],
    audience: {
      fits: [
        "他社の AI 窓口（RAG）を作って納める方で、納める前と更新のたびに、確かめた結果を書面でお客さまに出したい方",
        "AI 案内窓口キット・LINE 案内窓口キット・AI 書類読み取りキットを使っていて、文書や設定を変えるたびに答えを確かめたい方",
        "社内のボットの正しさを上司に示したい方（質問表を書くのはあなた、動かすのは外注先か社内の開発の方です。下の「エンジニアでない方へ」をご覧ください）",
        "ご自身で入れるのが不安な方（設置までお任せいただけます。下の「お値段」をご覧ください）",
      ],
      notFor: [
        "答えを自動で良くしてほしい方（直すのは人です。この道具は、悪くなった問いを見つけるところまでです）",
        "文書の本文に照らした裏づけ（faithfulness など）まで採点したい方（下の比較の Ragas をおすすめします）",
        "Claude 以外のモデルで採点したい方（採点に使えるのは Claude だけです。下の比較の promptfoo をおすすめします）",
        "質問が数問だけで、表計算ソフトで ○× を付ければ足りる方",
      ],
    },
    compare: {
      rows: [
        {
          kind: "無料の道具",
          name: "Ragas",
          href: SOURCES.ragas,
          cost: "0 円（オープンソース）",
          note: "文書の本文に照らした指標（faithfulness など）を持つ Python の道具です。採点の指示は英語が基本で、日本語の報告書は自前で組みます。",
        },
        {
          kind: "無料の道具",
          name: "promptfoo",
          href: SOURCES.promptfoo,
          cost: "0 円（MIT ライセンス）",
          note: "YAML とコマンドで回し、前後の差の表示や CI にも対応します。採点の基準（ルーブリック）と日本語の報告は自前で書きます。",
        },
        {
          kind: "似たサービス",
          name: "LangSmith",
          href: SOURCES.langsmith,
          cost: "無料の枠は月 5,000 トレース・1 席。Plus は 1 席 $39/月",
          note: "評価と記録を画面で扱えるサービスです。データは LangSmith に置きます。",
        },
      ],
      kit: "日本語の報告書 1 枚を、そのままお客さまに渡せます。要点ごとに「述べている・触れていない・食い違う」を付け、判定はプログラムが決めます。断るべき問いと禁止事項の違反も数え、質問表の CSV を書けば動きます。",
      checkedOn: CHECKED_ON,
    },
    steps: [
      {
        heading: "会社で Anthropic の API キーを用意するとき",
        image: STEP_IMAGES.apiKey,
        intro: "採点に Anthropic の API キーが要ります。会社で契約するときは、次の順に進めます。画面の言葉は、Console の版によって少し違うことがあります。",
        items: [
          "Anthropic の Console（console.anthropic.com）でアカウントを作ります。",
          "「Billing」で会社のクレジットカードを登録し、前払いのクレジットを買います。",
          "「Limits」で月の上限額を決めます。見本の 20 問は 1 回 40〜150 円ほどです。",
          "「API Keys」で「Create Key」を押し、出た鍵を控えます。鍵が表示されるのはこのときだけです。",
          "鍵は、動かす方（外注先か社内の開発の方）に安全な方法で渡します。メールの本文には書かないでください。",
        ],
        after: "鍵をなくしたときや、外注先との契約が終わったときは、Console で新しい鍵を作り、古い鍵を消してください。",
      },
      {
        heading: "動かしてみて止まったとき",
        intro: "手順書の「よくあるつまずき」と同じ内容です。画面に出た文を探して、その行のとおりに直してください。",
        items: [
          "「キットの版が想定と違います」と出たら、--kit-dir がキットの zip を展開したフォルダ（dist と package.json がある場所）かを確かめます。",
          "「キットを読み込めませんでした」と出たら、キットのフォルダで npm install を済ませます。",
          "「質問表を UTF-8 で保存してください」と出たら、Excel で「CSV UTF-8（コンマ区切り）」を選んで保存し直します。",
          "終了コード 3 で、採点エラーが「HTTP 404」のときは、採点のモデルの名前（--judge-model）が正しいか、廃止されていないかを確かめます。",
          "置いた先の窓口に向けて 429 が続くときは、--interval-ms 10000 のように間を空けます。",
        ],
        after: "採点は毎回少し揺れます。気になるときは --judge-repeat 3 で、同じ答えを 3 回採点したときの一致を見られます。",
      },
    ],
  },
  needs: {
    heading: "必要なもの",
    list: [
      "Node.js 20 以上",
      "Anthropic のアカウントと API キー（採点と、手元で呼ぶキットの両方に使います）",
      "測るキットのフォルダ（展開して npm install を済ませたもの）か、HTTP で呼べる窓口",
      "コマンドを打つ画面（ターミナル）の基本的な操作（できる方が社内にいなければ、外注先にお任せいただけます）",
    ],
  },
  roles: {
    heading: "エンジニアでない方へ（外注先と分けて使う）",
    intro: "社内のボットの正しさを測りたいけれど、ターミナルは触らない、という方の使い方です。あなたの仕事は、質問表を書くことと、レポートを読むことだけです。今の答えがどれくらい正しいかを 1 回だけ測る使い方もできます（2 回目から、前回との差が出ます）。",
    cols: ["だれが", "すること"],
    rows: [
      ["あなた（総務・企画のご担当）", "質問表の CSV を、Excel かスプレッドシートで書きます。1 行に 1 問、答えに入っていてほしい要点を「80 万円｜150 万円」のように短い語で書きます。資料に無いので断るのが正しい問いには「（答えない）」と書きます。"],
      ["外注先か、社内の開発の方", "Node.js と API キーを用意し、ボットにつないで回します。結果は HTML 1 枚で、メールに添付してもそのまま開けます。"],
      ["あなた", "レポートを読み、悪くなった問いの答えを確かめます。上司へのご報告には、正答率と悪くなった問いの札をそのまま使えます。"],
    ],
    checkHeading: "お使いのボットがつながるかの確かめ（外注先に聞くこと）",
    check: [
      "AI 案内窓口キット・LINE 案内窓口キット・AI 書類読み取りキットのどれかですか（そのままつながります）",
      "HTTP で質問を送ると、答え（と出典）が返りますか（返りの形が違っても、対応表の JSON で合わせられます）",
      "Dify・LangServe・OpenAI 互換の API で作られていますか（それぞれの対応表の見本が入っています）",
      "答えを少しずつ流して返す形（SSE）だけですか（そのままではつながりません。同梱の包み方の見本で、一度に返す形にしてください）",
    ],
    requestHeading: "外注先に渡す依頼文の見本",
    request: "いつもお世話になっております。社内の問い合わせボットの答えを、月に 1 回、同じ質問表で測っていただけますでしょうか。質問表（CSV）はこちらで用意します。測る道具は「RAG 評価ハーネス」です。結果の HTML（report.html）と、前回より悪くなった問いがあればその一覧をお送りください。ボットの設定や文書を変えたときも、同じように 1 回測っていただけると助かります。",
  },
  sections: [
    {
      heading: "いつ使うか",
      list: [
        "プロンプトや、答え方の設定を直したとき",
        "答えるモデルを替えたとき",
        "窓口に読ませる文書を書き足したり、書き換えたりしたとき",
        "お客さまに納める前と、納めたあとの更新のとき",
        "今の答えがどれくらい正しいかを、1 回だけ測りたいとき",
        "GitHub Actions で、変更のたびに自動で回したいとき（悪くなった問いの数や正答率で、失敗にできます）",
      ],
    },
    {
      heading: "1 回ごとに数えるもの",
      list: [
        "正答率（正解を 1、部分を 0.5 として数えます。95% 区間と「1 問 = 何ポイント」も添えます）",
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
        "任意の HTTP の窓口（質問を送って答えと出典を受け取る形。応答の形が違うときは、対応表の JSON で指定します。Dify・LangServe・OpenAI 互換の対応表と、Express・FastAPI で包む見本が入っています）",
      ],
    },
    {
      heading: "できないことと、代わりの道",
      list: [
        "答えを良くする直しは行いません。直すのは人です（悪くなった問いの答えと採点の理由を、直す手がかりにしてください）",
        "文書から質問表を自動で作ることはできません（見本の質問表を写して、1 行ずつ書き換えてください）",
        "画面のあるサーバー、複数の利用者、結果の履歴の保管先はありません（結果は手元の runs/ のフォルダに残ります。CI では成果物として保存できます）",
        "採点に使えるのは Claude だけです（ほかのモデルで採点したい方には promptfoo をおすすめします）",
        "文書の本文に照らして、答えが裏づけられているかの採点は行いません（その指標が要る方には Ragas をおすすめします）",
        "読める質問表は CSV だけです（Excel では「CSV UTF-8（コンマ区切り）」で保存してください）",
      ],
    },
    {
      heading: "AI の利用料の目安",
      text: [
        "AI の利用料は、ご自身の Anthropic のアカウントから別途お支払いいただきます。手順書の目安では、見本の 20 問を AI 案内窓口キットで回すと、キットの分が 30〜60 円、採点の分が 5〜20 円ほどで、1 回 40〜150 円ほどです。AI 書類読み取りキットの見本 12 枚は 80〜200 円です。円は 1 ドル 150 円で換算しています。実際の額は、文書の量や質問の数によって変わります。",
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
        "自前の RAG をつなぐ見本（Express・FastAPI）と、Dify・LangServe・OpenAI 互換の対応表",
        "GitHub Actions の例",
      ],
    },
  ],
  buyHeading: "ご購入について",
  buy: "月額料金はありません。改変と、お客さまの環境への組み込み納品は自由で、再配布・転売・同種の商品としての販売はできません。",
};

const en: RagCopy = {
  meta: {
    title: "RAG evaluation and regression tests | Answers that got worse after an update, first in a Japanese report (RAG Eval Harness)",
    description: "After you change an AI help desk’s (RAG) prompt, model, or documents, it answers the same question sheet and Claude grades each key point. Questions that got worse since the last run come first in a Japanese report you can hand to a client as is. With a comparison against Ragas and promptfoo, and a sample report.",
  },
  name: "RAG Eval Harness",
  title: "Grade RAG answers on every update, worst first",
  lede: "When you change a prompt, model, or documents, the help desk answers the same question sheet and Claude grades each key point. Questions that got worse since last time appear first in a Japanese report, framed in red. One report you can hand to a client or your manager as is.",
  sign: {
    label: "Accuracy",
    score: "100% → 95%",
    delta: "Down 5 points from the previous run",
    regressedLabel: "1 question got worse",
    question: "How much does a kitchen replacement cost?",
    verdict: "Previous: correct → Now: wrong",
    open: "Open the actual report (sample HTML, in Japanese)",
    note: "Top of the report from the bundled replay (npm run demo:diff). The data is fictional.",
  },
  intro:
    "It is a Node.js program that runs on your own machine. The card above and the screens below come from the sample report (npm run demo:diff) you can open after purchase, before entering an API key, and the actual report (a single HTML file) opens from this page.",
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
  sales: {
    proof: [
      { figure: "214", label: "Automated tests. Every release passes all of them before it ships (1.0.1)." },
      { figure: "29/30", label: "Agreement with human verdicts on 30 human-graded answers. Check it yourself with the bundled npm run judge:check." },
      { figure: "¥40–150", label: "Typical AI usage for one run of the 20 sample questions (AI Help Desk Kit; figure from the guide)." },
      { figure: "¥0", label: "Monthly fee. It runs on your machine; AI usage is paid from your own Anthropic account." },
    ],
    audience: {
      fits: [
        "Build and deliver AI help desks (RAG) for clients, and want to give them a written record of checks before delivery and after each update",
        "Use the AI Help Desk Kit, LINE Help Desk Kit, or AI Document Reader Kit and want to check answers whenever documents or settings change",
        "Want to show your manager how accurate an in-house bot is (you write the question sheet; a contractor or in-house developer runs it; see “For non-engineers” below)",
        "Would rather not install it yourself (setup can be done for you; see Price below)",
      ],
      notFor: [
        "Want answers improved automatically (people fix them; this tool finds the questions that got worse)",
        "Need grading against the document text, such as faithfulness (we recommend Ragas, compared below)",
        "Want to grade with a model other than Claude (only Claude is supported; we recommend promptfoo, compared below)",
        "Have only a handful of questions that a spreadsheet with checkmarks already covers",
      ],
    },
    compare: {
      rows: [
        {
          kind: "Free tool",
          name: "Ragas",
          href: SOURCES.ragas,
          cost: "¥0 (open source)",
          note: "A Python tool with metrics checked against the document text, such as faithfulness. Grading prompts are in English by default, and you build a Japanese report yourself.",
        },
        {
          kind: "Free tool",
          name: "promptfoo",
          href: SOURCES.promptfoo,
          cost: "¥0 (MIT license)",
          note: "Runs from YAML and the command line, with before/after diffs and CI support. You write the grading rubric and any Japanese reporting yourself.",
        },
        {
          kind: "Similar service",
          name: "LangSmith",
          href: SOURCES.langsmith,
          cost: "Free tier: 5,000 traces a month, 1 seat. Plus: $39 per seat a month",
          note: "A hosted service for evaluations and traces with a web UI. Your data is stored in LangSmith.",
        },
      ],
      kit: "One Japanese report you can hand to a client as is. Claude marks each key point as stated, not mentioned, or contradicted, and the program decides the verdict. It also counts questions that should be declined and rule violations, and runs from a CSV question sheet.",
      checkedOn: CHECKED_ON,
    },
    steps: [
      {
        heading: "Getting an Anthropic API key for your company",
        intro: "Grading needs an Anthropic API key. For a company account, proceed in this order. Labels may differ slightly between versions of the Console.",
        items: [
          "Create an account in the Anthropic Console (console.anthropic.com).",
          "Under “Billing”, register a company credit card and buy prepaid credits.",
          "Under “Limits”, set a monthly spending cap. One run of the 20 sample questions costs about ¥40–150.",
          "Under “API Keys”, press “Create Key” and note the key. It is shown only once.",
          "Pass the key securely to whoever runs the tool (a contractor or in-house developer). Don’t put it in the body of an email.",
        ],
        after: "If the key is lost, or a contract with a contractor ends, create a new key in the Console and delete the old one.",
      },
      {
        heading: "When a run stops",
        intro: "The same as “Common problems” in the guide. Find the message you saw and follow that line.",
        items: [
          "“The kit version is not what was expected”: check that --kit-dir points to the unzipped kit folder (where dist and package.json are).",
          "“Could not load the kit”: run npm install in the kit folder.",
          "“Save the question sheet as UTF-8”: in Excel, save again as “CSV UTF-8 (comma delimited)”.",
          "Exit code 3 with grading errors “HTTP 404”: check that the grading model name (--judge-model) is correct and not retired.",
          "Repeated 429 errors against a deployed help desk: add a gap such as --interval-ms 10000.",
        ],
        after: "Grades vary slightly from run to run. If that matters, --judge-repeat 3 grades each answer three times and shows how often they agree.",
      },
    ],
  },
  needs: {
    heading: "Requirements",
    list: [
      "Node.js 20 or later",
      "An Anthropic account and API key (used for grading and for kits called locally)",
      "The folder of the kit to measure (unpacked, with npm install done), or an HTTP-callable help desk",
      "Basic use of a terminal (if no one in-house can do this, a contractor can run it for you)",
    ],
  },
  roles: {
    heading: "For non-engineers (splitting the work with a contractor)",
    intro: "How to use it if you want to measure an in-house bot but won’t touch a terminal yourself. Your part is writing the question sheet and reading the report. You can also use it just once, to measure how accurate the answers are today (from the second run, the report shows the difference).",
    cols: ["Who", "Does what"],
    rows: [
      ["You (admin or planning)", "Write the question sheet as a CSV in Excel or a spreadsheet: one question per row, with the key points the answer should contain as short terms. Mark questions that should be declined because the documents don’t cover them."],
      ["A contractor or in-house developer", "Prepares Node.js and the API key, connects it to the bot, and runs it. The result is a single HTML file that opens as is from an email attachment."],
      ["You", "Read the report and check the answers to questions that got worse. For your manager, the accuracy and the worse-question card can be used as is."],
    ],
    checkHeading: "Will your bot connect? (questions for your contractor)",
    check: [
      "Is it the AI Help Desk Kit, LINE Help Desk Kit, or AI Document Reader Kit? (It connects as is.)",
      "If you send a question over HTTP, does an answer (and sources) come back? (A JSON mapping handles other response shapes.)",
      "Is it built on Dify, LangServe, or an OpenAI-compatible API? (Sample mappings for each are included.)",
      "Does it only stream answers bit by bit (SSE)? (That won’t connect as is; use the bundled wrapper samples to return the answer in one piece.)",
    ],
    requestHeading: "Sample request to send a contractor",
    request: "Could you measure our in-house inquiry bot once a month with the same question sheet? We will prepare the question sheet (CSV). The tool is RAG Eval Harness. Please send us the resulting HTML (report.html) and, if any questions got worse since last time, a list of them. We would also appreciate one run whenever the bot’s settings or documents change.",
  },
  sections: [
    {
      heading: "When to use it",
      list: [
        "After changing the prompt or answer settings",
        "After switching the answering model",
        "After adding to or rewriting the documents the help desk reads",
        "Before delivering to a client, and for updates after delivery",
        "When you just want to measure how accurate the answers are today",
        "When you want it to run automatically on every change with GitHub Actions (it can fail on the number of worse questions or on accuracy)",
      ],
    },
    {
      heading: "What each run counts",
      list: [
        "Accuracy (correct counts as 1, partial as 0.5; with a 95% interval and how many points one question is worth)",
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
        "Any HTTP help desk that takes a question and returns an answer and sources (a JSON mapping handles other response shapes; mappings for Dify, LangServe, and OpenAI-compatible APIs and Express and FastAPI wrapper samples are included)",
      ],
    },
    {
      heading: "What it doesn’t do, and alternatives",
      list: [
        "It doesn’t fix answers. People do (use the worse answers and the grading reasons as clues)",
        "It can’t generate a question sheet from documents (copy the sample sheet and rewrite it row by row)",
        "No server with screens, no multiple users, no result history storage (results stay in a local runs/ folder; in CI, save them as artifacts)",
        "Only Claude can be used for grading (if you need other models, we recommend promptfoo)",
        "It doesn’t grade whether answers are supported by the document text (if you need that metric, we recommend Ragas)",
        "Question sheets must be CSV (in Excel, save as “CSV UTF-8 (comma delimited)”)",
      ],
    },
    {
      heading: "AI usage cost guide",
      text: [
        "AI usage is paid separately from your own Anthropic account. According to the guide, running the 20 sample questions on the AI Help Desk Kit costs about ¥30–60 for the kit and ¥5–20 for grading, or about ¥40–150 per run. The 12 sample documents for the AI Document Reader Kit cost ¥80–200. Yen figures use ¥150 to the dollar. Actual costs vary with the amount of documents and number of questions.",
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
        "Samples for connecting your own RAG (Express, FastAPI) and mappings for Dify, LangServe, and OpenAI-compatible APIs",
        "A GitHub Actions example",
      ],
    },
  ],
  buyHeading: "About your purchase",
  buy: "No monthly fee. Modifying it and delivering it built into a client’s environment are allowed; redistribution, resale, and selling it as a similar product are not.",
};

const fr: RagCopy = {
  meta: {
    title: "Évaluation et tests de régression RAG | Les réponses dégradées après une mise à jour, en tête d’un rapport en japonais (Harnais d’évaluation RAG)",
    description: "Après une modification du prompt, du modèle ou des documents d’un assistant IA (RAG), il répond au même jeu de questions et Claude note chaque point clé. Les questions dégradées depuis le dernier passage arrivent en tête d’un rapport en japonais, à remettre tel quel à un client. Avec une comparaison avec Ragas et promptfoo, et un rapport d’exemple.",
  },
  name: "Harnais d’évaluation RAG",
  title: "Notez les réponses RAG à chaque mise à jour, les pires en tête",
  lede: "Quand vous changez un prompt, un modèle ou des documents, l’assistant répond au même jeu de questions et Claude note chaque point clé. Les questions dégradées depuis la dernière fois apparaissent en tête d’un rapport en japonais, encadrées de rouge. Un rapport à remettre tel quel à un client ou à votre responsable.",
  sign: {
    label: "Bonnes réponses",
    score: "100 % → 95 %",
    delta: "5 points de moins qu’au passage précédent",
    regressedLabel: "1 question dégradée",
    question: "Combien coûte le remplacement d’une cuisine ?",
    verdict: "Avant : correcte → Maintenant : fausse",
    open: "Ouvrir le vrai rapport (HTML d’exemple, en japonais)",
    note: "Haut du rapport de la relecture fournie (npm run demo:diff). Les données sont fictives.",
  },
  intro:
    "C’est un programme Node.js qui tourne sur votre machine. Le bloc ci-dessus et les écrans ci-dessous viennent du rapport d’exemple (npm run demo:diff), consultable après l’achat avant même de saisir une clé d’API, et le vrai rapport (un seul fichier HTML) s’ouvre depuis cette page.",
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
  sales: {
    proof: [
      { figure: "214", label: "Tests automatisés. Chaque version les passe tous avant d’être livrée (1.0.1)." },
      { figure: "29/30", label: "Accord avec le verdict humain sur 30 réponses notées par des humains. Vérifiable avec npm run judge:check, fourni." },
      { figure: "40–150 ¥", label: "Coût d’IA indicatif pour un passage des 20 questions d’exemple (Kit d’assistant IA ; chiffre du guide)." },
      { figure: "0 ¥", label: "Abonnement mensuel. Il tourne sur votre machine ; l’usage de l’IA est payé depuis votre propre compte Anthropic." },
    ],
    audience: {
      fits: [
        "Livrez des assistants IA (RAG) à des clients et voulez leur remettre une trace écrite des vérifications avant livraison et à chaque mise à jour",
        "Utilisez le Kit d’assistant IA, le Kit d’assistant LINE ou le Kit de lecture de documents par IA et voulez vérifier les réponses à chaque changement",
        "Voulez montrer à votre responsable la justesse d’un bot interne (vous écrivez le jeu de questions, un prestataire ou un développeur interne le lance ; voir « Pour les non-développeurs » plus bas)",
        "Préférez ne pas l’installer vous-même (l’installation peut être faite pour vous ; voir Prix plus bas)",
      ],
      notFor: [
        "Voulez que les réponses s’améliorent toutes seules (ce sont les humains qui corrigent ; l’outil trouve les questions dégradées)",
        "Avez besoin d’une notation fondée sur le texte des documents, comme la faithfulness (nous recommandons Ragas, comparé plus bas)",
        "Voulez noter avec un autre modèle que Claude (seul Claude est pris en charge ; nous recommandons promptfoo, comparé plus bas)",
        "N’avez que quelques questions, qu’un tableur avec des coches suffit à suivre",
      ],
    },
    compare: {
      rows: [
        {
          kind: "Outil gratuit",
          name: "Ragas",
          href: SOURCES.ragas,
          cost: "0 ¥ (open source)",
          note: "Un outil Python avec des métriques fondées sur le texte des documents, comme la faithfulness. Les consignes de notation sont en anglais par défaut, et le rapport en japonais est à construire vous-même.",
        },
        {
          kind: "Outil gratuit",
          name: "promptfoo",
          href: SOURCES.promptfoo,
          cost: "0 ¥ (licence MIT)",
          note: "Se lance en YAML et en ligne de commande, avec comparaison avant/après et prise en charge de la CI. La grille de notation et tout rapport en japonais sont à écrire vous-même.",
        },
        {
          kind: "Service similaire",
          name: "LangSmith",
          href: SOURCES.langsmith,
          cost: "Offre gratuite : 5 000 traces par mois, 1 siège. Plus : 39 $ par siège et par mois",
          note: "Un service hébergé pour les évaluations et les traces, avec interface web. Vos données sont stockées chez LangSmith.",
        },
      ],
      kit: "Un rapport en japonais à remettre tel quel à un client. Claude marque chaque point clé comme énoncé, absent ou contredit, et le programme décide du verdict. Il compte aussi les questions à refuser et les violations, et fonctionne à partir d’un jeu de questions en CSV.",
      checkedOn: CHECKED_ON,
    },
    steps: [
      {
        heading: "Obtenir une clé d’API Anthropic pour l’entreprise",
        intro: "La notation nécessite une clé d’API Anthropic. Pour un compte d’entreprise, procédez dans cet ordre. Les libellés peuvent varier légèrement selon la version de la Console.",
        items: [
          "Créez un compte dans la Console Anthropic (console.anthropic.com).",
          "Dans « Billing », enregistrez une carte de l’entreprise et achetez des crédits prépayés.",
          "Dans « Limits », fixez un plafond mensuel. Un passage des 20 questions d’exemple coûte environ 40–150 ¥.",
          "Dans « API Keys », appuyez sur « Create Key » et notez la clé. Elle ne s’affiche qu’une fois.",
          "Transmettez la clé de façon sûre à la personne qui lance l’outil (prestataire ou développeur interne). Ne la mettez pas dans le corps d’un e-mail.",
        ],
        after: "Si la clé est perdue, ou à la fin d’un contrat avec un prestataire, créez une nouvelle clé dans la Console et supprimez l’ancienne.",
      },
      {
        heading: "Quand un passage s’arrête",
        intro: "Le même contenu que « Problèmes fréquents » dans le guide. Repérez le message affiché et suivez la ligne correspondante.",
        items: [
          "« La version du kit n’est pas celle attendue » : vérifiez que --kit-dir désigne le dossier décompressé du kit (là où se trouvent dist et package.json).",
          "« Impossible de charger le kit » : lancez npm install dans le dossier du kit.",
          "« Enregistrez le jeu de questions en UTF-8 » : dans Excel, enregistrez de nouveau en « CSV UTF-8 (délimité par des virgules) ».",
          "Code de sortie 3 avec des erreurs de notation « HTTP 404 » : vérifiez que le nom du modèle de notation (--judge-model) est correct et n’a pas été retiré.",
          "Erreurs 429 répétées sur un assistant déployé : espacez les appels, par exemple --interval-ms 10000.",
        ],
        after: "Les notes varient légèrement d’un passage à l’autre. Si cela compte, --judge-repeat 3 note chaque réponse trois fois et montre leur accord.",
      },
    ],
  },
  needs: {
    heading: "Prérequis",
    list: [
      "Node.js 20 ou plus",
      "Un compte et une clé d’API Anthropic (pour la notation et pour les kits appelés en local)",
      "Le dossier du kit à mesurer (décompressé, npm install effectué), ou un assistant appelable en HTTP",
      "L’usage de base d’un terminal (si personne ne peut le faire en interne, un prestataire peut le lancer pour vous)",
    ],
  },
  roles: {
    heading: "Pour les non-développeurs (répartir le travail avec un prestataire)",
    intro: "Comment l’utiliser si vous voulez mesurer un bot interne sans toucher à un terminal. Votre rôle : écrire le jeu de questions et lire le rapport. Vous pouvez aussi l’utiliser une seule fois, pour mesurer la justesse actuelle des réponses (dès le deuxième passage, le rapport montre l’écart).",
    cols: ["Qui", "Fait quoi"],
    rows: [
      ["Vous (administration ou planification)", "Écrivez le jeu de questions en CSV dans Excel ou un tableur : une question par ligne, avec les points clés attendus en termes courts. Marquez les questions à refuser parce que les documents ne les couvrent pas."],
      ["Un prestataire ou un développeur interne", "Prépare Node.js et la clé d’API, le connecte au bot et le lance. Le résultat est un seul fichier HTML qui s’ouvre tel quel en pièce jointe."],
      ["Vous", "Lisez le rapport et vérifiez les réponses des questions dégradées. Pour votre responsable, le taux et le bloc des questions dégradées s’utilisent tels quels."],
    ],
    checkHeading: "Votre bot peut-il se connecter ? (questions pour votre prestataire)",
    check: [
      "Est-ce le Kit d’assistant IA, le Kit d’assistant LINE ou le Kit de lecture de documents par IA ? (Connexion directe.)",
      "En envoyant une question en HTTP, une réponse (et des sources) revient-elle ? (Un fichier JSON de correspondance gère les autres formats.)",
      "Est-il construit avec Dify, LangServe ou une API compatible OpenAI ? (Des correspondances d’exemple sont fournies.)",
      "Ne renvoie-t-il les réponses qu’en flux (SSE) ? (Pas de connexion directe ; utilisez les exemples d’enveloppe fournis pour renvoyer la réponse d’un bloc.)",
    ],
    requestHeading: "Exemple de demande à envoyer à un prestataire",
    request: "Pourriez-vous mesurer notre bot interne une fois par mois avec le même jeu de questions ? Nous préparons le jeu de questions (CSV). L’outil est le Harnais d’évaluation RAG. Merci de nous envoyer le HTML obtenu (report.html) et, si des questions se sont dégradées depuis la dernière fois, leur liste. Un passage à chaque changement de réglages ou de documents du bot serait aussi apprécié.",
  },
  sections: [
    {
      heading: "Quand l’utiliser",
      list: [
        "Après avoir modifié le prompt ou les réglages de réponse",
        "Après avoir changé de modèle",
        "Après avoir ajouté ou réécrit des documents lus par l’assistant",
        "Avant de livrer un client, et lors des mises à jour après livraison",
        "Pour mesurer une seule fois la justesse actuelle des réponses",
        "Pour le lancer automatiquement à chaque changement avec GitHub Actions (échec possible selon le nombre de questions dégradées ou le taux)",
      ],
    },
    {
      heading: "Ce que mesure chaque passage",
      list: [
        "Taux de bonnes réponses (correct = 1, partiel = 0,5 ; avec un intervalle à 95 % et la valeur d’une question en points)",
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
        "Tout assistant HTTP qui reçoit une question et renvoie une réponse et des sources (un fichier JSON de correspondance gère les autres formats ; correspondances pour Dify, LangServe et les API compatibles OpenAI, et exemples d’enveloppe Express et FastAPI fournis)",
      ],
    },
    {
      heading: "Ce qu’il ne fait pas, et les alternatives",
      list: [
        "Il ne corrige pas les réponses. Ce sont les humains qui corrigent (les réponses dégradées et les raisons des notes servent de pistes)",
        "Il ne génère pas de jeu de questions à partir des documents (copiez le jeu d’exemple et réécrivez-le ligne par ligne)",
        "Pas de serveur avec interface, pas de multi-utilisateur, pas d’historique stocké (les résultats restent dans le dossier local runs/ ; en CI, conservez-les comme artefacts)",
        "Seul Claude peut servir à noter (pour d’autres modèles, nous recommandons promptfoo)",
        "Il ne vérifie pas si les réponses sont étayées par le texte des documents (pour cette métrique, nous recommandons Ragas)",
        "Le jeu de questions doit être en CSV (dans Excel, enregistrez en « CSV UTF-8 (délimité par des virgules) »)",
      ],
    },
    {
      heading: "Coût indicatif de l’IA",
      text: [
        "L’usage de l’IA est payé à part depuis votre compte Anthropic. Selon le guide, les 20 questions d’exemple sur le Kit d’assistant IA coûtent environ 30–60 ¥ pour le kit et 5–20 ¥ pour la notation, soit environ 40–150 ¥ par passage. Les 12 documents d’exemple du Kit de lecture de documents par IA coûtent 80–200 ¥. Conversion à 150 ¥ le dollar. Le coût réel varie selon le volume de documents et le nombre de questions.",
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
        "Des exemples pour connecter votre propre RAG (Express, FastAPI) et des correspondances pour Dify, LangServe et les API compatibles OpenAI",
        "Un exemple GitHub Actions",
      ],
    },
  ],
  buyHeading: "À propos de l’achat",
  buy: "Sans abonnement. Modification et livraison intégrée à l’environnement d’un client autorisées ; redistribution, revente et vente comme produit similaire interdites.",
};

export const copy: Record<"ja" | "en" | "fr", RagCopy> = { ja, en, fr };
