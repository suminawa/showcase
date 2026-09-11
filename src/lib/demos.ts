/**
 * 見本（業種別デモ）のレジストリ。
 * 提案文から来た人が触る 1 ページ LP や 3D ビューア。ハブの SAMPLES 欄はここから組む。
 * 見本を足すときに触るのは、このファイルと src/app/demos/<slug>/ だけ。
 */
export type DemoSlug =
  | "saas-lp"
  | "shop-lp"
  | "construction-lp"
  | "corporate-site";

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
];

export function demoHref(demo: Pick<Demo, "slug">): string {
  return `/demos/${demo.slug}`;
}

export function demoBySlug(slug: string): Demo | undefined {
  return demos.find((d) => d.slug === slug);
}
