/* 日本語の紙の根（<html lang="ja">）。英仏の紙の根は app/[lang]/layout.tsx */
import { RootDocument, rootMetadata } from "@/components/RootDocument";

export const metadata = rootMetadata;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <RootDocument lang="ja">{children}</RootDocument>;
}
