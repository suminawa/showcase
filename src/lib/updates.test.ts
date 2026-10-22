import { describe, expect, it } from "vitest";

import { projects } from "./projects";
import { UPDATES, updateDate, updatesFor } from "./updates";

describe("更新の記録", () => {
  it("新しい順で、どの行も実在の品物・版・敬体の一行を持つ", () => {
    const dates = UPDATES.map((u) => u.date);
    expect([...dates].sort().reverse()).toEqual(dates);
    for (const u of UPDATES) {
      expect(projects.some((p) => p.slug === u.slug)).toBe(true);
      expect(u.version).toMatch(/^\d+\.\d+\.\d+$/);
      expect(u.note).toMatch(/(です|ます|ました|ません|いただけます)。$/);
    }
  });

  it("品物ごとに引ける", () => {
    expect(updatesFor("form").map((u) => u.version)).toEqual(["1.1.3", "1.1.2", "1.1.1", "1.1.0"]);
    expect(updatesFor("sheet-app").map((u) => u.version)).toEqual(["1.1.4", "1.1.3", "1.1.2", "1.1.1", "1.1.0"]);
    expect(UPDATES.slice(0, 4).map((u) => `${u.slug} ${u.version}`)).toEqual(["saas-starter 1.1.1", "lp-pack 1.0.3", "ai-concierge 1.0.3", "doc-reader 1.0.2"]);
    expect(updatesFor("quote-simulator").map((u) => u.version)).toEqual(["1.1.1"]);
    expect(updatesFor("suminagashi")).toEqual([]);
  });

  it("日付は「2026.9.28」の形", () => {
    expect(updateDate("2026-09-28")).toBe("2026.9.28");
  });
});
