import { describe, expect, it } from "vitest";

import { noteEmbedSrc } from "./NoteEmbed";

describe("noteEmbedSrc", () => {
  it("記事の URL を埋め込みの src にする", () => {
    expect(noteEmbedSrc("https://note.com/suminawa/n/n60440b87a271")).toBe(
      "https://note.com/embed/notes/n60440b87a271",
    );
    expect(noteEmbedSrc("https://note.com/suminawa/n/n60440b87a271/")).toBe(
      "https://note.com/embed/notes/n60440b87a271",
    );
  });
  it("記事でない URL は埋め込まない", () => {
    expect(noteEmbedSrc("https://note.com/suminawa")).toBeNull();
    expect(noteEmbedSrc("https://suminawa.booth.pm/items/8831411")).toBeNull();
  });
});
