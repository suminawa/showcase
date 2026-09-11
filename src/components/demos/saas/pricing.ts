export type Cycle = "monthly" | "yearly";

export type PlanId = "starter" | "standard" | "business";

export type Plan = {
  id: PlanId;
  name: string;
  /** 1 人あたりの月額（円） */
  monthly: number;
  /** 対象の会社の規模 */
  audience: string;
  features: string[];
  recommended?: boolean;
};

/** 年額払いの割引率。表示は「年額払いの月あたり換算」 */
export const YEARLY_DISCOUNT = 0.2;

export const PLANS: readonly Plan[] = [
  {
    id: "starter",
    name: "スターター",
    monthly: 500,
    audience: "10 人までの会社向け",
    features: ["打刻と工数入力", "日次の自動集計", "CSV 書き出し"],
  },
  {
    id: "standard",
    name: "スタンダード",
    monthly: 900,
    audience: "11 人から 100 人の会社向け",
    features: ["スターターの全部", "案件別の原価", "承認フロー", "API 連携"],
    recommended: true,
  },
  {
    id: "business",
    name: "ビジネス",
    monthly: 1500,
    audience: "100 人以上の会社向け",
    features: ["スタンダードの全部", "SSO", "監査ログ", "専任サポート"],
  },
];

/** 1 人あたりの月額。年額払いは 20% 引きの月あたり換算（端数切り捨て） */
export function priceFor(plan: Pick<Plan, "monthly">, cycle: Cycle): number {
  if (cycle === "monthly") return plan.monthly;
  return Math.floor(plan.monthly * (1 - YEARLY_DISCOUNT));
}
