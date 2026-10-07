/*
 * 悩みから読む紙の一覧。1 行 = 悩みの言葉 1 つ。飛び先はそれぞれの着地の紙。
 * 行の文法はトップの 4 点・分類のページと同じ（題と一行、触れるとその一行の紙が濡れる）。
 * ＊ 2026-10-07 に guides.module.css の独自の行をやめた ── 題と要約が同じ字で並び、壁になっていた。
 * FORM: 料紙（分類のページ）— 文法は DESIGN.md
 */
import type { Metadata } from "next";
import Link from "next/link";

import s from "@/app/(ja)/ryoushi.module.css";
import { Sheet, SheetClose, SheetSection } from "@/components/ryoushi";
import { guideHref, guides } from "@/lib/guides";

import { GUIDES_TITLE } from "./parts";

const TITLE = GUIDES_TITLE;
const LEDE = "事務や受付で繰り返し起きる困りごとを 1 つずつ取り上げ、手で解く手順と見本をまとめています。";

export const metadata: Metadata = {
  title: TITLE,
  description: LEDE,
  alternates: { canonical: "/guides" },
  openGraph: { title: TITLE, description: LEDE, url: "/guides" },
};

export default function GuidesPage() {
  // 新しいものを上に
  const list = [...guides].reverse();
  return (
    <Sheet title={TITLE} latin="Guides" lede={LEDE}>
      <SheetSection>
        <ol className={s.picks} aria-label={TITLE}>
          {list.map((guide) => (
            <li key={guide.slug} className={s.row}>
              <span className={s.flow} aria-hidden="true" />
              <span className={s.flowDeep} aria-hidden="true" />
              <Link href={guideHref(guide)} className={s.entry}>
                <span className={s.text}>
                  <span className={s.title}>{guide.title}</span>
                  <span className={s.desc}>{guide.lede}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </SheetSection>
      <SheetClose />
    </Sheet>
  );
}
