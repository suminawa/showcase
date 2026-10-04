/* 日本語だけの紙。英仏の人にだけ、頭に断り書きを一行出す（src/components/lang/JapaneseOnlyNote.tsx） */
import { JapaneseOnlyNote } from "@/components/lang/JapaneseOnlyNote";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JapaneseOnlyNote kind="guides" />
      {children}
    </>
  );
}
