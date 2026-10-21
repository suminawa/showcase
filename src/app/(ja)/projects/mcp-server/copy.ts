/*
 * 文中の `…` は等幅の字になる（shell.tsx の Rich）。
 * 無料の品物なので、値段の文は書かない（有料のキットの値段は content.tsx が projects.ts から組む）。
 * シートの名・見出し（日本語のまま貼るもの）は content.tsx の定数に置く。英仏の文に日本語の字を入れない。
 */
import type { KitAudienceCopy, KitCompareCopy, KitProofItem, KitStepGroup } from "../kit-parts";

const SOURCES = {
  oss: "https://github.com/xing5/mcp-google-sheets",
  google: "https://developers.google.com/workspace/sheets/api/guides/configure-mcp-server",
  zapier: "https://zapier.com/mcp",
};

/** 比べる相手のページを読んだ日 */
const CHECKED_ON = "2026-10-19";

type McpCopy = {
  meta: { title: string; description: string };
  name: string;
  title: string;
  lede: string;
  offer: {
    free: string;
    freeNote: string;
    get: string;
    read: string;
    barGet: string;
    barRead: string;
    toPaid: string;
    toTemplate: string;
    license: string;
  };
  replayHeading: string;
  replay: string;
  proof: KitProofItem[];
  audience: KitAudienceCopy;
  compare: KitCompareCopy;
  howHeading: string;
  how: string[];
  notHeading: string;
  not: string[];
  template: {
    heading: string;
    intro: string;
    steps: string[];
    note: string;
    /** content.tsx の 3 枚のシートの名に続ける説明（順も同じ） */
    sheets: string[];
    copy: string;
    copied: string;
    scroll: string;
  };
  setupHeading: string;
  steps: { title: string; text: string }[];
  connect: { caption: string; cols: string[]; rows: string[][] };
  /** content.tsx の SNIPPETS と同じ順 */
  snippets: string[];
  trouble: KitStepGroup[];
  paid: {
    heading: string;
    intro: string;
    /** 予約ページ・業務アプリ・3 本セットの順 */
    adds: string[];
    setName: string;
    setTotal: (total: string) => string;
    see: string;
    tax: string;
  };
  buyHeading: string;
  buy: string;
  service: string;
  contact: string;
};

