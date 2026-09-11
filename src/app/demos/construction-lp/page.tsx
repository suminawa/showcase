/*
 * 見本: 建設・工事の LP。架空の設備工事会社「灯月設備」の 1 ページ。
 * 見せどころは電話導線の強さ、スマホでの読みやすさ、価格の透明さ。
 * 写真を使わず、色・形・CSS・SVG・canvas だけで作る。
 * 電話番号も住所も市区町村名も書かない。フォームはどこにも送らない。
 */
import type { Metadata } from "next";

import { DemoFooter } from "@/components/demos/DemoFooter";
import { DemoForm, type DemoField } from "@/components/demos/DemoForm";
import { AreaTags } from "@/components/demos/construction/AreaTags";
import { CallButton } from "@/components/demos/construction/CallButton";
import { PriceTable } from "@/components/demos/construction/PriceTable";
import { ServiceIcon } from "@/components/demos/construction/ServiceIcon";
import { formatFrom, SERVICES } from "@/components/demos/construction/services";
import { HeroField } from "@/components/demos/saas/HeroField";

import s from "./construction.module.css";

const BRAND = "灯月設備";

const TITLE = "見本 ｜ 建設・工事の LP";
const DESCRIPTION =
  "架空の設備工事会社「灯月設備」の 1 ページ LP。電話導線と料金の目安まで動く見本。";

/** ヒーローの粒。飾り専用の明るいオレンジ（--d-accent と同じ値） */
const ACCENT_RGB = "240, 122, 18";
const ACCENT_COUNT = 70;

