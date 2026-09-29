import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from "vitest";

import links from "@/data/links.json";
import { goHref, resolveGo } from "@/lib/go";

import { GET } from "./route";

function call(key: string, dest: string, query = "", headers: Record<string, string> = {}) {
  const request = new Request(`https://suminawa.dev/go/${key}/${dest}${query}`, { headers });
  return GET(request, { params: Promise.resolve({ key, dest }) });
}

describe("/go/[key]/[dest]", () => {
  let log: MockInstance<typeof console.log>;
  beforeEach(() => {
    log = vi.spyOn(console, "log").mockImplementation(() => {});
  });
  afterEach(() => {
    log.mockRestore();
  });

  it("知らない key は 404 で、何も記録しない", async () => {
    const res = await call("no-such-kit", "note");
    expect(res.status).toBe(404);
    expect(res.headers.get("location")).toBeNull();
    expect(res.headers.get("x-robots-tag")).toContain("noindex");
    expect(log).not.toHaveBeenCalled();
  });

  it("dest が note・booth 以外、URL が空、Object の持ち物の名は 404", async () => {
    expect((await call("booking", "shop")).status).toBe(404);
    expect((await call("mcp-server", "note")).status).toBe(404);
    expect((await call("challenge", "booth")).status).toBe(404);
    expect((await call("__proto__", "note")).status).toBe(404);
    expect((await call("constructor", "note")).status).toBe(404);
  });

  it("知っている key は links.json の URL ちょうどへ 302 で渡す", async () => {
    const res = await call("booking", "note");
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe(links.booking.note);
    expect(res.headers.get("x-robots-tag")).toContain("noindex");
    expect(res.headers.get("referrer-policy")).toBe("strict-origin-when-cross-origin");
    const booth = await call("booking", "booth");
    expect(booth.headers.get("location")).toBe(links.booking.booth);
  });

  it("問い合わせの文字列に URL を入れても、渡し先は links.json のまま", async () => {
    const res = await call("booking", "note", "?from=/kits&url=https://evil.example/&to=https://evil.example/");
    expect(res.headers.get("location")).toBe(links.booking.note);
  });

  it("from が既知の紙の道ならそのまま、そうでなければ unknown と記録する", async () => {
    await call("booking", "note", "?from=%2Fprojects%2Fbooking");
    await call("booking", "note", "?from=https%3A%2F%2Fevil.example%2F");
    await call("booking", "note", "?from=%2Fnot-a-page");
    await call("booking", "note");
    const lines = log.mock.calls.map((c) => JSON.parse(String(c[0])));
    expect(lines.map((l) => l.from)).toEqual(["/projects/booking", "unknown", "unknown", "unknown"]);
  });

  it("記録は event・key・dest・from の 4 つだけで、IP・UA・Cookie・Referer は残さない", async () => {
    await call("dashboard", "booth", "?from=%2Fkits&utm_source=x", {
      "x-forwarded-for": "203.0.113.7",
      "user-agent": "TestAgent/1.0",
      cookie: "session=abc",
      referer: "https://suminawa.dev/kits",
    });
    expect(log).toHaveBeenCalledTimes(1);
    const raw = String(log.mock.calls[0][0]);
    expect(JSON.parse(raw)).toEqual({ event: "go", key: "dashboard", dest: "booth", from: "/kits" });
    for (const secret of ["203.0.113.7", "TestAgent", "abc", "utm_source"]) {
      expect(raw).not.toContain(secret);
    }
  });

  it("紙の上に置く道（goHref の from）は、どれも unknown にならない", async () => {
    const froms = ["/", "/kits", "/projects/30days", "/projects/booking", "/projects/mcp-server", "/guides/booking-page", "/guides/monthly-sales-report"];
    for (const from of froms) {
      const href = goHref("booking", "note", from);
      await call("booking", "note", href.slice(href.indexOf("?")));
    }
    const lines = log.mock.calls.map((c) => JSON.parse(String(c[0])));
    expect(lines.map((l) => l.from)).toEqual(froms);
  });

  it("resolveGo は https の URL だけを返す", () => {
    expect(resolveGo("s1", "booth")).toBe(links.s1.booth);
    expect(resolveGo("s1", "toString")).toBeNull();
  });
});
