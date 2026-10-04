import { createHash as nodeCreateHash } from "node:crypto";
import { describe, expect, it } from "vitest";

import { createHash, randomBytes } from "../kit/src/core/crypto-shim";
import { createInviteToken, hashInviteToken } from "../kit/src/core/invitations";

/** 突き合わせる入力。空・短い ASCII・日本語（複数バイト）の 3 つ */
const SAMPLES = ["", "abc", "しおさい設計室 みなと 太郎"];

describe("crypto-shim の SHA-256", () => {
  it("既知の 3 つの入力で、Node の createHash と同じ 16 進の値になる", () => {
    for (const sample of SAMPLES) {
      const mine = createHash("sha256").update(sample, "utf8").digest("hex");
      const node = nodeCreateHash("sha256").update(sample, "utf8").digest("hex");
      expect(mine).toBe(node);
    }
  });

  it("16 進 64 字で、小文字だけが並ぶ", () => {
    for (const sample of SAMPLES) {
      expect(createHash("sha256").update(sample, "utf8").digest("hex")).toMatch(
        /^[0-9a-f]{64}$/,
      );
    }
  });

  it("足し合わせて渡しても、ひとつづきの文字列と同じ値になる", () => {
    const split = createHash("sha256").update("しおさい", "utf8").update("設計室", "utf8");
    const whole = createHash("sha256").update("しおさい設計室", "utf8");
    expect(split.digest("hex")).toBe(whole.digest("hex"));
  });

  it("64 の倍数の境目（55・56・63・64・65 バイト）でも Node と一致する", () => {
    for (const size of [55, 56, 63, 64, 65]) {
      const sample = "a".repeat(size);
      expect(createHash("sha256").update(sample, "utf8").digest("hex")).toBe(
        nodeCreateHash("sha256").update(sample, "utf8").digest("hex"),
      );
    }
  });

  it("sha256 以外はお受けしない", () => {
    expect(() => createHash("md5")).toThrow();
  });
});

describe("crypto-shim の randomBytes", () => {
  it("32 バイトが base64url の 43 字になり、詰め物は付かない", () => {
    const text = randomBytes(32).toString("base64url");
    expect(text).toHaveLength(43);
    expect(text).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("呼ぶたびに違う値になる", () => {
    const seen = new Set(
      Array.from({ length: 20 }, () => randomBytes(32).toString("base64url")),
    );
    expect(seen.size).toBe(20);
  });
});

describe("ご招待の合い札", () => {
  it("合い札のハッシュが、Node で数えた値と同じになる", () => {
    const { token, tokenHash } = createInviteToken();
    expect(tokenHash).toBe(nodeCreateHash("sha256").update(token, "utf8").digest("hex"));
    expect(hashInviteToken(token)).toBe(tokenHash);
  });
});
