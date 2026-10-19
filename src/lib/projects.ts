import { demoHref, demos } from "./demos";
import { priceNow, shortDate, yen } from "./prices";

/**
 * 分類。トップの入口 3 行と、その先の一覧ページが同じ名前を使う。
 *
 *   kits  … 売っているキットとテンプレ（/kits）
 *   sites … 架空の会社で作った見本（/sites）
 *   works … 触って確かめられる作品と道具（/works）
 *
 * トップは 2026-09-21 に「入口 3 行 ＋ いま見てほしいもの 4 点」へ組み直した。
 * 全件はこの分類ごとのページに移したので、トップは分類の名と件数しか持たない。
 */
export type Category = "kits" | "sites" | "works";

/**
 * 売り物の状態。**値段と状態の出どころはここ一箇所だけ**で、
 * 発売・値上げのときに直すのもここだけ。
 *
 * price は**定価**を持つ（発売記念の期間でも定価のまま）── 期限つきの数字を
 * ここに置くと、期間が終わった日から古い値が残りつづけるからである。
 * 発売記念の価格は日付つきで src/lib/prices.ts の表が持ち、一覧の札は
 * saleLabel(sale, { slug }) が日付を見て「いま払う値段」を出す（期間中は
 * 「発売記念 ¥9,800（10/2 まで・定価 ¥12,800）」、翌日 00:00 からは「発売中 ¥12,800」）。
 * 値上げの日にここを直す必要はない。
 * 発売前のものは、定価が決まっていれば持ってよいが、一覧には出さない
 * （saleLabel は発売前なら「発売前」とだけ書く）── 発売の日に status を
 * 替えるだけで済むようにするため。値が決まっていないものは持たせない。
 */
export type Sale = {
  /** free は無料で配っている見本（値段を持たない。一覧と作品ページの頭は「無料の見本」） */
  status: "onsale" | "upcoming" | "free";
  /** 税込の定価（円）。発売中のものと、定価の決まった発売前のものが持つ */
  price?: number;
  /**
   * 発売の予定日（「10/2」の形）。発売前で日が決まっているものだけが持つ。
   * 一覧には出さず（一覧は「発売前」とだけ書く）、作品ページの頭でだけ
   * saleLabel(sale, { detail: true }) が「10/2 発売予定 ¥9,800」と書く。
   */
  launch?: string;
  /**
   * 設置代行の値段（**税別**・円・「から」）。品物のページの「設置込みの値段」（kit-parts.tsx の KitPricing）は
   * これとキットの値段から総額を組む。媒体（BOOTH・note・ココナラ）の設置代行の値段はこれに寄せる（2026-10-20）。
   * 額は /contact の品書き（SERVICES）と同じ出どころで、ここで新しい額を作らない。
   */
  service?: { price: number };
};

export type Project = {
  slug: string;
  title: string;
  /** 一覧の一行。長くても 2 行に収まる長さで書く（40 字前後まで） */
  description: string;
  tags: string[];
  category: Category;
  /**
   * もう一つ属する分類。売り物であると同時に、この紙の上で誰でも無料で
   * 使える道具でもある行だけが持つ（見積もり電卓）。
   * 件数も一覧も、主の分類と同じようにここを数える。
   */
  alsoIn?: Category;
  /** 売り物のときだけ持つ。一覧には「発売中 ¥2,980」か「発売前」が小の字で出る */
  sale?: Sale;
  /**
   * 一覧から飛ぶ先。無ければ /projects/<slug>。
   * 作品ページを持たない行は、ここに同じ名義の note の記事か、
   * 中身を並べた分類のページを書く。
   */
  href?: string;
  /**
   * 一覧と件数に出さない（ページと sitemap には残す）。売り場の道から外したいものだけが持つ。
   * 30 日の帳面は発注者に「誰からも買われていない・AI 任せ」と読まれるので、note からだけ結ぶ（2026-10-15 監査 改善 5）
   */
  unlisted?: boolean;
};

