import links from "../data/links.json";

import { demoHref, demos } from "./demos";

/**
 * ハブの段（たな）。並びはこの型の順ではなく SHELVES の配列が決める。
 *
 *   services … 承ります（頼めることと料金の目安。作品ではないので projects を持たない）
 *   kits     … 売っているもの
 *   sites    … 架空の会社で作った見本
 *   works    … 触って確かめられる作品と道具
 */
export type ShelfId = "services" | "kits" | "sites" | "works";

/** 作品が属せる段。承ります の段だけは作品を持たない */
export type ProjectCategory = Exclude<ShelfId, "services">;

/**
 * 売り物の状態。**値段と状態の出どころはここ一箇所だけ**で、
 * 発売・値上げのときに直すのもここだけ。price は発売中のものにだけ付ける
 * （発売前の定価はハブに出さない ── 出すと発売前に値が独り歩きする）。
 */
export type Sale = {
  status: "onsale" | "upcoming";
  /** 税込の売価（円）。発売中のものだけが持つ */
  price?: number;
};

export type Project = {
  slug: string;
  title: string;
  /** 目録の一行。長くても 2 行に収まる長さで書く（40 字前後まで） */
  description: string;
  tags: string[];
  category: ProjectCategory;
  /** 売り物のときだけ持つ。ハブには「発売中 ¥2,980」か「発売前」が小の字で出る */
  sale?: Sale;
  /**
   * ハブから飛ぶ先。無ければ /projects/<slug>。
   * 作品ページを持たない行は、ここに同じ名義の note の記事を書く。
   */
  href?: string;
};

/**
 * 段の並び。ハブはこの順に組まれ、名乗りの下の目次もこの順で出る。
 * lead は段の見出しの下に置く 1 行（敬体）── その段に並ぶものが何なのかを、
 * 一件ずつの説明に書かずにここで一度だけ言う。
 */
export const SHELVES: {
  id: ShelfId;
  /** 段の名。英字の見出しを持たない段（承ります）は label を日本語で持つ */
  label: string;
  lead?: string;
}[] = [
  { id: "services", label: "承ります" },
  {
    id: "kits",
    label: "KITS",
    lead: "そのまま使えるキットとテンプレです。",
  },
  {
    id: "sites",
    label: "SITES",
    lead: "どれも架空の会社で作った見本です。業種別 LP テンプレ パックの中身でもあります。",
  },
  {
    id: "works",
    label: "WORKS",
    lead: "その場で触って確かめられる作品と道具です。",
  },
];

/**
 * 承ります の段に出す品書き。
 *
 * 数字の出どころは公開済みの受託メニュー（concierge/content/services.md）で、
 * そこに書いていない額は**足さない**。肩書き・経歴・実績の数はここに書かない ──
 * この段に置くのは品書きだけで、語るのは下の段に並ぶ実物のほうである。
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

/** 承ります の結びの一行。宛先は文の中に置き、そこだけがリンクになる */
export const SERVICES_NOTE = {
  before: "料金は税別の目安です。ご依頼とご相談は ",
  mail: "hello@suminawa.dev",
  after: " へ",
};

/** 見本はレジストリ（demos.ts）から SITES の段へ写す。ハブは作品と同じ行として扱う */
const siteProjects: Project[] = demos.map((demo) => ({
  slug: demo.slug,
  title: demo.title,
  description: demo.description,
  tags: demo.tags,
  category: "sites",
  href: demoHref(demo),
}));

export const projects: Project[] = [
  /* ---- KITS ── 売っているもの ------------------------------------------
     発売中を先に、発売前を後に。飛び先は作品ページ（購入の導線は作品ページの
     結びにある）。作品ページを持たない 3 本だけ、同じ名義の note の記事へ飛ばす。 */
  {
    slug: "quote-simulator",
    title: "見積もり電卓テンプレ",
    description: "条件を入れると、見積もりの内訳と合計がその場で出る電卓。",
    tags: ["Next.js", "TypeScript"],
    category: "kits",
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
    href: links.lp.note,
  },
  {
    slug: "ai-concierge",
    title: "AI 案内窓口キット",
    description: "自社の文書だけを根拠に、サイトの上で質問に答える。",
    tags: ["Claude API", "Next.js"],
    category: "kits",
    sale: { status: "upcoming" },
  },
  {
    slug: "sheet-app",
    title: "スプレッドシート業務アプリ キット",
    description: "定義シートに列を書くと、一覧と登録の画面ができる。",
    tags: ["Google Apps Script"],
    category: "kits",
    sale: { status: "upcoming" },
  },
  {
    slug: "doc-reader",
    title: "AI 書類読み取りキット",
    description: "請求書や領収書を読み取り、確認してから表に出す。",
    tags: ["Claude API", "Next.js"],
    category: "kits",
    sale: { status: "upcoming" },
  },
  {
    slug: "booking",
    title: "予約ページ キット",
    description: "シートに枠を書くと、その URL が予約ページになる。",
    tags: ["Google Apps Script"],
    category: "kits",
    sale: { status: "upcoming" },
  },
  {
    slug: "configurator",
    title: "3D 商品コンフィギュレーター",
    description: "回しながら色や素材を選び、価格をその場で確かめる。",
    tags: ["React Three Fiber", "glTF"],
    category: "kits",
    sale: { status: "upcoming" },
  },

  /* ---- SITES ── 架空の会社で作った見本 ---------------------------------- */
  ...siteProjects,

  /* ---- WORKS ── 作品と道具 ---------------------------------------------- */
  {
    slug: "suminagashi",
    title: "墨流し — Suminagashi",
    description: "藍と墨が渦を巻く GPU 流体の水盤。かき混ぜて保存できる。",
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

export function projectsByCategory(category: ProjectCategory): Project[] {
  return projects.filter((project) => project.category === category);
}

/**
 * その行に添える図版（実画面の写し）の出どころ。無ければ null。
 *
 * 規則は一つだけ ── **この紙の中に自分のページを持つ行だけが図版を持つ**。
 * note へ飛ぶ 3 本は撮る画面が無いので、字だけの行として成立させる。
 * 撮るスクリプト（scripts/shoot-hub.mjs）も同じ規則で対象を決めるので、
 * レジストリに 1 行足せば図版も 1 枚増える。
 */
export function projectFigure(project: Project): string | null {
  return projectHref(project).startsWith("/") ? `/hub/${project.slug}` : null;
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

/** 目次の一本。段の名と、その段に付けた id への飛び先 */
export type ShelfAnchor = {
  id: ShelfId;
  label: string;
  anchor: string;
};

/**
 * 名乗りの下に並べる目次。並びは SHELVES そのまま。
 * 空の段は組まないので、目次に出る段には必ず中身がある。
 */
export function shelfAnchors(): ShelfAnchor[] {
  return SHELVES.map(({ id, label }) => ({ id, label, anchor: `#${id}` }));
}
