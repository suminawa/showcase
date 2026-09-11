import { describe, expect, it } from "vitest";
import {
  dayLabel,
  formatMinute,
  inSpan,
  minuteOfDay,
  WEEK_FROM_MONDAY,
} from "./openHours";

describe("openHours", () => {
  it("formatMinute は既定で 0 詰めの 時:分", () => {
    expect(formatMinute(600)).toBe("10:00");
    expect(formatMinute(540)).toBe("09:00");
    expect(formatMinute(570)).toBe("09:30");
    expect(formatMinute(1080)).toBe("18:00");
  });

  it("pad: false なら時の 0 詰めをしない（掲示の書き方）", () => {
    expect(formatMinute(570, { pad: false })).toBe("9:30");
    expect(formatMinute(780, { pad: false })).toBe("13:00");
    expect(formatMinute(1080, { pad: false })).toBe("18:00");
  });

  it("曜日は 0 = 日曜、並びは月曜起点", () => {
    expect(dayLabel(0)).toBe("日");
    expect(dayLabel(1)).toBe("月");
    expect(dayLabel(6)).toBe("土");
    expect(WEEK_FROM_MONDAY).toEqual([1, 2, 3, 4, 5, 6, 0]);
  });

  it("minuteOfDay は一日の始まりからの分", () => {
    expect(minuteOfDay(new Date(2026, 8, 14, 9, 30))).toBe(570);
    expect(minuteOfDay(new Date(2026, 8, 14, 0, 0))).toBe(0);
  });

  it("inSpan は始まりちょうどが中、終わりちょうどは外", () => {
    const span = { start: 570, end: 780 };
    expect(inSpan(569, span)).toBe(false);
    expect(inSpan(570, span)).toBe(true);
    expect(inSpan(779, span)).toBe(true);
    expect(inSpan(780, span)).toBe(false);
  });
});