/**
 * トップの入口 3 行。
 *
 * 1 行 = 英字の見出し + 日本語の 1 行 + 件数で、飛び先は分類のページ。
 * 件数は手で書かずレジストリから数える（countLabel）── 品物を足したときに
 * 数だけが古くなる、という壊れ方を作らないため。
 */
export type Gate = {
  id: Category;
  /** 英字の見出し */
  label: string;
  /** 日本語の 1 行 */
  lead: string;
  href: string;
};

export const GATES: readonly Gate[] = [
  {
    id: "kits",
    label: "Kits",
    lead: "買えるキットとテンプレート",
    href: "/kits",
  },
  { id: "sites", label: "Sites", lead: "業種別の見本サイト", href: "/sites" },
  {
    id: "works",
    label: "Works",
    lead: "作品と道具",
    href: "/works",
  },
];

/**
 * 分類のページの頭。作品ページと同じ料紙の文法（戻り・題・一行）で組む。
 * 題は日本語、その下に英字を一行 ── 入口 3 行の英字と同じ字を置くことだけが、
 * トップの行とこのページを結ぶ手がかりになる。
 */
export type IndexPage = {
  title: string;
  latin: string;
  lede: string;
};

export const INDEX_PAGES: Record<Category, IndexPage> = {
  kits: {
    title: "キットとテンプレート",
    latin: "Kits",
    lede: "業務自動化・AI活用・Web制作の三つの棚に、買い切りのキットとテンプレートを並べています。お値段は税込で、月額のサービス料はかかりません。迷ったときは、期限アラート・フォーム受付・予約ページの 3 本からご覧ください。",
  },
  sites: {
    title: "見本サイト",
    latin: "Sites",
    lede: "どれも架空の会社で作った見本です。業種別 LP テンプレ パックの中身でもあります。",
  },
  works: {
    title: "作品と道具",
    latin: "Works",
    lede: "その場で触って確かめられる作品と道具です。",
  },
};

/** 制作のご相談の紙（/contact）の頭。分類のページと同じ三点で組む */
export const CONTACT_PAGE: IndexPage = {
  title: "頼み方と料金",
  latin: "Contact",
  lede: "会社・事務所の事務の自動化（Google スプレッドシート・Gmail・LINE）、キットの設置、1 か所の修正をお引き受けします。サイト・LP の制作もご相談ください。3 営業日以内に返信します。",
};

/**
 * 頼み方と目安の階段（/contact、日本語の紙だけ。2026-10-15 監査 改善 4、持ち主の承認済み）。
 * 同じページの中で 10 倍ちがう値段（キット ¥2,980 と設置 30,000 円）の差を、頼み方の違いとして見せる。
 * 値段は既存の出品と受託メニューの値で、ここで新しい額を作らない。
 */
export const PRICE_LADDER: { how: string; price: string; who: string }[] = [
  { how: "キットを買ってご自身で入れる", price: "¥2,980〜19,800（税込）", who: "手順書を見ながら、ご自身で貼り付けと設定ができる方" },
  { how: "1 か所の修正・Excel や VBA の直し", price: "5,000 円〜", who: "今あるものを少し直したい方" },
  { how: "キットの設置をお任せ", price: "30,000 円〜", who: "貼り付けと設定ごと任せたい方" },
  { how: "個別の自動化・AI の組み込み", price: "40,000 円〜", who: "表や業務に合わせて作りたい方" },
  { how: "LP・サイトの制作", price: "150,000 円〜", who: "文言・構成から任せたい方" },
];

