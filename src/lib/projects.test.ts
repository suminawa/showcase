import { describe, expect, it } from "vitest";
import {
  CATEGORIES,
  categoryAnchors,
  projectHref,
  projects,
  projectsByCategory,
} from "./projects";

describe("projects registry", () => {
  it("カテゴリは sites → tools → games → challenge の順で 4 つ", () => {
    expect(CATEGORIES.map((c) => c.id)).toEqual([
      "sites",
      "tools",
      "games",
      "challenge",
    ]);
    expect(CATEGORIES.map((c) => c.label)).toEqual([
      "SITES",
      "TOOLS",
      "GAMES",
      "CHALLENGE",
    ]);
  });

  it("欄の頭の一行を持つのは SITES だけ", () => {
    const leads = CATEGORIES.map((c) => c.lead);
    expect(leads).toEqual([
      "どれも架空の会社で作った見本です。",
      undefined,
      undefined,
      undefined,
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
    expect(sites.map((p) => p.slug)).toEqual([
      "corporate-site",
      "saas-lp",
      "shop-lp",
      "construction-lp",
      "professional-lp",
      "clinic-lp",
    ]);
    const tools = projectsByCategory("tools");
    expect(tools.map((p) => p.slug)).toEqual([
      "suminagashi",
      "quote-simulator",
      "floorplan",
    ]);
    expect(projectsByCategory("challenge").map((p) => p.slug)).toEqual([
      "30days",
    ]);
    expect(projectsByCategory("games")).toEqual([]);
  });

  it("projectHref は /projects/<slug>、見本は /demos/<slug> を返す", () => {
    const [suminagashi, quote, floorplan] = projectsByCategory("tools");
    expect(projectHref(quote)).toBe("/projects/quote-simulator");
    expect(projectHref(floorplan)).toBe("/projects/floorplan");
    expect(projectHref(suminagashi)).toBe("/projects/suminagashi");
    const [challenge] = projectsByCategory("challenge");
    expect(projectHref(challenge)).toBe("/projects/30days");
    const sites = projectsByCategory("sites");
    expect(projectHref(sites[0])).toBe("/demos/corporate-site");
    expect(projectHref(sites[sites.length - 1])).toBe("/demos/clinic-lp");
  });

  it("SITES の行はレジストリの題と説明をそのまま持つ", () => {
    const [corporate, saas, shop, construction] = projectsByCategory("sites");
    expect(corporate.title).toBe("会社案内サイト");
    expect(corporate.tags).toContain("見本サイト");
    expect(saas.title).toBe("BtoB・SaaS の LP");
    expect(saas.tags).toContain("見本 LP");
    expect(shop.title).toBe("店舗・サロンの LP");
    expect(projectHref(shop)).toBe("/demos/shop-lp");
    expect(construction.title).toBe("建設・工事の LP");
    expect(projectHref(construction)).toBe("/demos/construction-lp");
  });

  it("間取りシミュレーターはツールの 2 番目", () => {
    const [, , floorplan] = projectsByCategory("tools");
    expect(floorplan.slug).toBe("floorplan");
    expect(floorplan.title).toBe("間取りシミュレーター");
    expect(floorplan.description).toBe(
      "間取りを描きかえ、家具を置き、3D で確かめる。マス目を塗るだけで廊下も L 字も描ける、住まいの検討用の道具。",
    );
    expect(floorplan.tags).toEqual(["React Three Fiber", "TypeScript"]);
    expect(floorplan.href).toBeUndefined();
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
