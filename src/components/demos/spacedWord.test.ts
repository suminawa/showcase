import { describe, expect, it } from "vitest";
import { spacedWord, trailingSpacedWord } from "./spacedWord";

describe("spacedWord", () => {
  it("英数字だけの語は前後に半角スペースを置く", () => {
    expect(spacedWord("LP")).toBe(" LP ");
  });

  it("空白を含む英字の語も前後に半角スペースを置く", () => {
    expect(spacedWord("Tabane Works")).toBe(" Tabane Works ");
  });

  it("仮名や漢字で始まる語はスペースを足さずそのまま返す", () => {
    expect(spacedWord("粉とゆげ")).toBe("粉とゆげ");
    expect(spacedWord("ページ")).toBe("ページ");
  });

  it("trailingSpacedWord は英数字の語に後ろだけ半角スペースを置く（句点の直後用）", () => {
    expect(trailingSpacedWord("Tabane Works")).toBe("Tabane Works ");
    expect(trailingSpacedWord("粉とゆげ")).toBe("粉とゆげ");
  });
});
