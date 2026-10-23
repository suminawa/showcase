/*
 * 悩みから読む紙（/guides）の目録。1 件 = 受注サイトで繰り返し出ている悩みの言葉 1 つ。
 * 題は悩みの言葉そのまま。見本（作品ページ）と、手で組む手順の記事へ渡すための着地の紙。
 */
export interface Guide {
  slug: string;
  /** 悩みの言葉そのまま。紙の題と metadata の title を兼ねる */
  title: string;
  /** 一覧と metadata の description に使う一行 */
  lede: string;
  /** 結びつける作品ページのキー（/projects/<kit>） */
  kit: string;
  /** 公開日（YYYY-MM-DD） */
  date: string;
  /** 本文を直した日（YYYY-MM-DD）。無ければ公開日のまま */
  updated?: string;
  /** metadata の title。検索で打たれる言葉で 32 字まで。無ければ title */
  searchTitle?: string;
  /** 題のすぐ下に置く答えの 1〜2 文。前後を読まなくても通じる形で書く */
  answer: string;
  /** 結びの下の「あわせて読む」に足す記事の slug（同じキットの記事は書かなくても並ぶ） */
  related?: string[];
  /** 結びの道: 触れる見本（無ければ出さない）と、/kits の行（id = slug） */
  demo?: { href: string; label: string };
  shop: string;
}

