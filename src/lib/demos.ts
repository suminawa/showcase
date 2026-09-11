/**
 * 見本（業種別デモ）のレジストリ。
 * 提案文から来た人が触る 1 ページ LP や間取りシミュレーター。ハブの SAMPLES 欄はここから組む。
 * 見本を足すときに触るのは、このファイルと src/app/demos/<slug>/ だけ。
 */
export type DemoSlug = "saas-lp" | "shop-lp" | "3d-viewer";

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
    slug: "3d-viewer",
    title: "見本 — 間取りシミュレーター（3D）",
    industry: "建築・不動産",
    description:
      "間取りを描きかえ、家具を置き、3D で確かめる見本。壁を動かすと隣の部屋が伸び縮みします。",
    tags: ["React Three Fiber", "TypeScript", "見本 3D"],
  },
];

export function demoHref(demo: Pick<Demo, "slug">): string {
  return `/demos/${demo.slug}`;
}

export function demoBySlug(slug: string): Demo | undefined {
  return demos.find((d) => d.slug === slug);
}
