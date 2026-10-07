/* 日本語だけの紙。英仏の人にだけ、頭に断り書きを一行出す（src/components/lang/JapaneseOnlyNote.tsx） */
import { JapaneseOnlyNote } from "@/components/lang/JapaneseOnlyNote";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    // data-sheet="guide": 案内記事の紙には写しの墨を置かない（題が長く紙幅いっぱいなので、墨が字に被る。2026-10-07）
    <div data-sheet="guide">
      <JapaneseOnlyNote kind="guides" />
      {children}
    </div>
  );
}