const ja: McpCopy = {
  meta: {
    title: "台帳の決まりを守る Google Sheets MCP サーバー｜顧客・予約・請求を Claude・ChatGPT から安全に読み書き（MCP サーバー キット・無料）",
    description: "Google スプレッドシートの顧客・予約・請求の台帳を、Claude や ChatGPT との会話から探して直せる MCP サーバーです。「定義」シートの型・必須・選択肢に合わない書き込みは止め、ほかの方が直した行は上書きしません。無料で、TypeScript のソースつき。記録したやり取りを再生する見本つき。",
  },
  name: "MCP サーバー キット（無料）",
  title: "台帳の決まりを守る Google Sheets MCP サーバー",
  lede: "汎用の Sheets MCP は、どの列に何を書いても止めません。このサーバーは「定義」シートの型・必須・選択肢を読み、決まりに合わない書き込みを AI に止めさせます。ほかの方が直した行は上書きせず、既定は読むだけです。",
  offer: {
    free: "無料",
    freeNote: "zip 1 本（TypeScript のソースつき）",
    get: "BOOTH で無料で受け取る",
    read: "note で手順を読む",
    barGet: "無料で受け取る",
    barRead: "手順を読む",
    toPaid: "無料版でできないこと（有料のキット）",
    toTemplate: "お手元のシートで使うには（雛形）",
    license: "お客さまの案件に組み込んで納品できます（キットそのものの再配布・販売はできません）。",
  },
  replayHeading: "会話の再生",
  replay: "記録したやり取りを再生しています。データはすべて架空です。キットを見本のデータで動かし、AI のアプリと同じつなぎ方（stdio）で呼んだツールと、返った結果をそのまま載せています。答えの文は、結果をもとに書いた例です。",
  proof: [
    { figure: "204 件", label: "自動テストの数です。Google には触らず、記憶の中のスプレッドシートで確かめています（1.0.2）。" },
    { figure: "0 円", label: "サーバーの月額です。お手元のパソコンかサーバーで動き、Google Sheets API の利用も無料です。" },
    { figure: "0 行", label: "AI が消せる行の数です。削除のツールは無く、消す代わりに状況の列を更新します。" },
    { figure: "20 回", label: "1 分あたりの書き込みの上限です。書くのは 1 回 1 行で、既定は読むだけです。" },
  ],
  audience: {
    fits: [
      "中小企業に業務改善を納める制作会社・フリーランスの方（お客さまの案件に組み込んで納品できます）",
      "Claude Desktop・Claude Code・Cursor を毎日使い、顧客や予約の台帳を Google スプレッドシートで持っている方",
      "社内の情報システムのご担当で、AI からの書き込みを型と必須の決まりで止めたい方",
      "ご自身でつなぐ時間が無い方（設定までお任せいただけます。いちばん下の「受け取り方と、設定のご依頼」をご覧ください）",
    ],
    notFor: [
      "AI から予約を新しく入れたい・お客さまに通知を送りたい方（このサーバーはしません。下の「無料版でできないこと」をご覧ください）",
      "行の削除や、シート全体の自由な編集まで AI に任せたい方（下の比較の汎用のサーバーをおすすめします）",
      "台帳を Excel のファイルだけで管理していて、Google スプレッドシートに移せない方",
      "コマンドを打つ画面（ターミナル）を使ったことがなく、社内に頼める方もいない方（設定をお任せいただくか、有料のキットの画面からお使いください）",
    ],
  },
  compare: {
    rows: [
      {
        kind: "無料の道具",
        name: "mcp-google-sheets（GitHub のオープンソース）",
        href: SOURCES.oss,
        cost: "0 円",
        note: "シートの読み書きを広く行える、利用者の多い汎用のサーバーです。どの列に何を書くかの決まりは持たないので、自由に編集させたい方はこちらで足ります。",
      },
      {
        kind: "標準の機能",
        name: "Google の Sheets リモート MCP サーバー",
        href: SOURCES.google,
        cost: "0 円（試験提供の段階）",
        note: "Google が用意した公式のサーバーです。シートを広く読み書きできます。列の型や必須を書き込みの前に確かめる仕組みは持ちません。",
      },
      {
        kind: "似たサービス",
        name: "Zapier MCP",
        href: SOURCES.zapier,
        cost: "無料の枠は月の呼び出しに上限。超えると Zapier の有料プラン",
        note: "Google スプレッドシートを含む多くのサービスを AI からつなげます。データは Zapier を通ります。",
      },
    ],
    kit: "「定義」シートの型・必須・選択肢を書き込みの前に確かめ、合わない値は理由を添えて止めます。ほかの方が直した行は上書きせず、行は消しません。サーバーはお手元で動き、データは中継のサービスを通りません。",
    checkedOn: CHECKED_ON,
    kitCost: "0 円（無料・zip 1 本）",
  },
  howHeading: "仕組み",
  how: [
    "AI はスプレッドシートを直接は開きません。このサーバーが用意した「探す」「読む」「登録する」などのツールを呼び、サーバーが Google の Sheets API で読み書きします。Google の鍵も AI の契約もお客さまのもので、データをスプレッドシートの外に置くことはありません。サーバーの月額もかかりません。",
    "書くツールは、設定で `MCP_WRITE=true` にしたときだけ AI に見えます。既定は読むだけです。書くときも 1 回に 1 行で、Claude Desktop などの AI のアプリは、実行の前に「許可しますか」と確かめます。",
  ],
  notHeading: "しないこと",
  not: [
    "行は消しません。消す代わりに、状況や状態の列を更新します。",
    "予約の新規作成と、空き枠の案内はしません（見るのとキャンセルだけです）。",
    "AI からの変更では、キット側の通知・メール・Google カレンダーは動きません。予約をキャンセルにしたときは、お客さまへのご連絡と予定の削除を別に行ってください。",
    "LINE のユーザー ID・更新した人のメールアドレス・予約のキャンセル用の鍵は、AI に渡しません。",
    "書き込みは 1 分に 20 回までで、それを超える呼び出しは止めます。",
  ],
  template: {
    heading: "お手元のシートで使うには（定義と 2 表の雛形）",
    intro: "業務アプリ キットが無くても、「定義」シートと台帳のシートを同じ形で作れば使えます。顧客と対応履歴の 2 表で始める雛形です。",
    steps: [
      "新しいスプレッドシートを作り、シートを 3 枚にして、名前を下の 3 つと同じにします。",
      "下の「コピー」を押し、それぞれのシートの A1 のセルを選んで貼ります。列に分かれて入ります。",
      "お使いの列に合わせて「定義」の行を書き換え、台帳のシートの 1 行目にも同じ見出しを足して、`npm run check` で確かめます。",
    ],
    note: "見出しの名前がそろっていれば、列の順番は問いません。前後の空白と全角・半角の違いは、同じ見出しとして読みます。台帳のシートには ID・作成日時・更新日時・更新者の 4 列を必ず置いてください（AI から登録した行には、サーバーが書き込みます）。型は 文字・長文・数値・金額・日付・選択・チェック・メール・電話・参照:テーブル名 などが使えます。",
    sheets: ["シート（列の決まり）", "シート（1 行目の見出し）", "シート（1 行目の見出し）"],
    copy: "コピー",
    copied: "コピーしました",
    scroll: "表は横に動かせます",
  },
  setupHeading: "使い始めるまで",
  steps: [
    {
      title: "見本のデータで試す（5 分）",
      text: "Claude Desktop の設定に 1 行足すだけで、Google の準備をする前に、この見本と同じデータで動きを確かめられます（`MCP_DEMO=1`）。",
    },
    {
      title: "Google の準備（15 分ほど）",
      text: "サービス アカウントを作ってスプレッドシートを共有し、`.env` にスプレッドシートの URL を書きます。`npm run check` で、つながり方と見出しの形を確かめられます。",
    },
    {
      title: "AI のアプリにつなぐ",
      text: "Claude Desktop・Claude Code・Cursor はお手元のパソコンでそのまま。ChatGPT と claude.ai のコネクタには、HTTP の入口を Cloudflare Tunnel で外に出してつなぎます。HTTP の入口は、合い言葉なしでは受け付けません。",
    },
  ],
  connect: {
    caption: "つなぎ先とつなぎ方",
    cols: ["つなぎ先", "つなぎ方"],
    rows: [
      ["Claude Desktop・Claude Code・Cursor", "stdio（お手元のパソコンでそのまま動きます。https:// の URL は要りません）"],
      ["ChatGPT・claude.ai", "HTTP（外から届く https:// の URL が要ります。Cloudflare Tunnel などで出します）"],
    ],
  },
  snippets: ["Claude Desktop の設定（claude_desktop_config.json）に足す 1 行", ".env に書く 2 行", "つながり方と見出しを確かめる"],
  trouble: [
    {
      heading: "Google Cloud で鍵を作るまで",
      intro: "手順書の 4 章と同じ手順です。画面の言葉は、Google Cloud コンソールの版によって少し違うことがあります。近い名前の項目をお選びください。",
      items: [
        "Google Cloud コンソールを開き、画面の上のプロジェクトの選択から「新しいプロジェクト」を選んで作ります。",
        "「API とサービス」→「ライブラリ」で「Google Sheets API」を探し、「有効にする」を押します。",
        "「IAM と管理」→「サービス アカウント」→「サービス アカウントを作成」で、名前だけ入れて「完了」を押します（ロールは要りません）。",
        "作ったアカウントの「キー」タブ →「キーを追加」→「新しい鍵を作成」→「JSON」→「作成」を押します。落ちた JSON の名前を service-account.json にして、キットのフォルダに置きます。",
        "使うスプレッドシートの「共有」に、JSON の client_email を足します。読むだけなら「閲覧者」、書き込みも使うなら「編集者」を選びます。",
      ],
      after: "共有するのは、このキットで使うスプレッドシートだけです。ドライブ全体の権限は要りません。会社の Google Workspace で「サービス アカウント キーの作成が無効になっています」と出るときは、管理者の方にこのプロジェクトだけの例外をご依頼ください。",
    },
    {
      heading: "Claude Desktop にツールが出ないとき",
      intro: "設定を足して開き直しても、入力欄の「+」に sheets が出ないときは、次の順にお確かめください。",
      items: [
        "「設定」→「開発者」→「構成を編集」で開いたファイルに、すでにほかの設定があるときは、いちばん外側の { } の中に足します（前の項目との間に「,」が要ります）。",
        "command には、ターミナルで which node（Windows は where node）と打って出た場所をそのまま書きます。node だけでは見つからないことがあります。",
        "args には、キットのフォルダの dist/stdio.js の場所を書きます。Windows では「\\」を 2 つ重ねます。",
        "見本で試したときの \"env\": { \"MCP_DEMO\": \"1\" } が残っていれば消します（残すと見本のまま動きます）。",
        "Claude Desktop をいったん終了して開き直し、入力欄の「+」でツールの一覧を確かめます。",
      ],
      after: "それでも出ないときは、ログ（macOS は ~/Library/Logs/Claude/mcp-server-sheets.log）の最後の数行をご覧ください。npm run check の表示を添えて配布ページからお知らせいただければ、できる範囲で確かめます。",
    },
  ],
  paid: {
    heading: "無料版でできないことと、有料のキット",
    intro: "このサーバーは、台帳を会話から探して直す道具です。予約を新しく入れる・お客さまに知らせる・LINE で届ける、は動きません。それを受け持つのが次のキットで、同じスプレッドシートをこのサーバーからも読めます。",
    adds: [
      "予約を受けるページと、確認のメール・Google カレンダーへの登録。お客さまは Google アカウントなしで予約できます。",
      "「定義」シートから一覧と登録の画面を作り、登録や更新を LINE・Slack・Discord に知らせます。このサーバーが読む台帳そのものです。",
      "予約ページ・フォーム受付・スプレッドシート業務アプリ・期限アラートの 4 本をまとめた値です。セットは BOOTH の各キットのページで選べます。",
    ],
    setName: "4 本セット",
    setTotal: (total) => `単品の合計 ${total}`,
    see: "くわしく見る",
    tax: "税込・買い切り",
  },
  buyHeading: "受け取り方と、設定のご依頼",
  buy: "MCP サーバー キットは、無料でお配りしています。TypeScript のソース・ビルド済みのファイル・説明書・設定の見本・見本データの CSV を zip 1 本でお渡しします。",
  service: "サービス アカウントの準備から、Claude Desktop や ChatGPT へのつなぎ込み、Cloudflare の名前つきトンネルの設定までを、こちらで行うこともできます。料金は「頼み方と料金」に載せています。",
  contact: "頼み方と料金",
};

