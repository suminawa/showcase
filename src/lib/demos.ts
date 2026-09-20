/**
 * 見本（業種別デモ）のレジストリ。
 * 提案文から来た人が触る、架空の会社で作った 1 ページ LP と会社案内。
 * ハブの SITES 欄はここから組む。
 * 見本を足すときに触るのは、このファイルと src/app/demos/<slug>/ だけ。
 */
export type DemoSlug =
  | "corporate-site"
  | "saas-lp"
  | "shop-lp"
  | "construction-lp"
  | "professional-lp"
  | "clinic-lp";

export type Demo = {
  slug: DemoSlug;
  /**
   * ハブの SITES 欄に出す名前。
   * 見本であることは欄の頭の一行が言うので、ここでは名乗らない。
   * 各見本ページの <title> は、それぞれのページが自前で持つ（この題とは別）。
   */
  title: string;
  /** 効く業種の短い名前（提案文の振り分けに使う） */
  industry: string;
  /** ハブの目録の一行。長くても 2 行に収まる長さで書く（40 字前後まで） */
  description: string;
  tags: string[];
};

export const demos: readonly Demo[] = [
  {
    slug: "corporate-site",
    title: "会社案内サイト",
    industry: "コーポレート",
    description:
      "架空の計測会社「潮見計測」の会社案内。TOP と下層 3 枚がつながる。",
    tags: ["Next.js", "TypeScript", "見本サイト"],
  },
  {
    slug: "saas-lp",
    title: "BtoB・SaaS の LP",
    industry: "BtoB・SaaS",
    description:
      "架空の勤怠 SaaS「Tabane Works」の 1 ページ。料金の切替とフォームまで動く。",
    tags: ["Next.js", "TypeScript", "見本 LP"],
  },
  {
    slug: "shop-lp",
    title: "店舗・サロンの LP",
    industry: "店舗・サロン",
    description:
      "架空の焼き菓子の店「粉とゆげ」の 1 ページ。品書きと席の案内、予約まで動く。",
    tags: ["Next.js", "TypeScript", "見本 LP"],
  },
  {
    slug: "construction-lp",
    title: "建設・工事の LP",
    industry: "建設・工事",
    description:
      "架空の設備工事会社「灯月設備」の 1 ページ。電話導線と対応エリアまで動く。",
    tags: ["Next.js", "TypeScript", "見本 LP"],
  },
  {
    slug: "professional-lp",
    title: "士業・研修の LP",
    industry: "士業・研修",
    description:
      "架空の会計事務所「霜月会計事務所」の 1 ページ。顧問料 3 プランの切替まで動く。",
    tags: ["Next.js", "TypeScript", "見本 LP"],
  },
  {
    slug: "clinic-lp",
    title: "クリニック・医院の LP",
    industry: "クリニック・医院",
    description:
      "架空の歯科医院「月白歯科クリニック」の 1 ページ。診療時間の表と Web 予約まで。",
    tags: ["Next.js", "TypeScript", "見本 LP"],
  },
];

export function demoHref(demo: Pick<Demo, "slug">): string {
  return `/demos/${demo.slug}`;
}

export function demoBySlug(slug: string): Demo | undefined {
  return demos.find((d) => d.slug === slug);
}