/** よくあるご質問（/contact、日本語の紙だけ）。インボイスの登録番号は無い（登録すると公表サイトで本名が引ける）。答えは /about と同じ文に */
export const CONTACT_FAQ: { q: string; a: string }[] = [
  { q: "お支払いの方法は？", a: "銀行振込か請求書払いでお受けします。" },
  {
    q: "インボイス（適格請求書）は出せますか？",
    a: "適格請求書（インボイス）の登録番号はありません。請求書は税込の額でお出しします。",
  },
  { q: "秘密保持の契約は結べますか？", a: "ご相談に応じます。必要なときは、最初のご連絡でお知らせください。" },
  { q: "修正は何回までできますか？", a: "修正の回数は、お見積もりに明記します。" },
  { q: "ココナラ・ランサーズ・クラウドワークスを通して頼めますか？", a: "はい。ココナラ・ランサーズ・クラウドワークスのどれからでもお受けします。" },
];

/** 埋め込み部品の設置。頼み方の階段（PRICE_LADDER）に無い頼み方なので、/contact では階段の下に一行で添える */
export const EMBED_SERVICE = {
  title: "埋め込み部品の設置（AI 案内窓口・間取り・3D の商品ページ）",
  price: "60,000 円から",
};

/**
 * 制作のご相談（/contact）に出す品書き。頼みやすい順（安い順）に並べる（2026-10-17 監査 marketing 8）。
 *
 * 数字の出どころは公開済みの受託メニュー（concierge/content/services.md）と PRICE_LADDER で、
 * そこに書いていない額は**足さない**。WebGL の演出は品書きから外した（作品は /works に残る）。
 */
export const SERVICES: { title: string; price: string }[] = [
  { title: "1 か所の修正（Excel・VBA・フォーム・GAS）", price: "5,000 円から" },
  { title: "キットの設置をお任せ", price: "30,000 円から" },
  { title: "個別の自動化・AI の組み込み", price: "40,000 円から" },
  EMBED_SERVICE,
  { title: "サイト・LP の制作", price: "1 ページの LP は 150,000 円から" },
];

/**
 * 品書きの短い版（3 行）。頼まれることの多い 3 つに絞る。額は SERVICES と同じ出どころ。
 * 英仏のトップ（前の組み方のまま）が読む。
 */
export const SERVICES_BRIEF: { title: string; price: string }[] = SERVICES.slice(0, 3);

/** 進め方。3 段だけ書く（出どころは同じく公開済みの受託メニュー） */
export const STEPS: { title: string; detail: string }[] = [
  { title: "ご相談", detail: "目的と現在の状況をメールで伺います" },
  { title: "お見積もり", detail: "範囲・納期・金額を書面でお出しします" },
  {
    title: "制作と納品",
    detail: "途中経過を画面でお見せしながら進め、使い方の説明書を添えてお渡しします",
  },
];

/** 品書きの結びの一行。宛先は文の中に置き、そこだけがリンクになる */
export const SERVICES_NOTE = {
  before: "料金は税別の目安です。ご依頼とご相談は ",
  mail: "hello@suminawa.dev",
  after: " へ",
};

/**
 * suminawa のほかの置き場（各サービスのプロフィールからも、ここ suminawa.dev へ戻れるようにしてある。2026-10-02）。
 * 載せるのは suminawa 名義の公開の場だけ。受発注の場（ココナラ・Lancers など）は各ページの「設定・設置のご依頼」から飛ぶ
 */
export const ELSEWHERE: { name: string; href: string }[] = [
  { name: "note", href: "https://note.com/suminawa" },
  { name: "BOOTH", href: "https://suminawa.booth.pm" },
  { name: "YouTube", href: "https://www.youtube.com/@suminawa" },
  { name: "X", href: "https://x.com/suminawa_dev" },
  { name: "Zenn", href: "https://zenn.dev/suminawa" },
  { name: "LINE", href: "https://lin.ee/X789LxT" },
];

/** 見本はレジストリ（demos.ts）から写す。一覧では作品と同じ行として扱う */
const siteProjects: Project[] = demos.map((demo) => ({
  slug: demo.slug,
  title: demo.title,
  description: demo.description,
  tags: demo.tags,
  category: "sites",
  href: demoHref(demo),
}));

