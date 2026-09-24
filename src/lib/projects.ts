import links from "../data/links.json";

import { demoHref, demos } from "./demos";

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
 * price は**定価**を持つ（発売記念の期間でも定価を出す）── 期限つきの数字を
 * 一覧に置くと、期間が終わった日から古い値が残りつづけるからである。
 * 発売前のものは、定価が決まっていれば持ってよいが、一覧には出さない
 * （saleLabel は発売前なら「発売前」とだけ書く）── 発売の日に status を
 * 替えるだけで済むようにするため。値が決まっていないものは持たせない。
 */
export type Sale = {
  status: "onsale" | "upcoming";
  /** 税込の定価（円）。発売中のものと、定価の決まった発売前のものが持つ */
  price?: number;
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
    lead: "作品と道具、30 日の帳面",
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
    lede: "そのまま使えるキットとテンプレートです。発売中のものは定価を添えています。",
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
  title: "制作のご相談",
  latin: "Contact",
  lede: "サイト・LP の制作、業務の自動化、埋め込み部品の設置、WebGL の演出をお引き受けします。",
};

/**
 * 制作のご相談（/contact）に出す品書き。
 *
 * 数字の出どころは公開済みの受託メニュー（concierge/content/services.md）で、
 * そこに書いていない額は**足さない**。肩書き・経歴・実績の数はここに書かない ──
 * ここに置くのは品書きだけで、語るのは分類のページに並ぶ実物のほうである。
 */
export const SERVICES: { title: string; price: string }[] = [
  { title: "サイト・LP の制作", price: "1 ページの LP は 150,000 円から" },
  {
    title: "業務の自動化（Google Apps Script）",
    price: "既製キットの導入は 30,000 円、個別の開発は 40,000 円から",
  },
  {
    title: "埋め込み部品の設置（AI 案内窓口・間取り・3D の商品ページ）",
    price: "60,000 円から",
  },
  { title: "WebGL / GLSL の演出", price: "50,000 円から" },
];

/**
 * トップの結びに出す品書き（3 行）。
 *
 * 全部（4 行）を出すと、初めて来た人が一息で読める量を超える。
 * ここは「何を頼めて、いくらくらいからか」を 5 秒で言うための場所なので、
 * 頼まれることの多い 3 つだけに絞り、残りと進め方は /contact に置く。
 * 数字は上の SERVICES と同じ出どころ（公開済みの受託メニュー）で、
 * ここで新しい額を作らない ── 短くするのは語のほうだけである。
 */
