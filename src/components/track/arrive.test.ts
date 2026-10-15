import { describe, expect, it } from "vitest";

import { arriveRef } from "./arrive";

describe("arriveRef", () => {
  it("決めた値だけを返し、知らない値・空・無しは null", () => {
    expect(arriveRef("?ref=cw")).toBe("cw");
    expect(arriveRef("?utm_source=a&ref=booth")).toBe("booth");
    expect(arriveRef("?ref=evil")).toBeNull();
    expect(arriveRef("?ref=")).toBeNull();
    expect(arriveRef("")).toBeNull();
  });
});