export const projects: Project[] = [
  /* ---- kits ── 売っているもの ------------------------------------------
     発売中を先に、発売前を後に。飛び先は作品ページ（購入の導線は作品ページの
     結びにある）。2026-10-04 から、すべての売り物が作品ページを持つ。 */
  {
    slug: "quote-simulator",
    title: "見積もり電卓テンプレ",
    description: "条件を入れると、見積もりの内訳と合計がその場で出ます。",
    tags: ["JavaScript", "React", "TypeScript"],
    category: "kits",
    // この紙の上では誰でも無料で使えるので、道具の一覧にも並ぶ
    alsoIn: "works",
    sale: { status: "onsale", price: 2980 },
  },
  {
    slug: "deadline",
    title: "期限アラート GAS キット",
    description: "シートに書いた期限を、毎朝 1 通にまとめてお知らせします。",
    tags: ["Google Apps Script"],
    category: "kits",
    sale: { status: "onsale", price: 2980, service: { price: 30000 } },
  },
  {
    slug: "form",
    title: "フォーム受付 GAS キット",
    description: "サイトの問い合わせを表に貯め、通知と自動返信まで行います。",
    tags: ["Google Apps Script"],
    category: "kits",
    sale: { status: "onsale", price: 3480, service: { price: 30000 } },
  },
  {
    slug: "floorplan",
    title: "間取りシミュレーター",
    description: "マス目を塗って間取りを描き、家具を置いて 3D で確かめられます。",
    tags: ["React Three Fiber", "TypeScript"],
    category: "kits",
    sale: { status: "onsale", price: 9800 },
  },
  {
    slug: "lp-pack",
    title: "業種別 LP テンプレ パック",
    description: "見本サイト 6 本の一式です。文言と色を差し替えて使えます。",
    tags: ["Next.js", "TypeScript"],
    category: "kits",
    // 中身は見本サイトそのもの。作品ページから 6 本と /sites へ渡す
    sale: { status: "onsale", price: 6980 },
  },
  {
    slug: "ai-concierge",
    title: "AI 案内窓口キット",
    description: "自社の文書だけを根拠に、サイトの上で質問に答える窓を置けます。",
    tags: ["Claude API", "Next.js"],
    category: "kits",
    // 設置代行は /contact の品書きの「埋め込み部品の設置（AI 案内窓口・…）」（EMBED_SERVICE）と同じ額
    sale: { status: "onsale", price: 12800, service: { price: 60000 } },
  },
  {
    slug: "doc-reader",
    title: "AI 書類読み取りキット",
    description: "請求書や領収書を読み取り、確かめてから表に出せます。",
    tags: ["Claude API", "Next.js"],
    category: "kits",
    sale: { status: "onsale", price: 16800, service: { price: 30000 } },
  },
  {
    slug: "sheet-app",
    title: "スプレッドシート業務アプリ キット",
    description: "定義シートに列を書くと、一覧と登録の画面ができます。LINE にも知らせます。",
    tags: ["Google Apps Script", "LINE"],
    category: "kits",
    sale: { status: "onsale", price: 9800, service: { price: 30000 } },
  },
  {
    slug: "booking",
    title: "予約ページ キット",
    description: "シートに枠を書くと、その URL が予約ページになります。",
    tags: ["Google Apps Script"],
    category: "kits",
    sale: { status: "onsale", price: 7980, service: { price: 30000 } },
  },
  {
    slug: "inbox-triage",
    title: "AI 問い合わせ整理キット",
    description: "Gmail の問い合わせを AI が読み、分類と要約を表に、返信の案を下書きに残します。",
    tags: ["Google Apps Script", "Claude"],
    category: "kits",
    // 定価。発売記念の値と最終日は src/lib/prices.ts の表が持ち、一覧・トップ・作品ページの札はそこから出す
    sale: { status: "onsale", price: 5980, service: { price: 30000 } },
  },
  {
    slug: "line-concierge",
    title: "LINE 案内窓口キット",
    description: "LINE 公式アカウントに、自社の文書だけを根拠に答える窓口を置けます。",
    tags: ["Next.js", "TypeScript", "Claude"],
    category: "kits",
    // LINE の中で動くので動く見本は置けない。作品ページは中身と置き方を節で並べる（2026-10-04）
    // 設置代行は /contact の品書きの「個別の自動化・AI の組み込み」（AI活用の柱の受託の一行）と同じ額
    sale: { status: "onsale", price: 12800, service: { price: 60000 } },
  },
  {
    slug: "dashboard",
    title: "ダッシュボード キット",
    description: "表や CSV の数字を、設定だけで KPI とグラフの画面にできます。",
    tags: ["JavaScript", "SVG", "Google Apps Script"],
    category: "kits",
    // 設置代行は /contact の品書きの「キットの設置をお任せ」（業務自動化の柱の受託の一行）と同じ額
    sale: { status: "onsale", price: 9800, service: { price: 30000 } },
  },
  {
    slug: "configurator",
    title: "3D 商品コンフィギュレーター",
    description: "3D の商品を回しながら色や素材を選び、価格をその場で確かめられます。",
    tags: ["React Three Fiber", "glTF"],
    category: "kits",
    sale: { status: "onsale", price: 12800 },
  },
  {
    slug: "saas-starter",
    title: "SaaS スターター キット",
    description: "ログイン・組織・権限・課金がそろった、会員制サービスの土台です。",
    tags: ["Next.js", "TypeScript", "Supabase", "Stripe"],
    category: "kits",
    sale: { status: "onsale", price: 19800 },
  },
  {
    slug: "shopify-configurator",
    title: "Shopify 用 3D コンフィギュレーター",
    description: "Shopify の商品ページに 3D の選択を置けます。選んだ内容は注文に残ります。",
    tags: ["Three.js", "Shopify"],
    category: "kits",
    // 2026-09-30 発売。1 つの値段（記念価格なし）
    // 作品ページの見本は、3D 商品コンフィギュレーターの紙の「Shopify 版」の節と同じもの
    sale: { status: "onsale", price: 16800 },
  },
  {
    slug: "survey-analysis",
    title: "お客さまアンケート キット",
    description: "Google フォームで集めた声を、AI が「今週の 3 つ」にまとめます。",
    tags: ["GAS", "Google Forms", "Claude"],
    category: "kits",
    // 2026-10-01 発売。1 つの値段（記念価格なし）。スプレッドシートの中で動くので、作品ページに動く見本は置かない
    sale: { status: "onsale", price: 7980, service: { price: 30000 } },
  },
  {
    slug: "rag-eval-harness",
    title: "RAG 評価ハーネス",
    description: "AI 窓口の更新で答えが悪くなっていないか、同じ質問表で確かめられます。",
    tags: ["Node.js", "Claude", "CSV"],
    category: "kits",
    // 2026-10-04 発売。1 つの値段（記念価格なし）。手元の端末で動くので、作品ページは記録の再生の写しを置く
    // 設置代行は /contact の品書き「キットの設置をお任せ 30,000 円から」（2026-10-20）
    sale: { status: "onsale", price: 5980, service: { price: 30000 } },
  },
  {
    slug: "mcp-server",
    title: "MCP サーバー キット",
    description: "業務アプリ・予約・書類のシートを、Claude や ChatGPT から読み書きできます。",
    tags: ["MCP", "TypeScript", "Claude"],
    category: "kits",
    // 2026-09-30: 単体では売らず、無料の見本として BOOTH で配る。値段と予定日は持たない
    sale: { status: "free" },
  },

  /* ---- sites ── 架空の会社で作った見本 ---------------------------------- */
  ...siteProjects,

  /* ---- works ── 作品と道具 ---------------------------------------------- */
  {
    slug: "suminagashi",
    title: "墨流し — Suminagashi",
    // 4 点の欄（1280px の紙で 438px）に一行で収まる長さ。ここが一字でも
    // 長いと二行に割れ、2 × 2 の下の段だけが罫 1 本ぶん伸びる
    description: "藍と墨が渦を巻く GPU 流体の水盤。混ぜて保存できる。",
    tags: ["WebGL2", "GLSL", "TypeScript"],
    category: "works",
  },
  {
    slug: "tax-back",
    title: "税込からの逆算",
    description: "税込の価格から、請求書に書く税抜と消費税を出す。",
    tags: ["Next.js", "TypeScript"],
    category: "works",
  },
  {
    slug: "30days",
    title: "30日 — Thirty Days",
    description: "AI に全部やらせて 30 日。売上と時間を毎日書く公開の帳面。",
    tags: ["Next.js", "公開ログ"],
    category: "works",
    unlisted: true,
  },
];

