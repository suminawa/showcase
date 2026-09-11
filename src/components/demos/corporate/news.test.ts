import { describe, expect, it } from "vitest";
import { formatNewsDate, NEWS } from "./news";

describe("corporate news", () => {
  it("お知らせは 3 件、id は重ならない", () => {
    expect(NEWS).toHaveLength(3);
    expect(new Set(NEWS.map((item) => item.id)).size).toBe(3);
  });

  it("新しい順に並んでいる", () => {
    const dates = NEWS.map((item) => item.date);
    expect([...dates].sort().reverse()).toEqual(dates);
  });

  it("日付は 2026 年の YYYY-MM-DD", () => {
    for (const item of NEWS) {
      expect(item.date).toMatch(/^2026-\d{2}-\d{2}$/);
    }
  });

  it("題名は空でなく、区分はお知らせか実績", () => {
    for (const item of NEWS) {
      expect(item.title.length).toBeGreaterThan(0);
      expect(["お知らせ", "実績"]).toContain(item.tag);
    }
  });

  it("formatNewsDate は点区切りにする", () => {
    expect(formatNewsDate("2026-08-27")).toBe("2026.08.27");
    expect(formatNewsDate("2026-01-09")).toBe("2026.01.09");
  });
});
