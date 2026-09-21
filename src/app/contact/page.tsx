/*
 * 制作のご相談。トップの結びから来る紙で、頼めることと料金の目安、進め方、宛先だけ。
 *
 * 数字の出どころは公開済みの受託メニュー（concierge/content/services.md）ひとつで、
 * そこに書いていない額は足さない。肩書き・経歴・実績の数は書かない ──
 * ここに置くのは品書きだけで、語るのは分類のページに並ぶ実物のほうである。
 * フォームは置かない（メールアドレスを集めない）。
 * FORM: 料紙（分類のページ）— 文法は DESIGN.md
 */
import type { Metadata } from "next";
import Link from "next/link";

import { Sheet, SheetSection } from "@/components/ryoushi";
import { CONTACT_PAGE, SERVICES, SERVICES_NOTE, STEPS } from "@/lib/projects";

import s from "../ryoushi.module.css";

export const metadata: Metadata = {
  title: CONTACT_PAGE.title,
  description: CONTACT_PAGE.lede,
  openGraph: {
    title: CONTACT_PAGE.title,
    description: CONTACT_PAGE.lede,
    url: "/contact",
    images: ["/og/contact.png"],
  },
  twitter: { card: "summary_large_image", images: ["/og/contact.png"] },
};

export default function ContactPage() {
  return (
    <Sheet
      title={CONTACT_PAGE.title}
      latin={CONTACT_PAGE.latin}
      lede={CONTACT_PAGE.lede}
    >
      {/* 品書き。題と目安が同じ罫に並ぶ ── 献立表と同じ組み方で、
          行そのものは何処へも飛ばない（触れても濡れない） */}
      {/*
        頼めることと進め方を【一つの段】に組む。
        段を二つに割ると、あいだに罫 6 本（版面の張り出しの和）が要る ──
        中身が 4 行と 3 行しかない紙では、その空白のほうが字より長くなり、
        書きかけの紙に見えた。一つの段なら小見出しを罫 2 本で継げる。
      */}
      <SheetSection name="頼めること">
        <ul className={s.menu}>
          {SERVICES.map((item) => (
            <li key={item.title} className={s.menuItem}>
              <span className={s.menuName}>{item.title}</span>
              <span className={s.menuPrice}>{item.price}</span>
            </li>
          ))}
        </ul>

        <h2 className={`${s.shelfName} ${s.subHead}`}>進め方</h2>
        <ol className={s.steps}>
          {STEPS.map((step) => (
            <li key={step.title} className={s.step}>
              <span className={s.stepName}>{step.title}</span>
              <span className={s.stepDetail}>{step.detail}</span>
            </li>
          ))}
        </ol>
      </SheetSection>

      <footer className={s.close}>
        <p className={s.menuNote}>
          {SERVICES_NOTE.before}
          <a className={s.mailLink} href={`mailto:${SERVICES_NOTE.mail}`}>
            {SERVICES_NOTE.mail}
          </a>
          {SERVICES_NOTE.after}
        </p>
        {/* 入口へ帰る一行。頭の戻りと同じ行き先だが、下まで読んだ人が
            巻き戻さずに済むように置く。落款は頭に一つだけで、ここには捺さない */}
        <p className={s.closeLinks}>
          <Link href="/" className={s.contact}>
            Showcase へ戻る
          </Link>
        </p>
      </footer>
    </Sheet>
  );
}
