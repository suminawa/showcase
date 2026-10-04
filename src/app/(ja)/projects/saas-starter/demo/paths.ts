/**
 * 額の中の道すじです。
 *
 * ブラウザの「戻る」で見本の外へ出てしまわないよう、行き来は URL を触らずに
 * この中だけで持ちます。窓の住所には、キットの本物の道すじをそのままお出しします
 * （買われたあと、どの画面がどこにあるかが、そのまま分かるようにするためです）。
 */
import type { PlanId } from "../kit/src/core/plans";

export type Route =
  | { name: "login" }
  | { name: "overview" }
  | { name: "projects" }
  | { name: "organization" }
  /** お支払いの画面。お手続きから戻られたときだけ、1 行のお知らせが出ます */
  | { name: "billing"; toast?: "checkoutDone" | "checkoutCanceled" | "planCanceled" }
  | { name: "checkout"; planId: PlanId }
  | { name: "portal" }
  | { name: "legal" };

/** 主なメニューで選べる 3 つです */
export type MainTab = "overview" | "projects" | "settings";

export function mainTabOf(route: Route): MainTab {
  if (route.name === "projects") return "projects";
  if (route.name === "overview" || route.name === "login") return "overview";
  return "settings";
}

/** 設定のメニューで選べる 2 つです */
export type SettingsTab = "organization" | "billing";

export function settingsTabOf(route: Route): SettingsTab {
  return route.name === "organization" ? "organization" : "billing";
}

/** 窓の住所に出す、キットの本物の道すじです */
export function routePath(route: Route): string {
  switch (route.name) {
    case "login":
      return "/login";
    case "overview":
      return "/app";
    case "projects":
      return "/app/projects";
    case "organization":
      return "/app/settings/organization";
    case "billing":
      return "/app/settings/billing";
    case "checkout":
      return `/fake/checkout?plan=${route.planId}`;
    case "portal":
      return "/fake/checkout?plan=portal";
    default:
      return "/legal/tokushoho";
  }
}
