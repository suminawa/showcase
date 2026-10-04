// このファイルは、SaaS スターター キットからの写しです。
// 直すときはキットの側を直してから、scripts/sync-saas-starter.mjs を走らせてください。
import { PLANS, type Plan, type PlanId } from "../../plans.config";
import { formatYen, type Lang } from "./i18n";

export type { Plan, PlanId };

export const PLAN_IDS: readonly PlanId[] = PLANS.map((plan) => plan.id);

export function isPlanId(value: unknown): value is PlanId {
  return typeof value === "string" && (PLAN_IDS as readonly string[]).includes(value);
}

export function findPlan(planId: string): Plan | null {
  return PLANS.find((plan) => plan.id === planId) ?? null;
}

/**
 * 画面へお渡しするプランです。
 * Stripe の Price を入れる環境変数の**名前**は、お客さまの画面に出す用がないため外します
 * （どの環境変数を使っているかは、外からお見せしないほうがよい知らせです）。
 */
export type PublicPlan = Omit<Plan, "priceEnvName">;

/** 画面へお渡しできる形に写します（環境変数の名前を落とします） */
export function toPublicPlan(plan: Plan): PublicPlan {
  return {
    id: plan.id,
    nameKey: plan.nameKey,
    descriptionKey: plan.descriptionKey,
    monthlyYen: plan.monthlyYen,
    projectLimit: plan.projectLimit,
  };
}

/** 料金表に並べるプランを、そのままの順でお返しします */
export function publicPlans(): PublicPlan[] {
  return PLANS.map(toPublicPlan);
}

export function freePlan(): Plan {
  const found = findPlan("free");
  if (found === null) throw new Error("plans.config.ts に free のプランがありません");
  return found;
}

export function canCreateProject(plan: PublicPlan, currentCount: number): boolean {
  if (plan.projectLimit < 0) return true;
  return currentCount < plan.projectLimit;
}

/**
 * プロジェクトの件数の上限です。上限のないプランは null になります
 * （「-1 は上限なし」という決まりを、このファイルの外に持ち出さないための関数です）。
 */
export function projectLimitOf(plan: PublicPlan): number | null {
  return plan.projectLimit < 0 ? null : plan.projectLimit;
}

export type Quota = {
  limit: number;
  used: number;
  remaining: number | null;
  atLimit: boolean;
  unlimited: boolean;
};

export function projectQuota(plan: PublicPlan, currentCount: number): Quota {
  const unlimited = plan.projectLimit < 0;
  return {
    limit: plan.projectLimit,
    used: currentCount,
    remaining: unlimited ? null : Math.max(0, plan.projectLimit - currentCount),
    atLimit: !unlimited && currentCount >= plan.projectLimit,
    unlimited,
  };
}

export function priceIdFor(plan: Plan, env: Record<string, string | undefined>): string | null {
  if (plan.priceEnvName === null) return null;
  const found = env[plan.priceEnvName];
  return found === undefined || found === "" ? null : found;
}

export function planPriceText(plan: Plan, lang: Lang): string {
  return formatYen(plan.monthlyYen, lang);
}

export function upgradablePlans(current: PlanId): Plan[] {
  const at = PLANS.findIndex((plan) => plan.id === current);
  return at < 0 ? [] : PLANS.slice(at + 1);
}
