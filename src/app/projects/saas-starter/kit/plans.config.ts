// このファイルは、SaaS スターター キットからの写しです。
// 直すときはキットの側を直してから、scripts/sync-saas-starter.mjs を走らせてください。
/**
 * 料金プランの設定。お客さまはこのファイルだけを書き換えれば、
 * 画面の料金表・上限の判定・Stripe の Price のひもづけがすべて変わります。
 *
 * monthlyYen  … 日本円・税込で表示する金額です。実際に請求される金額は Stripe の Price が決めます。
 * projectLimit … -1 は「上限なし」です。
 * priceEnvName … Stripe の Price ID を入れる環境変数の名前です。無料のプランは null にしてください。
 */

export type PlanId = "free" | "standard" | "business";

export type Plan = {
  id: PlanId;
  nameKey: string;
  descriptionKey: string;
  monthlyYen: number;
  projectLimit: number;
  priceEnvName: string | null;
};

export const PLANS: readonly Plan[] = [
  {
    id: "free",
    nameKey: "plan.free.name",
    descriptionKey: "plan.free.description",
    monthlyYen: 0,
    projectLimit: 3,
    priceEnvName: null,
  },
  {
    id: "standard",
    nameKey: "plan.standard.name",
    descriptionKey: "plan.standard.description",
    monthlyYen: 2980,
    projectLimit: 50,
    priceEnvName: "STRIPE_PRICE_STANDARD",
  },
  {
    id: "business",
    nameKey: "plan.business.name",
    descriptionKey: "plan.business.description",
    monthlyYen: 9800,
    projectLimit: -1,
    priceEnvName: "STRIPE_PRICE_BUSINESS",
  },
] as const;
