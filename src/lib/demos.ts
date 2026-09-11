/**
 * 見本（業種別デモ）のレジストリ。
 * 提案文から来た人が触る 1 ページ LP や間取りシミュレーター。ハブの SAMPLES 欄はここから組む。
 * 見本を足すときに触るのは、このファイルと src/app/demos/<slug>/ だけ。
 */
export type DemoSlug =
  | "saas-lp"
  | "shop-lp"
  | "construction-lp"
  | "corporate-site"
  | "professional-lp"
  | "clinic-lp"
  | "3d-viewer";

export type Demo = {
  slug: DemoSlug;
  /** ハブと <title> に出す名前 */
  title: string;
  /** 効く業種の短い名前（提案文の振り分けに使う） */
  industry: string;
  /** ハブの一行。80 字以内 */
  description: string;
  tags: string[];
};

export const demos: readonly Demo[] = [
  {
    slug: "saas-lp",
    title: "見本 — BtoB・SaaS の LP",
    industry: "BtoB・SaaS",
    description:
      "架空の勤怠・工数 SaaS「Tabane Works」の 1 ページ。料金の切替、FAQ、問い合わせフォームまで動く見本。",
    tags: ["Next.js", "TypeScript", "見本 LP"],
  },
  {
    slug: "shop-lp",
    title: "見本 — 店舗・サロンの LP",
    industry: "店舗・サロン",
    description:
      "架空の焼き菓子とコーヒーの店「粉とゆげ」の 1 ページ。品書きと席の案内、予約フォームまで動く見本。",
    tags: ["Next.js", "TypeScript", "見本 LP"],
  },
  {
    slug: "construction-lp",
    title: "見本 — 建設・工事の LP",
    industry: "建設・工事",
    description:
      "架空の設備工事会社「灯月設備」の 1 ページ。電話導線と料金の目安、対応エリアまで動く見本。",
    tags: ["Next.js", "TypeScript", "見本 LP"],
  },
  {
    slug: "corporate-site",
    title: "見本 — 会社案内サイト",
    industry: "コーポレート",
    description:
      "架空の海洋・環境調査の計測会社「潮見計測」の会社案内。TOP と下層 3 枚がつながる見本。",
    tags: ["Next.js", "TypeScript", "見本サイト"],
  },
  {
    slug: "professional-lp",
    title: "見本 — 士業・研修の LP",
    industry: "士業・研修",
    description:
      "架空の会計事務所「霜月会計事務所」の 1 ページ。税務調査の相談と、顧問料 3 プランの切替まで動く見本。",
    tags: ["Next.js", "TypeScript", "見本 LP"],
  },
  {
    slug: "clinic-lp",
    title: "見本 — クリニック・医院の LP",
    industry: "クリニック・医院",
    description:
      "架空の歯科医院「月白歯科クリニック」の 1 ページ。診療時間の表と Web 予約まで動く見本。",
    tags: ["Next.js", "TypeScript", "見本 LP"],
  },
  {
    slug: "3d-viewer",
    title: "見本 — 間取りシミュレーター（3D）",
    industry: "建築・不動産",
    description:
      "間取りを描きかえ、家具を置き、3D で確かめる見本。マス目を塗るだけで廊下も L 字も描けます。",
    tags: ["React Three Fiber", "TypeScript", "見本 3D"],
  },
];

export function demoHref(demo: Pick<Demo, "slug">): string {
  return `/demos/${demo.slug}`;
}

export function demoBySlug(slug: string): Demo | undefined {
  return demos.find((d) => d.slug === slug);
}