export function projectHref(project: Project): string {
  return project.href ?? `/projects/${project.slug}`;
}

/**
 * その分類に並ぶもの。主の分類のものが先で、よそから添えるもの（alsoIn）は後ろ。
 * 借りてきた行を頭に置くと、その分類が何の場所なのかが一行目で崩れる。
 */
export function projectsByCategory(category: Category): Project[] {
  return [
    ...projects.filter((project) => project.category === category),
    ...projects.filter((project) => project.alsoIn === category),
  ].filter((project) => !project.unlisted);
}

/**
 * その分類の件数と、うち発売中の数（入口 3 行の件数はここから出す）。
 *
 * 発売中の数に借りてきた行（alsoIn）は入れない ── 道具として並べている行に
 * 値札は添えないので、数えてしまうと画面に出ている値札の数と食い違う。
 */
export function categoryCount(category: Category): {
  total: number;
  onsale: number;
} {
  return {
    total: projectsByCategory(category).length,
    onsale: projects.filter(
      (p) => p.category === category && p.sale?.status === "onsale",
    ).length,
  };
}

/**
 * 入口 3 行に添える件数。手で書かない ── 品物を足したときに
 * 数だけが古くなる、という壊れ方を作らないため。
 */
export function countLabel(category: Category): string {
  const { total, onsale } = categoryCount(category);
  return onsale > 0 ? `${total} 件　発売中 ${onsale} 件` : `${total} 件`;
}

