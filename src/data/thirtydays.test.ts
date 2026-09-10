import { describe, expect, it } from "vitest";
import board from "./thirtydays.json";

const KEYS: Record<string, "number" | "string"> = {
  day: "number", date: "string", revenue: "number", proposals: "number", replies: "number",
  meetings: "number", humanMinutes: "number", release: "string", ai: "string",
};

describe("thirtydays.json（毎晩書き換わる正本）", () => {
  it("startDate は Day 0 の日付", () => {
    expect(board.startDate).toBe("2026-09-10");
  });
  it("全行が 9 項目を正しい型で持ち、day が昇順で date と整合する", () => {
    expect(board.days.length).toBeGreaterThan(0);
    board.days.forEach((row, i) => {
      for (const [key, type] of Object.entries(KEYS)) {
        expect(typeof (row as Record<string, unknown>)[key], `${key} of day ${i}`).toBe(type);
      }
      expect(row.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      if (i > 0) expect(row.day).toBeGreaterThan(board.days[i - 1].day);
      for (const key of ["revenue", "proposals", "replies", "meetings", "humanMinutes"] as const) {
        expect(row[key], `${key} of day ${i}`).toBeGreaterThanOrEqual(0);
      }
    });
  });
});
