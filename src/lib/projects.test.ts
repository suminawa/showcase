import { describe, expect, it } from "vitest";
import {
  CATEGORIES,
  projectHref,
  projects,
  projectsByCategory,
} from "./projects";

describe("projects registry", () => {
  it("カテゴリは sites → tools → games の順で 3 つ", () => {
    expect(CATEGORIES.map((c) => c.id)).toEqual(["sites", "tools", "games"]);
    expect(CATEGORIES.map((c) => c.label)).toEqual([
      "SITES",
      "TOOLS",
      "GAMES",
    ]);
  });

  it("全作品が定義済みカテゴリを持つ", () => {
    const ids = CATEGORIES.map((c) => c.id);
    for (const project of projects) {
      expect(ids).toContain(project.category);
    }
  });

  it("projectsByCategory がカテゴリで絞り込む", () => {
    const sites = projectsByCategory("sites");
    expect(sites.map((p) => p.slug)).toEqual(["suminagashi"]);
    const tools = projectsByCategory("tools");
    expect(tools.map((p) => p.slug)).toEqual(["quote-simulator"]);
    expect(projectsByCategory("games")).toEqual([]);
  });

  it("projectHref は /projects/<slug> を返す", () => {
    const [first] = projectsByCategory("sites");
    expect(projectHref(first)).toBe("/projects/suminagashi");
  });
});