const en: McpCopy = {
  meta: {
    title: "Google Sheets MCP that enforces your ledger rules | Read and write customers, bookings, and invoices safely from Claude or ChatGPT (MCP Server Kit, free)",
    description: "An MCP server that lets Claude or ChatGPT search and update the customer, booking, and invoice ledgers in your Google Sheets. Writes that break the types, required fields, or choices in your definition sheet are stopped, and rows someone else edited are never overwritten. Free, with TypeScript source. The demo replays a recorded session.",
  },
  name: "MCP Server Kit (free)",
  title: "Google Sheets MCP that enforces your ledger rules",
  lede: "A general-purpose Sheets MCP lets the AI write anything into any column. This server reads the types, required fields, and choices in your definition sheet and makes the AI stop when a write breaks them. Rows someone else edited are never overwritten, and it is read-only by default.",
  offer: {
    free: "Free",
    freeNote: "One zip, with TypeScript source",
    get: "Get it free on BOOTH",
    read: "Read the guide on note",
    barGet: "Get it free",
    barRead: "Guide",
    toPaid: "What the free kit doesn’t do (paid kits)",
    toTemplate: "Using your own sheet (template)",
    license: "You may build it into client projects (redistributing or selling the kit itself is not allowed).",
  },
  replayHeading: "Conversation replay",
  replay: "This replays a recorded session, in Japanese; all data is fictional. The kit ran on sample data; the tools it called over stdio (the same connection AI apps use) and the results they returned are shown exactly as they were. The answer text is an example written from those results.",
  proof: [
    { figure: "204", label: "Automated tests, run against an in-memory spreadsheet without touching Google (1.0.2)." },
    { figure: "¥0", label: "Monthly server cost. It runs on your computer or server, and the Google Sheets API is free to use." },
    { figure: "0 rows", label: "Rows the AI can delete. There is no delete tool; a status column is updated instead." },
    { figure: "20", label: "Writes allowed per minute. Each write is a single row, and it is read-only by default." },
  ],
  audience: {
    fits: [
      "Are an agency or freelancer delivering process improvements to small businesses (you may build it into client projects)",
      "Use Claude Desktop, Claude Code, or Cursor daily and keep customer or booking ledgers in Google Sheets",
      "Look after internal IT and want AI writes blocked by type and required-field rules",
      "Don’t have time to connect it yourself (setup can be done for you; see “Download and setup service” at the bottom)",
    ],
    notFor: [
      "Want the AI to create new bookings or send notifications to customers (this server doesn’t; see “What the free kit doesn’t do” below)",
      "Want the AI to delete rows or edit whole sheets freely (we recommend the general-purpose server compared below)",
      "Keep your ledgers only in Excel files and can’t move them to Google Sheets",
      "Have never used a terminal and have no one in-house to help (have it set up for you, or use the paid kits’ screens instead)",
    ],
  },
  compare: {
    rows: [
      {
        kind: "Free tool",
        name: "mcp-google-sheets (open source on GitHub)",
        href: SOURCES.oss,
        cost: "¥0",
        note: "A widely used general-purpose server that reads and writes sheets broadly. It has no rules about what goes in which column, so if you want free-form editing, it is enough.",
      },
      {
        kind: "Built-in feature",
        name: "Google’s remote Sheets MCP server",
        href: SOURCES.google,
        cost: "¥0 (preview stage)",
        note: "Google’s official server. It reads and writes sheets broadly, without checking column types or required fields before a write.",
      },
      {
        kind: "Similar service",
        name: "Zapier MCP",
        href: SOURCES.zapier,
        cost: "Free tier caps monthly calls; Zapier paid plans beyond that",
        note: "Connects the AI to many services, including Google Sheets. Your data passes through Zapier.",
      },
    ],
    kit: "Checks the types, required fields, and choices in your definition sheet before writing, and stops with a reason when a value doesn’t fit. It never overwrites rows someone else edited and never deletes rows. The server runs on your side, and your data does not pass through a relay service.",
    checkedOn: CHECKED_ON,
    kitCost: "¥0 (free, one zip)",
  },
  howHeading: "How it works",
  how: [
    "The AI never opens the spreadsheet directly. It calls tools this server provides, such as search, read, and add, and the server reads and writes through Google’s Sheets API. The Google credentials and the AI subscription are yours, and your data never leaves the spreadsheet. No monthly server fees either.",
    "Write tools are visible to the AI only when you set `MCP_WRITE=true`. By default it’s read-only. Writes happen one row at a time, and AI apps such as Claude Desktop ask for your permission before each one runs.",
  ],
  notHeading: "What it doesn’t do",
  not: [
    "It never deletes rows. Instead, it updates a status column.",
    "It doesn’t create bookings or suggest open slots (it can only view and cancel).",
    "Changes made through the AI don’t trigger the kits’ notifications, emails, or Google Calendar updates. When you cancel a booking this way, contact the customer and remove the calendar event separately.",
    "LINE user IDs, the email address of whoever made an update, and booking cancellation keys are never passed to the AI.",
    "Writes are capped at 20 per minute; calls beyond that are blocked.",
  ],
  template: {
    heading: "Using your own sheet (definition and two-table template)",
    intro: "You don’t need the Business App Kit: a definition sheet and ledger sheets in the same shape are enough. This template starts with two tables, customers and activity history.",
    steps: [
      "Create a new spreadsheet with three sheets, named exactly as shown below (the kit reads the Japanese names).",
      "Press Copy below, select cell A1 of each sheet, and paste. The values split into columns.",
      "Edit the definition rows to match your columns, add the same headers to row 1 of the ledger sheets, and check with `npm run check`.",
    ],
    note: "Column order doesn’t matter as long as the header names match. Leading or trailing spaces and full-width vs. half-width characters are treated as the same header. Every ledger sheet needs the four system columns shown (ID, created, updated, updated by); the server fills them in for rows the AI adds. Types include text, long text, number, amount, date, choice, checkbox, email, phone, and references to another table.",
    sheets: ["sheet: column rules", "sheet: header row", "sheet: header row"],
    copy: "Copy",
    copied: "Copied",
    scroll: "Scroll the table sideways",
  },
  setupHeading: "Getting started",
  steps: [
    {
      title: "Try it with sample data (5 minutes)",
      text: "Add one line to your Claude Desktop settings to try it with the same data as this demo, before setting anything up on Google (`MCP_DEMO=1`).",
    },
    {
      title: "Google setup (about 15 minutes)",
      text: "Create a service account, share the spreadsheet with it, and put the spreadsheet URL in `.env`. `npm run check` verifies the connection and the header layout.",
    },
    {
      title: "Connect your AI app",
      text: "Claude Desktop, Claude Code, and Cursor work directly on your computer. For ChatGPT and claude.ai connectors, expose the HTTP endpoint through Cloudflare Tunnel. The HTTP endpoint refuses requests without a shared secret.",
    },
  ],
  connect: {
    caption: "Clients and how they connect",
    cols: ["Client", "Connection"],
    rows: [
      ["Claude Desktop, Claude Code, Cursor", "stdio (runs on your computer as is; no https:// URL needed)"],
      ["ChatGPT, claude.ai", "HTTP (needs an https:// URL reachable from outside, e.g. via Cloudflare Tunnel)"],
    ],
  },
  snippets: ["The line to add to Claude Desktop’s settings (claude_desktop_config.json)", "The two lines for .env", "Check the connection and headers"],
  trouble: [
    {
      heading: "Creating the key in Google Cloud",
      intro: "The same steps as chapter 4 of the guide. Labels may differ slightly between versions of the Google Cloud console; choose the closest item.",
      items: [
        "Open the Google Cloud console and create a project from the project picker at the top (“New project”).",
        "Under “APIs & Services” → “Library”, find “Google Sheets API” and press “Enable”.",
        "Under “IAM & Admin” → “Service accounts” → “Create service account”, enter just a name and press “Done” (no role needed).",
        "Open the account, then “Keys” → “Add key” → “Create new key” → “JSON” → “Create”. Rename the downloaded JSON to service-account.json and put it in the kit folder.",
        "In the spreadsheet’s “Share” dialog, add the client_email from the JSON. Choose “Viewer” for read-only, or “Editor” if you use writes.",
      ],
      after: "Share only the spreadsheets this kit uses; no access to the whole Drive is needed. If a company Google Workspace says service account key creation is disabled, ask your administrator for an exception for this project only.",
    },
    {
      heading: "When the tools don’t appear in Claude Desktop",
      intro: "If “sheets” doesn’t show under the “+” in the input box after you add the settings and reopen the app, check these in order.",
      items: [
        "If the file opened from “Settings” → “Developer” → “Edit config” already has other settings, add yours inside the outermost { } (with a “,” after the previous item).",
        "For command, write the exact path printed by which node (where node on Windows) in a terminal. Plain node may not be found.",
        "For args, write the path to dist/stdio.js in the kit folder. On Windows, double each backslash.",
        "If the \"env\": { \"MCP_DEMO\": \"1\" } from the sample is still there, remove it (otherwise it keeps running on sample data).",
        "Quit Claude Desktop completely, reopen it, and check the tool list under the “+” in the input box.",
      ],
      after: "If they still don’t appear, look at the last few lines of the log (on macOS, ~/Library/Logs/Claude/mcp-server-sheets.log). Send them with the output of npm run check through the download page, and we’ll check what we can.",
    },
  ],
  paid: {
    heading: "What the free kit doesn’t do, and the paid kits",
    intro: "This server searches and updates your ledgers from a conversation. It does not create bookings, notify customers, or send LINE messages. The kits below handle that, and this server can read the same spreadsheets.",
    adds: [
      "A booking page with confirmation emails and Google Calendar entries. Customers can book without a Google account.",
      "List and entry screens built from the definition sheet, with LINE, Slack, and Discord notifications for new and updated rows. It is the very ledger this server reads.",
      "The Booking Page, Form Intake, Spreadsheet Business App, and Deadline Alert kits together. Choose the set on each kit’s BOOTH page.",
    ],
    setName: "Set of four",
    setTotal: (total) => `${total} if bought separately`,
    see: "See details",
    tax: "tax included, one-time purchase",
  },
  buyHeading: "Download and setup service",
  buy: "The MCP Server Kit is free: TypeScript source, built files, a guide, sample settings, and sample-data CSVs in a single zip, available on BOOTH or note (in Japanese).",
  service: "Setup can also be done for you, from preparing the service account to connecting Claude Desktop or ChatGPT and configuring a named Cloudflare tunnel. Rates are on our pricing page.",
  contact: "Pricing and how it works",
};

