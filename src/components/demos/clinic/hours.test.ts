import { describe, expect, it } from "vitest";
import {
  AFTERNOON,
  CLINIC_DAYS,
  clinicDayLabels,
  CLOSED_NOTE,
  isOpenAtClinic,
  MARK_LABELS,
  MARK_SYMBOLS,
  markFor,
  MORNING,
  SATURDAY_AFTERNOON,
  slotOptions,
  spanLabel,
} from "./hours";

describe("clinic hours", () => {
  it("診療する曜日は月から土の 6 日", () => {
    expect(CLINIC_DAYS.map((d) => d.day)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(clinicDayLabels()).toEqual(["月", "火", "水", "木", "金", "土"]);
  });

  it("木曜の午後は休診、土曜の午後だけ時間が短い", () => {
    const thursday = CLINIC_DAYS.find((d) => d.day === 4);
    const saturday = CLINIC_DAYS.find((d) => d.day === 6);
    expect(thursday?.morning).toEqual(MORNING);
    expect(thursday?.afternoon).toBeNull();
    expect(saturday?.afternoon).toEqual(SATURDAY_AFTERNOON);
    expect(saturday?.afternoon).not.toEqual(AFTERNOON);
  });

  it("表の印は 標準どおり・短縮・休診 の三つ", () => {
    expect(markFor(MORNING, MORNING)).toBe("open");
    expect(markFor(SATURDAY_AFTERNOON, AFTERNOON)).toBe("short");
    expect(markFor(null, AFTERNOON)).toBe("closed");
    expect(MARK_SYMBOLS.open).toBe("●");
    expect(MARK_SYMBOLS.short).toBe("▲");
    expect(MARK_SYMBOLS.closed).toBe("−");
    expect(MARK_LABELS.open).toBe("診療");
    expect(MARK_LABELS.short).toBe("短縮");
    expect(MARK_LABELS.closed).toBe("休診");
  });

  it("時間帯の表示は時の 0 詰めをしない", () => {
    expect(spanLabel(MORNING)).toBe("9:30 - 13:00");
    expect(spanLabel(AFTERNOON)).toBe("14:30 - 19:00");
    expect(spanLabel(SATURDAY_AFTERNOON)).toBe("14:00 - 17:00");
  });

  it("月曜の午前と午後は診療中、昼休みは診療時間外", () => {
    // 2026-09-14 は月曜
    expect(isOpenAtClinic(new Date(2026, 8, 14, 10, 0))).toBe(true);
    expect(isOpenAtClinic(new Date(2026, 8, 14, 13, 30))).toBe(false);
    expect(isOpenAtClinic(new Date(2026, 8, 14, 15, 0))).toBe(true);
  });

  it("始まりちょうどは診療中、終わりちょうどは診療時間外", () => {
    expect(isOpenAtClinic(new Date(2026, 8, 14, 9, 29))).toBe(false);
    expect(isOpenAtClinic(new Date(2026, 8, 14, 9, 30))).toBe(true);
    expect(isOpenAtClinic(new Date(2026, 8, 14, 13, 0))).toBe(false);
    expect(isOpenAtClinic(new Date(2026, 8, 14, 14, 30))).toBe(true);
    expect(isOpenAtClinic(new Date(2026, 8, 14, 19, 0))).toBe(false);
  });

  it("木曜の午後と日曜は診療時間外、土曜の午後は 17:00 まで", () => {
    // 2026-09-17 は木曜、2026-09-19 は土曜、2026-09-13 は日曜
    expect(isOpenAtClinic(new Date(2026, 8, 17, 10, 0))).toBe(true);
    expect(isOpenAtClinic(new Date(2026, 8, 17, 15, 0))).toBe(false);
    expect(isOpenAtClinic(new Date(2026, 8, 19, 14, 0))).toBe(true);
    expect(isOpenAtClinic(new Date(2026, 8, 19, 16, 59))).toBe(true);
    expect(isOpenAtClinic(new Date(2026, 8, 19, 17, 0))).toBe(false);
    expect(isOpenAtClinic(new Date(2026, 8, 13, 10, 0))).toBe(false);
  });

  it("予約の時間帯は診療時間から組み立てる", () => {
    expect(slotOptions()).toEqual([
      "午前（9:30 - 13:00）",
      "午後（14:30 - 19:00）",
      "土曜の午後（14:00 - 17:00）",
    ]);
  });

  it("休診の案内は一行で持つ", () => {
    expect(CLOSED_NOTE).toBe("休診：木曜の午後、日曜・祝日");
  });
});