/**
 * いま見てほしいもの。**並びはここ 1 か所**で、トップはこの順にそのまま組む。
 * 4 点に絞るのは、提案の URL から来た人がひと目で選べる数がそこまでだから。
 * 墨流しは外した（2026-10-15）。発注者の紙に作品は置かず、Works にだけ並べる。
 */
export const FEATURED: readonly string[] = ["deadline", "form", "booking"];

/**
 * 3 本セット（BOOTH の同じページのバリエーションで選べる。2026-10-16 から常設の値段で、期限も理由も付けない）。
 * 単品の合計は sale.price から数える（手で書かない）。
 */
export const KIT_SET = {
  name: "3 本セット",
  /** 一覧やトップで書くときの短い名（看板の 2 本を先に） */
  label: "予約ページ・フォーム受付・スプレッドシート業務アプリ",
  slugs: ["sheet-app", "booking", "form"] as const,
  /** 税込（円） */
  price: 12800,
};

/** 3 本セットに入る単品の定価の合計（税込・円） */
export function kitSetListTotal(): number {
  return KIT_SET.slugs.reduce((sum, slug) => {
    const price = projects.find((p) => p.slug === slug)?.sale?.price;
    if (price == null) throw new Error(`3 本セットの単品に定価が無い: ${slug}`);
    return sum + price;
  }, 0);
}

