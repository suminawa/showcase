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
      <SheetSection name="頼めること">
        <ul className={s.menu}>
          {SERVICES.map((item) => (
            <li key={item.title} className={s.menuItem}>
              <span className={s.menuName}>{item.title}</span>
              <span className={s.menuPrice}>{item.price}</span>
            </li>
          ))}
        </ul>
      </SheetSection>

      <SheetSection name="進め方">
        <ol className={s.steps}>
          {STEPS.map((step) => (
            <li key={step.title}>
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
      </footer>
    </Sheet>
  );
}
