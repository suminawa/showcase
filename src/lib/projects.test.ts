import { describe, expect, it } from "vitest";
import {
  CATEGORIES,
  categoryAnchors,
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
      "shop-lp",
      "construction-lp",
      "corporate-site",
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
    const [saas, shop, construction, corporate] = projectsByCategory("samples");
    expect(saas.title).toBe("見本 — BtoB・SaaS の LP");
    expect(saas.tags).toContain("見本 LP");
    expect(shop.title).toBe("見本 — 店舗・サロンの LP");
    expect(projectHref(shop)).toBe("/demos/shop-lp");
    expect(construction.title).toBe("見本 — 建設・工事の LP");
    expect(projectHref(construction)).toBe("/demos/construction-lp");
    expect(corporate.title).toBe("見本 — 会社案内サイト");
    expect(projectHref(corporate)).toBe("/demos/corporate-site");
  });

  it("slug は作品と見本をまたいで重ならない", () => {
    expect(new Set(projects.map((p) => p.slug)).size).toBe(projects.length);
  });
});

describe("categoryAnchors", () => {
  it("CATEGORIES と同じ順で 4 件を返す", () => {
    const anchors = categoryAnchors();
    expect(anchors).toHaveLength(4);
    expect(anchors.map((a) => a.id)).toEqual(CATEGORIES.map((c) => c.id));
    expect(anchors.map((a) => a.label)).toEqual(CATEGORIES.map((c) => c.label));
  });

  it("anchor は # + id の形", () => {
    for (const anchor of categoryAnchors()) {
      expect(anchor.anchor).toBe(`#${anchor.id}`);
      expect(anchor.anchor).toMatch(/^#[a-z]+$/);
    }
  });

  it("作品を持たない分類も目次に残る", () => {
    expect(categoryAnchors().map((a) => a.id)).toContain("games");
    expect(projectsByCategory("games")).toEqual([]);
  });
});