/**
 * 三つの柱（2026-10-17、持ち主の指示）。トップの 3 列・/kits の三つの棚・頭とフッターの案内が、同じ三つを使う。
 *
 *   automation … 業務自動化。看板 3 本（FEATURED）を先頭に、スプレッドシートで動く事務の道具
 *   ai         … AI活用。案内窓口・書類の読み取り・問い合わせの整理のように、役目を決めた AI の道具
 *   web        … Web制作・Webアプリ制作。LP のテンプレート・3D の部品・会員制サービスの土台
 *
 * 10/15 の監査の決め（主軸は中小企業の事務担当・看板 3 本）は、業務自動化の柱の中で保つ。
 * 「何でも AI で」とは書かない（AI の柱は仕事の決まった道具として見せる）。
 * 受託の一行の額は PRICE_LADDER と同じ出どころで、ここで新しい額を作らない。
 */
export type PillarId = "automation" | "ai" | "web";

export type Pillar = {
  id: PillarId;
  /** 柱の名（棚の題・トップの列の題） */
  name: string;
  /** 頭の案内に出す短い名 */
  short: string;
  /** 一行の説明（敬体） */
  lede: string;
  /** 棚に並ぶキット。並びもここで決める（看板 3 本は先頭） */
  slugs: readonly string[];
  /** トップの列に出す代表 2〜3 本と、その一行 */
  picks: readonly { slug: string; hook: string }[];
  /** 動く見本への道（柱ごとに 1 つ）。業務自動化はトップの中の見本（#demo） */
  demo: { label: string; href: string };
  /** 受託の一行（税別）。額は PRICE_LADDER と同じ */
  service: { label: string; price: string };
};

export const PILLARS: readonly Pillar[] = [
  {
    id: "automation",
    name: "業務自動化",
    short: "業務自動化",
    lede: "表に書けば、仕事が回る。期限の通知、問い合わせの受付、予約のページを、Google スプレッドシートの中で動かします。",
    slugs: ["deadline", "form", "booking", "sheet-app", "dashboard"],
    picks: [
      { slug: "deadline", hook: "期限を毎朝 1 通でお知らせします" },
      { slug: "form", hook: "受付を記録して、自動で返信します" },
      { slug: "booking", hook: "枠を書けば予約ページになります" },
    ],
    demo: { label: "期限アラートの動く見本", href: "#demo" },
    service: { label: "設置まで頼む", price: "30,000 円〜" },
  },
  {
    id: "ai",
    name: "AI活用",
    short: "AI活用",
    lede: "案内窓口、書類の読み取り、問い合わせの整理など、役目を決めた AI の道具です。自社の文書だけを根拠に答えます。",
    slugs: ["ai-concierge", "line-concierge", "doc-reader", "inbox-triage", "survey-analysis", "rag-eval-harness", "mcp-server"],
    picks: [
      { slug: "ai-concierge", hook: "自社の文書だけを根拠に答えます" },
      { slug: "doc-reader", hook: "請求書や領収書を表に写します" },
      { slug: "inbox-triage", hook: "問い合わせを分類し、返信の案を残します" },
    ],
    demo: { label: "書類読み取りの見本を試す", href: "/projects/doc-reader" },
    service: { label: "AI の組み込みを頼む", price: "40,000 円〜" },
  },
  {
    id: "web",
    name: "Web制作・Webアプリ制作",
    short: "Web制作",
    lede: "業種別の LP テンプレート、3D の商品ページ、会員制サービスの土台。見本サイト 6 本は、その場で触れます。",
    slugs: ["lp-pack", "saas-starter", "configurator", "shopify-configurator", "floorplan", "quote-simulator"],
    picks: [
      { slug: "lp-pack", hook: "見本サイト 6 本の一式です" },
      { slug: "configurator", hook: "3D の商品を回して、色と価格を選べます" },
      { slug: "saas-starter", hook: "ログイン・権限・課金がそろった土台です" },
    ],
    demo: { label: "見本サイト 6 本を見る", href: "/sites" },
    service: { label: "LP・サイトの制作を頼む", price: "150,000 円〜" },
  },
];