const fr: McpCopy = {
  meta: {
    title: "Un MCP Google Sheets qui fait respecter vos règles | Clients, réservations et factures, lus et modifiés en sécurité depuis Claude ou ChatGPT (Kit de serveur MCP, gratuit)",
    description: "Un serveur MCP qui permet à Claude ou ChatGPT de rechercher et mettre à jour les registres de clients, de réservations et de factures dans Google Sheets. Les écritures qui ne respectent pas les types, champs obligatoires ou choix de votre feuille de définition sont bloquées, et une ligne modifiée par quelqu’un d’autre n’est jamais écrasée. Gratuit, sources TypeScript incluses. La démo rejoue un échange enregistré.",
  },
  name: "Kit de serveur MCP (gratuit)",
  title: "Un MCP Google Sheets qui fait respecter vos règles",
  lede: "Un MCP Sheets généraliste laisse l’IA écrire n’importe quoi dans n’importe quelle colonne. Ce serveur lit les types, champs obligatoires et choix de votre feuille de définition et fait arrêter l’IA quand une écriture ne les respecte pas. Une ligne modifiée par quelqu’un d’autre n’est jamais écrasée, et tout est en lecture seule par défaut.",
  offer: {
    free: "Gratuit",
    freeNote: "Un zip, sources TypeScript incluses",
    get: "Le récupérer gratuitement sur BOOTH",
    read: "Lire le guide sur note",
    barGet: "Récupérer",
    barRead: "Guide",
    toPaid: "Ce que la version gratuite ne fait pas (kits payants)",
    toTemplate: "Utiliser votre propre tableur (modèle)",
    license: "Vous pouvez l’intégrer aux projets de vos clients (redistribuer ou vendre le kit lui-même est interdit).",
  },
  replayHeading: "Rejeu de la conversation",
  replay: "Voici le rejeu d’un échange enregistré, en japonais ; toutes les données sont fictives. Le kit a tourné sur des données d’exemple, et les outils appelés via la même connexion que les applications IA (stdio), ainsi que leurs résultats, sont affichés tels quels. Le texte des réponses est un exemple rédigé à partir de ces résultats.",
  proof: [
    { figure: "204", label: "Tests automatisés, exécutés sur un tableur en mémoire sans toucher à Google (1.0.2)." },
    { figure: "0 ¥", label: "Coût mensuel du serveur. Il tourne sur votre ordinateur ou votre serveur, et l’API Google Sheets est gratuite." },
    { figure: "0 ligne", label: "Lignes que l’IA peut supprimer. Il n’y a pas d’outil de suppression ; une colonne de statut est mise à jour à la place." },
    { figure: "20", label: "Écritures autorisées par minute. Chaque écriture porte sur une seule ligne, et tout est en lecture seule par défaut." },
  ],
  audience: {
    fits: [
      "Êtes une agence ou un indépendant qui améliore les processus des petites entreprises (vous pouvez l’intégrer aux projets de vos clients)",
      "Utilisez Claude Desktop, Claude Code ou Cursor au quotidien et tenez vos registres de clients ou de réservations dans Google Sheets",
      "Gérez l’informatique interne et voulez bloquer les écritures de l’IA par des règles de type et de champs obligatoires",
      "N’avez pas le temps de le connecter vous-même (l’installation peut être faite pour vous ; voir « Téléchargement et installation » en bas de page)",
    ],
    notFor: [
      "Voulez que l’IA crée des réservations ou envoie des notifications aux clients (ce serveur ne le fait pas ; voir « Ce que la version gratuite ne fait pas » plus bas)",
      "Voulez que l’IA supprime des lignes ou modifie librement des feuilles entières (nous recommandons le serveur généraliste comparé plus bas)",
      "Tenez vos registres uniquement dans des fichiers Excel et ne pouvez pas passer à Google Sheets",
      "N’avez jamais utilisé de terminal et personne en interne pour vous aider (confiez-nous l’installation, ou utilisez plutôt les écrans des kits payants)",
    ],
  },
  compare: {
    rows: [
      {
        kind: "Outil gratuit",
        name: "mcp-google-sheets (open source sur GitHub)",
        href: SOURCES.oss,
        cost: "0 ¥",
        note: "Un serveur généraliste très utilisé, qui lit et écrit largement dans les feuilles. Il n’a pas de règles sur ce qui va dans quelle colonne : si vous voulez une édition libre, il suffit.",
      },
      {
        kind: "Fonction intégrée",
        name: "Serveur MCP Sheets distant de Google",
        href: SOURCES.google,
        cost: "0 ¥ (en préversion)",
        note: "Le serveur officiel de Google. Il lit et écrit largement dans les feuilles, sans vérifier les types ni les champs obligatoires avant une écriture.",
      },
      {
        kind: "Service similaire",
        name: "Zapier MCP",
        href: SOURCES.zapier,
        cost: "Offre gratuite plafonnée en appels par mois ; forfaits payants Zapier au-delà",
        note: "Relie l’IA à de nombreux services, dont Google Sheets. Vos données passent par Zapier.",
      },
    ],
    kit: "Vérifie les types, champs obligatoires et choix de votre feuille de définition avant d’écrire, et s’arrête en donnant la raison quand une valeur ne convient pas. N’écrase jamais une ligne modifiée par quelqu’un d’autre et ne supprime jamais de ligne. Le serveur tourne chez vous, et vos données ne passent par aucun service relais.",
    checkedOn: CHECKED_ON,
    kitCost: "0 ¥ (gratuit, un zip)",
  },
  howHeading: "Fonctionnement",
  how: [
    "L’IA n’ouvre jamais le tableur directement. Elle appelle les outils fournis par ce serveur (rechercher, lire, ajouter…), et le serveur lit et écrit via l’API Google Sheets. Les identifiants Google et l’abonnement IA sont les vôtres, et vos données ne quittent jamais le tableur. Pas de frais de serveur mensuels non plus.",
    "Les outils d’écriture ne sont visibles par l’IA que si vous réglez `MCP_WRITE=true`. Par défaut, tout est en lecture seule. L’écriture se fait une ligne à la fois, et les applications IA comme Claude Desktop demandent votre autorisation avant chaque exécution.",
  ],
  notHeading: "Ce qu’il ne fait pas",
  not: [
    "Il ne supprime jamais de ligne ; il met à jour une colonne de statut à la place.",
    "Il ne crée pas de réservation et ne propose pas de créneaux libres (il peut seulement consulter et annuler).",
    "Les modifications faites via l’IA ne déclenchent ni les notifications, ni les e-mails, ni la mise à jour de Google Agenda prévus par les kits. Si vous annulez une réservation ainsi, prévenez le client et supprimez vous-même l’événement de l’agenda.",
    "Les identifiants utilisateur LINE, l’adresse e-mail de l’auteur d’une modification et les clés d’annulation des réservations ne sont jamais transmis à l’IA.",
    "Les écritures sont limitées à 20 par minute ; au-delà, les appels sont bloqués.",
  ],
  template: {
    heading: "Utiliser votre propre tableur (modèle : définition et deux tables)",
    intro: "Le kit d’application métier n’est pas nécessaire : une feuille de définition et des feuilles de registre de même forme suffisent. Ce modèle commence avec deux tables, clients et historique des échanges.",
    steps: [
      "Créez un tableur avec trois feuilles, nommées exactement comme ci-dessous (le kit lit les noms japonais).",
      "Appuyez sur Copier ci-dessous, sélectionnez la cellule A1 de chaque feuille et collez. Les valeurs se répartissent en colonnes.",
      "Adaptez les lignes de définition à vos colonnes, ajoutez les mêmes en-têtes à la ligne 1 des feuilles de registre, puis vérifiez avec `npm run check`.",
    ],
    note: "L’ordre des colonnes n’a pas d’importance tant que les noms d’en-tête correspondent. Les espaces en début ou fin et la différence pleine chasse / demi-chasse sont ignorés. Chaque feuille de registre doit garder les quatre colonnes système indiquées (identifiant, création, mise à jour, auteur de la mise à jour) ; le serveur les remplit pour les lignes ajoutées par l’IA. Types possibles : texte, texte long, nombre, montant, date, choix, case à cocher, e-mail, téléphone, référence à une autre table, etc.",
    sheets: ["feuille : règles des colonnes", "feuille : ligne d’en-tête", "feuille : ligne d’en-tête"],
    copy: "Copier",
    copied: "Copié",
    scroll: "Faites défiler le tableau horizontalement",
  },
  setupHeading: "Pour commencer",
  steps: [
    {
      title: "Essayer avec les données d’exemple (5 minutes)",
      text: "Ajoutez une ligne aux réglages de Claude Desktop pour l’essayer avec les mêmes données que cette démo, avant toute préparation côté Google (`MCP_DEMO=1`).",
    },
    {
      title: "Configuration côté Google (environ 15 minutes)",
      text: "Créez un compte de service, partagez le tableur avec lui et indiquez l’URL du tableur dans `.env`. `npm run check` vérifie la connexion et la disposition des en-têtes.",
    },
    {
      title: "Connecter votre application IA",
      text: "Claude Desktop, Claude Code et Cursor fonctionnent directement sur votre ordinateur. Pour les connecteurs ChatGPT et claude.ai, exposez le point d’accès HTTP via Cloudflare Tunnel. Ce point d’accès refuse toute requête sans secret partagé.",
    },
  ],
  connect: {
    caption: "Clients et mode de connexion",
    cols: ["Client", "Connexion"],
    rows: [
      ["Claude Desktop, Claude Code, Cursor", "stdio (tourne tel quel sur votre ordinateur ; pas d’URL https:// nécessaire)"],
      ["ChatGPT, claude.ai", "HTTP (nécessite une URL https:// joignable de l’extérieur, par exemple via Cloudflare Tunnel)"],
    ],
  },
  snippets: ["La ligne à ajouter aux réglages de Claude Desktop (claude_desktop_config.json)", "Les deux lignes du fichier .env", "Vérifier la connexion et les en-têtes"],
  trouble: [
    {
      heading: "Créer la clé dans Google Cloud",
      intro: "Les mêmes étapes que le chapitre 4 du guide. Les libellés peuvent varier légèrement selon la version de la console Google Cloud ; choisissez l’élément le plus proche.",
      items: [
        "Ouvrez la console Google Cloud et créez un projet depuis le sélecteur de projet en haut (« Nouveau projet »).",
        "Dans « API et services » → « Bibliothèque », cherchez « Google Sheets API » et appuyez sur « Activer ».",
        "Dans « IAM et administration » → « Comptes de service » → « Créer un compte de service », saisissez seulement un nom et appuyez sur « OK » (aucun rôle nécessaire).",
        "Ouvrez le compte, puis « Clés » → « Ajouter une clé » → « Créer une clé » → « JSON » → « Créer ». Renommez le JSON téléchargé en service-account.json et placez-le dans le dossier du kit.",
        "Dans le partage du tableur, ajoutez le client_email du JSON. Choisissez « Lecteur » pour la lecture seule, ou « Éditeur » si vous utilisez l’écriture.",
      ],
      after: "Ne partagez que les tableurs utilisés par ce kit ; aucun accès à tout le Drive n’est nécessaire. Si un Google Workspace d’entreprise indique que la création de clés de compte de service est désactivée, demandez à votre administrateur une exception pour ce projet uniquement.",
    },
    {
      heading: "Quand les outils n’apparaissent pas dans Claude Desktop",
      intro: "Si « sheets » n’apparaît pas sous le « + » de la zone de saisie après avoir ajouté les réglages et rouvert l’application, vérifiez dans cet ordre.",
      items: [
        "Si le fichier ouvert via « Réglages » → « Développeur » → « Modifier la configuration » contient déjà d’autres réglages, ajoutez les vôtres dans les { } les plus extérieures (avec une « , » après l’élément précédent).",
        "Pour command, écrivez le chemin exact affiché par which node (where node sous Windows) dans un terminal. node seul peut ne pas être trouvé.",
        "Pour args, écrivez le chemin de dist/stdio.js dans le dossier du kit. Sous Windows, doublez chaque barre oblique inverse.",
        "Si le \"env\": { \"MCP_DEMO\": \"1\" } de l’essai est encore là, supprimez-le (sinon il continue sur les données d’exemple).",
        "Quittez complètement Claude Desktop, rouvrez-le et vérifiez la liste des outils sous le « + » de la zone de saisie.",
      ],
      after: "S’ils n’apparaissent toujours pas, regardez les dernières lignes du journal (sous macOS, ~/Library/Logs/Claude/mcp-server-sheets.log). Envoyez-les avec la sortie de npm run check via la page de téléchargement, et nous vérifierons ce que nous pouvons.",
    },
  ],
  paid: {
    heading: "Ce que la version gratuite ne fait pas, et les kits payants",
    intro: "Ce serveur recherche et met à jour vos registres depuis une conversation. Il ne crée pas de réservation, ne prévient pas les clients et n’envoie rien sur LINE. Les kits ci-dessous s’en chargent, et ce serveur peut lire les mêmes tableurs.",
    adds: [
      "Une page de réservation, avec e-mails de confirmation et ajout à Google Agenda. Les clients réservent sans compte Google.",
      "Des écrans de liste et de saisie construits à partir de la feuille de définition, avec notifications LINE, Slack et Discord pour les ajouts et mises à jour. C’est le registre même que lit ce serveur.",
      "Les kits Page de réservation, Réception de formulaires, Application métier sur tableur et Alertes d’échéances ensemble. Le lot se choisit sur la page BOOTH de chaque kit.",
    ],
    setName: "Lot de quatre",
    setTotal: (total) => `${total} si achetés séparément`,
    see: "Voir le détail",
    tax: "TTC, achat unique",
  },
  buyHeading: "Téléchargement et installation",
  buy: "Le Kit de serveur MCP est gratuit : sources TypeScript, fichiers compilés, guide, réglages d’exemple et CSV de données d’exemple dans un seul zip, disponible sur BOOTH ou note (en japonais).",
  service: "L’installation peut aussi être faite pour vous : de la préparation du compte de service à la connexion à Claude Desktop ou ChatGPT et à la configuration d’un tunnel Cloudflare nommé. Les tarifs sont sur notre page dédiée.",
  contact: "Tarifs et déroulement",
};

export const copy: Record<"ja" | "en" | "fr", McpCopy> = { ja, en, fr };
