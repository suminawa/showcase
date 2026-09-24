/*
 * 悩みから読む紙の一覧。1 行 = 悩みの言葉 1 つ。飛び先はそれぞれの着地の紙。
 * FORM: 料紙（分類のページ）— 文法は DESIGN.md
 */
import type { Metadata } from "next";
import Link from "next/link";

import { Sheet, SheetClose, SheetSection } from "@/components/ryoushi";
import { guideHref, guides } from "@/lib/guides";

import g from "./guides.module.css";

const TITLE = "悩みから読む";
const LEDE = "受注サイトで繰り返し出ている悩みを 1 つずつ取り上げ、手で解く手順と見本をまとめています。";

export const metadata: Metadata = {
  title: TITLE,
  description: LEDE,
  openGraph: { title: TITLE, description: LEDE, url: "/guides" },
};

export default function GuidesPage() {
  return (
    <Sheet title={TITLE} latin="Guides" lede={LEDE}>
      <SheetSection>
        <ul className={g.rows}>
          {guides.map((guide) => (
            <li key={guide.slug}>
              <Link href={guideHref(guide)} className={g.rowTitle}>
                {guide.title}
              </Link>
              <p className={g.rowLede}>{guide.lede}</p>
            </li>
          ))}
        </ul>
      </SheetSection>
      <SheetClose />
    </Sheet>
  );
}