/** その柱に並ぶキット（柱の slugs の順）。登録に無い slug は落とさず、気づけるように投げる */
export function pillarKits(pillar: Pillar): Project[] {
  const by = new Map(projects.map((p) => [p.slug, p]));
  return pillar.slugs.map((slug) => {
    const project = by.get(slug);
    if (!project) throw new Error(`柱のキットが見つからない: ${pillar.id} ${slug}`);
    return project;
  });
}

/** そのキットの柱。キット以外（見本サイト・作品）は undefined */
export function pillarOf(slug: string): Pillar | undefined {
  return PILLARS.find((p) => p.slugs.includes(slug));
}

export function featuredProjects(): Project[] {
  const by = new Map(projects.map((project) => [project.slug, project]));
  return FEATURED.map((slug) => {
    const project = by.get(slug);
    if (!project) throw new Error(`いま見てほしいものが見つからない: ${slug}`);
    return project;
  });
}

/**
 * その行に添える図版（実画面の写し）の出どころ。無ければ null。
 *
 * 規則は **見た目そのものが中身であるものだけが図版を持つ**（2026-09-21）。
 *
 *   見本サイト 6 件 … 商品は「その見た目」そのもの。6 枚が並んで初めて
 *                     「業種ごとに違う紙が 6 枚ある」と言える
 *   墨流し          … 作品そのものが絵である
 *
 * 道具とキットは持たない。何をする道具かは【動き】にあり、静止した写しを
 * 196px に落としても、白い枠のなかで字が潰れるだけだった（見積もり電卓・
 * 予約ページ・AI 案内窓口・AI 書類読み取り・業務アプリの 5 件を実画面で確認）。
 * 役に立たない図版は、紙の罫を隠し、行の高さを字より先に決めてしまう。
 *
 * ＊ もとの規則は「自分のページを持つ行はすべて図版を持つ」だった。
 *   撮るスクリプト（scripts/shoot-hub.mjs）も同じ規則で対象を決める。
 */
const FIGURE_SLUGS: ReadonlySet<string> = new Set(["suminagashi"]);

export function projectFigure(project: Project): string | null {
  const href = projectHref(project);
  if (href.startsWith("/demos/") || FIGURE_SLUGS.has(project.slug)) {
    return `/hub/${project.slug}`;
  }
  return null;
}

/**
 * 売り物の状態を小の字の言葉にする。チップにも印にもしない ──
 * 朱は「決めた」ことの印なので、売っていることに朱は使わない。
 *
 * slug を渡すと、発売記念の期間中は記念の値・最終日・定価を書く（一覧の札はこちら）。
 * now はテスト用で、既定は呼んだ時刻。
 *
 * detail は作品ページの頭でだけ使う。発売前で予定日と定価の両方が決まって
 * いれば「10/2 発売予定 ¥9,800」と書く。一覧（detail なし）は「発売前」のまま ──
 * 予定日は動くことがあり、動いた日に一覧の全部の行を直すことになるため。
 */
export function saleLabel(
  sale: Sale,
  opts: { detail?: boolean; slug?: string; now?: Date } = {},
): string {
  if (sale.status === "free") return "無料の見本";
  if (sale.status === "onsale" && sale.price != null) {
    // slug があれば発売記念の表を引く。無ければ定価（表を引かない呼び方は定価だけを言う）
    const now = opts.slug ? priceNow(opts.slug, sale.price, opts.now) : { price: sale.price };
    if (now.intro) {
      return `発売記念 ${yen(now.price)}（${shortDate(now.intro.until)} まで・定価 ${yen(now.intro.list)}）`;
    }
    return `発売中 ${yen(now.price)}`;
  }
  if (opts.detail && sale.status === "upcoming" && sale.launch && sale.price != null) {
    return `${sale.launch} 発売予定 ${yen(sale.price)}`;
  }
  return "発売前";
}

/** 一覧の札。発売記念の表を引く（saleLabel に slug を渡すだけの近道） */
export function priceLabel(project: Project, now?: Date): string | null {
  if (!project.sale) return null;
  return saleLabel(project.sale, { slug: project.slug, now });
}
