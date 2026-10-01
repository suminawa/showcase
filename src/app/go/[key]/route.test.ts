import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from "vitest";

import links from "@/data/links.json";

import { GET } from "./route";

vi.mock("@vercel/analytics/server", () => ({ track: vi.fn(async () => undefined) }));

function call(key: string) {
  return GET(new Request(`https://suminawa.dev/go/${key}`), { params: Promise.resolve({ key }) });
}

describe("/go/[key]", () => {
  let log: MockInstance<typeof console.log>;
  beforeEach(() => {
    log = vi.spyOn(console, "log").mockImplementation(() => {});
  });
  afterEach(() => {
    log.mockRestore();
  });

  it("行き先を省くと BOOTH へ渡す（zip の README に書いた /go/s2-lite）", async () => {
    const res = await call("s2-lite");
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe(links["s2-lite"].booth);
    expect(log).toHaveBeenCalledWith(JSON.stringify({ event: "go", key: "s2-lite", dest: "booth", from: "unknown" }));
  });

  it("知らない key は 404", async () => {
    const res = await call("no-such-kit");
    expect(res.status).toBe(404);
    expect(res.headers.get("location")).toBeNull();
  });
});
