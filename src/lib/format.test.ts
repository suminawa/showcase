import { expect, it } from "vitest";
import { formatYen } from "./format";

it("3 桁区切りの ¥ 表記にする", () => {
  expect(formatYen(1234567)).toBe("¥1,234,567");
  expect(formatYen(0)).toBe("¥0");
});
