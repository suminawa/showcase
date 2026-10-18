/* 日本語だけの紙。英仏の人にだけ、頭に断り書きを一行出す（src/components/lang/JapaneseOnlyNote.tsx） */
import { JapaneseOnlyNote } from "@/components/lang/JapaneseOnlyNote";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    // 本文の印（id="main"）は各記事の GuideArticle と一覧の CatalogPage が持つ
    <div data-sheet="guide">
      <JapaneseOnlyNote kind="guides" />
      {children}
    </div>
  );
}