export const guides: Guide[] = [
  {
    slug: "pdf-to-spreadsheet",
    title: "PDF の請求書をスプレッドシートに手で書き写す作業を減らす",
    lede: "請求書の PDF から請求元・日付・金額を表に移す手間を、手持ちの道具で減らす手順と、仕組みにするときの組み方です。",
    kit: "doc-reader",
    date: "2026-09-25",
    updated: "2026-10-04",
    searchTitle: "請求書PDFをスプレッドシートへ自動で転記する手順",
    answer:
      "請求書の PDF から請求元・日付・金額を写す作業は、写す項目を先に決めて表の 1 行目に並べ、検算の列で合わない行だけに色を付けると減らせます。AI に読ませる場合も、変換と検算はプログラムで行い、人は黄色になった項目だけを確かめて確定します。",
    demo: { href: "/projects/doc-reader", label: "AI 書類読み取りの見本" },
    shop: "doc-reader",
  },
  {
    slug: "customer-sheet",
    title: "顧客管理のスプレッドシートが、いつの間にか崩れていく",
    lede: "お客さまの一覧を表で持ったまま、入力の揺れ・重複・上書きを防ぐ手順と、画面を足すときの組み方です。",
    kit: "sheet-app",
    date: "2026-09-26",
    updated: "2026-10-04",
    searchTitle: "顧客管理スプレッドシートの作り方｜入力の揺れと重複を防ぐ",
    answer:
      "顧客管理のスプレッドシートは、左端に ID の列を作り、状態や担当者をプルダウンに、電話番号を書式なしテキストにすると崩れにくくなります。行は消さずに状態を「削除」にし、重複は COUNTIF で色を付けて見つけます。",
    demo: { href: "/projects/sheet-app", label: "スプレッドシート業務アプリの見本" },
    shop: "sheet-app",
  },
  {
    slug: "line-auto-reply",
    title: "LINE 公式アカウントの問い合わせに、自社の資料だけで答えさせる",
    lede: "LINE に同じ質問が何度も届くとき、標準の機能でできることと、資料を根拠に AI が答えて担当者へ引き継ぐ組み方です。",
    kit: "ai-concierge",
    date: "2026-09-27",
    updated: "2026-10-04",
    searchTitle: "LINE公式アカウントの自動応答を、自社の資料だけで答えさせる",
    answer:
      "LINE 公式アカウントに何度も届く同じ質問には、表記ゆれの言葉も並べたキーワード応答と、リッチメニューで答えられます。AI に答えさせるなら根拠の文書を添えさせ、資料に無いことは担当者へ引き継ぐ道を作ります。",
    demo: { href: "/projects/ai-concierge", label: "AI 案内窓口の見本" },
    shop: "line-concierge",
  },
  {
    slug: "booking-page",
    title: "スプレッドシートで予約を受け付ける方法と、Google フォーム・カレンダーとの違い",
    lede: "電話や LINE で受けている予約を、スプレッドシートで受け付けたいときの方法を比べました。Google フォーム、Google カレンダーの予約スケジュール、Google Apps Script（GAS）で作る予約ページのそれぞれで、無料でできることと、二重予約やリマインドで足りなくなるところをまとめています。",
    kit: "booking",
    date: "2026-09-28",
    related: ["form-auto-reply"],
    updated: "2026-10-23",
    searchTitle: "スプレッドシートで予約受付を作る｜無料の方法との違い",
    answer: "スプレッドシートで予約を受け付けるいちばん手軽な方法は、Google フォームで受付の画面を作り、回答をスプレッドシートに集めることです。ただしフォームでは空いている時間を見せられず、二重予約も止められないので、空きから選んでもらうには Google カレンダーの予約スケジュールか、Google Apps Script（GAS）で枠を数える予約ページを使います。",
    demo: { href: "/projects/booking", label: "予約ページの見本" },
    shop: "booking",
  },
  {
    slug: "monthly-sales-report",
    title: "毎月の売上の集計とグラフを、スプレッドシートで手で作り直している",
    lede: "月例の集計表とグラフを毎月作り直す手間を減らす手順と、集計の決まりを 1 か所に書いて 1 枚の画面にする組み方です。",
    kit: "dashboard",
    date: "2026-09-29",
    updated: "2026-10-04",
    searchTitle: "月次の売上集計とグラフをスプレッドシートで自動化する",
    answer:
      "毎月の売上の集計は、生データを 1 シートに 1 行 1 取引で置き、集計のシートで範囲を列ごと（A:A）に指定すると、月が変わっても式を直さずに済みます。先月比は同じ日数どうしで比べると、月の途中でも下がって見えません。",
    demo: { href: "/projects/dashboard", label: "ダッシュボードの見本" },
    shop: "dashboard",
  },
  {
    slug: "inbox-triage",
    title: "問い合わせのメールが埋もれて、返信が遅れたり漏れたりする",
    lede: "見積もり依頼・クレーム・営業が同じ受信箱に混ざるとき、Gmail の標準の機能で仕分ける手順と、分類と返信の下書きまでを仕組みにする組み方です。",
    kit: "inbox-triage",
    date: "2026-09-30",
    updated: "2026-10-04",
    searchTitle: "問い合わせメールをGmailとAIで振り分け、返信漏れを防ぐ",
    answer:
      "問い合わせのメールは、Gmail のフィルタで 6 つほどのラベルに振り分け、返したものにだけ「済」を付けてアーカイブすると、受信箱には返していないものだけが残ります。AI を使う場合も、分類と返信の下書きまでにして、送るのは人にします。",
    demo: { href: "/projects/inbox-triage", label: "問い合わせ整理の見本" },
    shop: "inbox-triage",
  },
  {
    slug: "deadline-alert",
    title: "契約更新や点検の期限を、スプレッドシートからメールで通知する方法",
    lede: "契約の更新・車検・保険・資格の期限をエクセルやスプレッドシートで管理していて見落とすとき、Google カレンダーや条件付き書式で無料でできることと、毎朝 1 通のメールや Slack で知らせる組み方を、比べてまとめました。",
    kit: "deadline",
    date: "2026-10-01",
    updated: "2026-10-23",
    searchTitle: "スプレッドシートの期限をメールで通知｜契約更新の管理",
    answer: "スプレッドシートの期限をメールで通知するには、期限を日付で入れた表に Google Apps Script（GAS）を足し、毎朝決まった時刻に期限の近い行だけを選んで 1 通にまとめて送ります。期限が数件なら Google カレンダーの通知でも足り、表を毎日開くなら条件付き書式の色分けでも見落としを減らせます。",
    demo: { href: "/projects/deadline", label: "期限アラートの見本" },
    shop: "deadline",
  },
  {
    slug: "survey-free-text",
    title: "Googleフォームの自由記述を集計する｜お客様の声から改善を一つ決める",
    lede: "アンケートの自由記述を上から読むだけで終わってしまうとき、スプレッドシートで分類して数え、原文と見比べて改善を一つ決める手順と、分類と集計を続ける組み方です。",
    kit: "survey-analysis",
    date: "2026-10-02",
    updated: "2026-10-04",
    searchTitle: "Googleフォームの自由記述を分類して集計する手順",
    answer:
      "アンケートの自由記述は、回答ごとに主な分類を 1 つ付け、分類の件数と、不満なのか良かった点なのかを分けて数えると集計できます。いちばん多い声から自動的に決めず、原文と見比べて、次に試す改善を 1 つ決めます。",
    shop: "survey-analysis",
  },
  {
    slug: "lp-structure",
    title: "LPの構成を自分で決める｜載せる内容と順番を1枚の表に書き出す",
    lede: "広告や新しいサービスのために 1 枚のページを用意したいのに、何をどの順で載せるかが決まらないとき、最初の画面から問い合わせまでを 7 つの段で 1 枚の表に書き出す手順と、書いた内容をページにする組み方です。",
    kit: "lp-pack",
    date: "2026-10-03",
    updated: "2026-10-04",
    answer:
      "LP の構成は、誰に・何をしてほしいか・どこから来るかの 3 つを先に決め、最初の画面から問い合わせまでの 7 つの段を 1 枚の表に書き出すと決められます。表には「段・載せること・例」の 3 列を作り、上から埋めていきます。",
    demo: { href: "/sites", label: "業種別の見本サイト" },
    shop: "lp-pack",
  },
  {
    slug: "pdf-table-to-excel",
    title: "PDF の表を Excel やスプレッドシートに移すと、列が崩れる",
    lede: "PDF の注文明細や一覧をコピーして貼ると 1 列に詰まるとき、表を表のまま取り出す手順と、取り込んだあとに見出し・割れた行・文字の数字を直して合計で確かめる組み方です。",
    kit: "doc-reader",
    date: "2026-10-04",
    updated: "2026-10-04",
    searchTitle: "PDFの表をExcelに変換する｜列が崩れるときの直し方",
    answer:
      "PDF の表は、Windows の Microsoft 365 の Excel なら「データ」→「データの取得」→「PDF から」で、表のまま取り込めます。Mac やスプレッドシートでは PDF を Word で開いて表にしてから貼り、混ざった見出しの行と文字のままの数字を直して、合計を PDF と突き合わせます。",
    demo: { href: "/projects/doc-reader", label: "AI 書類読み取りの見本" },
    shop: "doc-reader",
  },
  {
    slug: "form-auto-reply",
    title: "問い合わせフォームの内容をスプレッドシートに残し、自動返信する方法",
    lede: "問い合わせフォームに自動返信を付け、届いた内容をスプレッドシートに 1 行ずつ残す方法を、Google フォームの場合とホームページの自前のフォームの場合に分けてまとめました。無料の設定でできること、Google Apps Script（GAS）の書き方、届かないときの確かめ方まで載せています。",
    kit: "form",
    date: "2026-10-04",
    related: ["form-first-reply", "booking-page"],
    updated: "2026-10-23",
    searchTitle: "問い合わせフォームの自動返信｜スプレッドシート連携とGAS",
    answer: "問い合わせフォームの自動返信は、Google フォームなら回答先のスプレッドシートに Google Apps Script（GAS）を書き、「フォーム送信時」のトリガーでメールを送ると付けられます。ホームページの自前のフォームなら、送信先を GAS のウェブアプリにして、スプレッドシートへの記録と返信を同じ処理の中で行います。",
    demo: { href: "/projects/form", label: "フォーム受付の見本" },
    shop: "form",
  },
  {
    slug: "spreadsheet-app",
    title: "スプレッドシートをスマホで入力できるアプリにする方法（GAS・AppSheet）",
    lede: "スプレッドシートがスマートフォンで見づらい、誰かがセルを壊してしまうとき、台帳は表のまま、入力と一覧の画面を足す方法を比べました。Google フォーム、AppSheet、Google Apps Script（GAS）の Web アプリでできることと、GAS で手で公開する手順を載せています。",
    kit: "sheet-app",
    date: "2026-10-04",
    updated: "2026-10-23",
    searchTitle: "スプレッドシートをアプリ化してスマホで入力する方法",
    answer: "スプレッドシートをアプリにするには、入力だけなら Google フォーム、画面をコードなしで組むなら AppSheet、表のまま一覧・検索・登録の画面を足すなら Google Apps Script（GAS）の Web アプリを使います。GAS の Web アプリは追加の費用がかからず、誰が見られて誰が直せるかは、スプレッドシートの共有設定をそのまま使えます。",
    demo: { href: "/projects/sheet-app", label: "スプレッドシート業務アプリの見本" },
    shop: "sheet-app",
  },
  {
    slug: "quote-calculator",
    title: "ホームページに見積もりシミュレーターを置く",
    lede: "見積もりのやり取りが何度も往復するとき、料金の決まりを書き出してページに自動計算の電卓を置く手順と、消費税の端数・源泉徴収・見積書の PDF までを入れた電卓を置く方法です。",
    kit: "quote-simulator",
    date: "2026-10-04",
    searchTitle: "見積もりシミュレーターの作り方｜サイトに料金の自動計算",
    answer:
      "見積もりシミュレーターは、単価・数量・オプションの率・消費税といった料金の決まりを先に書き出し、入力のたびに内訳と合計を計算し直す電卓としてページに置くと作れます。消費税の端数をどう丸めるかと、オプションの率をどの金額に掛けるかを先に決めておくと、あとで出す見積書と金額がずれません。",
    demo: { href: "/projects/quote-simulator", label: "見積もりシミュレーターの見本" },
    shop: "quote-simulator",
  },
  {
    slug: "site-ai-faq",
    title: "ホームページに、自社の資料だけで答える AI の窓口を置く",
    lede: "よくあるご質問のページがあっても同じ質問が届くとき、会社の資料だけを根拠に AI が答え、分からないことは担当者へ渡す窓口を、サイトに置く手順と費用の目安です。",
    kit: "ai-concierge",
    date: "2026-10-04",
    searchTitle: "自社の資料だけで答えるAIチャットをサイトに置く方法",
    answer:
      "自社の資料だけで答える AI の窓口は、答えに使ってよい文書を決め、質問に近い文書を探してそれだけを渡して答えさせ、根拠の題名を添え、資料に無いことは「載っていません」と言って担当者へ渡す形にすると、推測で答えない窓口になります。文書が数十本なら索引は JSON 1 つで足り、データベースは要りません。",
    demo: { href: "/projects/ai-concierge", label: "AI 案内窓口の見本" },
    shop: "ai-concierge",
  },
  {
    slug: "line-official-setup",
    title: "LINE 公式アカウントのあいさつ・自動応答・リッチメニューを、初期のまま止めない",
    lede: "LINE 公式アカウントを作ったまま、初期のあいさつと「個別のお問い合わせを受け付けておりません」が残っているとき、Manager だけで応答設定・あいさつ・リッチメニュー・キーワード応答を組む手順です。",
    kit: "ai-concierge",
    date: "2026-10-05",
    searchTitle: "LINE公式アカウントの初期設定｜自動応答とリッチメニュー",
    answer:
      "LINE 公式アカウントは、Manager の「応答設定」でチャットと応答メッセージを両方オンにし、あいさつメッセージを書き換え、リッチメニューのテキスト動作で送る言葉をキーワード応答に登録すると、初期のままの状態から抜けられます。キーワードは完全一致なので、1 つの返答に言い換えを並べます。",
    demo: { href: "/projects/ai-concierge", label: "AI 案内窓口の見本" },
    shop: "line-concierge",
  },
  {
    slug: "excel-list-cleanup",
    title: "Excel の名簿の重複と表記ゆれを整理する",
    lede: "同じ人が別の行に増えていく名簿や顧客表を、そろえる規則を先に決めてから整理する手順と、変更ログつきで納める仕組みの作り方です。",
    kit: "sheet-app",
    date: "2026-10-05",
    searchTitle: "Excelの名簿の重複と表記ゆれを整理する手順｜変更ログつき",
    answer:
      "Excel の名簿の重複は、全角半角・空白・会社名の法人格・電話番号の形・メールの大文字小文字をそろえてから、メール → 電話 → 会社名と氏名の順で「同じ 1 件」を決めると見つかります。消す前に残す行を決め、どのセルを何から何に直したかの変更ログを添えると、あとから確かめられます。",
    demo: { href: "/projects/sheet-app", label: "スプレッドシート業務アプリの見本" },
    shop: "sheet-app",
  },
  {
    slug: "local-transcription",
    title: "会議や取材の録音を、外部に出さずに文字起こしする",
    lede: "人の名前や取引先の話が入った録音を、手元のパソコンだけで書き起こす方法と、固有名詞と話者を直して指定の書式で納めるまでの段取りです。",
    kit: "doc-reader",
    date: "2026-10-05",
    searchTitle: "録音を外部に出さずに文字起こしする方法｜手元のPCで",
    answer:
      "録音を外部に出さずに文字起こしするには、公開されている音声認識のモデル（Whisper）を手元のパソコンで動かし、Apple シリコンの Mac なら音声の長さの 4 分の 1 ほどの時間で起こせます。固有名詞と話者は機械では崩れるので、聞きながら直す時間を 60 分あたり 2〜3 時間見ておきます。",
    demo: { href: "/projects/doc-reader", label: "AI 書類読み取りの見本" },
    shop: "doc-reader",
  },
  {
    slug: "deadline-one-person",
    title: "期限を覚えているのが総務の 1 人だけ、という会社で起きること",
    lede: "契約・車検・点検・資格の期限を 1 人の総務が覚えているとき、頭の中の期限を書き出し、通知を 2 人に届く形にする手順と、毎朝 1 通で知らせに来させる組み方です。",
    kit: "deadline",
    date: "2026-10-06",
    searchTitle: "期限管理の属人化をなくす｜総務が1人の会社の手順",
    answer:
      "期限を 1 人が覚えている状態は、頭の中にだけある期限を書き出してシートに足し、「担当」と「次に見る人」の 2 列を作り、Google カレンダーの共有カレンダーで上司にも通知が届くようにすると抜けられます。月に 1 回、2 人で 10 分だけシートとカレンダーを突き合わせます。",
    demo: { href: "/projects/deadline", label: "期限アラートの見本" },
    related: ["payslip-email"],
    shop: "deadline",
  },
  {
    slug: "form-first-reply",
    title: "問い合わせは、届いてから最初の 1 通で半分決まる",
    lede: "サイトのフォームの問い合わせに返すのが遅れるとき、Gmail とスマホの標準機能で最初の 1 通を早く返す手順と、受付・通知・自動返信を仕組みにする組み方です。",
    kit: "form",
    date: "2026-10-07",
    searchTitle: "問い合わせフォームの返信が遅れる｜最初の1通を早く返す",
    answer:
      "フォームの問い合わせへの最初の 1 通は、Gmail のフィルタで通知メールに重要マークを付けてスマホの通知を優先度の高いものだけにし、受け付けたこと・誰がいつまでに連絡するか・急ぎの連絡先の 3 行をユーザー辞書に登録しておくと、現場からでも 1 分ほどで返せます。",
    demo: { href: "/projects/form", label: "フォーム受付の見本" },
    shop: "form",
  },
  {
    slug: "deadline-digest",
    title: "期限の通知が毎日 5 通来ると、全部読まなくなる",
    lede: "期限の通知が件ごとに別々に何度も届いて読まれなくなるとき、シートの標準機能で見る場所を 1 つにまとめる手順と、毎朝 1 通にまとめて知らせに来させる組み方です。",
    kit: "deadline",
    date: "2026-10-11",
    searchTitle: "期限の通知が多すぎて読まない｜1通にまとめる手順",
    answer:
      "期限の通知が多すぎて読まなくなるときは、期限の隣に「あと何日」の列と「超過・当日・3日前以内」の区分を足し、完了の行をフィルタで外して、毎朝見る場所をそのフィルタ表示 1 つにすると、見る行が「今日気にする行」だけになります。見に行く手間まで省くなら、毎朝 1 通にまとめてメールや Slack へ送る形にします。",
    demo: { href: "/projects/deadline", label: "期限アラートの見本" },
    shop: "deadline",
  },
  {
    slug: "payslip-email",
    title: "給与明細を PDF にして、社員にメールで個別に配る方法",
    lede: "毎月の給与明細を印刷して手渡ししている会社が、PDF にしてメールで 1 人ずつ配りたいときの方法をまとめました。手で送る無料のやり方、給与ソフトの Web 明細との比べ方、電子交付に要る本人の承諾、送り間違いを防ぐ確かめ方まで載せています。",
    kit: "payslip",
    date: "2026-10-23",
    searchTitle: "給与明細をPDFにしてメールで配る方法｜無料の手順と注意点",
    answer:
      "給与明細を電子で配るには、先に社員本人から電子交付の承諾を得て（所得税法第 231 条）、1 人ずつの PDF を作り、本人のアドレスだけに送るか共有します。数人なら Excel やスプレッドシートから PDF を書き出して手でメールに添付すれば無料で配れますが、人数が増えるほど宛先の取り違えが怖くなるので、送る前に名簿と突き合わせる仕組みを用意します。",
    related: ["deadline-one-person", "deadline-alert"],
    shop: "payslip",
  },
];




export const guideHref = (guide: Guide) => `/guides/${guide.slug}`;

/** 本文を最後に直した日（無ければ公開日）。記事の署名・Article・sitemap が同じ日を読む */
export const guideUpdated = (guide: Guide) => guide.updated ?? guide.date;

export function guideBySlug(slug: string): Guide {
  const guide = guides.find((g) => g.slug === slug);
  if (!guide) throw new Error(`guide not found: ${slug}`);
  return guide;
}
