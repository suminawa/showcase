import { describe, expect, it } from "vitest";
import {
  CATEGORIES,
  projectHref,
  projects,
  projectsByCategory,
} from "./projects";

describe("projects registry", () => {
  it("カテゴリは sites → tools → samples → games の順で 4 つ", () => {
    expect(CATEGORIES.map((c) => c.id)).toEqual([
      "sites",
      "tools",
      "samples",
      "games",
    ]);
    expect(CATEGORIES.map((c) => c.label)).toEqual([
      "SITES",
      "TOOLS",
      "SAMPLES",
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
    expect(tools.map((p) => p.slug)).toEqual(["quote-simulator", "30days"]);
    expect(projectsByCategory("samples").map((p) => p.slug)).toEqual([
      "saas-lp",
    ]);
    expect(projectsByCategory("games")).toEqual([]);
  });

  it("projectHref は /projects/<slug>、見本は /demos/<slug> を返す", () => {
    const [first] = projectsByCategory("sites");
    expect(projectHref(first)).toBe("/projects/suminagashi");
    const [sample] = projectsByCategory("samples");
    expect(projectHref(sample)).toBe("/demos/saas-lp");
  });

  it("見本の行はレジストリの題と説明をそのまま持つ", () => {
    const [sample] = projectsByCategory("samples");
    expect(sample.title).toBe("見本 — BtoB・SaaS の LP");
    expect(sample.tags).toContain("見本 LP");
  });
});