export const metadata: Metadata = {
  // レイアウトの title.template（"%s | Showcase"）がタブに付け足されるのを防ぐ
  title: { absolute: TITLE },
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/demos/construction-lp",
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

const STEPS = [
  {
    title: "電話でうかがう",
    body: "症状と場所、建物の種類をお聞きします。その場で概算をお伝えできることもあります。",
  },
  {
    title: "訪問して見る",
    body: "約束の時間にうかがい、原因を探します。床下や壁の中まで見ます。",
  },
  {
    title: "見積もりを出す",
    body: "紙で金額を出します。ここで断っても費用はかかりません。",
  },
  {
    title: "作業する",
    body: "その場でできる作業は当日に終わらせます。部材の取り寄せが要るときは日を改めます。",
  },
];

const VOICES = [
  {
    who: "S 様（戸建て）",
    body: "夜に水が止まらなくなって電話しました。一時間ほどで来てくれて、その場で直りました。",
  },
  {
    who: "K 様（集合住宅の管理）",
    body: "見積もりの紙を先に出してくれるので、住んでいる方に説明しやすいです。相見積もりも取りました。そのうえでお願いしています。",
  },
  {
    who: "T 様（飲食店）",
    body: "換気扇とコンセントをまとめて頼みました。開店の前に終わらせてもらえました。",
  },
];

const FAQ = [
  {
    q: "見積もりは無料ですか。",
    a: "無料です。作業の前に金額を出し、断っても費用はかかりません。見積もりだけなら出張費もいただきません。",
  },
  {
    q: "当日でも来てもらえますか。",
    a: "午前中のご連絡なら、その日のうちにうかがえることが多いです。混んでいる日は翌日になります。",
  },
  {
    q: "夜間や休日も対応していますか。",
    a: "20 時まで受け付けています。18 時以降と土日祝は、基本料金と出張費が 5 割増になります。",
  },
  {
    q: "支払いはどうしますか。",
    a: "作業が終わったあとに、現金かクレジットカードでお支払いいただけます。法人は請求書にも対応します。",
  },
  {
    q: "賃貸でも頼めますか。",
    a: "頼めます。ただし設備の交換は、先に大家さんか管理会社へ確認をお願いしています。",
  },
];

const CONTACT_FIELDS: DemoField[] = [
  { name: "name", label: "お名前", required: true },
  {
    name: "tel",
    label: "電話番号",
    type: "tel",
    required: true,
    placeholder: "ハイフンありでご記入ください",
  },
  {
    name: "city",
    label: "お住まいの市区町村",
    required: true,
    placeholder: "例: ◯◯市◯◯町",
  },
  {
    name: "trouble",
    label: "困っていること",
    type: "textarea",
    required: true,
    placeholder: "例: 台所の蛇口から水がしたたり続けています",
  },
  {
    name: "when",
    label: "希望の日時",
    placeholder: "例: 明日の午前中 / 今日の 18 時以降",
  },
];

export default function ConstructionLpPage() {
  return (
    <div className={s.page}>
      <header className={s.header}>
        <div className={`${s.container} ${s.headerRow}`}>
          <a href="#top" className={s.logo}>
            {BRAND}
          </a>
          <nav className={s.nav} aria-label="ページ内">
            <a href="#menu">対応メニュー</a>
            <a href="#price">料金</a>
            <a href="#flow">流れ</a>
            <a href="#faq">よくある質問</a>
          </nav>
          <span className={s.headerCall}>
            <CallButton label="電話する" variant="header" />
          </span>
        </div>
      </header>

      <main id="top" className={s.main}>
        <section className={s.hero}>
          <div className={s.stripes} aria-hidden="true" />
          <HeroField
            className={s.field}
            rgb={ACCENT_RGB}
            count={ACCENT_COUNT}
          />
          <div className={s.container}>
            <p className={s.eyebrow}>水道・電気・空調の修理と小工事</p>
            <h1 className={s.h1}>
              水まわりと電気のこまりごと、当日うかがいます
            </h1>
            <p className={s.lead}>
              蛇口のにじみ、動かないコンセント、効かないエアコン。放っておくと、直すのにかかるお金は増えていきます。まず見てから決めてください。見積もりは無料です。
            </p>
            <div className={s.heroMeta}>
              <p>受付 8:00 - 20:00（年中無休）</p>
              <p>対応エリア：営業所から車で 30 分まで</p>
            </div>
            <div className={s.ctas}>
              <CallButton label="いますぐ電話する" sub="受付 8:00 - 20:00" />
              <a href="#contact" className={s.secondary}>
                フォームで相談する
              </a>
            </div>
            <p className={s.fine}>
              見積もりのあとで断っても、費用はかかりません。夜間と休日も受け付けています。
            </p>
          </div>
        </section>

        <section id="menu" className={s.section}>
          <div className={s.container}>
            <h2 className={s.h2}>こんな作業をしています</h2>
            <ul className={s.menu}>
              {SERVICES.map((item) => (
                <li key={item.id} className={s.menuItem}>
                  <ServiceIcon id={item.id} />
                  <h3 className={s.menuName}>{item.name}</h3>
                  <p className={s.menuPrice}>{formatFrom(item.from)}</p>
                  <p className={s.menuNote}>{item.note}</p>
                </li>
              ))}
            </ul>
            <p className={s.menuFoot}>
              金額はすべて税込みです。現場を見てから正式な見積もりを出します。
            </p>
          </div>
        </section>

        <section id="price" className={`${s.section} ${s.soft}`}>
          <div className={s.container}>
            <h2 className={s.h2}>料金の目安</h2>
            <p className={s.sectionLead}>
              作業の代金は、この目安に部品代と作業時間を足したものです。時間帯で切り替えて確かめてください。
            </p>
            <PriceTable />
          </div>
        </section>

        <section id="area" className={s.section}>
          <div className={s.container}>
            <h2 className={s.h2}>対応エリア</h2>
            <p className={s.sectionLead}>営業所から車で 30 分の範囲</p>
            <AreaTags />
            <p className={s.menuFoot}>
              エリアの外でも、出張費を足せばうかがえます。電話でご相談ください。
            </p>
          </div>
        </section>

        <section id="flow" className={`${s.section} ${s.soft}`}>
          <div className={s.container}>
            <h2 className={s.h2}>作業の流れ</h2>
            <ol className={s.steps}>
              {STEPS.map((step) => (
                <li key={step.title} className={s.step}>
                  <h3 className={s.stepTitle}>{step.title}</h3>
                  <p className={s.stepBody}>{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="voice" className={s.section}>
          <div className={s.container}>
            <h2 className={s.h2}>お客様の声</h2>
            <ul className={s.voices}>
              {VOICES.map((voice) => (
                <li key={voice.who}>
                  <figure className={s.voice}>
                    <blockquote className={s.voiceBody}>{voice.body}</blockquote>
                    <figcaption className={s.voiceWho}>{voice.who}</figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="faq" className={`${s.section} ${s.soft}`}>
          <div className={s.container}>
            <h2 className={s.h2}>よくある質問</h2>
            <div className={s.faq}>
              {FAQ.map((item) => (
                <details key={item.q}>
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className={s.section}>
          <div className={`${s.container} ${s.contact}`}>
            <div>
              <h2 className={s.h2}>電話がつながらないときは、こちらから</h2>
              <p className={s.contactLead}>
                症状と場所を書いていただければ、折り返しご連絡します。夜間にいただいた分は、翌朝の 8 時から順に返します。
              </p>
            </div>
            <DemoForm fields={CONTACT_FIELDS} submitLabel="この内容で相談する" />
          </div>
        </section>
      </main>

      <div className={s.container}>
        <DemoFooter brand={BRAND} kind="設備工事会社" />
      </div>
    </div>
  );
}
