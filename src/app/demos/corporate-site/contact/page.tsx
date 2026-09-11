/*
 * 見本: 会社案内サイトの下層（お問い合わせ）。
 * フォームは見た目だけ ── action を持たず、押すと「見本のため送信されません」と出す。
 */
import type { Metadata } from "next";

import { DemoForm, type DemoField } from "@/components/demos/DemoForm";
import { NAV_BASE } from "@/components/demos/corporate/nav";

import c from "../corporate.module.css";
import s from "../sub.module.css";

const TITLE = "見本 ｜ 会社案内サイト（お問い合わせ）";
const DESCRIPTION =
  "架空の計測会社「潮見計測」のお問い合わせ。送信されない見本のフォームです。";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${NAV_BASE}/contact`,
    type: "website",
    images: ["/opengraph-image.png"],
    siteName: "Showcase",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/opengraph-image.png"],
  },
};

const HOURS = [
  {
    term: "受付時間",
    body: "平日 9:00 - 17:30（土日祝と年末年始は休みます）",
  },
  {
    term: "お返事",
    body: "2 営業日のうちにご返信します。急ぎのご用件は、その旨をお書きください。",
  },
];

const CONTACT_FIELDS: DemoField[] = [
  {
    name: "company",
    label: "会社名・団体名",
    required: true,
    placeholder: "例: ◯◯県◯◯課",
  },
  { name: "name", label: "ご担当者のお名前", required: true },
  {
    name: "email",
    label: "メールアドレス",
    type: "email",
    required: true,
    placeholder: "you@example.com",
  },
  {
    name: "message",
    label: "ご相談の内容",
    type: "textarea",
    required: true,
    placeholder: "測りたい場所、期間、知りたいことなど",
  },
];

export default function CorporateContactPage() {
  return (
    <>
      <section className={c.pageHead}>
        <div className={c.container}>
          <h1 className={c.h1}>お問い合わせ</h1>
          <p className={c.lead}>調査のご相談を承ります。</p>
        </div>
      </section>

      <section className={c.section}>
        <div className={`${c.container} ${s.contact}`}>
          <div>
            <h2 className={c.h2}>ご記入のお願い</h2>
            <p className={s.contactIntro}>
              測る範囲や期間が決まっていなくてもかまいません。現場の条件と、知りたいことをお書きください。
            </p>
            <dl className={s.hours}>
              {HOURS.map((row) => (
                <div key={row.term} className={s.hoursRow}>
                  <dt>{row.term}</dt>
                  <dd>{row.body}</dd>
                </div>
              ))}
            </dl>
          </div>
          <DemoForm fields={CONTACT_FIELDS} submitLabel="この内容で送る" />
        </div>
      </section>
    </>
  );
}
