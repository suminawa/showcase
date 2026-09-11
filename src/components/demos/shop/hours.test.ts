import { describe, expect, it } from "vitest";
import {
  CLOSE_MINUTE,
  closedDaysLabel,
  formatMinute,
  hoursLabel,
  isOpenAt,
  LAST_ORDER_MINUTE,
  lastOrderLabel,
  OPEN_MINUTE,
  openDaysLabel,
} from "./hours";

describe("shop hours", () => {
  it("formatMinute は 0 詰めの 時:分", () => {
    expect(formatMinute(600)).toBe("10:00");
    expect(formatMinute(540)).toBe("09:00");
    expect(formatMinute(1050)).toBe("17:30");
    expect(formatMinute(1080)).toBe("18:00");
  });

  it("開く日の昼は開いていて、休みの日は閉まっている", () => {
    // 2026-09-10 は木曜、2026-09-13 は日曜、2026-09-07 は月曜
    expect(isOpenAt(new Date(2026, 8, 10, 11, 0))).toBe(true);
    expect(isOpenAt(new Date(2026, 8, 13, 17, 0))).toBe(true);
    expect(isOpenAt(new Date(2026, 8, 7, 11, 0))).toBe(false);
    expect(isOpenAt(new Date(2026, 8, 9, 11, 0))).toBe(false);
  });

  it("開店ちょうどは開き、閉店ちょうどは閉まっている", () => {
    expect(isOpenAt(new Date(2026, 8, 10, 9, 59))).toBe(false);
    expect(isOpenAt(new Date(2026, 8, 10, 10, 0))).toBe(true);
    expect(isOpenAt(new Date(2026, 8, 10, 17, 59))).toBe(true);
    expect(isOpenAt(new Date(2026, 8, 10, 18, 0))).toBe(false);
  });

  it("曜日の並びは月曜から始まる", () => {
    expect(openDaysLabel()).toBe("木・金・土・日");
    expect(closedDaysLabel()).toBe("定休日：月・火・水");
  });

  it("時間の表示と、ラストオーダーの位置", () => {
    expect(hoursLabel()).toBe("10:00 - 18:00");
    expect(lastOrderLabel()).toBe("17:30");
    expect(LAST_ORDER_MINUTE).toBeGreaterThan(OPEN_MINUTE);
    expect(LAST_ORDER_MINUTE).toBeLessThan(CLOSE_MINUTE);
  });
});