export const SERVICES_BRIEF: { title: string; price: string }[] = [
  { title: "サイト・LP の制作", price: "1 ページの LP は 150,000 円から" },
  {
    title: "業務の自動化（Google Apps Script）",
    price: "既製キットの導入は 30,000 円から",
  },
  { title: "埋め込み部品の設置", price: "60,000 円から" },
];

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
     結びにある）。作品ページを持たない 2 本だけ、同じ名義の note の記事へ飛ばす。 */
  {
    slug: "quote-simulator",
    title: "見積もり電卓テンプレ",
    description: "条件を入れると、見積もりの内訳と合計がその場で出る電卓。",
    tags: ["Next.js", "TypeScript"],
    category: "kits",
    // この紙の上では誰でも無料で使えるので、道具の一覧にも並ぶ
    alsoIn: "works",
    sale: { status: "onsale", price: 2980 },
  },
  {
    slug: "deadline-alert",
    title: "期限アラート GAS キット",
    description: "シートに書いた期限を、毎朝 1 通にまとめて知らせる。",
    tags: ["Google Apps Script"],
    category: "kits",
    sale: { status: "onsale", price: 2980 },
    href: links.s2.note,
  },
  {
    slug: "form-intake",
    title: "フォーム受付 GAS キット",
    description: "問い合わせの受け口。シートに貯め、通知と自動返信まで。",
    tags: ["Google Apps Script"],
    category: "kits",
    sale: { status: "onsale", price: 3480 },
    href: links.s3.note,
  },
  {
    slug: "floorplan",
    title: "間取りシミュレーター",
    description: "マス目を塗って間取りを描き、家具を置いて 3D で見る。",
    tags: ["React Three Fiber", "TypeScript"],
    category: "kits",
    sale: { status: "onsale", price: 9800 },
  },
  {
    slug: "lp-pack",
    title: "業種別 LP テンプレ パック",
    description: "見本 6 本をひとまとめにしたもの。文言と色を替えて使う。",
    tags: ["Next.js", "TypeScript"],
    category: "kits",
    sale: { status: "onsale", price: 6980 },
    // 中身は見本サイトそのものなので、まず 6 本を見てもらう
    href: "/sites",
  },
  {
    slug: "ai-concierge",
    title: "AI 案内窓口キット",
    description: "自社の文書だけを根拠に、サイトの上で質問に答える。",
    tags: ["Claude API", "Next.js"],
    category: "kits",
    sale: { status: "onsale", price: 12800 },
  },
  {
    slug: "doc-reader",
    title: "AI 書類読み取りキット",
    description: "請求書や領収書を読み取り、確認してから表に出す。",
    tags: ["Claude API", "Next.js"],
    category: "kits",
    sale: { status: "onsale", price: 16800 },
  },
  {
    slug: "sheet-app",
    title: "スプレッドシート業務アプリ キット",
    description: "定義シートに列を書くと、一覧と登録の画面ができる。",
    tags: ["Google Apps Script"],
    category: "kits",
    sale: { status: "onsale", price: 9800 },
  },
  {
    slug: "booking",
    title: "予約ページ キット",
    description: "シートに枠を書くと、その URL が予約ページになる。",
    tags: ["Google Apps Script"],
    category: "kits",
    sale: { status: "onsale", price: 7980 },
  },
  {
    slug: "inbox-triage",
    title: "AI 問い合わせ整理キット",
    description: "Gmail の問い合わせを AI が読み、分類と要約を表に、返信案を下書きに。",
    tags: ["Google Apps Script", "Claude"],
    category: "kits",
    sale: { status: "onsale", price: 5980 },
    // 作品ページを持たない（見本を置けない）ので、note の販売記事へ直に
    href: links["inbox-triage"].note,
  },
  {
    slug: "line-concierge",
    title: "LINE 案内窓口キット",
    description: "LINE 公式アカウントに、自社の文書だけを根拠に敬体で答える窓口を置く。",
    tags: ["Next.js", "TypeScript", "Claude"],
    category: "kits",
    sale: { status: "onsale", price: 12800 },
    // 作品ページを持たない（LINE の中で動くので見本を置けない）。note の販売記事へ直に
    href: links["line-concierge"].note,
  },
  {
    slug: "dashboard",
    title: "ダッシュボード キット",
    description: "表や CSV の数字を、設定だけで KPI とグラフの画面にする。",
    tags: ["JavaScript", "SVG", "Google Apps Script"],
    category: "kits",
    sale: { status: "onsale", price: 9800 },
  },
  {
    slug: "configurator",
    title: "3D 商品コンフィギュレーター",
    description: "回しながら色や素材を選び、価格をその場で確かめる。",
    tags: ["React Three Fiber", "glTF"],
    category: "kits",
    sale: { status: "onsale", price: 12800 },
  },
  {
    slug: "saas-starter",
    title: "SaaS スターター キット",
    description: "ログイン・組織・権限・課金がそろった会員制サービスの土台。",
    tags: ["Next.js", "TypeScript", "Supabase", "Stripe"],
    category: "kits",
    sale: { status: "upcoming", price: 19800 },
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
  ];
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
 */
export const FEATURED: readonly string[] = [
  "ai-concierge",
  "doc-reader",
  "configurator",
  "suminagashi",
];

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

/** 3 桁ごとの区切り。Intl に頼らないので、どこで組んでも同じ字が出る */
function yen(price: number): string {
  return `¥${String(price).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

/**
 * 売り物の状態を小の字の言葉にする。チップにも印にもしない ──
 * 朱は「決めた」ことの印なので、売っていることに朱は使わない。
 */
export function saleLabel(sale: Sale): string {
  return sale.status === "onsale" && sale.price != null
    ? `発売中 ${yen(sale.price)}`
    : "発売前";
}
